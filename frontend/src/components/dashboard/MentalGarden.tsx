import { useMemo } from 'react';
import { Card } from '../ui/Card';
import { Sprout } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getNormalizedHealthScore } from '../../lib/utils';
import type { AssessmentResult } from '../../services/api';
import { useAmbience } from '../../context/AmbienceContext';
import { motion, AnimatePresence } from 'framer-motion';

interface MentalGardenProps {
    assessments?: AssessmentResult[];
}

export default function MentalGarden({ assessments = [] }: MentalGardenProps) {
    const hasData = assessments.length > 0;
    const { theme } = useAmbience();

    const averageScore = useMemo(() => {
        if (!hasData) return 50;
        return Number((assessments.reduce((acc, curr) => acc + getNormalizedHealthScore(curr), 0) / assessments.length).toFixed(1));
    }, [assessments, hasData]);

    const data = useMemo(() => {
        const base = averageScore;

        // Mapping psychological traits - normalized to 0-10 scale
        return [
            { name: 'Resilience', value: Math.min(10, (base * 1.3) / 10), icon: '🛡️' },
            { name: 'Focus', value: Math.min(10, (base * 0.9 + 20) / 10), icon: '🎯' },
            { name: 'Calmness', value: Math.min(10, (base + 10) / 10), icon: '🌊' },
            { name: 'Empathy', value: Math.min(10, (base * 1.1 + 10) / 10), icon: '❤️' },
        ];
    }, [averageScore]);

    // Reduced size by 20% from original 360px
    const size = 288;  // Was 360, now 288 (80% of 360)
    const center = size / 2;
    const innerRadius = 48;  // Was 60, now 48 (80% of 60)
    const maxBarLength = 96;  // Was 120, now 96 (80% of 120)

    // Theme-aware color palette based on selected theme
    const themeColors = useMemo(() => {
        if (theme === 'lavender') {
            return {
                light: '#e9d5ff',    // Light lavender
                medium: '#c084fc',   // Medium lavender
                vibrant: '#9333ea'   // Vibrant purple
            };
        } else if (theme === 'pink') {
            return {
                light: '#fbcfe8',    // Light pink
                medium: '#f472b6',   // Medium pink
                vibrant: '#ec4899'   // Vibrant pink
            };
        }
        // Default: green theme
        return {
            light: '#6ee7b7',    // Light mint
            medium: '#34d399',   // Medium mint
            vibrant: '#10b981'   // Vibrant emerald
        };
    }, [theme]);

    // Dynamic color helper based on score (0-10 scale) - Enhanced opacity for better visibility
    const getBarColor = (score: number) => {
        if (score < 4) return {
            fill: themeColors.light,
            opacity: 0.75  // Increased from 0.5
        };
        if (score < 7) return {
            fill: themeColors.medium,
            opacity: 0.85  // Increased from 0.65
        };
        return {
            fill: themeColors.vibrant,
            opacity: 0.95  // Increased from 0.75
        };
    };

    const createRadialBar = (index: number, total: number, value: number) => {
        const barLength = (value / 10) * maxBarLength;
        const outerRadius = innerRadius + barLength;
        const angleStep = 360 / total;
        const startAngle = index * angleStep;
        const endAngle = startAngle + angleStep - 8; // Gap between bars

        const start = (startAngle - 90) * (Math.PI / 180);
        const end = (endAngle - 90) * (Math.PI / 180);

        const x1 = center + innerRadius * Math.cos(start);
        const y1 = center + innerRadius * Math.sin(start);
        const x2 = center + outerRadius * Math.cos(start);
        const y2 = center + outerRadius * Math.sin(start);
        const x3 = center + outerRadius * Math.cos(end);
        const y3 = center + outerRadius * Math.sin(end);
        const x4 = center + innerRadius * Math.cos(end);
        const y4 = center + innerRadius * Math.sin(end);

        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        // Path for radial bar segments
        return `M${x1},${y1} L${x2},${y2} A${outerRadius},${outerRadius} 0 ${largeArc},1 ${x3},${y3} L${x4},${y4} A${innerRadius},${innerRadius} 0 ${largeArc},0 ${x1},${y1} Z`;
    };

    return (
        <Card className={cn(
            "p-6 relative overflow-hidden h-[22rem] flex flex-col items-center justify-between transition-all duration-500 rounded-[2rem] shadow-xl",
            theme === 'lavender' ? "bg-purple-50/80 border border-purple-100/50" :
                theme === 'pink' ? "bg-rose-50/80 border border-rose-100/50" :
                    "bg-emerald-50/80 border border-emerald-50/50",
            "backdrop-blur-3xl"
        )}>
            <div className="w-full flex justify-between items-start z-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col"
                >
                    <h3 className="font-serif font-semibold text-base text-[#1a3a3a] tracking-tight">Inner Strength</h3>
                    <p className="text-[10px] font-semibold text-emerald-600/50 uppercase tracking-[0.25em] mt-0.5">Psychological Health Matrix</p>
                </motion.div>
            </div>

            <div className="flex-1 flex items-center justify-center w-full relative">
                <AnimatePresence mode="wait">
                    {hasData ? (
                        <motion.div
                            key="radial-chart"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative"
                        >
                            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                                <defs>
                                    {/* Glassmorphism filter for bars */}
                                    <filter id="glassEffect">
                                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                                        <feOffset in="blur" dx="0" dy="2" result="offsetBlur" />
                                        <feFlood floodColor="#ffffff" floodOpacity="0.3" result="offsetColor" />
                                        <feComposite in="offsetColor" in2="offsetBlur" operator="in" result="offsetBlur" />
                                        <feBlend in="SourceGraphic" in2="offsetBlur" mode="normal" />
                                    </filter>

                                    {/* Outer glow for bars */}
                                    <filter id="outerGlow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur stdDeviation="4" result="blur" />
                                        <feFlood floodColor="#10b981" floodOpacity="0.4" result="glowColor" />
                                        <feComposite in="glowColor" in2="blur" operator="in" result="softGlow" />
                                        <feMerge>
                                            <feMergeNode in="softGlow" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>

                                    {/* Central glassmorphism backdrop */}
                                    <filter id="centralGlass" x="-50%" y="-50%" width="200%" height="200%">
                                        <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.15" />
                                    </filter>
                                </defs>

                                {/* Target Grid - Concentric circles for 0-10 scale */}
                                {[2, 4, 6, 8, 10].map(tick => (
                                    <circle
                                        key={tick}
                                        cx={center} cy={center}
                                        r={innerRadius + (tick / 10) * maxBarLength}
                                        fill="none"
                                        stroke="#cbd5e1"
                                        strokeDasharray="2 6"
                                        strokeOpacity="0.2"
                                        strokeWidth="1"
                                    />
                                ))}

                                {/* Scale markers - subtle tick labels */}
                                {[2, 4, 6, 8, 10].map(tick => (
                                    <text
                                        key={`label-${tick}`}
                                        x={center + innerRadius + (tick / 10) * maxBarLength + 8}
                                        y={center + 4}
                                        className="text-[8px] uppercase tracking-wider fill-slate-500 font-normal"
                                        textAnchor="start"
                                    >
                                        {tick}
                                    </text>
                                ))}

                                {data.map((trait, i) => {
                                    const barStyle = getBarColor(trait.value);
                                    return (
                                        <motion.g key={trait.name}>
                                            <motion.path
                                                initial={{ d: createRadialBar(i, data.length, 0) }}
                                                animate={{ d: createRadialBar(i, data.length, trait.value) }}
                                                transition={{ delay: i * 0.15, duration: 1.4, ease: "circOut" }}
                                                fill={barStyle.fill}
                                                fillOpacity={barStyle.opacity}
                                                stroke="white"
                                                strokeWidth="2"
                                                className="cursor-pointer transition-all duration-500"
                                                filter="url(#outerGlow)"
                                                whileHover={{
                                                    fillOpacity: barStyle.opacity + 0.15,
                                                    scale: 1.02
                                                }}
                                            >
                                                <title>{trait.name}: {Math.round(trait.value * 10) / 10}/10</title>
                                            </motion.path>

                                            {/* Dynamic Label Placement - further out */}
                                            {(() => {
                                                const angle = (i * (360 / data.length) + (360 / data.length) / 2 - 4 - 90) * (Math.PI / 180);
                                                const labelRadius = innerRadius + maxBarLength + 28;
                                                return (
                                                    <text
                                                        x={center + labelRadius * Math.cos(angle)}
                                                        y={center + labelRadius * Math.sin(angle)}
                                                        textAnchor="middle"
                                                        className="text-[9px] font-normal fill-slate-600 uppercase tracking-wide"
                                                        style={{ letterSpacing: '0.08em' }}
                                                    >
                                                        {trait.name}
                                                    </text>
                                                );
                                            })()}
                                        </motion.g>
                                    );
                                })}

                                {/* Central glassmorphism circle */}
                                <motion.circle
                                    cx={center} cy={center} r={innerRadius - 8}
                                    fill="white"
                                    fillOpacity={0.85}
                                    filter="url(#centralGlass)"
                                    className="backdrop-blur-2xl"
                                />
                            </svg>

                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.04, 1],
                                        opacity: [0.95, 1, 0.95]
                                    }}
                                    transition={{
                                        duration: 3.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="text-center relative z-10"
                                >
                                    <span className="text-[2rem] leading-none font-serif font-bold text-[#1a3a3a] tracking-tight">
                                        {hasData ? Math.round(averageScore) : 0}%
                                    </span>
                                    <span className="block text-[0.6rem] font-normal text-emerald-600/50 uppercase tracking-[0.3em] -mt-1.5">
                                        Health
                                    </span>
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center p-8"
                        >
                            <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                                <Sprout size={32} className="text-emerald-400 opacity-60" />
                            </div>
                            <h4 className="font-serif font-bold text-xl text-[#1a3a3a] mb-2">Matrix Loading</h4>
                            <p className="text-xs text-slate-400 font-medium max-w-[200px] leading-relaxed">
                                Complete your assessment to generate your psychological health matrix.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {hasData && (
                <div className="w-full mt-4">
                    <div className="flex justify-center gap-4 text-[10px] font-semibold uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: themeColors.light, opacity: 0.7 }} />
                            <span className="text-slate-500">Growing</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: themeColors.medium, opacity: 0.7 }} />
                            <span className="text-slate-500">Balanced</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: themeColors.vibrant, opacity: 0.7 }} />
                            <span className="text-slate-500">Strength</span>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
