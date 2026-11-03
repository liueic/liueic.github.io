/**
 * Shared helpers for the WebGPU simulations (three.js WebGPURenderer + TSL).
 * three.js is imported lazily by the simulation modules so it never blocks first paint.
 */
import type { WebGPURenderer } from 'three/webgpu';

/** Optional per-frame callbacks (e.g. Tweakpane's FPS graph). */
export interface FrameHooks {
  begin?: () => void;
  end?: () => void;
}

/** True when the browser exposes a usable WebGPU adapter. */
export async function hasWebGPU(): Promise<boolean> {
  const gpu = (globalThis.navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } })?.gpu;
  if (!gpu) return false;
  try {
    return Boolean(await gpu.requestAdapter());
  } catch {
    return false;
  }
}

/**
 * Creates a WebGPURenderer bound to an existing canvas.
 * Colors in the simulations are authored directly in display (sRGB) space,
 * so output color conversion is disabled.
 */
export async function createRenderer(canvas: HTMLCanvasElement): Promise<WebGPURenderer> {
  const THREE = await import('three/webgpu');
  const renderer = new THREE.WebGPURenderer({ canvas, antialias: false, alpha: false });
  await renderer.init();
  const backend = renderer.backend as { isWebGPUBackend?: boolean };
  if (!backend.isWebGPUBackend) {
    renderer.dispose();
    throw new Error('WebGPU backend unavailable');
  }
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor(new THREE.Color().setRGB(0.992, 0.941, 0.784, THREE.LinearSRGBColorSpace), 1);
  return renderer;
}

/**
 * Sizes the renderer so the drawing buffer is `targetWidth` pixels wide,
 * regardless of the CSS size. Combined with `image-rendering: pixelated`
 * this produces crisp, chunky pixels.
 */
export function fitPixelated(renderer: WebGPURenderer, canvas: HTMLCanvasElement, targetWidth: number) {
  const w = Math.max(1, canvas.clientWidth);
  const h = Math.max(1, canvas.clientHeight);
  renderer.setPixelRatio(targetWidth / w);
  renderer.setSize(w, h, false);
}

/** Simple smoothed FPS meter. */
export function createFpsMeter() {
  let last = performance.now();
  let fps = 60;
  return {
    tick() {
      const now = performance.now();
      const dt = now - last;
      last = now;
      if (dt > 0 && dt < 1000) fps = fps * 0.92 + (1000 / dt) * 0.08;
      return { dtFrames: Math.min(dt / (1000 / 60), 3), fps };
    },
    reset() {
      last = performance.now();
    },
  };
}
