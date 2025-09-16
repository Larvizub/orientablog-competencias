import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ThemeProvider from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthPage } from '@/pages/AuthPage';
import { Dashboard } from '@/pages/Dashboard';
import { Blog } from '@/pages/Blog';
import CrearPublicacion from '@/pages/CrearPublicacion';
import Usuarios from '@/pages/Usuarios';
import Categorias from '@/pages/Categorias';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />

            {/* Layout wraps protected routes and shows Navbar + Sidebar */}
            <Route element={<Layout />}> 
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
              <Route
                path="/crear-publicacion"
                element={
                  <ProtectedRoute adminOnly>
                    <CrearPublicacion />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/usuarios"
                element={
                  <ProtectedRoute adminOnly>
                    <Usuarios />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categorias"
                element={
                  <ProtectedRoute adminOnly>
                    <Categorias />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
