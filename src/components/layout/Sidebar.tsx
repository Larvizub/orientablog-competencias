// ...existing code...
import { NavLink } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const links = [
  { to: '/dashboard', label: 'Dashboard', adminOnly: true },
  { to: '/blog', label: 'Blog' },
  { to: '/crear-publicacion', label: 'Crear Publicación', adminOnly: true },
  { to: '/citas', label: 'Agendar Cita' },
  { to: '/talleres', label: 'Talleres' },
  { to: '/crear-taller', label: 'Crear Taller', adminOnly: true },
  { to: '/usuarios', label: 'Usuarios', adminOnly: true },
  { to: '/perfil', label: 'Perfil' }
];

export function Sidebar() {
  return (
    <aside className="w-64 hidden md:block">
      <Card className="sticky top-6 bg-white/50 dark:bg-gray-900/50">
        <CardContent className="p-2">
          <nav className="space-y-1">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block w-full text-left rounded-md p-2 hover:bg-muted ${isActive ? 'bg-muted/60 font-semibold' : ''}`
                }
              >
                <Button variant="ghost" className="w-full justify-start">
                  {item.label}
                </Button>
              </NavLink>
            ))}
          </nav>
        </CardContent>
      </Card>
    </aside>
  );
}

export default Sidebar;
