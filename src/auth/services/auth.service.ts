import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
  ) {}
  async login(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne({ email });
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = await bcrypt.hash(new Date().toString(), 10);
      await this.prisma.$transaction(async (tx) => {
        return await tx.users.update({
          where: { id: user.id },
          data: { token: token },
        });
      });
      return {
        statusCode: 200,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          fullname: user.fullname,
          token: token,
        },
      };
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
  async logout(token: string): Promise<any> {
    const user = await this.prisma.users.findFirst({
      where: {
        token,
      },
    });
    if (user) {
      await this.prisma.$transaction(async (tx) => {
        return await tx.users.update({
          where: { id: user.id },
          data: { token: '' },
        });
      });
      return {
        statusCode: 200,
        message: 'Logout successful',
      };
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
