

import React, { useState, useMemo } from 'react';
import { User, BerichtsheftEntry, BerichtsheftComment } from '../../types';
import { Paperclip, Send } from 'lucide-react';

interface BerichtsheftProps {
    currentUser: User; // The logged-in user
    selectedAzubi?: User; // The azubi being viewed (in Meister mode)
    isMeisterView: boolean;
    berichtsheft: BerichtsheftEntry[];
    onUpdateBerichtsheft: (newBerichtsheft: BerichtsheftEntry[]) => void;
}

const Berichtsheft: React.FC<BerichtsheftProps> = ({ currentUser, selectedAzubi, isMeisterView, berichtsheft, onUpdateBerichtsheft }) => {
    const [newEntryText, setNewEntryText] = useState('');
    const [newCommentText, setNewCommentText] = useState<Record<number, string>>({});
    
    // Determine which user's entries to display
    const targetUserId = isMeisterView ? selectedAzubi?.id : currentUser.id;
    const userEntries = useMemo(() => 
        berichtsheft.filter(e => e.authorId === targetUserId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [berichtsheft, targetUserId]);

    const handleAddEntry = () => {
        if (!newEntryText.trim() || isMeisterView) return;
        const newEntry: BerichtsheftEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            authorId: currentUser.id,
            text: newEntryText,
            photos: [], // Photo upload not implemented in this version
            comments: [],
            status: 'pending'
        };
        onUpdateBerichtsheft([newEntry, ...berichtsheft]);
        setNewEntryText('');
    };
    
    const handleAddComment = (entryId: number) => {
        const commentText = newCommentText[entryId];
        if (!commentText || !commentText.trim() || !isMeisterView) return;
        
        const newComment: BerichtsheftComment = {
            authorId: currentUser.id,
            text: commentText,
            date: new Date().toISOString()
        };
        
        const updatedBerichtsheft = berichtsheft.map(entry => {
            if (entry.id === entryId) {
                return {
                    ...entry,
                    comments: [...entry.comments, newComment],
                    status: 'approved' as const,
                };
            }
            return entry;
        });
        
        onUpdateBerichtsheft(updatedBerichtsheft);
        setNewCommentText(prev => ({...prev, [entryId]: ''}));
    };

    return (
        <div className="space-y-4">
            {!isMeisterView && (
                <div className="bg-slate-700/50 p-3 rounded-lg">
                    <textarea 
                        value={newEntryText}
                        onChange={(e) => setNewEntryText(e.target.value)}
                        placeholder="Was hast du heute gelernt?"
                        className="w-full bg-transparent border-0 focus:ring-0 resize-none p-1 placeholder-slate-400 text-sm"
                        rows={3}
                    />
                    <div className="flex justify-between items-center mt-2">
                        <button className="p-2 text-slate-400 hover:text-white" title="Foto anhängen (demnächst)"><Paperclip className="h-5 w-5"/></button>
                        <button onClick={handleAddEntry} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-1 px-3 rounded-lg text-sm">Eintragen</button>
                    </div>
                </div>
            )}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {userEntries.length > 0 ? userEntries.map(entry => (
                    <div key={entry.id} className="bg-slate-800/50 p-4 rounded-lg">
                        <p className="text-xs text-slate-400 mb-1">{new Date(entry.date).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="text-sm text-slate-200 mb-3 whitespace-pre-wrap">{entry.text}</p>
                        {entry.photos.length > 0 && (
                             <img src={entry.photos[0]} alt="Arbeitsnachweis" className="rounded-lg mb-3" />
                        )}
                        {entry.comments.map((comment, index) => (
                             <div key={index} className="bg-slate-900/70 p-3 mt-2 rounded-md border-l-2 border-blue-500">
                                 <p className="text-xs font-bold text-blue-400">Kommentar vom Meister</p>
                                 <p className="text-sm text-slate-300 mt-1">{comment.text}</p>
                             </div>
                        ))}
                         {isMeisterView && (
                             <div className="relative mt-3">
                                 <input 
                                    type="text" 
                                    placeholder="Kommentar als Meister hinzufügen..." 
                                    value={newCommentText[entry.id] || ''}
                                    onChange={e => setNewCommentText(prev => ({...prev, [entry.id]: e.target.value}))}
                                    onKeyDown={e => e.key === 'Enter' && handleAddComment(entry.id)}
                                    className="w-full text-sm bg-slate-700 border-slate-600 rounded-full py-2 pl-4 pr-10"
                                />
                                 <button onClick={() => handleAddComment(entry.id)} className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-blue-500 hover:bg-blue-400 rounded-full"><Send className="h-4 w-4 text-white"/></button>
                             </div>
                         )}
                    </div>
                )) : (
                    <div className="text-center py-8 text-slate-500 text-sm">
                        Keine Einträge im Berichtsheft vorhanden.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Berichtsheft;