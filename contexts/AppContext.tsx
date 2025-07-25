import React, { createContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { 
    User, AppState, View, ModalState, ToastNotification, LevelInfo, DailyTip, 
    LearningPathCollection, SkillNode, CurrentCourseState, SkillCategory, CommunityPost, 
    CommunityComment, Expert, MWDEvent, Company, LearningPathAssignment, BerichtsheftEntry, 
    SubscriptionStatus, SimulationType, DigitalTwinMode, CareerGoal, CareerRoadmap,
    StatusUpdate, Conversation, LearningRoom, UserMessage
} from '../types';
import { api } from '../services/api';
import { LEARNING_PATH_DATA, ACHIEVEMENT_DATA, SIM_DATA, PLANNING_SCENARIOS, SKILL_CATEGORIES } from '../constants';
import { generateDailyTip, generateCareerRoadmap } from '../services/geminiService';
import { 
    CheckCircle, Award, Trophy, Settings, Gem, Ticket, AlertTriangle, 
    XCircle, Mic, Sparkles
} from 'lucide-react';

// --- HELPER FUNCTIONS ---
const playSound = (soundId: 'sound-complete' | 'sound-xp' | 'sound-click' | 'sound-notification') => {
    const sound = document.getElementById(soundId) as HTMLAudioElement;
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(err => console.error("Sound play failed:", err));
    }
};

const findNodeById = (nodes: SkillNode[], id: string): SkillNode | undefined => {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findNodeById(node.children, id);
            if(found) return found;
        }
    }
    return undefined;
};

const flattenTree = (nodes: SkillNode[]): SkillNode[] => {
    return nodes.reduce<SkillNode[]>((acc, node) => {
        acc.push(node);
        if (node.children) {
            acc.push(...flattenTree(node.children));
        }
        return acc;
    }, []);
};

const calculateLevelInfo = (xp: number): LevelInfo => {
    let level = 1;
    let xpForNext = 200;
    let cumulativeXp = 0;

    while (xp >= cumulativeXp + xpForNext) {
        cumulativeXp += xpForNext;
        level++;
        xpForNext = Math.floor(xpForNext * 1.5);
    }
    const xpIntoLevel = xp - cumulativeXp;
    const progress = xpForNext > 0 ? (xpIntoLevel / xpForNext) * 100 : 0;
    return { level, xp: xpIntoLevel, xpForNextLevel: xpForNext, progress };
};


// --- TYPE DEFINITIONS FOR CONTEXTS ---

type AuthContextType = {
    currentUser: User | null;
    appState: AppState;
    isNewUser: boolean;
    login: (email: string, pass: string) => Promise<{ success: boolean; error?: string; }>;
    register: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string; }>;
    logout: () => void;
};

type DataContextType = {
    learningPaths: LearningPathCollection;
    setLearningPaths: React.Dispatch<React.SetStateAction<LearningPathCollection>>;
    mergedLearningPaths: LearningPathCollection;
    activePathId: string;
    setActivePathId: React.Dispatch<React.SetStateAction<string>>;
    activeSkillTree: SkillNode[];
    allSkillNodes: SkillNode[];
    skillData: Record<SkillCategory, number>;
    levelInfo: LevelInfo | null;
    dailyTip: DailyTip | null;
    currentCourse: CurrentCourseState | null;
    lastXpGain: number;
    careerGoal: CareerGoal;
    setCareerGoal: React.Dispatch<React.SetStateAction<CareerGoal>>;
    careerRoadmap: CareerRoadmap | null;
    careerRoadmapLoading: boolean;

    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    companies: Company[];
    setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
    experts: Expert[];
    events: MWDEvent[];
    communityPosts: CommunityPost[];
    assignments: LearningPathAssignment[];
    berichtsheft: BerichtsheftEntry[];
    registeredEventIds: Set<number>;
    guildPinboard: string;
    setGuildPinboard: React.Dispatch<React.SetStateAction<string>>;
    statusUpdates: StatusUpdate[];
    conversations: Conversation[];
    learningRooms: LearningRoom[];
    currentLearningRoomId: string | null;

    handleNodeClick: (node: SkillNode, pathId: string) => void;
    handleStartSimulationFromDashboard: (type: SimulationType, xp: number, isPro: boolean, scenarioOrModeId: string) => void;
    handleCompleteNode: (nodeId: string, pathId: string) => Promise<void>;
    handleGenerateRoadmap: () => Promise<void>;
    handleAssignTask: (pathId: string, assignedTo: string) => Promise<void>;
    handleUpdateBerichtsheft: (newBerichtsheft: BerichtsheftEntry[]) => Promise<void>;
    handleRewardUser: (rewardedUserId: string, amount: number) => Promise<void>;
    handleCreatePost: (title: string, content: string, tags: SkillCategory[]) => void;
    handleAddComment: (postId: number, commentText: string) => void;
    handleToggleEventRegistration: (eventId: number) => void;
    handleBookExpertSession: (expert: Expert) => void;
    handleAcceptFriendRequest: (fromId: string) => void;
    handleDeclineFriendRequest: (fromId: string) => void;
    handleCreateStatusUpdate: (content: string) => void;
    handleSendMessage: (conversationId: string, text: string) => void;
    handleJoinRoom: (roomId: string) => void;
    handleLeaveRoom: () => void;
    handleCreateRoom: (name: string) => void;
    handleUpdateWhiteboard: (roomId: string, snapshot: any) => void;
    handleSendRoomMessage: (roomId: string, text: string) => void;
};

