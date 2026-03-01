
import React, { useState, useEffect } from 'react';

export const SplitModal: React.FC<{ 
    isOpen: boolean; 
    max: number; 
    onConfirm: (count: number) => void; 
    onCancel: () => void 
}> = ({ isOpen, max, onConfirm, onCancel }) => {
    const [val, setVal] = useState(Math.floor(max / 2) || 1);
    useEffect(() => {
        if(isOpen) setVal(Math.floor(max / 2) || 1);
    }, [isOpen, max]);
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#111] border border-white/20 p-6 rounded-xl w-64 shadow-2xl animate-in zoom-in-95">
                <h3 className="text-white font-tech uppercase mb-4 text-center">Split Stack</h3>
                <div className="flex items-center justify-center gap-4 mb-4">
                     <button onClick={() => setVal(Math.max(1, val - 1))} className="p-2 bg-white/5 hover:bg-white/10 rounded text-white">-</button>
                     <input 
                        type="number" 
                        value={val} 
                        onChange={(e) => setVal(Math.min(max, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-16 bg-black border border-white/20 text-center text-white rounded p-1"
                     />
                     <button onClick={() => setVal(Math.min(max, val + 1))} className="p-2 bg-white/5 hover:bg-white/10 rounded text-white">+</button>
                </div>
                <div className="text-center text-xs text-gray-500 mb-4">Max: {max}</div>
                <div className="flex gap-2">
                    <button onClick={onCancel} className="flex-1 py-2 bg-red-900/50 hover:bg-red-800 text-red-200 rounded text-xs uppercase">Cancel</button>
                    <button onClick={() => onConfirm(val)} className="flex-1 py-2 bg-cyan-900/50 hover:bg-cyan-800 text-cyan-200 rounded text-xs uppercase">Confirm</button>
                </div>
            </div>
        </div>
    );
};
