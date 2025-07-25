import React from 'react';
import { useData, useUI } from '../../hooks/useAppContext';
import { PenSquare, PlusCircle, Users } from 'lucide-react';

const LearningRoomBrowser: React.FC = () => {
    const { learningRooms, handleJoinRoom } = useData();
    const { openCreateRoomModal } = useUI();

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <p className="text-slate-400">Treten Sie einem Raum bei oder erstellen Sie einen neuen, um mit anderen zusammenzuarbeiten.</p>
                <button onClick={openCreateRoomModal} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <PlusCircle className="h-5 w-5" /> Neuen Raum erstellen
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {learningRooms.map(room => (
                    <div key={room.id} className="glass-card p-5 rounded-xl flex flex-col">
                        <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-500/20 rounded-full">
                                    <PenSquare className="h-6 w-6 text-green-300" />
                                </div>
                                <h4 className="font-bold text-lg text-white truncate">{room.name}</h4>
                            </div>
                            <p className="text-sm text-slate-400 mb-4">Moderator: {room.participants.find(p => p.id === room.hostId)?.name}</p>
                            
                            <div className="mb-4">
                                <p className="text-xs font-semibold text-slate-300 mb-2">Teilnehmer ({room.participants.length})</p>
                                <div className="flex -space-x-3">
                                    {room.participants.slice(0, 5).map(p => (
                                         <img 
                                            key={p.id}
                                            className="w-8 h-8 border-2 border-slate-700 rounded-full object-cover" 
                                            src={`https://i.pravatar.cc/32?u=${p.id}`}
                                            alt={p.name}
                                            title={p.name}
                                        />
                                    ))}
                                    {room.participants.length > 5 && (
                                        <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-slate-700 flex items-center justify-center text-xs font-bold">
                                            +{room.participants.length - 5}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => handleJoinRoom(room.id)} className="w-full mt-auto bg-green-600 hover:bg-green-500 text-white font-semibold py-2 rounded-lg">
                            Beitreten
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LearningRoomBrowser;
