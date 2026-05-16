import { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, X, Clock, Flame, ChevronRight } from 'lucide-react';

interface RuntimePlayerProps {
    sessionTitle: string;
    onClose: () => void;
}

// Real free yoga pose images (Wikimedia Commons - no API key needed)
// Each pose has one image per step
const POSE_LIBRARY: Record<string, { stepImages: string[]; steps: string[]; benefit: string }> = {
    'Child Pose': {
        stepImages: [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Balasana_%28Child%27s_Pose%29.jpg/640px-Balasana_%28Child%27s_Pose%29.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Balasana_%28Child%27s_Pose%29.jpg/640px-Balasana_%28Child%27s_Pose%29.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Balasana_%28Child%27s_Pose%29.jpg/640px-Balasana_%28Child%27s_Pose%29.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Balasana_%28Child%27s_Pose%29.jpg/640px-Balasana_%28Child%27s_Pose%29.jpg',
        ],
        steps: [
            'Kneel on the floor, touch big toes together and sit on your heels',
            'Separate your knees hip-width apart and exhale slowly',
            'Lay your torso down between your thighs, arms extended forward',
            'Breathe deeply, feeling the spine lengthen with each breath',
        ],
        benefit: 'Releases tension in the lower back, hips and thighs'
    },
    'Cat-Cow Stretch': {
        stepImages: [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Marjariasana.jpg/640px-Marjariasana.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Cow_Pose_Yoga_Bitilasana.jpg/640px-Cow_Pose_Yoga_Bitilasana.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Marjariasana.jpg/640px-Marjariasana.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Cow_Pose_Yoga_Bitilasana.jpg/640px-Cow_Pose_Yoga_Bitilasana.jpg',
        ],
        steps: [
            'Start on hands and knees, wrists below shoulders, knees below hips',
            'Inhale: drop belly, lift tailbone and chest (Cow)',
            'Exhale: round spine toward ceiling, tuck chin to chest (Cat)',
            'Flow between positions in rhythm with your breath',
        ],
        benefit: 'Improves spinal flexibility and relieves back pain'
    },
    'Downward Dog': {
        stepImages: [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Marjariasana.jpg/640px-Marjariasana.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Adho_Mukha_Svanasana_Yoga-Asana_Nina-Mel.jpg/640px-Adho_Mukha_Svanasana_Yoga-Asana_Nina-Mel.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Adho_Mukha_Svanasana_Yoga-Asana_Nina-Mel.jpg/640px-Adho_Mukha_Svanasana_Yoga-Asana_Nina-Mel.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Adho_Mukha_Svanasana_Yoga-Asana_Nina-Mel.jpg/640px-Adho_Mukha_Svanasana_Yoga-Asana_Nina-Mel.jpg',
        ],
        steps: [
            'Start on all fours, tuck toes under and lift knees',
            'Press hips up and back, straightening your legs as much as possible',
            'Press hands into mat, rotate upper arms outward',
            'Hold for 5 breaths, pedaling heels alternately to stretch calves',
        ],
        benefit: 'Energizes the body and stretches the entire back of the legs'
    },
    'Cobra Pose': {
        stepImages: [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Shavasana_%28Yoga%29.jpg/640px-Shavasana_%28Yoga%29.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Shavasana_%28Yoga%29.jpg/640px-Shavasana_%28Yoga%29.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Bhujangasana_Yoga-Asana_Nina-Mel.jpg/640px-Bhujangasana_Yoga-Asana_Nina-Mel.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Bhujangasana_Yoga-Asana_Nina-Mel.jpg/640px-Bhujangasana_Yoga-Asana_Nina-Mel.jpg',
        ],
        steps: [
            'Lie face down, legs extended, tops of feet on floor',
            'Place hands beneath shoulders, elbows close to body',
            'On inhale, lift chest off floor using back muscles, not just arms',
            'Keep shoulders relaxed, hold for 3-5 breaths, then release',
        ],
        benefit: 'Strengthens the spine and opens the chest and shoulders'
    },
    'Corpse Pose (Savasana)': {
        stepImages: [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Shavasana_%28Yoga%29.jpg/640px-Shavasana_%28Yoga%29.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Shavasana_%28Yoga%29.jpg/640px-Shavasana_%28Yoga%29.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Shavasana_%28Yoga%29.jpg/640px-Shavasana_%28Yoga%29.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Shavasana_%28Yoga%29.jpg/640px-Shavasana_%28Yoga%29.jpg',
        ],
        steps: [
            'Lie flat on your back, arms slightly away from body, palms up',
            'Close your eyes and let your feet fall open naturally',
            'Relax every muscle progressively from feet to face',
            'Breathe naturally, allow mind to become quiet and still',
        ],
        benefit: 'Deeply relaxes the nervous system and integrates your practice'
    },
    'Mountain Pose': {
        stepImages: [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Tadasana_Yoga-Asana_Nina-Mel.jpg/640px-Tadasana_Yoga-Asana_Nina-Mel.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Tadasana_Yoga-Asana_Nina-Mel.jpg/640px-Tadasana_Yoga-Asana_Nina-Mel.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Tadasana_Yoga-Asana_Nina-Mel.jpg/640px-Tadasana_Yoga-Asana_Nina-Mel.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Tadasana_Yoga-Asana_Nina-Mel.jpg/640px-Tadasana_Yoga-Asana_Nina-Mel.jpg',
        ],
        steps: [
            'Stand with feet together, big toes touching',
            'Distribute weight evenly across all four corners of each foot',
            'Engage thighs, draw belly in slightly, lengthen spine',
            'Arms at sides, palms forward, breathe steadily',
        ],
        benefit: 'Improves posture and builds full-body awareness'
    },
    'Neck Rolls': {
        stepImages: [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Tadasana_Yoga-Asana_Nina-Mel.jpg/640px-Tadasana_Yoga-Asana_Nina-Mel.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Tadasana_Yoga-Asana_Nina-Mel.jpg/640px-Tadasana_Yoga-Asana_Nina-Mel.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Tadasana_Yoga-Asana_Nina-Mel.jpg/640px-Tadasana_Yoga-Asana_Nina-Mel.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Tadasana_Yoga-Asana_Nina-Mel.jpg/640px-Tadasana_Yoga-Asana_Nina-Mel.jpg',
        ],
        steps: [
            'Sit comfortably with a straight spine',
            'Gently drop your right ear toward right shoulder',
            'Slowly roll chin to chest, then left ear to left shoulder',
            'Continue slow rolling, breathing deeply throughout',
        ],
        benefit: 'Releases neck and upper shoulder tension'
    },
    'Eagle Arms': {
        stepImages: [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Tadasana_Yoga-Asana_Nina-Mel.jpg/640px-Tadasana_Yoga-Asana_Nina-Mel.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Tadasana_Yoga-Asana_Nina-Mel.jpg/640px-Tadasana_Yoga-Asana_Nina-Mel.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Tadasana_Yoga-Asana_Nina-Mel.jpg/640px-Tadasana_Yoga-Asana_Nina-Mel.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Tadasana_Yoga-Asana_Nina-Mel.jpg/640px-Tadasana_Yoga-Asana_Nina-Mel.jpg',
        ],
        steps: [
            'Extend both arms to the sides at shoulder height',
            'Cross right arm over left, bend elbows and wrap forearms',
            'Lift elbows while dropping shoulders away from ears',
            'Hold for 5 breaths then switch sides',
        ],
        benefit: 'Opens upper back and stretches shoulders deeply'
    },
    'Supported Bridge': {
        stepImages: [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Shavasana_%28Yoga%29.jpg/640px-Shavasana_%28Yoga%29.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Bhujangasana_Yoga-Asana_Nina-Mel.jpg/640px-Bhujangasana_Yoga-Asana_Nina-Mel.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Bhujangasana_Yoga-Asana_Nina-Mel.jpg/640px-Bhujangasana_Yoga-Asana_Nina-Mel.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Shavasana_%28Yoga%29.jpg/640px-Shavasana_%28Yoga%29.jpg',
        ],
        steps: [
            'Lie on back, knees bent, feet flat on floor hip-width apart',
            'Press feet into floor and lift hips toward ceiling',
            'Clasp hands beneath pelvis and press arms into mat',
            'Hold for 5-8 breaths, then slowly lower spine down',
        ],
        benefit: 'Opens the chest and stretches hip flexors'
    },
};

