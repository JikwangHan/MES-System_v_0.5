import { Alert, Button, Card, Form, Input, Modal, Select, Space, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import useCompanyCode from '../../hooks/useCompanyCode';

type InventoryItem = {
  id: number;
  itemCode: string;
  itemName: string;
  warehouse?: string;
  location?: string;
  qty: number;
  safetyQty: number;
  status: string;
  company?: { code: string; name: string };
  createdAt?: string;
  updatedAt?: string;
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'AVAILABLE':
      return '사용';
    case 'LOW':
      return '부족';
    case 'HOLD':
      return '보류';
    default:
      return status || '사용';
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case 'AVAILABLE':
      return 'green';
    case 'LOW':
      return 'red';
    case 'HOLD':
      return 'gold';
    default:
      return 'default';
  }
};

const InventoryListPage = () => {
  const { companyCode } = useCompanyCode();
  const [form] = Form.useForm();
  const [data, setData] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchList = async (extra?: any, pageOpts = pagination, companyOverride?: string) => {
    try {
      setLoading(true);
      setError(null);
      const values = { ...form.getFieldsValue(), ...extra };
      const params: any = {
        page: pageOpts.current,
        pageSize: pageOpts.pageSize,
      };
      if (values.itemCode) params.itemCode = values.itemCode;
      if (values.itemName) params.itemName = values.itemName;
      if (values.warehouse) params.warehouse = values.warehouse;
      if (values.status) params.status = values.status;
      const targetCompany = companyOverride ?? companyCode;
      if (targetCompany) params.companyCode = targetCompany;

      const res = await api.get('/inventory', { params });
      const items = res.data?.items ?? [];
      setData(items);
      setTotal(res.data?.total ?? items.length ?? 0);
      setPagination((prev) => ({ ...prev, current: pageOpts.current, pageSize: pageOpts.pageSize }));
    } catch (err: any) {
      setError(err?.response?.data?.message || '재고 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 회사 변경 시 초기화 후 재조회
  useEffect(() => {
    if (!companyCode) return;
    form.resetFields();
    setPagination({ current: 1, pageSize: 10 });
    fetchList({}, { current: 1, pageSize: 10 }, companyCode);
    setSelectedRowKeys([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyCode]);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = (record?: InventoryItem) => {
    setEditing(record ?? null);
    setIsModalOpen(true);
    if (record) {
      form.setFieldsValue({
        itemCode: record.itemCode,
        itemName: record.itemName,
        warehouse: record.warehouse,
        location: record.location,
        qty: record.qty,
        safetyQty: record.safetyQty,
        status: record.status,
      });
    } else {
      form.resetFields();
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: any = {
      itemCode: values.itemCode,
      itemName: values.itemName,
      warehouse: values.warehouse,
      location: values.location,
      qty: Number(values.qty) || 0,
      safetyQty: Number(values.safetyQty) || 0,
      status: values.status || 'AVAILABLE',
      companyCode,
    };
    try {
      setLoading(true);
      if (editing) {
        await api.patch(`/inventory/${editing.id}`, payload);
      } else {
        await api.post('/inventory', payload);
      }
      setIsModalOpen(false);
      setSelectedRowKeys([]);
      fetchList({}, { current: 1, pageSize: pagination.pageSize });
    } catch (err: any) {
      Modal.error({ title: '저장 실패', content: err?.response?.data?.message || '오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedRowKeys.length === 0) {
      Modal.warning({ title: '삭제할 항목을 선택하세요.' });
      return;
    }
    const id = Number(selectedRowKeys[0]);
    Modal.confirm({
      title: '삭제 확인',
      content: '선택한 재고를 삭제하시겠습니까?',
      okText: '삭제',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setLoading(true);
          await api.delete(`/inventory/${id}`);
          setSelectedRowKeys([]);
          fetchList({}, { current: 1, pageSize: pagination.pageSize });
        } catch (err: any) {
          Modal.error({ title: '삭제 실패', content: err?.response?.data?.message || '오류가 발생했습니다.' });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <Card title="재고 현황" style={{ width: '100%' }}>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        업체 선택에 따라 재고가 필터링됩니다. 검색 조건 입력 후 [검색], [초기화]/[새로고침]으로 목록을 관리하세요.
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
        <Form.Item name="itemCode" label="품목코드">
          <Input allowClear placeholder="품목코드" />
        </Form.Item>
        <Form.Item name="itemName" label="품목명">
          <Input allowClear placeholder="품목명" />
        </Form.Item>
        <Form.Item name="warehouse" label="창고">
          <Input allowClear placeholder="창고" />
        </Form.Item>
        <Form.Item name="status" label="상태">
          <Select allowClear style={{ width: 140 }} placeholder="상태 선택">
            <Select.Option value="AVAILABLE">사용</Select.Option>
            <Select.Option value="LOW">부족</Select.Option>
            <Select.Option value="HOLD">보류</Select.Option>
          </Select>
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
                setSelectedRowKeys([]);
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

      <Space style={{ marginBottom: 8 }}>
        <Button type="primary" onClick={() => openModal()}>
          추가
        </Button>
        <Button onClick={() => (selectedRowKeys[0] ? openModal(data.find((d) => d.id === selectedRowKeys[0])) : Modal.warning({ title: '수정할 항목을 선택하세요.' }))}>
          수정
        </Button>
        <Button danger onClick={handleDelete}>
          삭제
        </Button>
      </Space>

      <Table
        rowKey="id"
        rowSelection={{
          type: 'radio',
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        loading={loading}
        dataSource={data}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total,
          showSizeChanger: true,
          onChange: (page, pageSize) => fetchList(undefined, { current: page, pageSize }),
        }}
        columns={[
          { title: 'ID', dataIndex: 'id', align: 'center', width: 70 },
          { title: '품목코드', dataIndex: 'itemCode', align: 'center' },
          { title: '품목명', dataIndex: 'itemName', align: 'center' },
          { title: '창고', dataIndex: 'warehouse', align: 'center' },
          { title: '로케이션', dataIndex: 'location', align: 'center' },
          {
            title: '현재고',
            dataIndex: 'qty',
            align: 'center',
            render: (v: number) => v?.toLocaleString?.() ?? v,
          },
          {
            title: '안전재고',
            dataIndex: 'safetyQty',
            align: 'center',
            render: (v: number) => v?.toLocaleString?.() ?? v,
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

      <Modal
        open={isModalOpen}
        title={editing ? '재고 수정' : '재고 등록'}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="저장"
        cancelText="닫기"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="itemCode" label="품목코드" rules={[{ required: true, message: '품목코드를 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="itemName" label="품목명" rules={[{ required: true, message: '품목명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="warehouse" label="창고">
            <Input />
          </Form.Item>
          <Form.Item name="location" label="로케이션">
            <Input />
          </Form.Item>
          <Form.Item name="qty" label="현재고" rules={[{ required: true, message: '현재고를 입력하세요' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="safetyQty" label="안전재고">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="status" label="상태" initialValue="AVAILABLE">
            <Select>
              <Select.Option value="AVAILABLE">사용</Select.Option>
              <Select.Option value="LOW">부족</Select.Option>
              <Select.Option value="HOLD">보류</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default InventoryListPage;
