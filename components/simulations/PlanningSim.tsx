

import React, { useState } from 'react';
import { PlanningScenario, UserCalculation, PlanningFeedback } from '../../types';
import { getPlanningSimFeedback } from '../../services/geminiService';
import { Calculator, CheckCircle, Lightbulb, BrainCircuit, Loader2, AlertTriangle } from 'lucide-react';

interface PlanningSimProps {
    scenario: PlanningScenario;
    onExit: (completed: boolean) => void;
}

const PlanningSim: React.FC<PlanningSimProps> = ({ scenario, onExit }) => {
    const initialCalculations = scenario.devices.map(() => ({ Pzu_kW: '', I_A_WS: '', I_A_DS: '', Sicherung_A: '', A_mm2: '' }));
    const [userCalculations, setUserCalculations] = useState<UserCalculation[]>(initialCalculations);
    const [feedback, setFeedback] = useState<PlanningFeedback | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (deviceIndex: number, field: keyof UserCalculation, value: string) => {
        const newCalculations = [...userCalculations];
        newCalculations[deviceIndex][field] = value;
        setUserCalculations(newCalculations);
        setFeedback(null); // Reset feedback on change
        setError(null);
    };

    const handleEvaluate = async () => {
        setIsLoading(true);
        setError(null);
        setFeedback(null);
        try {
            const result = await getPlanningSimFeedback(scenario, userCalculations);
            setFeedback(result);
            const allCorrect = result.lineFeedback.every(f => f.isCorrect);
            if(allCorrect) {
                onExit(true); // Mark as completed if all calculations are correct
            }
        } catch (e) {
            setError((e as Error).message || "Ein unbekannter Fehler ist aufgetreten.");
        } finally {
            setIsLoading(false);
        }
    };

    const getFieldFeedback = (deviceIndex: number, field: keyof UserCalculation) => {
        if (!feedback) return null;
        return feedback.lineFeedback.find(f => f.deviceIndex === deviceIndex && f.field === field) || null;
    };

    const getResultClass = (deviceIndex: number, field: keyof UserCalculation) => {
        const fieldFeedback = getFieldFeedback(deviceIndex, field);
        if (!fieldFeedback) return '';
        if (fieldFeedback.isCorrect) return 'correct';
        return 'incorrect';
    };
    
    const fields: { key: keyof UserCalculation, label: string }[] = [
        { key: 'Pzu_kW', label: 'Pzu / kW' },
        { key: 'I_A_WS', label: 'I / A (WS)' },
        { key: 'I_A_DS', label: 'I / A (DS)' },
        { key: 'Sicherung_A', label: 'Sicherung / A' },
        { key: 'A_mm2', label: 'A / mm²' },
    ];


    return (
        <div className="text-white p-4">
            <div className="flex items-start gap-4 mb-4">
                <Calculator className="h-12 w-12 text-green-400 shrink-0 mt-1" />
                <div>
                    <h2 className="text-2xl font-bold">{scenario.title}</h2>
                    <p className="text-slate-300">{scenario.description}</p>
                </div>
            </div>
            
            <div className="overflow-x-auto bg-slate-900/50 p-4 rounded-lg">
                <table className="w-full border-collapse text-sm text-center">
                    <thead>
                        <tr className="border-b-2 border-slate-600">
                            <th className="p-2 font-semibold">Gerät</th>
                            <th className="p-2 font-semibold">P / kW</th>
                            <th className="p-2 font-semibold">cos(φ)</th>
                            <th className="p-2 font-semibold">η</th>
                            <th className="p-2 font-semibold">L / m</th>
                            {fields.map(f => <th key={f.key} className="p-2 font-semibold border-l border-slate-600">{f.label}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {scenario.devices.map((device, deviceIndex) => (
                             <tr key={device.id} className="border-b border-slate-700">
                                <td className="p-2 text-left">{device.name}</td>
                                <td className="p-2">{device.P_kW.toLocaleString('de-DE')}</td>
                                <td className="p-2">{device.cosPhi?.toLocaleString('de-DE') || '-'}</td>
                                <td className="p-2">{device.eta?.toLocaleString('de-DE') || '-'}</td>
                                <td className="p-2">{device.length_m.toLocaleString('de-DE')}</td>
                                {fields.map((field) => {
                                    const fieldFeedback = getFieldFeedback(deviceIndex, field.key);
                                    return (
                                        <td key={field.key} className="p-1 border-l border-slate-700">
                                            <input
                                                type="text"
                                                value={userCalculations[deviceIndex][field.key]}
                                                onChange={(e) => handleInputChange(deviceIndex, field.key, e.target.value)}
                                                className={`planning-input ${getResultClass(deviceIndex, field.key)}`}
                                                disabled={!scenario.correctSolutions[deviceIndex][field.key] && scenario.correctSolutions[deviceIndex][field.key] !== ""}
                                                title={fieldFeedback && !fieldFeedback.isCorrect ? fieldFeedback.comment : ''}
                                            />
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {feedback && !isLoading && (
                 <div className="mt-4 p-4 bg-blue-900/50 border border-blue-500/50 rounded-lg">
                    <h4 className="font-bold text-blue-300 flex items-center gap-2"><BrainCircuit/> KI-Feedback des Prüfers</h4>
                    <p className="text-slate-300 mt-1">{feedback.summary}</p>
                </div>
            )}
             {error && (
                 <div className="mt-4 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-center text-red-300">
                    <AlertTriangle className="mx-auto h-6 w-6 mb-2"/>
                    <p>{error}</p>
                </div>
            )}

            <div className="mt-6 flex justify-between items-center">
                 <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Lightbulb className="h-5 w-5 text-yellow-400"/>
                    <span>Tipp: Falsch markierte Felder zeigen beim Hovern den Fehler an.</span>
                 </div>
                 <button onClick={handleEvaluate} disabled={isLoading} className="bg-green-600 hover:bg-green-500 font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:bg-slate-500 disabled:cursor-wait">
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : <CheckCircle className="h-5 w-5"/>}
                    {isLoading ? 'Bewerte...' : 'Ergebnisse prüfen'}
                </button>
            </div>
        </div>
    );
};

export default PlanningSim;