'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from '@/i18n/routing';
import { Hash, ArrowRight } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function TopicsOverviewPage() {
    const t = useTranslations('TopicsOverviewPage');

    const topics = [
        {
            slug: 'trash',
            title: t('trashTitle'),
            description: t('trashDescription'),
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-50 dark:bg-amber-950/20',
            eventCount: 3
        },
        {
            slug: 'traffic',
            title: t('trafficTitle'),
            description: t('trafficDescription'),
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-950/20',
            eventCount: 2
        },
        {
            slug: 'health',
            title: t('healthTitle'),
            description: t('healthDescription'),
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-50 dark:bg-green-950/20',
            eventCount: 2
        }
    ];

    return (
        <div className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-950">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Topics Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {topics.map((topic) => (
                        <Card key={topic.slug} className="transition-shadow hover:shadow-lg">
                            <CardHeader>
                                <div className={`mb-4 inline-flex rounded-lg p-3 ${topic.bgColor}`}>
                                    <Hash className={`h-6 w-6 ${topic.color}`} />
                                </div>
                                <CardTitle className="text-2xl">{topic.title}</CardTitle>
                                <CardDescription className="text-base">{topic.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                        {topic.eventCount} {t('activeEvents')}
                                    </span>
                                    <Link href={`/topics/${topic.slug}`}>
                                        <Button>
                                            {t('viewTopic')}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

