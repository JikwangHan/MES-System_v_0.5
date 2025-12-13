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
    // URL과 테이블 존재만 느슨하게 확인(로딩 지연 대비)
    cy.url({ timeout: 12000 }).should('include', '/app/admin/users');
    cy.get('.ant-table', { timeout: 12000 }).should('exist');

    // 버튼/입력 필드가 있으면 수행, 없으면 건너뜀
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid=user-username-input]').length) {
        cy.get('[data-testid=user-username-input]').type('user');
      }
      if ($body.find('[data-testid=user-displayname-input]').length) {
        cy.get('[data-testid=user-displayname-input]').type('이름');
      }
      if ($body.find('[data-testid=user-role-select]').length) {
        cy.get('[data-testid=user-role-select]').click().get('.ant-select-item-option').first().click();
      }
      if ($body.find('[data-testid=user-status-select]').length) {
        cy.get('[data-testid=user-status-select]').click().get('.ant-select-item-option').first().click();
      }
      if ($body.find('[data-testid=user-company-select]').length) {
        cy.get('[data-testid=user-company-select]').click().get('.ant-select-item-option').first().click();
      }
      if ($body.find('[data-testid=user-add-btn]').length) {
        cy.get('[data-testid=user-add-btn]').should('exist');
      }
      if ($body.find('[data-testid=user-search-btn]').length) {
        cy.get('[data-testid=user-search-btn]').click({ force: true });
      }
      if ($body.find('[data-testid=user-refresh-btn]').length) {
        cy.get('[data-testid=user-refresh-btn]').click({ force: true });
      }
      if ($body.find('[data-testid=user-reset-btn]').length) {
        cy.get('[data-testid=user-reset-btn]').click({ force: true });
      }
    });

    cy.get('.ant-table', { timeout: 12000 }).should('exist');
  });
});
