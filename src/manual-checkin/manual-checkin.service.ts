import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Volunteer } from '../users/entities/volunteer.entity';

@Injectable()
export class ManualCheckinService {
  constructor(
    @InjectRepository(Volunteer)
    private volunteerRepository: Repository<Volunteer>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async getVolunteers(eventId: string, search?: string, status?: string) {
    const query = this.volunteerRepository.createQueryBuilder('volunteer')
      .leftJoinAndSelect('volunteer.attendances', 'attendance', 'attendance.eventId = :eventId', { eventId });

    if (search && search.trim()) {
      query.andWhere(
        '(LOWER(volunteer.name) LIKE LOWER(:search) OR LOWER(volunteer.role) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    const volunteers = await query.getMany();

    const formattedVolunteers = volunteers.map(v => {
      const attendance = v.attendances?.[0];
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
        qrCode: v.qrCode,
        checkedIn: isCheckedIn,
        time: formattedTime,
      };
    });

    let filtered = formattedVolunteers;
    if (status === 'checked-in') {
      filtered = formattedVolunteers.filter(v => v.checkedIn);
    } else if (status === 'absent') {
      filtered = formattedVolunteers.filter(v => !v.checkedIn);
    }

    return {
      volunteers: filtered,
      total: formattedVolunteers.length,
      checkedIn: formattedVolunteers.filter(v => v.checkedIn).length,
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
      qrCode: `QR_MANUAL_${Date.now()}` // Generate temporary unique QR code
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
        department: volunteer.department,
        checkedIn: isCheckedIn,
        time: attendance.checkInTime ? attendance.checkInTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', minute: '2-digit', hour12: true 
        }) : null
      } 
    };
  }
}
