import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should hash a password using argon2', async () => {
      const password = 'plain-password';
      const hashedPassword = 'hashed-password';
      (argon2.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.hashPassword(password);

      expect(argon2.hash).toHaveBeenCalledWith(password);
      expect(result).toEqual(hashedPassword);
    });

    it('should throw an error if password is not provided', async () => {
      await expect(service.hashPassword('')).rejects.toThrow(
        'Password string is required for hashing',
      );
      expect(argon2.hash).not.toHaveBeenCalled();
    });
  });

  describe('verifyPassword', () => {
    it('should return true if password is valid', async () => {
      const hash = 'hashed-password';
      const password = 'plain-password';
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyPassword(hash, password);

      expect(argon2.verify).toHaveBeenCalledWith(hash, password);
      expect(result).toBe(true);
    });

    it('should return false if password is invalid', async () => {
      const hash = 'hashed-password';
      const password = 'wrong-password';
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      const result = await service.verifyPassword(hash, password);

      expect(result).toBe(false);
    });

    it('should throw an error if password is empty for verification', async () => {
      await expect(service.verifyPassword('some-hash', '')).rejects.toThrow(
        'Password string is required for verifying',
      );
    });

    it('should throw an error if hash is empty for verification', async () => {
      await expect(service.verifyPassword('', 'some-password')).rejects.toThrow(
        'Password hash is required for verifying',
      );
      expect(argon2.verify).not.toHaveBeenCalled();
    });
  });
});
