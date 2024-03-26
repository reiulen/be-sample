import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { AuthGuard } from 'src/guard/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    return this.authService.login(email, password);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Request() req: { user: TUserResponse }) {
    const { token } = req?.user ?? {};
    return this.authService.logout(token);
  }
}
