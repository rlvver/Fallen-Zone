
import React, { useRef, useEffect } from 'react';
import { useGameSelector } from '../../../context/GameContext';
import { WORLD_SIZE, OBSTACLES } from '../../../constants';

export const MapPanel: React.FC = () => {
    const stats = useGameSelector(state => state.stats);
    const worldAssets = useGameSelector(state => state.worldAssets);
    const npcs = useGameSelector(state => state.npcs);
    const enemies = useGameSelector(state => state.enemies);
    const containers = useGameSelector(state => state.containers);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const draw = () => {
            const { width, height } = canvas;
            ctx.clearRect(0, 0, width, height);
            const zoom = 1.5; const playerX = stats.position.x; const playerZ = stats.position.z;
            ctx.save(); ctx.translate(width / 2, height / 2); ctx.scale(zoom, zoom); ctx.translate(-playerX, -playerZ);
            ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.strokeRect(-WORLD_SIZE, -WORLD_SIZE, WORLD_SIZE * 2, WORLD_SIZE * 2);
            ctx.fillStyle = '#222'; OBSTACLES.forEach(obs => { ctx.fillRect(obs.x - obs.width/2, obs.z - obs.depth/2, obs.width, obs.depth); });
            ctx.fillStyle = '#fbbf24'; containers.forEach(c => { if (c.type === 'drop' || c.type === 'body') { ctx.beginPath(); ctx.arc(c.position.x, c.position.z, 2, 0, Math.PI * 2); ctx.fill(); } });
            ctx.fillStyle = '#ef4444'; enemies.forEach(e => { if (!e.isDead) { ctx.beginPath(); ctx.arc(e.position.x, e.position.z, 3, 0, Math.PI * 2); ctx.fill(); } });
            ctx.fillStyle = '#22d3ee'; ctx.beginPath(); ctx.arc(playerX, playerZ, 4, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(playerX, playerZ); ctx.lineTo(playerX - Math.sin(stats.rotation) * 10, playerZ - Math.cos(stats.rotation) * 10); ctx.stroke();
            ctx.restore();
            requestAnimationFrame(draw);
        };
        const raf = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(raf);
    }, [stats, containers, enemies]);
    return (
        <div className="w-full h-full bg-[#050505] rounded-xl overflow-hidden relative border border-white/10">
            <canvas ref={canvasRef} width={600} height={500} className="w-full h-full" />
            <div className="absolute bottom-4 right-4 bg-black/80 px-3 py-1 rounded text-xs text-white/50 border border-white/10"> SECTOR A-9 </div>
            <div className="absolute top-4 left-4 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[10px] text-cyan-400"><div className="w-2 h-2 rounded-full bg-cyan-400"/> PLAYER</div>
                <div className="flex items-center gap-2 text-[10px] text-red-400"><div className="w-2 h-2 rounded-full bg-red-400"/> HOSTILE</div>
                <div className="flex items-center gap-2 text-[10px] text-yellow-400"><div className="w-2 h-2 rounded-full bg-yellow-400"/> LOOT</div>
            </div>
        </div>
    );
};
