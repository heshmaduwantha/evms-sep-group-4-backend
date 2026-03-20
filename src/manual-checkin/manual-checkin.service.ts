import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Volunteer } from '../users/entities/volunteer.entity';
import { Application } from '../applications/entities/application.entity';
import { ApplicationStatus } from '../applications/enums/application-status.enum';

@Injectable()
export class ManualCheckinService {
  constructor(
    @InjectRepository(Volunteer)
    private volunteerRepository: Repository<Volunteer>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  async getVolunteers(eventId: string, search?: string, status?: string) {
    const volunteers = await this.volunteerRepository.find({
      relations: ['attendances']
    });

    const approvedApplications = await this.applicationRepository.find({
      relations: ['user', 'event']
    });

    // 1. Initial mapping of manual volunteers
    let formattedVolunteers = volunteers.map(v => {
      // Find attendance for this specific event
      const attendance = (eventId === 'all' || !eventId) 
        ? v.attendances?.[0] 
        : v.attendances?.find(a => a.eventId === eventId);
      
      const isCheckedIn = attendance?.status === 'present' || attendance?.status === 'late';
      
      let formattedTime: string | null = null;
      if (attendance?.checkInTime) {
        formattedTime = new Date(attendance.checkInTime).toLocaleTimeString('en-US', { 
          hour: '2-digit', minute: '2-digit', hour12: true 
        });
      }

      return {
        id: v.id,
        name: v.name,
        role: v.role,
        department: v.department,
        checkedIn: isCheckedIn,
        time: formattedTime,
        eventId: attendance?.eventId || (eventId === 'all' ? undefined : eventId),
        checkInMethod: attendance?.checkInMethod || 'manual'
      };
    });

    // 2. Consolidate duplicates if "All Events" is selected
    if (eventId === 'all' || !eventId) {
      const consolidated: any[] = [];
      const seenNames = new Set<string>();

      formattedVolunteers.forEach(v => {
        const lowerName = v.name.toLowerCase();
        if (!seenNames.has(lowerName)) {
          seenNames.add(lowerName);
          consolidated.push(v);
        } else if (v.checkedIn) {
          // If we see the same person again and they are checked in, update the existing entry to show checked in
          const existing = consolidated.find(ext => ext.name.toLowerCase() === lowerName);
          if (existing && !existing.checkedIn) {
            existing.checkedIn = true;
            existing.time = v.time;
            existing.eventId = v.eventId;
          }
        }
      });
      formattedVolunteers = consolidated;
    }

    // 3. Add portal entries (approved applications)
    const portalEntries: any[] = [];
    const approvedApps = eventId === 'all' || !eventId 
      ? approvedApplications.filter(app => app.status === ApplicationStatus.APPROVED)
      : approvedApplications.filter(app => app.status === ApplicationStatus.APPROVED && app.event.id === eventId);

    approvedApps.forEach(app => {
      const portalName = app.user.email.split('@')[0];
      const lowerPortalName = portalName.toLowerCase();
      
      // Check if already in manual volunteers (case-insensitive)
      const existsInManual = formattedVolunteers.some(v => v.name.toLowerCase() === lowerPortalName);
      const existsInPortal = portalEntries.some(v => v.name.toLowerCase() === lowerPortalName);

      if (!existsInManual && !existsInPortal) {
        portalEntries.push({
          id: app.id,
          name: portalName,
          role: 'Volunteer',
          department: 'Portal',
          checkedIn: true,
          time: new Date(app.updatedAt).toLocaleTimeString('en-US', { 
            hour: '2-digit', minute: '2-digit', hour12: true 
          }),
          eventId: app.event.id,
          checkInMethod: 'online'
        });
      }
    });

    // Combine manual and portal
    const allVolunteers = [...formattedVolunteers, ...portalEntries];

    // 4. Filtering (Search and Status)
    let filtered = allVolunteers;
    
    if (search && search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(s) || 
        v.role.toLowerCase().includes(s) ||
        v.department.toLowerCase().includes(s)
      );
    }

    if (status === 'checked-in' || status === 'present') {
      filtered = filtered.filter(v => v.checkedIn);
    } else if (status === 'absent') {
      filtered = filtered.filter(v => !v.checkedIn);
    }

    return {
      volunteers: filtered,
      total: allVolunteers.length,
      checkedIn: allVolunteers.filter(v => v.checkedIn).length,
    };
  }

