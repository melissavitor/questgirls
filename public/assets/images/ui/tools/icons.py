from lib import *

def canvas(n=14):
    im = new(n, n); return im, im.load()

def pts(px, lst, c):
    for x, y in lst:
        if 0 <= x < px.__self__.size[0] if hasattr(px, '__self__') else True: pass
    return

class Cv:
    def __init__(s, w=14, h=14):
        s.im = new(w, h); s.px = s.im.load(); s.w, s.h = w, h
    def p(s, x, y, c):
        if 0 <= x < s.w and 0 <= y < s.h: s.px[x, y] = PAL[c]
    def pts(s, lst, c):
        for x, y in lst: s.p(x, y, c)
    def rect(s, x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): s.p(x, y, c)
    def ell(s, x0, y0, x1, y1, c):
        d = ImageDraw.Draw(s.im); d.ellipse((x0, y0, x1, y1), fill=PAL[c])
    def poly(s, lst, c):
        d = ImageDraw.Draw(s.im); d.polygon(lst, fill=PAL[c])
    def line(s, a, b, c, w=1):
        d = ImageDraw.Draw(s.im); d.line([a, b], fill=PAL[c], width=w)
    def out(s, oc='K'): return outline(s.im, oc)

def art_strip_inner(im):
    return im.crop((1, 1, 15, 15))

def heart(full=True):
    c = Cv()
    if full:
        c.ell(0, 1, 7, 8, 'm'); c.ell(6, 1, 13, 8, 'm'); c.poly([(0, 6), (13, 6), (6, 13), (7, 13)], 'm')
        c.pts([(2, 3), (3, 2), (2, 4)], 'W'); c.pts([(10, 7), (9, 9), (8, 10), (7, 11), (6, 12)], 'N')
    else:
        c.ell(0, 1, 7, 8, 'P'); c.ell(6, 1, 13, 8, 'P'); c.poly([(0, 6), (13, 6), (6, 13), (7, 13)], 'P')
        c.ell(2, 3, 5, 6, 'q'); c.ell(8, 3, 11, 6, 'q'); c.poly([(2, 6), (11, 6), (6, 11), (7, 11)], 'q')
    return c.out()

def check():
    c = Cv()
    l = [(2, 7), (3, 8), (4, 9), (5, 10), (6, 9), (7, 8), (8, 7), (9, 6), (10, 5), (11, 4), (12, 3)]
    c.pts(l, 'c'); c.pts([(x, y + 1) for x, y in l], 'c'); c.pts([(x, y - 1) for x, y in l[5:]], 'c')
    c.pts([(x, y + 2) for x, y in l[:4]], 'T')
    return c.out()

def cross():
    c = Cv()
    for i in range(9):
        for dx in (0, 1): c.p(2 + i + dx, 2 + i, 'm'); c.p(11 - i - dx + 1, 2 + i, 'm')
    c.pts([(2, 2), (3, 2), (12, 2), (11, 2)], 'W')
    return c.out()

def warn_tri():
    c = Cv()
    c.poly([(6, 1), (7, 1), (13, 12), (0, 12)], 'a')
    c.poly([(6, 4), (7, 4), (11, 11), (2, 11)], 'A')
    c.rect(6, 5, 7, 8, 'K'); c.rect(6, 10, 7, 10, 'K')
    return c.out()

def key():
    c = Cv()
    c.ell(0, 1, 6, 7, 'a'); c.ell(2, 3, 4, 5, '.')
    c.rect(6, 4, 13, 5, 'A'); c.rect(11, 6, 12, 8, 'A'); c.rect(8, 6, 9, 7, 'A')
    c.pts([(1, 2), (2, 1)], 'W'); c.pts([(6, 3), (7, 3), (8, 3)], 'a')
    c.pts([(5, 6), (4, 7)], 'd')
    return c.out()

def lock(kind='amber', closed=True):
    body = {'amber': ('A', 'a', 'd'), 'cyan': ('c', 'W', 'C'), 'mag': ('m', 'W', 'N'), 'red': ('r', 'W', 'R')}[kind]
    c = Cv()
    if closed:
        c.rect(4, 1, 9, 1, 'W'); c.rect(3, 2, 3, 6, 'W'); c.rect(10, 2, 10, 6, 'W'); c.pts([(4, 2), (9, 2)], 'g')
    else:
        c.rect(3, 0, 8, 0, 'W'); c.rect(2, 1, 2, 5, 'W'); c.rect(9, 1, 9, 3, 'W'); c.pts([(3, 1)], 'g')
    c.rect(1, 6, 12, 13, body[0]); c.rect(1, 6, 12, 6, body[1]); c.rect(12, 7, 12, 13, body[2]); c.rect(1, 13, 12, 13, body[2])
    c.rect(6, 8, 7, 9, 'K'); c.rect(6, 10, 7, 11, 'K'); c.pts([(5, 8), (8, 8)], 'K')
    return c.out()

