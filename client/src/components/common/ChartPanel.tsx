import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

type Props = {
  data: Array<{ name: string; good: number; defect: number }>;
};

// ChartPanel은 Recharts 기본 스타일을 적용한 라인차트 예시입니다.
// 추후 막대/혼합 차트 등으로 확장 가능합니다.
const ChartPanel = ({ data }: Props) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="good" stroke="#1677FF" name="양품" />
          <Line type="monotone" dataKey="defect" stroke="#f5222d" name="불량" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartPanel;
