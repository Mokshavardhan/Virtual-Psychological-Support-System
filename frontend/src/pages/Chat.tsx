import { useState, useRef, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Send, Bot, User, AlertTriangle, Activity, MessageSquarePlus } from 'lucide-react';
import { cn } from '../lib/utils';
import { sendMessage, startAssessment, submitAssessment, clearHistory, fetchHistory, type ChatResponse, type Question } from '../services/api';
import { Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAmbience } from '../context/AmbienceContext';

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'ai' | 'system';
    timestamp: Date;
    isCrisis?: boolean;
    suggestion?: {
        message: string;
        options: { label: string; type: string }[];
    };
    emergency?: {
        message: string;
        contacts: { name: string; phone: string; availability: string }[];
    };
}

interface AssessmentState {
    active: boolean;
    type: string;
    questions: Question[];
    currentQuestionIndex: number;
    answers: Record<string, number>;
}



export default function Chat() {
    const { theme } = useAmbience();
    const location = useLocation();

    const themeClass = theme === 'green' ? 'bg-emerald-50/80 border-emerald-100' :
        theme === 'lavender' ? 'bg-purple-50/80 border-purple-100' :
            'bg-rose-50/80 border-rose-100';

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            content: "Hello, I'm Vista. How are you feeling today?",
            sender: 'ai',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [assessment, setAssessment] = useState<AssessmentState>({
        active: false,
        type: '',
        questions: [],
        currentQuestionIndex: 0,
        answers: {}
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Retrieve mood context
    const getMoodContext = () => {
        const savedMood = localStorage.getItem('dailyMood');
        if (!savedMood) return '';

        const moodVal = parseInt(savedMood);
        if (moodVal >= 75) return "User is feeling great/energetic.";
        if (moodVal >= 50) return "User is feeling okay/stable.";
        if (moodVal >= 25) return "User is feeling low.";
        return "User is feeling gloomy/depressed.";
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Handle initial message from navigation (e.g., from History page) or Mood Context
    useEffect(() => {
        if (location.state?.initialMessage) {
            setInputValue(location.state.initialMessage);
            window.history.replaceState({}, document.title);
        } else if (messages.length === 1 && messages[0].sender === 'ai' && messages[0].content.startsWith("Hello, I'm Vista")) {
            // Only override default greeting if we haven't started chatting
            const moodContext = getMoodContext();
            if (moodContext) {
                let contextMsg = "Hello, I'm Vista. ";
                if (moodContext.includes("low") || moodContext.includes("gloomy")) {
                    contextMsg += "I noticed you're feeling a bit down. I'm here to listen.";
                } else if (moodContext.includes("great")) {
                    contextMsg += "You seem to be in high spirits! Want to channel that energy?";
                } else {
                    contextMsg += "How are you feeling right now?";
                }

                setMessages([{
                    id: '1',
                    content: contextMsg,
                    sender: 'ai',
                    timestamp: new Date()
                }]);
            }
        }
    }, [location]);

    useEffect(() => {
        // Only load history if explicitly requested via navigation state (e.g. from History page)
        if (location.state?.loadHistory) {
            const loadHistory = async () => {
                const history = await fetchHistory();
                if (history.length > 0) {
                    const formattedHistory: Message[] = history.map(h => ({
                        id: h.id.toString(),
                        content: h.content,
                        sender: h.role === 'ai' ? 'ai' : 'user',
                        timestamp: new Date(h.timestamp),
                        isCrisis: !!h.is_crisis
                    }));
                    if (formattedHistory.length > 0) {
                        setMessages(formattedHistory);
                    }
                }
            };
            loadHistory();
            // Clear state so refresh doesn't keep loading it if we don't want
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, assessment]);

    const handleNewChat = () => {
        setMessages([{
            id: Date.now().toString(),
            content: "Hello, I'm Vista. How are you feeling today?",
            sender: 'ai',
            timestamp: new Date(),
        }]);
        setAssessment({
            active: false,
            type: '',
            questions: [],
            currentQuestionIndex: 0,
            answers: {}
        });
        setInputValue('');
        setIsLoading(false);
        // Clear history loading state so navigation doesn't force re-load
        window.history.replaceState({}, document.title);
    };

    const handleClearHistory = async () => {
        try {
            await clearHistory();
            setMessages([
                {
                    id: Date.now().toString(),
                    content: "History cleared. How can I help you now?",
                    sender: 'system',
                    timestamp: new Date(),
                },
            ]);
        } catch (error) {
            console.error('Failed to clear history');
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userText = inputValue;
        setInputValue('');

        // Add user message
        const userMsg: Message = {
            id: Date.now().toString(),
            content: userText,
            sender: 'user',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const response = await sendMessage(userText);
            processResponse(response);
        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: Date.now().toString(),
                content: "I'm having trouble connecting right now. Please try again later.",
                sender: 'system',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const processResponse = (response: ChatResponse) => {
        // Handle Crisis
        if (response.crisis) {
            const crisisMsg: Message = {
                id: Date.now().toString(),
                content: response.reply || "Crisis detected. Please seek help immediately.",
                sender: 'ai',
                isCrisis: true,
                timestamp: new Date(),
                emergency: response.emergency
            };
            setMessages(prev => [...prev, crisisMsg]);
            return;
        }

        // Handle Normal Reply
        if (response.reply) {
            const aiMsg: Message = {
                id: Date.now().toString(),
                content: response.reply,
                sender: 'ai',
                timestamp: new Date(),
                suggestion: response.suggestion
            };
            setMessages(prev => [...prev, aiMsg]);
        }
    };

    const handleStartAssessment = async (type: string) => {
        setIsLoading(true);
        try {
            const response = await startAssessment(type);
            if (response.assessment && response.questions) {
                setAssessment({
                    active: true,
                    type: response.type || type,
                    questions: response.questions,
                    currentQuestionIndex: 0,
                    answers: {}
                });
                // Add a system message indicating assessment started
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    content: `Starting ${type.toUpperCase()} assessment...`,
                    sender: 'system',
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssessmentAnswer = async (score: number) => {
        if (!assessment.active) return;

        const currentQ = assessment.questions[assessment.currentQuestionIndex];
        const newAnswers = { ...assessment.answers, [currentQ.id]: score };

        if (assessment.currentQuestionIndex < assessment.questions.length - 1) {
            // Next question
            setAssessment(prev => ({
                ...prev,
                answers: newAnswers,
                currentQuestionIndex: prev.currentQuestionIndex + 1
            }));
        } else {
            // Submit assessment
            setIsLoading(true);
            try {
                const response = await submitAssessment(assessment.type, newAnswers, assessment.questions);
                setAssessment(prev => ({ ...prev, active: false })); // End assessment mode

                // Add result message
                if (response.reply) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        content: response.reply || "",
                        sender: 'ai',
                        timestamp: new Date()
                    }]);
                }
            } catch (error: any) {
                console.error(error);
                setAssessment(prev => ({ ...prev, active: false }));
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    content: error.message || "Failed to submit assessment.",
                    sender: 'system',
                    timestamp: new Date()
                }]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            <header className="mb-4 flex justify-between items-center text-left">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-text">Chat with Vista</h1>
                    <p className="text-muted">Your personal space for reflection.</p>
                </div>

                {/* AI Provider Toggle - Removed as per request */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNewChat}
                        title="Start New Chat"
                        className="text-primary border-primary/20 hover:bg-primary/5 flex gap-2 items-center"
                    >
                        <MessageSquarePlus size={18} />
                        <span className="hidden sm:inline">New Chat</span>
                    </Button>

                    <Button variant="ghost" size="sm" onClick={handleClearHistory} title="Clear History" className="text-muted hover:text-red-500">
                        <Trash2 size={20} />
                    </Button>
                </div>
            </header>

            <Card className={cn("flex-1 flex flex-col overflow-hidden backdrop-blur-sm shadow-sm relative transition-colors duration-500", themeClass)}>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((message) => (
                        <div key={message.id} className={cn("flex gap-4 max-w-[80%]", message.sender === 'user' ? "ml-auto flex-row-reverse" : "")}>
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                message.sender === 'ai' ? "bg-primary text-white" : message.sender === 'user' ? "bg-orange-100 text-orange-600" : "bg-gray-200 text-gray-600"
                            )}>
                                {message.sender === 'ai' ? <Bot size={16} /> : message.sender === 'user' ? <User size={16} /> : <Activity size={16} />}
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className={cn(
                                    "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                    message.sender === 'ai'
                                        ? (message.isCrisis ? "bg-red-50 text-red-800 border-red-200 border" : "bg-white text-text border border-gray-100 rounded-tl-none")
                                        : message.sender === 'user'
                                            ? "bg-primary text-white rounded-tr-none"
                                            : "bg-gray-100 text-gray-800 italic"
                                )}>
                                    {message.isCrisis && <AlertTriangle size={16} className="mb-2 inline-block mr-2" />}
                                    {message.content}
                                    {message.emergency && (
                                        <div className="mt-4 pt-4 border-t border-red-200">
                                            <p className="font-bold mb-2">{message.emergency.message}</p>
                                            <ul className="space-y-2">
                                                {message.emergency.contacts.map((contact, idx) => (
                                                    <li key={idx} className="bg-white/50 p-2 rounded flex justify-between items-center">
                                                        <span>{contact.name}</span>
                                                        <a href={`tel:${contact.phone}`} className="font-mono font-bold hover:underline">{contact.phone}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Suggestion Pills */}
                                {message.suggestion && (
                                    <div className="flex flex-col gap-2 mt-1 animate-in fade-in slide-in-from-top-2">
                                        <span className="text-xs text-muted ml-1">{message.suggestion.message}</span>
                                        <div className="flex gap-2">
                                            {message.suggestion.options.map((opt) => (
                                                <button
                                                    key={opt.type}
                                                    onClick={() => handleStartAssessment(opt.type)}
                                                    className="px-3 py-1.5 bg-white border border-primary/20 text-primary text-xs rounded-full hover:bg-primary hover:text-white transition-colors shadow-sm"
                                                    disabled={isLoading || assessment.active}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Assessment Interface Overlay/Inline */}
                    {assessment.active && (
                        <div className="my-4 mx-auto max-w-lg w-full">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-primary/10 animate-in fade-in zoom-in-95">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-bold text-primary uppercase tracking-widest">{assessment.type} Assessment</span>
                                    <span className="text-xs text-muted">{assessment.currentQuestionIndex + 1} / {assessment.questions.length}</span>
                                </div>
                                <h3 className="font-serif text-lg font-medium text-text mb-6">
                                    {assessment.questions[assessment.currentQuestionIndex].text}
                                </h3>
                                <div className="space-y-2">
                                    {assessment.questions[assessment.currentQuestionIndex].options.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleAssessmentAnswer(opt.value)}
                                            className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm text-text"
                                        >
                                            {opt.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex gap-4 max-w-[80%]">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                                <Bot size={16} />
                            </div>
                            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-1">
                                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-gray-100">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={assessment.active ? "Complete the assessment above..." : "Type your message..."}
                            className="flex-1"
                            disabled={isLoading || assessment.active}
                        />
                        <Button type="submit" size="md" className="px-4" disabled={isLoading || assessment.active}>
                            <Send size={18} />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
