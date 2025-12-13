/// <reference types="cypress" />

// 작업지시 화면 기본 요소 및 검색/초기화/새로고침 버튼 동작 확인
describe('작업지시 화면 기본 검증', () => {
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

  it('작업지시 화면 필수 입력/버튼 확인 및 검색/초기화', () => {
    cy.visit('/app/work/orders');
    cy.contains('작업지시 관리').should('exist');

    cy.get('[data-testid=work-code-input]').should('exist').type('WO');
    cy.get('[data-testid=work-item-input]').should('exist').type('품목');
    cy.get('[data-testid=work-status-select]').should('exist');
    cy.get('[data-testid=work-due-range]').should('exist');

    cy.get('[data-testid=work-search-btn]').click();
    cy.get('[data-testid=work-refresh-btn]').click();
    cy.get('[data-testid=work-reset-btn]').click();

    cy.get('.ant-table').should('exist');
  });
});
