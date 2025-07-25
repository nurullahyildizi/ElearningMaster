import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth, useData } from '../../hooks/useAppContext';
import { useUserMedia } from '../../hooks/useUserMedia';
import { Tldraw, TldrawEditor, TldrawSnapshot, TLStoreSnapshot } from '@tldraw/tldraw';
import type { User } from '../../types';
import { Send, Users, Mic, MicOff, Video, VideoOff, LogOut, PenSquare } from 'lucide-react';

// Debounce utility to prevent excessive state updates
function debounce<T extends (...args: any[]) => void>(func: T, waitFor: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const debounced = (...args: Parameters<T>): void => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => func(...args), waitFor);
    };
    return debounced;
}

const VideoTile: React.FC<{ participant: Pick<User, 'id' | 'name' | 'avatar'>, isLocal: boolean }> = ({ participant, isLocal }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    // Only request media for the local user
    const mediaStream = isLocal ? useUserMedia({ video: true, audio: true }) : null;
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);

    useEffect(() => {
        if (isLocal && videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
        }
    }, [isLocal, mediaStream]);

    useEffect(() => {
        if (mediaStream) {
            mediaStream.getAudioTracks().forEach(track => track.enabled = isMicOn);
            mediaStream.getVideoTracks().forEach(track => track.enabled = isCameraOn);
        }
    }, [mediaStream, isMicOn, isCameraOn]);
    
    return (
        <div className="video-tile">
            {isLocal && mediaStream ? (
                <video ref={videoRef} autoPlay muted playsInline />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                    <img src={`https://i.pravatar.cc/48?u=${participant.id}`} className="h-12 w-12 rounded-full opacity-50" alt={participant.name}/>
                </div>
            )}
            <div className="video-tile-name">{participant.name} {isLocal && '(Du)'}</div>
            {isLocal && (
                <div className="absolute top-1 right-1 flex gap-1">
                    <button onClick={() => setIsMicOn(!isMicOn)} className="p-1.5 bg-black/40 rounded-full">{isMicOn ? <Mic className="h-3 w-3"/> : <MicOff className="h-3 w-3 text-red-400"/>}</button>
                    <button onClick={() => setIsCameraOn(!isCameraOn)} className="p-1.5 bg-black/40 rounded-full">{isCameraOn ? <Video className="h-3 w-3"/> : <VideoOff className="h-3 w-3 text-red-400"/>}</button>
                </div>
            )}
        </div>
    );
};


const LearningRoomView: React.FC = () => {
    const { currentUser } = useAuth();
    const { learningRooms, currentLearningRoomId, handleLeaveRoom, handleUpdateWhiteboard, handleSendRoomMessage } = useData();
    const [message, setMessage] = useState('');
    const chatWindowRef = useRef<HTMLDivElement>(null);

    const room = learningRooms.find(r => r.id === currentLearningRoomId);

    const handleMount = useCallback((editor: TldrawEditor) => {
        if (!room) return;
        // Listen to changes in the store
        const unsub = editor.store.listen(
            debounce((change: any) => {
                // If the change is from the user, sync it
                if (change.source === 'user') {
                   handleUpdateWhiteboard(room.id, editor.store.getSnapshot());
                }
            }, 500)
        );

        // Cleanup on unmount
        return () => {
            unsub();
        };
    }, [room, handleUpdateWhiteboard]);

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [room?.chat]);

    const handleSend = () => {
        if (message.trim() && room) {
            handleSendRoomMessage(room.id, message);
            setMessage('');
        }
    };

    if (!room || !currentUser) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p>Lernraum wird geladen...</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-950 w-full h-screen flex flex-col">
            <header className="p-3 border-b border-slate-700 flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-full">
                        <PenSquare className="h-6 w-6 text-green-300" />
                    </div>
                    <h2 className="text-xl font-bold">{room.name}</h2>
                </div>
                <button onClick={handleLeaveRoom} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <LogOut className="h-4 w-4" /> Raum verlassen
                </button>
            </header>
            <div className="learning-room-container">
                <main className="learning-room-main">
                    <Tldraw 
                        snapshot={room.whiteboardState as TLStoreSnapshot}
                        onMount={handleMount}
                        forceMobile
                    />
                </main>
                <aside className="learning-room-sidebar">
                    <div className="glass-card no-hover p-2 rounded-xl">
                        <div className="video-grid">
                            {room.participants.map(p => (
                                <VideoTile key={p.id} participant={p} isLocal={p.id === currentUser.id} />
                            ))}
                        </div>
                    </div>
                    <div className="glass-card no-hover p-2 rounded-xl flex-grow flex flex-col">
                        <h4 className="font-semibold text-center p-2 border-b border-slate-700/50">Chat</h4>
                        <div ref={chatWindowRef} className="flex-1 p-2 space-y-3 overflow-y-auto">
                            {room.chat.map(msg => {
                                const author = room.participants.find(p => p.id === msg.senderId);
                                const isMe = msg.senderId === currentUser.id;
                                return (
                                <div key={msg.id} className={`flex items-end gap-2 text-sm ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs p-2 rounded-lg ${isMe ? 'bg-blue-600' : 'bg-slate-700'}`}>
                                        {!isMe && <p className="font-bold text-xs text-blue-300 mb-0.5">{author?.name}</p>}
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            )})}
                        </div>
                        <div className="p-2 border-t border-slate-700/50">
                             <div className="relative">
                                <input 
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Chatten..."
                                    className="w-full bg-slate-800/80 border border-slate-600 rounded-full py-2 pl-3 pr-10 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                                <button onClick={handleSend} className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 hover:bg-blue-500 rounded-full">
                                    <Send className="h-4 w-4 text-white"/>
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default LearningRoomView;