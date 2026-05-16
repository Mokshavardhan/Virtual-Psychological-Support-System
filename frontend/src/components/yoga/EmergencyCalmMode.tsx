import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmergencyCalmModeProps {
    onClose: () => void;
}

export default function EmergencyCalmMode({ onClose }: EmergencyCalmModeProps) {
    const [step, setStep] = useState(0);
    const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');

    // 4-4 Breathing engine for panic
    useEffect(() => {
        const interval = setInterval(() => {
            setPhase(p => p === 'inhale' ? 'exhale' : 'inhale');
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const steps = [
        "You are safe. Take a deep breath.",
        "Notice the feeling of the ground beneath you.",
        "Drop your shoulders. Unclench your jaw.",
        "Keep following the breathing circle."
    ];

    // Progress text every 8 seconds
    useEffect(() => {
        if (step < steps.length - 1) {
            const timer = setTimeout(() => setStep(s => s + 1), 8000);
            return () => clearTimeout(timer);
        }
    }, [step, steps.length]);

    return (
        <div className="fixed inset-0 z-50 bg-[#0f172a]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white text-center animate-in fade-in duration-1000">
            <div className="absolute top-8 right-8">
                <Button onClick={onClose} variant="ghost" className="text-white/50 hover:text-white rounded-full">Exit Calm Mode</Button>
            </div>

            <div className="max-w-2xl w-full flex flex-col items-center">
                <ShieldCheck size={48} className="text-teal-500 mb-8 animate-pulse" style={{ animationDuration: '4s' }} />
                
                {/* Breathing Orb */}
                <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                    <div className={`absolute inset-0 rounded-full bg-teal-500/20 transition-all ease-in-out duration-[4000ms] ${phase === 'inhale' ? 'scale-[1.5] opacity-50' : 'scale-[0.8] opacity-10'}`} />
                    <div className={`relative z-10 w-40 h-40 rounded-full bg-teal-500/40 flex items-center justify-center shadow-[0_0_50px_rgba(20,184,166,0.3)] backdrop-blur-md transition-all ease-in-out duration-[4000ms] ${phase === 'inhale' ? 'scale-110' : 'scale-90'}`}>
                        <span className="font-serif font-bold text-2xl tracking-widest">{phase === 'inhale' ? 'Inhale' : 'Exhale'}</span>
                    </div>
                </div>

                {/* Grounding Text */}
                <h2 className="text-3xl font-serif font-light text-teal-50 mb-12 min-h-[80px] animate-in fade-in slide-in-from-bottom-4 duration-1000" key={step}>
                    {steps[step]}
                </h2>

                <div className="flex gap-4">
                    <Button onClick={onClose} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 py-6 font-bold tracking-wide text-lg">
                        I feel better now
                    </Button>
                </div>
            </div>
        </div>
    );
}