def shield(col='c'):
    sh = {'c': ('c', 'W', 'C'), 'm': ('m', 'W', 'N'), 'a': ('A', 'a', 'd')}[col]
    c = Cv()
    c.poly([(1, 1), (12, 1), (12, 7), (8, 12), (7, 13), (6, 13), (5, 12), (1, 7)], sh[0])
    c.rect(1, 1, 12, 1, sh[1]); c.rect(1, 2, 1, 6, sh[1])
    c.pts([(12, 2), (12, 3), (12, 4), (12, 5), (12, 6), (11, 7), (10, 9), (9, 10), (8, 11)], sh[2])
    c.rect(6, 4, 7, 7, 'K'); c.pts([(5, 5), (8, 5)], 'K'); c.pts([(6, 8), (7, 8)], 'K')  # fechadura
    return c.out()

def star(full=True):
    c = Cv()
    lst = [(7, 0), (9, 5), (14, 5), (10, 8), (11, 13), (7, 10), (3, 13), (4, 8), (0, 5), (5, 5)]
    c.poly(lst, 'a' if full else 'q')
    if full: c.pts([(6, 3), (6, 4), (7, 2)], 'W'); c.pts([(9, 9), (10, 10), (8, 8)], 'd')
    return c.out()

def clock():
    c = Cv(); c.ell(0, 0, 13, 13, 'W'); c.ell(1, 1, 12, 12, 'c'); c.ell(2, 2, 11, 11, 'W')
    c.rect(6, 3, 7, 7, 'K'); c.rect(7, 7, 10, 8, 'K'); c.pts([(2, 6), (11, 6), (6, 2), (6, 11)], 'g')
    return c.out()

def coin():
    c = Cv(); c.ell(0, 0, 13, 13, 'd'); c.ell(1, 1, 12, 12, 'A'); c.ell(2, 2, 11, 11, 'a')
    c.rect(6, 3, 7, 10, 'd'); c.rect(5, 4, 8, 4, 'd'); c.rect(5, 6, 8, 6, 'd'); c.rect(5, 9, 8, 9, 'd')
    c.pts([(2, 4), (3, 3)], 'W')
    return c.out()

def gift():
    c = Cv(); c.rect(1, 5, 12, 13, 'm'); c.rect(0, 3, 13, 6, 'M'); c.rect(6, 3, 7, 13, 'a')
    c.rect(0, 3, 13, 3, 'm'); c.pts([(4, 1), (5, 2), (3, 2), (2, 1), (3, 0), (4, 0), (9, 1), (8, 2), (10, 2), (11, 1), (10, 0), (9, 0)], 'a')
    c.rect(6, 2, 7, 2, 'a'); c.rect(12, 7, 12, 13, 'N'); c.rect(1, 13, 12, 13, 'N')
    return c.out()

def lupa():
    c = Cv(); c.ell(0, 0, 9, 9, 'W'); c.ell(2, 2, 7, 7, 'c')
    for i in range(5): c.p(8 + i, 8 + i, 'A'); c.p(9 + i, 8 + i, 'A'); c.p(8 + i, 9 + i, 'd')
    c.pts([(3, 3), (3, 4)], 'W')
    return c.out()

def flag():
    c = Cv(); c.rect(2, 0, 3, 13, 'W'); c.rect(4, 1, 12, 7, 'm'); c.rect(4, 1, 12, 1, 'W'); c.rect(4, 7, 12, 7, 'N')
    c.rect(8, 3, 8, 4, 'W'); c.p(8, 6, 'W'); c.pts([(12, 4), (12, 5)], '.')
    return c.out()

def mochila():
    c = Cv(); c.rect(3, 0, 10, 2, 'p'); c.rect(4, 1, 9, 1, '.'); c.rect(1, 3, 12, 13, 'C'); c.rect(1, 3, 12, 3, 'c'); c.rect(12, 4, 12, 13, 'T'); c.rect(1, 13, 12, 13, 'T')
    c.rect(3, 8, 10, 11, 'T'); c.rect(3, 8, 10, 8, 'K'); c.rect(6, 7, 7, 9, 'A')
    return c.out()

