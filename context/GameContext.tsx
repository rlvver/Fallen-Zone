
import React, { createContext, useContext, ReactNode, useSyncExternalStore } from 'react';
import { GameContextState, Action, GameState, WorldAsset } from '../types';
import { INITIAL_EQUIPMENT, getInitialInventory, getInitialHotbar, WORLD_ASSETS, INITIAL_CONTAINERS, INITIAL_NPCS, INITIAL_ENEMIES } from '../constants';
import { tickStats } from '../services/gameLogic';

const initialState: GameContextState = {
  gameState: GameState.MENU,
  serverId: 'us-east',
  stats: {
    name: 'Survivor',
    health: 100, maxHealth: 100,
    stamina: 100, maxStamina: 100,
    hunger: 100, maxHunger: 100,
    thirst: 100, maxThirst: 100,
    sickness: 0,
    level: 1, xp: 0, maxXp: 1000,
    repLevel: 1, repXp: 0, maxRepXp: 1000,
    credits: 0, fame: 0,
    faction: 'VANGUARD',
    attack: 0, defense: 0, speed: 0,
    weight: 0, maxWeight: 60,
    maxBeltAmmo: 0,
    unlockedPerks: [],
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    rotation: 0, viewPitch: 0,
    isGrounded: true, isCrouching: false, isSliding: false, jumpCount: 0
  },
  inventory: getInitialInventory(),
  hotbar: getInitialHotbar(),
  activeHotbarSlot: 0,
  equipment: INITIAL_EQUIPMENT,
  containers: INITIAL_CONTAINERS,
  npcs: INITIAL_NPCS,
  enemies: INITIAL_ENEMIES,
  worldAssets: WORLD_ASSETS,
  remotePlayers: [],
  activeMissions: [],
  pings: [],
  xpOrbs: [],
  effects: [],
  activeContainerId: null,
  activeNpcId: null,
  activeInventoryTab: 'inventory',
  messages: [],
  combatLog: [],
  isAiming: false,
  showRadialMenu: false,
  showAiAssistant: false,
  isFlashlightOn: false,
  selectedWeaponSlot: 'primary',
  activeItemSource: 'hotbar',
  lastAttackTime: 0,
  lastMeleeTime: 0,
  isReloading: false,
  reloadEndTime: 0,
  timeOfDay: 0.5,
  placement: {
    active: false,
    assetType: null,
    rotation: 0,
    position: { x: 0, y: 0, z: 0 },
    isValid: false
  },
  inputs: {
    forward: false, backward: false, left: false, right: false,
    sprint: false, jump: false, crouch: false, interact: false
  }
};

