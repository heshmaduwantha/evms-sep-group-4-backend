import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Volunteer } from '../users/entities/volunteer.entity';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { Application } from '../applications/entities/application.entity';
import { ApplicationStatus } from '../applications/enums/application-status.enum';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Volunteer)
    private volunteerRepository: Repository<Volunteer>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) { }

  async onModuleInit() {
    const vCount = await this.volunteerRepository.count();
    const aCount = await this.attendanceRepository.count();

    if (vCount === 0) {
      console.log('Seeding initial volunteer and attendance data...');
      const v1 = await this.volunteerRepository.save(this.volunteerRepository.create({
        name: 'Sarah Wilson',
        role: 'Team Lead',
        department: 'Operations'
      }));

      const v2 = await this.volunteerRepository.save(this.volunteerRepository.create({
        name: 'John Doe',
        role: 'Volunteer',
        department: 'Front Desk'
      }));

      await this.attendanceRepository.save([
        this.attendanceRepository.create({
          volunteer: v1,
          eventId: 'event-1',
          status: 'present',
          checkInTime: new Date(),
          checkInMethod: 'manual'
        }),
        this.attendanceRepository.create({
          volunteer: v2,
          eventId: 'event-1',
          status: 'late',
          checkInTime: new Date(),
          checkInMethod: 'manual'
        })
      ]);
    }
  }

  async getAttendanceOverview(eventId: string) {
    const isAll = eventId === 'all' || !eventId || eventId === '';
    
    const totalVolunteersCount = await this.volunteerRepository.count();

    // Fetch manual attendances
    const attendances = await this.attendanceRepository.find({
      where: isAll ? {} : { eventId }
    });

    // Fetch portal attendances (approved apps)
    const portalAttendances = await this.applicationRepository.count({
      where: isAll 
        ? { status: ApplicationStatus.APPROVED } 
        : { event: { id: eventId }, status: ApplicationStatus.APPROVED }
    });

    const manualCheckedIn = attendances.filter(a => a.status === 'present').length;
    const manualLate = attendances.filter(a => a.status === 'late').length;

    const checkedIn = manualCheckedIn + portalAttendances;
    const lateArrivals = manualLate;

    // Total potential volunteers (manual + portal)
    const portalVolunteersCount = await this.applicationRepository.count({
      where: isAll 
        ? { status: ApplicationStatus.APPROVED } 
        : { event: { id: eventId }, status: ApplicationStatus.APPROVED }
    });
    
    const totalVolunteers = totalVolunteersCount + portalVolunteersCount;

    const absent = totalVolunteers - (checkedIn + lateArrivals);
    const attendanceRate = totalVolunteers > 0 ? Math.round(((checkedIn + lateArrivals) / totalVolunteers) * 100) : 0;

    return {
      totalVolunteers,
      checkedIn,
      lateArrivals,
      absent,
      attendanceRate
    };
  }

  async getVolunteerRoster(eventId: string) {
    const isAll = eventId === 'all' || !eventId || eventId === '';
    
    // Get all manual volunteers and their attendance
    const volunteers = await this.volunteerRepository.find({
      relations: ['attendances']
    });

    let manualRoster = volunteers.map((v) => {
      const attendance = isAll 
        ? v.attendances?.[0]
        : v.attendances?.find(a => a.eventId === eventId);

      return {
        id: v.id,
        name: v.name,
        role: v.role,
        status: attendance ? attendance.status : 'absent',
        checkedInTime: attendance?.checkInTime
          ? new Date(attendance.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
          : null,
        eventId: attendance?.eventId || (isAll ? undefined : eventId),
        method: 'manual'
      };
    });

    // Consolidation by name for manual roster if 'all'
    if (isAll) {
      const consolidated: any[] = [];
      const seenNames = new Set<string>();
      manualRoster.sort((a,b) => (a.status !== 'absent' ? -1 : 1)); // Prioritize checked in
      manualRoster.forEach(r => {
        if (!seenNames.has(r.name.toLowerCase())) {
          seenNames.add(r.name.toLowerCase());
          consolidated.push(r);
        }
      });
      manualRoster = consolidated;
    }

    // Get approved portal applications
    const portalApps = await this.applicationRepository.find({
      where: isAll 
        ? { status: ApplicationStatus.APPROVED } 
        : { event: { id: eventId }, status: ApplicationStatus.APPROVED },
      relations: ['user', 'event']
    });

    const portalRoster: any[] = [];
    const seenPortalNames = new Set<string>();

    portalApps.forEach(app => {
      const name = app.user.email.split('@')[0];
      const lowerName = name.toLowerCase();
      
      if (!isAll || !seenPortalNames.has(lowerName)) {
        if (isAll) seenPortalNames.add(lowerName);
        
        // Also avoid duplicating manual entries
        if (!isAll || !manualRoster.some(m => m.name.toLowerCase() === lowerName)) {
          portalRoster.push({
            id: app.id,
            name: name,
            role: 'Volunteer',
            status: 'present',
            checkedInTime: new Date(app.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            eventId: app.event.id,
            method: 'online'
          });
        }
      }
    });

    return [...manualRoster, ...portalRoster];
  }

  async getRecentCheckIns(eventId?: string) {
    const whereClause: any = { status: 'present' };
    if (eventId && eventId !== '' && eventId !== 'all') {
      whereClause.eventId = eventId;
    }

    const recentAttendance = await this.attendanceRepository.find({
      where: whereClause,
      order: { checkInTime: 'DESC' },
      take: 10,
      relations: ['volunteer']
    });

    const recentAppsQuery = this.applicationRepository.createQueryBuilder('application')
      .leftJoinAndSelect('application.user', 'user')
      .where('application.status = :status', { status: ApplicationStatus.APPROVED });

    if (eventId && eventId !== '' && eventId !== 'all') {
      recentAppsQuery.andWhere('application.eventId = :eventId', { eventId });
    }

    const recentApps = await recentAppsQuery
      .orderBy('application.updatedAt', 'DESC')
      .take(10)
      .getMany();

    const allRecent = [
      ...recentAttendance.map(a => ({
        id: a.id,
        name: a.volunteer?.name || 'Unknown',
        time: a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '',
        status: a.status,
        method: a.checkInMethod || 'manual',
        timestamp: a.checkInTime ? new Date(a.checkInTime).getTime() : 0
      })),
      ...recentApps.map(app => ({
        id: app.id,
        name: app.user.email.split('@')[0],
        time: new Date(app.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        status: 'present',
        method: 'online',
        timestamp: new Date(app.updatedAt).getTime()
      }))
    ];

    // Sort combined list by timestamp DESC
    return allRecent
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }

  async checkIn(createCheckInDto: CreateCheckInDto & { eventId: string }) {
    // Logic for creating check-in
    // In standard scenario, volunteer might just scan a code which gives eventId and volunteerId
    const { eventId } = createCheckInDto;

    // fallback id
    const volunteerId = (createCheckInDto as any).volunteerId;

    if (!volunteerId) {
      throw new NotFoundException('volunteerId is required for check in');
    }

    const volunteer = await this.volunteerRepository.findOne({ where: { id: volunteerId } });
    if (!volunteer) throw new NotFoundException('Volunteer not found');

    let attendance = await this.attendanceRepository.findOne({
      where: { volunteer: { id: volunteerId }, eventId }
    });

    if (!attendance) {
      attendance = this.attendanceRepository.create({
        volunteer,
        eventId,
        status: 'present',
        checkInTime: new Date(),
        checkInMethod: 'manual'
      });
    } else {
      attendance.status = 'present'; // or 'late' depending on logic
      attendance.checkInTime = new Date();
      attendance.checkInMethod = 'manual';
    }

    await this.attendanceRepository.save(attendance);

    return {
      success: true,
      message: 'Check-in successful',
      timestamp: attendance.checkInTime?.toISOString() || new Date().toISOString()
    };
  }


  async getVolunteerCount() {
    return this.volunteerRepository.count();
  }

  async updateCheckIn(id: string, updateData: any) {
    const attendance = await this.attendanceRepository.findOne({ where: { id } });
    if (!attendance) throw new NotFoundException('Attendance record not found');

    Object.assign(attendance, updateData);
    return this.attendanceRepository.save(attendance);
  }

  async deleteCheckIn(id: string) {
    const result = await this.attendanceRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Attendance record not found');
    return { success: true };
  }

  async getApplications() {
    // Treat 'absent' status attendances as "applications" for dashboard display
    // in a real system this would be its own entity or status
    const applications = await this.attendanceRepository.find({
      where: { status: 'absent' },
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['volunteer']
    });

    return applications.map(a => ({
      id: a.id,
      name: a.volunteer?.name || 'Unknown',
      role: a.volunteer?.role || 'Volunteer',
      event: a.eventId, // Controller or Frontend will map this to event name
      time: this.getTimeAgo(a.createdAt),
      status: 'pending',
      createdAt: a.createdAt
    }));
  }

  private getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
  }
}
