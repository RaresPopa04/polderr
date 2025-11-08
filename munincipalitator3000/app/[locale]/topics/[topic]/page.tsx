'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from '@/i18n/routing';
import { TrendingUp, Calendar, MessageCircle, Hash, Clock } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function TopicPage() {
    const params = useParams();
    const topic = params.topic as string;
    const t = useTranslations('TopicsPage');

    // Mock data - this would come from your API/backend
    const getTopicData = (topicSlug: string) => {
        const topicConfigs: Record<string, {
            title: string;
            description: string;
            color: string;
            events: Array<{
                id: number;
                name: string;
                small_summary: string;
                date: string;
                totalPosts: number;
                totalEngagement: number;
                trend: string;
            }>;
        }> = {
            trash: {
                title: t('trashTitle'),
                description: t('trashDescription'),
                color: 'text-amber-600 dark:text-amber-400',
                events: [
                    {
                        id: 1,
                        name: t('trashEvent1Name'),
                        small_summary: t('trashEvent1Summary'),
                        date: "2025-11-08",
                        totalPosts: 15,
                        totalEngagement: 892,
                        trend: "up"
                    },
                    {
                        id: 2,
                        name: t('trashEvent2Name'),
                        small_summary: t('trashEvent2Summary'),
                        date: "2025-11-05",
                        totalPosts: 23,
                        totalEngagement: 1245,
                        trend: "up"
                    },
                    {
                        id: 3,
                        name: t('trashEvent3Name'),
                        small_summary: t('trashEvent3Summary'),
                        date: "2025-11-02",
                        totalPosts: 8,
                        totalEngagement: 456,
                        trend: "stable"
                    },
                ]
            },
            health: {
                title: t('healthTitle'),
                description: t('healthDescription'),
                color: 'text-green-600 dark:text-green-400',
                events: [
                    {
                        id: 4,
                        name: t('healthEvent1Name'),
                        small_summary: t('healthEvent1Summary'),
                        date: "2025-11-07",
                        totalPosts: 12,
                        totalEngagement: 678,
                        trend: "up"
                    },
                    {
                        id: 5,
                        name: t('healthEvent2Name'),
                        small_summary: t('healthEvent2Summary'),
                        date: "2025-11-04",
                        totalPosts: 18,
                        totalEngagement: 934,
                        trend: "stable"
                    },
                ]
            }
        };

        return topicConfigs[topicSlug] || {
            title: t('unknownTitle'),
            description: t('unknownDescription'),
            color: 'text-zinc-600 dark:text-zinc-400',
            events: []
        };
    };

    const topicData = getTopicData(topic);

    // Mock sentiment data for the timeline
    const sentimentData = [
        { date: '2025-11-02', sentiment: 0.3 },
        { date: '2025-11-03', sentiment: 0.5 },
        { date: '2025-11-04', sentiment: 0.4 },
        { date: '2025-11-05', sentiment: 0.7 },
        { date: '2025-11-06', sentiment: 0.6 },
        { date: '2025-11-07', sentiment: 0.65 },
        { date: '2025-11-08', sentiment: 0.8 },
    ];

    // Mock forum posts
    const forumPosts = [
        { id: 1, author: "Jan_Rijswijk", content: "When will the missed collections be addressed?", time: "2h ago", replies: 5 },
        { id: 2, author: "Maria_NL", content: "We need better recycling options in our area.", time: "5h ago", replies: 12 },
        { id: 3, author: "Piet_V", content: "Great initiative with the new bins!", time: "1d ago", replies: 3 },
    ];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <div className="mx-auto max-w-[1800px] p-6">
                {/* Header */}
                <div className="mb-6 space-y-2">
                    <div className="flex items-center gap-3">
                        <Hash className={`h-8 w-8 ${topicData.color}`} />
                        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            {topicData.title}
                        </h1>
                    </div>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        {topicData.description}
                    </p>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
                    {/* Left Column - Timeline and Events */}
                    <div className="space-y-6">
                        {/* Sentiment Timeline Chart */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{t('sentimentTimeline')}</CardTitle>
                                        <CardDescription>{t('sentimentDescription')}</CardDescription>
                                    </div>
                                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                        S
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="relative h-48 w-full">
                                    {/* Simple SVG chart */}
                                    <svg className="h-full w-full" viewBox="0 0 700 200" preserveAspectRatio="none">
                                        {/* Grid lines */}
                                        <line x1="0" y1="50" x2="700" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-zinc-200 dark:text-zinc-800" />
                                        <line x1="0" y1="100" x2="700" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-zinc-200 dark:text-zinc-800" />
                                        <line x1="0" y1="150" x2="700" y2="150" stroke="currentColor" strokeWidth="0.5" className="text-zinc-200 dark:text-zinc-800" />

                                        {/* Line path */}
                                        <polyline
                                            points={sentimentData.map((d, i) => `${(i / (sentimentData.length - 1)) * 700},${200 - d.sentiment * 200}`).join(' ')}
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            className={topicData.color}
                                        />

                                        {/* Data points */}
                                        {sentimentData.map((d, i) => (
                                            <circle
                                                key={i}
                                                cx={(i / (sentimentData.length - 1)) * 700}
                                                cy={200 - d.sentiment * 200}
                                                r="5"
                                                fill="currentColor"
                                                className={topicData.color}
                                            />
                                        ))}
                                    </svg>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Event Queue Timeline */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                                    <CardTitle className="text-lg">{t('eventQueueTime')}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {topicData.events.map((event, index) => (
                                        <div key={event.id} className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-2 w-2 rounded-full ${event.trend === 'up' ? 'bg-green-500' : 'bg-zinc-400'}`} />
                                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                                        {event.name}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-zinc-500 dark:text-zinc-500">{event.date}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Events List */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                {t('eventsInTopic')}
                            </h2>

                            {topicData.events.length === 0 ? (
                                <Card>
                                    <CardContent className="py-10 text-center text-zinc-600 dark:text-zinc-400">
                                        {t('noEvents')}
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {topicData.events.map((event) => (
                                        <Card key={event.id} className="transition-shadow hover:shadow-md">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 space-y-1">
                                                        <CardTitle className="text-base">{event.name}</CardTitle>
                                                        <CardDescription className="text-sm">{event.small_summary}</CardDescription>
                                                    </div>
                                                    <Link href={`/events/${event.id}`}>
                                                        <Button size="sm">
                                                            {t('viewDetails')}
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <div className="flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{event.date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MessageCircle className="h-3 w-3" />
                                                        <span>{event.totalPosts}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <TrendingUp className="h-3 w-3" />
                                                        <span>{event.totalEngagement}</span>
                                                    </div>
                                                    <div className={`ml-auto flex items-center gap-1 font-medium ${event.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                                        <TrendingUp className={`h-3 w-3 ${event.trend === 'up' ? '' : 'opacity-50'}`} />
                                                        <span>{event.trend === 'up' ? t('rising') : t('stable')}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Forum */}
                    <div className="space-y-6">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="text-lg">{t('forumDiscussions')}</CardTitle>
                                <CardDescription>{t('forumDescription')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {forumPosts.map((post) => (
                                        <div key={post.id} className="space-y-2 border-b border-zinc-200 pb-4 last:border-0 dark:border-zinc-800">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
                                                    {post.author}
                                                </div>
                                                <div className="text-xs text-zinc-500 dark:text-zinc-500">
                                                    {post.time}
                                                </div>
                                            </div>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                {post.content}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
                                                <MessageCircle className="h-3 w-3" />
                                                <span>{post.replies} {t('replies')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button className="mt-4 w-full" variant="outline">
                                    {t('viewAllDiscussions')}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

