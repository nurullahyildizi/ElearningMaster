import React from 'react';
import { SearchResult } from '../../types';
import { BookOpen, MessageSquare, Mic, AlertTriangle } from 'lucide-react';
import { SearchSkeletons } from './SearchSkeletons';
import { useData } from '../../hooks/useAppContext';
import { useUI } from '../../hooks/useAppContext';
import { View } from '../../types';

interface SearchResultsModalProps {
    isLoading: boolean;
    error: string | null;
    results: SearchResult[];
}

const SearchResultsModal: React.FC<SearchResultsModalProps> = ({ isLoading, error, results }) => {
    const { setView, closeModal } = useUI();
    const { handleNodeClick, allSkillNodes } = useData();

    if (isLoading) {
        return <SearchSkeletons />;
    }

    if (error) {
        return (
            <div className="text-center text-red-300">
                <AlertTriangle className="h-10 w-10 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Suche fehlgeschlagen</h3>
                <p>{error}</p>
            </div>
        );
    }

    if (results.length === 0) {
        return <div className="text-center text-slate-400">Keine Ergebnisse gefunden.</div>;
    }

    const handleResultClick = (result: SearchResult) => {
        closeModal();
        switch (result.category) {
            case 'courses':
                const node = allSkillNodes.find(n => n.id === result.id);
                if (node && result.pathId) {
                    handleNodeClick(node, result.pathId);
                }
                break;
            case 'community':
                // In a real app, you'd navigate to the specific post.
                // For now, just go to the community page.
                setView(View.Community);
                break;
            case 'experts':
                setView(View.Experts);
                break;
        }
    };
    
    const categorizedResults = {
        courses: results.filter(r => r.category === 'courses'),
        community: results.filter(r => r.category === 'community'),
        experts: results.filter(r => r.category === 'experts'),
    };
    
    const categoryInfo = {
        courses: { title: "Lerninhalte", icon: <BookOpen className="h-6 w-6 text-blue-400" /> },
        community: { title: "Community-Beiträge", icon: <MessageSquare className="h-6 w-6 text-green-400" /> },
        experts: { title: "Experten", icon: <Mic className="h-6 w-6 text-purple-400" /> },
    }

    return (
        <div className="flex flex-col md:flex-row gap-6 max-h-[60vh]">
            {Object.entries(categorizedResults).map(([key, items]) => {
                if (items.length === 0) return null;
                const catKey = key as keyof typeof categoryInfo;

                return (
                    <div key={key} className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            {categoryInfo[catKey].icon}
                            <h3 className="text-xl font-bold text-white">{categoryInfo[catKey].title}</h3>
                        </div>
                        <div className="space-y-3">
                            {items.map(result => (
                                <div 
                                    key={`${result.category}-${result.id}`} 
                                    onClick={() => handleResultClick(result)}
                                    className="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
                                >
                                    <h4 className="font-semibold text-white truncate">{result.title}</h4>
                                    <p className="text-sm text-slate-400 line-clamp-2">{result.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SearchResultsModal;
