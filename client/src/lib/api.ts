import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: false,
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
    if (status === 401 || status === 403) {
      // 토큰/회사코드 초기화 후 메인으로 이동
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_company_code');
      // 이미 루트라면 새로고침만
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  },
);
