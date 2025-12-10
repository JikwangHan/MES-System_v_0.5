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
  Popconfirm,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import useCompanyCode from '../../hooks/useCompanyCode';

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

// 상태 라벨 한글화
const statusLabel = (status: string) => {
  if (status === 'ACTIVE') return '사용 중';
  if (status === 'SUSPENDED') return '삭제(사용정지)';
  if (status === 'INACTIVE') return '사용정지';
  return status;
};

// 상태 Tag 색상
const statusColor = (status: string) => {
  if (status === 'ACTIVE') return 'green';
  if (status === 'INACTIVE') return 'orange';
  if (status === 'SUSPENDED') return 'red';
  return 'default';
};

const dateFormat = (val?: string) => {
  if (!val) return '';
  return dayjs(val).format('YYYY-MM-DD HH:mm:ss');
};

// 시스템 관리자 전용 업체 관리 화면
const CompanyListPage = () => {
  const { user, logout } = useAuth();
  const { companyCode } = useCompanyCode();
  const navigate = useNavigate();
  const [data, setData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm<CompanyForm>();
  const [searchForm] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [search, setSearch] = useState<{ code?: string; name?: string; status?: string }>({});
  const [tableKey, setTableKey] = useState<number>(0);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchCode = search.code ? row.code.toLowerCase().includes(search.code.toLowerCase()) : true;
      const matchName = search.name ? row.name.toLowerCase().includes(search.name.toLowerCase()) : true;
      const matchStatus = search.status ? row.status === search.status : true;
      const matchCompany = companyCode && companyCode !== 'ALL' ? row.code === companyCode : true;
      return matchCode && matchName && matchStatus && matchCompany;
    });
  }, [data, search, companyCode]);

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

  // 시스템 관리자가 아니면 모달을 바로 표시하고, 확인/닫기 시 홈 이동 + 로그아웃
  if (user?.role !== 'SYSTEM_ADMIN') {
    const handleClose = () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_company_code');
      logout();
      navigate('/', { replace: true });
    };
    return (
      <Modal
        open={true}
        title="접근 권한이 없습니다!"
        okText="확인"
        centered
        onOk={handleClose}
        onCancel={handleClose}
        maskClosable={false}
        closable={false}
      >
        관리자에게 문의하세요.
      </Modal>
    );
  }

  useEffect(() => {
    // 업체 변경 시 검색 조건/페이지 리셋 후 전체 조회
    searchForm.resetFields();
    setSearch({});
    setData([]);
    setTableKey((prev: number) => prev + 1);
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, companyCode]);

  if (user?.role !== 'SYSTEM_ADMIN') {
    return (
      <Alert
        message="접근 권한이 없습니다."
        description="업체 관리는 시스템 관리자만 확인할 수 있습니다."
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
      status: record.status === 'SUSPENDED' ? 'SUSPENDED' : record.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
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

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await api.delete(`/admin/companies/${id}`);
      message.success('상태를 삭제(사용정지)로 변경했습니다.');
      fetchCompanies();
    } catch (err: any) {
      message.error(err.response?.data?.message || '삭제 처리 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  // 삭제(사용정지) 상태에서 다시 사용 중으로 복구
  const handleRestore = async (id: number) => {
    try {
      setLoading(true);
      await api.patch(`/admin/companies/${id}`, { status: 'ACTIVE' });
      message.success('상태를 사용 중으로 변경했습니다.');
      fetchCompanies();
    } catch (err: any) {
      message.error(err.response?.data?.message || '복구 처리 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 8, textAlign: 'center' }}>
        업체 관리
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12, textAlign: 'center' }}>
        시스템 관리자 전용 화면입니다. 업체코드/업체명/상태를 조회하고, 업체 추가/수정/삭제(사용정지)까지 처리할 수 있습니다.
      </Typography.Paragraph>

      {/* 검색/버튼 영역: 폼과 액션 버튼을 분리해 초기화 시 필드까지 리셋 */}
      <Form
        id="companySearchForm"
        form={searchForm}
        layout="inline"
        onFinish={(values) => setSearch(values)}
        initialValues={search}
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}
      >
        <Form.Item name="code" label="업체코드">
          <Input allowClear placeholder="예: DEFAULT" />
        </Form.Item>
        <Form.Item name="name" label="업체명">
          <Input allowClear placeholder="업체명" />
        </Form.Item>
        <Form.Item name="status" label="상태">
          <Select allowClear style={{ width: 140 }} placeholder="상태 선택">
            <Select.Option value="ACTIVE">사용 중</Select.Option>
            <Select.Option value="INACTIVE">사용정지</Select.Option>
            <Select.Option value="SUSPENDED">삭제(사용정지)</Select.Option>
          </Select>
        </Form.Item>
      </Form>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button type="primary" onClick={openCreate}>업체 추가</Button>
          <Button onClick={fetchCompanies}>새로고침</Button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button type="primary" htmlType="submit" form="companySearchForm">
            검색
          </Button>
          <Button
            onClick={() => {
              searchForm.resetFields();
              searchForm.setFieldsValue({
                code: undefined,
                name: undefined,
                status: undefined,
              });
              const empty = {};
              setSearch(empty);
              fetchCompanies();
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
        key={tableKey}
        rowKey="id"
        loading={loading}
        dataSource={filteredData}
        pagination={{ pageSize: 10 }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60, align: 'center' },
          { title: '업체코드', dataIndex: 'code', align: 'center' },
          { title: '업체명', dataIndex: 'name', align: 'center' },
          {
            title: '상태',
            dataIndex: 'status',
            align: 'center',
            render: (status: string) => (
              <Tag color={statusColor(status)}>{statusLabel(status)}</Tag>
            ),
          },
          {
            title: '생성일',
            dataIndex: 'createdAt',
            align: 'center',
            render: (val: string) => dateFormat(val),
          },
          {
            title: '수정일',
            dataIndex: 'updatedAt',
            align: 'center',
            render: (val: string) => dateFormat(val),
          },
          {
            title: '수정/삭제',
            dataIndex: 'action',
            align: 'center',
            render: (_: any, record: Company) => (
              <Space>
                <Button
                  size="small"
                  onClick={() => openEdit(record)}
                  disabled={record.status === 'SUSPENDED'} // 삭제(사용정지) 상태면 수정 비활성화
                >
                  수정
                </Button>
                {record.status === 'SUSPENDED' ? (
                  <Button size="small" type="primary" onClick={() => handleRestore(record.id)}>
                    사용
                  </Button>
                ) : (
                  <Popconfirm
                    title="삭제"
                    description="상태를 삭제(사용정지)로 전환합니다. 진행할까요?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="예"
                    cancelText="아니오"
                  >
                    <Button
                      size="small"
                      danger
                      // ACTIVE, INACTIVE에서는 삭제 가능, SUSPENDED에서는 비활성
                      disabled={record.status === 'SUSPENDED'}
                    >
                      삭제
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            ),
          },
        ]}
      />

      <Modal
        open={modalOpen}
        title={modalMode === 'create' ? '업체 추가' : '업체 수정'}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitLoading}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="id" hidden><Input /></Form.Item>
          <Form.Item
            name="code"
            label="업체코드"
            rules={[{ required: true, message: '업체코드를 입력하세요.' }]}
          >
            <Input disabled={modalMode === 'edit'} placeholder="예: DEFAULT" />
          </Form.Item>
          <Form.Item
            name="name"
            label="업체명"
            rules={[{ required: true, message: '업체명을 입력하세요.' }]}
          >
            <Input placeholder="업체명" />
          </Form.Item>
          <Form.Item
            name="status"
            label="상태"
            rules={[{ required: true, message: '상태를 선택하세요.' }]}
          >
            <Select>
              <Select.Option value="ACTIVE">사용</Select.Option>
              <Select.Option value="INACTIVE">사용정지</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CompanyListPage;
