import {
  Injectable,
  Request,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { company, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthGuard } from 'src/guard/auth.guard';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(
    data: Prisma.companyCreateInput,
    request: { user: TUserResponse },
  ): Promise<any> {
    const { id: userId } = request.user ?? {};
    const company_exist = await this.prisma.company.findFirst({
      where: {
        company_name: data.company_name,
        created_by: userId,
      },
    });
    if (company_exist) {
      throw new UnprocessableEntityException('Company already exist');
    }
    try {
      const store = await this.prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: {
            company_name: data.company_name,
            created_by: userId,
          },
        });
        return company;
      });
      return {
        statusCode: 200,
        message: 'Company created successfully',
        data: store,
      };
    } catch (error: any) {
      throw new UnprocessableEntityException(error.message);
    }
  }

  @UseGuards(AuthGuard)
  async findAll(request: Request & { user: TUserResponse }) {
    const { id: userId } = request?.user ?? {};
    const company = await this.prisma.company.findMany({
      where: {
        created_by: userId,
      },
    });
    return {
      statusCode: 200,
      message: 'Company found successfully',
      data: company,
    };
  }

  async findOne(
    companyWhere: Prisma.companyWhereUniqueInput,
    userId: number,
  ): Promise<company | null> {
    return this.prisma.company.findUnique({
      where: { ...companyWhere, created_by: userId },
    });
  }

  async update(
    id: number,
    data: Prisma.companyUpdateInput,
    request: { user: TUserResponse },
  ): Promise<any> {
    const { id: userId } = request.user ?? {};
    const company = await this.findOne({ id: id }, userId);
    if (!company) {
      throw new UnprocessableEntityException('Company not found');
    }
    const company_exist = await this.prisma.company.findFirst({
      where: {
        AND: [
          {
            company_name: (data.company_name as string) ?? company.company_name,
          },
          {
            created_by: userId,
          },
        ],
        NOT: {
          id: id,
        },
      },
    });
    if (company_exist) {
      throw new UnprocessableEntityException('Company already exist');
    }
    try {
      const update = await this.prisma.$transaction(async (tx) => {
        const company = await tx.company.update({
          where: {
            id: id,
          },
          data: {
            company_name: data.company_name,
          },
        });
        return company;
      });
      return {
        statusCode: 200,
        message: 'Company updated successfully',
        data: update,
      };
    } catch (error: any) {
      throw new UnprocessableEntityException(error.message);
    }
  }

  async delete(id: number) {
    try {
      const company = await this.prisma.company.findUnique({
        where: {
          id: id,
        },
      });
      if (!company) {
        throw new UnprocessableEntityException('Company not found');
      }
      await this.prisma.$transaction(async (tx) => {
        const company = await tx.company.delete({
          where: {
            id: id,
          },
        });
        return company;
      });
      return {
        statusCode: 200,
        message: 'Company deleted successfully',
      };
    } catch (error: any) {
      throw new UnprocessableEntityException(error.message);
    }
  }
}
