


import React, { DragEvent, useEffect } from 'react';
import { FlukeTestType, FlukeDisplay, Probe } from '../../types';
import { Power } from 'lucide-react';

interface FlukeTesterProps {
    selectedTest: FlukeTestType;
    onTestSelect: (test: FlukeTestType) => void;
    onRunTest: () => void;
    display: FlukeDisplay;
    onProbeDragStart: (probe: Probe) => void;
}

const DIAL_POSITIONS: { [key in FlukeTestType]: number } = {
    'V': 0,
    'R_LO': 45,
    'R_ISO': -45,
    'Z_I': 90,
    'RCD_T': 135,
};

const DIAL_LABELS: { test: FlukeTestType, label: string, angle: number }[] = [
    { test: 'V', label: 'V~', angle: -90 },
    { test: 'R_LO', label: 'Ω LOW', angle: -45 },
    { test: 'R_ISO', label: 'MΩ ISO', angle: -135 },
    { test: 'Z_I', label: 'Z-I', angle: 45 },
    { test: 'RCD_T', label: 'RCD', angle: 135 },
]

const FlukeTester: React.FC<FlukeTesterProps> = ({ selectedTest, onTestSelect, onRunTest, display, onProbeDragStart }) => {
    
    useEffect(() => {
        // Automatically run test when probes are moved and a test is selected.
        // This simulates an auto-ranging multimeter.
        onRunTest();
    }, [display.primary, selectedTest, onRunTest])

    const handleDialClick = (test: FlukeTestType) => {
        onTestSelect(test);
    };

    const handleDragStart = (e: DragEvent, probe: Probe) => {
        e.dataTransfer.effectAllowed = 'move';
        onProbeDragStart(probe);
    };

    const dialRotation = DIAL_POSITIONS[selectedTest];
    
    const getSecondaryDisplay = () => {
        if (display.secondary) return display.secondary;
        switch(selectedTest) {
            case 'V': return 'V AC';
            case 'R_LO': return 'Ω';
            case 'R_ISO': return 'MΩ';
            default: return '';
        }
    }


    return (
        <div className="w-full h-full p-2 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm h-full fluke-tester p-3 flex flex-col gap-3">
                {/* Screen */}
                <div className="fluke-screen flex-grow p-2 flex flex-col justify-between">
                    <div className="text-right text-gray-700 text-sm font-semibold">{getSecondaryDisplay()}</div>
                    <div className="text-right text-5xl font-bold text-gray-800 tracking-tight">{display.primary}</div>
                </div>

                {/* Controls */}
                <div className="flex justify-around items-center">
                    {/* Dial */}
                    <div className="relative fluke-dial-container flex items-center justify-center">
                        {/* Dial Labels */}
                         {DIAL_LABELS.map(({test, label, angle}) => {
                             const rad = angle * (Math.PI / 180);
                             const x = Math.cos(rad) * 60 + 50; // 50 is half of container width
                             const y = Math.sin(rad) * 60 + 50; // 50 is half of container height
                             return (
                                 <div 
                                    key={test} 
                                    className="fluke-dial-label cursor-pointer" 
                                    style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) rotate(${angle+90}deg)`}}
                                    onClick={() => handleDialClick(test)}
                                 >
                                    {label}
                                 </div>
                             )
                         })}
                        <div className="fluke-dial" style={{ transform: `rotate(${dialRotation}deg)` }}></div>
                    </div>

                    <button onClick={onRunTest} className="fluke-test-button">
                        <Power size={32} />
                    </button>

                    {/* Probes */}
                    <div className="flex flex-col gap-2">
                        {(['L', 'PE', 'N'] as Probe[]).map(probeType => (
                            <div 
                                key={probeType} 
                                draggable 
                                onDragStart={(e) => handleDragStart(e, probeType)}
                                className={`fluke-probe-port probe-${probeType.toLowerCase()}`}
                            >
                                {probeType}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlukeTester;
