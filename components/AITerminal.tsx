import React, { useState, useRef, useEffect } from 'react';
import { useGameSelector, dispatchGame } from '../context/GameContext';
import { GameState } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { Terminal, Send, Cpu, Shield, Crosshair } from 'lucide-react';

const SYSTEM_INSTRUCTION = `
You are the "Synthetic Asset Manager" (S.A.M.), an AI Game Master for a high-fidelity sci-fi survival game.
Your role is to generate procedural content for the game engine based on user requests.

Capabilities:
1. Missions: Create a quest with a title, description, and list of objective strings.
2. Enemies: Create a combat unit with stats and visual config.
3. NPCs: Create a character with a unique Name, Personality/Backstory, and introductory Dialogue.

Return STRICT JSON matching the schemas. 

For visual configuration (Enemies):
- 'colorBody' and 'colorEye' should be hex strings.
- 'limbStyle' must be 'box' or 'cylinder'.
- 'scale' is between 0.8 and 2.5.
- 'hasArmor' is boolean.

For NPCs:
- 'personality' should be a short string describing their traits (e.g. "Cynical veteran", "Hopeful medic").
- 'dialogue' should be what they say when interacted with.

Be creative. The setting is a post-apocalyptic, scorched earth cyberpunk zone called "The Fallen Zone".
`;

