import { Injectable } from '@nestjs/common';

// 간단한 테스트 메시지를 반환하는 서비스입니다.
// 추후 MMS(Manufacturing Management System)의 상태/버전 정보를 확장해 넣을 수 있습니다.
@Injectable()
export class AppService {
  getHello(): string {
    return 'MMS(Manufacturing Management System) 서버가 정상 동작 중입니다.';
  }
}
