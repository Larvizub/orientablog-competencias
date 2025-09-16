import { useAuth } from '@/contexts/useAuth';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { currentUser, userProfile, loading } = useAuth();

  // Logging temporal para debug
  console.log('ProtectedRoute:', {
    loading,
    currentUser: currentUser?.uid,
    userProfile,
    adminOnly,
    isAdmin: userProfile?.isAdmin
  });

  if (loading) {
    console.log('ProtectedRoute: Mostrando loader porque loading=true');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    console.log('ProtectedRoute: Redirigiendo a /auth porque no hay currentUser');
    return <Navigate to="/auth" replace />;
  }

  if (adminOnly && !userProfile?.isAdmin) {
    console.log('ProtectedRoute: Redirigiendo a /blog porque adminOnly=true pero userProfile.isAdmin=', userProfile?.isAdmin);
    return <Navigate to="/blog" replace />;
  }

  console.log('ProtectedRoute: Permitiendo acceso');
  return <>{children}</>;
}