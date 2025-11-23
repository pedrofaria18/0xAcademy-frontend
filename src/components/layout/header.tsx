'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';
import {
  GraduationCap,
  BookOpen,
  User,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Navigation Items - Static Configuration
 * Moved outside component to prevent recreation on every render
 */
interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  authRequired?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: '/courses', label: 'Cursos', icon: BookOpen },
  { href: '/dashboard', label: 'Dashboard', icon: GraduationCap, authRequired: true },
] as const;

/**
 * Header Component
 * Responsive navigation with Web3 authentication and theme toggle
 */
export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, handleLogout } = useWeb3Auth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // Memoized callbacks to prevent re-renders
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex flex-1 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="hidden font-bold sm:inline-block">0xAcademy</span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center space-x-6 text-sm font-medium"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => {
              if (item.authRequired && !isAuthenticated) return null;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors hover:text-foreground/80 ${
                    isActive ? 'text-foreground' : 'text-foreground/60'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
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
            onClick={toggleTheme}
            aria-label="Toggle theme"
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
                  <Button variant="ghost" size="icon" aria-label="User menu">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/instructor" className="flex items-center">
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
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col space-y-3 p-4" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => {
              if (item.authRequired && !isAuthenticated) return null;
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 text-foreground/60 hover:text-foreground"
                  onClick={closeMobileMenu}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
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
                  onClick={closeMobileMenu}
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  <span>Perfil</span>
                </Link>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
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
