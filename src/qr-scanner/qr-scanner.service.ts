import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Volunteer } from '../users/entities/volunteer.entity';

@Injectable()
export class QrScannerService {
  constructor(
    @InjectRepository(Volunteer)
    private volunteerRepository: Repository<Volunteer>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async processScan(qrCode: string, eventId: string) {
    // 1. Find volunteer by QR code
    const volunteer = await this.volunteerRepository.findOne({ where: { qrCode } });
    
    // Fallback logic to get total scanned for the event to keep API consistent
    const scannedCount = await this.attendanceRepository.count({
      where: { eventId, status: 'present' }
    });

    if (!volunteer) {
      return {
        success: false,
        message: 'Volunteer QR code not found',
        scannedCount
      };
    }

    // 2. Check if already checked in
    let attendance = await this.attendanceRepository.findOne({
      where: { volunteer: { id: volunteer.id }, eventId }
    });

    if (attendance && attendance.status === 'present') {
      return {
        success: false,
        message: 'Volunteer already checked in',
        volunteer: { name: volunteer.name },
        scannedCount
      };
    }

    // 3. Check them in
    if (!attendance) {
      attendance = this.attendanceRepository.create({
        volunteer,
        eventId,
      });
    }
    
    attendance.status = 'present';
    attendance.checkInTime = new Date();

    await this.attendanceRepository.save(attendance);

    return {
      success: true,
      message: `${volunteer.name} checked in successfully`,
      volunteer: { name: volunteer.name },
      scannedCount: scannedCount + 1
    };
  }

  async getSessionStats(eventId: string) {
    const scannedCount = await this.attendanceRepository.count({
      where: { eventId, status: 'present' }
    });
    
    // In a real scenario, success rate would be calculated based on failed vs successful scans
    return {
      scanned: scannedCount,
      successRate: 98 // Hardcoding percentage to match previous behavior for now
    };
  }

  async getRecentScans(eventId: string) {
    const recent = await this.attendanceRepository.find({
      where: { eventId, status: 'present' },
      order: { checkInTime: 'DESC' },
      take: 10,
      relations: ['volunteer']
    });

    return recent.map(a => ({
      id: a.id,
      volunteerId: a.volunteer?.id || 'Unknown',
      name: a.volunteer?.name || 'Unknown',
      time: a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '',
      status: 'success'
    }));
  }
}
