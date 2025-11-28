import { Badge } from 'antd';

// 상태값을 색상과 함께 표시하는 단순 뱃지 컴포넌트입니다.
// status 값에 따라 색상을 지정해 가독성을 높입니다.
type Props = {
  status: string;
};

const StatusBadge = ({ status }: Props) => {
  const colorMap: Record<string, string> = {
    진행: 'blue',
    대기: 'gold',
    완료: 'green',
    불량: 'red',
  };
  return <Badge color={colorMap[status] || 'default'} text={status} />;
};

export default StatusBadge;
