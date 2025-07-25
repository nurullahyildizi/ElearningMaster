

import React, { useState, useEffect, useRef, FormEvent, useMemo } from 'react';
import type { Chat } from '@google/genai';
import { getAevoFeedback } from '../../services/geminiService';
import { User, Send, Bot, Loader2, Award, ChevronsRight, Repeat, UserCheck } from 'lucide-react';
import { AevoFeedback, ChatMessage } from '../../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const APPRENTICE_PROMPT = `Du bist 'Jonas', ein deutscher Elektrotechnik-Azubi im ersten Lehrjahr. Du bist wissbegierig, aber unsicher und hast Respekt vor Strom. Du sprichst den Benutzer mit 'Sie' an. Deine Aufgabe ist es, auf die Anweisungen des Benutzers zu reagieren. Wenn eine Anweisung unklar ist, frage nach (z.B. 'Welches Kabel meinen Sie genau? Das braune oder das schwarze?'). Wenn der Benutzer eine Sicherheitsregel vergisst, weise ihn freundlich darauf hin (z.B. 'Sollten wir nicht zuerst die 5 Sicherheitsregeln anwenden, bevor wir anfangen?'). Deine Antworten sollten kurz und im Stil eines Lernenden sein. Erfinde kleine, realistische Probleme (z.B. 'Oh, die Schraube am Schalter klemmt ein bisschen.'). Bleibe immer in deiner Rolle als Jonas. Gib niemals Feedback oder Bewertungen.`;
const INTRO_MESSAGE = `Hallo! Du bist der Ausbilder und ich bin Jonas, dein Azubi im 1. Lehrjahr. Meister Klaus hat gesagt, du sollst mir heute zeigen, wie man eine einfache Ausschaltung verdrahtet. Ich hab die Bauteile hier: eine Lampe, einen Schalter, eine Abzweigdose und Kabel. Wie fangen wir an? Bitte denk daran, dass die Sicherheit an erster Stelle steht!`;


const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-2">
        <User className="h-10 w-10 text-slate-500 rounded-full bg-slate-700 p-2" />
        <div className="bg-slate-700 p-3 rounded-lg">
            <div className="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    </div>
);


