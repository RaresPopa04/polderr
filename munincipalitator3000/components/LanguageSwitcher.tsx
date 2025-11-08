'use client';

import { useParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={locale === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => router.replace(pathname, { locale: 'en' })}
      >
        English
      </Button>
      <Button
        variant={locale === 'nl' ? 'default' : 'outline'}
        size="sm"
        onClick={() => router.replace(pathname, { locale: 'nl' })}
      >
        Nederlands
      </Button>
    </div>
  );
}

