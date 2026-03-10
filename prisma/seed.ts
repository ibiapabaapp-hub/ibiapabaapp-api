import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  UserRole,
  EntityType,
  MediaType,
  CompanyRole,
} from '@prisma/client';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// --- DATA MOCKS ---

const CITIES_TO_SEED = [
  {
    name: 'Ubajara',
    slug: 'ubajara',
    lat: -3.8321,
    lng: -40.9224,
    categories: ['Turismo', 'Serra', 'Natureza'],
  },
  {
    name: 'Tianguá',
    slug: 'tiangua',
    lat: -3.7314,
    lng: -40.9917,
    categories: ['Comércio', 'Serra'],
  },
  {
    name: 'Viçosa do Ceará',
    slug: 'vicosa-do-ceara',
    lat: -3.5622,
    lng: -41.0911,
    categories: ['Histórico', 'Serra', 'Cultura'],
  },
];

const COMPANIES_TO_SEED = [
  {
    name: 'Manacá da Serra',
    slug: 'manaca-da-serra',
    description:
      'Restaurante Manacá da Serra - Perfil: https://www.instagram.com/manaca.restaurante/',
    categories: ['Restaurante', 'Fino'],
    imageUrl:
      'https://instagram.fjdo10-1.fna.fbcdn.net/v/t51.82787-15/622305876_18106746379666774_7620286892604955622_n.webp?_nc_cat=111&ig_cache_key=MzE5MDI0ODAwMjg4Mjc0NzU3MQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjEwODB4MTM1MC5zZHIuQzMifQ%3D%3D&_nc_ohc=ZebKabuUSlgQ7kNvwF4-AiG&_nc_oc=AdloZs836EU8qhcfkwYdWN9ZB1JyGDGiKDL7iintKGIuf_wItej7ioyPGGK3RwHTQ0A&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fjdo10-1.fna&_nc_gid=AfVi38OLBo-H0VzSby8G4g&_nc_ss=8&oh=00_AfwRoOK0UZ4RwW_eE5qgmISgDpta7SjSvk5qO7SY2XrEJQ&oe=69B56C3E',
  },
  {
    name: 'Serra Viva Music Bar',
    slug: 'serra-viva-music-bar',
    description:
      'Serra Viva Music Bar - Perfil: https://www.instagram.com/serravivamusicbar/',
    categories: ['Bar', 'Música', 'Noturno'],
    imageUrl:
      'https://instagram.fjdo1-1.fna.fbcdn.net/v/t51.82787-15/581636686_17866802673483622_4858679698788447758_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=104&ig_cache_key=Mzc2Nzk4ODYwNzM3MDk5NjYwNg%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjEwMjR4MTAyNC5zZHIuQzMifQ%3D%3D&_nc_ohc=mHQZdAJN3AAQ7kNvwFx7MM7&_nc_oc=Adkr6l00Vh-3X5qBI51ptD7vU1YHPH2XcrcAStOwXPTtgrLQZQn4ga8jJEjvEf-WmhY&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fjdo1-1.fna&_nc_gid=R3ZKvgMFh3gca73WX5kwqQ&_nc_ss=8&oh=00_Afwh0baElNVQUF5qEc76S4gwGR5AHjzUpmx-S07vkBetyg&oe=69B55102',
  },
];

async function main() {
  console.log('🌱 Iniciando seeding seguro...');

  await prisma.$transaction(
    async (tx) => {
      // 1. Usuário Admin
      const hashedPassword = await argon2.hash('12345678');
      const admin = await tx.user.upsert({
        where: { email: 'admin@teste.com' },
        update: { password: hashedPassword },
        create: {
          name: 'Administrador',
          birth_date: new Date(),
          phone_number: '+5588990000000',
          username: 'admin-user',
          email: 'admin@teste.com',
          role: UserRole.superuser,
          password: hashedPassword,
          active: true,
        },
      });
      console.log('✅ Admin verificado.');

      // 2. Processar Cidades
      for (const item of CITIES_TO_SEED) {
        const imageUrl = `https://cdn.ibiapabaapp.com.br/cities/${item.slug}.png`;
        let city = await tx.city.findUnique({ where: { slug: item.slug } });

        if (!city) {
          await tx.$executeRaw`
          INSERT INTO "City" (id, name, slug, description, cover_img_url, location, updated_at, created_at)
          VALUES (
            gen_random_uuid(), 
            ${item.name}, 
            ${item.slug}, 
            ${`Conheça ${item.name}`}, 
            ${imageUrl}, 
            ST_SetSRID(ST_MakePoint(${item.lng}, ${item.lat}), 4326), 
            NOW(), 
            NOW()
          )
        `;
          city = await tx.city.findUnique({ where: { slug: item.slug } });
        } else {
          await tx.city.update({
            where: { id: city.id },
            data: { cover_img_url: imageUrl },
          });
        }

        if (city) {
          // Mídia da Cidade
          await tx.media.upsert({
            where: { id: city.id },
            update: { url: imageUrl },
            create: {
              entity_type: EntityType.city,
              entity_id: city.id,
              media_type: MediaType.image,
              url: imageUrl,
              is_cover: true,
              alt_text: `Imagem de ${item.name}`,
            },
          });

          for (const catName of item.categories) {
            const category = await tx.category.upsert({
              where: { name: catName },
              update: {},
              create: { name: catName },
            });

            await tx.cityCategory.upsert({
              where: {
                city_id_category_id: {
                  city_id: city.id,
                  category_id: category.id,
                },
              },
              update: {},
              create: { city_id: city.id, category_id: category.id },
            });
          }
        }
        console.log(`🏙️  Cidade: ${item.name}`);
      }

      // 3. Processar Empresas
      for (const compData of COMPANIES_TO_SEED) {
        const company = await tx.company.upsert({
          where: { slug: compData.slug },
          update: { description: compData.description },
          create: {
            name: compData.name,
            slug: compData.slug,
            description: compData.description,
            active: true,
          },
        });

        // Relacionamento Admin-Empresa
        await tx.userCompany.upsert({
          where: {
            user_id_company_id: { user_id: admin.id, company_id: company.id },
          },
          update: {},
          create: {
            user_id: admin.id,
            company_id: company.id,
            role: CompanyRole.owner,
          },
        });

        // Categorias Empresa
        for (const catName of compData.categories) {
          const category = await tx.category.upsert({
            where: { name: catName },
            update: {},
            create: { name: catName },
          });

          await tx.companyCategory.upsert({
            where: {
              company_id_category_id: {
                company_id: company.id,
                category_id: category.id,
              },
            },
            update: {},
            create: { company_id: company.id, category_id: category.id },
          });
        }

        await tx.media.upsert({
          where: { id: company.id },
          update: { url: compData.imageUrl },
          create: {
            entity_type: EntityType.company,
            entity_id: company.id,
            media_type: MediaType.image,
            url: compData.imageUrl,
            is_cover: true,
            alt_text: `Imagem de ${compData.name}`,
          },
        });
        console.log(`🏢 Empresa: ${compData.name}`);
      }
    },
    { timeout: 30000 },
  );

  console.log('🚀 Seed finalizado com sucesso!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error('❌ Erro crítico no seed:', e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
