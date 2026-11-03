/**
 * Ant colony foraging on the GPU (stigmergy / pheromone-based ACO).
 *
 * three.js WebGPURenderer + TSL compute shaders, one thread per ant / per cell:
 *   - diffuse : blur + evaporate both pheromone fields, shade the display texture
 *   - copy    : ping-pong the pheromone buffers
 *   - ants    : sense (left / centre / right), steer, move, pick up / drop food,
 *               deposit pheromone and stamp themselves into the display texture
 *   - paint   : apply the pointer brush (food / wall / erase)
 *
 * Two pheromone channels:
 *   x = "food" trail  — laid by ants carrying food, followed by foragers
 *   y = "home" trail  — laid by foragers, followed by ants returning to the nest
 */
import * as THREE from 'three/webgpu';
import {
  Fn,
  If,
  uniform,
  instancedArray,
  instanceIndex,
  float,
  int,
  uint,
  vec2,
  vec3,
  vec4,
  uvec2,
  cos,
  sin,
  exp,
  min,
  max,
  clamp,
  floor,
  mix,
  abs,
  select,
  distance,
  hash,
  texture,
  textureStore,
  atomicAdd,
  atomicStore,
} from 'three/tsl';
import { createRenderer, fitPixelated, createFpsMeter, type FrameHooks } from './gpu';

export const ANT_GRID = { w: 512, h: 256 } as const;

export type AntBrush = 'food' | 'wall' | 'erase';

export interface AntParams {
  count: number;
  sensorAngle: number;
  sensorDistance: number;
  turnRate: number;
  speed: number;
  evaporation: number;
  diffusion: number;
  stepsPerFrame: number;
  brush: AntBrush;
}

export const defaultAntParams = (): AntParams => ({
  count: 8192,
  sensorAngle: 0.6,
  sensorDistance: 6,
  turnRate: 0.4,
  speed: 0.7,
  evaporation: 0.006,
  diffusion: 0.12,
  stepsPerFrame: 2,
  brush: 'food',
});

export interface AntStats {
  fps: number;
  delivered: number;
}

const FOOD_PER_CELL = 6;
const BRUSH_MODE: Record<AntBrush, number> = { food: 0, wall: 1, erase: 2 };

// Palette (display-space RGB).
const C = {
  ink: vec3(0.29, 0.165, 0.078),
  carrier: vec3(0.95, 0.33, 0.1),
  food: vec3(0.84, 0.27, 0.05),
  foodTrail: vec3(1.0, 0.42, 0.16),
  homeTrail: vec3(0.2, 0.4, 1.0),
  wall: vec3(0.36, 0.2, 0.09),
};

