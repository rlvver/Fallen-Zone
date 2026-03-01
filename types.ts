
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  INVENTORY = 'INVENTORY',
  PAUSED = 'PAUSED',
  DEAD = 'DEAD',
  DIALOGUE = 'DIALOGUE',
  TRADE = 'TRADE',
  AI_TERMINAL = 'AI_TERMINAL'
}

export type Faction = 'VANGUARD' | 'ECLIPSE' | 'SYNDICATE' | 'ADMIN';

export enum ItemType {
  WEAPON_PRIMARY = 'WEAPON_PRIMARY',
  WEAPON_SECONDARY = 'WEAPON_SECONDARY',
  WEAPON_SIDEARM = 'WEAPON_SIDEARM',
  WEAPON_MELEE = 'WEAPON_MELEE',
  AMMO = 'AMMO',
  HEAD = 'HEAD',
  CHEST = 'CHEST',
  LEGS = 'LEGS',
  FEET = 'FEET',
  HANDS = 'HANDS',
  BACKPACK = 'BACKPACK',
  ARTIFACT = 'ARTIFACT',
  TOOL_PICKAXE = 'TOOL_PICKAXE',
  TOOL_AXE = 'TOOL_AXE',
  TOOL_SHOVEL = 'TOOL_SHOVEL',
  TOOL_SICKLE = 'TOOL_SICKLE',
  TOOL_HAMMER = 'TOOL_HAMMER',
  TOOL_ROD = 'TOOL_ROD',
  CONSUMABLE = 'CONSUMABLE',
  MEDICAL = 'MEDICAL',
  GRENADE = 'GRENADE',
  RESOURCE = 'RESOURCE',
  MISC = 'MISC'
}

// Simplified Asset Types - ONLY Road and Lamp
export type AssetType = 
  | 'ROAD_LAMP_POST'
  | 'ROAD_STRAIGHT'
  | 'HIGHWAY_STRAIGHT';

export interface WorldAsset {
  id: string;
  type: AssetType;
  x: number;
  y: number;
  z: number;
  rotation: number;
  scale: number;
  collider: { width: number; height: number; depth: number };
  color?: string; // Optional override
}

export enum Rarity {
  COMMON = '#9ca3af',
  UNCOMMON = '#22c55e',
  RARE = '#3b82f6',
  EPIC = '#a855f7',
  LEGENDARY = '#eab308',
  ADMIN = '#ff0000'
}

export interface InventorySlot {
  slotId: number;
  item: Item | null;
  count: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: Rarity;
  icon: string;
  weight: number;
  maxStack: number;
  durability?: number;
  maxDurability?: number;
  damage?: number;
  range?: number;
  fireRate?: number;
  ammoType?: string;
  zoomFov?: number;
  magCapacity?: number;
  currentAmmo?: number;
  reloadTime?: number;
  traceColor?: number;
  bulletSpeed?: number;
  healthRestore?: number;
  hungerRestore?: number;
  thirstRestore?: number;
  defense?: number;
  gatheringPower?: number;
  gatheringSpeed?: number;
  maxWeightBonus?: number;
  storage?: InventorySlot[];
  count?: number;
}

export interface EquipmentState {
  head: Item | null;
  chest: Item | null;
  hands: Item | null;
  legs: Item | null;
  feet: Item | null;
  backpack: Item | null;
  artifact: Item | null;
  primary: Item | null;
  secondary: Item | null;
  sidearm: Item | null;
  melee: Item | null;
  pickaxe: Item | null;
  axe: Item | null;
  shovel: Item | null;
  sickle: Item | null;
  hammer: Item | null;
  rod: Item | null;
  ammo762: Item | null;
  ammo556: Item | null;
  ammo9mm: Item | null;
  ammo12g: Item | null;
  ammo44: Item | null;
}

export interface WorldContainer {
  id: string;
  type: 'storage' | 'drop' | 'body';
  position: { x: number; y: number; z: number };
  rotation: number;
  items: InventorySlot[];
  expiresAt: number;
  capacity: number;
  velocity?: { x: number; y: number; z: number };
}

export interface NPC {
  id: string;
  name: string;
  dialogue: string;
  personality: string;
  position: { x: number; y: number; z: number };
  state: 'IDLE' | 'MOVING' | 'FOLLOWING';
  targetPosition: { x: number; y: number; z: number } | null;
  waitTimer: number;
  speed: number;
  rotation: number;
  role?: string;
  shopInventory?: InventorySlot[];
}

