

import { CommunityPost, Job, View, SkillCategory, LearningPathCollection, CourseContent, SkillNode, SkillStatus, SimulationType, User, Company, Expert, MWDEvent, PaletteComponent, ExamTask, ConnectionPoint, ComponentType, Achievement, SimulationDetails, PlanningScenario, PlacedComponent, Wire } from './types';
import { LayoutDashboard, GitMerge, Cpu, MessageSquare, Briefcase, Settings, LogOut, Gem, Shield, Building2, Mic, CalendarDays, GraduationCap, Zap, Star, Trophy, Sparkles, BookOpen, Calculator, Atom } from 'lucide-react';

export const NAV_ITEMS = [
    { id: View.Dashboard, label: 'Dashboard', icon: LayoutDashboard },
    { id: View.LearningPath, label: 'Lernbaum', icon: GitMerge },
    // { id: View.Simulations, label: 'Simulationen', icon: Cpu }, // Removed from nav
    { id: View.Team, label: 'Team-Cockpit', icon: Building2 },
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
  { id: 'user-1', name: 'Alex Schmidt', email: 'alex.schmidt@email.de', avatar: 'AS', level: 1, xp: 150, wissensTokens: 5, role: 'user', subscriptionStatus: 'free', registeredAt: '2023-10-26T10:00:00Z', unlockedAchievements: [] },
  { id: 'user-2', name: 'Azubi Flo', email: 'flo.azubi@email.de', avatar: 'AF', level: 2, xp: 250, wissensTokens: 10, role: 'azubi', companyId: 1, subscriptionStatus: 'pro', registeredAt: '2023-10-25T11:20:00Z', unlockedAchievements: [] },
  { id: 'user-3', name: 'Meister Klaus', email: 'klaus.meister@email.de', avatar: 'MK', level: 15, xp: 12500, wissensTokens: 50, role: 'meister', companyId: 1, subscriptionStatus: 'pro', registeredAt: '2023-08-10T08:00:00Z', unlockedAchievements: [] },
  { id: 'user-4', name: 'Elektro Sarah', email: 'sarah.e@email.de', avatar: 'ES', level: 8, xp: 4800, wissensTokens: 20, role: 'user', subscriptionStatus: 'free', registeredAt: '2023-11-01T15:45:00Z', unlockedAchievements: [] },
  { id: 'user-5', name: 'Bernd Stromberg', email: 'bernd.s@email.de', avatar: 'BS', level: 3, xp: 550, wissensTokens: 0, role: 'user', subscriptionStatus: 'free', registeredAt: '2024-01-20T12:10:00Z', unlockedAchievements: [] },
  { id: 'user-6', name: 'Jana Gesellin', email: 'jana.g@email.de', avatar: 'JG', level: 5, xp: 2100, wissensTokens: 15, role: 'azubi', companyId: 2, subscriptionStatus: 'pro', registeredAt: '2023-12-15T18:30:00Z', unlockedAchievements: [] },
  { id: 'user-7', name: 'CEO Petra', email: 'petra.ceo@smarthome.de', avatar: 'CP', level: 18, xp: 18000, wissensTokens: 100, role: 'meister', companyId: 2, subscriptionStatus: 'pro', registeredAt: '2023-01-15T09:00:00Z', unlockedAchievements: [] },
];

export const ACHIEVEMENT_DATA: Record<string, Achievement> = {
    'FIRST_STEP': { id: 'FIRST_STEP', name: 'Erster Schritt', description: 'Schließe deinen ersten Kurs ab.', icon: GraduationCap },
    'FIVE_COMPLETE': { id: 'FIVE_COMPLETE', name: 'Wissensdurstig', description: 'Schließe 5 Kurse ab.', icon: BookOpen },
    'LEVEL_5': { id: 'LEVEL_5', name: 'Geselle', description: 'Erreiche Level 5.', icon: Star },
    'LEVEL_10': { id: 'LEVEL_10', name: 'Meisteranwärter', description: 'Erreiche Level 10.', icon: Trophy },
    'SIM_PRO': { id: 'SIM_PRO', name: 'Praktiker', description: 'Schließe deine erste Simulation ab.', icon: Zap },
    'SIM_MASTER': { id: 'SIM_MASTER', name: 'Sim-Meister', description: 'Schließe eine Pro-Simulation erfolgreich ab.', icon: Atom },
    'PRO_USER': { id: 'PRO_USER', name: 'Pro-Mitglied', description: 'Schalte die Pro-Version frei.', icon: Sparkles },
};

export const MOCK_EXPERT_DATA: Expert[] = [
    { id: 1, name: 'Dr. Ing. Hans-Peter Richter', title: 'VDE-Normenpapst', specialties: ['normen', 'recht'], costPerSession: 40, imageUrl: 'https://placehold.co/128x128/1e293b/ffffff?text=HR' },
    { id: 2, name: 'Sabine Weiss', title: 'KNX & Smart Home Guru', specialties: ['gebaeudetechnik', 'projektplanung'], costPerSession: 35, imageUrl: 'https://placehold.co/128x128/3b82f6/ffffff?text=SW' },
    { id: 3, name: 'Jürgen Schmid', title: 'Meister der Automatisierung', specialties: ['automatisierung', 'messtechnik'], costPerSession: 30, imageUrl: 'https://placehold.co/128x128/a855f7/ffffff?text=JS' },
];

export const COMMUNITY_DATA: CommunityPost[] = [
    { id: 1, authorId: 'user-2', author: 'Azubi_Flo', authorRole: 'azubi', avatar: 'AF', color: '3b82f6', title: 'Wie schließe ich diesen alten Motor richtig an?', comments: 12, content: 'Hallo zusammen, ich stehe vor diesem alten Motor und bin unsicher wegen der Klemmbelegung. Die Klemmen sind mit U1, V1, W1 und U2, V2, W2 bezeichnet. Es ist ein Drehstrommotor. Muss ich den in Stern oder Dreieck schalten und wie sehe ich das? Foto anbei.', isMeisterPost: false, kudos: 5, tags: ['grundlagen', 'automatisierung'] },
    { id: 2, authorId: 'user-3', author: 'Meister_Klaus', authorRole: 'meister', avatar: 'MK', color: '22c55e', title: 'Beste Vorgehensweise: Fehlersuche in KNX-Anlagen.', comments: 8, content: 'Lasst uns mal Best Practices sammeln. Mein erster Tipp: Immer die Busspannung als Erstes prüfen! Sie sollte zwischen 28V und 31V liegen. Ein zu niedriger Wert deutet oft auf einen Kurzschluss oder eine Überlastung hin. Was sind eure Erfahrungen?', isMeisterPost: true, kudos: 12, tags: ['gebaeudetechnik', 'messtechnik'] },
    { id: 3, authorId: 'user-4', author: 'Elektro_Sarah', authorRole: 'user', avatar: 'ES', color: 'f97316', title: 'Zeigt her eure Schaltschränke! #SchaltschrankPorn', comments: 34, content: 'Ich fange mal an mit meinem neuesten Projekt für ein Einfamilienhaus. Alles sauber mit WAGO-Klemmen verdrahtet, Hager-Automaten und einem Theben KNX-Aktor. Bin stolz auf die saubere Verdrahtung!', isMeisterPost: false, kudos: 2, tags: ['allgemein'] }
];

