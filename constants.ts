import { CommunityPost, Job, View, SkillCategory, LearningPathCollection, CourseContent, SkillNode, SkillStatus, SimulationType, User, Company, Expert, MWDEvent, PaletteComponent, ExamTask, ConnectionPoint, ComponentType, Achievement, SimulationDetails, PlanningScenario, PlacedComponent, Wire, GuildAchievement, StatusUpdate, Conversation, LearningRoom, UserMessage } from './types';
import { LayoutDashboard, GitMerge, Cpu, MessageSquare, Briefcase, Settings, LogOut, Gem, Shield, Users, Mic, CalendarDays, GraduationCap, Zap, Star, Trophy, Sparkles, BookOpen, Calculator, Atom, Swords, Network, Rss, MessageCircle, PenSquare } from 'lucide-react';

export const NAV_ITEMS = [
    { id: View.Dashboard, label: 'Dashboard', icon: LayoutDashboard },
    { id: View.LearningPath, label: 'Lernbaum', icon: GitMerge },
    { id: View.Social, label: 'Social', icon: Network },
    { id: View.Gilde, label: 'Meine Gilde', icon: Shield },
    { id: View.Experts, label: 'Experten', icon: Mic },
    { id: View.Events, label: 'Events', icon: CalendarDays },
    { id: View.Community, label: 'Community', icon: MessageSquare },
    { id: View.Career, label: 'Karriere', icon: Briefcase },
];

export const SETTINGS_NAV_ITEMS = [
    { id: 'settings', label: 'Einstellungen', icon: Settings },
    { id: 'admin', label: 'Admin Panel', icon: Shield },
    { id: 'logout', label: 'Abmelden', icon: LogOut },
];

export const UPGRADE_NAV_ITEM = { id: 'upgrade', label: 'Upgrade auf Pro', icon: Gem };

export const MOCK_COMPANY_DATA: Company[] = [
    { id: 1, name: 'Elektro-Blitz GmbH' },
    { id: 2, name: 'SmartHome Solutions' },
];

// NOTE: This data is now for reference or initial seeding.
// The primary source of truth is Firebase Firestore. User IDs are strings (UIDs).
export const MOCK_USER_DATA: User[] = [
  { id: 'user-1', name: 'Alex Schmidt', email: 'alex.schmidt@email.de', avatar: 'AS', level: 1, xp: 150, wissensTokens: 5, role: 'user', subscriptionStatus: 'free', registeredAt: '2023-10-26T10:00:00Z', unlockedAchievements: [], friends: ['user-2', 'user-4'], friendRequests: [] },
  { id: 'user-2', name: 'Azubi Flo', email: 'flo.azubi@email.de', avatar: 'AF', level: 2, xp: 250, wissensTokens: 10, role: 'azubi', companyId: 1, subscriptionStatus: 'pro', registeredAt: '2023-10-25T11:20:00Z', unlockedAchievements: [], friends: ['user-1', 'user-3'], friendRequests: [] },
  { id: 'user-3', name: 'Meister Klaus', email: 'klaus.meister@email.de', avatar: 'MK', level: 15, xp: 12500, wissensTokens: 50, role: 'meister', companyId: 1, subscriptionStatus: 'pro', registeredAt: '2023-08-10T08:00:00Z', unlockedAchievements: [], friends: ['user-2', 'user-7'], friendRequests: [] },
  { id: 'user-4', name: 'Elektro Sarah', email: 'sarah.e@email.de', avatar: 'ES', level: 8, xp: 4800, wissensTokens: 20, role: 'user', subscriptionStatus: 'free', registeredAt: '2023-11-01T15:45:00Z', unlockedAchievements: [], friends: ['user-1'], friendRequests: [ { fromId: 'user-5', fromName: 'Bernd Stromberg', fromAvatar: 'BS' }] },
  { id: 'user-5', name: 'Bernd Stromberg', email: 'bernd.s@email.de', avatar: 'BS', level: 3, xp: 550, wissensTokens: 0, role: 'user', subscriptionStatus: 'free', registeredAt: '2024-01-20T12:10:00Z', unlockedAchievements: [], friends: [], friendRequests: [] },
  { id: 'user-6', name: 'Techniker Tom', email: 'tom.t@email.de', avatar: 'TT', level: 11, xp: 7200, wissensTokens: 35, role: 'user', subscriptionStatus: 'pro', registeredAt: '2023-09-05T18:00:00Z', unlockedAchievements: [], friends: ['user-7'], friendRequests: [] },
  { id: 'user-7', name: 'Ingenieur-Inga', email: 'inga.i@email.de', avatar: 'II', level: 18, xp: 21000, wissensTokens: 100, role: 'meister', companyId: 2, subscriptionStatus: 'pro', registeredAt: '2023-02-15T09:30:00Z', unlockedAchievements: [], friends: ['user-3', 'user-6'], friendRequests: [] },
];

