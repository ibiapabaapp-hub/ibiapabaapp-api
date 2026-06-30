# Refatorar Categories para Tags — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `category` model (with parent-child hierarchy) with a `TagGroup` + `Tag` model that enables easier search, flexible grouping, and better scalability.

**Architecture:** Two new models — `tag_group` (replaces parent categories) and `tag` (replaces child categories). Junction tables renamed accordingly. A Prisma migration script migrates existing data. All consumers (businesses, events, cities, accounts) updated to use the new models. Seed data restructured.

**Tech Stack:** NestJS, Prisma (PostgreSQL), TypeScript, Jest

---

## Current State Summary

**Schema:** `category` model with `parent_id` (self-ref), `name` (unique), `entities` (enum array). Junction tables: `city_category`, `business_category`, `event_category`, `account_interest`.

**Seed:** Two JSON files (`companies-categories.json`, `events-categories.json`) with parent-child structure.

**API:** `GET /`, `GET /parents`, `GET /parents/:id/children`, `POST /`, `GET :id`, `PATCH :id`, `DELETE :id`

**Consumers:** `businesses.service.ts`, `events.service.ts`, `cities.service.ts`, `accounts/account-interests.service.ts`

---

## File Structure

### New Files

- `src/modules/tags/entities/tag.entity.ts` — Tag entity class
- `src/modules/tags/entities/tag-group.entity.ts` — TagGroup entity class
- `src/modules/tags/dto/create-tag.dto.ts` — Create tag DTO
- `src/modules/tags/dto/update-tag.dto.ts` — Update tag DTO
- `src/modules/tags/dto/create-tag-group.dto.ts` — Create tag group DTO
- `src/modules/tags/dto/update-tag-group.dto.ts` — Update tag group DTO
- `src/modules/tags/tags.service.ts` — Tags CRUD + search logic
- `src/modules/tags/tag-groups.service.ts` — Tag groups CRUD logic
- `src/modules/tags/tags.controller.ts` — Tags + Tag Groups routes
- `src/modules/tags/tags.module.ts` — NestJS module
- `src/modules/tags/__tests__/tags.service.spec.ts` — Unit tests
- `src/modules/tags/__tests__/tags.controller.spec.ts` — Controller tests
- `prisma/seed-data/tags-companies.json` — Company tags seed
- `prisma/seed-data/tags-events.json` — Event tags seed

### Modified Files

- `prisma/schema.prisma` — Replace category models with tag models
- `prisma/seed.ts` — Update to use new tag models
- `src/modules/businesses/businesses.service.ts` — Update category refs to tags
- `src/modules/events/events.service.ts` — Update category refs to tags
- `src/modules/cities/cities.service.ts` — Update category refs to tags
- `src/modules/accounts/account-interests.service.ts` — Update category refs to tags

### Deleted Files

- `src/modules/categories/` (entire directory)

---

### Task 1: Prisma Schema — New Tag Models

**Covers:** Schema design

**Files:**

- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add tag_group and tag models, rename junction tables**

In `prisma/schema.prisma`, make these changes:

1. Replace the `category` model (lines 174-185) with:

```prisma
model tag_group {
  id          String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String @unique
  description String?
  created_at  DateTime @default(now()) @db.Timestamp(6)
  updated_at  DateTime @updatedAt @db.Timestamp(6)
  tags        tag[]
}
```

2. Add `tag` model after `tag_group`:

```prisma
model tag {
  id          String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String
  slug        String       @unique
  description String?
  color       String?      @db.VarChar(7)
  group_id    String       @db.Uuid
  position    Int          @default(0)
  created_at  DateTime     @default(now()) @db.Timestamp(6)
  updated_at  DateTime     @updatedAt @db.Timestamp(6)
  group       tag_group    @relation(fields: [group_id], references: [id], onDelete: Cascade)
  businesses  business_tag[]
  events      event_tag[]
  cities      city_tag[]
  interests   account_interest[]

  @@unique([group_id, name])
  @@index([group_id])
  @@index([slug])
}
```

3. Rename junction tables — replace `city_category` (lines 187-195) with:

```prisma
model city_tag {
  id       String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  city_id  String @db.Uuid
  tag_id   String @db.Uuid
  tag      tag    @relation(fields: [tag_id], references: [id], onDelete: Cascade)
  city     city   @relation(fields: [city_id], references: [id], onDelete: Cascade)

  @@unique([city_id, tag_id])
}
```

4. Replace `business_category` (lines 197-205) with:

```prisma
model business_tag {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  business_id String   @db.Uuid
  tag_id      String   @db.Uuid
  business    business @relation(fields: [business_id], references: [id], onDelete: Cascade)
  tag         tag      @relation(fields: [tag_id], references: [id], onDelete: Cascade)

  @@unique([business_id, tag_id])
}
```

5. Replace `event_category` (lines 217-225) with:

```prisma
model event_tag {
  id       String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  event_id String @db.Uuid
  tag_id   String @db.Uuid
  event    event  @relation(fields: [event_id], references: [id], onDelete: Cascade)
  tag      tag    @relation(fields: [tag_id], references: [id], onDelete: Cascade)

  @@unique([event_id, tag_id])
}
```

6. Replace `account_interest` (lines 164-172) with:

