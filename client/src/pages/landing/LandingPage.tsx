import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Typography,
  message,
  Select,
} from 'antd';
import { UserOutlined, LockOutlined, CloseOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// 메인 랜딩 + 로그인/회원가입/비밀번호 변경 모달 화면 (MMS 브랜드)
const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, login, logout, signup } = useAuth();

  const initialOpen = useMemo(() => location.pathname === '/login', [location.pathname]);
  const [openLogin, setOpenLogin] = useState(initialOpen);
  const [openSignup, setOpenSignup] = useState(false);
  const [openPwChange, setOpenPwChange] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [pwChangeLoading, setPwChangeLoading] = useState(false);
  const [pwForm] = Form.useForm();
  const [signupForm] = Form.useForm();
  const [companies, setCompanies] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    setOpenLogin(initialOpen);
  }, [initialOpen]);

  // 활성 업체 목록 조회 (비로그인 상태에서도 호출)
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/companies');
        setCompanies(res.data || []);
      } catch {
        setCompanies([]);
      }
    };
    fetchCompanies();
  }, []);

  // 로그인 처리 (회사코드 입력 없이 기본 업체 코드 사용)
  const handleLogin = async (values: any) => {
    try {
      setLoginLoading(true);
      const loggedIn = await login({
        username: values.userId,
        password: values.password,
      });
      message.success('로그인되었습니다.');
      setOpenLogin(false);
      if (loggedIn?.mustChangePassword) {
        setOpenPwChange(true);
      }
      navigate('/app/dashboard');
    } catch (err: any) {
      message.error(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoginLoading(false);
    }
  };

  // 회원가입 처리 (회사코드 필드 제거, 관리자 페이지에서 업체 관리 예정)
  const handleSignup = async (values: any) => {
    if (values.password !== values.passwordConfirm) {
      message.error('비밀번호와 확인값이 일치하지 않습니다.');
      return;
    }
    try {
      setSignupLoading(true);
      await signup({
        username: values.userId,
        displayName: values.displayName,
        password: values.password,
        passwordConfirm: values.passwordConfirm,
        role: values.role,
        companyName: values.companyName,
        phone: values.phone,
      });
      message.success('회원가입이 완료되었습니다. 로그인해 주세요.');
      setOpenSignup(false);
      setOpenLogin(true);
      signupForm.resetFields();
    } catch (err: any) {
      message.error(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setSignupLoading(false);
    }
  };

  // 비밀번호 변경 처리
  const handleChangePassword = async (values: any) => {
    if (values.newPassword !== values.newPasswordConfirm) {
      message.error('새 비밀번호와 확인값이 일치하지 않습니다.');
      return;
    }
    try {
      setPwChangeLoading(true);
      await api.patch('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        newPasswordConfirm: values.newPasswordConfirm,
      });
      message.success('비밀번호가 변경되었습니다. 다시 로그인해 주세요.');
      setOpenPwChange(false);
      logout();
      navigate('/');
    } catch (err: any) {
      message.error(err.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setPwChangeLoading(false);
      pwForm.resetFields();
    }
  };

  const openLoginModal = () => {
    setOpenSignup(false);
    setOpenLogin(true);
  };
  const openSignupModal = () => {
    setOpenLogin(false);
    setOpenSignup(true);
  };
  const closeLoginModal = () => setOpenLogin(false);
  const closeSignupModal = () => setOpenSignup(false);
  const closePwChangeModal = () => setOpenPwChange(false);

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
      {/* 상단 영역: 로고/메뉴 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 32px',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700 }}>MMS</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button type="link" style={{ color: '#e9f4ff' }} onClick={() => navigate('/app/dashboard')}>
            Dashboard
          </Button>
          {!isAuthenticated && (
            <Button type="link" style={{ color: '#e9f4ff' }} onClick={openSignupModal}>
              회원가입
            </Button>
          )}
          {!isAuthenticated ? (
            <Button type="primary" onClick={openLoginModal}>
              Login
            </Button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#e9f4ff', fontWeight: 600 }}>
                {user?.displayName || user?.username}님 로그인되었습니다.
              </span>
              <Button onClick={logout}>Logout</Button>
            </div>
          )}
        </div>
      </div>

      {/* 중앙 시스템 소개 텍스트 */}
      <div style={{ textAlign: 'center', marginTop: 60, padding: '0 16px' }}>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 1 }}>MMS</div>
        <div style={{ fontSize: 20, fontWeight: 600, marginTop: 8 }}>Manufacturing Management System</div>
        <div style={{ fontSize: 14, marginTop: 10, maxWidth: 520, marginInline: 'auto' }}>
          MMS는 제조 프로세스의 품질과 효율성을 개선하는 체계적인 제조 관리 소프트웨어 솔루션입니다.
        </div>
      </div>

      {/* 로그인 모달 */}
      <Modal
        open={openLogin}
        onCancel={closeLoginModal}
        footer={null}
        centered
        width={880}
        destroyOnHidden
        closable={false}
        styles={{ mask: { backdropFilter: 'blur(2px)' }, header: { padding: 0 } }}
      >
        <Card
          style={{ padding: 0, borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
          bodyStyle={{ padding: 0 }}
        >
          <Row gutter={0}>
            <Col xs={24} md={12} style={{ padding: 32, background: '#fff' }}>
              <Title level={2} style={{ marginBottom: 8 }}>Login</Title>
              <Paragraph style={{ marginBottom: 24, color: '#6b7280' }}>Sign in to your account</Paragraph>
              <Form layout="vertical" onFinish={handleLogin}>
                <Form.Item label="아이디" name="userId" rules={[{ required: true, message: '아이디를 입력해 주세요.' }]}>
                  <Input size="large" prefix={<UserOutlined />} placeholder="아이디" />
                </Form.Item>
                <Form.Item label="비밀번호" name="password" rules={[{ required: true, message: '비밀번호를 입력해 주세요.' }]}>
                  <Input.Password size="large" prefix={<LockOutlined />} placeholder="비밀번호" />
                </Form.Item>
                <Form.Item style={{ marginBottom: 16 }}>
                  <Button type="primary" htmlType="submit" block size="large" style={{ height: 44 }} loading={loginLoading}>
                    Login
                  </Button>
                </Form.Item>
                <Form.Item noStyle>
                  <Checkbox>Remember me?</Checkbox>
                </Form.Item>
                <div style={{ marginTop: 12, textAlign: 'right' }}>
                  <Button type="link" onClick={openSignupModal} style={{ padding: 0 }}>
                    회원가입
                  </Button>
                </div>
              </Form>
            </Col>
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
                icon={<CloseOutlined />}
                onClick={closeLoginModal}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  color: '#fff',
                  background: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 16,
                  height: 28,
                  width: 28,
                  minWidth: 28,
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
              <div style={{ maxWidth: 320 }}>
                <Title level={2} style={{ color: '#fff', marginBottom: 16 }}>
                  Login
                </Title>
                <Text style={{ color: '#e6f7ff', fontSize: 14, lineHeight: 1.7, wordBreak: 'keep-all' }}>
                  <div>사전에 등록한 사용자만 로그인할 수 있습니다.</div>
                  <div>처음 접속한 경우에는</div>
                  <div>ID와 동일한 PASSWORD를 입력하고</div>
                  <div>이후 새로운 PASSWORD로 변경합니다.</div>
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </Modal>

      {/* 회원가입 모달 */}
      <Modal
        open={openSignup}
        onCancel={closeSignupModal}
        footer={null}
        centered
        width={880}
        destroyOnHidden
        closable={false}
        styles={{ mask: { backdropFilter: 'blur(2px)' }, header: { padding: 0 } }}
      >
        <Card
          style={{ padding: 0, borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
          bodyStyle={{ padding: 0 }}
        >
          <Row gutter={0}>
            <Col xs={24} md={12} style={{ padding: 32, background: '#fff' }}>
              <Title level={2} style={{ marginBottom: 8 }}>Sign Up</Title>
              <Paragraph style={{ marginBottom: 24, color: '#6b7280' }}>필수 항목을 입력하면 가입이 완료됩니다.</Paragraph>
              <Form layout="vertical" onFinish={handleSignup} form={signupForm}>
                <Form.Item
                  label="회원 구분"
                  name="role"
                  rules={[{ required: true, message: '회원 구분을 선택해 주세요.' }]}
                >
                  <Select size="large" placeholder="회원 구분을 선택해 주세요">
                    <Option value="ADMIN">관리자</Option>
                    <Option value="COMPANY_ADMIN">운영자</Option>
                    <Option value="USER">소상공인/직원</Option>
                  </Select>
                </Form.Item>
                {/* 시스템 관리자는 자유 입력, 그 외는 업체 목록에서 선택 */}
                {user?.role === 'SYSTEM_ADMIN' ? (
                  <Form.Item label="업체명" name="companyName" rules={[{ required: true, message: '업체명을 입력해 주세요.' }]}>
                    <Input size="large" placeholder="업체명" />
                  </Form.Item>
                ) : (
                  <Form.Item
                    label="업체명"
                    name="companyName"
                    rules={[{ required: true, message: '업체명을 선택해 주세요.' }]}
                  >
                    <Select
                      size="large"
                      placeholder={companies.length ? '업체 선택' : '등록된 업체를 불러오지 못했습니다.'}
                      loading={!companies.length}
                      allowClear
                      showSearch
                      optionFilterProp="children"
                    >
                      {companies.map((c) => (
                        <Option key={c.code} value={c.name}>
                          {c.name} ({c.code})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}
                <Form.Item label="아이디" name="userId" rules={[{ required: true, message: '아이디를 입력해 주세요.' }]}>
                  <Input size="large" prefix={<UserOutlined />} placeholder="아이디" />
                </Form.Item>
                <Form.Item label="이름" name="displayName" rules={[{ required: true, message: '이름을 입력해 주세요.' }]}>
                  <Input size="large" placeholder="이름" />
                </Form.Item>
                <Form.Item label="비밀번호" name="password" rules={[{ required: true, message: '비밀번호를 입력해 주세요.' }, { min: 8, message: '8자 이상 입력해 주세요.' }]}>
                  <Input.Password size="large" prefix={<LockOutlined />} placeholder="비밀번호(8자 이상)" />
                </Form.Item>
                <Form.Item
                  label="비밀번호 확인"
                  name="passwordConfirm"
                  rules={[{ required: true, message: '비밀번호 확인을 입력해 주세요.' }]}
                >
                  <Input.Password size="large" prefix={<LockOutlined />} placeholder="비밀번호 확인" />
                </Form.Item>
                <Form.Item label="연락처" name="phone">
                  <Input size="large" placeholder="연락처(선택)" />
                </Form.Item>
                <Form.Item style={{ marginBottom: 16 }}>
                  <Button type="primary" htmlType="submit" block size="large" style={{ height: 44 }} loading={signupLoading}>
                    회원가입
                  </Button>
                </Form.Item>
                <div style={{ textAlign: 'right' }}>
                  <Button type="link" onClick={openLoginModal} style={{ padding: 0 }}>
                    로그인으로 돌아가기
                  </Button>
                </div>
              </Form>
            </Col>
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
                icon={<CloseOutlined />}
                onClick={closeSignupModal}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  color: '#fff',
                  background: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 16,
                  height: 28,
                  width: 28,
                  minWidth: 28,
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
              <div style={{ maxWidth: 320 }}>
                <Title level={2} style={{ color: '#fff', marginBottom: 16 }}>
                  Sign Up
                </Title>
                <Text style={{ color: '#e6f7ff', fontSize: 14, lineHeight: 1.7, wordBreak: 'keep-all' }}>
                  <div>소상공인 대표/직원도 바로 가입할 수 있습니다.</div>
                  <div>회원 구분, 업체명, 아이디, 이름, 비밀번호를 입력하면 즉시 완료됩니다.</div>
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </Modal>

      {/* 비밀번호 변경 모달 (firstLogin, admin 기본 계정 변경 유도) */}
      <Modal
        open={openPwChange}
        onCancel={closePwChangeModal}
        footer={null}
        centered
        width={560}
        destroyOnHidden
        closable
        title="비밀번호 변경"
      >
        <Form layout="vertical" form={pwForm} onFinish={handleChangePassword}>
          <Form.Item label="현재 비밀번호" name="currentPassword" rules={[{ required: true, message: '현재 비밀번호를 입력해 주세요.' }]}>
            <Input.Password placeholder="현재 비밀번호" />
          </Form.Item>
          <Form.Item
            label="새 비밀번호"
            name="newPassword"
            rules={[{ required: true, message: '새 비밀번호를 입력해 주세요.' }, { min: 8, message: '8자 이상 입력해 주세요.' }]}
          >
            <Input.Password placeholder="새 비밀번호(8자 이상)" />
          </Form.Item>
          <Form.Item
            label="새 비밀번호 확인"
            name="newPasswordConfirm"
            rules={[{ required: true, message: '새 비밀번호 확인을 입력해 주세요.' }]}
          >
            <Input.Password placeholder="새 비밀번호 확인" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={pwChangeLoading} block>
              비밀번호 변경
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 하단 영역: 회사/링크 */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 24,
          right: 24,
          display: 'flex',
          justifyContent: 'between',
          alignItems: 'center',
          color: '#d7e9ff',
          fontSize: 13,
        }}
      >
        <span>© 2025 MMS (업체 로고/정보 교체 예정)</span>
        <span style={{ display: 'flex', gap: 16 }}>
          <a style={{ color: '#d7e9ff' }}>About Us</a>
          <a style={{ color: '#d7e9ff' }}>MMS License</a>
          <a style={{ color: '#d7e9ff' }}>MMS V0.5</a>
        </span>
      </div>
    </div>
  );
};

export default LandingPage;
