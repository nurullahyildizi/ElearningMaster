import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AnalyticsDashboard from './AnalyticsDashboard';
import UserManagement from './UserManagement';
import ContentManagement from './ContentManagement';
import CompanyManagement from './CompanyManagement';
import { useData, useUI } from '../../hooks/useAppContext';
import { View } from '../../types';

type AdminView = 'dashboard' | 'users' | 'content' | 'companies';

interface AdminPanelProps {
    onExit: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onExit }) => {
    const { learningPaths, setLearningPaths, users, setUsers, companies, setCompanies } = useData();
    const [view, setView] = useState<AdminView>('dashboard');

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <AnalyticsDashboard users={users} learningPaths={learningPaths} />;
            case 'users':
                return <UserManagement users={users} setUsers={setUsers} />;
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
