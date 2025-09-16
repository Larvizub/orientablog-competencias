import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { ref, get, set, remove } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import type { UserProfile } from '@/contexts/auth-context';

export function Usuarios() {
  const { userProfile } = useAuth();
  type UserWithCount = UserProfile & { publicacionesCount?: number; isOrientador?: boolean };
  const [usuarios, setUsuarios] = useState<UserWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Usuarios: Cargando lista de usuarios desde DB');
      
      const usuariosRef = ref(database, 'usuarios');
      const [snapshot, publicacionesSnapshot] = await Promise.all([
        get(usuariosRef),
        get(ref(database, 'publicaciones'))
      ]);

      // construir mapa de conteo de publicaciones por autor
      const publicacionesData = publicacionesSnapshot.exists() ? publicacionesSnapshot.val() : null;
      const publicacionesCountMap: Record<string, number> = {};
      if (publicacionesData) {
        type Publicacion = { autorUid?: string };
        const publicacionesArray = Object.values(publicacionesData) as Publicacion[];
        publicacionesArray.forEach((p) => {
          const uid = p?.autorUid;
          if (!uid) return;
          publicacionesCountMap[uid] = (publicacionesCountMap[uid] || 0) + 1;
        });
      }

      if (snapshot.exists()) {
        const usuariosData = snapshot.val();
        const usuariosArray = Object.values(usuariosData) as UserProfile[];

        // Ordenar por fecha de registro (más recientes primero)
        usuariosArray.sort((a, b) => 
          new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime()
        );

        // añadir conteo de publicaciones en memoria para render
        const usuariosConCount = usuariosArray.map(u => ({
          ...u,
          publicacionesCount: publicacionesCountMap[u.uid] || 0
        })) as UserWithCount[];

        setUsuarios(usuariosConCount);
        console.log('Usuarios: Cargados', usuariosConCount.length, 'usuarios');
      } else {
        setUsuarios([]);
        console.log('Usuarios: No se encontraron usuarios en la DB');
      }
    } catch (err) {
      console.error('Usuarios: Error cargando usuarios:', err);
      setError('Error al cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const toggleAdminStatus = async (usuario: UserWithCount) => {
    if (!userProfile?.isAdmin) {
      setError('No tienes permisos para cambiar roles de usuario');
      return;
    }

    if (usuario.uid === userProfile.uid) {
      setError('No puedes cambiar tus propios permisos');
      return;
    }

    try {
      setUpdating(usuario.uid);
      setError('');
      
      const nuevoIsAdmin = !usuario.isAdmin;
      console.log('Usuarios: Cambiando isAdmin de', usuario.email, 'a', nuevoIsAdmin);
      
      const usuarioRef = ref(database, `usuarios/${usuario.uid}`);
      await set(usuarioRef, {
        ...usuario,
        isAdmin: nuevoIsAdmin
      });

      // Actualizar estado local
      setUsuarios(prev => 
        prev.map(u => 
          u.uid === usuario.uid 
            ? { ...u, isAdmin: nuevoIsAdmin }
            : u
        )
      );

      console.log('Usuarios: Permisos actualizados exitosamente');
    } catch (err) {
      console.error('Usuarios: Error actualizando permisos:', err);
      setError('Error al actualizar los permisos del usuario');
    } finally {
      setUpdating(null);
    }
  };

  const toggleOrientadorStatus = async (usuario: UserWithCount) => {
    if (!userProfile?.isAdmin) {
      setError('No tienes permisos para cambiar roles de usuario');
      return;
    }

    if (usuario.uid === userProfile.uid) {
      setError('No puedes cambiar tus propios permisos');
      return;
    }

    try {
      setUpdating(usuario.uid);
      setError('');

      const nuevoIsOrientador = !usuario.isOrientador;
      const usuarioRef = ref(database, `usuarios/${usuario.uid}`);
      await set(usuarioRef, {
        ...usuario,
        isOrientador: nuevoIsOrientador
      });

      setUsuarios(prev => 
        prev.map(u => 
          u.uid === usuario.uid 
            ? { ...u, isOrientador: nuevoIsOrientador }
            : u
        )
      );
    } catch (err) {
      console.error('Usuarios: Error actualizando orientador:', err);
      setError('Error al actualizar el rol de orientador');
    } finally {
      setUpdating(null);
    }
  };

  const [deleting, setDeleting] = useState<string | null>(null);

  const deleteUser = async (usuario: UserWithCount) => {
    if (!userProfile?.isAdmin) {
      setError('No tienes permisos para eliminar usuarios');
      return;
    }

    if (usuario.uid === userProfile.uid) {
      setError('No puedes eliminar tu propia cuenta');
      return;
    }

    const confirmed = window.confirm(`¿Eliminar al usuario ${usuario.nombre} ${usuario.apellido}? Esta acción eliminará su perfil y sus publicaciones.`);
    if (!confirmed) return;

    try {
      setDeleting(usuario.uid);
      setError('');

      // Eliminar publicaciones y comentarios asociados
      const publicacionesSnap = await get(ref(database, 'publicaciones'));
      if (publicacionesSnap.exists()) {
        type PublicacionesRecord = Record<string, { autorUid?: string } | null>;
        const publicaciones = publicacionesSnap.val() as PublicacionesRecord;
        for (const postId of Object.keys(publicaciones)) {
          const p = publicaciones[postId];
          if (p?.autorUid === usuario.uid) {
            // eliminar la publicación
            await remove(ref(database, `publicaciones/${postId}`));
            // eliminar comentarios asociados a la publicación
            await remove(ref(database, `comentarios/${postId}`));
          }
        }
      }

      // Eliminar perfil de usuario
      await remove(ref(database, `usuarios/${usuario.uid}`));

      // Actualizar estado local
      setUsuarios(prev => prev.filter(u => u.uid !== usuario.uid));

      console.log('Usuarios: Usuario eliminado:', usuario.uid);
    } catch (err) {
      console.error('Usuarios: Error eliminando usuario:', err);
      setError('Error al eliminar el usuario');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <Button onClick={cargarUsuarios} disabled={loading}>
          Actualizar Lista
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        {usuarios.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No se encontraron usuarios registrados
              </p>
            </CardContent>
          </Card>
        ) : (
          <table className="table-auto w-full min-w-full divide-y divide-border bg-card rounded-md overflow-hidden">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">Nombre</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Fecha registro</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Publicaciones</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Admin</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Orientador</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {usuarios.map((usuario) => (
                <tr key={usuario.uid}>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{usuario.nombre} {usuario.apellido}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{usuario.email}</td>
                  <td className="px-4 py-3 text-sm">{new Date(usuario.fechaRegistro).toLocaleDateString('es-ES')}</td>
                  <td className="px-4 py-3 text-sm">{usuario.publicacionesCount ?? 0}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {usuario.uid === userProfile?.uid ? (
                      <Badge variant="outline">Tú</Badge>
                    ) : (
                      <div className="flex items-center">
                        {usuario.isAdmin && <Badge variant="default" className="mr-2">Admin</Badge>}
                        {userProfile?.isAdmin ? (
                          <Switch
                            id={`admin-${usuario.uid}`}
                            checked={usuario.isAdmin}
                            onCheckedChange={() => toggleAdminStatus(usuario)}
                            disabled={updating === usuario.uid}
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </div>
                    )}
                    {updating === usuario.uid && (
                      <p className="text-sm text-muted-foreground mt-2">Actualizando permisos...</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {usuario.uid === userProfile?.uid ? (
                      <Badge variant="outline">Tú</Badge>
                    ) : (
                      <div className="flex items-center">
                        {usuario.isOrientador && <Badge variant="default" className="mr-2">Orientador</Badge>}
                        {userProfile?.isAdmin ? (
                          <Switch
                            id={`orientador-${usuario.uid}`}
                            checked={Boolean(usuario.isOrientador)}
                            onCheckedChange={() => toggleOrientadorStatus(usuario)}
                            disabled={updating === usuario.uid}
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm min-w-[140px] whitespace-nowrap">
                    {userProfile?.isAdmin && usuario.uid !== userProfile.uid ? (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteUser(usuario)}
                          disabled={deleting === usuario.uid}
                        >
                          Eliminar
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Usuarios;