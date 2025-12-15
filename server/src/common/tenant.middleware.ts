import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * 요청 단위로 tenantId를 확정해 req.tenantId에 저장하는 미들웨어.
 * - 우선순위: 헤더 X-Tenant-Id → 인증 사용자 companyId → (없으면) 정책에 따라 차단
 * - 공개 엔드포인트(/auth, /health 등)는 통과
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const path = req.path || '';
    const isPublic = path.startsWith('/auth') || path.startsWith('/health') || path === '/';
    if (isPublic) return next();

    const headerTenant = (req.headers['x-tenant-id'] ?? req.headers['X-Tenant-Id']) as string | undefined;
    const userTenant =
      // req.user.companyId 형태(JWT 페이로드에 매핑된 경우)
      (req as any).user?.companyId ??
      // req.user.company?.id 형태
      (req as any).user?.company?.id;

    const tenantId = headerTenant ?? (userTenant != null ? String(userTenant) : undefined);
    if (!tenantId) {
      throw new BadRequestException('X-Tenant-Id header is required for this request.');
    }

    req.tenantId = String(tenantId);
    return next();
  }
}
