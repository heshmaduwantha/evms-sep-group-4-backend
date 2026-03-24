export declare enum EventStatus {
    UPCOMING = "UPCOMING",
    ONGOING = "ONGOING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class Event {
    id: string;
    title: string;
    description: string;
    eventDate: Date;
    eventTime: string;
    location: string;
    volunteersRequired: number;
    status: EventStatus;
    createdAt: Date;
    updatedAt: Date;
}
