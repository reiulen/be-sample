import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { CompanyService } from '../services/company.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { AuthGuard } from 'src/guard/auth.guard';

@Controller('company')
@UseGuards(AuthGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  create(
    @Body() createCompanyDto: CreateCompanyDto,
    @Request() req: { user: TUserResponse },
  ) {
    return this.companyService.create(createCompanyDto, req);
  }

  @Get()
  findAll(@Request() request: Request & { user: TUserResponse }) {
    return this.companyService.findAll(request);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: TUserResponse },
  ) {
    const { id: userId } = req?.user ?? {};
    const company = await this.companyService.findOne(
      {
        id: +id,
      },
      userId,
    );

    if (!company) throw new NotFoundException('Company not found');

    return {
      statusCode: 200,
      message: 'Company found successfully',
      data: company,
    };
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Request() req: { user: TUserResponse },
  ) {
    return this.companyService.update(+id, updateCompanyDto, req);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyService.delete(+id);
  }
}
