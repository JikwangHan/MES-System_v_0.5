import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 인증이 필요한 경로에서 사용. 토큰/유저가 없으면 메인으로 이동.
const ProtectedRoute = () => {
  const { isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // 로그인 여부만 판단 (권한 체크는 각 페이지/AdminOnly에서 처리)
    if (!isAuthenticated && !loading) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (token) {
        logout();
      }
    }
    setChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, loading, location.pathname]);

  // 로딩 중이거나 아직 판단 전이면 렌더 지연
  if (loading || !checked) return null;

  // 로그인 안 된 경우 → 메인으로 이동
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
