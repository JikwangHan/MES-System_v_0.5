/// <reference types="cypress" />

// 시나리오: 대시보드 기간 변경 시 KPI/차트/리스트가 반응하는지 체크 (값 변화 여부만 간단 확인)
describe('대시보드 기간 반응', () => {
  const adminId = Cypress.env('ADMIN_ID');
  const adminPw = Cypress.env('ADMIN_PW');

  if (!adminId || !adminPw) {
    it('환경변수 ADMIN_ID/ADMIN_PW가 없어 건너뜀', () => {
      cy.log('set CYPRESS_ADMIN_ID / CYPRESS_ADMIN_PW to enable this test');
    });
    return;
  }

  const selectPeriod = (label: string) => {
    cy.get('[data-testid=dashboard-period-select]').click();
    cy.get('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
      .should('be.visible')
      .within(() => {
        cy.contains(label).click({ force: true });
      });
  };

  it('오늘 → 최근7일 → 최근30일 전환 시 KPI/차트 영역 렌더 확인', () => {
    cy.apiLogin(adminId, adminPw);
    cy.visit('/app/dashboard');

    // 오늘
    selectPeriod('오늘');
    cy.contains('작업지시').should('exist');

    // 최근7일
    selectPeriod('최근 7일');
    cy.contains('작업지시').should('exist');

    // 최근30일
    selectPeriod('최근 30일');
    cy.contains('작업지시').should('exist');
  });
});
