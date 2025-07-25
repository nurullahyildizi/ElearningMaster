import React from 'react';
import { User, LearningPathCollection, LearningPathAssignment, BerichtsheftEntry } from '../../types';
import { BookMarked, CheckSquare, Clock, CheckCircle, ArrowRight, UserSquare, Info, Trophy, Crown, Medal, Award, Star } from 'lucide-react';
import Berichtsheft from './Berichtsheft';
import { useData } from '../../hooks/useAppContext';
import { GUILD_ACHIEVEMENT_DATA } from '../../constants';


const GuildInfoWidgets: React.FC<{
    guildPinboard: string;
    teamMembers: User[];
}> = ({ guildPinboard, teamMembers }) => {
    const sortedMembers = [...teamMembers].sort((a,b) => b.xp - a.xp);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
        if (rank === 2) return <Medal className="h-5 w-5 text-slate-300" />;
        if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
        return <span className="text-slate-500 font-bold w-5 text-center">{rank}</span>;
    }

    return (
        <div className="space-y-6">
            <div className="glass-card p-4 rounded-xl no-hover">
                <h3 className="font-bold text-lg mb-2 flex items-center"><Info className="mr-2 text-blue-300"/> Gilden-Pinnwand</h3>
                <div className="pinboard">
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{guildPinboard}</p>
                </div>
            </div>
             <div className="glass-card p-4 rounded-xl no-hover">
                <h3 className="font-bold text-lg mb-3 flex items-center"><Trophy className="mr-2 text-yellow-400"/> Gilden-Rangliste</h3>
                 <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {sortedMembers.map((member, index) => (
                        <li key={member.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-md leaderboard-item">
                           <div className="flex items-center gap-3">
                                <div className={`rank rank-${index+1}`}>{getRankIcon(index + 1)}</div>
                                <img src={`https://i.pravatar.cc/32?u=${member.email}`} className="h-8 w-8 rounded-full" alt={member.name}/>
                                <div>
                                    <p className="font-semibold text-sm">{member.name}</p>
                                    <p className="text-xs text-slate-400">Level {member.level}</p>
                                </div>
                           </div>
                            <div className="font-bold text-sm text-yellow-300 flex items-center gap-1">
                                {member.xp.toLocaleString('de-DE')} <Star className="h-4 w-4 text-yellow-500 fill-current"/>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
             <div className="glass-card p-4 rounded-xl no-hover">
                <h3 className="font-bold text-lg mb-3 flex items-center"><CheckCircle className="mr-2 text-green-400"/> Gilden-Erfolge</h3>
                 <div className="flex flex-wrap gap-4">
                    {Object.values(GUILD_ACHIEVEMENT_DATA).map(ach => (
                        <div key={ach.id} className="text-center" title={`${ach.name}\n${ach.description}`}>
                            <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-green-400/20 border-green-400 text-green-300`}>
                                <ach.icon className="w-7 h-7" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


interface AzubiTeamViewProps {
    currentUser: User;
    teamMembers: User[];
    learningPaths: LearningPathCollection;
    assignments: LearningPathAssignment[];
    berichtsheft: BerichtsheftEntry[];
    onUpdateBerichtsheft: (newBerichtsheft: BerichtsheftEntry[]) => void;
}

const AzubiTeamView: React.FC<AzubiTeamViewProps> = ({ currentUser, teamMembers, learningPaths, assignments, berichtsheft, onUpdateBerichtsheft }) => {
    const myAssignments = assignments.filter(a => a.assignedTo === currentUser.id);
    const myMeister = teamMembers.find(m => m.role === 'meister' && m.companyId === currentUser.companyId);
    const { guildPinboard } = useData();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                 {myMeister && (
                    <div className="glass-card p-6 rounded-xl no-hover">
                         <h3 className="text-xl font-bold mb-4 flex items-center"><UserSquare className="h-6 w-6 mr-3 text-green-400"/>Dein Meister</h3>
                         <div className="flex items-center gap-4">
                              <img src={`https://i.pravatar.cc/48?u=${myMeister.email}`} className="h-12 w-12 rounded-full border-2 border-green-400" alt={myMeister.name} />
                             <div>
                                <p className="font-bold text-lg text-white">{myMeister.name}</p>
                                <p className="text-sm text-slate-400">Level {myMeister.level}</p>
                             </div>
                         </div>
                    </div>
                )}
                <div className="glass-card p-6 rounded-xl no-hover">
                    <h3 className="text-xl font-bold mb-4 flex items-center"><CheckSquare className="h-6 w-6 mr-3 text-blue-400"/>Deine Aufgaben</h3>
                    <ul className="space-y-3">
                        {myAssignments.length > 0 ? myAssignments.map(assignment => (
                             <li key={assignment.id} className="bg-slate-800/50 p-4 rounded-lg flex justify-between items-center">
                                 <div>
                                    <p className="font-semibold text-white">{learningPaths[assignment.pathId]?.title}</p>
                                    <p className="text-xs text-slate-400">Vom Meister zugewiesen</p>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    {assignment.isCompleted ? (
                                        <div className="flex items-center text-green-400 font-semibold">
                                            <CheckCircle className="h-5 w-5 mr-2"/>
                                            <span>Abgeschlossen</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-yellow-400 font-semibold">
                                            <Clock className="h-5 w-5 mr-2"/>
                                            <span>In Arbeit</span>
                                        </div>
                                    )}
                                     <button className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white" title="Zum Lernpfad">
                                        <ArrowRight className="h-5 w-5"/>
                                     </button>
                                 </div>
                             </li>
                        )) : (
                            <div className="text-slate-400 text-center py-4">
                                <p>Dein Meister hat dir noch keine Aufgaben zugewiesen.</p>
                                <p className="text-xs mt-1">Schau bald wieder vorbei!</p>
                            </div>
                        )}
                    </ul>
                </div>
                 <div className="glass-card p-6 rounded-xl no-hover">
                    <h3 className="text-xl font-bold mb-4 flex items-center"><BookMarked className="h-6 w-6 mr-3 text-purple-400"/>Dein Berichtsheft</h3>
                    <Berichtsheft 
                        currentUser={currentUser} 
                        isMeisterView={false}
                        berichtsheft={berichtsheft}
                        onUpdateBerichtsheft={onUpdateBerichtsheft}
                    />
                </div>
            </div>
            <div className="lg:col-span-1">
                 <GuildInfoWidgets guildPinboard={guildPinboard} teamMembers={teamMembers} />
            </div>
        </div>
    );
};

export default AzubiTeamView;