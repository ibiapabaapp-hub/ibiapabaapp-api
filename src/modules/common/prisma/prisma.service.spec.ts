import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
	const originalEnv = process.env;

	beforeEach(() => {
		jest.resetModules();
		process.env = { ...originalEnv };
	});

	afterAll(() => {
		process.env = originalEnv;
	});

	it('should be defined when DATABASE_URL is set', () => {
		process.env.DATABASE_URL = 'postgresql://test';

		const service = new PrismaService();

		expect(service).toBeDefined();
	});

	it('should throw error if DATABASE_URL is not set', () => {
		delete process.env.DATABASE_URL;

		expect(() => new PrismaService()).toThrow('DATABASE_URL not set');
	});

	it('should call $connect on module init', async () => {
		process.env.DATABASE_URL = 'postgresql://test';

		const service = new PrismaService();
		const connectSpy = jest
			.spyOn(service, '$connect')
			.mockResolvedValue(undefined);

		await service.onModuleInit();

		expect(connectSpy).toHaveBeenCalled();
	});
});
