/// <reference types="cypress" />

// 시나리오: USER가 관리자 경로(/app/admin/users)에 접근하면 모달 1회 노출 후 홈으로 이동 + 토큰 삭제
describe('권한 차단 모달 - USER', () => {
  const userId = Cypress.env('USER_ID');
  const userPw = Cypress.env('USER_PW');

  if (!userId || !userPw) {
    it('환경변수 USER_ID/USER_PW가 없어 건너뜀', () => {
      cy.log('set CYPRESS_USER_ID / CYPRESS_USER_PW to enable this test');
    });
    return;
  }

  it('USER → /app/admin/users 접근 시 모달 1회 + 홈 이동 + 토큰 삭제', () => {
    // 로그인
    cy.apiLogin(userId, userPw);
    // 관리자 경로 직접 접근
    cy.visit('/app/admin/users');
    // 모달 1회 표시 확인
    cy.get('.ant-modal') // antd 모달
      .should('have.length', 1)
      .within(() => {
        cy.contains('접근 권한이 없습니다').should('exist');
        cy.contains('확인').click();
      });
    // 홈으로 이동 확인
    cy.url().should('eq', 'http://localhost:5173/');
    // 토큰 삭제 확인
    cy.window().then((win) => {
      expect(win.localStorage.getItem('access_token')).to.be.null;
    });
  });
});
