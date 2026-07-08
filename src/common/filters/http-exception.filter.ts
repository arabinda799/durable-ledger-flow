import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status: HttpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Unexpected error occurred. Please try again later';
    let isValidationError = false;

    const isPlainObject = (value: unknown): value is Record<string, unknown> =>
      Boolean(value) && typeof value === 'object' && !Array.isArray(value);

    if (exception instanceof HttpException) {
      const exceptionResponse: unknown = exception.getResponse();

      if (status === HttpStatus.TOO_MANY_REQUESTS) {
        message = 'Too many requests. Please try again later';
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (isPlainObject(exceptionResponse)) {
        const msg = exceptionResponse.message;
        if (Array.isArray(msg)) {
          message = msg.map((m) => String(m)).join(',');
          isValidationError = true;
        } else if (typeof msg === 'string') {
          message = msg;
          if (status === HttpStatus.BAD_REQUEST) isValidationError = true;
        }
      }
    }

    if (!isValidationError) {
      const context = 'HttpExceptionFilter';
      const errorInstance =
        exception instanceof Error ? exception : new Error(String(exception));
      const optionsValue =
        exception instanceof HttpException
          ? (exception as unknown as { options?: unknown }).options
          : undefined;
      const optionsCause = isPlainObject(optionsValue)
        ? optionsValue.cause
        : undefined;
      const directCause =
        exception instanceof Error
          ? (exception as { cause?: unknown }).cause
          : undefined;
      const cause = optionsCause ?? directCause;

      if (cause) {
        const causeMessage =
          cause instanceof Error
            ? cause.message
            : typeof cause === 'string'
              ? cause
              : JSON.stringify(cause);
        const stack =
          cause instanceof Error
            ? cause.stack
            : (errorInstance.stack ?? undefined);
        this.logger.error(
          `Error: ${errorInstance.message} | Cause: ${causeMessage}`,
          stack,
          context,
        );
      } else {
        this.logger.error(errorInstance.message, errorInstance.stack, context);
      }
    }

    const apiResponse: ApiResponse<null> = {
      success: false,
      message: message,
      data: null,
    };

    response.status(status).json(apiResponse);
  }
}
