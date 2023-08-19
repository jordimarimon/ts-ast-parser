import type { AnalyserSystem } from './analyser-system.js';
import { isBrowser } from './is-browser.js';


export async function createSystem(): Promise<AnalyserSystem> {
    if (isBrowser) {
        const m = await import('./in-memory-system.js');
        return m.InMemorySystem.create();
    }

    const m = await import('./node-system.js');
    return new m.NodeSystem();
}
