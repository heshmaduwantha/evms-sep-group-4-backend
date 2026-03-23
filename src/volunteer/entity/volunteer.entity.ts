import { Attendance } from 'src/attendance/entities/attendance.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';



@Entity()
export class Volunteer {

  @PrimaryGeneratedColumn()
id: string;

@Column({ unique: true, nullable: true })
qrCode: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column()
  skills: string;

  @Column()
  availability: string;

  @Column({ default: 0 })
  activities: number;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
department: string;

@Column({ default: 'VOLUNTEER' })
  role: string;

  @OneToMany(() => Attendance, attendance => attendance.volunteer)
  attendances: Attendance[];

}