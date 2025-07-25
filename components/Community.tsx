

import React, { useState, useMemo } from 'react';
import { CommunityPost, User, SkillCategory } from '../types';
import { SKILL_CATEGORIES } from '../constants';
import { MessageSquare, Ticket, BadgeCheck, Tag } from 'lucide-react';

interface CommunityProps {
    currentUser: User;
    users: User[];
    posts: CommunityPost[];
    onRewardUser: (rewardedUserId: string, amount: number) => void;
}

const communityTags: SkillCategory[] = ['allgemein', 'normen', 'gebaeudetechnik', 'messtechnik', 'automatisierung'];

const Community: React.FC<CommunityProps> = ({ currentUser, users, onRewardUser, posts }) => {
    const [activeTag, setActiveTag] = useState<SkillCategory>('allgemein');
    
    const filteredPosts = useMemo(() => {
        if (activeTag === 'allgemein') return posts;
        return posts.filter(post => post.tags.includes(activeTag));
    }, [activeTag, posts]);

    const handleReward = (e: React.MouseEvent, post: CommunityPost) => {
        e.stopPropagation(); // Prevent card click
        if (currentUser.wissensTokens >= 1 && currentUser.id !== post.authorId) {
            onRewardUser(post.authorId, 1);
            // In a real app, you'd update the post's kudos count in the backend
            post.kudos += 1; // Mock update for UI
        }
    };
    
    return (
        <section id="community" className="fade-in">
            <h2 className="text-3xl font-bold text-white mb-6">Community-Forum</h2>

            <div className="mb-6 border-b border-slate-700">
                 <div className="flex space-x-1">
                    {communityTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setActiveTag(tag)}
                            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                                activeTag === tag
                                    ? 'bg-slate-800 border-b-2 border-blue-500 text-white'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            {SKILL_CATEGORIES[tag].label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {filteredPosts.map((post) => {
                    const author = users.find(u => u.id === post.authorId);
                    return (
                    <div key={post.id} className={`glass-card no-hover p-5 rounded-xl transition-all duration-300 ${post.isMeisterPost ? 'border-l-4 border-yellow-400' : ''}`}>
                        <div className="flex items-start space-x-4">
                            <img 
                                src={`https://placehold.co/48x48/${post.color}/ffffff?text=${post.avatar}`} 
                                className="rounded-full shrink-0 mt-1 border-2 border-slate-600" 
                                alt={`${post.author} avatar`} 
                            />
                            <div className="flex-grow">
                                <h3 className="text-lg font-bold text-white mb-1">{post.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                                    <span className="font-medium text-blue-400">{post.author}</span>
                                    {post.isMeisterPost && <span title="Meister-Beitrag"><BadgeCheck className="h-4 w-4 text-yellow-400" /></span>}
                                </div>
                                
                                <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
                                    {post.content}
                                </p>

                                <div className="flex flex-wrap items-center gap-2 mt-4">
                                     {post.tags.map(tag => (
                                        <span key={tag} className="bg-slate-700 text-slate-300 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1.5">
                                            <Tag className="h-3 w-3" />
                                            {SKILL_CATEGORIES[tag].label}
                                        </span>
                                    ))}
                                </div>
                                
                                <div className="flex items-center justify-between text-slate-400 mt-4 pt-4 border-t border-slate-700/50">
                                    <div className="flex items-center space-x-4 text-sm">
                                        <span className="flex items-center">
                                            <MessageSquare className="h-4 w-4 mr-2"/> {post.comments} Kommentare
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => handleReward(e, post)}
                                        disabled={currentUser.wissensTokens < 1 || currentUser.id === post.authorId}
                                        className="flex items-center gap-2 bg-amber-500/10 text-amber-300 text-sm font-semibold px-3 py-1.5 rounded-full hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-500/10"
                                        title={currentUser.id === post.authorId ? "Eigener Beitrag" : currentUser.wissensTokens < 1 ? "Nicht genug Tokens" : "Hilfreiche Antwort mit 1 Token belohnen"}
                                    >
                                        <Ticket className="h-4 w-4"/>
                                        <span>{post.kudos}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )})}
            </div>
        </section>
    );
};

export default Community;