type UIContextType = {
    view: View;
    setView: React.Dispatch<React.SetStateAction<View>>;
    modalState: ModalState;
    toast: { notification: ToastNotification; type: 'default' | 'level-up' } | null;
    openModal: (title: string, content: ReactNode, size?: ModalState['size']) => void;
    closeModal: () => void;
    showToast: (title: string, message: string, icon: React.ElementType, type?: 'default' | 'level-up') => void;
    openUpgradeModal: () => void;
    openSettingsModal: () => void;
    openNewPostModal: () => void;
    openCreateRoomModal: () => void;
    _Upgrade_Content: ReactNode;
    NewPostForm: React.FC<{
        onAddPost: (title: string, content: string, tags: SkillCategory[]) => void,
        onClose: () => void,
    }>;
    _SettingsContent: ReactNode;
    Toast: React.FC<{ notification: ToastNotification, type?: 'default' | 'level-up' }>;
};

// --- CREATE CONTEXTS ---

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const DataContext = createContext<DataContextType | undefined>(undefined);
export const UIContext = createContext<UIContextType | undefined>(undefined);


// --- MAIN PROVIDER COMPONENT ---

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // --- AUTH STATE ---
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [appState, setAppState] = useState<AppState>('loading');
    const isNewUser = useMemo(() => {
      if (!currentUser) return false;
      const registrationDate = new Date(currentUser.registeredAt);
      const now = new Date();
      return now.getTime() - registrationDate.getTime() < 5 * 60 * 1000;
    }, [currentUser]);

    // --- UI STATE ---
    const [view, setView] = useState<View>(View.Dashboard);
    const [modalState, setModalState] = useState<ModalState>({ isOpen: false, title: '', content: null });
    const [toast, setToast] = useState<{notification: ToastNotification, type: 'default' | 'level-up'} | null>(null);

    // --- DATA STATE ---
    const [users, setUsers] = useState<User[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [experts, setExperts] = useState<Expert[]>([]);
    const [events, setEvents] = useState<MWDEvent[]>([]);
    const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
    const [assignments, setAssignments] = useState<LearningPathAssignment[]>([]);
    const [berichtsheft, setBerichtsheft] = useState<BerichtsheftEntry[]>([]);
    const [learningPaths, setLearningPaths] = useState<LearningPathCollection>(LEARNING_PATH_DATA);
    const [activePathId, setActivePathId] = useState<string>('ausbildung_elektroniker');
    const [currentCourse, setCurrentCourse] = useState<CurrentCourseState | null>(null);
    const [lastXpGain, setLastXpGain] = useState(0);
    const [registeredEventIds, setRegisteredEventIds] = useState<Set<number>>(new Set());
    const [dailyTip, setDailyTip] = useState<DailyTip | null>(null);
    const [guildPinboard, setGuildPinboard] = useState<string>('Willkommen in der Gilde! Lasst uns diese Woche den Lernpfad "VDE-Normen" rocken. Wer die meisten XP sammelt, bekommt eine Belohnung! - Euer Meister');
    const [careerGoal, setCareerGoal] = useState<CareerGoal>('Elektromeister werden');
    const [careerRoadmap, setCareerRoadmap] = useState<CareerRoadmap | null>(null);
    const [careerRoadmapLoading, setCareerRoadmapLoading] = useState(false);
    const tipFetchInitiated = React.useRef(false);

    // Social State
    const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [learningRooms, setLearningRooms] = useState<LearningRoom[]>([]);
    const [currentLearningRoomId, setCurrentLearningRoomId] = useState<string | null>(null);


    // --- AUTH LOGIC ---
    const fetchAllData = useCallback(async (currentUserId: string) => {
        try {
            const data = await api.fetchAllData(currentUserId);
            setUsers(data.users);
            setCompanies(data.companies);
            setExperts(data.experts);
            setEvents(data.events);
            setCommunityPosts(data.communityPosts);
            setAssignments(data.assignments);
            setBerichtsheft(data.berichtsheft);
            setStatusUpdates(data.statusUpdates);
            setConversations(data.conversations);
            setLearningRooms(data.learningRooms);
            setAppState('authenticated');
        } catch (error) {
            console.error("Error fetching initial data from mock API:", error);
            setAppState('landing'); // Fallback to landing on error
        }
    }, []);

    useEffect(() => {
        const checkUserSession = async () => {
            try {
                const user = await api.checkSession();
                if (user) {
                    setCurrentUser(user);
                    await fetchAllData(user.id);
                } else {
                    setCurrentUser(null);
                    setAppState('landing');
                }
            } catch (error) {
                console.error("Session check failed:", error);
                setAppState('landing');
            }
        };
        checkUserSession();
    }, [fetchAllData]);

    const login = async (email: string, password_unused: string) => {
        const result = await api.login(email, password_unused);
        if (result.success && result.user) {
            setCurrentUser(result.user);
            await fetchAllData(result.user.id);
            setView(View.Dashboard);
        } else {
             setView(View.Login);
        }
        return result;
    };
    
    const register = async (name: string, email: string, password_unused: string) => {
        const result = await api.register(name, email, password_unused);
        if (result.success && result.user) {
            setCurrentUser(result.user);
            await fetchAllData(result.user.id);
            setView(View.Dashboard);
        } else {
            setView(View.Register);
        }
        return result;
    };
    
    const logout = async () => {
        await api.logout();
        setCurrentUser(null);
        setAppState('landing');
        setView(View.Dashboard); // Reset view
    };

    // --- DERIVED DATA & MEMOS ---
    const mergedLearningPaths = useMemo(() => {
        if (!currentUser) return LEARNING_PATH_DATA;
        const newPaths: LearningPathCollection = JSON.parse(JSON.stringify(learningPaths));

        Object.keys(newPaths).forEach(pathId => {
            const progress = currentUser.learningProgress?.[pathId];
            const allNodesInPath = flattenTree(newPaths[pathId].nodes);
            
            if (progress) {
                allNodesInPath.forEach(node => {
                    node.status = progress.completedNodes?.includes(node.id) ? 'completed' :
                                  progress.activeNodes?.includes(node.id) ? 'active' : 'locked';
                });
            } else if (pathId === 'ausbildung_elektroniker' && Object.keys(currentUser.learningProgress || {}).length === 0) {
                const firstNode = allNodesInPath.find(n => (n.content || n.type === 'exam'));
                if(firstNode) firstNode.status = 'active';
            }
             if(currentUser.subscriptionStatus === 'pro') {
                if (newPaths['meister_1_4']?.locked) newPaths['meister_1_4'].locked = false;
                if (newPaths['industriemeister_bq']?.locked) newPaths['industriemeister_bq'].locked = false;
                if (newPaths['trei']?.locked) newPaths['trei'].locked = false;
            }
        });
        return newPaths;
    }, [currentUser, learningPaths]);

    const activeSkillTree = useMemo(() => mergedLearningPaths[activePathId]?.nodes || [], [mergedLearningPaths, activePathId]);
    const allSkillNodes = useMemo(() => Object.values(mergedLearningPaths).flatMap(p => flattenTree(p.nodes)), [mergedLearningPaths]);
    const skillData = useMemo(() => {
        const data: Record<SkillCategory, number> = {} as any;
        allSkillNodes
            .filter(node => node.status === 'completed' && (node.content || node.type === 'exam'))
            .forEach(node => {
                data[node.category] = (data[node.category] || 0) + node.xp;
            });
        return data;
    }, [allSkillNodes]);
    
    const totalXp = useMemo(() => currentUser?.xp ?? 0, [currentUser]);
    const levelInfo = useMemo(() => calculateLevelInfo(totalXp), [totalXp]);

    // --- UI LOGIC ---
    const showToast = useCallback((title: string, message: string, icon: React.ElementType, type: 'default' | 'level-up' = 'default') => {
        const id = Date.now();
        setToast({ notification: { id, title, message, icon }, type });
        playSound(type === 'level-up' ? 'sound-complete' : 'sound-notification');
        setTimeout(() => setToast(t => t?.notification.id === id ? null : t), 4500);
    }, []);

    const openModal = useCallback((title: string, content: ReactNode, size: ModalState['size'] = '2xl') => {
        playSound('sound-click');
        setModalState({ isOpen: true, title, content, size });
    }, []);

    const closeModal = useCallback(() => setModalState({ isOpen: false, title: '', content: null }), []);

    const handleUpgradeClick = useCallback(async () => {
        if (!currentUser) return;
        closeModal();
        const updatedUser = await api.updateUserSubscription(currentUser.id, 'pro');
        setCurrentUser(updatedUser);
        showToast('Upgrade erfolgreich!', 'Willkommen bei MeisterWerk Pro. Alle Features sind nun freigeschaltet.', Gem);
    }, [currentUser, closeModal, showToast]);

    const _Upgrade_Content = useMemo(() => (
        <div className="text-center">
            <Gem className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Meistern Sie Ihre Karriere mit Pro</h3>
            <p className="text-slate-300 mb-6">Schalten Sie unbegrenzten Zugriff auf alle Lernpfade, Simulationen und Experten-Sprechstunden frei.</p>
            <ul className="text-left space-y-2 mb-8 inline-block">
                <li className="flex items-center"><CheckCircle className="h-5 w-5 mr-2 text-green-400"/> Zugriff auf alle Pro-Lernpfade (Meister, TREI, etc.)</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 mr-2 text-green-400"/> Unlimitierte Nutzung aller Simulationen</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 mr-2 text-green-400"/> KI-Karriere-Analyse für Jobangebote</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 mr-2 text-green-400"/> Bevorzugter Zugang zu Experten-Events</li>
            </ul>
            <div>
                 <button onClick={handleUpgradeClick} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-lg text-lg">Jetzt für 9,99€/Monat upgraden</button>
            </div>
        </div>
    ), [handleUpgradeClick]);

    const openUpgradeModal = useCallback(() => openModal("Upgrade auf Pro", _Upgrade_Content), [openModal, _Upgrade_Content]);
    
    const _SettingsContent = useMemo(() => (
        <div>
            <h4 className="font-bold text-lg mb-2">Profil</h4>
            <p>Name: {currentUser?.name}</p>
            <p>Email: {currentUser?.email}</p>
            <p>Rolle: {currentUser?.role}</p>
            <h4 className="font-bold text-lg mt-4 mb-2">Abonnement</h4>
            <p>Status: <span className={`font-bold ${currentUser?.subscriptionStatus === 'pro' ? 'text-yellow-400' : ''}`}>{currentUser?.subscriptionStatus}</span></p>
             {currentUser?.subscriptionStatus !== 'pro' && <button onClick={openUpgradeModal} className="mt-2 text-blue-400 font-bold">Jetzt upgraden</button>}
        </div>
    ), [currentUser, openUpgradeModal]);
    
    const openSettingsModal = useCallback(() => openModal("Einstellungen", _SettingsContent), [openModal, _SettingsContent]);
    
    const ToastComponent: React.FC<{ notification: ToastNotification, type?: 'default' | 'level-up' }> = ({ notification, type = 'default' }) => (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 glass-card no-hover p-4 rounded-xl flex items-center space-x-4 z-[100] ${type === 'level-up' ? 'level-up-toast bg-purple-600/50 border-2 border-purple-400/50 shadow-lg shadow-purple-400/30' : 'toast-notification border-2 border-yellow-400/50 shadow-lg shadow-yellow-400/20'}`}>
            <notification.icon className={`h-10 w-10 ${type === 'level-up' ? 'text-purple-300' : 'text-yellow-400'}`} />
            <div>
                <h4 className="font-bold text-lg text-white">{notification.title}</h4>
                <p className={`text-sm ${type === 'level-up' ? 'text-purple-200' : 'text-yellow-200'}`}>{notification.message}</p>
            </div>
        </div>
    );
    
    const NewPostFormComponent: React.FC<{
        onAddPost: (title: string, content: string, tags: SkillCategory[]) => void,
        onClose: () => void,
    }> = ({ onAddPost, onClose }) => {
        const [title, setTitle] = useState('');
        const [content, setContent] = useState('');
        const [selectedTags, setSelectedTags] = useState<Set<SkillCategory>>(new Set());
        const availableTags = Object.keys(SKILL_CATEGORIES).filter(k => k !== 'allgemein') as SkillCategory[];

        const handleTagToggle = (tag: SkillCategory) => {
            const newTags = new Set(selectedTags);
            if (newTags.has(tag)) {
                newTags.delete(tag);
            } else if (newTags.size < 3) {
                newTags.add(tag);
            }
            setSelectedTags(newTags);
        };

        const handleSubmit = () => {
            if (title.trim() && content.trim() && selectedTags.size > 0) {
                onAddPost(title, content, Array.from(selectedTags));
            }
        };
        
        return (
            <div className="flex flex-col gap-4 text-white">
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titel Ihrer Frage" className="w-full bg-slate-800/80 border border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Beschreiben Sie hier Ihr Problem oder Ihre Frage..." rows={8} className="w-full bg-slate-800/80 border border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                <div>
                    <p className="text-sm font-medium text-slate-300 mb-2">Wählen Sie bis zu 3 passende Kategorien:</p>
                    <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => (
                            <button 
                                key={tag} 
                                onClick={() => handleTagToggle(tag)} 
                                className={`px-3 py-1 text-xs rounded-full border-2 transition-colors ${selectedTags.has(tag) ? 'bg-blue-500 border-blue-400 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}
                            >
                                {SKILL_CATEGORIES[tag].label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold">Abbrechen</button>
                    <button onClick={handleSubmit} disabled={!title.trim() || !content.trim() || selectedTags.size === 0} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed">Posten</button>
                </div>
            </div>
        );
    };

    const handleCreatePost = useCallback((title: string, content: string, tags: SkillCategory[]) => {
        if (!currentUser) return;
        const newPost: CommunityPost = { id: Date.now(), authorId: currentUser.id, author: currentUser.name, authorRole: currentUser.role, avatar: currentUser.avatar, color: 'f59e0b', title, content, tags, kudos: 0, isMeisterPost: currentUser.role === 'meister', date: new Date().toISOString(), comments: [] };
        setCommunityPosts(prev => [newPost, ...prev]);
        closeModal();
    }, [currentUser, closeModal]);
    
    const openNewPostModal = useCallback(() => {
        openModal(
            'Neue Frage im Forum stellen',
            <NewPostFormComponent onAddPost={handleCreatePost} onClose={closeModal} />,
            '3xl'
        );
    }, [openModal, closeModal, handleCreatePost]);

    const handleCreateRoom = useCallback((name: string) => {
        if (!currentUser || !name.trim()) return;
        const newRoom: LearningRoom = {
            id: `room-${Date.now()}`,
            name,
            hostId: currentUser.id,
            participants: [{ id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar }],
            whiteboardState: {},
            chat: [],
        };
        setLearningRooms(prev => [newRoom, ...prev]);
        closeModal();
        setCurrentLearningRoomId(newRoom.id);
        setView(View.LearningRoom);
    }, [currentUser, closeModal]);

    const CreateRoomFormComponent = () => {
        const [name, setName] = useState('');
        return (
             <div className="flex flex-col gap-4 text-white">
                <label htmlFor="roomName" className="font-semibold">Name des Raumes</label>
                <input id="roomName" value={name} onChange={e => setName(e.target.value)} placeholder="z.B. VDE 0100 Lerngruppe" className="w-full bg-slate-800/80 border border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                <div className="flex justify-end gap-3 mt-4">
                    <button onClick={closeModal} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold">Abbrechen</button>
                    <button onClick={() => handleCreateRoom(name)} disabled={!name.trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed">Erstellen & Beitreten</button>
                </div>
            </div>
        );
    };
    
    const openCreateRoomModal = useCallback(() => {
        openModal('Neuen Lernraum erstellen', <CreateRoomFormComponent />, 'lg');
    }, [openModal]);
    
    // --- DATA MUTATION LOGIC ---
    const gainXp = useCallback(async (xp: number) => {
        if (!currentUser) return;
        
        const oldLevelInfo = calculateLevelInfo(currentUser.xp);
        const newXp = currentUser.xp + xp;
        const updatedUserFields: Partial<User> = { xp: newXp };

        const newLevelInfo = calculateLevelInfo(newXp);
        if (newLevelInfo.level > oldLevelInfo.level) {
            showToast(`Level Up! Willkommen zu Level ${newLevelInfo.level}!`, 'Starke Leistung! +5 Wissens-Tokens erhalten.', Trophy, 'level-up');
            updatedUserFields.wissensTokens = (currentUser.wissensTokens || 0) + 5;
            const newAchievements = new Set(currentUser.unlockedAchievements);
            if(newLevelInfo.level >= 5) newAchievements.add('LEVEL_5');
            if(newLevelInfo.level >= 10) newAchievements.add('LEVEL_10');
            updatedUserFields.unlockedAchievements = Array.from(newAchievements);
        }

        setLastXpGain(xp);
        playSound('sound-xp');
        setTimeout(() => setLastXpGain(0), 2000);

        try {
            const updatedUser = await api.updateUser(currentUser.id, updatedUserFields);
            setCurrentUser(updatedUser);
        } catch (error) {
            console.error("Failed to update XP on mock server:", error);
        }
    }, [currentUser, showToast]);

    const handleCompleteNode = useCallback(async (nodeId: string, pathId: string) => {
        if (!currentUser) return;
        playSound('sound-complete');

        const path = mergedLearningPaths[pathId];
        const node = findNodeById(path.nodes, nodeId);
        if (!node || node.status === 'completed') return;
        
        await gainXp(node.xp);

        let currentProgress = JSON.parse(JSON.stringify(currentUser.learningProgress || {}));
        let pathProgress = currentProgress[pathId] || { completedNodes: [], activeNodes: [] };
        
        pathProgress.completedNodes = [...new Set([...pathProgress.completedNodes, nodeId])];
        pathProgress.activeNodes = pathProgress.activeNodes.filter((id: string) => id !== nodeId);
        
        if (node.children) {
            node.children.forEach(child => {
                 if (!pathProgress.completedNodes.includes(child.id)) pathProgress.activeNodes.push(child.id);
            });
        }
        
        if (pathProgress.activeNodes.length === 0) {
            const nextNode = flattenTree(path.nodes).find(n => n.status === 'locked' && findNodeById(path.nodes, n.id) && allSkillNodes.find(p => p.children?.some(c => c.id === n.id))?.status === 'completed');
            if (nextNode) pathProgress.activeNodes.push(nextNode.id);
        }
        
        currentProgress[pathId] = pathProgress;
        
        const newAchievements = new Set(currentUser.unlockedAchievements);
        const completedCount = Object.values(currentProgress).flatMap((p: any) => p.completedNodes).length;
        if(completedCount === 1) newAchievements.add('FIRST_STEP');
        if(completedCount >= 5) newAchievements.add('FIVE_COMPLETE');
        if(node.type === 'exam') {
             newAchievements.add('SIM_PRO');
             if (node.pro) newAchievements.add('SIM_MASTER');
        }

        try {
            const updatedUser = await api.updateUser(currentUser.id, { learningProgress: currentProgress, unlockedAchievements: Array.from(newAchievements) });
            setCurrentUser(updatedUser);
        } catch(error) {
            console.error("Failed to update learning progress:", error);
        }
        
        setCurrentCourse(null);
        setView(View.LearningPath);
    }, [currentUser, gainXp, mergedLearningPaths, allSkillNodes]);
    
    const handleNodeClick = useCallback((node: SkillNode, pathId: string) => {
        if (node.pro && currentUser?.subscriptionStatus !== 'pro') {
            openUpgradeModal();
            return;
        }
        if (node.type === 'exam' || node.content) {
             setCurrentCourse({ id: node.id, pathId });
             setView(View.Course);
        }
    }, [currentUser, openUpgradeModal]);

    const handleStartSimulationFromDashboard = (type: SimulationType, xp: number, isPro: boolean, scenarioOrModeId: string) => {
        // This is a simplified way to handle this. A better approach might involve a dedicated simulation view.
        const simNode = allSkillNodes.find(n => n.simulationType === type && (n.simulationScenarioId === scenarioOrModeId || type === 'digital-twin')) || {
             id: `sim-${type}-${scenarioOrModeId}`, title: SIM_DATA.find(s=>s.type === type)?.title || 'Simulation',
             status: 'active', category: 'allgemein', xp, pro: isPro, type: 'exam', simulationType: type, simulationScenarioId: scenarioOrModeId
        } as SkillNode;
        handleNodeClick(simNode, 'dashboard-sim');
    };
    
    const handleGenerateRoadmap = useCallback(async () => {
        if (!careerGoal.trim()) {
            showToast('Fehler', 'Bitte geben Sie ein Karriereziel ein.', AlertTriangle);
            return;
        }
        setCareerRoadmapLoading(true);
        setCareerRoadmap(null);
        try {
            const roadmap = await generateCareerRoadmap(careerGoal, skillData);
            setCareerRoadmap(roadmap);
        } catch (e) {
            const error = e as Error;
            showToast('Fehler', error.message || 'Der Karriereplan konnte nicht erstellt werden.', AlertTriangle);
        } finally {
            setCareerRoadmapLoading(false);
        }
    }, [careerGoal, skillData, showToast]);

    // --- Social Handlers ---
    const handleAcceptFriendRequest = (fromId: string) => {
        if (!currentUser) return;
        const newCurrentUser = {
            ...currentUser,
            friendRequests: currentUser.friendRequests.filter(req => req.fromId !== fromId),
            friends: [...new Set([...currentUser.friends, fromId])]
        };
        const newUsers = users.map(u => {
            if (u.id === currentUser.id) return newCurrentUser;
            if (u.id === fromId) return { ...u, friends: [...new Set([...u.friends, currentUser.id])] };
            return u;
        });
        setCurrentUser(newCurrentUser);
        setUsers(newUsers);
        showToast('Freund hinzugefügt', 'Die Freundschaftsanfrage wurde angenommen.', CheckCircle);
    };

    const handleDeclineFriendRequest = (fromId: string) => {
        if (!currentUser) return;
        const newCurrentUser = {
            ...currentUser,
            friendRequests: currentUser.friendRequests.filter(req => req.fromId !== fromId),
        };
        setCurrentUser(newCurrentUser);
        setUsers(users.map(u => u.id === currentUser.id ? newCurrentUser : u));
    };

    const handleCreateStatusUpdate = (content: string) => {
        if (!currentUser) return;
        const newUpdate: StatusUpdate = {
            id: `status-${Date.now()}`,
            authorId: currentUser.id,
            content,
            timestamp: new Date().toISOString(),
            likes: [],
            comments: []
        };
        setStatusUpdates(prev => [newUpdate, ...prev]);
    };
    
    const handleSendMessage = (conversationId: string, text: string) => {
        if (!currentUser) return;
        const newMessage: UserMessage = {
            id: `msg-${Date.now()}`,
            senderId: currentUser.id,
            text,
            timestamp: new Date().toISOString()
        };
        setConversations(prev => prev.map(c => 
            c.id === conversationId ? { ...c, messages: [...c.messages, newMessage] } : c
        ));
    };

    const handleJoinRoom = (roomId: string) => {
        if (!currentUser) return;
        const room = learningRooms.find(r => r.id === roomId);
        if (room && !room.participants.some(p => p.id === currentUser.id)) {
            const updatedRoom = {
                ...room,
                participants: [...room.participants, { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar }]
            };
            setLearningRooms(rooms => rooms.map(r => r.id === roomId ? updatedRoom : r));
        }
        setCurrentLearningRoomId(roomId);
        setView(View.LearningRoom);
    };

    const handleLeaveRoom = () => {
        setCurrentLearningRoomId(null);
        setView(View.Social);
    };

    const handleUpdateWhiteboard = (roomId: string, snapshot: any) => {
        setLearningRooms(prev => prev.map(r => r.id === roomId ? { ...r, whiteboardState: snapshot } : r));
    };

    const handleSendRoomMessage = (roomId: string, text: string) => {
        if (!currentUser) return;
        const newMessage: UserMessage = {
            id: `room-msg-${Date.now()}`,
            senderId: currentUser.id,
            text,
            timestamp: new Date().toISOString()
        };
        setLearningRooms(prev => prev.map(r => r.id === roomId ? { ...r, chat: [...r.chat, newMessage] } : r));
    };


    // DATA HANDLERS
    const handleAssignTask = async (pathId: string, assignedTo: string) => { if (!currentUser) return; const newAssignment = await api.addAssignment({ pathId, assignedTo, assignedBy: currentUser.id, isCompleted: false }); setAssignments(prev => [...prev, newAssignment]); showToast('Aufgabe zugewiesen', `Der Lernpfad wurde erfolgreich zugewiesen.`, CheckCircle); };
    const handleUpdateBerichtsheft = async (newBerichtsheft: BerichtsheftEntry[]) => { const updated = await api.updateBerichtsheft(newBerichtsheft); setBerichtsheft(updated); };
    const handleRewardUser = async (rewardedUserId: string, amount: number) => { if (!currentUser || currentUser.wissensTokens < amount) return; const result = await api.rewardUserWithToken(rewardedUserId, currentUser.id); if (result.success) { setCurrentUser(u => u ? {...u, wissensTokens: u.wissensTokens - amount} : null); setUsers(prevUsers => prevUsers.map(u => u.id === rewardedUserId ? {...u, wissensTokens: u.wissensTokens + amount } : u)); showToast('Belohnung gesendet!', `Sie haben einem Kollegen ${amount} Wissens-Token(s) gesendet.`, Ticket); } else { showToast('Fehler', 'Die Belohnung konnte nicht gesendet werden.', Award, 'default'); } };
    const handleAddComment = (postId: number, commentText: string) => { if (!currentUser) return; const newComment: CommunityComment = { id: Date.now(), authorId: currentUser.id, author: currentUser.name, authorRole: currentUser.role, avatar: currentUser.avatar, color: 'f59e0b', content: commentText, date: new Date().toISOString(), kudos: 0 }; setCommunityPosts(prevPosts => prevPosts.map(post => post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post)); };
    const handleToggleEventRegistration = useCallback((eventId: number) => { const newSet = new Set(registeredEventIds); if (newSet.has(eventId)) { newSet.delete(eventId); showToast('Abgemeldet', 'Sie sind nicht mehr für dieses Event angemeldet.', XCircle); } else { newSet.add(eventId); showToast('Erfolgreich angemeldet!', 'Sie erhalten eine Erinnerung vor dem Event.', CheckCircle); } setRegisteredEventIds(newSet); }, [registeredEventIds, showToast]);
    const handleBookExpertSession = (expert: Expert) => { if (!currentUser) return; if (currentUser.wissensTokens < expert.costPerSession) { openModal("Nicht genügend Wissens-Tokens", <div>...</div>); return; } const confirmBooking = async () => { if (!currentUser) return; const updatedUser = await api.updateUser(currentUser.id, { wissensTokens: currentUser.wissensTokens - expert.costPerSession }); setCurrentUser(updatedUser); closeModal(); showToast('Session gebucht!', `Eine Session mit ${expert.name} wurde gebucht.`, Mic); }; openModal("Buchung bestätigen", <div>...<button onClick={confirmBooking}>Bestätigen</button></div>); };

    useEffect(() => {
        if (!currentUser || !skillData || Object.keys(skillData).length === 0 || tipFetchInitiated.current) return;
        tipFetchInitiated.current = true;
        generateDailyTip(skillData).then(setDailyTip).catch(console.error);
    }, [skillData, currentUser]);


    const authContextValue: AuthContextType = { currentUser, appState, isNewUser, login, register, logout };
    const dataContextValue: DataContextType = { 
        learningPaths, setLearningPaths, mergedLearningPaths, activePathId, setActivePathId, activeSkillTree,
        allSkillNodes, skillData, levelInfo, dailyTip, currentCourse, lastXpGain,
        careerGoal, setCareerGoal, careerRoadmap, careerRoadmapLoading,
        users, setUsers, companies, setCompanies, experts, events, communityPosts, assignments,
        berichtsheft, registeredEventIds, guildPinboard, setGuildPinboard,
        statusUpdates, conversations, learningRooms, currentLearningRoomId,
        handleNodeClick, handleStartSimulationFromDashboard, handleCompleteNode, handleGenerateRoadmap,
        handleAssignTask, handleUpdateBerichtsheft, handleRewardUser, handleCreatePost, handleAddComment,
        handleToggleEventRegistration, handleBookExpertSession,
        handleAcceptFriendRequest, handleDeclineFriendRequest, handleCreateStatusUpdate, handleSendMessage,
        handleJoinRoom, handleLeaveRoom, handleCreateRoom, handleUpdateWhiteboard, handleSendRoomMessage,
    };
    const uiContextValue: UIContextType = { 
        view, setView, modalState, toast, openModal, closeModal, showToast, 
        openUpgradeModal, openSettingsModal, openNewPostModal, openCreateRoomModal, 
        _Upgrade_Content, NewPostForm: NewPostFormComponent, _SettingsContent, Toast: ToastComponent 
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            <DataContext.Provider value={dataContextValue}>
                <UIContext.Provider value={uiContextValue}>
                    {children}
                </UIContext.Provider>
            </DataContext.Provider>
        </AuthContext.Provider>
    );
};