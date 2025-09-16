import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { ref, push, onValue, off, DataSnapshot } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Componente Textarea temporal compatible con modo oscuro
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export function CrearPublicacion() {
  const { userProfile } = useAuth();
  console.debug('CrearPublicacion mounted, userProfile=', userProfile);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [categoria, setCategoria] = useState('General');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.isAdmin) {
      setError('No tienes permisos para crear publicaciones');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const publicacionesRef = ref(database, 'publicaciones');
      await push(publicacionesRef, {
        titulo,
        contenido,
        categoria,
        autorUid: userProfile?.uid ?? 'unknown',
        autorNombre: `${userProfile?.nombre ?? 'Anonimo'} ${userProfile?.apellido ?? ''}`,
        fecha: new Date().toISOString(),
      });

      setTitulo('');
      setContenido('');
      setCategoria('General');
      setSuccess('Publicación creada correctamente');
      // limpiar mensaje de éxito en 3s
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Error al crear la publicación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const categoriasRef = ref(database, 'categorias');
    const listener = (snapshot: DataSnapshot) => {
      const val = snapshot.val() as Record<string, { nombre: string }> | null;
      if (!val) {
        setCategorias([]);
        return;
      }
      const lista = Object.values(val).map((c) => c.nombre);
      setCategorias(lista);
      // if current category no longer exists, pick the first available
      setCategoria((current) => (lista.length && !lista.includes(current) ? lista[0] : current));
    };

    onValue(categoriasRef, listener);
    return () => off(categoriasRef, 'value', listener);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear publicación</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="categoria">Categoría</Label>
            {categorias.length > 0 ? (
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {categorias.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : (
              <Input id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
            )}
          </div>

          <div>
            <Label htmlFor="contenido">Contenido</Label>
            <Textarea 
              id="contenido" 
              value={contenido} 
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContenido(e.target.value)} 
              rows={8} 
              required 
              placeholder="Escribe el contenido de tu publicación aquí..."
            />
          </div>

          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}

          <Button type="submit" disabled={loading}>{loading ? 'Publicando...' : 'Publicar'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default CrearPublicacion;
