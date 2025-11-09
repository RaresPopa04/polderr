'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Search, ArrowLeft, Sparkles, Calendar, Tag } from "lucide-react";
import { useEffect, useState, useRef } from 'react';
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
    const lastSearchedQueryRef = useRef<string | null>(null);

    useEffect(() => {
        // Prevent duplicate searches for the same query
        if (queryParam && queryParam.trim() && queryParam !== lastSearchedQueryRef.current) {
            lastSearchedQueryRef.current = queryParam;
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
            // Note: performSearch will be triggered by the useEffect when queryParam changes
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="mx-auto max-w-7xl p-6 md:p-8">
                {/* Header with Search */}
                <div className="mb-12 space-y-8">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-slate-100 dark:hover:bg-slate-800">
                                <ArrowLeft className="h-6 w-6" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-[#4A8EC6] to-[#6BC04A] bg-clip-text text-transparent">
                                {t('title')}
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-lg mt-2">
                                Discover relevant civic events and topics
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative mx-auto max-w-3xl">
                        <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder={t('searchingFor')}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="h-16 pl-14 pr-32 text-base shadow-md border-2"
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
                            <div className="h-16 w-16 mx-auto animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-[#4A8EC6]"></div>
                            <p className="mt-6 text-lg font-medium text-slate-700 dark:text-slate-300">{t('searching')}</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <Card className="border-2 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
                        <CardContent className="pt-8 pb-8">
                            <div className="text-center">
                                <div className="text-5xl mb-4">⚠️</div>
                                <p className="text-red-600 dark:text-red-400 text-lg font-bold">{error}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* No Query State */}
                {!queryParam && !loading && (
                    <Card className="border-2 border-[#4A8EC6]/30 dark:border-[#5B9ED3]/30 shadow-lg">
                        <CardContent className="pt-12 pb-12">
                            <div className="text-center space-y-4">
                                <div className="bg-gradient-to-br from-[#4A8EC6]/10 to-[#6BC04A]/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="h-12 w-12 text-[#4A8EC6]" />
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                                    {t('enterQuery')}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md mx-auto">
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
                        <Card className="border-2 border-[#4A8EC6]/50 bg-gradient-to-r from-[#7CB8E8]/10 to-[#8FDB6F]/10 dark:from-[#5B9ED3]/20 dark:to-[#7ACC58]/20 dark:border-[#5B9ED3]/50 shadow-lg">
                            <CardHeader className="pb-6">
                                <div className="flex items-start gap-6">
                                    <div className="bg-gradient-to-br from-[#4A8EC6] to-[#6BC04A] w-16 h-16 rounded-xl flex items-center justify-center shadow-lg">
                                        <Sparkles className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-3xl mb-3">
                                            {t('createdTopic')}: {searchResult.name}
                                        </CardTitle>
                                        <CardDescription className="text-base space-y-3">
                                            <div className="flex flex-wrap gap-4">
                                                <span className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow-sm">
                                                    <Sparkles className="h-4 w-4 text-[#4A8EC6]" />
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">Similarity:</span>
                                                    <span className="text-slate-900 dark:text-slate-50 font-bold">{(searchResult.similarity_threshold * 100).toFixed(0)}%</span>
                                                </span>
                                                <span className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow-sm">
                                                    <Search className="h-4 w-4 text-[#6BC04A]" />
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">Searched:</span>
                                                    <span className="text-slate-900 dark:text-slate-50 font-bold">{searchResult.total_events_searched}</span>
                                                </span>
                                            </div>
                                        </CardDescription>
                                    </div>
                                    <div className="text-right bg-white dark:bg-slate-800 px-6 py-4 rounded-xl shadow-sm">
                                        <div className="text-4xl font-bold bg-gradient-to-r from-[#4A8EC6] to-[#6BC04A] bg-clip-text text-transparent">
                                            {searchResult.events.length}
                                        </div>
                                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
                                            {t('foundEvents')}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* No Results */}
                        {searchResult.events.length === 0 && (
                            <Card className="border-2 shadow-lg">
                                <CardContent className="pt-12 pb-12">
                                    <div className="text-center space-y-4">
                                        <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                                            <Search className="h-10 w-10 text-slate-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                                            {t('noResults')}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md mx-auto">
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
                                    <Card key={event.event_id} className="group border-2 border-[#4A8EC6]/30 transition-all duration-300 hover:shadow-2xl hover:shadow-[#4A8EC6]/10 hover:border-[#4A8EC6] hover:-translate-y-1 dark:border-[#5B9ED3]/30 dark:hover:border-[#5B9ED3]">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <CardTitle className="text-xl mb-2 group-hover:text-[#4A8EC6] transition-colors">{event.name}</CardTitle>
                                                    <CardDescription className="text-sm flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-[#6BC04A]" />
                                                        <span className="font-medium">{new Date(event.date).toLocaleDateString()}</span>
                                                    </CardDescription>
                                                </div>
                                                {event.similarity_score !== undefined && (
                                                    <div className="flex flex-col items-end bg-gradient-to-br from-[#4A8EC6]/10 to-[#6BC04A]/10 px-4 py-3 rounded-xl">
                                                        <div className="text-3xl font-bold bg-gradient-to-r from-[#4A8EC6] to-[#6BC04A] bg-clip-text text-transparent">
                                                            {(event.similarity_score * 100).toFixed(0)}%
                                                        </div>
                                                        <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">match</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                                {event.case_description || event.small_summary}
                                            </p>

                                            {/* Keywords */}
                                            <div className="flex flex-wrap gap-2">
                                                {event.keywords.slice(0, 5).map((keyword, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700"
                                                    >
                                                        {keyword}
                                                    </span>
                                                ))}
                                                {event.keywords.length > 5 && (
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 px-3 py-1 font-medium">
                                                        +{event.keywords.length - 5} more
                                                    </span>
                                                )}
                                            </div>

                                            <Link href={`/events/${event.event_id}`}>
                                                <Button className="w-full mt-2">
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
                            <div className="flex justify-center pt-6">
                                <Link href={`/topics/${searchResult.topic_id}`}>
                                    <Button size="lg" className="text-lg px-10 py-6 shadow-lg">
                                        View Full Topic: {searchResult.name}
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

