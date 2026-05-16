import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Brain, ArrowRight } from 'lucide-react';
import { useAmbience } from '../../context/AmbienceContext';

interface SmartJournalProps {
    onRecommendationGenerated: (rec: string) => void;
}

export default function SmartJournal({ onRecommendationGenerated }: SmartJournalProps) {
    const { theme } = useAmbience();
    const [sleep, setSleep] = useState(3);
    const [stress, setStress] = useState(3);
    const [energy, setEnergy] = useState(3);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        setSubmitted(true);
        // Smart recommendation logic
        let rec = 'Balanced Recovery Flow';
        if (sleep < 3) rec = 'Sleep Recovery Session';
        else if (stress > 3) rec = 'Panic Relief Protocol';
        else if (energy < 3) rec = 'Energy Awakening';
        else if (stress > 2 && sleep > 3) rec = 'Neck Relief Flow';
        
        onRecommendationGenerated(rec);
    };

    const accentClass = theme === 'green' ? 'bg-emerald-600 hover:bg-emerald-700' :
        theme === 'lavender' ? 'bg-purple-600 hover:bg-purple-700' :
        'bg-rose-600 hover:bg-rose-700';

    return (
        <Card className="p-6 border shadow-sm bg-white/80 backdrop-blur h-[560px] flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <Brain size={20} className="text-blue-500" />
                <h3 className="font-serif font-bold text-lg text-gray-800">Smart Journal</h3>
            </div>

            <p className="text-sm text-gray-500 mb-6 font-medium">Quick input to generate a targeted session.</p>

            <div className="space-y-6 flex-1">
                <div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                        <span>Sleep Quality</span>
                        <span>{sleep}/5</span>
                    </div>
                    <input 
                        type="range" min="1" max="5" value={sleep} onChange={(e) => setSleep(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                <div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                        <span>Stress Level</span>
                        <span>{stress}/5</span>
                    </div>
                    <input 
                        type="range" min="1" max="5" value={stress} onChange={(e) => setStress(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                </div>

                <div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                        <span>Energy Level</span>
                        <span>{energy}/5</span>
                    </div>
                    <input 
                        type="range" min="1" max="5" value={energy} onChange={(e) => setEnergy(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                </div>
            </div>

            <Button 
                onClick={handleSubmit} 
                className={`w-full mt-6 rounded-xl font-bold tracking-wide text-white ${accentClass}`}
            >
                {submitted ? 'Update Recommendation' : 'Generate Recommendation'} <ArrowRight size={16} className="ml-2" />
            </Button>
        </Card>
    );
}
