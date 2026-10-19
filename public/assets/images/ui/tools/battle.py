from lib import *
from icons import *
from ui import box, scale9
import random, math

def soul():
    r = ["....WWWW....", "...W....W...", "...W....W...", ".WWWWWWWWWW.", ".WccccccccCC"]
    rows = ["....WWWW......", "...W....W.....", "...W....W.....", ".cccccccccccc.", ".WWcccccccccC.", ".WcccccccccCC.", ".cccccKKcccCC.", ".ccccKKKKccCC.", ".cccccKKcccCC.", ".cccccKKcccCC.", "..ccccccccCC..", "...cccccccC...", "....ccccCC....", ".....CCCC....."]
    rows = [r.ljust(14, '.')[:14] for r in rows]
    # simetria do cadeado
    rows[0] = ".....WWWW....."; rows[1] = "....W....W...."; rows[2] = "....W....W...."
    return icon(rows)

def spam_env():
    c = Cv(14, 14)
    rows = ["mmmmmmmmmmmmmm", "mWmmmmmmmmmmWm", "mmWmmmmmmmmWmm", "mmmWmmmmmmWmmm", "mmmmWmmmmWmmmm", "mmmmmWmmWmmmmm", "mmmmmmWWmmmmmm", "mmmmmmmmmmmmmm", "mmmmmmmmmmmmmm", "NNNNNNNNNNNNNN"]
    env = art(rows); base = new(14, 14); base.paste(env, (0, 0))
    badge = art([".aaaa.", "aaKKaa", "aaKKaa", "aaaaaa", "aaKKaa", ".aaaa."]); base.alpha_composite(badge, (8, 8))
    return outline(base)

