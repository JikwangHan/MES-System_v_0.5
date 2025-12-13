/// <reference types="cypress" />

// 역할별 관리자 화면 접근 여부를 확인하는 테스트
// - USER : 관리자 경로 접근 시 차단 모달 1회 + 홈 이동
// - COMPANY_ADMIN : 관리자 경로 정상 접근

describe('역할별 관리자 접근 확인', () => {
  const userId = Cypress.env('USER_ID');
  const userPw = Cypress.env('USER_PW');
  const companyAdminId = Cypress.env('COMPANY_ADMIN_ID');
  const companyAdminPw = Cypress.env('COMPANY_ADMIN_PW');

  // USER : 차단 확인
  if (userId && userPw) {
    it('USER 권한은 관리자 경로 차단 모달 노출', () => {
      cy.apiLogin(userId, userPw);
      cy.visit('/app/admin/users');

      // 차단 모달 1회 확인 후 홈으로 이동되는지 확인
      cy.get('.unauth-modal').should('have.length', 1);
      cy.contains('[data-testid=unauth-title]', '접근 권한이 없습니다').should('exist');
      cy.contains('[data-testid=unauth-ok]', '확인').click();
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
    });
  } else {
    it('USER 환경변수 없음으로 스킵', () => {
      cy.log('set CYPRESS_USER_ID / CYPRESS_USER_PW to enable this test');
    });
  }

  // COMPANY_ADMIN : 접근 허용
  if (companyAdminId && companyAdminPw) {
    it('COMPANY_ADMIN 권한은 관리자 화면 접근 가능', () => {
      cy.apiLogin(companyAdminId, companyAdminPw);
      cy.visit('/app/admin/users');
      cy.contains('사용자 관리').should('exist');
    });
  } else {
    it('COMPANY_ADMIN 환경변수 없음으로 스킵', () => {
      cy.log('set CYPRESS_COMPANY_ADMIN_ID / CYPRESS_COMPANY_ADMIN_PW to enable this test');
    });
  }
});

