import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { UsersPage } from '../pages/UsersPage';
import { CompaniesPage } from '../pages/CompaniesPage';
import { AreasPage } from '../pages/AreasPage';
import { ProcessesPage } from '../pages/ProcessesPage';
import { CatalogsPage } from '../pages/CatalogsPage';
import { TreatmentsPage } from '../pages/TreatmentsPage';
import { TreatmentWizardPage } from '../pages/TreatmentWizardPage';
import { ReviewsPage } from '../pages/ReviewsPage';
import { ReviewDetailPage } from '../pages/ReviewDetailPage';
import { useAuthStore } from '../store/authStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="treatments" element={<TreatmentsPage />} />
        <Route path="treatments/new" element={<TreatmentWizardPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="reviews/:id" element={<ReviewDetailPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="areas" element={<AreasPage />} />
        <Route path="processes" element={<ProcessesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="catalogs" element={<CatalogsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