```prisma
model account_interest {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  account_id String   @db.Uuid
  tag_id     String   @db.Uuid
  account    account  @relation(fields: [account_id], references: [id], onDelete: Cascade)
  tag        tag      @relation(fields: [tag_id], references: [id], onDelete: Cascade)

  @@unique([account_id, tag_id])
}
```

7. Remove the `entity_category` enum (lines 307-311).

8. Update all parent models to reference new junction tables:
   - `business.categories` → `business.tags` (type `business_tag[]`)
   - `city.categories` → `city.tags` (type `city_tag[]`)
   - `event.categories` → `event.tags` (type `event_tag[]`)
   - `account_interest.category` → `account_interest.tag` (type `tag`)

- [ ] **Step 2: Generate Prisma client and verify**

```bash
pnpm prisma generate
```

Expected: Success, no errors.

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(schema): replace category model with tag_group + tag models"
```

---

### Task 2: Prisma Migration — Convert Existing Data

**Covers:** Data migration

**Files:**

- Create: `prisma/migrations/convert-categories-to-tags.ts` (one-time migration script)

- [ ] **Step 1: Write migration script**

```typescript
// prisma/migrations/convert-categories-to-tags.ts
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function slugify(name: string): string {
	return name
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

async function main() {
	console.log('🔄 Starting category → tag migration...');

	// 1. Fetch all existing categories
	const categories = await prisma.$queryRaw<
		{ id: string; name: string; parent_id: string | null; entities: string[] }[]
	>`SELECT id, name, parent_id, entities::text[] FROM category`;

	console.log(`  Found ${categories.length} categories`);

	// 2. Create tag_groups from parent categories (parent_id IS NULL)
	const parentCategories = categories.filter((c) => c.parent_id === null);
	const childCategories = categories.filter((c) => c.parent_id !== null);

	const tagGroupMap = new Map<string, string>(); // old category id → new tag_group id

	for (const parent of parentCategories) {
		const result = await prisma.$executeRaw`
      INSERT INTO tag_group (id, name, created_at, updated_at)
      VALUES (gen_random_uuid(), ${parent.name}, now(), now())
      ON CONFLICT (name) DO UPDATE SET updated_at = now()
      RETURNING id
    `;

		const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM tag_group WHERE name = ${parent.name}
    `;
		tagGroupMap.set(parent.id, rows[0].id);
	}

	console.log(`  Created ${tagGroupMap.size} tag groups`);

	// 3. Create tags from child categories
	const tagMap = new Map<string, string>(); // old category id → new tag id
	let tagCount = 0;

	for (const child of childCategories) {
		const groupId = tagGroupMap.get(child.parent_id!);
		if (!groupId) {
			console.warn(
				`  ⚠️  No tag_group for parent "${child.parent_id}" (tag "${child.name}")`,
			);
			continue;
		}

		const slug = slugify(child.name);

		await prisma.$executeRaw`
      INSERT INTO tag (id, name, slug, group_id, position, created_at, updated_at)
      VALUES (gen_random_uuid(), ${child.name}, ${slug}, ${groupId}, ${tagCount}, now(), now())
      ON CONFLICT (slug) DO UPDATE SET updated_at = now()
    `;

		const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM tag WHERE slug = ${slug}
    `;
		tagMap.set(child.id, rows[0].id);
		tagCount++;
	}

	console.log(`  Created ${tagCount} tags`);

	// 4. Migrate junction tables
	// business_tag
	const bizCats = await prisma.$queryRaw<
		{ business_id: string; category_id: string }[]
	>`
    SELECT business_id, category_id FROM business_category
  `;
	for (const bc of bizCats) {
		const tagId = tagMap.get(bc.category_id);
		if (tagId) {
			await prisma.$executeRaw`
        INSERT INTO business_tag (id, business_id, tag_id)
        VALUES (gen_random_uuid(), ${bc.business_id}, ${tagId})
        ON CONFLICT (business_id, tag_id) DO NOTHING
      `;
		}
	}
	console.log(`  Migrated ${bizCats.length} business_tag entries`);

	// event_tag
	const evCats = await prisma.$queryRaw<
		{ event_id: string; category_id: string }[]
	>`
    SELECT event_id, category_id FROM event_category
  `;
	for (const ec of evCats) {
		const tagId = tagMap.get(ec.category_id);
		if (tagId) {
			await prisma.$executeRaw`
        INSERT INTO event_tag (id, event_id, tag_id)
        VALUES (gen_random_uuid(), ${ec.event_id}, ${tagId})
        ON CONFLICT (event_id, tag_id) DO NOTHING
      `;
		}
	}
	console.log(`  Migrated ${evCats.length} event_tag entries`);

	// city_tag
	const cityCats = await prisma.$queryRaw<
		{ city_id: string; category_id: string }[]
	>`
    SELECT city_id, category_id FROM city_category
  `;
	for (const cc of cityCats) {
		const tagId = tagMap.get(cc.category_id);
		if (tagId) {
			await prisma.$executeRaw`
        INSERT INTO city_tag (id, city_id, tag_id)
        VALUES (gen_random_uuid(), ${cc.city_id}, ${tagId})
        ON CONFLICT (city_id, tag_id) DO NOTHING
      `;
		}
	}
	console.log(`  Migrated ${cityCats.length} city_tag entries`);

	// account_interest
	const interests = await prisma.$queryRaw<
		{ account_id: string; category_id: string }[]
	>`
    SELECT account_id, category_id FROM account_interest
  `;
	for (const ai of interests) {
		const tagId = tagMap.get(ai.category_id);
		if (tagId) {
			await prisma.$executeRaw`
        INSERT INTO account_interest (id, account_id, tag_id)
        VALUES (gen_random_uuid(), ${ai.account_id}, ${tagId})
        ON CONFLICT (account_id, tag_id) DO NOTHING
      `;
		}
	}
	console.log(`  Migrated ${interests.length} account_interest entries`);

	// 5. Drop old tables
	await prisma.$executeRaw`DROP TABLE IF EXISTS account_interest CASCADE`;
	await prisma.$executeRaw`DROP TABLE IF EXISTS city_category CASCADE`;
	await prisma.$executeRaw`DROP TABLE IF EXISTS event_category CASCADE`;
	await prisma.$executeRaw`DROP TABLE IF EXISTS business_category CASCADE`;
	await prisma.$executeRaw`DROP TABLE IF EXISTS category CASCADE`;
	await prisma.$executeRaw`DROP TYPE IF EXISTS entity_category CASCADE`;

	console.log('  Dropped old category tables and enum');

	console.log('✅ Migration complete!');
}

main()
	.then(async () => {
		await prisma.$disconnect();
		await pool.end();
	})
	.catch(async (e) => {
		console.error('❌ Migration failed:', e);
		await prisma.$disconnect();
		await pool.end();
		process.exit(1);
	});
```

- [ ] **Step 2: Run migration**

```bash
npx tsx prisma/migrations/convert-categories-to-tags.ts
```

Expected: All categories migrated, old tables dropped.

- [ ] **Step 3: Run Prisma migration to sync schema**

```bash
pnpm db:migrate:dev --name convert_categories_to_tags
```

Expected: Migration created successfully.

- [ ] **Step 4: Commit**

```bash
git add prisma/migrations/
git commit -m "feat(migration): convert categories to tag_group + tag"
```

---

### Task 3: Seed Data — Restructure for Tags

**Covers:** Seeding

**Files:**

- Create: `prisma/seed-data/tags-companies.json`
- Create: `prisma/seed-data/tags-events.json`
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Create company tags seed data**

Convert `companies-categories.json` to new format. The JSON structure changes from:

```json
{
	"name": "Restaurantes",
	"parent": "Alimentação e Bebidas",
	"entities": ["business"]
}
```

To:

```json
{ "group": "Alimentação e Bebidas", "tags": ["Restaurantes", "Lanchonetes", ...] }
```

Write `prisma/seed-data/tags-companies.json`:

```json
{
	"groups": [
		{
			"name": "Comércio",
			"tags": [
				"Supermercados e mercantis",
				"Lojas de roupas e calçados",
				"Farmácias e drogarias",
				"Lojas de eletrônicos",
				"Materiais de construção",
				"Papelarias e livrarias",
				"Lojas de móveis",
				"Floriculturas",
				"Lojas agropecuárias"
			]
		},
		{
			"name": "Alimentação e Bebidas",
			"tags": [
				"Restaurantes",
				"Lanchonetes",
				"Bares e pubs",
				"Pizzarias",
				"Cafeterias",
				"Sorveterias",
				"Docerias e confeitarias",
				"Food trucks",
				"Produtores artesanais"
			]
		},
		{
			"name": "Turismo e Hospitalidade",
			"tags": [
				"Hotéis",
				"Pousadas",
				"Hostels",
				"Chalés",
				"Guias turísticos",
				"Agências de turismo",
				"Turismo rural",
				"Ecoturismo",
				"Experiências locais"
			]
		},
		{
			"name": "Cultura, Lazer e Entretenimento",
			"tags": [
				"Casas de eventos",
				"Produtoras culturais",
				"Espaços culturais",
				"Teatros",
				"Estúdios artísticos",
				"Artesãos",
				"Parques e atrações turísticas",
				"Espaços de lazer"
			]
		},
		{
			"name": "Saúde e Bem-estar",
			"tags": [
				"Clínicas médicas",
				"Consultórios odontológicos",
				"Laboratórios",
				"Farmácias",
				"Clínicas veterinárias",
				"Academias",
				"Estúdios de pilates/yoga",
				"Spas e estética",
				"Terapias alternativas"
			]
		},
		{
			"name": "Serviços Gerais",
			"tags": [
				"Oficinas mecânicas",
				"Serviços elétricos",
				"Serviços hidráulicos",
				"Manutenção predial",
				"Limpeza e conservação",
				"Segurança privada",
				"Transportadoras",
				"Serviços funerários"
			]
		},
		{
			"name": "Educação e Capacitação",
			"tags": [
				"Escolas",
				"Faculdades",
				"Cursos técnicos",
				"Cursos profissionalizantes",
				"Idiomas",
				"Reforço escolar",
				"Treinamentos corporativos",
				"Autoescolas"
			]
		},
		{
			"name": "Serviços Profissionais",
			"tags": [
				"Contabilidade",
				"Advocacia",
				"Consultoria empresarial",
				"Recursos humanos",
				"Marketing e publicidade",
				"Design gráfico",
				"Tecnologia da informação",
				"Desenvolvimento de software",
				"Fotografia e audiovisual"
			]
		},
		{
			"name": "Indústria e Produção",
			"tags": [
				"Indústrias alimentícias",
				"Fábricas",
				"Agroindústrias",
				"Confecções",
				"Marcenarias",
				"Metalúrgicas",
				"Produção artesanal",
				"Cooperativas"
			]
		},
		{
			"name": "Agronegócio e Economia Rural",
			"tags": [
				"Produtores rurais",
				"Cooperativas agrícolas",
				"Floricultura",
				"Cafeicultura",
				"Hortifruti",
				"Avicultura",
				"Apicultura",
				"Viveiros",
				"Associações rurais"
			]
		},
		{
			"name": "Financeiro e Imobiliário",
			"tags": [
				"Bancos",
				"Cooperativas de crédito",
				"Correspondentes bancários",
				"Imobiliárias",
				"Corretores de imóveis",
				"Seguradoras",
				"Consórcios"
			]
		},
		{
			"name": "Institucional e Terceiro Setor",
			"tags": [
				"Associações",
				"ONGs",
				"Cooperativas",
				"Sindicatos",
				"Instituições religiosas",
				"Fundações",
				"Entidades culturais"
			]
		}
	]
}
```

- [ ] **Step 2: Create event tags seed data**

Write `prisma/seed-data/tags-events.json`:

```json
{
	"groups": [
		{
			"name": "Eventos Abertos ao Público",
			"tags": [
				"Shows e apresentações",
				"Festivais",
				"Feiras e exposições",
				"Eventos gastronômicos",
				"Eventos culturais",
				"Eventos esportivos"
			]
		},
		{
			"name": "Eventos Corporativos",
			"tags": [
				"Palestras",
				"Workshops",
				"Treinamentos",
				"Congressos",
				"Encontros empresariais"
			]
		},
		{
			"name": "Eventos Comerciais",
			"tags": [
				"Ações Promocionais",
				"Inaugurações",
				"Lançamentos de produtos",
				"Liquidações especiais",
				"Datas comemorativas"
			]
		}
	]
}
```

- [ ] **Step 3: Update seed.ts to use new tag models**

Replace the entire `main()` function and related types/helpers in `prisma/seed.ts`. Key changes:

1. Replace `CategoryEntry` interface with:

```typescript
interface TagGroupEntry {
	name: string;
	tags: string[];
}
```

2. Replace `CategoriesData` with:

```typescript
interface TagsData {
	groups: TagGroupEntry[];
}
```

3. Update `loadSeedData()` to load `tags-companies.json` and `tags-events.json`.

4. Replace the categories seeding section (step 1) with tag seeding:

```typescript
// ─── 1. TAGS ──────────────────────────────────────────────
console.log('\n🏷️  Seeding tags...');

const tagGroupMap = new Map<string, string>();
const tagMap = new Map<string, string>();

for (const group of data.tagGroups) {
	const created = await tx.tag_group.upsert({
		where: { name: group.name },
		update: {},
		create: { name: group.name },
	});
	tagGroupMap.set(created.name, created.id);

	for (let i = 0; i < group.tags.length; i++) {
		const tagName = group.tags[i];
		const slug = tagName
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

		const tag = await tx.tag.upsert({
			where: { slug },
			update: { group_id: created.id, position: i },
			create: {
				name: tagName,
				slug,
				group_id: created.id,
				position: i,
			},
		});
		tagMap.set(tagName, tag.id);
	}
}

console.log(
	`  ✅ ${tagGroupMap.size} tag groups, ${tagMap.size} tags processed.`,
);
```

5. Replace all `categoryMap` references with `tagMap` and update junction table upserts:
   - `business_category` → `business_tag` with `{ business_id, tag_id }`
   - `event_category` → `event_tag` with `{ event_id, tag_id }`
   - `city_category` → `city_tag` with `{ city_id, tag_id }`
   - `account_interest` → `{ account_id, tag_id }`

6. Update the `GeneralData` interfaces (`CityEntry`, `UserEntry`, `BusinessEntry`, `EventEntry`) — rename `categories: string[]` to `tags: string[]`.

7. Update the seed JSON files to use `tags` instead of `categories`.

- [ ] **Step 4: Run seed to verify**

```bash
pnpm db:seed
```

Expected: All tag groups, tags, and relationships seeded successfully.

- [ ] **Step 5: Commit**

```bash
git add prisma/seed-data/ prisma/seed.ts
git commit -m "feat(seed): restructure seed data for tag_group + tag model"
```

---

### Task 4: Tags Module — Entities and DTOs

**Covers:** API models, DTOs

**Files:**

- Create: `src/modules/tags/entities/tag.entity.ts`
- Create: `src/modules/tags/entities/tag-group.entity.ts`
- Create: `src/modules/tags/dto/create-tag.dto.ts`
- Create: `src/modules/tags/dto/update-tag.dto.ts`
- Create: `src/modules/tags/dto/create-tag-group.dto.ts`
- Create: `src/modules/tags/dto/update-tag-group.dto.ts`

- [ ] **Step 1: Create tag-group entity**

```typescript
// src/modules/tags/entities/tag-group.entity.ts
import { tag_group } from '@prisma/client';

export class TagGroup implements tag_group {
	id: string;
	name: string;
	description: string | null;
	created_at: Date;
	updated_at: Date;
}
```

- [ ] **Step 2: Create tag entity**

```typescript
// src/modules/tags/entities/tag.entity.ts
import { tag } from '@prisma/client';

export class Tag implements tag {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	color: string | null;
	group_id: string;
	position: number;
	created_at: Date;
	updated_at: Date;
}
```

- [ ] **Step 3: Create DTOs**

```typescript
// src/modules/tags/dto/create-tag-group.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTagGroupDto {
	@IsNotEmpty()
	@IsString()
	name: string;

	@IsOptional()
	@IsString()
	description?: string;
}
```

```typescript
// src/modules/tags/dto/update-tag-group.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateTagGroupDto } from './create-tag-group.dto';

