'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from '@/i18n/routing';
import { TrendingUp, Calendar, MessageCircle } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { eventsApi } from '@/lib/api';

export default function EventsPage() {
    const t = useTranslations('EventsPage');
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadEvents() {
            try {
                const data = await eventsApi.listEvents();
                setEvents(data.events);
                setLoading(false);
            } catch (err) {
                console.error('Failed to load events:', err);
                setError('Failed to load events data');
                setLoading(false);
            }
        }
        loadEvents();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#e8f4f8] via-white to-[#e8f5e9] dark:from-[#0a0e12] dark:via-[#0f1419] dark:to-[#0d1410]">
                <div className="text-center">
                    <div className="h-32 w-32 mx-auto animate-spin rounded-full border-b-2 border-[#4A8EC6] dark:border-[#7CB8E8] polderr-glow-blue"></div>
                    <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">Loading events...</p>
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

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-2 border-[#4A8EC6]/20 dark:border-[#5B9ED3]/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('totalEvents')}</CardTitle>
                            <Calendar className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{events.length}</div>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                {t('activeDiscussions')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-[#6BC04A]/20 dark:border-[#7ACC58]/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('totalPosts')}</CardTitle>
                            <MessageCircle className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {events.reduce((sum, event) => sum + event.totalPosts, 0)}
                            </div>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                {t('allPlatforms')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-[#4A8EC6]/20 dark:border-[#5B9ED3]/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('totalEngagement')}</CardTitle>
                            <TrendingUp className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {events.reduce((sum, event) => sum + event.totalEngagement, 0).toLocaleString()}
                            </div>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                {t('totalInteractions')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Events List */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[#4A8EC6] to-[#6BC04A] bg-clip-text text-transparent">
                        {t('recentEvents')}
                    </h2>

                    {events.map((event) => (
                        <Card key={event.id} className="border-2 border-[#4A8EC6]/20 transition-all hover:shadow-lg hover:border-[#4A8EC6] hover:shadow-[#4A8EC6]/20 dark:border-[#5B9ED3]/20 dark:hover:border-[#5B9ED3] dark:hover:shadow-[#5B9ED3]/20">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl">{event.name}</CardTitle>
                                        <CardDescription>{event.small_summary}</CardDescription>
                                    </div>
                                    <Link href={`/events/${event.id}`}>
                                        <Button className="bg-gradient-to-r from-[#4A8EC6] to-[#6BC04A] hover:from-[#5B9ED3] hover:to-[#7ACC58]">
                                            {t('viewDetails')}
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{event.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4" />
                                        <span>{event.totalPosts} {t('posts')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4" />
                                        <span>{event.totalEngagement} {t('engagement')}</span>
                                    </div>
                                    <div className={`ml-auto flex items-center gap-2 font-medium ${event.trend === 'up'
                                        ? 'text-[#6BC04A] dark:text-[#7ACC58]'
                                        : 'text-zinc-600 dark:text-zinc-400'
                                        }`}>
                                        <TrendingUp className={`h-4 w-4 ${event.trend === 'up' ? '' : 'opacity-50'
                                            }`} />
                                        <span>{event.trend === 'up' ? t('rising') : t('stable')}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

