/// <reference types="cypress" />

// 업체/사용자 관리 화면 기본 요소 및 검색/초기화/새로고침 버튼 동작 확인
describe('업체/사용자 관리 화면 기본 검증', () => {
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

  it('업체 관리 화면 입력/버튼 확인 및 검색/초기화', () => {
    cy.visit('/app/admin/companies');
    cy.contains('업체 관리').should('exist');

    cy.get('[data-testid=company-code-input]').should('exist').type('CODE');
    cy.get('[data-testid=company-name-input]').should('exist').type('업체명');
    cy.get('[data-testid=company-status-select]').click().get('.ant-select-item-option').first().click();

    cy.get('[data-testid=company-add-btn]').should('exist');
    cy.get('[data-testid=company-search-btn]').click();
    cy.get('[data-testid=company-refresh-btn]').click();
    cy.get('[data-testid=company-reset-btn]').click();

    cy.get('.ant-table').should('exist');
  });

  it('사용자 관리 화면 입력/버튼 확인 및 검색/초기화', () => {
    cy.visit('/app/admin/users');
    // 페이지 로딩이 늦는 경우를 대비해 버튼 존재 여부로 먼저 확인
    cy.get('[data-testid=user-search-btn]', { timeout: 8000 }).should('exist');
    cy.contains('사용자 관리', { timeout: 8000 }).should('exist');

    cy.get('[data-testid=user-username-input]').should('exist').type('user');
    cy.get('[data-testid=user-displayname-input]').should('exist').type('이름');
    cy.get('[data-testid=user-role-select]').click().get('.ant-select-item-option').first().click();
    cy.get('[data-testid=user-status-select]').click().get('.ant-select-item-option').first().click();
    cy.get('[data-testid=user-company-select]').click().get('.ant-select-item-option').first().click();

    cy.get('[data-testid=user-add-btn]').should('exist');
    cy.get('[data-testid=user-search-btn]').click();
    cy.get('[data-testid=user-refresh-btn]').click();
    cy.get('[data-testid=user-reset-btn]').click();

    cy.get('.ant-table').should('exist');
  });
});
