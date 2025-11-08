import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function Home() {
  const t = useTranslations('HomePage');

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-8 dark:bg-zinc-950">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t('title')}
          </h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            {t('subtitle')}
          </p>
          <div className="mt-4">
            <Link href="/events">
              <Button size="lg">
                {t('viewEventsButton')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('welcomeTitle')}</CardTitle>
              <CardDescription>
                {t('welcomeDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('nameLabel')}</Label>
                <Input id="name" placeholder={t('namePlaceholder')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('emailLabel')}</Label>
                <Input id="email" type="email" placeholder={t('emailPlaceholder')} />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button>{t('submitButton')}</Button>
              <Button variant="outline">{t('cancelButton')}</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('buttonVariantsTitle')}</CardTitle>
              <CardDescription>
                {t('buttonVariantsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>{t('defaultButton')}</Button>
                <Button variant="secondary">{t('secondaryButton')}</Button>
                <Button variant="destructive">{t('destructiveButton')}</Button>
                <Button variant="outline">{t('outlineButton')}</Button>
                <Button variant="ghost">{t('ghostButton')}</Button>
                <Button variant="link">{t('linkButton')}</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">{t('smallButton')}</Button>
                <Button size="default">{t('defaultButton')}</Button>
                <Button size="lg">{t('largeButton')}</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('componentsTitle')}</CardTitle>
            <CardDescription>
              {t('componentsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <li>{t('componentButton')}</li>
              <li>{t('componentCard')}</li>
              <li>{t('componentInput')}</li>
              <li>{t('componentLabel')}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
