import { Card } from 'antd';
import SearchPanel from '../../components/common/SearchPanel';
import CrudButtonGroup from '../../components/common/CrudButtonGroup';
import DataGrid from '../../components/common/DataGrid';

// 재고현황 화면: 검색 영역 + 버튼 그룹 + 그리드 기본 뼈대입니다.
// 현재는 더미 데이터이며, 추후 백엔드 /inventory API와 연동합니다.
const InventoryListPage = () => {
  const columns = [
    { title: '품목코드', dataIndex: 'itemCode' },
    { title: '품목명', dataIndex: 'itemName' },
    { title: '창고', dataIndex: 'warehouse' },
    { title: '현재고', dataIndex: 'stockQty' },
    { title: '안전재고', dataIndex: 'safetyQty' },
  ];

  const data = [
    { key: 1, itemCode: 'P0001', itemName: '제품A', warehouse: '본사창고', stockQty: 500, safetyQty: 200 },
    { key: 2, itemCode: 'P0002', itemName: '제품B', warehouse: '2공장창고', stockQty: 300, safetyQty: 150 },
  ];

  return (
    <Card title="재고현황" style={{ width: '100%' }}>
      <SearchPanel>
        {/* TODO: 창고, 품목, 로케이션, 재고유형 등 검색 조건 추가 */}
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

export default InventoryListPage;