export const JOB_DATA: Job[] = [
    { id: 1, title: 'Elektroniker (m/w/d) für Gebäudetechnik', company: 'Elektro-Blitz GmbH, Kassel', match: 92, tags: ['gebaeudetechnik', 'normen'], description: 'Zur Verstärkung unseres Teams suchen wir einen engagierten Elektroniker mit Schwerpunkt auf moderner Gebäudetechnik und Smart-Home-Lösungen.' },
    { id: 2, title: 'Servicetechniker für Sicherheitstechnik', company: 'SecureHome AG, Göttingen', match: 78, tags: ['messtechnik', 'normen'], description: 'Sie sind verantwortlich für die Wartung und Inbetriebnahme von Alarmanlagen und Videoüberwachungssystemen bei unseren Kunden vor Ort.' },
    { id: 3, title: 'KNX-Systemintegrator (m/w/d)', company: 'SmartHome Solutions, Frankfurt', match: 65, tags: ['gebaeudetechnik', 'projektplanung', 'kundenberatung'], description: 'Planung und Programmierung von KNX-Anlagen für anspruchsvolle Privat- und Geschäftskunden.'}
];

export const SKILL_CATEGORIES: Record<SkillCategory, { label: string; fullMark: number }> = {
    grundlagen: { label: 'Grundlagen', fullMark: 100 },
    normen: { label: 'Normenwissen', fullMark: 150 },
    messtechnik: { label: 'VDE-Messtechnik', fullMark: 100 },
    gebaeudetechnik: { label: 'Gebäudesystemtechnik', fullMark: 150 },
    automatisierung: { label: 'Automatisierung', fullMark: 150},
    projektplanung: { label: 'Projektplanung', fullMark: 100 },
    kundenberatung: { label: 'Kundenberatung', fullMark: 100 },
    betriebswirtschaft: { label: 'Betriebswirtschaft', fullMark: 100 },
    recht: { label: 'Recht & Steuern', fullMark: 100 },
    paedagogik: { label: 'Berufs-/Arbeitspädagogik', fullMark: 100 },
    allgemein: { label: 'Allgemein', fullMark: 0 },
};

export const SIM_DATA: SimulationDetails[] = [
    { type: 'planning', title: "Planung & Kalkulation", pro: true, description: "Berechnen Sie reale Projekte nach VDE-Vorgaben.", scenarioCount: 10, xp: 150 },
    { 
        type: 'digital-twin', 
        title: "Digitaler Zwilling", 
        pro: true, 
        description: "Planen, verdrahten und prüfen Sie eine Installation virtuell. Finden Sie von der KI generierte Fehler.", 
        xp: 200,
        modes: [
            { id: 'sandbox', name: 'Sandbox' },
            { id: 'exam', name: 'Prüfung' },
            { id: 'troubleshooting', name: 'Fehlersuche' },
        ]
    },
    { type: 'troubleshooting', title: "Fehlersuche (Legacy)", pro: false, description: "Finden Sie von der KI generierte Fehler in einem Schütz-Schaltkreis.", scenarioCount: 1, xp: 75 },
    { type: 'aevo', title: "AEVO Unterweisungsprobe", pro: true, description: "Üben Sie mit einem virtuellen Azubi und erhalten KI-Feedback.", scenarioCount: 1, xp: 125 },
    { type: 'meister-project', title: "Meisterprüfungsprojekt", pro: true, description: "Simulieren Sie ein komplettes Meisterprojekt von A bis Z.", scenarioCount: 1, xp: 500 },
];

export const PLANNING_SCENARIOS: PlanningScenario[] = [
    {
        id: 'tischlerei_ausbau',
        title: 'Ausbau einer Tischlerei',
        description: 'Planen Sie die Stromkreise für die neue Unterverteilung einer Tischlerei. Ermitteln Sie Leistungsbedarf, Betriebsströme, Leitungsschutz und Querschnitte bei einem zulässigen Spannungsfall von 2,3% je Stromkreis.',
        devices: [
            { id: 1, name: 'Fräsmaschine', type: 'D-Motor', P_kW: 3.0, eta: 0.81, cosPhi: 0.82, length_m: 41 },
            { id: 2, name: 'Schwenkkran', type: 'D-Motor', P_kW: 2.2, eta: 0.79, cosPhi: 0.81, length_m: 29 },
            { id: 3, name: 'Große Säge', type: 'D-Motor', P_kW: 1.5, eta: 0.75, cosPhi: 0.82, length_m: 32 },
            { id: 4, name: 'Schere', type: 'D-Motor', P_kW: 2.2, eta: 0.77, cosPhi: 0.81, length_m: 37 },
            { id: 5, name: 'Schleifmaschine', type: 'D-Motor', P_kW: 4.0, eta: 0.82, cosPhi: 0.81, length_m: 35 },
            { id: 6, name: 'Schweißgerät 400V', type: 'Gerät', P_kW: 10, eta: null, cosPhi: 0.8, length_m: 60 },
            { id: 7, name: 'Kleine Säge', type: 'D-Motor', P_kW: 0.75, eta: 0.74, cosPhi: 0.79, length_m: 26 },
            { id: 8, name: 'Rauchabzug', type: 'D-Motor', P_kW: 0.55, eta: 0.69, cosPhi: 0.75, length_m: 43 },
            { id: 9, name: 'Lichtbänder 230/400V', type: 'AC', P_kW: 0.41, eta: null, cosPhi: 0.95, length_m: 112 },
            { id: 10, name: 'Steckdose Werkbank 1 230V', type: 'AC', P_kW: 1.2, eta: null, cosPhi: 0.95, length_m: 13 },
            { id: 11, name: 'Beleuchtung Büro 230V', type: 'AC', P_kW: 0.42, eta: null, cosPhi: 0.95, length_m: 10 },
            { id: 12, name: 'EDV-Steckdose 230V', type: 'AC', P_kW: 1.5, eta: null, cosPhi: 0.93, length_m: 16 },
            { id: 13, name: '63 A CEE 400V', type: 'Gerät', P_kW: 21, eta: null, cosPhi: 0.92, length_m: 12 },
        ],
        correctSolutions: [
            { Pzu_kW: "3.7", I_A_WS: "", I_A_DS: "6.5", Sicherung_A: "25", A_mm2: "4" },
            { Pzu_kW: "2.78", I_A_WS: "", I_A_DS: "4.95", Sicherung_A: "20", A_mm2: "2.5" },
            { Pzu_kW: "2", I_A_WS: "", I_A_DS: "3.6", Sicherung_A: "16", A_mm2: "1.5" },
            { Pzu_kW: "2.86", I_A_WS: "", I_A_DS: "5.1", Sicherung_A: "20", A_mm2: "2.5" },
            { Pzu_kW: "4.88", I_A_WS: "", I_A_DS: "8.7", Sicherung_A: "32", A_mm2: "6" },
            { Pzu_kW: "10", I_A_WS: "", I_A_DS: "18.0", Sicherung_A: "20", A_mm2: "4" },
            { Pzu_kW: "1.01", I_A_WS: "", I_A_DS: "1.8", Sicherung_A: "10", A_mm2: "1.5" },
            { Pzu_kW: "0.8", I_A_WS: "", I_A_DS: "1.5", Sicherung_A: "10", A_mm2: "1.5" },
            { Pzu_kW: "0.41", I_A_WS: "0.62", I_A_DS: "", Sicherung_A: "10", A_mm2: "10" },
            { Pzu_kW: "1.2", I_A_WS: "5.49", I_A_DS: "", Sicherung_A: "16", A_mm2: "2.5" },
            { Pzu_kW: "0.42", I_A_WS: "1.92", I_A_DS: "", Sicherung_A: "10", A_mm2: "1.5" },
            { Pzu_kW: "1.5", I_A_WS: "7.01", I_A_DS: "", Sicherung_A: "16", A_mm2: "2.5" },
            { Pzu_kW: "21", I_A_WS: "", I_A_DS: "32.95", Sicherung_A: "63", A_mm2: "16" },
        ]
    },
    { id: 'plan-2', title: 'Planungsszenario 2: Wohnungsinstallation', description: 'Planung einer Standard-Wohnung.', devices: [], correctSolutions: [] },
    { id: 'plan-3', title: 'Planungsszenario 3: Kleinbüro', description: 'Planung für ein kleines Bürogebäude.', devices: [], correctSolutions: [] },
];

