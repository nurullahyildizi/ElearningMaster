import React, { useState } from 'react';
import { useAuth, useData } from '../../hooks/useAppContext';
import { Send, Heart, MessageSquare } from 'lucide-react';

const StatusFeed: React.FC = () => {
    const { currentUser } = useAuth();
    const { users, statusUpdates, handleCreateStatusUpdate } = useData();
    const [newStatus, setNewStatus] = useState('');

    if (!currentUser) return null;

    const friendsAndMe = new Set([...currentUser.friends, currentUser.id]);
    const feedUpdates = statusUpdates
        .filter(update => friendsAndMe.has(update.authorId))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const handlePostStatus = () => {
        if (newStatus.trim()) {
            handleCreateStatusUpdate(newStatus);
            setNewStatus('');
        }
    };
    
    const getAuthor = (authorId: string) => users.find(u => u.id === authorId);

    return (
        <div className="max-w-3xl mx-auto">
            <div className="glass-card no-hover p-4 rounded-xl mb-6">
                <textarea
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    placeholder={`Was gibt's Neues, ${currentUser.name.split(' ')[0]}?`}
                    className="w-full bg-slate-800/80 border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-slate-400"
                    rows={3}
                />
                <div className="text-right mt-2">
                    <button onClick={handlePostStatus} disabled={!newStatus.trim()} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center ml-auto gap-2 disabled:opacity-50">
                        <Send className="h-4 w-4" /> Posten
                    </button>
                </div>
            </div>
            
            <div className="space-y-4">
                {feedUpdates.map(update => {
                    const author = getAuthor(update.authorId);
                    if (!author) return null;
                    
                    return (
                        <div key={update.id} className="glass-card no-hover p-5 rounded-xl">
                            <div className="flex items-start gap-4">
                                <img src={`https://i.pravatar.cc/48?u=${author.email}`} className="h-12 w-12 rounded-full border-2 border-slate-600" alt={author.name}/>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-white">{author.name}</p>
                                            <p className="text-xs text-slate-400">{new Date(update.timestamp).toLocaleString('de-DE')}</p>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-slate-200 whitespace-pre-wrap">{update.content}</p>
                                    <div className="mt-3 flex items-center gap-4 text-slate-400">
                                         <button className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
                                            <Heart className="h-4 w-4"/> {update.likes.length}
                                        </button>
                                        <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                                            <MessageSquare className="h-4 w-4"/> {update.comments.length}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusFeed;
