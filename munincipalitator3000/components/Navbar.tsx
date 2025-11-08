'use client';

import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const t = useTranslations('Navbar');
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-zinc-900 hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300">
            Munincipalitator3000
          </Link>
          <div className="flex gap-4">
            <Link 
              href="/" 
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {t('home')}
            </Link>
            <Link 
              href="/events" 
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {t('events')}
            </Link>
            <div className="relative">
              <button
                onClick={() => setIsTopicsOpen(!isTopicsOpen)}
                onBlur={() => setTimeout(() => setIsTopicsOpen(false), 200)}
                className="flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                {t('topics')}
                <ChevronDown className={`h-4 w-4 transition-transform ${isTopicsOpen ? 'rotate-180' : ''}`} />
              </button>
              {isTopicsOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                  <Link
                    href="/topics"
                    className="block border-b border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    onClick={() => setIsTopicsOpen(false)}
                  >
                    {t('allTopics')}
                  </Link>
                  <Link
                    href="/topics/trash"
                    className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    onClick={() => setIsTopicsOpen(false)}
                  >
                    {t('trash')}
                  </Link>
                  <Link
                    href="/topics/health"
                    className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    onClick={() => setIsTopicsOpen(false)}
                  >
                    {t('health')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        <LanguageSwitcher />
      </div>
    </nav>
  );
}

