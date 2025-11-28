import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import LandingPage from '../pages/landing/LandingPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import OrderListPage from '../pages/orders/OrderListPage';
import InventoryListPage from '../pages/inventory/InventoryListPage';
import ProtectedRoute from './ProtectedRoute';

// AppRouter는 전체 라우팅과 레이아웃 구성을 담당합니다.
// - /, /login: 메인(랜딩) + 로그인 팝업 화면
// - /app/* : 로그인 이후 공통 레이아웃(AppLayout)을 사용하는 화면
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 메인/로그인 화면 */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LandingPage />} />

        {/* 로그인 이후 공통 레이아웃 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="orders" element={<OrderListPage />} />
            <Route path="inventory" element={<InventoryListPage />} />
            {/* TODO: 품목/BOM/공정, 작업/품질, 설비/모니터링, 시스템관리 등 추가 */}
          </Route>
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<div style={{ padding: 24 }}>페이지를 찾을 수 없습니다.</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export { AppRouter };
