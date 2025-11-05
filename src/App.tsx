import { Route, Routes } from 'react-router-dom';
import PublicLayout from './layout/PublicLayout';
import DashboardLayout from './layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/public/HomePage';
import JoinPage from './pages/public/JoinPage';
import SignupPage from './pages/public/SignupPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';

export default function App() {
  return (
    <Routes>
      {/* Public routes with public layout */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <HomePage />
          </PublicLayout>
        }
      />
      <Route
        path="/join"
        element={
          <PublicLayout>
            <JoinPage />
          </PublicLayout>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicLayout>
            <SignupPage />
          </PublicLayout>
        }
      />
      <Route
        path="/auth/login"
        element={
          <PublicLayout>
            <LoginPage />
          </PublicLayout>
        }
      />
      <Route
        path="/auth/register"
        element={
          <PublicLayout>
            <RegisterPage />
          </PublicLayout>
        }
      />

      {/* Dashboard routes with dashboard layout */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
