import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { City } from './entities/city.entity';

@Injectable()
export class CitiesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<City[]> {
    return this.prismaService.$queryRaw`
      SELECT 
        c.id, 
        c.name, 
        c.slug, 
        c.description,
        c."cover_img_url",
        ST_AsGeoJSON(c.location)::json as location,
        (
          SELECT json_agg(cat.name)
          FROM city_category cc
          JOIN category cat ON cat.id = cc."category_id"
          WHERE cc."city_id" = c.id
        ) as categories
      FROM city c
      ORDER BY c.name ASC
    `;
  }

  async findOne(id: string): Promise<City> {
    const cities: City[] = await this.prismaService.$queryRaw`
      SELECT 
        id, 
        name, 
        slug, 
        description,
        "cover_img_url",
        ST_AsGeoJSON(location)::json as location
      FROM city
      WHERE id = ${id}::uuid
      LIMIT 1
    `;

    if (Array.isArray(cities) && cities.length > 0) {
      return cities[0];
    }

    throw new NotFoundException('City not found');
  }
}