export const COMPONENT_CONNECTION_POINTS: Record<ComponentType, ConnectionPoint[]> = {
    'power-source': [
        { id: 'L', x: 25, y: 75 },
        { id: 'N', x: 50, y: 75 },
        { id: 'PE', x: 75, y: 75 },
    ],
    'socket': [
        { id: 'L', x: 20, y: 50 },
        { id: 'N', x: 80, y: 50 },
        { id: 'PE', x: 50, y: 80 },
    ],
    'socket-double': [
        { id: 'L1', x: 20, y: 25 }, { id: 'N1', x: 80, y: 25 }, { id: 'PE1', x: 50, y: 40 },
        { id: 'L2', x: 20, y: 75 }, { id: 'N2', x: 80, y: 75 }, { id: 'PE2', x: 50, y: 90 },
    ],
    'switch': [
        { id: 'L_in', x: 50, y: 20 },
        { id: 'L_out', x: 50, y: 80 },
    ],
    'light': [
        { id: 'L', x: 30, y: 20 },
        { id: 'N', x: 70, y: 20 },
        { id: 'PE', x: 50, y: 80 },
    ],
    'junction-box': [
        { id: '1', x: 20, y: 20 }, { id: '2', x: 50, y: 20 }, { id: '3', x: 80, y: 20 },
        { id: '4', x: 20, y: 80 }, { id: '5', x: 50, y: 80 }, { id: '6', x: 80, y: 80 },
    ],
};


export const PALETTE_COMPONENTS: PaletteComponent[] = [
    { name: 'Stromquelle', type: 'power-source', cost: 50.00 },
    { name: 'Steckdose', type: 'socket', cost: 15.50 },
    { name: 'Doppelsteckdose', type: 'socket-double', cost: 25.00 },
    { name: 'Lichtschalter', type: 'switch', cost: 12.75 },
    { name: 'Deckenleuchte', type: 'light', cost: 75.00 },
    { name: 'Abzweigdose', type: 'junction-box', cost: 8.50 },
];

export const EXAM_TASKS: ExamTask[] = [
    {
        id: 'schlafzimmer_einfach',
        description: 'Aufgabe: Installieren Sie ein einfaches Schlafzimmer. Benötigt werden: 1x Deckenleuchte, 1x Lichtschalter neben der Eingangstür (Wand: vorne) und 2x Doppelsteckdosen.',
        requiredComponents: [
            { type: 'light', count: 1 },
            { type: 'switch', count: 1 },
            { type: 'socket-double', count: 2 },
        ]
    },
    {
        id: 'flur_wechselschaltung',
        description: 'Aufgabe: Installieren Sie eine Wechselschaltung für einen Flur. Benötigt werden: 1x Deckenleuchte, 2x Lichtschalter (einer pro Tür an "vorne" und "hinten") und 1x Steckdose.',
        requiredComponents: [
            { type: 'light', count: 1 },
            { type: 'switch', count: 2 },
            { type: 'socket', count: 1 },
        ]
    }
];

// Pre-defined installation for troubleshooting mode
export const TROUBLESHOOTING_PRESET: { components: PlacedComponent[], wires: Wire[] } = {
    components: [
        { id: 'power', type: 'power-source', name: 'Stromquelle', x: 10, y: 90, connectionPoints: COMPONENT_CONNECTION_POINTS['power-source'], isOn: true },
        { id: 'jb1', type: 'junction-box', name: 'Abzweigdose', x: 30, y: 20, connectionPoints: COMPONENT_CONNECTION_POINTS['junction-box'] },
        { id: 'switch1', type: 'switch', name: 'Schalter', x: 15, y: 40, isToggled: false, connectionPoints: COMPONENT_CONNECTION_POINTS['switch'] },
        { id: 'light1', type: 'light', name: 'Leuchte', x: 70, y: 15, connectionPoints: COMPONENT_CONNECTION_POINTS['light'] },
        { id: 'socket1', type: 'socket', name: 'Steckdose', x: 85, y: 85, connectionPoints: COMPONENT_CONNECTION_POINTS['socket'] },
    ],
    wires: [
        // Power to Junction Box
        { id: 'w1', startComponentId: 'power', startPointId: 'L', endComponentId: 'jb1', endPointId: '1', color: 'L' },
        { id: 'w2', startComponentId: 'power', startPointId: 'N', endComponentId: 'jb1', endPointId: '2', color: 'N' },
        { id: 'w3', startComponentId: 'power', startPointId: 'PE', endComponentId: 'jb1', endPointId: '3', color: 'PE' },
        // Junction Box to Switch
        { id: 'w4', startComponentId: 'jb1', startPointId: '1', endComponentId: 'switch1', endPointId: 'L_in', color: 'L' },
        // Switch to Light (via Junction Box)
        { id: 'w5', startComponentId: 'switch1', startPointId: 'L_out', endComponentId: 'jb1', endPointId: '4', color: 'switched' },
        { id: 'w6', startComponentId: 'jb1', startPointId: '4', endComponentId: 'light1', endPointId: 'L', color: 'switched' },
        // Light to Junction Box (N, PE)
        { id: 'w7', startComponentId: 'jb1', startPointId: '2', endComponentId: 'light1', endPointId: 'N', color: 'N' },
        { id: 'w8', startComponentId: 'jb1', startPointId: '3', endComponentId: 'light1', endPointId: 'PE', color: 'PE' },
        // Junction Box to Socket
        { id: 'w9', startComponentId: 'jb1', startPointId: '1', endComponentId: 'socket1', endPointId: 'L', color: 'L' },
        { id: 'w10', startComponentId: 'jb1', startPointId: '2', endComponentId: 'socket1', endPointId: 'N', color: 'N' },
        { id: 'w11', startComponentId: 'jb1', startPointId: '3', endComponentId: 'socket1', endPointId: 'PE', color: 'PE' },
    ]
};


