

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Bot, Send } from 'lucide-react';
import { ChatMessage, User } from '../types';
import { startChat, sendMessageToBot } from '../services/geminiService';
import type { Chat } from '@google/genai';

const TypingIndicator: React.FC = () => (
    <div className="flex justify-start">
        <div className="bg-slate-700 p-3 rounded-lg">
            <div className="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    </div>
);

interface AiBotProps {
    currentUser: User;
}

const AiBot: React.FC<AiBotProps> = ({ currentUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const chatWindowRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        setMessages([{ sender: 'bot', text: `Hallo ${currentUser.name.split(' ')[0]}! Ich bin dein KI-Mentor. Wie kann ich dir heute helfen?` }])
    }, [currentUser]);

    useEffect(() => {
        if (isOpen && !chatRef.current) {
            chatRef.current = startChat();
             if(!chatRef.current) {
                setMessages(prev => [...prev, { sender: 'bot', text: 'Der Chat-Service konnte nicht initialisiert werden. Bitte stelle sicher, dass der API-Schlüssel korrekt konfiguriert ist.' }]);
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const userInput = input.trim();
        if (!userInput || isLoading) return;

        setMessages(prev => [...prev, { sender: 'user', text: userInput }]);
        setInput('');
        setIsLoading(true);

        if (chatRef.current) {
            const botResponse = await sendMessageToBot(chatRef.current, userInput);
            setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
        } else {
             setMessages(prev => [...prev, { sender: 'bot', text: "Chat ist nicht verfügbar." }]);
        }
        setIsLoading(false);
    };

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-500 transition-transform hover:scale-110 w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white z-20">
                <Bot className="h-8 w-8" />
            </button>
            {isOpen && (
                <div className="fixed inset-0 modal-backdrop flex items-end justify-end p-0 sm:p-8 z-30" onClick={() => setIsOpen(false)}>
                    <div onClick={e => e.stopPropagation()} className="glass-card no-hover rounded-t-xl sm:rounded-xl w-full max-w-md h-full sm:h-2/3 flex flex-col border-2 border-blue-500/50 fade-in">
                        <div className="flex justify-between items-center p-4 border-b border-slate-700 shrink-0">
                            <div className="flex items-center">
                                <Bot className="h-6 w-6 mr-2 text-blue-400" />
                                <h3 className="text-lg font-bold text-white">Meister-Bot</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white text-3xl leading-none">&times;</button>
                        </div>
                        <div ref={chatWindowRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3 rounded-lg max-w-xs text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700'}`}>
                                        {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                                    </div>
                                </div>
                            ))}
                            {isLoading && <TypingIndicator />}
                        </div>
                        <div className="p-4 border-t border-slate-700 shrink-0">
                            <form onSubmit={handleSubmit} className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Stelle eine Frage..."
                                    className="w-full bg-slate-900/80 rounded-lg py-2 pl-4 pr-12 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isLoading}
                                />
                                <button type="submit" disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white disabled:bg-slate-500">
                                    <Send className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AiBot;
