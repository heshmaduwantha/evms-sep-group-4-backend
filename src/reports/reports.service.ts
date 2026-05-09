import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Volunteer } from '../users/entities/volunteer.entity';
import { Application } from '../applications/entities/application.entity';
import { ApplicationStatus } from '../applications/enums/application-status.enum';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Volunteer)
    private volunteerRepository: Repository<Volunteer>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) { }

  async getAttendanceReports(filters: any) {
    let { eventId, date, status, department } = filters;
    // Normalize: treat empty string as null to avoid UUID cast errors
    if (!eventId || eventId === '' || eventId === 'all') eventId = null;
    if (!date || date === '') date = null;
    console.log(`[ReportsService] getAttendanceReports - Filters: eventId=${eventId}, date=${date}, status=${status}, department=${department}`);


    const findOptions: any = {
      relations: ['attendances'],
    };

    if (department && department !== 'all') {
      findOptions.where = { department: department };
    }

    const volunteers = await this.volunteerRepository.find(findOptions);
    
    // Fetch approved applications
    const appQuery = this.applicationRepository.createQueryBuilder('application')
      .leftJoinAndSelect('application.user', 'user')
      .leftJoinAndSelect('application.event', 'event')
      .where('application.status = :status', { status: ApplicationStatus.APPROVED });

    if (eventId) {
      appQuery.andWhere('application.eventId = :eventId', { eventId });
    }

    const approvedApps = await appQuery.getMany();

    let records: any[] = [];

    // Process manual volunteers
    volunteers.forEach(v => {
      let attendances = v.attendances || [];
      
      // Filter attendances for this specific event if requested
      if (eventId) {
        attendances = attendances.filter(a => a.eventId === eventId);
      }

      if (attendances.length === 0) {
        // Only show absent if we're not filtering for a specific event OR if they are clearly absent for that event
        // (In this simplified system, we don't have a lookup table for who was INVITED/STAFFED on an event,
        // so we treat anyone without an attendance record as absent)
        records.push({
          id: v.id,
          name: v.name,
          role: v.role,
          dept: v.department,
          status: 'absent',
          time: null,
          method: 'manual',
          eventId: eventId || 'None'
        });
      } else {
        attendances.forEach(a => {
          // If a specific date is requested, filter here
          if (date) {
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
            method: a.checkInMethod || 'manual',
            eventId: a.eventId
          });
        });
      }
    });

    // Process portal applications
    approvedApps.forEach(app => {
      if (date) {
        const appDate = new Date(app.updatedAt).toISOString().split('T')[0];
        if (appDate !== date) return;
      }

      // Avoid duplicates if same person exists in manual list (using name match as heuristic)
      const name = app.user.email.split('@')[0];
      const exists = records.find(r => r.name === name && r.eventId === app.event.id);
      
      if (!exists) {
        records.push({
          id: app.id,
          name: name,
          role: 'Volunteer',
          dept: 'Portal',
          status: 'present', // Approved portal apps are considered present "online"
          time: new Date(app.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          method: 'online',
          eventId: app.event.id
        });
      }
    });

    // 3. Consolidate duplicates if "All Events" is selected
    if (!eventId) {
      const consolidated: any[] = [];
      const seenNames = new Set<string>();

      // Sort so 'present' or 'late' comes before 'absent'
      const sorted = records.sort((a, b) => {
        const aVal = (a.status === 'present' || a.status === 'late') ? 1 : 0;
        const bVal = (b.status === 'present' || b.status === 'late') ? 1 : 0;
        return bVal - aVal;
      });

      sorted.forEach(r => {
        const lowerName = r.name.toLowerCase();
        if (!seenNames.has(lowerName)) {
          seenNames.add(lowerName);
          consolidated.push(r);
        }
      });
      records = consolidated;
    }

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
