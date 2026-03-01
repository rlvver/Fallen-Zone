
import React, { useState, useEffect, useRef } from 'react';
import { useGameSelector } from '../context/GameContext';
import { GameState, ItemType, Item, Rarity } from '../types';
import { Activity, Zap, AlertTriangle, Disc, Target, Shield, Sword, Box, Terminal, FileText, Crosshair, Flashlight } from 'lucide-react';
import { DetailedItemIcon } from './Inventory/visuals/ItemIcon';

const StatBar: React.FC<{ value: number; max: number; color: string; icon?: React.ReactNode; danger?: boolean }> = ({ value, max, color, icon, danger }) => {
  const percent = (value / max) * 100;
  return (
    <div className={`flex items-center gap-3 ${danger && value < 20 ? 'animate-pulse text-red-500' : 'text-gray-400'}`}>
      {icon}
      <div className="w-32 h-1.5 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm">
        <div 
          className={`h-full ${color} transition-all duration-300 shadow-[0_0_10px_currentColor]`} 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const HUDItemIcon: React.FC<{ iconName: string; color: string; size?: number }> = ({ iconName, color, size=24 }) => {
    // Simple mapping for icons, could be expanded to use the SVG components from Inventory if exported
    return <div style={{ color, fontSize: size }} className="drop-shadow-[0_0_5px_currentColor] font-tech font-bold leading-none">•</div>;
};

// Reusable Slot Component for HUD
const HUDSlot: React.FC<{ 
    label: string; 
    item: Item | null; 
    isActive?: boolean; 
    count?: number; 
    type: 'weapon' | 'utility';
    cooldownPercent?: number;
}> = ({ label, item, isActive, count, type, cooldownPercent }) => {
    return (
        <div 
            className={`
                relative flex items-center justify-center border transition-all duration-200 backdrop-blur-md shadow-lg overflow-hidden
                ${type === 'weapon' ? 'w-16 h-16 rounded-xl' : 'w-12 h-12 rounded-lg'}
                ${isActive 
                    ? 'border-cyan-400 bg-white/10 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-105 z-10' 
                    : 'border-white/10 bg-black/40 hover:border-white/30'}
                ${item ? 'shadow-cyan-900/10' : ''}
            `}
            style={item ? { borderColor: isActive ? undefined : item.rarity, boxShadow: isActive ? undefined : `inset 0 0 10px ${item.rarity}20` } : {}}
        >
            {/* Cooldown Overlay */}
            {cooldownPercent !== undefined && cooldownPercent > 0 && (
                <div className="absolute inset-0 z-20 bg-black/60 flex items-end">
                    <div className="w-full bg-red-500/40" style={{ height: `${cooldownPercent}%`, transition: 'height 0.1s linear' }}></div>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                        {Math.ceil((cooldownPercent / 100) * 7).toFixed(1)}s
                    </span>
                </div>
            )}

            <span className="absolute top-1 left-1.5 text-[9px] font-bold text-white/40 font-mono leading-none z-30">
                {label}
            </span>
            
            {item ? (
                <div className="flex flex-col items-center justify-center p-2 h-full w-full">
                    {/* Use DetailedItemIcon for consistent visuals (including images) */}
                    <DetailedItemIcon item={item} size={type === 'weapon' ? 32 : 24} />
                    
                    {count !== undefined && count > 1 && (
                        <span className="absolute bottom-1 right-1 text-[9px] font-bold text-white/90 bg-black/60 px-1 rounded-sm font-mono">
                            {count}
                        </span>
                    )}
                </div>
            ) : (
                <div className="text-white/5 opacity-20">
                    {label === 'V' ? <Sword size={20} /> : (type === 'weapon' ? <Crosshair size={20} /> : <Box size={16} />)}
                </div>
            )}
        </div>
    );
};

export const HUD: React.FC = () => {
  const gameState = useGameSelector(state => state.gameState);
  const health = useGameSelector(state => Math.round(state.stats.health));
  const maxHealth = useGameSelector(state => state.stats.maxHealth);
  const stamina = useGameSelector(state => Math.round(state.stats.stamina));
  const maxStamina = useGameSelector(state => state.stats.maxStamina);
  const hunger = useGameSelector(state => Math.round(state.stats.hunger));
  const thirst = useGameSelector(state => Math.round(state.stats.thirst));
  const lastMeleeTime = useGameSelector(state => state.lastMeleeTime);
  const combatLog = useGameSelector(state => state.combatLog);
  const activeMissions = useGameSelector(state => state.activeMissions);
  const messages = useGameSelector(state => state.messages);
  const selectedWeaponSlot = useGameSelector(state => state.selectedWeaponSlot);
  const equipment = useGameSelector(state => state.equipment);
  const inventory = useGameSelector(state => state.inventory);
  const hotbar = useGameSelector(state => state.hotbar);
  const isFlashlightOn = useGameSelector(state => state.isFlashlightOn);
  
  const [prevHealth, setPrevHealth] = useState(health);
  const [damageFlash, setDamageFlash] = useState(false);
  const [meleeCooldown, setMeleeCooldown] = useState(0);
  const combatLogRef = useRef<HTMLDivElement>(null);

  // Damage Flash Effect
  useEffect(() => {
      if (health < prevHealth) {
          setDamageFlash(true);
          const t = setTimeout(() => setDamageFlash(false), 300);
          return () => clearTimeout(t);
      }
      setPrevHealth(health);
  }, [health]);
  
  // Melee Cooldown visual timer
  useEffect(() => {
    let interval: number;
    if (lastMeleeTime > 0) {
      interval = window.setInterval(() => {
        const remaining = Math.max(0, 7000 - (Date.now() - lastMeleeTime));
        setMeleeCooldown(remaining);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [lastMeleeTime]);

  // Auto-scroll combat log
  useEffect(() => {
    if (combatLogRef.current) {
        combatLogRef.current.scrollTop = combatLogRef.current.scrollHeight;
    }
  }, [combatLog]);

  if (gameState === GameState.MENU || gameState === GameState.DEAD) return null;

  const activeWeapon = equipment[selectedWeaponSlot];
  const isLowHealth = health < 20;
  const meleePercent = meleeCooldown > 0 ? (meleeCooldown / 7000) * 100 : 0;

  // Calculate Ammo for currently equipped weapon
  let ammoCount = 0;
  if (activeWeapon && activeWeapon.ammoType) {
      // Check Inventory
      inventory.forEach(s => {
          if (s.item && s.item.id === activeWeapon.ammoType) ammoCount += s.count;
      });
      // Check Equipment Belts (Specific Caliber Slots)
      const ammoSlots = ['ammo762', 'ammo556', 'ammo9mm', 'ammo12g', 'ammo44'] as const;
      ammoSlots.forEach(slot => {
          const item = equipment[slot];
          if (item && item.id === activeWeapon.ammoType) {
              ammoCount += (item as any).count || 0;
          }
      });
  }

  return (
    <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between overflow-hidden">
      {/* Low Health Vignette */}
       <div 
         className={`absolute inset-0 z-0 transition-opacity duration-1000 pointer-events-none
           ${isLowHealth ? 'opacity-100 animate-pulse' : 'opacity-0'}
         `}
         style={{
           background: 'radial-gradient(circle, transparent 50%, rgba(220, 38, 38, 0.5) 100%)'
         }}
       />
       
       {/* Damage Flash */}
       {damageFlash && (
           <div className="absolute inset-0 bg-red-500/20 z-10 animate-out fade-out duration-300 pointer-events-none" />
       )}

      {/* Top Left: Active Missions */}
      <div className="absolute top-8 left-8 flex flex-col gap-2 z-10 w-64 pointer-events-auto">
          {activeMissions.map((mission) => (
              <div key={mission.id} className="bg-black/60 border-l-4 border-yellow-500 p-3 rounded-r-md backdrop-blur-sm animate-in slide-in-from-left-5">
                  <h4 className="text-yellow-400 font-bold text-xs uppercase tracking-wider mb-1">{mission.title}</h4>
                  <p className="text-[10px] text-gray-300">{mission.description}</p>
                  <ul className="mt-2 space-y-1">
                      {mission.objectives.map((obj, i) => (
                          <li key={i} className="text-[9px] text-gray-400 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 border border-gray-500 rounded-full" />
                              {obj}
                          </li>
                      ))}
                  </ul>
              </div>
          ))}
      </div>

      {/* Top Right: Status Effects */}
      <div className="flex flex-col items-end gap-3 relative z-10">
         {hunger < 20 && (
           <div className="flex items-center gap-2 text-red-500 bg-red-950/30 px-4 py-2 rounded-full border border-red-500/20 backdrop-blur-sm animate-pulse">
             <AlertTriangle size={16} />
             <span className="text-xs font-bold uppercase tracking-wider">Starving</span>
           </div>
         )}
         {thirst < 20 && (
           <div className="flex items-center gap-2 text-blue-500 bg-blue-950/30 px-4 py-2 rounded-full border border-blue-500/20 backdrop-blur-sm animate-pulse">
             <AlertTriangle size={16} />
             <span className="text-xs font-bold uppercase tracking-wider">Dehydrated</span>
           </div>
         )}
      </div>

      {/* Center Message Log */}
      <div className="absolute top-1/3 left-12 flex flex-col gap-2 z-10">
         {messages.slice(-6).map((msg) => (
           <div 
             key={msg.id} 
             className={`text-[10px] uppercase tracking-widest py-1 px-3 rounded-r-lg backdrop-blur-sm bg-gradient-to-r from-black/60 to-transparent border-l-2 animate-in slide-in-from-left-5 fade-in duration-300 font-semibold shadow-lg
               ${msg.type === 'danger' ? 'border-red-500 text-red-100' : 'border-cyan-500 text-cyan-100'}
               ${msg.type === 'loot' ? 'border-yellow-500 text-yellow-100' : ''}
               ${msg.type === 'ai' ? 'border-green-500 text-green-100' : ''}
             `}
           >
             {msg.text}
           </div>
         ))}
      </div>

      {/* Combat Log */}
      <div className="absolute bottom-32 right-8 w-64 h-48 pointer-events-auto z-10 flex flex-col items-end">
         <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-2 w-full h-full overflow-hidden flex flex-col">
             <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 border-b border-white/5 pb-1 flex items-center justify-between">
                 <span>Combat Log</span>
                 <FileText size={10} />
             </div>
             <div ref={combatLogRef} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                 {combatLog.map((log) => (
                     <div key={log.id} className={`text-[9px] font-mono leading-tight ${log.source === 'player' ? 'text-cyan-300' : (log.source === 'enemy' ? 'text-red-400' : 'text-yellow-400')} ${log.isCritical ? 'font-bold' : 'opacity-80'}`}>
                         <span className="opacity-50">[{new Date(log.timestamp).toLocaleTimeString([], {second: '2-digit'})}]</span> {log.text}
                     </div>
                 ))}
                 {combatLog.length === 0 && <div className="text-[9px] text-gray-700 italic text-center mt-4">No combat activity</div>}
             </div>
         </div>
      </div>

      {/* Bottom Layout */}
      <div className="flex items-end justify-between w-full relative z-10">
        
        {/* Bottom Left: Stats */}
        <div className="flex flex-col gap-2">
            <div className="bg-[#050505]/60 backdrop-blur-md px-6 py-4 rounded-[2rem] border border-white/5 flex flex-col gap-3 shadow-2xl">
            
            {/* Utility Toggles Row (Flashlight) */}
            <div className="flex items-center gap-4 mb-1">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-300 ${isFlashlightOn ? 'text-cyan-400 bg-cyan-900/30 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'text-gray-600 bg-black/40 border-white/5'}`}>
                    <Flashlight size={14} fill={isFlashlightOn ? "currentColor" : "none"} />
                    <span className="text-[9px] font-bold tracking-widest uppercase">Light</span>
                    <span className="text-[8px] bg-white/10 px-1 rounded text-white/50 ml-1">F</span>
                </div>
            </div>

            <StatBar 
                value={health} 
                max={maxHealth} 
                color="bg-emerald-500" 
                icon={<Activity size={18} />} 
                danger
                />
            <StatBar 
                value={stamina} 
                max={maxStamina} 
                color="bg-amber-400" 
                icon={<Zap size={18} />} 
                />
            
            <div className="flex gap-4 mt-2 w-full">
                <div className="flex-1">
                    <div className="flex justify-between text-[8px] uppercase font-bold text-gray-500 mb-0.5"><span>Hunger</span></div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${hunger < 30 ? 'bg-orange-500' : 'bg-orange-400'}`} style={{ width: `${hunger}%` }} />
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex justify-between text-[8px] uppercase font-bold text-gray-500 mb-0.5"><span>Thirst</span></div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${thirst < 30 ? 'bg-blue-500' : 'bg-blue-400'}`} style={{ width: `${thirst}%` }} />
                    </div>
                </div>
            </div>

            </div>
        </div>

        {/* Bottom Center: WEAPONS & UTILITY HOTBAR */}
        <div className="flex items-end gap-6 mx-auto mb-4 pointer-events-auto">
            {/* Weapons Group */}
            <div className="flex gap-2">
                <HUDSlot label="1" item={equipment.primary} isActive={selectedWeaponSlot === 'primary'} type="weapon" />
                <HUDSlot label="2" item={equipment.secondary} isActive={selectedWeaponSlot === 'secondary'} type="weapon" />
                <HUDSlot label="3" item={equipment.sidearm} isActive={selectedWeaponSlot === 'sidearm'} type="weapon" />
                <HUDSlot label="V" item={equipment.melee} isActive={selectedWeaponSlot === 'melee'} type="weapon" cooldownPercent={meleePercent} />
            </div>

            <div className="w-px h-12 bg-white/10 self-center" />

            {/* Utility Group (G and H) */}
            <div className="flex gap-2">
                <HUDSlot label="G" item={hotbar[0].item} count={hotbar[0].count} type="utility" />
                <HUDSlot label="H" item={hotbar[1].item} count={hotbar[1].count} type="utility" />
            </div>
        </div>
        
        {/* Bottom Right: Equipped Weapon Info */}
        <div className="flex flex-col items-end gap-2">
            <div className="bg-gradient-to-l from-black/80 to-transparent pl-12 pr-6 py-4 rounded-l-[2rem] border-r-0 border-y border-l border-white/10 backdrop-blur-md text-right min-w-[200px]">
              <div className="text-2xl font-tech text-white tracking-widest uppercase truncate shadow-black drop-shadow-md">
                {activeWeapon ? activeWeapon.name : "UNARMED"}
              </div>
              <div className="flex justify-end gap-3 mt-1">
                 {activeWeapon && activeWeapon.ammoType && (
                     <div className="flex items-center gap-1 text-yellow-400">
                         <Box size={10} />
                         <span className="text-xs font-bold font-tech tracking-wider">{ammoCount} RNDS</span>
                     </div>
                 )}
                 <div className="text-[10px] text-cyan-400 uppercase tracking-[0.2em] font-bold">
                    {activeWeapon ? "Ready" : "No Weapon"}
                 </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};
