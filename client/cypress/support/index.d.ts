/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * 백엔드 /auth/login API로 로그인 후 access_token을 localStorage에 설정합니다.
     * @param username 로그인 아이디
     * @param password 로그인 비밀번호
     */
    apiLogin(username: string, password: string): Chainable<void>;
    /**
     * localStorage에 access_token을 직접 주입합니다.
     */
    setToken(token: string): Chainable<void>;
  }
}

export {};
