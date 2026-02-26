import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { User } from 'src/users/entities/user.entity';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import {
  CheckUniqueDto,
  CheckUniqueResponse,
} from './dtos/check-unique-field.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: DeepMockProxy<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockDeep<AuthService>(),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<DeepMockProxy<AuthService>>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call authService.login on login()', async () => {
    const dto = { email: 'test@test.com', password: '123' };
    const response = {
      user: { id: '1' },
      accessToken: 'access',
      refreshToken: 'refresh',
    };

    service.login.mockResolvedValue(
      response as { user: User; accessToken: string; refreshToken: string },
    );

    const result = await controller.login(dto as LoginDto);

    expect(service.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual(response);
  });

  it('should call authService.register on register()', async () => {
    const dto = {
      name: 'John',
      email: 'test@test.com',
      password: '123',
      password_confirm: '123',
    };

    const response = {
      user: { id: '1' },
      accessToken: 'access',
      refreshToken: 'refresh',
    };

    service.register.mockResolvedValue(
      response as { user: User; accessToken: string; refreshToken: string },
    );

    const result = await controller.register(dto as RegisterDto);

    expect(service.register).toHaveBeenCalledWith(dto);
    expect(result).toEqual(response);
  });

  it('should call authService.refreshTokens on refresh()', async () => {
    const token = 'refresh';
    const response = {
      user: { id: '1' },
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    };

    service.refreshTokens.mockResolvedValue(
      response as { user: User; accessToken: string; refreshToken: string },
    );

    const result = await controller.refresh(token);

    expect(service.refreshTokens).toHaveBeenCalledWith(token);
    expect(result).toEqual(response);
  });

  it('should return success message on logout()', () => {
    const result = controller.logout();

    expect(result).toEqual({ message: 'Logout realizado com sucesso' });
  });

  describe('checkUnique', () => {
    it('should call authService.isUniqueAvailable', async () => {
      const dto: CheckUniqueDto = {
        field: 'email',
        value: 'test@test.com',
      };

      const response: CheckUniqueResponse = {
        field: 'email',
        value: 'test@test.com',
        available: true,
      };

      service.isUniqueAvailable.mockResolvedValue(response);

      const result = await controller.checkUnique(dto);

      expect(service.isUniqueAvailable).toHaveBeenCalledWith(
        dto.field,
        dto.value,
      );
      expect(result).toEqual(response);
    });

    it('should return available false when value is taken', async () => {
      const dto: CheckUniqueDto = {
        field: 'username',
        value: 'john',
      };

      const response: CheckUniqueResponse = {
        field: 'username',
        value: 'john',
        available: false,
      };

      service.isUniqueAvailable.mockResolvedValue(response);

      const result = await controller.checkUnique(dto);

      expect(service.isUniqueAvailable).toHaveBeenCalledWith(
        'username',
        'john',
      );
      expect(result.available).toBe(false);
    });
  });
});
