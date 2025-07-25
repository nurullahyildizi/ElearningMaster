import React from 'react';
import { View } from '../types';
import { NAV_ITEMS } from '../constants';
import { Bolt, LogOut, Settings, Shield, Gem } from 'lucide-react';
import { useAuth } from '../hooks/useAppContext';
import { useData } from '../hooks/useAppContext';
import { useUI } from '../hooks/useAppContext';

interface SidebarProps {}

const XpProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full bg-blue-900/70 rounded-full h-1.5 xp-progress-bar">
        <div
            className="h-1.5 rounded-full xp-progress-bar-inner"
            style={{ width: `${progress}%` }}
        ></div>
    </div>
);

const Sidebar: React.FC<SidebarProps> = () => {
    const { currentUser, logout } = useAuth();
    const { levelInfo, assignments } = useData();
    const { view, setView, openUpgradeModal, openSettingsModal } = useUI();
    
    if (!currentUser || !levelInfo) return null;

    const handleNavClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        if (id === 'upgrade') {
            openUpgradeModal();
        } else if (id === 'admin') {
            setView(View.Admin);
        } else {
            setView(id as View);
        }
    };

    const navItemsToShow = NAV_ITEMS.filter(item => {
        if (item.id === View.Gilde) {
            return currentUser.role === 'meister' || currentUser.role === 'azubi';
        }
        if (item.id === View.Experts) {
            return currentUser.subscriptionStatus === 'pro';
        }
        return true;
    });

    const hasNewAssignment = assignments.some(a => a.assignedTo === currentUser.id && !a.isCompleted);

    return (
        <aside className="w-64 bg-slate-900/80 backdrop-blur-sm p-4 flex flex-col justify-between border-r border-slate-700/50 shrink-0">
            <div>
                <div className="flex items-center mb-10 pl-2">
                    <Bolt className="text-blue-400 h-8 w-8 mr-2" />
                    <h1 className="text-2xl font-bold text-white">MeisterWerk</h1>
                </div>
                <nav className="flex flex-col space-y-2">
                    {navItemsToShow.map(item => (
                        <a
                            key={item.id}
                            href="#"
                            onClick={(e) => handleNavClick(e, item.id)}
                            className={`nav-item flex items-center py-2.5 px-4 rounded-lg ${view === item.id ? 'active-nav' : ''}`}
                        >
                            <item.icon className="h-5 w-5 mr-3" />
                            <span>{item.label}</span>
                            {item.id === View.Gilde && hasNewAssignment && <span className="notification-badge" title="Neue Aufgabe"></span>}
                        </a>
                    ))}
                </nav>
            </div>
            
            <div className="flex flex-col gap-4">
                {currentUser.subscriptionStatus !== 'pro' && (
                    <a
                        href="#"
                        onClick={(e) => handleNavClick(e, 'upgrade')}
                        className="nav-item flex items-center py-2.5 px-4 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300"
                    >
                        <Gem className="h-5 w-5 mr-3"/>
                        <span className="font-semibold">Upgrade auf Pro</span>
                    </a>
                )}
                <div className="border-t border-slate-700/50 pt-4">
                     <div className="flex items-center gap-3">
                        <img src={`https://i.pravatar.cc/48?u=${currentUser.email}`} alt="User Avatar" className="h-10 w-10 rounded-full border-2 border-blue-500 object-cover" />
                        <div className="flex-1 overflow-hidden">
                            <p className="font-semibold text-white truncate">{currentUser.name}</p>
                            <div className="flex justify-between items-baseline text-xs text-slate-400">
                                <span>Level {levelInfo.level}</span>
                                <span className="truncate">{levelInfo.xp}/{levelInfo.xpForNextLevel} XP</span>
                            </div>
                            <XpProgressBar progress={levelInfo.progress} />
                        </div>
                    </div>
                     <div className="mt-4 flex items-center justify-around">
                        <button onClick={() => setView(View.Admin)} className={`flex flex-col items-center text-slate-400 hover:text-white text-xs ${currentUser.role === 'meister' ? '' : 'hidden'}`} title="Admin Panel">
                            <Shield className="h-5 w-5" />
                            <span>Admin</span>
                        </button>
                        <button onClick={openSettingsModal} className="flex flex-col items-center text-slate-400 hover:text-white text-xs" title="Profil & Tokens">
                            <Settings className="h-5 w-5"/>
                            <span>Profil</span>
                        </button>
                        <button onClick={logout} className="flex flex-col items-center text-slate-400 hover:text-white text-xs" title="Abmelden">
                            <LogOut className="h-5 w-5"/>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;