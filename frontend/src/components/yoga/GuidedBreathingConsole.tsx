import { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Wind, Pause, Play, Volume2, VolumeX, Maximize } from 'lucide-react';
import { cn } from '../../lib/utils';


type BreathingMode = 'Relax' | 'Focus' | 'Sleep' | 'Panic Relief';

const BREATHING_CONFIGS: Record<BreathingMode, { inhale: number, hold1: number, exhale: number, hold2: number, color: string }> = {
    'Relax': { inhale: 4, hold1: 0, exhale: 6, hold2: 0, color: 'bg-emerald-400' }, // 4-6 coherent
    'Focus': { inhale: 4, hold1: 4, exhale: 4, hold2: 4, color: 'bg-blue-400' }, // Box breathing
    'Sleep': { inhale: 4, hold1: 7, exhale: 8, hold2: 0, color: 'bg-indigo-400' }, // 4-7-8
    'Panic Relief': { inhale: 4, hold1: 0, exhale: 4, hold2: 0, color: 'bg-rose-400' } // Fast rhythm reset
};

export default function GuidedBreathingConsole() {
    const [mode, setMode] = useState<BreathingMode>('Relax');
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0); // in phase
    
    // Audio refs
    const inhaleAudio = useRef<HTMLAudioElement | null>(null);
    const exhaleAudio = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        inhaleAudio.current = new Audio('https://cdn.pixabay.com/download/audio/2023/10/06/audio_f25b290cb6.mp3');
        exhaleAudio.current = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_2760a5eab4.mp3');
    }, []);

    // Engine
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        let countdown: ReturnType<typeof setInterval>;
        
        if (isActive) {
            const config = BREATHING_CONFIGS[mode];
            const currentDuration = config[phase];
            setTimeLeft(currentDuration);

            // Audio cues
            if (soundEnabled) {
                if (phase === 'inhale' && inhaleAudio.current) {
                    inhaleAudio.current.currentTime = 0;
                    inhaleAudio.current.volume = 0.3;
                    inhaleAudio.current.play().catch(() => {});
                } else if (phase === 'exhale' && exhaleAudio.current) {
                    exhaleAudio.current.currentTime = 0;
                    exhaleAudio.current.volume = 0.3;
                    exhaleAudio.current.play().catch(() => {});
                }
            }

            // Countdown for UI
            countdown = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000);

            // Phase transition
            timer = setTimeout(() => {
                setPhase(p => {
                    if (p === 'inhale') return config.hold1 > 0 ? 'hold1' : 'exhale';
                    if (p === 'hold1') return 'exhale';
                    if (p === 'exhale') return config.hold2 > 0 ? 'hold2' : 'inhale';
                    return 'inhale';
                });
            }, currentDuration * 1000);
        } else {
            setPhase('inhale');
            setTimeLeft(0);
        }

        return () => {
            clearTimeout(timer);
            clearInterval(countdown);
        };
    }, [isActive, phase, mode, soundEnabled]);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                setIsActive(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const config = BREATHING_CONFIGS[mode];

    return (
        <Card className="p-8 border shadow-sm flex flex-col items-center bg-white/80 backdrop-blur text-gray-800 overflow-hidden relative h-[560px] justify-between">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />
            
            <div className="w-full flex justify-between items-center mb-8 relative z-10">
                <div className="flex items-center gap-2">
                    <Wind size={20} className="text-teal-500" />
                    <h3 className="font-serif font-bold text-lg">Guided Breathing</h3>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 bg-black/5 rounded-lg hover:bg-black/10 transition-colors text-gray-600">
                        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>
                    <button className="p-2 bg-black/5 rounded-lg hover:bg-black/10 transition-colors text-gray-600">
                        <Maximize size={16} />
                    </button>
                </div>
            </div>

            {/* Orb Area */}
            <div className="relative w-64 h-64 flex items-center justify-center my-8">
                {/* Outer ripples */}
                <div className={cn("absolute inset-0 rounded-full opacity-10 transition-all", config.color, isActive && phase === 'inhale' ? 'scale-[1.5]' : isActive && phase === 'exhale' ? 'scale-75' : 'scale-100')} style={{ transitionDuration: `${isActive ? config[phase] : 1}s` }} />
                <div className={cn("absolute inset-4 rounded-full opacity-20 transition-all", config.color, isActive && phase === 'inhale' ? 'scale-[1.3]' : isActive && phase === 'exhale' ? 'scale-75' : 'scale-100')} style={{ transitionDuration: `${isActive ? config[phase] : 1}s` }} />
                
                {/* Core Orb */}
                <div className={cn("relative z-10 w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.1)] transition-all ease-in-out", config.color, 
                    isActive && phase === 'inhale' ? 'scale-[1.2]' : isActive && phase === 'exhale' ? 'scale-75' : 'scale-100'
                )} style={{ transitionDuration: `${isActive ? config[phase] : 1}s` }}>
                    <span className="font-serif font-bold text-xl uppercase tracking-widest text-white drop-shadow-md">
                        {!isActive ? 'Ready' : phase === 'inhale' ? 'Inhale' : phase === 'exhale' ? 'Exhale' : 'Hold'}
                    </span>
                    {isActive && <span className="text-3xl font-mono mt-1 font-light text-white">{timeLeft}</span>}
                </div>
            </div>

            {/* Controls */}
            <div className="w-full flex flex-col items-center mt-4 relative z-10">
                <div className="flex gap-2 mb-8 bg-black/5 p-1 rounded-xl">
                    {(Object.keys(BREATHING_CONFIGS) as BreathingMode[]).map(m => (
                        <button
                            key={m}
                            onClick={() => { setMode(m); setIsActive(false); }}
                            className={cn("px-4 py-1.5 text-xs font-bold tracking-wide rounded-lg transition-colors", mode === m ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800')}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                <Button 
                    onClick={() => setIsActive(!isActive)} 
                    variant="outline" 
                    className={cn("rounded-full px-8 py-6 border-2 font-bold text-lg gap-3 transition-colors", isActive ? 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200' : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50')}
                >
                    {isActive ? <><Pause size={20} /> Pause Breathing</> : <><Play size={20} /> Begin {mode}</>}
                </Button>
                <p className="text-[10px] text-gray-400 mt-4 font-mono">Press SPACE to Play/Pause</p>
            </div>
        </Card>
    );
}
