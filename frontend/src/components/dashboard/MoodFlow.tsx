import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { Activity } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAmbience } from '../../context/AmbienceContext';
import { getNormalizedHealthScore } from '../../lib/utils';
import type { AssessmentResult } from '../../services/api';

interface MoodFlowProps {
    assessments?: AssessmentResult[];
}

export default function MoodFlow({ assessments = [] }: MoodFlowProps) {
    // Default filter state
    const [view, setView] = useState<'days' | 'weeks'>('days');

    // Process data based on view
    const chartData = useMemo(() => {
        if (!assessments.length) return [];

        // Sort by date old -> new
        const sorted = [...assessments].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        if (view === 'days') {
            // Group by day to prevent duplicate 'Mondays'
            const dailyMap = new Map<string, AssessmentResult>();
            for (const a of sorted) {
                const dateKey = new Date(a.timestamp).toDateString(); // Only keeps date part
                dailyMap.set(dateKey, a); // Latest assessment for that day replaces previous
            }

            // Generate the last 7 days ending today
            const last7Days = [];
            const today = new Date();
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                last7Days.push(d);
            }

            // Map the last 7 days to either the actual assessment or a zeroed-out entry
            return last7Days.map(date => {
                const dateStr = date.toDateString();
                const existing = dailyMap.get(dateStr);

                return existing ? {
                    ...existing,
                    score: getNormalizedHealthScore(existing),
                    label: date.toLocaleDateString(undefined, { weekday: 'short' })
                } : {
                    id: `empty-${dateStr}`,
                    userId: 'none',
                    assessment: 'daily',
                    score: 0,
                    severity: 'unknown',
                    timestamp: date.toISOString(),
                    answers: [],
                    label: date.toLocaleDateString(undefined, { weekday: 'short' })
                } as any;
            });
        } else {
            // Mock "Weeks" logic: Take last 7 weeks (approx every 7th entry or just sample)
            return sorted.filter((_, i) => i % 5 === 0).slice(-7).map(a => ({
                ...a,
                score: getNormalizedHealthScore(a),
                label: new Date(a.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            }));
        }
    }, [assessments, view]);

    // Use raw scores directly on a 0-100 scale
    const dataPoints = chartData.map(a => a.id && a.id.startsWith('empty') ? 0 : (a.score ?? 0));
    const rawScores = chartData.map(a => a.score ?? 0); // Keep raw scores for labels
    const hasData = rawScores.some(s => s > 0);

    // SVG Chart Dimensions
    const width = 600;
    const height = 180;
    const padding = 30;
    const effectiveWidth = width - padding * 2;
    const effectiveHeight = height - padding * 2;

    // Generate Worm Graph Path (Straight lines connecting dots, Cricket style)
    const getPath = (points: number[]) => {
        if (points.length < 1) return { line: '', area: '', coords: [] };

        const spacing = points.length > 1 ? effectiveWidth / (points.length - 1) : effectiveWidth;

        const coords = points.map((score, i) => {
            const x = padding + i * spacing;
            // 0 at bottom, 100 at top
            const y = height - padding - ((score / 100) * effectiveHeight);
            return { x, y };
        });

        const line = coords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

        // Area slightly fading below? Or just line. User said "Cricket score comparison graph". Usually just a line, maybe filled.
        const area = `${line} L ${coords[coords.length - 1].x},${height - padding} L ${coords[0].x},${height - padding} Z`;

        return { line, area, coords };
    };

    const { line, area, coords } = useMemo(() => getPath(dataPoints), [dataPoints]);

    const { theme } = useAmbience();
    const themeClass = theme === 'green' ? 'bg-emerald-50/60 border-4 border-emerald-200 backdrop-blur-md' :
        theme === 'lavender' ? 'bg-purple-50/60 border-4 border-purple-200 backdrop-blur-md' :
            'bg-rose-50/60 border-4 border-rose-200 backdrop-blur-md';

    // Dynamic graph colors based on theme
    const chartColors = {
        green: { line: '#16a34a', stop: '#4ADE80', circleStroke: 'stroke-green-600' },
        lavender: { line: '#9333ea', stop: '#c084fc', circleStroke: 'stroke-purple-600' },
        pink: { line: '#e11d48', stop: '#fb7185', circleStroke: 'stroke-rose-600' }
    };

    const currentColors = chartColors[theme as keyof typeof chartColors] || chartColors.green;

    return (
        <Card className={cn("p-6 h-[22rem] flex flex-col transition-colors duration-500", themeClass)}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-serif font-bold text-lg text-text">Mood Flow</h3>
                    <p className="text-xs text-muted">Recent Overs (History)</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setView('days')}
                        className={cn(
                            "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all",
                            view === 'days' ? "bg-white text-primary shadow-sm" : "text-muted hover:text-text"
                        )}
                    >
                        Days
                    </button>
                    <button
                        onClick={() => setView('weeks')}
                        className={cn(
                            "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all",
                            view === 'weeks' ? "bg-white text-primary shadow-sm" : "text-muted hover:text-text"
                        )}
                    >
                        Weeks
                    </button>
                </div>
            </div>

            {hasData ? (
                <div className="flex-1 w-full relative overflow-visible">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="wormGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor={currentColors.stop} stopOpacity="0.3" />
                                <stop offset="100%" stopColor={currentColors.stop} stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Grid Lines */}
                        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />
                        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />

                        {/* Area */}
                        <path d={area} fill="url(#wormGradient)" />

                        {/* Line (Worm) - Enhanced visibility */}
                        <path d={line} fill="none" stroke={currentColors.line} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />

                        {/* Dots with numerical values */}
                        {coords?.map((p, i) => (
                            <g key={i} className="group">
                                {/* Circle - removed hover:scale to prevent shake */}
                                <circle cx={p.x} cy={p.y} r="6" className={`fill-white ${currentColors.circleStroke} stroke-[3px] drop-shadow-sm`} />

                                {/* Numerical value label above point */}
                                <text
                                    x={p.x}
                                    y={p.y - 15}
                                    textAnchor="middle"
                                    className="text-[11px] font-bold fill-gray-700"
                                >
                                    {Math.round(rawScores[i])}
                                </text>

                                {/* Tooltip on hover */}
                                <title>{chartData[i].type || chartData[i].assessment}: {rawScores[i]} (Health: {Math.round(dataPoints[i])}%)</title>
                            </g>
                        ))}
                    </svg>

                    {/* X-Axis Labels */}
                    <div className="flex justify-between mt-[-20px] px-8 text-[10px] text-muted font-medium">
                        {chartData.map((d, i) => (
                            <span key={i} className="text-center w-8">{d.label}</span>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50 mx-4 mb-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                        <Activity size={20} className="text-muted" />
                    </div>
                    <p className="text-sm font-medium text-text">No mood data yet</p>
                    <p className="text-xs text-muted max-w-[200px] mt-1">
                        Start tracking to build your graph.
                    </p>
                </div>
            )}
        </Card>
    );
}
