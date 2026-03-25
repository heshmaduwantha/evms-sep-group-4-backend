import { Event } from '../../events/entities/event.entity';
import { User } from '../../users/entities/user.entity';
export declare class Role {
    id: string;
    name: string;
    description: string;
    requiredVolunteers: number;
    event: Event;
    assignedVolunteers: User[];
    createdAt: Date;
    updatedAt: Date;
}