export interface EnemyVisualConfig {
  colorBody: string;
  colorEye: string;
  limbStyle: 'box' | 'cylinder';
  scale: number;
  hasArmor: boolean;
}

export interface Enemy {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  position: { x: number; y: number; z: number };
  isDead: boolean;
  state: 'IDLE' | 'MOVING' | 'ATTACKING';
  targetPosition: { x: number; y: number; z: number } | null;
  waitTimer: number;
  speed: number;
  rotation: number;
  visualConfig?: EnemyVisualConfig;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  rewardXp: number;
  completed: boolean;
}

export interface PlayerStats {
  characterId?: string; // Unique ID for save slots
  name: string;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  hunger: number;
  maxHunger: number;
  thirst: number;
  maxThirst: number;
  sickness: number;
  
  // Combat/Survival Level
  level: number;
  xp: number;
  maxXp: number;
  
  // Reputation/Faction Level
  repLevel: number;
  repXp: number;
  maxRepXp: number;

  credits: number;
  fame: number; // Alignment (-100 to 100)
  faction: Faction;
  guild?: string;
  attack: number;
  defense: number;
  speed: number;
  weight: number;
  maxWeight: number;
  maxBeltAmmo: number;
  unlockedPerks: string[];
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  rotation: number;
  viewPitch: number;
  isGrounded: boolean;
  isCrouching: boolean;
  isSliding: boolean;
  isFlying?: boolean; 
  // Admin Flags
  isAdmin?: boolean;
  isGhost?: boolean; // Noclip, Invisible, No Gravity
  jumpCount: number;
}

export interface XpOrb {
  id: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  value: number;
  color: string;
  createdAt: number;
  type?: 'combat' | 'reputation'; // Type of XP
}

export interface VisualEffect {
  id: string;
  type: 'tracer' | 'impact' | 'drop';
  startPosition?: { x: number; y: number; z: number };
  endPosition?: { x: number; y: number; z: number };
  color?: number;
  createdAt: number;
}

export interface LogMessage {
  id: string;
  text: string;
  timestamp: number;
  type: 'info' | 'warning' | 'danger' | 'loot' | 'ai';
}

export interface CombatLogEntry {
  id: string;
  text: string;
  timestamp: number;
  source: 'player' | 'enemy' | 'system';
  isCritical?: boolean;
}

// Multiplayer Type
export interface RemotePlayer {
    id: string; // User UID
    name: string;
    position: { x: number; y: number; z: number };
    rotation: number;
    faction: Faction;
    isCrouching: boolean;
    lastSeen: number; // To cull disconnected players
}

// Updated Inventory Tabs for new Admin structure
export type InventoryTab = 'inventory' | 'perks' | 'missions' | 'map' | 'admin_spawn' | 'admin_build' | 'admin_players' | 'admin_stats' | 'admin_seasons';

export type InventoryContextType = 'inventory' | 'hotbar' | 'container' | 'backpack' | 'equipment';

// NEW: Placement Mode for Building
export interface PlacementState {
    active: boolean;
    assetType: AssetType | null;
    rotation: number;
    position: { x: number; y: number; z: number };
    isValid: boolean;
}

export interface GameContextState {
  gameState: GameState;
  serverId: string; // Current Active Server
  stats: PlayerStats;
  inventory: InventorySlot[];
  hotbar: InventorySlot[];
  activeHotbarSlot: number;
  equipment: EquipmentState;
  containers: WorldContainer[];
  npcs: NPC[];
  enemies: Enemy[];
  worldAssets: WorldAsset[]; // DYNAMIC WORLD ASSETS
  remotePlayers: RemotePlayer[]; // Multiplayer Sync
  activeMissions: Mission[];
  pings: { position: { x: number; y: number; z: number }; createdAt: number }[];
  xpOrbs: XpOrb[];
  effects: VisualEffect[];
  activeContainerId: string | null;
  activeNpcId: string | null;
  activeInventoryTab: InventoryTab;
  messages: LogMessage[];
  combatLog: CombatLogEntry[];
  isAiming: boolean;
  showRadialMenu: boolean;
  showAiAssistant: boolean; 
  isFlashlightOn: boolean;
  selectedWeaponSlot: 'primary' | 'secondary' | 'sidearm' | 'melee';
  activeItemSource: 'hotbar' | 'inventory';
  lastAttackTime: number;
  lastMeleeTime: number;
  isReloading: boolean;
  reloadEndTime: number;
  timeOfDay: number;
  placement: PlacementState; // NEW: Building System
  inputs: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    sprint: boolean;
    jump: boolean;
    crouch: boolean;
    interact: boolean;
  };
}

