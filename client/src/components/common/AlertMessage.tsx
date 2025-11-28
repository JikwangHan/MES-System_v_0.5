import { Alert } from 'antd';

type Props = {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  description?: string;
};

// 간단한 공통 알림 컴포넌트
const AlertMessage = ({ message, type = 'info', description }: Props) => {
  return <Alert message={message} description={description} type={type} showIcon />;
};

export default AlertMessage;
