import { Card, Row, Col } from 'antd';
import KpiCard from '../../components/common/KpiCard';
import ChartPanel from '../../components/common/ChartPanel';
import DataGrid from '../../components/common/DataGrid';

// DashboardPage는 KPI 카드, 간단한 차트, 최근 리스트 등을 보여주는 개요 화면입니다.
// 현재는 더미 데이터를 사용하며, 추후 백엔드 API 연동으로 실제 데이터로 교체합니다.
const DashboardPage = () => {
  const kpiList = [
    { title: '오늘 생산량', value: '1,240 EA' },
    { title: '불량률', value: '1.2 %' },
    { title: '설비 가동률', value: '92 %' },
  ];

  const chartData = [
    { name: '10:00', good: 120, defect: 3 },
    { name: '11:00', good: 150, defect: 2 },
    { name: '12:00', good: 170, defect: 1 },
  ];

  const gridColumns = [
    { title: '수주번호', dataIndex: 'orderNo' },
    { title: '품목명', dataIndex: 'itemName' },
    { title: '수량', dataIndex: 'qty' },
    { title: '납기일', dataIndex: 'dueDate' },
    { title: '상태', dataIndex: 'status' },
  ];

  const gridData = [
    { key: 1, orderNo: 'O-202501', itemName: '제품A', qty: 100, dueDate: '2025-12-10', status: '진행' },
    { key: 2, orderNo: 'O-202502', itemName: '제품B', qty: 200, dueDate: '2025-12-12', status: '대기' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
      <Row gutter={[16, 16]}>
        {kpiList.map((kpi) => (
          <Col key={kpi.title} xs={24} sm={12} md={8} lg={8}>
            <KpiCard title={kpi.title} value={kpi.value} />
          </Col>
        ))}
      </Row>

      <Card title="생산량/불량 추이" style={{ width: '100%' }}>
        <ChartPanel data={chartData} />
      </Card>

      <Card title="최근 수주 내역" style={{ width: '100%' }}>
        <DataGrid columns={gridColumns} dataSource={gridData} pagination={false} />
      </Card>
    </div>
  );
};

export default DashboardPage;
