import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import LandingPage from '../pages/landing/LandingPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import OrderListPage from '../pages/orders/OrderListPage';
import InventoryListPage from '../pages/inventory/InventoryListPage';
import ProtectedRoute from './ProtectedRoute';
import ProfilePage from '../pages/profile/ProfilePage';
import CompanyListPage from '../pages/admin/CompanyListPage';

// AppRouter는 전체 경로와 레이아웃 구성을 정의합니다.
// - /, /login: 랜딩(메인) + 로그인 팝업 화면
// - /app/* : 로그인 후 레이아웃(AppLayout)을 사용하는 화면
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 랜딩/로그인 화면 */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LandingPage />} />

        {/* 로그인 필요 구간 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="orders" element={<OrderListPage />} />
            <Route path="inventory" element={<InventoryListPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="admin/companies" element={<CompanyListPage />} />
            {/* TODO: 품목/BOM/공정, 작업/품질, 설비/모니터링 등 추가 */}
          </Route>
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<div style={{ padding: 24 }}>페이지를 찾을 수 없습니다.</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export { AppRouter };
