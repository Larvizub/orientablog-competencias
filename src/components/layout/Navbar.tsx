import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useTheme } from '@/components/useTheme';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  Users, 
  UserPlus, 
  PlusCircle, 
  User, 
  LogOut, 
  Sun, 
  Moon,
  Menu
} from 'lucide-react';

export function Navbar() {
  const { userProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, adminOnly: true },
    { path: '/blog', label: 'Blog', icon: BookOpen, adminOnly: false },
    { path: '/crear-publicacion', label: 'Crear Post', icon: PlusCircle, adminOnly: true },
    { path: '/citas', label: 'Citas', icon: Calendar, adminOnly: false },
    { path: '/talleres', label: 'Talleres', icon: Users, adminOnly: false },
    { path: '/crear-taller', label: 'Crear Taller', icon: UserPlus, adminOnly: true },
    { path: '/usuarios', label: 'Usuarios', icon: Users, adminOnly: true },
    { path: '/perfil', label: 'Perfil', icon: User, adminOnly: false },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.adminOnly || (userProfile?.isAdmin)
  );

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span className="font-bold text-xl">OrientaBlog</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredNavItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">
                    {userProfile?.nombre} {userProfile?.apellido}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/perfil" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Mi Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {filteredNavItems.map((item) => (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path} className="flex items-center">
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}