const PLACEHOLDER_CONTENT: CourseContent = {
    videoId: 'dQw4w9WgXcQ', // Placeholder video
    description: 'Dieser Kursinhalt ist in Vorbereitung und wird in Kürze verfügbar sein. Schauen Sie bald wieder vorbei!',
    textContent: `<h3 class="text-xl font-bold text-white mb-3">Inhalt in Kürze verfügbar</h3><p>Wir arbeiten hart daran, Ihnen die besten Lerninhalte zur Verfügung zu stellen. Dieser Abschnitt wird bald mit detaillierten Informationen, Beispielen und interaktiven Elementen gefüllt sein.</p>`,
    quiz: [
        {
            question: 'Wann wird dieser Inhalt verfügbar sein?',
            options: ['Bald', 'Sehr bald', 'In Kürze', 'Alle Antworten sind korrekt'],
            correctAnswerIndex: 3,
            explanation: 'Wir beeilen uns!'
        }
    ],
    flashcards: [
        { front: 'Geduld', back: 'Eine Tugend, die sich auszahlt.' }
    ]
};

const OHMSCHES_GESETZ_CONTENT: CourseContent = {
    videoId: '_x8j3g_a_oM',
    description: 'Diese Lektion erklärt das Ohmsche Gesetz, eine der fundamentalsten Grundlagen der Elektrotechnik. Sie lernen den Zusammenhang zwischen Spannung, Strom und Widerstand kennen und wie man die elektrische Leistung berechnet.',
    textContent: `<h3 class="text-xl font-bold text-white mb-3">Das Ohmsche Gesetz</h3>
        <p class="mb-4">Das Ohmsche Gesetz beschreibt den proportionalen Zusammenhang zwischen der Spannung (U), die an einem Widerstand (R) anliegt, und dem elektrischen Strom (I), der durch ihn fließt.</p>
        <h4 class="text-lg font-bold text-white mb-2">Die Formel: U = R ⋅ I</h4>
        <div class="flex items-center justify-around bg-slate-800 p-4 rounded-lg mb-4">
          <div><p class="text-2xl font-mono text-center">U</p><p class="text-sm text-center text-slate-400">Spannung [Volt]</p></div>
          <div><p class="text-2xl font-mono text-center">=</p></div>
          <div><p class="text-2xl font-mono text-center">R</p><p class="text-sm text-center text-slate-400">Widerstand [Ohm]</p></div>
          <div><p class="text-2xl font-mono text-center">×</p></div>
          <div><p class="text-2xl font-mono text-center">I</p><p class="text-sm text-center text-slate-400">Strom [Ampere]</p></div>
        </div>
        <p class="mb-4">Diese Formel lässt sich umstellen, um jede der drei Größen zu berechnen, wenn die anderen beiden bekannt sind. Das "magische Dreieck" ist eine beliebte Merkhilfe dafür.</p>
        <h4 class="text-lg font-bold text-white mb-2">Die elektrische Leistung (P)</h4>
        <p>Die Leistung (P), gemessen in Watt, ist das Produkt aus Spannung und Strom.</p>
        <p class="font-mono bg-slate-800 p-2 rounded-md text-center">P = U ⋅ I</p>`,
    quiz: [
        {
            question: 'Welche Formel beschreibt das Ohmsche Gesetz korrekt?',
            options: ['R = U ⋅ I', 'I = U / R', 'U = R / I', 'P = U ⋅ R'],
            correctAnswerIndex: 1,
            explanation: 'Die Grundformel lautet U = R ⋅ I. Umgestellt nach I ergibt sich I = U / R.'
        },
        {
            question: 'Ein Verbraucher hat einen Widerstand von 100 Ω und es liegt eine Spannung von 230 V an. Wie hoch ist der Strom?',
            options: ['2,3 A', '0,43 A', '23000 A', '1,3 A'],
            correctAnswerIndex: 0,
            explanation: 'Mit I = U / R rechnet man: 230 V / 100 Ω = 2,3 A.'
        }
    ],
    flashcards: [
        { front: 'Formelzeichen für Spannung?', back: 'U' },
        { front: 'Einheit der Stromstärke?', back: 'Ampere (A)' },
        { front: 'Wie berechnet man die Leistung?', back: 'P = U ⋅ I' },
    ]
};

