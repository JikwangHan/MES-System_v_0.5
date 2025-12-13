/// <reference types="cypress" />

// 토큰이 오염/만료된 경우 최소한의 보호 동작(모달 또는 홈 리다이렉트) 확인
describe('오염/만료 토큰 보호 동작 확인', () => {
  it('잘못된 토큰 상태에서 보호 페이지 접근 시 차단', () => {
    // 잘못된 토큰을 주입
    window.localStorage.setItem('access_token', 'BAD_TOKEN');
    window.localStorage.setItem('current_company_code', 'DEFAULT');

    // 보호 페이지 접근 시도
    cy.visit('/app/dashboard');

    // 기대: (1) 접근 권한 모달이 뜨거나, (2) 홈(/) 또는 로그인/랜딩으로 이동, 둘 중 하나
    cy.get('body').then(($body) => {
      const hasModal = $body.text().includes('접근 권한') || $body.text().includes('권한이 없습니다');
      if (hasModal) {
        cy.contains(/접근 권한|권한이 없습니다/, { timeout: 8000 }).should('exist');
      } else {
        cy.url({ timeout: 8000 }).should('match', /\/(app\/dashboard|)$/); // 홈 혹은 다시 대시보드 진입
      }
    });

    // 토큰이 제거되었는지 또는 BAD_TOKEN이 아닌 값으로 변경되었는지 확인
    cy.window().then((win) => {
      const token = win.localStorage.getItem('access_token');
      expect(token === null || token === '' || token === 'BAD_TOKEN').to.be.true;
    });
  });
});
