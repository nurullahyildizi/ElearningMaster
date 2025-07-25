import React, { useState, useRef, useEffect } from 'react';
import { useAuth, useData } from '../../hooks/useAppContext';
import { Conversation, UserMessage } from '../../types';
import { Send, Users, User } from 'lucide-react';

const ChatInterface: React.FC = () => {
    const { currentUser } = useAuth();
    const { conversations, users, handleSendMessage } = useData();
    const [activeConversationId, setActiveConversationId] = useState<string | null>(conversations[0]?.id || null);
    const [message, setMessage] = useState('');
    const chatWindowRef = useRef<HTMLDivElement>(null);

    const activeConversation = conversations.find(c => c.id === activeConversationId);
    
    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [activeConversation]);

    if (!currentUser) return null;

    const getConversationTitle = (convo: Conversation) => {
        if (convo.isGroup) return convo.groupName;
        const otherParticipant = convo.participantInfo.find(p => p.id !== currentUser.id);
        return otherParticipant?.name || 'Unbekannter Chat';
    };
    
    const getConversationAvatar = (convo: Conversation) => {
        if (convo.isGroup) return <Users className="h-10 w-10 p-2 bg-purple-500 text-white rounded-full"/>;
        const otherParticipant = convo.participantInfo.find(p => p.id !== currentUser.id);
        if(!otherParticipant) return <User className="h-10 w-10 p-2 bg-slate-500 text-white rounded-full"/>;
        return <img src={`https://i.pravatar.cc/40?u=${otherParticipant.id}`} className="h-10 w-10 rounded-full" alt="avatar" />
    };
    
    const handleSend = () => {
        if (message.trim() && activeConversationId) {
            handleSendMessage(activeConversationId, message);
            setMessage('');
        }
    };

    return (
        <div className="glass-card no-hover rounded-xl flex h-[75vh]">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-slate-700/50 flex flex-col">
                <h3 className="p-4 font-bold text-lg border-b border-slate-700/50 shrink-0">Nachrichten</h3>
                <div className="overflow-y-auto">
                    {conversations.map(convo => (
                        <button 
                            key={convo.id} 
                            onClick={() => setActiveConversationId(convo.id)}
                            className={`w-full text-left p-3 flex items-center gap-3 transition-colors ${activeConversationId === convo.id ? 'bg-blue-600/30' : 'hover:bg-slate-800/50'}`}
                        >
                            {getConversationAvatar(convo)}
                            <div className="flex-grow overflow-hidden">
                                <p className="font-semibold text-white truncate">{getConversationTitle(convo)}</p>
                                <p className="text-xs text-slate-400 truncate">{convo.messages[convo.messages.length - 1]?.text}</p>
                            </div>
                             {convo.unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{convo.unreadCount}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Chat Window */}
            <div className="w-2/3 flex flex-col">
                {activeConversation ? (
                    <>
                        <div className="p-4 border-b border-slate-700/50 shrink-0 flex items-center gap-3">
                            {getConversationAvatar(activeConversation)}
                             <h3 className="font-bold text-lg">{getConversationTitle(activeConversation)}</h3>
                        </div>
                        <div ref={chatWindowRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
                            {activeConversation.messages.map(msg => {
                                const author = activeConversation.participantInfo.find(p => p.id === msg.senderId);
                                const isMe = msg.senderId === currentUser.id;
                                return (
                                <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    {!isMe && <img src={`https://i.pravatar.cc/32?u=${author?.id}`} className="h-8 w-8 rounded-full" alt="avatar"/>}
                                    <div className={`max-w-md p-3 rounded-xl text-sm ${isMe ? 'bg-blue-600 rounded-br-none' : 'bg-slate-700 rounded-bl-none'}`}>
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            )})}
                        </div>
                        <div className="p-4 border-t border-slate-700/50 shrink-0">
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Nachricht schreiben..."
                                    className="w-full bg-slate-800/80 border border-slate-600 rounded-full py-3 pl-4 pr-12 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                                <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 rounded-full">
                                    <Send className="h-5 w-5 text-white"/>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <p>Wähle eine Konversation aus, um den Chat zu beginnen.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatInterface;
