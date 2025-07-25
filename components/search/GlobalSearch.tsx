import React, { useState, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useUI } from '../../hooks/useAppContext';
import { useData } from '../../hooks/useAppContext';
import { performGlobalSearch } from '../../services/geminiService';
import { SearchableItem, SearchResult } from '../../types';
import SearchResultsModal from './SearchResultsModal';

const GlobalSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { openModal } = useUI();
    const { allSkillNodes, communityPosts, experts } = useData();

    const handleSearch = useCallback(async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);

        const searchableContent: SearchableItem[] = [
            ...allSkillNodes
                .filter(node => node.content)
                .map(node => ({
                    id: node.id,
                    title: node.title,
                    description: node.content!.description,
                    category: 'courses' as const,
                    pathId: allSkillNodes.find(p => p.children?.some(c => c.id === node.id))?.id || 'ausbildung_elektroniker' // Failsafe
                })),
            ...communityPosts.map(post => ({
                id: post.id,
                title: post.title,
                description: post.content,
                category: 'community' as const,
            })),
            ...experts.map(expert => ({
                id: expert.id,
                title: expert.name,
                description: `${expert.title} - Spezialgebiete: ${expert.specialties.join(', ')}`,
                category: 'experts' as const,
            })),
        ];

        try {
            const searchResults = await performGlobalSearch(query, searchableContent);
            setResults(searchResults);
            openModal(
                `Suchergebnisse für "${query}"`,
                <SearchResultsModal isLoading={false} error={null} results={searchResults} />,
                '4xl'
            );
        } catch (e) {
            const errorMessage = (e instanceof Error) ? e.message : 'Ein unerwarteter Fehler ist aufgetreten.';
            setError(errorMessage);
            openModal(
                `Fehler bei der Suche`,
                <SearchResultsModal isLoading={false} error={errorMessage} results={[]} />,
                'xl'
            );
        } finally {
            setIsLoading(false);
        }
    }, [query, allSkillNodes, communityPosts, experts, openModal]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        openModal(
            `Suche nach "${query}"...`,
            <SearchResultsModal isLoading={true} error={null} results={[]} />,
            '4xl'
        );
        handleSearch();
    };

    return (
        <div className="relative w-full max-w-lg">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Suchen Sie nach Kursen, Fragen oder Experten..."
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
                    ) : (
                        <Search className="h-5 w-5 text-slate-400" />
                    )}
                </div>
            </form>
        </div>
    );
};

export default GlobalSearch;
