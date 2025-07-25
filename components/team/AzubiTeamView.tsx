
import React from 'react';
import { User, LearningPathCollection, LearningPathAssignment, BerichtsheftEntry } from '../../types';
import { BookMarked, CheckSquare, Clock, CheckCircle, ArrowRight, UserSquare } from 'lucide-react';
import Berichtsheft from './Berichtsheft';

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
            </div>
            <div className="lg:col-span-1">
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
        </div>
    );
};

export default AzubiTeamView;
