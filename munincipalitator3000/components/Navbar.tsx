'use client';

import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Search, Home, Calendar, Hash } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Navbar() {
  const t = useTranslations('Navbar');

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-zinc-900 hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300">
          Munincipalitator3000
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
          >
            <Home className="h-4 w-4" />
            {t('home')}
          </Link>

          <Link
            href="/topics"
            className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
          >
            <Hash className="h-4 w-4" />
            {t('topics')}
          </Link>

          <Link
            href="/search"
            className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
          >
            <Search className="h-4 w-4" />
            {t('search')}
          </Link>

          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}

