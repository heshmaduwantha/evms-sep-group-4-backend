export class CreateCheckInDto {
  userId: string;
  eventId: string;
  pin?: string;
  timestamp?: Date;
}
