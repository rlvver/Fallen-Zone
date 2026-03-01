
import React, { useState, useEffect } from 'react';
import { useGameSelector, dispatchGame } from '../context/GameContext';
import { GameState, Faction, ItemType } from '../types';
import { Play, Settings, ChevronRight, User as UserIcon, Users, Save, Globe, Activity, Shield, Crosshair, Cloud, Trash2, Plus, Server, MapPin, Zap, LogIn, WifiOff, Mail, Lock, Key, ArrowRight, LogOut, Check, Dna, EyeOff } from 'lucide-react';
import { FACTIONS, INITIAL_EQUIPMENT, getInitialInventory, getInitialHotbar, ITEMS, generateEmptyInventory } from '../constants';
import { loginWithGoogle, loginWithEmail, registerWithEmail, getUserCharacters, deleteCharacter, auth, createCharacter, getUserPreferences, saveUserPreferences, logoutUser } from '../services/firebase';

const SERVERS = [
    { id: 'us-east', name: 'US-East-1 (Official)', region: 'NA', ping: 24, pop: 'High' },
    { id: 'eu-central', name: 'EU-Central-1', region: 'EU', ping: 112, pop: 'Medium' },
    { id: 'asia-pacific', name: 'Asia-Pacific', region: 'ASIA', ping: 245, pop: 'Low' },
];

const SPAWN_POINTS = [
    { id: 'bunker', name: 'Bunker Alpha', desc: 'Safe Zone. Low resources.', pos: { x: 0, y: 15, z: 0 }, diff: 'Low' },
    { id: 'outpost', name: 'Outpost Sierra', desc: 'Contested. Moderate loot.', pos: { x: 200, y: 15, z: -200 }, diff: 'Med' },
    { id: 'ruins', name: 'City Ruins', desc: 'High Risk. Elite loot.', pos: { x: -200, y: 15, z: 150 }, diff: 'High' },
];

type MenuStep = 'LOGIN' | 'SERVERS' | 'CHARACTERS' | 'CREATE' | 'SPAWN';