export const MOCK_STATUS_UPDATES: StatusUpdate[] = [
    { id: 'status-1', authorId: 'user-2', content: 'Endlich die Wechselschaltung gemeistert! Fühlt sich gut an. 💪 #AzubiLife', timestamp: '2024-05-20T12:30:00Z', likes: ['user-3', 'user-1'], comments: [] },
    { id: 'status-2', authorId: 'user-3', content: 'Neuer VDE-Normen Kurs online. Sehr zu empfehlen für alle, die auf dem Laufenden bleiben wollen!', timestamp: '2024-05-20T09:00:00Z', likes: ['user-2', 'user-4', 'user-7'], comments: []},
    { id: 'status-3', authorId: 'user-4', content: 'Hat jemand einen Tipp für eine gute Crimpzange für Aderendhülsen?', timestamp: '2024-05-19T18:00:00Z', likes: [], comments: []},
];

const MOCK_MESSAGES: UserMessage[] = [
    { id: 'msg-1', senderId: 'user-2', text: 'Hey Meister Klaus, ich habe eine Frage zur Aufgabe.', timestamp: '2024-05-20T14:00:00Z'},
    { id: 'msg-2', senderId: 'user-3', text: 'Hallo Flo, immer her damit. Worum geht es?', timestamp: '2024-05-20T14:01:00Z'},
    { id: 'msg-3', senderId: 'user-2', text: 'Bei der VDE 0100-410, geht es da um...', timestamp: '2024-05-20T14:02:00Z'},
];

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'conv-1',
        participantIds: ['user-2', 'user-3'],
        participantInfo: [
            { id: 'user-2', name: 'Azubi Flo', avatar: 'AF' },
            { id: 'user-3', name: 'Meister Klaus', avatar: 'MK' },
        ],
        messages: MOCK_MESSAGES,
        isGroup: false,
        unreadCount: 1,
    },
    {
        id: 'conv-2',
        participantIds: ['user-1', 'user-4'],
        participantInfo: [
             { id: 'user-1', name: 'Alex Schmidt', avatar: 'AS' },
             { id: 'user-4', name: 'Elektro Sarah', avatar: 'ES' },
        ],
        messages: [{id: 'grp-msg-1', senderId: 'user-4', text: 'Lust auf ein gemeinsames Projekt?', timestamp: '2024-05-19T10:00:00Z'}],
        isGroup: false,
        unreadCount: 0,
    },
    {
        id: 'conv-3',
        participantIds: ['user-3', 'user-6', 'user-7'],
        participantInfo: [
             { id: 'user-3', name: 'Meister Klaus', avatar: 'MK' },
             { id: 'user-6', name: 'Techniker Tom', avatar: 'TT' },
             { id: 'user-7', name: 'Ingenieur-Inga', avatar: 'II' },
        ],
        messages: [{id: 'grp-msg-2', senderId: 'user-7', text: 'Lasst uns die neue PV-Norm diskutieren.', timestamp: '2024-05-18T15:00:00Z'}],
        isGroup: true,
        groupName: 'Profi-Talk ⚡️',
        unreadCount: 3,
    }
];

