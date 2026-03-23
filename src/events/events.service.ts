import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createEventDto: CreateEventDto) {
    return await this.prismaService.event.create({
      data: createEventDto,
    });
  }

  async findAll() {
    const events = await this.prismaService.event.findMany({
      include: {
        categories: {
          select: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return events.map((e) => ({
      ...e,
      categories: e.categories.map((cat) => cat.category.name),
    }));
  }

  async findOne(id: string) {
    const event = await this.prismaService.event.findUnique({
      where: { id },
      include: {
        categories: {
          select: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException();
    }

    return {
      ...event,
      categories: event.categories.map((cat) => cat.category.name),
    };
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    await this.findOne(id);
    return await this.prismaService.event.update({
      where: { id },
      data: {
        name: updateEventDto.name,
        description: updateEventDto.description,
        cover_img_url: updateEventDto.cover_img_url,
        slug: updateEventDto.slug,
        type: updateEventDto.type,
        active: updateEventDto.active,
        reach_level: updateEventDto.reach_level,
        start_date: updateEventDto.start_date,
        end_date: updateEventDto.end_date,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.prismaService.event.delete({ where: { id } });
  }
}
