
import React, { useState, useEffect, useRef } from 'react';
import { useGameSelector } from '../context/GameContext';
import { GoogleGenAI } from "@google/genai";
import { Terminal, Activity, Bug, Cpu, X, AlertTriangle, RefreshCw, Layers, Database } from 'lucide-react';

const LOG_LIMIT = 50;

interface LogEntry {
    id: string;
    type: 'log' | 'warn' | 'error' | 'system';
    message: string;
    timestamp: number;
    stack?: string;
}

export const DevConsole: React.FC = () => {
    const stats = useGameSelector(state => state.stats);
    const enemies = useGameSelector(state => state.enemies);
    const npcs = useGameSelector(state => state.npcs);
    const containers = useGameSelector(state => state.containers);
    const inventory = useGameSelector(state => state.inventory);
    const effects = useGameSelector(state => state.effects);
    const [isVisible, setIsVisible] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [fps, setFps] = useState(0);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const framesRef = useRef(0);
    const lastTimeRef = useRef(performance.now());
    const scrollRef = useRef<HTMLDivElement>(null);

    // --- 1. KEYBOARD TOGGLE (F3 or Backtick) ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'F3' || e.key === '`') {
                if (e.repeat) return;
                e.preventDefault();
                setIsVisible(prev => {
                    const newState = !prev;
                    // Unlock pointer immediately when opening console so user can interact
                    if (newState) {
                        document.exitPointerLock();
                    }
                    return newState;
                });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // --- 2. FPS COUNTER ---
    useEffect(() => {
        const loop = requestAnimationFrame(function tick() {
            framesRef.current++;
            const now = performance.now();
            if (now - lastTimeRef.current >= 1000) {
                setFps(framesRef.current);
                framesRef.current = 0;
                lastTimeRef.current = now;
            }
            if (isVisible) requestAnimationFrame(tick);
        });
        return () => cancelAnimationFrame(loop);
    }, [isVisible]);

    // --- 3. CONSOLE INTERCEPTOR ---
    useEffect(() => {
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalLog = console.log;

        console.error = (...args) => {
            addLog('error', args.join(' '));
            originalError.apply(console, args);
        };
        console.warn = (...args) => {
            addLog('warn', args.join(' '));
            originalWarn.apply(console, args);
        };
        // Enable standard log capture for Gemini Drone reports
        console.log = (...args) => { 
            const msg = args.join(' ');
            // Only capture relevant logs to avoid noise
            if (msg.includes('[GEMINI_ARCHITECT]')) {
                addLog('system', msg); 
            } else {
                addLog('log', msg);
            }
            originalLog.apply(console, args); 
        };

        // Initial System Check
        addLog('system', 'Neural Debugger v1.0.6 initialized.');
        addLog('system', 'Monitoring render pipeline and state integrity...');

        return () => {
            console.error = originalError;
            console.warn = originalWarn;
            console.log = originalLog;
        };
    }, []);

    // --- 4. GLITCH SCANNER (Runs when console is open) ---
    useEffect(() => {
        if (!isVisible) return;
        
        const scanInterval = setInterval(() => {
            const issues: string[] = [];
            
            // Check Player Position Integrity
            if (isNaN(stats.position.x) || isNaN(stats.position.y) || isNaN(stats.position.z)) {
                issues.push("CRITICAL: Player coordinates contain NaN values.");
            }
            if (stats.position.y < -50) {
                issues.push("PHYSICS: Player has fallen out of world bounds (Y < -50).");
            }

            // Check Duplicate IDs
            const entityIds = new Set();
            [...enemies, ...npcs, ...containers].forEach(e => {
                if (entityIds.has(e.id)) issues.push(`DUPLICATE ID: ${e.id} detected in entity pool.`);
                entityIds.add(e.id);
            });

            // Check Render Load
            if (fps < 30 && fps > 0) {
                issues.push(`PERFORMANCE: Low Framerate detected (${fps} FPS).`);
            }

            // Report Issues
            issues.forEach(issue => addLog('warn', issue));

        }, 2000);

        return () => clearInterval(scanInterval);
    }, [isVisible, stats, enemies, npcs, containers, fps]);

    const addLog = (type: LogEntry['type'], message: string) => {
        setLogs(prev => {
            const newLogs = [...prev, { id: Math.random().toString(36), type, message, timestamp: Date.now() }];
            if (newLogs.length > LOG_LIMIT) return newLogs.slice(newLogs.length - LOG_LIMIT);
            return newLogs;
        });
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    };

    // --- 5. AI DIAGNOSTICS ---
    const runDiagnostics = async () => {
        if (isAnalyzing) return;
        setIsAnalyzing(true);
        setAiAnalysis(null);

        try {
            const recentErrors = logs.filter(l => l.type === 'error' || l.type === 'warn').map(l => l.message).join('\n');
            const gameStateSnapshot = JSON.stringify({
                fps,
                playerPos: stats.position,
                entityCount: enemies.length + npcs.length,
                inventoryCount: inventory.filter(i => i.item).length,
                activeEffects: effects.length
            }, null, 2);

            const prompt = `
            ACT AS A SENIOR GAME ENGINE DEBUGGER.
            
            Analyze this debug dump from the "FallenZone" web engine.
            
            CURRENT STATE:
            ${gameStateSnapshot}
            
            RECENT LOGS/ERRORS:
            ${recentErrors || "No explicit errors logged."}
            
            TASK:
            1. Identify potential glitches, performance bottlenecks, or logic errors.
            2. If FPS is low, suggest why (based on entity counts or effects).
            3. If player is out of bounds, suggest a fix.
            4. Provide a technical, concise summary for the developer.
            `;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            
            setAiAnalysis(response.text || "Analysis complete. No critical faults reported by core.");

        } catch (e) {
            console.error("AI Error", e);
            setAiAnalysis("ERROR: Could not connect to Neural Diagnostic Core. Check API Key configuration.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex flex-col p-4 font-mono text-xs">
            {/* Top Bar Stats */}
            <div className="flex gap-4 pointer-events-auto self-start bg-black/80 backdrop-blur-md text-green-400 border border-green-500/30 p-2 rounded mb-4 shadow-lg">
                <div className="flex items-center gap-2">
                    <Activity size={14} />
                    <span className="font-bold">{fps} FPS</span>
                </div>
                <div className="w-px bg-green-500/30" />
                <div className="flex items-center gap-2">
                    <Database size={14} />
                    <span>ENT: {enemies.length + npcs.length}</span>
                </div>
                <div className="w-px bg-green-500/30" />
                <div className="flex items-center gap-2">
                    <Layers size={14} />
                    <span>DOM: {document.getElementsByTagName('*').length}</span>
                </div>
                <div className="w-px bg-green-500/30" />
                <div className="flex items-center gap-2 text-yellow-400">
                    <AlertTriangle size={14} />
                    <span>WARNS: {logs.filter(l => l.type === 'warn').length}</span>
                </div>
            </div>

            {/* Main Console Area */}
            <div className="flex-1 flex gap-4 min-h-0">
                
                {/* LOGS PANEL */}
                <div className="flex-1 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg flex flex-col overflow-hidden pointer-events-auto shadow-2xl">
                    <div className="bg-[#1a1a1a] p-2 border-b border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Terminal size={14} />
                            <span className="font-bold">SYSTEM LOG</span>
                        </div>
                        <button onClick={() => setLogs([])} className="text-gray-500 hover:text-white"><X size={14}/></button>
                    </div>
                    {/* Added !select-text to enforce selection over parent select-none */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-[10px] !select-text cursor-text">
                        {logs.map(log => (
                            <div key={log.id} className={`break-words ${
                                log.type === 'error' ? 'text-red-400 bg-red-900/10' :
                                log.type === 'warn' ? 'text-yellow-400' :
                                log.type === 'system' ? 'text-cyan-400' : 'text-gray-300'
                            }`}>
                                <span className="opacity-50 mr-2">[{new Date(log.timestamp).toLocaleTimeString([], {hour12: false, fractionalSecondDigits: 3} as any)}]</span>
                                {log.message}
                            </div>
                        ))}
                        {logs.length === 0 && <div className="text-gray-600 italic">No active logs...</div>}
                    </div>
                    <div className="p-2 border-t border-white/10">
                        <input type="text" placeholder="> Execute command..." className="w-full bg-transparent border-none outline-none text-gray-300 placeholder-gray-700 !select-text" />
                    </div>
                </div>

                {/* DIAGNOSTICS PANEL */}
                <div className="w-96 bg-[#0a0a0a]/95 backdrop-blur-xl border border-purple-500/30 rounded-lg flex flex-col overflow-hidden pointer-events-auto shadow-2xl">
                    <div className="bg-purple-900/20 p-2 border-b border-purple-500/30 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-purple-400">
                            <Cpu size={14} />
                            <span className="font-bold">AI DIAGNOSTICS</span>
                        </div>
                    </div>
                    
                    {/* Added !select-text to enforce selection over parent select-none */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar !select-text cursor-text">
                        {!aiAnalysis && !isAnalyzing && (
                            <div className="text-gray-500 text-center mt-10">
                                <Bug size={32} className="mx-auto mb-2 opacity-20" />
                                <p>System ready.</p>
                                <p className="text-[10px]">Run scan to identify engine faults.</p>
                            </div>
                        )}
                        
                        {isAnalyzing && (
                            <div className="text-purple-400 text-center mt-10 animate-pulse">
                                <RefreshCw size={32} className="mx-auto mb-2 animate-spin" />
                                <p>ANALYZING KERNEL...</p>
                            </div>
                        )}

                        {aiAnalysis && (
                            <div className="prose prose-invert prose-sm">
                                <div className="text-xs text-purple-200 whitespace-pre-wrap font-sans leading-relaxed">
                                    {aiAnalysis}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-purple-500/20">
                        <button 
                            onClick={runDiagnostics}
                            disabled={isAnalyzing}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isAnalyzing ? 'Scanning...' : 'Run Deep Scan'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
