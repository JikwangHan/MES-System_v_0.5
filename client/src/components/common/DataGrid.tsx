import type { TableProps } from 'antd';
import { Table } from 'antd';

// DataGrid는 antd Table에 공통 옵션을 감싼 래퍼입니다.
// 추후 행 번호, 고정 컬럼, 스크롤 등 MES 특화 옵션을 한 곳에서 관리하기 용이합니다.
function DataGrid<RecordType extends object>(props: TableProps<RecordType>) {
  return (
    <Table<RecordType>
      size="middle"
      style={{ width: '100%' }}
      tableLayout="auto"
      scroll={{ x: 'max-content' }}
      {...props}
    />
  );
}

export default DataGrid;
