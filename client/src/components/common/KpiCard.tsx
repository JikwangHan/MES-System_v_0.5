import { Card, Typography } from 'antd';
const { Text, Title } = Typography;

// KPI 수치를 카드 형태로 표시하는 컴포넌트입니다.
type Props = {
  title: string;
  value: string;
};

const KpiCard = ({ title, value }: Props) => {
  return (
    <Card size="small" style={{ minWidth: 180 }}>
      <Text type="secondary">{title}</Text>
      <Title level={3} style={{ marginTop: 4 }}>
        {value}
      </Title>
    </Card>
  );
};

export default KpiCard;
