// Use VITE_API_URL if provided (Render), otherwise fallback to /api (Vercel/Local with proxy)
let apiUrl = import.meta.env.VITE_API_URL || '/api';

// Render's 'host' property usually returns just the domain (e.g. app.onrender.com)
// So we ensure it starts with https:// if it's not a relative path
if (apiUrl !== '/api' && !apiUrl.startsWith('http')) {
    apiUrl = `https://${apiUrl}`;
}

const API_URL = apiUrl;


export interface Question {
    id: string;
    text: string;
    options: { text: string; value: number }[];
}

export interface ChatResponse {
    reply?: string;
    crisis?: boolean;
    flags?: string[];
    suggestion?: {
        message: string;
        options: { label: string; type: string }[];
    };
    assessment?: boolean;
    type?: string;
    message?: string;
    questions?: Question[];
    assessmentComplete?: boolean;
    score?: number;
    severity?: string;
    emergency?: {
        message: string;
        contacts: { name: string; phone: string; availability: string }[];
    };
}

function getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function handleApiResponse(response: Response, defaultError: string) {
    if (!response.ok) {
        let errorMsg = defaultError;
        try {
            const data = await response.json();
            errorMsg = data.error || errorMsg;
        } catch (e) {
            // failed to parse json
        }
        throw new Error(errorMsg);
    }

    try {
        return await response.json();
    } catch (e) {
        throw new Error(defaultError + ' (Invalid data received)');
    }
}

export async function login(email: string, password: string): Promise<any> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return handleApiResponse(response, 'Login failed');
}

export async function register(name: string, email: string, password: string, additionalData?: Partial<UserProfile>): Promise<any> {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, ...additionalData })
    });
    return handleApiResponse(response, 'Registration failed');
}

export async function forgotPassword(email: string): Promise<any> {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return handleApiResponse(response, 'Failed to request password reset');
}

export async function resetPassword(email: string, otp: string, newPassword: string): Promise<any> {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
    });
    return handleApiResponse(response, 'Failed to reset password');
}


export async function loginWithGoogle(idToken: string): Promise<any> {
    const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
    });
    return handleApiResponse(response, 'Google login failed');
}

export async function loginWithGitHub(code: string): Promise<any> {
    const response = await fetch(`${API_URL}/auth/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
    });
    return handleApiResponse(response, 'GitHub login failed');
}

export async function loginWithFirebase(idToken: string, profileData?: any): Promise<any> {
    const response = await fetch(`${API_URL}/auth/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, profileData })
    });
    return handleApiResponse(response, 'Firebase authentication failed');
}

export async function sendMessage(text: string): Promise<ChatResponse> {
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                // handle unauthorized
            }
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

export async function fetchAIStatus(): Promise<{ groq: boolean; gemini: boolean }> {
    try {
        const response = await fetch(`${API_URL}/chat/status`, {
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to fetch AI status');
        return await response.json();
    } catch (error) {
        console.error('Error fetching AI status:', error);
        return { groq: false, gemini: false };
    }
}

export async function startAssessment(type: string): Promise<ChatResponse> {
    try {
        const response = await fetch(`${API_URL}/assessments/${type}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
        });

        if (!response.ok) throw new Error('Failed to start assessment');

        const data = await response.json();

        // Handle two formats:
        // 1. Old format: items are strings, global scale
        // 2. New format (daily): items have question + scale properties
        // Parse questions
        const questions = data.items.map((item: any, index: number) => {
            // Check if item is an object with 'question' field (new format)
            if (typeof item === 'object' && item.question) {
                return {
                    id: index.toString(),
                    text: item.question,
                    options: (item.scale || []).map((scalePoint: any) => ({
                        text: scalePoint.label,
                        value: scalePoint.value
                    }))
                };
            }

            // Legacy format or string scale
            let scaleOptions = [];
            if (Array.isArray(data.scale)) {
                scaleOptions = data.scale.map((s: any) => ({ text: s.label, value: s.value }));
            } else if (typeof data.scale === 'string') {
                // e.g. "0=Never, 1=Often"
                scaleOptions = data.scale.split(',').map((part: string) => {
                    const [val, label] = part.split('=').map((s: string) => s.trim());
                    return { text: label, value: parseInt(val) };
                });
            }

            return {
                id: index.toString(),
                text: item,
                options: scaleOptions
            };
        });

        return {
            assessment: true,
            type: type,
            questions
        };
    } catch (error) {
        console.error('Error starting assessment:', error);
        throw error;
    }
}

export async function submitAssessment(type: string, answers: Record<string, number>, questions?: Question[]): Promise<ChatResponse> {
    try {
        // Convert record to array of values for backend
        // Assuming keys are '0', '1', '2' indices from the questions array
        // Send object with text if questions are provided, otherwise just number for backward compatibility
        const answersArray = Object.keys(answers)
            .sort((a, b) => Number(a) - Number(b))
            .map(k => {
                if (questions) {
                    const q = questions.find(q => q.id === k);
                    return {
                        questionId: k,
                        text: q ? q.text : `Question ${k}`,
                        score: answers[k]
                    };
                }
                return answers[k];
            });

        const response = await fetch(`${API_URL}/assessments/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ type, answers: answersArray }),
        });

        if (!response.ok) throw new Error('Failed to submit assessment');

        const data = await response.json();

        // Return result as a chat reply
        return {
            reply: `Assessment complete. Your score is ${data.score}. Severity: ${data.severity}.`,
            assessmentComplete: true,
            score: data.score,
            severity: data.severity
        };
    } catch (error) {
        console.error('Error submitting assessment:', error);
        throw error;
    }
}
// ... existing exports ...

