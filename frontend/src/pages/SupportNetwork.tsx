import MentalHealthMap from '../components/dashboard/MentalHealthMap';
import { useAmbience } from '../context/AmbienceContext';
import { cn } from '../lib/utils';
import { HeartHandshake } from 'lucide-react';

export default function SupportNetwork() {
    const { theme } = useAmbience();

    return (
        <div className="p-8 h-full flex flex-col">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                        theme === 'green' ? 'bg-emerald-100 text-emerald-600' :
                            theme === 'lavender' ? 'bg-purple-100 text-purple-600' :
                                'bg-rose-100 text-rose-600'
                    )}>
                        <HeartHandshake size={24} />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800">
                        Support Network
                    </h1>
                </div>
                <p className="text-gray-500 max-w-2xl">
                    Find professional support, clinics, and safe spaces near you. reaching out is the first step to healing.
                </p>
            </header>

            <div className="flex-1 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/60 shadow-xl overflow-hidden p-1 min-h-[500px]">
                <div className="w-full h-full rounded-[1.3rem] overflow-hidden">
                    <MentalHealthMap />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="p-6 bg-red-50/80 backdrop-blur-md rounded-3xl border border-red-100 text-red-900">
                    <h3 className="font-serif font-bold text-xl mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-red-500 rounded-full" />
                        Emergency Helplines
                    </h3>
                    <ul className="space-y-3">
                        <li className="flex justify-between items-center p-3 bg-white/60 rounded-2xl border border-red-100 shadow-sm">
                            <span className="font-medium">Vandrevala Foundation</span>
                            <span className="font-bold text-red-600 bg-red-100 px-3 py-1 rounded-lg">9999 666 555</span>
                        </li>
                        <li className="flex justify-between items-center p-3 bg-white/60 rounded-2xl border border-red-100 shadow-sm">
                            <span className="font-medium">Aasra Helpline</span>
                            <span className="font-bold text-red-600 bg-red-100 px-3 py-1 rounded-lg">9820466726</span>
                        </li>
                        <li className="flex justify-between items-center p-3 bg-white/60 rounded-2xl border border-red-100 shadow-sm">
                            <span className="font-medium">Emergency Services</span>
                            <span className="font-bold text-red-600 bg-red-100 px-3 py-1 rounded-lg">112</span>
                        </li>
                    </ul>
                </div>

                <div className="p-6 bg-blue-50/80 backdrop-blur-md rounded-3xl border border-blue-100 text-blue-900">
                    <h3 className="font-serif font-bold text-xl mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-500 rounded-full" />
                        Community Resources
                    </h3>
                    <ul className="space-y-3">
                        <li className="flex justify-between items-center p-3 bg-white/60 rounded-2xl border border-blue-100 shadow-sm">
                            <span className="font-medium">KIRAN Mental Health</span>
                            <span className="font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-lg">1800-599-0019</span>
                        </li>
                        <li className="flex justify-between items-center p-3 bg-white/60 rounded-2xl border border-blue-100 shadow-sm">
                            <span className="font-medium">NIMHANS Helpline</span>
                            <span className="font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-lg">080-46110007</span>
                        </li>
                        <li className="flex justify-between items-center p-3 bg-white/60 rounded-2xl border border-blue-100 shadow-sm">
                            <span className="font-medium">Student Wellness</span>
                            <span className="font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-lg">Call Campus Health</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