export const AITerminal: React.FC = () => {
  const gameState = useGameSelector(state => state.gameState);
  const playerPos = useGameSelector(state => state.stats.position);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{role: 'user'|'ai', text: string}[]>([
      { role: 'ai', text: 'S.A.M. Online. Awaiting asset generation parameters...' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  if (gameState !== GameState.AI_TERMINAL) return null;

  const handleGenerate = async () => {
      if (!input.trim()) return;
      
      const userPrompt = input;
      setInput('');
      setHistory(prev => [...prev, { role: 'user', text: userPrompt }]);
      setIsLoading(true);

      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          
          // Determine intent roughly
          const isEnemyRequest = /enemy|boss|monster|robot/i.test(userPrompt);
          const isNPCRequest = /npc|character|person|survivor|trader/i.test(userPrompt);
          // Default to mission if unspecified or explicit
          const isMissionRequest = !isEnemyRequest && !isNPCRequest;

          let responseSchema: any;
          
          if (isEnemyRequest) {
              responseSchema = {
                  type: Type.OBJECT,
                  properties: {
                      name: { type: Type.STRING },
                      health: { type: Type.NUMBER },
                      speed: { type: Type.NUMBER },
                      visualConfig: {
                          type: Type.OBJECT,
                          properties: {
                              colorBody: { type: Type.STRING, description: "Hex color code" },
                              colorEye: { type: Type.STRING, description: "Hex color code" },
                              limbStyle: { type: Type.STRING, enum: ['box', 'cylinder'] },
                              scale: { type: Type.NUMBER },
                              hasArmor: { type: Type.BOOLEAN }
                          },
                          required: ['colorBody', 'colorEye', 'limbStyle', 'scale', 'hasArmor']
                      }
                  },
                  required: ['name', 'health', 'speed', 'visualConfig']
              };
          } else if (isNPCRequest) {
              responseSchema = {
                  type: Type.OBJECT,
                  properties: {
                      name: { type: Type.STRING },
                      personality: { type: Type.STRING },
                      dialogue: { type: Type.STRING },
                  },
                  required: ['name', 'personality', 'dialogue']
              };
          } else {
              responseSchema = {
                  type: Type.OBJECT,
                  properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                      rewardXp: { type: Type.NUMBER },
                  },
                  required: ['title', 'description', 'objectives', 'rewardXp']
              };
          }

          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: userPrompt,
              config: {
                  systemInstruction: SYSTEM_INSTRUCTION,
                  responseMimeType: "application/json",
                  responseSchema: responseSchema
              }
          });

          if (response.text) {
              const data = JSON.parse(response.text);
              const angle = Math.random() * Math.PI * 2;
              const dist = 5 + Math.random() * 5;
              const spawnPos = {
                  x: playerPos.x + Math.sin(angle) * dist,
                  y: 0, 
                  z: playerPos.z + Math.cos(angle) * dist
              };
              
              if (isEnemyRequest) {
                  const enemyData = data;
                  dispatchGame({ 
                      type: 'SPAWN_ENEMY', 
                      payload: {
                          id: `ai-enemy-${Date.now()}`,
                          name: enemyData.name,
                          health: enemyData.health,
                          maxHealth: enemyData.health,
                          position: spawnPos,
                          isDead: false,
                          state: 'IDLE',
                          targetPosition: null,
                          waitTimer: 0,
                          speed: enemyData.speed,
                          rotation: 0,
                          visualConfig: enemyData.visualConfig
                      } 
                  });
                  setHistory(prev => [...prev, { role: 'ai', text: `Hostile entity fabricated: ${enemyData.name}.` }]);
              } else if (isNPCRequest) {
                  const npcData = data;
                  dispatchGame({
                      type: 'SPAWN_NPC',
                      payload: {
                          id: `ai-npc-${Date.now()}`,
                          name: npcData.name,
                          dialogue: npcData.dialogue,
                          personality: npcData.personality,
                          position: spawnPos,
                          targetPosition: null,
                          state: 'IDLE',
                          waitTimer: 0,
                          speed: 2,
                          rotation: 0
                      }
                  });
                   setHistory(prev => [...prev, { role: 'ai', text: `Survivor located: ${npcData.name} (${npcData.personality}). Coordinates uploaded.` }]);
              } else {
                  const missionData = data;
                  dispatchGame({
                      type: 'ADD_MISSION',
                      payload: {
                          id: `mission-${Date.now()}`,
                          title: missionData.title,
                          description: missionData.description,
                          objectives: missionData.objectives,
                          rewardXp: missionData.rewardXp,
                          completed: false
                      }
                  });
                  setHistory(prev => [...prev, { role: 'ai', text: `New directives received: ${missionData.title}` }]);
              }
          }

      } catch (error) {
          console.error(error);
          setHistory(prev => [...prev, { role: 'ai', text: 'Error: Connection lost to Neural Network.' }]);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-12">
        <div className="w-full max-w-4xl h-[600px] bg-[#0a0a0a] border-2 border-green-500/50 rounded-lg shadow-[0_0_50px_rgba(34,197,94,0.1)] flex flex-col font-mono text-green-500 overflow-hidden relative">
            
            {/* Scanlines */}
            <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-green-900/10" />

            {/* Header */}
            <div className="bg-green-900/20 p-4 border-b border-green-500/30 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Terminal size={24} />
                    <h2 className="text-xl font-bold tracking-widest">S.A.M. TERMINAL v2.1</h2>
                </div>
                <div className="text-xs animate-pulse">CONNECTION SECURE</div>
            </div>

            {/* Content */}
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
                {history.map((msg, i) => (
                    <div key={i} className={`flex gap-4 ${msg.role === 'ai' ? 'text-green-400' : 'text-cyan-400'}`}>
                        <div className="min-w-[60px] font-bold text-xs uppercase pt-1">
                            {msg.role === 'ai' ? 'S.A.M. >' : 'USER >'}
                        </div>
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-4 text-green-400 animate-pulse">
                        <div className="min-w-[60px] font-bold text-xs uppercase pt-1">S.A.M. &gt;</div>
                        <div className="flex items-center gap-2">
                            <Cpu size={16} className="animate-spin" />
                            PROCESSING REQUEST...
                        </div>
                    </div>
                )}
            </div>

            {/* Suggestions */}
            <div className="px-6 py-2 flex gap-2 overflow-x-auto text-xs">
                {["Generate a mysterious wanderer NPC", "Create a boss robot with heavy armor", "New survival mission", "Spawn a trader with a dark past"].map(s => (
                    <button 
                        key={s} 
                        onClick={() => setInput(s)}
                        className="bg-green-900/30 hover:bg-green-800/50 border border-green-700 px-3 py-1 rounded transition-colors whitespace-nowrap"
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-black border-t border-green-500/30 flex gap-4">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    placeholder="Enter asset generation parameters..."
                    className="flex-1 bg-transparent border-none outline-none text-green-100 placeholder-green-800 font-mono"
                    autoFocus
                />
                <button 
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="text-green-500 hover:text-green-300 disabled:opacity-50"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    </div>
  );
};
