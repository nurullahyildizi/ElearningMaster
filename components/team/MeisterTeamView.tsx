import React, { useState } from 'react';
import { User, LearningPathCollection, LearningPathAssignment, BerichtsheftEntry, UserRole } from '../../types';
import { BookOpen, CheckCircle, Clock, Send, ChevronDown, ChevronUp, User as UserIcon, ScrollText, Trophy, Info, Save, Medal, Award, Crown, Star } from 'lucide-react';
import Berichtsheft from './Berichtsheft';
import { useData } from '../../hooks/useAppContext';
import { GUILD_ACHIEVEMENT_DATA } from '../../constants';

type MeisterTab = 'overview' | 'reports' | 'info';

const XpProgressBar: React.FC<{ progress: number, current: number, next: number, level: number }> = ({ progress, current, next, level }) => (
    <div>
        <div className="flex justify-between items-baseline text-xs text-slate-400 mb-1">
            <span className="font-semibold">Level {level}</span>
            <span>{current}/{next} XP</span>
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
    paths: LearningPathCollection,
    onAssignTask: (pathId: string, assignedTo: string) => void;
    levelInfo: any;
}> = ({ azubi, assignments, paths, onAssignTask, levelInfo }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const azubiAssignments = assignments.filter(a => a.assignedTo === azubi.id);
    
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
                    <XpProgressBar progress={levelInfo.progress} current={levelInfo.xp} next={levelInfo.xpForNextLevel} level={levelInfo.level} />
                    
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
                </div>
            )}
         </div>
    )
}

const GuildInfoWidgets: React.FC<{
    isMeister: boolean;
    guildPinboard: string;
    onUpdatePinboard: (message: string) => void;
    teamMembers: User[];
}> = ({ isMeister, guildPinboard, onUpdatePinboard, teamMembers }) => {
    const [pinboardMessage, setPinboardMessage] = useState(guildPinboard);
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
                    {isMeister ? (
                        <>
                            <textarea 
                                className="w-full bg-transparent resize-none text-slate-300 text-sm focus:outline-none"
                                value={pinboardMessage}
                                onChange={(e) => setPinboardMessage(e.target.value)}
                                rows={4}
                            />
                            <button onClick={() => onUpdatePinboard(pinboardMessage)} className="bg-blue-600 text-white font-semibold text-xs py-1 px-3 rounded-md mt-2 flex items-center gap-1 hover:bg-blue-500">
                                <Save className="h-3 w-3"/> Speichern
                            </button>
                        </>
                    ) : (
                        <p className="text-slate-300 text-sm whitespace-pre-wrap">{guildPinboard}</p>
                    )}
                </div>
            </div>
             <div className="glass-card p-4 rounded-xl no-hover">
                <h3 className="font-bold text-lg mb-3 flex items-center"><Trophy className="mr-2 text-yellow-400"/> Gilden-Rangliste</h3>
                 <ul className="space-y-2">
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

interface MeisterTeamViewProps {
    currentUser: User;
    teamMembers: User[];
    learningPaths: LearningPathCollection;
    assignments: LearningPathAssignment[];
    onAssignTask: (pathId: string, assignedTo: string) => void;
    berichtsheft: BerichtsheftEntry[];
    onUpdateBerichtsheft: (newBerichtsheft: BerichtsheftEntry[]) => void;
    guildPinboard: string;
    onUpdatePinboard: (message: string) => void;
}

const MeisterTeamView: React.FC<MeisterTeamViewProps> = (props) => {
    const { currentUser, teamMembers, learningPaths, assignments, onAssignTask, berichtsheft, onUpdateBerichtsheft, guildPinboard, onUpdatePinboard } = props;
    const [activeTab, setActiveTab] = useState<MeisterTab>('overview');
    const apprentices = teamMembers.filter(m => m.role === 'azubi');
    const [selectedAzubiForReport, setSelectedAzubiForReport] = useState<User | undefined>(apprentices[0]);
    const { levelInfo } = useData();

    const renderContent = () => {
        switch(activeTab) {
            case 'overview':
                return (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        {apprentices.length > 0 ? apprentices.map(azubi => (
                             <AzubiProgressCard 
                                key={azubi.id}
                                azubi={azubi}
                                assignments={assignments}
                                paths={learningPaths}
                                onAssignTask={onAssignTask}
                                levelInfo={levelInfo}
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
            case 'reports':
                return (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                         <div className="md:col-span-1">
                             <ul className="space-y-2">
                                 {apprentices.map(azubi => (
                                     <li key={azubi.id}>
                                         <button onClick={() => setSelectedAzubiForReport(azubi)} className={`w-full text-left p-3 rounded-lg font-semibold flex items-center gap-3 transition-colors ${selectedAzubiForReport?.id === azubi.id ? 'bg-blue-600 text-white' : 'bg-slate-800/50 hover:bg-slate-700/50'}`}>
                                            <img src={`https://i.pravatar.cc/32?u=${azubi.email}`} className="h-8 w-8 rounded-full" alt={azubi.name}/>
                                            {azubi.name}
                                         </button>
                                     </li>
                                 ))}
                             </ul>
                         </div>
                         <div className="md:col-span-2">
                             {selectedAzubiForReport && (
                                <Berichtsheft 
                                    currentUser={currentUser}
                                    selectedAzubi={selectedAzubiForReport}
                                    isMeisterView={true}
                                    berichtsheft={berichtsheft}
                                    onUpdateBerichtsheft={onUpdateBerichtsheft}
                                />
                             )}
                         </div>
                     </div>
                );
            case 'info':
                 return <div className="mt-4"><GuildInfoWidgets isMeister={true} guildPinboard={guildPinboard} onUpdatePinboard={onUpdatePinboard} teamMembers={teamMembers}/></div>
            default: return null;
        }
    }
    
    return (
       <div>
            <div className="border-b border-slate-700 guild-tabs">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'active' : ''}>Übersicht</button>
                    <button onClick={() => setActiveTab('reports')} className={activeTab === 'reports' ? 'active' : ''}>Berichtshefte</button>
                    <button onClick={() => setActiveTab('info')} className={activeTab === 'info' ? 'active' : ''}>Gilden-Info</button>
                </nav>
            </div>
            {renderContent()}
       </div>
    );
};

export default MeisterTeamView;