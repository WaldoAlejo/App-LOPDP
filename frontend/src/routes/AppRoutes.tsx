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
import { RisksPage } from '../pages/RisksPage';
import { ReportsPage } from '../pages/ReportsPage';
import { AuditsPage } from '../pages/AuditsPage';
import { EmailConfigPage } from '../pages/EmailConfigPage';
import { useAuthStore } from '../store/authStore';
import { canAccessAudits, canAccessManagement, canAccessReports, canAccessReviews, canAccessRisks } from '../utils/roleAccess';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
}

function RoleRoute({ children, allow }: { children: React.ReactNode; allow: (roleCode: string | undefined) => boolean }) {
  const user = useAuthStore((s) => s.user);
  return allow(user?.roleCode) ? <>{children}</> : <Navigate to="/" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

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
        <Route path="treatments/:id/edit" element={<TreatmentWizardPage />} />
        <Route path="reviews" element={<RoleRoute allow={canAccessReviews}><ReviewsPage /></RoleRoute>} />
        <Route path="reviews/:id" element={<RoleRoute allow={canAccessReviews}><ReviewDetailPage /></RoleRoute>} />
        <Route path="risks" element={<RoleRoute allow={canAccessRisks}><RisksPage /></RoleRoute>} />
        <Route path="reports" element={<RoleRoute allow={canAccessReports}><ReportsPage /></RoleRoute>} />
        <Route path="audits" element={<RoleRoute allow={canAccessAudits}><AuditsPage /></RoleRoute>} />
        <Route path="companies" element={<RoleRoute allow={canAccessManagement}><CompaniesPage /></RoleRoute>} />
        <Route path="areas" element={<RoleRoute allow={canAccessManagement}><AreasPage /></RoleRoute>} />
        <Route path="processes" element={<RoleRoute allow={canAccessManagement}><ProcessesPage /></RoleRoute>} />
        <Route path="users" element={<RoleRoute allow={canAccessManagement}><UsersPage /></RoleRoute>} />
        <Route path="catalogs" element={<RoleRoute allow={canAccessManagement}><CatalogsPage /></RoleRoute>} />
        <Route path="email-config" element={<RoleRoute allow={canAccessManagement}><EmailConfigPage /></RoleRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
