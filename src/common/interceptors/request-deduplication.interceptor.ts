import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestCollection } from '../../features/request-collection/entities/request-collection.entity';
import { Player } from '../../features/players/entities/players.entity';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable()
export class RequestDeduplicationInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(RequestCollection)
    private readonly registryRepo: Repository<RequestCollection>,
    @InjectRepository(Player)
    private readonly playerRepo: Repository<Player>,
  ) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();

    const method = request.method;
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const requestId = request.headers['x-request-id'];
    if (!requestId) {
      throw new BadRequestException('Missing X-Request-ID header');
    }


    const playerUid = request.params.playerId || request.body.playerId;
    let playerId: number | null = null;
    if (playerUid) {
      const player = await this.playerRepo.findOne({ where: { playerUid } });
      if (player) {
        playerId = player.id;
      }
    }

    const endpoint = `${method} ${request.route ? request.route.path : request.url}`;

    const existing = await this.registryRepo.findOne({
      where: {
        requestId,
        endpoint,
        ...(playerId ? { playerId } : {}),
      },
    });

    if (existing) {
      if (existing.statusCode === null) {
        throw new ConflictException('Request is already processing');
      }

      response.status(existing.statusCode);
      return of(existing.response);
    }

    const pending = this.registryRepo.create({
      requestId,
      endpoint,
      playerId,
      statusCode: null,
      response: null,
    });
    const savedPending = await this.registryRepo.save(pending);

    return next.handle().pipe(
      switchMap(async (data) => {
        savedPending.statusCode = response.statusCode || 201;
        savedPending.response = data;
        await this.registryRepo.save(savedPending);
        return data;
      }),
      catchError(async (err) => {
        let status = 500;
        let responseBody = { message: 'Internal server error' };

        if (err instanceof HttpException) {
          status = err.getStatus();
          responseBody = err.getResponse() as any;
        } else {
          responseBody = { message: err.message || 'Internal server error' };
        }

        savedPending.statusCode = status;
        savedPending.response = responseBody;
        await this.registryRepo.save(savedPending);

        throw err;
      }),
    );
  }
}
