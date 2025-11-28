import { useNavigate } from 'react-router-dom';
import { Button, Card, Checkbox, Col, Form, Input, Row, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

// 메인 랜딩 + 로그인 팝업 화면
// - 전체 배경에 그라데이션과 시스템 소개를 배치
// - 중앙 팝업 카드에 로그인 폼(좌) + 안내문(우)을 배치
// - 현재는 로그인 버튼 클릭 시 /app/dashboard로 이동 (추후 실제 인증 연동 예정)
const LoginPage = () => {
  const navigate = useNavigate();

  const onFinish = () => {
    // TODO: 실제 로그인 API 연동 예정 (Axios + 토큰 저장 + 라우트 보호)
    navigate('/app/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'linear-gradient(135deg, #0b4ea2 0%, #0c7cd5 50%, #0e5fb3 100%)',
      }}
    >
      {/* 상단 소개 영역 */}
      <div
        style={{
          position: 'absolute',
          top: 48,
          width: '100%',
          textAlign: 'center',
          color: '#e9f4ff',
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 1 }}>MES</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>Manufacturing Execution Systems</div>
        <div style={{ fontSize: 14, marginTop: 8 }}>생산 프로세스의 품질과 효율성을 개선하는 체계적인 솔루션입니다.</div>
      </div>

      {/* 중앙 로그인 팝업 카드 */}
      <Card
        style={{
          width: 860,
          maxWidth: '95vw',
          padding: 0,
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          borderRadius: 8,
          overflow: 'hidden',
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
            }}
          >
            <div style={{ maxWidth: 260 }}>
              <Title level={2} style={{ color: '#fff', marginBottom: 12 }}>
                Login
              </Title>
              <Text style={{ color: '#e6f7ff', fontSize: 14, lineHeight: 1.6 }}>
                사전에 등록한 사용자만 로그인할 수 있습니다.<br />
                처음 접속한 경우에는 ID와 동일한 PASSWORD를 입력하고 이후 새로운 PASSWORD로 변경합니다.
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 하단 푸터 (옵션) */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          color: '#d7e9ff',
          fontSize: 13,
        }}
      >
        <span>© 2025 MES System</span>
        <span>About Us</span>
        <span>MIT License</span>
      </div>
    </div>
  );
};

export default LoginPage;
