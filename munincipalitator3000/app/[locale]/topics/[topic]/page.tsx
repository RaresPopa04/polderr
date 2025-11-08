'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from '@/i18n/routing';
import { TrendingUp, Calendar, MessageCircle } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { topicsApi } from '@/lib/api';

export default function TopicPage() {
    const params = useParams();
    const topicId = params.topic as string;
    const t = useTranslations('TopicsPage');
    const [topicData, setTopicData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadTopic() {
            try {
                const data = await topicsApi.getTopic(topicId);
                setTopicData(data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to load topic:', err);
                setError('Failed to load topic data');
                setLoading(false);
            }
        }
        loadTopic();
    }, [topicId]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="text-center">
                    <div className="h-32 w-32 mx-auto animate-spin rounded-full border-b-2 border-zinc-900 dark:border-zinc-50"></div>
                    <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">Loading topic...</p>
                </div>
            </div>
        );
    }

    if (error || !topicData) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 text-xl mb-4">⚠️ {error || 'Topic not found'}</p>
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
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <div className="mx-auto max-w-7xl p-6">
                {/* Header */}
                <div className="mb-8 space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="text-6xl">{topicData.icon}</span>
                        <div>
                            <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                {topicData.name}
                            </h1>
                            <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
                                {topicData.events?.length || 0} active events
                            </p>
                        </div>
                    </div>

                    {/* Actionables Summary */}
                    <div className="flex gap-6">
                        <div className="rounded-lg bg-red-50 px-6 py-4 dark:bg-red-950/20">
                            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                                {topicData.actionables?.misinformation || 0}
                            </div>
                            <div className="text-sm font-medium text-red-700 dark:text-red-300">
                                Misinformation
                            </div>
                        </div>
                        <div className="rounded-lg bg-blue-50 px-6 py-4 dark:bg-blue-950/20">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {topicData.actionables?.questions || 0}
                            </div>
                            <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                Questions
                            </div>
                        </div>
                    </div>
                </div>

                {/* Events List */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Events</h2>

                    {topicData.events && topicData.events.length > 0 ? (
                        <div className="space-y-6">
                            {topicData.events.map((event: any) => (
                                <Link key={event.id} href={`/events/${event.id}`}>
                                    <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-zinc-400 dark:hover:border-zinc-600">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div
                                                            className="h-4 w-4 rounded-full"
                                                            style={{ backgroundColor: event.color }}
                                                        />
                                                        <CardTitle className="text-2xl">{event.name}</CardTitle>
                                                    </div>
                                                    <CardDescription className="text-base">
                                                        {event.small_summary || 'No description available'}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4" />
                                                    <span className="font-semibold">{event.engagement?.toLocaleString() || 0} engagement</span>
                                                </div>
                                                {event.totalPosts !== undefined && (
                                                    <div className="flex items-center gap-2">
                                                        <MessageCircle className="h-4 w-4" />
                                                        <span>{event.totalPosts} posts</span>
                                                    </div>
                                                )}
                                                {event.date && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{new Date(event.date).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-zinc-600 dark:text-zinc-400">No events found for this topic</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
