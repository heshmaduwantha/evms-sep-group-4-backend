import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Volunteer } from './entity/volunteer.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class VolunteerService {

  constructor(
    @InjectRepository(Volunteer)
    private repo: Repository<Volunteer>
  ) {}

  // CREATE
  async create(data: any) {
    const volunteer = this.repo.create(data);
    return this.repo.save(volunteer);
  }

  // GET ALL
  findAll(query: any) {
    const { skill, minActivities } = query;

    const qb = this.repo.createQueryBuilder('v');

    if (skill) {
      qb.andWhere('LOWER(v.skills) LIKE LOWER(:skill)', { skill: `%${skill}%` });
    }

    if (minActivities) {
      qb.andWhere('v.activities >= :minActivities', { minActivities });
    }

    return qb.getMany();
  }

  // GET ONE
  async findOne(id: string): Promise<Volunteer | null> {
    return this.repo.findOneBy({ id });
  }

  // UPDATE
  async update(id: string, data: any) {
    const volunteer = await this.findOne(id);

    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }

    Object.assign(volunteer, data);

    return this.repo.save(volunteer);
  }

  // TOGGLE STATUS
  async toggleStatus(id: string) {
    const volunteer = await this.findOne(id);

    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }

    volunteer.active = !volunteer.active;

    return this.repo.save(volunteer);
  }

  // DELETE
  async remove(id: string) {
    const volunteer = await this.findOne(id);

    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }

    return this.repo.delete(id);
  }
}