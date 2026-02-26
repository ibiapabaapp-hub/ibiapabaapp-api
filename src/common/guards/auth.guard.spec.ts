import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';
import { JwtService } from '../jwt/jwt.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;
  let jwtService: JwtService;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockExecutionContext = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        headers: {},
      }),
    }),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: Reflector, useValue: mockReflector },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    reflector = module.get<Reflector>(Reflector);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if route is marked as public', () => {
      mockReflector.getAllAndOverride.mockReturnValue(true);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should throw UnauthorizedException if no token is provided', () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      
      // Simula request sem header Authorization
      const req = { headers: {} };
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(req);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is invalid or expired', () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      
      const req = { headers: { authorization: 'Bearer invalid-token' } };
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(req);
      
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new UnauthorizedException('Invalid or expired token'),
      );
    });

    it('should return true and set user payload in request if token is valid', () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      
      const payload = { id: 'user-id', role: 'superuser' };
      const req = { headers: { authorization: 'Bearer valid-token' }, user: null };
      
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(req);
      mockJwtService.verify.mockReturnValue(payload);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(req.user).toEqual(payload);
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token');
    });
  });
});