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
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 backdrop-blur-md dark:bg-slate-950/90 shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-[#4A8EC6] to-[#6BC04A] bg-clip-text text-transparent group-hover:from-[#5B9ED3] group-hover:to-[#7ACC58] transition-all">
              CivicLens
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-[#4A8EC6] to-[#6BC04A] text-white hover:from-[#5B9ED3] hover:to-[#7ACC58] rounded-lg shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <UserPlus className="h-4 w-4" />
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