export const MOCK_LEARNING_ROOMS: LearningRoom[] = [
    {
        id: 'room-1',
        name: 'VDE 0100 Grundlagen',
        hostId: 'user-3',
        participants: [
            { id: 'user-3', name: 'Meister Klaus', avatar: 'MK' },
            { id: 'user-2', name: 'Azubi Flo', avatar: 'AF' },
            { id: 'user-4', name: 'Elektro Sarah', avatar: 'ES' },
        ],
        whiteboardState: {},
        chat: []
    },
    {
        id: 'room-2',
        name: 'KNX Projektplanung',
        hostId: 'user-7',
        participants: [
            { id: 'user-7', name: 'Ingenieur-Inga', avatar: 'II' },
            { id: 'user-6', name: 'Techniker Tom', avatar: 'TT' },
        ],
        whiteboardState: {},
        chat: []
    }
];

export const SOCIAL_TABS = [
    { id: 'feed', label: 'Feed', icon: Rss },
    { id: 'friends', label: 'Freunde', icon: Users },
    { id: 'messages', label: 'Nachrichten', icon: MessageCircle },
    { id: 'rooms', label: 'Lernräume', icon: PenSquare },
];


export const SIM_DATA: SimulationDetails[] = [
    { title: "Digitaler Zwilling", description: "Bauen Sie Schaltungen auf einem virtuellen Brett.", type: 'digital-twin', xp: 150, pro: false, modes: [{id: 'sandbox', name: 'Sandbox'}, {id: 'exam', name: 'Prüfung'}] },
    { title: "AEVO Unterweisung", description: "Führen Sie einen virtuellen Azubi durch eine Aufgabe.", type: 'aevo', xp: 200, pro: true },
    { title: "Meister-Projekt", description: "Planen und kalkulieren Sie ein vollständiges Projekt.", type: 'meister-project', xp: 500, pro: true },
    { title: "Schaltungs-Planung", description: "Berechnen Sie Leitungen und Sicherungen für Anlagen.", type: 'planning', xp: 100, pro: false, scenarioCount: 2 },
    { title: "Fehlersuche", description: "Finden Sie den Fehler in einer defekten Anlage.", type: 'troubleshooting', xp: 250, pro: true },
];

export const PLANNING_SCENARIOS: PlanningScenario[] = [
    {
        id: 'scenario-1',
        title: "Werkstatt-Verteilung",
        description: "Planen Sie die Zuleitungen für eine kleine Werkstatt. Gegeben sind die Geräte, berechnen Sie die notwendigen Ströme, Sicherungen und Querschnitte.",
        devices: [
            { id: 1, name: 'Kreissäge', type: 'D-Motor', P_kW: 4.0, cosPhi: 0.85, eta: 0.88, length_m: 15 },
            { id: 2, name: 'Kompressor', type: 'D-Motor', P_kW: 2.2, cosPhi: 0.82, eta: 0.85, length_m: 20 },
            { id: 3, name: 'Heizlüfter', type: 'AC', P_kW: 2.0, cosPhi: 1.0, eta: null, length_m: 10 },
        ],
        correctSolutions: [
            { Pzu_kW: '4.55', I_A_WS: '', I_A_DS: '7.8', Sicherung_A: '16', A_mm2: '2.5' },
            { Pzu_kW: '2.59', I_A_WS: '', I_A_DS: '4.6', Sicherung_A: '16', A_mm2: '1.5' },
            { Pzu_kW: '2.0', I_A_WS: '8.7', I_A_DS: '', Sicherung_A: '10', A_mm2: '1.5' },
        ]
    }
];


// --- Digital Twin Constants ---
export const PALETTE_COMPONENTS: PaletteComponent[] = [
    { name: "Steckdose", type: 'socket', cost: 10 },
    { name: "Doppelsteckdose", type: 'socket-double', cost: 15 },
    { name: "Lichtschalter", type: 'switch', cost: 8 },
    { name: "Deckenleuchte", type: 'light', cost: 25 },
    { name: "Abzweigdose", type: 'junction-box', cost: 5 },
    { name: "Stromquelle", type: 'power-source', cost: 0 },
];

