import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuth';
import { ThemeProvider } from '@/components/theme-provider';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/Login';
import DashboardPage from '@/pages/Dashboard';
import UsersPage from '@/pages/Users';
import RunsPage from '@/pages/Runs';
import AchievementsPage from '@/pages/Achievements';
import ChallengesPage from '@/pages/Challenges';
import ZonesPage from '@/pages/Zones';
import NotificationsPage from '@/pages/Notifications';
import WebhooksPage from '@/pages/Webhooks';
import CompliancePage from '@/pages/Compliance';
import AuditLogsPage from '@/pages/AuditLogs';
import ProfilePage from '@/pages/Profile';
import SettingsPage from '@/pages/Settings';
import { Toaster } from 'react-hot-toast';
import './index.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="invade-admin-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="runs" element={<RunsPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="challenges" element={<ChallengesPage />} />
            <Route path="zones" element={<ZonesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="webhooks" element={<WebhooksPage />} />
            <Route path="compliance" element={<CompliancePage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
          success: {
            iconTheme: {
              primary: 'hsl(var(--primary))',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'hsl(var(--destructive))',
              secondary: 'white',
            },
          },
        }}
      />
    </ThemeProvider>
  );
}

export default App;
