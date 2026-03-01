import React from 'react';
import { useGameSelector, dispatchGame } from '../context/GameContext';
import { GameState } from '../types';

export const DeathScreen: React.FC = () => {
  const gameState = useGameSelector(state => state.gameState);

  if (gameState !== GameState.DEAD) return null;

  return (
    <div className="absolute inset-0 z-[100] bg-red-900/40 backdrop-blur-md flex items-center justify-center flex-col animate-in zoom-in-95 duration-500">
      <h1 className="text-8xl font-black font-tech text-red-500 tracking-widest uppercase drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
        KIA
      </h1>
      <p className="text-xl mt-4 text-red-200 uppercase tracking-widest">Vital signs terminated</p>
      
      <div className="mt-12 space-y-4">
        <button 
          onClick={() => dispatchGame({ type: 'RESPAWN' })}
          className="px-12 py-4 bg-red-600 hover:bg-red-500 text-white font-bold tracking-widest text-lg uppercase clip-path-polygon border border-red-400 transition-all hover:scale-105"
        >
          Initialize Clone
        </button>
        <button 
           onClick={() => dispatchGame({ type: 'SET_STATE', payload: GameState.MENU })}
           className="block w-full px-12 py-3 bg-transparent hover:bg-black/30 text-red-300 text-sm uppercase border border-red-900/50"
        >
           Return to Menu
        </button>
      </div>
    </div>
  );
};
