import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Download, FileText, CheckCircle2 } from 'lucide-react';
import { useAmbience } from '../../context/AmbienceContext';
import { useMemo } from 'react';

import type { AssessmentResult } from '../../services/api';

interface WellnessReportProps {
    assessments?: AssessmentResult[];
}

export default function WellnessReportGenerator({ assessments = [] }: WellnessReportProps) {
    const { theme } = useAmbience();
    
    const stats = useMemo(() => {
        const daily = assessments.filter(a => a.type === 'daily');
        const totalSessions = daily.length > 0 ? daily.length : 8; // fallback to 8 if no data
        const mins = totalSessions * 20; // estimate 20 min per session
        return { totalSessions, mins };
    }, [assessments]);
    
    const handleDownload = () => {
        window.print();
    };

    return (
        <Card className="p-8 border shadow-sm bg-white/80 backdrop-blur relative overflow-hidden print-area">
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none opacity-50 ${theme === 'green' ? 'bg-emerald-300' : theme === 'lavender' ? 'bg-purple-300' : 'bg-rose-300'}`} />

            <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme === 'green' ? 'bg-emerald-100 text-emerald-600' : theme === 'lavender' ? 'bg-purple-100 text-purple-600' : 'bg-rose-100 text-rose-600'}`}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 className="font-serif font-bold text-xl text-gray-800">Weekly Wellness Report</h3>
                        <p className="text-sm text-gray-500 font-mono">Oct 16 - Oct 22, 2026</p>
                    </div>
                </div>
                
                <Button onClick={handleDownload} variant="outline" className="gap-2 rounded-xl hidden sm:flex border-gray-200 shadow-sm print:hidden">
                    <Download size={16} /> Export PDF
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="bg-white/50 p-6 rounded-3xl border border-white space-y-5">
                    <h4 className="text-xs uppercase font-bold tracking-widest text-gray-400 border-b pb-3">Clinical Outcomes</h4>
                    
                    <div className="flex items-start gap-4">
                        <CheckCircle2 size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-bold text-gray-800 text-sm">Stress Reduced by 18%</p>
                            <p className="text-xs text-gray-500 leading-relaxed mt-1">Consistent daily practice has lowered baseline cortisol levels markers.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                        <CheckCircle2 size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-bold text-gray-800 text-sm">Highest Mood: Thursday</p>
                            <p className="text-xs text-gray-500 leading-relaxed mt-1">Post-session mood peaked after the 'Panic Relief Protocol'.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/50 p-6 rounded-3xl border border-white space-y-5">
                    <h4 className="text-xs uppercase font-bold tracking-widest text-gray-400 border-b pb-3">Activity Summary</h4>
                    
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                        <span className="font-medium text-gray-600 text-sm">Total Sessions</span>
                        <span className="font-mono font-bold text-xl text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">{stats.totalSessions}</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                        <span className="font-medium text-gray-600 text-sm">Minutes Practiced</span>
                        <span className="font-mono font-bold text-xl text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{stats.mins}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h5 className="font-bold text-gray-800 text-sm">Suggested Next Week Plan</h5>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm">Focus on Sleep Recovery flows before bed to address the lingering fatigue markers.</p>
                </div>
                <Button onClick={handleDownload} className="w-full sm:w-auto sm:hidden gap-2 rounded-xl bg-gray-900 text-white">
                    <Download size={16} /> Download
                </Button>
            </div>
        </Card>
    );
}
