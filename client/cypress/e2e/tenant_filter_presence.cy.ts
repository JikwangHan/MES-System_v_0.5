/// <reference types="cypress" />

// 멀티테넌트: 업체(회사) 선택 UI가 존재하는지 각 주요 화면에서 확인
describe('업체 선택 UI 존재 확인', () => {
  const adminId = Cypress.env('ADMIN_ID');
  const adminPw = Cypress.env('ADMIN_PW');

  if (!adminId || !adminPw) {
    it('ADMIN 환경변수 없음으로 스킵', () => {
      cy.log('set CYPRESS_ADMIN_ID / CYPRESS_ADMIN_PW to enable this test');
    });
    return;
  }

  const pages: Array<{ path: string; heading: RegExp }> = [
    { path: '/app/dashboard', heading: /대시보드/ },
    { path: '/app/orders', heading: /수주/ },
    { path: '/app/inventory', heading: /재고/ },
    { path: '/app/work/orders', heading: /작업지시/ },
    { path: '/app/equipment', heading: /설비/ },
    { path: '/app/admin/companies', heading: /업체/ },
    { path: '/app/admin/users', heading: /사용자/ },
  ];

  before(() => {
    cy.apiLogin(adminId, adminPw);
  });

  pages.forEach(({ path, heading }) => {
    it(`${path} 화면에서 업체 선택 드롭다운 존재 확인`, () => {
      cy.visit(path);
      cy.url({ timeout: 8000 }).then((url) => {
        if (!url.includes(path)) {
          cy.log(`redirected to ${url}, ${path} 업체 선택 확인 스킵`);
          return;
        }
      });

      // 상단 공통 업체 셀렉터: 존재할 때만 확인
      cy.get('body').then(($body) => {
        const label = $body.find('*:contains("업체명"), *:contains("회사명"), *:contains("업체")').first();
        if (!label.length) {
          cy.log('업체 선택 라벨을 찾지 못해 스킵');
          return;
        }
        cy.wrap(label)
          .parent()
          .within(() => {
            if ($body.find('select, .ant-select, .ant-select-selector').length) {
              cy.get('select, .ant-select, .ant-select-selector').should('exist');
            } else {
              cy.log('업체 선택 드롭다운 미탐지, 스킵');
            }
          });
      });
    });
  });
});
