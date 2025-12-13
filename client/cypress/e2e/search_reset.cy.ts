/// <reference types="cypress" />

// 시나리오: 설비 모니터링 화면에서 검색 → 초기화 시 입력값이 비워지고 기본 조회로 복귀
describe('검색/초기화 동작 - 설비 모니터링', () => {
  const adminId = Cypress.env('ADMIN_ID');
  const adminPw = Cypress.env('ADMIN_PW');

  if (!adminId || !adminPw) {
    it('환경변수 ADMIN_ID/ADMIN_PW가 없어 건너뜀', () => {
      cy.log('set CYPRESS_ADMIN_ID / CYPRESS_ADMIN_PW to enable this test');
    });
    return;
  }

  it('검색 후 초기화 시 입력값 비움 + 기본 조회', () => {
    // 관리자 로그인
    cy.apiLogin(adminId, adminPw);
    cy.visit('/app/equipment');

    // 검색값 입력 (data-testid 활용)
    cy.get('[data-testid=equipment-code-input]').type('EQ-TEST');
    cy.get('[data-testid=equipment-name-input]').type('테스트설비');
    cy.get('[data-testid=equipment-search-btn]').click();

    // 초기화
    cy.get('[data-testid=equipment-reset-btn]').click();

    // 입력값이 비워졌는지 확인
    cy.get('[data-testid=equipment-code-input]').should('have.value', '');
    cy.get('[data-testid=equipment-name-input]').should('have.value', '');
  });
});