  async getCheckinSummary(eventId: string) {
    const total = await this.volunteerRepository.count();
    
    // Count attendances for this event that are present or late
    const checkedInCount = await this.attendanceRepository.createQueryBuilder('attendance')
      .where('attendance.eventId = :eventId', { eventId })
      .andWhere('attendance.status IN (:...statuses)', { statuses: ['present', 'late'] })
      .getCount();

    return {
      total,
      checkedIn: checkedInCount,
      absent: total - checkedInCount,
      percentage: total > 0 ? Math.round((checkedInCount / total) * 100) : 0,
    };
  }

  async updateCheckin(volunteerId: string, eventId: string, updateCheckinDto: any) {
    const volunteer = await this.volunteerRepository.findOne({ where: { id: volunteerId } });
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }

    let attendance = await this.attendanceRepository.findOne({
      where: { volunteer: { id: volunteerId }, eventId }
    });

    if (!attendance) {
      attendance = this.attendanceRepository.create({
        volunteer,
        eventId,
      });
    }

    if (updateCheckinDto.checkedIn) {
      attendance.status = 'present';
      attendance.checkInTime = new Date();
      attendance.checkInMethod = 'manual';
    } else {
      attendance.status = 'absent';
      attendance.checkInTime = null;
    }

    await this.attendanceRepository.save(attendance);

    return { 
      success: true, 
      volunteer: {
        id: volunteer.id,
        name: volunteer.name,
        checkedIn: updateCheckinDto.checkedIn,
        time: attendance.checkInTime ? attendance.checkInTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', minute: '2-digit', hour12: true 
        }) : null
      }
    };
  }

  async markAbsent(volunteerId: string, eventId: string) {
    return this.updateCheckin(volunteerId, eventId, { checkedIn: false });
  }

  async updateVolunteer(id: string, updateDto: any) {
    const volunteer = await this.volunteerRepository.findOne({ where: { id } });
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }

    Object.assign(volunteer, {
      name: updateDto.name,
      role: updateDto.role,
      department: updateDto.department,
    });

    await this.volunteerRepository.save(volunteer);

    // If checkedIn status is provided, update attendance too
    if (updateDto.hasOwnProperty('checkedIn')) {
      await this.updateCheckin(id, updateDto.eventId, { checkedIn: updateDto.checkedIn });
    }

    return volunteer;
  }

  async deleteVolunteer(id: string) {
    const result = await this.volunteerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Volunteer not found');
    }
    return { success: true };
  }

  async createAttendance(eventId: string, createAttendanceDto: any) {
    // For this mock-like method, we will create a new volunteer AND check them in
    const volunteer = this.volunteerRepository.create({
      name: createAttendanceDto.name,
      role: createAttendanceDto.role,
      department: createAttendanceDto.department,
    });
    
    await this.volunteerRepository.save(volunteer);

    const isCheckedIn = createAttendanceDto.checkedIn || false;
    
    const attendance = this.attendanceRepository.create({
      volunteer,
      eventId,
      status: isCheckedIn ? 'present' : 'absent',
      checkInTime: isCheckedIn ? new Date() : null
    });

    await this.attendanceRepository.save(attendance);

    return { 
      success: true, 
      volunteer: {
        id: volunteer.id,
        name: volunteer.name,
        role: volunteer.role,
        checkedIn: isCheckedIn,
        time: attendance.checkInTime ? attendance.checkInTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', minute: '2-digit', hour12: true 
        }) : null
      } 
    };
  }
}