export const MainMenu: React.FC = () => {
  const gameState = useGameSelector(state => state.gameState);
  const [step, setStep] = useState<MenuStep>('LOGIN');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [characters, setCharacters] = useState<any[]>([]);
  
  // Initialize email from LocalStorage if available
  const [email, setEmail] = useState(() => localStorage.getItem('fz_last_email') || '');
  const [rememberEmail, setRememberEmail] = useState(true);
  
  const [password, setPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedServer, setSelectedServer] = useState(SERVERS[0]);
  const [selectedSpawn, setSelectedSpawn] = useState(SPAWN_POINTS[0]);
  const [newCharName, setNewCharName] = useState('');
  const [newCharFaction, setNewCharFaction] = useState<Faction>('VANGUARD');

  // Load user data and preferences
  useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (user) {
              setCurrentUser(user);
              setIsLoading(true);
              
              // Load Characters
              try {
                  const chars = await getUserCharacters(user);
                  setCharacters(chars);
              } catch (e) {
                  console.error("Failed to load characters", e);
              }
              
              // Load Preferences (Favorite Server)
              const prefs = await getUserPreferences(user);
              if (prefs && prefs.favoriteServerId) {
                  const fav = SERVERS.find(s => s.id === prefs.favoriteServerId);
                  if (fav) {
                      setSelectedServer(fav);
                      // Only auto-advance if we are in the LOGIN phase
                      setStep(current => current === 'LOGIN' ? 'CHARACTERS' : current);
                  } else {
                      setStep(current => current === 'LOGIN' ? 'SERVERS' : current);
                  }
              } else {
                  setStep(current => current === 'LOGIN' ? 'SERVERS' : current);
              }
              
              setIsLoading(false);
          } else {
              if (!currentUser?.isGuest) {
                  setCurrentUser(null);
                  setStep('LOGIN');
              }
          }
      });
      return () => unsubscribe();
  }, [currentUser]); 

  const handleEmailAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setLoginError(null);
      
      // Save or Clear email based on checkbox
      if (rememberEmail) {
          localStorage.setItem('fz_last_email', email);
      } else {
          localStorage.removeItem('fz_last_email');
      }

      try {
          if (isSignUp) {
              if (!regUsername.trim()) throw new Error("Codename required for registration.");
              await registerWithEmail(email, password, regUsername);
          } else {
              await loginWithEmail(email, password);
          }
      } catch (err: any) {
          console.error("Auth Error:", err);
          let msg = "Authentication Failed";
          if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
              msg = "Invalid Credentials";
          } else if (err.code === 'auth/email-already-in-use') {
              msg = "Email already registered";
          } else if (err.code === 'auth/weak-password') {
              msg = "Password too weak (min 6 chars)";
          } else if (err.message) {
              msg = err.message;
          }
          setLoginError(msg);
      }
      setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
      setIsLoading(true);
      setLoginError(null);
      try {
          await loginWithGoogle();
      } catch (err: any) {
          setLoginError(err.code === 'auth/unauthorized-domain' ? "Domain Unauthorized. Try Offline Protocol." : "Connection Failed");
      }
      setIsLoading(false);
  };

  const handleGuestLogin = () => {
      const guestUser = { 
          uid: 'guest-' + Date.now(), 
          displayName: 'Rogue Agent', 
          isGuest: true 
      };
      setCurrentUser(guestUser);
      setCharacters([]); 
      setStep('SERVERS');
  };

  const handleDemoLogin = () => {
      setIsLoading(true);
      
      // 1. Random Identity
      const demoName = `Agent-${Math.floor(Math.random() * 9000) + 1000}`;
      const demoUser = { uid: 'demo-' + Date.now(), displayName: demoName, isGuest: true };
      setCurrentUser(demoUser);

      // 2. Random Equipment Helper
      const pickRandom = (type: ItemType) => {
          const pool = Object.values(ITEMS).filter(i => i.type === type);
          return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
      };

      const demoEquipment = { ...INITIAL_EQUIPMENT };
      demoEquipment.primary = pickRandom(ItemType.WEAPON_PRIMARY);
      demoEquipment.secondary = pickRandom(ItemType.WEAPON_SECONDARY);
      demoEquipment.head = pickRandom(ItemType.HEAD);
      demoEquipment.chest = pickRandom(ItemType.CHEST);
      demoEquipment.backpack = pickRandom(ItemType.BACKPACK);

      // 3. Populate Inventory with matching ammo
      const demoInventory = generateEmptyInventory(32);
      let slotIdx = 0;
      
      // Give ammo for primary
      if (demoEquipment.primary && demoEquipment.primary.ammoType) {
          const ammoItem = ITEMS[demoEquipment.primary.ammoType];
          if (ammoItem) {
              demoInventory[slotIdx] = { slotId: slotIdx, item: ammoItem, count: ammoItem.maxStack };
              slotIdx++;
              demoInventory[slotIdx] = { slotId: slotIdx, item: ammoItem, count: ammoItem.maxStack };
              slotIdx++;
          }
      }
      // Give some meds
      demoInventory[slotIdx] = { slotId: slotIdx, item: ITEMS['medkit'], count: 2 };
      slotIdx++;
      
      // 4. Construct Demo Character Data
      const demoCharData = {
          gameState: GameState.PLAYING, // FORCE START
          id: `demo-char-${Date.now()}`,
          profile: {
              name: demoName,
              faction: 'SYNDICATE',
              guild: 'DEMO_SQUAD',
              level: 10,
              xp: 5000,
              repLevel: 5,
              repXp: 1000,
              maxRepXp: 5000,
              credits: 9999,
              fame: 50
          },
          stats: {
              characterId: `demo-char-${Date.now()}`,
              name: demoName,
              faction: 'SYNDICATE',
              health: 100, maxHealth: 100,
              stamina: 100, maxStamina: 100,
              hunger: 100, maxHunger: 100,
              thirst: 100, maxThirst: 100,
              sickness: 0,
              level: 10, xp: 5000, maxXp: 10000,
              repLevel: 5, repXp: 1000, maxRepXp: 5000,
              credits: 9999, fame: 50,
              attack: 0, defense: 0, speed: 0,
              weight: 0, maxWeight: 80,
              maxBeltAmmo: 200,
              unlockedPerks: [],
              position: { x: 0, y: 15, z: 0 }, 
              velocity: { x: 0, y: 0, z: 0 },
              rotation: 0, viewPitch: 0,
              isGrounded: false, isCrouching: false, isSliding: false, jumpCount: 0
          },
          inventory: demoInventory,
          equipment: demoEquipment,
          hotbar: getInitialHotbar(),
          activeMissions: [],
          serverId: 'us-east' 
      };

      // 5. Launch Game directly
      dispatchGame({ type: 'LOAD_GAME_DATA', payload: demoCharData });
      setIsLoading(false);
  };

  const handleAdminLogin = () => {
      setIsLoading(true);
      
      const adminName = "SYS_ADMIN";
      const adminUser = { uid: 'admin-' + Date.now(), displayName: adminName, isGuest: true };
      setCurrentUser(adminUser);

      // GOD MODE EQUIPMENT
      const adminEquipment = { ...INITIAL_EQUIPMENT };
      // Give Railgun or powerful Sniper
      adminEquipment.primary = ITEMS['sniper_rifle']; 
      adminEquipment.chest = ITEMS['vest_heavy']; // High def just in case
      adminEquipment.backpack = ITEMS['backpack_large']; 

      const adminInventory = getInitialInventory();
      // Admin gets extra utility
      adminInventory[0].item = ITEMS['medkit']; adminInventory[0].count = 50;
      adminInventory[1].item = ITEMS['ammo_762']; adminInventory[1].count = 500;

      const adminCharData = {
          gameState: GameState.PLAYING, // FORCE START
          id: `admin-${Date.now()}`,
          profile: {
              name: adminName,
              faction: 'ADMIN',
              guild: 'SYSTEM',
              level: 99,
              xp: 999999,
              repLevel: 100,
              repXp: 9999,
              maxRepXp: 9999,
              credits: 99999999,
              fame: 100
          },
          stats: {
              characterId: `admin-${Date.now()}`,
              name: adminName,
              faction: 'ADMIN',
              health: 9999, maxHealth: 9999,
              stamina: 9999, maxStamina: 9999,
              hunger: 100, maxHunger: 100,
              thirst: 100, maxThirst: 100,
              sickness: 0,
              level: 99, xp: 999999, maxXp: 999999,
              repLevel: 100, repXp: 9999, maxRepXp: 9999,
              credits: 99999999, fame: 100,
              attack: 999, defense: 999, speed: 0,
              weight: 0, maxWeight: 9999,
              maxBeltAmmo: 9999,
              unlockedPerks: ['all'],
              position: { x: 0, y: 50, z: 0 }, // Spawn in air
              velocity: { x: 0, y: 0, z: 0 },
              rotation: 0, viewPitch: 0,
              isGrounded: false, isCrouching: false, isSliding: false, jumpCount: 0,
              isAdmin: true,
              isGhost: true, // Noclip, Invisible to clients
              isFlying: true
          },
          inventory: adminInventory,
          equipment: adminEquipment,
          hotbar: getInitialHotbar(),
          activeMissions: [],
          serverId: 'us-east' 
      };

      dispatchGame({ type: 'LOAD_GAME_DATA', payload: adminCharData });
      setIsLoading(false);
  };

  const handleLogout = async () => {
      await logoutUser();
      setCurrentUser(null);
      setStep('LOGIN');
  };

  const handleServerSelect = () => {
      // Save favorite server preference
      if (currentUser && !currentUser.isGuest) {
          saveUserPreferences(currentUser, { favoriteServerId: selectedServer.id });
      }
      setStep('CHARACTERS');
  };

  const handleDeleteChar = async (e: React.MouseEvent, charId: string) => {
      e.stopPropagation();
      e.preventDefault(); 
      if (!window.confirm("WARNING: PERMANENT DELETION.\n\nAre you sure you want to delete this operative? This action cannot be undone.")) {
          return;
      }
      setIsLoading(true);
      const previousCharacters = [...characters];
      setCharacters(prev => prev.filter(c => c.id !== charId));
      try {
          const success = await deleteCharacter(currentUser, charId);
          if (!success) {
              alert("Server Error: Could not delete character.");
              setCharacters(previousCharacters);
          } else {
              getUserCharacters(currentUser).then(chars => setCharacters(chars));
          }
      } catch (error) {
          console.error("Delete failed", error);
          setCharacters(previousCharacters);
          alert("Error occurred during deletion.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleDeploy = async (existingChar?: any) => {
      // Save server pref again just in case changed via settings
      if (currentUser && !currentUser.isGuest) {
          saveUserPreferences(currentUser, { favoriteServerId: selectedServer.id });
      }

      if (existingChar) {
          // IMPORTANT: Pass selectedServer.id to ensure we join the right room
          // AND force GameState to PLAYING
          dispatchGame({ 
            type: 'LOAD_GAME_DATA', 
            payload: { 
                ...existingChar, 
                serverId: selectedServer.id,
                gameState: GameState.PLAYING 
            } 
          });
      } else {
          setIsLoading(true);
          const newCharId = `char-${Date.now()}`;
          const initialData = {
              id: newCharId,
              profile: {
                  name: newCharName,
                  faction: newCharFaction,
                  guild: 'Freelancer',
                  level: 1,
                  xp: 0,
                  repLevel: 1,
                  repXp: 0,
                  maxRepXp: 2000,
                  credits: 100,
                  fame: 0
              },
              stats: {
                  characterId: newCharId,
                  name: newCharName,
                  faction: newCharFaction,
                  health: 100, maxHealth: 100,
                  stamina: 100, maxStamina: 100,
                  hunger: 100, maxHunger: 100,
                  thirst: 100, maxThirst: 100,
                  sickness: 0,
                  level: 1, xp: 0, maxXp: 1000,
                  repLevel: 1, repXp: 0, maxRepXp: 2000,
                  credits: 100, fame: 0,
                  attack: 0, defense: 0, speed: 0,
                  weight: 0, maxWeight: 60,
                  maxBeltAmmo: 100,
                  unlockedPerks: [],
                  position: selectedSpawn.pos, 
                  velocity: { x: 0, y: 0, z: 0 },
                  rotation: 0, viewPitch: 0,
                  isGrounded: false, isCrouching: false, isSliding: false, jumpCount: 0
              },
              inventory: getInitialInventory(),
              equipment: INITIAL_EQUIPMENT,
              hotbar: getInitialHotbar(),
              activeMissions: [],
              lastSavedAt: new Date().toISOString()
          };

          if (currentUser && !currentUser.isGuest) {
              await createCharacter(currentUser, initialData);
          }
          
          dispatchGame({ 
              type: 'START_GAME', 
              payload: {
                  faction: initialData.profile.faction,
                  name: initialData.profile.name,
                  guild: 'Freelancer',
                  position: initialData.stats.position,
                  serverId: selectedServer.id
              }
          });
          // This second dispatch is somewhat redundant if START_GAME sets up the basics, 
          // but ensures all extra data is consistent.
          dispatchGame({ type: 'LOAD_GAME_DATA', payload: { ...initialData, serverId: selectedServer.id } });
          
          setIsLoading(false);
      }
  };

  if (gameState !== GameState.MENU) return null;

  return (
    <div className="absolute inset-0 z-[60] bg-[#050505] overflow-hidden font-tech text-white">
       
       {/* BACKGROUND */}
       <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ 
                backgroundImage: "url('https://images.unsplash.com/photo-1519638399535-1b036603ac77?q=80&w=2942&auto=format&fit=crop')",
                filter: 'grayscale(80%) contrast(120%)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />
       </div>

       {/* HEADER */}
       <div className="absolute top-0 left-0 w-full p-8 z-50 flex justify-between items-start pointer-events-none">
           <div>
               <h1 className="text-4xl font-black tracking-tighter leading-none mb-1 text-transparent bg-clip-text bg-gradient-to-br from-gray-100 to-gray-500 drop-shadow-lg">
                   FALLEN<span className="text-red-600">ZONE</span>
               </h1>
               <div className="text-[10px] tracking-[0.5em] text-gray-500 uppercase font-bold">Survival MMORPG v0.9.7</div>
           </div>
           {currentUser && (
               <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full pointer-events-auto shadow-lg">
                   <div className={`w-2 h-2 rounded-full animate-pulse ${currentUser.isGuest ? 'bg-yellow-500' : 'bg-green-500'}`} />
                   <span className="text-xs font-bold text-gray-300 uppercase tracking-wider mr-2">{currentUser.displayName}</span>
                   <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-2 bg-red-900/30 hover:bg-red-900/50 text-red-200 px-3 py-1 rounded text-[10px] uppercase font-bold transition-colors"
                   >
                       <LogOut size={12} /> Disconnect
                   </button>
               </div>
           )}
       </div>

       {/* CONTENT CONTAINER */}
       <div className="absolute inset-0 z-10 flex items-center justify-center">
            
            {/* --- STEP 1: LOGIN --- */}
            {step === 'LOGIN' && (
                <div className="w-[450px] bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
                    <h2 className="text-2xl font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Shield className="text-cyan-500" /> Identity Verify
                    </h2>
                    
                    {loginError && (
                        <div className="bg-red-900/20 border border-red-500/50 text-red-200 text-xs p-3 rounded mb-6 flex items-center gap-2 animate-pulse">
                            <Activity size={14} /> {loginError}
                        </div>
                    )}

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        {isSignUp && (
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest ml-1">Codename</label>
                                <div className="relative">
                                    <UserIcon size={16} className="absolute left-3 top-3 text-gray-500" />
                                    <input 
                                        type="text" 
                                        value={regUsername}
                                        onChange={e => setRegUsername(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-10 text-sm focus:border-cyan-500 outline-none transition-colors text-white"
                                        placeholder="OPERATIVE NAME"
                                        required={isSignUp}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest ml-1">Secure Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-3 text-gray-500" />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-10 text-sm focus:border-cyan-500 outline-none transition-colors text-white"
                                    placeholder="name@domain.com"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest ml-1">Passcode</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-3 text-gray-500" />
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-10 text-sm focus:border-cyan-500 outline-none transition-colors text-white"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3 px-1">
                            <input 
                                type="checkbox" 
                                id="rememberMe"
                                checked={rememberEmail}
                                onChange={(e) => setRememberEmail(e.target.checked)}
                                className="w-3 h-3 rounded bg-black border border-white/20 accent-cyan-500 cursor-pointer"
                            />
                            <label htmlFor="rememberMe" className="text-[10px] text-gray-400 uppercase font-bold tracking-wider cursor-pointer select-none">
                                Remember Email
                            </label>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(8,145,178,0.6)] flex items-center justify-center gap-2 mt-2"
                        >
                            {isLoading ? <Activity className="animate-spin" size={16}/> : (isSignUp ? <Plus size={16}/> : <LogIn size={16}/>)}
                            {isSignUp ? 'Register Agent' : 'Authenticate'}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-6">
                        <div className="h-px bg-white/10 flex-1" />
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Or connect via</span>
                        <div className="h-px bg-white/10 flex-1" />
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        <button 
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2.5 flex items-center justify-center gap-2 text-xs font-bold uppercase text-gray-300 transition-colors"
                        >
                            <Cloud size={14} /> Google
                        </button>
                         <button 
                            type="button"
                            onClick={handleGuestLogin}
                            disabled={isLoading}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2.5 flex items-center justify-center gap-2 text-xs font-bold uppercase text-gray-300 transition-colors"
                        >
                            <WifiOff size={14} /> Offline
                        </button>
                        <button 
                            type="button"
                            onClick={handleDemoLogin}
                            disabled={isLoading}
                            className="bg-purple-900/30 hover:bg-purple-800/50 border border-purple-500/30 rounded-lg py-2.5 flex items-center justify-center gap-2 text-xs font-bold uppercase text-purple-300 transition-colors"
                        >
                            <Dna size={14} /> Demo
                        </button>
                        <button 
                            type="button"
                            onClick={handleAdminLogin}
                            disabled={isLoading}
                            className="bg-red-900/30 hover:bg-red-800/50 border border-red-500/30 rounded-lg py-2.5 flex items-center justify-center gap-2 text-xs font-bold uppercase text-red-400 transition-colors"
                        >
                            <EyeOff size={14} /> ADMIN
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <button 
                            type="button"
                            onClick={() => { setIsSignUp(!isSignUp); setLoginError(null); }}
                            className="text-xs text-gray-500 hover:text-cyan-400 transition-colors uppercase font-bold tracking-wider"
                        >
                            {isSignUp ? "Already have credentials? Login" : "New Operative? Initialize Registration"}
                        </button>
                    </div>
                </div>
            )}

            {/* --- STEP 2: SERVER SELECT --- */}
            {step === 'SERVERS' && (
                <div className="w-[800px] flex gap-8 animate-in slide-in-from-right-10 duration-300">
                    <div className="w-1/3 space-y-4">
                        <h2 className="text-3xl font-bold uppercase tracking-widest mb-2">Network Uplink</h2>
                        <p className="text-sm text-gray-400 leading-relaxed">Select a regional gateway for optimal latency. Profile data is persistent across all nodes within the same cluster.</p>
                        
                        <div className="pt-8">
                             <div className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-2">Connection Status</div>
                             <div className="flex items-center gap-2 text-green-400 text-sm">
                                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                 Online (Secure)
                             </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-3">
                        {SERVERS.map(server => (
                            <button
                                key={server.id}
                                onClick={() => setSelectedServer(server)}
                                className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all group relative overflow-hidden ${selectedServer.id === server.id ? 'bg-cyan-900/20 border-cyan-500/50' : 'bg-black/40 border-white/5 hover:bg-white/5'}`}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedServer.id === server.id ? 'bg-cyan-500 text-white' : 'bg-white/5 text-gray-500 group-hover:text-white'}`}>
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <div className={`font-bold uppercase tracking-wider ${selectedServer.id === server.id ? 'text-white' : 'text-gray-300'}`}>{server.name}</div>
                                        <div className="text-[10px] text-gray-500 uppercase font-bold">{server.region} • {server.ping}ms</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="text-right">
                                        <div className={`text-[10px] uppercase font-bold ${server.pop === 'High' ? 'text-red-400' : server.pop === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                                            {server.pop} Pop
                                        </div>
                                    </div>
                                    {selectedServer.id === server.id && <ChevronRight size={16} className="text-cyan-400" />}
                                </div>
                                {selectedServer.id === server.id && <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none" />}
                            </button>
                        ))}

                        <button 
                            onClick={handleServerSelect}
                            className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-gray-200 transition-colors mt-6 flex items-center justify-center gap-2"
                        >
                            Connect to Gateway <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* --- STEP 3: CHARACTER SELECT --- */}
            {step === 'CHARACTERS' && (
                <div className="w-[900px] h-[600px] flex flex-col animate-in slide-in-from-right-10 duration-300">
                     <div className="flex justify-between items-end mb-6">
                         <div>
                             <h2 className="text-3xl font-bold uppercase tracking-widest mb-1">Operative Selection</h2>
                             <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Server size={14} className="text-cyan-500"/>
                                <span className="font-bold text-gray-300">{selectedServer.name}</span>
                                <button onClick={() => setStep('SERVERS')} className="text-[10px] uppercase underline hover:text-white ml-2">Change</button>
                             </div>
                         </div>
                         <button 
                            onClick={() => {
                                // Default names generator
                                const names = ["Ghost", "Viper", "Nomad", "Spectre", "Ranger", "Zero"];
                                const rand = names[Math.floor(Math.random() * names.length)] + '-' + Math.floor(Math.random() * 999);
                                setNewCharName(rand);
                                setStep('CREATE');
                            }}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(8,145,178,0.4)]"
                         >
                             <Plus size={16} /> New Operative
                         </button>
                     </div>

                     <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar pb-4">
                         {characters.map(char => (
                             <div 
                                key={char.id} 
                                onClick={() => handleDeploy(char)}
                                className="group relative bg-black/40 border border-white/5 hover:border-cyan-500/50 rounded-xl p-6 transition-all hover:bg-white/5 cursor-pointer overflow-hidden"
                             >
                                 <div className="absolute top-0 left-0 w-1 h-full bg-gray-800 group-hover:bg-cyan-500 transition-colors" />
                                 
                                 <div className="flex justify-between items-start mb-4">
                                     <div>
                                         <h3 className="text-xl font-bold text-white uppercase tracking-wider group-hover:text-cyan-400 transition-colors">{char.profile.name}</h3>
                                         <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                                             <span style={{ color: FACTIONS[char.profile.faction as Faction]?.color }}>{FACTIONS[char.profile.faction as Faction]?.name}</span>
                                             <span>•</span>
                                             <span>Lvl {char.profile.level}</span>
                                         </div>
                                     </div>
                                     <button 
                                        onClick={(e) => handleDeleteChar(e, char.id)}
                                        className="p-2 hover:bg-red-900/30 rounded text-gray-600 hover:text-red-500 transition-colors"
                                     >
                                         <Trash2 size={16} />
                                     </button>
                                 </div>

                                 <div className="grid grid-cols-3 gap-2 mb-4">
                                     <div className="bg-black/40 p-2 rounded border border-white/5 text-center">
                                         <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">Playtime</div>
                                         <div className="text-xs text-white">2h 14m</div>
                                     </div>
                                     <div className="bg-black/40 p-2 rounded border border-white/5 text-center">
                                         <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">Credits</div>
                                         <div className="text-xs text-cyan-400">{char.profile.credits}</div>
                                     </div>
                                     <div className="bg-black/40 p-2 rounded border border-white/5 text-center">
                                         <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">Rep</div>
                                         <div className="text-xs text-purple-400">{char.profile.repLevel}</div>
                                     </div>
                                 </div>

                                 <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                                     <span>ID: {char.id.slice(0,8).toUpperCase()}</span>
                                     <span className="flex items-center gap-1 group-hover:text-cyan-400 transition-colors">
                                         DEPLOY <ChevronRight size={12} />
                                     </span>
                                 </div>
                             </div>
                         ))}
                         
                         {characters.length === 0 && (
                             <div className="col-span-2 py-12 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-500">
                                 <Users size={48} className="mb-4 opacity-20" />
                                 <p className="uppercase font-bold tracking-widest text-sm">No Operatives Found</p>
                                 <p className="text-xs opacity-50 mt-1">Initialize a new clone to begin.</p>
                             </div>
                         )}
                     </div>
                </div>
            )}

            {/* --- STEP 4: CREATE CHARACTER --- */}
            {step === 'CREATE' && (
                <div className="w-[1000px] h-[600px] flex gap-8 animate-in slide-in-from-right-10 duration-300">
                    {/* Left: Config */}
                    <div className="w-1/3 flex flex-col gap-6">
                        <div>
                            <button onClick={() => setStep('CHARACTERS')} className="text-xs text-gray-500 hover:text-white uppercase font-bold mb-6 flex items-center gap-2">
                                <ArrowRight size={14} className="rotate-180" /> Back to Roster
                            </button>
                            <h2 className="text-3xl font-bold uppercase tracking-widest mb-1">New Identity</h2>
                            <p className="text-xs text-gray-400">Configure your operative's background.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 block">Operative Name</label>
                                <input 
                                    type="text" 
                                    value={newCharName}
                                    onChange={e => setNewCharName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 p-3 rounded text-sm text-white focus:border-cyan-500 outline-none font-mono"
                                    placeholder="ENTER_NAME"
                                    maxLength={16}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 block">Faction Allegiance</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {(Object.keys(FACTIONS) as Faction[]).filter(f => f !== 'ADMIN').map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setNewCharFaction(f)}
                                            className={`p-3 rounded border text-left transition-all ${newCharFaction === f ? 'bg-white/10 border-white/40' : 'bg-black/40 border-white/5 hover:bg-white/5'}`}
                                            style={newCharFaction === f ? { borderColor: FACTIONS[f].color } : {}}
                                        >
                                            <div className="font-bold text-sm uppercase mb-1" style={{ color: FACTIONS[f].color }}>{FACTIONS[f].name}</div>
                                            <div className="text-[10px] text-gray-400 leading-tight">{FACTIONS[f].description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle: Preview (Placeholder) */}
                    <div className="flex-1 bg-black/20 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center group">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
                        <div className="relative z-10 text-center opacity-50 group-hover:opacity-100 transition-opacity">
                            <UserIcon size={120} strokeWidth={0.5} style={{ color: FACTIONS[newCharFaction].color }} />
                            <div className="mt-4 font-mono text-xs text-gray-500">{newCharName || 'UNKNOWN'}</div>
                        </div>
                        
                        {/* Stats Radar Placeholder */}
                        <div className="absolute bottom-6 left-6 right-6">
                            <div className="grid grid-cols-3 gap-2">
                                {['STR', 'AGI', 'INT'].map(s => (
                                    <div key={s} className="bg-black/40 p-2 rounded text-center border border-white/5">
                                        <div className="text-[9px] text-gray-500 font-bold">{s}</div>
                                        <div className="text-sm font-mono text-white">5</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Spawn Select */}
                    <div className="w-1/4 flex flex-col">
                         <h3 className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-4">Insertion Point</h3>
                         <div className="space-y-2 flex-1">
                             {SPAWN_POINTS.map(sp => (
                                 <button
                                    key={sp.id}
                                    onClick={() => setSelectedSpawn(sp)}
                                    className={`w-full p-3 rounded border text-left transition-all ${selectedSpawn.id === sp.id ? 'bg-white/10 border-cyan-500/50' : 'bg-black/40 border-white/5 hover:bg-white/5'}`}
                                 >
                                     <div className="flex justify-between mb-1">
                                         <span className={`text-xs font-bold uppercase ${selectedSpawn.id === sp.id ? 'text-white' : 'text-gray-400'}`}>{sp.name}</span>
                                         <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${sp.diff === 'Low' ? 'bg-green-900/30 text-green-400' : sp.diff === 'Med' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'}`}>
                                             {sp.diff}
                                         </span>
                                     </div>
                                     <div className="text-[10px] text-gray-500 leading-tight">{sp.desc}</div>
                                 </button>
                             ))}
                         </div>

                         <button 
                            onClick={() => handleDeploy()}
                            disabled={!newCharName}
                            className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded hover:bg-cyan-400 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                             Initialize Sequence
                         </button>
                    </div>
                </div>
            )}
       </div>

       {/* FOOTER */}
       <div className="absolute bottom-0 w-full p-6 z-50 flex justify-between items-end pointer-events-none text-[10px] text-gray-600 font-mono">
           <div>
               SYSTEM ID: {currentUser ? currentUser.uid.slice(0,8).toUpperCase() : 'ANONYMOUS'}
               <br/>
               CONNECTION: {selectedServer.region} [SECURE]
           </div>
           <div className="text-right">
               FallenZone Client v0.9.7-alpha
               <br/>
               © 2025 Neural Systems
           </div>
       </div>

    </div>
  );
};
