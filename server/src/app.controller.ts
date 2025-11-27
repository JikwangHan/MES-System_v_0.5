import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// 컨트롤러는 HTTP 요청을 받아서 어떤 서비스를 호출할지 결정하고, 그 결과를 응답으로 반환합니다.
// 여기서는 루트 경로(GET /)에 대한 요청을 처리하여 서버 상태 메시지를 반환합니다.
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // GET / 요청을 받으면 서비스의 getHello() 결과를 그대로 반환합니다.
  // 브라우저에서 http://localhost:3000 으로 접속하면 이 함수가 실행되어 상태 문구가 표시됩니다.
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
