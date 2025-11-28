import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Checkbox, Col, Form, Input, Modal, Row, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useMemo, useState, useEffect } from 'react';

const { Title, Paragraph, Text } = Typography;

// 메인 랜딩 + 로그인 팝업 화면
// - 전체 배경에 그라데이션과 시스템 소개를 배치
// - 상단 좌측 로고, 우측 메뉴(Dashboard/회원가입/Login)
// - 하단 좌측 회사명, 우측 링크(About Us, MES License, EMS V0.5)
// - 로그인 버튼 또는 /login 진입 시 로그인 모달 오픈
const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialOpen = useMemo(() => location.pathname === '/login', [location.pathname]);
  const [open, setOpen] = useState(initialOpen);

  useEffect(() => {
    setOpen(initialOpen);
  }, [initialOpen]);

  const onFinish = () => {
    // TODO: 실제 로그인 API 연동 예정 (Axios + 토큰 저장 + 라우트 보호)
    navigate('/app/dashboard');
  };

  const openLogin = () => setOpen(true);
  const closeLogin = () => setOpen(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        color: '#e9f4ff',
        background: 'linear-gradient(180deg, #0b4ea2 0%, #0c7cd5 45%, #063763 100%)',
        overflow: 'hidden',
      }}
    >
      {/* 상단 바: 로고/메뉴 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 32px',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700 }}>MES Logo</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button type="link" style={{ color: '#e9f4ff' }} onClick={() => navigate('/app/dashboard')}>
            Dashboard
          </Button>
          <Button type="link" style={{ color: '#e9f4ff' }}>
            회원가입
          </Button>
          <Button type="primary" onClick={openLogin}>
            Login
          </Button>
        </div>
      </div>

      {/* 중앙 소개 텍스트 */}
      <div style={{ textAlign: 'center', marginTop: 60, padding: '0 16px' }}>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 1 }}>MES</div>
        <div style={{ fontSize: 20, fontWeight: 600, marginTop: 8 }}>Manufacturing Execution Systems</div>
        <div style={{ fontSize: 14, marginTop: 10, maxWidth: 520, marginInline: 'auto' }}>
          MES는 제조 프로세스의 품질과 효율성을 개선하는 체계적인 소프트웨어 솔루션입니다.
        </div>
      </div>

      {/* 로그인 팝업 모달 */}
      <Modal
        open={open}
        onCancel={closeLogin}
        footer={null}
        centered
        width={880}
        destroyOnClose
        closable={false}
        styles={{ mask: { backdropFilter: 'blur(2px)' }, header: { padding: 0 } }}
      >
        <Card
          style={{
            padding: 0,
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Row gutter={0}>
            {/* 로그인 폼 영역 */}
            <Col xs={24} md={12} style={{ padding: 32, background: '#fff' }}>
              <Title level={2} style={{ marginBottom: 8 }}>Login</Title>
              <Paragraph style={{ marginBottom: 24, color: '#6b7280' }}>Sign in to your account</Paragraph>
              <Form layout="vertical" onFinish={onFinish}>
                <Form.Item
                  label="아이디"
                  name="userId"
                  rules={[{ required: true, message: '아이디를 입력하세요.' }]}
                >
                  <Input size="large" prefix={<UserOutlined />} placeholder="아이디" />
                </Form.Item>
                <Form.Item
                  label="비밀번호"
                  name="password"
                  rules={[{ required: true, message: '비밀번호를 입력하세요.' }]}
                >
                  <Input.Password size="large" prefix={<LockOutlined />} placeholder="비밀번호" />
                </Form.Item>
                <Form.Item style={{ marginBottom: 16 }}>
                  <Button type="primary" htmlType="submit" block size="large" style={{ height: 44 }}>
                    Login
                  </Button>
                </Form.Item>
                <Form.Item noStyle>
                  <Checkbox>Remember me?</Checkbox>
                </Form.Item>
              </Form>
            </Col>
            {/* 안내 영역 */}
            <Col
              xs={24}
              md={12}
              style={{
                background: '#10a0e3',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 32,
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <Button
                type="text"
                onClick={closeLogin}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  color: '#fff',
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 12,
                  padding: '2px 10px',
                  height: 'auto',
                  lineHeight: 1.4,
                }}
              >
                닫기 ✕
              </Button>
              <div style={{ maxWidth: 300 }}>
                <Title level={2} style={{ color: '#fff', marginBottom: 16 }}>
                  Login
                </Title>
                <Text style={{ color: '#e6f7ff', fontSize: 14, lineHeight: 1.7, whiteSpace: 'nowrap' }}>
                  사전에 등록한 사용자만 로그인할 수 있습니다.<br />
                  처음 접속한 경우에는<br />
                  ID와 동일한 PASSWORD를 입력하고<br />
                  이후 새로운 PASSWORD로 변경합니다.
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </Modal>

      {/* 하단 영역: 회사/링크 */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 24,
          right: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#d7e9ff',
          fontSize: 13,
        }}
      >
        <span>© 2025 위드위 (추후 로고 교체 가능)</span>
        <span style={{ display: 'flex', gap: 16 }}>
          <a style={{ color: '#d7e9ff' }}>About Us</a>
          <a style={{ color: '#d7e9ff' }}>MES License</a>
          <a style={{ color: '#d7e9ff' }}>EMS V0.5</a>
        </span>
      </div>
    </div>
  );
};

export default LandingPage;
