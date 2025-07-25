import React from 'react';
import { useData } from '../../hooks/useAppContext';
import { BrainCircuit, Loader2, BookOpen, Wrench, Award, Check } from 'lucide-react';

const CareerPlannerTab: React.FC = () => {
    const {
        careerGoal,
        setCareerGoal,
        careerRoadmap,
        careerRoadmapLoading,
        handleGenerateRoadmap,
    } = useData();

    const getIconForStep = (type: 'learn' | 'practice' | 'certify') => {
        switch (type) {
            case 'learn': return <BookOpen className="h-5 w-5" />;
            case 'practice': return <Wrench className="h-5 w-5" />;
            case 'certify': return <Award className="h-5 w-5" />;
            default: return <BookOpen className="h-5 w-5" />;
        }
    };

    return (
        <div className="glass-card p-6 rounded-xl no-hover">
            <h3 className="font-bold text-xl text-white mb-4">KI-Karriere-Planer</h3>
            <p className="text-slate-400 mb-6 text-sm">Geben Sie Ihr Karriereziel ein und lassen Sie unsere KI eine personalisierte Roadmap für Sie erstellen. Der Plan berücksichtigt Ihre bereits erworbenen Fähigkeiten.</p>

            <div className="flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    placeholder="z.B. Elektromeister werden, Spezialist für KNX, etc."
                    className="flex-grow bg-slate-800/80 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={careerRoadmapLoading}
                />
                <button
                    onClick={handleGenerateRoadmap}
                    disabled={careerRoadmapLoading || !careerGoal.trim()}
                    className="bg-blue-600 hover:bg-blue-500 transition text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center text-base disabled:bg-slate-500 disabled:cursor-not-allowed"
                >
                    {careerRoadmapLoading ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                        <BrainCircuit className="h-5 w-5 mr-2" />
                    )}
                    {careerRoadmapLoading ? 'Plane...' : 'Roadmap erstellen'}
                </button>
            </div>

            <div className="mt-8">
                {careerRoadmapLoading && (
                    <div className="text-center p-12">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto" />
                        <p className="mt-4 text-slate-300">Ihre persönliche Roadmap wird generiert...</p>
                    </div>
                )}

                {careerRoadmap && careerRoadmap.length > 0 && (
                    <div className="career-timeline">
                        {careerRoadmap.map((step, index) => (
                            <div key={index} className={`timeline-item ${step.completed ? 'completed' : ''}`}>
                                <div className="timeline-icon">
                                    {step.completed ? <Check className="h-6 w-6" /> : getIconForStep(step.type)}
                                </div>
                                <div className="bg-slate-800/60 p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-white">{step.title}</h4>
                                        <span className="text-xs font-semibold bg-slate-700 text-slate-300 px-2 py-1 rounded-full">{step.duration}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 mt-1">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!careerRoadmapLoading && !careerRoadmap && (
                    <div className="text-center p-12 border-2 border-dashed border-slate-700 rounded-xl">
                        <p className="text-slate-500">Ihre Roadmap wird hier angezeigt, nachdem Sie ein Ziel festgelegt und den Plan generiert haben.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CareerPlannerTab;
