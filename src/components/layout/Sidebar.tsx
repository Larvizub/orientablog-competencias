// ...existing code...
import { NavLink } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  BookOpen, 
  PenTool, 
  Calendar, 
  Users2, 
  Plus, 
  UserCheck, 
  User 
} from 'lucide-react';
import { Tag } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3, adminOnly: true },
  { to: '/blog', label: 'Blog', icon: BookOpen },
  { to: '/crear-publicacion', label: 'Crear Publicación', icon: PenTool, adminOnly: true },
  { to: '/citas', label: 'Agendar Cita', icon: Calendar },
  { to: '/talleres', label: 'Talleres', icon: Users2 },
  { to: '/crear-taller', label: 'Crear Taller', icon: Plus, adminOnly: true },
  { to: '/usuarios', label: 'Usuarios', icon: UserCheck, adminOnly: true },
  { to: '/categorias', label: 'Categorías', icon: Tag, adminOnly: true },
  { to: '/perfil', label: 'Perfil', icon: User }
];

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 hidden md:block">
        <Card className="sticky top-6 bg-white/50 dark:bg-gray-900/50">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {links.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `block w-full text-left rounded-md p-2 hover:bg-muted transition-colors ${isActive ? 'bg-muted/60 font-semibold' : ''}`
                    }
                  >
                    <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-2">
                      <IconComponent className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Button>
                  </NavLink>
                );
              })}
            </nav>
          </CardContent>
        </Card>
      </aside>

      {/* Mobile overlay sidebar */}
      <div className={`fixed inset-0 z-50 md:hidden transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40" onClick={() => onClose?.()} />
        <div className="absolute left-0 top-0 bottom-0 w-64 bg-background p-4 shadow-lg">
          <div className="mb-4 flex justify-end">
            <Button variant="ghost" onClick={() => onClose?.()} aria-label="Cerrar menú">✕</Button>
          </div>
          <nav className="space-y-1">
            {links.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose?.()}
                  className={({ isActive }) =>
                    `block w-full text-left rounded-md p-2 hover:bg-muted transition-colors ${isActive ? 'bg-muted/60 font-semibold' : ''}`
                  }
                >
                  <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-2">
                    <IconComponent className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Button>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
