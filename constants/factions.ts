
import { Faction } from '../types';

export const FACTIONS: Record<Faction, { name: string; description: string; color: string }> = {
    VANGUARD: { name: 'Vanguard', description: 'Military survivalists focused on order and defense.', color: '#ef4444' },
    ECLIPSE: { name: 'Eclipse', description: 'Technologists seeking to restore the old world network.', color: '#3b82f6' },
    SYNDICATE: { name: 'Syndicate', description: 'Mercantile faction controlling trade routes and resources.', color: '#eab308' },
    ADMIN: { name: 'System Admin', description: 'Game Administrators with oversight capabilities.', color: '#ff0000' }
};