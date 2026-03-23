export class CreateCheckInDto {
  userId: string;
  eventId: string;
  qrCode?: string;
  timestamp?: Date;
}
