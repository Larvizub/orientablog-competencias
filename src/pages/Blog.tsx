import { useEffect, useState } from 'react';
import { ref, onValue, push } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/useAuth';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface Comentario {
  id: string;
  uid: string;
  nombre: string;
  texto: string;
  fecha: string;
}

interface Publicacion {
  id: string;
  titulo: string;
  contenido: string;
  categoria?: string;
  autorNombre?: string;
  fecha?: string;
}

export function Blog() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [selected, setSelected] = useState<Publicacion | null>(null);
  const [comentario, setComentario] = useState('');
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const { userProfile } = useAuth();

  useEffect(() => {
    const publicacionesRef = ref(database, 'publicaciones');
    const unsubscribe = onValue(publicacionesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list: Publicacion[] = Object.entries(data).map(([key, val]) => {
        const v = val as Record<string, unknown>;
        return {
          id: key,
          titulo: typeof v.titulo === 'string' ? v.titulo : String(v.titulo ?? ''),
          contenido: typeof v.contenido === 'string' ? v.contenido : String(v.contenido ?? ''),
          categoria: typeof v.categoria === 'string' ? v.categoria : undefined,
          autorNombre: typeof v.autorNombre === 'string' ? v.autorNombre : undefined,
          fecha: typeof v.fecha === 'string' ? v.fecha : undefined,
        } as Publicacion;
      });
      // ordenar por fecha desc si existe
      list.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
      setPublicaciones(list);
    });

    return () => unsubscribe();
  }, []);

  // subscribe comentarios for selected post
  useEffect(() => {
    if (!selected) {
      setComentarios([]);
      return;
    }

    const comentariosRef = ref(database, `comentarios/${selected.id}`);
    const unsub = onValue(comentariosRef, (snap) => {
      const data = snap.val() || {};
      const list: Comentario[] = Object.entries(data).map(([key, val]) => {
  const v = val as Record<string, unknown>;
        return {
          id: key,
          uid: String(v.uid || ''),
          nombre: String(v.nombre || ''),
          texto: String(v.texto || ''),
          fecha: String(v.fecha || ''),
        };
      });
      list.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
      setComentarios(list);
    });

    return () => unsub();
  }, [selected]);

  const handleOpen = (p: Publicacion) => {
    setSelected(p);
  };

  const handleComment = async () => {
    if (!selected || !userProfile) return;
    const commentsRef = ref(database, `comentarios/${selected.id}`);
    await push(commentsRef, {
      uid: userProfile.uid,
      nombre: `${userProfile.nombre} ${userProfile.apellido}`,
      texto: comentario,
      fecha: new Date().toISOString()
    });
    setComentario('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="text-muted-foreground">Descubre artículos sobre desarrollo profesional y orientación laboral</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {publicaciones.map((p) => (
          <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOpen(p)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{p.titulo}</CardTitle>
                  <p className="text-sm text-muted-foreground">{p.autorNombre} • {p.fecha ? new Date(p.fecha).toLocaleString() : ''}</p>
                </div>
                {p.categoria && <Badge variant="secondary">{p.categoria}</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <p className="mt-2 line-clamp-3 text-sm">{p.contenido}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{selected.titulo}</CardTitle>
                  <p className="text-sm text-muted-foreground">{selected.autorNombre} • {selected.fecha ? new Date(selected.fecha).toLocaleString() : ''}</p>
                </div>
                {selected.categoria && <Badge variant="secondary">{selected.categoria}</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 whitespace-pre-wrap text-base">{selected.contenido}</div>

              <div className="mt-6">
                <h3 className="font-semibold">Comentarios</h3>
                <div className="mt-3 space-y-3">
                  {comentarios.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sé el primero en comentar.</p>
                  ) : (
                    comentarios.map(c => (
                      <div key={c.id} className="border rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{c.nombre}</div>
                          <div className="text-xs text-muted-foreground">{new Date(c.fecha).toLocaleString()}</div>
                        </div>
                        <div className="mt-2 text-sm whitespace-pre-wrap">{c.texto}</div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Añadir comentario</label>
                  <Textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows={4} />
                  <div className="mt-2 flex justify-end">
                    <Button onClick={handleComment} disabled={!comentario || !userProfile}>Comentar</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Blog;