def token2fa():
    c = Cv(); c.rect(3, 0, 10, 13, 'W'); c.rect(4, 1, 9, 10, 'K'); c.rect(4, 2, 9, 9, 'T')
    c.rect(5, 3, 8, 3, 'c'); c.rect(5, 5, 8, 5, 'c'); c.rect(5, 7, 7, 7, 'c'); c.rect(6, 12, 7, 12, 'g'); c.pts([(10, 3), (10, 4), (10, 5)], 'g')
    c.rect(3, 13, 10, 13, 'g')
    return c.out()

def link():
    c = Cv(); c.rect(0, 2, 7, 6, 'c'); c.rect(1, 3, 6, 5, '.'); c.rect(6, 7, 13, 11, 'c'); c.rect(7, 8, 12, 10, '.')
    c.rect(5, 5, 8, 8, 'c'); c.rect(6, 6, 7, 7, 'W')
    c.pts([(0, 2), (1, 2), (0, 3)], 'W'); c.pts([(13, 11), (12, 11), (13, 10)], 'C')
    return c.out()

def anzol():
    c = Cv(); c.ell(0, 0, 3, 3, 'W'); c.ell(1, 1, 2, 2, '.')
    c.rect(1, 3, 2, 10, 'W'); c.rect(2, 9, 8, 12, 'W'); c.rect(3, 9, 7, 11, '.')  # arco
    c.rect(2, 11, 8, 12, 'W'); c.rect(9, 6, 10, 11, 'W'); c.pts([(8, 6), (8, 7), (7, 8)], 'W'); c.pts([(10, 5), (9, 5)], 'W')
    c.pts([(1, 4), (1, 6), (1, 8)], 'g')
    return c.out()

def folder():
    c = Cv(); c.rect(0, 2, 5, 4, 'a'); c.rect(0, 4, 13, 12, 'A'); c.rect(0, 4, 13, 4, 'a'); c.rect(1, 6, 12, 11, 'a'); c.rect(0, 12, 13, 12, 'd'); c.rect(13, 5, 13, 12, 'd')
    return c.out()

def camera():
    c = Cv(); c.rect(0, 3, 13, 12, 'g'); c.rect(3, 1, 6, 3, 'g'); c.rect(0, 3, 13, 3, 'W'); c.ell(3, 4, 10, 11, 'K'); c.ell(4, 5, 9, 10, 'c'); c.ell(5, 6, 8, 9, 'T'); c.p(5, 6, 'W'); c.pts([(11, 5), (12, 5)], 'r')
    return c.out()

def mic():
    c = Cv(); c.rect(4, 0, 9, 7, 'W'); c.rect(5, 0, 8, 0, 'W'); c.rect(4, 1, 9, 6, 'g'); c.rect(5, 1, 8, 6, 'W')
    for y in (2, 4): c.rect(5, y, 8, y, 'g')
    c.rect(2, 5, 2, 8, 'c'); c.rect(11, 5, 11, 8, 'c'); c.rect(3, 9, 10, 9, 'c'); c.rect(6, 10, 7, 12, 'c'); c.rect(4, 13, 9, 13, 'c')
    return c.out()

def pin():
    c = Cv(); c.ell(1, 0, 12, 10, 'm'); c.poly([(2, 7), (11, 7), (6, 13), (7, 13)], 'm'); c.ell(4, 3, 9, 7, 'K'); c.pts([(3, 2), (4, 1), (3, 3)], 'W'); c.pts([(11, 6), (10, 8)], 'N')
    return c.out()

def contato():
    c = Cv(); c.ell(3, 0, 10, 7, 'W'); c.rect(0, 9, 13, 13, 'c'); c.ell(0, 8, 13, 16, 'c'); c.rect(0, 12, 13, 13, 'c')
    c.rect(0, 13, 13, 13, 'T'); c.pts([(4, 2), (5, 1)], 'g')
    return c.out()

def chat():
    c = Cv(); c.rect(0, 1, 13, 9, 'W'); c.poly([(2, 9), (6, 9), (2, 13)], 'W'); c.rect(2, 4, 11, 4, 'C'); c.rect(2, 6, 8, 6, 'C'); c.rect(13, 2, 13, 9, 'g'); c.rect(0, 9, 13, 9, 'g')
    return c.out()

