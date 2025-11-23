'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  BookOpen, 
  User, 
  LogOut, 
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, handleLogout } = useWeb3Auth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navItems = [
    { href: '/courses', label: 'Cursos', icon: BookOpen },
    { href: '/dashboard', label: 'Dashboard', icon: GraduationCap, authRequired: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex flex-1 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              0xAcademy
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => {
              if (item.authRequired && !isAuthenticated) return null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors hover:text-foreground/80 ${
                    pathname === item.href ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            <ConnectButton showBalance={false} />
            
            {isAuthenticated && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/instructor">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Área do Instrutor
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col space-y-3 p-4">
            {navItems.map((item) => {
              if (item.authRequired && !isAuthenticated) return null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 text-foreground/60 hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            <div className="pt-3 border-t">
              <ConnectButton showBalance={false} />
            </div>
            
            {isAuthenticated && (
              <>
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 text-foreground/60 hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Perfil</span>
                </Link>
                <Button variant="ghost" className="justify-start" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
