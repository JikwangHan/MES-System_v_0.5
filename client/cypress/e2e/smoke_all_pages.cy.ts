/// <reference types="cypress" />

// 관리자 계정으로 주요 화면이 모두 열리는지 확인하는 간단 스모크 테스트
describe('주요 화면 스모크 테스트 (ADMIN)', () => {
  const adminId = Cypress.env('ADMIN_ID');
  const adminPw = Cypress.env('ADMIN_PW');

  if (!adminId || !adminPw) {
    it('환경변수 ADMIN_ID/ADMIN_PW가 없어 건너뜀', () => {
      cy.log('set CYPRESS_ADMIN_ID / CYPRESS_ADMIN_PW to enable this test');
    });
    return;
  }

  before(() => {
    cy.apiLogin(adminId, adminPw);
  });

  it('대시보드/수주/재고/작업지시/설비/업체/사용자 화면 열람', () => {
    cy.visit('/app/dashboard');
    cy.contains('대시보드', { matchCase: false }).should('exist');
    cy.contains('기간').should('exist');

    cy.visit('/app/orders');
    cy.contains('수주 내역').should('exist');

    cy.visit('/app/inventory');
    cy.contains('재고 현황').should('exist');

    cy.visit('/app/work/orders');
    cy.contains('작업지시 관리').should('exist');

    cy.visit('/app/equipment');
    cy.contains('설비 모니터링').should('exist');

    cy.visit('/app/admin/companies');
    cy.contains('업체 관리').should('exist');

    cy.visit('/app/admin/users');
    cy.contains('사용자 관리').should('exist');

    cy.visit('/app/profile');
    cy.contains('내 정보').should('exist');
    cy.contains('업체명').should('exist');
  });
});
