import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';
import { ApplicationStatus } from '../enums/application-status.enum';
export declare class Application {
    id: string;
    user: User;
    event: Event;
    status: ApplicationStatus;
    motivation: string;
    experience: string;
    skills: string;
    location: string;
    gender: string;
    experienceDetails: string;
    notes: string;
    reapplied: boolean;
    appliedDate: Date;
    updatedAt: Date;
}
