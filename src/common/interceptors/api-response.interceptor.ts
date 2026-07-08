import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ApiResponseInterceptor<T = unknown> implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> {
    const isPlainObject = (value: unknown): value is Record<string, unknown> =>
      Boolean(value) && typeof value === 'object' && !Array.isArray(value);

    return next.handle().pipe(
      map((res: unknown): ApiResponse<T> => {
        const resObj = isPlainObject(res) ? res : {};
        const message =
          typeof resObj.message === 'string' ? resObj.message : '';
        const data = Object.prototype.hasOwnProperty.call(resObj, 'data')
          ? (resObj as { data?: unknown }).data
          : null;

        return {
          success: true,
          message,
          data: (data ?? null) as T | null,
        };
      }),
    );
  }
}
