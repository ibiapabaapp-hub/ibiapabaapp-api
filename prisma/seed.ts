import * as fs from 'fs';
import * as path from 'path';

import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ——— TIPOS ———————————————————————————————————————————————————————————————————

interface CategoryEntry {
	name: string;
	parent: string | null;
	entities: string[];
}

interface CityEntry {
	name: string;
	slug: string;
	description: string;
	lat: number;
	lng: number;
	cover_img_url: string;
	categories: string[];
}

interface UserEntry {
	name: string;
	username: string;
	email: string;
	phone_number: string;
	password: string;
	birth_date: string;
	role: string;
	interests: string[];
}

interface BusinessCityRef {
	slug: string;
	is_headquarter: boolean;
	adress_specific: string;
}

interface BusinessUserRef {
	email: string;
	role: string;
}

interface MediaEntry {
	media_type: 'image' | 'video';
	url: string;
	is_cover: boolean;
	alt_text?: string;
}

interface BusinessEntry {
	name: string;
	slug: string;
	description: string;
	cnpj: string;
	max_reach_level: 'local' | 'regional';
	active: boolean;
	cover_img_url: string;
	categories: string[];
	cities: BusinessCityRef[];
	users: BusinessUserRef[];
	medias: MediaEntry[];
}

interface EventCityRef {
	slug: string;
	adress_specific: string;
}

interface EventEntry {
	name: string;
	slug: string;
	description: string;
	cover_img_url: string;
	reach_level: 'local' | 'regional';
	type: 'simple' | 'featured';
	start_date: string;
	end_date: string;
	active: boolean;
	business_slug: string | null;
	user_email: string | null;
	categories: string[];
	cities: EventCityRef[];
	medias: MediaEntry[];
}

interface LeadEntry {
	name: string;
	email: string;
	phone_number: string;
	type: 'resident' | 'tourist' | 'business';
	business_name: string | null;
}

interface GeneralData {
	cities: CityEntry[];
	users: UserEntry[];
	businesses: BusinessEntry[];
	events: EventEntry[];
	leads: LeadEntry[];
}

interface CategoriesData {
	categories: CategoryEntry[];
}

// ——— HELPERS —————————————————————————————————————————————————————————————————

function loadJsonFile<T>(filePath: string): T {
	const data = fs.readFileSync(filePath, 'utf-8');
	return JSON.parse(data) as T;
}

function loadSeedData() {
	const seedDataDir = path.join(__dirname, 'seed-data');

	const generalData = loadJsonFile<GeneralData>(
		path.join(seedDataDir, 'general-data.json'),
	);

	const companiesCategories = loadJsonFile<CategoriesData>(
		path.join(seedDataDir, 'companies-categories.json'),
	);

	const eventsCategories = loadJsonFile<CategoriesData>(
		path.join(seedDataDir, 'events-categories.json'),
	);

	return {
		categories: [
			...companiesCategories.categories,
			...eventsCategories.categories,
		],
		...generalData,
	};
}

async function hashPassword(password: string): Promise<string> {
	return argon2.hash(password);
}

// ——— MAIN ————————————————————————————————————————————————————————————————————