const SICHERHEITSREGELN_CONTENT: CourseContent = {
    videoId: 'o77lD9w1VIc',
    description: 'Die "Fünf Sicherheitsregeln" sind das Fundament für sicheres Arbeiten an elektrischen Anlagen. Diese Lektion erklärt jede Regel im Detail und ihre zwingend einzuhaltende Reihenfolge.',
    textContent: `<h3 class="text-xl font-bold text-white mb-3">Die 5 Sicherheitsregeln der Elektrotechnik</h3>
        <p class="mb-4">Das Arbeiten an elektrischen Anlagen ist lebensgefährlich. Daher müssen vor Beginn aller Arbeiten die folgenden fünf Regeln in der exakten Reihenfolge angewendet werden, um den spannungsfreien Zustand herzustellen und sicherzustellen.</p>
        <ol class="list-decimal list-inside space-y-3">
            <li><b class="text-white">Freischalten:</b> Die Anlage muss allpolig und beidseitig von spannungsführenden Teilen getrennt werden. Meist durch Ausschalten von LS-Schaltern oder Ziehen von Sicherungen.</li>
            <li><b class="text-white">Gegen Wiedereinschalten sichern:</b> Es müssen Maßnahmen getroffen werden, die ein versehentliches Wiedereinschalten verhindern (z.B. Sperrelement, Warnschild).</li>
            <li><b class="text-white">Spannungsfreiheit feststellen:</b> Mit einem zweipoligen Spannungsprüfer (z.B. Duspol) muss an der Arbeitsstelle die allpolige Spannungsfreiheit festgestellt werden.</li>
            <li><b class="text-white">Erden und kurzschließen:</b> Ist bei Hochspannungsanlagen und bestimmten Niederspannungsanlagen (z.B. Freileitungen) erforderlich, um die Anlage gegen externe Spannungsquellen zu schützen.</li>
            <li><b class="text-white">Benachbarte, unter Spannung stehende Teile abdecken oder abschranken:</b> Wenn Teile in der Nähe der Arbeitsstelle nicht freigeschaltet werden können, müssen diese durch isolierende Tücher, Platten oder Schläuche abgedeckt werden.</li>
        </ol>`,
    quiz: [
        {
            question: 'Was ist der erste Schritt der 5 Sicherheitsregeln?',
            options: ['Spannungsfreiheit feststellen', 'Erden und kurzschließen', 'Freischalten', 'Gegen Wiedereinschalten sichern'],
            correctAnswerIndex: 2,
            explanation: 'Der allererste Schritt ist immer das Freischalten der Anlage, um sie vom Netz zu trennen.'
        },
        {
            question: 'Womit wird die Spannungsfreiheit festgestellt?',
            options: ['Mit einem Multimeter', 'Mit einem zweipoligen Spannungsprüfer', 'Mit dem Finger (nicht empfohlen)', 'Mit einem Schraubendreher-Phasenprüfer'],
            correctAnswerIndex: 1,
            explanation: 'Nur ein zweipoliger Spannungsprüfer nach EN 61243-3 (VDE 0682-401) ist für diese Feststellung zulässig.'
        }
    ],
    flashcards: [
        { front: '1. Regel?', back: 'Freischalten' },
        { front: '2. Regel?', back: 'Gegen Wiedereinschalten sichern' },
        { front: '3. Regel?', back: 'Spannungsfreiheit feststellen' },
    ]
};

const VDE_0100_600_CONTENT: CourseContent = {
    videoId: 'a-525fB50-I',
    description: 'Die VDE 0100-600 ist die zentrale Norm für die Erstprüfung elektrischer Anlagen. Diese Lektion führt durch die drei Säulen der Prüfung: Besichtigen, Erproben und Messen.',
    textContent: `<h3 class="text-xl font-bold text-white mb-3">VDE 0100-600: Erstprüfung</h3>
        <p class="mb-4">Jede neu errichtete, erweiterte oder geänderte elektrische Anlage muss vor der Inbetriebnahme geprüft werden. Diese Prüfung stellt sicher, dass die Anlage den Sicherheitsstandards entspricht und ordnungsgemäß funktioniert. Die Prüfung gliedert sich in drei Schritte, die in dieser Reihenfolge durchzuführen sind.</p>
        <h4 class="text-lg font-bold text-white mb-2">1. Besichtigen</h4>
        <p class="mb-4">Die Besichtigung ist eine Sichtprüfung der Anlage. Hier wird ohne Messgeräte geprüft, ob alles korrekt und nach Norm installiert wurde. Wichtige Punkte sind:</p>
        <ul class="list-disc list-inside mb-4 pl-4">
            <li>Korrekte Auswahl der Betriebsmittel für die Umgebungsbedingungen.</li>
            <li>Richtige Kennzeichnung von Stromkreisen, Schutzleitern (grün-gelb) und Neutralleitern (blau).</li>
            <li>Vorhandensein von Schutzmaßnahmen gegen direktes Berühren (Basisschutz).</li>
            <li>Korrekte Leiterverbindungen und Zugänglichkeit der Betriebsmittel.</li>
        </ul>
        <h4 class="text-lg font-bold text-white mb-2">2. Erproben</h4>
        <p class="mb-4">Beim Erproben wird die Funktion von Sicherheitseinrichtungen getestet. Dazu gehört:</p>
        <ul class="list-disc list-inside mb-4 pl-4">
            <li>Auslösen von Fehlerstrom-Schutzeinrichtungen (RCDs) über die Prüftaste.</li>
            <li>Testen von Verriegelungen und Meldeleuchten.</li>
            <li>Prüfung des Rechtsdrehfeldes an Drehstrom-Steckdosen.</li>
        </ul>
        <h4 class="text-lg font-bold text-white mb-2">3. Messen</h4>
        <p>Erst nach erfolgreicher Besichtigung und Erprobung darf gemessen werden. Die Messungen dienen dem Nachweis der Wirksamkeit der Schutzmaßnahmen. Typische Messungen sind:</p>
        <ul class="list-disc list-inside mb-4 pl-4">
            <li>Durchgängigkeit der Schutzleiter (Niederohmmessung).</li>
            <li>Isolationswiderstand der Anlage.</li>
            <li>Schleifenimpedanz zur Überprüfung der Abschaltbedingungen.</li>
            <li>Auslösezeit und Auslösestrom von RCDs.</li>
        </ul>`,
    quiz: [
        {
            question: "Was ist der erste Schritt bei einer Erstprüfung nach VDE 0100-600?",
            options: ["Messen", "Erproben", "Besichtigen", "Dokumentieren"],
            correctAnswerIndex: 2,
            explanation: "Die Prüfung muss immer mit der Besichtigung beginnen, da viele Fehler bereits visuell erkannt werden können und Messungen an einer fehlerhaft installierten Anlage gefährlich sein können."
        },
        {
            question: "Welche Messung prüft die Wirksamkeit der automatischen Abschaltung im Fehlerfall in einem TN-System?",
            options: ["Isolationsmessung", "Niederohmmessung", "Messung der Schleifenimpedanz", "Drehfeldmessung"],
            correctAnswerIndex: 2,
            explanation: "Die Messung der Schleifenimpedanz stellt sicher, dass im Falle eines Kurzschlusses zwischen Außenleiter und Schutzleiter ein ausreichend hoher Strom fließt, um die Sicherung oder den LS-Schalter schnell genug auszulösen."
        }
    ],
    flashcards: [
        { front: 'Die 3 Schritte der Erstprüfung?', back: '1. Besichtigen, 2. Erproben, 3. Messen' },
        { front: 'Womit wird die Durchgängigkeit des Schutzleiters gemessen?', back: 'Mit einer Niederohmmessung (R low)' },
        { front: 'Was testet man mit der Prüftaste am RCD?', back: 'Die mechanische Funktion des RCD (nicht die elektrische Schutzfunktion).' },
    ]
};

