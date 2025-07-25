import React from 'react';
import { User, Company, LearningPathCollection, LearningPathAssignment, BerichtsheftEntry } from '../../types';
import MeisterTeamView from './team/MeisterTeamView';
import AzubiTeamView from './team/AzubiTeamView';
import { useAuth, useData } from "../hooks/useAppContext";

const TeamCockpit: React.FC = () => {
    const { currentUser } = useAuth();
    const { users, companies, assignments, berichtsheft, mergedLearningPaths, handleAssignTask, handleUpdateBerichtsheft, guildPinboard, setGuildPinboard } = useData();

    if(!currentUser) return null;

    const company = companies.find(c => c.id === currentUser.companyId);

    if (!currentUser.companyId || !company) {
        return (
             <div className="text-center p-8 glass-card no-hover rounded-xl">
                <h2 className="text-2xl font-bold text-white mb-2">Keiner Gilde zugeordnet</h2>
                <p className="text-slate-400">Du bist derzeit keinem Unternehmen bzw. keiner Gilde zugeordnet. Bitte wende dich an einen Administrator, um dein Unternehmen einzurichten.</p>
            </div>
        )
    }

    const teamMembers = users.filter(u => u.companyId === currentUser.companyId);

    return (
        <section id="guild-view" className="fade-in">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">Gilden-Zentrale</h2>
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
                    learningPaths={mergedLearningPaths}
                    assignments={assignments}
                    onAssignTask={handleAssignTask}
                    berichtsheft={berichtsheft}
                    onUpdateBerichtsheft={handleUpdateBerichtsheft}
                    guildPinboard={guildPinboard}
                    onUpdatePinboard={setGuildPinboard}
                />
            )}

            {currentUser.role === 'azubi' && (
                <AzubiTeamView 
                    currentUser={currentUser} 
                    teamMembers={teamMembers} 
                    learningPaths={mergedLearningPaths}
                    assignments={assignments}
                    berichtsheft={berichtsheft}
                    onUpdateBerichtsheft={handleUpdateBerichtsheft}
                />
            )}
            
            {currentUser.role === 'user' && (
                 <div className="text-center p-8 glass-card no-hover rounded-xl">
                    <h2 className="text-2xl font-bold text-white mb-2">Gilden-Funktionen</h2>
                    <p className="text-slate-400">Gilden-Funktionen sind für Meister und Azubis verfügbar. Deine aktuelle Rolle ist "Benutzer".</p>
                </div>
            )}

        </section>
    );
};

export default TeamCockpit;