
import React, { useState, useEffect } from 'react';
import { useGame, useGameSelector, getGameState, dispatchGame } from '../../context/GameContext';
import { Item, InventorySlot, InventoryContextType, GameState, EquipmentState, InventoryTab, ItemType, AssetType } from '../../types';
import { X, Shield, Pickaxe, BarChart2, Hand, Backpack, Hexagon, Columns, Footprints, Crosshair, Disc, Target, Sword, Box, Download, Map as MapIcon, List, Circle, Zap, Utensils, Droplet, Activity, Package, Hammer, Users, Server, Ban, Trash2, EyeOff, User, Globe, Calendar, Flag, AlertTriangle, Cpu, HardDrive, Wifi, Clock } from 'lucide-react';
import { FACTIONS, ITEMS, WORLD_ASSETS } from '../../constants';
import { calculateTotalWeight } from '../../services/gameLogic';

import { ItemTooltip } from './visuals/ItemTooltip';
import { MapPanel } from './visuals/MapPanel';
import { Slot } from './slots/InventorySlot';
import { EquipSlot } from './slots/EquipSlot';
import { SplitModal } from './modals/SplitModal';
import { GuildInfoModal } from './modals/GuildInfoModal';
import { FactionInfoModal } from './modals/FactionInfoModal';

const StatDisplay: React.FC<{ icon: React.ReactNode, label: string, value: string | number }> = ({ icon, label, value }) => (
    <div className="flex flex-col items-center bg-white/5 p-2 rounded-lg border border-white/5 w-16">
        <div className="text-gray-400 mb-1">{icon}</div>
        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{label}</div>
        <div className="text-sm font-bold text-white">{value}</div>
    </div>
);

const VitalBar: React.FC<{ icon: React.ReactNode, value: number, max: number, color: string, label: string }> = ({ icon, value, max, color, label }) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-gray-400">
                <div className="flex items-center gap-1.5"> {icon} {label} </div>
                <span className={color.replace('bg-', 'text-')}>{Math.round(value)}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
            </div>
        </div>
    );
}

interface SplitState { fromSlot: number; fromContext: InventoryContextType; toSlot: number; toContext: InventoryContextType; max: number; }

