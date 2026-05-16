import { useEffect, useState } from 'react';
import MoodFlow from '../components/dashboard/MoodFlow';
import JournalCard from '../components/dashboard/JournalCard';
import MentalGarden from '../components/dashboard/MentalGarden';
import MentalFitnessQuests from '../components/games/MentalFitnessQuests';
import JamendoPlayer from '../components/dashboard/JamendoPlayer';
import { fetchAssessments, fetchUserProfile, type AssessmentResult } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DailyAssessmentCard } from '../components/dashboard/DailyAssessmentCard';
import { fetchDashboardStats, type DashboardStats } from '../services/api';
import DailyTaskModal from '../components/dashboard/DailyTaskModal';

export default function Dashboard() {
    const { user: authUser } = useAuth();
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState(authUser?.name?.split(' ')[0] || 'User');
    const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
    const [hasCompletedToday, setHasCompletedToday] = useState(false);
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        const loadData = async () => {
            // Load Dashboard Stats
            const dashboardData = await fetchDashboardStats();
            setStats(dashboardData);

            // Load Assessments
            const data = await fetchAssessments();
            setAssessments(data);
            if (data.length > 0) {
                const sorted = [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                const latest = sorted[0];

                // Check if completed today
                const today = new Date().toDateString();
                const latestDate = new Date(latest.timestamp).toDateString();
                if (latest.type === 'daily' && latestDate === today) {
                    setHasCompletedToday(true);
                }
            }

            // Load Platform Profile to ensure name is up to date
            try {
                const profile = await fetchUserProfile();
                if (profile && profile.name) {
                    setDisplayName(profile.name.split(' ')[0]);
                }
            } catch (e) {
                console.error("Could not load profile", e);
            }
        };
        loadData();
    }, []);

    return (
        <div className="p-8">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-text mb-2 animate-in fade-in slide-in-from-left-4 duration-500">
                        Welcome back, {displayName}
                    </h1>
                    <p className="text-muted">Here's your daily overview.</p>
                </div>
            </header>

            <div className="mb-8">
                <DailyAssessmentCard
                    daysActive={stats?.daysActive || 0}
                    avgMood={stats?.avgMood || 0}
                    hasCompletedToday={hasCompletedToday}
                    onStartAssessment={() => {
                        navigate('/assessment/daily');
                    }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Left Column - Mood Chart */}
                <div className="lg:col-span-2">
                    <MoodFlow assessments={assessments} />
                </div>

                {/* Right Column - Stack */}
                <div className="flex flex-col gap-6">
                    <div className="flex-1">
                        <JournalCard />
                    </div>
                    <div className="flex-1">
                        <JamendoPlayer />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MentalGarden assessments={assessments} />
                <MentalFitnessQuests />
            </div>

            <DailyTaskModal />
        </div>
    );
}
