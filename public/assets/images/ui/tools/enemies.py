from lib import *
from icons import Cv
import math, random

def virus(f):
    c = Cv(30, 30); cx = cy = 14.5
    ext = 13 + f
    for a in range(8):
        ang = a * math.pi / 4; x = cx + math.cos(ang) * ext; y = cy + math.sin(ang) * ext
        c.line((int(cx), int(cy)), (int(x), int(y)), 'M', 2); c.ell(int(x) - 2, int(y) - 2, int(x) + 2, int(y) + 2, 'm')
    c.ell(5, 5, 24, 24, 'P'); c.ell(5, 5, 22, 22, 'p'); c.ell(7, 7, 17, 17, 'p')
    c.pts([(8, 9), (9, 8), (10, 8)], 'W')
    c.rect(8, 12, 12, 15, 'W'); c.rect(17, 12, 21, 15, 'W'); c.rect(10, 13, 12, 15, 'K'); c.rect(17, 13, 19, 15, 'K')
    c.line((7, 10), (13, 12), 'K', 2); c.line((22, 10), (16, 12), 'K', 2)
    c.rect(10, 19, 19, 21, 'K'); [c.rect(x, 19, x, 20, 'W') for x in (11, 13, 15, 17)]
    return outline(c.im)

def worm(f):
    c = Cv(30, 30)
    segs = [(4, 24 - f), (10, 25), (16, 24 + f - 1), (21, 19), (22, 12)]
    for i, (x, y) in enumerate(segs):
        r = 4 if i < 4 else 5
        c.ell(x - r, y - r, x + r, y + r, 'T'); c.ell(x - r, y - r, x + r - 1, y + r - 1, 'C'); c.ell(x - r + 1, y - r + 1, x + 1, y + 1, 'c') if i % 2 == 0 else None
    x, y = segs[-1]
    c.ell(x - 5, y - 5, x + 5, y + 5, 'c'); c.ell(x - 5, y - 5, x + 3, y + 3, 'c')
    c.rect(x - 3, y - 2, x - 1, y + 1, 'W'); c.rect(x + 2, y - 2, x + 4, y + 1, 'W'); c.p(x - 2, y, 'K'); c.p(x + 3, y, 'K')
    c.line((x - 3, y - 6), (x - 5, y - 10), 'W', 1); c.line((x + 3, y - 6), (x + 5, y - 10), 'W', 1); c.p(x - 5, y - 11, 'm'); c.p(x + 5, y - 11, 'm')
    c.rect(x - 2, y + 3, x + 2, y + 3, 'K')
    return outline(c.im)

def bug(f):
    c = Cv(30, 30)
    for i, y in enumerate((13, 18, 23)):
        d = f if i % 2 == 0 else -f
        c.line((9, y), (1, y + 3 + d), 'W', 1); c.line((20, y), (28, y + 3 - d), 'W', 1)
    c.ell(8, 8, 21, 27, 'M'); c.ell(8, 8, 19, 24, 'm'); c.rect(14, 12, 15, 26, 'N')
    c.ell(10, 2, 19, 11, 'M'); c.ell(10, 2, 18, 10, 'm')
    c.rect(11, 5, 13, 7, 'A'); c.rect(16, 5, 18, 7, 'A'); c.p(12, 6, 'K'); c.p(17, 6, 'K')
    c.line((11, 3), (7, 0 + f), 'W'); c.line((18, 3), (22, 0 + f), 'W')
    c.pts([(10, 14), (10, 15), (11, 16), (19, 16), (19, 14)], 'W')
    return outline(c.im)

def spy(f):
    c = Cv(30, 30)
    c.ell(0, 9 + f, 29, 24 + f, 'W'); c.ell(8, 8 + f, 21, 25 + f, 'c'); c.ell(11, 11 + f, 18, 22 + f, 'K'); c.rect(12, 12 + f, 13, 13 + f, 'W')
    c.rect(0, 14 + f, 2, 18 + f, 'W')
    c.rect(2, 7, 27, 8, 'P'); c.rect(8, 1, 21, 7, 'P'); c.rect(8, 5, 21, 6, 'M'); c.rect(8, 1, 21, 1, 'p')
    c.rect(2, 8, 27, 8, 'K'); c.rect(9, 25 + f, 12, 29, 'P'); c.rect(17, 25 + f, 20, 29, 'P')
    return outline(c.im)

def ransom(f):
    c = Cv(30, 30)
    c.rect(8, 1, 21, 3, 'W'); c.rect(7, 3, 9, 11, 'W'); c.rect(20, 3, 22, 11, 'W'); c.rect(10, 3, 19, 3, 'g')
    c.rect(2, 11, 27, 28, 'r'); c.rect(2, 11, 27, 13, 'W'); c.rect(25, 14, 27, 28, 'R'); c.rect(2, 26, 27, 28, 'R')
    c.ell(9, 15 + f, 20, 25 + f, 'W'); c.rect(11, 24 + f, 18, 26 + f, 'W')
    c.rect(11, 18 + f, 13, 20 + f, 'K'); c.rect(16, 18 + f, 18, 20 + f, 'K'); c.rect(14, 22 + f, 15, 23 + f, 'K')
    c.pts([(12, 25 + f), (14, 25 + f), (16, 25 + f), (18, 25 + f)], 'K')
    for x in (4, 24): c.rect(x, 14, x + 1, 15, 'K')
    return outline(c.im)

