import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategory = {
    id: 'category-1',
    name: 'Test Category',
    parent_id: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
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

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockCategory);

      const result = await controller.create({
        name: 'Test Category',
        parent_id: null,
      });

      expect(result).toEqual(mockCategory);
      expect(service.create).toHaveBeenCalledWith({
        name: 'Test Category',
        parent_id: null,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockCategory]);

      const result = await controller.findAll();

      expect(result).toEqual([mockCategory]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no categories exist', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCategory);

      const result = await controller.findOne('category-1');

      expect(result).toEqual(mockCategory);
      expect(service.findOne).toHaveBeenCalledWith('category-1');
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updatedCategory = { ...mockCategory, name: 'Updated Category' };
      jest.spyOn(service, 'update').mockResolvedValue(updatedCategory);

      const result = await controller.update('category-1', {
        name: 'Updated Category',
      });

      expect(result).toEqual(updatedCategory);
      expect(service.update).toHaveBeenCalledWith('category-1', {
        name: 'Updated Category',
      });
    });
  });

  describe('remove', () => {
    it('should delete a category', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(mockCategory);

      const result = await controller.remove('category-1');

      expect(result).toEqual(mockCategory);
      expect(service.remove).toHaveBeenCalledWith('category-1');
    });
  });
});
