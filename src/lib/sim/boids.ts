/**
 * Boids (Reynolds flocking) on the GPU.
 *
 * Built on three.js WebGPURenderer + TSL compute shaders, adapted from the
 * official `webgpu_compute_birds` example to a 2D toroidal world:
 *   - pass 1 (velocity): separation / alignment / cohesion + pointer force
 *   - pass 2 (position): integrate and wrap around the edges
 * Rendering is a single instanced draw that reads the storage buffers
 * directly as instanced vertex attributes.
 */
import * as THREE from 'three/webgpu';
import {
  Fn,
  If,
  Loop,
  Continue,
  uniform,
  instancedArray,
  instanceIndex,
  float,
  uint,
  vec2,
  vec3,
  vec4,
  normalize,
  dot,
  length,
  max,
  clamp,
  floor,
  round,
  mix,
  cos,
  atan,
  varying,
  positionGeometry,
  cameraProjectionMatrix,
  cameraViewMatrix,
} from 'three/tsl';
import { createRenderer, fitPixelated, createFpsMeter, type FrameHooks } from './gpu';

export const BOIDS_WORLD = { w: 1024, h: 512 } as const;

export interface BoidsParams {
  count: number;
  separation: number;
  alignment: number;
  cohesion: number;
  radius: number;
  maxSpeed: number;
  pixel: number;
  colorMode: 'density' | 'heading';
}

export const defaultBoidsParams = (): BoidsParams => ({
  count: 4096,
  separation: 1,
  alignment: 1,
  cohesion: 1,
  radius: 26,
  maxSpeed: 2.2,
  pixel: 2,
  colorMode: 'density',
});

export interface BoidsStats {
  fps: number;
  count: number;
}

