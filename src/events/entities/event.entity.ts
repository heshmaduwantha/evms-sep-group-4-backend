import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum EventStatus {
    UPCOMING = 'upcoming',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

@Entity('events')
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'varchar', length: 50 })
    time: string;

    @Column()
    location: string;

    @Column({ type: 'int', default: 0 })
    volunteersNeeded: number;

    @Column({
        type: 'enum',
        enum: EventStatus,
        default: EventStatus.UPCOMING,
    })
    status: EventStatus;

    @ManyToOne(() => User, { eager: true })
    organizer: User;

    @ManyToMany(() => User)
    @JoinTable({
        name: 'event_volunteers',
        joinColumn: { name: 'event_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' }
    })
    volunteers: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
