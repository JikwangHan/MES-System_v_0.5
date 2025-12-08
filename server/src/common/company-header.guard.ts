import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

/**
 * X-Company-Code 헤더를 SYSTEM_ADMIN만 사용할 수 있도록 제한하는 가드.
 * - SYSTEM_ADMIN: 헤더 사용 허용
 * - 그 외(role != SYSTEM_ADMIN): 헤더가 있으면 제거하거나, 헤더로 다른 회사 접근 시도를 차단
 */
@Injectable()
export class CompanyHeaderGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const role = request.user?.role;
    // 인증되지 않은 공개 엔드포인트(/auth/login 등)는 통과
    if (!role) return true;

    const headerCode = request.headers?.['x-company-code'];
    // SYSTEM_ADMIN만 헤더 사용 가능. 다른 역할은 헤더를 제거하고 진행.
    if (role !== 'SYSTEM_ADMIN' && headerCode) {
      // 다른 회사로 가장하려는 시도를 차단
      delete request.headers['x-company-code'];
      // 단순 제거로 충분하지만, 명확히 차단하려면 Forbidden을 던질 수도 있다.
      // 여기서는 제거 후 진행한다.
    }
    return true;
  }
}
