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
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    const profile: UserProfile = {
      uid: user.uid,
      nombre,
      apellido,
      email,
      isAdmin: false,
      fechaRegistro: new Date().toISOString(),
    };

    await set(ref(database, `usuarios/${user.uid}`), profile);
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
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
        const snapshot = await get(profileRef);
        
        if (snapshot.exists()) {
          setUserProfile(snapshot.val());
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