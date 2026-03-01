
import { Item, ItemType, Rarity, InventorySlot, EquipmentState } from '../types';
import { INVENTORY_SIZE } from './config';

const createItem = (id: string, name: string, type: ItemType, rarity: Rarity, icon: string, weight: number, extras: Partial<Item> = {}): Item => {
    const isDurable = type.includes('WEAPON') || type.includes('TOOL') || type.includes('HEAD') || type.includes('CHEST') || type.includes('LEGS') || type.includes('FEET') || type.includes('HANDS');
    const defaults: Partial<Item> = {};
    if (isDurable) { defaults.durability = 300; defaults.maxDurability = 300; }
    return { id, name, description: `Standard issue ${name.toLowerCase()}.`, type, rarity, icon, weight, maxStack: 1, ...defaults, ...extras };
};

export const generateEmptyInventory = (size: number): InventorySlot[] => {
    return Array.from({ length: size }, (_, i) => ({ slotId: i, item: null, count: 0 }));
};

// TRACER COLORS:
// 9mm (Common): Silver/White (#e5e7eb)
// Shells (Uncommon): Toxic Green (#22c55e)
// 5.56 (Rare): Neon Blue (#3b82f6)
// 7.62 (Epic/Leg): Purple (#a855f7) or Gold (#fbbf24)
// .44 (Epic): Red/Orange (#f97316)

export const ITEMS: Record<string, Item> = {
    // 5.56 - RARE (Blue Tracers)
    'm4a1': createItem('m4a1', 'M4A1 Carbine', ItemType.WEAPON_PRIMARY, Rarity.RARE, 'crosshair', 3.5, { damage: 25, range: 150, fireRate: 100, ammoType: 'ammo_556', zoomFov: 45, magCapacity: 30, currentAmmo: 30, reloadTime: 2000, traceColor: 0x3b82f6, bulletSpeed: 250 }),
    
    // 7.62 - EPIC (Gold/Purple Tracers)
    'ak47': createItem('ak_47', 'AK-47', ItemType.WEAPON_PRIMARY, Rarity.EPIC, 'crosshair', 4.0, { damage: 32, range: 120, fireRate: 120, ammoType: 'ammo_762', zoomFov: 50, magCapacity: 30, currentAmmo: 30, reloadTime: 2500, traceColor: 0xa855f7, bulletSpeed: 220 }),
    'sniper_rifle': createItem('sniper_rifle', 'L96 Sniper', ItemType.WEAPON_PRIMARY, Rarity.LEGENDARY, 'crosshair', 6.0, { damage: 150, range: 400, fireRate: 1500, ammoType: 'ammo_762', zoomFov: 15, magCapacity: 5, currentAmmo: 5, reloadTime: 4000, traceColor: 0xfbbf24, bulletSpeed: 400 }),
    
    // 9mm - COMMON (White/Silver Tracers)
    'vector_smg': createItem('vector_smg', 'Vector SMG', ItemType.WEAPON_SECONDARY, Rarity.RARE, 'disc', 2.8, { damage: 18, range: 40, fireRate: 50, ammoType: 'ammo_9mm', magCapacity: 33, currentAmmo: 33, reloadTime: 1500, traceColor: 0xe5e7eb, bulletSpeed: 180 }),
    'pistol': createItem('pistol_9mm', '9mm Pistol', ItemType.WEAPON_SIDEARM, Rarity.COMMON, 'target', 1.0, { damage: 20, range: 50, fireRate: 200, ammoType: 'ammo_9mm', magCapacity: 15, currentAmmo: 15, reloadTime: 1200, traceColor: 0x9ca3af, bulletSpeed: 150 }),
    
    // Shells - UNCOMMON (Green Tracers/Pellets)
    'shotgun': createItem('pump_shotgun', 'Pump Shotgun', ItemType.WEAPON_SECONDARY, Rarity.UNCOMMON, 'disc', 3.0, { damage: 90, range: 20, fireRate: 1000, ammoType: 'ammo_shells', magCapacity: 8, currentAmmo: 8, reloadTime: 5000, traceColor: 0x22c55e, bulletSpeed: 120 }),
    
    // .44 - EPIC (Red Tracers)
    'magnum_revolver': createItem('magnum_revolver', 'Magnum Revolver', ItemType.WEAPON_SIDEARM, Rarity.EPIC, 'target', 1.5, { damage: 75, range: 70, fireRate: 600, ammoType: 'ammo_44', magCapacity: 6, currentAmmo: 6, reloadTime: 3000, traceColor: 0xf97316, bulletSpeed: 200 }),
    
    'knife': createItem('combat_knife', 'Combat Knife', ItemType.WEAPON_MELEE, Rarity.COMMON, 'sword', 0.5, { damage: 35, range: 2.5 }),
    'frag_grenade': createItem('frag_grenade', 'Frag Grenade', ItemType.GRENADE, Rarity.UNCOMMON, 'bomb', 0.4, { damage: 150, range: 8, maxStack: 5 }),
    'ammo_556': createItem('ammo_556', '5.56mm Ammo', ItemType.AMMO, Rarity.COMMON, 'box', 0.02, { maxStack: 60 }),
    'ammo_762': createItem('ammo_762', '7.62mm Ammo', ItemType.AMMO, Rarity.UNCOMMON, 'box', 0.02, { maxStack: 60 }),
    'ammo_shells': createItem('ammo_shells', 'Shotgun Shells', ItemType.AMMO, Rarity.COMMON, 'box', 0.05, { maxStack: 20 }),
    'ammo_9mm': createItem('ammo_9mm', '9mm Ammo', ItemType.AMMO, Rarity.COMMON, 'box', 0.01, { maxStack: 100 }),
    'ammo_44': createItem('ammo_44', '.44 Magnum Ammo', ItemType.AMMO, Rarity.RARE, 'box', 0.03, { maxStack: 40 }),
    'medkit': createItem('medkit', 'Medkit', ItemType.MEDICAL, Rarity.UNCOMMON, 'activity', 0.5, { healthRestore: 50, maxStack: 5 }),
    'bandage': createItem('bandage', 'Bandage', ItemType.MEDICAL, Rarity.COMMON, 'activity', 0.1, { healthRestore: 15, maxStack: 10 }),
    'bandaid': createItem('bandaid', 'Bandaid', ItemType.MEDICAL, Rarity.COMMON, 'activity', 0.05, { healthRestore: 5, maxStack: 20 }),
    'syringe': createItem('syringe', 'Stim Syringe', ItemType.MEDICAL, Rarity.RARE, 'zap', 0.2, { healthRestore: 25, hungerRestore: -5, maxStack: 5 }),
    'canned_beans': createItem('canned_beans', 'Canned Beans', ItemType.CONSUMABLE, Rarity.COMMON, 'utensils', 0.3, { hungerRestore: 30, maxStack: 10 }),
    'water_bottle': createItem('water_bottle', 'Water Bottle', ItemType.CONSUMABLE, Rarity.COMMON, 'droplet', 0.5, { thirstRestore: 40, maxStack: 10 }),
    'pickaxe': createItem('pickaxe_iron', 'Iron Pickaxe', ItemType.TOOL_PICKAXE, Rarity.UNCOMMON, 'pickaxe', 2.0, { gatheringPower: 10 }),
    'helmet_tactical': createItem('helmet_tactical', 'Tactical Helmet', ItemType.HEAD, Rarity.RARE, 'shield', 1.5, { defense: 15 }),
    'vest_heavy': createItem('vest_heavy', 'Heavy Vest', ItemType.CHEST, Rarity.EPIC, 'shield', 5.0, { defense: 35 }),
    'backpack_large': createItem('backpack_large', 'Large Backpack', ItemType.BACKPACK, Rarity.RARE, 'backpack', 1.0, { maxWeightBonus: 20, storage: generateEmptyInventory(8) }),
};

