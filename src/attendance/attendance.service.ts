import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Volunteer } from '../users/entities/volunteer.entity';
import { CreateCheckInDto } from './dto/create-check-in.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Volunteer)
    private volunteerRepository: Repository<Volunteer>,
  ) {}

  async getAttendanceOverview(eventId: string) {
    const totalVolunteers = await this.volunteerRepository.count();
    
    // In a real app we would count specific to eventId and maybe those invited to the event
    const attendances = await this.attendanceRepository.find({
      where: { eventId }
    });

    const checkedIn = attendances.filter(a => a.status === 'present').length;
    const lateArrivals = attendances.filter(a => a.status === 'late').length;
    
    // Assuming anyone not 'present' or 'late' is absent (or just total - (checkedIn + late))
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
    // Get all volunteers and their attendance for this event
    const volunteers = await this.volunteerRepository.find();
    
    const rosters = await Promise.all(volunteers.map(async (v) => {
      const attendance = await this.attendanceRepository.findOne({
        where: { volunteer: { id: v.id }, eventId }
      });

      return {
        id: v.id,
        name: v.name,
        role: v.role,
        status: attendance ? attendance.status : 'absent',
        checkedInTime: attendance?.checkInTime 
          ? new Date(attendance.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) 
          : null
      };
    }));

    return rosters;
  }

  async getRecentCheckIns(eventId: string) {
    const recent = await this.attendanceRepository.find({
      where: { eventId, status: 'present' }, // 'present' or 'late'
      order: { checkInTime: 'DESC' },
      take: 10,
      relations: ['volunteer']
    });

    return recent.map(a => ({
      id: a.id,
      name: a.volunteer?.name || 'Unknown',
      time: a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '',
      status: a.status
    }));
  }

  async checkIn(createCheckInDto: CreateCheckInDto & { eventId: string }) {
    // Assuming createCheckInDto has volunteerId or pin
    // In standard scenario, volunteer might just scan a code which gives eventId and volunteerId
    const { eventId } = createCheckInDto;
    
    // fallback id
    const volunteerId = (createCheckInDto as any).volunteerId;
    
    if (!volunteerId) {
       throw new NotFoundException('volunteerId is required for check in');
    }

    const volunteer = await this.volunteerRepository.findOne({ where: { id: volunteerId }});
    if (!volunteer) throw new NotFoundException('Volunteer not found');

    let attendance = await this.attendanceRepository.findOne({
      where: { volunteer: { id: volunteerId }, eventId }
    });

    if (!attendance) {
      attendance = this.attendanceRepository.create({
        volunteer,
        eventId,
        status: 'present',
        checkInTime: new Date()
      });
    } else {
      attendance.status = 'present'; // or 'late' depending on logic
      attendance.checkInTime = new Date();
    }

    await this.attendanceRepository.save(attendance);

    return {
      success: true,
      message: 'Check-in successful',
      timestamp: attendance.checkInTime?.toISOString() || new Date().toISOString()
    };
  }

  async checkInByPin(pin: string, eventId: string) {
    const volunteer = await this.volunteerRepository.findOne({ where: { pin } });
    
    if (!volunteer) {
      throw new NotFoundException('Invalid PIN. Volunteer not found.');
    }

    let attendance = await this.attendanceRepository.findOne({
      where: { volunteer: { id: volunteer.id }, eventId }
    });

    if (!attendance) {
      attendance = this.attendanceRepository.create({
        volunteer,
        eventId,
        status: 'present',
        checkInTime: new Date(),
        checkInMethod: 'pin'
      });
    } else {
      attendance.status = 'present';
      attendance.checkInTime = new Date();
      attendance.checkInMethod = 'pin';
    }

    await this.attendanceRepository.save(attendance);

    return {
      success: true,
      message: `Welcome, ${volunteer.name}!`,
      volunteerName: volunteer.name,
      timestamp: attendance.checkInTime?.toISOString() || new Date().toISOString()
    };
  }

  async getVolunteerCount() {
    return this.volunteerRepository.count();
  }
}
