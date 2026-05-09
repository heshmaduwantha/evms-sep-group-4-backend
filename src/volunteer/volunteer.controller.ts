import { Controller, Get, Post, Body, Param, Put, Patch, Query } from '@nestjs/common';
import { VolunteerService } from './volunteer.service';

@Controller('volunteers')
export class VolunteerController {

  constructor(private service: VolunteerService) {}

  // CREATE
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  // GET ALL + FILTER
  @Get()
  async findAll(@Query() query: any) {
    try {
      const manualVolunteers = await this.service.findAll(query);
      
      // Fetch approved applicants from applications
      let approvedApplicants: any[] = [];
      try {
        approvedApplicants = await this.service.getApprovedApplicants();
      } catch (appErr) {
        console.error('[VolunteerController] Failed to fetch approved applicants:', appErr.message);
      }
      
      return [...manualVolunteers, ...approvedApplicants];
    } catch (err) {
      console.error('[VolunteerController] Critical error in findAll:', err.message);
      throw err;
    }
  }

  // GET ONE
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // UPDATE
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  // TOGGLE STATUS
  @Patch(':id/toggle')
  toggle(@Param('id') id: string) {
    return this.service.toggleStatus(id);
  }
}