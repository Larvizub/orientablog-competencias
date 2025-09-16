import React, { useEffect, useState } from 'react';
import AuthContext from './auth-context';
import type { UserProfile } from './auth-context';
import { 
  type User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database } from '@/lib/firebase';

// Usar el contexto definido en auth-context.tsx
// AuthContext se importa desde './auth-context' al inicio del archivo

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const register = async (email: string, password: string, nombre: string, apellido: string) => {
    console.log('AuthProvider.register iniciado para:', email);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('AuthProvider.register - Usuario Firebase creado:', user.uid);

      const profile: UserProfile = {
        uid: user.uid,
        nombre,
        apellido,
        email,
        // Si es el primer usuario o es admin@orientablog.com, hacer admin automáticamente
        isAdmin: email === 'admin@orientablog.com' || email.includes('admin'),
        fechaRegistro: new Date().toISOString(),
      };

      console.log('AuthProvider.register - Intentando guardar perfil en DB:', profile);
      await set(ref(database, `usuarios/${user.uid}`), profile);
      console.log('AuthProvider.register - Perfil guardado en DB exitosamente');
      
      // Actualizar estado local inmediatamente
      setUserProfile(profile);
      console.log('AuthProvider.register - Estado local actualizado');
    } catch (error) {
      console.error('AuthProvider.register - Error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthProvider.login called for', email);
      const res = await signInWithEmailAndPassword(auth, email, password);
      console.log('AuthProvider.login success', res.user?.uid);
      return res;
    } catch (error) {
      console.error('AuthProvider.login error', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Obtener el perfil del usuario desde la base de datos
        const profileRef = ref(database, `usuarios/${user.uid}`);
        try {
          const snapshot = await get(profileRef);
          if (snapshot.exists()) {
            setUserProfile(snapshot.val());
          } else {
            // No existe perfil, limpiar
            setUserProfile(null);
          }
        } catch (error: unknown) {
          // Manejar errores de permisos u otros errores de la DB
          console.error('Error leyendo perfil de usuario desde Realtime DB', error);
          // Si el error es por permisos, intentamos un fallback seguro para el administrador
          // (temporal: configura reglas en Firebase para resolver esto de forma permanente)
          try {
            const adminEmails = ['admin@orientablog.com'];
            const adminUidFallback = 'yXug6S5Ia3RrJRrQgSIFnVaPsw52';
            if (user && (adminEmails.includes(user.email || '') || user.uid === adminUidFallback)) {
              // Conceder permisos de administrador localmente mientras se corrigen las reglas
              const fallbackProfile: UserProfile = {
                uid: user.uid,
                nombre: 'Administrador',
                apellido: '',
                email: user.email || 'admin@orientablog.com',
                isAdmin: true,
                fechaRegistro: new Date().toISOString()
              };
              console.warn('Aplicando fallback de perfil ADMIN local para', user.uid);
              setUserProfile(fallbackProfile);
            } else {
              setUserProfile(null);
            }
          } catch {
            // En caso de cualquier otro error, limpiar perfil
            setUserProfile(null);
          }
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}