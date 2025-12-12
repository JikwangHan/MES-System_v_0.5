import axios from 'axios';
import { Modal } from 'antd';

// 401/403 반복 시 다중 표시/다중 이동을 막기 위한 플래그
let isAuthRedirecting = false;

export const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: false,
  headers: {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  const companyCode = localStorage.getItem('current_company_code');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (companyCode) {
    config.headers = config.headers || {};
    config.headers['X-Company-Code'] = companyCode;
  }
  return config;
});

// 인증 만료/권한 오류 시 공통 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const reqUrl = error?.config?.url || '';
    // 로그인/회원가입 요청에서의 401은 전역 처리하지 않고 호출한 화면에서 메시지 표시
    if (status === 401 && (reqUrl.includes('/auth/login') || reqUrl.includes('/auth/signup'))) {
      return Promise.reject(error);
    }
    if (status === 401 || status === 403) {
      // 이미 처리 중이면 중복 실행 방지
      if (!isAuthRedirecting) {
        isAuthRedirecting = true;
        // 토큰/회사코드 초기화 후 안내 메시지
        localStorage.removeItem('access_token');
        localStorage.removeItem('current_company_code');
        Modal.warning({
          title: '접근 권한이 없습니다',
          content: '다시 로그인해 주세요.',
          okText: '확인',
          centered: true,
          maskClosable: false,
          closable: false,
          onOk: () => {
            isAuthRedirecting = false;
            if (window.location.pathname !== '/') {
              window.location.href = '/';
            } else {
              window.location.reload();
            }
          },
          afterClose: () => {
            isAuthRedirecting = false;
            if (window.location.pathname !== '/') {
              window.location.href = '/';
            } else {
              window.location.reload();
            }
          },
        });
      }
    }
    return Promise.reject(error);
  },
);
