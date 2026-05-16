import { useState, useEffect, useRef } from 'react';
import { useAmbience } from '../context/AmbienceContext';
import { fetchAssessments } from '../services/api';

// New Components
import YogaControlCenter from '../components/yoga/YogaControlCenter';
import SmartRecoveryPanel from '../components/yoga/SmartRecoveryPanel';
import GuidedBreathingConsole from '../components/yoga/GuidedBreathingConsole';
import RuntimePlayer from '../components/yoga/RuntimePlayer';
import SmartJournal from '../components/yoga/SmartJournal';
import WellnessAnalytics from '../components/yoga/WellnessAnalytics';
import EmergencyCalmMode from '../components/yoga/EmergencyCalmMode';
import WellnessReportGenerator from '../components/yoga/WellnessReportGenerator';

import type { AssessmentResult } from '../services/api';

export default function Yoga() {
    const { theme } = useAmbience();
    const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
    const [dailyScore, setDailyScore] = useState<number | null>(null);
    const streak = 8; // Session streak (mock - would come from backend)
    const [recommendedFlow, setRecommendedFlow] = useState('Recovery Yoga');

    // Modals
    const [activeSession, setActiveSession] = useState<string | null>(null);
    const [sosMode, setSosMode] = useState(false);

    // Draggable SOS button
    const sosRef = useRef<HTMLButtonElement>(null);
    const [sosPos, setSosPos] = useState({ x: window.innerWidth - 220, y: window.innerHeight - 80 });
    const dragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const onMouseDown = (e: React.MouseEvent) => {
        dragging.current = true;
        dragOffset.current = { x: e.clientX - sosPos.x, y: e.clientY - sosPos.y };
        e.preventDefault();
    };
    const onMouseMove = (e: MouseEvent) => {
        if (!dragging.current) return;
        setSosPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const onMouseUp = () => { dragging.current = false; };

    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    useEffect(() => {
        const loadAssessments = async () => {
            const data = await fetchAssessments();
            setAssessments(data);
            if (data.length > 0) {
                const sorted = [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                const latest = sorted.find(a => a.type === 'daily');
                if (latest) {
                    setDailyScore(latest.score);
                }
            }
        };
        loadAssessments();
    }, []);

    // Clinical Zen Colors
    const palette = {
        bg: theme === 'green' ? 'bg-[#ecfdf5]' : theme === 'lavender' ? 'bg-[#f5f3ff]' : 'bg-[#fff1f2]',
        text: 'text-[#334155]'
    };

    return (
        <div className={`min-h-screen p-4 md:p-8 transition-colors duration-1000 relative ${palette.bg} ${palette.text} font-sans pb-24`}>
            {/* Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-white/60 to-transparent blur-[120px] mix-blend-overlay animate-[spin_60s_linear_infinite]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-tl from-white/40 to-transparent blur-[150px] mix-blend-overlay animate-[spin_90s_reverse_infinite]" />
            </div>

            {/* Overlays */}
            {sosMode && <EmergencyCalmMode onClose={() => setSosMode(false)} />}
            {activeSession && <RuntimePlayer sessionTitle={activeSession} onClose={() => setActiveSession(null)} />}

            <div className="max-w-7xl mx-auto relative z-20 space-y-8">
                {/* 1. Yoga Control Center */}
                <YogaControlCenter 
                    dailyScore={dailyScore} 
                    streak={streak} 
                    recommendedFlow={recommendedFlow} 
                    onStartSession={() => setActiveSession(recommendedFlow)} 
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column (7 cols) */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* 2. Smart Recovery Recommendations */}
                        <SmartRecoveryPanel onStartSession={setActiveSession} />

                        {/* 8. Smart Journal */}
                        <SmartJournal onRecommendationGenerated={setRecommendedFlow} />
                    </div>

                    {/* Right Column (5 cols) */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* 6. Wellness Analytics */}
                        <WellnessAnalytics assessments={assessments} />

                        {/* 3. Guided Breathing Console */}
                        <GuidedBreathingConsole />
                    </div>
                </div>

                {/* 10. Wellness Report Generator */}
                <WellnessReportGenerator assessments={assessments} />

            </div>

            {/* Floating Draggable SOS Button */}
            <button
                ref={sosRef}
                onMouseDown={onMouseDown}
                onClick={() => setSosMode(true)}
                style={{ left: sosPos.x, top: sosPos.y }}
                className="fixed z-50 bg-red-600 text-white shadow-[0_4px_20px_rgba(220,38,38,0.5)] px-5 py-3 rounded-full font-bold tracking-widest uppercase hover:bg-red-700 transition-colors flex items-center gap-2 border-2 border-red-400 select-none cursor-grab active:cursor-grabbing text-sm"
            >
                🆘 Need Immediate Calm?
            </button>
        </div>
    );
}
