import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Event, EventStatus } from '../events/entities/event.entity';
import { Role } from '../roles/entities/role.entity';
import { Volunteer } from './entities/volunteer.entity';
import { Application } from '../applications/entities/application.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { ApplicationStatus } from '../applications/enums/application-status.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(User) private usersRepo: Repository<User>,
        @InjectRepository(Event) private eventsRepo: Repository<Event>,
        @InjectRepository(Role) private rolesRepo: Repository<Role>,
        @InjectRepository(Volunteer) private volunteerRepo: Repository<Volunteer>,
        @InjectRepository(Application) private appRepo: Repository<Application>,
        @InjectRepository(Attendance) private attendanceRepo: Repository<Attendance>,
    ) { }

    async onModuleInit() {
        // Check if already seeded with Sri Lankan data to avoid infinite loop on restart
        const existing = await this.eventsRepo.findOne({ where: { location: 'Viharamahadevi Park, Colombo' } });
        if (existing) {
            console.log('[SeedService] Database already seeded with Sri Lankan data.');
            return;
        }

        console.log('[SeedService] Starting Massive Sri Lankan Seeding...');
        await this.runSeed();
    }

    async runSeed() {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        
        try {
            // 1. Truncate all tables
            console.log('[SeedService] Truncating tables...');
            await queryRunner.query('TRUNCATE TABLE "attendance" CASCADE');
            await queryRunner.query('TRUNCATE TABLE "applications" CASCADE');
            await queryRunner.query('TRUNCATE TABLE "role_assignments" CASCADE');
            await queryRunner.query('TRUNCATE TABLE "roles" CASCADE');
            await queryRunner.query('TRUNCATE TABLE "event_volunteers" CASCADE');
            await queryRunner.query('TRUNCATE TABLE "events" CASCADE');
            await queryRunner.query('TRUNCATE TABLE "volunteers" CASCADE');
            await queryRunner.query('TRUNCATE TABLE "users" CASCADE');

            // 2. Seed Users
            console.log('[SeedService] Seeding Users...');
            const hashedPassword = await bcrypt.hash('Password123!', 10);
            
            const organizer = await this.usersRepo.save({
                name: 'Pathum Nissanka',
                email: 'organizer@example.com',
                password: hashedPassword,
                role: 'organizer' as any
            });

            const volunteersData = [
                { name: 'Chamari Atapattu', email: 'chamari@example.com' },
                { name: 'Kusal Perera', email: 'kusal@example.com' },
                { name: 'Wanindu Hasaranga', email: 'wanindu@example.com' },
                { name: 'Angelo Mathews', email: 'angelo@example.com' },
                { name: 'Lasith Malinga', email: 'lasith@example.com' },
                { name: 'Kumar Sangakkara', email: 'kumar@example.com' },
                { name: 'Mahela Jayawardene', email: 'mahela@example.com' },
                { name: 'Sanath Jayasuriya', email: 'sanath@example.com' },
                { name: 'Muttiah Muralitharan', email: 'muttiah@example.com' },
                { name: 'Rangana Herath', email: 'rangana@example.com' },
                { name: 'Dinesh Chandimal', email: 'dinesh@example.com' },
                { name: 'Dimuth Karunaratne', email: 'dimuth@example.com' },
                { name: 'Dhananjaya de Silva', email: 'dhananjaya@example.com' },
                { name: 'Vishwa Fernando', email: 'vishwa@example.com' },
                { name: 'Avishka Fernando', email: 'avishka@example.com' },
            ];

            const volunteers: User[] = [];
            for (const v of volunteersData) {
                const user = await this.usersRepo.save({
                    name: v.name,
                    email: v.email,
                    password: hashedPassword,
                    role: 'volunteer' as any
                });
                volunteers.push(user);
                
                // Create Volunteer Profile
                await this.volunteerRepo.save({
                    name: v.name,
                    email: v.email,
                    phone: '077' + Math.floor(1000000 + Math.random() * 9000000),
                    skills: 'First Aid, Logistics, Communication',
                    availability: 'Weekends',
                    department: ['Medical', 'Security', 'General', 'Logistics'][Math.floor(Math.random() * 4)],
                    role: 'Volunteer',
                    active: true,
                    activities: Math.floor(Math.random() * 10)
                });
            }

            // 3. Seed Events
            console.log('[SeedService] Seeding Events...');
            const eventTemplates = [
                { title: 'Colombo City Clean-up', location: 'Viharamahadevi Park, Colombo', desc: 'Annual city-wide cleaning drive focusing on public parks.' },
                { title: 'Kandy Perahera Support', location: 'Dalada Maligawa, Kandy', desc: 'Assisting pilgrims and crowd control during the Esala Perahera.' },
                { title: 'Galle Beach Restoration', location: 'Unawatuna Beach, Galle', desc: 'Removing plastic waste and restoring the coastal ecosystem.' },
                { title: 'Jaffna Health Camp', location: 'Public Library Grounds, Jaffna', desc: 'Providing free medical checkups and medicine to rural communities.' },
                { title: 'Nuwara Eliya Flower Show', location: 'Victoria Park, Nuwara Eliya', desc: 'Logistics and visitor management for the seasonal flower festival.' },
                { title: 'Matara Flood Relief', location: 'District Secretariat, Matara', desc: 'Sorting and distributing essential supplies to flood-affected families.' },
                { title: 'Anuradhapura Site Care', location: 'Ruwanwelisaya Area, Anuradhapura', desc: 'Maintenance and awareness drive at ancient heritage sites.' },
                { title: 'Batticaloa Literacy Fair', location: 'Weber Stadium, Batticaloa', desc: 'Organizing book stalls and reading sessions for school children.' },
                { title: 'Negombo Lagoon Cleanup', location: 'Munnakkara, Negombo', desc: 'Focusing on removing non-biodegradable waste from the lagoon area.' },
                { title: 'Ratnapura Gem Expo Support', location: 'Gem Corporation Plaza, Ratnapura', desc: 'Providing ushering and guest relation services for the expo.' },
                { title: 'Kurunegala Blood Drive', location: 'Teaching Hospital, Kurunegala', desc: 'Assisting medical staff in the quarterly blood donation campaign.' },
                { title: 'Trincomalee Reef Guard', location: 'Pigeon Island, Trincomalee', desc: 'Underwater cleanup and coral reef protection awareness.' },
            ];

            const events: Event[] = [];
            for (let i = 0; i < eventTemplates.length; i++) {
                const temp = eventTemplates[i];
                const date = new Date();
                date.setDate(date.getDate() + (i * 3) - 10); // Spread across past and future
                
                let status = EventStatus.UPCOMING;
                if (i < 3) status = EventStatus.COMPLETED;
                else if (i < 6) status = EventStatus.ONGOING;

                const event = await this.eventsRepo.save({
                    title: temp.title,
                    description: temp.desc,
                    location: temp.location,
                    date: date,
                    time: '08:30 AM',
                    volunteersNeeded: 20 + (i * 5),
                    status: status,
                    organizer: organizer
                });
                events.push(event);

                // 4. Seed Roles for each event
                const roles = ['First Aid', 'Crowd Control', 'Registration', 'Logistics', 'Social Media'];
                for (const rName of roles) {
                    await this.rolesRepo.save({
                        name: rName,
                        description: `Responsible for ${rName.toLowerCase()} during the ${temp.title}.`,
                        requiredVolunteers: 5,
                        event: event
                    });
                }
            }

            // 5. Seed Applications
            console.log('[SeedService] Seeding Applications...');
            for (let i = 0; i < 20; i++) {
                const randomVol = volunteers[Math.floor(Math.random() * volunteers.length)];
                const randomEvent = events[Math.floor(Math.random() * events.length)];
                
                await this.appRepo.save({
                    user: randomVol,
                    event: randomEvent,
                    status: [ApplicationStatus.PENDING, ApplicationStatus.APPROVED, ApplicationStatus.REJECTED][Math.floor(Math.random() * 3)],
                    motivation: 'I want to help the community in ' + randomEvent.location,
                    experience: 'I have volunteered for similar events before.',
                    skills: 'Communication, Teamwork',
                    location: 'Colombo',
                    gender: 'Male'
                });
            }

            // 6. Seed Attendance
            console.log('[SeedService] Seeding Attendance...');
            const volunteerProfiles = await this.volunteerRepo.find();
            for (let i = 0; i < 15; i++) {
                const randomProfile = volunteerProfiles[Math.floor(Math.random() * volunteerProfiles.length)];
                const randomEvent = events[Math.floor(Math.random() * events.length)];
                
                await this.attendanceRepo.save({
                    eventId: randomEvent.id,
                    volunteer: randomProfile,
                    status: ['present', 'absent', 'late'][Math.floor(Math.random() * 3)],
                    checkInTime: new Date(),
                    checkInMethod: 'QR Scan'
                });
            }

            console.log('[SeedService] Massive Seeding Completed Successfully!');

        } catch (error) {
            console.error('[SeedService] Seeding failed:', error);
        } finally {
            await queryRunner.release();
        }
    }
}
