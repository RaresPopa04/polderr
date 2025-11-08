'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Search, Flame, TrendingUp, Clock, MessageCircle, Calendar } from "lucide-react";

export default function Home() {
  const t = useTranslations('HomePage');

  // Mock data for trending topics
  const trendingTopics = [
    { 
      id: 'trash', 
      name: t('trashTopic'), 
      icon: '🗑️',
      engagement: '+20',
      events: 3,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20'
    },
    { 
      id: 'traffic', 
      name: t('trafficTopic'), 
      icon: '🚗',
      engagement: '+15',
      events: 2,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    },
    { 
      id: 'health', 
      name: t('healthTopic'), 
      icon: '🏥',
      engagement: '+8',
      events: 2,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    },
  ];

  // Mock recent events for timeline
  const recentEvents = [
    { id: 1, title: t('event1'), time: '2h ago', topic: 'trash' },
    { id: 2, title: t('event2'), time: '5h ago', topic: 'traffic' },
    { id: 3, title: t('event3'), time: '1d ago', topic: 'trash' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-[1800px] p-6">
        {/* Header with Search */}
        <div className="mb-6 space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t('dashboardTitle')}
          </h1>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <Input 
              placeholder={t('searchPlaceholder')} 
              className="h-12 pl-10 text-base"
            />
          </div>
        </div>

        {/* Main Layout: Fire Sidebar + Content + Timeline */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr_200px]">
          {/* Left Sidebar - FIRE (Trending) */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-lg">{t('trending')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trendingTopics.map((topic) => (
                    <Link key={topic.id} href={`/topics/${topic.id}`}>
                      <div className={`cursor-pointer rounded-lg p-3 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 ${topic.bgColor}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{topic.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                              {topic.name}
                            </div>
                            <div className={`text-xs font-semibold ${topic.color}`}>
                              {topic.engagement}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="space-y-6">
            {/* Engagement Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('totalEngagement')}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">+20</div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {t('last24Hours')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('activeEvents')}</CardTitle>
                  <Calendar className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {t('currentlyTracking')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('newEvents')}</CardTitle>
                  <Clock className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">6</div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {t('thisWeek')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Topic Sections */}
            {trendingTopics.map((topic) => (
              <Card key={topic.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{topic.icon}</span>
                      <div>
                        <CardTitle className="text-xl">{topic.name}</CardTitle>
                        <CardDescription>
                          {topic.events} {t('activeEventsInTopic')}
                        </CardDescription>
                      </div>
                    </div>
                    <Link href={`/topics/${topic.id}`}>
                      <Button>
                        {t('viewTopic')}
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Mock events for this topic */}
                    <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {topic.id === 'trash' ? t('trashEvent1') : 
                           topic.id === 'traffic' ? t('trafficEvent1') : 
                           t('healthEvent1')}
                        </div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          {t('2hoursAgo')}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>12</span>
                        </div>
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right Sidebar - Timeline */}
          <div className="space-y-4">
            <Card className="sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t('timeline')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEvents.map((event, index) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-bold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {event.title}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-500">
                          {event.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