const getFallbackPoses = (sessionTitle: string) => {
    const defaultPoses = [
        { name: 'Child Pose', duration: 45 },
        { name: 'Cat-Cow Stretch', duration: 60 },
        { name: 'Downward Dog', duration: 45 },
        { name: 'Cobra Pose', duration: 30 },
        { name: 'Corpse Pose (Savasana)', duration: 90 },
    ];

    // Customize by session type
    if (sessionTitle.toLowerCase().includes('neck')) {
        return [
            { name: 'Neck Rolls', duration: 60 },
            { name: 'Eagle Arms', duration: 45 },
            { name: 'Child Pose', duration: 60 },
            { name: 'Corpse Pose (Savasana)', duration: 90 },
        ];
    }
    if (sessionTitle.toLowerCase().includes('sleep')) {
        return [
            { name: 'Child Pose', duration: 90 },
            { name: 'Supported Bridge', duration: 60 },
            { name: 'Corpse Pose (Savasana)', duration: 120 },
        ];
    }
    if (sessionTitle.toLowerCase().includes('cobra') || sessionTitle.toLowerCase().includes('back')) {
        return [
            { name: 'Cat-Cow Stretch', duration: 60 },
            { name: 'Cobra Pose', duration: 45 },
            { name: 'Child Pose', duration: 60 },
            { name: 'Corpse Pose (Savasana)', duration: 90 },
        ];
    }

    return defaultPoses;
};