export async function createBoids(
  canvas: HTMLCanvasElement,
  params: BoidsParams,
  onStats?: (s: BoidsStats) => void,
  hooks?: FrameHooks,
) {
  const renderer = await createRenderer(canvas);
  const { w: W, h: H } = BOIDS_WORLD;

  const camera = new THREE.OrthographicCamera(0, W, H, 0, 0, 2);
  camera.position.z = 1;
  const scene = new THREE.Scene();

  const u = {
    dt: uniform(1),
    separation: uniform(params.separation),
    alignment: uniform(params.alignment),
    cohesion: uniform(params.cohesion),
    radius: uniform(params.radius),
    maxSpeed: uniform(params.maxSpeed),
    size: uniform(4.2),
    colorMode: uniform(params.colorMode === 'heading' ? 1 : 0),
    pointer: uniform(new THREE.Vector2(-1e4, -1e4)),
    pointerForce: uniform(0),
    pointerRadius: uniform(110),
  };

  // Arrow-shaped boid: two triangles forming a chevron, pointing along +x.
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
      new Float32Array([1.3, 0, 0, -0.9, 0.75, 0, -0.35, 0, 0, 1.3, 0, 0, -0.35, 0, 0, -0.9, -0.75, 0]),
      3,
    ),
  );

  let mesh: THREE.InstancedMesh | null = null;
  let computeVelocity: THREE.ComputeNode | null = null;
  let computePosition: THREE.ComputeNode | null = null;
  let material: THREE.MeshBasicNodeMaterial | null = null;

  function build(count: number) {
    if (mesh) {
      scene.remove(mesh);
      mesh.dispose();
      material?.dispose();
    }

    const posArray = new Float32Array(count * 2);
    const velArray = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      posArray[i * 2] = Math.random() * W;
      posArray[i * 2 + 1] = Math.random() * H;
      const a = Math.random() * Math.PI * 2;
      velArray[i * 4] = Math.cos(a) * 1.5;
      velArray[i * 4 + 1] = Math.sin(a) * 1.5;
    }

    const pos = instancedArray(posArray, 'vec2').setName('boidPos');
    const vel = instancedArray(velArray, 'vec4').setName('boidVel'); // xy: velocity, z: neighbour count
    const world = vec2(W, H);

    computeVelocity = Fn(() => {
      const self = instanceIndex.toConst('self');
      const p = pos.element(self).toVar();
      const v = vel.element(self).xy.toVar();

      const ali = vec2(0).toVar();
      const coh = vec2(0).toVar();
      const sep = vec2(0).toVar();
      const n = float(0).toVar();

      const r2 = u.radius.mul(u.radius).toConst();
      const s2 = r2.mul(0.16).toConst();

      Loop({ start: uint(0), end: uint(count), type: 'uint', condition: '<' }, ({ i }) => {
        If(i.equal(self), () => {
          Continue();
        });
        const d = pos.element(i).sub(p).toVar();
        d.subAssign(world.mul(round(d.div(world)))); // shortest offset on the torus
        const d2 = dot(d, d).toVar();
        If(d2.lessThan(r2), () => {
          n.addAssign(1);
          ali.addAssign(vel.element(i).xy);
          coh.addAssign(d);
          If(d2.lessThan(s2), () => {
            sep.subAssign(d.div(max(d2, 0.01)));
          });
        });
      });

      const acc = vec2(0).toVar();
      If(n.greaterThan(0), () => {
        acc.addAssign(ali.div(n).sub(v).mul(u.alignment.mul(0.05)));
        acc.addAssign(coh.div(n).mul(u.cohesion.mul(0.004)));
      });
      acc.addAssign(sep.mul(u.separation.mul(0.6)));

      const dm = p.sub(u.pointer).toVar();
      const dl = length(dm).toVar();
      If(dl.lessThan(u.pointerRadius), () => {
        const falloff = float(1).sub(dl.div(u.pointerRadius));
        acc.addAssign(dm.div(max(dl, 0.001)).mul(falloff).mul(u.pointerForce));
      });

      v.addAssign(acc.mul(u.dt));
      const speed = length(v).toVar();
      const target = clamp(speed, u.maxSpeed.mul(0.45), u.maxSpeed);
      v.assign(v.div(max(speed, 0.0001)).mul(target));

      vel.element(self).assign(vec4(v, n, 0));
    })().compute(count).setName('Boids Velocity');

    computePosition = Fn(() => {
      const p = pos.element(instanceIndex);
      const np = p.add(vel.element(instanceIndex).xy.mul(u.dt)).toVar();
      np.subAssign(world.mul(floor(np.div(world))));
      p.assign(np);
    })().compute(count).setName('Boids Position');

    const pa = pos.toAttribute();
    const va = vel.toAttribute();

    material = new THREE.MeshBasicNodeMaterial();
    material.side = THREE.DoubleSide;
    material.vertexNode = Fn(() => {
      const dir = normalize(va.xy.add(vec2(1e-5, 0)));
      const perp = vec2(dir.y.negate(), dir.x);
      const lp = positionGeometry.xy.mul(u.size);
      const wp = pa.add(dir.mul(lp.x)).add(perp.mul(lp.y));
      return cameraProjectionMatrix.mul(cameraViewMatrix).mul(vec4(wp, 0, 1));
    })();

    // Density shading: lone boids fade to grey, dense flocks go full ink.
    const density = clamp(va.z.div(14), 0, 1);
    const ink = mix(vec3(0.78, 0.62, 0.38), vec3(0.29, 0.165, 0.078), density.pow(0.6));
    // Heading shading: a restrained cosine palette (Inigo Quilez) keyed on direction.
    const t = atan(va.y, va.x).div(Math.PI * 2).add(0.5);
    const palette = vec3(0.45).add(vec3(0.4).mul(cos(vec3(t).add(vec3(0, 0.33, 0.67)).mul(Math.PI * 2))));
    material.colorNode = varying(mix(ink, palette, u.colorMode));

    mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.frustumCulled = false;
    scene.add(mesh);
  }

  build(params.count);

  const resize = () => fitPixelated(renderer, canvas, W / params.pixel);
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // Pointer: hover repels (predator), press attracts (food).
  const toWorld = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return new THREE.Vector2(((e.clientX - r.left) / r.width) * W, (1 - (e.clientY - r.top) / r.height) * H);
  };
  let pressed = false;
  const onMove = (e: PointerEvent) => {
    u.pointer.value.copy(toWorld(e));
    u.pointerForce.value = pressed ? -0.18 : 0.35;
  };
  const onDown = (e: PointerEvent) => {
    pressed = true;
    onMove(e);
  };
  const onUp = () => {
    pressed = false;
    u.pointerForce.value = 0.35;
  };
  const onLeave = () => {
    pressed = false;
    u.pointer.value.set(-1e4, -1e4);
    u.pointerForce.value = 0;
  };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointerleave', onLeave);

  const fps = createFpsMeter();
  let frame = 0;
  const loop = () => {
    hooks?.begin?.();
    const { dtFrames, fps: f } = fps.tick();
    u.dt.value = dtFrames;
    renderer.compute(computeVelocity!);
    renderer.compute(computePosition!);
    renderer.render(scene, camera);
    hooks?.end?.();
    if (++frame % 30 === 0) onStats?.({ fps: f, count: params.count });
  };

  let running = false;
  return {
    get running() {
      return running;
    },
    start() {
      if (running) return;
      running = true;
      fps.reset();
      renderer.setAnimationLoop(loop);
    },
    stop() {
      running = false;
      renderer.setAnimationLoop(null);
    },
    /** Push current `params` values into GPU uniforms. */
    sync() {
      u.separation.value = params.separation;
      u.alignment.value = params.alignment;
      u.cohesion.value = params.cohesion;
      u.radius.value = params.radius;
      u.maxSpeed.value = params.maxSpeed;
      u.colorMode.value = params.colorMode === 'heading' ? 1 : 0;
      resize();
    },
    reset() {
      build(params.count);
      if (!running) renderer.render(scene, camera);
    },
    dispose() {
      this.stop();
      ro.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
      renderer.dispose();
    },
  };
}

export type BoidsSim = Awaited<ReturnType<typeof createBoids>>;