export class UpdateTagGroupDto extends PartialType(CreateTagGroupDto) {}
```

```typescript
// src/modules/tags/dto/create-tag.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
	@IsNotEmpty()
	@IsString()
	name: string;

	@IsNotEmpty()
	@IsString()
	group_id: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	color?: string;

	@IsOptional()
	@IsInt()
	position?: number;
}
```

```typescript
// src/modules/tags/dto/update-tag.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateTagDto } from './create-tag.dto';

export class UpdateTagDto extends PartialType(CreateTagDto) {}
```

- [ ] **Step 4: Commit**

```bash
git add src/modules/tags/entities/ src/modules/tags/dto/
git commit -m "feat(tags): add tag and tag-group entities and DTOs"
```

---

### Task 5: Tags Module — Services

**Covers:** API services, search functionality

**Files:**

- Create: `src/modules/tags/tag-groups.service.ts`
- Create: `src/modules/tags/tags.service.ts`

- [ ] **Step 1: Write tag-groups.service.spec.ts (failing tests)**

```typescript
// src/modules/tags/__tests__/tag-groups.service.spec.ts
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { TagGroupsService } from '../tag-groups.service';

describe('TagGroupsService', () => {
	let service: TagGroupsService;
	let prisma: DeepMockProxy<PrismaService>;

	const mockTagGroup = {
		id: 'group-1',
		name: 'Comércio',
		description: null,
		created_at: new Date(),
		updated_at: new Date(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TagGroupsService,
				{ provide: PrismaService, useValue: mockDeep<PrismaService>() },
			],
		}).compile();

		service = module.get<TagGroupsService>(TagGroupsService);
		prisma = module.get(PrismaService);
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		it('should create a tag group', async () => {
			prisma.tag_group.create.mockResolvedValue(mockTagGroup);
			const result = await service.create({ name: 'Comércio' });
			expect(result).toEqual(mockTagGroup);
			expect(prisma.tag_group.create).toHaveBeenCalledWith({
				data: { name: 'Comércio' },
			});
		});
	});

	describe('findAll', () => {
		it('should return all tag groups', async () => {
			prisma.tag_group.findMany.mockResolvedValue([mockTagGroup]);
			const result = await service.findAll();
			expect(result).toEqual([mockTagGroup]);
		});
	});

	describe('findOne', () => {
		it('should return a tag group by id', async () => {
			prisma.tag_group.findUnique.mockResolvedValue(mockTagGroup);
			const result = await service.findOne('group-1');
			expect(result).toEqual(mockTagGroup);
		});

		it('should throw NotFoundException when not found', async () => {
			prisma.tag_group.findUnique.mockResolvedValue(null);
			await expect(service.findOne('non-existent')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('update', () => {
		it('should update a tag group', async () => {
			prisma.tag_group.findUnique.mockResolvedValue(mockTagGroup);
			prisma.tag_group.update.mockResolvedValue({
				...mockTagGroup,
				name: 'Updated',
			});
			const result = await service.update('group-1', { name: 'Updated' });
			expect(result.name).toBe('Updated');
		});
	});

	describe('remove', () => {
		it('should delete a tag group', async () => {
			prisma.tag_group.findUnique.mockResolvedValue(mockTagGroup);
			prisma.tag_group.delete.mockResolvedValue(mockTagGroup);
			const result = await service.remove('group-1');
			expect(result).toEqual(mockTagGroup);
		});
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test:unit -- --testPathPattern="tag-groups.service"
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement tag-groups.service.ts**

```typescript
// src/modules/tags/tag-groups.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { CreateTagGroupDto } from './dto/create-tag-group.dto';
import { UpdateTagGroupDto } from './dto/update-tag-group.dto';

@Injectable()
export class TagGroupsService {
	constructor(private readonly prismaService: PrismaService) {}

	create(dto: CreateTagGroupDto) {
		return this.prismaService.tag_group.create({ data: dto });
	}

	findAll() {
		return this.prismaService.tag_group.findMany({
			include: { tags: { orderBy: { position: 'asc' } } },
			orderBy: { name: 'asc' },
		});
	}

	async findOne(id: string) {
		const group = await this.prismaService.tag_group.findUnique({
			where: { id },
			include: { tags: { orderBy: { position: 'asc' } } },
		});
		if (!group) throw new NotFoundException();
		return group;
	}

	async update(id: string, dto: UpdateTagGroupDto) {
		await this.findOne(id);
		return this.prismaService.tag_group.update({ where: { id }, data: dto });
	}

	async remove(id: string) {
		await this.findOne(id);
		return this.prismaService.tag_group.delete({ where: { id } });
	}
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test:unit -- --testPathPattern="tag-groups.service"
```

Expected: PASS.

- [ ] **Step 5: Write tags.service.spec.ts (failing tests)**

```typescript
// src/modules/tags/__tests__/tags.service.spec.ts
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { TagsService } from '../tags.service';

describe('TagsService', () => {
	let service: TagsService;
	let prisma: DeepMockProxy<PrismaService>;

	const mockTag = {
		id: 'tag-1',
		name: 'Restaurantes',
		slug: 'restaurantes',
		description: null,
		color: null,
		group_id: 'group-1',
		position: 0,
		created_at: new Date(),
		updated_at: new Date(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TagsService,
				{ provide: PrismaService, useValue: mockDeep<PrismaService>() },
			],
		}).compile();

		service = module.get<TagsService>(TagsService);
		prisma = module.get(PrismaService);
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		it('should create a tag', async () => {
			prisma.tag.create.mockResolvedValue(mockTag);
			const result = await service.create({
				name: 'Restaurantes',
				group_id: 'group-1',
			});
			expect(result).toEqual(mockTag);
		});
	});

	describe('findAll', () => {
		it('should return all tags', async () => {
			prisma.tag.findMany.mockResolvedValue([mockTag]);
			const result = await service.findAll();
			expect(result).toEqual([mockTag]);
		});

		it('should filter by group_id', async () => {
			prisma.tag.findMany.mockResolvedValue([mockTag]);
			await service.findAll({ group_id: 'group-1' });
			expect(prisma.tag.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({ group_id: 'group-1' }),
				}),
			);
		});
	});

	describe('search', () => {
		it('should search tags by name', async () => {
			prisma.tag.findMany.mockResolvedValue([mockTag]);
			const result = await service.search('Restaur');
			expect(result).toEqual([mockTag]);
			expect(prisma.tag.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						name: expect.objectContaining({
							contains: 'Restaur',
							mode: 'insensitive',
						}),
					}),
				}),
			);
		});
	});

	describe('findOne', () => {
		it('should return a tag by id', async () => {
			prisma.tag.findUnique.mockResolvedValue(mockTag);
			const result = await service.findOne('tag-1');
			expect(result).toEqual(mockTag);
		});

		it('should throw NotFoundException', async () => {
			prisma.tag.findUnique.mockResolvedValue(null);
			await expect(service.findOne('non-existent')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('update', () => {
		it('should update a tag', async () => {
			prisma.tag.findUnique.mockResolvedValue(mockTag);
			prisma.tag.update.mockResolvedValue({ ...mockTag, name: 'Updated' });
			const result = await service.update('tag-1', { name: 'Updated' });
			expect(result.name).toBe('Updated');
		});
	});

	describe('remove', () => {
		it('should delete a tag', async () => {
			prisma.tag.findUnique.mockResolvedValue(mockTag);
			prisma.tag.delete.mockResolvedValue(mockTag);
			const result = await service.remove('tag-1');
			expect(result).toEqual(mockTag);
		});
	});
});
```

- [ ] **Step 6: Run tests to verify they fail**

```bash
pnpm test:unit -- --testPathPattern="tags.service"
```

Expected: FAIL (module not found).

- [ ] **Step 7: Implement tags.service.ts**

```typescript
// src/modules/tags/tags.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
	constructor(private readonly prismaService: PrismaService) {}

	private slugify(name: string): string {
		return name
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	create(dto: CreateTagDto) {
		return this.prismaService.tag.create({
			data: {
				name: dto.name,
				slug: this.slugify(dto.name),
				group_id: dto.group_id,
				description: dto.description,
				color: dto.color,
				position: dto.position ?? 0,
			},
		});
	}

	findAll(filters?: { group_id?: string; name?: string }) {
		return this.prismaService.tag.findMany({
			where: {
				...(filters?.group_id && { group_id: filters.group_id }),
				...(filters?.name && {
					name: { contains: filters.name, mode: 'insensitive' },
				}),
			},
			include: { group: true },
			orderBy: [{ group: { name: 'asc' } }, { position: 'asc' }],
		});
	}

	search(query: string) {
		return this.prismaService.tag.findMany({
			where: {
				name: { contains: query, mode: 'insensitive' },
			},
			include: { group: true },
			orderBy: { name: 'asc' },
		});
	}

	async findOne(id: string) {
		const tag = await this.prismaService.tag.findUnique({
			where: { id },
			include: { group: true },
		});
		if (!tag) throw new NotFoundException();
		return tag;
	}

	async findBySlug(slug: string) {
		const tag = await this.prismaService.tag.findUnique({
			where: { slug },
			include: { group: true },
		});
		if (!tag) throw new NotFoundException();
		return tag;
	}

	async update(id: string, dto: UpdateTagDto) {
		await this.findOne(id);
		return this.prismaService.tag.update({
			where: { id },
			data: {
				...dto,
				...(dto.name && { slug: this.slugify(dto.name) }),
			},
		});
	}

	async remove(id: string) {
		await this.findOne(id);
		return this.prismaService.tag.delete({ where: { id } });
	}
}
```

- [ ] **Step 8: Run tests to verify they pass**

```bash
pnpm test:unit -- --testPathPattern="tags.service"
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/modules/tags/
git commit -m "feat(tags): implement TagGroupsService and TagsService with tests"
```

---

### Task 6: Tags Module — Controller and Module

**Covers:** API routes

**Files:**

- Create: `src/modules/tags/tags.controller.ts`
- Create: `src/modules/tags/tags.module.ts`

- [ ] **Step 1: Write tags.controller.spec.ts (failing tests)**

```typescript
// src/modules/tags/__tests__/tags.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TagsController } from '../tags.controller';
import { TagsService } from '../tags.service';
import { TagGroupsService } from '../tag-groups.service';

describe('TagsController', () => {
	let controller: TagsController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [TagsController],
			providers: [
				{
					provide: TagsService,
					useValue: {
						create: jest.fn(),
						findAll: jest.fn(),
						search: jest.fn(),
						findOne: jest.fn(),
						update: jest.fn(),
						remove: jest.fn(),
					},
				},
				{
					provide: TagGroupsService,
					useValue: {
						create: jest.fn(),
						findAll: jest.fn(),
						findOne: jest.fn(),
						update: jest.fn(),
						remove: jest.fn(),
					},
				},
			],
		}).compile();

		controller = module.get<TagsController>(TagsController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test:unit -- --testPathPattern="tags.controller"
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement tags.controller.ts**

```typescript
// src/modules/tags/tags.controller.ts
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
} from '@nestjs/swagger';
import { Public } from 'src/modules/common/decorators/public.decorator';

import { CreateTagDto } from './dto/create-tag.dto';
import { CreateTagGroupDto } from './dto/create-tag-group.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { UpdateTagGroupDto } from './dto/update-tag-group.dto';
import { Tag } from './entities/tag.entity';
import { TagGroup } from './entities/tag-group.entity';
import { TagGroupsService } from './tag-groups.service';
import { TagsService } from './tags.service';

@Controller({ path: 'tags', version: '1' })
export class TagsController {
	constructor(
		private readonly tagsService: TagsService,
		private readonly tagGroupsService: TagGroupsService,
	) {}

	// ─── TAG GROUPS ─────────────────────────────────────────

	@ApiOperation({ summary: 'Lista todos os grupos de tags' })
	@ApiResponse({ status: 200, type: TagGroup, isArray: true })
	@Public()
	@Get('/groups')
	findAllGroups() {
		return this.tagGroupsService.findAll();
	}

	@ApiOperation({ summary: 'Obtém um grupo de tags por ID' })
	@ApiParam({ name: 'id', description: 'UUID do grupo', required: true })
	@ApiResponse({ status: 200, type: TagGroup })
	@ApiResponse({ status: 404, description: 'Grupo não encontrado' })
	@Public()
	@Get('/groups/:id')
	findOneGroup(@Param('id') id: string) {
		return this.tagGroupsService.findOne(id);
	}

	@ApiBearerAuth()
	@ApiOperation({ summary: 'Cria um grupo de tags' })
	@ApiBody({ type: CreateTagGroupDto, required: true })
	@ApiResponse({ status: 201, type: TagGroup })
	@Post('/groups')
	createGroup(@Body() dto: CreateTagGroupDto) {
		return this.tagGroupsService.create(dto);
	}

	@ApiBearerAuth()
	@ApiOperation({ summary: 'Atualiza um grupo de tags' })
	@ApiParam({ name: 'id', description: 'UUID do grupo', required: true })
	@ApiBody({ type: UpdateTagGroupDto })
	@ApiResponse({ status: 200, type: TagGroup })
	@Patch('/groups/:id')
	updateGroup(@Param('id') id: string, @Body() dto: UpdateTagGroupDto) {
		return this.tagGroupsService.update(id, dto);
	}

	@ApiBearerAuth()
	@ApiOperation({ summary: 'Deleta um grupo de tags' })
	@ApiParam({ name: 'id', description: 'UUID do grupo', required: true })
	@ApiResponse({ status: 200 })
	@Delete('/groups/:id')
	removeGroup(@Param('id') id: string) {
		return this.tagGroupsService.remove(id);
	}

	// ─── TAGS ───────────────────────────────────────────────

	@ApiOperation({ summary: 'Busca tags por nome' })
	@ApiQuery({ name: 'q', description: 'Termo de busca', required: true })
	@ApiResponse({ status: 200, type: Tag, isArray: true })
	@Public()
	@Get('/search')
	search(@Query('q') query: string) {
		return this.tagsService.search(query);
	}

	@ApiOperation({ summary: 'Lista todas as tags' })
	@ApiResponse({ status: 200, type: Tag, isArray: true })
	@ApiQuery({
		name: 'group_id',
		required: false,
		description: 'Filtrar por grupo',
	})
	@ApiQuery({ name: 'name', required: false, description: 'Filtrar por nome' })
	@Public()
	@Get()
	findAll(@Query('group_id') groupId?: string, @Query('name') name?: string) {
		return this.tagsService.findAll({ group_id: groupId, name });
	}

	@ApiOperation({ summary: 'Obtém uma tag por ID' })
	@ApiParam({ name: 'id', description: 'UUID da tag', required: true })
	@ApiResponse({ status: 200, type: Tag })
	@Public()
	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.tagsService.findOne(id);
	}

	@ApiBearerAuth()
	@ApiOperation({ summary: 'Cria uma tag' })
	@ApiBody({ type: CreateTagDto, required: true })
	@ApiResponse({ status: 201, type: Tag })
	@Post()
	create(@Body() dto: CreateTagDto) {
		return this.tagsService.create(dto);
	}

	@ApiBearerAuth()
	@ApiOperation({ summary: 'Atualiza uma tag' })
	@ApiParam({ name: 'id', description: 'UUID da tag', required: true })
	@ApiBody({ type: UpdateTagDto })
	@ApiResponse({ status: 200, type: Tag })
	@Patch(':id')
	update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
		return this.tagsService.update(id, dto);
	}

	@ApiBearerAuth()
	@ApiOperation({ summary: 'Deleta uma tag' })
	@ApiParam({ name: 'id', description: 'UUID da tag', required: true })
	@ApiResponse({ status: 200 })
	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.tagsService.remove(id);
	}
}
```

- [ ] **Step 4: Implement tags.module.ts**

```typescript
// src/modules/tags/tags.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/common/prisma/prisma.module';

import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { TagGroupsService } from './tag-groups.service';

@Module({
	imports: [PrismaModule],
	controllers: [TagsController],
	providers: [TagsService, TagGroupsService],
	exports: [TagsService, TagGroupsService],
})
export class TagsModule {}
```

- [ ] **Step 5: Run controller tests**

```bash
pnpm test:unit -- --testPathPattern="tags.controller"
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/modules/tags/tags.controller.ts src/modules/tags/tags.module.ts src/modules/tags/__tests__/
git commit -m "feat(tags): add TagsController and TagsModule with routes"
```

---

### Task 7: Update Consumers — Businesses, Events, Cities, Accounts

**Covers:** All consumer modules

**Files:**

- Modify: `src/modules/businesses/businesses.service.ts`
- Modify: `src/modules/businesses/entities/business.entity.ts`
- Modify: `src/modules/events/events.service.ts`
- Modify: `src/modules/cities/cities.service.ts`
- Modify: `src/modules/accounts/account-interests.service.ts`
- Modify: `src/modules/accounts/accounts.service.ts`
- Modify: `src/modules/app/app.module.ts`

- [ ] **Step 1: Update businesses.service.ts**

Replace category references with tag references:

```typescript
// In businesses.service.ts, replace the select and map:
// OLD:
categories: { select: { category: { select: { name: true } } } },
// ...
categories: business.categories.map((c) => c.category.name),

// NEW:
tags: { select: { tag: { select: { name: true } } } },
// ...
tags: business.tags.map((t) => t.tag.name),
```

- [ ] **Step 2: Update businesses.entity.ts**

```typescript
// Replace:
import { Category } from 'src/modules/categories/entities/category.entity';
// ...
categories?: Category[] | null;

// With:
import { Tag } from 'src/modules/tags/entities/tag.entity';
// ...
tags?: Tag[] | null;
```

- [ ] **Step 3: Update business-response-dto.ts**

```typescript
// Replace:
@Transform(({ obj }) => obj.categories?.map((c) => c.category.name) || [])
categories: string[];

// With:
@Transform(({ obj }) => obj.tags?.map((t) => t.tag.name) || [])
tags: string[];
```

- [ ] **Step 4: Update events.service.ts**

Replace all `category` references with `tag` references:

```typescript
// Replace:
categories: { select: { category: { select: { name: true } } } },
categories: e.categories.map((cat) => cat.category.name),

// With:
tags: { select: { tag: { select: { name: true } } } },
tags: e.tags.map((t) => t.tag.name),
```

- [ ] **Step 5: Update cities.service.ts**

Replace the raw SQL category join:

```sql
-- OLD:
JOIN category cat ON cat.id = cc."category_id"

-- NEW:
JOIN tag t ON t.id = ct."tag_id"
```

Also rename `cc` alias to `ct` and update the JSON aggregation to reference tags.

- [ ] **Step 6: Update account-interests.service.ts**

Replace all `category` references with `tag`:

```typescript
// Replace:
include: { category: { select: { id: true, name: true, entities: true } } },
// ...
const categories = interest.category as unknown as InterestCategory;

// With:
include: { tag: { include: { group: true } } },
// ...
// Update the entity-based grouping logic to use tag.group or a new approach
```

Note: The `entities` field no longer exists on tags. The interests service needs to be updated to group by tag group or remove the entity-based grouping. Since the `entity_category` enum is removed, update the logic to use `tag.group.name` or similar.

- [ ] **Step 7: Register TagsModule in app.module.ts**

```typescript
// In app.module.ts, add:
import { TagsModule } from './modules/tags/tags.module';

// In the imports array:
TagsModule,
```

Remove the old `CategoriesModule` import.

- [ ] **Step 8: Delete old categories module**

```bash
rm -rf src/modules/categories/
```

- [ ] **Step 9: Run all tests**

```bash
pnpm test:unit
```

Expected: All tests pass.

- [ ] **Step 10: Run typecheck**

```bash
pnpm build
```

Expected: No type errors.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: update all consumers to use tags instead of categories"
```

---

### Task 8: Verify and Clean Up

**Covers:** Verification, cleanup

**Files:**

- Modify: various (cleanup)

- [ ] **Step 1: Run full test suite**

```bash
pnpm test:unit
```

Expected: All tests pass.

- [ ] **Step 2: Run lint**

```bash
pnpm lint
```

Expected: No errors.

- [ ] **Step 3: Run build**

```bash
pnpm build
```

Expected: Build succeeds.

- [ ] **Step 4: Verify seed works with clean DB**

```bash
pnpm db:seed
```

Expected: All data seeded successfully.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete categories to tags migration"
```
