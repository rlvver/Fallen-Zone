
import React from 'react';
import { useGameSelector, dispatchGame, getGameState } from '../context/GameContext';
import { GameState } from '../types';
import { Play, RotateCcw, Settings, LogOut, Users, Power, Bug, Sliders } from 'lucide-react';
import { logoutUser, saveGameToCloud, auth } from '../services/firebase';

export const PauseMenu: React.FC = () => {
  const gameState = useGameSelector(state => state.gameState);

  if (gameState !== GameState.PAUSED) return null;

  const handleReturnToChars = async () => {
      if (auth.currentUser) {
          // Save game before returning to menu
          await saveGameToCloud(getGameState(), auth.currentUser);
      }
      // Set state to MENU. The MainMenu component will detect the active user session 
      // and automatically show the Character Selection screen.
      dispatchGame({ type: 'SET_STATE', payload: GameState.MENU });
  };

  const handleLogout = async () => {
      if (auth.currentUser) {
          await saveGameToCloud(getGameState(), auth.currentUser);
          await logoutUser();
      }
      dispatchGame({ type: 'SET_STATE', payload: GameState.MENU });
  };

  return (
    <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
      <div className="w-[400px] bg-[#09090b]/95 border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <h2 className="text-2xl font-tech font-bold uppercase tracking-widest text-white flex items-center gap-3">
                <Settings size={24} className="text-cyan-500" /> System Menu
            </h2>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Fallen Zone OS</div>
        </div>

        {/* Menu Items */}
        <div className="p-2 flex flex-col gap-1">
            <button 
                onClick={() => dispatchGame({ type: 'SET_STATE', payload: GameState.PLAYING })}
                className="group flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
            >
                <div className="w-10 h-10 bg-cyan-900/20 rounded-lg flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                    <Play size={20} fill="currentColor" />
                </div>
                <div className="text-left">
                    <div className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-cyan-400 transition-colors">Resume Operation</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">Return to zone</div>
                </div>
            </button>

            <button 
                onClick={() => alert("Settings Module Placeholder")}
                className="group flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
            >
                <div className="w-10 h-10 bg-purple-900/20 rounded-lg flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <Sliders size={20} />
                </div>
                <div className="text-left">
                    <div className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-purple-400 transition-colors">Settings</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">Audio, Video, Controls</div>
                </div>
            </button>

            <button 
                onClick={() => alert("Report sent to developer console.")}
                className="group flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
            >
                <div className="w-10 h-10 bg-orange-900/20 rounded-lg flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Bug size={20} />
                </div>
                <div className="text-left">
                    <div className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-orange-400 transition-colors">Report Bug / Suggest</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">Send feedback to devs</div>
                </div>
            </button>

            <button 
                onClick={() => {
                    dispatchGame({ type: 'RESPAWN' });
                    dispatchGame({ type: 'SET_STATE', payload: GameState.PLAYING });
                }}
                className="group flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
            >
                <div className="w-10 h-10 bg-yellow-900/20 rounded-lg flex items-center justify-center text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                    <RotateCcw size={20} />
                </div>
                <div className="text-left">
                    <div className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-yellow-400 transition-colors">Emergency Unstuck</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">Teleport to safe zone</div>
                </div>
            </button>

            <div className="h-px bg-white/10 my-2 mx-4" />

            <button 
                onClick={handleReturnToChars}
                className="group flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
            >
                <div className="w-10 h-10 bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Users size={20} />
                </div>
                <div className="text-left">
                    <div className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">Disconnect</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">Return to Character Select</div>
                </div>
            </button>

            <button 
                onClick={handleLogout}
                className="group flex items-center gap-4 p-4 hover:bg-red-900/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
            >
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-red-400 transition-colors">
                    <Power size={20} />
                </div>
                <div className="text-left">
                    <div className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-red-400 transition-colors">System Logout</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">Save & Exit Game</div>
                </div>
            </button>
        </div>
      </div>
    </div>
  );
};
