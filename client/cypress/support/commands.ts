// 공통 명령: API 로그인 후 토큰을 localStorage에 저장
// 환경 변수 필요: CYPRESS_ADMIN_USER, CYPRESS_ADMIN_PW, CYPRESS_COMPANY_USER, CYPRESS_COMPANY_PW, CYPRESS_USER, CYPRESS_USER_PW
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      apiLogin(username: string, password: string): Chainable<void>;
      setToken(token: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('apiLogin', (username: string, password: string) => {
  cy.request('POST', 'http://localhost:3000/auth/login', { username, password }).then((res) => {
    const token = res.body?.token;
    if (token) {
      cy.setToken(token);
    }
  });
});

Cypress.Commands.add('setToken', (token: string) => {
  cy.window().then((win) => {
    win.localStorage.setItem('access_token', token);
  });
});

export {};
