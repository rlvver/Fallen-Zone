
import React, { useState } from 'react';
import { Faction } from '../../../types';
import { Map as MapIcon, Swords, Users, Trophy, Flag, Globe, Crown, X } from 'lucide-react';

export const FactionInfoModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    faction: Faction; 
    color: string 
}> = ({ isOpen, onClose, faction, color }) => {
  const [tab, setTab] = useState<'power' | 'influence' | 'guilds'>('power');
  if (!isOpen) return null;

  // Mock Data Generators for Faction Modal
  const leaderboards = {
      power: Array.from({length:10}).map((_,i) => ({ rank: i+1, name: `Operative-${Math.floor(Math.random()*9000)+1000}`, val: 10000 - i*500 })),
      influence: Array.from({length:10}).map((_,i) => ({ rank: i+1, name: `Diplomat-${Math.floor(Math.random()*9000)+1000}`, val: 5000 - i*200 })),
      guilds: Array.from({length:10}).map((_,i) => ({ rank: i+1, name: `Unit-${Math.floor(Math.random()*900)+100}`, val: 500000 - i*20000 })),
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="w-[900px] h-[600px] bg-[#09090b] border border-white/10 rounded-2xl flex flex-col overflow-hidden relative shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                    <h2 className="text-4xl font-tech font-bold uppercase tracking-widest leading-none" style={{ color }}>{faction} HEGEMONY</h2>
                    <div className="text-xs text-gray-400 uppercase tracking-[0.3em] mt-1">Faction Overview & Command Interface</div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} className="text-gray-400 hover:text-white" /></button>
            </div>
            
            {/* Content */}
            <div className="flex-1 flex p-6 gap-6 overflow-hidden bg-[#0c0c0e]">
                {/* Left: Stats Column */}
                <div className="w-1/3 flex flex-col gap-4">
                    {/* Control Gauge */}
                    <div className="bg-black/40 p-5 rounded-xl border border-white/5 shadow-lg">
                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-3 flex items-center gap-2"><MapIcon size={14} className="text-cyan-500"/> Territorial Control</div>
                        <div className="flex items-end gap-2 mb-2">
                            <div className="text-5xl font-tech text-white leading-none">68%</div>
                            <div className="text-xs text-green-400 mb-1">▲ 2.4%</div>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-1"><div className="h-full" style={{ width: '68%', backgroundColor: color }}/></div>
                        <div className="text-[9px] text-gray-600 text-right uppercase">Sector Dominance</div>
                    </div>
                    
                    {/* General Stats */}
                    <div className="bg-black/40 p-5 rounded-xl border border-white/5 flex-1 flex flex-col gap-6 shadow-lg">
                        <div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-2 flex items-center gap-2"><Swords size={14} className="text-red-500"/> Active Conflicts</div>
                            <div className="flex flex-col gap-2">
                                <div className="bg-red-500/10 border border-red-500/20 px-3 py-2 rounded">
                                    <div className="text-xs text-red-300 font-bold uppercase">War vs ECLIPSE</div>
                                    <div className="text-[9px] text-red-400/70 uppercase tracking-wider">Frontline: Sector 7</div>
                                </div>
                                <div className="bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 rounded">
                                    <div className="text-xs text-yellow-300 font-bold uppercase">Skirmish vs SYNDICATE</div>
                                    <div className="text-[9px] text-yellow-400/70 uppercase tracking-wider">Trade Route Alpha</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-2"><Users size={14} className="text-blue-400"/> Operatives</div>
                                <div className="text-2xl text-white font-tech">12,458</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-2"><Trophy size={14} className="text-yellow-400"/> Power</div>
                                <div className="text-2xl text-white font-tech">8.5M</div>
                            </div>
                        </div>

                         <div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-2 flex items-center gap-2"><Flag size={14} className="text-purple-400"/> Key Territories</div>
                            <ul className="text-xs text-gray-300 space-y-1.5 pl-1">
                                <li className="flex items-center gap-2"><Globe size={10} className="text-gray-600"/> The Rust Belt</li>
                                <li className="flex items-center gap-2"><Globe size={10} className="text-gray-600"/> Neon Plaza</li>
                                <li className="flex items-center gap-2"><Globe size={10} className="text-gray-600"/> Old Hydro-Dam</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right: Leaderboards */}
                <div className="flex-1 bg-black/40 border border-white/5 rounded-xl flex flex-col overflow-hidden shadow-lg">
                    <div className="flex border-b border-white/5 bg-white/5">
                        <button onClick={() => setTab('power')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors relative ${tab === 'power' ? 'text-white' : 'text-gray-500'}`}>
                            Top Power
                            {tab === 'power' && <div className="absolute bottom-0 left-0 w-full h-0.5" style={{ backgroundColor: color }}/>}
                        </button>
                        <button onClick={() => setTab('influence')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors relative ${tab === 'influence' ? 'text-white' : 'text-gray-500'}`}>
                            Influence
                            {tab === 'influence' && <div className="absolute bottom-0 left-0 w-full h-0.5" style={{ backgroundColor: color }}/>}
                        </button>
                        <button onClick={() => setTab('guilds')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors relative ${tab === 'guilds' ? 'text-white' : 'text-gray-500'}`}>
                            Top Guilds
                            {tab === 'guilds' && <div className="absolute bottom-0 left-0 w-full h-0.5" style={{ backgroundColor: color }}/>}
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-black/20 sticky top-0 backdrop-blur-sm">
                                <tr className="text-[9px] text-gray-500 uppercase tracking-wider">
                                    <th className="p-3 w-16 text-center border-b border-white/5">Rank</th>
                                    <th className="p-3 border-b border-white/5">Name</th>
                                    <th className="p-3 text-right border-b border-white/5">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboards[tab].map((row) => (
                                    <tr key={row.rank} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <td className="p-3 text-center">
                                            {row.rank === 1 ? <Crown size={16} className="mx-auto text-yellow-400" /> : 
                                             row.rank === 2 ? <span className="text-gray-300 font-bold text-sm">2nd</span> :
                                             row.rank === 3 ? <span className="text-orange-400 font-bold text-sm">3rd</span> :
                                             <span className="text-gray-600 font-mono text-xs">#{row.rank}</span>}
                                        </td>
                                        <td className={`p-3 text-sm font-tech tracking-wide ${row.rank === 1 ? 'text-yellow-100 font-bold' : 'text-gray-300'}`}>{row.name}</td>
                                        <td className="p-3 text-right font-mono text-cyan-400 text-xs">{row.val.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
};
