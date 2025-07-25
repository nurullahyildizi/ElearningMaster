import React, { ReactNode } from 'react';
import { MWDEvent, Expert, SkillCategory } from '../types';
import { SKILL_CATEGORIES } from '../constants';
import { Calendar, Video, Clock, Check, Tag, Plus } from 'lucide-react';
import { useData, useUI } from '../hooks/useAppContext';


const VideoPlayer: React.FC<{ videoId: string }> = ({ videoId }) => (
    <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
        <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
        ></iframe>
    </div>
);


const EventCard: React.FC<{ event: MWDEvent }> = ({ event }) => {
    const { experts, registeredEventIds, handleToggleEventRegistration } = useData();
    const { openModal } = useUI();

    const expert = experts.find(e => e.id === event.expertId);
    const isRegistered = registeredEventIds.has(event.id);

    const cardDate = new Date(event.date);
    const formattedDate = cardDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedTime = cardDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    const handlePastEventClick = () => {
        openModal(`Aufzeichnung: ${event.title}`, <VideoPlayer videoId={event.videoId} />);
    };

    return (
        <div className="glass-card p-6 rounded-xl flex flex-col transition-all duration-300">
            {event.isUpcoming && (
                 <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">LIVE</div>
            )}
            <div className="flex-grow">
                <div className="flex items-center text-sm text-slate-400 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formattedDate} - {formattedTime} Uhr</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                <p className="text-slate-300 text-sm mb-4">{event.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                    {event.tags.map(tag => (
                        <div key={tag} className="flex items-center bg-blue-500/10 text-blue-300 text-xs font-semibold px-2 py-1 rounded-full">
                            <Tag className="h-3 w-3 mr-1.5" />
                            {SKILL_CATEGORIES[tag as SkillCategory]?.label || tag}
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-slate-700/50 mt-auto pt-4 flex justify-between items-center">
                {expert ? (
                    <div className="flex items-center">
                        <img src={expert.imageUrl} alt={expert.name} className="h-10 w-10 rounded-full mr-3" />
                        <div>
                            <p className="text-sm font-semibold text-white">{expert.name}</p>
                            <p className="text-xs text-slate-400">{expert.title}</p>
                        </div>
                    </div>
                ) : <div/>}

                {event.isUpcoming ? (
                     <button
                        onClick={() => handleToggleEventRegistration(event.id)}
                        className={`px-4 py-2 rounded-lg font-bold flex items-center transition ${isRegistered ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-500'}`}
                    >
                        {isRegistered ? (
                            <>
                                <Check className="h-5 w-5 mr-2" />
                                Angemeldet
                            </>
                        ) : (
                             <>
                                <Plus className="h-5 w-5 mr-2" />
                                Anmelden
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={handlePastEventClick}
                        className="px-4 py-2 rounded-lg font-bold flex items-center transition bg-slate-600 hover:bg-slate-500"
                    >
                         <Video className="h-5 w-5 mr-2" />
                        Aufzeichnung ansehen
                    </button>
                )}
            </div>
        </div>
    );
};


const EventsView: React.FC = () => {
    const { events } = useData();
    
    const upcomingEvents = events.filter(e => e.isUpcoming).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastEvents = events.filter(e => !e.isUpcoming).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <section id="events" className="fade-in">
            <h2 className="text-3xl font-bold text-white mb-2">Events & Webinare</h2>
            <p className="text-slate-400 mb-8">Nehmen Sie an Live-Webinaren mit Branchenexperten teil oder sehen Sie sich Aufzeichnungen an, um Ihr Wissen zu vertiefen.</p>

            <div className="space-y-12">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center"><Calendar className="h-6 w-6 mr-3 text-blue-400" />Kommende Events</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                            <EventCard 
                                key={event.id} 
                                event={event} 
                            />
                        )) : (
                            <div className="glass-card no-hover p-8 rounded-xl text-center lg:col-span-2">
                                <p className="text-slate-500">Derzeit sind keine neuen Events geplant. Schauen Sie bald wieder vorbei!</p>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center"><Clock className="h-6 w-6 mr-3 text-purple-400" />Vergangene Aufzeichnungen</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {pastEvents.map(event => (
                            <EventCard 
                                key={event.id} 
                                event={event} 
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EventsView;
