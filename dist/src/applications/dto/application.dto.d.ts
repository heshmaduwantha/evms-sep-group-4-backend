import { ApplicationStatus } from '../enums/application-status.enum';
export declare class CreateApplicationDto {
    eventId: string;
    motivation?: string;
    experience?: string;
    skills?: string;
    location?: string;
    gender?: string;
    experienceDetails?: string;
}
export declare class UpdateApplicationDto {
    motivation?: string;
    experience?: string;
    skills?: string;
    location?: string;
    gender?: string;
    experienceDetails?: string;
}
export declare class UpdateApplicationStatusDto {
    status: ApplicationStatus;
    notes?: string;
}
