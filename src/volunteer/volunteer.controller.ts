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
  findAll(@Query() query: any) {
    return this.service.findAll(query);
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