async function main() {
	console.log('🌱 Carregando dados de seed...');
	const data = loadSeedData();
	console.log('✅ Dados carregados.');

	await prisma.$transaction(
		async (tx: Prisma.TransactionClient) => {
			// ─── 1. CATEGORIAS ──────────────────────────────────────────────

			console.log('\n🏷️  Seeding categorias...');

			// Mapa name -> id para resolver parent_id e lookups posteriores
			const categoryMap = new Map<string, string>();

			// Primeira passagem: categorias raiz (sem parent)
			for (const cat of data.categories.filter((c) => c.parent === null)) {
				const created = await tx.category.upsert({
					where: { name: cat.name },
					update: { entities: cat.entities as any[] },
					create: {
						name: cat.name,
						entities: cat.entities as any[],
					},
				});
				categoryMap.set(created.name, created.id);
			}

			// Segunda passagem: categorias filhas
			for (const cat of data.categories.filter((c) => c.parent !== null)) {
				const parentId = categoryMap.get(cat.parent!);
				if (!parentId) {
					console.warn(
						`  ⚠️  Parent "${cat.parent}" não encontrado para "${cat.name}". Pulando.`,
					);
					continue;
				}

				const created = await tx.category.upsert({
					where: { name: cat.name },
					update: {
						entities: cat.entities as any[],
						parent_id: parentId,
					},
					create: {
						name: cat.name,
						entities: cat.entities as any[],
						parent_id: parentId,
					},
				});
				categoryMap.set(created.name, created.id);
			}

			console.log(`  ✅ ${categoryMap.size} categorias processadas.`);

			// ─── 2. CIDADES ─────────────────────────────────────────────────

			console.log('\n🏙️  Seeding cidades...');

			const cityMap = new Map<string, string>(); // slug -> id

			for (const cityData of data.cities) {
				// city tem campo Unsupported("geometry"), então create/upsert não existem no tipo.
				// Usamos raw SQL para insert/update + location em uma só operação.
				await tx.$executeRaw`
					INSERT INTO city (id, slug, name, description, cover_img_url, location, created_at, updated_at)
					VALUES (
						gen_random_uuid(),
						${cityData.slug},
						${cityData.name},
						${cityData.description},
						${cityData.cover_img_url},
						ST_SetSRID(ST_MakePoint(${cityData.lng}, ${cityData.lat}), 4326),
						now(),
						now()
					)
					ON CONFLICT (slug) DO UPDATE SET
						name         = EXCLUDED.name,
						description  = EXCLUDED.description,
						cover_img_url = EXCLUDED.cover_img_url,
						location     = EXCLUDED.location,
						updated_at   = now()
				`;

				// Busca o id gerado para usar nos relacionamentos
				const rows = await tx.$queryRaw<{ id: string }[]>`
					SELECT id FROM city WHERE slug = ${cityData.slug}
				`;
				const cityId = rows[0]?.id;
				if (!cityId) {
					console.warn(
						`  ⚠️  Falha ao recuperar id da cidade "${cityData.slug}". Pulando categorias.`,
					);
					continue;
				}

				cityMap.set(cityData.slug, cityId);

				// Categorias da cidade
				for (const catName of cityData.categories) {
					const catId = categoryMap.get(catName);
					if (!catId) {
						console.warn(
							`  ⚠️  Categoria "${catName}" não encontrada para cidade "${cityData.name}".`,
						);
						continue;
					}

					await tx.city_category.upsert({
						where: {
							city_id_category_id: {
								city_id: cityId,
								category_id: catId,
							},
						},
						update: {},
						create: { city_id: cityId, category_id: catId },
					});
				}
			}

			console.log(`  ✅ ${cityMap.size} cidades processadas.`);

			// ─── 3. CONTAS DE USUÁRIO (users → account + profile pessoal) ───

			console.log('\n👤 Seeding usuários...');

			// email -> account id
			const accountMap = new Map<string, string>();

			for (const userData of data.users) {
				const hashedPassword = await hashPassword(userData.password);

				// Cria account
				const account = await tx.account.upsert({
					where: { email: userData.email },
					update: {
						name: userData.name,
						password: hashedPassword,
						phone_number: userData.phone_number,
						is_verified: true,
					},
					create: {
						name: userData.name,
						email: userData.email,
						password: hashedPassword,
						phone_number: userData.phone_number,
						is_verified: true,
					},
				});

				accountMap.set(userData.email, account.id);

				// Cria perfil pessoal
				const profile = await tx.profile.upsert({
					where: { slug: userData.username },
					update: { display_name: userData.name },
					create: {
						slug: userData.username,
						display_name: userData.name,
						type: 'personal',
					},
				});

				// Vincula conta ao perfil
				await tx.account_profile.upsert({
					where: {
						account_id_profile_id: {
							account_id: account.id,
							profile_id: profile.id,
						},
					},
					update: {},
					create: {
						account_id: account.id,
						profile_id: profile.id,
						role: 'owner',
					},
				});

				// Interesses do usuário
				for (const interestName of userData.interests) {
					const catId = categoryMap.get(interestName);
					if (!catId) {
						console.warn(
							`  ⚠️  Categoria de interesse "${interestName}" não encontrada para usuário "${userData.email}".`,
						);
						continue;
					}

					await tx.profile_interest.upsert({
						where: {
							profile_id_category_id: {
								profile_id: profile.id,
								category_id: catId,
							},
						},
						update: {},
						create: { profile_id: profile.id, category_id: catId },
					});
				}
			}

			console.log(`  ✅ ${accountMap.size} contas de usuário processadas.`);

			// ─── 4. BUSINESSES ──────────────────────────────────────────────

			console.log('\n🏢 Seeding empresas...');

			// slug -> profile id do business
			const businessProfileMap = new Map<string, string>();

			for (const bizData of data.businesses) {
				// Cria perfil do tipo business
				const profile = await tx.profile.upsert({
					where: { slug: bizData.slug },
					update: {
						display_name: bizData.name,
						bio: bizData.description,
					},
					create: {
						slug: bizData.slug,
						display_name: bizData.name,
						bio: bizData.description,
						type: 'business',
					},
				});

				businessProfileMap.set(bizData.slug, profile.id);

				// Cria registro business
				const business = await tx.business.upsert({
					where: { profile_id: profile.id },
					update: {
						cnpj: bizData.cnpj,
						max_reach_level: bizData.max_reach_level,
					},
					create: {
						profile_id: profile.id,
						cnpj: bizData.cnpj,
						max_reach_level: bizData.max_reach_level,
					},
				});

				// Vincula usuários ao perfil do business
				for (const userRef of bizData.users) {
					const accountId = accountMap.get(userRef.email);
					if (!accountId) {
						console.warn(
							`  ⚠️  Conta "${userRef.email}" não encontrada para business "${bizData.slug}".`,
						);
						continue;
					}

					await tx.account_profile.upsert({
						where: {
							account_id_profile_id: {
								account_id: accountId,
								profile_id: profile.id,
							},
						},
						update: { role: userRef.role as any },
						create: {
							account_id: accountId,
							profile_id: profile.id,
							role: userRef.role as any,
						},
					});
				}

				// Categorias do business
				for (const catName of bizData.categories) {
					const catId = categoryMap.get(catName);
					if (!catId) {
						console.warn(
							`  ⚠️  Categoria "${catName}" não encontrada para business "${bizData.slug}".`,
						);
						continue;
					}

					await tx.business_category.upsert({
						where: {
							business_id_category_id: {
								business_id: business.id,
								category_id: catId,
							},
						},
						update: {},
						create: {
							business_id: business.id,
							category_id: catId,
						},
					});
				}

				// Cidades do business
				for (const cityRef of bizData.cities) {
					const cityId = cityMap.get(cityRef.slug);
					if (!cityId) {
						console.warn(
							`  ⚠️  Cidade "${cityRef.slug}" não encontrada para business "${bizData.slug}".`,
						);
						continue;
					}

					// business_city não tem unique composta no schema, usa firstOrCreate via findFirst
					const existing = await tx.business_city.findFirst({
						where: {
							business_id: business.id,
							city_id: cityId,
						},
					});

					if (!existing) {
						await tx.business_city.create({
							data: {
								business_id: business.id,
								city_id: cityId,
								is_headquarter: cityRef.is_headquarter,
								address_specific: cityRef.adress_specific,
							},
						});
					}
				}

				// Mídias do business (vinculadas ao profile)
				for (const media of bizData.medias) {
					await tx.media.create({
						data: {
							profile_id: profile.id,
							media_type: media.media_type,
							url: media.url,
							is_cover: media.is_cover,
						},
					});
				}
			}

			console.log(`  ✅ ${businessProfileMap.size} businesses processados.`);

			// ─── 5. EVENTOS ─────────────────────────────────────────────────

			console.log('\n🎉 Seeding eventos...');

			let eventCount = 0;

			for (const evData of data.events) {
				// Determina o owner: business profile ou user profile
				let ownerProfileId: string | undefined;

				if (evData.business_slug) {
					ownerProfileId = businessProfileMap.get(evData.business_slug);
					if (!ownerProfileId) {
						console.warn(
							`  ⚠️  Business "${evData.business_slug}" não encontrado para evento "${evData.slug}". Pulando.`,
						);
						continue;
					}
				} else if (evData.user_email) {
					// Busca o perfil pessoal do usuário pelo slug (username)
					const userData = data.users.find(
						(u) => u.email === evData.user_email,
					);
					if (!userData) {
						console.warn(
							`  ⚠️  Usuário "${evData.user_email}" não encontrado para evento "${evData.slug}". Pulando.`,
						);
						continue;
					}
					const profile = await tx.profile.findUnique({
						where: { slug: userData.username },
					});
					ownerProfileId = profile?.id;
				}

				if (!ownerProfileId) {
					console.warn(
						`  ⚠️  Owner não resolvido para evento "${evData.slug}". Pulando.`,
					);
					continue;
				}

				const event = await tx.event.upsert({
					where: { slug: evData.slug },
					update: {
						name: evData.name,
						description: evData.description,
						cover_img_url: evData.cover_img_url,
						reach_level: evData.reach_level,
						type: evData.type,
						start_date: new Date(evData.start_date),
						end_date: new Date(evData.end_date),
						active: evData.active,
					},
					create: {
						slug: evData.slug,
						owner_profile_id: ownerProfileId,
						name: evData.name,
						description: evData.description,
						cover_img_url: evData.cover_img_url,
						reach_level: evData.reach_level,
						type: evData.type,
						start_date: new Date(evData.start_date),
						end_date: new Date(evData.end_date),
						active: evData.active,
					},
				});

				// Categorias do evento
				for (const catName of evData.categories) {
					const catId = categoryMap.get(catName);
					if (!catId) {
						console.warn(
							`  ⚠️  Categoria "${catName}" não encontrada para evento "${evData.slug}".`,
						);
						continue;
					}

					await tx.event_category.upsert({
						where: {
							event_id_category_id: {
								event_id: event.id,
								category_id: catId,
							},
						},
						update: {},
						create: { event_id: event.id, category_id: catId },
					});
				}

				// Cidades do evento
				for (const cityRef of evData.cities) {
					const cityId = cityMap.get(cityRef.slug);
					if (!cityId) {
						console.warn(
							`  ⚠️  Cidade "${cityRef.slug}" não encontrada para evento "${evData.slug}".`,
						);
						continue;
					}

					const existing = await tx.event_city.findFirst({
						where: { event_id: event.id, city_id: cityId },
					});

					if (!existing) {
						await tx.event_city.create({
							data: {
								event_id: event.id,
								city_id: cityId,
								address_specific: cityRef.adress_specific,
							},
						});
					}
				}

				// Mídias do evento
				for (const media of evData.medias) {
					await tx.media.create({
						data: {
							event_id: event.id,
							media_type: media.media_type,
							url: media.url,
							is_cover: media.is_cover,
						},
					});
				}

				eventCount++;
			}

			console.log(`  ✅ ${eventCount} eventos processados.`);

			// ─── 6. LEADS ───────────────────────────────────────────────────

			console.log('\n📋 Seeding leads...');

			for (const leadData of data.leads) {
				await tx.lead.upsert({
					where: { email: leadData.email },
					update: {
						name: leadData.name,
						phone_number: leadData.phone_number,
						type: leadData.type,
						business_name: leadData.business_name,
					},
					create: {
						name: leadData.name,
						email: leadData.email,
						phone_number: leadData.phone_number,
						type: leadData.type,
						business_name: leadData.business_name,
					},
				});
			}

			console.log(`  ✅ ${data.leads.length} leads processados.`);
		},
		{ timeout: 60000 },
	);

	console.log('\n🚀 Seeding concluído com sucesso!');
}

main()
	.then(async () => {
		await prisma.$disconnect();
		await pool.end();
	})
	.catch(async (e) => {
		console.error('❌ Erro fatal no seeding:', e);
		await prisma.$disconnect();
		await pool.end();
		process.exit(1);
	});
