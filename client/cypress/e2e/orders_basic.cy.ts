/// <reference types="cypress" />

// 수주 화면 기본 요소 및 검색/초기화/새로고침 버튼 동작 확인
describe('수주 화면 기본 검증', () => {
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

  it('수주 화면 필수 입력/버튼 확인 및 검색/초기화', () => {
    cy.visit('/app/orders');
    cy.contains('수주 내역').should('exist');

    cy.get('[data-testid=orders-code-input]').should('exist').type('TEST');
    cy.get('[data-testid=orders-customer-input]').should('exist').type('고객');
    cy.get('[data-testid=orders-item-input]').should('exist').type('품목');
    // 상태/날짜 선택은 드롭다운 개수에 따라 다중 선택자가 생길 수 있으므로 기본 표시만 확인
    cy.get('[data-testid=orders-status-select]').should('exist');
    cy.get('[data-testid=orders-due-range]').should('exist');

    cy.get('[data-testid=orders-search-btn]').click();
    cy.get('[data-testid=orders-refresh-btn]').click();
    cy.get('[data-testid=orders-reset-btn]').click();

    // 테이블 존재 확인
    cy.get('.ant-table').should('exist');
  });
});
