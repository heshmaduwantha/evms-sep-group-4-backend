import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';
import { ApplicationStatus } from '../enums/application-status.enum';

@Entity('applications')
export class Application {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { eager: true })
    user: User;

    @ManyToOne(() => Event, { eager: true })
    event: Event;

    @Column({
        type: 'enum',
        enum: ApplicationStatus,
        default: ApplicationStatus.PENDING,
    })
    status: ApplicationStatus;

    @Column({ type: 'text', nullable: true })
    motivation: string;

    @Column({ type: 'text', nullable: true })
    experience: string;

    @Column({ type: 'text', nullable: true })
    skills: string;

    @Column({ nullable: true })
    location: string;

    @Column({ nullable: true })
    gender: string;

    @Column('text', { nullable: true })
    experienceDetails: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ default: false })
    reapplied: boolean;

    @CreateDateColumn()
    appliedDate: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
