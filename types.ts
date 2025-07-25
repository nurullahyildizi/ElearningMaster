import { ReactNode } from 'react';

export enum View {
  Dashboard = 'dashboard',
  LearningPath = 'lernpfade',
  Community = 'community',
  Career = 'karriere',
  Gilde = 'gilde',
  Experts = 'experten',
  Events = 'events',
  Social = 'social',
  Course = 'course',
  Admin = 'admin',
  Login = 'login',
  Register = 'register',
  LearningRoom = 'learning-room',
}

export type AppState = 'loading' | 'landing' | 'authenticated';
export type SubscriptionStatus = 'free' | 'pro';
export type UserRole = 'meister' | 'azubi' | 'user';

export interface Company {
  id: number;
  name: string;
}

export interface User {
  id: string; 
  name: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  wissensTokens: number;
  role: UserRole;
  companyId?: number;
  subscriptionStatus: SubscriptionStatus;
  registeredAt: string; // ISO Date string
  unlockedAchievements: string[];
  learningProgress?: Record<string, { completedNodes: string[], activeNodes: string[] }>;
  friends: string[]; // array of user IDs
  friendRequests: { fromId: string; fromName: string; fromAvatar: string; }[];
}

export interface CommunityComment {
  id: number;
  authorId: string;
  author: string;
  authorRole: UserRole;
  avatar: string;
  color: string;
  content: string;
  date: string; // ISO Date String
  kudos: number;
}


export interface CommunityPost {
  id: number;
  authorId: string; // User ID
  author: string;
  authorRole: UserRole;
  avatar: string;
  color: string;
  title: string;
  comments: CommunityComment[];
  content: string;
  isMeisterPost: boolean;
  kudos: number;
  tags: SkillCategory[];
  date: string; // ISO Date String
}

export interface Job {
  id: number;
  title: string;
  company: string;
  match: number;
  tags: string[]; // Corresponds to SkillCategory keys
  description: string;
  content?: ReactNode;
}

export type SkillStatus = 'completed' | 'active' | 'locked';

// Maps to SKILL_CATEGORIES keys
export type SkillCategory = 'grundlagen' | 'normen' | 'messtechnik' | 'gebaeudetechnik' | 'projektplanung' | 'kundenberatung' | 'betriebswirtschaft' | 'recht' | 'paedagogik' | 'automatisierung' | 'allgemein';


export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface CourseContent {
  videoId: string; // YouTube video ID
  description: string;
  textContent: string; // HTML content for the lesson
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
}

export interface SkillNode {
  id: string;
  title: string;
  status: SkillStatus;
  children?: SkillNode[];
  content?: CourseContent;
  category: SkillCategory;
  xp: number;
  pro?: boolean;
  type?: 'course' | 'exam';
  simulationType?: SimulationType;
  simulationScenarioId?: string;
  unlocks?: string[];
}

export interface AiChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface ModalState {
  isOpen: boolean;
  title: string;
  content: ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
}

export type SimulationType = 'digital-twin' | 'aevo' | 'meister-project' | 'planning' | 'troubleshooting';
export type DigitalTwinMode = 'sandbox' | 'exam' | 'troubleshooting';


export interface SimulationDetails {
    title: string;
    description: string;
    type: SimulationType;
    pro?: boolean;
    scenarioCount?: number; // Optional, as some sims have modes instead
    xp: number;
    modes?: { id: DigitalTwinMode | string, name: string }[];
}

// Types for Digital Twin Simulator
export type ComponentType = 'socket' | 'switch' | 'light' | 'socket-double' | 'junction-box' | 'power-source';
export type WireColor = 'L' | 'N' | 'PE' | 'switched';
export type SimulatorPhase = 'planen' | 'verdrahten' | 'messen' | 'diagnose';
export type FlukeTestType = 'V' | 'R_LO' | 'R_ISO' | 'Z_I' | 'RCD_T';
export type Probe = 'L' | 'N' | 'PE';
export type ComponentFault = 'open-circuit' | 'short-circuit';

export interface ConnectionPoint {
    id: string; // e.g., 'L', 'N', 'PE', 'L_in', 'L_out'
    x: number; // relative x offset %
    y: number; // relative y offset %
}

export interface PaletteComponent {
    name: string;
    type: ComponentType;
    cost: number;
}

export interface PlacedComponent {
    id: string;
    name: string;
    type: ComponentType;
    x: number; // percentage
    y: number; // percentage
    isToggled?: boolean; // For switches
    isOn?: boolean; // For power source
    fault?: ComponentFault;
    connectionPoints: ConnectionPoint[];
}

export interface Wire {
    id: string;
    startComponentId: string;
    startPointId: string;
    endComponentId: string;
    endPointId: string;
    color: WireColor;
}

export interface TestProbe {
    probe: Probe;
    targetComponentId: string | null;
    targetPointId: string | null;
}

export interface FlukeDisplay {
    primary: string;
    secondary: string;
}

export interface ExamTask {
    id: string;
    description: string;
    requiredComponents: { type: ComponentType; count: number }[];
    isCompleted?: boolean;
}

export interface DigitalTwinFeedback {
    isCorrect: boolean;
    feedbackSummary: string;
    correctItems: string[];
    missingItems: string[];
    placementErrors: { componentId: string; error: string }[];
}

export interface DigitalTwinFault {
    faultyComponentId?: string;
    faultyWireId?: string;
    description: string;
    faultType: 'component' | 'wire';
}


export interface LevelInfo {
    level: number;
    xp: number;
    xpForNextLevel: number;
    progress: number;
}

export type AiFlashcardState = 'idle' | 'loading' | 'error' | 'success';


export interface LearningPathInfo {
  id:string;
  title: string;
  description: string;
  pro?: boolean;
  sealImage: string;
  locked?: boolean;
}

