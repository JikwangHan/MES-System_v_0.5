import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

type User = {
  id: number;
  username: string;
  displayName: string;
  role: string;
  isActive: boolean;
  isLocked?: boolean;
  company?: { id: number; code: string; name: string };
  phone?: string | null;
  lastLoginAt?: string | null;
};

type Company = {
  id: number;
  code: string;
  name: string;
  status: string;
};

type UserForm = {
  id?: number;
  username: string;
  displayName: string;
  password?: string;
  role: string;
  isActive: boolean;
  phone?: string;
  companyCode?: string;
};

const roleLabel = (role: string) => {
  if (role === 'SYSTEM_ADMIN') return '시스템 관리자';
  if (role === 'COMPANY_ADMIN') return '회사 관리자';
  return '사용자';
};

const statusLabel = (active: boolean) => (active ? '사용' : '사용정지');
const statusColor = (active: boolean) => (active ? 'green' : 'orange');
const lockLabel = (locked?: boolean) => (locked ? '잠금' : '정상');
const lockColor = (locked?: boolean) => (locked ? 'volcano' : 'green');
const dateFormat = (val?: string | null) => (val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '');

// 사용자 관리 화면 (SYSTEM_ADMIN: 전체, COMPANY_ADMIN: 자신의 회사만)
const UserListPage = () => {
  const { user } = useAuth();
  const isSystem = user?.role === 'SYSTEM_ADMIN';
  const isCompanyAdmin = user?.role === 'COMPANY_ADMIN';

  const [data, setData] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm<UserForm>();
  const [searchForm] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [search, setSearch] = useState<{ username?: string; displayName?: string; role?: string; isActive?: string; companyCode?: string }>({});

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchUser = search.username ? row.username.toLowerCase().includes(search.username.toLowerCase()) : true;
      const matchName = search.displayName ? row.displayName.toLowerCase().includes(search.displayName.toLowerCase()) : true;
      const matchRole = search.role ? row.role === search.role : true;
      const matchActive = search.isActive ? String(row.isActive) === search.isActive : true;
      const matchCompany = search.companyCode ? row.company?.code === search.companyCode : true;
      return matchUser && matchName && matchRole && matchActive && matchCompany;
    });
  }, [data, search]);

  const fetchCompanies = async () => {
    if (!isSystem) return;
    try {
      const res = await api.get<Company[]>('/admin/companies');
      setCompanies(res.data);
    } catch {
      // 회사 목록 실패는 무시(선택 옵션)
    }
  };

  const fetchUsers = async (criteria = search) => {
    try {
      setLoading(true);
      setError(null);
      if (isSystem) {
        const companyCode = criteria.companyCode || undefined;
        const res = await api.get<User[]>('/admin/users', { params: { companyCode } });
        setData(res.data);
      } else if (isCompanyAdmin) {
        const res = await api.get<User[]>('/company/users');
        setData(res.data);
      } else {
        setError('접근 권한이 없습니다.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '사용자 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSystem) fetchCompanies();
  }, [isSystem]);

  useEffect(() => {
    if (isSystem || isCompanyAdmin) fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  if (!isSystem && !isCompanyAdmin) {
    return (
      <Alert
        message="접근 권한이 없습니다."
        description="사용자 관리는 시스템 관리자 또는 회사 관리자만 확인할 수 있습니다."
        type="warning"
        showIcon
      />
    );
  }

  const openCreate = () => {
    setModalMode('create');
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
      role: 'USER',
    });
    setModalOpen(true);
  };

  const openEdit = (record: User) => {
    setModalMode('edit');
    form.resetFields();
    form.setFieldsValue({
      id: record.id,
      username: record.username,
      displayName: record.displayName,
      role: record.role,
      isActive: record.isActive,
      phone: record.phone || '',
      companyCode: record.company?.code,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: UserForm) => {
    try {
      setSubmitLoading(true);
      if (modalMode === 'create') {
        if (!isSystem) {
          message.warning('사용자 생성은 시스템 관리자만 가능합니다.');
          return;
        }
        await api.post('/admin/users', {
          username: values.username,
          displayName: values.displayName,
          password: values.password,
          role: values.role,
          companyCode: values.companyCode || user?.companyName,
          phone: values.phone,
        });
        message.success('사용자를 추가했습니다.');
      } else {
        if (!isSystem) {
          message.warning('사용자 수정은 시스템 관리자만 가능합니다.');
          return;
        }
        await api.patch(`/admin/users/${values.id}`, {
          displayName: values.displayName,
          phone: values.phone,
          role: values.role,
          isActive: values.isActive,
        });
        message.success('사용자 정보를 수정했습니다.');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      message.error(err.response?.data?.message || '처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUnlock = async (userId: number) => {
    try {
      setLoading(true);
      await api.patch(`/admin/users/${userId}`, { isLocked: false });
      message.success('잠금이 해제되었습니다.');
      fetchUsers();
    } catch (err: any) {
      message.error(err.response?.data?.message || '잠금 해제 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 8, textAlign: 'center' }}>
        사용자 관리
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12, textAlign: 'center' }}>
        시스템 관리자/회사 관리자 전용 화면입니다. 사용자 목록을 조회하고, 역할/상태를 관리할 수 있습니다.
      </Typography.Paragraph>

      {/* 검색 영역: 한 줄에 필터들을 정렬 */}
      <Form
        id="userSearchForm"
        form={searchForm}
        layout="inline"
        initialValues={search}
        onFinish={(values) => { setSearch(values); fetchUsers(values); }}
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}
      >
        <Form.Item name="username" label="아이디">
          <Input allowClear placeholder="아이디" />
        </Form.Item>
        <Form.Item name="displayName" label="이름">
          <Input allowClear placeholder="이름" />
        </Form.Item>
        <Form.Item name="role" label="역할">
          <Select allowClear style={{ width: 160 }} placeholder="역할 선택">
            <Select.Option value="SYSTEM_ADMIN">시스템 관리자</Select.Option>
            <Select.Option value="COMPANY_ADMIN">회사 관리자</Select.Option>
            <Select.Option value="USER">사용자</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="isActive" label="상태">
          <Select allowClear style={{ width: 140 }} placeholder="상태 선택">
            <Select.Option value="true">사용</Select.Option>
            <Select.Option value="false">사용정지</Select.Option>
          </Select>
        </Form.Item>
        {isSystem && (
          <Form.Item name="companyCode" label="회사">
            <Select allowClear style={{ width: 160 }} placeholder="회사 선택">
              {companies.map((c) => (
                <Select.Option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
      </Form>

      {/* 버튼 배치: 왼쪽(사용자 추가/새로고침), 오른쪽(검색/초기화) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {isSystem && (
            <Button type="primary" onClick={openCreate}>사용자 추가</Button>
          )}
          <Button onClick={() => fetchUsers()}>새로고침</Button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button type="primary" htmlType="submit" form="userSearchForm">검색</Button>
          <Button
            onClick={() => {
              setSearch({});
              searchForm.resetFields();
              fetchUsers({});
            }}
          >
            초기화
          </Button>
        </div>
      </div>

      {error && (
        <Alert
          style={{ marginBottom: 16 }}
          message="오류"
          description={error}
          type="error"
          showIcon
        />
      )}

      <Table
        rowKey="id"
        loading={loading}
        dataSource={filteredData}
        pagination={{ pageSize: 10 }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60, align: 'center' },
          { title: '아이디', dataIndex: 'username', align: 'center' },
          { title: '이름', dataIndex: 'displayName', align: 'center' },
          {
            title: '역할',
            dataIndex: 'role',
            align: 'center',
            render: (role: string) => roleLabel(role),
          },
          {
            title: '상태',
            dataIndex: 'isActive',
            align: 'center',
            render: (active: boolean) => <Tag color={statusColor(active)}>{statusLabel(active)}</Tag>,
          },
          {
            title: '잠금',
            dataIndex: 'isLocked',
            align: 'center',
            render: (locked: boolean) => <Tag color={lockColor(locked)}>{lockLabel(locked)}</Tag>,
          },
          {
            title: '회사',
            dataIndex: 'company',
            align: 'center',
            render: (company: any) => (company ? `${company.name} (${company.code})` : '-'),
          },
          {
            title: '연락처',
            dataIndex: 'phone',
            align: 'center',
            render: (val: string) => val || '',
          },
          {
            title: '최근 로그인',
            dataIndex: 'lastLoginAt',
            align: 'center',
            render: (val: string) => dateFormat(val),
          },
          {
            title: '수정/잠금해제',
            dataIndex: 'action',
            align: 'center',
            render: (_: any, record: User) => (
              <Space>
                <Button
                  size="small"
                  onClick={() => openEdit(record)}
                  disabled={!isSystem}
                >
                  수정
                </Button>
                <Button
                  size="small"
                  type="primary"
                  disabled={!isSystem || record.isLocked === false}
                  onClick={() => handleUnlock(record.id)}
                >
                  잠금해제
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        open={modalOpen}
        title={modalMode === 'create' ? '사용자 추가' : '사용자 수정'}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitLoading}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="id" hidden><Input /></Form.Item>
          <Form.Item
            name="username"
            label="아이디"
            rules={[{ required: true, message: '아이디를 입력하세요.' }]}
          >
            <Input disabled={modalMode === 'edit'} placeholder="아이디" />
          </Form.Item>
          <Form.Item
            name="displayName"
            label="이름"
            rules={[{ required: true, message: '이름을 입력하세요.' }]}
          >
            <Input placeholder="이름" />
          </Form.Item>
          {modalMode === 'create' && (
            <Form.Item
              name="password"
              label="비밀번호"
              rules={[
                { required: true, message: '비밀번호를 입력하세요.' },
                { min: 8, message: '비밀번호는 8자 이상이어야 합니다.' },
              ]}
            >
              <Input.Password placeholder="비밀번호(8자 이상)" />
            </Form.Item>
          )}
          <Form.Item
            name="role"
            label="역할"
            rules={[{ required: true, message: '역할을 선택하세요.' }]}
          >
            <Select>
              <Select.Option value="SYSTEM_ADMIN">시스템 관리자</Select.Option>
              <Select.Option value="COMPANY_ADMIN">회사 관리자</Select.Option>
              <Select.Option value="USER">사용자</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="isActive"
            label="상태"
            rules={[{ required: true, message: '상태를 선택하세요.' }]}
          >
            <Select>
              <Select.Option value={true}>사용</Select.Option>
              <Select.Option value={false}>사용정지</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="phone"
            label="연락처"
            rules={[{ required: false }]}
          >
            <Input placeholder="연락처(선택)" />
          </Form.Item>
          {isSystem && (
            <Form.Item
              name="companyCode"
              label="회사"
              rules={modalMode === 'create' ? [{ required: true, message: '회사를 선택하세요.' }] : []}
            >
              <Select
                showSearch
                placeholder="회사 선택"
                optionFilterProp="children"
              >
                {companies.map((c) => (
                  <Select.Option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default UserListPage;
