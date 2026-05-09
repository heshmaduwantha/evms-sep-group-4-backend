import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Attendance } from '../../attendance/entities/attendance.entity';

@Entity('volunteers')
export class Volunteer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  qrCode: string;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  skills: string;

  @Column({ nullable: true })
  availability: string;

  @Column({ default: 0 })
  activities: number;

  @Column({ default: true })
  active: boolean;

  @Column()
  role: string;

  @Column()
  department: string;

  @OneToMany(() => Attendance, (attendance) => attendance.volunteer)
  attendances: Attendance[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
