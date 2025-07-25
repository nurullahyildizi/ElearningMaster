import React, { useState, useMemo } from 'react';
import { CommunityPost, User, SkillCategory, CommunityComment } from '../types';
import { SKILL_CATEGORIES } from '../constants';
import { MessageSquare, Ticket, BadgeCheck, Tag, ArrowLeft, Send, PlusCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAppContext';
import { useData } from '../hooks/useAppContext';
import { useUI } from '../hooks/useAppContext';


// Component for a single comment
const Comment: React.FC<{ comment: CommunityComment }> = ({ comment }) => {
    const { currentUser } = useAuth();
    const { handleRewardUser } = useData();
    if(!currentUser) return null;

    return (
        <div className="flex items-start space-x-3 pt-4">
            <img 
                src={`https://placehold.co/40x40/${comment.color}/ffffff?text=${comment.avatar}`} 
                className="rounded-full shrink-0 border-2 border-slate-600" 
                alt={`${comment.author} avatar`} 
            />
            <div className="flex-grow bg-slate-900/50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-blue-300">{comment.author}</span>
                        {comment.authorRole === 'meister' && <span title="Meister"><BadgeCheck className="h-4 w-4 text-yellow-400" /></span>}
                        <span className="text-slate-500">· {new Date(comment.date).toLocaleDateString('de-DE')}</span>
                    </div>
                    <button
                        onClick={() => handleRewardUser(comment.authorId, 1)}
                        disabled={currentUser.wissensTokens < 1 || currentUser.id === comment.authorId}
                        className="flex items-center gap-1 bg-amber-500/10 text-amber-300 text-xs font-semibold px-2 py-1 rounded-full hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={currentUser.id === comment.authorId ? "Eigener Beitrag" : currentUser.wissensTokens < 1 ? "Nicht genug Tokens" : "Hilfreiche Antwort mit 1 Token belohnen"}
                    >
                        <Ticket className="h-3 w-3"/>
                        <span>{comment.kudos}</span>
                    </button>
                </div>
                <p className="text-slate-300 text-sm mt-1">{comment.content}</p>
            </div>
        </div>
    )
}

// Component for the detailed post view
const PostDetailView: React.FC<{
    post: CommunityPost,
    onBack: () => void,
}> = ({ post, onBack }) => {
    const { currentUser } = useAuth();
    const { users, handleAddComment } = useData();
    const [newComment, setNewComment] = useState('');
    const author = users.find(u => u.id === post.authorId);

    if (!currentUser) return null;

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            handleAddComment(post.id, newComment);
            setNewComment('');
        }
    };

    return (
        <div className="fade-in">
            <button onClick={onBack} className="flex items-center text-sm text-blue-400 hover:text-blue-300 mb-4 font-semibold">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zum Forum
            </button>
            <div className="glass-card no-hover p-6 rounded-xl">
                <h2 className="text-2xl font-bold text-white mb-2">{post.title}</h2>
                <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                         <img src={`https://placehold.co/24x24/${post.color}/ffffff?text=${post.avatar}`} className="rounded-full" alt={`${post.author} avatar`} />
                        <span className="font-medium text-blue-400">{post.author}</span>
                        {post.isMeisterPost && <span title="Meister-Beitrag"><BadgeCheck className="h-4 w-4 text-yellow-400" /></span>}
                    </div>
                    <span>{new Date(post.date).toLocaleString('de-DE')}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    {post.tags.map(tag => (
                        <span key={tag} className="bg-slate-700 text-slate-300 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1.5">
                            <Tag className="h-3 w-3" />
                            {SKILL_CATEGORIES[tag].label}
                        </span>
                    ))}
                </div>
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                <div className="border-t border-slate-700/50 mt-6 pt-4">
                    <h3 className="font-bold text-lg text-white mb-2">{post.comments.length} Antworten</h3>
                    <div className="space-y-4">
                        {post.comments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(comment => (
                            <Comment key={comment.id} comment={comment} />
                        ))}
                    </div>

                    <form onSubmit={handleSubmitComment} className="mt-6 flex items-start space-x-3">
                        <img src={`https://i.pravatar.cc/40?u=${currentUser.email}`} className="rounded-full border-2 border-slate-600" alt="Your avatar"/>
                        <div className="flex-grow">
                             <textarea 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Schreibe eine Antwort..."
                                className="w-full bg-slate-800/80 border border-slate-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                rows={3}
                            />
                             <button type="submit" className="mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center gap-2">
                                <Send className="h-4 w-4"/> Antwort posten
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}


