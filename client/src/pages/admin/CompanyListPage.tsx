import { useEffect, useMemo, useState } from 'react';
import {
  Table,
  Tag,
  Typography,
  Alert,
  Button,
  Space,
  Form,
  Input,
  Select,
  Modal,
  message,
} from 'antd';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

type Company = {
  id: number;
  code: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type CompanyForm = {
  id?: number;
  code: string;
  name: string;
  status: string;
};

// 시스템 관리자 전용 회사 관리 화면
// - 회사 목록 조회/검색
// - 회사 추가/수정(상태 변경 포함)
// - 삭제 대신 상태를 SUSPENDED로 두는 방식 권장
const CompanyListPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm<CompanyForm>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [search, setSearch] = useState<{ code?: string; name?: string; status?: string }>({});

  // 검색 필터 적용 데이터
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchCode = search.code ? row.code.toLowerCase().includes(search.code.toLowerCase()) : true;
      const matchName = search.name ? row.name.toLowerCase().includes(search.name.toLowerCase()) : true;
      const matchStatus = search.status ? row.status === search.status : true;
      return matchCode && matchName && matchStatus;
    });
  }, [data, search]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<Company[]>('/admin/companies');
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '회사를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'SYSTEM_ADMIN') return;
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  if (user?.role !== 'SYSTEM_ADMIN') {
    return (
      <Alert
        message="접근 권한이 없습니다."
        description="회사 관리는 시스템 관리자만 확인할 수 있습니다."
        type="warning"
        showIcon
      />
    );
  }

  const openCreate = () => {
    setModalMode('create');
    form.resetFields();
    form.setFieldsValue({ status: 'ACTIVE' });
    setModalOpen(true);
  };

  const openEdit = (record: Company) => {
    setModalMode('edit');
    form.setFieldsValue({
      id: record.id,
      code: record.code,
      name: record.name,
      status: record.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: CompanyForm) => {
    try {
      setSubmitLoading(true);
      if (modalMode === 'create') {
        await api.post('/admin/companies', {
          code: values.code,
          name: values.name,
          status: values.status || 'ACTIVE',
        });
        message.success('회사 추가가 완료되었습니다.');
      } else {
        await api.patch(`/admin/companies/${values.id}`, {
          name: values.name,
          status: values.status,
        });
        message.success('회사 정보가 수정되었습니다.');
      }
      setModalOpen(false);
      fetchCompanies();
    } catch (err: any) {
      message.error(err.response?.data?.message || '처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 8 }}>
        회사 관리
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        시스템 관리자 전용 화면입니다. 회사코드/이름/상태를 조회하고, 회사 추가/수정/비활성(상태 변경)까지 처리할 수 있습니다.
      </Typography.Paragraph>

      <Space style={{ marginBottom: 16 }} wrap>
        <Form
          layout="inline"
          onFinish={(values) => setSearch(values)}
          initialValues={search}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
        >
          <Form.Item name="code" label="회사코드">
            <Input allowClear placeholder="예: DEFAULT" />
          </Form.Item>
          <Form.Item name="name" label="회사명">
            <Input allowClear placeholder="회사명" />
          </Form.Item>
          <Form.Item name="status" label="상태">
            <Select allowClear style={{ width: 140 }} placeholder="상태 선택">
              <Select.Option value="ACTIVE">ACTIVE</Select.Option>
              <Select.Option value="SUSPENDED">SUSPENDED</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">검색</Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={() => { setSearch({}); }}>초기화</Button>
          </Form.Item>
        </Form>
        <Button type="primary" onClick={openCreate}>회사 추가</Button>
        <Button onClick={fetchCompanies}>새로고침</Button>
      </Space>

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
          { title: 'ID', dataIndex: 'id', width: 80 },
          { title: '회사코드', dataIndex: 'code' },
          { title: '회사명', dataIndex: 'name' },
          {
            title: '상태',
            dataIndex: 'status',
            render: (status: string) => (
              <Tag color={status === 'ACTIVE' ? 'green' : 'orange'}>{status}</Tag>
            ),
          },
          { title: '생성일', dataIndex: 'createdAt' },
          { title: '수정일', dataIndex: 'updatedAt' },
          {
            title: '수정',
            dataIndex: 'action',
            render: (_: any, record: Company) => (
              <Button size="small" onClick={() => openEdit(record)}>
                수정
              </Button>
            ),
          },
        ]}
      />

      <Modal
        open={modalOpen}
        title={modalMode === 'create' ? '회사 추가' : '회사 수정'}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitLoading}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="id" hidden><Input /></Form.Item>
          <Form.Item
            name="code"
            label="회사코드"
            rules={[{ required: true, message: '회사코드를 입력하세요.' }]}
          >
            <Input disabled={modalMode === 'edit'} placeholder="예: DEFAULT" />
          </Form.Item>
          <Form.Item
            name="name"
            label="회사명"
            rules={[{ required: true, message: '회사명을 입력하세요.' }]}
          >
            <Input placeholder="회사명" />
          </Form.Item>
          <Form.Item
            name="status"
            label="상태"
            rules={[{ required: true, message: '상태를 선택하세요.' }]}
          >
            <Select>
              <Select.Option value="ACTIVE">ACTIVE</Select.Option>
              <Select.Option value="SUSPENDED">SUSPENDED</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CompanyListPage;
