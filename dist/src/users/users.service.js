"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
let UsersService = class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async onModuleInit() {
        const bcrypt = await import('bcrypt');
        const seeds = [
            { email: 'organizer@example.com', password: 'Password123!', role: 'organizer' },
            { email: 'volunteer@example.com', password: 'Password123!', role: 'volunteer' },
        ];
        for (const seed of seeds) {
            let user = await this.usersRepository.findOne({ where: { email: seed.email } });
            if (user) {
                if (user.role !== seed.role) {
                    user.role = seed.role;
                    await this.usersRepository.save(user);
                    console.log(`[UsersService] Fixed role for ${seed.email} -> ${seed.role}`);
                }
            }
            else {
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
    async findByEmail(email) {
        return this.usersRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'role'],
        });
    }
    async create(createUserDto) {
        const user = this.usersRepository.create(createUserDto);
        return this.usersRepository.save(user);
    }
    async findAll() {
        return this.usersRepository.find({
            select: ['id', 'email', 'role', 'createdAt', 'updatedAt']
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map