export async function createAnts(
  canvas: HTMLCanvasElement,
  params: AntParams,
  onStats?: (s: AntStats) => void,
  hooks?: FrameHooks,
) {
  const renderer = await createRenderer(canvas);
  const GW = ANT_GRID.w;
  const GH = ANT_GRID.h;
  const CELLS = GW * GH;

  const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 2);
  camera.position.z = 1;
  const scene = new THREE.Scene();

  const display = new THREE.StorageTexture(GW, GH);
  display.magFilter = THREE.NearestFilter;
  display.minFilter = THREE.NearestFilter;
  display.generateMipmaps = false;

  const quadMat = new THREE.MeshBasicNodeMaterial();
  quadMat.colorNode = texture(display);
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), quadMat));

  const u = {
    frame: uniform(0),
    nest: uniform(new THREE.Vector2(GW * 0.2, GH * 0.5)),
    nestR: uniform(9),
    foodA: uniform(new THREE.Vector3()),
    foodB: uniform(new THREE.Vector3()),
    foodC: uniform(new THREE.Vector3()),
    wall: uniform(new THREE.Vector4()), // x0, y0, x1, y1
    wallGap: uniform(new THREE.Vector2()), // gap y0, y1
    brush: uniform(new THREE.Vector3(0, 0, 6)),
    brushMode: uniform(0),
    sensorAngle: uniform(params.sensorAngle),
    sensorDistance: uniform(params.sensorDistance),
    turnRate: uniform(params.turnRate),
    speed: uniform(params.speed),
    evaporation: uniform(params.evaporation),
    diffusion: uniform(params.diffusion),
  };

  const trail = instancedArray(CELLS, 'vec2').setName('trail');
  const trailNext = instancedArray(CELLS, 'vec2').setName('trailNext');
  const cells = instancedArray(CELLS, 'float').setName('cells'); // >0 food, <0 wall
  const delivered = instancedArray(1, 'uint').setName('delivered').toAtomic();

  const cellIndex = (p: any) => {
    const c = clamp(floor(p), vec2(0, 0), vec2(GW - 1, GH - 1));
    return int(c.y).mul(int(GW)).add(int(c.x));
  };
  const cellCoord = () => {
    const x = instanceIndex.mod(uint(GW));
    const y = instanceIndex.div(uint(GW));
    return { x, y, center: vec2(x.toFloat(), y.toFloat()).add(0.5) };
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inDisc = (p: any, disc: any) => distance(p, disc.xy).lessThan(disc.z);

  // ---------- reset map ----------
  const computeClearMap = Fn(() => {
    const { center } = cellCoord();
    const value = float(0).toVar();
    If(inDisc(center, u.foodA).or(inDisc(center, u.foodB)).or(inDisc(center, u.foodC)), () => {
      value.assign(FOOD_PER_CELL);
    });
    const inWall = center.x
      .greaterThan(u.wall.x)
      .and(center.x.lessThan(u.wall.z))
      .and(center.y.greaterThan(u.wall.y))
      .and(center.y.lessThan(u.wall.w))
      .and(center.y.lessThan(u.wallGap.x).or(center.y.greaterThan(u.wallGap.y)));
    If(inWall, () => {
      value.assign(-1);
    });
    cells.element(instanceIndex).assign(value);
    trail.element(instanceIndex).assign(vec2(0));
    trailNext.element(instanceIndex).assign(vec2(0));
    If(instanceIndex.equal(uint(0)), () => {
      atomicStore(delivered.element(uint(0)), uint(0));
    });
  })()
    .compute(CELLS)
    .setName('Ants Clear');

  // ---------- paint ----------
  const computePaint = Fn(() => {
    const { center } = cellCoord();
    If(distance(center, u.brush.xy).lessThan(u.brush.z), () => {
      const idx = instanceIndex;
      If(u.brushMode.equal(0), () => {
        cells.element(idx).assign(FOOD_PER_CELL);
      })
        .ElseIf(u.brushMode.equal(1), () => {
          cells.element(idx).assign(-1);
          trail.element(idx).assign(vec2(0));
        })
        .Else(() => {
          cells.element(idx).assign(0);
        });
    });
  })()
    .compute(CELLS)
    .setName('Ants Paint');

  // ---------- diffuse / evaporate / shade ----------
  const computeDiffuse = Fn(() => {
    const { x, y, center } = cellCoord();
    const xi = int(x);
    const yi = int(y);
    const sum = vec2(0).toVar();
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const sx: any = clamp(xi.add(int(dx)) as any, int(0) as any, int(GW - 1) as any);
        const sy: any = clamp(yi.add(int(dy)) as any, int(0) as any, int(GH - 1) as any);
        sum.addAssign(trail.element(sy.mul(int(GW)).add(sx)));
      }
    }
    const here = trail.element(instanceIndex);
    const cell = cells.element(instanceIndex).toVar();
    const v = mix(here, sum.div(9), u.diffusion).mul(float(1).sub(u.evaporation)).toVar();
    If(cell.lessThan(0), () => {
      v.assign(vec2(0));
    });
    trailNext.element(instanceIndex).assign(v);

    // Subtractive shading on white: pheromone "ink" bleeds into the paper.
    const f = float(1).sub(exp(v.x.mul(-0.9)));
    const h = float(1).sub(exp(v.y.mul(-0.9))).mul(0.55);
    const paper = vec3(0.992, 0.941, 0.784);
    const col = paper
      .sub(paper.sub(C.foodTrail).mul(f))
      .sub(paper.sub(C.homeTrail).mul(h))
      .toVar();
    col.assign(clamp(col, vec3(0), vec3(1)));

    If(cell.greaterThan(0), () => {
      col.assign(mix(vec3(0.98, 0.8, 0.7), C.food, cell.div(FOOD_PER_CELL)));
    });
    If(cell.lessThan(0), () => {
      col.assign(C.wall);
    });

    const dn = distance(center, u.nest);
    If(dn.lessThan(u.nestR), () => {
      col.assign(mix(col, C.ink, 0.08));
    });
    If(abs(dn.sub(u.nestR)).lessThan(0.75), () => {
      col.assign(C.ink);
    });

    textureStore(display, uvec2(x, y), vec4(col, 1)).toWriteOnly();
  })()
    .compute(CELLS)
    .setName('Ants Diffuse');

  const computeCopy = Fn(() => {
    trail.element(instanceIndex).assign(trailNext.element(instanceIndex));
  })()
    .compute(CELLS)
    .setName('Ants Copy');

  // ---------- ants ----------
  let ants = instancedArray(1, 'vec4');
  let carry = instancedArray(1, 'float');
  let computeAnts: THREE.ComputeNode | null = null;
  let computeSpawn: THREE.ComputeNode | null = null;

  const sense = Fn(([p, a, carrying]: [any, any, any]) => {
    const q = p.add(vec2(cos(a), sin(a)).mul(u.sensorDistance)).toVar();
    const v = float(0).toVar();
    const inside = q.x
      .greaterThanEqual(0)
      .and(q.x.lessThan(GW))
      .and(q.y.greaterThanEqual(0))
      .and(q.y.lessThan(GH));
    If(inside.not(), () => {
      v.assign(-1000);
    }).Else(() => {
      const idx = cellIndex(q);
      const t = trail.element(idx).toVar();
      const cell = cells.element(idx).toVar();
      v.assign(select(carrying.greaterThan(0.5), t.y, t.x));
      If(cell.lessThan(0), () => {
        v.assign(-1000);
      });
      If(carrying.lessThan(0.5).and(cell.greaterThan(0)), () => {
        v.addAssign(50);
      });
      If(carrying.greaterThan(0.5).and(distance(q, u.nest).lessThan(u.nestR)), () => {
        v.addAssign(50);
      });
    });
    return v;
  });

  function buildAnts(count: number) {
    ants = instancedArray(count, 'vec4').setName('ants'); // x, y, heading, steps since last event
    carry = instancedArray(count, 'float').setName('carry');

    computeSpawn = Fn(() => {
      const i = instanceIndex;
      const a = hash(i.add(u.frame.toUint().mul(uint(7919)))).mul(Math.PI * 2);
      const r = hash(i.add(uint(104729))).mul(u.nestR).mul(0.8);
      const p = u.nest.add(vec2(cos(a), sin(a)).mul(r));
      ants.element(i).assign(vec4(p, a, 0));
      carry.element(i).assign(0);
    })()
      .compute(count)
      .setName('Ants Spawn');

    computeAnts = Fn(() => {
      const i = instanceIndex;
      const s = ants.element(i).toVar();
      const c = carry.element(i).toVar();
      const seed = i.add(u.frame.toUint().mul(uint(count)));
      const r1 = hash(seed);
      const r2 = hash(seed.add(uint(0x9e37)));

      const fL = sense(s.xy, s.z.add(u.sensorAngle), c);
      const fC = sense(s.xy, s.z, c);
      const fR = sense(s.xy, s.z.sub(u.sensorAngle), c);

      If(fC.greaterThan(fL).and(fC.greaterThan(fR)), () => {
        // keep heading
      })
        .ElseIf(fL.greaterThan(fR), () => {
          s.z.addAssign(u.turnRate.mul(r1.add(0.5)));
        })
        .ElseIf(fR.greaterThan(fL), () => {
          s.z.subAssign(u.turnRate.mul(r1.add(0.5)));
        });
      s.z.addAssign(r2.sub(0.5).mul(0.35)); // wander

      const np = s.xy.add(vec2(cos(s.z), sin(s.z)).mul(u.speed)).toVar();
      const inside = np.x
        .greaterThanEqual(0)
        .and(np.x.lessThan(GW))
        .and(np.y.greaterThanEqual(0))
        .and(np.y.lessThan(GH));
      const blocked = inside.not().or(cells.element(cellIndex(np)).lessThan(0));
      If(blocked, () => {
        s.z.addAssign(float(Math.PI).add(r1.sub(0.5)));
      }).Else(() => {
        s.x.assign(np.x);
        s.y.assign(np.y);
      });

      const idx = cellIndex(s.xy);
      const atNest = distance(s.xy, u.nest).lessThan(u.nestR);
      If(c.lessThan(0.5), () => {
        const food = cells.element(idx).toVar();
        If(food.greaterThan(0), () => {
          cells.element(idx).assign(max(food.sub(1), 0));
          c.assign(1);
          s.z.addAssign(Math.PI);
          s.w.assign(0);
        }).ElseIf(atNest, () => {
          s.w.assign(0);
        });
      }).Else(() => {
        If(atNest, () => {
          c.assign(0);
          s.z.addAssign(Math.PI);
          s.w.assign(0);
          atomicAdd(delivered.element(uint(0)), uint(1));
        });
      });

      // Deposit: fresher trails (fewer steps since the last source) are stronger.
      const strength = exp(s.w.mul(-0.004)).mul(0.6);
      const t = trail.element(idx).toVar();
      If(c.greaterThan(0.5), () => {
        t.x.addAssign(strength);
      }).Else(() => {
        t.y.addAssign(strength);
      });
      trail.element(idx).assign(min(t, vec2(8)));
      s.w.addAssign(1);

      ants.element(i).assign(s);
      carry.element(i).assign(c);

      const cx = uint(clamp(floor(s.x), 0, GW - 1));
      const cy = uint(clamp(floor(s.y), 0, GH - 1));
      textureStore(display, uvec2(cx, cy), vec4(select(c.greaterThan(0.5), C.carrier, C.ink), 1)).toWriteOnly();
    })()
      .compute(count)
      .setName('Ants Step');
  }

  function randomizeMap() {
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const nest = new THREE.Vector2(rnd(GW * 0.1, GW * 0.22), rnd(GH * 0.3, GH * 0.7));
    u.nest.value.copy(nest);
    u.foodA.value.set(rnd(GW * 0.7, GW * 0.9), rnd(GH * 0.15, GH * 0.4), rnd(9, 14));
    u.foodB.value.set(rnd(GW * 0.68, GW * 0.9), rnd(GH * 0.6, GH * 0.85), rnd(8, 12));
    u.foodC.value.set(rnd(GW * 0.45, GW * 0.58), rnd(GH * 0.1, GH * 0.9), rnd(5, 8));
    // A partition wall with a gap the colony must discover.
    const wx = rnd(GW * 0.34, GW * 0.42);
    u.wall.value.set(wx, GH * 0.06, wx + 3, GH * 0.94);
    const gap = rnd(GH * 0.2, GH * 0.8);
    u.wallGap.value.set(gap - 9, gap + 9);
  }

  function reset(newMap = true) {
    if (newMap) randomizeMap();
    buildAnts(params.count);
    renderer.compute(computeClearMap);
    renderer.compute(computeSpawn!);
    renderer.compute(computeDiffuse);
  }

  reset();

  const resize = () => fitPixelated(renderer, canvas, GW);
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // ---------- pointer brush ----------
  let painting = false;
  const toGrid = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * GW, (1 - (e.clientY - r.top) / r.height) * GH] as const;
  };
  const onDown = (e: PointerEvent) => {
    painting = true;
    canvas.setPointerCapture(e.pointerId);
    onMove(e);
  };
  const onMove = (e: PointerEvent) => {
    if (!painting) return;
    const [x, y] = toGrid(e);
    u.brush.value.set(x, y, params.brush === 'wall' ? 3.5 : 6);
    u.brushMode.value = BRUSH_MODE[params.brush];
    renderer.compute(computePaint);
  };
  const onUp = () => {
    painting = false;
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  // ---------- loop ----------
  const fps = createFpsMeter();
  let frame = 0;
  let deliveredCount = 0;
  let reading = false;
  const readDelivered = async () => {
    if (reading) return;
    reading = true;
    try {
      const buf = await renderer.getArrayBufferAsync(delivered.value as THREE.StorageBufferAttribute);
      deliveredCount = new Uint32Array(buf)[0] ?? deliveredCount;
    } catch {
      /* readback is best-effort */
    } finally {
      reading = false;
    }
  };

  const loop = () => {
    hooks?.begin?.();
    const { fps: f } = fps.tick();
    for (let s = 0; s < params.stepsPerFrame; s++) {
      u.frame.value = (u.frame.value + 1) % 1e6;
      renderer.compute(computeDiffuse);
      renderer.compute(computeCopy);
      renderer.compute(computeAnts!);
    }
    renderer.render(scene, camera);
    hooks?.end?.();
    if (++frame % 20 === 0) {
      void readDelivered();
      onStats?.({ fps: f, delivered: deliveredCount });
    }
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
      renderer.render(scene, camera);
    },
    sync() {
      u.sensorAngle.value = params.sensorAngle;
      u.sensorDistance.value = params.sensorDistance;
      u.turnRate.value = params.turnRate;
      u.speed.value = params.speed;
      u.evaporation.value = params.evaporation;
      u.diffusion.value = params.diffusion;
    },
    /** Respawn the colony; `newMap` also regenerates nest, food and walls. */
    reset(newMap = true) {
      deliveredCount = 0;
      reset(newMap);
      renderer.render(scene, camera);
    },
    dispose() {
      this.stop();
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      renderer.dispose();
    },
  };
}

export type AntsSim = Awaited<ReturnType<typeof createAnts>>;
