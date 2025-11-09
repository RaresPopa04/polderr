'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from '@/i18n/routing';
import { TrendingUp, Calendar, MessageCircle, AlertTriangle, HelpCircle, FileDown } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { topicsApi, forumApi, ForumPost } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function TopicPage() {
    const params = useParams();
    const router = useRouter();
    const topicId = params.topic as string;
    const t = useTranslations('TopicsPage');
    const [topicData, setTopicData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [exportingPdf, setExportingPdf] = useState(false);

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

        async function loadForumPosts() {
            try {
                const data = await forumApi.getForumPosts(topicId);
                setForumPosts(data.posts);
            } catch (err) {
                console.error('Failed to load forum posts:', err);
            }
        }

        loadTopic();
        loadForumPosts();
    }, [topicId]);

    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        try {
            // Get username from localStorage or use 'Anonymous'
            const username = localStorage.getItem('username') || 'Anonymous';

            await forumApi.createForumPost(topicId, newPostContent, username);
            setNewPostContent('');

            // Reload all forum posts to show both the question and answer
            const data = await forumApi.getForumPosts(topicId);
            setForumPosts(data.posts);
        } catch (err) {
            console.error('Failed to create post:', err);
        }
    };

    const handleExportPdf = async () => {
        setExportingPdf(true);
        try {
            const response = await fetch(`http://localhost:8000/api/reports/topic/${topicId}/pdf`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to export PDF');
            }

            // Download the PDF
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `topic_${topicId}_report.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: any) {
            console.error('Failed to export PDF:', err);
            alert(err.message || 'Failed to export PDF');
        } finally {
            setExportingPdf(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#e8f4f8] via-white to-[#e8f5e9] dark:from-[#0a0e12] dark:via-[#0f1419] dark:to-[#0d1410]">
                <div className="text-center">
                    <div className="h-32 w-32 mx-auto animate-spin rounded-full border-b-2 border-[#4A8EC6] dark:border-[#7CB8E8] polderr-glow-blue"></div>
                    <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">Loading topic...</p>
                </div>
            </div>
        );
    }

    if (error || !topicData) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#e8f4f8] via-white to-[#e8f5e9] dark:from-[#0a0e12] dark:via-[#0f1419] dark:to-[#0d1410]">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 text-xl mb-4">⚠️ {error || 'Topic not found'}</p>
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
        <div className="min-h-screen bg-gradient-to-br from-[#e8f4f8] via-white to-[#e8f5e9] dark:from-[#0a0e12] dark:via-[#0f1419] dark:to-[#0d1410]">
            <div className="mx-auto max-w-7xl p-6">
                <div className="flex gap-6">
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Header */}
                        <div className="mb-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-6xl">{topicData.icon}</span>
                                    <div>
                                        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-[#4A8EC6] to-[#6BC04A] bg-clip-text text-transparent">
                                            {topicData.name}
                                        </h1>
                                        <p className="mt-2 text-lg text-zinc-700 dark:text-zinc-300">
                                            {topicData.events?.length || 0} active events
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleExportPdf}
                                    disabled={exportingPdf}
                                    variant="outline"
                                    className="flex items-center gap-2 border-[#4A8EC6] text-[#4A8EC6] hover:bg-[#4A8EC6]/10 dark:border-[#7CB8E8] dark:text-[#7CB8E8] dark:hover:bg-[#7CB8E8]/10"
                                >
                                    <FileDown className="h-4 w-4" />
                                    {exportingPdf ? 'Generating...' : 'Export to PDF'}
                                </Button>
                            </div>

                            {/* Total Actionables Summary */}
                            <div className="flex gap-6">
                                <div className="rounded-lg bg-gradient-to-br from-red-50 to-red-100 px-6 py-4 border-2 border-red-200 dark:from-red-950/20 dark:to-red-900/20 dark:border-red-800/30 shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        <div className="text-sm font-medium text-red-700 dark:text-red-300">
                                            Total Misinformation
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                                        {topicData.total_actionables?.misinformation || 0}
                                    </div>
                                </div>
                                <div className="rounded-lg bg-gradient-to-br from-[#7CB8E8]/20 to-[#4A8EC6]/30 px-6 py-4 border-2 border-[#4A8EC6]/40 dark:from-[#5B9ED3]/20 dark:to-[#4A8EC6]/20 dark:border-[#5B9ED3]/40 shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <HelpCircle className="h-5 w-5 text-[#2E6B9F] dark:text-[#7CB8E8]" />
                                        <div className="text-sm font-medium text-[#4A8EC6] dark:text-[#8FC5EE]">
                                            Total Questions
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-[#2E6B9F] dark:text-[#7CB8E8]">
                                        {topicData.total_actionables?.questions || 0}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sentiment Analysis Chart */}
                        {topicData.sentiment_data && topicData.sentiment_data.length > 0 && (
                            <Card className="mb-8 border-2 border-[#4A8EC6]/20 dark:border-[#5B9ED3]/20">
                                <CardHeader>
                                    <CardTitle>Sentiment Over Time</CardTitle>
                                    <CardDescription>Click on any point to view that event</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={topicData.sentiment_data}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="date"
                                                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                />
                                                <YAxis domain={[0, 100]} />
                                                <Tooltip
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            const data = payload[0].payload;
                                                            return (
                                                                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 shadow-lg">
                                                                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">{data.event_name}</p>
                                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                        Sentiment: {data.sentiment}%
                                                                    </p>
                                                                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                                                                        {new Date(data.date).toLocaleDateString()}
                                                                    </p>
                                                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                                        Click to view event
                                                                    </p>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="sentiment"
                                                    stroke="#3b82f6"
                                                    strokeWidth={2}
                                                    dot={(props: any) => {
                                                        const { key, ...restProps } = props;
                                                        return (
                                                            <Dot
                                                                key={key}
                                                                {...restProps}
                                                                r={6}
                                                                fill="#3b82f6"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    const eventId = topicData.sentiment_data[props.index].event_id;
                                                                    router.push(`/events/${eventId}`);
                                                                }}
                                                            />
                                                        );
                                                    }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Events List */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#4A8EC6] to-[#6BC04A] bg-clip-text text-transparent">Events</h2>

                            {topicData.events && topicData.events.length > 0 ? (
                                <div className="space-y-6">
                                    {topicData.events.map((event: any) => (
                                        <Link key={event.id} href={`/events/${event.id}`} className="block">
                                            <Card className="cursor-pointer border-2 border-[#4A8EC6]/20 transition-all hover:shadow-lg hover:border-[#4A8EC6] hover:shadow-[#4A8EC6]/20 dark:border-[#5B9ED3]/20 dark:hover:border-[#5B9ED3] dark:hover:shadow-[#5B9ED3]/20">
                                                <CardHeader>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <CardTitle className="text-2xl mb-2">{event.name}</CardTitle>
                                                            <CardDescription className="text-base mb-3">
                                                                {event.short_summary || 'No description available'}
                                                            </CardDescription>

                                                            {/* Individual Event Actionables */}
                                                            <div className="flex gap-3 mt-3">
                                                                {event.actionables?.misinformation > 0 && (
                                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-br from-red-50 to-red-100 border border-red-200 dark:from-red-950/20 dark:to-red-900/20 dark:border-red-800/30">
                                                                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                                        <span className="text-sm font-medium text-red-700 dark:text-red-300">
                                                                            {event.actionables.misinformation} Misinformation
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {event.actionables?.questions > 0 && (
                                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-br from-[#7CB8E8]/20 to-[#4A8EC6]/30 border border-[#4A8EC6]/40 dark:from-[#5B9ED3]/20 dark:to-[#4A8EC6]/20 dark:border-[#5B9ED3]/40">
                                                                        <HelpCircle className="h-4 w-4 text-[#4A8EC6] dark:text-[#7CB8E8]" />
                                                                        <span className="text-sm font-medium text-[#4A8EC6] dark:text-[#8FC5EE]">
                                                                            {event.actionables.questions} Questions
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
                                                        {event.sentiment !== undefined && (
                                                            <div className="flex items-center gap-2">
                                                                <TrendingUp className="h-4 w-4" />
                                                                <span className="font-semibold">Sentiment: {event.sentiment}%</span>
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

                    {/* Forum Sidebar */}
                    <div className="w-80 flex-shrink-0">
                        <Card className="sticky top-6 h-[80vh] flex flex-col border-2 border-[#4A8EC6]/20 dark:border-[#5B9ED3]/20">
                            <CardHeader className="flex-shrink-0">
                                <CardTitle className="flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5" />
                                    Forum
                                </CardTitle>
                                <CardDescription>Discuss this topic</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col overflow-hidden">
                                {/* Forum Posts */}
                                <div className="space-y-4 mb-4 flex-1 overflow-y-auto">
                                    {forumPosts.length === 0 ? (
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
                                            No posts yet. Be the first to comment!
                                        </p>
                                    ) : (
                                        forumPosts.map((post) => (
                                            <div key={post.id} className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                                        {post.user_name}
                                                    </span>
                                                    <span className="text-xs text-zinc-400 dark:text-zinc-600">•</span>
                                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                        {new Date(post.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-zinc-900 dark:text-zinc-50">{post.content}</p>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* New Post Form */}
                                <form onSubmit={handlePostSubmit} className="space-y-2 flex-shrink-0">
                                    <Input
                                        placeholder="Write a comment..."
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        className="text-sm"
                                    />
                                    <Button type="submit" size="sm" className="w-full">
                                        Post
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}
