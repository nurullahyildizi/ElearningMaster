import React from 'react';
import { useAuth, useData } from '../../hooks/useAppContext';
import { Check, X, UserPlus, UserCheck } from 'lucide-react';

const FriendsManager: React.FC = () => {
    const { currentUser } = useAuth();
    const { users, handleAcceptFriendRequest, handleDeclineFriendRequest } = useData();

    if (!currentUser) return null;

    const friendRequests = currentUser.friendRequests || [];
    const friends = users.filter(u => currentUser.friends.includes(u.id));
    const potentialFriends = users.filter(u => u.id !== currentUser.id && !currentUser.friends.includes(u.id) && !friendRequests.some(req => req.fromId === u.id));

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Friend Requests */}
            <div className="md:col-span-1">
                <h3 className="font-bold text-xl text-white mb-4">Freundschaftsanfragen</h3>
                <div className="glass-card no-hover p-4 rounded-xl space-y-3">
                    {friendRequests.length > 0 ? friendRequests.map(req => (
                        <div key={req.fromId} className="bg-slate-800/70 p-3 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src={`https://i.pravatar.cc/40?u=${req.fromId}`} className="h-10 w-10 rounded-full" alt={req.fromName} />
                                <div>
                                    <p className="font-semibold text-white text-sm">{req.fromName}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleAcceptFriendRequest(req.fromId)} className="p-2 bg-green-500/20 hover:bg-green-500/40 text-green-300 rounded-full"><Check className="h-4 w-4"/></button>
                                <button onClick={() => handleDeclineFriendRequest(req.fromId)} className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-full"><X className="h-4 w-4"/></button>
                            </div>
                        </div>
                    )) : (
                        <p className="text-slate-400 text-sm text-center py-4">Keine offenen Anfragen.</p>
                    )}
                </div>
            </div>

            {/* Friends List */}
            <div className="md:col-span-1">
                <h3 className="font-bold text-xl text-white mb-4">Deine Freunde</h3>
                <div className="glass-card no-hover p-4 rounded-xl space-y-2 max-h-96 overflow-y-auto">
                     {friends.map(friend => (
                        <div key={friend.id} className="bg-slate-800/70 p-3 rounded-lg flex items-center gap-3">
                            <img src={`https://i.pravatar.cc/40?u=${friend.email}`} className="h-10 w-10 rounded-full" alt={friend.name} />
                            <div>
                                <p className="font-semibold text-white text-sm">{friend.name}</p>
                                <p className="text-xs text-slate-400">Level {friend.level}</p>
                            </div>
                        </div>
                     ))}
                </div>
            </div>

            {/* Find People */}
            <div className="md:col-span-1">
                 <h3 className="font-bold text-xl text-white mb-4">Leute finden</h3>
                <div className="glass-card no-hover p-4 rounded-xl space-y-2 max-h-96 overflow-y-auto">
                    {potentialFriends.map(user => (
                         <div key={user.id} className="bg-slate-800/70 p-3 rounded-lg flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <img src={`https://i.pravatar.cc/40?u=${user.email}`} className="h-10 w-10 rounded-full" alt={user.name} />
                                <div>
                                    <p className="font-semibold text-white text-sm">{user.name}</p>
                                    <p className="text-xs text-slate-400">Level {user.level}</p>
                                </div>
                            </div>
                             <button className="p-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-full" title="Freundschaftsanfrage senden (nicht implementiert)">
                                <UserPlus className="h-4 w-4"/>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FriendsManager;
