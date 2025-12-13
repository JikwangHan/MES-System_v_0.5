/// <reference types="cypress" />

// 재고 화면 기본 요소 및 검색/초기화/새로고침 버튼 동작 확인
describe('재고 화면 기본 검증', () => {
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

  it('재고 화면 필수 입력/버튼 확인 및 검색/초기화', () => {
    cy.visit('/app/inventory');
    cy.contains('재고 현황').should('exist');

    cy.get('[data-testid=inv-itemcode-input]').should('exist').type('ITEM');
    cy.get('[data-testid=inv-itemname-input]').should('exist').type('품목');
    cy.get('[data-testid=inv-warehouse-input]').should('exist').type('창고');
    cy.get('[data-testid=inv-status-select]').should('exist');

    cy.get('[data-testid=inv-search-btn]').click();
    cy.get('[data-testid=inv-refresh-btn]').click();
    cy.get('[data-testid=inv-reset-btn]').click();

    cy.get('.ant-table').should('exist');
  });
});
