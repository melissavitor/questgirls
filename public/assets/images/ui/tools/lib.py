import os, json
from PIL import Image, ImageDraw, ImageFont

OUT = '/home/claude/guardiao_firewall_assets'
FONT_PATH = os.path.join(os.path.dirname(__file__), 'PressStart2P.ttf')

def hx(s): s = s.lstrip('#'); return tuple(int(s[i:i+2], 16) for i in (0, 2, 4)) + (255,)

# paleta oficial do guia
PAL = {
 'K': hx('0D0B14'),  # preto arroxado (fundo/base)
 'P': hx('3B1F50'),  # roxo noturno (principal)
 'C': hx('1B6B78'),  # ciano fechado (destaque 1)
 'M': hx('9A2A5B'),  # magenta queimado (destaque 2)
 'A': hx('D4A017'),  # ambar (acento)
 'W': hx('E2E2EA'),  # branco suave (texto)
 # tons derivados (brilho/sombra, mesma familia)
 'q': hx('1A1028'),  # roxo quase preto (paineis)
 'p': hx('6A3E8C'),  # roxo claro
 'c': hx('3CC4D6'),  # ciano neon
 'T': hx('0F4450'),  # ciano sombra
 'm': hx('E0408E'),  # magenta neon
 'N': hx('6A1A3E'),  # magenta sombra
 'a': hx('F2CB55'),  # ambar claro
 'd': hx('8A6410'),  # ambar sombra
 'r': hx('E0364B'),  # vermelho alerta
 'R': hx('8E1A2C'),  # vermelho sombra
 'g': hx('8E8AA6'),  # cinza arroxeado
 '.': (0, 0, 0, 0),
}

MANIFEST = []

