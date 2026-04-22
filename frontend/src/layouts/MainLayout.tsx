import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { ToastContainer } from '../components/ui/Toast';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { AiChatPanel } from '../components/AiChatPanel';
import { useAuthStore } from '../store/authStore';

export function MainLayout() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex h-screen bg-gray-50">
      <ToastContainer />
      <ChangePasswordModal isOpen={!!user?.forcePasswordChange} onClose={() => {}} />
      <AiChatPanel />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
