
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  User 
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc, onSnapshot } from "firebase/firestore";
import { GameContextState, RemotePlayer } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyDmaKcAjdeGmF1-pVsr9TD26znz9zHTmrw",
  authDomain: "fallenzone-e0626.firebaseapp.com",
  projectId: "fallenzone-e0626",
  storageBucket: "fallenzone-e0626.firebasestorage.app",
  messagingSenderId: "460870228642",
  appId: "1:460870228642:web:069e41bf2ecd2944e655fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Helper to remove undefined values which Firestore rejects
const sanitizeData = (data: any) => {
  return JSON.parse(JSON.stringify(data));
};

// --- MULTIPLAYER NETWORKING ---

export const updatePlayerState = async (
    serverId: string, 
    user: User | any, 
    data: Partial<RemotePlayer>
) => {
    if (!user || user.isGuest) return;
    try {
        const playerRef = doc(db, "servers", serverId, "players", user.uid);
        // Fire and forget, don't await to avoid blocking game loop
        setDoc(playerRef, {
            ...data,
            id: user.uid,
            lastSeen: Date.now()
        }, { merge: true });
    } catch (e) {
        // Suppress network errors in loop
    }
};

export const subscribeToServer = (
    serverId: string, 
    onUpdate: (players: RemotePlayer[]) => void
) => {
    const playersRef = collection(db, "servers", serverId, "players");
    
    const unsubscribe = onSnapshot(playersRef, (snapshot) => {
        const players: RemotePlayer[] = [];
        const now = Date.now();
        snapshot.forEach((doc) => {
            const data = doc.data() as RemotePlayer;
            // Filter out self and inactive players (> 10 seconds old)
            if (doc.id !== auth.currentUser?.uid && (now - data.lastSeen < 10000)) {
                players.push(data);
            }
        });
        onUpdate(players);
    });

    return unsubscribe;
};


// --- AUTHENTICATION ---

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Ensure user doc exists for Google login too
    await setDoc(doc(db, "users", result.user.uid), {
        email: result.user.email,
        lastLogin: new Date().toISOString()
    }, { merge: true });
    return result.user;
  } catch (error) {
    console.error("Login failed", error);
    throw error; 
  }
};

export const registerWithEmail = async (email: string, pass: string, username: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (result.user) {
        await updateProfile(result.user, { displayName: username });
        // Create user record in firestore
        await setDoc(doc(db, "users", result.user.uid), {
            username: username,
            email: email,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        }, { merge: true });
    }
    return result.user;
  } catch (error) {
    console.error("Registration failed", error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    // Update last login
    await setDoc(doc(db, "users", result.user.uid), {
        lastLogin: new Date().toISOString()
    }, { merge: true });
    return result.user;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};

// --- PREFERENCES ---

export const saveUserPreferences = async (user: User | any, prefs: { favoriteServerId?: string }) => {
    if(!user || user.isGuest) return;
    try {
        await setDoc(doc(db, "users", user.uid), { preferences: prefs }, { merge: true });
    } catch(e) {
        console.error("Error saving preferences", e);
    }
};

export const getUserPreferences = async (user: User | any) => {
    if(!user || user.isGuest) return null;
    try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if(snap.exists() && snap.data().preferences) {
            return snap.data().preferences;
        }
    } catch(e) {
        console.error("Error getting preferences", e);
    }
    return null;
};

// --- DATABASE (CLOUD SAVE) ---

export const saveGameToCloud = async (state: GameContextState, user: User | any) => {
  if (!user) return;
  if (user.isGuest) {
      console.log("ℹ️ Guest mode: Cloud save skipped (Local only)");
      return true; 
  }

  // Use character ID or fallback to 'default'
  const charId = state.stats.characterId || 'default';

  // Filter state to save relevant data only
  const saveData = {
    profile: {
        name: state.stats.name,
        faction: state.stats.faction,
        guild: state.stats.guild,
        level: state.stats.level,
        xp: state.stats.xp,
        // Reputation Data in Profile
        repLevel: state.stats.repLevel,
        repXp: state.stats.repXp,
        maxRepXp: state.stats.maxRepXp,
        
        credits: state.stats.credits,
        fame: state.stats.fame,
    },
    stats: {
        characterId: charId, // Ensure ID is saved
        health: state.stats.health,
        hunger: state.stats.hunger,
        thirst: state.stats.thirst,
        stamina: state.stats.stamina,
        maxBeltAmmo: state.stats.maxBeltAmmo,
        unlockedPerks: state.stats.unlockedPerks,
        maxXp: state.stats.maxXp, // Save max XP progression
        position: { 
            x: Math.round(state.stats.position.x * 100) / 100, 
            y: Math.round(state.stats.position.y * 100) / 100, 
            z: Math.round(state.stats.position.z * 100) / 100 
        }
    },
    // PERSISTENCE FOR WORLD ASSETS (Map Editor)
    worldAssets: state.worldAssets,
    inventory: state.inventory.filter(s => s.item !== null),
    equipment: state.equipment,
    hotbar: state.hotbar,
    activeMissions: state.activeMissions,
    lastSavedAt: new Date().toISOString()
  };

  try {
    // Sanitize data to remove 'undefined' values
    const cleanData = sanitizeData(saveData);

    // Save to subcollection: users/{uid}/characters/{charId}
    await setDoc(doc(db, "users", user.uid, "characters", charId), cleanData, { merge: true });
    // Also update main user doc with last played timestamp
    await setDoc(doc(db, "users", user.uid), { lastPlayed: new Date().toISOString() }, { merge: true });
    
    console.log(`✅ Game saved to Cloud (Slot: ${charId})`);
    return true;
  } catch (e) {
    console.error("❌ Error saving to cloud", e);
    return false;
  }
};

export const createCharacter = async (user: User | any, characterData: any) => {
    if (!user || user.isGuest) return false;
    try {
        // Sanitize character data as well
        const cleanData = sanitizeData(characterData);
        await setDoc(doc(db, "users", user.uid, "characters", characterData.stats.characterId), cleanData, { merge: true });
        return true;
    } catch (e) {
        console.error("Error creating character", e);
        return false;
    }
};

export const getUserCharacters = async (user: User | any) => {
    if (!user) return [];
    if (user.isGuest) return []; // No cloud chars for guest

    try {
        const querySnapshot = await getDocs(collection(db, "users", user.uid, "characters"));
        const characters: any[] = [];
        querySnapshot.forEach((doc) => {
            characters.push({ id: doc.id, ...doc.data() });
        });
        return characters;
    } catch (e) {
        console.error("Error fetching characters", e);
        return [];
    }
};

export const deleteCharacter = async (user: User | any, charId: string) => {
    if (!user || user.isGuest) return false;
    if (!charId) {
        console.error("Delete failed: Invalid Character ID");
        return false;
    }
    try {
        await deleteDoc(doc(db, "users", user.uid, "characters", charId));
        return true;
    } catch (e) {
        console.error("Error deleting character", e);
        return false;
    }
};

// Kept for backward compatibility, but prefers specific slot loading now
export const loadGameFromCloud = async (user: User, charId?: string): Promise<any | null> => {
  if (!user) return null;

  try {
    if (charId) {
        const docRef = doc(db, "users", user.uid, "characters", charId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) return docSnap.data();
    } else {
        // Fallback: Try to get first character
        const chars = await getUserCharacters(user);
        if (chars.length > 0) return chars[0];
    }
    return null;
  } catch (e) {
    console.error("❌ Error loading from cloud", e);
    return null;
  }
};
