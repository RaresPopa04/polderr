'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TrendingUp, Calendar, MessageCircle } from "lucide-react";

// Mock data - this would come from your API/backend
const mockEvents = [
  {
    id: 1,
    name: "Rijswijk Traffic Safety Discussion",
    small_summary: "Public discussion about traffic safety in the city center",
    date: "2025-11-08",
    totalPosts: 5,
    totalEngagement: 591,
    trend: "up"
  },
  {
    id: 2,
    name: "Green Projects Rijswijk North",
    small_summary: "Residents share ideas for more greenery in the neighborhood",
    date: "2025-11-07",
    totalPosts: 8,
    totalEngagement: 423,
    trend: "up"
  },
  {
    id: 3,
    name: "Cultural Festival Planning",
    small_summary: "Organization and feedback about the upcoming summer festival",
    date: "2025-11-06",
    totalPosts: 12,
    totalEngagement: 756,
    trend: "stable"
  },
];

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Events Overview
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Follow current discussions and events in Rijswijk
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockEvents.length}</div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Active discussions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <MessageCircle className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockEvents.reduce((sum, event) => sum + event.totalPosts, 0)}
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                All platforms
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
              <TrendingUp className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockEvents.reduce((sum, event) => sum + event.totalEngagement, 0).toLocaleString()}
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Total interactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Recent Events
          </h2>
          
          {mockEvents.map((event) => (
            <Card key={event.id} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{event.name}</CardTitle>
                    <CardDescription>{event.small_summary}</CardDescription>
                  </div>
                  <Link href={`/events/${event.id}`}>
                    <Button>
                      View Details
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
                    <span>{event.totalPosts} posts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>{event.totalEngagement} engagement</span>
                  </div>
                  <div className={`ml-auto flex items-center gap-2 font-medium ${
                    event.trend === 'up' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}>
                    <TrendingUp className={`h-4 w-4 ${
                      event.trend === 'up' ? '' : 'opacity-50'
                    }`} />
                    <span>{event.trend === 'up' ? 'Rising' : 'Stable'}</span>
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

