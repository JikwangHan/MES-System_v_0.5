import { Button, Space } from 'antd';
import { UploadOutlined, DownloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

// CRUD 및 엑셀 업/다운로드 버튼 묶음을 제공하는 컴포넌트입니다.
// 필요 없는 버튼은 콜백을 전달하지 않으면 감춰집니다.
type Props = {
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onUpload?: () => void;
};

const CrudButtonGroup = ({ onAdd, onEdit, onDelete, onDownload, onUpload }: Props) => {
  return (
    <Space>
      {onAdd && (
        <Button icon={<PlusOutlined />} type="primary" onClick={onAdd}>
          추가
        </Button>
      )}
      {onEdit && (
        <Button icon={<EditOutlined />} onClick={onEdit}>
          수정
        </Button>
      )}
      {onDelete && (
        <Button icon={<DeleteOutlined />} danger onClick={onDelete}>
          삭제
        </Button>
      )}
      {onDownload && (
        <Button icon={<DownloadOutlined />} onClick={onDownload}>
          엑셀 다운로드
        </Button>
      )}
      {onUpload && (
        <Button icon={<UploadOutlined />} onClick={onUpload}>
          엑셀 업로드
        </Button>
      )}
    </Space>
  );
};

export default CrudButtonGroup;
