// frontend/src/components/dashboard/DailyAssessmentCard.tsx
import { Card } from '../ui/Card';
import { Activity, Calendar, Trophy, ArrowRight } from 'lucide-react';


interface DailyAssessmentCardProps {
    daysActive: number;
    avgMood: number;
    hasCompletedToday?: boolean;
    onStartAssessment: () => void;
}

export function DailyAssessmentCard({ daysActive, avgMood, hasCompletedToday, onStartAssessment }: DailyAssessmentCardProps) {

    return (
        <Card
            className={`p-6 relative overflow-hidden group transition-all border-l-4 border-l-primary hover:shadow-md cursor-pointer ${hasCompletedToday ? 'opacity-90' : ''}`}
            onClick={onStartAssessment}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity size={80} className="text-primary" />
            </div>

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-serif text-xl font-bold text-text mb-1">Daily Check-in</h3>
                    <p className="text-sm text-muted">Track your mental wellbeing</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <ArrowRight size={20} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-primary/5 p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-1 text-primary">
                        <Calendar size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Streak</span>
                    </div>
                    <p className="text-2xl font-bold text-text">{daysActive} <span className="text-xs font-normal text-muted">days</span></p>
                </div>

                <div className="bg-orange-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-1 text-orange-600">
                        <Trophy size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Avg Mood</span>
                    </div>
                    <p className="text-2xl font-bold text-text">{avgMood}%</p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-muted group-hover:text-primary transition-colors">
                {hasCompletedToday ? (
                    <span className="font-bold">✓ Completed today (Click to take again)</span>
                ) : (
                    <span>Click to start assessment</span>
                )}
            </div>
        </Card>
    );
}
