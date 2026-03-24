import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('EventsController', () => {
  let controller: EventsController;
  let service: DeepMockProxy<EventsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<DeepMockProxy<EventsService>>(EventsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
