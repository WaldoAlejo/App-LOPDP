import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuditService } from '../../modules/audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;
    const path = request.route?.path || request.path;
    const ip = request.ip;
    const userAgent = request.headers['user-agent'];

    // Log asíncrono sin bloquear la request
    if (user && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      this.auditService
        .log({
          userId: user.userId || user.sub,
          companyId: user.companyId,
          action: `${method}_${path}`,
          entityName: 'HTTP_REQUEST',
          ipAddress: ip,
          userAgent,
        })
        .catch(() => {
          // Silenciar errores de auditoría para no afectar la request
        });
    }

    return next.handle();
  }
}
