import { IsString, IsNotEmpty, IsDateString, IsInt, Min } from 'class-validator';
import { EventStatus } from '../event.entity';

export class CreateEventDto {

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  eventDate: string;

  @IsString()
  @IsNotEmpty()
  eventTime: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsInt()
  @Min(1)
  volunteersRequired: number;

  status?: EventStatus;
 
}