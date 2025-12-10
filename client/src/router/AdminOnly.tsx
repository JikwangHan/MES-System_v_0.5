import { Modal } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * 관리자 전용 경로 보호용 컴포넌트
 * - SYSTEM_ADMIN이 아니면 경고 모달을 먼저 보여주고
 *   확인/닫기 시 토큰/회사코드를 제거 후 홈으로 이동합니다.
 */
type Props = {
  children: React.ReactNode;
};

export const AdminOnly = ({ children }: Props) => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'SYSTEM_ADMIN') {
      setBlocked(true);
    } else {
      setBlocked(false);
    }
  }, [user]);

  // 아직 사용자 정보 로딩 중이면 아무것도 렌더하지 않음
  if (loading) return null;

  if (blocked) {
    const handleClose = () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_company_code');
      logout();
      // 모달을 본 뒤 이동하도록 약간의 지연을 둔다.
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 0);
    };
    return (
      <Modal
        open={true}
        title="접근 권한이 없습니다!"
        okText="확인"
        centered
        onOk={handleClose}
        onCancel={handleClose}
        afterClose={handleClose}
        maskClosable={false}
        closable={false}
      >
        접근 권한이 없습니다. 관리자에게 문의하세요.
      </Modal>
    );
  }

  return <>{children}</>;
};

export default AdminOnly;
