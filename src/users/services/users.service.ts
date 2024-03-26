import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Prisma, users } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.usersCreateInput): Promise<any> {
    try {
      const passwordHash = await bcrypt.hash(data.password, 10);

      const findUser = await this.findOne({
        email: data.email,
      });
      if (findUser)
        throw new UnprocessableEntityException('Email already exists');
      const store = await this.prisma.$transaction(async (tx) => {
        const user = await tx.users.create({
          data: {
            ...data,
            password: passwordHash,
          },
        });

        return user;
      });
      return {
        statusCode: 200,
        message: 'User created successfully',
        data: store,
      };
    } catch (error: any) {
      throw new UnprocessableEntityException(error.message);
    }
  }

  async findOne(
    userWhere: Prisma.usersWhereUniqueInput,
  ): Promise<users | null> {
    return this.prisma.users.findUnique({
      where: userWhere,
    });
  }
}
