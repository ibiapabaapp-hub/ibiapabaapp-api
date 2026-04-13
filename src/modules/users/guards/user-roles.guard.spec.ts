import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { JwtService } from '../../common/jwt/jwt.service';
import { RolesGuard } from './user-roles.guard';

describe('RolesGuard', () => {
	let guard: RolesGuard;
	let reflector: DeepMockProxy<Reflector>;
	let jwtService: DeepMockProxy<JwtService>;

	const mockExecutionContext = (
		roles?: string[],
		token = 'valid-token',
	): ExecutionContext =>
		({
			getHandler: jest.fn(),
			switchToHttp: () => ({
				getRequest: () => ({
					headers: {
						authorization: `Bearer ${token}`,
					},
					url: '/test',
				}),
			}),
		}) as unknown as ExecutionContext;

	beforeEach(() => {
		reflector = mockDeep<Reflector>();
		jwtService = mockDeep<JwtService>();

		guard = new RolesGuard(reflector, jwtService);

		jest.clearAllMocks();
	});

	it('should allow access if no roles are defined', () => {
		reflector.get.mockReturnValue(undefined);

		const context = mockExecutionContext();

		const result = guard.canActivate(context);

		expect(result).toBe(true);
		expect(jwtService.verify).not.toHaveBeenCalled();
	});

	it('should allow access if user role is accepted', () => {
		reflector.get.mockReturnValue(['superuser']);
		jwtService.verify.mockReturnValue({ id: '1', role: 'superuser' });

		const context = mockExecutionContext();

		const result = guard.canActivate(context);

		expect(jwtService.verify).toHaveBeenCalled();
		expect(result).toBe(true);
	});

	it('should throw ForbiddenException if user role is not accepted', () => {
		reflector.get.mockReturnValue(['superuser']);
		jwtService.verify.mockReturnValue({ id: '1', role: 'user' });

		const context = mockExecutionContext();

		expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
	});
});
