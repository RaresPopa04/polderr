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
    <nav className="sticky top-0 z-50 border-b border-[#4A8EC6]/20 bg-white/80 backdrop-blur-sm dark:border-[#5B9ED3]/30 dark:bg-[#0f1419]/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-[#4A8EC6] to-[#6BC04A] bg-clip-text text-transparent hover:from-[#5B9ED3] hover:to-[#7ACC58] transition-all tracking-tight">
          CivicLens
        </Link>

        <div className="flex items-center gap-6">
          <LanguageSwitcher />

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-[#4A8EC6] dark:text-zinc-300 dark:hover:text-[#7CB8E8] transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-[#4A8EC6] dark:text-zinc-300 dark:hover:text-[#7CB8E8] transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-2 text-sm font-medium text-[#6BC04A] hover:text-[#4A9B35] dark:text-[#7ACC58] dark:hover:text-[#9DE57A] transition-colors"
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

