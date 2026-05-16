import { useState } from 'react';
import { Card } from '../ui/Card';
import { Activity, Play } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAmbience } from '../../context/AmbienceContext';

const RECOVERY_DATA: Record<string, { title: string; label: string; suggestions: { name: string; duration: string }[] }> = {
    head: {
        title: 'Cranial & Neck Tension',
        label: 'Head',
        suggestions: [
            { name: 'Neck Rolls', duration: '2 min' },
            { name: 'Child Pose', duration: '3 min' }
        ]
    },
    shoulders: {
        title: 'Shoulder / Upper Back Strain',
        label: 'Shoulders',
        suggestions: [
            { name: 'Eagle Arms', duration: '2 min' },
            { name: 'Thread the Needle', duration: '3 min' }
        ]
    },
    chest: {
        title: 'Thoracic Constriction',
        label: 'Chest',
        suggestions: [
            { name: 'Cobra Pose', duration: '2 min' },
            { name: 'Heart Opener', duration: '4 min' }
        ]
    },
    'lower back': {
        title: 'Lumbar Compression',
        label: 'Lower Back',
        suggestions: [
            { name: 'Cat-Cow Stretch', duration: '3 min' },
            { name: 'Supine Twist', duration: '5 min' }
        ]
    },
    leftKnee: {
        title: 'Left Knee Joint Stiffness',
        label: 'Left Knee',
        suggestions: [
            { name: 'Supported Bridge', duration: '3 min' },
            { name: 'Legs Up Wall', duration: '5 min' }
        ]
    },
    rightKnee: {
        title: 'Right Knee Joint Stiffness',
        label: 'Right Knee',
        suggestions: [
            { name: 'Supported Bridge', duration: '3 min' },
            { name: 'Legs Up Wall', duration: '5 min' }
        ]
    }
};

// Precisely calibrated for the lotus meditation silhouette image
// The image is portrait (tall). Silhouette sits centered, cross-legged.
// Head bun is at top ~12%, shoulders ~33%, chest ~45%, lower back ~60%,
// knees spread wide at ~82% from top (left ~18%, right ~82%)
const HOTSPOTS = [
    { key: 'head',        top: '12%', left: '50%', size: 20 },
    { key: 'shoulders',   top: '34%', left: '50%', size: 34 },
    { key: 'chest',       top: '47%', left: '50%', size: 20 },
    { key: 'lower back',  top: '60%', left: '50%', size: 20 },
    { key: 'leftKnee',   top: '82%', left: '20%', size: 18 },
    { key: 'rightKnee',  top: '82%', left: '80%', size: 18 },
];

interface BodyRecoveryMapProps {
    onStartSession: (title: string) => void;
}

export default function BodyRecoveryMap({ onStartSession }: BodyRecoveryMapProps) {
    const { theme } = useAmbience();
    const [activeZone, setActiveZone] = useState<string | null>(null);

    const activeData = activeZone ? RECOVERY_DATA[activeZone] : null;

    const accentRing = theme === 'green' ? 'ring-emerald-500 shadow-emerald-400/60'
        : theme === 'lavender' ? 'ring-purple-500 shadow-purple-400/60'
        : 'ring-rose-500 shadow-rose-400/60';

    const accentBg = theme === 'green' ? 'bg-emerald-500'
        : theme === 'lavender' ? 'bg-purple-500'
        : 'bg-rose-500';

    const accentText = theme === 'green' ? 'text-emerald-600'
        : theme === 'lavender' ? 'text-purple-600'
        : 'text-rose-600';

    return (
        <Card className="p-6 border shadow-sm h-[560px] flex flex-col bg-white/80 backdrop-blur relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
                <Activity size={20} className={accentText} />
                <h3 className="font-serif font-bold text-lg text-gray-800">Body Recovery Map</h3>
                <span className="ml-auto text-xs text-gray-400 font-medium">Tap a zone to get targeted flows</span>
            </div>

            <div className="flex-1 flex flex-row gap-6 items-center overflow-hidden">
                {/* Body Image with Hotspots */}
                <div className="relative shrink-0 h-full flex items-center justify-center" style={{ width: '180px' }}>
                    <div className="relative w-full h-full">
                        <img
                            src="/yoga-body-map.jpg"
                            alt="Body Recovery Map"
                            className="w-full h-full object-contain rounded-2xl"
                            onError={(e) => {
                                // fallback gradient if image not found
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />

                        {/* Hotspot circles on the image */}
                        {HOTSPOTS.map(({ key, top, left, size }) => {
                            const isActive = activeZone === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveZone(isActive ? null : key)}
                                    title={RECOVERY_DATA[key].label}
                                    className={cn(
                                        'absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white transition-all duration-300 flex items-center justify-center',
                                        isActive
                                            ? `${accentBg} ring-2 ring-offset-1 ${accentRing} shadow-[0_0_14px_rgba(0,0,0,0.3)] scale-125 z-20`
                                            : 'bg-white/40 hover:bg-white/70 hover:scale-110 z-10 shadow-md backdrop-blur-sm'
                                    )}
                                    style={{ top, left, width: size, height: size }}
                                >
                                    {isActive && (
                                        <span className="w-2 h-2 rounded-full bg-white block" />
                                    )}
                                </button>
                            );
                        })}

                        {/* Pulse rings for all zones */}
                        {HOTSPOTS.map(({ key, top, left, size }) => (
                            activeZone !== key && (
                                <span
                                    key={`pulse-${key}`}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 animate-ping pointer-events-none"
                                    style={{ top, left, width: size + 8, height: size + 8, animationDuration: '2s' }}
                                />
                            )
                        ))}
                    </div>
                </div>

                {/* Zone Legend + Suggestions */}
                <div className="flex-1 flex flex-col justify-between h-full py-1 overflow-hidden">
                    {/* Zone selector buttons */}
                    <div className="flex flex-col gap-2">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">Select Zone</p>
                        {Object.entries(RECOVERY_DATA).map(([key, val]) => (
                            <button
                                key={key}
                                onClick={() => setActiveZone(activeZone === key ? null : key)}
                                className={cn(
                                    'text-left px-3 py-2 rounded-xl text-xs font-semibold border transition-all',
                                    activeZone === key
                                        ? `border-current ${accentText} bg-white shadow-sm`
                                        : 'border-gray-100 text-gray-500 bg-gray-50 hover:bg-white hover:text-gray-700'
                                )}
                            >
                                {val.label}
                            </button>
                        ))}
                    </div>

                    {/* Suggestions Panel */}
                    <div className="mt-4 min-h-[120px]">
                        {activeData ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h4 className={`font-bold text-xs uppercase tracking-wide mb-3 ${accentText}`}>
                                    {activeData.title}
                                </h4>
                                <div className="space-y-2">
                                    {activeData.suggestions.map((s, i) => (
                                        <div key={i} className="flex justify-between items-center bg-white p-2.5 px-3 rounded-xl border border-gray-100 shadow-sm">
                                            <span className="font-serif font-bold text-gray-800 text-sm">{s.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border">{s.duration}</span>
                                                <button
                                                    onClick={() => onStartSession(s.name)}
                                                    className={cn('p-1.5 rounded-lg transition-colors text-white', accentBg.replace('bg-', 'bg-').replace('500', '500') + ' hover:opacity-90')}
                                                >
                                                    <Play size={12} fill="currentColor" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl">
                                <p className="text-xs text-gray-400 font-medium italic text-center leading-relaxed px-4">
                                    Tap a circle on the body image<br />or select a zone above
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
