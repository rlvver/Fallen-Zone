
import { PlayerStats, Item, InventorySlot, EquipmentState, NPC, Enemy, GameContextState } from '../types';
import { STAT_DECAY_RATE, PHYSICS, WORLD_SIZE, WORLD_ASSETS, getTerrainHeight } from '../constants';

export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

const lerp = (start: number, end: number, t: number) => {
  return start * (1 - t) + end * t;
};

export const calculateTotalWeight = (
    inventory: InventorySlot[], 
    hotbar: InventorySlot[], 
    equipment: EquipmentState
): number => {
    let weight = 0;
    inventory.forEach(slot => { if(slot.item) weight += slot.item.weight * slot.count; });
    hotbar.forEach(slot => { if(slot.item) weight += slot.item.weight * slot.count; });
    Object.values(equipment).forEach((item: Item | null) => {
        if(item) {
            const count = item.count || 1;
            weight += item.weight * count;
            if (item.storage) {
                item.storage.forEach(s => {
                    if (s.item) weight += s.item.weight * s.count;
                });
            }
        }
    });
    return Math.round(weight * 10) / 10;
};

const checkCollision = (x: number, y: number, z: number): boolean => {
    const r = PHYSICS.PLAYER_RADIUS;
    if (x < -WORLD_SIZE || x > WORLD_SIZE || z < -WORLD_SIZE || z > WORLD_SIZE) return true;
    for (const asset of WORLD_ASSETS) {
        const halfW = (asset.collider.width / 2) + r;
        const halfD = (asset.collider.depth / 2) + r;
        if (Math.abs(x - asset.x) < halfW && Math.abs(z - asset.z) < halfD) {
            const assetBaseY = getTerrainHeight(asset.x, asset.z) + asset.y;
            const assetTopY = assetBaseY + asset.collider.height;
            const playerFeet = y;
            const playerHead = y + 1.8;
            if (playerFeet < assetTopY && playerHead > assetBaseY) return true; 
        }
    }
    return false;
};

const getFloorHeight = (x: number, z: number, currentY: number): number => {
    let floorY = getTerrainHeight(x, z);
    for (const asset of WORLD_ASSETS) {
        const halfW = asset.collider.width / 2;
        const halfD = asset.collider.depth / 2;
        if (Math.abs(x - asset.x) < halfW && Math.abs(z - asset.z) < halfD) {
            const assetBaseY = getTerrainHeight(asset.x, asset.z) + asset.y;
            const assetTopY = assetBaseY + asset.collider.height;
            if (currentY >= assetTopY - 0.5 && assetTopY > floorY) floorY = assetTopY;
        }
    }
    return floorY;
};

