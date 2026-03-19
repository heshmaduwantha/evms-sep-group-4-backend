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
  ) { }

  async getAttendanceReports(filters: any) {
    const { eventId, date, status, department } = filters;
    console.log(`[ReportsService] getAttendanceReports - Filters: eventId=${eventId}, date=${date}, status=${status}, department=${department}`);

    const query = this.volunteerRepository.createQueryBuilder('volunteer');

    if (eventId && eventId !== '') {
      // SPECIFIC EVENT: Use innerJoinAndSelect to ONLY get volunteers with attendance for this event
      query.innerJoinAndSelect('volunteer.attendances', 'attendance',
        'attendance.eventId = :eventId',
        { eventId }
      );
    } else {
      // ALL EVENTS: Use leftJoinAndSelect to show all volunteers and their attendances if any
      query.leftJoinAndSelect('volunteer.attendances', 'attendance');
    }

    if (department && department !== 'all') {
      query.andWhere('LOWER(volunteer.department) = LOWER(:department)', { department });
    }

    const volunteers = await query.getMany();
    let records: any[] = [];

    volunteers.forEach(v => {
      const attendances = v.attendances || [];
      
      if (attendances.length === 0) {
        // Only happens in "All Events" view because of left join
        records.push({
          id: v.id,
          name: v.name,
          role: v.role,
          dept: v.department,
          status: 'absent',
          time: null,
          method: 'manual',
          eventId: 'None'
        });
      } else {
        attendances.forEach(a => {
          // If a specific date is requested, filter here
          if (date && date !== '') {
            const checkInDate = a.checkInTime ? new Date(a.checkInTime).toISOString().split('T')[0] : null;
            if (checkInDate !== date) return;
          }

          records.push({
            id: v.id,
            name: v.name,
            role: v.role,
            dept: v.department,
            status: a.status,
            time: a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : null,
            method: 'manual',
            eventId: a.eventId
          });
        });
      }
    });

    if (status && status !== 'all') {
      records = records.filter(r => r.status === status);
    }

    return {
      records,
      totalRecords: records.length,
    };
  }

  async getSummary(eventId: string, date?: string) {
    // Get the actual records that will be shown in the table
    const data = await this.getAttendanceReports({ eventId, date });
    const records = data.records;

    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const late = records.filter(r => r.status === 'late').length;
    const absent = records.filter(r => r.status === 'absent').length;

    // Count manual check-ins among those who are present/late
    const manualCheckedIn = records.filter(r =>
      r.method === 'manual' && (r.status === 'present' || r.status === 'late')
    ).length;

    const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

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
    const data = await this.getAttendanceReports({ eventId, date });
    const records = data.records;

    const deptMap = new Map<string, any>();

    records.forEach(r => {
      const dept = r.dept || 'Unassigned';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { department: dept, present: 0, late: 0, absent: 0, total: 0 });
      }

      const stats = deptMap.get(dept);
      stats.total++;

      if (r.status === 'present') {
        stats.present++;
      } else if (r.status === 'late') {
        stats.late++;
      } else {
        stats.absent++;
      }
    });

    return Array.from(deptMap.values());
  }

  async generatePDFReport(eventId: string, eventTitle?: string) {
    const data = await this.getAttendanceReports({ eventId });
    const summary = await this.getSummary(eventId);

    let reportName = `Attendance Report - ${eventId}`;
    if (eventTitle) {
      reportName = eventTitle === 'All Events' ? 'Attendance Report - All Events' : `Volunteers for ${eventTitle} Event`;
    }

    return {
      success: true,
      data: {
        reportName,
        generatedAt: new Date().toISOString(),
        summary,
        records: data.records
      }
    };
  }

  async generateCSVReport(eventId: string, eventTitle?: string) {
    const data = await this.getAttendanceReports({ eventId });

    let csv = 'Name,Role,Department,Status,Check-in Time,Method\n';
    data.records.forEach(r => {
      csv += `"${r.name}","${r.role}","${r.dept}","${r.status}","${r.time || ''}","${r.method}"\n`;
    });

    let fileName = `attendance-report-${eventId}.csv`;
    if (eventTitle) {
      const slug = eventTitle.toLowerCase().replace(/\s+/g, '-');
      fileName = eventTitle === 'All Events' ? 'attendance-report-all-events.csv' : `volunteers-for-${slug}.csv`;
    }

    return {
      success: true,
      message: 'CSV generated successfully',
      fileName,
      content: csv
    };
  }

  async getRawData() {
    const volunteers = await this.volunteerRepository.find();
    const attendances = await this.attendanceRepository.find();
    return { volunteers, attendances };
  }
}
