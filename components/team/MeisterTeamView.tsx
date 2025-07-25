
import React, { useState } from 'react';
import { User, LearningPathCollection, LearningPathAssignment, BerichtsheftEntry, UserRole } from '../../types';
import { BookOpen, CheckCircle, Clock, Send, ChevronDown, ChevronUp, User as UserIcon } from 'lucide-react';
import Berichtsheft from './Berichtsheft';

const XpProgressBar: React.FC<{ progress: number, current: number, next: number }> = ({ progress, current, next }) => (
    <div>
        <div className="flex justify-between items-baseline text-xs text-slate-400 mb-1">
            <span className="font-semibold">Level {Math.floor(current/200)+1}</span>
            <span>{current % 200}/{next} XP</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2 progress-bar-bg">
            <div
                className="h-2 rounded-full progress-bar-fg"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    </div>
);

const AssignTask: React.FC<{
    azubi: User,
    paths: LearningPathCollection,
    assignments: LearningPathAssignment[],
    onAssign: (pathId: string) => void
}> = ({ azubi, paths, assignments, onAssign }) => {
    const [selectedPath, setSelectedPath] = useState('');
    
    const assignedPathIds = new Set(assignments.filter(a => a.assignedTo === azubi.id).map(a => a.pathId));
    const availablePaths = Object.values(paths).filter(p => !assignedPathIds.has(p.id) && !p.locked);
    
    const handleAssign = () => {
        if (selectedPath) {
            onAssign(selectedPath);
            setSelectedPath('');
        }
    };
    
    return (
        <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
            <h4 className="font-semibold text-white mb-2 text-sm">Neuen Lernpfad zuweisen</h4>
            <div className="flex gap-2">
                <select 
                    value={selectedPath}
                    onChange={(e) => setSelectedPath(e.target.value)}
                    className="flex-grow bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-white focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">Lernpfad auswählen...</option>
                    {availablePaths.map(path => <option key={path.id} value={path.id}>{path.title}</option>)}
                </select>
                <button 
                    onClick={handleAssign} 
                    disabled={!selectedPath}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-500 font-semibold py-2 px-3 rounded-lg text-sm flex items-center gap-2"
                >
                    <Send className="h-4 w-4"/> Zuweisen
                </button>
            </div>
        </div>
    );
};


const AzubiProgressCard: React.FC<{
    azubi: User, 
    assignments: LearningPathAssignment[], 
    berichtsheft: BerichtsheftEntry[],
    paths: LearningPathCollection,
    onAssignTask: (pathId: string, assignedTo: string) => void;
}> = ({ azubi, assignments, berichtsheft, paths, onAssignTask }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const azubiAssignments = assignments.filter(a => a.assignedTo === azubi.id);
    const latestEntry = berichtsheft.filter(e => e.authorId === azubi.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    return (
         <div className="glass-card p-4 rounded-xl no-hover">
             <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                 <div className="flex items-center gap-4">
                     <img src={`https://i.pravatar.cc/48?u=${azubi.email}`} className="h-12 w-12 rounded-full border-2 border-blue-400" alt={azubi.name} />
                     <div>
                        <p className="font-bold text-lg text-white">{azubi.name}</p>
                        <p className="text-sm text-slate-400">Level {azubi.level}</p>
                     </div>
                 </div>
                 <button className="p-2 text-slate-400 hover:text-white">
                     {isExpanded ? <ChevronUp className="h-6 w-6"/> : <ChevronDown className="h-6 w-6"/>}
                 </button>
             </div>
             
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-4">
                    <XpProgressBar progress={(azubi.xp % 200 / 200) * 100} current={azubi.xp} next={200} />
                    
                    <div>
                        <h4 className="font-semibold text-white text-sm mb-2">Zugewiesene Lernpfade</h4>
                         <div className="space-y-2">
                                {azubiAssignments.length > 0 ? azubiAssignments.map(assignment => (
                                    <div key={assignment.id} className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg text-sm">
                                        <div className="flex items-center">
                                            <BookOpen className="h-4 w-4 mr-2 text-blue-400"/>
                                            <p>{paths[assignment.pathId]?.title || 'Unbekannter Pfad'}</p>
                                        </div>
                                        {assignment.isCompleted ? (
                                            <div className="flex items-center text-green-400 text-xs font-semibold">
                                                <CheckCircle className="h-4 w-4 mr-1"/>
                                                <span>Abgeschlossen</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-yellow-400 text-xs font-semibold">
                                                <Clock className="h-4 w-4 mr-1"/>
                                                <span>In Arbeit</span>
                                            </div>
                                        )}
                                    </div>
                                )) : <p className="text-slate-400 text-xs text-center">Noch keine Lernpfade zugewiesen.</p>}
                            </div>
                        <AssignTask azubi={azubi} paths={paths} assignments={assignments} onAssign={(pathId) => onAssignTask(pathId, azubi.id)} />
                    </div>

                    <div>
                        <h4 className="font-semibold text-white text-sm mb-2">Letzter Berichtsheft-Eintrag</h4>
                        {latestEntry ? (
                            <div className="bg-slate-800/50 p-3 rounded-lg text-sm">
                                <p className="text-xs text-slate-400 mb-1">{new Date(latestEntry.date).toLocaleDateString('de-DE')}</p>
                                <p className="text-slate-300 line-clamp-2">{latestEntry.text}</p>
                            </div>
                        ): (
                            <p className="text-slate-400 text-xs text-center">Keine Einträge vorhanden.</p>
                        )}
                    </div>
                </div>
            )}
         </div>
    )
}


interface MeisterTeamViewProps {
    currentUser: User;
    teamMembers: User[];
    learningPaths: LearningPathCollection;
    assignments: LearningPathAssignment[];
    onAssignTask: (pathId: string, assignedTo: string) => void;
    berichtsheft: BerichtsheftEntry[];
    onUpdateBerichtsheft: (newBerichtsheft: BerichtsheftEntry[]) => void;
}


const MeisterTeamView: React.FC<MeisterTeamViewProps> = (props) => {
    const { currentUser, teamMembers, learningPaths, assignments, onAssignTask, berichtsheft, onUpdateBerichtsheft } = props;
    const apprentices = teamMembers.filter(m => m.role === 'azubi');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {apprentices.length > 0 ? apprentices.map(azubi => (
                 <AzubiProgressCard 
                    key={azubi.id}
                    azubi={azubi}
                    assignments={assignments}
                    berichtsheft={berichtsheft}
                    paths={learningPaths}
                    onAssignTask={onAssignTask}
                />
            )) : (
                <div className="md:col-span-2 glass-card p-8 rounded-xl no-hover text-center h-full flex items-center justify-center">
                    <div className="flex flex-col items-center">
                         <UserIcon className="h-12 w-12 text-slate-500 mb-4" />
                         <h3 className="text-xl font-bold text-white">Keine Azubis im Team</h3>
                         <p className="text-slate-400">Laden Sie Ihre Azubis ein oder weisen Sie die Rolle im Admin-Panel zu.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeisterTeamView;
