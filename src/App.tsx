import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './app/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthInit } from './hooks/useAuthInit';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import GoogleCallbackPage from './pages/auth/GoogleCallbackPage';

// Main pages
import SettlementsPage from './pages/SettlementsPage';
import GamesPage from './pages/GamesPage';
import ProfilePage from './pages/ProfilePage';
import SettlementDetailPage from './pages/SettlementDetailPage';
import ExpenseDetailPage from './pages/ExpenseDetailPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/settlements" replace />} />
          <Route path="/settlements" element={<SettlementsPage />} />
          <Route path="/settlements/:groupId" element={<SettlementDetailPage />} />
          <Route path="/settlements/:groupId/expense/:expenseId" element={<ExpenseDetailPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const { isLoading } = useAuthInit();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--color-background)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💸</div>
          <div style={{ color: 'var(--color-text-secondary)' }}>로딩 중...</div>
        </div>
      </div>
    );
  }

  return <AppRoutes />;
}
