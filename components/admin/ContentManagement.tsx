
import React, { useState } from 'react';
import { LearningPathCollection, LearningPathData, SkillNode } from '../../types';
import CourseEditor from './CourseEditor';
import { PlusCircle, Trash2, Edit, ChevronDown, ChevronRight } from 'lucide-react';

interface ContentManagementProps {
    learningPaths: LearningPathCollection;
    setLearningPaths: React.Dispatch<React.SetStateAction<LearningPathCollection>>;
}

const SkillNodeRow: React.FC<{ node: SkillNode, onEdit: (node: SkillNode) => void, level: number }> = ({ node, onEdit, level }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <>
            <div
                className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100"
                style={{ paddingLeft: `${level * 20 + 8}px` }}
            >
                <div className="flex items-center">
                     {node.children && node.children.length > 0 && (
                        <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 mr-1 rounded-full hover:bg-slate-200">
                           {isExpanded ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                        </button>
                    )}
                    <span className="font-medium">{node.title}</span>
                    <span className="ml-2 text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{node.id}</span>
                    {node.pro && <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">Pro</span>}
                </div>
                 <button onClick={() => onEdit(node)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-md">
                    <Edit className="h-4 w-4" />
                </button>
            </div>
            {isExpanded && node.children && node.children.map(child => (
                <SkillNodeRow key={child.id} node={child} onEdit={onEdit} level={level + 1} />
            ))}
        </>
    );
};

const ContentManagement: React.FC<ContentManagementProps> = ({ learningPaths, setLearningPaths }) => {
    const [selectedPathId, setSelectedPathId] = useState<string | null>(Object.keys(learningPaths)[0] || null);
    const [editingNode, setEditingNode] = useState<SkillNode | null>(null);

    const handleEditNode = (node: SkillNode) => {
        setEditingNode(node);
    };

    const handleSaveNode = (updatedNode: SkillNode) => {
        if (!selectedPathId) return;

        const recursiveUpdate = (nodes: SkillNode[]): SkillNode[] => {
            return nodes.map(n => {
                if (n.id === updatedNode.id) {
                    return updatedNode;
                }
                if (n.children) {
                    return { ...n, children: recursiveUpdate(n.children) };
                }
                return n;
            });
        };

        const updatedPaths = { ...learningPaths };
        updatedPaths[selectedPathId].nodes = recursiveUpdate(updatedPaths[selectedPathId].nodes);
        
        setLearningPaths(updatedPaths);
        setEditingNode(null);
    };
    
    const handleAddNewPath = () => {
        const newId = `neuer-pfad-${Date.now()}`;
        const newPath: LearningPathData = {
            id: newId,
            title: "Neuer Lernpfad",
            description: "Beschreibung für den neuen Lernpfad.",
            pro: false,
            sealImage: "https://placehold.co/128x128/cccccc/ffffff?text=N",
            nodes: []
        };
        setLearningPaths(prev => ({ ...prev, [newId]: newPath }));
        setSelectedPathId(newId);
    };


    const selectedPath = selectedPathId ? learningPaths[selectedPathId] : null;

    return (
        <div className="fade-in h-full flex flex-col">
            <h1 className="text-4xl font-bold text-slate-900 mb-8 shrink-0">Inhaltsverwaltung</h1>

            <div className="flex-grow grid grid-cols-12 gap-6 h-full overflow-hidden">
                {/* Path List */}
                <div className="col-span-4 bg-white p-4 rounded-xl shadow-md flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Lernpfade</h2>
                        <button onClick={handleAddNewPath} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><PlusCircle/></button>
                    </div>
                    <ul className="space-y-1 overflow-y-auto">
                        {Object.values(learningPaths).map(path => (
                            <li key={path.id}>
                                <a href="#" onClick={(e) => { e.preventDefault(); setSelectedPathId(path.id);}} 
                                className={`block p-3 rounded-lg font-semibold ${selectedPathId === path.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>
                                    {path.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Node Editor */}
                <div className="col-span-8 bg-white p-6 rounded-xl shadow-md h-full flex flex-col">
                   {selectedPath ? (
                        <>
                            <h2 className="text-2xl font-bold mb-4">{selectedPath.title}</h2>
                            <div className="overflow-y-auto">
                               {selectedPath.nodes.map(node => (
                                   <SkillNodeRow key={node.id} node={node} onEdit={handleEditNode} level={0} />
                               ))}
                            </div>
                        </>
                   ) : (
                       <div className="text-center self-center">
                           <p className="text-slate-500">Wählen Sie einen Lernpfad aus, um dessen Inhalte zu bearbeiten.</p>
                       </div>
                   )}
                </div>
            </div>

            {editingNode && selectedPathId && (
                <CourseEditor 
                    node={editingNode} 
                    onSave={handleSaveNode} 
                    onClose={() => setEditingNode(null)} 
                />
            )}
        </div>
    );
};

export default ContentManagement;
