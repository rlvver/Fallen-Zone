
import React, { useMemo } from 'react';
import { Item, ItemType, Rarity } from '../../../types';

export const DetailedItemIcon: React.FC<{ item: Item; size?: number }> = ({ item, size = 48 }) => {
    const uid = useMemo(() => Math.random().toString(36).substr(2, 9), []);
    
    // Define Gradients based on item rarity or material
    const renderDefs = () => (
        <defs>
            <linearGradient id={`metal-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6b7280" />
                <stop offset="50%" stopColor="#374151" />
                <stop offset="100%" stopColor="#111827" />
            </linearGradient>
            <linearGradient id={`gold-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fcd34d" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
            <linearGradient id={`wood-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#92400e" />
                <stop offset="50%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            <linearGradient id={`glass-blue-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id={`glass-red-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f87171" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#dc2626" stopOpacity="0.9" />
            </linearGradient>
            <radialGradient id={`glow-${uid}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor={item.rarity} stopOpacity="0.3" />
                <stop offset="100%" stopColor={item.rarity} stopOpacity="0" />
            </radialGradient>
        </defs>
    );

    const renderContent = () => {
        // --- WEAPONS ---
        if (item.id === 'm4a1') {
            return (
                <g transform="scale(0.8) translate(6,6)">
                    <path d="M5 45 L2 50 L2 60 L12 60 L15 50 Z" fill="#1f2937" stroke="#000" strokeWidth="0.5"/>
                    <rect x="15" y="42" width="25" height="12" rx="1" fill={`url(#metal-${uid})`} stroke="#000" strokeWidth="0.5"/>
                    <rect x="40" y="44" width="20" height="8" fill="#374151" stroke="#000" strokeWidth="0.5"/>
                    <rect x="60" y="46" width="10" height="4" fill="#111" />
                    <path d="M28 54 L25 70 L35 70 L36 54" fill="#111" stroke="#333" strokeWidth="0.5"/>
                    <path d="M18 54 L15 65 L22 65 L24 54" fill="#111" />
                    <rect x="18" y="38" width="35" height="4" fill="#000" />
                    <path d="M20 38 L20 34 L25 34 L25 38" fill="#000" /> 
                    <path d="M55 44 L55 36 L58 36 L58 44" fill="#000" /> 
                </g>
            );
        }
        if (item.id === 'ak_47' || item.id === 'ak47') {
            return (
                <g transform="scale(0.8) translate(6,6)">
                    <path d="M2 55 Q2 45 10 45 L18 45 L18 55 Q10 58 2 55" fill={`url(#wood-${uid})`} stroke="#451a03" strokeWidth="0.5"/>
                    <rect x="18" y="42" width="28" height="10" fill={`url(#metal-${uid})`} stroke="#000" strokeWidth="0.5"/>
                    <path d="M46 42 L60 42 L60 48 L46 50 Z" fill={`url(#wood-${uid})`} stroke="#451a03" strokeWidth="0.5"/>
                    <rect x="60" y="43" width="12" height="3" fill="#111" />
                    <path d="M30 52 Q35 75 45 75 L52 72 Q42 70 38 52" fill="#d97706" fillOpacity="0.3" stroke="#000" strokeWidth="0.5"/>
                    <path d="M30 52 Q35 75 45 75 L52 72 Q42 70 38 52" fill={`url(#metal-${uid})`} />
                    <path d="M22 52 L20 62 L26 62 L28 52" fill={`url(#wood-${uid})`} />
                </g>
            );
        }
        if (item.id.includes('sniper')) {
            return (
                <g transform="scale(0.7) translate(10,15)">
                    <rect x="10" y="45" width="40" height="8" fill="#2f3542" />
                    <rect x="50" y="46" width="45" height="4" fill="#111" />
                    <rect x="5" y="46" width="15" height="6" fill="#111" rx="2"/>
                    <rect x="25" y="38" width="20" height="4" fill="#000" />
                    <rect x="22" y="34" width="26" height="4" fill="#111" rx="1"/>
                    <path d="M22 34 L18 38 L52 38 L48 34" fill="#000" opacity="0.5"/>
                    <path d="M30 53 L28 60 L34 60 L36 53" fill="#111" />
                    <rect x="60" y="50" width="2" height="15" fill="#555" />
                    <rect x="65" y="50" width="2" height="15" fill="#555" />
                </g>
            );
        }
        if (item.id.includes('smg') || item.id.includes('vector')) {
            return (
                <g transform="scale(0.9) translate(5,5)">
                    <rect x="15" y="35" width="30" height="15" fill="#111" stroke="#333" strokeWidth="1"/>
                    <rect x="45" y="40" width="10" height="5" fill="#111" />
                    <rect x="55" y="41" width="5" height="3" fill="#000" />
                    <rect x="10" y="40" width="5" height="8" fill="#333" />
                    <path d="M25 50 L22 65 L32 65 L35 50" fill="#111" stroke="#333" strokeWidth="0.5"/>
                    <rect x="38" y="50" width="8" height="25" fill="#222" stroke="#000" strokeWidth="0.5"/>
                </g>
            );
        }
        if (item.id.includes('pistol')) {
            return (
                <g transform="scale(1) translate(10,10)">
                    <rect x="20" y="30" width="35" height="10" rx="1" fill={`url(#metal-${uid})`} stroke="#000" strokeWidth="0.5"/>
                    <path d="M25 40 L22 55 L32 55 L35 40" fill="#1f2937" stroke="#000" strokeWidth="0.5"/>
                    <rect x="20" y="30" width="35" height="4" fill="#374151" opacity="0.5"/>
                </g>
            );
        }
        if (item.id.includes('revolver')) {
            return (
                <g transform="scale(1) translate(5,10)">
                    <rect x="25" y="32" width="30" height="6" fill="#9ca3af" />
                    <circle cx="25" cy="35" r="8" fill="#4b5563" stroke="#000" strokeWidth="1"/>
                    <circle cx="25" cy="35" r="2" fill="#111" />
                    <path d="M20 42 L15 55 L25 55 L28 42" fill={`url(#wood-${uid})`} stroke="#000" strokeWidth="0.5"/>
                </g>
            );
        }
        if (item.id.includes('shotgun')) {
            return (
                <g transform="scale(0.8) translate(5,15)">
                    <rect x="10" y="40" width="50" height="6" fill="#333" />
                    <rect x="10" y="48" width="35" height="4" fill={`url(#wood-${uid})`} />
                    <path d="M5 42 Q0 55 5 60 L15 60 L15 42" fill={`url(#wood-${uid})`} />
                    <rect x="15" y="38" width="20" height="10" fill="#111" />
                </g>
            );
        }
        if (item.id.includes('knife')) {
            return (
                <g transform="rotate(45 32 32) translate(10,10)">
                    <path d="M30 10 L30 40 L35 40 L35 15 L40 10 Z" fill={`url(#metal-${uid})`} stroke="#000" strokeWidth="0.5"/>
                    <rect x="28" y="40" width="9" height="15" rx="2" fill="#111" />
                    <rect x="26" y="40" width="13" height="3" fill="#333" />
                </g>
            );
        }
        if (item.id.includes('grenade')) {
            return (
                <g transform="translate(16,16)">
                    <circle cx="16" cy="20" r="14" fill="#3f6212" stroke="#1a2e05" strokeWidth="1"/>
                    <path d="M16 6 L16 20" stroke="#000" strokeWidth="1"/>
                    <rect x="12" y="2" width="8" height="6" fill="#555" />
                    <circle cx="24" cy="8" r="3" fill="none" stroke="#999" strokeWidth="2" />
                    <line x1="8" y1="12" x2="24" y2="12" stroke="#1a2e05" opacity="0.5"/>
                    <line x1="6" y1="20" x2="26" y2="20" stroke="#1a2e05" opacity="0.5"/>
                    <line x1="8" y1="28" x2="24" y2="28" stroke="#1a2e05" opacity="0.5"/>
                    <line x1="16" y1="8" x2="16" y2="32" stroke="#1a2e05" opacity="0.5"/>
                </g>
            );
        }

        // --- AMMO ---
        if (item.type === ItemType.AMMO) {
            const isShell = item.id.includes('shell');
            const color = isShell ? '#b91c1c' : '#065f46';
            return (
                <g transform="translate(8,8)">
                    <rect x="8" y="12" width="32" height="28" rx="2" fill={color} stroke="white" strokeWidth="0.5" strokeOpacity="0.2"/>
                    <rect x="8" y="12" width="32" height="8" fill="rgba(0,0,0,0.2)" />
                    {isShell ? (
                        <rect x="20" y="24" width="8" height="12" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />
                    ) : (
                        <path d="M24 22 L27 26 L27 34 L21 34 L21 26 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="0.5" />
                    )}
                    <text x="24" y="46" textAnchor="middle" fontSize="8" fill="white" fontFamily="sans-serif" fontWeight="bold">{isShell ? '12g' : 'FMJ'}</text>
                </g>
            );
        }

        // --- MEDICAL ---
        if (item.id.includes('medkit')) {
            return (
                <g transform="translate(8,8)">
                    <rect x="4" y="8" width="40" height="32" rx="4" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2"/>
                    <rect x="20" y="4" width="8" height="6" fill="#991b1b" />
                    <rect x="19" y="16" width="10" height="16" fill="white" />
                    <rect x="12" y="21" width="24" height="6" fill="white" />
                    <path d="M4 14 L44 14" stroke="#7f1d1d" strokeWidth="1" opacity="0.3"/>
                </g>
            );
        }
        if (item.id.includes('bandage') || item.id.includes('bandaid')) {
            return (
                <g transform="translate(8,8)">
                    <circle cx="24" cy="24" r="16" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1"/>
                    <circle cx="24" cy="24" r="6" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1"/>
                    <path d="M24 8 L24 18" stroke="#d1d5db" strokeWidth="2" />
                    <path d="M40 24 L24 24" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4 2"/>
                </g>
            );
        }
        if (item.id.includes('syringe')) {
            return (
                <g transform="rotate(45 24 24) translate(12,4)">
                    <rect x="20" y="10" width="8" height="25" fill={`url(#glass-red-${uid})`} stroke="#991b1b" strokeWidth="0.5"/>
                    <line x1="24" y1="10" x2="24" y2="2" stroke="#9ca3af" strokeWidth="1"/>
                    <rect x="18" y="35" width="12" height="2" fill="#374151" />
                    <rect x="22" y="35" width="4" height="8" fill="#374151" />
                    <rect x="18" y="43" width="12" height="2" fill="#374151" />
                    <line x1="20" y1="15" x2="24" y2="15" stroke="white" strokeWidth="0.5" opacity="0.5"/>
                    <line x1="20" y1="20" x2="24" y2="20" stroke="white" strokeWidth="0.5" opacity="0.5"/>
                    <line x1="20" y1="25" x2="24" y2="25" stroke="white" strokeWidth="0.5" opacity="0.5"/>
                </g>
            );
        }

        // --- CONSUMABLES ---
        if (item.id.includes('canned') || item.id.includes('bean')) {
            return (
                <g transform="translate(12,8)">
                    <defs>
                        <linearGradient id={`can-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="30%" stopColor="#f87171" />
                            <stop offset="100%" stopColor="#b91c1c" />
                        </linearGradient>
                    </defs>
                    <ellipse cx="20" cy="8" rx="14" ry="4" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1"/>
                    <rect x="6" y="8" width="28" height="28" fill={`url(#can-${uid})`} />
                    <ellipse cx="20" cy="36" rx="14" ry="4" fill="#b91c1c" />
                    <path d="M6 8 L6 36 M34 8 L34 36" stroke="#7f1d1d" strokeWidth="0.5" opacity="0.5"/>
                    <rect x="10" y="16" width="20" height="12" fill="white" opacity="0.2" rx="1"/>
                    <text x="20" y="24" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#500">BEANS</text>
                </g>
            );
        }
        if (item.id.includes('water') || item.id.includes('drink')) {
            return (
                <g transform="translate(16,4)">
                    <path d="M12 10 L12 38 Q12 42 16 42 Q20 42 20 38 L20 10 Q20 8 18 6 L18 2 L14 2 L14 6 Q12 8 12 10" fill={`url(#glass-blue-${uid})`} stroke="#2563eb" strokeWidth="0.5"/>
                    <rect x="13" y="0" width="6" height="3" fill="#1e3a8a" />
                    <rect x="12" y="20" width="8" height="10" fill="white" opacity="0.3" />
                </g>
            );
        }

        // --- ARMOR ---
        if (item.type === ItemType.HEAD) {
            return (
                <g transform="translate(8,8)">
                    <path d="M8 20 Q8 5 24 5 Q40 5 40 20 L40 25 Q40 35 24 35 Q8 35 8 25 Z" fill="#374151" stroke="#111" strokeWidth="1"/>
                    <rect x="18" y="5" width="12" height="6" fill="#111" opacity="0.5" />
                    <path d="M8 20 L40 20" stroke="#000" strokeWidth="0.5" opacity="0.5"/>
                    <rect x="10" y="25" width="4" height="8" fill="#1f2937" />
                    <rect x="34" y="25" width="4" height="8" fill="#1f2937" />
                </g>
            );
        }
        if (item.type === ItemType.CHEST) {
            return (
                <g transform="translate(10,6)">
                    <path d="M10 5 L18 5 L20 10 L28 10 L30 5 L38 5 L38 35 L30 40 L18 40 L10 35 Z" fill="#374151" stroke="#111" strokeWidth="1"/>
                    <rect x="14" y="15" width="6" height="8" fill="#111" opacity="0.6" rx="1"/>
                    <rect x="22" y="15" width="6" height="8" fill="#111" opacity="0.6" rx="1"/>
                    <rect x="30" y="15" width="6" height="8" fill="#111" opacity="0.6" rx="1"/>
                    <rect x="15" y="26" width="20" height="10" fill="#1f2937" opacity="0.5" />
                </g>
            );
        }
        if (item.type === ItemType.BACKPACK) {
            return (
                <g transform="translate(10,8)">
                    <path d="M10 10 Q10 0 24 0 Q38 0 38 10 L38 35 Q38 40 24 40 Q10 40 10 35 Z" fill="#4b5563" stroke="#1f2937" strokeWidth="1"/>
                    <rect x="14" y="20" width="20" height="15" rx="2" fill="#374151" stroke="#111" strokeWidth="0.5"/>
                    <path d="M10 15 L38 15" stroke="#111" strokeWidth="0.5" opacity="0.5"/>
                    <rect x="18" y="2" width="12" height="4" fill="#1f2937" rx="1"/>
                </g>
            );
        }

        // --- TOOLS ---
        if (item.type === ItemType.TOOL_PICKAXE) {
            return (
                <g transform="translate(8,8) rotate(-15 24 24)">
                    <path d="M4 10 Q24 0 44 10 L42 14 Q24 6 6 14 Z" fill={`url(#metal-${uid})`} stroke="#000" strokeWidth="0.5"/>
                    <rect x="22" y="12" width="4" height="30" fill={`url(#wood-${uid})`} stroke="#271003" strokeWidth="0.5"/>
                </g>
            );
        }

        // Fallback Box
        return (
            <g transform="translate(8,12)">
                <rect x="8" y="8" width="32" height="32" rx="4" fill="#374151" stroke={item.rarity} strokeWidth="2" />
                <path d="M8 8 L40 40 M40 8 L8 40" stroke="#1f2937" strokeWidth="2" />
            </g>
        );
    };

    return (
        <div className="relative flex items-center justify-center drop-shadow-lg" style={{ width: size, height: size }}>
            {/* Background Glow */}
            <div className="absolute inset-0 rounded-full blur-xl" style={{ background: item.rarity, opacity: 0.15 }}></div>
            
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.5))' }}>
                {renderDefs()}
                {renderContent()}
            </svg>
        </div>
    );
};
