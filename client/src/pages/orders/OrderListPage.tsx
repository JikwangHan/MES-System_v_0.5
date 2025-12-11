import { Alert, Button, Card, DatePicker, Form, Input, Select, Space, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import useCompanyCode from '../../hooks/useCompanyCode';

type OrderItem = {
  id: number;
  code: string;
  customerName?: string;
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
    case 'OPEN':
      return '접수';
    case 'IN_PROGRESS':
      return '진행중';
    case 'DONE':
      return '완료';
    case 'HOLD':
      return '보류';
    case 'CANCEL':
      return '취소';
    default:
      return status || '접수';
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case 'OPEN':
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

const OrderListPage = () => {
  const { companyCode } = useCompanyCode();
  const [form] = Form.useForm();
  const [data, setData] = useState<OrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const fetchList = async (extra?: any, pageOpts = pagination, companyOverride?: string) => {
    try {
      setLoading(true);
      setError(null);
      const values = { ...form.getFieldsValue(), ...extra };
      const params: any = {
        page: pageOpts.current,
        pageSize: pageOpts.pageSize,
      };
      if (values.code) params.code = values.code;
      if (values.customerName) params.customerName = values.customerName;
      if (values.itemName) params.itemName = values.itemName;
      if (values.status) params.status = values.status;
      if (values.dueRange?.length === 2) {
        params.dueFrom = values.dueRange[0].format('YYYY-MM-DD');
        params.dueTo = values.dueRange[1].format('YYYY-MM-DD');
      }
      const targetCompany = companyOverride ?? companyCode;
      if (targetCompany) params.companyCode = targetCompany;

      const res = await api.get('/orders', { params });
      const items = res.data?.items ?? [];
      setData(items);
      setTotal(res.data?.total ?? items.length ?? 0);
      setPagination((prev) => ({ ...prev, current: pageOpts.current, pageSize: pageOpts.pageSize }));
    } catch (err: any) {
      setError(err?.response?.data?.message || '수주 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 회사 변경 시 검색/페이지 초기화 후 재조회
  useEffect(() => {
    if (!companyCode) return;
    form.resetFields();
    setPagination({ current: 1, pageSize: 10 });
    fetchList({}, { current: 1, pageSize: 10 }, companyCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyCode]);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card title="수주 내역" style={{ width: '100%' }}>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        회사(업체) 선택에 따라 수주 데이터가 필터링됩니다. 검색 조건 입력 후 [검색], 입력값을 비우려면 [초기화]를 눌러주세요.
      </Typography.Paragraph>

      <Form
        form={form}
        layout="inline"
        onFinish={(values) => {
          setPagination({ current: 1, pageSize: pagination.pageSize });
          fetchList(values, { current: 1, pageSize: pagination.pageSize });
        }}
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}
      >
        <Form.Item name="code" label="수주코드">
          <Input allowClear placeholder="수주코드" />
        </Form.Item>
        <Form.Item name="customerName" label="고객사">
          <Input allowClear placeholder="고객사명" />
        </Form.Item>
        <Form.Item name="itemName" label="품목명">
          <Input allowClear placeholder="품목명" />
        </Form.Item>
        <Form.Item name="status" label="상태">
          <Select allowClear style={{ width: 150 }} placeholder="상태 선택">
            <Select.Option value="OPEN">접수</Select.Option>
            <Select.Option value="IN_PROGRESS">진행중</Select.Option>
            <Select.Option value="DONE">완료</Select.Option>
            <Select.Option value="HOLD">보류</Select.Option>
            <Select.Option value="CANCEL">취소</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="dueRange" label="납기">
          <DatePicker.RangePicker allowClear />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              검색
            </Button>
            <Button
              onClick={() => {
                form.resetFields();
                setPagination({ current: 1, pageSize: 10 });
                fetchList({}, { current: 1, pageSize: 10 });
              }}
            >
              초기화
            </Button>
            <Button onClick={() => fetchList()}>새로고침</Button>
          </Space>
        </Form.Item>
      </Form>

      {error && <Alert style={{ marginBottom: 12 }} type="error" showIcon message={error} />}

      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total,
          showSizeChanger: true,
          onChange: (page, pageSize) => {
            fetchList(undefined, { current: page, pageSize });
          },
        }}
        columns={[
          { title: 'ID', dataIndex: 'id', align: 'center', width: 70 },
          { title: '수주코드', dataIndex: 'code', align: 'center' },
          { title: '고객사', dataIndex: 'customerName', align: 'center' },
          { title: '품목코드', dataIndex: 'itemCode', align: 'center' },
          { title: '품목명', dataIndex: 'itemName', align: 'center' },
          { title: '수량', dataIndex: 'qty', align: 'center', render: (v: number) => v?.toLocaleString?.() ?? v },
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
  );
};

export default OrderListPage;
