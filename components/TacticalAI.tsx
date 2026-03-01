
import React, { useState, useEffect, useRef } from 'react';
import { useGameSelector, dispatchGame } from '../context/GameContext';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Mic, Send, Bot, Radio, X } from 'lucide-react';

export const TacticalAI: React.FC = () => {
  const gameState = useGameSelector(state => state.gameState);
  const stats = useGameSelector(state => state.stats);
  const equipment = useGameSelector(state => state.equipment);
  const inventory = useGameSelector(state => state.inventory);
  const activeMissions = useGameSelector(state => state.activeMissions);
  const worldAssets = useGameSelector(state => state.worldAssets);
  const npcs = useGameSelector(state => state.npcs);
  const enemies = useGameSelector(state => state.enemies);
  const showAiAssistant = useGameSelector(state => state.showAiAssistant);
  const selectedWeaponSlot = useGameSelector(state => state.selectedWeaponSlot);
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Ref to hold the Chat session to maintain history context
  const chatSession = useRef<Chat | null>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showAiAssistant]);

  // Initial Greeting or Context Reset
  useEffect(() => {
      if (showAiAssistant && messages.length === 0) {
          setMessages([{ role: 'ai', text: 'Tactical link established. S.A.M. online. Systems nominal. Awaiting orders, Operative.' }]);
      }
  }, [showAiAssistant]);

  // Input Focus when opened
  useEffect(() => {
      if(showAiAssistant) {
          document.getElementById('ai-input')?.focus();
      }
  }, [showAiAssistant]);

  if (!showAiAssistant) return null;

  const getSystemContext = () => {
      const equipped = equipment[selectedWeaponSlot];
      const weaponName = equipped ? equipped.name : 'Unarmed';
      const ammo = equipped?.currentAmmo !== undefined ? equipped.currentAmmo : '-';
      const nearEnemies = enemies.filter(e => !e.isDead).length;
      
      return `
      CONTEXT:
      You are S.A.M. (Synthetic Asset Manager), an advanced military AI embedded in the player's combat suit.
      Setting: "Fallen Zone", a dangerous post-apocalyptic cyberpunk world.
      
      CURRENT STATUS:
      - Operative: ${stats.name} (${stats.faction})
      - Health: ${stats.health}/${stats.maxHealth}
      - Weapon: ${weaponName} (Ammo: ${ammo})
      - Location: X:${Math.round(stats.position.x)}, Z:${Math.round(stats.position.z)}
      - Nearby Hostiles Detected: ${nearEnemies}
      
      INSTRUCTIONS:
      - Respond briefly and tactically (military style).
      - Advise on survival based on Health/Hunger.
      - If health is low (<30%), be urgent.
      - Do NOT break character. You are the suit's AI.
      `;
  };

  const handleSend = async () => {
      if (!input.trim() || isProcessing) return;
      
      const userText = input;
      setInput('');
      setMessages(prev => [...prev, { role: 'user', text: userText }]);
      setIsProcessing(true);

      try {
          // Initialize AI if needed
          if (!chatSession.current) {
              const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
              chatSession.current = ai.chats.create({
                  model: 'gemini-3-flash-preview',
                  config: {
                      systemInstruction: getSystemContext(), // Initial context
                  }
              });
          }

          // We send a hidden context update with the user's message to keep the AI updated on game state
          // This is a "trick" to inject real-time data without the user typing it
          const contextUpdate = `[SYSTEM UPDATE: Health ${stats.health}, Weapon: ${equipment[selectedWeaponSlot]?.name || 'None'}]`;
          const fullMessage = `${contextUpdate} USER SAYS: ${userText}`;

          const response: GenerateContentResponse = await chatSession.current.sendMessage({ message: fullMessage });
          
          if (response.text) {
              setMessages(prev => [...prev, { role: 'ai', text: response.text || "Connection interrupted." }]);
          }

      } catch (error) {
          console.error("AI Error:", error);
          setMessages(prev => [...prev, { role: 'ai', text: "ERROR: Uplink unstable. Packet loss detected." }]);
      } finally {
          setIsProcessing(false);
          // Keep focus
          setTimeout(() => document.getElementById('ai-input')?.focus(), 10);
      }
  };

  return (
    <div className="absolute right-8 top-24 w-80 h-[400px] flex flex-col z-40 animate-in slide-in-from-right-10 fade-in duration-300 pointer-events-auto">
        {/* HUD Frame */}
        <div className="flex-1 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-t-lg overflow-hidden flex flex-col relative shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            
            {/* Header */}
            <div className="bg-cyan-900/20 p-2 border-b border-cyan-500/30 flex justify-between items-center">
                <div className="flex items-center gap-2 text-cyan-400">
                    <Radio size={16} className="animate-pulse" />
                    <span className="text-xs font-tech font-bold tracking-widest">TAC-LINK // S.A.M.</span>
                </div>
                <button onClick={() => dispatchGame({type: 'TOGGLE_AI_ASSISTANT'})} className="text-cyan-500 hover:text-white transition-colors">
                    <X size={14} />
                </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[90%] text-[10px] uppercase font-bold mb-0.5 ${msg.role === 'user' ? 'text-gray-500' : 'text-cyan-600'}`}>
                            {msg.role === 'user' ? 'OPERATIVE' : 'AI SYSTEM'}
                        </div>
                        <div className={`p-2 rounded text-xs font-mono leading-relaxed border ${
                            msg.role === 'user' 
                            ? 'bg-white/10 border-white/20 text-gray-200 rounded-tr-none' 
                            : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-100 rounded-tl-none shadow-[0_0_10px_rgba(8,145,178,0.1)]'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isProcessing && (
                    <div className="flex items-start">
                        <div className="text-cyan-600 text-[10px] font-bold mb-0.5">AI SYSTEM</div>
                        <div className="ml-2 flex gap-1 mt-2">
                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Input Area */}
        <div className="bg-black/80 border border-t-0 border-cyan-500/30 rounded-b-lg p-2 flex gap-2">
            <input 
                id="ai-input"
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Transmit orders..."
                className="flex-1 bg-transparent border border-white/10 rounded px-2 py-1 text-xs text-white font-mono focus:border-cyan-500/50 outline-none placeholder-gray-600"
                autoComplete="off"
            />
            <button 
                onClick={handleSend}
                disabled={isProcessing}
                className="p-2 bg-cyan-900/30 text-cyan-400 rounded hover:bg-cyan-800/50 transition-colors disabled:opacity-50"
            >
                <Send size={14} />
            </button>
        </div>
    </div>
  );
};
