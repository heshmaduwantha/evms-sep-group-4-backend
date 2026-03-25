import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async onModuleInit() {
        const bcrypt = await import('bcrypt');

        const seeds = [
            { email: 'organizer@example.com', password: 'Password123!', role: 'organizer' as any },
            { email: 'volunteer@example.com', password: 'Password123!', role: 'volunteer' as any },
        ];

        for (const seed of seeds) {
            let user = await this.usersRepository.findOne({ where: { email: seed.email } });
            if (user) {
                // Always ensure correct role even if user already exists
                if (user.role !== seed.role) {
                    user.role = seed.role;
                    await this.usersRepository.save(user);
                    console.log(`[UsersService] Fixed role for ${seed.email} -> ${seed.role}`);
                }
            } else {
                const hashedPassword = await bcrypt.hash(seed.password, 10);
                await this.usersRepository.save({
                    email: seed.email,
                    password: hashedPassword,
                    role: seed.role,
                });
                console.log(`[UsersService] Seeded user: ${seed.email} with role ${seed.role}`);
            }
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'role'], // Include password for validation
        });
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = this.usersRepository.create(createUserDto);
        return this.usersRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find({
            select: ['id', 'email', 'role', 'createdAt', 'updatedAt']
        });
    }
}
