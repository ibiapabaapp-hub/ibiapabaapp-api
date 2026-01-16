import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private prismaService: PrismaService) {}

  async create(createLeadDto: CreateLeadDto) {
    const { name, email, phone_number, type, company_name } = createLeadDto;

    const lead = await this.prismaService.leads.findFirst({
      where: { email },
    });

    if (lead) {
      throw new BadRequestException('Lead already exists');
    }

    return await this.prismaService.leads.create({
      data: {
        name,
        email,
        phone_number,
        type,
        company_name,
      },
    });
  }

  async findAll() {
    return await this.prismaService.leads.findMany();
  }

  async findOne(id: string) {
    const lead = await this.prismaService.leads.findFirst({
      where: { id },
    });

    if (!lead) {
      throw new NotFoundException('Lead does not exist');
    }

    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto) {
    await this.findOne(id);

    return await this.prismaService.leads.update({
      where: { id },
      data: updateLeadDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prismaService.leads.delete({
      where: { id },
    });

    return { message: 'Lead deleted successfully' };
  }
}
