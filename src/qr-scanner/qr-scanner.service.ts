import { Injectable } from '@nestjs/common';

@Injectable()
export class QrScannerService {
  private sessionStats = {
    'event-1': {
      scanned: 0,
      successRate: 98,
    }
  };

  private recentScans = {
    'event-1': [
      { id: '1', volunteerId: 'vol-001', name: 'Sarah Mitchell', time: '08:02 AM', status: 'success' },
      { id: '2', volunteerId: 'vol-002', name: 'James Okafor', time: '08:05 AM', status: 'success' },
      { id: '3', volunteerId: 'vol-003', name: 'Amara Diallo', time: '08:08 AM', status: 'success' },
      { id: '4', volunteerId: 'vol-004', name: 'Priya Nair', time: '08:12 AM', status: 'success' },
      { id: '5', volunteerId: 'vol-005', name: 'Yuki Tanaka', time: '08:15 AM', status: 'success' },
      { id: '6', volunteerId: 'vol-006', name: 'Sofia Rodriguez', time: '08:18 AM', status: 'success' },
      { id: '7', volunteerId: 'vol-007', name: 'Marcus Johnson', time: '08:22 AM', status: 'success' },
      { id: '8', volunteerId: 'vol-008', name: 'Elena Garcia', time: '08:25 AM', status: 'success' },
      { id: '9', volunteerId: 'vol-009', name: 'Tom Whitfield', time: '08:28 AM', status: 'success' },
      { id: '10', volunteerId: 'vol-010', name: 'Michael Chen', time: '08:32 AM', status: 'success' },
    ]
  };

  private volunteers = [
    { id: 'vol-001', name: 'Sarah Mitchell', qrCode: 'QR001', checkedIn: false },
    { id: 'vol-002', name: 'James Okafor', qrCode: 'QR002', checkedIn: false },
    { id: 'vol-003', name: 'Amara Diallo', qrCode: 'QR003', checkedIn: false },
    { id: 'vol-004', name: 'Priya Nair', qrCode: 'QR004', checkedIn: false },
    { id: 'vol-005', name: 'Yuki Tanaka', qrCode: 'QR005', checkedIn: false },
    { id: 'vol-006', name: 'Sofia Rodriguez', qrCode: 'QR006', checkedIn: false },
    { id: 'vol-007', name: 'Marcus Johnson', qrCode: 'QR007', checkedIn: false },
    { id: 'vol-008', name: 'Elena Garcia', qrCode: 'QR008', checkedIn: false },
    { id: 'vol-009', name: 'Tom Whitfield', qrCode: 'QR009', checkedIn: false },
    { id: 'vol-010', name: 'Michael Chen', qrCode: 'QR010', checkedIn: false },
    { id: 'vol-011', name: 'Emma Thompson', qrCode: 'QR011', checkedIn: false },
    { id: 'vol-012', name: 'David Kumar', qrCode: 'QR012', checkedIn: false },
  ];

  processScan(qrCode: string, eventId: string) {
    const volunteer = this.volunteers.find(v => v.qrCode === qrCode);
    
    if (!volunteer) {
      return {
        success: false,
        message: 'Volunteer QR code not found',
        scannedCount: this.sessionStats[eventId]?.scanned || 0
      };
    }

    if (volunteer.checkedIn) {
      return {
        success: false,
        message: 'Volunteer already checked in',
        volunteer: { name: volunteer.name },
        scannedCount: this.sessionStats[eventId]?.scanned || 0
      };
    }

    volunteer.checkedIn = true;
    if (!this.sessionStats[eventId]) {
      this.sessionStats[eventId] = { scanned: 0, successRate: 98 };
    }
    this.sessionStats[eventId].scanned++;

    // Add to recent scans
    if (!this.recentScans[eventId]) {
      this.recentScans[eventId] = [];
    }
    this.recentScans[eventId].unshift({
      id: Math.random().toString(36).substr(2, 9),
      volunteerId: volunteer.id,
      name: volunteer.name,
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      status: 'success'
    });

    return {
      success: true,
      message: `${volunteer.name} checked in successfully`,
      volunteer: { name: volunteer.name },
      scannedCount: this.sessionStats[eventId].scanned
    };
  }

  getSessionStats(eventId: string) {
    return this.sessionStats[eventId] || {
      scanned: 0,
      successRate: 98
    };
  }

  getRecentScans(eventId: string) {
    return this.recentScans[eventId] || [];
  }
}
