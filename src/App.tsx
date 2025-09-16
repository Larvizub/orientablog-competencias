import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ThemeProvider from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthPage } from '@/pages/AuthPage';
import { Dashboard } from '@/pages/Dashboard';
import { Blog } from '@/pages/Blog';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/blog"
              element={
                <ProtectedRoute>
                  <Blog />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
