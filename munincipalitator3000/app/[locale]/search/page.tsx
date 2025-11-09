'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Search, ArrowLeft, Sparkles, Calendar, Tag } from "lucide-react";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchApi, type SearchResponse } from '@/lib/api';

export default function SearchPage() {
    const t = useTranslations('SearchPage');
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryParam = searchParams.get('q');

    const [query, setQuery] = useState(queryParam || '');
    const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (queryParam && queryParam.trim()) {
            performSearch(queryParam);
        }
    }, [queryParam]);

    const performSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const result = await searchApi.search(searchQuery);
            setSearchResult(result);
        } catch (err) {
            console.error('Search failed:', err);
            setError(t('searchError'));
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`?q=${encodeURIComponent(query)}`);
            performSearch(query);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
            <div className="mx-auto max-w-[1400px] p-8">
                {/* Header with Search */}
                <div className="mb-10 space-y-6">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="h-10 w-10">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                {t('title')}
                            </h1>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative mx-auto max-w-3xl">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                        <Input
                            placeholder={t('searchingFor')}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="h-14 pl-12 pr-24 text-base shadow-sm"
                        />
                        <Button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            disabled={loading || !query.trim()}
                        >
                            <Search className="h-4 w-4 mr-2" />
                            {loading ? t('searching') : t('title').split(' ')[0]}
                        </Button>
                    </form>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="h-16 w-16 mx-auto animate-spin rounded-full border-b-2 border-zinc-900 dark:border-zinc-50"></div>
                            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">{t('searching')}</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-red-600 dark:text-red-400 text-lg">⚠️ {error}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* No Query State */}
                {!queryParam && !loading && (
                    <Card className="border-2">
                        <CardContent className="pt-10 pb-10">
                            <div className="text-center space-y-4">
                                <Search className="h-16 w-16 mx-auto text-zinc-400" />
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                                    {t('enterQuery')}
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400">
                                    {t('enterQueryDescription')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Results */}
                {searchResult && !loading && (
                    <div className="space-y-8">
                        {/* Search Summary */}
                        <Card className="border-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                            <CardHeader>
                                <div className="flex items-start gap-4">
                                    <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400 mt-1" />
                                    <div className="flex-1">
                                        <CardTitle className="text-2xl mb-2">
                                            {t('createdTopic')}: {searchResult.name}
                                        </CardTitle>
                                        <CardDescription className="text-base space-y-2">
                                            <div className="flex flex-wrap gap-4 text-sm">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    <span className="font-medium">Similarity Threshold:</span>
                                                    <span className="text-zinc-900 dark:text-zinc-50">{(searchResult.similarity_threshold * 100).toFixed(0)}%</span>
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Search className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                                                    <span className="font-medium">Events Searched:</span>
                                                    <span className="text-zinc-900 dark:text-zinc-50">{searchResult.total_events_searched}</span>
                                                </span>
                                            </div>
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                            {searchResult.events.length}
                                        </div>
                                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                            {t('foundEvents')}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* No Results */}
                        {searchResult.events.length === 0 && (
                            <Card>
                                <CardContent className="pt-10 pb-10">
                                    <div className="text-center space-y-2">
                                        <Search className="h-12 w-12 mx-auto text-zinc-400" />
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                            {t('noResults')}
                                        </h3>
                                        <p className="text-zinc-600 dark:text-zinc-400">
                                            {t('noResultsDescription')}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Events List */}
                        {searchResult.events.length > 0 && (
                            <div className="grid gap-6 md:grid-cols-2">
                                {searchResult.events.map((event) => (
                                    <Card key={event.event_id} className="transition-all hover:shadow-lg hover:border-zinc-400 dark:hover:border-zinc-600">
                                        <CardHeader>
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <CardTitle className="text-xl">{event.name}</CardTitle>
                                                    <CardDescription className="text-sm flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(event.date).toLocaleDateString()}
                                                    </CardDescription>
                                                </div>
                                                {event.similarity_score !== undefined && (
                                                    <div className="flex flex-col items-end">
                                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                            {(event.similarity_score * 100).toFixed(0)}%
                                                        </div>
                                                        <span className="text-xs text-zinc-600 dark:text-zinc-400">similarity</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                                {event.case_description || event.small_summary}
                                            </p>

                                            {/* Keywords */}
                                            <div className="flex flex-wrap gap-1">
                                                {event.keywords.slice(0, 5).map((keyword, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded text-xs"
                                                    >
                                                        {keyword}
                                                    </span>
                                                ))}
                                                {event.keywords.length > 5 && (
                                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 px-2 py-0.5">
                                                        +{event.keywords.length - 5} {t('keywords')}
                                                    </span>
                                                )}
                                            </div>

                                            <Link href={`/events/${event.event_id}`}>
                                                <Button className="w-full">
                                                    {t('viewEvent')}
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* View Topic Button */}
                        {searchResult.events.length > 0 && (
                            <div className="flex justify-center pt-4">
                                <Link href={`/topics/${searchResult.topic_id}`}>
                                    <Button size="lg" className="text-lg px-8">
                                        View Topic: {searchResult.name}
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

