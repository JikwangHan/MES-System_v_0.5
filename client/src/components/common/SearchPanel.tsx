import { Card } from 'antd';
import type { ReactNode } from 'react';

// SearchPanel은 화면 상단의 검색/필터 영역을 감싸는 단순 래퍼입니다.
// children으로 실제 검색 입력 요소들을 전달받아 표시합니다.
const SearchPanel = ({ children }: { children?: ReactNode }) => {
  return (
    <Card size="small" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>{children}</div>
    </Card>
  );
};

export default SearchPanel;
