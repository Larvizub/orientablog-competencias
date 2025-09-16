import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, MessageCircle, Calendar } from 'lucide-react';

interface DashboardStats {
  usuarios: number;
  publicaciones: number;
  comentarios: number;
  citas: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    usuarios: 0,
    publicaciones: 0,
    comentarios: 0,
    citas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener estadísticas desde Firebase
        const [usuariosSnapshot, publicacionesSnapshot, citasSnapshot] = await Promise.all([
          get(ref(database, 'usuarios')),
          get(ref(database, 'publicaciones')),
          get(ref(database, 'citas'))
        ]);

        const usuarios = usuariosSnapshot.exists() ? Object.keys(usuariosSnapshot.val()).length : 0;
        const publicaciones = publicacionesSnapshot.exists() ? Object.keys(publicacionesSnapshot.val()).length : 0;
        const citas = citasSnapshot.exists() ? Object.keys(citasSnapshot.val()).length : 0;

        // Contar comentarios en todas las publicaciones
        let comentarios = 0;
        if (publicacionesSnapshot.exists()) {
            const publicacionesData: Record<string, unknown> = publicacionesSnapshot.val();
            Object.values(publicacionesData).forEach((publicacion) => {
              if (publicacion && typeof publicacion === 'object' && 'comentarios' in (publicacion as Record<string, unknown>)) {
                const p = publicacion as Record<string, unknown>;
                const comentariosObj = p.comentarios as Record<string, unknown> | undefined;
                if (comentariosObj) {
                  comentarios += Object.keys(comentariosObj).length;
                }
              }
            });
        }

        setStats({ usuarios, publicaciones, comentarios, citas });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Usuarios Registrados',
      value: stats.usuarios,
      description: 'Total de usuarios en la plataforma',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Publicaciones',
      value: stats.publicaciones,
      description: 'Artículos del blog publicados',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      title: 'Comentarios',
      value: stats.comentarios,
      description: 'Comentarios en publicaciones',
      icon: MessageCircle,
      color: 'text-purple-600'
    },
    {
      title: 'Citas Agendadas',
      value: stats.citas,
      description: 'Citas programadas por usuarios',
      icon: Calendar,
      color: 'text-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de la actividad de OrientaBlog</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas actividades en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Nueva publicación creada</p>
                  <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Usuario registrado</p>
                  <p className="text-xs text-muted-foreground">Hace 4 horas</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Nuevo comentario</p>
                  <p className="text-xs text-muted-foreground">Hace 6 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Herramientas de administración
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a href="/crear-publicacion" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Crear Nueva Publicación</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Añadir contenido al blog
                </p>
              </a>
              <a href="/crear-taller" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Crear Nuevo Taller</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Organizar talleres y eventos
                </p>
              </a>
              <a href="/usuarios" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Gestionar Usuarios</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Ver y administrar usuarios
                </p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}