def save(img, rel, frames=1, note=''):
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path)
    w, h = img.size
    MANIFEST.append({'file': rel, 'size': [w, h], 'frames': frames,
                     'frame_size': [w // frames, h], 'note': note})
    return path

def write_manifest():
    MANIFEST.sort(key=lambda m: m['file'])
    json.dump(MANIFEST, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1, ensure_ascii=False)

def new(w, h, c='.'):
    return Image.new('RGBA', (w, h), PAL[c] if isinstance(c, str) else c)

def art(rows, pal=None):
    pal = pal or PAL
    w = len(rows[0])
    for i, r in enumerate(rows):
        assert len(r) == w, f'linha {i} tem {len(r)} != {w}: {r!r}'
    im = new(w, len(rows))
    px = im.load()
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            px[x, y] = pal[ch]
    return im

def outline(im, color='K', pad=1, diag=False):
    """adiciona contorno externo de 1px (4 vizinhos) e expande a tela em pad"""
    w, h = im.size
    out = new(w + 2 * pad, h + 2 * pad)
    out.paste(im, (pad, pad), im)
    src = out.copy().load(); px = out.load(); col = PAL[color]
    for y in range(out.height):
        for x in range(out.width):
            if src[x, y][3] == 0:
                n = [(1, 0), (-1, 0), (0, 1), (0, -1)]
                if diag: n += [(1, 1), (-1, 1), (1, -1), (-1, -1)]
                for dx, dy in n:
                    xx, yy = x + dx, y + dy
                    if 0 <= xx < out.width and 0 <= yy < out.height and src[xx, yy][3] > 0:
                        px[x, y] = col; break
    return out

def icon(rows, oc='K'):
    return outline(art(rows), oc)

def strip(frames):
    w, h = frames[0].size
    s = new(w * len(frames), h)
    for i, f in enumerate(frames): s.paste(f, (i * w, 0))
    return s

def grid(frames, cols):
    w, h = frames[0].size
    rows = (len(frames) + cols - 1) // cols
    s = new(w * cols, h * rows)
    for i, f in enumerate(frames): s.paste(f, ((i % cols) * w, (i // cols) * h))
    return s

def recolor(im, mapping):
    """mapping: {'c': 'r', ...} troca cores da paleta por outras"""
    m = {PAL[a]: PAL[b] for a, b in mapping.items()}
    out = im.copy(); px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            if px[x, y] in m: px[x, y] = m[px[x, y]]
    return out

def alpha(im, a):
    out = im.copy(); px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            r, g, b, al = px[x, y]
            px[x, y] = (r, g, b, int(al * a))
    return out

def shift(im, dx, dy):
    out = new(*im.size); out.paste(im, (dx, dy), im); return out

def scale(im, k): return im.resize((im.width * k, im.height * k), Image.NEAREST)

_fonts = {}
def font(size=8):
    if size not in _fonts: _fonts[size] = ImageFont.truetype(FONT_PATH, size)
    return _fonts[size]

def text(s, color='W', k=1, shadow=None, out=None):
    """texto em pixel art (Press Start 2P 8px), escala inteira k, sombra/contorno opcionais"""
    f = font(8)
    tmp = Image.new('1', (len(s) * 8 + 4, 12), 0)
    d = ImageDraw.Draw(tmp); d.fontmode = '1'; d.text((1, 1), s, font=f, fill=1)
    bbox = tmp.getbbox()
    if not bbox: return new(1, 1)
    tmp = tmp.crop(bbox)
    im = new(*tmp.size); px = im.load(); t = tmp.load(); col = PAL[color] if isinstance(color, str) else color
    for y in range(tmp.height):
        for x in range(tmp.width):
            if t[x, y]: px[x, y] = col
    im = scale(im, k)
    if shadow:
        sh = recolor_all(im, shadow); canvas = new(im.width + k, im.height + k)
        canvas.paste(sh, (k, k), sh); canvas.paste(im, (0, 0), im); im = canvas
    if out:
        im = outline(im, out, pad=k) if k == 1 else outline_k(im, out, k)
    return im

def recolor_all(im, c):
    out = im.copy(); px = out.load(); col = PAL[c]
    for y in range(out.height):
        for x in range(out.width):
            if px[x, y][3]: px[x, y] = col
    return out

def outline_k(im, c, k):
    for _ in range(k): im = outline(im, c)
    return im

def paste_center(base, im, dx=0, dy=0):
    base.paste(im, ((base.width - im.width) // 2 + dx, (base.height - im.height) // 2 + dy), im)
    return base

# ---------- paineis ----------
def rect(d, box, fill=None, outline_=None):
    d.rectangle(box, fill=PAL[fill] if fill else None, outline=PAL[outline_] if outline_ else None)

def panel(w, h, border='m', fill='K', inner='P', glow=None, corner=True):
    """painel com borda dupla estilo caixa de dialogo do guia. cantos chanfrados de 1px."""
    im = new(w, h); d = ImageDraw.Draw(im)
    rect(d, (0, 0, w - 1, h - 1), fill=border)
    rect(d, (1, 1, w - 2, h - 2), fill=fill)
    if inner:
        rect(d, (2, 2, w - 3, h - 3), outline_=inner)
    if corner:
        px = im.load()
        for (x, y) in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]: px[x, y] = PAL['.']
        # brilho no canto superior esquerdo
    if glow:
        px = im.load()
        for x in range(3, w - 3): px[x, 1] = PAL[glow] if px[x, 1][3] else px[x, 1]
    return im

def sheet_preview(files, rel, cols=8, bg='K', k=3, pad=6, label=True):
    """folha de contato ampliada para conferir visualmente"""
    ims = []
    for f in files:
        im = Image.open(os.path.join(OUT, f)).convert('RGBA'); ims.append((f, im))
    cw = max(i.width for _, i in ims) * k + pad * 2
    chh = max(i.height for _, i in ims) * k + pad * 2 + (10 if label else 0)
    rows = (len(ims) + cols - 1) // cols
    sh = Image.new('RGBA', (cols * cw, rows * chh), PAL[bg])
    d = ImageDraw.Draw(sh)
    for n, (f, im) in enumerate(ims):
        x, y = (n % cols) * cw, (n // cols) * chh
        sh.alpha_composite(scale(im, k), (x + pad, y + pad))
        if label: d.text((x + 2, y + chh - 10), os.path.basename(f)[:cw // 6], fill=PAL['g'])
    path = os.path.join('/home/claude/gen/prev', rel); os.makedirs(os.path.dirname(path), exist_ok=True)
    sh.save(path); return path


def glyph8(ch, color, k=1):
    """caractere em celula fixa 8x8 (mantem altura de _ - . etc.)"""
    tmp = Image.new('1', (8, 8), 0); d = ImageDraw.Draw(tmp); d.fontmode = '1'; d.text((0, 0), ch, font=font(8), fill=1)
    im = new(8, 8); px = im.load(); t = tmp.load()
    for y in range(8):
        for x in range(8):
            if t[x, y]: px[x, y] = PAL[color]
    return scale(im, k)
