import React, { useState } from 'react';
import { useAuth, useUI } from '../../hooks/useAppContext';
import { ApplicationAnalysis } from '../../types';
import { analyzeApplicationDocuments } from '../../services/geminiService';
import { Loader2, Sparkles, AlertTriangle, Gem, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

const ApplicationCoachTab: React.FC = () => {
    const { currentUser } = useAuth();
    const { openUpgradeModal } = useUI();
    const [jobDesc, setJobDesc] = useState('');
    const [userDoc, setUserDoc] = useState('');
    const [analysis, setAnalysis] = useState<ApplicationAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!jobDesc.trim() || !userDoc.trim()) {
            setError('Bitte füllen Sie beide Felder aus.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await analyzeApplicationDocuments(jobDesc, userDoc);
            setAnalysis(result);
        } catch (e) {
            setError((e as Error).message || 'Analyse fehlgeschlagen.');
        } finally {
            setIsLoading(false);
        }
    };

    if (currentUser?.subscriptionStatus !== 'pro') {
        return (
            <div className="glass-card p-8 rounded-xl no-hover text-center flex flex-col items-center">
                <Gem className="h-16 w-16 text-purple-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Bewerbungs-Coach ist ein Pro-Feature</h3>
                <p className="text-slate-300 mb-6 max-w-lg">Optimieren Sie Ihre Bewerbungsunterlagen mit gezieltem KI-Feedback. Schalten Sie dieses und viele weitere Features mit MeisterWerk Pro frei.</p>
                <button onClick={openUpgradeModal} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg text-lg">
                    Jetzt Pro-Mitglied werden
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-xl no-hover coach-layout flex flex-col">
                <h3 className="font-bold text-xl text-white mb-4">Bewerbungs-Analyse</h3>
                <p className="text-slate-400 mb-4 text-sm">Fügen Sie die Stellenbeschreibung und Ihren Lebenslauf oder Ihr Anschreiben ein, um eine KI-gestützte Analyse zu erhalten.</p>
                <div className="flex-grow flex flex-col gap-4">
                    <textarea
                        value={jobDesc}
                        onChange={(e) => setJobDesc(e.target.value)}
                        placeholder="Fügen Sie hier die Stellenbeschreibung ein..."
                        rows={8}
                        className="w-full"
                        disabled={isLoading}
                    />
                    <textarea
                        value={userDoc}
                        onChange={(e) => setUserDoc(e.target.value)}
                        placeholder="Fügen Sie hier Ihren Lebenslauf oder Ihr Anschreiben ein..."
                        rows={12}
                        className="w-full"
                        disabled={isLoading}
                    />
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-500 transition text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-base disabled:bg-slate-500"
                >
                    {isLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Sparkles className="h-5 w-5 mr-2" />}
                    Unterlagen analysieren
                </button>
            </div>
            
            <div className="glass-card p-6 rounded-xl no-hover">
                <h3 className="font-bold text-xl text-white mb-4">Analyse-Ergebnis</h3>
                {isLoading && (
                    <div className="text-center p-12">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto" />
                        <p className="mt-4 text-slate-300">Analysiere Ihre Dokumente...</p>
                    </div>
                )}
                {error && (
                    <div className="p-4 bg-red-500/10 text-red-300 rounded-lg text-center">
                        <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                        <p>{error}</p>
                    </div>
                )}
                {analysis && (
                     <div className="space-y-4 fade-in max-h-[70vh] overflow-y-auto pr-2">
                        <div>
                            <h5 className="font-semibold text-blue-300 flex items-center gap-2 mb-1"><Sparkles className="h-4 w-4" />Zusammenfassung</h5>
                            <p className="text-slate-300 bg-slate-900/50 p-3 rounded-md text-sm">{analysis.summary}</p>
                        </div>
                        <div>
                            <h5 className="font-semibold text-green-300 flex items-center gap-2 mb-1"><CheckCircle className="h-4 w-4" />Stärken</h5>
                            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300 text-sm">
                                {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h5 className="font-semibold text-yellow-300 flex items-center gap-2 mb-1"><XCircle className="h-4 w-4" />Verbesserungspotenzial</h5>
                            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300 text-sm">
                                {analysis.areasForImprovement.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-semibold text-purple-300 flex items-center gap-2 mb-1"><Lightbulb className="h-4 w-4" />Fehlende Schlüsselwörter</h5>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {analysis.missingKeywords.map((kw, i) => (
                                    <span key={i} className="bg-purple-500/20 text-purple-300 text-xs font-semibold px-2 py-1 rounded-full">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                 {!isLoading && !analysis && !error && (
                    <div className="text-center p-12 border-2 border-dashed border-slate-700 rounded-xl">
                        <p className="text-slate-500">Das Analyseergebnis wird hier angezeigt.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationCoachTab;
