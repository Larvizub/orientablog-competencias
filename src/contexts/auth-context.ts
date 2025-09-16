import { createContext } from 'react';
import type { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  nombre: string;
  apellido: string;
  email: string;
  isAdmin: boolean;
  fechaRegistro: string;
  perfilProfesional?: string;
  experienciaLaboral?: string;
  habilidades?: string[];
  educacion?: string;
  proyectos?: string;
  metasProfesionales?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<unknown>;
  register: (email: string, password: string, nombre: string, apellido: string) => Promise<unknown>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
