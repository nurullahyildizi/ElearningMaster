import React, { useRef, useEffect } from 'react';
import { SkillNode, LearningPathCollection, SkillStatus } from '../types';
import { Check, PlayCircle, Lock, Star, ChevronsUpDown, Shield, Gem, Cpu } from 'lucide-react';

interface LearningPathProps {
    paths: LearningPathCollection;
    activePathId: string;
    onPathChange: (pathId: string) => void;
    activeSkillTree: SkillNode[];
    onNodeClick: (node: SkillNode, pathId: string) => void;
}

const getIconForNode = (node: SkillNode) => {
    if (node.type === 'exam') {
        return <Cpu className="h-6 w-6" />;
    }
    switch (node.status) {
        case 'completed': return <Check className="h-6 w-6" />;
        case 'active': return <PlayCircle className="h-6 w-6" />;
        case 'locked': return <Lock className="h-6 w-6" />;
        default: return <PlayCircle className="h-6 w-6" />;
    }
};

const SkillNodeComponent: React.FC<{ node: SkillNode; onNodeClick: () => void, status: SkillStatus }> = ({ node, onNodeClick }) => {
    const isClickable = node.status !== 'locked';
    const nodeType = node.type || 'course';

    const nodeClasses = [
        'skill-node',
        `skill-node--${nodeType}`,
        node.status,
        isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed',
        'w-36 h-36 rounded-full flex flex-col items-center justify-center text-center p-4 relative shadow-lg'
    ].join(' ');

    const title = node.title.length > 40 ? node.title.substring(0, 37) + '...' : node.title;
    const nodeLabel = node.type === 'exam' ? 'Simulation' : node.title;

    return (
        <div 
            className={nodeClasses}
            onClick={isClickable ? onNodeClick : undefined}
        >
             <div className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 rounded-full px-2 py-0.5 text-xs font-bold flex items-center shadow-md">
                <Star className="h-3 w-3 mr-1" />{node.xp}
             </div>
             {node.pro && (
                <div className="absolute -top-2 -left-2 bg-purple-500 text-white rounded-full p-1 text-xs font-bold shadow-md">
                    <Gem className="h-3 w-3" />
                </div>
             )}
            <div className="text-3xl mb-1">{getIconForNode(node)}</div>
            <h4 className="text-xs font-bold leading-tight">{title}</h4>
            <div className="skill-node-tooltip absolute bottom-full mb-3 w-64 bg-slate-900 text-white text-sm rounded-lg shadow-xl p-3 z-20 border border-slate-700">
                <h5 className="font-bold mb-1">{node.title}</h5>
                <p className="text-xs text-slate-400">{node.type === 'exam' ? 'Praktische Simulation zur Überprüfung Ihrer Fähigkeiten.' : (node.content?.description || '')}</p>
                <div className="mt-2 pt-2 border-t border-slate-600/50 text-xs">
                    <p>Typ: <span className="font-semibold capitalize">{node.type}</span></p>
                    <p>Status: <span className="font-semibold capitalize">{node.status}</span></p>
                </div>
            </div>
        </div>
    );
};

const SkillBranch: React.FC<{ node: SkillNode; onNodeClick: (node: SkillNode) => void; isRoot?: boolean }> = ({ node, onNodeClick, isRoot = false }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isCompleted = node.status === 'completed';
    const isActive = node.status === 'active';
    
    return (
        <div className={`skill-branch ${isCompleted ? 'is-completed' : ''} ${isActive ? 'is-active' : ''}`}>
            <SkillNodeComponent node={node} onNodeClick={() => onNodeClick(node)} status={node.status} />
            {hasChildren && (
                <div className="skill-branch-children">
                    {node.children!.map(child => (
                        <SkillBranch key={child.id} node={child} onNodeClick={onNodeClick} />
                    ))}
                </div>
            )}
        </div>
    );
};


const LearningPath: React.FC<LearningPathProps> = ({ paths, activePathId, onPathChange, activeSkillTree, onNodeClick }) => {
    const activePathInfo = paths[activePathId];
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const slider = scrollContainerRef.current;
        if (!slider) return;

        let isDown = false;
        let startX: number;
        let scrollLeft: number;

        const handleMouseDown = (e: MouseEvent) => {
            isDown = true;
            slider.classList.add('grabbing');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        };

        const handleMouseLeave = () => {
            isDown = false;
            slider.classList.remove('grabbing');
        };

        const handleMouseUp = () => {
            isDown = false;
            slider.classList.remove('grabbing');
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; //scroll-fast
            slider.scrollLeft = scrollLeft - walk;
        };

        slider.addEventListener('mousedown', handleMouseDown);
        slider.addEventListener('mouseleave', handleMouseLeave);
        slider.addEventListener('mouseup', handleMouseUp);
        slider.addEventListener('mousemove', handleMouseMove);

        return () => {
            if (slider) {
                slider.removeEventListener('mousedown', handleMouseDown);
                slider.removeEventListener('mouseleave', handleMouseLeave);
                slider.removeEventListener('mouseup', handleMouseUp);
                slider.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, []);

    return (
        <section id="lernpfade" className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                    <h2 className="text-3xl font-bold text-white">{activePathInfo.title}</h2>
                    <p className="text-slate-400">{activePathInfo.description}</p>
                </div>
                <div className="relative w-72">
                    <select
                        value={activePathId}
                        onChange={(e) => onPathChange(e.target.value)}
                        className="w-full appearance-none bg-slate-800 border border-slate-700 text-white py-2 pl-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {Object.values(paths).map(path => (
                            <option key={path.id} value={path.id} disabled={path.locked}>
                                {path.title} {path.pro && ' (Pro)'} {path.locked && ' (Gesperrt)'}
                            </option>
                        ))}
                    </select>
                    <ChevronsUpDown className="h-5 w-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
            </div>
            <div className="glass-card p-0 rounded-xl no-hover flex-grow overflow-hidden">
                <div ref={scrollContainerRef} className="skill-tree-container h-full">
                    <div className="skill-tree-horizontal">
                        {activeSkillTree.map(node => (
                            <SkillBranch key={node.id} node={node} onNodeClick={(n) => onNodeClick(n, activePathId)} isRoot />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LearningPath;