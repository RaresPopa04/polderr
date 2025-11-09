'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from 'next-intl';

export default function TrendsPage() {
    const t = useTranslations('TrendsPage');

    // Mock data for the graph - monthly data points with initial growth then decline
    const mockData = [
        { time: 'Jan', engagement: 180 },
        { time: 'Feb', engagement: 192 },
        { time: 'Mar', engagement: 198 },
        { time: 'Apr', engagement: 190 },
        { time: 'May', engagement: 195 },
        { time: 'Jun', engagement: 188 },
        { time: 'Jul', engagement: 182 },
        { time: 'Aug', engagement: 176 },
        { time: 'Sep', engagement: 175 },
        { time: 'Oct', engagement: 165 },
        { time: 'Nov', engagement: 160 },
        { time: 'Dec', engagement: 162 },
    ];

    const maxEngagement = Math.max(...mockData.map(d => d.engagement));
    const minEngagement = Math.min(...mockData.map(d => d.engagement));
    const range = maxEngagement - minEngagement;

    // Function to create smooth curve path with Catmull-Rom spline for natural curves
    const createSmoothPath = (points: { x: number; y: number }[], closed = false) => {
        if (points.length < 2) return '';

        let path = `M ${points[0].x},${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i === 0 ? i : i - 1];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + 2] || p2;

            // Catmull-Rom to Bezier conversion with tension
            const tension = 0.5;
            const cp1x = p1.x + (p2.x - p0.x) / 6 * tension;
            const cp1y = p1.y + (p2.y - p0.y) / 6 * tension;
            const cp2x = p2.x - (p3.x - p1.x) / 6 * tension;
            const cp2y = p2.y - (p3.y - p1.y) / 6 * tension;

            path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
        }

        if (closed) {
            path += ' Z';
        }

        return path;
    };

    // Calculate points for the graph
    const graphPoints = mockData.map((point, index) => {
        const x = 80 + (index / (mockData.length - 1)) * 1840;
        const normalizedValue = (point.engagement - minEngagement) / range;
        const y = 650 - (normalizedValue * 600);
        return { x, y };
    });

    return (
        <div className="h-screen overflow-hidden bg-gradient-to-br from-[#e8f4f8] via-white to-[#e8f5e9] dark:from-[#0a0e12] dark:via-[#0f1419] dark:to-[#0d1410]">
            <div className="mx-auto w-full h-full px-4 py-4 flex flex-col">
                {/* Header */}
                <div className="mb-4 flex-shrink-0">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#4A8EC6] to-[#6BC04A] bg-clip-text text-transparent">
                        {t('title')}
                    </h1>
                </div>

                {/* Main Graph Card */}
                <Card className="border-2 border-[#4A8EC6]/20 shadow-xl dark:border-[#5B9ED3]/20 flex flex-col overflow-hidden">
                    <CardContent className="flex flex-col overflow-hidden p-6">
                        {/* Graph Container */}
                        <div className="relative h-[60vh] rounded-lg border border-[#4A8EC6]/20 bg-white/50 backdrop-blur-sm p-4 dark:border-[#5B9ED3]/30 dark:bg-[#0f1419]/50">
                            <svg className="h-full w-full" viewBox="0 0 2000 700" preserveAspectRatio="none">
                                {/* Background grid */}
                                <defs>
                                    <pattern id="grid" width="100" height="70" patternUnits="userSpaceOnUse">
                                        <path d="M 100 0 L 0 0 0 70" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[#4A8EC6]/10 dark:text-[#5B9ED3]/10" />
                                    </pattern>
                                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#6BC04A" stopOpacity="0.08" />
                                        <stop offset="100%" stopColor="#6BC04A" stopOpacity="0.01" />
                                    </linearGradient>
                                </defs>
                                <rect width="2000" height="700" fill="url(#grid)" />

                                {/* Y-axis labels */}
                                {[0, 25, 50, 75, 100].map((percent) => {
                                    const value = minEngagement + (range * percent / 100);
                                    const y = 650 - (percent * 6);
                                    return (
                                        <g key={percent}>
                                            <line
                                                x1="80"
                                                y1={y}
                                                x2="1920"
                                                y2={y}
                                                stroke="currentColor"
                                                strokeWidth="1"
                                                className="text-[#4A8EC6]/20 dark:text-[#5B9ED3]/20"
                                                strokeDasharray="5,5"
                                            />
                                            <text
                                                x="65"
                                                y={y + 5}
                                                textAnchor="end"
                                                className="fill-zinc-600 dark:fill-zinc-400 text-xl"
                                                fontSize="28"
                                            >
                                                {Math.round(value)}
                                            </text>
                                        </g>
                                    );
                                })}

                                {/* X-axis labels (Time) */}
                                <text x="1000" y="695" textAnchor="middle" className="fill-[#4A8EC6] dark:fill-[#7CB8E8] text-xl font-semibold" fontSize="24">
                                    {t('time')}
                                </text>
                                {mockData.map((point, index) => {
                                    const x = 80 + (index / (mockData.length - 1)) * 1840;
                                    return (
                                        <text
                                            key={index}
                                            x={x}
                                            y="675"
                                            textAnchor="middle"
                                            className="fill-zinc-600 dark:fill-zinc-400 text-xl"
                                            fontSize="28"
                                        >
                                            {point.time}
                                        </text>
                                    );
                                })}

                                {/* Area under the curve */}
                                <path
                                    d={`
                    M 0,650
                    L ${graphPoints[0].x},650
                    ${createSmoothPath(graphPoints).replace(/^M [^,]+,[^ ]+/, '')}
                    L ${graphPoints[graphPoints.length - 1].x},650
                    L 1920,650 Z
                  `}
                                    fill="url(#areaGradient)"
                                />

                                {/* Main line */}
                                <path
                                    d={createSmoothPath(graphPoints)}
                                    fill="none"
                                    stroke="#6BC04A"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {/* Data points */}
                                {graphPoints.map((point, index) => {
                                    return (
                                        <g key={index}>
                                            {/* Outer glow */}
                                            <circle
                                                cx={point.x}
                                                cy={point.y}
                                                r="8"
                                                fill="#6BC04A"
                                                opacity="0.2"
                                            />
                                            {/* Main point */}
                                            <circle
                                                cx={point.x}
                                                cy={point.y}
                                                r="4"
                                                fill="#6BC04A"
                                                stroke="white"
                                                strokeWidth="2"
                                                className="drop-shadow-lg"
                                            />
                                            {/* Hover label */}
                                            <g className="opacity-0 hover:opacity-100 transition-opacity">
                                                <rect
                                                    x={point.x - 40}
                                                    y={point.y - 45}
                                                    width="80"
                                                    height="35"
                                                    rx="5"
                                                    fill="#1a1a1a"
                                                    fillOpacity="0.9"
                                                />
                                                <text
                                                    x={point.x}
                                                    y={point.y - 30}
                                                    textAnchor="middle"
                                                    className="fill-white text-xs font-semibold"
                                                    fontSize="11"
                                                >
                                                    {mockData[index].time}
                                                </text>
                                                <text
                                                    x={point.x}
                                                    y={point.y - 17}
                                                    textAnchor="middle"
                                                    className="fill-[#6BC04A] text-xs font-bold"
                                                    fontSize="12"
                                                >
                                                    {mockData[index].engagement}
                                                </text>
                                            </g>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>

                        {/* Stats */}
                        <div className="mt-4 grid grid-cols-4 gap-4 flex-shrink-0">
                            <div className="rounded-lg bg-gradient-to-br from-[#4A8EC6]/10 to-[#6BC04A]/10 p-4 text-center border border-[#4A8EC6]/20 dark:border-[#5B9ED3]/30">
                                <div className="text-3xl font-bold text-[#4A8EC6] dark:text-[#7CB8E8]">
                                    {maxEngagement}
                                </div>
                                <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-1">
                                    {t('peakEngagement')}
                                </div>
                            </div>
                            <div className="rounded-lg bg-gradient-to-br from-[#4A8EC6]/10 to-[#6BC04A]/10 p-4 text-center border border-[#4A8EC6]/20 dark:border-[#5B9ED3]/30">
                                <div className="text-3xl font-bold text-[#6BC04A] dark:text-[#7ACC58]">
                                    {Math.round(mockData.reduce((acc, d) => acc + d.engagement, 0) / mockData.length)}
                                </div>
                                <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-1">
                                    {t('averageEngagement')}
                                </div>
                            </div>
                            <div className="rounded-lg bg-gradient-to-br from-[#4A8EC6]/10 to-[#6BC04A]/10 p-4 text-center border border-[#4A8EC6]/20 dark:border-[#5B9ED3]/30">
                                <div className="text-3xl font-bold text-[#4A8EC6] dark:text-[#7CB8E8]">
                                    {mockData.reduce((acc, d) => acc + d.engagement, 0)}
                                </div>
                                <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-1">
                                    {t('totalEngagement')}
                                </div>
                            </div>
                            <div className="rounded-lg bg-gradient-to-br from-red-50 to-red-100 p-4 text-center border border-red-200 dark:from-red-950/20 dark:to-red-900/20 dark:border-red-800/30">
                                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                                    {Math.round(((mockData[mockData.length - 1].engagement - mockData[0].engagement) / mockData[0].engagement) * 100)}%
                                </div>
                                <div className="text-xs font-medium text-red-700 dark:text-red-300 mt-1">
                                    {t('growthRate')}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

