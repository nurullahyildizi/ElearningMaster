
import React, { useState, useEffect, useMemo, useCallback, useRef, ReactNode } from 'react';
import { View, ModalState, CommunityPost, Job, SkillNode, SkillStatus, SimulationType, LevelInfo, SkillCategory, LearningPathCollection, CurrentCourseState, SubscriptionStatus, DailyTip, User, Company, Expert, MWDEvent, Achievement, ToastNotification, PlanningScenario, LearningPathAssignment, BerichtsheftEntry, DigitalTwinMode, AppState, UserRole, LearningPathData } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LearningPath from './components/LearningPath';
import Career from './components/Career';
import Community from './components/Community';
import Modal from './components/Modal';
import AiBot from './components/AiBot';
import CourseView from './components/CourseView';
import { LEARNING_PATH_DATA, SKILL_CATEGORIES, MOCK_USER_DATA, MOCK_COMPANY_DATA, MOCK_EXPERT_DATA, MOCK_EVENT_DATA, ACHIEVEMENT_DATA, PLANNING_SCENARIOS, SIM_DATA } from './constants';
import { generateDailyTip } from './services/geminiService';
import ComingSoonSim from './components/simulations/ComingSoonSim';
import AevoSim from './components/simulations/AevoSim';
import { Sparkles, CheckCircle, Award, Trophy, Settings, Gem, Ticket, Loader2 } from 'lucide-react';
import AdminPanel from './components/admin/AdminPanel';
import TeamCockpit from './components/TeamCockpit';
import ExpertsView from './components/ExpertsView';
import MeisterProjectSim from './components/simulations/MeisterProjectSim';
import EventsView from './components/EventsView';
import DigitalTwinSim from './components/simulations/DigitalTwinSim';
import TroubleshootingSim from './components/simulations/TroubleshootingSim';
import PlanningSim from './components/simulations/PlanningSim';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, runTransaction, increment, writeBatch, query, where } from 'firebase/firestore';


// --- Helper Functions ---
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

