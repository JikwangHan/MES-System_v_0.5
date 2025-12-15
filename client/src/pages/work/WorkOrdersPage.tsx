import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Form, Input, Select, Table, Tag, Typography, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useCompanyCode } from '../../hooks/useCompanyCode';

type WorkOrder = {
  id: number;
  code: string;
  itemCode?: string;
  itemName?: string;
  qty: number;
  dueDate?: string;
  status: string;
  company?: { code: string; name: string };
  createdAt?: string;
  updatedAt?: string;
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'PLANNED':
      return '계획';
    case 'IN_PROGRESS':
      return '진행중';
    case 'DONE':
      return '완료';
    case 'HOLD':
      return '보류';
    case 'CANCEL':
      return '취소';
    default:
      return status || '계획';
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case 'PLANNED':
      return 'blue';
    case 'IN_PROGRESS':
      return 'orange';
    case 'DONE':
      return 'green';
    case 'HOLD':
      return 'gold';
    case 'CANCEL':
      return 'red';
    default:
      return 'default';
  }
};

const WorkOrdersPage = () => {
  const { user } = useAuth();
  const { companyCode } = useCompanyCode();
  const [data, setData] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState<{ code?: string; itemName?: string; status?: string; dueRange?: any }>({});
  const [tableKey, setTableKey] = useState<number>(0); // 업체 변경 시 테이블/페이지네이션 초기화를 위한 key

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const matchCode = search.code ? row.code.toLowerCase().includes(search.code.toLowerCase()) : true;
      const matchItem = search.itemName ? (row.itemName || '').toLowerCase().includes(search.itemName.toLowerCase()) : true;
      const matchStatus = search.status ? row.status === search.status : true;
      return matchCode && matchItem && matchStatus;
    });
  }, [data, search]);

  const fetchList = async (filters?: any, companyOverride?: string) => {
    try {
      setLoading(true);
      setError(null);
      const s = filters ?? search;
      const params: any = {};
      if (s.status) params.status = s.status;
      if (s.code) params.code = s.code;
      if (s.itemName) params.itemName = s.itemName;
      if (s.dueRange?.length === 2) {
        params.dueFrom = s.dueRange[0].format('YYYY-MM-DD');
        params.dueTo = s.dueRange[1].format('YYYY-MM-DD');
      }
      // SYSTEM_ADMIN이 선택한 업체코드를 전달 (ALL이면 전체)
      const targetCompany = companyOverride ?? companyCode;
      // ADMIN은 기본 ALL, ALL도 명시적으로 전달해 서버가 전체 조회하도록 요청
      if (targetCompany) {
        params.companyCode = targetCompany;
      }
      const res = await api.get('/work/orders', { params });
      const items = res.data?.items ?? res.data ?? [];
      setData(items as WorkOrder[]);
    } catch (err: any) {
      setError(err.response?.data?.message || '작업지시를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 업체 변경 시 모든 검색/페이지 상태 초기화 후 재조회
  useEffect(() => {
    if (!companyCode) return;
    form.resetFields();
    setSearch({});
    setError(null);
    setData([]);
    setTableKey((prev) => prev + 1);
    fetchList({}, companyCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyCode]);

  useEffect(() => {
    fetchList(search, companyCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyCode]);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) {
    return <Alert type="warning" showIcon message="로그인 후 이용 가능합니다." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Typography.Title level={3} style={{ marginBottom: 8, textAlign: 'center' }}>
        작업지시 관리
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12, textAlign: 'center' }}>
        작업지시 목록을 조회합니다. 관리자/업체 관리자는 생성 기능을, 일반 사용자는 조회 기능을 이용할 수 있습니다.
      </Typography.Paragraph>

      <Card>
        <Form
          form={form}
          layout="inline"
          onFinish={(values) => {
            setSearch(values);
            fetchList(values);
          }}
          initialValues={search}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}
        >
          <Form.Item name="code" label="지시코드">
            <Input allowClear placeholder="작업지시 코드" data-testid="work-code-input" />
          </Form.Item>
          <Form.Item name="itemName" label="품목명">
            <Input allowClear placeholder="품목명" data-testid="work-item-input" />
          </Form.Item>
          <Form.Item name="status" label="상태">
            <Select allowClear style={{ width: 160 }} placeholder="상태 선택" data-testid="work-status-select">
              <Select.Option value="PLANNED">계획</Select.Option>
              <Select.Option value="IN_PROGRESS">진행중</Select.Option>
              <Select.Option value="DONE">완료</Select.Option>
              <Select.Option value="HOLD">보류</Select.Option>
              <Select.Option value="CANCEL">취소</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dueRange" label="납기">
            <DatePicker.RangePicker allowClear data-testid="work-due-range" />
          </Form.Item>
          <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end', gap: 8 }}>
            <Button type="primary" htmlType="submit" style={{ minWidth: 96, height: 32 }} data-testid="work-search-btn">
              검색
            </Button>
            <Button onClick={() => fetchList(search)} style={{ minWidth: 96, height: 32 }} data-testid="work-refresh-btn">
              새로고침
            </Button>
            <Button
              onClick={() => {
                form.resetFields();
                form.setFieldsValue({ code: undefined, itemName: undefined, status: undefined, dueRange: undefined });
                setSearch({});
                fetchList({});
              }}
              style={{ minWidth: 96, height: 32 }}
              data-testid="work-reset-btn"
            >
              초기화
            </Button>
          </div>
        </Form>

        {error && <Alert style={{ marginBottom: 12 }} type="error" showIcon message={error} />}

        <Table
          key={tableKey}
          rowKey="id"
          loading={loading}
          dataSource={filtered}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: 'ID', dataIndex: 'id', align: 'center', width: 70 },
            { title: '지시코드', dataIndex: 'code', align: 'center' },
            { title: '품목코드', dataIndex: 'itemCode', align: 'center' },
            { title: '품목명', dataIndex: 'itemName', align: 'center' },
            { title: '수량', dataIndex: 'qty', align: 'center', render: (v: number) => <span>{v?.toLocaleString?.() ?? v}</span> },
            {
              title: '납기일',
              dataIndex: 'dueDate',
              align: 'center',
              render: (val: string) => (val ? dayjs(val).format('YYYY-MM-DD') : ''),
            },
            {
              title: '상태',
              dataIndex: 'status',
              align: 'center',
              render: (status: string) => <Tag color={statusColor(status)}>{statusLabel(status)}</Tag>,
            },
            {
              title: '업체',
              dataIndex: 'company',
              align: 'center',
              render: (c: any) => (c ? `${c.name} (${c.code})` : '-'),
            },
            {
              title: '생성일',
              dataIndex: 'createdAt',
              align: 'center',
              render: (val: string) => (val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : ''),
            },
            {
              title: '수정일',
              dataIndex: 'updatedAt',
              align: 'center',
              render: (val: string) => (val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : ''),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default WorkOrdersPage;
