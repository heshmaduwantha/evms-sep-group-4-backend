import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApplicationStatus } from '../enums/application-status.enum';

export class CreateApplicationDto {
    @IsUUID()
    @IsNotEmpty()
    eventId: string;

    @IsString()
    @IsOptional()
    motivation?: string;

    @IsString()
    @IsOptional()
    experience?: string;

    @IsString()
    @IsOptional()
    skills?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    gender?: string;

    @IsString()
    @IsOptional()
    experienceDetails?: string;
}

export class UpdateApplicationDto {
    @IsString()
    @IsOptional()
    motivation?: string;

    @IsString()
    @IsOptional()
    experience?: string;

    @IsString()
    @IsOptional()
    skills?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    gender?: string;

    @IsString()
    @IsOptional()
    experienceDetails?: string;
}

export class UpdateApplicationStatusDto {
    @IsEnum(ApplicationStatus)
    @IsNotEmpty()
    status: ApplicationStatus;

    @IsString()
    @IsOptional()
    notes?: string;
}
