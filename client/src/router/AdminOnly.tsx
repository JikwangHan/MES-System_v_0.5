import { Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * 관리자 전용 경로 보호용 컴포넌트
 * - SYSTEM_ADMIN이 아니면 경고 모달을 먼저 보여주고
 *   확인/닫기 시 토큰/회사코드를 제거 후 홈으로 이동합니다.
 */
type Props = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

export const AdminOnly = ({ children, allowedRoles = ['SYSTEM_ADMIN'] }: Props) => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [blocked, setBlocked] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    if (user && !allowedRoles.includes(user.role)) {
      setBlocked(true);
    } else {
      setBlocked(false);
    }
  }, [user, allowedRoles]);

  // 아직 사용자 정보 로딩 중이면 아무것도 렌더하지 않음
  if (loading) return null;

  useEffect(() => {
    if (!blocked) {
      shownRef.current = false;
      return;
    }
    if (shownRef.current) return;
    shownRef.current = true;
    const handleClose = () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_company_code');
      logout();
      navigate('/', { replace: true });
    };
    Modal.warning({
      title: '접근 권한이 없습니다!',
      content: '관리자에게 문의하세요.',
      okText: '확인',
      centered: true,
      maskClosable: false,
      closable: false,
      onOk: handleClose,
      onCancel: handleClose,
      afterClose: handleClose,
    });
  }, [blocked, logout, navigate]);

  if (blocked) return null;

  return <>{children}</>;
};

export default AdminOnly;
