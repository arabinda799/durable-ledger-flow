import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TrimInterceptor implements NestInterceptor {
  private readonly ignoredFields = new Set([
    'password',
    'passwordConfirm',
    'token',
    'secret',
  ]);

  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest<unknown>();
    if (!request || typeof request !== 'object') {
      return next.handle();
    }

    const req = request as Record<string, unknown>;

    if (req.body) this.trim(req.body);
    if (req.query) this.trim(req.query);
    if (req.params) this.trim(req.params);

    return next.handle();
  }

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  private trim(obj: unknown): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    if (Buffer.isBuffer(obj) || obj instanceof Date || this.isMulterFile(obj)) {
      return;
    }

    const record = obj as Record<string, unknown>;
    Object.keys(record).forEach((key) => {
      const value = record[key];

      if (typeof value === 'string' && !this.ignoredFields.has(key)) {
        record[key] = value.trim();
      } else if (this.isPlainObject(value) || Array.isArray(value)) {
        this.trim(value);
      }
    });
  }

  private isMulterFile(value: unknown): boolean {
    if (!this.isPlainObject(value)) return false;
    return (
      typeof value.originalname === 'string' &&
      typeof value.mimetype === 'string'
    );
  }
}