const Community: React.FC = () => {
    const { currentUser } = useAuth();
    const { communityPosts, handleRewardUser } = useData();
    const { openNewPostModal } = useUI();

    const [activeTag, setActiveTag] = useState<SkillCategory>('allgemein');
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
    
    const communityTags: SkillCategory[] = ['allgemein', 'normen', 'gebaeudetechnik', 'messtechnik', 'automatisierung'];

    const sortedPosts = useMemo(() => 
        communityPosts.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [communityPosts]);

    const filteredPosts = useMemo(() => {
        if (activeTag === 'allgemein') return sortedPosts;
        return sortedPosts.filter(post => post.tags.includes(activeTag));
    }, [activeTag, sortedPosts]);

    const handleReward = (e: React.MouseEvent, post: CommunityPost) => {
        e.stopPropagation();
        if (currentUser && currentUser.wissensTokens >= 1 && currentUser.id !== post.authorId) {
            handleRewardUser(post.authorId, 1);
        }
    };
    
    const selectedPost = useMemo(() => communityPosts.find(p => p.id === selectedPostId), [communityPosts, selectedPostId]);
    
    if (!currentUser) return null;

    if (selectedPost) {
        return <PostDetailView
            post={selectedPost}
            onBack={() => setSelectedPostId(null)}
        />
    }

    return (
        <section id="community" className="fade-in">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Community-Forum</h2>
                <button onClick={openNewPostModal} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <PlusCircle className="h-5 w-5"/> Neue Frage stellen
                </button>
            </div>


            <div className="mb-6 border-b border-slate-700">
                 <div className="flex space-x-1 overflow-x-auto">
                    {communityTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setActiveTag(tag)}
                            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
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
                {filteredPosts.map((post) => (
                    <div key={post.id} onClick={() => setSelectedPostId(post.id)} className={`glass-card no-hover p-5 rounded-xl transition-all duration-300 cursor-pointer hover:border-blue-500/50 ${post.isMeisterPost ? 'border-l-4 border-yellow-400' : 'border-l-4 border-transparent'}`}>
                        <div className="flex items-start space-x-4">
                            <img 
                                src={`https://placehold.co/48x48/${post.color}/ffffff?text=${post.avatar}`} 
                                className="rounded-full shrink-0 mt-1 border-2 border-slate-600" 
                                alt={`${post.author} avatar`} 
                            />
                            <div className="flex-grow">
                                <h3 className="text-lg font-bold text-white mb-1 hover:text-blue-400">{post.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                                    <span className="font-medium">{post.author}</span>
                                    {post.isMeisterPost && <span title="Meister-Beitrag"><BadgeCheck className="h-4 w-4 text-yellow-400"/></span>}
                                     <span>· {new Date(post.date).toLocaleDateString('de-DE')}</span>
                                </div>
                                
                                <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">
                                    {post.content}
                                </p>
                                
                                <div className="flex items-center justify-between text-slate-400 mt-4 pt-4 border-t border-slate-700/50">
                                    <div className="flex items-center space-x-4 text-sm">
                                        <span className="flex items-center">
                                            <MessageSquare className="h-4 w-4 mr-2"/> {post.comments.length} Antworten
                                        </span>
                                        <div className="flex flex-wrap items-center gap-1">
                                             {post.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="bg-slate-700 text-slate-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                                                    {SKILL_CATEGORIES[tag].label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleReward(e, post)}
                                        disabled={currentUser.wissensTokens < 1 || currentUser.id === post.authorId}
                                        className="flex items-center gap-2 bg-amber-500/10 text-amber-300 text-sm font-semibold px-3 py-1.5 rounded-full hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-500/10"
                                        title={currentUser.id === post.authorId ? "Eigener Beitrag" : currentUser.wissensTokens < 1 ? "Nicht genug Tokens" : "Hilfreichen Beitrag mit 1 Token belohnen"}
                                    >
                                        <Ticket className="h-4 w-4"/>
                                        <span>{post.kudos}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Community;
