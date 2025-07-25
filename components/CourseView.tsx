import React, { useState } from 'react';
import { SkillNode, QuizQuestion, Flashcard, AiFlashcardState } from '../types';
import { ArrowLeft, CheckCircle, Video, FileText, HelpCircle, Copy, RotateCw, ChevronLeft, ChevronRight, Check, X, Sparkles, Loader2, Star } from 'lucide-react';
import { generateFlashcardsFromText } from '../services/geminiService';
import { useData, useUI } from '../hooks/useAppContext';
import { View } from '../types';

type CourseTab = 'video' | 'text' | 'quiz' | 'flashcards';

const TABS: { id: CourseTab, label: string, icon: React.ElementType }[] = [
    { id: 'video', label: 'Video', icon: Video },
    { id: 'text', label: 'Lektionstext', icon: FileText },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle },
    { id: 'flashcards', label: 'Karteikarten', icon: Copy },
];

const QuizComponent: React.FC<{ quiz: QuizQuestion[] }> = ({ quiz }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);

    const question = quiz[currentQuestionIndex];
    const isCorrect = selectedAnswerIndex === question.correctAnswerIndex;

    const handleAnswerClick = (index: number) => {
        if (showResult) return;
        setSelectedAnswerIndex(index);
        setShowResult(true);
        if (index === question.correctAnswerIndex) {
            setScore(s => s + 1);
        }
    };

    const handleNext = () => {
        setShowResult(false);
        setSelectedAnswerIndex(null);
        if (currentQuestionIndex < quiz.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
        } else {
            setQuizFinished(true);
        }
    };

    const handleReset = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswerIndex(null);
        setShowResult(false);
        setScore(0);
        setQuizFinished(false);
    };

    if (quizFinished) {
        return (
            <div className="text-center p-6 bg-slate-900/50 rounded-lg">
                <h3 className="text-2xl font-bold text-white mb-2">Quiz abgeschlossen!</h3>
                <p className="text-lg text-slate-300 mb-4">Du hast {score} von {quiz.length} Fragen richtig beantwortet.</p>
                <button onClick={handleReset} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center mx-auto">
                    <RotateCw className="h-4 w-4 mr-2" />
                    Quiz wiederholen
                </button>
            </div>
        );
    }
    
    return (
        <div className="p-6 bg-slate-900/50 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Frage {currentQuestionIndex + 1} von {quiz.length}</p>
            <h4 className="text-lg font-bold text-white mb-4">{question.question}</h4>
            <div className="space-y-3">
                {question.options.map((option, index) => {
                    const isSelected = selectedAnswerIndex === index;
                    let buttonClass = 'bg-slate-700 hover:bg-slate-600';
                    if (showResult && isSelected) {
                        buttonClass = isCorrect ? 'bg-green-600' : 'bg-red-600';
                    } else if (showResult && index === question.correctAnswerIndex) {
                        buttonClass = 'bg-green-600';
                    }

                    return (
                         <button key={index} onClick={() => handleAnswerClick(index)} disabled={showResult} className={`w-full text-left p-3 rounded-lg transition flex items-center justify-between ${buttonClass}`}>
                            <span>{option}</span>
                            {showResult && isSelected && (isCorrect ? <Check className="h-5 w-5"/> : <X className="h-5 w-5"/>)}
                        </button>
                    )
                })}
            </div>
            {showResult && (
                 <div className={`mt-4 p-3 rounded-lg ${isCorrect ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                    <p className="font-semibold">{isCorrect ? 'Richtig!' : 'Leider falsch.'}</p>
                    <p className="text-sm">{question.explanation}</p>
                </div>
            )}
            <div className="mt-6 text-right">
                <button onClick={handleNext} disabled={!showResult} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg disabled:bg-slate-500 disabled:cursor-not-allowed">
                    Weiter
                </button>
            </div>
        </div>
    );
};

const FlashcardComponent: React.FC<{
    initialFlashcards: Flashcard[];
    lessonText: string;
}> = ({ initialFlashcards, lessonText }) => {
    const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>(initialFlashcards);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [aiState, setAiState] = useState<AiFlashcardState>('idle');

    const handleGenerate = async () => {
        setAiState('loading');
        try {
            const newCards = await generateFlashcardsFromText(lessonText);
            setAllFlashcards(prev => [...prev, ...newCards]);
            setAiState('success');
            setTimeout(() => setAiState('idle'), 2000); // Reset after a while
        } catch (error) {
            console.error(error);
            setAiState('error');
            setTimeout(() => setAiState('idle'), 3000); // Reset after a while
        }
    };

    const handleFlip = () => setIsFlipped(!isFlipped);
    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex((i) => (i + 1) % allFlashcards.length), 150);
    };
    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex((i) => (i - 1 + allFlashcards.length) % allFlashcards.length), 150);
    };

    const card = allFlashcards[currentIndex];
    if (!card) return <div>Keine Karteikarten verfügbar.</div>;

    return (
        <div className="flex flex-col items-center">
             <div className="w-full max-w-lg h-64 perspective-1000">
                <div onClick={handleFlip} className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 text-center bg-slate-700 rounded-xl shadow-lg">
                        <p className="text-xl text-white">{card.front}</p>
                    </div>
                     <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center p-6 text-center bg-blue-700 rounded-xl shadow-lg">
                        <p className="text-xl text-white">{card.back}</p>
                    </div>
                </div>
            </div>
            <div className="mt-6 flex items-center justify-between w-full max-w-lg">
                 <button onClick={handlePrev} className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 transition"><ChevronLeft className="h-6 w-6"/></button>
                 <p className="text-slate-400 font-semibold">{currentIndex + 1} / {allFlashcards.length}</p>
                 <button onClick={handleNext} className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 transition"><ChevronRight className="h-6 w-6"/></button>
            </div>
            <div className="mt-8 border-t border-slate-700/50 w-full max-w-lg pt-6 text-center">
                 <button onClick={handleGenerate} disabled={aiState === 'loading'} className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-500 disabled:cursor-wait text-white font-bold py-2 px-4 rounded-lg flex items-center mx-auto transition-all">
                    {aiState === 'loading' && <Loader2 className="h-5 w-5 mr-2 animate-spin"/>}
                    {aiState === 'idle' && <Sparkles className="h-5 w-5 mr-2"/>}
                    {aiState === 'success' && <Check className="h-5 w-5 mr-2"/>}
                    {aiState === 'error' && <X className="h-5 w-5 mr-2"/>}
                    {
                        {
                            'idle': 'KI: Mehr Lernkarten generieren',
                            'loading': 'Generiere...',
                            'success': 'Karten hinzugefügt!',
                            'error': 'Fehler! Versuchs erneut.'
                        }[aiState]
                    }
                </button>
            </div>
        </div>
    )
};

interface CourseViewProps {
    courseNode: SkillNode;
    coursePathId: string;
}

const CourseView: React.FC<CourseViewProps> = ({ courseNode, coursePathId }) => {
    const [activeTab, setActiveTab] = useState<CourseTab>('video');
    const { handleCompleteNode } = useData();
    const { setView } = useUI();
    const content = courseNode.content!;

    const onBack = () => {
        setView(View.LearningPath);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'video':
                return (
                    <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden shadow-lg">
                        <iframe 
                            width="560" 
                            height="315" 
                            src={`https://www.youtube.com/embed/${content.videoId}`} 
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    </div>
                );
            case 'text':
                return <div className="p-6 bg-slate-900/50 rounded-lg text-slate-300 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content.textContent }} />;
            case 'quiz':
                return <QuizComponent quiz={content.quiz} />;
            case 'flashcards':
                return <FlashcardComponent initialFlashcards={content.flashcards} lessonText={content.textContent} />;
            default:
                return null;
        }
    };

    return (
        <section id="course-view" className="fade-in">
            <button onClick={onBack} className="flex items-center text-sm text-blue-400 hover:text-blue-300 mb-4 font-semibold">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zum Lernbaum
            </button>
            
            <div className="glass-card no-hover p-6 rounded-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-white">{courseNode.title}</h2>
                        <p className="text-slate-400 mt-2 mb-6 max-w-3xl">{content.description}</p>
                    </div>
                    <div className="flex items-center text-lg bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full font-bold shrink-0 ml-4">
                        <Star className="h-6 w-6 mr-2"/>
                        {courseNode.xp} XP
                    </div>
                </div>
                
                <div className="border-b border-slate-700 mb-6">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-400'
                                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                                } flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                <tab.icon className="h-5 w-5 mr-2" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div className="min-h-[30rem] flex justify-center">
                    <div className="w-full">
                        {renderContent()}
                    </div>
                </div>
                
                {courseNode.status !== 'completed' && (
                    <div className="mt-8 pt-6 border-t border-slate-700 flex justify-end">
                        <button 
                            onClick={() => handleCompleteNode(courseNode.id, coursePathId)} 
                            className="bg-green-600 hover:bg-green-500 transition text-white font-bold py-3 px-6 rounded-lg flex items-center text-lg shadow-lg hover:shadow-green-500/30"
                        >
                            <CheckCircle className="h-6 w-6 mr-3" />
                            Kurs abschließen & {courseNode.xp} XP erhalten
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CourseView;