import React from 'react';
import { HardHat } from 'lucide-react';

interface ComingSoonSimProps {
    title: string;
    onExit: () => void;
}

const ComingSoonSim: React.FC<ComingSoonSimProps> = ({ title, onExit }) => {
    return (
        <div className="text-center text-slate-300 p-8">
            <HardHat className="h-24 w-24 mx-auto text-yellow-400 mb-6" />
            <h3 className="text-3xl font-bold text-white mb-2">{title}</h3>
            <p className="text-lg text-slate-400 mb-8">Diese Simulation befindet sich noch in der Entwicklung.</p>
            <p className="mb-8">Schauen Sie bald wieder vorbei, um neue interaktive Lernerfahrungen zu meistern!</p>
            <button onClick={onExit} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg">
                Zurück zur Übersicht
            </button>
        </div>
    );
};

export default ComingSoonSim;