def glyph(ch, col):
    t = text(ch, col, 2); t = outline(t, 'K'); o = new(16, 16); o.paste(t, ((16 - t.width) // 2, (16 - t.height) // 2), t); return o

def popup(kind):
    im = new(32, 24); d = ImageDraw.Draw(im)
    rect(d, (0, 0, 31, 23), fill='W'); rect(d, (0, 0, 31, 5), fill='m'); rect(d, (0, 23, 31, 23), fill='g'); rect(d, (31, 5, 31, 23), fill='g')
    rect(d, (26, 1, 30, 4), fill='W'); px = im.load()
    for (x, y) in [(27, 1), (28, 2), (29, 3), (27, 3), (29, 1)]: px[x, y] = PAL['m']
    for x in (2, 4, 6): px[x, 2] = PAL['W']
    body = {'off': text('90%', 'M'), 'gift': gift().crop((1, 1, 15, 15)), 'warn': warn_tri().crop((1, 1, 15, 15))}[kind]
    im.alpha_composite(body, ((32 - body.width) // 2, 6 + (18 - body.height) // 2))
    if kind == 'off':
        px = im.load()
        for x in range(2, 30): px[x, 21] = PAL['c']
    return outline(im)

def link_chip():
    im = box(40, 16, 'c', 'K', None, 'C', corner=True); t = text('http', 'c'); im.alpha_composite(t, (4, 4))
    d = ImageDraw.Draw(im); d.line((4, 12, 35, 12), fill=PAL['c'])
    px = im.load(); px[34, 5] = PAL['m']; px[35, 6] = PAL['m']; px[36, 5] = PAL['m']
    return im

def cupom():
    c = Cv(24, 16); c.rect(0, 1, 23, 14, 'A'); c.rect(0, 1, 23, 2, 'a'); c.rect(0, 13, 23, 14, 'd')
    for y in range(1, 15, 3): c.p(0, y, '.'); c.p(23, y, '.')
    c.rect(17, 2, 17, 13, 'd'); c.im.alpha_composite(text('%', 'K'), (6, 4)); c.im.alpha_composite(text('0', 'K'), (11, 4)) if False else None
    return outline(c.im)

def orb(col):
    m = {'m': ('m', 'M'), 'c': ('c', 'C'), 'a': ('a', 'A')}[col]
    c = Cv(6, 6); c.ell(0, 0, 5, 5, m[0]); c.ell(1, 1, 4, 4, 'W'); c.p(4, 4, m[1]); return outline(c.im)

def bit(ch, col):
    t = text(ch, col); o = new(8, 8); o.paste(t, ((8 - t.width) // 2, (8 - t.height) // 2), t); return o

def run():
    s = soul()
    hit = recolor(s, {'c': 'r', 'C': 'R', 'W': 'W'})
    guard = s.copy(); g = new(16, 16); d = ImageDraw.Draw(g); d.ellipse((0, 0, 15, 15), outline=PAL['W']); gp = g.load()
    d.ellipse((1, 1, 14, 14), outline=PAL['c'])
    guard = Image.alpha_composite(g, s)
    save(strip([s, hit, alpha(s, .35), guard]), '02_batalha/alma/alma_cadeado_escudo_16x16_4f.png', frames=4, note='frames: normal, dano (vermelho), invulneravel (piscar), defendendo (anel)')
    save(strip([s]), '02_batalha/alma/alma_cadeado_escudo_16x16.png')
    save(scale(s, 2), '02_batalha/alma/alma_cadeado_escudo_32x32.png', note='versao 2x para telas de escolha')
    # caixa de batalha
    bb = new(24, 24); d = ImageDraw.Draw(bb); rect(d, (0, 0, 23, 23), fill='W'); rect(d, (1, 1, 22, 22), fill='g'); rect(d, (2, 2, 21, 21), fill='K')
    save(bb, '02_batalha/caixa/caixa_batalha_9slice_24x24.png', note='9-slice corte 8px (area de desvio)')
    save(scale9(bb, 8, 160, 120), '02_batalha/caixa/EXEMPLO_caixa_batalha_160x120.png', note='apenas referencia')
    # projeteis
    e = spam_env()
    save(strip([e, shift(e, 0, 1)]), '02_batalha/projeteis/spam_envelope_16x16_2f.png', frames=2, note='Chuva de Spam (turno 1)')
    chars = '0123456789!@#$%&*?'
    save(strip([glyph(ch, 'c' if i % 2 == 0 else 'm') for i, ch in enumerate(chars)]), '02_batalha/projeteis/forca_bruta_caracteres_16x16_18f.png', frames=18, note='Ataque de Forca Bruta (turno 2): 0-9 e simbolos, cores alternadas')
    save(strip([popup('off'), popup('gift'), popup('warn')]), '02_batalha/projeteis/popup_falso_34x26_3f.png', frames=3, note='Enxurrada de Pop-ups (turno 3): oferta, presente, alerta')
    save(link_chip(), '02_batalha/projeteis/link_falso_40x16.png', note='link falso (turno 3)')
    save(cupom(), '02_batalha/projeteis/cupom_falso_26x18.png', note='cupom de oferta falsa (turno 3)')
    save(strip([orb('m'), orb('c'), orb('a')]), '02_batalha/projeteis/orbe_8x8_3f.png', frames=3, note='projetil generico: magenta, ciano, ambar')
    save(strip([bit('0', 'c'), bit('1', 'c'), bit('0', 'm'), bit('1', 'm')]), '02_batalha/projeteis/bits_8x8_4f.png', frames=4)
    save(alerta_proj(), '02_batalha/projeteis/alerta_16x16.png')
    # efeitos
    save(strip(hit_spark()), '08_efeitos/impacto_16x16_4f.png', frames=4, note='faisca de impacto')
    save(strip(shield_ring()), '08_efeitos/escudo_bloqueio_32x32_4f.png', frames=4, note='pulso do escudo ao bloquear')
    save(strip(explosion()), '08_efeitos/explosao_32x32_5f.png', frames=5, note='virus derrotado / dano')
    save(strip(sparkle()), '08_efeitos/brilho_8x8_4f.png', frames=4, note='brilho de acerto/item')
    sl = new(4, 4); sl.load()[0, 3] = (13, 11, 20, 90); [sl.putpixel((x, 3), (13, 11, 20, 90)) for x in range(4)]
    save(sl, '08_efeitos/scanlines_tile_4x4.png', note='tile repetivel (tileSprite) para efeito CRT')

def alerta_proj():
    return alerta_img()

def alerta_img():
    return warn_tri()

def hit_spark():
    fr = []
    for i in range(4):
        c = Cv(16, 16); r = 2 + i * 2
        for a in range(8):
            ang = a * math.pi / 4; x = int(8 + math.cos(ang) * r); y = int(8 + math.sin(ang) * r)
            c.rect(x - (1 if i < 2 else 0), y - (1 if i < 2 else 0), x, y, 'W' if i < 2 else ('a' if i == 2 else 'm'))
        if i < 2: c.rect(7, 7, 8, 8, 'W')
        fr.append(c.im)
    return fr

def shield_ring():
    fr = []
    for i in range(4):
        c = Cv(32, 32); r = 8 + i * 3; d = ImageDraw.Draw(c.im)
        d.ellipse((16 - r, 16 - r, 15 + r, 15 + r), outline=PAL['c' if i < 3 else 'C'], width=2 if i < 3 else 1)
        if i == 0: d.ellipse((12, 12, 19, 19), fill=PAL['W'])
        fr.append(c.im)
    return fr

def explosion():
    fr = []
    for i in range(5):
        c = Cv(32, 32); d = ImageDraw.Draw(c.im)
        if i == 0: d.ellipse((10, 10, 21, 21), fill=PAL['W'])
        elif i == 1: d.ellipse((6, 6, 25, 25), fill=PAL['a']); d.ellipse((10, 10, 21, 21), fill=PAL['W'])
        elif i == 2: d.ellipse((3, 3, 28, 28), fill=PAL['m']); d.ellipse((7, 7, 24, 24), fill=PAL['a']); d.ellipse((12, 12, 19, 19), fill=PAL['W'])
        elif i == 3: d.ellipse((1, 1, 30, 30), outline=PAL['m'], width=3); d.ellipse((7, 7, 24, 24), outline=PAL['M'], width=2)
        else:
            random.seed(7)
            for _ in range(14):
                a = random.random() * 6.28; r = random.randint(9, 15); c.rect(int(16 + math.cos(a) * r), int(16 + math.sin(a) * r), int(16 + math.cos(a) * r) + 1, int(16 + math.sin(a) * r) + 1, random.choice('mMN'))
        fr.append(c.im)
    return fr

def sparkle():
    fr = []
    for i in range(4):
        c = Cv(8, 8); n = [1, 2, 3, 2][i]
        c.rect(4 - 0, 4 - n, 4, 4 + n, 'W'); c.rect(4 - n, 4, 4 + n, 4, 'W'); c.p(4, 4, 'a'); fr.append(c.im)
    return fr

if __name__ == '__main__':
    run(); write_manifest()
    import glob
    fs = sorted(os.path.relpath(p, OUT) for p in glob.glob(OUT + '/0[28]_*/**/*.png', recursive=True))
    fs = [f for f in fs if 'EXEMPLO' not in f and 'menu' not in f]
    print(sheet_preview(fs, 'battle.png', cols=4, k=4, bg='P'))
