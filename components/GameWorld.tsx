
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Billboard, Text, SpotLight } from '@react-three/drei';
import * as THREE from 'three';
import { useGame, useGameSelector, getGameState, dispatchGame } from '../context/GameContext';
import { GameState, AssetType, WorldAsset } from '../types';
import { PHYSICS } from '../constants';

// --- CONTROLLER ---
const PlayerController = () => {
    const { camera } = useThree();
    
    useFrame(() => {
        const state = getGameState();
        const camY = state.stats.position.y + (state.stats.isCrouching ? PHYSICS.PLAYER_HEIGHT_CROUCH : PHYSICS.PLAYER_HEIGHT_STANDING);
        camera.position.set(state.stats.position.x, camY, state.stats.position.z);
        camera.rotation.order = 'YXZ';
        // 0 degrees is looking at -Z
        camera.rotation.y = state.stats.rotation; 
        camera.rotation.x = state.stats.viewPitch;
    });
    return null;
};

// --- HIGH-FIDELITY LAMP POST MODEL (URBAN HIGHWAY STYLE) ---
const LampPostModel: React.FC<{ color?: string, isGhost?: boolean }> = ({ color = '#7f8c8d', isGhost = false }) => {
    const materialProps = isGhost ? {
        transparent: true,
        opacity: 0.4,
        color: color,
        emissive: color,
        emissiveIntensity: 0.5,
        depthWrite: false
    } : {
        color: color,
        metalness: 0.7,
        roughness: 0.3
    };

    const concreteMaterial = isGhost ? materialProps : {
        color: '#34495e',
        roughness: 0.9,
        metalness: 0.1
    };

    return (
        <group>
            {/* 1. Reinforced Concrete Base (Y starts at 0) */}
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.45, 0.55, 0.8, 8]} />
                <meshStandardMaterial {...concreteMaterial} />
            </mesh>
            
            {/* 2. Steel Base Plate (Connector between base and pole) */}
            <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.7, 0.1, 0.7]} />
                <meshStandardMaterial {...materialProps} color="#2c3e50" />
            </mesh>

            {/* 3. Tapered Main Column (Galvanized Steel) */}
            <mesh position={[0, 5, 0]} castShadow>
                <cylinderGeometry args={[0.18, 0.32, 8.5, 12]} />
                <meshStandardMaterial {...materialProps} />
            </mesh>

            {/* 4. The Neck / Arm (Curved transition) */}
            <group position={[0, 9.2, 0]}>
                {/* Arm Elbow */}
                <mesh position={[0.2, 0.1, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
                    <cylinderGeometry args={[0.12, 0.18, 0.6, 12]} />
                    <meshStandardMaterial {...materialProps} />
                </mesh>
                
                {/* Curved Extension */}
                <group position={[0.4, 0.3, 0]} rotation={[0, 0, -Math.PI / 2.5]}>
                    <mesh position={[1.2, 0, 0]} castShadow>
                        <cylinderGeometry args={[0.08, 0.12, 2.8, 8]} rotation={[0, 0, Math.PI / 2]} />
                        <meshStandardMaterial {...materialProps} />
                    </mesh>

                    {/* 5. Sleek LED Head (Cobra Head Integrated) */}
                    <group position={[2.6, 0, 0]} rotation={[0, 0, Math.PI / 12]}>
                        <mesh castShadow>
                            <boxGeometry args={[1.6, 0.22, 0.9]} />
                            <meshStandardMaterial {...materialProps} color={isGhost ? color : "#2c3e50"} />
                        </mesh>
                        {/* Tapered back of the head */}
                        <mesh position={[-0.9, 0, 0]} castShadow>
                            <boxGeometry args={[0.3, 0.18, 0.6]} />
                            <meshStandardMaterial {...materialProps} color={isGhost ? color : "#2c3e50"} />
                        </mesh>
                        
                        {/* LED Lens Panel */}
                        <mesh position={[0.1, -0.12, 0]}>
                            <boxGeometry args={[1.2, 0.04, 0.7]} />
                            <meshStandardMaterial 
                                color="#fff" 
                                emissive="#f1c40f" 
                                emissiveIntensity={isGhost ? 0 : 4} 
                                transparent={isGhost}
                                opacity={isGhost ? 0.2 : 1}
                            />
                        </mesh>
                        
                        {!isGhost && (
                            <group>
                                <pointLight 
                                    position={[0, -0.8, 0]} 
                                    distance={35} 
                                    intensity={15} 
                                    color="#f1c40f" 
                                    castShadow 
                                    shadow-bias={-0.001}
                                />
                                {/* Optional beam visual effect could go here */}
                            </group>
                        )}
                    </group>
                </group>
            </group>
        </group>
    );
};

