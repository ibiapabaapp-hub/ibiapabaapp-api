import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface SeedData {
  categories: { name: string; parent: string | null }[];
  cities: {
    name: string;
    slug: string;
    description: string;
    lat: number;
    lng: number;
    cover_img_url: string;
    categories: string[];
  }[];
  users: {
    name: string;
    username: string;
    email: string;
    phone_number: string;
    password: string;
    birth_date: string;
    role: string;
    interests: string[];
  }[];
  companies: {
    name: string;
    slug: string;
    description: string;
    cnpj: string;
    max_reach_level: string;
    active: boolean;
    cover_img_url: string;
    categories: string[];
    cities: {
      slug: string;
      is_headquarter: boolean;
      adress_specific: string;
    }[];
    users: { email: string; role: string }[];
    medias: {
      media_type: string;
      url: string;
      is_cover: boolean;
      alt_text: string;
    }[];
  }[];
  events: {
    name: string;
    slug: string;
    description: string;
    cover_img_url: string;
    reach_level: string;
    type: string;
    start_date: string;
    end_date: string;
    active: boolean;
    company_slug: string | null;
    user_email: string | null;
    categories: string[];
    cities: { slug: string; adress_specific: string }[];
    medias: {
      media_type: string;
      url: string;
      is_cover: boolean;
      alt_text: string;
    }[];
  }[];
  leads: {
    name: string;
    email: string;
    phone_number: string;
    type: string;
    company_name: string | null;
  }[];
}

function loadSeedData(): SeedData {
  const seedDataPath = path.join(__dirname, 'seed-data.json');
  const data = fs.readFileSync(seedDataPath, 'utf-8');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return JSON.parse(data);
}

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

