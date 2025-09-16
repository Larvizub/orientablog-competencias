import { useState } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('RegisterForm: handleSubmit iniciado', formData);
    
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      console.log('RegisterForm: Error - contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      console.log('RegisterForm: Error - contraseña muy corta');
      return;
    }

    try {
      setError('');
      setLoading(true);
      console.log('RegisterForm: Llamando a register()');
      await register(formData.email, formData.password, formData.nombre, formData.apellido);
      console.log('RegisterForm: register() completado exitosamente');
    } catch (error) {
      console.error('RegisterForm: Error en register():', error);
      
      // Manejar errores específicos de Firebase
      let msg = 'Error al crear la cuenta. Intenta de nuevo.';
      
      if (error instanceof Error) {
        if (error.message.includes('auth/email-already-in-use')) {
          msg = 'Este email ya está registrado. ¿Quieres iniciar sesión en su lugar?';
        } else if (error.message.includes('auth/weak-password')) {
          msg = 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
        } else if (error.message.includes('auth/invalid-email')) {
          msg = 'El formato del email no es válido.';
        } else if (error.message.includes('auth/operation-not-allowed')) {
          msg = 'El registro con email/contraseña no está habilitado.';
        } else {
          msg = error.message;
        }
      }
      
      setError(msg);
    } finally {
      setLoading(false);
      console.log('RegisterForm: handleSubmit terminado, loading=false');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Crear Cuenta</CardTitle>
        <CardDescription>
          Regístrate para acceder a OrientaBlog
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              type="text"
              placeholder="Tu nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apellido">Apellido</Label>
            <Input
              id="apellido"
              name="apellido"
              type="text"
              placeholder="Tu apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={onSwitchToLogin}
              className="text-sm"
            >
              ¿Ya tienes cuenta? Inicia sesión aquí
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}