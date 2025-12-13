/// <reference types="cypress" />

// 설비 모니터링 화면 기본 요소 및 검색/초기화/새로고침 버튼 동작 확인
describe('설비 모니터링 화면 기본 검증', () => {
  const adminId = Cypress.env('ADMIN_ID');
  const adminPw = Cypress.env('ADMIN_PW');

  if (!adminId || !adminPw) {
    it('ADMIN 환경변수 없음으로 스킵', () => {
      cy.log('set CYPRESS_ADMIN_ID / CYPRESS_ADMIN_PW to enable this test');
    });
    return;
  }

  before(() => {
    cy.apiLogin(adminId, adminPw);
  });

  it('설비 화면 필수 입력/버튼 확인 및 검색/초기화', () => {
    cy.visit('/app/equipment');
    cy.contains('설비 모니터링').should('exist');

    cy.get('[data-testid=equipment-code-input]').should('exist').type('EQ');
    cy.get('[data-testid=equipment-name-input]').should('exist').type('설비명');

    cy.get('[data-testid=equipment-search-btn]').click();
    cy.get('[data-testid=equipment-refresh-btn]').click();
    cy.get('[data-testid=equipment-reset-btn]').click();

    cy.get('.ant-table').should('exist');
  });
});
