
import React from 'react';
import { Bolt, LayoutDashboard, Users, FileCode, LogOut, Building2 } from 'lucide-react';

type AdminView = 'dashboard' | 'users' | 'content' | 'companies';

const ADMIN_NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Benutzer', icon: Users },
    { id: 'content', label: 'Inhalte', icon: FileCode },
    { id: 'companies', label: 'Unternehmen', icon: Building2 },
];

interface AdminSidebarProps {
    activeView: AdminView;
    setView: (view: AdminView) => void;
    onExit: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, setView, onExit }) => {
    return (
        <aside className="w-64 bg-slate-800 text-white p-4 flex flex-col justify-between shrink-0">
            <div>
                <div className="flex items-center mb-10 pl-2">
                    <Bolt className="text-blue-400 h-8 w-8 mr-2" />
                    <h1 className="text-2xl font-bold">Admin Panel</h1>
                </div>
                <nav className="flex flex-col space-y-2">
                    {ADMIN_NAV_ITEMS.map(item => (
                        <a
                            key={item.id}
                            href="#"
                            onClick={(e) => { e.preventDefault(); setView(item.id as AdminView); }}
                            className={`flex items-center py-2.5 px-4 rounded-lg transition-colors ${activeView === item.id ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-slate-700'}`}
                        >
                            <item.icon className="h-5 w-5 mr-3" />
                            {item.label}
                        </a>
                    ))}
                </nav>
            </div>
            <div>
                 <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); onExit(); }}
                    className="flex items-center py-2.5 px-4 rounded-lg mt-2 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Admin-Panel verlassen
                </a>
            </div>
        </aside>
    );
};

export default AdminSidebar;
