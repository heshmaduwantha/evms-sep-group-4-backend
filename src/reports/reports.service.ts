import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  private mockAttendanceRecords = [
    { id: '1', name: 'Sarah Mitchell', role: 'Team Lead', dept: 'Operations', status: 'present', time: '08:30 AM' },
    { id: '2', name: 'James Okafor', role: 'Registration', dept: 'Front Desk', status: 'present', time: '08:45 AM' },
    { id: '3', name: 'Priya Nair', role: 'Logistics', dept: 'Operations', status: 'late', time: '09:15 AM' },
    { id: '4', name: 'Carlos Reyes', role: 'Security', dept: 'Safety', status: 'absent', time: null },
    { id: '5', name: 'Amara Diallo', role: 'Hospitality', dept: 'Guest Services', status: 'present', time: '08:50 AM' },
    { id: '6', name: 'Tom Whitfield', role: 'AV Tech', dept: 'Technical', status: 'absent', time: null },
    { id: '7', name: 'Yuki Tanaka', role: 'Volunteer', dept: 'Operations', status: 'present', time: '08:05 AM' },
    { id: '8', name: 'Sofia Rodriguez', role: 'Volunteer', dept: 'Front Desk', status: 'present', time: '08:10 AM' },
    { id: '9', name: 'Michael Chen', role: 'Team Lead', dept: 'Operations', status: 'present', time: '08:08 AM' },
    { id: '10', name: 'Emma Thompson', role: 'Volunteer', dept: 'Front Desk', status: 'late', time: '09:25 AM' },
    { id: '11', name: 'David Kumar', role: 'Security', dept: 'Safety', status: 'absent', time: null },
    { id: '12', name: 'Alex Johnson', role: 'Volunteer', dept: 'Technical', status: 'present', time: '08:18 AM' },
    { id: '13', name: 'Isabella Martinez', role: 'Volunteer', dept: 'Guest Services', status: 'present', time: '07:55 AM' },
    { id: '14', name: 'Oliver Hassan', role: 'Team Lead', dept: 'Operations', status: 'absent', time: null },
    { id: '15', name: 'Jasmine Patel', role: 'Volunteer', dept: 'Front Desk', status: 'present', time: '08:30 AM' },
    { id: '16', name: 'Lucas Anderson', role: 'AV Tech', dept: 'Technical', status: 'late', time: '09:40 AM' },
  ];

  private mockDepartmentData = {
    'event-1': [
      { department: 'Operations', present: 40, late: 5, absent: 8, total: 53 },
      { department: 'Front Desk', present: 30, late: 3, absent: 2, total: 35 },
      { department: 'Safety', present: 15, late: 4, absent: 6, total: 25 },
      { department: 'Technical', present: 8, late: 2, absent: 4, total: 14 },
      { department: 'Guest Services', present: 5, late: 0, absent: 0, total: 5 },
    ]
  };

  getAttendanceReports(filters: any) {
    let records = [...this.mockAttendanceRecords];

    if (filters.status && filters.status !== 'all') {
      records = records.filter(r => r.status === filters.status);
    }

    if (filters.department && filters.department !== 'all') {
      records = records.filter(r => r.dept === filters.department);
    }

    return {
      records,
      totalRecords: records.length,
    };
  }

  getSummary(eventId: string) {
    return {
      total: 142,
      present: 98,
      late: 14,
      absent: 30,
      attendanceRate: 69,
    };
  }

  getByDepartment(eventId: string) {
    return this.mockDepartmentData[eventId] || [];
  }

  generatePDFReport(eventId: string) {
    return {
      success: true,
      message: 'PDF generated successfully',
      fileName: `attendance-report-${eventId}.pdf`,
    };
  }

  generateCSVReport(eventId: string) {
    return {
      success: true,
      message: 'CSV generated successfully',
      fileName: `attendance-report-${eventId}.csv`,
    };
  }
}
