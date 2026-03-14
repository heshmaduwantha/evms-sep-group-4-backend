import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Volunteer } from '../users/entities/volunteer.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Volunteer)
    private volunteerRepository: Repository<Volunteer>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async getAttendanceReports(filters: any) {
    const { eventId, date, status, department } = filters;
    console.log(`[ReportsService] getAttendanceReports - Filters: eventId=${eventId}, date=${date}, status=${status}, department=${department}`);
    
    const query = this.volunteerRepository.createQueryBuilder('volunteer');

    // Join attendance for specific event and date
    query.leftJoinAndSelect('volunteer.attendances', 'attendance', 
      'attendance.eventId = :eventId AND (:date IS NULL OR :date = \'\' OR DATE(attendance.checkInTime) = DATE(:date))',
      { eventId, date: date || null }
    );

    if (department && department !== 'all') {
      // Map frontend department values if necessary, but for now just use what's passed
      query.andWhere('volunteer.department = :department', { department });
    }

    const volunteers = await query.getMany();
    console.log(`[ReportsService] Found ${volunteers.length} volunteers`);

    let records = volunteers.map(v => {
      const attendance = v.attendances?.[0];
      return {
        id: v.id,
        name: v.name,
        role: v.role,
        dept: v.department,
        status: attendance ? attendance.status : 'absent',
        time: attendance?.checkInTime ? new Date(attendance.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : null,
        method: attendance?.checkInMethod || 'N/A',
      };
    });

    if (status && status !== 'all') {
      records = records.filter(r => r.status === status);
    }

    console.log(`[ReportsService] Returning ${records.length} records`);
    return {
      records,
      totalRecords: records.length,
    };
  }

  async getSummary(eventId: string, date?: string) {
    const total = await this.volunteerRepository.count();
    
    const query = this.attendanceRepository.createQueryBuilder('attendance')
      .where('attendance.eventId = :eventId', { eventId });

    if (date && date !== '') {
      const start = `${date} 00:00:00`;
      const d = new Date(date);
      d.setUTCDate(d.getUTCDate() + 1);
      const end = d.toISOString().split('T')[0] + ' 00:00:00';
      query.andWhere('attendance.checkInTime >= :start AND attendance.checkInTime < :end', { start, end });
    }

    const attendances = await query.getMany();

    const present = attendances.filter(a => a.status === 'present').length;
    const late = attendances.filter(a => a.status === 'late').length;
    const absent = total - (present + late);
    
    const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    const manualCheckedIn = attendances.filter(a => a.checkInMethod === 'manual').length;

    return {
      total,
      present,
      late,
      absent,
      attendanceRate,
      manualCheckedIn,
    };
  }

  async getByDepartment(eventId: string, date?: string) {
    const volunteers = await this.volunteerRepository.find({
      relations: ['attendances']
    });

    const deptMap = new Map<string, any>();

    volunteers.forEach(v => {
      const dept = v.department || 'Unassigned';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { department: dept, present: 0, late: 0, absent: 0, total: 0 });
      }

      const stats = deptMap.get(dept);
      stats.total++;

      // Find attendance for this specific event and optional date
      const attendance = v.attendances?.find(a => {
        const matchesEvent = a.eventId === eventId;
        if (!date || date === '') return matchesEvent;
        
        const checkInDate = a.checkInTime ? new Date(a.checkInTime) : null;
        if (!checkInDate) return false;
        
        // Simple comparison: check if checkInTime is within the date's 24h range in the target timezone
        // Or simpler: just compare the YYYY-MM-DD part of the local string if its stored as local or just use the same range logic
        // To be consistent with other methods, let's use the range logic
        const start = `${date} 00:00:00`;
        const d = new Date(date);
        d.setUTCDate(d.getUTCDate() + 1);
        const end = d.toISOString().split('T')[0] + ' 00:00:00';
        
        if (!a.checkInTime) return false;
        
        const dStart = new Date(start);
        const dEnd = new Date(end);
        const dCheckIn = new Date(a.checkInTime);
        
        return matchesEvent && dCheckIn >= dStart && dCheckIn < dEnd;
      });
      
      if (attendance?.status === 'present') {
        stats.present++;
      } else if (attendance?.status === 'late') {
        stats.late++;
      } else {
        stats.absent++;
      }
    });

    return Array.from(deptMap.values());
  }

  async generatePDFReport(eventId: string) {
    const data = await this.getAttendanceReports({ eventId });
    const summary = await this.getSummary(eventId);
    
    // We'll return a structured JSON that the frontend can use to "simulated" a PDF or we can return a base64 string if we had a library.
    // Given we want to "make it work", I'll return the data and the frontend can handle it or I can return a simple string.
    return {
      success: true,
      data: {
        reportName: `Attendance Report - ${eventId}`,
        generatedAt: new Date().toISOString(),
        summary,
        records: data.records
      }
    };
  }

  async generateCSVReport(eventId: string) {
    const data = await this.getAttendanceReports({ eventId });
    
    let csv = 'Name,Role,Department,Status,Check-in Time,Method\n';
    data.records.forEach(r => {
      csv += `"${r.name}","${r.role}","${r.dept}","${r.status}","${r.time || ''}","${r.method}"\n`;
    });

    return {
      success: true,
      message: 'CSV generated successfully',
      fileName: `attendance-report-${eventId}.csv`,
      content: csv
    };
  }

  async getRawData() {
    const volunteers = await this.volunteerRepository.find();
    const attendances = await this.attendanceRepository.find();
    return { volunteers, attendances };
  }
}
