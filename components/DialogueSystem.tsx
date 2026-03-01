
import React, { useState } from 'react';
import { useGameSelector, dispatchGame } from '../context/GameContext';
import { GameState } from '../types';
import { MessageSquare, X, ShoppingBag, User, Bug, Check, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { WORLD_ASSETS } from '../constants';

export const DialogueSystem: React.FC = () => {
    const gameState = useGameSelector(state => state.gameState);
    const activeNpcId = useGameSelector(state => state.activeNpcId);
    const npcs = useGameSelector(state => state.npcs);
    const stats = useGameSelector(state => state.stats);
    const enemies = useGameSelector(state => state.enemies);
    const containers = useGameSelector(state => state.containers);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);
    
    if (gameState !== GameState.DIALOGUE && gameState !== GameState.TRADE) return null;

    const npc = npcs.find(n => n.id === activeNpcId);
    
    if (!npc) {
        dispatchGame({ type: 'CLOSE_UI' });
        return null;
    }

    const isTrade = gameState === GameState.TRADE;
    const isGemini = npc.role === 'DEBUGGER';

    const handleVisualScan = async () => {
        setIsScanning(true);
        setScanResult(null);

        try {
            // 1. Capture Game State for Analysis
            const gameStateSnapshot = {
                playerPos: stats.position,
                entities: enemies.length + npcs.length,
                containers: containers.length,
                fps: 60, // Mock, would act. come from performance monitor
                worldAssets: WORLD_ASSETS.length, // Real asset count
            };

            const prompt = `
            ACT AS A GAME ENGINE DEBUGGER (Gemini 2.5 Pro).
            
            Analyze the following game state snapshot for potential visual glitches or logic errors.
            Simulate a visual analysis report.
            
            STATE: ${JSON.stringify(gameStateSnapshot)}
            
            Check for:
            1. Player out of bounds (Y < 0).
            2. Entity density issues.
            3. Asset collision risks based on position X:${gameStateSnapshot.playerPos.x.toFixed(1)} Z:${gameStateSnapshot.playerPos.z.toFixed(1)}.
            
            Response should be a short, technical report dialogue from the drone.
            `;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });

            if (response.text) {
                setScanResult(response.text);
            }
        } catch (e) {
            setScanResult("ERROR: Uplink to Neural Core failed. Manual debugging required.");
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-end justify-center pb-24 pointer-events-auto bg-black/20 backdrop-blur-[2px]">
            {/* Dialogue Box */}
            <div className={`w-[800px] bg-[#09090b]/95 border ${isGemini ? 'border-purple-500/50' : 'border-white/10'} rounded-2xl p-8 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 relative overflow-hidden`}>
                
                {/* Decorative Elements */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isGemini ? 'from-purple-500 via-blue-500 to-transparent' : 'from-cyan-500 to-transparent'} opacity-50`} />
                <div className={`absolute -left-10 -bottom-10 w-32 h-32 ${isGemini ? 'bg-purple-500/10' : 'bg-cyan-500/10'} blur-3xl rounded-full`} />

                {/* Close Button */}
                <button 
                    onClick={() => dispatchGame({ type: 'CLOSE_UI' })}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
                >
                    <X size={20} />
                </button>

                <div className="flex gap-6 relative z-10">
                    {/* NPC Avatar */}
                    <div className="flex flex-col items-center gap-2">
                        <div className={`w-20 h-20 bg-gradient-to-br from-gray-800 to-black rounded-2xl border ${isGemini ? 'border-purple-500/30' : 'border-white/10'} flex items-center justify-center shadow-lg`}>
                            {isGemini ? <Bug size={32} className="text-purple-400" /> : <User size={32} className="text-gray-400" />}
                        </div>
                        <div className={`text-[10px] bg-white/5 px-2 py-0.5 rounded ${isGemini ? 'text-purple-400' : 'text-gray-400'} uppercase tracking-wider font-bold`}>
                            {isGemini ? 'SYSTEM AI' : `Level ${Math.floor(Math.random() * 10) + 1}`}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between min-h-[140px]">
                        <div>
                            <h2 className="text-2xl font-tech text-white uppercase tracking-widest leading-none mb-1">{npc.name}</h2>
                            <div className={`text-xs uppercase tracking-[0.2em] font-bold mb-4 ${isGemini ? 'text-purple-400' : 'text-cyan-500'}`}>{npc.personality || 'Wanderer'}</div>
                            
                            {isTrade ? (
                                <div className="p-4 bg-black/40 border border-white/5 rounded-lg text-gray-400 italic text-sm">
                                    "Trade network currently offline. Check inventory space availability."
                                </div>
                            ) : (
                                <div className="text-lg text-gray-200 leading-relaxed font-light font-tech">
                                    {scanResult ? (
                                        <div className="text-purple-300 animate-in fade-in">
                                            <span className="font-bold text-xs bg-purple-900/30 px-2 py-1 rounded mr-2 uppercase">Analysis Report</span>
                                            {scanResult}
                                        </div>
                                    ) : (
                                        `"${npc.dialogue}"`
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-6 justify-end">
                            {!isTrade && isGemini && (
                                <button 
                                    onClick={handleVisualScan}
                                    disabled={isScanning}
                                    className="px-6 py-2 bg-purple-900/20 hover:bg-purple-900/40 text-purple-400 border border-purple-500/30 rounded text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isScanning ? <RefreshCw size={16} className="animate-spin"/> : <Bug size={16} />} 
                                    {isScanning ? 'Analyzing...' : 'Run Visual Diagnostics'}
                                </button>
                            )}

                            {!isTrade && !isGemini && (npc.role?.includes('TRADER') || npc.shopInventory) && (
                                <button 
                                    onClick={() => dispatchGame({ type: 'SET_STATE', payload: GameState.TRADE })}
                                    className="px-6 py-2 bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 rounded text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                                >
                                    <ShoppingBag size={16} /> Trade
                                </button>
                            )}

                             <button 
                                onClick={() => dispatchGame({ type: 'CLOSE_UI' })}
                                className="px-8 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-sm font-bold uppercase tracking-wider transition-all border border-white/5 hover:border-white/20"
                            >
                                {isTrade ? 'Back' : 'Leave'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
