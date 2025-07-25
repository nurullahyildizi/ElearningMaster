import { MOCK_USER_DATA, MOCK_COMPANY_DATA, MOCK_EXPERT_DATA, MWD_EVENTS, COMMUNITY_DATA, LEARNING_PATH_DATA, MOCK_STATUS_UPDATES, MOCK_CONVERSATIONS, MOCK_LEARNING_ROOMS } from '../constants';
import { User, Company, Expert, MWDEvent, CommunityPost, LearningPathAssignment, BerichtsheftEntry, LearningPathCollection, SubscriptionStatus, StatusUpdate, Conversation, LearningRoom } from '../types';

// In-memory data stores, initialized with mock data.
let users: User[] = JSON.parse(JSON.stringify(MOCK_USER_DATA));
let companies: Company[] = JSON.parse(JSON.stringify(MOCK_COMPANY_DATA));
let experts: Expert[] = JSON.parse(JSON.stringify(MOCK_EXPERT_DATA));
let events: MWDEvent[] = JSON.parse(JSON.stringify(MWD_EVENTS));
let communityPosts: CommunityPost[] = JSON.parse(JSON.stringify(COMMUNITY_DATA));
let statusUpdates: StatusUpdate[] = JSON.parse(JSON.stringify(MOCK_STATUS_UPDATES));
let conversations: Conversation[] = JSON.parse(JSON.stringify(MOCK_CONVERSATIONS));
let learningRooms: LearningRoom[] = JSON.parse(JSON.stringify(MOCK_LEARNING_ROOMS));


// Start with some mock data for team features
let assignments: LearningPathAssignment[] = [
    { id: 'assign-1', pathId: 'ausbildung_elektroniker', assignedTo: 'user-2', assignedBy: 'user-3', assignedAt: '2024-05-10T10:00:00Z', isCompleted: false },
];
let berichtsheft: BerichtsheftEntry[] = [
    { id: 1, date: '2024-05-13T09:00:00Z', authorId: 'user-2', text: 'Heute habe ich die Grundlagen der 5 Sicherheitsregeln wiederholt und eine Wechselschaltung geplant.', photos: [], comments: [], status: 'pending' },
    { id: 2, date: '2024-05-14T09:00:00Z', authorId: 'user-2', text: 'Verdrahtung der Wechselschaltung im Übungsaufbau. Alles hat auf Anhieb funktioniert.', photos: [], comments: [{ authorId: 'user-3', text: 'Sehr gut, saubere Arbeit!', date: '2024-05-14T17:00:00Z' }], status: 'approved' },
];


const SESSION_STORAGE_KEY = 'mwd_current_user_id';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const api = {
    async login(email: string, password_unused: string): Promise<{ success: boolean; user?: User; error?: string }> {
        await delay(500);
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, user.id);
            return { success: true, user };
        }
        return { success: false, error: "Benutzer nicht gefunden oder Passwort falsch." };
    },

    async register(name: string, email: string, password_unused: string): Promise<{ success: boolean; user?: User; error?: string }> {
        await delay(500);
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, error: "Diese E-Mail-Adresse wird bereits verwendet." };
        }
        const newUser: User = {
            id: `user-${Date.now()}`,
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
            learningProgress: {},
            friends: [],
            friendRequests: [],
        };
        users.push(newUser);
        sessionStorage.setItem(SESSION_STORAGE_KEY, newUser.id);
        return { success: true, user: newUser };
    },

    async logout(): Promise<void> {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        return Promise.resolve();
    },

    async checkSession(): Promise<User | null> {
        await delay(100);
        const userId = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (userId) {
            return users.find(u => u.id === userId) || null;
        }
        return null;
    },

    async fetchAllData(currentUserId: string): Promise<any> {
        await delay(300);
        return {
            users: [...users],
            companies: [...companies],
            experts: [...experts],
            events: [...events],
            communityPosts: [...communityPosts],
            assignments: [...assignments],
            berichtsheft: [...berichtsheft],
            statusUpdates: [...statusUpdates],
            conversations: [...conversations],
            learningRooms: [...learningRooms],
        };
    },

    async updateUser(userId: string, updates: Partial<User>): Promise<User> {
        await delay(100);
        let updatedUser: User | null = null;
        users = users.map(user => {
            if (user.id === userId) {
                updatedUser = { ...user, ...updates };
                return updatedUser;
            }
            return user;
        });
        if (!updatedUser) throw new Error("User not found for update");
        return updatedUser;
    },
    
    async addAssignment(newAssignmentData: Omit<LearningPathAssignment, 'id' | 'assignedAt'>): Promise<LearningPathAssignment> {
        await delay(150);
        const newAssignment: LearningPathAssignment = {
            ...newAssignmentData,
            id: `assign-${Date.now()}`,
            assignedAt: new Date().toISOString(),
        };
        assignments.push(newAssignment);
        return newAssignment;
    },

    async updateBerichtsheft(newBerichtsheft: BerichtsheftEntry[]): Promise<BerichtsheftEntry[]> {
        await delay(150);
        berichtsheft = newBerichtsheft;
        return [...berichtsheft];
    },
    
    async rewardUserWithToken(rewardedUserId: string, rewardingUserId: string): Promise<{ success: boolean }> {
        await delay(100);
        const rewardingUserIndex = users.findIndex(u => u.id === rewardingUserId);
        const rewardedUserIndex = users.findIndex(u => u.id === rewardedUserId);

        if (rewardingUserIndex > -1 && rewardedUserIndex > -1 && users[rewardingUserIndex].wissensTokens >= 1) {
            users[rewardingUserIndex].wissensTokens -= 1;
            users[rewardedUserIndex].wissensTokens += 1;
            return { success: true };
        }
        return { success: false };
    },

    async updateUserSubscription(userId: string, status: SubscriptionStatus): Promise<User> {
        await delay(300);
        let user = users.find(u => u.id === userId);
        if(!user) throw new Error("User not found");
        
        const newAchievements = new Set(user.unlockedAchievements);
        if (status === 'pro') {
            newAchievements.add('PRO_USER');
        }
        
        return await this.updateUser(userId, { 
            subscriptionStatus: status,
            unlockedAchievements: Array.from(newAchievements)
        });
    },
};

export { api };
