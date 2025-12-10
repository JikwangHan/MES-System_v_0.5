import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import AppLayout from '../layouts/AppLayout';
import LandingPage from '../pages/landing/LandingPage';
import ProtectedRoute from './ProtectedRoute';
import AdminOnly from './AdminOnly';

// Lazy load 각 페이지를 분리해 초기 번들 크기를 줄입니다.
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const OrderListPage = lazy(() => import('../pages/orders/OrderListPage'));
const InventoryListPage = lazy(() => import('../pages/inventory/InventoryListPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const CompanyListPage = lazy(() => import('../pages/admin/CompanyListPage'));
const UserListPage = lazy(() => import('../pages/admin/UserListPage'));
const EquipmentListPage = lazy(() => import('../pages/equipment/EquipmentListPage'));
const WorkOrdersPage = lazy(() => import('../pages/work/WorkOrdersPage'));

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
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
                  <DashboardPage />
                </Suspense>
              }
            />
            <Route
              path="orders"
              element={
                <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
                  <OrderListPage />
                </Suspense>
              }
            />
            <Route
              path="inventory"
              element={
                <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
                  <InventoryListPage />
                </Suspense>
              }
            />
            <Route
              path="equipment"
              element={
                <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
                  <EquipmentListPage />
                </Suspense>
              }
            />
            <Route
              path="profile"
              element={
                <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
                  <ProfilePage />
                </Suspense>
              }
            />
            {/* 관리자 전용 구간: AdminRoute 제거 후 ProtectedRoute + 페이지 내부에서 권한 체크 */}
            <Route
              path="admin/companies"
              element={
                <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
                  <AdminOnly>
                    <CompanyListPage />
                  </AdminOnly>
                </Suspense>
              }
            />
            <Route
              path="admin/users"
              element={
                <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
                  <AdminOnly>
                    <UserListPage />
                  </AdminOnly>
                </Suspense>
              }
            />
            <Route
              path="work/orders"
              element={
                <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
                  <WorkOrdersPage />
                </Suspense>
              }
            />
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
