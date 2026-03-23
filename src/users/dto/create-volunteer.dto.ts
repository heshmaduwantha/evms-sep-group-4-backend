import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateVolunteerDto {

  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  skills: string;

  @IsNotEmpty()
  availability: string;
}