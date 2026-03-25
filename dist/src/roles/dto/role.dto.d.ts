export declare class CreateRoleDto {
    name: string;
    description?: string;
    requiredVolunteers: number;
    eventId: string;
}
export declare class UpdateRoleDto {
    name?: string;
    description?: string;
    requiredVolunteers?: number;
}
export declare class AssignVolunteerDto {
    userId: string;
}
