import {
  Body,
  Controller,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('')
  async store(@Body() createUserDto: CreateUserDto) {
    if (createUserDto.password !== createUserDto.password_confirmation) {
      throw new UnprocessableEntityException(
        'Password confirmation does not match',
      );
    }
    delete createUserDto.password_confirmation;
    return await this.usersService.create(createUserDto);
  }
}
