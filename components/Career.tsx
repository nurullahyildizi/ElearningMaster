import React, { useState } from 'react';
import { useData } from '../hooks/useAppContext';
import CompetencyAnalysisTab from './career/CompetencyAnalysisTab';
import CareerPlannerTab from './career/CareerPlannerTab';
import ApplicationCoachTab from './career/ApplicationCoachTab';
import { Target, ListChecks, GraduationCap } from 'lucide-react';

type CareerTab = 'analysis' | 'planner' | 'coach';

const Career: React.FC = () => {
    const [activeTab, setActiveTab] = useState<CareerTab>('analysis');

    const tabs = [
        { id: 'analysis', label: 'Kompetenz-Analyse', icon: Target },
        { id: 'planner', label: 'Karriere-Planer', icon: ListChecks },
        { id: 'coach', label: 'Bewerbungs-Coach', icon: GraduationCap },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'analysis':
                return <CompetencyAnalysisTab />;
            case 'planner':
                return <CareerPlannerTab />;
            case 'coach':
                return <ApplicationCoachTab />;
            default:
                return null;
        }
    };

    return (
        <section id="karriere" className="fade-in">
            <h2 className="text-3xl font-bold text-white mb-6">Karriere-Cockpit</h2>

            <div className="mb-6 border-b border-slate-700">
                <div className="career-tabs flex space-x-2 sm:space-x-4" role="tablist" aria-label="Karriere-Cockpit Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as CareerTab)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm sm:text-base sm:px-4 sm:py-2.5 rounded-t-lg transition-colors whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'active bg-slate-800/60'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                            }`}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                        >
                           <tab.icon className="h-5 w-5" />
                           {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="fade-in">
                 {renderContent()}
            </div>
           
        </section>
    );
};

export default Career;