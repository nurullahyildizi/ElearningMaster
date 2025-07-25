
import React, { useState } from 'react';
import { SkillNode, QuizQuestion, Flashcard, SkillCategory } from '../../types';
import { SKILL_CATEGORIES } from '../../constants';
import { X, Plus, Trash2 } from 'lucide-react';

interface CourseEditorProps {
    node: SkillNode;
    onSave: (updatedNode: SkillNode) => void;
    onClose: () => void;
}

const CourseEditor: React.FC<CourseEditorProps> = ({ node, onSave, onClose }) => {
    const [formData, setFormData] = useState<SkillNode>(JSON.parse(JSON.stringify(node))); // Deep copy

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (name.startsWith('content.')) {
            const contentField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                content: {
                    ...prev.content!,
                    [contentField]: value,
                }
            }));
            return;
        }

        const isCheckbox = type === 'checkbox';
        const isNumber = type === 'number';

        setFormData(prev => ({
            ...prev,
            [name]: isCheckbox ? (e.target as HTMLInputElement).checked : (isNumber ? parseInt(value) || 0 : value)
        }));
    };

    const handleQuizChange = (qIndex: number, field: keyof QuizQuestion, value: any, oIndex?: number) => {
        const newQuiz = [...(formData.content?.quiz || [])];
        if (field === 'options') {
            newQuiz[qIndex].options[oIndex!] = value;
        } else {
            (newQuiz[qIndex] as any)[field] = value;
        }
        setFormData(prev => ({ ...prev, content: { ...prev.content!, quiz: newQuiz } }));
    };
    
    const handleFlashcardChange = (fIndex: number, field: keyof Flashcard, value: string) => {
        const newFlashcards = [...(formData.content?.flashcards || [])];
        newFlashcards[fIndex][field] = value;
        setFormData(prev => ({ ...prev, content: { ...prev.content!, flashcards: newFlashcards } }));
    };
    
    const addQuizQuestion = () => {
        const newQuestion: QuizQuestion = { question: 'Neue Frage', options: ['', '', '', ''], correctAnswerIndex: 0, explanation: '' };
        setFormData(prev => ({ ...prev, content: { ...prev.content!, quiz: [...(prev.content?.quiz || []), newQuestion] } }));
    };
    
     const addFlashcard = () => {
        const newFlashcard: Flashcard = { front: 'Vorderseite', back: 'Rückseite' };
        setFormData(prev => ({ ...prev, content: { ...prev.content!, flashcards: [...(prev.content?.flashcards || []), newFlashcard] } }));
    };

    const deleteQuizQuestion = (qIndex: number) => {
        const newQuiz = formData.content!.quiz.filter((_, i) => i !== qIndex);
        setFormData(prev => ({ ...prev, content: { ...prev.content!, quiz: newQuiz }}));
    };
    
    const deleteFlashcard = (fIndex: number) => {
        const newFlashcards = formData.content!.flashcards.filter((_, i) => i !== fIndex);
        setFormData(prev => ({ ...prev, content: { ...prev.content!, flashcards: newFlashcards }}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="h-full flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b shrink-0">
                        <h2 className="text-xl font-bold">Kurs-Editor: <span className="text-blue-600">{formData.title}</span></h2>
                        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-200"><X /></button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto flex-grow space-y-6">
                        {/* General Node Settings */}
                        <div className="p-4 border rounded-lg bg-white">
                            <h3 className="font-bold text-lg mb-3">Allgemeine Einstellungen</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Titel</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">ID</label>
                                    <input type="text" name="id" value={formData.id} onChange={handleInputChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm bg-slate-100" readOnly/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Kategorie</label>
                                    <select name="category" value={formData.category} onChange={handleInputChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm">
                                        {Object.keys(SKILL_CATEGORIES).map(key => <option key={key} value={key}>{SKILL_CATEGORIES[key as SkillCategory].label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">XP</label>
                                    <input type="number" name="xp" value={formData.xp} onChange={handleInputChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm"/>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input id="pro" type="checkbox" name="pro" checked={formData.pro} onChange={handleInputChange} className="h-4 w-4 text-blue-600 border-slate-300 rounded"/>
                                    <label htmlFor="pro" className="font-medium">Pro-Kurs</label>
                                </div>
                            </div>
                        </div>

                        {/* Course Content */}
                        {formData.content && (
                            <>
                             <div className="p-4 border rounded-lg bg-white">
                                <h3 className="font-bold text-lg mb-3">Lerninhalte</h3>
                                <div className="space-y-4">
                                     <div>
                                        <label className="block text-sm font-medium">YouTube Video ID</label>
                                        <input type="text" name="content.videoId" value={formData.content.videoId} onChange={handleInputChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Beschreibung</label>
                                        <textarea name="content.description" value={formData.content.description} onChange={handleInputChange} rows={3} className="mt-1 w-full border-slate-300 rounded-md shadow-sm"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Lektionstext (HTML)</label>
                                        <textarea name="content.textContent" value={formData.content.textContent} rows={8} className="mt-1 w-full border-slate-300 rounded-md shadow-sm font-mono text-sm"/>
                                    </div>
                                </div>
                             </div>

                             {/* Quiz Editor */}
                             <div className="p-4 border rounded-lg bg-white">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold text-lg">Quiz</h3>
                                    <button type="button" onClick={addQuizQuestion} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"><Plus className="h-4 w-4 mr-1"/>Frage hinzufügen</button>
                                </div>
                                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                                    {formData.content.quiz.map((q, qIndex) => (
                                        <div key={qIndex} className="p-3 bg-slate-50 rounded-md border">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="font-semibold">Frage {qIndex + 1}</label>
                                                <button type="button" onClick={() => deleteQuizQuestion(qIndex)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash2 className="h-4 w-4"/></button>
                                            </div>
                                            <textarea value={q.question} onChange={e => handleQuizChange(qIndex, 'question', e.target.value)} rows={2} className="w-full border-slate-300 rounded-md text-sm"/>
                                            <div className="mt-2 space-y-2">
                                                {q.options.map((opt, oIndex) => (
                                                    <div key={oIndex} className="flex items-center">
                                                        <input type="radio" name={`correctAnswer_${qIndex}`} checked={q.correctAnswerIndex === oIndex} onChange={() => handleQuizChange(qIndex, 'correctAnswerIndex', oIndex)} className="h-4 w-4 text-blue-600"/>
                                                        <input type="text" value={opt} onChange={e => handleQuizChange(qIndex, 'options', e.target.value, oIndex)} className="ml-2 w-full border-slate-300 rounded-md text-sm"/>
                                                    </div>
                                                ))}
                                            </div>
                                             <label className="text-sm font-medium mt-2 block">Erklärung</label>
                                             <textarea value={q.explanation} onChange={e => handleQuizChange(qIndex, 'explanation', e.target.value)} rows={2} className="w-full border-slate-300 rounded-md text-sm"/>
                                        </div>
                                    ))}
                                </div>
                             </div>

                             {/* Flashcard Editor */}
                             <div className="p-4 border rounded-lg bg-white">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold text-lg">Karteikarten</h3>
                                    <button type="button" onClick={addFlashcard} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"><Plus className="h-4 w-4 mr-1"/>Karte hinzufügen</button>
                                </div>
                                 <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                    {formData.content.flashcards.map((f, fIndex) => (
                                        <div key={fIndex} className="p-3 bg-slate-50 rounded-md border grid grid-cols-10 gap-2 items-center">
                                             <div className="col-span-4">
                                                <label className="text-sm font-medium">Vorderseite</label>
                                                <input type="text" value={f.front} onChange={e => handleFlashcardChange(fIndex, 'front', e.target.value)} className="w-full border-slate-300 rounded-md text-sm"/>
                                             </div>
                                             <div className="col-span-5">
                                                <label className="text-sm font-medium">Rückseite</label>
                                                <input type="text" value={f.back} onChange={e => handleFlashcardChange(fIndex, 'back', e.target.value)} className="w-full border-slate-300 rounded-md text-sm"/>
                                             </div>
                                             <div className="col-span-1 text-right">
                                                 <label className="block text-sm">&nbsp;</label>
                                                  <button type="button" onClick={() => deleteFlashcard(fIndex)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash2 className="h-4 w-4"/></button>
                                             </div>
                                        </div>
                                    ))}
                                 </div>
                             </div>
                            </>
                        )}
                    </div>
                    
                    <div className="bg-slate-100 px-6 py-4 flex justify-end space-x-3 border-t shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md font-medium hover:bg-slate-50">Abbrechen</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-white hover:bg-blue-700">Änderungen speichern</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseEditor;
