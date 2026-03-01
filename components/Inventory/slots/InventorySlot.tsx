
import React, { useState } from 'react';
import { InventorySlot as InventorySlotType, InventoryContextType, Item, Rarity } from '../../../types';
import { DetailedItemIcon } from '../visuals/ItemIcon';

interface SlotProps {
    slot: InventorySlotType;
    context: InventoryContextType;
    onRightClick: (e: React.MouseEvent, slot: InventorySlotType) => void;
    onClick: (e: React.MouseEvent, slot: InventorySlotType) => void;
    onMouseDown: (e: React.MouseEvent, slot: InventorySlotType) => void;
    onHover: (item: Item | null, e: React.MouseEvent, slotId: number) => void;
    onDropItem: (fromSlot: number, fromContext: InventoryContextType, toSlot: number, toContext: InventoryContextType, shiftHeld: boolean) => void;
    hotbarLabel?: string;
}

export const Slot: React.FC<SlotProps> = ({ slot, context, onRightClick, onClick, onMouseDown, onHover, onDropItem, hotbarLabel }) => {
  const [isOver, setIsOver] = useState(false);
  const handleDragStart = (e: React.DragEvent) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({ fromSlot: slot.slotId, fromContext: context }));
      e.dataTransfer.effectAllowed = 'move';
      if (slot.item) {
          const ghost = document.createElement('div');
          ghost.style.width = '48px';
          ghost.style.height = '48px';
          ghost.style.backgroundColor = 'rgba(0,0,0,0.8)';
          ghost.style.border = `2px solid ${slot.item.rarity}`;
          ghost.style.borderRadius = '8px';
          ghost.style.display = 'flex';
          ghost.style.alignItems = 'center';
          ghost.style.justifyContent = 'center';
          ghost.style.position = 'absolute';
          ghost.style.top = '-1000px';
          ghost.style.zIndex = '1000';
          ghost.innerHTML = `<div style="color: ${slot.item.rarity}; font-weight: bold; font-size: 24px;">+</div>`;
          document.body.appendChild(ghost);
          e.dataTransfer.setDragImage(ghost, 24, 24);
          setTimeout(() => {
              if (document.body.contains(ghost)) document.body.removeChild(ghost);
          }, 0);
      }
  };
  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'move';
      if (!isOver) setIsOver(true);
  };
  const handleDragLeave = () => { setIsOver(false); };
  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault(); e.stopPropagation(); setIsOver(false);
      try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          if (data.fromSlot !== undefined && data.fromContext) {
              onDropItem(data.fromSlot, data.fromContext, slot.slotId, context, e.shiftKey);
          }
      } catch (err) { console.error("Drop failed", err); }
  };
  const rarityGlow = (slot.item && slot.item.rarity !== Rarity.COMMON) 
      ? `inset 0 0 20px ${slot.item.rarity}20, 0 0 5px ${slot.item.rarity}40` 
      : (slot.item ? `inset 0 0 15px ${slot.item.rarity}20, 0 0 5px ${slot.item.rarity}40` : 'none');
  const slotStyle = slot.item ? { borderColor: slot.item.rarity, borderWidth: '1px', backgroundColor: 'rgba(255, 255, 255, 0.03)', boxShadow: rarityGlow } : {};
  const baseSize = context === 'hotbar' ? 'aspect-square w-20 h-20' : 'aspect-square';
  return (
    <div 
      onContextMenu={(e) => onRightClick(e, slot)} onClick={(e) => onClick(e, slot)} onMouseDown={(e) => onMouseDown(e, slot)} onMouseEnter={(e) => onHover(slot.item, e, slot.slotId)} onMouseLeave={(e) => onHover(null, e, -1)} onMouseMove={(e) => slot.item && onHover(slot.item, e, slot.slotId)} draggable={!!slot.item} onDragStart={handleDragStart} onDragOver={handleDragStart} onDragLeave={handleDragLeave} onDrop={handleDrop} style={slotStyle}
      className={`relative ${baseSize} rounded-xl border transition-all flex items-center justify-center overflow-hidden ${isOver ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-110 z-10' : 'border-white/5 hover:border-white/30 hover:bg-white/10'} ${slot.item ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      {hotbarLabel && !slot.item && ( <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/10 select-none"> {hotbarLabel} </span> )}
      {hotbarLabel && slot.item && ( <span className="absolute top-1 left-2 text-[9px] font-bold text-white/50 bg-black/50 px-1 rounded backdrop-blur-sm z-20"> {hotbarLabel} </span> )}
      {slot.item && ( <> <div className="pointer-events-none transform transition-transform duration-200"> <DetailedItemIcon item={slot.item} size={context === 'hotbar' ? 48 : 32} /> </div> {slot.count > 1 && ( <span className="absolute bottom-1 right-1 text-[9px] font-bold text-white bg-black/70 px-1 rounded backdrop-blur-sm pointer-events-none">x{slot.count}</span> )} {slot.item.durability !== undefined && ( <div className="absolute bottom-1 left-1 right-1 h-[2px] bg-black/50 rounded-full overflow-hidden"> <div className={`h-full ${slot.item.durability < 30 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${(slot.item.durability / (slot.item.maxDurability || 100)) * 100}%` }} /> </div> )} </> )}
    </div>
  );
};
