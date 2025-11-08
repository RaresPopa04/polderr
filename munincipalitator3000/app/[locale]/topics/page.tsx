'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from '@/i18n/routing';
import { Hash, ArrowRight } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { topicsApi } from '@/lib/api';

export default function TopicsOverviewPage() {
    const t = useTranslations('TopicsOverviewPage');
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadTopics() {
            try {
                const data = await topicsApi.listTopics();
                setTopics(data.topics);
                setLoading(false);
            } catch (err) {
                console.error('Failed to load topics:', err);
                setError('Failed to load topics data');
                setLoading(false);
            }
        }
        loadTopics();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="text-center">
                    <div className="h-32 w-32 mx-auto animate-spin rounded-full border-b-2 border-zinc-900 dark:border-zinc-50"></div>
                    <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">Loading topics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 text-xl mb-4">⚠️ {error}</p>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Make sure the backend is running at{' '}
                        <code className="bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">
                            http://localhost:8000
                        </code>
                    </p>
                </div>
            </div>
        );
    }

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
                        <Card key={topic.id} className="transition-shadow hover:shadow-lg">
                            <CardHeader>
                                <div className="mb-4 inline-flex rounded-lg p-3 bg-zinc-100 dark:bg-zinc-800">
                                    <span className="text-4xl">{topic.icon}</span>
                                </div>
                                <CardTitle className="text-2xl">{topic.name}</CardTitle>
                                <CardDescription className="text-base">
                                    {topic.events?.length || 0} events monitoring this topic
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <span className="text-sm text-red-600 dark:text-red-400">
                                            {topic.actionables?.misinformation || 0} misinformation
                                        </span>
                                        <span className="text-sm text-blue-600 dark:text-blue-400">
                                            {topic.actionables?.questions || 0} questions
                                        </span>
                                    </div>
                                    <Link href={`/topics/${topic.id}`}>
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

