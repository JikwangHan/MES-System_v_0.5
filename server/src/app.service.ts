import { Injectable } from '@nestjs/common';

// 서비스 클래스는 컨트롤러에서 요청한 작업을 실제로 처리하는 비즈니스 로직 영역입니다.
// 지금은 간단한 테스트 문구만 반환하지만, 이후 MES 데이터 처리 로직을 점진적으로 추가하게 됩니다.
@Injectable()
export class AppService {
  // 서버가 정상 동작 중임을 알려주는 간단한 메시지를 반환합니다.
  // 추후에는 서버 버전, 빌드 시간, DB 연결 상태 등을 함께 반환하도록 확장할 수 있습니다.
  getHello(): string {
    return 'MES-System 서버가 정상 동작 중입니다.';
  }
}
