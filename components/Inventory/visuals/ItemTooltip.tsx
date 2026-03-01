
import React from 'react';
import { Item } from '../../../types';
import { Backpack } from 'lucide-react';

export const ItemTooltip: React.FC<{ item: Item; position: { x: number; y: number } }> = ({ item, position }) => {
  return (
    <div 
      style={{ top: position.y + 10, left: position.x + 10 }}
      className="fixed z-[100] w-64 bg-black/95 border border-white/20 rounded-xl p-4 shadow-2xl backdrop-blur-xl pointer-events-none animate-in fade-in duration-150 flex flex-col gap-2"
    >
      <div className="border-b border-white/10 pb-2">
        <h3 className="font-tech text-xl uppercase tracking-wider" style={{ color: item.rarity }}>{item.name}</h3>
        <div className="text-[10px] text-white/50 uppercase tracking-[0.2em]">{item.type.replace('_', ' ')}</div>
      </div>
      <p className="text-xs text-gray-400 italic leading-relaxed">"{item.description}"</p>
      <div className="flex flex-col gap-1 mt-2 bg-white/5 p-2 rounded-lg">
        <div className="flex justify-between text-xs border-b border-white/5 pb-1 mb-1">
             <span className="text-gray-400">Weight</span><span className="text-white font-bold">{item.weight} kg</span>
        </div>
        {item.damage && <div className="flex justify-between text-xs"><span className="text-gray-400">Damage</span><span className="text-white font-bold">{item.damage}</span></div>}
        {item.defense && <div className="flex justify-between text-xs"><span className="text-gray-400">Defense</span><span className="text-white font-bold">{item.defense}</span></div>}
        {item.healthRestore && <div className="flex justify-between text-xs"><span className="text-green-400">Health Restore</span><span className="text-white font-bold">+{item.healthRestore}</span></div>}
        {item.hungerRestore && <div className="flex justify-between text-xs"><span className="text-orange-400">Nutrition</span><span className="text-white font-bold">+{item.hungerRestore}</span></div>}
        {item.ammoType && <div className="flex justify-between text-xs"><span className="text-yellow-400">Ammo</span><span className="text-white font-bold">{item.ammoType.replace('ammo_', '')}</span></div>}
        {item.gatheringPower && <div className="flex justify-between text-xs"><span className="text-purple-400">Power</span><span className="text-white font-bold">{item.gatheringPower}</span></div>}
        {item.gatheringSpeed && <div className="flex justify-between text-xs"><span className="text-blue-400">Speed</span><span className="text-white font-bold">x{item.gatheringSpeed}</span></div>}
        {item.maxWeightBonus && <div className="flex justify-between text-xs"><span className="text-yellow-400">Capacity</span><span className="text-white font-bold">+{item.maxWeightBonus}kg</span></div>}
      </div>
      {/* Backpack Content Preview */}
      {item.storage && (
        <div className="mt-2 border-t border-white/10 pt-2">
            <div className="flex justify-between text-xs text-yellow-400 mb-1">
            <span>Slots</span>
            <span className="font-bold">+{item.storage.length}</span>
            </div>
            <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">Contents:</div>
            <div className="flex flex-col gap-0.5">
            {item.storage.filter(s => s.item).slice(0, 5).map(s => (
                <div key={s.slotId} className="flex justify-between text-[10px] text-gray-400">
                    <span>{s.item?.name}</span>
                    <span className="text-white">x{s.count}</span>
                </div>
            ))}
            {item.storage.filter(s => s.item).length > 5 && <span className="text-[9px] text-gray-600 italic">...and more</span>}
            {!item.storage.some(s => s.item) && <span className="text-[9px] text-gray-600 italic">Empty</span>}
            </div>
        </div>
      )}
      {item.durability !== undefined && (
        <div className="mt-1">
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>CONDITION</span>
            <span>{item.durability}/{item.maxDurability}</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500" style={{ width: `${(item.durability / (item.maxDurability || 100)) * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  );
};
