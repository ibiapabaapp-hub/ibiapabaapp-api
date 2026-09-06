import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import {
	CheckUniqueDto,
	CheckUniqueResponse,
} from '../dtos/check-unique-field.dto';
import { AuthResponseDto } from '../dtos/manual-auth/auth-response.dto';
import { ChangeEmailDto } from '../dtos/manual-auth/change-email.dto';
import { ForgotPasswordDto } from '../dtos/manual-auth/forgot-password.dto';
import { LoginDto } from '../dtos/manual-auth/login.dto';
import { RegisterDto } from '../dtos/manual-auth/register.dto';
import { ResetPasswordDto } from '../dtos/manual-auth/reset-password.dto';
import { GoogleOAuthService } from '../oauth/google-oauth.service';

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
				{
					provide: GoogleOAuthService,
					useValue: mockDeep<GoogleOAuthService>(),
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
			account: { id: '1' },
			access_token: 'access',
			refresh_token: 'refresh',
		};

		service.login.mockResolvedValue(response as AuthResponseDto);

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
			account: { id: '1' },
			access_token: 'access',
			refresh_token: 'refresh',
		};

		service.register.mockResolvedValue(response as AuthResponseDto);

		const result = await controller.register(dto as RegisterDto);

		expect(service.register).toHaveBeenCalledWith(dto);
		expect(result).toEqual(response);
	});

	it('should call authService.resendVerificationEmail on resendVerification()', async () => {
		service.resendVerificationEmail.mockResolvedValue({ success: true });

		await expect(
			controller.resendVerification('Bearer access-token'),
		).resolves.toEqual({ success: true });
		expect(service.resendVerificationEmail).toHaveBeenCalledWith(
			'Bearer access-token',
		);
	});

	it('should call authService.changeUnverifiedEmail on changeUnverifiedEmail()', async () => {
		const dto = { email: 'new@example.com' } as ChangeEmailDto;
		service.changeUnverifiedEmail.mockResolvedValue({ success: true });

		await expect(
			controller.changeUnverifiedEmail('Bearer access-token', dto),
		).resolves.toEqual({ success: true });
		expect(service.changeUnverifiedEmail).toHaveBeenCalledWith(
			'Bearer access-token',
			dto,
		);
	});

	it('should call authService.requestPasswordReset on forgotPassword()', async () => {
		const dto = { email: 'test@test.com' } as ForgotPasswordDto;
		service.requestPasswordReset.mockResolvedValue({ success: true });

		const result = await controller.forgotPassword(dto);

		expect(service.requestPasswordReset).toHaveBeenCalledWith(dto);
		expect(result).toEqual({ success: true });
	});

	it('should call authService.resetPassword on resetPassword()', async () => {
		const dto = {
			token: 'reset-token',
			password: 'Password1!',
			password_confirm: 'Password1!',
		} as ResetPasswordDto;
		service.resetPassword.mockResolvedValue({ success: true });

		const result = await controller.resetPassword(dto);

		expect(service.resetPassword).toHaveBeenCalledWith(dto);
		expect(result).toEqual({ success: true });
	});

	it('should call authService.refreshTokens on refresh()', async () => {
		const token = 'refresh';
		const response = {
			account: { id: '1' },
			access_token: 'new-access',
			refresh_token: 'new-refresh',
		};

		service.refreshTokens.mockResolvedValue(response as AuthResponseDto);

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
				field: 'email',
				value: 'test@test.com',
			};

			const response: CheckUniqueResponse = {
				field: 'email',
				value: 'john',
				available: false,
			};

			service.isUniqueAvailable.mockResolvedValue(response);

			const result = await controller.checkUnique(dto);

			expect(service.isUniqueAvailable).toHaveBeenCalledWith(
				'email',
				'test@test.com',
			);
			expect(result.available).toBe(false);
		});
	});
});
