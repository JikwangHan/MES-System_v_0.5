import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message, Row, Col, Table, Alert } from 'antd';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

// 내 정보 조회/수정 + 비밀번호 변경 + 로그인 이력 표시 화면
const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profileForm] = Form.useForm();
  const [pwForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const fetchMe = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users/me');
      profileForm.setFieldsValue({
        displayName: data.displayName,
        phone: data.phone,
      });
      updateUser(data);
    } catch (err: any) {
      message.error(err.response?.data?.message || '내 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/users/me/history?limit=10');
      setHistory(data);
    } catch (err: any) {
      message.error(err.response?.data?.message || '로그인 이력을 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    fetchMe();
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onUpdateProfile = async (values: any) => {
    try {
      setLoading(true);
      const payload = { displayName: values.displayName, phone: values.phone };
      const { data } = await api.patch('/users/me', payload);
      updateUser(data);
      message.success('내 정보가 수정되었습니다.');
    } catch (err: any) {
      message.error(err.response?.data?.message || '수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (values: any) => {
    if (values.newPassword !== values.newPasswordConfirm) {
      message.error('새 비밀번호와 확인이 일치하지 않습니다.');
      return;
    }
    try {
      setPwLoading(true);
      await api.patch('/auth/change-password', values);
      message.success('비밀번호가 변경되었습니다. 다시 로그인해 주세요.');
    } catch (err: any) {
      message.error(err.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setPwLoading(false);
      pwForm.resetFields();
    }
  };

  const historyColumns = [
    { title: '시간', dataIndex: 'loginAt', key: 'loginAt' },
    { title: '성공', dataIndex: 'success', key: 'success', render: (v: boolean) => (v ? '성공' : '실패') },
    { title: '사유', dataIndex: 'failReason', key: 'failReason', render: (v: string) => v || '-' },
    { title: 'IP', dataIndex: 'ip', key: 'ip', render: (v: string) => v || '-' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card title="내 정보" loading={loading}>
        <Form form={profileForm} layout="vertical" onFinish={onUpdateProfile}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="아이디" initialValue={user?.username}>
                <Input value={user?.username} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="역할" initialValue={user?.role}>
                <Input value={user?.role} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="이름" name="displayName" rules={[{ required: true, message: '이름을 입력하세요.' }]}>
                <Input placeholder="이름" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="연락처" name="phone">
                <Input placeholder="연락처" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="업체명">
                <Input value={user?.company?.name ? `${user.company.name} (${user.company.code})` : '-'} disabled />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              저장
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="비밀번호 변경">
        <Form form={pwForm} layout="vertical" onFinish={onChangePassword}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="현재 비밀번호"
                name="currentPassword"
                rules={[{ required: true, message: '현재 비밀번호를 입력하세요.' }]}
              >
                <Input.Password placeholder="현재 비밀번호" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="새 비밀번호"
                name="newPassword"
                rules={[{ required: true, message: '새 비밀번호를 입력하세요.' }, { min: 8, message: '8자 이상 입력하세요.' }]}
              >
                <Input.Password placeholder="새 비밀번호(8자 이상)" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="새 비밀번호 확인"
                name="newPasswordConfirm"
                rules={[{ required: true, message: '새 비밀번호 확인을 입력하세요.' }]}
              >
                <Input.Password placeholder="새 비밀번호 확인" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={pwLoading}>
              비밀번호 변경
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="보안 정보">
        <div>마지막 로그인: {user?.lastLoginAt || '-'} </div>
        <div>비밀번호 변경일: {user?.lastPasswordChangedAt || '-'}</div>
        {user?.mustChangePassword && (
          <Alert
            style={{ marginTop: 12 }}
            type="warning"
            title="보안을 위해 비밀번호를 변경해 주세요."
            showIcon
          />
        )}
      </Card>

      <Card title="로그인 이력 (최근 10건)">
        <Table rowKey="id" dataSource={history} columns={historyColumns} pagination={false} size="small" />
      </Card>
    </div>
  );
};

export default ProfilePage;
