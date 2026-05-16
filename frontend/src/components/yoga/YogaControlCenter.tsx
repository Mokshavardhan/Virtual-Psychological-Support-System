import { Play, Flame, Activity, BrainCircuit } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useAmbience } from '../../context/AmbienceContext';

interface YogaControlCenterProps {
    dailyScore: number | null;
    streak: number;
    recommendedFlow: string;
    onStartSession: () => void;
}

export default function YogaControlCenter({ dailyScore, streak, recommendedFlow, onStartSession }: YogaControlCenterProps) {
    const { theme } = useAmbience();
    const stressScore = dailyScore ? Math.round(100 - dailyScore) : 0; // If daily score is 0-100 (100 being best), stress is inverse
    
    const themeClass = theme === 'green' ? 'bg-emerald-50 border-emerald-200' :
        theme === 'lavender' ? 'bg-purple-50 border-purple-200' :
        'bg-rose-50 border-rose-200';
        
    const accentClass = theme === 'green' ? 'text-emerald-600 bg-emerald-100' :
        theme === 'lavender' ? 'text-purple-600 bg-purple-100' :
        'text-rose-600 bg-rose-100';

    return (
        <Card className={cn("p-6 border-2 shadow-sm flex flex-col md:flex-row gap-8 justify-between items-center transition-colors duration-500", themeClass)}>
            <div className="flex-1 space-y-6 w-full">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-gray-800 mb-1">Clinical Control Center</h2>
                    <p className="text-sm text-gray-500">Your personalized daily wellness target.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-gray-500">
                            <Activity size={16} /> <span className="text-xs uppercase font-bold tracking-wider">Stress Load</span>
                        </div>
                        <p className="text-2xl font-bold font-mono">{stressScore}%</p>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-gray-500">
                            <BrainCircuit size={16} /> <span className="text-xs uppercase font-bold tracking-wider">Recommended</span>
                        </div>
                        <p className="text-lg font-bold font-serif leading-tight">{recommendedFlow}</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border shadow-sm col-span-2 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", accentClass)}>
                                <Flame size={20} />
                            </div>
                            <div>
                                <p className="text-xs uppercase font-bold tracking-wider text-gray-500">Weekly Consistency</p>
                                <p className="text-lg font-bold font-mono">{streak} Day Streak</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Button onClick={onStartSession} className="w-full sm:w-auto px-8 py-6 rounded-2xl font-bold tracking-wide text-lg shadow-lg group">
                    <Play size={20} fill="currentColor" className="mr-3 group-hover:scale-110 transition-transform" /> Start Prescribed Session
                </Button>
            </div>
            
            <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
                <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* Breathing Pulse Animation */}
                    <div className={cn("absolute inset-0 rounded-full animate-ping opacity-20", theme === 'green' ? 'bg-emerald-400' : theme === 'lavender' ? 'bg-purple-400' : 'bg-rose-400')} style={{ animationDuration: '4s' }} />
                    <div className={cn("absolute inset-2 rounded-full animate-pulse opacity-30", theme === 'green' ? 'bg-emerald-300' : theme === 'lavender' ? 'bg-purple-300' : 'bg-rose-300')} style={{ animationDuration: '4s', animationDelay: '1s' }} />
                    
                    {/* Progress Ring */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/50" />
                        <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="552.9" strokeDashoffset={552.9 - (552.9 * 0.75)} className={cn("transition-all duration-1000", theme === 'green' ? 'text-emerald-500' : theme === 'lavender' ? 'text-purple-500' : 'text-rose-500')} strokeLinecap="round" />
                    </svg>
                    
                    <div className="text-center z-10 bg-white/60 backdrop-blur-sm w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-inner border border-white">
                        <span className="text-3xl font-bold font-mono text-gray-800">75%</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mt-1">Daily Goal</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
