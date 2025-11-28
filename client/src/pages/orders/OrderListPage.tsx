import { Card } from 'antd';
import SearchPanel from '../../components/common/SearchPanel';
import CrudButtonGroup from '../../components/common/CrudButtonGroup';
import DataGrid from '../../components/common/DataGrid';

// 수주내역 화면: 검색 영역 + 버튼 그룹 + 그리드 기본 뼈대입니다.
// 현재는 더미 데이터이며, 추후 백엔드 /orders API와 연동합니다.
const OrderListPage = () => {
  const columns = [
    { title: '수주번호', dataIndex: 'orderNo' },
    { title: '품목명', dataIndex: 'itemName' },
    { title: '수량', dataIndex: 'qty' },
    { title: '납기일', dataIndex: 'dueDate' },
    { title: '상태', dataIndex: 'status' },
  ];

  const data = [
    { key: 1, orderNo: 'O-202501', itemName: '제품A', qty: 100, dueDate: '2025-12-10', status: '진행' },
    { key: 2, orderNo: 'O-202502', itemName: '제품B', qty: 200, dueDate: '2025-12-12', status: '대기' },
  ];

  return (
    <Card title="수주내역" style={{ width: '100%' }}>
      <SearchPanel>
        {/* TODO: 기간, 고객사, 수주번호, 상태 등 검색 조건 추가 */}
      </SearchPanel>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <CrudButtonGroup
          onAdd={() => console.log('추가')}
          onEdit={() => console.log('수정')}
          onDelete={() => console.log('삭제')}
          onDownload={() => console.log('엑셀 다운로드')}
          onUpload={() => console.log('엑셀 업로드')}
        />
      </div>
      <DataGrid columns={columns} dataSource={data} pagination={false} />
    </Card>
  );
};

export default OrderListPage;