// --- WORLD ASSETS ---
const WorldObject: React.FC<{ asset: WorldAsset }> = ({ asset }) => {
    const isRoad = asset.type.includes('ROAD') || asset.type.includes('HIGHWAY');
    const isLamp = asset.type === 'ROAD_LAMP_POST';
    
    return (
        <group position={[asset.x, asset.y, asset.z]} rotation={[0, asset.rotation, 0]}>
            {isLamp ? (
                <LampPostModel color={asset.color} />
            ) : (
                <mesh castShadow receiveShadow position={[0, asset.collider.height / 2, 0]}>
                    <boxGeometry args={[asset.collider.width, asset.collider.height, asset.collider.depth]} />
                    <meshStandardMaterial color={asset.color || (isRoad ? '#222' : '#555')} roughness={0.8} />
                    {isRoad && (
                        <group position={[0, asset.collider.height/2 + 0.01, 0]}>
                            {Array.from({ length: Math.floor(asset.collider.depth / 8) }).map((_, i) => (
                                <mesh key={i} position={[0, 0, -asset.collider.depth/2 + i * 8 + 4]} rotation={[-Math.PI/2, 0, 0]}>
                                    <planeGeometry args={[0.3, 3]} />
                                    <meshStandardMaterial color="#fff" />
                                </mesh>
                            ))}
                        </group>
                    )}
                </mesh>
            )}
        </group>
    );
};

const GhostObject = () => {
    const placement = useGameSelector(state => state.placement);
    const groupRef = useRef<THREE.Group>(null);
    
    useFrame(({ clock }) => {
        if (groupRef.current) {
            const pulse = 0.3 + Math.sin(clock.getElapsedTime() * 10) * 0.15;
            groupRef.current.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material.transparent = true;
                    child.material.opacity = pulse;
                }
            });
        }
    });

    if (!placement.active || !placement.assetType) return null;
    const { position, rotation, isValid, assetType } = placement;
    const isLamp = assetType === 'ROAD_LAMP_POST';

    return (
        <group ref={groupRef} position={[position.x, position.y, position.z]} rotation={[0, rotation, 0]}>
            {isLamp ? (
                <LampPostModel color={isValid ? "#22d3ee" : "#ef4444"} isGhost={true} />
            ) : (
                <mesh position={[0, 0.1, 0]}>
                    <boxGeometry args={[8, 0.2, 10]} />
                    <meshBasicMaterial color={isValid ? "#22d3ee" : "#ef4444"} transparent opacity={0.5} />
                </mesh>
            )}
        </group>
    );
};