const VDE_0100_410_CONTENT: CourseContent = {
    videoId: 'Ewi4_D5e4S4', // Using a relevant German video
    description: 'Diese Lektion behandelt die grundlegenden Schutzmaßnahmen gegen elektrischen Schlag gemäß VDE 0100-410, einschließlich Schutzpotentialausgleich und automatischer Abschaltung der Stromversorgung.',
    textContent: `<h3 class="text-xl font-bold text-white mb-3">Einführung in VDE 0100-410</h3><p class="mb-4">Die DIN VDE 0100-410 ist eine der wichtigsten Normen in der Elektroinstallation. Sie legt die Anforderungen für den Schutz gegen elektrischen Schlag fest. Dieser Schutz wird in Basisschutz (Schutz gegen direktes Berühren) und Fehlerschutz (Schutz bei indirektem Berühren) unterteilt.</p><h4 class="text-lg font-bold text-white mb-2">Basisschutz</h4><p class="mb-4">Der Basisschutz soll das Berühren aktiver Teile verhindern. Dies wird hauptsächlich durch Isolierung oder durch Abdeckungen und Umhüllungen realisiert, die mindestens der Schutzart IPXXB oder IP2X entsprechen müssen.</p><h4 class="text-lg font-bold text-white mb-2">Fehlerschutz</h4><p class="mb-4">Der Fehlerschutz wird wirksam, wenn ein Fehler auftritt, z. B. ein Isolationsfehler, der ein Körper (Gehäuse) unter Spannung setzt. Die wichtigste Maßnahme ist die automatische Abschaltung der Stromversorgung. Dies wird durch Schutzeinrichtungen wie RCDs (Fehlerstrom-Schutzeinrichtungen) und Sicherungen/Leitungsschutzschalter erreicht.</p><p>Die maximale Abschaltzeit hängt von der Netzform und der Nennspannung ab. In TN-Systemen beträgt sie bei 230V üblicherweise 0,4 Sekunden für Endstromkreise bis 63A.</p>`,
    quiz: [
        {
            question: 'Was ist das Hauptziel der VDE 0100-410?',
            options: ['Schutz vor Überspannung', 'Schutz gegen elektrischen Schlag', 'Brandschutz', 'Energieeffizienz'],
            correctAnswerIndex: 1,
            explanation: 'Die VDE 0100-410 befasst sich primär mit den Schutzmaßnahmen gegen den elektrischen Schlag.'
        },
        {
            question: 'Welche der folgenden Maßnahmen gehört zum Fehlerschutz?',
            options: ['Isolierung von Kabeln', 'Abdeckungen von Steckdosen', 'Automatische Abschaltung der Stromversorgung', 'Warnhinweise'],
            correctAnswerIndex: 2,
            explanation: 'Die automatische Abschaltung im Fehlerfall ist eine zentrale Maßnahme des Fehlerschutzes, um gefährliche Berührungsspannungen zu verhindern.'
        }
    ],
    flashcards: [
        { front: 'Was bedeutet Basisschutz?', back: 'Schutz gegen direktes Berühren aktiver Teile (z.B. durch Isolierung).' },
        { front: 'Was bedeutet Fehlerschutz?', back: 'Schutz bei indirektem Berühren, z.B. durch automatische Abschaltung.' },
    ]
};

const AEVO_CONTENT_1: CourseContent = {
    ...PLACEHOLDER_CONTENT,
    videoId: 'qgktmcA2e4k',
    description: 'Handlungsfeld 1: Ausbildungsvoraussetzungen prüfen und Ausbildung planen.',
    textContent: '<h3>Handlungsfeld 1</h3><p>In diesem Bereich lernen Sie, die betrieblichen und persönlichen Voraussetzungen für die Ausbildung zu prüfen und die Ausbildung auf dieser Grundlage zu planen.</p>',
};

const VDE_AR_N_4100_CONTENT: CourseContent = {
    videoId: 'wxZ4wuWWeIQ',
    description: 'Die VDE-AR-N 4100 (TAR Niederspannung) ist die Technische Anschlussregel für den Anschluss von Kundenanlagen an das Niederspannungsnetz. Diese Lektion behandelt die wichtigsten Aspekte wie den netzseitigen Anschlussraum (NAR), Zählerplätze und die Reihenfolge der Sammelschienen.',
    textContent: `<h3 class="text-xl font-bold text-white mb-3">Schlüsselkonzepte der VDE-AR-N 4100</h3>
                 <p class="mb-4">Die Technischen Anschlussregeln Niederspannung (TAR Niederspannung) sind entscheidend für jeden, der Anlagen an das öffentliche Stromnetz anschließt. Sie stellen sicher, dass alle Anschlüsse sicher, zuverlässig und standardisiert sind.</p>
                 <h4 class="text-lg font-bold text-white mb-2">Netzseitiger Anschlussraum (NAR)</h4>
                 <p class="mb-4">Der NAR ist der Bereich im Zählerschrank, der für den Netzbetreiber reserviert ist. Hier befinden sich der Hauptsicherungsautomat (oder NH-Sicherungen) und die Sammelschienen. Dieser Bereich ist plombiert und darf nur vom Personal des Netzbetreibers geöffnet werden.</p>
                 <ul class="list-disc list-inside mb-4 pl-4">
                    <li><b>Sammelschienen-Reihenfolge:</b> Von oben nach unten (bzw. von hinten nach vorne) gilt: N, L1, L2, L3, PE.</li>
                    <li><b>Kurzschlussfestigkeit:</b> Im ungezählten Bereich (vor der Messung) muss die Anlage für 25 kA ausgelegt sein.</li>
                 </ul>
                 <h4 class="text-lg font-bold text-white mb-2">Anlagenseitiger Anschlussraum (AAR)</h4>
                 <p>Der AAR ist der Bereich, in dem die Elektrofachkraft arbeitet. Hier werden die Stromkreisverteiler, RCDs, LS-Schalter und andere Geräte für die Kundenanlage installiert. Die Kurzschlussfestigkeit der hier verwendeten Betriebsmittel (z.B. SH-Schalter) muss auf die Vorsicherung abgestimmt sein (typ. 10 kA).</p>`,
    quiz: [
        {
            question: "Welche Reihenfolge haben die Sammelschienen im NAR nach VDE-AR-N 4100?",
            options: ["L1, L2, L3, N, PE", "PE, N, L1, L2, L3", "N, L1, L2, L3, PE", "Es gibt keine feste Reihenfolge"],
            correctAnswerIndex: 2,
            explanation: "Die Norm gibt eine klare Reihenfolge von oben nach unten vor: Neutralleiter, die drei Außenleiter und zuletzt der Schutzleiter."
        },
        {
            question: "Was bedeutet die Abkürzung 'TAR Niederspannung'?",
            options: ["Tarif-Anwendungs-Regel", "Technische Anschluss-Regeln", "Totaler Anschluss-Raum", "Technischer Applikations-Report"],
            correctAnswerIndex: 1,
            explanation: "TAR steht für Technische Anschluss-Regeln und definiert die Bedingungen für den Anschluss an das Niederspannungsnetz."
        }
    ],
    flashcards: [
        { front: 'NAR', back: 'Netzseitiger Anschlussraum' },
        { front: 'Reihenfolge Sammelschienen im NAR?', back: 'N, L1, L2, L3, PE (von oben/hinten)' },
        { front: 'Kurzschlussfestigkeit im ungezählten Bereich?', back: '25 kA' },
    ]
};

