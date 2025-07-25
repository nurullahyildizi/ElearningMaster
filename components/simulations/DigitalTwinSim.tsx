


import React, { useState, useRef, useMemo, DragEvent, useEffect, useCallback } from 'react';
import { PlacedComponent, ExamTask, DigitalTwinFeedback, Wire, WireColor, ComponentType, SimulatorPhase, FlukeTestType, TestProbe, FlukeDisplay, Probe, DigitalTwinMode, DigitalTwinFault, PaletteComponent } from '../../types';
import { PALETTE_COMPONENTS, EXAM_TASKS, COMPONENT_CONNECTION_POINTS, TROUBLESHOOTING_PRESET } from '../../constants';
import { getDigitalTwinFeedback, generateDigitalTwinFault } from '../../services/geminiService';
import { HelpCircle, CheckCircle, XCircle, BrainCircuit, Loader2, Zap, Wrench, Box, Beaker, Package, Trash2, Milestone, AlertTriangle, Search } from 'lucide-react';
import FlukeTester from './FlukeTester';

const COMPONENT_SIZE_PX = 40;

// --- SVG Icons for Components ---
const SocketIcon = () => <svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><rect x="3" y="3" width="18" height="18" rx="2" fill="#d1d5db"/><circle cx="12" cy="12" r="4" stroke="#4b5563" strokeWidth="1.5"/><line x1="8" y1="12" x2="16" y2="12" stroke="#4b5563" strokeWidth="1.5"/><line x1="12" y1="8" x2="12" y2="16" stroke="#4b5563" strokeWidth="1.5"/></svg>;
const DoubleSocketIcon = () => <svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><rect x="3" y="3" width="18" height="18" rx="2" fill="#d1d5db"/><g transform="translate(0 -3)"><circle cx="12" cy="9" r="3" stroke="#4b5563" strokeWidth="1"/><line x1="9" y1="9" x2="15" y2="9" stroke="#4b5563" strokeWidth="1"/></g><g transform="translate(0 3)"><circle cx="12" cy="15" r="3" stroke="#4b5563" strokeWidth="1"/><line x1="9" y1="15" x2="15" y2="15" stroke="#4b5563" strokeWidth="1"/></g></svg>;
const LightIcon: React.FC<{isPowered: boolean}> = ({isPowered}) => <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full transition-all duration-300 ${isPowered ? 'light-on' : ''}`}><circle cx="12" cy="12" r="8" fill={isPowered ? '#fef08a' : '#9ca3af'}/><path d="M12 20s4-2 4-6H8c0 4 4 6 4 6Z" fill={isPowered ? '#fde047' : '#6b7280'}/></svg>;
const SwitchIcon: React.FC<{isToggled: boolean}> = ({isToggled}) => <svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><rect x="3" y="3" width="18" height="18" rx="2" fill="#d1d5db"/><rect x="8" y="6" width="8" height="12" rx="1" fill="#9ca3af"/><rect x="9" y={isToggled ? "7" : "12"} width="6" height="5" rx="0.5" fill="#e5e7eb" className="transition-all duration-200"/></svg>;
const JunctionBoxIcon = () => <svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><rect x="4" y="4" width="16" height="16" rx="2" fill="#9ca3af"/><rect x="11" y="7" width="2" height="10" fill="#6b7280"/><rect x="7" y="11" width="10" height="2" fill="#6b7280"/></svg>;
const PowerSourceIcon: React.FC<{isOn: boolean}> = ({isOn}) => <svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><rect x="3" y="3" width="18" height="18" rx="3" fill="#374151"/><path d="M12 7v10m-4-5h8" stroke={isOn ? "#fde047" : "#6b7280"} strokeWidth="2" strokeLinecap="round" className="transition-all"/><circle cx="12" cy="12" r="8" stroke={isOn ? "#4f46e5" : "#6b7280"} strokeWidth="1.5" className="transition-all"/></svg>;

const getComponentIcon = (comp: PlacedComponent, poweredLights: Set<string>) => {
    switch (comp.type) {
        case 'socket': return <SocketIcon />;
        case 'socket-double': return <DoubleSocketIcon />;
        case 'light': return <LightIcon isPowered={poweredLights.has(comp.id)}/>;
        case 'switch': return <SwitchIcon isToggled={!!comp.isToggled} />;
        case 'junction-box': return <JunctionBoxIcon />;
        case 'power-source': return <PowerSourceIcon isOn={!!comp.isOn} />;
        default: return null;
    }
}

interface DigitalTwinSimProps {
    onExit: (completed: boolean) => void;
    mode: DigitalTwinMode;
}

const DigitalTwinSim: React.FC<DigitalTwinSimProps> = ({ onExit, mode }) => {
    const [phase, setPhase] = useState<SimulatorPhase>('planen');
    
    const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>([]);
    const [wires, setWires] = useState<Wire[]>([]);
    
    const [draggingComponent, setDraggingComponent] = useState<PaletteComponent | PlacedComponent | null>(null);
    const [isTrashCanActive, setIsTrashCanActive] = useState(false);
    
    // Exam mode state
    const [currentTask, setCurrentTask] = useState<ExamTask | null>(null);
    const [feedback, setFeedback] = useState<DigitalTwinFeedback | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);

    // Wiring mode state
    const [selectedWireColor, setSelectedWireColor] = useState<WireColor>('L');
    const [currentWireStart, setCurrentWireStart] = useState<{ compId: string, pointId: string } | null>(null);
    
    // Measurement / Troubleshooting state
    const [poweredLights, setPoweredLights] = useState<Set<string>>(new Set());
    const [probes, setProbes] = useState<Record<Probe, TestProbe | null>>({ L: null, N: null, PE: null });
    const [flukeDisplay, setFlukeDisplay] = useState<FlukeDisplay>({ primary: "----", secondary: "" });
    const [selectedTest, setSelectedTest] = useState<FlukeTestType>('V');
    const [draggingProbe, setDraggingProbe] = useState<Probe | null>(null);
    const [fault, setFault] = useState<DigitalTwinFault | null>(null);
    const [faultGenStatus, setFaultGenStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
    const [userDiagnosis, setUserDiagnosis] = useState<{type: 'component' | 'wire', id: string} | null>(null);
    const [diagnosisResult, setDiagnosisResult] = useState<'correct' | 'incorrect' | null>(null);

    const boardRef = useRef<HTMLDivElement>(null);

    // Initialize simulation based on mode
    useEffect(() => {
        const initialize = async () => {
            resetState();
            if (mode === 'exam') {
                setCurrentTask(EXAM_TASKS[Math.floor(Math.random() * EXAM_TASKS.length)]);
                setPhase('planen');
            } else if (mode === 'troubleshooting') {
                setFaultGenStatus('loading');
                setPhase('messen'); // Start in measure phase for troubleshooting
                const preset = JSON.parse(JSON.stringify(TROUBLESHOOTING_PRESET)); // Deep copy
                
                try {
                    const generatedFault = await generateDigitalTwinFault(preset.components, preset.wires);
                    setFault(generatedFault);

                    if (generatedFault.faultType === 'wire' && generatedFault.faultyWireId) {
                        preset.wires = preset.wires.filter((w: Wire) => w.id !== generatedFault.faultyWireId);
                    } else if (generatedFault.faultType === 'component' && generatedFault.faultyComponentId) {
                        preset.components = preset.components.map((c: PlacedComponent) => 
                            c.id === generatedFault.faultyComponentId ? { ...c, fault: 'open-circuit' } : c
                        );
                    }

                    setPlacedComponents(preset.components);
                    setWires(preset.wires);
                    setFaultGenStatus('success');
                } catch (e) {
                    console.error("Fault generation failed", e);
                    setFaultGenStatus('error');
                }
            } else { // sandbox
                setPhase('planen');
            }
        };
        initialize();
    }, [mode]);

    const handleComponentDragStart = useCallback((e: DragEvent, component: PaletteComponent | PlacedComponent) => {
        if (phase !== 'planen') return;
        e.dataTransfer.setData('application/json', JSON.stringify(component));
        e.dataTransfer.effectAllowed = 'move';
        setDraggingComponent(component);
    }, [phase]);

    const handleComponentDragEnd = useCallback(() => {
        setDraggingComponent(null);
    }, []);
    
    const handleDropOnBoard = useCallback((e: DragEvent) => {
        e.preventDefault();
        if (!boardRef.current) return;
        const rect = boardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        // Handle component drop in planning phase
        if (phase === 'planen' && e.dataTransfer.types.includes('application/json')) {
            const componentData: PaletteComponent | PlacedComponent = JSON.parse(e.dataTransfer.getData('application/json'));
            if ('id' in componentData) { // Moving existing component
                setPlacedComponents(prev => prev.map(c => c.id === componentData.id ? { ...c, x: xPercent, y: yPercent } : c));
            } else { // Placing new component
                const newComponent: PlacedComponent = { 
                    id: `${Date.now()}`, 
                    name: componentData.name, 
                    type: componentData.type, 
                    x: xPercent, 
                    y: yPercent, 
                    isOn: componentData.type === 'power-source' ? true : undefined,
                    connectionPoints: COMPONENT_CONNECTION_POINTS[componentData.type] 
                };
                setPlacedComponents(prev => [...prev, newComponent]);
            }
            setFeedback(null);
        }
        
        // Handle probe drop in measurement phase
        if (phase === 'messen' && draggingProbe) {
            let targetComponentId: string | null = null;
            let targetPointId: string | null = null;
            
            // Find the component and connection point under the drop position
            const droppedOnComponent = placedComponents.find(c => {
                const compX = c.x / 100 * rect.width;
                const compY = c.y / 100 * rect.height;
                const dist = Math.hypot(x - compX, y - compY);
                return dist < COMPONENT_SIZE_PX;
            });

            if (droppedOnComponent) {
                targetComponentId = droppedOnComponent.id;
                let closestPoint: {id: string, dist: number} | null = null;
                 const compX = droppedOnComponent.x / 100 * rect.width;
                 const compY = droppedOnComponent.y / 100 * rect.height;

                droppedOnComponent.connectionPoints.forEach(p => {
                    const pointX = compX + (p.x - 50) / 100 * COMPONENT_SIZE_PX;
                    const pointY = compY + (p.y - 50) / 100 * COMPONENT_SIZE_PX;
                    const dist = Math.hypot(x - pointX, y - pointY);
                    if (!closestPoint || dist < closestPoint.dist) {
                        closestPoint = { id: p.id, dist };
                    }
                });
                if(closestPoint) targetPointId = closestPoint.id;
            }
            
            setProbes(prev => ({...prev, [draggingProbe]: { probe: draggingProbe!, targetComponentId, targetPointId }}));
            setDraggingProbe(null);
        }
    }, [phase, draggingProbe, placedComponents]);

    const handleDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);
    
    const handleTrashDrop = useCallback((e: DragEvent) => {
        e.preventDefault();
        const componentData: PlacedComponent = JSON.parse(e.dataTransfer.getData('application/json'));
        if (componentData.id) {
            setPlacedComponents(prev => prev.filter(c => c.id !== componentData.id));
            setWires(prev => prev.filter(w => w.startComponentId !== componentData.id && w.endComponentId !== componentData.id));
        }
        setIsTrashCanActive(false);
        setFeedback(null);
    }, []);

    const handlePointClick = useCallback((compId: string, pointId: string) => {
        if (phase === 'verdrahten') {
            if (!currentWireStart) {
                setCurrentWireStart({ compId, pointId });
            } else if (currentWireStart.compId !== compId || currentWireStart.pointId !== pointId) {
                const newWire: Wire = {
                    id: `${currentWireStart.compId}-${currentWireStart.pointId}-${compId}-${pointId}-${Date.now()}`,
                    startComponentId: currentWireStart.compId,
                    startPointId: currentWireStart.pointId,
                    endComponentId: compId,
                    endPointId: pointId,
                    color: selectedWireColor,
                };
                setWires(prev => [...prev, newWire]);
                setCurrentWireStart(null);
            } else {
                setCurrentWireStart(null); // Deselect if clicked again
            }
        }
    }, [phase, currentWireStart, selectedWireColor]);

    const handleComponentClick = (componentId: string) => {
        const comp = placedComponents.find(c => c.id === componentId);
        if (!comp) return;

        if (phase === 'messen' || phase === 'planen') {
            if (comp.type === 'switch') {
                setPlacedComponents(prev => prev.map(c => 
                   c.id === componentId ? { ...c, isToggled: !c.isToggled } : c
               ));
            }
            if (comp.type === 'power-source') {
                 setPlacedComponents(prev => prev.map(c => 
                   c.id === componentId ? { ...c, isOn: !c.isOn } : c
               ));
            }
        } else if (phase === 'diagnose') {
            setUserDiagnosis({ type: 'component', id: componentId });
        }
    };
    
    // --- Advanced Circuit Logic ---
    const circuitState = useMemo(() => {
        const powerSource = placedComponents.find(c => c.type === 'power-source');
        if (!powerSource || !powerSource.isOn) {
            return { live: new Set<string>(), neutral: new Set<string>(), pe: new Set<string>(), pointMap: new Map<string, number>() };
        }
        
        const adj: Map<string, string[]> = new Map();
        const pointToCompId: Map<string, string> = new Map();
        const pointMap: Map<string, number> = new Map(); // For resistance calculation
        let pointCounter = 0;
        
        placedComponents.forEach(c => c.connectionPoints.forEach(p => {
             const pointKey = `${c.id}-${p.id}`;
             if(!adj.has(pointKey)) adj.set(pointKey, []);
             pointToCompId.set(pointKey, c.id);
             pointMap.set(pointKey, pointCounter++);
        }));

        wires.forEach(w => {
            const startKey = `${w.startComponentId}-${w.startPointId}`;
            const endKey = `${w.endComponentId}-${w.endPointId}`;
            adj.get(startKey)?.push(endKey);
            adj.get(endKey)?.push(startKey);
        });

        const toggledSwitches = new Set(placedComponents.filter(c => c.type === 'switch' && c.isToggled).map(c => c.id));
        const faultyComponents = new Set(placedComponents.filter(c => !!c.fault).map(c => c.id));

        const traverse = (startNodeKey: string) => {
            const visited = new Set<string>();
            const queue: string[] = [startNodeKey];
            visited.add(startNodeKey);
            
            while(queue.length > 0){
                const u_key = queue.shift()!;
                const u_compId = pointToCompId.get(u_key)!;
                const u_comp = placedComponents.find(c => c.id === u_compId)!;

                // Handle internal connections (e.g., inside a switch) if not faulty
                if (!faultyComponents.has(u_comp.id)) {
                    if (u_comp.type === 'switch' && u_key.endsWith('L_in') && toggledSwitches.has(u_comp.id)) {
                        const internalTargetKey = `${u_compId}-L_out`;
                        if (!visited.has(internalTargetKey)) {
                            visited.add(internalTargetKey);
                            queue.push(internalTargetKey);
                        }
                    }
                }

                // Handle wire connections
                (adj.get(u_key) || []).forEach(v_key => {
                    if (!visited.has(v_key)) {
                        visited.add(v_key);
                        queue.push(v_key);
                    }
                });
            }
            return visited;
        };
        
        const livePoints = traverse(`${powerSource.id}-L`);
        const neutralPoints = traverse(`${powerSource.id}-N`);
        const pePoints = traverse(`${powerSource.id}-PE`);
        
        return { live: livePoints, neutral: neutralPoints, pe: pePoints, pointMap };
    }, [placedComponents, wires]);


    useEffect(() => {
        // This effect runs whenever the circuit state changes, including switch toggles.
        const newPoweredLights = new Set<string>();
        placedComponents.filter(c => c.type === 'light').forEach(light => {
            const isLive = circuitState.live.has(`${light.id}-L`);
            const isNeutral = circuitState.neutral.has(`${light.id}-N`);
            if (isLive && isNeutral) {
                newPoweredLights.add(light.id);
            }
        });
        setPoweredLights(newPoweredLights);
    }, [placedComponents, circuitState]);


    const resetState = () => {
        setPlacedComponents([]);
        setWires([]);
        setFeedback(null);
        setCurrentWireStart(null);
        setPoweredLights(new Set());
        setProbes({ L: null, N: null, PE: null });
        setFlukeDisplay({ primary: "----", secondary: "" });
        setFault(null);
        setUserDiagnosis(null);
        setDiagnosisResult(null);
        setCurrentTask(null);
    };

    const handleSubmitForReview = useCallback(async () => {
        if (!currentTask) return;
        setIsEvaluating(true);
        setFeedback(null);
        try {
            const result = await getDigitalTwinFeedback(currentTask.description, placedComponents);
            setFeedback(result);
        } catch (error) {
            console.error(error);
            setFeedback({ isCorrect: false, feedbackSummary: "Fehler bei der Auswertung.", correctItems: [], missingItems: [], placementErrors: [] })
        } finally {
            setIsEvaluating(false);
        }
    }, [currentTask, placedComponents]);
    
    const getFeedbackClass = useCallback((componentId: string) => {
        if (!feedback) return '';
        if (feedback.correctItems.includes(componentId)) return 'feedback-correct';
        if (feedback.placementErrors.some(e => e.componentId === componentId)) return 'feedback-incorrect';
        return '';
    }, [feedback]);


    const WirePalette = () => (
        <div className="bg-slate-800 p-2 rounded-lg shadow-lg flex flex-col gap-2">
            <h4 className="text-sm font-bold text-center text-slate-400 mb-1">Aderfarben</h4>
            {(['L', 'N', 'PE', 'switched'] as WireColor[]).map(color => (
                <button 
                    key={color} 
                    onClick={() => setSelectedWireColor(color)} 
                    className={`w-full py-2 rounded-md border-2 text-sm font-semibold flex items-center justify-center gap-2 dt-wire-${color} ${selectedWireColor === color ? 'border-white' : 'border-transparent'}`}
                    style={{backgroundColor: `var(--wire-${color}-bg)`}}
                >
                  <div className={`w-4 h-4 rounded-full dt-wire-${color}`} style={{backgroundColor: `var(--wire-${color}-stroke)`}}></div>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </button>
            ))}
            <style>{`
                :root { 
                    --wire-L-stroke: #A0522D; --wire-L-bg: #A0522D30;
                    --wire-N-stroke: #00BFFF; --wire-N-bg: #00BFFF30;
                    --wire-PE-stroke: #32CD32; --wire-PE-bg: #32CD3230;
                    --wire-switched-stroke: #36454F; --wire-switched-bg: #36454F30;
                }
            `}</style>
        </div>
    );
    
     const runMeasurement = useCallback(() => {
        if (!probes.L || !probes.PE || !probes.L.targetComponentId || !probes.PE.targetComponentId || !probes.L.targetPointId || !probes.PE.targetPointId) {
            setFlukeDisplay({ primary: "Err", secondary: "Probes" });
            return;
        }

        const point1Key = `${probes.L.targetComponentId}-${probes.L.targetPointId}`;
        const point2Key = `${probes.PE.targetComponentId}-${probes.PE.targetPointId}`;
        
        if (selectedTest === 'V') {
            const isP1Live = circuitState.live.has(point1Key);
            const isP1Neutral = circuitState.neutral.has(point1Key);
            const isP2Live = circuitState.live.has(point2Key);
            const isP2Neutral = circuitState.neutral.has(point2Key);

            let voltage = 0;
            if ((isP1Live && isP2Neutral) || (isP1Neutral && isP2Live)) {
                voltage = 230 + (Math.random() - 0.5) * 5; // 230V +/- 2.5V
            } else if ((isP1Live && isP2Live) || (isP1Neutral && isP2Neutral)) {
                voltage = 0;
            } else {
                voltage = (Math.random() * 2); // Floating voltage
            }
            setFlukeDisplay({ primary: voltage.toFixed(1), secondary: "V AC" });
        } else if (selectedTest === 'R_LO') {
            const powerSource = placedComponents.find(c => c.type === 'power-source');
            if (powerSource?.isOn) {
                setFlukeDisplay({ primary: "Err", secondary: "LIVE" });
                return;
            }
             const p1Node = circuitState.pointMap.get(point1Key);
             const p2Node = circuitState.pointMap.get(point2Key);

             if (p1Node === undefined || p2Node === undefined) {
                 setFlukeDisplay({ primary: "OL", secondary: "Ω" });
                 return;
             }
             // Simplified: Check if points are connected through PE network for low resistance
             const pePoints = circuitState.pe;
             const areConnected = pePoints.has(point1Key) && pePoints.has(point2Key);
             
             const resistance = areConnected ? 0.2 + Math.random() * 0.3 : 9999999;
             setFlukeDisplay({ primary: resistance > 10000 ? 'OL' : resistance.toFixed(2), secondary: "Ω" });
        }

    }, [probes, circuitState, selectedTest, placedComponents]);

    const handleConfirmDiagnosis = () => {
        if (!userDiagnosis || !fault) return;
        
        let isCorrect = false;
        if (userDiagnosis.type === 'component' && fault.faultType === 'component' && userDiagnosis.id === fault.faultyComponentId) {
            isCorrect = true;
        } else if (userDiagnosis.type === 'wire' && fault.faultType === 'wire' && userDiagnosis.id === fault.faultyWireId) {
            isCorrect = true;
        }
        setDiagnosisResult(isCorrect ? 'correct' : 'incorrect');
        if(isCorrect) onExit(true);
    };

    const renderControlPanelContent = () => {
        switch (phase) {
            case 'planen':
                return (
                    <div className="flex flex-col gap-4 flex-grow">
                        <div className="grid grid-cols-3 gap-2">
                            {PALETTE_COMPONENTS.map(comp => (
                                <div key={comp.type} draggable onDragStart={e => handleComponentDragStart(e, comp)} onDragEnd={handleComponentDragEnd} className="bg-slate-700 p-2 rounded-md flex flex-col items-center text-center hover:bg-slate-600 transition cursor-grab active:cursor-grabbing">
                                    <div className="w-8 h-8">{getComponentIcon({type: comp.type} as PlacedComponent, poweredLights)}</div>
                                    <span className="text-xs font-semibold mt-1">{comp.name}</span>
                                </div>
                            ))}
                        </div>
                        {draggingComponent && (
                             <div 
                                id="trash-can" 
                                onDragOver={(e) => {e.preventDefault(); setIsTrashCanActive(true);}} 
                                onDragLeave={() => setIsTrashCanActive(false)} 
                                onDrop={handleTrashDrop} 
                                className={`mt-auto p-4 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition-colors ${isTrashCanActive ? 'border-red-500 bg-red-500/20 text-red-300' : 'border-slate-600 text-slate-400'}`}
                            >
                                <Trash2 className="h-6 w-6"/>
                                <span>Zum Löschen hier ablegen</span>
                            </div>
                        )}
                    </div>
                );
            case 'verdrahten':
                return <WirePalette />;
            case 'messen':
                return <FlukeTester 
                            selectedTest={selectedTest} 
                            onTestSelect={setSelectedTest} 
                            onRunTest={runMeasurement} 
                            display={flukeDisplay}
                            onProbeDragStart={setDraggingProbe}
                        />;
            case 'diagnose':
                return (
                    <div className="flex flex-col gap-4 flex-grow text-center items-center justify-center">
                        <Search className="h-16 w-16 text-blue-400" />
                        <h4 className="text-lg font-bold">Fehlerdiagnose</h4>
                        <p className="text-slate-300 text-sm">Klicken Sie auf das Bauteil oder die Ader, das/die Ihrer Meinung nach defekt ist.</p>
                        {userDiagnosis && (
                            <div className="w-full mt-4">
                                <p className="text-slate-400 text-xs">Ihre Auswahl:</p>
                                <p className="font-bold text-white bg-slate-700 p-2 rounded-md break-all">{userDiagnosis.id}</p>
                                <button onClick={handleConfirmDiagnosis} className="mt-4 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 mr-2"/> Diagnose bestätigen
                                </button>
                            </div>
                        )}
                        {diagnosisResult && (
                             <div className={`w-full mt-4 p-3 rounded-lg text-white font-bold ${diagnosisResult === 'correct' ? 'bg-green-500' : 'bg-red-500'}`}>
                                {diagnosisResult === 'correct' ? 'Korrekt! Fehler gefunden.' : 'Leider Falsch. Versuchen Sie es erneut.'}
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    }

    const getProbePosition = (probe: Probe) => {
        const p = probes[probe];
        if (!p || !p.targetComponentId || !p.targetPointId || !boardRef.current) return null;

        const comp = placedComponents.find(c => c.id === p.targetComponentId);
        if (!comp) return null;
        const point = comp.connectionPoints.find(pt => pt.id === p.targetPointId);
        if (!point) return null;
        
        const boardWidth = boardRef.current.clientWidth;
        const boardHeight = boardRef.current.clientHeight;

        const x = (comp.x/100 * boardWidth) + (point.x - 50) / 100 * COMPONENT_SIZE_PX;
        const y = (comp.y/100 * boardHeight) + (point.y - 50) / 100 * COMPONENT_SIZE_PX;

        return { x, y };
    };

    if (mode === 'troubleshooting' && faultGenStatus !== 'success') {
        return (
            <div className="dt-container flex-col items-center justify-center">
                {faultGenStatus === 'loading' && (
                    <>
                        <Loader2 className="h-16 w-16 animate-spin text-blue-400 mb-4" />
                        <h3 className="text-2xl font-bold">Generiere KI-Fehlerszenario...</h3>
                    </>
                )}
                {faultGenStatus === 'error' && (
                    <>
                         <AlertTriangle className="h-16 w-16 text-red-400 mb-4" />
                        <h3 className="text-2xl font-bold">Fehler bei der Generierung</h3>
                        <p className="text-slate-400">Das KI-Szenario konnte nicht geladen werden.</p>
                    </>
                )}
            </div>
        );
    }
    
    return (
        <div className="dt-container">
            <div className="dt-control-panel">
                 <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Digitaler Zwilling</h3>
                    <p className="font-semibold text-blue-300 capitalize">{mode}</p>
                </div>

                <div className="dt-phase-switcher">
                    <button onClick={() => setPhase('planen')} className={phase === 'planen' ? 'active' : ''} disabled={mode === 'troubleshooting'}><Package className="h-4 w-4" /> Planen</button>
                    <button onClick={() => setPhase('verdrahten')} className={phase === 'verdrahten' ? 'active' : ''} disabled={mode === 'troubleshooting'}><Wrench className="h-4 w-4" /> Verdrahten</button>
                    <button onClick={() => setPhase('messen')} className={phase === 'messen' ? 'active' : ''}><Beaker className="h-4 w-4" /> Messen</button>
                    {mode === 'troubleshooting' && <button onClick={() => setPhase('diagnose')} className={phase === 'diagnose' ? 'active' : ''}><Search className="h-4 w-4" /> Diagnose</button>}
                </div>

                <div className="bg-slate-800/50 p-3 rounded-lg flex-grow flex flex-col">
                    {mode === 'exam' && currentTask ? (
                         <div className="flex-grow flex flex-col">
                             <h4 className="font-bold mb-2 text-blue-300">Prüfungsaufgabe</h4>
                            <p className="text-sm mb-4 flex-grow">{currentTask?.description}</p>
                            {feedback && (
                                <div className="bg-slate-900/70 p-3 rounded-md mt-auto space-y-2 text-sm overflow-y-auto max-h-48">
                                    <h5 className="font-bold flex items-center gap-2">
                                        {feedback.isCorrect ? <CheckCircle className="text-green-400"/> : <XCircle className="text-red-400"/>} KI-Bewertung
                                    </h5>
                                    <p>{feedback.feedbackSummary}</p>
                                </div>
                            )}
                            <button onClick={handleSubmitForReview} disabled={isEvaluating} className="mt-4 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center disabled:bg-slate-500">
                                {isEvaluating ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <BrainCircuit className="h-5 w-5 mr-2" />}
                                {isEvaluating ? 'Bewerte...' : 'Zur Bewertung einreichen'}
                            </button>
                         </div>
                    ) : mode === 'troubleshooting' && fault ? (
                        <div className="flex-grow flex flex-col">
                             <h4 className="font-bold mb-2 text-red-400">Fehlersuche</h4>
                             <p className="text-sm mb-4 flex-grow">Ein Fehler wurde in der Anlage versteckt. Nutzen Sie die Mess- und Diagnose-Phasen, um das Problem zu finden.</p>
                             <div className="bg-slate-900/70 p-3 rounded-md mt-auto space-y-2 text-sm">
                                <h5 className="font-bold flex items-center gap-2">
                                    <HelpCircle className="text-yellow-400"/> Aufgabe
                                </h5>
                                <p>Identifizieren Sie die exakte Fehlerursache.</p>
                                {diagnosisResult === 'correct' && <p className="font-bold text-green-400">Fehlerbeschreibung: {fault.description}</p>}
                             </div>
                        </div>
                    ) : (
                        renderControlPanelContent()
                    )}
                </div>
            </div>

            <div className="dt-workspace">
                <div ref={boardRef} className="dt-exam-board" onDrop={handleDropOnBoard} onDragOver={handleDragOver}>
                    {/* SVG layer for wires and probe lines */}
                    <svg width="100%" height="100%" className="absolute top-0 left-0 z-[5]">
                        {/* Wires */}
                        {wires.map(wire => {
                            const startComp = placedComponents.find(c => c.id === wire.startComponentId);
                            const endComp = placedComponents.find(c => c.id === wire.endComponentId);
                            if (!startComp || !endComp) return null;
                            const startPoint = startComp.connectionPoints.find(p => p.id === wire.startPointId);
                            const endPoint = endComp.connectionPoints.find(p => p.id === wire.endPointId);
                            if (!startPoint || !endPoint || !boardRef.current) return null;

                            const x1 = startComp.x + (startPoint.x - 50) / 100 * (COMPONENT_SIZE_PX / boardRef.current.clientWidth * 100);
                            const y1 = startComp.y + (startPoint.y - 50) / 100 * (COMPONENT_SIZE_PX / boardRef.current.clientHeight * 100);
                            const x2 = endComp.x + (endPoint.x - 50) / 100 * (COMPONENT_SIZE_PX / boardRef.current.clientWidth * 100);
                            const y2 = endComp.y + (endPoint.y - 50) / 100 * (COMPONENT_SIZE_PX / boardRef.current.clientHeight * 100);
                            
                            const isWireSelectedForDiagnosis = phase === 'diagnose' && userDiagnosis?.type === 'wire' && userDiagnosis.id === wire.id;

                            return (
                                <g key={wire.id} onClick={() => phase === 'diagnose' && setUserDiagnosis({type: 'wire', id: wire.id})} className="cursor-pointer">
                                    <line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} className="dt-wire" stroke="transparent" strokeWidth="12" />
                                    <line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} className={`dt-wire dt-wire-${wire.color} ${isWireSelectedForDiagnosis ? 'stroke-[6px] stroke-red-500' : ''}`} />
                                </g>
                            )
                        })}
                        {/* Probe Lines */}
                        {(['L', 'N', 'PE'] as Probe[]).map(probeType => {
                            const pos = getProbePosition(probeType);
                            if (!pos || !boardRef.current) return null;
                            const boardRect = boardRef.current.getBoundingClientRect();
                            return (
                                <line 
                                    key={probeType}
                                    x1={pos.x} y1={pos.y} 
                                    x2={boardRect.width + 20} y2={boardRect.height / 2}
                                    className={`dt-test-probe-line dt-test-probe-line-${probeType}`}
                                    strokeDasharray="5,5"
                                />
                            )
                        })}
                    </svg>

                    {/* Placed components */}
                    {placedComponents.map(comp => {
                       const isSelectedForDiagnosis = phase === 'diagnose' && userDiagnosis?.type === 'component' && userDiagnosis.id === comp.id;
                       return (
                       <div
                         key={comp.id}
                         draggable={phase === 'planen'}
                         onDragStart={e => handleComponentDragStart(e, comp)}
                         onDragEnd={handleComponentDragEnd}
                         onClick={() => handleComponentClick(comp.id)}
                         className={`dt-placed-component ${getFeedbackClass(comp.id)} ${currentWireStart?.compId === comp.id ? 'wiring-active' : ''} ${isSelectedForDiagnosis ? 'ring-4 ring-red-500' : ''}`}
                         style={{ 
                             top: `${comp.y}%`, left: `${comp.x}%`, 
                             width: `${COMPONENT_SIZE_PX}px`, height: `${COMPONENT_SIZE_PX}px`,
                             transform: `translate(-50%, -50%)`
                         }}
                         title={comp.name}
                        >
                           {getComponentIcon(comp, poweredLights)}
                           {(phase === 'verdrahten' || phase === 'messen') && comp.connectionPoints.map(point => (
                               <div 
                                 key={point.id} 
                                 onClick={(e) => { e.stopPropagation(); handlePointClick(comp.id, point.id); }}
                                 className={`dt-connection-point ${currentWireStart?.compId === comp.id && currentWireStart?.pointId === point.id ? 'bg-yellow-400 scale-150 ring-2 ring-white' : ''}`}
                                 style={{ top: `${point.y}%`, left: `${point.x}%` }}
                                 title={`${comp.name} - ${point.id}`}
                                />
                           ))}
                       </div>
                   )})}
                </div>
            </div>
        </div>
    );
};

export default DigitalTwinSim;