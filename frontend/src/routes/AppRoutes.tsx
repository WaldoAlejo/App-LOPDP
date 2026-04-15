import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

export function AppRoutes() {
  const isAuthenticated = false; // TODO: conectar con auth store

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}
      >
        <Route index element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
