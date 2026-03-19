import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Volunteer } from '../../users/entities/volunteer.entity';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @ManyToOne(() => Volunteer, (volunteer) => volunteer.attendances, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'volunteerId' })
  volunteer: Volunteer;

  @Column({ default: 'absent' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  checkInTime: Date | null;

  @Column({ default: 'manual' })
  checkInMethod: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