export const EXAM_TASKS: ExamTask[] = [
    {
        id: 'task1',
        description: "Erstellen Sie eine einfache Ausschaltung. Platzieren Sie eine Stromquelle, einen Schalter und eine Leuchte an den normgerechten Positionen.",
        requiredComponents: [
            { type: 'power-source', count: 1 },
            { type: 'switch', count: 1 },
            { type: 'light', count: 1 },
            { type: 'junction-box', count: 1 },
        ],
    },
    {
        id: 'task2',
        description: "Installieren Sie eine geschaltete Steckdose. Platzieren Sie Stromquelle, Schalter und Steckdose normgerecht.",
        requiredComponents: [
            { type: 'power-source', count: 1 },
            { type: 'switch', count: 1 },
            { type: 'socket', count: 1 },
            { type: 'junction-box', count: 2 },
        ],
    }
];

export const COMPONENT_CONNECTION_POINTS: Record<ComponentType, ConnectionPoint[]> = {
    'socket': [ {id: 'L', x: 20, y: 50}, {id: 'N', x: 50, y: 50}, {id: 'PE', x: 80, y: 50} ],
    'socket-double': [ {id: 'L', x: 20, y: 50}, {id: 'N', x: 50, y: 50}, {id: 'PE', x: 80, y: 50} ],
    'switch': [ {id: 'L_in', x: 50, y: 20}, {id: 'L_out', x: 50, y: 80} ],
    'light': [ {id: 'L', x: 30, y: 50}, {id: 'N', x: 70, y: 50} ],
    'junction-box': [
        {id: 'p1', x: 20, y: 20}, {id: 'p2', x: 50, y: 20}, {id: 'p3', x: 80, y: 20},
        {id: 'p4', x: 20, y: 80}, {id: 'p5', x: 50, y: 80}, {id: 'p6', x: 80, y: 80},
    ],
    'power-source': [ {id: 'L', x: 30, y: 50}, {id: 'N', x: 50, y: 50}, {id: 'PE', x: 70, y: 50} ],
};

export const TROUBLESHOOTING_PRESET = {
    components: [
        { id: 'ps1', name: 'Stromquelle', type: 'power-source', x: 10, y: 90, isOn: true, connectionPoints: COMPONENT_CONNECTION_POINTS['power-source'] },
        { id: 'jb1', name: 'Abzweigdose', type: 'junction-box', x: 30, y: 30, connectionPoints: COMPONENT_CONNECTION_POINTS['junction-box'] },
        { id: 'sw1', name: 'Lichtschalter', type: 'switch', x: 15, y: 40, isToggled: false, connectionPoints: COMPONENT_CONNECTION_POINTS['switch'] },
        { id: 'li1', name: 'Deckenleuchte', type: 'light', x: 80, y: 20, connectionPoints: COMPONENT_CONNECTION_POINTS['light'] },
    ] as PlacedComponent[],
    wires: [
        { id: 'w1', startComponentId: 'ps1', startPointId: 'L', endComponentId: 'jb1', endPointId: 'p1', color: 'L' },
        { id: 'w2', startComponentId: 'ps1', startPointId: 'N', endComponentId: 'jb1', endPointId: 'p2', color: 'N' },
        { id: 'w3', startComponentId: 'ps1', startPointId: 'PE', endComponentId: 'jb1', endPointId: 'p3', color: 'PE' },
        { id: 'w4', startComponentId: 'jb1', startPointId: 'p1', endComponentId: 'sw1', endPointId: 'L_in', color: 'L' },
        { id: 'w5', startComponentId: 'sw1', startPointId: 'L_out', endComponentId: 'jb1', endPointId: 'p4', color: 'switched' },
        { id: 'w6', startComponentId: 'jb1', startPointId: 'p4', endComponentId: 'li1', endPointId: 'L', color: 'switched' },
        { id: 'w7', startComponentId: 'jb1', startPointId: 'p2', endComponentId: 'li1', endPointId: 'N', color: 'N' },
    ] as Wire[],
};


