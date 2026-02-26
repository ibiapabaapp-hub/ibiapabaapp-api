import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from './jwt.service';
import jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('jsonwebtoken');

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(async () => {
    process.env.SECRET_KEY = 'test-secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtService],
    }).compile();

    service = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('should sign a token using jsonwebtoken', () => {
      const payload = { sub: 'user-id' };
      const options: jwt.SignOptions = { expiresIn: '1h' };
      const token = 'signed-token';

      (jwt.sign as jest.Mock).mockReturnValue(token);

      const result = service.sign(payload, options);

      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        process.env.SECRET_KEY,
        options,
      );
      expect(result).toBe(token);
    });
  });

  describe('verify', () => {
    it('should verify and return decoded token', () => {
      const token = 'valid-token';
      const decoded = { sub: 'user-id' };

      (jwt.verify as jest.Mock).mockReturnValue(decoded);

      const result = service.verify<{ token: string }>(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.SECRET_KEY);
      expect(result).toEqual(decoded);
    });

    it('should throw UnauthorizedException if token is invalid', () => {
      const token = 'invalid-token';

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid token');
      });

      expect(() => service.verify<{ token: string }>(token)).toThrow(
        UnauthorizedException,
      );
    });
  });
});
