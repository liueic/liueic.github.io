/**
 * Glue between an Astro panel and a WebGPU simulation:
 * lazy-creates the sim the first time the canvas becomes visible (tabs, scrolling),
 * pauses it when off-screen / hidden tab, and falls back gracefully without WebGPU.
 */
import { hasWebGPU } from './gpu';

export interface Controllable {
  start(): void;
  stop(): void;
  readonly running: boolean;
  dispose(): void;
}

export function mountSim<T extends Controllable>(opts: {
  canvas: HTMLCanvasElement;
  fallback: HTMLElement;
  create: () => Promise<T>;
  onReady: (sim: T) => void;
}) {
  const { canvas, fallback, create, onReady } = opts;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let sim: T | null = null;
  let creating = false;
  let failed = false;
  let visible = false;
  let userPaused = reduceMotion;

  const showFallback = () => {
    failed = true;
    canvas.classList.add('hidden');
    fallback.classList.remove('hidden');
  };

  const sync = () => {
    if (!sim) return;
    if (visible && !userPaused) sim.start();
    else sim.stop();
  };

  const ensure = async () => {
    if (sim || creating || failed) return;
    creating = true;
    try {
      if (!(await hasWebGPU())) throw new Error('no webgpu');
      sim = await create();
      onReady(sim);
      sync();
    } catch (err) {
      console.warn('[sim] WebGPU unavailable:', err);
      showFallback();
    } finally {
      creating = false;
    }
  };

  new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible) void ensure();
      sync();
    },
    { threshold: 0.05 },
  ).observe(canvas);

  return {
    get sim() {
      return sim;
    },
    get paused() {
      return userPaused;
    },
    setPaused(p: boolean) {
      userPaused = p;
      sync();
    },
  };
}
