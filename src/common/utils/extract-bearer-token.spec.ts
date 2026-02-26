import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import {
  extractBearerTokenFromReq,
  extractBearerTokenFromString,
} from './extract-bearer-token';

describe('extract-bearer-token', () => {
  describe('extractBearerTokenFromReq', () => {
    it('should extract the token from request headers successfully', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token-123',
        },
      } as Request;

      const result = extractBearerTokenFromReq(mockRequest);

      expect(result).toBe('valid-token-123');
    });

    it('should throw UnauthorizedException if authorization header is missing', () => {
      const mockRequest = {
        headers: {},
      } as Request;

      expect(() => extractBearerTokenFromReq(mockRequest)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if authorization type is not Bearer', () => {
      const mockRequest = {
        headers: {
          authorization: 'Basic credentials',
        },
      } as Request;

      expect(() => extractBearerTokenFromReq(mockRequest)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('extractBearerTokenFromString', () => {
    it('should extract the token from a valid bearer string', () => {
      const authString = 'Bearer another-token-xyz';

      const result = extractBearerTokenFromString(authString);

      expect(result).toBe('another-token-xyz');
    });

    it('should throw UnauthorizedException if string format is invalid', () => {
      const invalidString = 'NotBearer token';

      expect(() => extractBearerTokenFromString(invalidString)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token part is missing', () => {
      const missingToken = 'Bearer ';

      expect(() => extractBearerTokenFromString(missingToken)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if the string is empty', () => {
      expect(() => extractBearerTokenFromString('')).toThrow(
        UnauthorizedException,
      );
    });
  });
});