const Entity: React.FC<{ position: {x:number, y:number, z:number}, rotation: number, color: string, type: 'enemy'|'npc' }> = ({ position, rotation, color, type }) => {
    return (
        <group position={[position.x, position.y, position.z]} rotation={[0, rotation, 0]}>
            <mesh position={[0, 0.9, 0]} castShadow>
                <boxGeometry args={[0.6, 1.8, 0.6]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <Billboard position={[0, 2.2, 0]}>
                <Text fontSize={0.2} color="white" anchorX="center" anchorY="middle">
                    {type === 'enemy' ? 'HOSTILE' : 'NEUTRAL'}
                </Text>
            </Billboard>
        </group>
    );
}

export const GameWorld: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ignorePointerUnlock = useRef(false);
  const placementDistRef = useRef(10.0);
  
  const gameState = useGameSelector(state => state.gameState);
  const isFlashlightOn = useGameSelector(state => state.isFlashlightOn);
  const worldAssets = useGameSelector(state => state.worldAssets);
  const enemies = useGameSelector(state => state.enemies);
  const npcs = useGameSelector(state => state.npcs);
  const playerPos = useGameSelector(state => state.stats.position);
  const playerRot = useGameSelector(state => state.stats.rotation);
  const playerPitch = useGameSelector(state => state.stats.viewPitch);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        const state = getGameState();
        if (state.gameState === GameState.PLAYING && document.pointerLockElement) {
            const sensitivity = 0.002;
            let newYaw = state.stats.rotation - e.movementX * sensitivity;
            newYaw = newYaw % (Math.PI * 2);
            const newPitch = state.stats.viewPitch - e.movementY * sensitivity;
            const clampedPitch = Math.max(-1.5, Math.min(1.5, newPitch));
            dispatchGame({ type: 'LOOK', payload: { yaw: newYaw, pitch: clampedPitch } });
        }
    };

    const handleClick = () => {
        const state = getGameState();
        if (state.gameState === GameState.PLAYING && containerRef.current) {
            containerRef.current.requestPointerLock();
        }
    };

    const handlePointerLockChange = () => {
        const state = getGameState();
        if (document.pointerLockElement === null && state.gameState === GameState.PLAYING) {
            if (ignorePointerUnlock.current) { ignorePointerUnlock.current = false; return; }
            dispatchGame({ type: 'SET_STATE', payload: GameState.PAUSED });
        }
    };
    
    const handleWheel = (e: WheelEvent) => {
        const state = getGameState();
        if (state.gameState === GameState.PLAYING && state.placement.active) {
            const scrollAmt = 2.5;
            const delta = e.deltaY < 0 ? scrollAmt : -scrollAmt;
            placementDistRef.current = Math.max(3.0, Math.min(60.0, placementDistRef.current + delta));
        }
    };
    
    const handleMouseDown = (e: MouseEvent) => {
        const state = getGameState();
        if (state.gameState !== GameState.PLAYING) return;
        if (state.placement.active && e.button === 0) { dispatchGame({ type: 'CONFIRM_PLACEMENT' }); return; }
        if (e.button === 0) { 
            dispatchGame({ 
                type: 'USE_HELD_ITEM', 
                payload: { 
                    attackType: state.selectedWeaponSlot === 'melee' ? 'melee' : 'ranged',
                    startPos: { ...state.stats.position, y: state.stats.position.y + 1.6 },
                    endPos: { 
                        x: state.stats.position.x - Math.sin(state.stats.rotation) * 100, 
                        y: state.stats.position.y, 
                        z: state.stats.position.z - Math.cos(state.stats.rotation) * 100 
                    }
                } 
            });
        }
        if (e.button === 2) { 
            if (state.placement.active) dispatchGame({ type: 'CANCEL_PLACEMENT' });
            else dispatchGame({ type: 'SET_AIMING', payload: true });
        }
    };

    const handleMouseUp = (e: MouseEvent) => { if (e.button === 2) dispatchGame({ type: 'SET_AIMING', payload: false }); };

    const handleKeyDown = (e: KeyboardEvent) => {
        const state = getGameState();
        if (state.gameState !== GameState.PLAYING) return;
        if (e.code === 'Tab') { 
            if (e.repeat) return;
            e.preventDefault(); e.stopImmediatePropagation(); ignorePointerUnlock.current = true; document.exitPointerLock(); dispatchGame({ type: 'SET_STATE', payload: GameState.INVENTORY }); return; 
        }
        if (state.placement.active) {
            if (e.code === 'KeyQ') { dispatchGame({ type: 'ROTATE_PLACEMENT', payload: -1 }); return; }
            if (e.code === 'KeyE') { dispatchGame({ type: 'ROTATE_PLACEMENT', payload: 1 }); return; }
            if (e.code === 'Escape') { dispatchGame({ type: 'CANCEL_PLACEMENT' }); return; }
        }
        if (e.code === 'KeyF') { dispatchGame({ type: 'TOGGLE_FLASHLIGHT' }); return; }
        if (e.code === 'KeyR') { dispatchGame({ type: 'RELOAD_WEAPON' }); return; }
        switch(e.code) {
            case 'KeyW': dispatchGame({ type: 'SET_INPUT', payload: { forward: true } }); break;
            case 'KeyS': dispatchGame({ type: 'SET_INPUT', payload: { backward: true } }); break;
            case 'KeyA': dispatchGame({ type: 'SET_INPUT', payload: { left: true } }); break;
            case 'KeyD': dispatchGame({ type: 'SET_INPUT', payload: { right: true } }); break;
            case 'Space': dispatchGame({ type: 'SET_INPUT', payload: { jump: true } }); break;
            case 'ShiftLeft': dispatchGame({ type: 'SET_INPUT', payload: { sprint: true } }); break;
            case 'ControlLeft': dispatchGame({ type: 'SET_INPUT', payload: { crouch: true } }); break;
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
         const state = getGameState();
         if (state.gameState !== GameState.PLAYING) return;
         switch(e.code) {
            case 'KeyW': dispatchGame({ type: 'SET_INPUT', payload: { forward: false } }); break;
            case 'KeyS': dispatchGame({ type: 'SET_INPUT', payload: { backward: false } }); break;
            case 'KeyA': dispatchGame({ type: 'SET_INPUT', payload: { left: false } }); break;
            case 'KeyD': dispatchGame({ type: 'SET_INPUT', payload: { right: false } }); break;
            case 'Space': dispatchGame({ type: 'SET_INPUT', payload: { jump: false } }); break;
            case 'ShiftLeft': dispatchGame({ type: 'SET_INPUT', payload: { sprint: false } }); break;
            case 'ControlLeft': dispatchGame({ type: 'SET_INPUT', payload: { crouch: false } }); break;
        }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('click', handleClick);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('click', handleClick);
        window.removeEventListener('wheel', handleWheel);
        window.removeEventListener('contextmenu', (e) => e.preventDefault());
        document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, []); 

  useEffect(() => {
      let raf: number;
      let lastTime = performance.now();
      const loop = (time: number) => {
          const delta = Math.min((time - lastTime) / 1000, 0.1);
          lastTime = time;
          
          const state = getGameState();
          if (state.gameState === GameState.PLAYING) {
              dispatchGame({ type: 'TICK', payload: { delta } }); 
              if (state.placement.active) {
                  const dist = placementDistRef.current;
                  const yaw = state.stats.rotation; 
                  const px = state.stats.position.x - Math.sin(yaw) * dist;
                  const pz = state.stats.position.z - Math.cos(yaw) * dist;
                  const snapX = Math.round(px * 2) / 2;
                  const snapZ = Math.round(pz * 2) / 2;
                  dispatchGame({ type: 'UPDATE_PLACEMENT', payload: { position: { x: snapX, y: 0, z: snapZ }, isValid: true } });
              }
          }
          raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={containerRef} id="game-container" className="w-full h-full block bg-black">
        <Canvas shadows camera={{ fov: 75, near: 0.1, far: 1500 }}>
            <PlayerController />
            <color attach="background" args={['#050505']} />
            <fog attach="fog" args={['#050505', 20, 200]} />
            
            <ambientLight intensity={0.5} />
            <directionalLight 
                position={[50, 100, 50]} 
                intensity={1.2} 
                castShadow 
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-200}
                shadow-camera-right={200}
                shadow-camera-top={200}
                shadow-camera-bottom={-200}
            />
            
            <Stars radius={150} depth={60} count={6000} factor={6} saturation={0} fade speed={1.2} />
            
            {isFlashlightOn && (
                <SpotLight 
                    position={[playerPos.x, playerPos.y + 1.5, playerPos.z]}
                    target-position={[
                        playerPos.x - Math.sin(playerRot) * 15,
                        playerPos.y + 1.5 + Math.sin(playerPitch) * 15,
                        playerPos.z - Math.cos(playerRot) * 15
                    ]}
                    angle={0.4} penumbra={0.3} intensity={3.5} distance={55} castShadow
                />
            )}
            
            {/* Main World Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[1000, 1000]} />
                <meshStandardMaterial color="#0a0a0a" roughness={1} />
            </mesh>
            <gridHelper args={[1000, 100, '#1a1a1a', '#050505']} position={[0, 0, 0]} />
            
            {worldAssets.map(asset => <WorldObject key={asset.id} asset={asset} />)}
            {enemies.map(e => !e.isDead && <Entity key={e.id} x={e.position.x} y={e.position.y} z={e.position.z} rotation={e.rotation} color="#ef4444" type="enemy" />)}
            {npcs.map(n => <Entity key={n.id} x={n.position.x} y={n.position.y} z={n.position.z} rotation={n.rotation} color="#3b82f6" type="npc" />)}
            
            <GhostObject />
        </Canvas>
    </div>
  );
};