const setInitialStatus = (nodes: SkillNode[], status?: SkillStatus): SkillNode[] => {
    let firstActiveSet = false;
    const recursiveSet = (node: SkillNode): SkillNode => {
        let currentStatus: SkillStatus = node.status;
        
        // If a status is passed, force it (e.g., for completed user data)
        if (status) {
            currentStatus = status;
        } else {
            // The first node with content that isn't completed becomes active
            if (!firstActiveSet && (node.content || node.type === 'exam') && node.status !== 'completed') {
                currentStatus = 'active';
                firstActiveSet = true;
            } else if (node.status !== 'completed') {
                currentStatus = 'locked';
            }
        }


        return {
            ...node,
            type: node.type || 'course',
            status: currentStatus,
            children: node.children ? node.children.map(recursiveSet) : undefined,
        };
    };
    return nodes.map(recursiveSet);
};

export const LEARNING_PATH_DATA: LearningPathCollection = {
    'ausbildung_elektroniker': {
        id: 'ausbildung_elektroniker',
        title: 'Ausbildung Elektroniker',
        description: 'Grundlagen und Kernkompetenzen für die Ausbildung zum Elektroniker für Energie- und Gebäudetechnik.',
        pro: false,
        sealImage: 'https://placehold.co/128x128/3b82f6/ffffff?text=E',
        nodes: setInitialStatus([
            { id: 'azubi-1', title: '1. Lehrjahr: Grundlagen', status: 'completed', category: 'grundlagen', xp: 20, children: [
                { id: 'azubi-1-1', title: 'Ohmsches Gesetz & Leistung', status: 'completed', category: 'grundlagen', xp: 50, content: OHMSCHES_GESETZ_CONTENT },
                { id: 'azubi-1-2', title: 'Die 5 Sicherheitsregeln', status: 'locked', category: 'normen', xp: 50, content: SICHERHEITSREGELN_CONTENT },
            ]},
            { id: 'azubi-2', title: '2. Lehrjahr: Installationstechnik', status: 'locked', category: 'gebaeudetechnik', xp: 20, children: [
                { id: 'azubi-2-1', title: 'VDE 0100-410: Schutzmaßnahmen', status: 'locked', category: 'normen', xp: 75, content: VDE_0100_410_CONTENT },
                { id: 'azubi-2-2', title: 'Schützschaltungen', status: 'locked', category: 'gebaeudetechnik', xp: 75, content: PLACEHOLDER_CONTENT, pro: true },
            ]},
            { id: 'azubi-3', title: '3. Lehrjahr: Prüfen & Messen', status: 'locked', category: 'messtechnik', xp: 20, children: [
                { id: 'azubi-3-1', title: 'VDE 0100-600: Erstprüfung', status: 'locked', category: 'messtechnik', xp: 100, content: VDE_0100_600_CONTENT, pro: true },
                 { 
                    id: 'azubi-3-2',
                    title: 'Praxis: Fehlersuche',
                    type: 'exam',
                    status: 'locked',
                    category: 'messtechnik',
                    xp: 150,
                    pro: false,
                    simulationType: 'troubleshooting',
                    simulationScenarioId: 'troubleshooting-1',
                },
            ]},
            { 
                id: 'azubi-apu1',
                title: 'Abschlussprüfung Teil 1',
                type: 'exam',
                status: 'locked',
                category: 'messtechnik',
                xp: 250,
                pro: true,
                simulationType: 'digital-twin',
                simulationScenarioId: 'exam',
                unlocks: ['meister-2']
            }
        ]),
    },
    'meister_1_4': {
        id: 'meister_1_4',
        title: 'Handwerksmeister Teil 1-4',
        description: 'Umfassende Vorbereitung auf die Meisterprüfung im Elektrohandwerk.',
        pro: true,
        locked: true,
        sealImage: 'https://placehold.co/128x128/facc15/1e293b?text=M',
        nodes: setInitialStatus([
            { id: 'meister-2', title: 'Teil II: Fachtheorie', status: 'locked', category: 'projektplanung', xp: 30, children: [
                { id: 'meister-2-1', title: 'VDE-Auswahl-Ordner', status: 'locked', category: 'normen', xp: 100, content: PLACEHOLDER_CONTENT },
                { id: 'meister-2-2', title: 'Automatisierungstechnik (SPS)', status: 'locked', category: 'automatisierung', xp: 100, content: PLACEHOLDER_CONTENT },
                { id: 'meister-2-3', title: 'Gebäudesystemtechnik (KNX)', status: 'locked', category: 'gebaeudetechnik', xp: 100, content: PLACEHOLDER_CONTENT },
            ]},
            { id: 'meister-1', title: 'Teil I: Fachpraxis', status: 'locked', category: 'projektplanung', xp: 30, children: [
                 { id: 'meister-1-1', title: 'Projektierung & Fachkalkulation', status: 'locked', category: 'projektplanung', xp: 100, content: PLACEHOLDER_CONTENT },
                 {
                    id: 'meister-1-2',
                    title: 'Praxis: Meisterprojekt-Simulation',
                    type: 'exam',
                    status: 'locked',
                    category: 'projektplanung',
                    xp: 500,
                    pro: true,
                    simulationType: 'meister-project',
                    simulationScenarioId: 'meister-1'
                 }
            ]},
            { id: 'meister-3', title: 'Teil III: Wirtschaft & Recht', status: 'locked', category: 'betriebswirtschaft', xp: 30, children: [
                { id: 'meister-3-1', title: 'Grundlagen BWL & VWL', status: 'locked', category: 'betriebswirtschaft', xp: 100, content: PLACEHOLDER_CONTENT },
                { id: 'meister-3-2', title: 'Rechnungswesen & Controlling', status: 'locked', category: 'betriebswirtschaft', xp: 100, content: PLACEHOLDER_CONTENT },
            ]},
            { id: 'meister-4', title: 'Teil IV: Pädagogik (AEVO)', status: 'locked', category: 'paedagogik', xp: 30, children: [
                 { id: 'meister-4-1', title: 'AEVO Handlungsfeld 1-4', status: 'locked', category: 'paedagogik', xp: 100, content: AEVO_CONTENT_1 },
                 {
                    id: 'meister-4-2',
                    title: 'Praxis: AEVO Unterweisung',
                    type: 'exam',
                    status: 'locked',
                    category: 'paedagogik',
                    xp: 125,
                    pro: true,
                    simulationType: 'aevo',
                    simulationScenarioId: 'aevo-1'
                 }
            ]},
        ], 'locked'),
    },
    'industriemeister_bq': {
        id: 'industriemeister_bq',
        title: 'Industriemeister (BQ)',
        description: 'Basisqualifikationen für den Industriemeister.',
        pro: true,
        locked: true,
        sealImage: 'https://placehold.co/128x128/a855f7/ffffff?text=I',
        nodes: setInitialStatus([
            { id: 'im-bq-1', title: 'Rechtsbewusstes Handeln', status: 'locked', category: 'recht', xp: 100, content: PLACEHOLDER_CONTENT },
            { id: 'im-bq-2', title: 'Betriebswirtschaftliches Handeln', status: 'locked', category: 'betriebswirtschaft', xp: 100, content: PLACEHOLDER_CONTENT },
            { id: 'im-bq-3', title: 'Zusammenarbeit im Betrieb', status: 'locked', category: 'paedagogik', xp: 100, content: PLACEHOLDER_CONTENT },
        ], 'locked'),
    },
    'trei': {
        id: 'trei',
        title: 'TREI Sachkundenachweis',
        description: 'Vorbereitung auf die Prüfung zum Nachweis der fachlichen Qualifikation für den Anschluss elektrischer Anlagen an das Niederspannungsnetz.',
        pro: true,
        locked: true,
        sealImage: 'https://placehold.co/128x128/ef4444/ffffff?text=T',
        nodes: setInitialStatus([
            { id: 'trei-A', title: 'Teil A: Schriftlicher Kenntnisnachweis', status: 'locked', category: 'projektplanung', xp: 20, children: [
                { id: 'trei-A-1', title: 'Rechtlicher Rahmen & Arbeitssicherheit', status: 'locked', category: 'recht', xp: 50, content: PLACEHOLDER_CONTENT },
                { id: 'trei-A-2', title: 'Anerkannte Regeln der Technik', status: 'locked', category: 'normen', xp: 50, children: [
                    { id: 'trei-A-2-1', title: 'Schutz gegen elektrischen Schlag (VDE 0100-410)', status: 'locked', category: 'normen', xp: 75, content: VDE_0100_410_CONTENT },
                    { id: 'trei-A-2-2', title: 'Auswahl & Errichtung elektr. Betriebsmittel', status: 'locked', category: 'gebaeudetechnik', xp: 75, content: PLACEHOLDER_CONTENT },
                ]},
                { id: 'trei-A-3', title: 'Prüfen und Inbetriebnahme', status: 'locked', category: 'messtechnik', xp: 50, children: [
                     { id: 'trei-A-3-1', title: 'Erstprüfungen (VDE 0100-600)', status: 'locked', category: 'messtechnik', xp: 100, content: VDE_0100_600_CONTENT },
                     { id: 'trei-A-3-2', title: 'Wiederkehrende Prüfungen (VDE 0105-100)', status: 'locked', category: 'messtechnik', xp: 100, content: PLACEHOLDER_CONTENT },
                ]},
                { id: 'trei-A-4', title: 'Schaltanlagen und Verteiler', status: 'locked', category: 'gebaeudetechnik', xp: 50, content: PLACEHOLDER_CONTENT },
                { id: 'trei-A-5', title: 'Projektierung und Anmeldung', status: 'locked', category: 'projektplanung', xp: 50, children: [
                     { id: 'trei-A-5-1', title: 'TAR Niederspannung (VDE-AR-N 4100)', status: 'locked', category: 'normen', xp: 100, content: VDE_AR_N_4100_CONTENT },
                     { id: 'trei-A-5-2', title: 'Planungsnormen (DIN 18015)', status: 'locked', category: 'projektplanung', xp: 75, content: PLACEHOLDER_CONTENT },
                ]},
            ]},
            { 
                id: 'trei-B', 
                title: 'Teil B: Praktische Prüfung', 
                status: 'locked', 
                category: 'messtechnik', 
                xp: 20, 
                children: [
                    { 
                        id: 'trei-B-1', 
                        title: 'Praxis-Sim: Leitungsauslegung', 
                        type: 'exam',
                        status: 'locked', 
                        category: 'projektplanung', 
                        xp: 150, 
                        pro: true,
                        simulationType: 'planning',
                        simulationScenarioId: 'tischlerei_ausbau'
                    },
                ]
            },
            { id: 'trei-C', title: 'Teil C: Fachgespräch', status: 'locked', category: 'kundenberatung', xp: 20, content: PLACEHOLDER_CONTENT },
        ], 'locked'),
    },
};

