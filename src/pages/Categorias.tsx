import React, { useEffect, useState } from 'react';
import { ref, push, onValue, remove } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';

type Categoria = {
  id: string;
  nombre: string;
};

export default function Categorias() {
  const { userProfile } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const categoriasRef = ref(database, 'categorias');
    const unsub = onValue(categoriasRef, (snapshot) => {
      const val = snapshot.val() as Record<string, { nombre: string }> | null;
      if (!val) {
        setCategorias([]);
        return;
      }
      const lista = Object.entries(val).map(([id, obj]) => ({ id, nombre: obj.nombre }));
      setCategorias(lista);
    });

    return () => unsub();
  }, []);

  const crearCategoria = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userProfile?.isAdmin) {
      setError('Solo administradores pueden crear categorías');
      return;
    }

    if (!nombre.trim()) return;
    try {
      setLoading(true);
      setError('');
      const categoriasRef = ref(database, 'categorias');
      await push(categoriasRef, { nombre: nombre.trim() });
      setNombre('');
    } catch (err) {
      console.error(err);
      setError('Error al crear la categoría');
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id: string) => {
    if (!userProfile?.isAdmin) {
      setError('Solo administradores pueden eliminar categorías');
      return;
    }
    if (!confirm('¿Eliminar categoría? Esto no eliminará publicaciones existentes.')) return;
    try {
      await remove(ref(database, `categorias/${id}`));
    } catch (err) {
      console.error(err);
      setError('Error al eliminar la categoría');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorías</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={crearCategoria} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nueva categoría</Label>
            <div className="flex gap-2">
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              <Button type="submit" disabled={loading} aria-label="Agregar categoría" className="h-10 w-10 p-0">
                {loading ? <Plus className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {error && <div className="text-red-500">{error}</div>}

          <div>
            <h4 className="text-sm font-medium mb-2">Lista de categorías</h4>
            <ul className="space-y-2">
              {categorias.map((c) => (
                <li key={c.id} className="flex items-center justify-between border p-2 rounded">
                  <span>{c.nombre}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => eliminar(c.id)} aria-label={`Eliminar ${c.nombre}`} className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
              {categorias.length === 0 && <li className="text-sm text-muted-foreground">No hay categorías creadas</li>}
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