const gameReducer = (state: GameContextState, action: Action): GameContextState => {
  switch (action.type) {
    case 'TICK':
      const dt = action.payload.delta;
      return { ...state, stats: tickStats(state.stats, state.inputs, dt), timeOfDay: (state.timeOfDay + dt * 0.0001) % 1 };
    case 'START_GAME':
      return {
        ...state,
        gameState: GameState.PLAYING,
        stats: { ...state.stats, faction: action.payload.faction, name: action.payload.name, guild: action.payload.guild, position: action.payload.position || state.stats.position },
        serverId: action.payload.serverId
      };
    case 'SET_STATE':
        return { ...state, gameState: action.payload };
    case 'SET_INPUT':
        return { ...state, inputs: { ...state.inputs, ...action.payload } };
    case 'LOOK':
        return { ...state, stats: { ...state.stats, rotation: action.payload.yaw, viewPitch: action.payload.pitch } };
    case 'START_PLACEMENT':
        return { 
            ...state, 
            gameState: GameState.PLAYING,
            placement: { ...state.placement, active: true, assetType: action.payload } 
        };
    case 'UPDATE_PLACEMENT':
        return { ...state, placement: { ...state.placement, position: action.payload.position, isValid: action.payload.isValid } };
    case 'ROTATE_PLACEMENT':
        return { ...state, placement: { ...state.placement, rotation: state.placement.rotation + (action.payload * Math.PI / 4) } };
    case 'CONFIRM_PLACEMENT': {
        if (!state.placement.active || !state.placement.isValid || !state.placement.assetType) return state;
        
        let width = 1, height = 1, depth = 1;
        const type = state.placement.assetType;
        if (type.includes('LAMP')) { width = 0.5; height = 4; depth = 0.5; }
        else if (type === 'ROAD_STRAIGHT') { width = 8; height = 0.2; depth = 10; }
        else if (type === 'HIGHWAY_STRAIGHT') { width = 26; height = 0.2; depth = 40; }

        const uniqueId = `asset_${state.placement.assetType}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        const newAsset: WorldAsset = {
            id: uniqueId,
            type: state.placement.assetType,
            x: state.placement.position.x,
            y: state.placement.position.y,
            z: state.placement.position.z,
            rotation: state.placement.rotation,
            scale: 1,
            collider: { width, height, depth },
            color: '#777'
        };

        return {
            ...state,
            worldAssets: [...state.worldAssets, newAsset],
            messages: [...state.messages, { id: Date.now().toString(), text: 'Structure Placed', type: 'info', timestamp: Date.now() }]
        };
    }
    case 'CANCEL_PLACEMENT':
        return { ...state, placement: { ...state.placement, active: false, assetType: null } };
    case 'EQUIP_ITEM':
        return state;
    case 'UNEQUIP_ITEM':
        return state;
    case 'MOVE_ITEM':
        return state;
    case 'DROP_ITEM':
        return state;
    case 'CONSUME_ITEM':
        return state;
    case 'RELOAD_WEAPON':
        return state;
    case 'SPAWN_NPC':
        return { ...state, npcs: [...state.npcs, action.payload] };
    case 'SPAWN_ENEMY':
        return { ...state, enemies: [...state.enemies, action.payload] };
    case 'ADD_MISSION':
        return { ...state, activeMissions: [...state.activeMissions, action.payload] };
    case 'SPAWN_DROP':
        return state;
    case 'ADD_MESSAGE':
        return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_ACTIVE_SLOT':
        return { ...state, activeHotbarSlot: action.payload };
    case 'SET_INVENTORY_TAB':
        return { ...state, activeInventoryTab: action.payload };
    case 'CLOSE_UI':
        return { ...state, gameState: GameState.PLAYING, activeContainerId: null, activeNpcId: null };
    case 'CLOSE_CONTAINER':
        return { ...state, activeContainerId: null };
    case 'RESPAWN':
        return { ...state, gameState: GameState.PLAYING, stats: { ...state.stats, health: 100, isDead: false } } as any;
    case 'LOAD_GAME_DATA':
        return { ...state, ...action.payload };
    case 'TOGGLE_AI_ASSISTANT':
        return { ...state, showAiAssistant: !state.showAiAssistant };
    case 'TOGGLE_FLASHLIGHT':
        return { ...state, isFlashlightOn: !state.isFlashlightOn };
    case 'LOOT_ALL':
        return state;
    case 'SORT_INVENTORY':
        return state;
    default:
        return state;
  }
};

class GameStore {
  state: GameContextState;
  listeners = new Set<() => void>();
  
  constructor(initialState: GameContextState) {
    this.state = initialState;
  }
  
  dispatch = (action: Action) => {
    const nextState = gameReducer(this.state, action);
    if (nextState !== this.state) {
      this.state = nextState;
      this.listeners.forEach(l => l());
    }
  }
  
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  getState = () => this.state;
}

export const store = new GameStore(initialState);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useGame = () => {
  const state = useSyncExternalStore(store.subscribe, store.getState);
  return { state, dispatch: store.dispatch };
};

export const useGameSelector = <T,>(selector: (state: GameContextState) => T): T => {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState())
  );
};

export const getGameState = () => store.getState();
export const dispatchGame = (action: Action) => store.dispatch(action);