export default function RuntimePlayer({ sessionTitle, onClose }: RuntimePlayerProps) {
    const poses = getFallbackPoses(sessionTitle);

    const [isPlaying, setIsPlaying] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeftInPose, setTimeLeftInPose] = useState(poses[0].duration);
    const [totalElapsed, setTotalElapsed] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);

    const currentPose = poses[currentIndex];
    const poseData = POSE_LIBRARY[currentPose.name];
    const totalDuration = poses.reduce((acc, p) => acc + p.duration, 0);

    // Current step image (changes as steps advance)
    const currentStepImage = poseData?.stepImages?.[currentStep] ?? null;

    // Load progress
    useEffect(() => {
        const saved = localStorage.getItem(`yoga_session_${sessionTitle}`);
        if (saved) {
            try {
                const { savedIndex, savedElapsed } = JSON.parse(saved);
                if (savedIndex < poses.length) {
                    setCurrentIndex(savedIndex);
                    setTotalElapsed(savedElapsed);
                    setTimeLeftInPose(poses[savedIndex].duration);
                }
            } catch (e) {}
        }
    }, [sessionTitle]);

    // Save progress
    useEffect(() => {
        if (totalElapsed > 0) {
            localStorage.setItem(`yoga_session_${sessionTitle}`, JSON.stringify({
                savedIndex: currentIndex,
                savedElapsed: totalElapsed
            }));
        }
    }, [totalElapsed, currentIndex, sessionTitle]);

    // Auto-advance steps during pose
    useEffect(() => {
        if (!poseData) return;
        const stepInterval = Math.floor(currentPose.duration / poseData.steps.length);
        const stepNum = Math.min(
            Math.floor((currentPose.duration - timeLeftInPose) / stepInterval),
            poseData.steps.length - 1
        );
        setCurrentStep(stepNum);
    }, [timeLeftInPose, currentPose.duration, poseData]);

    // Engine
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (isPlaying) {
            timer = setInterval(() => {
                setTotalElapsed(p => p + 1);
                setTimeLeftInPose(p => {
                    if (p <= 1) {
                        if (currentIndex < poses.length - 1) {
                            setCurrentIndex(c => c + 1);
                            return poses[currentIndex + 1].duration;
                        } else {
                            setIsPlaying(false);
                            localStorage.removeItem(`yoga_session_${sessionTitle}`);
                            return 0;
                        }
                    }
                    return p - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isPlaying, currentIndex]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const nextPose = () => {
        if (currentIndex < poses.length - 1) {
            const next = currentIndex + 1;
            setCurrentIndex(next);
            setTimeLeftInPose(poses[next].duration);
        }
    };

    const prevPose = () => {
        if (currentIndex > 0) {
            const prev = currentIndex - 1;
            setCurrentIndex(prev);
            setTimeLeftInPose(poses[prev].duration);
        }
    };

    const progressPercent = (totalElapsed / totalDuration) * 100;
    const calories = Math.round((totalElapsed / 60) * 4);
    const circumference = 2 * Math.PI * 120;
    const dashOffset = circumference - (circumference * (timeLeftInPose / currentPose.duration));

    return (
        <div className="fixed inset-0 z-50 bg-[#0f172a] text-white flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="p-4 px-6 flex justify-between items-center bg-white/5 border-b border-white/10 shrink-0">
                <div>
                    <h2 className="font-serif font-bold text-lg">{sessionTitle}</h2>
                    <p className="text-xs text-gray-400 flex gap-4 mt-0.5">
                        <span className="flex items-center gap-1"><Clock size={11} /> {formatTime(totalElapsed)} / {formatTime(totalDuration)}</span>
                        <span className="flex items-center gap-1"><Flame size={11} className="text-orange-400" /> {calories} kcal</span>
                        <span className="text-gray-500">Pose {currentIndex + 1} of {poses.length}</span>
                    </p>
                </div>
                <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Main Area — image left, steps right */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left: Pose Image + Timer */}
                <div className="md:w-1/2 relative flex flex-col items-center justify-center bg-[#0a0f1e] p-8">
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent pointer-events-none" />

                    {/* Pose image in a circle with SVG timer ring */}
                    <div className="relative w-64 h-64 mb-6">
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 260 260">
                            <circle cx="130" cy="130" r="120" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="6" />
                            <circle
                                cx="130" cy="130" r="120"
                                fill="none"
                                stroke="#60a5fa"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={dashOffset}
                                className="transition-all duration-1000 linear"
                            />
                        </svg>

                        {/* Image inside circle */}
                        {poseData && (
                            <img
                                key={`${currentPose.name}-step-${currentStep}`}
                                src={currentStepImage || ''}
                                alt={`Step ${currentStep + 1} of ${currentPose.name}`}
                                className="absolute inset-3 w-[calc(100%-24px)] h-[calc(100%-24px)] rounded-full object-cover animate-in fade-in duration-700"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/256x256/1e293b/60a5fa?text=Yoga'; }}
                            />
                        )}

                        {/* Countdown badge */}
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full font-mono font-bold text-lg shadow-lg shadow-blue-900/50 border border-blue-500">
                            {formatTime(timeLeftInPose)}
                        </div>
                    </div>

                    <h1 className="text-3xl font-serif font-bold text-center mt-4 mb-1">{currentPose.name}</h1>
                    {poseData && <p className="text-xs text-blue-300 text-center max-w-xs">{poseData.benefit}</p>}

                    {/* Up Next */}
                    {currentIndex < poses.length - 1 && (
                        <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 bg-white/5 px-4 py-2 rounded-full">
                            <span>Up next:</span>
                            <span className="text-white font-semibold">{poses[currentIndex + 1].name}</span>
                            <ChevronRight size={12} />
                        </div>
                    )}
                    {currentIndex === poses.length - 1 && timeLeftInPose <= 10 && (
                        <div className="mt-6 text-xs text-emerald-400 font-bold animate-pulse">
                            🎉 Final Pose — Session almost complete!
                        </div>
                    )}
                </div>

                {/* Right: Step-by-Step Instructions */}
                <div className="md:w-1/2 p-8 flex flex-col justify-center bg-[#111827] border-l border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-6">Step-by-Step Guide</p>

                    {poseData ? (
                        <div className="space-y-4">
                            {poseData.steps.map((step, i) => (
                                <div
                                    key={i}
                                    className={`flex gap-4 p-4 rounded-2xl transition-all duration-700 ${i === currentStep
                                        ? 'bg-blue-600/20 border border-blue-500/40 scale-[1.02]'
                                        : i < currentStep
                                            ? 'opacity-40'
                                            : 'opacity-60'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${i === currentStep
                                        ? 'bg-blue-500 text-white shadow-[0_0_12px_rgba(96,165,250,0.5)]'
                                        : i < currentStep
                                            ? 'bg-emerald-500/30 text-emerald-400'
                                            : 'bg-white/10 text-gray-400'
                                        }`}>
                                        {i < currentStep ? '✓' : i + 1}
                                    </div>
                                    <p className={`text-sm leading-relaxed pt-1 ${i === currentStep ? 'text-white font-medium' : 'text-gray-400'}`}>
                                        {step}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic text-sm">Follow the visual and breathe deeply throughout this pose.</p>
                    )}

                    {/* Pose Strip */}
                    <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
                        {poses.map((p, i) => (
                            <button
                                key={i}
                                onClick={() => { setCurrentIndex(i); setTimeLeftInPose(p.duration); }}
                                className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${i === currentIndex
                                    ? 'bg-blue-600 text-white'
                                    : i < currentIndex
                                        ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {i < currentIndex ? '✓ ' : ''}{p.name.split(' ').slice(0, 2).join(' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Player Controls */}
            <div className="bg-[#0f172a] border-t border-white/10 p-4 px-6 shrink-0">
                <div className="w-full flex items-center gap-3 mb-4">
                    <span className="text-xs font-mono text-gray-500 w-10">{formatTime(totalElapsed)}</span>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-1000 linear" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <span className="text-xs font-mono text-gray-500 w-10 text-right">{formatTime(totalDuration)}</span>
                </div>

                <div className="flex items-center justify-center gap-10">
                    <button onClick={prevPose} disabled={currentIndex === 0} className="p-2 text-gray-400 hover:text-white disabled:opacity-20 transition-colors">
                        <SkipBack size={22} fill="currentColor" />
                    </button>

                    <button onClick={() => setIsPlaying(!isPlaying)} className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl">
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                    </button>

                    <button onClick={nextPose} disabled={currentIndex === poses.length - 1} className="p-2 text-gray-400 hover:text-white disabled:opacity-20 transition-colors">
                        <SkipForward size={22} fill="currentColor" />
                    </button>
                </div>
            </div>
        </div>
    );
}