export type Action =
  | { type: 'TICK'; payload: { delta: number } }
  | { type: 'START_GAME'; payload: { faction: Faction; name: string; guild: string; position?: {x:number, y:number, z:number}; serverId: string } }
  | { type: 'SET_STATE'; payload: GameState }
  | { type: 'SET_INPUT'; payload: Partial<GameContextState['inputs']> }
  | { type: 'LOOK'; payload: { yaw: number; pitch: number } }
  | { type: 'CONSUME_ITEM'; payload: { slotId: number; context: InventoryContextType } }
  | { type: 'EQUIP_ITEM'; payload: { slotId: number; context: InventoryContextType } }
  | { type: 'UNEQUIP_ITEM'; payload: { slotKey: keyof EquipmentState } }
  | { type: 'MOVE_ITEM'; payload: { fromSlot: number; fromContext: InventoryContextType; toSlot: number; toContext: InventoryContextType; count?: number } }
  | { type: 'DROP_ITEM'; payload: { slotId: number; context: InventoryContextType; count?: number } }
  | { type: 'SPLIT_STACK'; payload: { slotId: number; context: InventoryContextType } }
  | { type: 'USE_HELD_ITEM'; payload?: { targetId?: string; distance?: number; attackType: 'ranged' | 'melee'; startPos?: {x:number, y:number, z:number}; endPos?: {x:number, y:number, z:number}; isHeadshot?: boolean } }
  | { type: 'RELOAD_WEAPON' }
  | { type: 'TAKE_DAMAGE'; payload: number }
  | { type: 'RESPAWN' }
  | { type: 'SUICIDE' } 
  | { type: 'INTERACT'; payload?: string } 
  | { type: 'CLOSE_CONTAINER' }
  | { type: 'CLOSE_UI' }
  | { type: 'SET_ACTIVE_SLOT'; payload: number }
  | { type: 'SET_INVENTORY_TAB'; payload: InventoryTab }
  | { type: 'ADD_MESSAGE'; payload: LogMessage }
  | { type: 'ADD_COMBAT_LOG'; payload: CombatLogEntry }
  | { type: 'QUICK_STACK' }
  | { type: 'LOOT_ALL' }
  | { type: 'SORT_INVENTORY' }
  | { type: 'ADD_PING'; payload: { position: { x: number; y: number; z: number } } }
  | { type: 'SPAWN_XP'; payload: { position: { x: number; y: number; z: number }; amount: number; color?: string; type?: 'combat' | 'reputation' } }
  | { type: 'ADD_EFFECT'; payload: VisualEffect }
  | { type: 'REMOVE_EFFECT'; payload: string }
  | { type: 'SET_AIMING'; payload: boolean }
  | { type: 'SET_RADIAL_MENU'; payload: boolean }
  | { type: 'TOGGLE_FLASHLIGHT' } 
  | { type: 'TOGGLE_AI_ASSISTANT' }
  | { type: 'SELECT_WEAPON_SLOT'; payload: 'primary' | 'secondary' | 'sidearm' | 'melee' }
  | { type: 'ADD_MISSION'; payload: Mission }
  | { type: 'SPAWN_NPC'; payload: NPC }
  | { type: 'SPAWN_ENEMY'; payload: Enemy }
  | { type: 'SPAWN_DROP'; payload: { item: Item; position?: { x: number; y: number; z: number } } }
  | { type: 'MARK_SEEN'; payload: string }
  | { type: 'BUY_ITEM'; payload: { slotId: number } }
  | { type: 'SELL_ITEM'; payload: { slotId: number; context: InventoryContextType } }
  | { type: 'UNLOCK_PERK'; payload: { perkId: string; cost: number; bonusType: 'belt_ammo' | 'weight'; bonusValue: number } }
  | { type: 'SAVE_GAME' } 
  | { type: 'LOAD_GAME' } 
  | { type: 'LOAD_GAME_DATA'; payload: any }
  | { type: 'UPDATE_REMOTE_PLAYERS'; payload: RemotePlayer[] }
  // BUILDING ACTIONS
  | { type: 'START_PLACEMENT'; payload: AssetType }
  | { type: 'UPDATE_PLACEMENT'; payload: { position: {x:number, y:number, z:number}, isValid: boolean } }
  | { type: 'ROTATE_PLACEMENT'; payload: number } // +1 or -1 direction
  | { type: 'CONFIRM_PLACEMENT' }
  | { type: 'CANCEL_PLACEMENT' };