// ... existing exports ...

export interface HistoryMessage {
    id: number;
    role: 'user' | 'ai';
    content: string;
    timestamp: string;
    is_crisis: number;
}

export interface AssessmentResult {
    id: number;
    type: string;
    score: number;
    severity: string;
    answers: Record<string, number>;
    insight: string;
    timestamp: string;
}

export async function fetchHistory(): Promise<HistoryMessage[]> {
    try {
        const response = await fetch(`${API_URL}/chat/history`, {
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to fetch history');
        return await response.json();
    } catch (error) {
        console.error('Error fetching history:', error);
        return [];
    }
}

export async function clearHistory(): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/chat/history`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to clear history');
    } catch (error) {
        console.error('Error clearing history:', error);
        throw error;
    }
}

export async function fetchAssessments(): Promise<AssessmentResult[]> {
    try {
        const response = await fetch(`${API_URL}/assessments/history`, {
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to fetch assessments');
        return await response.json();
    } catch (error) {
        console.error('Error fetching assessments:', error);
        return [];
    }
}

export interface UserProfile {
    id: number | string;
    name: string;
    email: string;
    location: string;
    bio: string;
    role: string;
    hobbies: string | string[];
    likes: string | string[];
    dislikes: string | string[];
    contact_name: string;
    contact_phone: string;
}

export async function fetchUserProfile(): Promise<UserProfile> {
    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        return await response.json();
    } catch (error) {
        console.error('Error fetching profile:', error);
        return {
            id: 1,
            name: 'User',
            email: 'user@example.com',
            location: '',
            bio: '',
            role: '',
            hobbies: [],
            likes: [],
            dislikes: [],
            contact_name: '',
            contact_phone: ''
        };
    }
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(profile)
        });
        return response.ok;
    } catch (error) {
        console.error('Error updating profile:', error);
        return false;
    }
}

export interface DashboardStats {
    daysActive: number;
    avgMood: number;
    totalAssessments: number;
    history: {
        date: string;
        score: number;
        severity: string;
        type: string;
    }[];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
    try {
        const response = await fetch(`${API_URL}/dashboard/stats`, {
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        return await response.json();
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            daysActive: 1,
            avgMood: 50,
            totalAssessments: 0,
            history: []
        };
    }
}

export interface GameScoreResponse {
    earnedCoins: number;
    totalCoins: number;
    level: number;
    progress: number;
    leveledUp: boolean;
}

export async function submitGameScore(game: string, score: number): Promise<GameScoreResponse | null> {
    try {
        const response = await fetch(`${API_URL}/dashboard/game-score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ game, score })
        });
        if (!response.ok) throw new Error('Failed to submit game score');
        return await response.json();
    } catch (error) {
        console.error('Error submitting game score:', error);
        return null;
    }
}

export interface JournalEntry {
    id: string;
    title: string;
    content: string;
    mood: string;
    date: string;
    tags?: string[];
}

export async function fetchJournalEntries(): Promise<JournalEntry[]> {
    try {
        const response = await fetch(`${API_URL}/journal`, {
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to fetch journal entries');
        return await response.json();
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        return [];
    }
}

export async function createJournalEntry(entry: Partial<JournalEntry>): Promise<JournalEntry | null> {
    try {
        const response = await fetch(`${API_URL}/journal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(entry)
        });
        if (!response.ok) throw new Error('Failed to save journal entry');
        const data = await response.json();
        return data.entry;
    } catch (error) {
        return null;
    }
}

export async function updateJournalEntry(id: string, entry: Partial<JournalEntry>): Promise<JournalEntry | null> {
    try {
        const response = await fetch(`${API_URL}/journal/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(entry)
        });
        if (!response.ok) throw new Error('Failed to update journal entry');
        const data = await response.json();
        return data.entry;
    } catch (error) {
        console.error('Error updating journal entry:', error);
        throw error;
    }
}