async function main() {
  console.log('🌱 Loading seed data...');
  const data = loadSeedData();
  console.log('✅ Seed data loaded.');

  await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      console.log('\n📦 Seeding categories...');
      const categoryMap = new Map<string, string>();

      for (const cat of data.categories) {
        let parentId: string | null = null;
        if (cat.parent) {
          parentId = categoryMap.get(cat.parent) || null;
        }

        const created = await tx.category.upsert({
          where: { name: cat.name },
          update: { parent_id: parentId },
          create: { name: cat.name, parent_id: parentId },
        });
        categoryMap.set(cat.name, created.id);
        console.log(`   ✅ ${cat.name}`);
      }

      console.log('\n📦 Seeding cities...');
      const cityMap = new Map<string, string>();

      for (const city of data.cities) {
        let existingCity = await tx.city.findUnique({
          where: { slug: city.slug },
        });

        if (!existingCity) {
          await tx.$executeRaw`
            INSERT INTO city (id, name, slug, description, cover_img_url, location, updated_at, created_at)
            VALUES (
              gen_random_uuid(),
              ${city.name},
              ${city.slug},
              ${city.description},
              ${city.cover_img_url},
              ST_SetSRID(ST_MakePoint(${city.lng}, ${city.lat}), 4326),
              NOW(),
              NOW()
            )
          `;
          existingCity = await tx.city.findUnique({
            where: { slug: city.slug },
          });
        }

        if (existingCity) {
          cityMap.set(city.slug, existingCity.id);

          for (const catName of city.categories) {
            const catId = categoryMap.get(catName);
            if (catId) {
              const exists = await tx.city_category.findFirst({
                where: { city_id: existingCity.id, category_id: catId },
              });
              if (!exists) {
                await tx.city_category.create({
                  data: { city_id: existingCity.id, category_id: catId },
                });
              }
            }
          }
          console.log(`   ✅ ${city.name}`);
        }
      }

      console.log('\n📦 Seeding users...');
      const userMap = new Map<string, string>();

      for (const user of data.users) {
        const hashedPassword = await hashPassword(user.password);

        const created = await tx.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            username: user.username,
            phone_number: user.phone_number,
            password: hashedPassword,
            birth_date: new Date(user.birth_date),
            role: user.role as 'user' | 'superuser',
          },
          create: {
            name: user.name,
            username: user.username,
            email: user.email,
            phone_number: user.phone_number,
            password: hashedPassword,
            birth_date: new Date(user.birth_date),
            role: user.role as 'user' | 'superuser',
            active: true,
          },
        });
        userMap.set(user.email, created.id);

        for (const interestName of user.interests) {
          const catId = categoryMap.get(interestName);
          if (catId) {
            const exists = await tx.user_interest.findFirst({
              where: { user_id: created.id, category_id: catId },
            });
            if (!exists) {
              await tx.user_interest.create({
                data: { user_id: created.id, category_id: catId },
              });
            }
          }
        }
        console.log(`   ✅ ${user.email}`);
      }

      console.log('\n📦 Seeding companies...');
      const companyMap = new Map<string, string>();

      for (const compData of data.companies) {
        const created = await tx.company.upsert({
          where: { slug: compData.slug },
          update: {
            name: compData.name,
            description: compData.description,
            cnpj: compData.cnpj,
            max_reach_level: compData.max_reach_level as 'local' | 'regional',
            active: compData.active,
            cover_img_url: compData.cover_img_url,
          },
          create: {
            name: compData.name,
            slug: compData.slug,
            description: compData.description,
            cnpj: compData.cnpj,
            max_reach_level: compData.max_reach_level as 'local' | 'regional',
            active: compData.active,
            cover_img_url: compData.cover_img_url,
          },
        });
        companyMap.set(compData.slug, created.id);

        for (const catName of compData.categories) {
          const catId = categoryMap.get(catName);
          if (catId) {
            const exists = await tx.company_category.findFirst({
              where: { company_id: created.id, category_id: catId },
            });
            if (!exists) {
              await tx.company_category.create({
                data: { company_id: created.id, category_id: catId },
              });
            }
          }
        }

        for (const cityData of compData.cities) {
          const cityId = cityMap.get(cityData.slug);
          if (cityId) {
            const exists = await tx.company_city.findFirst({
              where: { company_id: created.id, city_id: cityId },
            });
            if (!exists) {
              await tx.company_city.create({
                data: {
                  company_id: created.id,
                  city_id: cityId,
                  is_headquarter: cityData.is_headquarter,
                  adress_specific: cityData.adress_specific,
                },
              });
            }
          }
        }

        for (const userData of compData.users) {
          const userId = userMap.get(userData.email);
          if (userId) {
            const exists = await tx.user_company.findFirst({
              where: { user_id: userId, company_id: created.id },
            });
            if (!exists) {
              await tx.user_company.create({
                data: {
                  user_id: userId,
                  company_id: created.id,
                  role: userData.role as
                    | 'owner'
                    | 'admin'
                    | 'editor'
                    | 'viewer',
                },
              });
            }
          }
        }

        for (const media of compData.medias) {
          const exists = await tx.media.findFirst({
            where: { company_id: created.id, url: media.url },
          });
          if (!exists) {
            await tx.media.create({
              data: {
                company_id: created.id,
                media_type: media.media_type as 'image' | 'video',
                url: media.url,
                is_cover: media.is_cover,
                alt_text: media.alt_text,
              },
            });
          }
        }
        console.log(`   ✅ ${compData.name}`);
      }

      console.log('\n📦 Seeding events...');
      const eventMap = new Map<string, string>();

      for (const event of data.events) {
        let companyId: string | null = null;
        if (event.company_slug) {
          companyId = companyMap.get(event.company_slug) || null;
        }

        let userId: string | null = null;
        if (event.user_email) {
          userId = userMap.get(event.user_email) || null;
        }

        const created = await tx.event.upsert({
          where: { slug: event.slug },
          update: {
            name: event.name,
            description: event.description,
            cover_img_url: event.cover_img_url,
            reach_level: event.reach_level as 'local' | 'regional',
            type: event.type as 'simple' | 'featured',
            start_date: new Date(event.start_date),
            end_date: new Date(event.end_date),
            active: event.active,
            company_id: companyId,
            user_id: userId,
          },
          create: {
            name: event.name,
            slug: event.slug,
            description: event.description,
            cover_img_url: event.cover_img_url,
            reach_level: event.reach_level as 'local' | 'regional',
            type: event.type as 'simple' | 'featured',
            start_date: new Date(event.start_date),
            end_date: new Date(event.end_date),
            active: event.active,
            company_id: companyId,
            user_id: userId,
          },
        });
        eventMap.set(event.slug, created.id);

        for (const catName of event.categories) {
          const catId = categoryMap.get(catName);
          if (catId) {
            const exists = await tx.event_category.findFirst({
              where: { event_id: created.id, category_id: catId },
            });
            if (!exists) {
              await tx.event_category.create({
                data: { event_id: created.id, category_id: catId },
              });
            }
          }
        }

        for (const cityData of event.cities) {
          const cityId = cityMap.get(cityData.slug);
          if (cityId) {
            const exists = await tx.event_city.findFirst({
              where: { event_id: created.id, city_id: cityId },
            });
            if (!exists) {
              await tx.event_city.create({
                data: {
                  event_id: created.id,
                  city_id: cityId,
                  adress_specific: cityData.adress_specific,
                },
              });
            }
          }
        }

        for (const media of event.medias) {
          const exists = await tx.media.findFirst({
            where: { event_id: created.id, url: media.url },
          });
          if (!exists) {
            await tx.media.create({
              data: {
                event_id: created.id,
                media_type: media.media_type as 'image' | 'video',
                url: media.url,
                is_cover: media.is_cover,
                alt_text: media.alt_text,
              },
            });
          }
        }
        console.log(`   ✅ ${event.name}`);
      }

      console.log('\n📦 Seeding leads...');
      for (const lead of data.leads) {
        await tx.lead.upsert({
          where: { email: lead.email },
          update: {
            name: lead.name,
            phone_number: lead.phone_number,
            type: lead.type as 'resident' | 'tourist' | 'company',
            company_name: lead.company_name,
          },
          create: {
            name: lead.name,
            email: lead.email,
            phone_number: lead.phone_number,
            type: lead.type as 'resident' | 'tourist' | 'company',
            company_name: lead.company_name,
          },
        });
        console.log(`   ✅ ${lead.email}`);
      }
    },
    { timeout: 60000 },
  );

  console.log('\n🚀 Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error('❌ Fatal error on seeding:', e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
