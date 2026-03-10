import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class CitiesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
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
          FROM "CityCategory" cc
          JOIN "Category" cat ON cat.id = cc."category_id"
          WHERE cc."city_id" = c.id
        ) as categories
      FROM "City" c
      ORDER BY c.name ASC
    `;
  }

  async findOne(id: string) {
    const cities = await this.prismaService.$queryRaw`
      SELECT 
        id, 
        name, 
        slug, 
        description,
        "cover_img_url",
        ST_AsGeoJSON(location)::json as location
      FROM "City"
      WHERE id = ${id}::uuid
      LIMIT 1
    `;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Array.isArray(cities) ? cities[0] : null;
  }
}
