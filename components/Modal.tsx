import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="glass-card no-hover rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col border-2 border-slate-600"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-700 shrink-0">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white rounded-full p-1">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
