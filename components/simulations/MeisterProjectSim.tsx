

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { MeisterProject, MeisterProjectStep, AiChatMessage } from '../../types';
import { Lightbulb, List, FileText, Users, Award, Send, Bot, Loader2, ChevronsRight, Repeat } from 'lucide-react';
import type { Chat } from '@google/genai';

const PROJECT_DESCRIPTION = `Sie haben den Auftrag erhalten, die komplette Elektroinstallation für ein modernes Einfamilienhaus zu planen. Der Kunde wünscht ein Smart Home auf KNX-Basis, eine 10 kWp PV-Anlage mit 8 kWh Batteriespeicher und eine 11 kW Wallbox für ein E-Auto. Ihr Budget beträgt 35.000 €.`;
const INTERVIEWER_PROMPT = `Du bist ein strenger, aber fairer IHK-Prüfer im Fachgespräch zur Meisterprüfung. Deine Aufgabe ist es, den Plan des Prüflings (des Benutzers) kritisch zu hinterfragen. Stelle präzise, technische Fragen zu seinem eingereichten Plan. Fordere Begründungen für seine Entscheidungen. Prüfe Normenkenntnisse (z.B. "Welche VDE-Normen haben Sie bei der Dimensionierung der PV-Leitungen beachtet?"). Frage nach wirtschaftlichen Aspekten (z.B. "Wie rechtfertigen Sie diese teure Komponente gegenüber dem Kunden?"). Bleibe immer in deiner Rolle als Prüfer. Gib am Ende keine Note, sondern beende das Gespräch förmlich. Beginne das Gespräch mit: "Guten Tag. Stellen Sie bitte kurz Ihr Projekt vor."`;

interface StepProps {
    isActive: boolean;
    isCompleted: boolean;
    title: string;
    icon: React.ReactNode;
}

