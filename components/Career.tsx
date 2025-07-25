



import React, { useMemo, useState, useCallback } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Job, SkillCategory, JobAnalysis, User } from '../../types';
import { SKILL_CATEGORIES } from '../constants';
import { analyzeJobMatch } from '../services/geminiService';
import { Loader2, Sparkles, AlertTriangle, BrainCircuit } from 'lucide-react';

interface CareerProps {
    onJobClick: (job: Job) => void;
    skillData: Record<SkillCategory, number>;
    currentUser: User;
    onUpgrade: () => void;
    jobs: Job[];
}

const JobAnalysisComponent: React.FC<{ job: Job, skillData: Record<SkillCategory, number>, user: User, onUpgrade: () => void }> = ({ job, skillData, user, onUpgrade }) => {
    const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = useCallback(async () => {
        if (user.subscriptionStatus !== 'pro') {
            onUpgrade();
            return;
        }
        setLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await analyzeJobMatch(job, skillData);
            setAnalysis(result);
        } catch (e) {
            setError((e as Error).message || "Analyse fehlgeschlagen.");
        }
        setLoading(false);
    }, [job, skillData, user, onUpgrade]);

    return (
        <div className="mt-6 border-t border-slate-700 pt-6">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><BrainCircuit className="text-purple-400"/>KI-Karriere-Analyse</h4>
            
            {!analysis && !loading && (
                 <button 
                    onClick={handleAnalyze} 
                    className="w-full bg-blue-600 hover:bg-blue-500 transition text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-base"
                >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Job-Passung jetzt analysieren {user.subscriptionStatus !== 'pro' && '(Pro-Feature)'}
                </button>
            )}

            {loading && (
                <div className="text-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
                    <p className="mt-2 text-slate-400">Analysiere Job & Profil...</p>
                </div>
            )}
            
            {error && (
                <div className="p-4 bg-red-500/10 text-red-300 rounded-lg text-center">
                    <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                    <p>{error}</p>
                </div>
            )}

            {analysis && (
                <div className="space-y-4 fade-in">
                    <div>
                        <h5 className="font-semibold text-blue-300">Zusammenfassung</h5>
                        <p className="text-slate-300 bg-slate-900/50 p-3 rounded-md mt-1">{analysis.summary}</p>
                    </div>
                    <div>
                        <h5 className="font-semibold text-green-300">Ihre Stärken für diesen Job</h5>
                        <ul className="list-disc list-inside space-y-1 mt-1 pl-2 text-slate-300">
                            {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h5 className="font-semibold text-yellow-300">Empfohlene Entwicklungsbereiche</h5>
                        <ul className="list-disc list-inside space-y-1 mt-1 pl-2 text-slate-300">
                            {analysis.areasForImprovement.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};


const Career: React.FC<CareerProps> = ({ onJobClick, skillData, currentUser, onUpgrade, jobs }) => {

    const chartData = useMemo(() => {
        return Object.keys(SKILL_CATEGORIES).map(key => {
            const categoryKey = key as SkillCategory;
            const categoryInfo = SKILL_CATEGORIES[categoryKey];
            if (!categoryInfo || categoryKey === 'allgemein') return null;
            return {
                subject: categoryInfo.label,
                score: categoryInfo.fullMark > 0 ? (skillData[categoryKey] || 0) / categoryInfo.fullMark * 100 : 0,
                fullMark: 100,
            }
        }).filter(Boolean);
    }, [skillData]);

    const calculateJobMatch = (job: Job): number => {
        if (!job.tags || job.tags.length === 0) return 30;

        const requiredSkills = job.tags as SkillCategory[];
        let totalScore = 0;
        let totalFullMark = 0;

        requiredSkills.forEach(skill => {
            const categoryInfo = SKILL_CATEGORIES[skill];
            if (categoryInfo) {
                totalScore += skillData[skill] || 0;
                totalFullMark += categoryInfo.fullMark;
            }
        });
        
        if (totalFullMark === 0) return 30;
        
        const matchPercentage = (totalScore / totalFullMark) * 100;
        
        return Math.min(Math.round(matchPercentage), 99);
    };

    const handleJobCardClick = (job: Job) => {
        onJobClick({
            ...job,
            content: (
                <div>
                    <p className="mb-4">{job.description}</p>
                    <JobAnalysisComponent 
                        job={job} 
                        skillData={skillData} 
                        user={currentUser} 
                        onUpgrade={onUpgrade} 
                    />
                </div>
            )
        });
    };

    return (
        <section id="karriere" className="fade-in">
            <h2 className="text-3xl font-bold text-white mb-6">Karriere-Hub</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-xl no-hover">
                    <h3 className="font-bold text-xl text-white mb-4">Ihre Kompetenz-Matrix</h3>
                    <p className="text-slate-400 mb-4 text-sm">Dies ist eine dynamische Darstellung Ihrer Fähigkeiten über alle Lernpfade hinweg. Die Werte sind prozentual zum Maximalwert der Kategorie.</p>
                    <div className="h-80 lg:h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Kompetenz" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                                <Tooltip
                                    formatter={(value) => `${Math.round(value as number)}%`}
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
                </div>
                <div className="glass-card p-6 rounded-xl no-hover">
                    <h3 className="font-bold text-xl text-white mb-4">Passende Jobangebote</h3>
                    <div id="job-feed" className="space-y-3">
                        {jobs.map(job => {
                            const match = calculateJobMatch(job);
                            return (
                                <div key={job.id} onClick={() => handleJobCardClick(job)} className="bg-slate-900/50 p-4 rounded-lg cursor-pointer hover:bg-slate-700/50 transition">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-white">{job.title}</p>
                                            <p className="text-sm text-slate-400">{job.company}</p>
                                        </div>
                                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${match > 75 ? 'bg-green-500/20 text-green-300' : match > 50 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>
                                            {match}%
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                                        {job.tags.map(tag => (
                                            <span key={tag} className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-2 py-1 rounded-full">
                                                {SKILL_CATEGORIES[tag as SkillCategory]?.label || tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Career;