export const INITIAL_EQUIPMENT: EquipmentState = {
    head: null, chest: null, hands: null, legs: null, feet: null,
    backpack: null, artifact: null,
    primary: null, secondary: null, sidearm: null, melee: ITEMS['knife'],
    pickaxe: null, axe: null, shovel: null, sickle: null, hammer: null, rod: null,
    ammo762: null, ammo556: null, ammo9mm: null, ammo12g: null, ammo44: null
};

export const getInitialInventory = (): InventorySlot[] => {
    const inv = generateEmptyInventory(INVENTORY_SIZE);
    inv[0] = { slotId: 0, item: ITEMS['canned_beans'], count: 3 };
    inv[1] = { slotId: 1, item: ITEMS['water_bottle'], count: 2 };
    inv[2] = { slotId: 2, item: ITEMS['ammo_9mm'], count: 30 };
    inv[3] = { slotId: 3, item: ITEMS['ammo_556'], count: 60 };
    inv[4] = { slotId: 4, item: ITEMS['bandage'], count: 5 };
    return inv;
};

export const getInitialHotbar = (): InventorySlot[] => {
    const bar = generateEmptyInventory(2); 
    bar[0] = { slotId: 0, item: ITEMS['frag_grenade'], count: 2 };
    bar[1] = { slotId: 1, item: ITEMS['medkit'], count: 1 };
    return bar;
};

export const generateRandomLoot = (): Item => {
    const keys = Object.keys(ITEMS);
    return ITEMS[keys[Math.floor(Math.random() * keys.length)]];
};