def telefone():
    c = Cv(); c.poly([(0, 2), (3, 0), (5, 4), (3, 5), (6, 8), (9, 7), (13, 9), (11, 13), (6, 12), (1, 7)], 'c'); c.pts([(2, 2), (1, 3)], 'W')
    return c.out()

def bug():
    c = Cv(); c.ell(3, 3, 10, 12, 'm'); c.ell(4, 1, 9, 5, 'M'); c.rect(6, 4, 7, 12, 'N')
    for y in (5, 8, 11): c.pts([(1, y), (2, y), (11, y), (12, y)], 'W')
    c.pts([(3, 0), (4, 1), (10, 0), (9, 1)], 'W'); c.pts([(5, 3), (8, 3)], 'A')
    return c.out()

def virus_small():
    c = Cv(); c.ell(3, 3, 10, 10, 'p')
    for (x0, y0, x1, y1) in [(6, 0, 7, 2), (6, 11, 7, 13), (0, 6, 2, 7), (11, 6, 13, 7)]: c.rect(x0, y0, x1, y1, 'm')
    for (x, y) in [(2, 2), (11, 2), (2, 11), (11, 11)]: c.pts([(x, y), (x + (1 if x < 7 else -1), y + (1 if y < 7 else -1))], 'm')
    c.rect(5, 6, 5, 7, 'W'); c.rect(8, 6, 8, 7, 'W'); c.rect(6, 9, 7, 9, 'K')
    return c.out()

def eye():
    c = Cv(); c.ell(0, 3, 13, 10, 'W'); c.ell(4, 2, 9, 11, 'c'); c.ell(5, 4, 8, 9, 'K'); c.p(5, 5, 'W'); c.rect(0, 6, 1, 7, 'W'); c.pts([(1, 3), (12, 3)], '.')
    c.rect(2, 3, 11, 3, 'g'); c.rect(2, 10, 11, 10, 'g')
    return c.out()

def seta_baixo():
    c = Cv(8, 8)
    for y, (x0, x1) in enumerate([(0, 7), (1, 6), (2, 5), (3, 4)]): c.rect(x0, y + 1, x1, y + 1, 'm')
    return c.im

def cursor_seta():
    c = Cv(8, 8)
    for y, w in enumerate([2, 4, 6, 8, 6, 4, 2]): c.rect(0, y, w - 1, y, 'm')
    return c.im

def mouse_ptr():
    rows = ["K...........", "KK..........", "KWK.........", "KWWK........", "KWWWK.......", "KWWWWK......", "KWWWWWK.....", "KWWWWWWK....", "KWWWWWKKK...", "KWWKWWK.....", "KWK.KWWK....", "KK..KWWK....", "K....KWWK...", ".....KKK...."]
    return art(rows)

def interrog(color='a'):
    return outline(text('?', color, 2), 'K')

def exclam(color='r'):
    t = outline(text('!', color, 2), 'K'); o = new(16, 16); o.paste(t, (4, 1), t); return o

ICONS_UI = {
 'heart_cheio': heart(True), 'heart_vazio': outline(art_strip_inner(heart(False)), 'p'), 'check': check(), 'cross': cross(), 'alerta': warn_tri(),
 'chave': key(), 'cadeado_fechado': lock('amber', True), 'cadeado_aberto': lock('mag', False), 'cadeado_forte': lock('cyan', True),
 'escudo': shield('c'), 'estrela_cheia': star(True), 'estrela_vazia': star(False), 'relogio': clock(), 'moeda': coin(),
 'interrogacao': interrog(), 'exclamacao': exclam(), 'lupa': lupa(), 'bandeira': flag(), 'mochila': mochila(), 'token_2fa': token2fa(),
}
ICONS_THREAT = {'link': link(), 'anzol': anzol(), 'presente': gift(), 'bug': bug(), 'virus_mini': virus_small(), 'olho_espiao': eye()}
ICONS_PERM = {'camera': camera(), 'microfone': mic(), 'localizacao': pin(), 'contatos': contato(), 'sms': chat(), 'armazenamento': folder(), 'telefone': telefone()}

if __name__ == '__main__':
    allic = {**ICONS_UI, **ICONS_THREAT, **ICONS_PERM}
    ims = list(allic.values())
    print({k: v.size for k, v in allic.items()})
    g = grid(ims, 9)
    bg = Image.new('RGBA', g.size, PAL['P']); bg.alpha_composite(g)
    scale(bg, 6).save('/home/claude/gen/prev_icons.png')
