import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ChevronRight, X, Award, FileText, Activity, MessageSquare, Bot, User, ArrowUpRight } from 'lucide-react';
import { fetchAssessments, fetchHistory, type AssessmentResult, type HistoryMessage } from '../services/api';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAmbience } from '../context/AmbienceContext';

// Questions mapping for display (simplified for demo)
const QUESTION_MAP: Record<string, string> = {
    'pss10_q1': 'Upset because of something that happened unexpectedly?',
    'pss10_q2': 'Felt that you were unable to control important things?',
    'pss10_q3': 'Felt nervous and \"stressed\"?',
    'pss10_q4': 'Felt confident about your ability to handle personal problems?',
    // Add more mappings as needed or fetch from backend ideally
};

// Answer mapping
const ANSWER_MAP: Record<number, string> = {
    0: 'Never',
    1: 'Almost Never',
    2: 'Sometimes',
    3: 'Fairly Often',
    4: 'Very Often'
};

type HistoryTab = 'assessments' | 'chats';

export default function History() {
    const { theme } = useAmbience();
    const [activeTab, setActiveTab] = useState<HistoryTab>('assessments');
    const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
    const [chatHistory, setChatHistory] = useState<HistoryMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAssessment, setSelectedAssessment] = useState<AssessmentResult | null>(null);
    const navigate = useNavigate();

    const themeClass = theme === 'green' ? 'bg-emerald-50/60 border-4 border-emerald-200 backdrop-blur-md' :
        theme === 'lavender' ? 'bg-purple-50/60 border-4 border-purple-200 backdrop-blur-md' :
            'bg-rose-50/60 border-4 border-rose-200 backdrop-blur-md';

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [assessmentsData, historyData] = await Promise.all([
                    fetchAssessments(),
                    fetchHistory()
                ]);
                setAssessments(assessmentsData);
                setChatHistory(historyData.reverse());
            } catch (error) {
                console.error('Failed to load history data');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const getTitle = (type: string) => {
        switch (type) {
            case 'pss10': return 'Stress Assessment (PSS-10)';
            case 'gad7': return 'Anxiety Screening (GAD-7)';
            case 'phq9': return 'Depression Screening (PHQ-9)';
            default: return 'Daily Check-in';
        }
    };

    // Group Chat History by Date
    const groupedChatHistory = chatHistory.reduce((groups, message) => {
        const date = new Date(message.timestamp);
        const dateKey = format(date, 'MMM d, yyyy');
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(message);
        return groups;
    }, {} as Record<string, HistoryMessage[]>);

    return (
        <div className="p-8 h-full overflow-y-auto relative">
            {/* Header ... */}
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-text mb-2">Your Journey</h1>
                    <p className="text-muted">A timeline of your mental wellness check-ins and conversations.</p>
                </div>

            </header>

            {/* Tabs ... */}
            <div className="flex gap-4 mb-8 border-b border-gray-100 pb-1">
                <button
                    onClick={() => setActiveTab('assessments')}
                    className={cn(
                        "pb-3 px-4 text-sm font-bold tracking-wide transition-all relative",
                        activeTab === 'assessments' ? "text-primary" : "text-muted hover:text-text"
                    )}
                >
                    Assessments
                    {activeTab === 'assessments' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('chats')}
                    className={cn(
                        "pb-3 px-4 text-sm font-bold tracking-wide transition-all relative",
                        activeTab === 'chats' ? "text-primary" : "text-muted hover:text-text"
                    )}
                >
                    Chat Logs
                    {activeTab === 'chats' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* ASSESSMENTS VIEW */}
                    {activeTab === 'assessments' && (
                        assessments.length === 0 ? (
                            <Card className={cn("p-12 text-center text-muted border-dashed border-2", themeClass)}>
                                <Activity size={48} className="mx-auto mb-4 opacity-30" />
                                <p>No check-ins yet. Start your first one today!</p>
                            </Card>
                        ) : (
                            <div className="space-y-4 max-w-3xl mx-auto">
                                {assessments.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="flex flex-col items-center">
                                            <div className="w-px h-full bg-gray-200 group-last:bg-transparent relative top-4" />
                                            <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-white absolute mt-6" />
                                        </div>

                                        <Card
                                            onClick={() => setSelectedAssessment(item)}
                                            className={cn(
                                                "flex-1 p-6 hover:shadow-lg transition-all cursor-pointer border-gray-100 flex items-center justify-between group-hover:-translate-y-0.5 duration-300",
                                                themeClass
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-center justify-center w-14 h-14 bg-white/50 rounded-2xl border border-gray-100">
                                                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                                                        {format(new Date(item.timestamp), 'MMM').toUpperCase()}
                                                    </span>
                                                    <span className="text-xl font-serif font-bold text-text">
                                                        {format(new Date(item.timestamp), 'd')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-text">{getTitle(item.type)}</h3>
                                                    <div className="flex gap-2 text-sm text-muted mt-0.5">
                                                        <span>{format(new Date(item.timestamp), 'h:mm a')}</span>
                                                        <span>•</span>
                                                        <span className={cn(
                                                            "font-medium",
                                                            item.severity.includes('Severe') || item.severity.includes('High') ? "text-red-500" : "text-primary"
                                                        )}>{item.severity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <ChevronRight size={20} />
                                            </div>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* CHAT LOGS VIEW */}
                    {activeTab === 'chats' && (
                        chatHistory.length === 0 ? (
                            <Card className={cn("p-12 text-center text-muted", themeClass)}>
                                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No conversation history yet.</p>
                            </Card>
                        ) : (
                            <div className="space-y-8 max-w-3xl mx-auto">
                                {Object.entries(groupedChatHistory).map(([date, messages]) => (
                                    <div key={date} className="relative">
                                        <div className="flex justify-between items-center mb-4 sticky top-0 bg-transparent py-3 z-10 -mx-2 px-2">
                                            <h3 className="text-sm font-bold text-muted uppercase tracking-wider rounded-full border border-gray-200 px-3 py-1 bg-white/80 backdrop-blur shadow-sm">
                                                {date}
                                            </h3>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate('/chat', { state: { loadHistory: true } })}
                                                className="text-primary hover:bg-primary/10 gap-1 text-xs font-bold bg-white/50"
                                            >
                                                Continue Chat <ArrowUpRight size={14} />
                                            </Button>
                                        </div>

                                        <div className="space-y-4 pl-4 border-l-2 border-gray-200 ml-4 pb-8">
                                            {messages.map((msg) => (
                                                <Card key={msg.id} className={cn(
                                                    "p-4 transition-all hover:shadow-md border-l-4 relative",
                                                    msg.role === 'ai' ? cn("border-l-primary", themeClass) : "border-l-orange-400 bg-orange-50/80 backdrop-blur-sm"
                                                )}>
                                                    <div className="absolute -left-[21px] top-6 w-3 h-3 rounded-full bg-gray-200 border-2 border-white ring-1 ring-gray-100" />
                                                    <div className="flex gap-4">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                                            msg.role === 'ai' ? "bg-primary text-white" : "bg-orange-100 text-orange-600"
                                                        )}>
                                                            {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="font-bold text-sm text-text">
                                                                    {msg.role === 'ai' ? 'Vista' : 'You'}
                                                                </span>
                                                                <span className="text-xs text-muted font-mono">
                                                                    {format(new Date(msg.timestamp), 'h:mm a')}
                                                                </span>
                                                            </div>
                                                            <p className="text-text leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                            {!!msg.is_crisis && (
                                                                <Badge variant="soft" className="mt-2 bg-red-100 text-red-700 border-red-200">
                                                                    Crisis Detected
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </>
            )}

            {/* Details Modal */}
            <AnimatePresence>
                {selectedAssessment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedAssessment(null)}
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden relative z-10 flex flex-col"
                        >
                            <div className="p-8 border-b border-gray-100 flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-serif font-bold text-text mb-1">Session Details</h2>
                                    <p className="text-muted">{format(new Date(selectedAssessment.timestamp), 'MMMM d, yyyy, h:mm a')}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedAssessment(null)} className="rounded-full w-10 h-10 p-0">
                                    <X size={20} />
                                </Button>
                            </div>

                            <div className="p-8 overflow-y-auto space-y-8">
                                {/* AI Insights */}
                                <div className="bg-[#f0fdf4] border border-green-100 rounded-2xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full blur-3xl -mr-10 -mt-10" />
                                    <div className="flex items-center gap-2 mb-4 text-green-700 font-bold text-sm uppercase tracking-wider">
                                        <Award size={16} /> SAI Insights
                                    </div>
                                    <p className="text-green-900 leading-relaxed font-medium">
                                        {selectedAssessment.insight ? selectedAssessment.insight.replace(/System Prompt:|User:|AI:/g, '').trim() : "No AI insights available for this session."}
                                    </p>
                                </div>

                                {/* Responses */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4 text-muted font-bold text-sm uppercase tracking-wider">
                                        <FileText size={16} /> Your Responses
                                    </div>
                                    <div className="space-y-3">
                                        {Object.entries(selectedAssessment.answers).map(([idx, val]) => {
                                            let text = `Question ${Number(idx) + 1}`;
                                            let score = val;

                                            // If the value is an object (new format), use its text and score
                                            if (typeof val === 'object' && val !== null) {
                                                text = (val as any).text || text;
                                                score = (val as any).score;
                                            } else if (QUESTION_MAP[idx]) {
                                                // Fallback to static QUESTION_MAP for old string keys if they somehow exist
                                                text = QUESTION_MAP[idx];
                                            }

                                            return (
                                                <div key={idx} className="p-4 bg-gray-50 rounded-2xl">
                                                    <p className="font-medium text-text text-sm mb-2">
                                                        {text}
                                                    </p>
                                                    <p className="font-bold text-primary">
                                                        {score as number} - {ANSWER_MAP[score as number] || 'N/A'}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center group">
                                <Button
                                    onClick={() => navigate('/chat', {
                                        state: { initialMessage: `I'd like to discuss my ${getTitle(selectedAssessment.type)} result from ${format(new Date(selectedAssessment.timestamp), 'MMMM d')}...` }
                                    })}
                                    className="bg-primary/90 hover:bg-primary text-white gap-2 pl-4 pr-6 rounded-xl"
                                >
                                    <MessageSquare size={18} />
                                    Discuss with Vista
                                </Button>
                                <Button onClick={() => setSelectedAssessment(null)} variant="ghost" className="">
                                    Close
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}



