
import React, { useEffect } from 'react';
import { GameProvider, useGameSelector, getGameState } from './context/GameContext';
import { GameWorld } from './components/GameWorld';
import { HUD } from './components/HUD';
import { Inventory } from './components/Inventory/Inventory';
import { DeathScreen } from './components/DeathScreen';
import { MainMenu } from './components/MainMenu';
import { DialogueSystem } from './components/DialogueSystem';
import { AITerminal } from './components/AITerminal';
import { PauseMenu } from './components/PauseMenu';
import { TacticalAI } from './components/TacticalAI'; 
import { DevConsole } from './components/DevConsole'; 
import { GameState } from './types';

const GameContainer: React.FC = () => {
  const gameState = useGameSelector(state => state.gameState);
  
  // Only render the 3D world when NOT in the main menu.
  const isMenu = gameState === GameState.MENU;

  // Global Key Lock for Tab
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
        if (e.code === 'Tab') {
            // If NOT in Main Login Menu, prevent default browser tab switching
            if (getGameState().gameState !== GameState.MENU) {
                e.preventDefault();
            }
        }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* Layer 0: Game World (Simulated 3D / Background) */}
      <div className={`w-full h-full ${isMenu ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <GameWorld />
      </div>
      
      {/* Layer 1: Heads Up Display (Always active when playing) */}
      <HUD />

      {/* Layer 1.5: Tactical AI Overlay (Can be active during play) */}
      <TacticalAI />

      {/* Layer 2: Modal UIs */}
      <Inventory />
      <DialogueSystem />
      <AITerminal />
      <PauseMenu />
      <MainMenu />
      <DeathScreen />
      
      {/* Layer 99: Development Tools */}
      <DevConsole />

      {/* Vignette Overlay for atmosphere */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
};

export default App;
