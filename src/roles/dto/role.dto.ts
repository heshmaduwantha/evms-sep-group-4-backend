import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  requiredVolunteers: number;

  @IsString()
  @IsNotEmpty()
  eventId: string;
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  requiredVolunteers?: number;
}

export class AssignVolunteerDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
