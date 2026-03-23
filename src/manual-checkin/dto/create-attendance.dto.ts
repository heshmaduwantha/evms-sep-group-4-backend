export class CreateAttendanceDto {
  name: string;
  role: string;
  department: string;
  checkedIn: boolean;
  time?: string;
}