export const JOB_DATA: Job[] = [
    { id: 1, title: "Elektriker für Gebäudeinstallation", company: "Elektro-Blitz GmbH", match: 85, tags: ['grundlagen', 'normen', 'gebaeudetechnik'], description: "Installation und Wartung von elektrischen Anlagen in Wohn- und Gewerbebauten." },
    { id: 2, title: "Servicetechniker für Automatisierung", company: "SmartHome Solutions", match: 60, tags: ['automatisierung', 'messtechnik', 'kundenberatung'], description: "Inbetriebnahme und Wartung von KNX- und Smart-Home-Systemen." },
    { id: 3, title: "Meister als Projektleiter", company: "EnergieWende AG", match: 40, tags: ['projektplanung', 'betriebswirtschaft', 'paedagogik'], description: "Leitung von Großprojekten im Bereich erneuerbare Energien und Photovoltaik." },
];

export const COMMUNITY_DATA: CommunityPost[] = [
    { id: 1, authorId: 'user-3', author: 'Meister Klaus', authorRole: 'meister', avatar: 'MK', color: '3b82f6', title: "Wichtige Änderung in der DIN VDE 0100-410", comments: [{id: 1, authorId: 'user-2', author: 'Azubi Flo', authorRole: 'azubi', avatar: 'AF', color: '10b981', content: 'Super, danke für den Hinweis!', date: '2024-03-22T11:00:00Z', kudos: 1}], content: "Hallo zusammen, denkt daran, dass die neuen Anforderungen für den zusätzlichen Schutz durch RCDs jetzt auch auf Steckdosen bis 32 A im Außenbereich ausgeweitet wurden. Das ist besonders bei Baustellen und landwirtschaftlichen Betriebsstätten relevant.", isMeisterPost: true, kudos: 5, tags: ['normen', 'gebaeudetechnik'], date: '2024-03-22T10:30:00Z'},
    { id: 2, authorId: 'user-2', author: 'Azubi Flo', authorRole: 'azubi', avatar: 'AF', color: '10b981', title: "Frage zur Wechselschaltung", comments: [], content: "Ich bin mir unsicher, wo genau die korrespondierenden Drähte angeklemmt werden. Kann mir jemand eine einfache Eselsbrücke nennen?", isMeisterPost: false, kudos: 2, tags: ['grundlagen'], date: '2024-03-21T15:00:00Z'},
];


export const MOCK_EXPERT_DATA: Expert[] = [
    { id: 1, name: "Dr. Ing. Klaus Voltmann", title: "Spezialist für VDE-Normen", specialties: ['normen', 'recht'], costPerSession: 50, imageUrl: "https://i.pravatar.cc/150?u=expert1" },
    { id: 2, name: "Katharina Funke", title: "KNX-Programmiererin", specialties: ['automatisierung', 'projektplanung'], costPerSession: 40, imageUrl: "https://i.pravatar.cc/150?u=expert2" },
    { id: 3, name: "Meister Peter Kurzschluss", title: "Praktiker für Fehlersuche", specialties: ['messtechnik', 'gebaeudetechnik'], costPerSession: 30, imageUrl: "https://i.pravatar.cc/150?u=expert3" },
];

export const MWD_EVENTS: MWDEvent[] = [
    { id: 1, title: "Live-Webinar: Die neue VDE 0100-704 für Baustellen", description: "Dr. Voltmann erklärt die wichtigsten Änderungen und worauf bei der Umsetzung zu achten ist.", expertId: 1, date: "2024-06-15T18:00:00Z", isUpcoming: true, tags: ['normen', 'gebaeudetechnik'], videoId: "" },
    { id: 2, title: "Aufzeichnung: Effiziente Fehlersuche in der Praxis", description: "Meister Kurzschluss zeigt seine bewährten Methoden, um Fehler schnell und sicher zu finden.", expertId: 3, date: "2024-05-20T18:00:00Z", isUpcoming: false, tags: ['messtechnik'], videoId: "m_PeZCeS-pM" },
];


