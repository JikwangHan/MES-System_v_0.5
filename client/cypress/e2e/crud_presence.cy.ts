/// <reference types="cypress" />

// CRUD/검색 버튼이 기본적으로 화면에 노출되는지 최소 확인하는 안전한 스모크
describe('CRUD/검색 버튼 기본 노출 확인', () => {
  const adminId = Cypress.env('ADMIN_ID');
  const adminPw = Cypress.env('ADMIN_PW');

  if (!adminId || !adminPw) {
    it('ADMIN 환경변수 없음으로 스킵', () => {
      cy.log('set CYPRESS_ADMIN_ID / CYPRESS_ADMIN_PW to enable this test');
    });
    return;
  }

  const pages: Array<{ path: string; heading: RegExp }> = [
    { path: '/app/orders', heading: /수주/ },
    { path: '/app/inventory', heading: /재고/ },
    { path: '/app/work/orders', heading: /작업지시/ },
    { path: '/app/equipment', heading: /설비/ },
    { path: '/app/admin/companies', heading: /업체/ },
  ];

  before(() => {
    cy.apiLogin(adminId, adminPw);
  });

  pages.forEach(({ path, heading }) => {
    it(`${path} 화면에서 기본 버튼 노출 확인`, () => {
      cy.visit(path);
      cy.contains(heading, { timeout: 8000 }).should('exist');

      // "추가", "검색", "초기화" 중 하나라도 존재하는지만 느슨하게 확인
      cy.contains(/추가/, { matchCase: false, timeout: 8000 }).should('exist');
      cy.contains(/검색/, { matchCase: false, timeout: 8000 }).should('exist');
      cy.contains(/초기화/, { matchCase: false, timeout: 8000 }).should('exist');
    });
  });
});
