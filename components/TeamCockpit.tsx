

import React from 'react';
import { User, Company, LearningPathCollection, LearningPathAssignment, BerichtsheftEntry } from '../../types';
import MeisterTeamView from './team/MeisterTeamView';
import AzubiTeamView from './team/AzubiTeamView';

interface TeamCockpitProps {
    currentUser: User;
    users: User[];
    companies: Company[];
    learningPaths: LearningPathCollection;
    assignments: LearningPathAssignment[];
    onAssignTask: (pathId: string, assignedTo: string) => void;
    berichtsheft: BerichtsheftEntry[];
    onUpdateBerichtsheft: (newBerichtsheft: BerichtsheftEntry[]) => void;
}

const TeamCockpit: React.FC<TeamCockpitProps> = (props) => {
    const { currentUser, users, companies, learningPaths, assignments, onAssignTask, berichtsheft, onUpdateBerichtsheft } = props;
    const company = companies.find(c => c.id === currentUser.companyId);

    if (!currentUser.companyId || !company) {
        return (
             <div className="text-center p-8 glass-card no-hover rounded-xl">
                <h2 className="text-2xl font-bold text-white mb-2">Keinem Team zugeordnet</h2>
                <p className="text-slate-400">Du bist derzeit keinem Unternehmen zugeordnet. Bitte wende dich an einen Administrator, um dein Unternehmen einzurichten.</p>
            </div>
        )
    }

    const teamMembers = users.filter(u => u.companyId === currentUser.companyId);

    return (
        <section id="team-cockpit" className="fade-in">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">Team-Cockpit</h2>
                    <p className="text-slate-400 text-lg">{company.name}</p>
                </div>
                 <div className="flex -space-x-4">
                    {teamMembers.map(member => (
                        <img 
                            key={member.id}
                            className="w-12 h-12 border-2 border-slate-700 rounded-full object-cover" 
                            src={`https://i.pravatar.cc/48?u=${member.email}`}
                            alt={member.name}
                            title={member.name}
                        />
                    ))}
                </div>
            </div>

            {currentUser.role === 'meister' && (
                <MeisterTeamView 
                    currentUser={currentUser} 
                    teamMembers={teamMembers}
                    learningPaths={learningPaths}
                    assignments={assignments}
                    onAssignTask={onAssignTask}
                    berichtsheft={berichtsheft}
                    onUpdateBerichtsheft={onUpdateBerichtsheft}
                />
            )}

            {currentUser.role === 'azubi' && (
                <AzubiTeamView 
                    currentUser={currentUser} 
                    teamMembers={teamMembers} 
                    learningPaths={learningPaths}
                    assignments={assignments}
                    berichtsheft={berichtsheft}
                    onUpdateBerichtsheft={onUpdateBerichtsheft}
                />
            )}
            
            {currentUser.role === 'user' && (
                 <div className="text-center p-8 glass-card no-hover rounded-xl">
                    <h2 className="text-2xl font-bold text-white mb-2">Team-Funktionen</h2>
                    <p className="text-slate-400">Team-Funktionen sind für Meister und Azubis verfügbar. Deine aktuelle Rolle ist "Benutzer".</p>
                </div>
            )}

        </section>
    );
};

export default TeamCockpit;