const Toast: React.FC<{ notification: ToastNotification, type?: 'default' | 'level-up' }> = ({ notification, type = 'default' }) => (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 glass-card no-hover p-4 rounded-xl flex items-center space-x-4 z-[100] ${type === 'level-up' ? 'level-up-toast bg-purple-600/50 border-2 border-purple-400/50 shadow-lg shadow-purple-400/30' : 'toast-notification border-2 border-yellow-400/50 shadow-lg shadow-yellow-400/20'}`}>
        <notification.icon className={`h-10 w-10 ${type === 'level-up' ? 'text-purple-300' : 'text-yellow-400'}`} />
        <div>
            <h4 className="font-bold text-lg text-white">{notification.title}</h4>
            <p className={`text-sm ${type === 'level-up' ? 'text-purple-200' : 'text-yellow-200'}`}>{notification.message}</p>
        </div>
    </div>
);


const App: React.FC = () => {
    const [view, setView] = useState<View>(View.Dashboard);
    const [modalState, setModalState] = useState<ModalState>({ isOpen: false, title: '', content: null });
    const [appState, setAppState] = useState<AppState>('loading');
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [experts, setExperts] = useState<Expert[]>([]);
    const [events, setEvents] = useState<MWDEvent[]>([]);
    const [assignments, setAssignments] = useState<LearningPathAssignment[]>([]);
    const [berichtsheft, setBerichtsheft] = useState<BerichtsheftEntry[]>([]);
    const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [learningPaths, setLearningPaths] = useState<LearningPathCollection>({});

    const [activePathId, setActivePathId] = useState<string>('ausbildung_elektroniker');
    
    const [currentCourse, setCurrentCourse] = useState<CurrentCourseState | null>(null);
    const [lastXpGain, setLastXpGain] = useState(0);

    const [toast, setToast] = useState<{notification: ToastNotification, type: 'default' | 'level-up'} | null>(null);

    const [dailyTip, setDailyTip] = useState<DailyTip | null>(null);
    const tipFetchInitiated = useRef(false);

    // --- Firebase Auth Listener ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = { id: userDocSnap.id, ...userDocSnap.data() } as User;
                    setCurrentUser(userData);
                    setAppState('authenticated');
                    // Fetch all other data once authenticated
                    // In a real large-scale app, you'd fetch data more granularly
                    fetchAllData(userData.id);
                } else {
                    console.error("Firestore user document not found for authenticated user.");
                    await signOut(auth); // Log out inconsistent user
                }
            } else {
                setCurrentUser(null);
                setAppState('landing');
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchAllData = async (currentUserId: string) => {
        try {
            const [usersSnap, companiesSnap, expertsSnap, eventsSnap, postsSnap, jobsSnap, pathsSnap] = await Promise.all([
                getDocs(collection(db, "users")),
                getDocs(collection(db, "companies")),
                getDocs(collection(db, "experts")),
                getDocs(collection(db, "events")),
                getDocs(collection(db, "communityPosts")),
                getDocs(collection(db, "jobs")),
                getDocs(collection(db, "learningPaths")),
            ]);

            const allUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as User));
            setUsers(allUsers);
            setCompanies(companiesSnap.docs.map(d => ({ id: parseInt(d.id, 10), ...d.data() } as Company)));
            setExperts(expertsSnap.docs.map(d => ({ id: parseInt(d.id, 10), ...d.data() } as Expert)));
            setEvents(eventsSnap.docs.map(d => ({ id: parseInt(d.id, 10), ...d.data() } as MWDEvent)));
            setCommunityPosts(postsSnap.docs.map(d => ({ id: parseInt(d.id, 10), ...d.data() } as CommunityPost)));
            setJobs(jobsSnap.docs.map(d => ({ id: parseInt(d.id, 10), ...d.data() } as Job)));
            
            const pathsData: LearningPathCollection = {};
            pathsSnap.docs.forEach(doc => {
                pathsData[doc.id] = { id: doc.id, ...doc.data() } as LearningPathData;
            });
            setLearningPaths(pathsData);

            // Fetch data specific to the user or their company
            const user = allUsers.find(u => u.id === currentUserId);
            if(user) {
                const assignmentsQuery = query(collection(db, "assignments"), where(user.role === 'meister' ? 'assignedBy' : 'assignedTo', "==", user.id));
                const assignmentsSnap = await getDocs(assignmentsQuery);
                setAssignments(assignmentsSnap.docs.map(d => ({ id: d.id, ...d.data() } as LearningPathAssignment)));

                const berichtsheftQuery = query(collection(db, "berichtsheft"), where("authorId", "==", user.id));
                const berichtsheftSnap = await getDocs(berichtsheftQuery);
                setBerichtsheft(berichtsheftSnap.docs.map(d => ({ id: parseInt(d.id, 10), ...d.data() } as BerichtsheftEntry)));
            }
        } catch (error) {
            console.error("Error fetching initial data from Firestore:", error);
        }
    };
    
    // Merge static path structure with dynamic user progress from Firestore
    const mergedLearningPaths = useMemo(() => {
        if (!currentUser || Object.keys(learningPaths).length === 0) {
            return learningPaths;
        }

        const newPaths: LearningPathCollection = JSON.parse(JSON.stringify(learningPaths));

        Object.keys(newPaths).forEach(pathId => {
            const progress = currentUser.learningProgress?.[pathId];
            if (progress) {
                 const allNodes = flattenTree(newPaths[pathId].nodes);
                 allNodes.forEach(node => {
                    if (progress.completedNodes?.includes(node.id)) {
                        node.status = 'completed';
                    } else if (progress.activeNodes?.includes(node.id)) {
                        node.status = 'active';
                    } else {
                        node.status = 'locked';
                    }
                 });
            }
        });

        return newPaths;
    }, [currentUser, learningPaths]);

    const activeSkillTree = useMemo(() => mergedLearningPaths[activePathId]?.nodes || [], [mergedLearningPaths, activePathId]);
    const allSkillNodes = useMemo(() => Object.values(mergedLearningPaths).flatMap(p => flattenTree(p.nodes)), [mergedLearningPaths]);
    
    const completedCoursesCount = useMemo(() => allSkillNodes.filter(n => n.status === 'completed' && n.content).length, [allSkillNodes]);

    const skillData = useMemo(() => {
        const data: Record<SkillCategory, number> = {} as any;
        allSkillNodes
            .filter(node => node.status === 'completed' && node.content)
            .forEach(node => {
                data[node.category] = (data[node.category] || 0) + node.xp;
            });
        return data;
    }, [allSkillNodes]);
    
    const totalXp = useMemo(() => currentUser?.xp ?? 0, [currentUser]);
    const levelInfo = useMemo(() => calculateLevelInfo(totalXp), [totalXp]);

    useEffect(() => {
        if (!currentUser || !skillData || Object.keys(skillData).length === 0) return;
        if (tipFetchInitiated.current) return;
        tipFetchInitiated.current = true;
        generateDailyTip(skillData).then(setDailyTip).catch(console.error);
    }, [skillData, currentUser]);
    
    const showToast = useCallback((title: string, message: string, icon: React.ElementType, type: 'default' | 'level-up' = 'default') => {
        const id = Date.now();
        setToast({ notification: { id, title, message, icon }, type });
        playSound(type === 'level-up' ? 'sound-complete' : 'sound-notification');
        setTimeout(() => setToast(t => t?.notification.id === id ? null : t), 4500);
    }, []);

    const gainXp = useCallback(async (xp: number) => {
        if (!currentUser) return;
        
        const oldLevelInfo = calculateLevelInfo(currentUser.xp);
        const newXp = currentUser.xp + xp;
        
        const userDocRef = doc(db, "users", currentUser.id);
        await updateDoc(userDocRef, { xp: increment(xp) });
        setCurrentUser(u => u ? { ...u, xp: newXp } : null);

        setLastXpGain(xp);
        playSound('sound-xp');
        setTimeout(() => setLastXpGain(0), 2000);

        const newLevelInfo = calculateLevelInfo(newXp);
        if (newLevelInfo.level > oldLevelInfo.level) {
            showToast(`Level Up! Willkommen zu Level ${newLevelInfo.level}!`, 'Starke Leistung! +5 Wissens-Tokens erhalten.', Trophy, 'level-up');
            await updateDoc(userDocRef, { wissensTokens: increment(5) });
             setCurrentUser(u => u ? { ...u, wissensTokens: u.wissensTokens + 5 } : null);
        }

    }, [currentUser, showToast]);

    const handleCompleteNode = useCallback(async (nodeId: string, pathId: string) => {
        if (!currentUser) return;
        playSound('sound-complete');

        const path = mergedLearningPaths[pathId];
        const node = findNodeById(path.nodes, nodeId);
        if (!node || node.status === 'completed') return;

        await gainXp(node.xp);

        // Update learning progress in Firestore
        const userDocRef = doc(db, "users", currentUser.id);
        const userDoc = await getDoc(userDocRef);
        const currentProgress = userDoc.data()?.learningProgress || {};
        
        const pathProgress = currentProgress[pathId] || { completedNodes: [], activeNodes: [] };
        pathProgress.completedNodes = [...new Set([...pathProgress.completedNodes, nodeId])];
        pathProgress.activeNodes = pathProgress.activeNodes.filter((id: string) => id !== nodeId);
        
        // Unlock next nodes
        const nextNode = flattenTree(path.nodes).find(n => n.status === 'active');
        if (nextNode) {
             pathProgress.activeNodes.push(nextNode.id);
        }
        
        currentProgress[pathId] = pathProgress;
        await updateDoc(userDocRef, { learningProgress: currentProgress });
        
        // Update local state for immediate UI response
        setCurrentUser(u => u ? { ...u, learningProgress: currentProgress } : null);
        
        setCurrentCourse(null);
        setView(View.LearningPath);
    }, [currentUser, gainXp, mergedLearningPaths]);
    
    // Other functions like openModal, showUpgradeModal, handleJobClick remain largely the same...
    const openModal = useCallback((title: string, content: ReactNode) => setModalState({ isOpen: true, title, content }), []);
    const closeModal = useCallback(() => setModalState({ isOpen: false, title: '', content: null }), []);
    const showUpgradeModal = useCallback(() => openModal("Upgrade auf MeisterWerk Pro", <div>...</div>), [openModal]);
    const handleJobClick = useCallback((job: Job) => openModal(`Job: ${job.title}`, job.content ?? <p>{job.description}</p>), [openModal]);
    const handleCommunityPostClick = useCallback((post: CommunityPost) => openModal(post.title, <div>...</div>), [openModal]);
    const handlePathChange = useCallback((pathId: string) => setActivePathId(pathId), []);
    
    const handleNodeClick = useCallback((node: SkillNode, pathId: string) => {
        if (!currentUser) return;
        playSound('sound-click');
        if(node.pro && currentUser.subscriptionStatus === 'free'){
            showUpgradeModal();
            return;
        }
        
        if (node.status === 'locked') return;

        if (node.type === 'exam' && node.simulationType && node.simulationScenarioId) {
            // handleStartSimulation logic here
        } else if (node.content) {
            setCurrentCourse({ id: node.id, pathId });
        }
    }, [currentUser, showUpgradeModal]);
    
     const handleLogin = async (email: string, password_unused: string): Promise<{success: boolean, error?: string}> => {
        try {
            await signInWithEmailAndPassword(auth, email, password_unused);
            return { success: true };
        } catch (error: any) {
            console.error("Firebase login error:", error);
            return { success: false, error: "E-Mail oder Passwort ungültig." };
        }
    };

    const handleRegister = async (name: string, email: string, password_unused: string): Promise<{success: boolean, error?: string}> => {
       try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password_unused);
            const firebaseUser = userCredential.user;
            
            // Create user profile in Firestore
            const newUser: User = {
                id: firebaseUser.uid,
                name,
                email,
                avatar: name.split(' ').map(n => n[0]).join('').toUpperCase(),
                level: 1,
                xp: 0,
                wissensTokens: 5,
                role: 'user',
                subscriptionStatus: 'free',
                registeredAt: new Date().toISOString(),
                unlockedAchievements: [],
                learningProgress: {}
            };
            
            await setDoc(doc(db, "users", firebaseUser.uid), newUser);
            return { success: true };
        } catch (error: any) {
            console.error("Firebase registration error:", error);
            if (error.code === 'auth/email-already-in-use') {
                return { success: false, error: "Diese E-Mail-Adresse wird bereits verwendet." };
            }
            return { success: false, error: "Registrierung fehlgeschlagen." };
        }
    };
    
    const handleLogout = async () => {
        await signOut(auth);
    };


    const activeCourseNode = useMemo(() => {
        return allSkillNodes.find(n => n.status === 'active' && (n.content || n.type === 'exam'));
    }, [allSkillNodes]);

    if (appState === 'loading') {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
            </div>
        );
    }
    
    if (appState === 'landing') {
        return <LandingPage onNavigateToLogin={() => setAppState('login')} onNavigateToRegister={() => setAppState('register')} />;
    }

    if (appState === 'login') {
        return <LoginPage onLogin={handleLogin} onNavigateToRegister={() => setAppState('register')} />;
    }

    if (appState === 'register') {
        return <RegisterPage onRegister={handleRegister} onNavigateToLogin={() => setAppState('login')} />;
    }
    
    if (appState !== 'authenticated' || !currentUser) {
        return null; // Should be handled by other states, but as a fallback
    }
    
    const courseForView = currentCourse ? findNodeById(mergedLearningPaths[currentCourse.pathId].nodes, currentCourse.id) : null;

    const renderMainAppView = () => {
        if (courseForView) {
            return <CourseView courseNode={courseForView} coursePathId={currentCourse!.pathId} onCompleteCourse={handleCompleteNode} onBack={() => setCurrentCourse(null)} />;
        }
        
        const isNewUser = currentUser.level === 1 && currentUser.xp < 10;

        switch(view) {
            case View.Dashboard:
                return <Dashboard 
                    activeCourse={activeCourseNode}
                    onStartCourse={() => activeCourseNode && handleNodeClick(activeCourseNode, activePathId)}
                    onStartSimulation={() => {}} // Placeholder
                    levelInfo={levelInfo}
                    dailyTip={dailyTip}
                    learningPaths={mergedLearningPaths}
                    currentUser={currentUser}
                    isNewUser={isNewUser}
                    onNavigateToLearningPath={() => setView(View.LearningPath)}
                    communityPosts={communityPosts}
                />;
            case View.LearningPath:
                return <LearningPath paths={mergedLearningPaths} activePathId={activePathId} onPathChange={handlePathChange} activeSkillTree={activeSkillTree} onNodeClick={handleNodeClick} />;
             case View.Team:
                 return <TeamCockpit 
                            currentUser={currentUser} 
                            users={users} 
                            companies={companies}
                            learningPaths={mergedLearningPaths}
                            assignments={assignments}
                            onAssignTask={() => {}}
                            berichtsheft={berichtsheft}
                            onUpdateBerichtsheft={() => {}}
                        />;
            case View.Experts:
                 return <ExpertsView experts={experts} />;
            case View.Events:
                 return <EventsView events={events} experts={experts} />;
            case View.Community:
                return <Community 
                    currentUser={currentUser} 
                    users={users}
                    posts={communityPosts}
                    onRewardUser={() => {}}
                />;
            case View.Career:
                return <Career 
                            onJobClick={handleJobClick} 
                            skillData={skillData} 
                            currentUser={currentUser} 
                            onUpgrade={showUpgradeModal} 
                            jobs={jobs}
                        />;
            case View.Admin:
                return <AdminPanel 
                            learningPaths={mergedLearningPaths} 
                            setLearningPaths={() => {}}
                            users={users}
                            setUsers={setUsers}
                            companies={companies}
                            setCompanies={setCompanies}
                            onExit={() => setView(View.Dashboard)}
                        />;
            default:
                return <Dashboard 
                    activeCourse={activeCourseNode}
                    onStartCourse={() => {}}
                    onStartSimulation={() => {}}
                    levelInfo={levelInfo}
                    dailyTip={dailyTip}
                    learningPaths={mergedLearningPaths}
                    currentUser={currentUser}
                    isNewUser={isNewUser}
                    onNavigateToLearningPath={() => setView(View.LearningPath)}
                    communityPosts={communityPosts}
                />;
        }
    };

    return (
        <div className="flex h-screen bg-transparent">
            <Sidebar 
                activeView={view} 
                setActiveView={setView} 
                onUpgradeClick={showUpgradeModal}
                currentUser={currentUser}
                levelInfo={levelInfo}
                hasNewAssignment={false} // Placeholder
                onLogout={handleLogout}
                onSettingsClick={() => {}} // Placeholder
            />
            <main className="flex flex-col flex-1 p-8 overflow-y-auto">
                <Header
                    lastXpGain={lastXpGain}
                    currentUser={currentUser}
                />
                <div className="flex-grow">
                    {renderMainAppView()}
                </div>
                <AiBot currentUser={currentUser} />
            </main>
            {modalState.isOpen && (
                <Modal 
                    isOpen={modalState.isOpen} 
                    onClose={closeModal} 
                    title={modalState.title}
                >
                    {modalState.content}
                </Modal>
            )}
            {toast && <Toast notification={toast.notification} type={toast.type} />}
        </div>
    );
};

export default App;
