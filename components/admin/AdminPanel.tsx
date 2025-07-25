

import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AnalyticsDashboard from './AnalyticsDashboard';
import UserManagement from './UserManagement';
import ContentManagement from './ContentManagement';
import { LearningPathCollection, User, Company } from '../../types';
import CompanyManagement from './CompanyManagement';

type AdminView = 'dashboard' | 'users' | 'content' | 'companies';

interface AdminPanelProps {
    learningPaths: LearningPathCollection;
    setLearningPaths: React.Dispatch<React.SetStateAction<LearningPathCollection>>;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    companies: Company[];
    setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
    onExit: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ learningPaths, setLearningPaths, users, setUsers, companies, setCompanies, onExit }) => {
    const [view, setView] = useState<AdminView>('dashboard');

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <AnalyticsDashboard users={users} learningPaths={learningPaths} />;
            case 'users':
                return <UserManagement users={users} setUsers={setUsers} companies={companies} />;
            case 'content':
                return <ContentManagement learningPaths={learningPaths} setLearningPaths={setLearningPaths} />;
            case 'companies':
                return <CompanyManagement companies={companies} setCompanies={setCompanies} users={users} />;
            default:
                return <AnalyticsDashboard users={users} learningPaths={learningPaths} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-200 text-slate-800">
            <AdminSidebar activeView={view} setView={setView} onExit={onExit} />
            <main className="flex-1 p-8 overflow-y-auto">
                {renderView()}
            </main>
        </div>
    );
};

export default AdminPanel;