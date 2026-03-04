import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const httpException = this.normalizeException(exception);

    const status = httpException.getStatus();
    const exceptionResponse = httpException.getResponse();

    const errorBody =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : exceptionResponse;

    const fullResponse = {
      ...errorBody,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    console.error(
      `[ERROR at ${fullResponse.timestamp} in ${fullResponse.path}]`,
      exception,
    );

    response.status(status).json(fullResponse);
  }

  private normalizeException(e: unknown): HttpException {
    if (e instanceof HttpException) {
      return e;
    }

    const message = e instanceof Error ? e.message : 'Unknown error';
    const code = e instanceof Error ? 'internal_server_error' : 'unknown';

    return new InternalServerErrorException({
      message: message || 'Internal server error',
      code: code,
    });
  }
}
