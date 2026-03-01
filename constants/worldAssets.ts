
import { AssetType, WorldAsset, WorldContainer, NPC, Enemy } from '../types';
import { ITEMS, generateEmptyInventory } from './items';

// --- TERRAIN HEIGHT ---
// Flat world logic - Always return 0
export const getTerrainHeight = (x: number, z: number): number => {
    return 0;
};

// Spawn point - Offset applied to prevent integer-aligned mesh snagging (Ref: Gemini Report)
export const SPAWN_POINT = { x: 0.05, y: 2, z: 0.05 }; 

// --- WORLD ASSETS ---
const generateAssets = (): WorldAsset[] => {
    const assets: WorldAsset[] = [];

    // SINGLE CONTINUOUS ROAD
    assets.push({
        id: 'road_main_highway',
        type: 'ROAD_STRAIGHT',
        x: 20, // 20m East of origin
        y: 0.05, // Slightly above 0 to prevent z-fighting with the new flat floor
        z: 0,   // Center of the world
        rotation: 0,
        scale: 1,
        // Depth 400 covers the area from Z=-200 to Z=200 in one solid piece
        collider: { width: 12, height: 0.2, depth: 400 },
        color: '#333'
    });

    return assets;
};

export const WORLD_ASSETS: WorldAsset[] = generateAssets();

export const OBSTACLES = WORLD_ASSETS.filter(a => a.type !== 'ROAD_STRAIGHT' && a.type !== 'HIGHWAY_STRAIGHT').map(a => ({
    x: a.x, y: a.y, z: a.z, 
    width: a.collider.width, height: a.collider.height, depth: a.collider.depth 
}));

// --- INITIAL CONTAINERS ---
export const INITIAL_CONTAINERS: WorldContainer[] = [
    {
        id: 'cont-starter-1',
        type: 'storage',
        position: { x: 5, y: 0.5, z: 5 },
        rotation: 0.4,
        capacity: 10,
        expiresAt: Infinity,
        items: [
            { slotId: 0, item: ITEMS['canned_beans'], count: 2 },
            { slotId: 1, item: ITEMS['water_bottle'], count: 1 },
            { slotId: 2, item: ITEMS['ammo_9mm'], count: 24 },
        ]
    },
    {
        id: 'cont-starter-2',
        type: 'storage',
        position: { x: -6, y: 0.5, z: 12 },
        rotation: -0.8,
        capacity: 8,
        expiresAt: Infinity,
        items: [
            { slotId: 0, item: ITEMS['bandage'], count: 2 },
            { slotId: 1, item: ITEMS['frag_grenade'], count: 1 },
        ]
    }
];

// --- INITIAL NPCs ---
export const INITIAL_NPCS: NPC[] = [];

// --- INITIAL ENEMIES ---
export const INITIAL_ENEMIES: Enemy[] = [];
