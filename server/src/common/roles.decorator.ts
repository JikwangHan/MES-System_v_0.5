import { SetMetadata } from '@nestjs/common';

// 컨트롤러/핸들러에 필요한 역할을 지정하는 커스텀 데코레이터
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
