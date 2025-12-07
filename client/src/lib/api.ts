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
