'use client';

import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LogIn, UserPlus, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 backdrop-blur-sm dark:bg-zinc-950/90">
      <div className="mx-auto flex w-full items-center justify-between px-4 py-4">
        <Link href="/" className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors tracking-tight ml-4">
          CivicLens
        </Link>

        <div className="flex items-center gap-6">
          <LanguageSwitcher />

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