const AevoSim: React.FC<{ onExit: (completed: boolean) => void }> = ({ onExit }) => {
    const [simState, setSimState] = useState<'intro' | 'running' | 'feedback'>('intro');
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [feedback, setFeedback] = useState<AevoFeedback | null>(null);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const chatWindowRef = useRef<HTMLDivElement>(null);
    
    // Wrapped startChat in a dummy ref to avoid re-initialization on every render
    const startChatRef = useRef(() => import('../../services/geminiService').then(mod => mod.startChat(APPRENTICE_PROMPT)));

    const initialize = async () => {
        setSimState('intro');
        setHistory([]);
        setFeedback(null);
        setInput('');
        setIsThinking(false);
        try {
            const start = await startChatRef.current();
            setChatSession(start);
        } catch (e) {
            console.error("Failed to start chat session", e);
            // Handle error state in UI if necessary
        }
    };
    
    useEffect(() => {
        initialize();
    }, []);
    
    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [history, isThinking]);

    const handleStart = async () => {
        if (!chatSession) return;
        setIsThinking(true);
        setSimState('running');
        setHistory([{ sender: 'bot', text: INTRO_MESSAGE }]);
        setIsThinking(false);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const userInput = input.trim();
        if (!userInput || isThinking || !chatSession) return;
        
        const { sendMessageToBot } = await import('../../services/geminiService');

        const newHistory = [...history, { sender: 'user' as 'user', text: userInput }];
        setHistory(newHistory);
        setInput('');
        setIsThinking(true);

        const botResponse = await sendMessageToBot(chatSession, userInput);
        setHistory([...newHistory, { sender: 'bot' as 'bot', text: botResponse }]);
        setIsThinking(false);
    };

    const handleGetFeedback = async () => {
        if (!chatSession || isThinking) return;
        setIsThinking(true);
        setSimState('feedback');
        
        const chatHistoryText = history.map(m => `${m.sender === 'user' ? 'Ausbilder' : 'Azubi Jonas'}: ${m.text}`).join('\n');
        
        try {
            const feedbackResponse = await getAevoFeedback(chatHistoryText);
            setFeedback(feedbackResponse);
            onExit(true); // Mark as completed when feedback is generated
        } catch (e) {
            console.error("Feedback generation failed", e);
            // Show an error message in the feedback view
            setFeedback({
                feedbackText: "Die KI-Auswertung ist fehlgeschlagen. Bitte versuchen Sie es später erneut.",
                scores: { safety: 0, technical: 0, didactic: 0, communication: 0 }
            });
        }
        
        setIsThinking(false);
    };

    const renderIntro = () => (
        <div className="text-center p-8 bg-slate-900/50 rounded-lg flex flex-col items-center">
            <UserCheck className="h-20 w-20 text-red-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">AEVO Unterweisungsprobe</h3>
            <p className="text-slate-300 max-w-lg mb-6">In dieser Simulation unterweisen Sie den virtuellen Azubi "Jonas". Leiten Sie ihn an und achten Sie auf korrekte, sichere und pädagogisch wertvolle Anweisungen. Am Ende erhalten Sie eine KI-basierte Auswertung Ihrer Leistung.</p>
            <button onClick={handleStart} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg flex items-center text-lg shadow-lg">
                Simulation starten <ChevronsRight className="h-6 w-6 ml-2" />
            </button>
        </div>
    );

    const renderChat = () => (
         <div className="bg-slate-900/50 rounded-lg flex flex-col h-[70vh]">
            <div ref={chatWindowRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                {history.map((msg, index) => (
                    <div key={index} className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'bot' && <User className="h-10 w-10 text-slate-300 rounded-full bg-slate-700 p-2 shrink-0" />}
                        <div className={`p-3 rounded-lg max-w-md text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                            {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                        </div>
                         {msg.sender === 'user' && <Bot className="h-10 w-10 text-slate-300 rounded-full bg-blue-800 p-2 shrink-0" />}
                    </div>
                ))}
                {isThinking && <TypingIndicator />}
            </div>
             <div className="p-4 border-t border-slate-700 shrink-0 flex items-center gap-4">
                <form onSubmit={handleSubmit} className="relative flex-grow">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ihre Anweisung an Jonas..."
                        className="w-full bg-slate-800 rounded-lg py-3 pl-4 pr-12 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isThinking}
                    />
                    <button type="submit" disabled={isThinking || !input} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white disabled:bg-slate-500">
                        <Send className="h-5 w-5" />
                    </button>
                </form>
                <button onClick={handleGetFeedback} disabled={isThinking || history.length < 2} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg flex items-center shrink-0 disabled:bg-slate-500">
                    <Award className="h-5 w-5 mr-2" />
                    Auswerten
                </button>
            </div>
        </div>
    );
    
    const FeedbackChart: React.FC<{scores: AevoFeedback['scores']}> = ({scores}) => {
        const data = useMemo(() => [
            { subject: 'Sicherheit', score: scores.safety, fullMark: 100 },
            { subject: 'Fachwissen', score: scores.technical, fullMark: 100 },
            { subject: 'Didaktik', score: scores.didactic, fullMark: 100 },
            { subject: 'Kommunikation', score: scores.communication, fullMark: 100 },
        ], [scores]);

        return (
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 14 }} />
                        <PolarRadiusAxis angle={45} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Bewertung" dataKey="score" stroke="#facc15" fill="#facc15" fillOpacity={0.6} />
                         <Tooltip
                            formatter={(value) => `${Math.round(value as number)}/100`}
                            contentStyle={{
                                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                                borderColor: '#334155',
                                borderRadius: '0.5rem'
                            }}
                            labelStyle={{ color: '#ffffff' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        )
    };
    
    const renderFeedback = () => (
         <div className="p-8 bg-slate-900/50 rounded-lg max-h-[80vh] overflow-y-auto">
             <div className="flex items-center mb-6">
                <Award className="h-12 w-12 text-yellow-400 mr-4" />
                <div>
                    <h3 className="text-2xl font-bold text-white">Feedback zur Unterweisung</h3>
                    <p className="text-slate-400">Hier ist die KI-basierte Auswertung Ihrer Leistung.</p>
                </div>
             </div>
            {isThinking ? (
                <div className="flex flex-col items-center justify-center p-10">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
                    <p className="ml-4 text-lg mt-4">Bewerte Ihre Leistung...</p>
                </div>
            ) : feedback && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="bg-slate-800 p-6 rounded-lg space-y-4">
                         <h4 className="text-lg font-bold text-white">Text-Auswertung des Prüfers</h4>
                         <p className="whitespace-pre-wrap text-slate-300 text-sm">{feedback.feedbackText}</p>
                    </div>
                     <div className="bg-slate-800 p-6 rounded-lg">
                        <h4 className="text-lg font-bold text-white mb-4">Kompetenz-Matrix</h4>
                        <FeedbackChart scores={feedback.scores} />
                     </div>
                </div>
            )}
            <div className="mt-8 text-center">
                <button onClick={initialize} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg flex items-center mx-auto">
                    <Repeat className="h-5 w-5 mr-2" />
                    Neue Simulation starten
                </button>
            </div>
        </div>
    );

    switch(simState) {
        case 'intro': return renderIntro();
        case 'running': return renderChat();
        case 'feedback': return renderFeedback();
        default: return renderIntro();
    }
};

export default AevoSim;