import { Layout, Menu, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { DashboardOutlined, ProfileOutlined, DatabaseOutlined, UserOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;

// AppLayout은 로그인 후 공통 레이아웃을 담당합니다.
// 좌측 메뉴와 상단 헤더를 제공하고, 오른쪽 Content 영역에 자식 라우트가 표시됩니다.
const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = useMemo(
    () => [
      {
        key: 'dashboard',
        label: '대시보드',
        icon: <DashboardOutlined />,
        path: '/app/dashboard',
      },
      {
        key: 'orders',
        label: '수주내역',
        icon: <ProfileOutlined />,
        path: '/app/orders',
      },
      {
        key: 'inventory',
        label: '재고현황',
        icon: <DatabaseOutlined />,
        path: '/app/inventory',
      },
      {
        key: 'profile',
        label: '내 정보',
        icon: <UserOutlined />,
        path: '/app/profile',
      },
      // TODO: 품목/BOM/공정, 작업, 품질, 설비/모니터링, 시스템관리 메뉴 추가
    ],
    [],
  );

  const selectedKey = useMemo(() => {
    const found = menuItems.find((item) => location.pathname.startsWith(item.path));
    return found ? found.key : 'dashboard';
  }, [location.pathname, menuItems]);

  const onMenuClick = (key: string) => {
    const target = menuItems.find((item) => item.key === key);
    if (target) navigate(target.path);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Sider width={220} theme="light" style={{ borderRight: '1px solid #e5e5e5' }}>
        <div style={{ padding: 16, fontWeight: 700 }}>MMS v0.5</div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={(info) => onMenuClick(info.key)}
          items={menuItems.map((item) => ({
            key: item.key,
            label: item.label,
            icon: item.icon,
          }))}
        />
      </Sider>
      <Layout style={{ background: '#f5f5f5' }}>
        <Header
          style={{
            background: '#fff',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          <div style={{ fontWeight: 600 }}>스마트 팩토리 MMS 웹서버</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#4b5563' }}>
              {user?.displayName || user?.username}님 로그인 되었습니다.
            </span>
            <Button size="small" onClick={() => { logout(); navigate('/'); }}>
              Logout
            </Button>
          </div>
        </Header>
        <Content style={{ padding: 24 }}>
          <div
            style={{
              maxWidth: 1280,
              margin: '0 auto',
              background: '#fff',
              padding: 16,
              minHeight: 'calc(100vh - 120px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              borderRadius: 8,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