export const GUILD_ACHIEVEMENT_DATA: Record<string, GuildAchievement> = {
    TEAM_PLAYER: { id: 'TEAM_PLAYER', name: "Team-Player", description: "Erster gemeinsamer Erfolg der Gilde.", icon: Users },
    POWER_LEARNERS: { id: 'POWER_LEARNERS', name: "Power-Lerner", description: "Die Gilde hat 5 Lernpfade abgeschlossen.", icon: Zap },
    GUILD_MASTERY: { id: 'GUILD_MASTERY', name: "Gilden-Meisterschaft", description: "Alle Mitglieder der Gilde sind über Level 10.", icon: Swords },
}

export const ACHIEVEMENT_DATA: Record<string, Achievement> = {
    FIRST_STEP: { id: 'FIRST_STEP', name: "Erster Schritt", description: "Schließe deine erste Lektion ab.", icon: GraduationCap },
    FIVE_COMPLETE: { id: 'FIVE_COMPLETE', name: "Wissensdurstig", description: "Schließe 5 Lektionen ab.", icon: BookOpen },
    SIM_PRO: { id: 'SIM_PRO', name: "Praktiker", description: "Schließe deine erste Simulation ab.", icon: Cpu },
    SIM_MASTER: { id: 'SIM_MASTER', name: "Simulations-Meister", description: "Schließe eine Pro-Simulation ab.", icon: Atom },
    LEVEL_5: { id: 'LEVEL_5', name: "Geselle", description: "Erreiche Level 5.", icon: Star },
    LEVEL_10: { id: 'LEVEL_10', name: "Obergeselle", description: "Erreiche Level 10.", icon: Trophy },
    PRO_USER: { id: 'PRO_USER', name: "Pro-Mitglied", description: "Unterstütze die Plattform mit einem Pro-Abo.", icon: Gem },
    COMMUNITY_HELPER: { id: 'COMMUNITY_HELPER', name: "Hilfsbereit", description: "Beantworte eine Frage in der Community.", icon: MessageSquare },
};


export const SKILL_CATEGORIES: Record<SkillCategory, { label: string, color: string, fullMark: number }> = {
    grundlagen: { label: 'Grundlagen', color: '#3b82f6', fullMark: 1000 },
    normen: { label: 'Normen & Vorschriften', color: '#ef4444', fullMark: 2000 },
    messtechnik: { label: 'Mess- & Prüftechnik', color: '#f97316', fullMark: 1500 },
    gebaeudetechnik: { label: 'Gebäudetechnik', color: '#10b981', fullMark: 2500 },
    projektplanung: { label: 'Projektplanung', color: '#8b5cf6', fullMark: 1800 },
    kundenberatung: { label: 'Kundenberatung', color: '#ec4899', fullMark: 800 },
    betriebswirtschaft: { label: 'Betriebswirtschaft', color: '#6366f1', fullMark: 1200 },
    recht: { label: 'Rechtliche Grundlagen', color: '#d946ef', fullMark: 1000 },
    paedagogik: { label: 'Arbeitspädagogik', color: '#f59e0b', fullMark: 900 },
    automatisierung: { label: 'Automatisierungstechnik', color: '#0ea5e9', fullMark: 3000 },
    allgemein: { label: 'Allgemein', color: '#64748b', fullMark: 0 },
};


const createCourseContent = (videoId: string, description: string, text: string, quizCount = 2, flashcardCount = 2): CourseContent => ({
    videoId,
    description,
    textContent: text,
    quiz: Array.from({ length: quizCount }, (_, i) => ({
        question: `Frage ${i + 1} zum Thema?`,
        options: ['Antwort A', 'Antwort B', 'Antwort C', 'Antwort D'],
        correctAnswerIndex: 0,
        explanation: `Erklärung für Frage ${i + 1}.`
    })),
    flashcards: Array.from({ length: flashcardCount }, (_, i) => ({
        front: `Begriff ${i + 1}`,
        back: `Definition von Begriff ${i + 1}.`
    })),
});


