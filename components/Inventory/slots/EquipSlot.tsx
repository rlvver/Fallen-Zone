
import React from 'react';
import { Item, Rarity } from '../../../types';
import { DetailedItemIcon } from '../visuals/ItemIcon';

export const EquipSlot: React.FC<{ item: Item | null; icon: React.ReactNode; onClick: () => void; onHover: (item: Item | null, e: React.MouseEvent) => void; label?: string; size?: 'normal' | 'large' | 'xl'; }> = ({ item, icon, onClick, onHover, label, size = 'normal' }) => {
  const sizeClasses = { normal: 'w-14 h-14', large: 'w-[4.5rem] h-[4.5rem]', xl: 'w-24 h-24' };
  const rarityGlow = (item && item.rarity !== Rarity.COMMON) ? `inset 0 0 20px ${item.rarity}20` : 'none';
  const style = item ? { borderColor: item.rarity, boxShadow: `0 0 15px ${item.rarity}40, ${rarityGlow}` } : {};
  
  const count = (item as any)?.count || 1;

  return (
    <div className="flex flex-col items-center gap-0.5 group">
      <div onClick={item ? onClick : undefined} onMouseEnter={(e) => onHover(item, e)} onMouseLeave={(e) => onHover(null, e)} onMouseMove={(e) => item && onHover(item, e)} style={style} className={`${sizeClasses[size]} rounded-xl border-2 border-dashed border-white/10 bg-black/20 flex items-center justify-center relative cursor-pointer hover:border-cyan-500/50 hover:bg-white/5 hover:scale-105 active:scale-95 transition-all duration-200 backdrop-blur-sm ${item ? 'border-solid border-opacity-70' : ''}`} >
        {!item && <div className="text-white/10 group-hover:text-white/30 transition-colors">{icon}</div>}
        {item && (
            <>
                <div className="animate-in zoom-in duration-300"><DetailedItemIcon item={item} size={size === 'xl' ? 64 : 40} /></div>
                {count > 1 && ( <span className="absolute bottom-1 right-1 text-[9px] font-bold text-white bg-black/70 px-1 rounded backdrop-blur-sm pointer-events-none">x{count}</span> )}
            </>
        )}
      </div>
      {label && <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold group-hover:text-cyan-400 transition-colors">{label}</span>}
    </div>
  );
};
