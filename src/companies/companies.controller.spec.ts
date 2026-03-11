import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { MediasService } from 'src/medias/medias.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { CreateCompanyDto } from './dto/create-company.dto';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let service: DeepMockProxy<CompaniesService>;
  let mediasService: DeepMockProxy<MediasService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        { provide: CompaniesService, useValue: mockDeep<CompaniesService>() },
        { provide: MediasService, useValue: mockDeep<MediasService>() },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
    service = module.get<DeepMockProxy<CompaniesService>>(CompaniesService);
    mediasService = module.get<DeepMockProxy<MediasService>>(MediasService);
  });

  it('should call service.create with correct data', async () => {
    const dto: CreateCompanyDto = {
      name: 'Empresa Teste',
      slug: 'empresa-teste',
      id: '',
      cnpj: null,
      cover_img_url: null,
      description: null,
      active: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should call service.findAll', async () => {
    await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should call mediasService.getMediaByCompany', async () => {
    await controller.getCompanyMedia('uuid');
    expect(mediasService.getMediaByCompany).toHaveBeenCalledWith('uuid');
  });
});
