import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * 회사 코드(테넌트 코드)를 전역적으로 동기화하는 훅
 * - SYSTEM_ADMIN: 기본값을 항상 ALL로 설정
 * - COMPANY_ADMIN/USER: 자신의 회사 코드로 고정
 * - company-code-changed, storage 이벤트를 수신하여 다른 컴포넌트와 동기화
 */
export const useCompanyCode = () => {
  const { user } = useAuth();
  const [companyCode, setCompanyCodeState] = useState<string>(() => {
    return localStorage.getItem('current_company_code') || 'ALL';
  });

  // 외부에서 회사 코드를 설정하고 이벤트를 발행
  const setCompanyCode = useCallback((code: string) => {
    setCompanyCodeState((prev) => {
      // 이미 같은 값이면 상태/이벤트를 발생시키지 않아 무한 루프 방지
      if (prev === code) return prev;
      localStorage.setItem('current_company_code', code);
      window.dispatchEvent(new Event('company-code-changed'));
      return code;
    });
  }, []);

  // 사용자 정보가 바뀔 때 기본값 정리
  useEffect(() => {
    if (!user) return;
    if (user.role === 'SYSTEM_ADMIN') {
      setCompanyCode('ALL'); // 관리자 기본값은 항상 ALL
    } else if (user.company?.code) {
      setCompanyCode(user.company.code); // 업체 관리/사용자는 자신의 회사로 고정
    }
  }, [user, setCompanyCode]);

  // 이벤트 리스너: 다른 컴포넌트/탭에서 변경 시 동기화
  useEffect(() => {
    const handler = () => {
      const code = localStorage.getItem('current_company_code') || 'ALL';
      // 동일 값이면 상태 변경 스킵하여 무한루프 방지
      setCompanyCodeState((prev) => (prev === code ? prev : code));
    };
    window.addEventListener('company-code-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('company-code-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return { companyCode, setCompanyCode };
};

export default useCompanyCode;
