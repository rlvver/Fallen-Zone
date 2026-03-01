
import React, { useState } from 'react';
import { Pickaxe, Shield, Disc, Swords, Package, Flag, X, Power, Users, Star, Cpu, Handshake, Settings, Lock } from 'lucide-react';

export const GuildInfoModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    guildName: string;
    factionColor: string;
}> = ({ isOpen, onClose, guildName, factionColor }) => {
    const [tab, setTab] = useState<'members' | 'tech' | 'alliances' | 'settings'>('members');
    if (!isOpen) return null;

    // Mock Data
    const members = Array.from({length: 12}).map((_, i) => ({
        id: i,
        name: i === 0 ? 'Player (You)' : `Unit-${Math.floor(Math.random()*900)+100}`,
        role: i === 0 ? 'Guild Master' : (i < 3 ? 'Officer' : 'Member'),
        level: Math.floor(Math.random() * 50) + 1,
        status: i === 0 || Math.random() > 0.5 ? 'Online' : 'Offline'
    }));

    const techs = [
        { name: 'Resource Yield I', level: 5, max: 10, icon: <Pickaxe size={16} /> },
        { name: 'Base Defense II', level: 3, max: 5, icon: <Shield size={16} /> },
        { name: 'Trade Efficiency', level: 1, max: 5, icon: <Disc size={16} /> },
        { name: 'Combat Training', level: 4, max: 10, icon: <Swords size={16} /> },
        { name: 'Logistics Net', level: 2, max: 5, icon: <Package size={16} /> },
        { name: 'Influence Amp', level: 1, max: 3, icon: <Flag size={16} /> },
    ];

    const alliances = [
        { name: 'Iron Legion', status: 'Ally', power: '2.4M' },
        { name: 'Crimson Dawn', status: 'War', power: '5.1M' },
        { name: 'The Traders', status: 'NAP', power: '1.2M' },
    ];

    return (
        <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="w-[900px] h-[600px] bg-[#09090b] border border-white/10 rounded-2xl flex flex-col overflow-hidden relative shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 relative">
                    <div>
                        <div className="flex items-center gap-4">
                            <h2 className="text-4xl font-tech font-bold uppercase tracking-widest leading-none text-white">{guildName || 'NO GUILD'}</h2>
                            <span className="bg-white/10 text-white/70 text-[10px] font-bold px-2 py-0.5 rounded border border-white/10 tracking-widest">LVL 12</span>
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
                            <span style={{ color: factionColor }}>Aligned Faction</span> • Command Center
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} className="text-gray-400 hover:text-white" /></button>
                </div>

                {/* Content Body */}
                <div className="flex-1 flex p-6 gap-6 overflow-hidden bg-[#0c0c0e]">
                    
                    {/* Left Column: Overview Stats */}
                    <div className="w-1/3 flex flex-col gap-4">
                        {/* Guild Logo & Influence */}
                        <div className="bg-black/40 p-5 rounded-xl border border-white/5 shadow-lg flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-black to-gray-900 rounded-full border-2 border-white/10 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                <Shield size={48} style={{ color: factionColor }} />
                            </div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Faction Influence</div>
                            <div className="flex items-end gap-1 mb-2">
                                <span className="text-3xl font-tech text-white leading-none">4.2%</span>
                                <span className="text-[10px] text-cyan-400 mb-0.5">▲ 0.1%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full" style={{ width: '4.2%', backgroundColor: factionColor }} />
                            </div>
                        </div>

                        {/* General Stats Card */}
                        <div className="bg-black/40 p-5 rounded-xl border border-white/5 flex-1 flex flex-col gap-6 shadow-lg">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-2"><Power size={14} className="text-yellow-400"/> Power</div>
                                    <div className="text-xl text-white font-tech">458K</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-2"><Users size={14} className="text-blue-400"/> Members</div>
                                    <div className="text-xl text-white font-tech">{members.length}/50</div>
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold mb-2 flex items-center gap-2"><Star size={14} className="text-purple-400"/> Weekly Rank</div>
                                <div className="text-sm text-gray-300 font-mono">#4 Regional</div>
                            </div>
                            <div className="mt-auto">
                                <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">Guild Message</div>
                                <div className="text-xs text-gray-400 italic border-l-2 border-white/10 pl-2">"We stand guard at the edge of the world. Requirement: 500k Power."</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Tabs & Content */}
                    <div className="flex-1 bg-black/40 border border-white/5 rounded-xl flex flex-col overflow-hidden shadow-lg">
                        {/* Tab Headers */}
                        <div className="flex border-b border-white/5 bg-white/5">
                            {[
                                { id: 'members', label: 'Members', icon: <Users size={12} /> },
                                { id: 'tech', label: 'Tech', icon: <Cpu size={12} /> },
                                { id: 'alliances', label: 'Allies', icon: <Handshake size={12} /> },
                                { id: 'settings', label: 'Admin', icon: <Settings size={12} /> }
                            ].map(t => (
                                <button 
                                    key={t.id}
                                    onClick={() => setTab(t.id as any)}
                                    className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors relative flex items-center justify-center gap-2 ${tab === t.id ? 'text-white' : 'text-gray-500'}`}
                                >
                                    {t.icon} {t.label}
                                    {tab === t.id && <div className="absolute bottom-0 left-0 w-full h-0.5" style={{ backgroundColor: factionColor }}/>}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                            {tab === 'members' && (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-black/20 sticky top-0 backdrop-blur-sm">
                                        <tr className="text-[9px] text-gray-500 uppercase tracking-wider">
                                            <th className="p-3 border-b border-white/5">Name</th>
                                            <th className="p-3 border-b border-white/5">Role</th>
                                            <th className="p-3 border-b border-white/5">Level</th>
                                            <th className="p-3 text-right border-b border-white/5">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {members.map(m => (
                                            <tr key={m.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                <td className={`p-3 font-tech ${m.id === 0 ? 'text-cyan-400 font-bold' : 'text-gray-300'}`}>{m.name}</td>
                                                <td className="p-3 text-xs text-gray-400 uppercase tracking-wider">{m.role}</td>
                                                <td className="p-3 text-xs font-mono text-yellow-500">{m.level}</td>
                                                <td className="p-3 text-right">
                                                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${m.status === 'Online' ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                                                        {m.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {tab === 'tech' && (
                                <div className="p-6 grid grid-cols-2 gap-4">
                                    {techs.map((tech, i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4 hover:border-cyan-500/30 transition-colors group">
                                            <div className="w-10 h-10 bg-cyan-900/20 rounded-lg flex items-center justify-center text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                                                {tech.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wide">{tech.name}</h4>
                                                    <span className="text-[10px] text-cyan-500 font-mono">{tech.level}/{tech.max}</span>
                                                </div>
                                                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-cyan-500" style={{ width: `${(tech.level / tech.max) * 100}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {tab === 'alliances' && (
                                <div className="p-6 space-y-3">
                                    {alliances.map((ally, i) => (
                                        <div key={i} className="flex items-center justify-between bg-black/40 border border-white/10 p-4 rounded-xl hover:bg-white/5 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-2 rounded-full ${ally.status === 'Ally' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : ally.status === 'War' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-blue-400'}`} />
                                                <span className="font-tech text-lg text-white tracking-wide">{ally.name}</span>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <span className="text-[10px] text-gray-500 font-mono tracking-wider">PWR: {ally.power}</span>
                                                <span className={`text-[9px] font-bold uppercase px-3 py-1 rounded border tracking-widest ${
                                                    ally.status === 'Ally' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 
                                                    ally.status === 'War' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 
                                                    'border-blue-500/30 text-blue-400 bg-blue-500/10'
                                                }`}>
                                                    {ally.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {tab === 'settings' && (
                                <div className="p-6 flex flex-col gap-6">
                                    <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3">
                                        <Lock size={16} className="text-yellow-500 mt-0.5" />
                                        <div>
                                            <h4 className="text-xs font-bold text-yellow-500 uppercase mb-1 tracking-wider">Guild Master Access</h4>
                                            <p className="text-[10px] text-gray-400">Settings restricted to high command. Modifications are logged.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-2 block">Guild Name</label>
                                            <input type="text" value={guildName} disabled className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-gray-400 font-tech tracking-wide focus:border-cyan-500/50 outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-2 block">Public Description</label>
                                            <textarea className="w-full bg-black/40 border border-white/10 rounded p-3 text-xs text-gray-400 h-24 focus:border-cyan-500/50 outline-none resize-none" defaultValue="We are the elite. Join or be conquered." />
                                        </div>
                                        <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                            <span className="text-xs text-gray-300 font-bold uppercase tracking-wider">Recruitment</span>
                                            <div className="flex items-center gap-2">
                                                <button className="px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold uppercase rounded border border-green-500/30">Open</button>
                                                <button className="px-3 py-1 bg-black/40 text-gray-500 text-[10px] font-bold uppercase rounded border border-white/10 hover:bg-white/5">Invite</button>
                                                <button className="px-3 py-1 bg-black/40 text-gray-500 text-[10px] font-bold uppercase rounded border border-white/10 hover:bg-white/5">Closed</button>
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            <button className="w-full py-3 bg-red-900/10 hover:bg-red-900/30 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-[0.2em] rounded transition-colors">Disband Guild</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
