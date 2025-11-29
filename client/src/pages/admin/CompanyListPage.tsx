import { useEffect, useState } from 'react';
import { Table, Tag, Typography, Alert } from 'antd';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

type Company = {
  id: number;
  code: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

// 시스템 관리자만 접근해야 하는 회사 목록 화면의 최소 뼈대입니다.
const CompanyListPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'SYSTEM_ADMIN') return;
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<Company[]>('/admin/companies');
        setData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || '회사를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [user?.role]);

  if (user?.role !== 'SYSTEM_ADMIN') {
    return (
      <Alert
        message="접근 권한이 없습니다."
        description="회사 관리는 시스템 관리자만 확인할 수 있습니다."
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 16 }}>
        회사 관리
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
        시스템 관리자 전용 화면입니다. 회사코드/이름/상태를 확인할 수 있으며, 이후 생성/수정/비활성 기능을 확장할 예정입니다.
      </Typography.Paragraph>
      {error && (
        <Alert
          style={{ marginBottom: 16 }}
          message="오류"
          description={error}
          type="error"
          showIcon
        />
      )}
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 80 },
          { title: '회사코드', dataIndex: 'code' },
          { title: '회사명', dataIndex: 'name' },
          {
            title: '상태',
            dataIndex: 'status',
            render: (status: string) => (
              <Tag color={status === 'ACTIVE' ? 'green' : 'orange'}>{status}</Tag>
            ),
          },
          { title: '생성일', dataIndex: 'createdAt' },
          { title: '수정일', dataIndex: 'updatedAt' },
        ]}
      />
    </div>
  );
};

export default CompanyListPage;