export const LEARNING_PATH_DATA: LearningPathCollection = {
    ausbildung_elektroniker: {
        id: 'ausbildung_elektroniker',
        title: 'Grundausbildung Elektroniker',
        description: 'Der grundlegende Pfad für alle angehenden Elektroniker. Meistern Sie die wichtigsten Fähigkeiten.',
        sealImage: "https://img.icons8.com/plasticine/100/medal.png",
        pro: false,
        nodes: [
            {
                id: 'grundlagen_sicherheit', status: 'locked', xp: 50, category: 'grundlagen',
                title: '5 Sicherheitsregeln',
                content: createCourseContent('7g_pB8i4I-U', 'Lernen Sie die lebenswichtigen 5 Sicherheitsregeln der Elektrotechnik.', '<h2>Die 5 Sicherheitsregeln</h2><p>Diese Regeln sind fundamental...</p>'),
                children: [
                    {
                        id: 'grundlagen_schaltungen', status: 'locked', xp: 75, category: 'grundlagen',
                        title: 'Grundschaltungen',
                        content: createCourseContent('iTz_2OaIn_M', 'Verstehen Sie die Funktionsweise von Aus-, Wechsel- und Kreuzschaltungen.', '<h2>Grundschaltungen der Elektroinstallation</h2>...'),
                        children: [
                            { 
                                id: 'sim_ausschaltung', title: 'Sim: Ausschaltung', xp: 100, category: 'gebaeudetechnik',
                                type: 'exam', simulationType: 'digital-twin', simulationScenarioId: 'exam-ausschaltung', status: 'locked',
                            },
                        ]
                    },
                ],
            },
            {
                id: 'normen_vde0100', status: 'locked', xp: 100, category: 'normen',
                title: 'VDE 0100-410',
                content: createCourseContent('videoseries?list=PL4gQ0__215wPv-4XifOdbBkT_Yj3yYlO-', 'Die wichtigsten Schutzmaßnahmen und Anforderungen der VDE 0100-410.', '<h2>Schutz gegen elektrischen Schlag</h2><p>Diese Norm ist eine der wichtigsten...</p>'),
                children: [
                    {
                         id: 'pruefung_vde', title: 'Prüfung: VDE 0100-600', xp: 150, category: 'messtechnik',
                         type: 'exam', simulationType: 'troubleshooting', simulationScenarioId: 'vde-check', status: 'locked', pro: true,
                    },
                ]
            },
        ],
    },
    meister_1_4: {
        id: 'meister_1_4',
        title: 'Meister Teil 1-4',
        description: 'Der komplette Vorbereitungskurs für die Meisterprüfung im Elektrohandwerk.',
        sealImage: "https://img.icons8.com/fluency/96/trophy.png",
        pro: true,
        locked: true,
        nodes: [
             {
                id: 'meister_projekt', title: 'Sim: Meisterprojekt', xp: 500, category: 'projektplanung',
                type: 'exam', simulationType: 'meister-project', simulationScenarioId: 'meister-efh', status: 'locked', pro: true,
            },
             {
                id: 'meister_aevo', title: 'Sim: AEVO Prüfung', xp: 200, category: 'paedagogik',
                type: 'exam', simulationType: 'aevo', simulationScenarioId: 'aevo-wechselschaltung', status: 'locked', pro: true,
            }
        ]
    },
     industriemeister_bq: {
        id: 'industriemeister_bq',
        title: 'Industriemeister BQ',
        description: 'Die Basisqualifikationen für angehende Industriemeister der Fachrichtung Elektrotechnik.',
        sealImage: "https://img.icons8.com/external-justicon-lineal-color-justicon/64/external-factory-building-justicon-lineal-color-justicon.png",
        pro: true,
        locked: true,
        nodes: [
            {
                id: 'im_plan', title: 'Sim: Werkstatt planen', xp: 100, category: 'projektplanung',
                type: 'exam', simulationType: 'planning', simulationScenarioId: 'scenario-1', status: 'locked', pro: true,
            },
        ]
    },
     trei: {
        id: 'trei',
        title: 'Vorbereitung TREI',
        description: 'Vorbereitung auf die Prüfung zum "Technischen Verantwortlichen Elektro-Installation".',
        sealImage: "https://img.icons8.com/dusk/64/lightning-bolt.png",
        pro: true,
        locked: true,
        nodes: []
    }
};