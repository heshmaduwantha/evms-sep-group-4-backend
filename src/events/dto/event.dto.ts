import { IsString, IsNotEmpty, IsDateString, IsNumber, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { EventStatus } from '../entities/event.entity';

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    @IsNotEmpty()
    date: Date;

    @IsString()
    @IsNotEmpty()
    time: string;

    @IsString()
    @IsNotEmpty()
    location: string;

    @IsNumber()
    @IsNotEmpty()
    volunteersNeeded: number;

    @IsEnum(EventStatus)
    @IsOptional()
    status?: EventStatus;

    @IsUUID()
    @IsNotEmpty()
    organizerId: string;
}

export class UpdateEventDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    @IsOptional()
    date?: Date;

    @IsString()
    @IsOptional()
    time?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsNumber()
    @IsOptional()
    volunteersNeeded?: number;

    @IsEnum(EventStatus)
    @IsOptional()
    status?: EventStatus;
}
