/**
 * Hand-drawn pixel sprites as character grids (one char = one pixel).
 * Palette is a Stardew-ish set; '.' is transparent.
 */
export const PALETTE: Record<string, string> = {
  o: '#2b4a1c', // leaf outline
  d: '#3f7d28', // leaf dark
  g: '#5fa937', // leaf mid
  l: '#8bd24a', // leaf light
  h: '#c6ef7d', // leaf highlight
  t: '#8a5426', // trunk
  k: '#5a3416', // trunk shadow / outline
  y: '#ffd23f', // yellow
  r: '#e0452b', // red
  p: '#f58aa6', // pink
  w: '#fff6dc', // cream
  a: '#d97a1f', // orange
  v: '#b05fcf', // turnip purple
  x: '#d9c08a', // empty heart
  R: '#ff9d8a', // heart highlight
};

export const SPRITES: Record<string, string[]> = {
  tree: [
    '.....oooooo.....',
    '...ooghhlllgo...',
    '..oghhllllllgo..',
    '.oghhllllgggggo.',
    '.ohhlllgggggddo.',
    'oghllllgggggdddo',
    'ohllllgggggdddko',
    'ohlllgggggddddko',
    'oglllgggggddddko',
    'oggllggggddddkko',
    '.ogggggggdddddo.',
    '.oggggggdddddko.',
    '..ooddgdddddoo..',
    '....oodddddoo...',
    '......okto......',
    '......kttk......',
    '......kttk......',
    '......kttk......',
    '.....kkttkk.....',
    '....kkttttkk....',
  ],
  sapling: [
    '................',
    '.....oo.........',
    '....oggo..oo....',
    '...oglgo.oglo...',
    '...ogllgoogllo..',
    '....oggokgggo...',
    '.....ookto.o....',
    '.......kt.......',
    '.......kt.......',
    '......kktk......',
  ],
  flower: [
    '....pp....',
    '...pyyp...',
    '..ppyypp..',
    '...pyyp...',
    '....pk....',
    '..o.gk.o..',
    '..ogkko...',
    '...ogk....',
    '....gk....',
    '....kk....',
  ],
  pumpkin: [
    '......kk........',
    '.....kgg........',
    '...oaaoaaao.....',
    '..oaaaaaaaaaao..',
    '.oaaaaaaaaaaao..',
    '.oaaaaaaaaaaao..',
    '.oaaaaaaaaaaao..',
    '..oaaaaaaaaao...',
    '...ooooooooo....',
  ],
  crop3: [
    '................',
    '................',
    '................',
    '.....g..g.g.....',
    '....gl.glgl.....',
    '.....gglggl.....',
    '......glgg......',
    '.....wwwwww.....',
    '....wwwvvwww....',
    '....wwvvvvww....',
    '....wwwvvwww....',
    '.....wwwwww.....',
    '......wwww......',
    '.......ww.......',
    '................',
    '................',
  ],
  coin: [
    '...kkkk...',
    '..kyyyyk..',
    '.kyywwyyk.',
    'kyywyyyyak',
    'kyywyyyyak',
    'kyywyyyyak',
    'kyyyyyyyak',
    '.kyyyyyak.',
    '..kaaaak..',
    '...kkkk...',
  ],
  sun: [
    '...y..y...',
    '....yy....',
    '.y.yyyy.y.',
    '..yyyyyy..',
    'yyyyyyyyyy',
    'yyyyyyyyyy',
    '..yyyyyy..',
    '.y.yyyy.y.',
    '....yy....',
    '...y..y...',
  ],
  heart: ['.kk.kk.', 'kRrkrrk', 'krrrrrk', '.krrrk.', '..krk..', '...k...'],
  heartEmpty: ['.kk.kk.', 'kxxkxxk', 'kxxxxxk', '.kxxxk.', '..kxk..', '...k...'],
  star: [
    '....k....',
    '...kyk...',
    '..kyyyk..',
    'kkyyyyykk',
    'kyyywyyyk',
    '.kyyyyyk.',
    '.kyykyyk.',
    'kyyk.kyyk',
    '.kk...kk.',
  ],
  letter: [
    'kkkkkkkkkkkk',
    'kwwwwwwwwwwk',
    'kwkwwwwwwkwk',
    'kwwkwwwwkwwk',
    'kwwwkkkkwwwk',
    'kwwwwrrwwwwk',
    'kwwwwwwwwwwk',
    'kkkkkkkkkkkk',
  ],
  book: [
    '.kkkkkkkkkk.',
    'kaaaaaaaaaak',
    'kawwwwwwwwak',
    'kawkkkkkkwak',
    'kawwwwwwwwak',
    'kawkkkkkkwak',
    'kawwwwwwwwak',
    'kaaaaaaaaaak',
    '.kkkkkkkkkk.',
  ],
  pickaxe: [
    '..nnnnnnnn....',
    '.nNnnnnnnnn...',
    'nN....tt.nN...',
    'n....tt...nN..',
    '....tt.....n..',
    '...tt.........',
    '..tt..........',
    '.tt...........',
    'tt............',
  ],
  hoe: [
    '..........nnnn..',
    '.........nNNNNn.',
    '..........ttnNn.',
    '.........tt.....',
    '........tt......',
    '.......tt.......',
    '......tt........',
    '.....tt.........',
    '....tt..........',
    '...tt...........',
    '..tt............',
    '.tt.............',
  ],
};

/** Steel colours used by tool sprites. */
PALETTE.n = '#aab3bd';
PALETTE.N = '#5f6872';

/** Merge horizontal runs of the same colour into rects. */
export function spriteRects(name: string) {
  const rows = SPRITES[name] ?? [];
  const w = Math.max(1, ...rows.map((r) => r.length));
  const rects: { x: number; y: number; w: number; fill: string }[] = [];
  rows.forEach((row, y) => {
    const r = row.padEnd(w, '.');
    let x = 0;
    while (x < w) {
      const c = r[x];
      let n = 1;
      while (x + n < w && r[x + n] === c) n++;
      if (c !== '.' && PALETTE[c]) rects.push({ x, y, w: n, fill: PALETTE[c] });
      x += n;
    }
  });
  return { w, h: rows.length, rects };
}
