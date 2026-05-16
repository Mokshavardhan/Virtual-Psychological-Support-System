import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Play, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAmbience } from '../../context/AmbienceContext';

const SYMPTOMS = ['Stress', 'Anxiety', 'Neck Pain', 'Focus', 'Sleep', 'Fatigue'];

const RECOMMENDATIONS: Record<string, { title: string, duration: string, difficulty: string, benefit: string }[]> = {
    'Stress': [
        { title: 'Breathing Reset', duration: '5 min', difficulty: 'Beginner', benefit: 'Lowers Cortisol' },
        { title: 'Grounding Flow', duration: '15 min', difficulty: 'Beginner', benefit: 'Nervous System Regulation' }
    ],
    'Anxiety': [
        { title: 'Panic Relief Protocol', duration: '10 min', difficulty: 'Beginner', benefit: 'Heart Rate Deceleration' },
        { title: 'Slow Restorative', duration: '20 min', difficulty: 'Intermediate', benefit: 'Deep Muscle Relaxation' }
    ],
    'Neck Pain': [
        { title: 'Neck Relief Flow', duration: '12 min', difficulty: 'Beginner', benefit: 'Cervical Spine Mobility' },
        { title: 'Shoulder Opener', duration: '15 min', difficulty: 'Intermediate', benefit: 'Posture Correction' }
    ],
    'Focus': [
        { title: 'Clarity Sequence', duration: '10 min', difficulty: 'Intermediate', benefit: 'Cognitive Boost' },
        { title: 'Balancing Act', duration: '20 min', difficulty: 'Advanced', benefit: 'Neurological Activation' }
    ],
    'Sleep': [
        { title: 'Sleep Recovery Session', duration: '25 min', difficulty: 'Beginner', benefit: 'Melatonin Preparation' },
        { title: 'Yoga Nidra', duration: '30 min', difficulty: 'Beginner', benefit: 'Deep Conscious Rest' }
    ],
    'Fatigue': [
        { title: 'Energy Awakening', duration: '15 min', difficulty: 'Intermediate', benefit: 'Circulation Boost' },
        { title: 'Gentle Sun Salutations', duration: '10 min', difficulty: 'Beginner', benefit: 'Endorphin Release' }
    ]
};

interface SmartRecoveryPanelProps {
    onStartSession: (title: string) => void;
}

export default function SmartRecoveryPanel({ onStartSession }: SmartRecoveryPanelProps) {
    const { theme } = useAmbience();
    const [selectedSymptom, setSelectedSymptom] = useState('Stress');

    const activeRecs = RECOMMENDATIONS[selectedSymptom] || RECOMMENDATIONS['Stress'];

    const btnClass = theme === 'green' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200' :
        theme === 'lavender' ? 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200' :
        'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200';
        
    const activeBtnClass = theme === 'green' ? 'bg-emerald-600 text-white shadow-md border-emerald-600' :
        theme === 'lavender' ? 'bg-purple-600 text-white shadow-md border-purple-600' :
        'bg-rose-600 text-white shadow-md border-rose-600';

    return (
        <Card className="p-6 border shadow-sm bg-white/80 backdrop-blur">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles size={20} className="text-amber-500" />
                <h3 className="font-serif font-bold text-lg text-gray-800">Smart Recovery Recommendation</h3>
            </div>
            
            <p className="text-sm text-gray-500 mb-4 font-medium">Select your current primary symptom:</p>
            
            <div className="flex flex-wrap gap-2 mb-8">
                {SYMPTOMS.map(symp => (
                    <button
                        key={symp}
                        onClick={() => setSelectedSymptom(symp)}
                        className={cn("px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all border", 
                            selectedSymptom === symp ? activeBtnClass : btnClass
                        )}
                    >
                        {symp}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeRecs.map((rec, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <h4 className="font-serif font-bold text-lg text-gray-800">{rec.title}</h4>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-gray-200 text-gray-600 px-2 py-1 rounded-md">
                                {rec.duration}
                            </span>
                        </div>
                        <div className="flex gap-2 mb-4">
                            <span className="text-xs font-medium bg-white border px-2 py-1 rounded-md text-gray-600">{rec.difficulty}</span>
                            <span className="text-xs font-medium bg-blue-50 border border-blue-100 px-2 py-1 rounded-md text-blue-700">{rec.benefit}</span>
                        </div>
                        <Button onClick={() => onStartSession(rec.title)} variant="outline" className="w-full rounded-xl gap-2 hover:bg-gray-100">
                            <Play size={16} /> Start
                        </Button>
                    </div>
                ))}
            </div>
        </Card>
    );
}
