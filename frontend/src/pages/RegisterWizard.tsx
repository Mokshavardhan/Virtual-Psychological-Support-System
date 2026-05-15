import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Check, User, Heart, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginWithFirebase, type UserProfile } from '../services/api';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useAmbience } from '../context/AmbienceContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

const STEPS = [
    { id: 1, title: 'Identity', icon: User, desc: 'Who are you?' },
    { id: 2, title: 'Persona', icon: Sparkles, desc: 'Your vibe' },
    { id: 3, title: 'Interests', icon: Heart, desc: 'What you love' },
    { id: 4, title: 'Safety', icon: Shield, desc: 'Stay safe' }
];

export default function RegisterWizard() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { gradientStyle } = useAmbience();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Member',
        location: '',
        bio: '',
        hobbies: '', // string for input, will convert to array
        likes: '',
        dislikes: '',
        contact_name: '',
        contact_phone: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateStep = (currentStep: number) => {
        setError('');
        if (currentStep === 1) {
            if (!formData.name || !formData.email || !formData.password) return 'Please fill in all required fields.';
            if (formData.password !== formData.confirmPassword) return 'Passwords do not match.';
            if (formData.password.length < 6) return 'Password must be at least 6 characters.';
        }
        return '';
    };

    const nextStep = () => {
        const err = validateStep(step);
        if (err) {
            setError(err);
            return;
        }
        if (step < 4) setStep(step + 1);
    };

    const prevStep = () => {
        setError('');
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');

        try {
            // 1. Create user in Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const firebaseUser = userCredential.user;

            // 2. Update Firebase display name
            await updateProfile(firebaseUser, { displayName: formData.name });

            // 3. Get ID Token
            const idToken = await firebaseUser.getIdToken();

            // 4. Prepare profile data for backend
            const profileData: Partial<UserProfile> = {
                role: formData.role,
                location: formData.location,
                bio: formData.bio,
                hobbies: formData.hobbies.split(',').map(s => s.trim()).filter(Boolean),
                likes: formData.likes.split(',').map(s => s.trim()).filter(Boolean),
                dislikes: formData.dislikes.split(',').map(s => s.trim()).filter(Boolean),
                contact_name: formData.contact_name,
                contact_phone: formData.contact_phone
            };

            // 5. Sync with backend
            const response = await loginWithFirebase(idToken, profileData);
            login(response.token, response.user);
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Registration error:', err);
            let message = 'Registration failed';
            if (err.code === 'auth/email-already-in-use') message = 'Email already exists';
            if (err.code === 'auth/invalid-email') message = 'Invalid email address';
            if (err.code === 'auth/weak-password') message = 'Password is too weak';
            setError(err.message || message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={gradientStyle} className="min-h-screen flex items-center justify-center p-4 font-sans transition-all duration-1000">
            <Card className="w-full max-w-2xl overflow-hidden relative border-0 shadow-2xl">
                {/* Progress Bar */}
                <div className="bg-gray-100 h-1.5 w-full absolute top-0 left-0">
                    <div
                        className="bg-primary h-full transition-all duration-500 ease-out"
                        style={{ width: `${(step / 4) * 100}%` }}
                    />
                </div>

                <div className="flex flex-col md:flex-row h-full md:min-h-[500px]">
                    {/* Sidebar / Steps Indicator */}
                    <div className="bg-gray-50/50 p-8 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-between">
                        <div>
                            <Link to="/" className="flex items-center gap-2 mb-8 group">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-sm transition-transform group-hover:scale-110">
                                    V
                                </div>
                                <span className="font-serif font-bold text-xl text-text">Vista</span>
                            </Link>

                            <div className="space-y-6">
                                {STEPS.map((s) => {
                                    const isActive = step === s.id;
                                    const isCompleted = step > s.id;
                                    return (
                                        <div key={s.id} className={`flex items-center gap-4 transition-all duration-300 ${isActive ? 'translate-x-2' : 'opacity-60'}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : isCompleted ? 'border-primary/50 text-primary bg-primary/10' : 'border-gray-200 text-gray-300'}`}>
                                                {isCompleted ? <Check size={18} /> : <s.icon size={18} />}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${isActive ? 'text-text' : 'text-muted'}`}>{s.title}</p>
                                                <p className="text-xs text-muted hidden md:block">{s.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="text-xs text-muted mt-8 md:mt-0">
                            Already have an account? <Link to="/auth" className="text-primary font-bold hover:underline">Log in</Link>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="p-8 md:p-12 flex-1 flex flex-col">
                        <div className="flex-1">
                            <h2 className="text-3xl font-serif font-bold text-text mb-2 animate-in slide-in-from-bottom-2 fade-in duration-500">
                                {STEPS[step - 1].title}
                            </h2>
                            <p className="text-muted mb-8 animate-in slide-in-from-bottom-3 fade-in duration-700">
                                {step === 1 && "Let's get the basics down."}
                                {step === 2 && "Tell us a bit about who you are."}
                                {step === 3 && "What makes you tick?"}
                                {step === 4 && "Just in case. We value your safety."}
                            </p>

                            {error && (
                                <div className="p-3 mb-6 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2 animate-in shake">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 key={step}"> {/* Key forces re-render for animation */}
                                {step === 1 && (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-text ml-1">Full Name *</label>
                                            <Input name="name" placeholder="Obito Uchiha" value={formData.name} onChange={handleChange} autoFocus />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-text ml-1">Email Address *</label>
                                            <Input name="email" type="email" placeholder="obito@example.com" value={formData.email} onChange={handleChange} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-text ml-1">Password *</label>
                                                <Input name="password" type="password" placeholder="••••••" value={formData.password} onChange={handleChange} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-text ml-1">Confirm *</label>
                                                <Input name="confirmPassword" type="password" placeholder="••••••" value={formData.confirmPassword} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {step === 2 && (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-text ml-1">Role / Occupation</label>
                                            <Input name="role" placeholder="Student, Artist, Developer..." value={formData.role} onChange={handleChange} autoFocus />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-text ml-1">Location</label>
                                            <Input name="location" placeholder="City, Country" value={formData.location} onChange={handleChange} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-text ml-1">Short Bio</label>
                                            <textarea
                                                name="bio"
                                                className="w-full flex min-h-[100px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-primary/50 focus:bg-white resize-none"
                                                placeholder="I love plants and philosophy..."
                                                value={formData.bio}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </>
                                )}

                                {step === 3 && (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-text ml-1">Hobbies</label>
                                            <Input name="hobbies" placeholder="Reading, Gaming, Hiking (comma separated)" value={formData.hobbies} onChange={handleChange} autoFocus />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-text ml-1">Likes <span className="text-primary">♥</span></label>
                                            <Input name="likes" placeholder="Rain, Jazz, Coffee" value={formData.likes} onChange={handleChange} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-text ml-1">Dislikes</label>
                                            <Input name="dislikes" placeholder="Loud noises, Crowds" value={formData.dislikes} onChange={handleChange} />
                                        </div>
                                    </>
                                )}

                                {step === 4 && (
                                    <>
                                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 mb-4 text-sm text-orange-800 flex gap-3">
                                            <Shield className="shrink-0 text-orange-500" size={20} />
                                            <p>This information is only used in case of a detected crisis during your sessions. It is optional.</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-text ml-1">Emergency Contact Name</label>
                                            <Input name="contact_name" placeholder="Parent, Guardian, Friend" value={formData.contact_name} onChange={handleChange} autoFocus />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-text ml-1">Emergency Contact Phone</label>
                                            <Input name="contact_phone" placeholder="+1 234 567 8900" value={formData.contact_phone} onChange={handleChange} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                disabled={step === 1 || isLoading}
                                className={step === 1 ? 'invisible' : ''}
                            >
                                Back
                            </Button>

                            {step < 4 ? (
                                <Button onClick={nextStep} className="gap-2">
                                    Next Step <ChevronRight size={16} />
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={isLoading} className="gap-2 min-w-[140px]">
                                    {isLoading ? 'Creating...' : 'Create Vista'} <Sparkles size={16} />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
