import { Layout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { DashboardOutlined, ProfileOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useMemo } from 'react';

const { Header, Sider, Content } = Layout;

// AppLayout은 로그인 후 공통 레이아웃을 담당합니다.
// 좌측 메뉴와 상단 헤더를 제공하고, 오른쪽 Content 영역에 자식 라우트가 표시됩니다.
const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 메뉴 정의: key에 SCR 코드나 화면 ID를 넣어두면 추적이 쉽습니다.
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
      // TODO: 품목/BOM/공정, 작업, 품질, 설비/모니터링, 시스템관리 메뉴 추가
    ],
    [],
  );

  // 현재 경로에 따라 메뉴 선택 상태를 유지
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
        <div style={{ padding: 16, fontWeight: 700 }}>MES System v0.5</div>
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
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          {/* 추후: 사용자 정보, 로그아웃, 알림 아이콘 등을 배치 */}
          <div style={{ fontWeight: 600 }}>스마트 팩토리 MES 웹서버</div>
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
            {/* 자식 라우트가 이 영역에 렌더링됩니다. */}
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