export const Inventory: React.FC = () => {
  const gameState = useGameSelector(state => state.gameState);
  const activeInventoryTab = useGameSelector(state => state.activeInventoryTab);
  const stats = useGameSelector(state => state.stats);
  const activeContainerId = useGameSelector(state => state.activeContainerId);
  const containers = useGameSelector(state => state.containers);
  const inventory = useGameSelector(state => state.inventory);
  const hotbar = useGameSelector(state => state.hotbar);
  const equipment = useGameSelector(state => state.equipment);

  const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
  const [hoveredSlotInfo, setHoveredSlotInfo] = useState<{ slotId: number | string, context: InventoryContextType } | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [leftTab, setLeftTab] = useState<'gear' | 'tools' | 'stats'>('gear');
  const [splitModal, setSplitModal] = useState<SplitState | null>(null);
  const [isFactionModalOpen, setFactionModalOpen] = useState(false);
  const [isGuildModalOpen, setGuildModalOpen] = useState(false);
  const [buildCategory, setBuildCategory] = useState<'items' | 'entities' | 'events'>('items');
  const [seasonFilter, setSeasonFilter] = useState<number>(1);

  const isAdmin = stats.faction === 'ADMIN';

  useEffect(() => {
      if (isAdmin && !['admin_spawn', 'admin_build', 'admin_players', 'admin_stats', 'admin_seasons'].includes(activeInventoryTab)) {
          dispatchGame({ type: 'SET_INVENTORY_TAB', payload: 'admin_spawn' });
      } else if (!isAdmin && !['inventory', 'perks', 'missions', 'map'].includes(activeInventoryTab)) {
          dispatchGame({ type: 'SET_INVENTORY_TAB', payload: 'inventory' });
      }
  }, [isAdmin, activeInventoryTab]);

  const setRightTab = (tab: InventoryTab) => dispatchGame({ type: 'SET_INVENTORY_TAB', payload: tab });
  const activeContainer = activeContainerId ? containers.find(c => c.id === activeContainerId) : null;
  const currentFaction = stats.faction === 'ADMIN' ? { name: 'SYSTEM ADMIN', description: 'World Architect', color: '#ff0000' } : (FACTIONS[stats.faction] || FACTIONS['VANGUARD']);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          const state = getGameState();
          if (state.gameState !== GameState.INVENTORY) return;
          if (e.code === 'Tab') {
              if (e.repeat) return;
              e.preventDefault(); e.stopImmediatePropagation();
              if (state.activeContainerId) dispatchGame({ type: 'CLOSE_CONTAINER' });
              dispatchGame({ type: 'SET_STATE', payload: GameState.PLAYING });
              const container = document.getElementById('game-container');
              if (container) container.requestPointerLock();
              return;
          }
          if (e.code === 'KeyF' && activeContainer) { dispatchGame({ type: 'LOOT_ALL' }); return; }
          if (!hoveredSlotInfo) return;
          const { context, slotId } = hoveredSlotInfo;
          if (e.code === 'KeyQ' && context !== 'equipment') {
              let list = context === 'inventory' ? state.inventory : (context === 'hotbar' ? state.hotbar : (context === 'container' && activeContainer ? activeContainer.items : (context === 'backpack' && state.equipment.backpack?.storage ? state.equipment.backpack.storage : [])));
              const slot = list.find(s => s.slotId === slotId);
              if (slot && slot.item) dispatchGame({ type: 'DROP_ITEM', payload: { slotId: typeof slotId === 'number' ? slotId : -1, context, count: e.ctrlKey ? slot.count : 1 } });
          }
          if (e.code === 'KeyE') {
              if (context === 'equipment') { dispatchGame({ type: 'UNEQUIP_ITEM', payload: { slotKey: slotId as keyof EquipmentState } }); return; }
              let list = context === 'inventory' ? state.inventory : (context === 'hotbar' ? state.hotbar : (context === 'container' && activeContainer ? activeContainer.items : (context === 'backpack' && state.equipment.backpack?.storage ? state.equipment.backpack.storage : [])));
              const slot = list.find(s => s.slotId === slotId);
              if (slot && slot.item) {
                  const sId = typeof slotId === 'number' ? slotId : -1;
                  if (slot.item.type === ItemType.CONSUMABLE || slot.item.type === ItemType.MEDICAL) dispatchGame({ type: 'CONSUME_ITEM', payload: { slotId: sId, context } }); 
                  else dispatchGame({ type: 'EQUIP_ITEM', payload: { slotId: sId, context } });
              }
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hoveredSlotInfo, activeContainer]);

  if (gameState !== GameState.INVENTORY) return null;

  const handleSlotAction = (e: React.MouseEvent, slot: InventorySlot, context: InventoryContextType) => {
    e.preventDefault(); if (!slot.item) return;
    if (slot.item.type === ItemType.GRENADE) { if (!hotbar[0].item) dispatchGame({ type: 'MOVE_ITEM', payload: { fromSlot: slot.slotId, fromContext: context, toSlot: 0, toContext: 'hotbar' } }); } 
    else if (slot.item.type === ItemType.MEDICAL) { if (!hotbar[1].item) dispatchGame({ type: 'MOVE_ITEM', payload: { fromSlot: slot.slotId, fromContext: context, toSlot: 1, toContext: 'hotbar' } }); } 
    else dispatchGame({ type: 'EQUIP_ITEM', payload: { slotId: slot.slotId, context } });
  };

  const handleSlotClick = (e: React.MouseEvent, slot: InventorySlot, context: InventoryContextType) => {
      if (!slot.item) return;
      if (e.shiftKey) {
          let toContext: InventoryContextType = 'inventory'; let targetSlotId = -1;
          if (context === 'inventory') { 
              if (activeContainerId) toContext = 'container';
              else if (equipment.backpack) toContext = 'backpack'; 
              else { toContext = 'hotbar'; targetSlotId = slot.item.type === ItemType.GRENADE ? 0 : (slot.item.type === ItemType.MEDICAL ? 1 : -1); if (targetSlotId === -1) return; }
          } else toContext = 'inventory';
          dispatchGame({ type: 'MOVE_ITEM', payload: { fromSlot: slot.slotId, fromContext: context, toSlot: targetSlotId, toContext } });
      }
  };

  const handleSlotMouseDown = (e: React.MouseEvent, slot: InventorySlot, context: InventoryContextType) => { if (e.button === 1) { e.preventDefault(); if (slot.item && slot.count > 1) dispatchGame({ type: 'SPLIT_STACK', payload: { slotId: slot.slotId, context } }); } };
  const handleDropItem = (fromSlot: number, fromContext: InventoryContextType, toSlot: number, toContext: InventoryContextType, shiftHeld: boolean) => {
      const list = fromContext === 'inventory' ? inventory : (fromContext === 'hotbar' ? hotbar : (fromContext === 'container' && activeContainer ? activeContainer.items : (fromContext === 'backpack' && equipment.backpack?.storage ? equipment.backpack.storage : [])));
      const sourceCount = list.find(s => s.slotId === fromSlot)?.count || 0;
      if (shiftHeld && sourceCount > 1) setSplitModal({ fromSlot, fromContext, toSlot, toContext, max: sourceCount }); 
      else dispatchGame({ type: 'MOVE_ITEM', payload: { fromSlot, fromContext, toSlot, toContext }});
  };

  const updateHover = (item: Item | null, e: React.MouseEvent, slotId: number | string = -1, context: InventoryContextType = 'inventory') => {
    setHoveredItem(item); setCursorPos({ x: e.clientX, y: e.clientY });
    if (item && slotId !== -1) setHoveredSlotInfo({ slotId, context }); else setHoveredSlotInfo(null);
  };

  const onClose = () => {
      if(activeContainerId) dispatchGame({type: 'CLOSE_CONTAINER'});
      else {
          const container = document.getElementById('game-container');
          if(container) container.requestPointerLock();
          dispatchGame({ type: 'SET_STATE', payload: GameState.PLAYING });
      }
  };

  const startBuilding = (type: AssetType) => {
      dispatchGame({ type: 'START_PLACEMENT', payload: type });
      const container = document.getElementById('game-container');
      if (container) container.requestPointerLock();
  };

  const renderSlot = (slot: InventorySlot, ctx: InventoryContextType, label?: string) => (
      <Slot key={`${ctx}-${slot.slotId}`} slot={slot} context={ctx} onRightClick={(e) => handleSlotAction(e, slot, ctx)} onClick={(e) => handleSlotClick(e, slot, ctx)} onMouseDown={(e) => handleSlotMouseDown(e, slot, ctx)} onHover={(item, e) => updateHover(item, e, slot.slotId, ctx)} onDropItem={handleDropItem} hotbarLabel={label} />
  );

  return (
    <>
      {hoveredItem && !splitModal && <ItemTooltip item={hoveredItem} position={cursorPos} />}
      <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); try { const data = JSON.parse(e.dataTransfer.getData('text/plain')); if (data.fromSlot !== undefined && data.fromContext) dispatchGame({ type: 'DROP_ITEM', payload: { slotId: data.fromSlot, context: data.fromContext }}); } catch (err) {} }} onMouseDown={(e) => e.stopPropagation()} className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
        <SplitModal isOpen={!!splitModal} max={splitModal?.max || 1} onConfirm={(count) => { if (splitModal) dispatchGame({ type: 'MOVE_ITEM', payload: { fromSlot: splitModal.fromSlot, fromContext: splitModal.fromContext, toSlot: splitModal.toSlot, toContext: splitModal.toContext, count } }); setSplitModal(null); }} onCancel={() => setSplitModal(null)} />
        <FactionInfoModal isOpen={isFactionModalOpen} onClose={() => setFactionModalOpen(false)} faction={stats.faction === 'ADMIN' ? 'VANGUARD' : stats.faction} color={currentFaction.color} />
        <GuildInfoModal isOpen={isGuildModalOpen} onClose={() => setGuildModalOpen(false)} guildName={stats.guild || 'Freelancer'} factionColor={currentFaction.color} />
        <div onDrop={(e) => e.stopPropagation()} className="w-[1100px] h-[700px] bg-[#09090b]/85 rounded-3xl border border-white/10 shadow-2xl flex overflow-hidden relative backdrop-blur-md">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-white transition-all z-20 group"> <X size={20} className="group-hover:rotate-90 transition-transform" /> </button>
          <div className="w-[400px] bg-[#0c0c0e]/90 px-8 pt-5 pb-8 flex flex-col border-r border-white/5 relative z-10">
            <div className="flex justify-between items-start mb-2 border-b border-white/5 pb-2">
               <div className="flex flex-col justify-center flex-1 mr-4">
                  <div className="flex items-end gap-3"><h1 className="text-xl font-tech text-white tracking-widest leading-none truncate">{stats.name.toUpperCase()}</h1><div onClick={() => setFactionModalOpen(true)} className="text-[10px] font-bold tracking-widest uppercase mb-0.5 cursor-pointer hover:underline hover:text-white transition-all" style={{ color: currentFaction.color }}> {isAdmin ? 'SERVER MONITOR' : currentFaction.name} </div></div>
                  {isAdmin ? <div className="mt-2 text-xs font-mono text-green-500 font-bold border border-green-500/30 bg-green-900/10 px-2 py-1 rounded inline-flex items-center gap-2"><Activity size={12} className="animate-pulse"/> SYSTEM ONLINE</div> : <div className="flex items-center gap-3 mt-1"><button onClick={() => setGuildModalOpen(true)} className="flex items-center gap-1.5 hover:bg-white/5 px-1 -ml-1 rounded transition-colors group cursor-pointer"><div className="text-[9px] text-gray-600 font-bold tracking-widest uppercase group-hover:text-gray-400">GUILD</div><div className="text-xs font-bold tracking-wider text-white group-hover:text-cyan-400"> {stats.guild || "-"} </div></button><div className="w-px h-2 bg-white/10" /><div className="flex items-center gap-1.5"><div className="text-[9px] text-gray-600 font-bold tracking-widest uppercase">ATOMS</div><div className="text-xs font-bold tracking-wider text-cyan-400 flex items-center"> {stats.credits} <span className="ml-0.5 text-sm leading-none">⚛︎</span> </div></div></div>}
               </div>
               {!isAdmin && <div className="text-right w-32 flex flex-col gap-1"><div className="flex items-center justify-between text-yellow-500"><div className="flex items-center gap-1"><List size={10} /><span className="text-[9px] font-bold">LVL</span></div> <span className="font-tech text-sm font-bold">{stats.level}</span></div><div className="relative w-full h-2.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-yellow-500" style={{ width: `${(stats.xp / stats.maxXp) * 100}%` }} /><div className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-black/70">{stats.xp}/{stats.maxXp}</div></div></div>}
            </div>
            {isAdmin ? <div className="flex-1 flex flex-col gap-4 py-4 animate-in fade-in slide-in-from-left-5"><div className="grid grid-cols-2 gap-3"><div className="bg-black/40 border border-white/5 rounded-lg p-3"><div className="flex items-center gap-2 text-gray-500 mb-1"><Cpu size={14}/> <span className="text-[10px] font-bold uppercase">CPU Load</span></div><div className="text-xl text-white font-mono">12%</div></div><div className="bg-black/40 border border-white/5 rounded-lg p-3"><div className="flex items-center gap-2 text-gray-500 mb-1"><HardDrive size={14}/> <span className="text-[10px] font-bold uppercase">Memory</span></div><div className="text-xl text-white font-mono">4.2GB</div></div><div className="bg-black/40 border border-white/5 rounded-lg p-3"><div className="flex items-center gap-2 text-gray-500 mb-1"><Wifi size={14}/> <span className="text-[10px] font-bold uppercase">Net I/O</span></div><div className="text-xl text-green-400 font-mono">45KB/s</div></div><div className="bg-black/40 border border-white/5 rounded-lg p-3"><div className="flex items-center gap-2 text-gray-500 mb-1"><Clock size={14}/> <span className="text-[10px] font-bold uppercase">Uptime</span></div><div className="text-xl text-blue-400 font-mono">04:22:10</div></div></div><div className="bg-black/40 border border-white/5 rounded-lg p-4 flex-1"><h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Traffic Graph</h3><div className="w-full h-32 flex items-end gap-1">{Array.from({length: 20}).map((_, i) => <div key={i} className="flex-1 bg-cyan-900/30 rounded-t-sm" style={{ height: `${Math.random() * 100}%` }} />)}</div></div></div> : <>
                <div className="flex items-center gap-4 mb-2 border-b border-white/5"><button onClick={() => setLeftTab('gear')} className={`flex items-center gap-2 pb-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${leftTab === 'gear' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/40 hover:text-white'}`}> <Shield size={14} /> Gear </button><button onClick={() => setLeftTab('tools')} className={`flex items-center gap-2 pb-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${leftTab === 'tools' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/40 hover:text-white'}`}> <Pickaxe size={14} /> Tools </button><button onClick={() => setLeftTab('stats')} className={`flex items-center gap-2 pb-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${leftTab === 'stats' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/40 hover:text-white'}`}> <BarChart2 size={14} /> Stats </button></div>
                <div className="flex-1 flex flex-col items-center relative mb-2 overflow-y-auto pr-1 custom-scrollbar">{leftTab === 'gear' ? <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-200"><div className="grid grid-cols-3 gap-1 w-full justify-items-center mb-2"><div className="col-start-2"> <EquipSlot item={equipment.head} icon={<Shield size={24} />} onClick={() => dispatchGame({type:'UNEQUIP_ITEM',payload:{slotKey:'head'}})} onHover={(item, e) => updateHover(item, e, 'head', 'equipment')} label="Head" size="large" /> </div><div className="col-start-1 row-start-2"> <EquipSlot item={equipment.hands} icon={<Hand size={20} />} onClick={() => dispatchGame({type:'UNEQUIP_ITEM',payload:{slotKey:'hands'}})} onHover={(item, e) => updateHover(item, e, 'hands', 'equipment')} label="Hands" size="large" /> </div><div className="col-start-2 row-start-2"> <EquipSlot item={equipment.chest} icon={<Shield size={24} />} onClick={() => dispatchGame({type:'UNEQUIP_ITEM',payload:{slotKey:'chest'}})} onHover={(item, e) => updateHover(item, e, 'chest', 'equipment')} label="Chest" size="large" /> </div><div className="col-start-3 row-start-2"> <EquipSlot item={equipment.backpack} icon={<Backpack size={20} />} onClick={() => dispatchGame({type:'UNEQUIP_ITEM',payload:{slotKey:'backpack'}})} onHover={(item, e) => updateHover(item, e, 'backpack', 'equipment')} label="Back" size="large" /> </div><div className="col-start-1 row-start-3"> <EquipSlot item={equipment.legs} icon={<Columns size={20} />} onClick={() => dispatchGame({type:'UNEQUIP_ITEM',payload:{slotKey:'legs'}})} onHover={(item, e) => updateHover(item, e, 'legs', 'equipment')} label="Legs" size="large" /> </div><div className="col-start-2 row-start-3"> <EquipSlot item={equipment.feet} icon={<Footprints size={20} />} onClick={() => dispatchGame({type:'UNEQUIP_ITEM',payload:{slotKey:'feet'}})} onHover={(item, e) => updateHover(item, e, 'feet', 'equipment')} label="Feet" size="large" /> </div><div className="col-start-3 row-start-3"> <EquipSlot item={equipment.artifact} icon={<Hexagon size={20} />} onClick={() => dispatchGame({type:'UNEQUIP_ITEM',payload:{slotKey:'artifact'}})} onHover={(item, e) => updateHover(item, e, 'artifact', 'equipment')} label="Artifact" size="large" /> </div></div><div className="flex gap-6 w-full justify-center border-t border-white/5 pt-2 mt-2"><EquipSlot item={equipment.primary} icon={<Crosshair size={24} />} onClick={() => dispatchGame({type:'UNEQUIP_ITEM',payload:{slotKey:'primary'}})} onHover={(item, e) => updateHover(item, e, 'primary', 'equipment')} label="Primary" size="large" /><EquipSlot item={equipment.secondary} icon={<Disc size={24} />} onClick={() => dispatchGame({type:'UNEQUIP_ITEM',payload:{slotKey:'secondary'}})} onHover={(item, e) => updateHover(item, e, 'secondary', 'equipment')} label="Secondary" size="large" /><EquipSlot item={equipment.sidearm} icon={<Target size={24} />} onClick={() => dispatchGame({type:'UNEQUIP_ITEM',payload:{slotKey:'sidearm'}})} onHover={(item, e) => updateHover(item, e, 'sidearm', 'equipment')} label="Sidearm" size="large" /><EquipSlot item={equipment.melee} icon={<Sword size={20} />} onClick={() => dispatchGame({type:'UNEQUIP_ITEM',payload:{slotKey:'melee'}})} onHover={(item, e) => updateHover(item, e, 'melee', 'equipment')} label="Melee" size="large" /></div></div> : leftTab === 'tools' ? <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-200 pt-8"><div className="grid grid-cols-3 gap-6"><EquipSlot item={equipment.pickaxe} icon={<Pickaxe size={24} />} onClick={() => dispatchGame({type:'UNEQUIP_ITEM',payload:{slotKey:'pickaxe'}})} onHover={(item, e) => updateHover(item, e, 'pickaxe', 'equipment')} label="Pickaxe" size="large" /><EquipSlot item={equipment.axe} icon={<Pickaxe size={24} />} onClick={() => dispatchGame({type:'UNEQUIP_ITEM',payload:{slotKey:'axe'}})} onHover={(item, e) => updateHover(item, e, 'axe', 'equipment')} label="Axe" size="large" /><EquipSlot item={equipment.shovel} icon={<Pickaxe size={24} />} onClick={() => dispatchGame({type:'UNEQUIP_ITEM',payload:{slotKey:'shovel'}})} onHover={(item, e) => updateHover(item, e, 'shovel', 'equipment')} label="Shovel" size="large" /></div></div> : <div className="w-full h-full flex items-center justify-center text-gray-500 animate-in fade-in zoom-in duration-200"><div className="text-center"> <BarChart2 size={48} className="mx-auto mb-2 opacity-20" /> <p className="text-xs uppercase tracking-widest">Statistics Module Offline</p> </div></div>}</div>
                <div className="flex justify-between w-full mb-4 border-t border-white/5 pt-2"><StatDisplay icon={<Sword size={16} />} label="Damage" value={stats.attack} /><StatDisplay icon={<Shield size={16} />} label="Armor" value={stats.defense} /><StatDisplay icon={<Activity size={16} />} label="Speed" value={Math.round(stats.speed)} /><StatDisplay icon={<Package size={16} />} label="Weight" value={`${Math.round(stats.weight)}/${stats.maxWeight}`} /></div>
                <div className="mt-auto"><div className="w-full text-left mb-3 flex items-center gap-2 text-cyan-500/70"> <Activity size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Vitals</span> </div><div className="grid grid-cols-2 gap-x-6 gap-y-3"><VitalBar icon={<Activity size={12} />} value={stats.health} max={stats.maxHealth} color="bg-emerald-500" label="Health" /><VitalBar icon={<Zap size={12} />} value={stats.stamina} max={stats.maxStamina} color="bg-amber-400" label="Stamina" /><VitalBar icon={<Utensils size={12} />} value={stats.hunger} max={100} color="bg-orange-400" label="Food" /><VitalBar icon={<Droplet size={12} />} value={stats.thirst} max={100} color="bg-blue-400" label="Water" /></div></div>
            </>}
          </div>
          <div className="flex-1 bg-[#050505]/90 p-8 flex flex-col">{activeContainer ? <div className="flex gap-6 h-full"><div className="flex-1 flex flex-col"><h2 className="text-xl font-tech text-white mb-4 flex items-center gap-2"><Package size={18} /> BACKPACK</h2><div className="grid grid-cols-4 gap-2 overflow-y-auto pr-2 custom-scrollbar flex-1 content-start">{inventory.map(s => renderSlot(s, 'inventory'))}</div></div><div className="w-px bg-white/10 h-full"></div><div className="flex-1 flex flex-col"><div className="flex items-center gap-4 mb-4"><h2 className="text-xl font-tech text-cyan-400 flex items-center gap-2"><Box size={18} /> STORAGE</h2><button onClick={() => dispatchGame({type:'LOOT_ALL'})} className="flex items-center gap-2 bg-cyan-900/30 hover:bg-cyan-800/50 text-cyan-300 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors border border-cyan-800/50"><Download size={14} /> Loot All <span className="ml-1 text-[9px] opacity-50 font-mono">(F)</span></button></div><div className="grid grid-cols-4 gap-2 overflow-y-auto pr-2 custom-scrollbar flex-1 content-start">{activeContainer.items.map(s => renderSlot(s, 'container'))}</div></div></div> : <>
                    <div className="flex items-center gap-6 mb-4 border-b border-white/5 pb-2">{isAdmin ? <><button onClick={() => setRightTab('admin_spawn')} className={`text-2xl font-tech uppercase transition-colors flex items-center gap-2 ${activeInventoryTab === 'admin_spawn' ? 'text-red-500' : 'text-white/40 hover:text-white/70'}`}><Box size={20}/>Spawn</button><button onClick={() => setRightTab('admin_build')} className={`text-2xl font-tech uppercase transition-colors flex items-center gap-2 ${activeInventoryTab === 'admin_build' ? 'text-red-500' : 'text-white/40 hover:text-white/70'}`}><Hammer size={20}/>Build</button><button onClick={() => setRightTab('admin_seasons')} className={`text-2xl font-tech uppercase transition-colors flex items-center gap-2 ${activeInventoryTab === 'admin_seasons' ? 'text-red-500' : 'text-white/40 hover:text-white/70'}`}><Calendar size={20}/>Seasons</button><button onClick={() => setRightTab('admin_players')} className={`text-2xl font-tech uppercase transition-colors flex items-center gap-2 ${activeInventoryTab === 'admin_players' ? 'text-red-500' : 'text-white/40 hover:text-white/70'}`}><Users size={20}/>Players</button><button onClick={() => setRightTab('admin_stats')} className={`text-2xl font-tech uppercase transition-colors flex items-center gap-2 ${activeInventoryTab === 'admin_stats' ? 'text-red-500' : 'text-white/40 hover:text-white/70'}`}><Server size={20}/>Server</button></> : <><button onClick={() => setRightTab('inventory')} className={`text-2xl font-tech uppercase transition-colors flex items-center gap-2 ${activeInventoryTab === 'inventory' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}><Package size={20}/>Inventory</button><button onClick={() => setRightTab('perks')} className={`text-2xl font-tech uppercase transition-colors flex items-center gap-2 ${activeInventoryTab === 'perks' ? 'text-purple-400' : 'text-white/40 hover:text-white/70'}`}><Zap size={20}/>Perks</button><button onClick={() => setRightTab('missions')} className={`text-2xl font-tech uppercase transition-colors flex items-center gap-2 ${activeInventoryTab === 'missions' ? 'text-yellow-400' : 'text-white/40 hover:text-white/70'}`}><List size={20}/>Missions</button><button onClick={() => setRightTab('map')} className={`text-2xl font-tech uppercase transition-colors flex items-center gap-2 ${activeInventoryTab === 'map' ? 'text-cyan-400' : 'text-white/40 hover:text-white/70'}`}><MapIcon size={20}/>Map</button></>}</div>
                    {activeInventoryTab === 'inventory' && <><div className="flex justify-end mb-2"><button onClick={() => dispatchGame({type: 'SORT_INVENTORY'})} className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded hover:bg-white/10 text-gray-400 hover:text-white uppercase tracking-wider font-bold transition-all flex items-center gap-1"><List size={12} /> Sort</button></div><div className="flex-1 overflow-y-auto pr-2 custom-scrollbar animate-in fade-in slide-in-from-bottom-2 mb-4"><div className="grid grid-cols-8 gap-2 content-start">{inventory.map(s => renderSlot(s, 'inventory'))}</div></div>{equipment.backpack?.storage && <div className="mb-4 p-4 bg-white/5 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-bottom-2"><div className="flex justify-between items-center mb-2"><div className="text-[10px] text-cyan-500 uppercase font-bold flex items-center gap-2"> <Backpack size={12} /> {equipment.backpack.name} Storage </div><div className="text-[9px] text-gray-500 uppercase font-bold"> +{equipment.backpack.maxWeightBonus}kg Cap </div></div><div className="grid grid-cols-8 gap-2">{equipment.backpack.storage.map(s => renderSlot(s, 'backpack'))}</div></div>}<div className="p-3 bg-white/5 rounded-xl border border-white/5 animate-in fade-in slide-in-from-bottom-2 flex gap-4 items-center"><div className="text-[10px] text-gray-500 uppercase font-bold w-12 text-center leading-none"> BELT<br/>AMMO </div><div className="flex gap-2"><EquipSlot item={equipment.ammo762} icon={<Box size={24} className="text-white/20"/>} onClick={() => dispatchGame({type:'UNEQUIP_ITEM',payload:{slotKey:'ammo762'}})} onHover={(item, e) => updateHover(item, e, 'ammo762', 'equipment')} label="7.62" /><EquipSlot item={equipment.ammo556} icon={<Box size={24} className="text-white/20"/>} onClick={() => dispatchGame({type:'UNEQUIP_ITEM',payload:{slotKey:'ammo556'}})} onHover={(item, e) => updateHover(item, e, 'ammo556', 'equipment')} label="5.56" /><EquipSlot item={equipment.ammo9mm} icon={<Box size={24} className="text-white/20"/>} onClick={() => dispatchGame({type:'UNEQUIP_ITEM',payload:{slotKey:'ammo9mm'}})} onHover={(item, e) => updateHover(item, e, 'ammo9mm', 'equipment')} label="9mm" /><EquipSlot item={equipment.ammo12g} icon={<Box size={24} className="text-white/20"/>} onClick={() => dispatchGame({type:'UNEQUIP_ITEM',payload:{slotKey:'ammo12g'}})} onHover={(item, e) => updateHover(item, e, 'ammo12g', 'equipment')} label="Shells" /><EquipSlot item={equipment.ammo44} icon={<Box size={24} className="text-white/20"/>} onClick={() => dispatchGame({type:'UNEQUIP_ITEM',payload:{slotKey:'ammo44'}})} onHover={(item, e) => updateHover(item, e, 'ammo44', 'equipment')} label=".44" /><div className="w-px bg-white/10 mx-2 h-12 self-center"></div>{renderSlot(hotbar[0], 'hotbar', 'G')}{renderSlot(hotbar[1], 'hotbar', 'H')}</div></div></>}
                    {activeInventoryTab === 'admin_spawn' && <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar animate-in fade-in slide-in-from-right-5"><div className="flex gap-2 mb-4 border-b border-red-500/30 pb-2 overflow-x-auto"><button onClick={() => setBuildCategory('items')} className={`px-3 py-1 rounded uppercase font-bold text-xs flex items-center gap-1 ${buildCategory === 'items' ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-white'}`}><Box size={12}/> Items</button><button onClick={() => setBuildCategory('entities')} className={`px-3 py-1 rounded uppercase font-bold text-xs flex items-center gap-1 ${buildCategory === 'entities' ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-white'}`}><Users size={12}/> Entities</button><button onClick={() => setBuildCategory('events')} className={`px-3 py-1 rounded uppercase font-bold text-xs flex items-center gap-1 ${buildCategory === 'events' ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-white'}`}><Flag size={12}/> Events</button></div>{buildCategory === 'items' && <div className="grid grid-cols-4 gap-3">{Object.keys(ITEMS).map(id => <button key={id} onClick={() => dispatchGame({type:'SPAWN_DROP',payload:{item:ITEMS[id],position:{...stats.position,y:1}}})} className="bg-black/40 border border-white/10 hover:border-red-500/50 p-2 rounded text-left hover:bg-white/5 transition-all group"><div className="text-[10px] font-bold text-gray-300 group-hover:text-red-400 truncate">{ITEMS[id].name}</div><div className="text-[8px] text-gray-600 font-mono">{id}</div></button>)}</div>}{buildCategory === 'entities' && <div className="grid grid-cols-3 gap-3"><button onClick={() => dispatchGame({type:'SPAWN_NPC',payload:{id:`admin-npc-${Date.now()}`,name:'Spawned NPC',dialogue:'I was created by the admin.',personality:'Neutral',position:{...stats.position,x:stats.position.x+2},state:'IDLE',targetPosition:null,waitTimer:0,speed:0,rotation:0}})} className="bg-red-900/20 border border-red-500/50 p-3 rounded flex flex-col items-center gap-2 hover:bg-red-900/40 group"><User size={24} className="text-red-400 group-hover:scale-110 transition-transform"/><div className="text-xs font-bold text-red-400">Random Survivor</div><div className="text-[8px] text-red-300/50">Spawn Neutral NPC</div></button></div>}</div>}
                    {activeInventoryTab === 'admin_build' && <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar animate-in fade-in slide-in-from-right-5"><div className="bg-yellow-900/10 border border-yellow-500/30 p-3 rounded mb-4 flex items-center gap-2"><AlertTriangle size={16} className="text-yellow-500"/><div className="text-[10px] text-yellow-200"><span className="font-bold">CONSTRUCTION MODE:</span> Select an asset to place it in the world. Use <b>Q</b> / <b>E</b> to rotate, <b>Left Click</b> to build.</div></div><div className="grid grid-cols-3 gap-3">{['ROAD_STRAIGHT', 'HIGHWAY_STRAIGHT', 'ROAD_LAMP_POST'].map(t => <button key={t} onClick={() => startBuilding(t as any)} className="bg-black/40 border border-white/10 hover:border-blue-500/50 p-3 rounded flex flex-col items-center gap-2 hover:bg-white/5 transition-all group"><div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center text-gray-500 group-hover:text-blue-400 border border-white/5"><Box size={20} /></div><div className="text-[10px] font-bold text-gray-400 group-hover:text-white text-center">{t.replace(/_/g, ' ')}</div></button>)}</div></div>}
                    {activeInventoryTab === 'map' && <div className="flex-1 animate-in fade-in slide-in-from-right-5 p-1"><MapPanel /></div>}
                 </>}
          </div>
        </div>
      </div>
    </>
  );
};
