import React from 'react';
import { SkillNode, SimulationType, View } from '../types';
import { ACHIEVEMENT_DATA } from '../constants';
import { Play, MessageSquare, Star, Award, BookOpen, Lightbulb, BadgeCheck, Trophy, ArrowRight, GitMerge, Cpu } from 'lucide-react';
import { useAuth } from '../hooks/useAppContext';
import { useData } from '../hooks/useAppContext';
import { useUI } from '../hooks/useAppContext';

interface DashboardProps {
    activeCourse: SkillNode | undefined;
    onStartCourse: () => void;
    onStartSimulation: (type: SimulationType, xp: number, isPro: boolean, scenarioOrModeId: string) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number, color: string }> = ({ icon, label, value, color }) => (
    <div className="glass-card p-5 rounded-xl flex items-center space-x-4 no-hover">
        <div className={`p-3 rounded-full bg-${color}-500/20`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const TrophiesWidget: React.FC = () => {
    const { currentUser } = useAuth();
    const { mergedLearningPaths } = useData();

    if (!currentUser) return null;

    const completedPaths = Object.values(mergedLearningPaths).filter(p => {
        const allNodes = p.nodes.flatMap(n => n.children ? [n, ...n.children] : [n]);
        const contentNodes = allNodes.filter(n => n.content || n.type === 'exam');
        if (contentNodes.length === 0) return false;
        
        const progress = currentUser.learningProgress?.[p.id];
        if (!progress) return false;
        
        return contentNodes.every(n => progress.completedNodes.includes(n.id));
    });

    return (
        <div className="glass-card p-6 rounded-xl no-hover col-span-1 h-full">
            <h3 className="font-bold text-xl text-white mb-4">Deine Trophäen</h3>
            <div className="space-y-4">
                 <div>
                    <h4 className="font-semibold text-blue-300 text-sm mb-2">Auszeichnungen</h4>
                    <div className="flex flex-wrap gap-4">
                        {Object.values(ACHIEVEMENT_DATA).slice(0, 5).map(ach => {
                            const isUnlocked = currentUser.unlockedAchievements.includes(ach.id);
                            return (
                                <div key={ach.id} className="text-center" title={`${ach.name}\n${ach.description}`}>
                                    <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isUnlocked ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300' : 'bg-slate-700/50 border-slate-600 text-slate-500'}`}>
                                        <ach.icon className="w-7 h-7" />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                 </div>
                 <div>
                    <h4 className="font-semibold text-green-300 text-sm mb-2">Digitale Siegel</h4>
                     <div className="flex flex-wrap gap-4">
                        {completedPaths.length > 0 ? (
                            completedPaths.map(path => (
                                 <div key={path.id} className="text-center group" title={`Abgeschlossen: ${path.title}`}>
                                     <img src={path.sealImage} alt={`${path.title} Siegel`} className="h-14 w-14 meisterbrief-seal" />
                                 </div>
                            ))
                        ) : (
                             <div className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-700/50 border-2 border-slate-600 text-slate-500" title="Schließe Lernpfade ab">
                                <BadgeCheck className="w-7 h-7"/>
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        </div>
    );
};

const WelcomeWidget: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => (
    <div className="glass-card p-8 rounded-xl no-hover col-span-1 lg:col-span-2 welcome-widget text-white">
        <h3 className="text-3xl font-bold mb-2">Willkommen bei MeisterWerk!</h3>
        <p className="text-blue-200 mb-6 max-w-xl">Dies ist der Startpunkt deiner Reise zum Meister. Beginne mit deinem ersten Kurs, um die Grundlagen zu festigen und Erfahrungspunkte zu sammeln.</p>
        <button onClick={onNavigate} className="bg-white/90 hover:bg-white text-blue-700 font-bold py-3 px-6 rounded-lg flex items-center text-lg transition-transform hover:scale-105">
            Zum Lernbaum <ArrowRight className="h-5 w-5 ml-2" />
        </button>
    </div>
);


const ForYouWidget: React.FC<{ 
    activeCourse?: SkillNode; 
    onStartCourse: () => void;
    onStartSimulation: (type: SimulationType, xp: number, isPro: boolean, scenarioOrModeId: string) => void;
}> = ({ activeCourse, onStartCourse, onStartSimulation }) => {
    const { currentUser } = useAuth();
    const { communityPosts } = useData();

    if (!currentUser) return null;

    let recommendation: React.ReactNode = null;
    if (activeCourse) {
        const isSimulation = activeCourse.type === 'exam' && activeCourse.simulationType && activeCourse.simulationScenarioId;
        recommendation = (
            <div className="bg-slate-700/50 p-4 rounded-lg flex items-center justify-between hover:bg-slate-700 transition-colors cursor-pointer" onClick={onStartCourse}>
                <div>
                    <div className={`flex items-center text-sm font-semibold mb-1 ${isSimulation ? 'text-purple-400' : 'text-blue-400'}`}>
                        {isSimulation ? <Cpu className="h-4 w-4 mr-2"/> : <GitMerge className="h-4 w-4 mr-2"/>}
                        {isSimulation ? 'Nächste Simulation' : 'Nächste Lektion'}
                    </div>
                    <p className="font-semibold text-white mt-1">{activeCourse.title}</p>
                </div>
                <button className={`bg-blue-600 hover:bg-blue-500 transition text-white font-bold py-2 px-4 rounded-lg flex items-center ${isSimulation ? 'bg-purple-600 hover:bg-purple-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
                    <Play className="h-5 w-5 mr-2" /> {isSimulation ? 'Starten' : 'Weitermachen'}
                </button>
            </div>
        );
    } 

    const communityPost = communityPosts[0];

    return (
         <div className="glass-card p-6 rounded-xl no-hover col-span-1 lg:col-span-2">
            <h3 className="font-bold text-xl text-white mb-4">Für Dich empfohlen</h3>
            <div className="space-y-4">
               {recommendation}
                {communityPost && (
                    <div className="bg-slate-700/50 p-4 rounded-lg flex items-center justify-between hover:bg-slate-700 transition-colors cursor-pointer">
                        <div>
                            <div className="flex items-center text-sm text-green-400 font-semibold mb-1">
                                <MessageSquare className="h-4 w-4 mr-2"/> Aus der Community
                            </div>
                            <p className="font-semibold text-white mt-1">{communityPost.title}</p>
                        </div>
                        <button className="bg-green-600 hover:bg-green-500 transition text-white font-bold py-2 px-4 rounded-lg flex items-center">
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ activeCourse, onStartCourse, onStartSimulation }) => {
    const { currentUser, isNewUser } = useAuth();
    const { levelInfo, dailyTip, allSkillNodes, mergedLearningPaths } = useData();
    const { setView } = useUI();

    if(!currentUser || !levelInfo) return null;

    const completedCoursesCount = allSkillNodes.filter(n => n.status === 'completed' && n.content).length;

    return (
        <section id="dashboard" className="fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {isNewUser ? (
                    <WelcomeWidget onNavigate={() => setView(View.LearningPath)} />
                ) : (
                    <ForYouWidget activeCourse={activeCourse} onStartCourse={onStartCourse} onStartSimulation={onStartSimulation} />
                )}

                <TrophiesWidget />

                {/* AI Tip of the day */}
                {dailyTip && (
                    <div className="glass-card p-6 rounded-xl border-l-4 border-blue-500 no-hover lg:col-span-3">
                         <div className="flex items-center mb-3">
                            <Lightbulb className="h-7 w-7 text-blue-400 mr-3" />
                            <div>
                                <h3 className="font-bold text-lg text-white">{dailyTip.title}</h3>
                                <p className="text-sm text-slate-400">Meister-Bot's Tipp des Tages</p>
                            </div>
                         </div>
                        <p className="text-slate-300">{dailyTip.content}</p>
                    </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:col-span-3">
                     <StatCard icon={<Award className="h-7 w-7 text-yellow-400"/>} label="Level" value={levelInfo.level} color="#facc15" />
                     <StatCard icon={<Star className="h-7 w-7 text-purple-400"/>} label="Gesamt-XP" value={currentUser.xp.toLocaleString('de-DE')} color="#a855f7" />
                     <StatCard icon={<BookOpen className="h-7 w-7 text-green-400"/>} label="Kurse gemeistert" value={completedCoursesCount} color="#22c55e" />
                </div>
            </div>
        </section>
    );
};

export default Dashboard;