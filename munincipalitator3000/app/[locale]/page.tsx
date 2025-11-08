'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Search } from "lucide-react";

export default function Home() {
  const t = useTranslations('HomePage');

  // Mock data for trending topics with events (with time-series data)
  const trendingTopics = [
    { 
      id: 'trash', 
      name: t('trashTopic'), 
      icon: '🗑️',
      events: [
        { 
          id: 1, 
          name: t('trashEvent1'), 
          engagement: 892, 
          color: '#f59e0b',
          dataPoints: [400, 450, 500, 550, 600, 700, 750, 800, 850, 892]
        },
        { 
          id: 2, 
          name: t('trashEvent2Short'), 
          engagement: 1245, 
          color: '#d97706',
          dataPoints: [500, 600, 700, 800, 900, 950, 1000, 1100, 1200, 1245]
        },
        { 
          id: 3, 
          name: t('trashEvent3Short'), 
          engagement: 456, 
          color: '#b45309',
          dataPoints: [200, 250, 280, 300, 320, 350, 380, 400, 430, 456]
        },
      ],
      actionables: {
        misinformation: 3,
        questions: 7
      }
    },
    { 
      id: 'traffic', 
      name: t('trafficTopic'), 
      icon: '🚗',
      events: [
        { 
          id: 1, 
          name: t('trafficEvent1'), 
          engagement: 591, 
          color: '#3b82f6',
          dataPoints: [300, 350, 380, 420, 450, 480, 510, 540, 570, 591]
        },
        { 
          id: 2, 
          name: t('trafficEvent2Short'), 
          engagement: 423, 
          color: '#1d4ed8',
          dataPoints: [150, 200, 250, 280, 310, 340, 370, 390, 410, 423]
        },
      ],
      actionables: {
        misinformation: 1,
        questions: 5
      }
    },
    { 
      id: 'health', 
      name: t('healthTopic'), 
      icon: '🏥',
      events: [
        { 
          id: 1, 
          name: t('healthEvent1'), 
          engagement: 678, 
          color: '#10b981',
          dataPoints: [300, 350, 400, 450, 500, 550, 600, 630, 660, 678]
        },
        { 
          id: 2, 
          name: t('healthEvent2Short'), 
          engagement: 934, 
          color: '#059669',
          dataPoints: [400, 500, 600, 650, 700, 750, 800, 850, 900, 934]
        },
      ],
      actionables: {
        misinformation: 2,
        questions: 4
      }
    },
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

        {/* Main Content Area */}
        <div className="space-y-12">
            {/* Topic Sections */}
            {trendingTopics.map((topic) => {
              // Find max value across all data points for scaling
              const allDataPoints = topic.events.flatMap(e => e.dataPoints);
              const maxValue = Math.max(...allDataPoints);
              const minValue = Math.min(...allDataPoints);
              const range = maxValue - minValue;
              
              return (
                <Link key={topic.id} href={`/topics/${topic.id}`}>
                  <Card className="cursor-pointer border-2 transition-all hover:border-zinc-400 hover:shadow-xl dark:hover:border-zinc-600">
                    <CardHeader className="pb-6">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{topic.icon}</span>
                        <div>
                          <CardTitle className="text-2xl">{topic.name}</CardTitle>
                          <CardDescription className="text-base">
                            {topic.events.length} {t('activeEventsInTopic')}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-[350px_1fr_180px] gap-8">
                        {/* Left: Legend */}
                        <div className="space-y-4">
                          {topic.events.map((event) => (
                            <div key={event.id} className="flex items-center gap-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
                              <div 
                                className="h-4 w-4 shrink-0 rounded-full shadow-sm" 
                                style={{ backgroundColor: event.color }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-base font-medium text-zinc-900 dark:text-zinc-50 truncate">
                                  {event.name}
                                </div>
                              </div>
                              <div className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                                {event.engagement.toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Center: Line Graph */}
                        <div className="h-40 rounded-lg bg-zinc-50 p-6 dark:bg-zinc-900">
                          <svg className="h-full w-full" viewBox="0 0 700 200" preserveAspectRatio="none">
                            {/* Grid lines */}
                            <line x1="0" y1="50" x2="700" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-zinc-300 dark:text-zinc-700" />
                            <line x1="0" y1="100" x2="700" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-zinc-300 dark:text-zinc-700" />
                            <line x1="0" y1="150" x2="700" y2="150" stroke="currentColor" strokeWidth="0.5" className="text-zinc-300 dark:text-zinc-700" />
                            
                            {/* Lines for each event */}
                            {topic.events.map((event) => {
                              const points = event.dataPoints.map((value, index) => {
                                const x = (index / (event.dataPoints.length - 1)) * 700;
                                const y = 200 - ((value - minValue) / range) * 180 - 10;
                                return `${x},${y}`;
                              }).join(' ');
                              
                              return (
                                <g key={event.id}>
                                  {/* Line */}
                                  <polyline
                                    points={points}
                                    fill="none"
                                    stroke={event.color}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  
                                  {/* Data points */}
                                  {event.dataPoints.map((value, index) => {
                                    const x = (index / (event.dataPoints.length - 1)) * 700;
                                    const y = 200 - ((value - minValue) / range) * 180 - 10;
                                    return (
                                      <circle
                                        key={index}
                                        cx={x}
                                        cy={y}
                                        r="4"
                                        fill={event.color}
                                        stroke="white"
                                        strokeWidth="2"
                                      />
                                    );
                                  })}
                                </g>
                              );
                            })}
                          </svg>
                        </div>
                        
                        {/* Right: Actionables */}
                        <div className="flex flex-col justify-center space-y-6">
                          <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-950/20">
                            <div className="text-4xl font-bold text-red-600 dark:text-red-400">
                              {topic.actionables.misinformation}
                            </div>
                            <div className="text-sm font-medium text-red-700 dark:text-red-300 mt-2">
                              {t('misinformation')}
                            </div>
                          </div>
                          <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-950/20">
                            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                              {topic.actionables.questions}
                            </div>
                            <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mt-2">
                              {t('questions')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
}
