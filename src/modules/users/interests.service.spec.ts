import { Test, TestingModule } from '@nestjs/testing';
import { InterestsService } from './interests.service';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('InterestsService', () => {
  let service: InterestsService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterestsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<InterestsService>(InterestsService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addInterests', () => {
    it('should create user interests for multiple categories', async () => {
      const userId = 'user-1';
      const categoryIds = ['cat-1', 'cat-2', 'cat-3'];

      prisma.user_interest.createMany.mockResolvedValue({ count: 3 });

      const result = await service.addInterests(userId, categoryIds);

      expect(prisma.user_interest.createMany).toHaveBeenCalledWith({
        data: [
          { user_id: userId, category_id: 'cat-1' },
          { user_id: userId, category_id: 'cat-2' },
          { user_id: userId, category_id: 'cat-3' },
        ],
        skipDuplicates: true,
      });
      expect(result).toEqual({ count: 3 });
    });

    it('should create a single interest', async () => {
      const userId = 'user-1';
      const categoryIds = ['cat-1'];

      prisma.user_interest.createMany.mockResolvedValue({ count: 1 });

      const result = await service.addInterests(userId, categoryIds);

      expect(prisma.user_interest.createMany).toHaveBeenCalledWith({
        data: [{ user_id: userId, category_id: 'cat-1' }],
        skipDuplicates: true,
      });
      expect(result).toEqual({ count: 1 });
    });

    it('should handle empty category array', async () => {
      const userId = 'user-1';
      const categoryIds: string[] = [];

      prisma.user_interest.createMany.mockResolvedValue({ count: 0 });

      const result = await service.addInterests(userId, categoryIds);

      expect(prisma.user_interest.createMany).toHaveBeenCalledWith({
        data: [],
        skipDuplicates: true,
      });
      expect(result).toEqual({ count: 0 });
    });
  });

  describe('updateInterests', () => {
    it('should update user interests for multiple categories', async () => {
      const userId = 'user-1';
      const categoryIds = ['cat-1', 'cat-2', 'cat-3'];

      prisma.user_interest.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.updateInterests(userId, categoryIds);

      expect(prisma.user_interest.updateMany).toHaveBeenCalledWith({
        data: [
          { user_id: userId, category_id: 'cat-1' },
          { user_id: userId, category_id: 'cat-2' },
          { user_id: userId, category_id: 'cat-3' },
        ],
      });
      expect(result).toEqual({ count: 3 });
    });

    it('should update a single interest', async () => {
      const userId = 'user-1';
      const categoryIds = ['cat-1'];

      prisma.user_interest.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.updateInterests(userId, categoryIds);

      expect(prisma.user_interest.updateMany).toHaveBeenCalledWith({
        data: [{ user_id: userId, category_id: 'cat-1' }],
      });
      expect(result).toEqual({ count: 1 });
    });

    it('should handle empty category array', async () => {
      const userId = 'user-1';
      const categoryIds: string[] = [];

      prisma.user_interest.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.updateInterests(userId, categoryIds);

      expect(prisma.user_interest.updateMany).toHaveBeenCalledWith({
        data: [],
      });
      expect(result).toEqual({ count: 0 });
    });
  });

  describe('listInterests', () => {
    it('should return all interests for a user with category data', async () => {
      const userId = 'user-1';
      const mockInterests = [
        {
          user_id: userId,
          category_id: 'cat-1',
          category: { id: 'cat-1', name: 'Technology' },
        },
        {
          user_id: userId,
          category_id: 'cat-2',
          category: { id: 'cat-2', name: 'Sports' },
        },
      ];

      prisma.user_interest.findMany.mockResolvedValue(mockInterests as any);

      const result = await service.listInterests(userId);

      expect(prisma.user_interest.findMany).toHaveBeenCalledWith({
        where: { user_id: userId },
        include: { category: true },
      });
      expect(result).toEqual(mockInterests);
    });

    it('should return empty array when user has no interests', async () => {
      const userId = 'user-1';

      prisma.user_interest.findMany.mockResolvedValue([]);

      const result = await service.listInterests(userId);

      expect(prisma.user_interest.findMany).toHaveBeenCalledWith({
        where: { user_id: userId },
        include: { category: true },
      });
      expect(result).toEqual([]);
    });
  });
});