def hook(f):
    c = Cv(30, 30); d = ImageDraw.Draw(c.im); W = PAL['W']
    d.ellipse((11, 1 + f, 18, 8 + f), outline=W, width=2); c.rect(14, 8 + f, 15, 18, 'W')
    d.arc((6, 10, 24, 28), 0, 160, fill=W, width=3); c.rect(22, 14, 23, 19, 'W'); c.poly([(20, 15), (24, 10), (25, 17)], 'W') if False else None
    c.pts([(5, 17), (6, 16), (4, 18), (5, 18)], 'W')
    # isca: envelope
    c.rect(2, 20, 11, 27, 'm'); c.rect(2, 20, 11, 20, 'W'); c.line((2, 21), (6, 24), 'W'); c.line((11, 21), (7, 24), 'W'); c.rect(2, 27, 11, 27, 'N')
    c.pts([(3, 18), (4, 19)], 'g')
    return outline(c.im)

def trojan(f=0):
    c = Cv(62, 62)
    horse = [(6, 36), (8, 30), (16, 22), (20, 14), (20, 4), (28, 10), (34, 10), (44, 16), (52, 30), (56, 46), (58, 60), (14, 60), (16, 50), (24, 42), (20, 40), (12, 44), (6, 42)]
    back = [(34, 10), (44, 16), (52, 30), (56, 46), (58, 60)]
    ext = 7 + f * 2
    for i in range(len(back) - 1):
        (x0, y0), (x1, y1) = back[i], back[i + 1]
        c.poly([(x0, y0), (x1, y1), (x1 + ext, y1 + 3 + f), ], 'm'); c.poly([(x0, y0), (x1, y1), (x1 + ext - 3, y1 + 2), ], 'M')
    c.poly(horse, 'P')
    c.poly([(8, 32), (16, 24), (22, 18), (26, 22), (30, 34), (22, 40), (14, 44), (8, 42)], 'p')
    c.poly([(21, 5), (27, 11), (21, 13)], 'M'); c.poly([(21, 8), (24, 11), (21, 12)], 'N')
    # tras do pescoco sombra
    c.poly([(40, 30), (52, 30), (56, 46), (58, 60), (36, 60)], 'q') if False else None
    # olho
    c.poly([(15, 26), (27, 23), (25, 30), (18, 30)], 'K'); c.poly([(17, 27), (25, 25), (24, 29), (19, 29)], 'a' if f == 0 else 'r'); c.rect(21, 26, 23, 28, 'K')
    c.poly([(14, 22), (29, 20), (27, 24)], 'K')
    # nariz e boca
    c.rect(8, 36, 10, 37, 'K'); c.line((6, 42), (18, 44), 'K', 2)
    for x in (8, 11, 14, 17): c.rect(x, 41, x + 1, 43, 'W')
    # circuitos
    for (a, b) in [((30, 36), (44, 36)), ((44, 36), (44, 50)), ((26, 50), (38, 50)), ((38, 50), (38, 56))]: c.line(a, b, 'c')
    for p in [(44, 36), (44, 50), (38, 56), (30, 36)]: c.rect(p[0] - 1, p[1] - 1, p[0] + 1, p[1] + 1, 'W')
    # base com fragmentos
    c.rect(14, 56, 58, 60, 'q')
    return outline(c.im)

def glitch(im, seed, tint=True):
    random.seed(seed); out = new(*im.size); h = im.height
    y = 0
    while y < h:
        hh = random.randint(2, 6); dx = random.choice([-4, -2, 0, 0, 2, 5]); band = im.crop((0, y, im.width, min(h, y + hh)))
        out.paste(band, (dx, y), band); y += hh
    if tint: out = recolor(out, {'P': 'R', 'p': 'r', 'a': 'W', 'c': 'r', 'm': 'r', 'M': 'R'})
    return out

def run():
    for name, fn in [('virus', virus), ('verme', worm), ('bug', bug), ('espiao', spy), ('ransomware', ransom), ('phishing_anzol', hook)]:
        save(strip([fn(0), fn(1)]), f'03_inimigos/{name}_32x32_2f.png', frames=2, note='animacao idle (2 frames)')
    t0, t1 = trojan(0), trojan(1)
    save(strip([t0, t1]), '03_inimigos/boss_trojan/trojan_idle_64x64_2f.png', frames=2, note='chefao final, idle')
    hit = recolor(t0, {'P': 'R', 'p': 'r', 'a': 'W'})
    save(strip([hit, glitch(t0, 1, False)]), '03_inimigos/boss_trojan/trojan_dano_64x64_2f.png', frames=2, note='dano (vermelho) e glitch leve')
    save(strip([glitch(t0, s) for s in (3, 4, 5, 6)]), '03_inimigos/boss_trojan/trojan_derrota_glitch_64x64_4f.png', frames=4, note='epilogo: instavel, piscando em vermelho')
    ret = t0.crop((0, 4, 48, 52)); save(ret, '03_inimigos/boss_trojan/trojan_retrato_48x48.png', note='retrato para a caixa de dialogo')

if __name__ == '__main__':
    run(); write_manifest()
    import glob
    fs = sorted(os.path.relpath(p, OUT) for p in glob.glob(OUT + '/03_*/**/*.png', recursive=True))
    print(sheet_preview(fs, 'enemies.png', cols=3, k=4, bg='P'))
