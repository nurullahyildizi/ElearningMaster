

import React, { useState, useEffect, useCallback } from 'react';
import { TroubleshootingScenario, MeasurementPointId, Measurement, Fault } from '../../types';
import { generateTroubleshootingScenario } from '../../services/geminiService';
import { Zap, HelpCircle, CheckCircle, XCircle, List, Repeat, Loader2, AlertTriangle } from 'lucide-react';

type Tool = 'voltage' | 'resistance';
type SimStatus = 'running' | 'solved' | 'failed';
type GenerationStatus = 'loading' | 'success' | 'error';


const CircuitDiagram: React.FC<{ onClickPoint: (point: MeasurementPointId) => void, highlightedComponent?: string }> = ({ onClickPoint, highlightedComponent }) => (
    <svg viewBox="0 0 400 300" className="w-full h-auto bg-slate-800 rounded-lg border-2 border-slate-700">
        {/* Main Lines */}
        <line x1="20" y1="30" x2="380" y2="30" stroke="#475569" strokeWidth="2" />
        <text x="22" y="25" fill="#e2e8f0" fontSize="10">L1</text>
        <line x1="20" y1="270" x2="380" y2="270" stroke="#475569" strokeWidth="2" />
        <text x="22" y="285" fill="#e2e8f0" fontSize="10">N</text>

        {/* Components */}
        <g id="F1" className={highlightedComponent === 'F1' ? 'animate-pulse' : ''}>
            <rect x="80" y="15" width="40" height="30" fill="transparent" stroke="#94a3b8" strokeWidth="1" />
            <line x1="85" y1="30" x2="115" y2="30" stroke="#e2e8f0" strokeWidth="2" />
            <text x="95" y="55" fill="#e2e8f0" fontSize="10">F1</text>
        </g>
        <g id="K1" className={highlightedComponent === 'K1_A1' ? 'animate-pulse' : ''}>
            <rect x="180" y="100" width="40" height="40" fill="transparent" stroke="#94a3b8" strokeWidth="1" />
            <line x1="180" y1="120" x2="220" y2="120" stroke="#e2e8f0" strokeWidth="1.5" />
            <line x1="200" y1="100" x2="200" y2="140" stroke="#e2e8f0" strokeWidth="1.5" />
            <text x="190" y="95" fill="#e2e8f0" fontSize="10">K1</text>
            <text x="165" y="110" fill="#e2e8f0" fontSize="10">A1</text>
            <text x="165" y="135" fill="#e2e8f0" fontSize="10">A2</text>
        </g>
         <g id="M1" className={highlightedComponent === 'M1_U' ? 'animate-pulse' : ''}>
            <circle cx="300" cy="150" r="30" stroke="#94a3b8" strokeWidth="1.5" fill="transparent" />
            <text x="295" y="155" fill="#e2e8f0" fontSize="15">M</text>
             <text x="290" y="115" fill="#e2e8f0" fontSize="10">U1</text>
             <text x="325" y="155" fill="#e2e8f0" fontSize="10">V1</text>
             <text x="290" y="195" fill="#e2e8f0" fontSize="10">W1</text>
        </g>
        
        {/* Connections */}
        <line x1="40" y1="30" x2="85" y2="30" stroke="#e2e8f0" strokeWidth="2" />
        <line x1="115" y1="30" x2="180" y2="30" stroke="#e2e8f0" strokeWidth="2" />
        <line x1="180" y1="30" x2="180" y2="110" stroke="#e2e8f0" strokeWidth="2" />
        <line x1="220" y1="120" x2="240" y2="120" stroke="#e2e8f0" strokeWidth="2" />
        <line x1="240" y1="120" x2="240" y2="30" stroke="#e2e8f0" strokeWidth="2" />
        <line x1="240" y1="30" x2="300" y2="30" stroke="#e2e8f0" strokeWidth="2" />
        <line x1="300" y1="30" x2="300" y2="120" stroke="#e2e8f0" strokeWidth="2" />
        <line x1="180" y1="130" x2="180" y2="270" stroke="#e2e8f0" strokeWidth="2" />
        <line x1="300" y1="180" x2="300" y2="270" stroke="#e2e8f0" strokeWidth="2" />

        {/* Measurement Points */}
        <circle cx="40" cy="30" r="4" fill="#3b82f6" cursor="pointer" onClick={() => onClickPoint('L1_in')}><title>L1_in</title></circle>
        <circle cx="95" cy="15" r="4" fill="#3b82f6" cursor="pointer" onClick={() => onClickPoint('F1_in')}><title>F1_in</title></circle>
        <circle cx="95" cy="45" r="4" fill="#3b82f6" cursor="pointer" onClick={() => onClickPoint('F1_out')}><title>F1_out</title></circle>
        <circle cx="180" y1="110" cy="110" r="4" fill="#3b82f6" cursor="pointer" onClick={() => onClickPoint('K1_A1')}><title>K1_A1</title></circle>
        <circle cx="180" y1="130" cy="130" r="4" fill="#3b82f6" cursor="pointer" onClick={() => onClickPoint('K1_A2')}><title>K1_A2</title></circle>
        <circle cx="300" cy="120" r="4" fill="#3b82f6" cursor="pointer" onClick={() => onClickPoint('M1_U')}><title>M1_U</title></circle>
        <circle cx="300" cy="180" r="4" fill="#3b82f6" cursor="pointer" onClick={() => onClickPoint('M1_W')}><title>M1_W</title></circle>

    </svg>
);


