'use client';

import { useParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const locale = (params.locale as string) || 'en';
  const isEnglish = locale === 'en';
  const isDutch = locale === 'nl';

  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
      <Button
        variant={isEnglish ? 'ghost' : 'default'}
        size="sm"
        onClick={() => router.replace(pathname, { locale: 'en' })}
        className={isEnglish ? 'bg-white dark:bg-slate-900 shadow-sm' : ''}
      >
        🇬🇧 EN
      </Button>
      <Button
        variant={isDutch ? 'ghost' : 'default'}
        size="sm"
        onClick={() => router.replace(pathname, { locale: 'nl' })}
        className={isDutch ? 'bg-white dark:bg-slate-900 shadow-sm' : ''}
      >
        🇳🇱 NL
      </Button>
    </div>
  );
}