export const MOCK_EVENT_DATA: MWDEvent[] = [
    { id: 1, title: 'Live-Webinar: Die neue VDE-AR-N 4100 verstehen', description: 'Dr. Richter erklärt die wichtigsten Änderungen und was sie für die Praxis bedeuten. Inklusive Q&A-Session.', expertId: 1, date: '2024-09-15T18:00:00Z', isUpcoming: true, tags: ['normen', 'recht'], url: '#' },
    { id: 2, title: 'Deep Dive: KNX-Systeme sicher in Betrieb nehmen', description: 'Sabine Weiss zeigt live, wie man komplexe KNX-Installationen plant, programmiert und Fallstricke vermeidet.', expertId: 2, date: '2024-10-05T17:00:00Z', isUpcoming: true, tags: ['gebaeudetechnik', 'projektplanung'], url: '#' },
    { id: 3, title: 'Aufzeichnung: Effiziente Fehlersuche in SPS-Anlagen', description: 'Jürgen Schmid teilt seine besten Tricks zur schnellen Identifizierung von Fehlern in der Automatisierungstechnik.', expertId: 3, date: '2024-07-20T17:00:00Z', isUpcoming: false, tags: ['automatisierung', 'messtechnik'], url: '#' },
    { id: 4, title: 'Aufzeichnung: Kundenberatung für Smart Home Projekte', description: 'Lernen Sie von Sabine Weiss, wie man Kundenbedürfnisse richtig erfasst und überzeugende Smart Home Konzepte präsentiert.', expertId: 2, date: '2024-06-11T17:00:00Z', isUpcoming: false, tags: ['kundenberatung', 'gebaeudetechnik'], url: '#' },
];