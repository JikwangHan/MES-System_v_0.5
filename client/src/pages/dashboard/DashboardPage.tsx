import { Alert, Card, Col, Row } from 'antd';
import { useEffect, useState } from 'react';
import KpiCard from '../../components/common/KpiCard';
import ChartPanel from '../../components/common/ChartPanel';
import DataGrid from '../../components/common/DataGrid';
import { api } from '../../lib/api';
import useCompanyCode from '../../hooks/useCompanyCode';

type SummaryResponse = {
  kpis: { workOrders: number; orders: number; equipments: number; lowStock: number };
  chart: Array<{ name: string; good: number; defect: number }>;
  recentOrders: Array<{ id: number; code: string; itemName?: string; qty?: number; dueDate?: string; status?: string }>;
};

const DashboardPage = () => {
  const { companyCode } = useCompanyCode();
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async () => {
    try {
      setError(null);
      const res = await api.get('/dashboard/summary', { params: { companyCode } });
      setSummary(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || '대시보드 데이터를 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyCode]);

  const kpis = summary?.kpis || { workOrders: 0, orders: 0, equipments: 0, lowStock: 0 };
  const chart = summary?.chart || [];
  const recentOrders =
    summary?.recentOrders?.map((o) => ({
      key: o.id,
      orderNo: o.code,
      itemName: o.itemName || '-',
      qty: o.qty ?? 0,
      dueDate: o.dueDate || '',
      status: o.status || '',
    })) || [];

  const gridColumns = [
    { title: '수주코드', dataIndex: 'orderNo' },
    { title: '품목명', dataIndex: 'itemName' },
    { title: '수량', dataIndex: 'qty' },
    { title: '납기일', dataIndex: 'dueDate' },
    { title: '상태', dataIndex: 'status' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
      {error && <Alert type="error" showIcon message={error} />}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="작업지시" value={kpis.workOrders?.toLocaleString?.() ?? kpis.workOrders} />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="수주" value={kpis.orders?.toLocaleString?.() ?? kpis.orders} />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="설비" value={kpis.equipments?.toLocaleString?.() ?? kpis.equipments} />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="부족 재고" value={kpis.lowStock?.toLocaleString?.() ?? kpis.lowStock} />
        </Col>
      </Row>

      <Card title="생산량/불량 추이" style={{ width: '100%' }}>
        <ChartPanel data={chart} />
      </Card>

      <Card title="최근 수주 내역" style={{ width: '100%' }}>
        <DataGrid columns={gridColumns} dataSource={recentOrders} pagination={false} />
      </Card>
    </div>
  );
};

export default DashboardPage;
