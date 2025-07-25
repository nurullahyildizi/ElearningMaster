
import React from 'react';
import { Expert } from '../types';
import { SKILL_CATEGORIES } from '../constants';
import { Ticket, Mic } from 'lucide-react';

interface ExpertsViewProps {
    experts: Expert[];
}

const ExpertCard: React.FC<{ expert: Expert }> = ({ expert }) => {
    return (
        <div className="glass-card p-6 rounded-xl flex flex-col items-center text-center">
            <img src={expert.imageUrl} alt={expert.name} className="h-24 w-24 rounded-full border-4 border-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-white">{expert.name}</h3>
            <p className="text-blue-400 font-semibold mb-3">{expert.title}</p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
                {expert.specialties.map(spec => (
                     <span key={spec} className="bg-slate-700 text-slate-300 text-xs font-semibold px-2 py-1 rounded-full">
                        {SKILL_CATEGORIES[spec].label}
                    </span>
                ))}
            </div>
            <div className="w-full border-t border-slate-700 my-2"></div>
            <div className="flex items-center text-amber-400 font-bold mt-3">
                 <Ticket className="h-5 w-5 mr-2" />
                 {expert.costPerSession} Tokens / Session
            </div>
            <button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 transition text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center">
                <Mic className="h-5 w-5 mr-2" /> Session buchen
            </button>
        </div>
    );
}

const ExpertsView: React.FC<ExpertsViewProps> = ({ experts }) => {
    return (
        <section id="experten" className="fade-in">
            <h2 className="text-3xl font-bold text-white mb-2">Experten-Sprechstunden</h2>
            <p className="text-slate-400 mb-8">Buchen Sie eine 1-zu-1-Session mit einem unserer zertifizierten Fachexperten und lösen Sie komplexe Probleme.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experts.map(expert => (
                    <ExpertCard key={expert.id} expert={expert} />
                ))}
            </div>
        </section>
    );
};

export default ExpertsView;
