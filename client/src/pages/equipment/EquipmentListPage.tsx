import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Form, Input, Select, Space, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

type Equipment = {
  id: number;
  code: string;
  name: string;
  type?: string;
  location?: string;
  status: string;
  company?: { id: number; code: string; name: string };
  createdAt?: string;
  updatedAt?: string;
};

// 설비 상태 색상/라벨
const statusLabel = (status: string) => {
  switch (status) {
    case 'RUNNING':
      return '가동';
    case 'DOWN':
      return '정지';
    case 'MAINT':
      return '정비';
    default:
      return '대기';
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case 'RUNNING':
      return 'green';
    case 'DOWN':
      return 'red';
    case 'MAINT':
      return 'orange';
    default:
      return 'blue';
  }
};

const EquipmentListPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState<{ code?: string; name?: string; status?: string }>({});

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const matchCode = search.code ? row.code.toLowerCase().includes(search.code.toLowerCase()) : true;
      const matchName = search.name ? row.name.toLowerCase().includes(search.name.toLowerCase()) : true;
      const matchStatus = search.status ? row.status === search.status : true;
      return matchCode && matchName && matchStatus;
    });
  }, [data, search]);

  const fetchList = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<Equipment[]>('/equipment');
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '설비 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  if (!user) {
    return <Alert type="warning" message="로그인 후 이용 가능합니다." showIcon />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Typography.Title level={3} style={{ marginBottom: 8, textAlign: 'center' }}>
        설비 모니터링
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12, textAlign: 'center' }}>
        설비 목록과 상태를 조회합니다. 시스템/업체 관리자는 설비를 등록할 수 있고, 일반 사용자는 조회만 가능합니다.
      </Typography.Paragraph>

      <Card>
        <Form
          form={form}
          layout="inline"
          onFinish={(values) => {
            setSearch(values);
          }}
          initialValues={search}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}
        >
          <Form.Item name="code" label="설비코드">
            <Input allowClear placeholder="설비코드" />
          </Form.Item>
          <Form.Item name="name" label="설비명">
            <Input allowClear placeholder="설비명" />
          </Form.Item>
          <Form.Item name="status" label="상태">
            <Select allowClear style={{ width: 140 }} placeholder="상태 선택">
              <Select.Option value="RUNNING">가동</Select.Option>
              <Select.Option value="IDLE">대기</Select.Option>
              <Select.Option value="DOWN">정지</Select.Option>
              <Select.Option value="MAINT">정비</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">검색</Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  setSearch({});
                }}
              >
                초기화
              </Button>
              <Button onClick={fetchList}>새로고침</Button>
            </Space>
          </Form.Item>
        </Form>

        {error && (
          <Alert style={{ marginBottom: 12 }} type="error" showIcon message={error} />
        )}

        <Table
          rowKey="id"
          loading={loading}
          dataSource={filtered}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: 'ID', dataIndex: 'id', width: 60, align: 'center' },
            { title: '설비코드', dataIndex: 'code', align: 'center' },
            { title: '설비명', dataIndex: 'name', align: 'center' },
            { title: '유형', dataIndex: 'type', align: 'center' },
            { title: '위치', dataIndex: 'location', align: 'center' },
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

export default EquipmentListPage;
