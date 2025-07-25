import React, { useState, useEffect, useRef } from 'react';
import { Bell, Star, Ticket } from 'lucide-react';
import { useAuth } from '../hooks/useAppContext';
import { useData } from '../hooks/useAppContext';
import GlobalSearch from './search/GlobalSearch';

const Header: React.FC = () => {
    const { currentUser } = useAuth();
    const { lastXpGain } = useData();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [hasNotification, setHasNotification] = useState(true);
    const notificationRef = useRef<HTMLDivElement>(null);
    const [showXpGain, setShowXpGain] = useState(false);

    useEffect(() => {
        if(lastXpGain > 0) {
            setShowXpGain(true);
            const timer = setTimeout(() => setShowXpGain(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [lastXpGain]);


    const toggleNotifications = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsNotificationOpen(prev => !prev);
        if (hasNotification) {
            setHasNotification(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    if (!currentUser) return null;

    return (
        <header className="flex justify-between items-center mb-8 shrink-0 relative">
            <div>
                <h2 className="text-3xl font-bold text-white">Guten Morgen, {currentUser.name.split(' ')[0]}! 👋</h2>
                <p className="text-slate-400">Lass uns heute wieder etwas Neues lernen.</p>
            </div>
             {showXpGain && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 text-yellow-300 font-bold flex items-center text-lg xp-gain-animation">
                    <Star className="h-6 w-6 mr-1 fill-current" /> +{lastXpGain} XP
                </div>
            )}
            <div className="flex items-center space-x-4">
                <GlobalSearch />
                <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1.5 rounded-full">
                    <Ticket className="h-5 w-5 text-amber-400" />
                    <span className="font-bold text-white">{currentUser.wissensTokens}</span>
                    <span className="text-sm text-slate-400 hidden md:inline">Tokens</span>
                </div>
                <div className="relative" ref={notificationRef}>
                    <button onClick={toggleNotifications} className="relative">
                        <Bell className="text-slate-400 h-6 w-6 hover:text-white transition" />
                        {hasNotification && (
                             <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-slate-900"></span>
                        )}
                    </button>
                    {isNotificationOpen && (
                         <div className="absolute right-0 mt-2 w-80 glass-card no-hover rounded-xl shadow-lg p-4 z-10 fade-in">
                            <p className="text-white font-semibold mb-2">Benachrichtigungen</p>
                            <div className="text-sm text-slate-300">Neue Norm! Die DIN 18015 wurde aktualisiert.</div>
                            <div className="text-xs text-blue-400 mt-1">vor 2 Stunden</div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;