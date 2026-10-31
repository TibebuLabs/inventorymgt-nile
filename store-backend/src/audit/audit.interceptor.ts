import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';

const VERBS: Record<string, string> = {
  POST: 'Created',
  PUT: 'Updated',
  PATCH: 'Updated',
  DELETE: 'Deleted',
};

/** Routes that should never be written to the audit trail. */
const SKIP_PREFIXES = ['/auth', '/notifications', '/audit-logs', '/health'];

/**
 * Records every successful write request (POST/PUT/PATCH/DELETE) together with
 * the authenticated actor. Business services additionally write richer,
 * domain-specific entries (approvals, stock postings, logins).
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method: string = request?.method ?? '';
    const verb = VERBS[method];

    if (!verb) return next.handle();

    const rawPath: string = String(request?.route?.path ?? request?.url ?? '');
    const path = rawPath.split('?')[0];

    if (SKIP_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        const segments = path.split('/').filter(Boolean);
        const entity = segments[0] ?? 'unknown';
        const maybeId = segments.slice(1).find((segment) => /^\d+$/.test(segment));

        const user = request?.user ?? {};

        void this.audit.log({
          employee_id: user.userId ?? null,
          employee_name: user.name ?? user.email ?? null,
          role: user.role ?? null,
          action: method === 'POST' ? 'CREATE' : method === 'DELETE' ? 'DELETE' : 'UPDATE',
          entity,
          entity_id: maybeId ?? null,
          description: `${verb} ${entity.replace(/-/g, ' ')}${
            maybeId ? ` #${maybeId}` : ''
          }`,
          method,
          path,
          ip: request?.ip ?? null,
        });
      }),
    );
  }
}
