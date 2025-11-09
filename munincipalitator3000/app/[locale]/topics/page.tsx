'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from '@/i18n/routing';
import { Hash, ArrowRight, FileDown } from "lucide-react";
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
                // Sort topics by total_posts in descending order
                const sortedTopics = [...data.topics].sort((a, b) => 
                    (b.total_posts || 0) - (a.total_posts || 0)
                );
                setTopics(sortedTopics);
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
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#e8f4f8] via-white to-[#e8f5e9] dark:from-[#0a0e12] dark:via-[#0f1419] dark:to-[#0d1410]">
                <div className="text-center">
                    <div className="h-32 w-32 mx-auto animate-spin rounded-full border-b-2 border-[#4A8EC6] dark:border-[#7CB8E8] polderr-glow-blue"></div>
                    <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">Loading topics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#e8f4f8] via-white to-[#e8f5e9] dark:from-[#0a0e12] dark:via-[#0f1419] dark:to-[#0d1410]">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 text-xl mb-4">⚠️ {error}</p>
                    <p className="text-zinc-700 dark:text-zinc-300">
                        Make sure the backend is running at{' '}
                        <code className="bg-[#4A8EC6]/10 dark:bg-[#5B9ED3]/20 px-2 py-1 rounded">
                            http://localhost:8000
                        </code>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e8f4f8] via-white to-[#e8f5e9] p-6 dark:from-[#0a0e12] dark:via-[#0f1419] dark:to-[#0d1410]">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#4A8EC6] to-[#6BC04A] bg-clip-text text-transparent">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-zinc-700 dark:text-zinc-300">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Topics Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {topics.map((topic) => (
                        <Card key={topic.id} className="border-2 border-[#4A8EC6]/20 transition-all hover:shadow-lg hover:border-[#4A8EC6] hover:shadow-[#4A8EC6]/20 dark:border-[#5B9ED3]/20 dark:hover:border-[#5B9ED3] dark:hover:shadow-[#5B9ED3]/20">
                            <CardHeader>
                                <div className="mb-4 inline-flex rounded-lg p-3 bg-gradient-to-br from-[#4A8EC6]/10 to-[#6BC04A]/10 dark:from-[#5B9ED3]/20 dark:to-[#7ACC58]/20">
                                    <span className="text-4xl">{topic.icon}</span>
                                </div>
                                <CardTitle className="text-2xl">{topic.name}</CardTitle>
                                <CardDescription className="text-base">
                                    {topic.events?.length || 0} events • {topic.total_posts || 0} posts
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <span className="text-sm text-red-600 dark:text-red-400">
                                            {topic.actionables?.misinformation || 0} misinformation
                                        </span>
                                        <span className="text-sm text-[#4A8EC6] dark:text-[#7CB8E8]">
                                            {topic.actionables?.questions || 0} questions
                                        </span>
                                    </div>
                                    <Link href={`/topics/${topic.id}`}>
                                        <Button className="bg-gradient-to-r from-[#4A8EC6] to-[#6BC04A] hover:from-[#5B9ED3] hover:to-[#7ACC58]">
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