export interface LearningPathData extends LearningPathInfo {
    nodes: SkillNode[];
}

export type LearningPathCollection = Record<string, LearningPathData>;

export interface CurrentCourseState {
    id: string;
    pathId: string;
}

// --- AI-Powered Feature Types ---
export interface DailyTip {
    title: string;
    content: string;
}

export interface JobAnalysis {
    summary: string;
    strengths: string[];
    areasForImprovement: string[];
}

export interface AevoFeedback {
    feedbackText: string;
    scores: {
        safety: number;
        technical: number;
        didactic: number;
        communication: number;
    };
}

export interface TroubleshootingScenario {
    id: string;
    title: string;
    description: string;
    possibleFaults: { id: string; description: string; component: string }[];
    fault: { id: string; description: string; component: string; };
    readings: {
        voltage: { key: string; value: number }[];
        resistance: { key: string; value: number }[];
    };
}
export type MeasurementPointId = 'L1_in' | 'F1_in' | 'F1_out' | 'K1_A1' | 'K1_A2' | 'M1_U' | 'M1_W';
export interface Measurement {
    point1: MeasurementPointId;
    point2?: MeasurementPointId;
    value: string;
    unit: 'V' | 'Ω';
}
export interface Fault {
    id: string;
    description: string;
}


// --- Team & Social Learning Types ---
export interface BerichtsheftComment {
    authorId: string; // User ID
    text: string;
    date: string; // ISO Date
}

export interface BerichtsheftEntry {
    id: number;
    date: string; // ISO Date string
    authorId: string; // User ID
    text: string;
    photos: string[]; // URLs to photos (mocked)
    comments: BerichtsheftComment[];
    status: 'pending' | 'approved';
}

export interface Expert {
    id: number;
    name: string;
    title: string;
    specialties: SkillCategory[];
    costPerSession: number; // in Wissens-Tokens
    imageUrl: string;
}

export interface LearningPathAssignment {
    id: string; // e.g. 'assign-123'
    pathId: string;
    assignedTo: string; // Azubi's User ID
    assignedBy: string; // Meister's User ID
    assignedAt: string; // ISO Date string
    isCompleted: boolean;
}

// --- Meister Project Simulation ---
export type MeisterProjectStep = 'planning' | 'materials' | 'documentation' | 'interview' | 'finished';

export interface MeisterProject {
    step: MeisterProjectStep;
    budget: number;
    materials: { item: string, cost: number }[];
    documentation: {
        proposal: string;
        techDoc: string;
    };
    interviewHistory: AiChatMessage[];
    finalScore?: number;
}

export interface MWDEvent {
  id: number;
  title: string;
  description: string;
  expertId: number;
  date: string; // ISO Date string
  isUpcoming: boolean;
  tags: SkillCategory[];
  videoId: string; // YouTube video ID for recordings
}

// --- Divine Gamification ---
export interface Achievement {
    id:string;
    name: string;
    description: string;
    icon: React.ElementType;
}

export interface GuildAchievement {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
}


export interface ToastNotification {
    id: number;
    title: string;
    message: string;
    icon: React.ElementType;
}

// --- Planning Simulator ---
export interface DeviceData {
    id: number;
    name: string;
    type: 'D-Motor' | 'AC' | 'Gerät'; // 3-phase or 1-phase
    P_kW: number;
    cosPhi: number | null;
    eta: number | null; // Wirkungsgrad
    length_m: number;
}

export interface UserCalculation {
    Pzu_kW: string;
    I_A_WS: string; // Strom Wechselstrom
    I_A_DS: string; // Strom Drehstrom
    Sicherung_A: string;
    A_mm2: string;
}

export interface PlanningScenario {
    id: string;
    title: string;
    description: string;
    devices: DeviceData[];
    correctSolutions: UserCalculation[];
}

export interface PlanningFeedback {
    summary: string;
    lineFeedback: {
        deviceIndex: number;
        field: keyof UserCalculation;
        comment: string;
        isCorrect: boolean;
    }[];
}

// --- NEW Global Search Types ---
export type SearchCategory = 'courses' | 'community' | 'experts';

export interface SearchableItem {
    id: string | number;
    title: string;
    description: string;
    category: SearchCategory;
    pathId?: string; // For courses
}

export interface SearchResult {
    id: string | number;
    title: string;
    description: string;
    category: SearchCategory;
    rank: number;
    pathId?: string; // For courses to navigate correctly
}

// --- NEW Career Page Types ---
export type CareerGoal = string;

export interface CareerRoadmapStep {
    title: string;
    description: string;
    type: 'learn' | 'practice' | 'certify';
    duration: string;
    completed: boolean;
}

export type CareerRoadmap = CareerRoadmapStep[];

export interface ApplicationAnalysis {
    summary: string;
    strengths: string[];
    areasForImprovement: string[];
    missingKeywords: string[];
}


// --- NEW Social Features ---
export interface StatusUpdate {
    id: string;
    authorId: string;
    content: string;
    timestamp: string; // ISO
    likes: string[]; // array of userIds
    comments: CommunityComment[];
}

export interface UserMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
}

export interface Conversation {
    id: string; // can be a compound key of user IDs for DMs, or a unique ID for groups
    participantIds: string[];
    participantInfo: { id: string; name: string; avatar: string; }[];
    messages: UserMessage[];
    isGroup: boolean;
    groupName?: string;
    unreadCount: number;
}

export interface LearningRoom {
    id: string;
    name: string;
    hostId: string;
    participants: Pick<User, 'id' | 'name' | 'avatar'>[];
    whiteboardState: any; // Store Tldraw snapshot here
    chat: UserMessage[];
}