interface TroubleshootingSimProps {
    onExit: (completed: boolean) => void;
}

const TroubleshootingSim: React.FC<TroubleshootingSimProps> = ({ onExit }) => {
    const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('loading');
    const [scenario, setScenario] = useState<TroubleshootingScenario | null>(null);
    const [activeTool, setActiveTool] = useState<Tool>('voltage');
    const [selectedPoints, setSelectedPoints] = useState<MeasurementPointId[]>([]);
    const [displayValue, setDisplayValue] = useState<string>('--');
    const [log, setLog] = useState<Measurement[]>([]);
    const [status, setStatus] = useState<SimStatus>('running');
    const [highlightedComponent, setHighlightedComponent] = useState<string | undefined>();

    const initialize = useCallback(async () => {
        setGenerationStatus('loading');
        setScenario(null);
        setStatus('running');
        setLog([]);
        setSelectedPoints([]);
        setDisplayValue('--');
        setHighlightedComponent(undefined);

        try {
            const newScenario = await generateTroubleshootingScenario();
            setScenario(newScenario);
            setGenerationStatus('success');
        } catch (error) {
            console.error("Failed to generate scenario:", error);
            setGenerationStatus('error');
        }
    }, []);

    useEffect(() => {
        initialize();
    }, [initialize]);

    const performMeasurement = (points: [MeasurementPointId, MeasurementPointId?]) => {
        if (!scenario) return;
        // For voltage, we always measure against Neutral (which is K1_A2)
        const [p1, p2 = activeTool === 'voltage' ? 'K1_A2' : undefined] = points;
        if (!p2 && activeTool === 'resistance') {
            // Need two points for resistance
            return;
        }

        const sortedPoints = p2 ? [p1, p2].sort() : [p1];
        const key = sortedPoints.join('-') as `${MeasurementPointId}-${MeasurementPointId}`;
        
        let reading: number | undefined | string;
        let unit: 'V' | 'Ω' = activeTool === 'voltage' ? 'V' : 'Ω';

        if(activeTool === 'voltage') {
            const measurement = scenario.readings.voltage.find(item => item.key === key);
            reading = measurement?.value ?? 0;
        } else { // resistance
            const measurement = scenario.readings.resistance.find(item => item.key === key);
            reading = measurement?.value ?? 9999999;
        }
        
        const display = reading >= 9999999 ? 'OL' : `${Number(reading).toFixed(1)}`;
        setDisplayValue(display);
        setLog(prev => [{ point1: p1, point2: p2, value: display, unit }, ...prev]);
    }
    
    const handlePointClick = (point: MeasurementPointId) => {
        if(status !== 'running' || generationStatus !== 'success') return;

        const newPoints = [...selectedPoints, point];
        if (activeTool === 'voltage') {
             performMeasurement([point]);
             setSelectedPoints([]);
        } else { // resistance
             if (newPoints.length === 2) {
                performMeasurement(newPoints as [MeasurementPointId, MeasurementPointId]);
                setSelectedPoints([]);
             } else {
                setSelectedPoints(newPoints);
                setDisplayValue(`${point}...`);
             }
        }
    };

    const handleSolve = (faultId: string) => {
        if(scenario?.fault.id === faultId) {
            setStatus('solved');
            setHighlightedComponent(scenario.fault.component);
            onExit(true);
        } else {
            setStatus('failed');
        }
    }
    
    if (generationStatus === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-white">
                <Loader2 className="h-16 w-16 animate-spin text-blue-400 mb-4" />
                <h3 className="text-2xl font-bold">Generiere neues KI-Szenario...</h3>
                <p className="text-slate-400">Einen Moment, der Meister denkt sich eine neue Herausforderung aus.</p>
            </div>
        );
    }
    
    if (generationStatus === 'error' || !scenario) {
        return (
             <div className="flex flex-col items-center justify-center h-96 text-white">
                <AlertTriangle className="h-16 w-16 text-red-400 mb-4" />
                <h3 className="text-2xl font-bold">Fehler bei der Generierung</h3>
                <p className="text-slate-400 mb-6">Das KI-Szenario konnte nicht geladen werden. Bitte versuchen Sie es erneut.</p>
                <button onClick={initialize} className="mt-4 p-2 rounded-md flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-lg">
                    <Repeat className="h-5 w-5"/> Erneut versuchen
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-white">
            <div className="lg:col-span-2">
                 <h4 className="text-lg font-bold mb-2">{scenario.title}</h4>
                 <p className="text-slate-300 text-sm mb-4">{scenario.description}</p>
                 <CircuitDiagram onClickPoint={handlePointClick} highlightedComponent={highlightedComponent} />
            </div>
            <div className="space-y-4">
                {/* Toolbox */}
                <div className="bg-slate-900/50 p-4 rounded-lg">
                    <h5 className="font-bold mb-3 text-slate-300">Werkzeuge</h5>
                    <div className="flex gap-2">
                        <button onClick={() => setActiveTool('voltage')} className={`flex-1 p-2 rounded-md flex items-center justify-center gap-2 ${activeTool === 'voltage' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
                            <Zap className="h-5 w-5"/> Spannung
                        </button>
                        <button onClick={() => setActiveTool('resistance')} className={`flex-1 p-2 rounded-md flex items-center justify-center gap-2 ${activeTool === 'resistance' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 12.7c.3.3.3.8 0 1l-2.3 2.3c-.3.3-.8.3-1 0l-2.3-2.3a.8.8 0 0 1 0-1l2.3-2.3c.3-.3.8-.3 1 0l2.3 2.3Z"/><path d="M11.3 3.7c.3.3.3.8 0 1l-2.3 2.3c-.3.3-.8.3-1 0L5.7 4.8a.8.8 0 0 1 0-1l2.3-2.3c.3-.3.8-.3 1 0l2.3 2.3Z"/><path d="M6.5 12.5.8 18.2c-.4.4-.4 1 0 1.4l.7.7c.4.4 1 .4 1.4 0l5.7-5.7"/><path d="m17.5 11.5 5.7-5.7c.4-.4.4-1 0-1.4l-.7-.7c-.4-.4-1-.4-1.4 0L15.5 8.5"/><path d="M12.5 17.5 8.5 21.5c-.4.4-1 .4-1.4 0l-.7-.7c-.4-.4-.4-1 0-1.4l4-4"/></svg>
                            Widerstand
                        </button>
                    </div>
                    <div className="bg-black text-green-400 font-mono text-4xl text-right p-3 mt-3 rounded h-20 flex items-center justify-end">
                        <span>{displayValue}</span>
                        <span className="text-2xl ml-2 w-8">{displayValue !== '--' ? (activeTool === 'voltage' ? 'V' : 'Ω') : ''}</span>
                    </div>
                </div>

                 {/* Log */}
                 <div className="bg-slate-900/50 p-4 rounded-lg">
                     <h5 className="font-bold mb-2 text-slate-300 flex items-center gap-2"><List className="h-5 w-5"/> Messprotokoll</h5>
                     <ul className="text-sm space-y-1 h-32 overflow-y-auto font-mono flex flex-col-reverse">
                         {log.length === 0 && <p className="text-slate-400 normal-case">Noch keine Messungen.</p>}
                         {log.map((entry, i) => (
                             <li key={i} className="flex justify-between">
                                 <span>{entry.point1}{entry.point2 ? `-${entry.point2}`: ''}</span>
                                 <span>{entry.value} {entry.unit}</span>
                             </li>
                         ))}
                     </ul>
                 </div>

                {/* Solution */}
                <div className="bg-slate-900/50 p-4 rounded-lg">
                    <h5 className="font-bold mb-3 text-slate-300 flex items-center gap-2"><HelpCircle className="h-5 w-5"/> Was ist der Fehler?</h5>
                     {status === 'running' && (
                        <div className="space-y-2">
                           {scenario.possibleFaults.map(fault => (
                               <button key={fault.id} onClick={() => handleSolve(fault.id)} className="w-full text-left p-2 rounded-md bg-slate-700 hover:bg-slate-600 transition">
                                    {fault.description}
                                </button>
                           ))}
                        </div>
                    )}
                    {status === 'solved' && (
                        <div className="text-center p-4 bg-green-500/10 rounded-lg">
                            <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-2"/>
                            <h6 className="font-bold text-lg text-white">Richtig!</h6>
                            <p className="text-green-300">{scenario.fault.description}</p>
                             <button onClick={initialize} className="mt-4 p-2 rounded-md flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 w-full">
                                <Repeat className="h-5 w-5"/> Nächstes KI-Szenario
                            </button>
                        </div>
                    )}
                     {status === 'failed' && (
                        <div className="text-center p-4 bg-red-500/10 rounded-lg">
                            <XCircle className="h-10 w-10 text-red-400 mx-auto mb-2"/>
                            <h6 className="font-bold text-lg text-white">Leider Falsch</h6>
                            <p className="text-red-300">Versuche es weiter!</p>
                            <button onClick={() => setStatus('running')} className="mt-4 p-2 rounded-md bg-slate-600 hover:bg-slate-500 w-full">
                                Erneut versuchen
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TroubleshootingSim;