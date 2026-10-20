import Phaser from 'phaser';

/**
 * KyberMap — carrega os mapas da Rede Kyber no Phaser 3 (testado com 3.90).
 *
 *   preload():  KyberMap.preload(this, 'assets/');
 *   create():   this.kmap = new KyberMap(this, 'fase1_autenticacao');
 *               this.kmap.collide(player);  this.kmap.trackDepth(player);
 *   update(t):  this.kmap.update(t);
 *
 * Camadas (depth): chão/paredes 0 · pulsos dos fios 5 · objetos 10 + y
 * · partículas 9000 · luzes 10000 · ambiente 10001. UI deve ficar acima de 10002.
 */
(function (root) {
  'use strict';

  const ATLAS_KEY = 'interior-neon';
  const PAD = 16; // margem extra nos canvases dos objetos animados (brilhos/partículas)
  const MAP_IDS = ['fase1_autenticacao', 'fase2_caca_ao_golpe', 'fase3_proteja_dados'];
  const DEPTH = { under: 0, pulses: 5, objects: 10, motes: 9000, lights: 10000, ambient: 10001, debug: 20000 };

  /* ---------- tabelas das animações (iguais às da prévia HTML) ---------- */
  const DYN = new Set(['plant_fern', 'plant_bush']);
  const LEDF = {
    server_rack: { per: 220, var: 90, off: 0.3 },
    window_city_cyan: { per: 900, var: 400, off: 0.2 },
    window_city_mag: { per: 900, var: 400, off: 0.2 },
    window_city_mag2: { per: 1100, var: 400, off: 0.3 },
    wall_screen_mag: { per: 900, var: 400, off: 0.2 },
    scanner_digital: { per: 600, var: 0, off: 0.5 }
  };
  const SCR = {
    screen_small_cyan: [[2, 3, 14, 10]], screen_small_mag: [[2, 3, 14, 10]],
    tablet_cyan: [[2, 3, 16, 17]], tablet_mag: [[2, 3, 16, 17]],
    cabinet_a: [[10, 32, 11, 7]], cabinet_b: [[10, 32, 11, 7]],
    appliance_stack: [[16, 18, 10, 7]],
    holo_desk_cyan: [[19, 4, 26, 10]], holo_desk_mag: [[19, 4, 26, 10]]
  };
  const MOTE = { fase1_autenticacao: '#8ff3ff', fase2_caca_ao_golpe: '#ff9cc8', fase3_proteja_dados: '#ffc878' };
  const isAnimated = f => !!(LEDF[f] || SCR[f] || DYN.has(f) || /^(desk_pc_|holo_desk_)/.test(f) ||
    f === 'laser_bar' || f === 'orb_red' || f === 'appliance_stack');

  const H = n => {
    n = Math.floor(n) | 0; n = (n ^ 61) ^ (n >>> 16); n = (n + (n << 3)) | 0; n = n ^ (n >>> 4);
    n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >>> 15); return (n >>> 0) / 4294967296;
  };
  const css = a => 'rgb(' + a[0] + ',' + a[1] + ',' + a[2] + ')';
  const isLed = a => a[3] > 0 && Math.max(a[0], a[1], a[2]) >= 190 && Math.max(a[0], a[1], a[2]) - Math.min(a[0], a[1], a[2]) >= 70;

  /* ---------- kit de animação (canvas 2D puro, sem depender do Phaser) ---------- */
  function makeKit(img, rect) {
    const pxCache = {}, ledCache = {}, tinted = {};
    const glowBase = (() => {
      const g = document.createElement('canvas'); g.width = g.height = 128;
      const x = g.getContext('2d'), r = x.createRadialGradient(64, 64, 0, 64, 64, 64);
      r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = r; x.fillRect(0, 0, 128, 128); return g;
    })();
    function glowTint(col) {
      if (tinted[col]) return tinted[col];
      const g = document.createElement('canvas'); g.width = g.height = 128;
      const x = g.getContext('2d'); x.drawImage(glowBase, 0, 0);
      x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, 128, 128);
      return (tinted[col] = g);
    }
    function px(f) {
      if (pxCache[f]) return pxCache[f];
      const r = rect(f), c = document.createElement('canvas'); c.width = r.w; c.height = r.h;
      const x = c.getContext('2d'); x.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
      return (pxCache[f] = { w: r.w, h: r.h, d: x.getImageData(0, 0, r.w, r.h).data });
    }
    const pget = (p, x, y) => { const k = (y * p.w + x) * 4, d = p.d; return [d[k], d[k + 1], d[k + 2], d[k + 3]]; };

    /* acha os LEDs (grupos de ≤4 pixels vivos) de um frame */
    function leds(f) {
      if (ledCache[f]) return ledCache[f];
      const p = px(f), seen = new Uint8Array(p.w * p.h), out = [];
      for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
        if (seen[y * p.w + x] || !isLed(pget(p, x, y))) continue;
        const st = [[x, y]], cl = []; seen[y * p.w + x] = 1;
        while (st.length) {
          const [a, b] = st.pop(); cl.push([a, b]);
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
            const u = a + dx, v = b + dy;
            if (u < 0 || v < 0 || u >= p.w || v >= p.h || seen[v * p.w + u]) return;
            if (isLed(pget(p, u, v))) { seen[v * p.w + u] = 1; st.push([u, v]); }
          });
        }
        if (cl.length > 4) continue;
        const xs = cl.map(q => q[0]), ys = cl.map(q => q[1]), x0 = Math.min(...xs), y0 = Math.min(...ys);
        const w = Math.max(...xs) - x0 + 1, h = Math.max(...ys) - y0 + 1;
        let bg = x0 > 0 ? pget(p, x0 - 1, y0) : null;
        if (!bg || isLed(bg) || bg[3] === 0) bg = x0 + w < p.w ? pget(p, x0 + w, y0) : null;
        if (!bg || isLed(bg) || bg[3] === 0) continue;
        out.push({ x: x0, y: y0, w, h, col: css(pget(p, x, y)), bg: css(bg) });
      }
      return (ledCache[f] = out);
    }

    /* ---- um objeto animado, desenhado no próprio canvas (origem local = PAD,PAD) ---- */
    function drawObject(ctx, ob, oi, t, animate) {
      const f = ob.frame, r = rect(f); if (!r) return;
      const ts = t / 1000, lx = PAD, ly = PAD, ph = H(ob.x * 7 + ob.y * 13);
      const ADD = a => { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; };
      const NORM = a => { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a == null ? 1 : a; };
      const slice = (sx, sy, sw, sh, dx, dy) =>
        ctx.drawImage(img, r.x + sx, r.y + sy, sw, sh, lx + sx + (dx || 0), ly + sy + (dy || 0), sw, sh);
      const scan = (rc, phs) => {
        const [sx, sy, sw, sh] = rc, row = Math.floor((t / 1000 * 9 + phs) % (sh + 6)) - 3;
        if (row >= 0 && row < sh) { ADD(0.55); slice(sx, sy + row, sw, 1); }
        const g = Math.floor(t / 110 + phs * 7);
        if (H(g * 13 + phs * 100) > 0.965) {
          const y = Math.floor(H(g) * Math.max(1, sh - 2)), dx = H(g + 5) > 0.5 ? 1 : -1;
          NORM(1); slice(sx, sy + y, sw, Math.min(2, sh - y), dx, 0);
        }
      };

      ctx.save();
      ctx.clearRect(0, 0, r.w + PAD * 2, r.h + PAD * 2);
      ctx.imageSmoothingEnabled = false;
      if (!animate || !DYN.has(f)) ctx.drawImage(img, r.x, r.y, r.w, r.h, lx, ly, r.w, r.h);

      if (animate) {
        const lf = LEDF[f];
        if (lf) leds(f).forEach((l, i) => {
          const s = H(i * 31 + ob.x * 7 + ob.y * 13), p = lf.per + Math.floor(s * 5) * lf.var;
          const on = H(Math.floor(t / p) + s * 1e4) > lf.off;
          if (!on) { NORM(1); ctx.fillStyle = l.bg; ctx.fillRect(lx + l.x, ly + l.y, l.w, l.h); }
          else if (f === 'server_rack') { ADD(0.3); ctx.drawImage(glowTint(l.col), lx + l.x + l.w / 2 - 4, ly + l.y + l.h / 2 - 4, 8, 8); }
        });

        if (f.startsWith('desk_pc_')) {
          const p = px(f), fg = css(pget(p, 12, 4)), bg = css(pget(p, 12, 3));
          const x0 = lx + 12, y0 = ly + 3, u = t / 1700 + ph, step = Math.floor(u), fr = u - step;
          NORM(1); ctx.fillStyle = bg; ctx.fillRect(x0, y0, 14, 10); ctx.fillStyle = fg;
          let last = 0;
          for (let k = 0; k < 4; k++) {
            let len = 3 + Math.floor(H((step + k) * 7 + ob.x) * 10);
            if (k === 3) len = Math.min(len, Math.floor(fr * 1.6 * len));
            ctx.fillRect(x0, y0 + 1 + k * 2, len, 1); if (k === 3) last = len;
          }
          if (Math.floor(t / 400) % 2 === 0) { ctx.fillStyle = '#b8fffa'; ctx.fillRect(x0 + Math.min(last, 12), y0 + 7, 1, 1); }
        }

        if (SCR[f]) SCR[f].forEach((rc, i) => scan(rc, ph * 40 + i * 3));

        if (f.startsWith('holo_desk_')) {
          const wings = [[2, 1, 11, 26], [51, 1, 11, 26]];
          wings.forEach((w, i) => {
            ADD(Math.max(0, 0.1 + 0.1 * Math.sin(ts * 2 + ph * 6 + i * 1.6))); slice(w[0], w[1], w[2], w[3]);
            const row = Math.floor((ts * 7 + i * 13) % (w[3] + 8)) - 4;
            if (row >= 0 && row < w[3]) { ADD(0.7); slice(w[0], w[1] + row, w[2], 1); }
          });
          const sc = css(pget(px(f), 30, 8));
          for (let i = 0; i < 6; i++) {
            const age = (ts * 0.5 + i / 6) % 1, x = lx + 20 + ((i * 5) % 24) + Math.sin(ts * 2 + i) * 1.5, y = ly + 4 - age * 15;
            ADD(Math.sin(Math.PI * age) * 0.85); ctx.fillStyle = sc; ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
          }
        }

        if (f === 'laser_bar') {
          const span = r.w - 14, u = (ts * 0.55 + ph) % 2, x = 4 + (u < 1 ? u : 2 - u) * span;
          ADD(0.9); slice(Math.floor(x), 2, 8, 2);
          ADD(0.5); ctx.fillStyle = '#ffe0f0'; ctx.fillRect(lx + Math.floor(x) + 3, ly + 2, 2, 2);
          ADD(0.3); ctx.drawImage(glowTint('#ff4fa0'), lx + x + 4 - 9, ly + 3 - 9, 18, 18);
        }
        if (f === 'orb_red') {
          ADD(0.2 + 0.2 * Math.sin(ts * 2.4 + ph * 6));
          ctx.drawImage(glowTint('#ff3b6a'), lx + r.w / 2 - 11, ly + r.h / 2 - 11, 22, 22);
        }
        if (f === 'appliance_stack') {
          [[8, 7], [22, 7]].forEach(([cx, cy], i) => {
            const a = ts * (i ? -5 : 5), x = Math.round(cx + Math.cos(a) * 2.4), y = Math.round(cy + Math.sin(a) * 2.4);
            NORM(1); ctx.fillStyle = '#ffa8d4'; ctx.fillRect(lx + x, ly + y, 1, 1);
          });
        }
        if (DYN.has(f)) {
          const amp = f === 'plant_fern' ? 2 : 1.8; NORM(1);
          for (let row = 0; row < r.h; row++) {
            const k = Math.pow(1 - row / r.h, 1.6), dx = Math.round(Math.sin(ts * 1.3 + oi + row * 0.12) * amp * k);
            ctx.drawImage(img, r.x, r.y + row, r.w, 1, lx + dx, ly + row, r.w, 1);
          }
        }
      }
      ctx.restore();
    }

    /* ---- pulsos de luz que correm pelos fios e faixas de neon ---- */
    function computeRuns(decals, withCables) {
      const g = {};
      decals.forEach(d => {
        let mt = /^cable_(c|p)_(h|v)$/.exec(d.frame), k, col, size, off, o;
        if (mt) { if (!withCables) return; k = 'cable'; col = mt[1] === 'c' ? '#bffcff' : '#ffd0e8'; size = 32; off = [3, 3]; o = mt[2]; }
        else if ((mt = /^trace_(h|v)$/.exec(d.frame))) { k = 'cable'; col = '#d8fff0'; size = 32; off = [3, 3]; o = mt[1]; }
        else if ((mt = /^neon_(h|v)_(cyan|mag)$/.exec(d.frame))) { k = 'neon'; col = mt[2] === 'cyan' ? '#e8ffff' : '#ffe0ee'; size = 16; off = [7, 7]; o = mt[1]; }
        else return;
        const hz = o === 'h', key = k + col + o + (hz ? d.y : d.x);
        (g[key] = g[key] || { k, col, hz, size, off, fixed: hz ? d.y : d.x, pos: [] }).pos.push(hz ? d.x : d.y);
      });
      const out = [];
      Object.values(g).forEach(q => {
        q.pos.sort((a, b) => a - b);
        let st = q.pos[0], en = st + q.size;
        const flush = () => { if (en - st >= q.size) out.push({ k: q.k, col: q.col, hz: q.hz, off: q.off, fixed: q.fixed, start: st, len: en - st }); };
        for (let i = 1; i < q.pos.length; i++) {
          if (q.pos[i] === en) en += q.size; else { flush(); st = q.pos[i]; en = st + q.size; }
        }
        flush();
      });
      return out;
    }
    function drawPulses(ctx, runs, w, h, t) {
      const ts = t / 1000;
      ctx.clearRect(0, 0, w, h); ctx.save();
      runs.forEach((r, i) => {
        const hz = r.hz, L = r.len;
        const dot = (p, a) => {
          if (p < 0 || p >= L || a <= 0) return;
          ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; ctx.fillStyle = r.col;
          if (hz) ctx.fillRect(r.start + p, r.fixed + r.off[0], 1, 2); else ctx.fillRect(r.fixed + r.off[1], r.start + p, 2, 1);
        };
        if (r.k === 'cable') {
          if (L < 24) return;
          const sp = 24 + H(i * 13 + r.start) * 22, gap = 48 + H(i * 5 + r.fixed) * 90, cyc = L + gap, rev = H(i * 7 + r.fixed) > 0.5;
          let pos = (ts * sp + H(i * 31 + r.fixed) * cyc) % cyc; if (pos > L) return; if (rev) pos = L - pos;
          const sg = rev ? -1 : 1, edge = Math.min(1, Math.min(pos, L - pos) / 6);
          for (let k = 0; k < 6; k++) dot(Math.floor(pos - sg * k), (1 - k / 6) * edge * 0.95);
          const gx = hz ? r.start + pos : r.fixed + 4, gy = hz ? r.fixed + 4 : r.start + pos;
          ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.28 * edge;
          ctx.drawImage(glowTint(r.col), gx - 7, gy - 7, 14, 14);
        } else {
          const sp = 38, cyc = L + 70, pos = (ts * sp + H(i * 17 + r.fixed) * cyc) % cyc;
          for (let k = 0; k < 14; k++) dot(Math.floor(pos - k), (1 - k / 14) * 0.5);
        }
      });
      ctx.restore();
    }

    /* ---- poeira/partículas flutuando ---- */
    function drawMotes(ctx, w, h, t, color) {
      const ts = t / 1000;
      ctx.clearRect(0, 0, w, h); ctx.save(); ctx.fillStyle = color || '#fff'; ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 18; i++) {
        const x = (H(i * 3 + 1) * w + ts * (3 + H(i) * 5)) % w;
        const y = (((H(i * 5 + 2) * h + Math.sin(ts * 0.4 + i) * 6 - ts * (1 + H(i * 7) * 2)) % h) + h) % h;
        ctx.globalAlpha = 0.12 + 0.35 * (0.5 + 0.5 * Math.sin(ts * 1.3 + i * 2));
        ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
      }
      ctx.restore();
    }

    return { glowBase, glowTint, drawObject, drawPulses, drawMotes, computeRuns };
  }

  /* ---------- plano de colisão (puro, sem Phaser) ----------
   * A grade 16×16 do JSON já inclui os objetos sólidos E as barreiras que somem
   * (laser). Aqui as células das barreiras removíveis são liberadas da grade e
   * viram corpos separados, que podem ser destruídos quando a fase é concluída. */
  function collisionPlan(data) {
    const cs = data.collision.cellSize, grid = data.collision.rows.map(r => [...r].map(c => c === '1'));
    const R = grid.length, C = grid[0].length, objs = data.layers.objects;
    const wb = o => ({ x: o.x + o.hitbox[0], y: o.y + o.hitbox[1], w: o.hitbox[2], h: o.hitbox[3] });
    const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    const keep = objs.filter(o => o.solid && !o.removeOnComplete && o.hitbox).map(wb);
    const removable = objs.filter(o => o.removeOnComplete && o.hitbox).map(o => ({ id: o.id, challenge: o.removeOnComplete, rect: wb(o) }));
    removable.forEach(ro => {
      const rr = ro.rect;
      for (let r = Math.floor(rr.y / cs); r <= Math.floor((rr.y + rr.h - 1) / cs); r++)
        for (let c = Math.floor(rr.x / cs); c <= Math.floor((rr.x + rr.w - 1) / cs); c++) {
          if (r < 2 || r >= R - 1 || c < 1 || c >= C - 1) continue; // moldura de paredes fica
          if (keep.some(k => hit(k, { x: c * cs, y: r * cs, w: cs, h: cs }))) continue;
          grid[r][c] = false;
        }
    });
    const rects = []; let prev = {};
    for (let r = 0; r <= R; r++) {
      const cur = {};
      if (r < R) for (let c = 0; c < C;) {
        if (!grid[r][c]) { c++; continue; }
        let e = c; while (e < C && grid[r][e]) e++;
        const key = c + ':' + e;
        if (prev[key]) { prev[key].h += cs; cur[key] = prev[key]; delete prev[key]; }
        else { const q = { x: c * cs, y: r * cs, w: (e - c) * cs, h: cs }; rects.push(q); cur[key] = q; }
        c = e;
      }
      prev = cur;
    }
    return { rects, removable, grid };
  }

  /* ---------- a classe ---------- */
  class KyberMap {
    static preload(scene, base) {
      base = base || 'assets/';
      scene.load.atlas(ATLAS_KEY, base + 'interior-neon.png', base + 'interior-neon.json');
      MAP_IDS.forEach(id => scene.load.json(id, base + 'maps/' + id + '.json'));
    }

    /** textura de boneco provisória (troque pelos sprites reais da Lyra / NPC) */
    static placeholderTexture(scene, key, color) {
      if (scene.textures.exists(key)) return key;
      const ct = scene.textures.createCanvas(key, 16, 24), g = ct.getContext(), c = '#' + color.toString(16).padStart(6, '0');
      g.fillStyle = '#0d0b14'; g.fillRect(3, 7, 10, 16); g.fillStyle = c; g.fillRect(4, 8, 8, 14);
      g.fillStyle = '#0d0b14'; g.fillRect(4, 0, 8, 8); g.fillStyle = '#f3d3b8'; g.fillRect(5, 1, 6, 6);
      g.fillStyle = '#0d0b14'; g.fillRect(6, 3, 1, 2); g.fillRect(9, 3, 1, 2);
      ct.refresh(); return key;
    }

    constructor(scene, id, opts) {
      this.scene = scene; this.id = id; this.data = scene.cache.json.get(id);
      if (!this.data) throw new Error('KyberMap: JSON "' + id + '" não carregado (use KyberMap.preload)');
      const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.opts = Object.assign({ animations: !reduce, lights: true, cables: true, flicker: true, animFps: 30, debug: false, npcFactory: null }, opts);
      this.animOn = this.opts.animations; this.lightsOn = this.opts.lights;
      this.objects = {}; this.npcs = {}; this.completed = new Set();
      this._tracked = []; this._anim = []; this._lights = []; this._ownTextures = []; this._lastAnim = -1e9;
      this.build();
      scene.events.once('shutdown', () => this.destroy());
    }

    rect(name) {
      if (!name || !this.tex.has(name)) return null;
      const f = this.tex.get(name); return { x: f.cutX, y: f.cutY, w: f.cutWidth, h: f.cutHeight };
    }

    build() {
      const sc = this.scene, m = this.data;
      this.tex = sc.textures.get(ATLAS_KEY); this.img = this.tex.getSourceImage();
      this.kit = makeKit(this.img, n => this.rect(n));
      this._buildUnder(); this._buildObjects(); this._buildFx(); this._buildCollision(); this._buildNpcs(); this._buildLights();
      this.interactables = m.interactables || [];
      this.exits = m.exits || []; this.dialogues = m.dialogues || [];
      this.setAnimations(this.animOn);
      this.setDebug(this.opts.debug);
    }

    _canvas(key, w, h) {
      const sc = this.scene; if (sc.textures.exists(key)) sc.textures.remove(key);
      this._ownTextures.push(key); return sc.textures.createCanvas(key, w, h);
    }

    /* chão + decalques + paredes + neon, tudo assado num canvas só */
    _buildUnder() {
      const m = this.data, L = m.layers, ct = this._canvas(this.id + ':under', m.width, m.height), g = ct.getContext();
      g.imageSmoothingEnabled = false;
      const put = (f, x, y) => { const r = this.rect(f); if (r) g.drawImage(this.img, r.x, r.y, r.w, r.h, x, y, r.w, r.h); };
      const fl = L.floor, w = L.walls, dc = L.decals.filter(d => this.opts.cables || !d.frame.startsWith('cable_'));
      fl.rows.forEach((row, r) => [...row].forEach((ch, k) => put(fl.legend[ch], fl.origin[0] + k * fl.cellSize, fl.origin[1] + r * fl.cellSize)));
      dc.filter(d => !d.frame.startsWith('neon')).forEach(d => put(d.frame, d.x, d.y));
      w.rows.forEach((row, r) => [...row].forEach((ch, k) => { const f = w.legend[ch]; if (f) put(f, k * 16, r * 16); }));
      dc.filter(d => d.frame.startsWith('neon')).forEach(d => put(d.frame, d.x, d.y));
      ct.refresh();
      this.underImg = this.scene.add.image(0, 0, this.id + ':under').setOrigin(0, 0).setDepth(DEPTH.under);
      this._runs = this.kit.computeRuns(L.decals, this.opts.cables);
    }

    /* objetos: imagem simples, ou canvas próprio quando têm animação */
    _buildObjects() {
      const sc = this.scene, L = this.data.layers, objs = L.objects;
      objs.forEach((ob, oi) => {
        const r = this.rect(ob.frame); if (!r) return;
        let depth = ob.y + r.h;
        if (ob.z) { // itens "em cima" de outro objeto herdam a profundidade do suporte
          let best = -1;
          objs.forEach(o2 => {
            const r2 = this.rect(o2.frame); if (!r2 || o2.z) return;
            if (ob.x < o2.x + r2.w && ob.x + r.w > o2.x && ob.y < o2.y + r2.h && ob.y + r.h > o2.y) best = Math.max(best, o2.y + r2.h);
          });
          depth = best >= 0 ? best + 0.5 * ob.z : depth;
        }
        let go;
        if (isAnimated(ob.frame)) {
          const key = this.id + ':' + ob.id, w = r.w + PAD * 2, h = r.h + PAD * 2, ct = this._canvas(key, w, h);
          go = sc.add.image(ob.x - PAD, ob.y - PAD, key).setOrigin(0, 0);
          this._anim.push({ ob, oi, ct, ctx: ct.getContext(), go });
        } else {
          go = sc.add.image(ob.x, ob.y, ATLAS_KEY, ob.frame).setOrigin(0, 0);
        }
        go.setDepth(DEPTH.objects + depth);
        this.objects[ob.id] = { data: ob, go, depth };
      });
    }

    /* pulsos dos fios e partículas (um canvas do mapa inteiro cada, com blend ADD) */
    _buildFx() {
      const sc = this.scene, m = this.data;
      this.pulseCt = this._canvas(this.id + ':pulses', m.width, m.height);
      this.pulseImg = sc.add.image(0, 0, this.id + ':pulses').setOrigin(0, 0).setDepth(DEPTH.pulses).setBlendMode(Phaser.BlendModes.ADD);
      this.moteCt = this._canvas(this.id + ':motes', m.width, m.height);
      this.moteImg = sc.add.image(0, 0, this.id + ':motes').setOrigin(0, 0).setDepth(DEPTH.motes).setBlendMode(Phaser.BlendModes.ADD);
    }

    /* luzes: texturas já coloridas (não depende de setTint, funciona em WebGL e Canvas) */
    _buildLights() {
      const sc = this.scene, m = this.data;
      const glowKey = col => {
        const k = 'kyber-glow:' + col;
        if (!sc.textures.exists(k)) {
          const ct = sc.textures.createCanvas(k, 128, 128); ct.getContext().drawImage(this.kit.glowTint(col), 0, 0); ct.refresh();
          ct.setFilter(Phaser.Textures.FilterMode.LINEAR);
        }
        return k;
      };
      this._lights = (m.lights || []).map((l, i) => ({
        l, i, img: sc.add.image(l.x, l.y, glowKey(l.color)).setDisplaySize(l.radius * 2, l.radius * 2)
          .setAlpha(l.intensity).setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.lights)
      }));
      const amb = this._canvas(this.id + ':ambient', 4, 4), g = amb.getContext();
      g.fillStyle = m.ambient.color; g.fillRect(0, 0, 4, 4); amb.refresh();
      this.ambientImg = sc.add.image(0, 0, this.id + ':ambient').setOrigin(0, 0).setDisplaySize(m.width, m.height)
        .setAlpha(m.ambient.alpha).setBlendMode(Phaser.BlendModes.MULTIPLY).setDepth(DEPTH.ambient);
    }

    /* colisão: retângulos estáticos + corpos separados para o que pode sumir */
    _buildCollision() {
      const sc = this.scene, plan = collisionPlan(this.data);
      this.plan = plan; this.walls = sc.physics.add.staticGroup(); this.blocks = {};
      const mk = r => { const z = sc.add.zone(r.x + r.w / 2, r.y + r.h / 2, r.w, r.h); sc.physics.add.existing(z, true); return z; };
      plan.rects.forEach(r => this.walls.add(mk(r)));
      plan.removable.forEach(ro => { const z = mk(ro.rect); this.walls.add(z); this.blocks[ro.id] = z; });
      this.dbg = sc.add.graphics().setDepth(DEPTH.debug);
      this.dbg.fillStyle(0xff283c, 0.35); plan.rects.forEach(r => this.dbg.fillRect(r.x, r.y, r.w, r.h));
      this.dbg.fillStyle(0xffd23f, 0.45); plan.removable.forEach(ro => this.dbg.fillRect(ro.rect.x, ro.rect.y, ro.rect.w, ro.rect.h));
    }

    _buildNpcs() {
      const sc = this.scene;
      (this.data.npcs || []).forEach(n => {
        let go = null;
        if (this.opts.showNpcs !== false) {
          if (this.opts.npcFactory) go = this.opts.npcFactory(sc, n);
          if (!go) {
            const key = sc.textures.exists(n.sprite) ? n.sprite : KyberMap.placeholderTexture(sc, 'kyber-npc', 0xff4fa0);
            go = sc.add.image(n.x, n.y, key).setOrigin(0.5, 1);
          }
          go.setDepth(DEPTH.objects + n.y);
        }
        if (n.solid && n.hitbox) {
          const z = sc.add.zone(n.x + n.hitbox[0] + n.hitbox[2] / 2, n.y + n.hitbox[1] + n.hitbox[3] / 2, n.hitbox[2], n.hitbox[3]);
          sc.physics.add.existing(z, true); this.walls.add(z);
        }
        this.npcs[n.id] = { data: n, go };
      });
    }

    /* ---------- API pública ---------- */
    collide(go) { return this.scene.physics.add.collider(go, this.walls); }
    trackDepth(go) { this._tracked.push(go); go.setDepth(DEPTH.objects + go.y); return go; }
    getSpawn(id) { return (id && (this.data.entries || []).find(e => e.id === id)) || this.data.spawn; }
    interactableAt(x, y) { return this.interactables.find(i => x >= i.rect[0] && x <= i.rect[0] + i.rect[2] && y >= i.rect[1] && y <= i.rect[1] + i.rect[3]) || null; }
    npcNear(x, y, dist) {
      dist = dist || 26; let best = null, bd = dist;
      Object.values(this.npcs).forEach(n => { const d = Math.hypot(n.data.x - x, n.data.y - y); if (d < bd) { bd = d; best = n.data; } });
      return best;
    }
    /** saída liberada (requisito cumprido) sob o ponto, ou null */
    exitAt(x, y) {
      return this.exits.find(e => x >= e.rect[0] && x <= e.rect[0] + e.rect[2] && y >= e.rect[1] && y <= e.rect[1] + e.rect[3] &&
        (!e.requires || this.completed.has(e.requires))) || null;
    }
    setDoor(id, state) {
      const o = this.objects[id]; if (!o || !o.data.states) return;
      o.data.state = state; const f = o.data.states[state]; if (f) o.go.setFrame(f);
    }
    removeObject(id) {
      const o = this.objects[id]; if (o) { o.go.destroy(); this._anim = this._anim.filter(a => a.ob.id !== id); delete this.objects[id]; }
      const b = this.blocks[id]; if (b) { this.walls.remove(b, true, true); delete this.blocks[id]; }
    }
    /** marca um desafio como concluído e executa o onComplete (unlock:/remove:/dialogue:) */
    complete(challengeId, silent) {
      if (this.completed.has(challengeId)) return;
      this.completed.add(challengeId);
      this.data.layers.objects.forEach(o => { if (o.removeOnComplete === challengeId) this.removeObject(o.id); });
      const it = this.interactables.find(i => i.challenge === challengeId); if (!it) return;
      (it.onComplete || []).forEach(a => {
        const [cmd, arg] = a.split(':');
        if (cmd === 'unlock') this.setDoor(arg, 'open');
        else if (cmd === 'remove') this.removeObject(arg);
        else if (cmd === 'dialogue' && !silent) this.scene.events.emit('kyber-dialogue', arg, this.dialogues[arg] || []);
      });
    }
    restore(list) { (list || []).forEach(id => this.complete(id, true)); }

    setAnimations(on) {
      this.animOn = !!on;
      this._anim.forEach(a => { this.kit.drawObject(a.ctx, a.ob, a.oi, 0, false); a.ct.refresh(); });
      this.pulseImg.setVisible(this.animOn); this.moteImg.setVisible(this.animOn);
      this._lastAnim = -1e9;
    }
    setLights(on) { this.lightsOn = !!on; this._lights.forEach(o => o.img.setVisible(this.lightsOn)); this.ambientImg.setVisible(this.lightsOn); }
    setDebug(on) { this.dbg.setVisible(!!on); }

    update(time) {
      this._tracked.forEach(g => g.setDepth(DEPTH.objects + g.y));
      if (this.lightsOn) {
        const ts = time / 1000;
        this._lights.forEach(({ l, i, img }) => {
          let a = l.intensity;
          if (this.animOn && !l.flicker) a *= 0.93 + 0.07 * Math.sin(ts * 0.8 + i * 1.7);
          if (l.flicker && this.opts.flicker && this.animOn) a *= 0.725 + 0.275 * Math.sin(ts * (2.2 + i * 0.7) + i * 1.3);
          img.setAlpha(a);
        });
      }
      if (!this.animOn || time - this._lastAnim < 1000 / this.opts.animFps) return;
      this._lastAnim = time; const m = this.data;
      this._anim.forEach(a => { this.kit.drawObject(a.ctx, a.ob, a.oi, time, true); a.ct.refresh(); });
      this.kit.drawPulses(this.pulseCt.getContext(), this._runs, m.width, m.height, time); this.pulseCt.refresh();
      this.kit.drawMotes(this.moteCt.getContext(), m.width, m.height, time, MOTE[this.id]); this.moteCt.refresh();
    }

    destroy() {
      if (this._dead) return; this._dead = true;
      const sc = this.scene;
      Object.values(this.objects).forEach(o => o.go.destroy());
      this._lights.forEach(o => o.img.destroy());
      [this.underImg, this.pulseImg, this.moteImg, this.ambientImg, this.dbg].forEach(g => g && g.destroy());
      if (this.walls && this.walls.children) this.walls.clear(true, true); // já pode ter sido destruído pelo shutdown da cena
      Object.values(this.npcs).forEach(n => n.go && n.go.destroy());
      this._ownTextures.forEach(k => { if (sc.textures.exists(k)) sc.textures.remove(k); });
    }
  }

  KyberMap.IDS = MAP_IDS; KyberMap.DEPTH = DEPTH; KyberMap.collisionPlan = collisionPlan; KyberMap._makeKit = makeKit; KyberMap.PAD = PAD;
  root.KyberMap = KyberMap;
})(typeof window !== 'undefined' ? window : globalThis);

export default globalThis.KyberMap;