const StepIndicator: React.FC<StepProps> = ({ isActive, isCompleted, title, icon }) => (
    <div className="flex flex-col items-center flex-1">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
            isActive ? 'bg-blue-600 border-blue-400 animate-pulse' : isCompleted ? 'bg-green-600 border-green-400' : 'bg-slate-700 border-slate-600'
        }`}>
            {icon}
        </div>
        <p className={`mt-2 text-sm font-semibold text-center ${isActive || isCompleted ? 'text-white' : 'text-slate-500'}`}>{title}</p>
    </div>
);

const MeisterProjectSim: React.FC<{ onExit: (completed: boolean) => void }> = ({ onExit }) => {
    const [project, setProject] = useState<MeisterProject>({
        step: 'planning',
        budget: 35000,
        materials: [{ item: "Grundinstallation (Leitungen, Dosen)", cost: 5000 }],
        documentation: { proposal: '', techDoc: '' },
        interviewHistory: [],
    });

    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [isThinking, setIsThinking] = useState(false);
    const [input, setInput] = useState('');
    const chatWindowRef = useRef<HTMLDivElement>(null);
    const startChatRef = useRef(() => import('../../services/geminiService').then(mod => mod.startChat(INTERVIEWER_PROMPT)));

    useEffect(() => {
        if (project.step === 'interview' && !chatSession) {
            const initChat = async () => {
                try {
                    const start = await startChatRef.current();
                    setChatSession(start);
                    if (start) {
                        setIsThinking(true);
                        const { sendMessageToBot } = await import('../../services/geminiService');
                        const introMessage = await sendMessageToBot(start, "Start the interview.");
                        setProject(p => ({
                            ...p,
                            interviewHistory: [{ sender: 'bot', text: introMessage }]
                        }));
                        setIsThinking(false);
                    }
                } catch(e) { console.error("Failed to start chat session", e); }
            };
            initChat();
        }
    }, [project.step, chatSession]);

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [project.interviewHistory, isThinking]);

    const handleNextStep = () => {
        const steps: MeisterProjectStep[] = ['planning', 'materials', 'documentation', 'interview', 'finished'];
        const currentIndex = steps.indexOf(project.step);
        if (currentIndex < steps.length - 1) {
            const nextStep = steps[currentIndex + 1];
            if (nextStep === 'finished') {
                const score = Math.floor(60 + Math.random() * 35); // Random score for demo
                setProject(p => ({ ...p, step: nextStep, finalScore: score }));
                onExit(true);
            } else {
                setProject(p => ({ ...p, step: nextStep }));
            }
        }
    };
    
    const handleInterviewSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const userInput = input.trim();
        if (!userInput || isThinking || !chatSession) return;

        const { sendMessageToBot } = await import('../../services/geminiService');
        const newHistory = [...project.interviewHistory, { sender: 'user' as 'user', text: userInput }];
        setProject(p => ({ ...p, interviewHistory: newHistory }));
        setInput('');
        setIsThinking(true);

        const fullPrompt = `Projektplan: ${project.documentation.proposal}\n\nFrage des Prüflings: ${userInput}`;
        const botResponse = await sendMessageToBot(chatSession, fullPrompt);
        setProject(p => ({ ...p, interviewHistory: [...newHistory, { sender: 'bot' as 'bot', text: botResponse }] }));
        setIsThinking(false);
    };

    const steps: { id: MeisterProjectStep, title: string, icon: React.ReactNode }[] = [
        { id: 'planning', title: 'Planung', icon: <Lightbulb /> },
        { id: 'materials', title: 'Kalkulation', icon: <List /> },
        { id: 'documentation', title: 'Dokumentation', icon: <FileText /> },
        { id: 'interview', title: 'Fachgespräch', icon: <Users /> },
        { id: 'finished', title: 'Abschluss', icon: <Award /> },
    ];
    const currentStepIndex = steps.findIndex(s => s.id === project.step);
    
    const renderContent = () => {
        switch (project.step) {
            case 'planning': return (
                <div>
                    <h3 className="text-xl font-bold mb-2">Projektplanung</h3>
                    <p className="text-slate-300 mb-4">{PROJECT_DESCRIPTION}</p>
                    <textarea 
                        className="w-full h-60 bg-slate-800 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500" 
                        placeholder="Beschreiben Sie hier Ihr Vorgehen, die Systemauswahl und die grobe Aufteilung..."
                        value={project.documentation.proposal}
                        onChange={e => setProject(p => ({...p, documentation: {...p.documentation, proposal: e.target.value}}))}
                    />
                </div>
            );
            case 'materials': return (
                 <div>
                    <h3 className="text-xl font-bold mb-2">Materialkalkulation</h3>
                    <p className="text-slate-300 mb-4">Fügen Sie hier die wichtigsten Materialposten hinzu. Budget: {project.budget.toLocaleString('de-DE')} €</p>
                    <p className="text-lg font-semibold">Aktuelle Summe: {project.materials.reduce((sum, item) => sum + item.cost, 0).toLocaleString('de-DE')} €</p>
                     <p className="text-slate-400 mt-4">(Eine detaillierte Materialliste wird in einer zukünftigen Version implementiert.)</p>
                </div>
            );
            case 'documentation': return (
                <div>
                    <h3 className="text-xl font-bold mb-2">Technische Dokumentation</h3>
                    <p className="text-slate-300 mb-4">Erstellen Sie hier die technische Dokumentation und das Angebot für den Kunden.</p>
                     <textarea 
                        className="w-full h-60 bg-slate-800 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500" 
                        placeholder="Fügen Sie hier Details zur technischen Dokumentation, Schaltpläne, etc. ein."
                        value={project.documentation.techDoc}
                        onChange={e => setProject(p => ({...p, documentation: {...p.documentation, techDoc: e.target.value}}))}
                    />
                </div>
            );
            case 'interview': return (
                 <div className="bg-slate-900/50 rounded-lg flex flex-col h-[60vh]">
                     <div ref={chatWindowRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                        {project.interviewHistory.map((msg, index) => (
                             <div key={index} className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                 {msg.sender === 'bot' && <Users className="h-10 w-10 text-slate-300 rounded-full bg-slate-700 p-2 shrink-0" />}
                                 <div className={`p-3 rounded-lg max-w-md text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                                     {msg.text.split('\n').map((l, i) => <p key={i}>{l}</p>)}
                                 </div>
                             </div>
                        ))}
                         {isThinking && <div className="flex items-center space-x-2"><Users className="h-10 w-10 text-slate-500 rounded-full bg-slate-700 p-2" /><div className="bg-slate-700 p-3 rounded-lg"><div className="typing-indicator"><span></span><span></span><span></span></div></div></div>}
                    </div>
                    <div className="p-4 border-t border-slate-700 shrink-0">
                         <form onSubmit={handleInterviewSubmit} className="relative">
                            <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ihre Antwort an den Prüfer..." className="w-full bg-slate-800 rounded-lg py-3 pl-4 pr-12 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isThinking}/>
                            <button type="submit" disabled={isThinking || !input} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white disabled:bg-slate-500"><Send className="h-5 w-5" /></button>
                        </form>
                    </div>
                </div>
            );
            case 'finished': return (
                 <div className="text-center p-8">
                     <Award className="h-20 w-20 text-yellow-400 mx-auto mb-4"/>
                    <h3 className="text-2xl font-bold text-white mb-2">Projektprüfung abgeschlossen!</h3>
                    <p className="text-slate-300 text-lg mb-4">Ihre finale Bewertung: <span className="font-bold text-yellow-300">{project.finalScore} / 100 Punkte</span></p>
                    <p className="text-slate-400">Sie haben das Meisterprojekt erfolgreich simuliert.</p>
                     <button onClick={() => onExit(true)} className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg flex items-center mx-auto">
                        <Repeat className="h-5 w-5 mr-2" />
                        Zurück zur Übersicht
                    </button>
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="p-4 text-white">
            <h2 className="text-3xl font-bold mb-2">Meisterprüfungsprojekt-Simulation</h2>
            <div className="w-full px-4 md:px-12 py-6">
                <div className="flex items-start">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                           <StepIndicator title={step.title} icon={step.icon} isActive={project.step === step.id} isCompleted={currentStepIndex > index}/>
                           {index < steps.length - 1 && <div className={`flex-1 h-1 mt-6 ${currentStepIndex > index ? 'bg-green-500' : 'bg-slate-600'}`} />}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <div className="mt-4 bg-slate-800/50 p-6 rounded-lg min-h-[400px]">
                {renderContent()}
            </div>
             {project.step !== 'finished' && (
                <div className="mt-6 text-right">
                    <button onClick={handleNextStep} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg flex items-center ml-auto text-lg shadow-lg">
                        {project.step === 'interview' ? 'Fachgespräch beenden' : 'Nächster Schritt'} <ChevronsRight className="h-6 w-6 ml-2" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default MeisterProjectSim;