export const tickStats = (
  stats: PlayerStats, 
  inputs: GameContextState['inputs'], 
  dt: number
): PlayerStats => {
  let { position, velocity, isGrounded, jumpCount, isCrouching, rotation, isFlying, isGhost } = stats;
  let nextPos = { ...position };
  let nextVel = { ...velocity };
  const safeDt = Math.min(dt, 0.1); 
  const isAdminFaction = stats.faction === 'ADMIN';
  const isGodMode = isAdminFaction && (isGhost || isFlying);

  // Rotation 0 in Three.js looking at -Z
  const sin = Math.sin(rotation);
  const cos = Math.cos(rotation);

  if (isGodMode) {
      const speed = inputs.sprint ? PHYSICS.SPRINT_SPEED * 3.0 : PHYSICS.MOVE_SPEED * 1.5;
      let tx = 0, ty = 0, tz = 0;
      if (inputs.forward) { tx -= sin; tz -= cos; }
      if (inputs.backward) { tx += sin; tz += cos; }
      if (inputs.right) { tx += cos; tz -= sin; }
      if (inputs.left) { tx -= cos; tz += sin; }
      if (inputs.jump) ty += 1.0; 
      if (inputs.crouch) ty -= 1.0; 
      
      const len = Math.sqrt(tx*tx + ty*ty + tz*tz);
      if (len > 0) { tx = (tx/len) * speed; ty = (ty/len) * speed; tz = (tz/len) * speed; }
      
      nextVel.x = lerp(nextVel.x, tx, safeDt * 5);
      nextVel.y = lerp(nextVel.y, ty, safeDt * 5);
      nextVel.z = lerp(nextVel.z, tz, safeDt * 5);
      
      nextPos.x += nextVel.x * safeDt;
      nextPos.y += nextVel.y * safeDt;
      nextPos.z += nextVel.z * safeDt;
      
      return { ...stats, position: nextPos, velocity: nextVel, isGrounded: false, isFlying: true, isGhost: true };
  }

  // --- STANDARD FPS MOVEMENT ---
  let fwdInput = 0;
  let sideInput = 0;
  if (inputs.forward) fwdInput += 1;
  if (inputs.backward) fwdInput -= 1;
  if (inputs.right) sideInput += 1;
  if (inputs.left) sideInput -= 1;

  isCrouching = inputs.crouch; 
  let speed = PHYSICS.MOVE_SPEED;
  if (inputs.sprint && !isCrouching) speed = PHYSICS.SPRINT_SPEED;
  if (isCrouching) speed = PHYSICS.CROUCH_SPEED;

  // W forward -> move -Z (sin=0, cos=1)
  // D right -> move +X (sin=0, cos=1)
  let targetVx = (fwdInput * -sin + sideInput * cos) * speed;
  let targetVz = (fwdInput * -cos + sideInput * -sin) * speed;

  if (fwdInput !== 0 && sideInput !== 0) { targetVx /= 1.414; targetVz /= 1.414; }

  const accel = isGrounded ? PHYSICS.ACCELERATION : PHYSICS.AIR_ACCELERATION;
  nextVel.x = lerp(nextVel.x, targetVx, safeDt * accel);
  nextVel.z = lerp(nextVel.z, targetVz, safeDt * accel);

  if (inputs.jump && isGrounded) { nextVel.y = PHYSICS.JUMP_FORCE; isGrounded = false; jumpCount = 1; } 
  else { nextVel.y += PHYSICS.GRAVITY * safeDt; }

  let proposedX = nextPos.x + nextVel.x * safeDt;
  if (!checkCollision(proposedX, nextPos.y, nextPos.z)) nextPos.x = proposedX; else nextVel.x = 0;

  let proposedZ = nextPos.z + nextVel.z * safeDt;
  if (!checkCollision(nextPos.x, nextPos.y, proposedZ)) nextPos.z = proposedZ; else nextVel.z = 0;

  let proposedY = nextPos.y + nextVel.y * safeDt;
  const floorHeight = getFloorHeight(nextPos.x, nextPos.z, nextPos.y);
  if (proposedY < floorHeight) { nextPos.y = floorHeight; nextVel.y = 0; isGrounded = true; jumpCount = 0; } 
  else { if (checkCollision(nextPos.x, proposedY, nextPos.z)) nextVel.y = 0; else { nextPos.y = proposedY; isGrounded = false; } }

  return {
      ...stats, position: nextPos, velocity: nextVel, isGrounded, isCrouching, jumpCount, 
      hunger: clamp(stats.hunger - (STAT_DECAY_RATE.HUNGER * safeDt), 0, stats.maxHunger),
      thirst: clamp(stats.thirst - (STAT_DECAY_RATE.THIRST * safeDt), 0, stats.maxThirst),
      stamina: clamp(stats.stamina + (STAT_DECAY_RATE.STAMINA_REGEN * safeDt), 0, stats.maxStamina),
      speed: Math.sqrt(nextVel.x*nextVel.x + nextVel.z*nextVel.z)
  };
};

export const tickEntities = (npcs: NPC[], enemies: Enemy[], dt: number, playerPos: { x: number; y: number; z: number }): { npcs: NPC[]; enemies: Enemy[]; damageTaken: number } => {
    let damageTaken = 0;
    const newEnemies = enemies.map(enemy => {
        if (enemy.isDead) return enemy;
        let { position, state, waitTimer } = enemy;
        const dx = playerPos.x - position.x;
        const dz = playerPos.z - position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        let newState = state; let newTimer = waitTimer; let newRot = enemy.rotation;
        if (state === 'IDLE') { if (dist < 15) newState = 'MOVING'; } 
        else if (state === 'MOVING') {
            if (dist < 2) { newState = 'ATTACKING'; newTimer = 1.5; } 
            else if (dist > 25) newState = 'IDLE'; 
            else {
                const moveSpeed = enemy.speed * dt;
                position = { x: position.x + (dx / dist) * moveSpeed, y: position.y, z: position.z + (dz / dist) * moveSpeed };
                newRot = Math.atan2(dx, dz);
            }
        } else if (state === 'ATTACKING') {
            newTimer -= dt;
            if (dist > 3) newState = 'MOVING'; else if (newTimer <= 0) { damageTaken += 10; newTimer = 1.5; }
            newRot = Math.atan2(dx, dz);
        }
        return { ...enemy, position, state: newState, waitTimer: newTimer, rotation: newRot };
    });
    return { npcs, enemies: newEnemies, damageTaken };
};
