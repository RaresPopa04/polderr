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
    <div className="flex items-center gap-2">
      <Button
        variant={isEnglish ? 'outline' : 'default'}
        size="sm"
        onClick={() => router.replace(pathname, { locale: 'en' })}
      >
        English
      </Button>
      <Button
        variant={isDutch ? 'outline' : 'default'}
        size="sm"
        onClick={() => router.replace(pathname, { locale: 'nl' })}
      >
        Nederlands
      </Button>
    </div>
  );
}

