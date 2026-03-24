import { Test, TestingModule } from '@nestjs/testing';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';
import { MediasService } from 'src/modules/medias/medias.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { City } from './entities/city.entity';

describe('CitiesController', () => {
  let controller: CitiesController;
  let service: DeepMockProxy<CitiesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitiesController],
      providers: [
        { provide: CitiesService, useValue: mockDeep<CitiesService>() },
        { provide: MediasService, useValue: mockDeep<MediasService>() },
      ],
    }).compile();

    controller = module.get<CitiesController>(CitiesController);
    service = module.get<DeepMockProxy<CitiesService>>(CitiesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all cities', async () => {
    const list = [{ id: 'uuid', name: 'Tianguá' } as City];
    service.findAll.mockResolvedValue(list);
    expect(await controller.findAll()).toEqual(list);
  });
});
