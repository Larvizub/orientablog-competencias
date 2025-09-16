import React, { useEffect, useState, useRef } from 'react';
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
  const categoryRootRef = useRef<HTMLDivElement | null>(null);

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
  // si la categoría actual deja de existir, seleccionar la primera disponible
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
              // Custom dropdown to avoid native select positioning issues on mobile
              <div className="relative" ref={categoryRootRef}>
                <CategoryDropdown
                  options={categorias}
                  value={categoria}
                  onChange={(v: string) => setCategoria(v)}
                />
              </div>
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

// Local simple dropdown component
function CategoryDropdown({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!buttonRef.current || !listRef.current) return;
      const target = e.target as Node;
      if (!buttonRef.current.contains(target) && !listRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setOpen(v => !v)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-left text-sm flex items-center justify-between"
      >
        <span>{value}</span>
        <span className="ml-2 text-xs">▾</span>
      </button>

      {open && (
        <div ref={listRef} className="absolute z-50 mt-1 w-full rounded-md bg-popover shadow-lg">
          <div className="max-h-56 overflow-auto">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/80 ${opt === value ? 'bg-primary text-primary-foreground' : ''}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
