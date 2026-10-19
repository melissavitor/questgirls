from lib import *
from icons import *
from ui import box, scale9
import random, string

def block(theme, state):
    b = {'c': ('c', 'T', 'C'), 'm': ('m', 'N', 'M'), 'a': ('a', 'd', 'd'), 'W': ('W', 'p', 'g')}[theme]
    if state == 0: return box(32, 32, b[0], 'q', b[1], b[2])
    if state == 1: return box(32, 32, 'a', 'P', b[1], 'd')
    im = box(32, 32, b[0], b[1], 'K', b[2]); return im

def block_char(ch):
    th = 'c' if ch.islower() else 'm' if ch.isupper() else 'a' if ch.isdigit() else 'W'
    im = block(th, 0); t = outline(text(ch, 'W', 2), 'K') if False else text(ch, 'W', 2)
    col = {'c': 'c', 'm': 'm', 'a': 'a', 'W': 'W'}[th]
    t = glyph8(ch, col, 2); im.alpha_composite(t, (8, 8)); return im

def envelope(kind):
    c = Cv(30, 30)
    body, flap, sh = {'novo': ('W', 'g', 'g'), 'aberto': ('W', 'g', 'g'), 'suspeito': ('m', 'W', 'N')}[kind]
    c.rect(0, 6, 29, 28, body); c.rect(0, 28, 29, 28, sh); c.rect(29, 7, 29, 28, sh)
    if kind == 'aberto':
        c.poly([(0, 6), (14, 0), (15, 0), (29, 6)], 'p'); c.rect(4, 10, 25, 11, 'g'); c.rect(4, 14, 20, 15, 'g'); c.rect(4, 18, 23, 19, 'g')
    else:
        c.line((0, 6), (14, 18), flap, 1); c.line((29, 6), (15, 18), flap, 1); c.line((0, 6), (14, 19), flap, 1); c.line((29, 6), (15, 19), flap, 1)
    if kind == 'novo': c.ell(21, 1, 28, 8, 'r'); c.rect(24, 3, 25, 5, 'W')
    if kind == 'suspeito':
        c.rect(12, 14, 17, 27, 'K') if False else None
        c.im.alpha_composite(warn_tri().crop((1, 1, 15, 15)), (16, 14))
    return outline(c.im)

def gamepad():
    c = Cv(30, 30); c.ell(0, 8, 11, 26, 'g'); c.ell(18, 8, 29, 26, 'g'); c.rect(5, 6, 24, 21, 'W'); c.rect(2, 10, 27, 22, 'g'); c.rect(5, 6, 24, 9, 'W')
    c.rect(6, 12, 12, 13, 'K'); c.rect(8, 10, 9, 16, 'K'); c.ell(18, 11, 21, 14, 'm'); c.ell(22, 14, 25, 17, 'c'); c.rect(11, 17, 13, 18, 'g'); c.rect(15, 17, 17, 18, 'g')
    c.rect(5, 5, 24, 5, 'p')
    return outline(c.im)

def trofeu():
    c = Cv(30, 30); c.rect(7, 1, 22, 13, 'A'); c.ell(7, 8, 22, 20, 'A'); c.rect(7, 1, 22, 2, 'a'); c.rect(12, 20, 17, 24, 'd'); c.rect(8, 24, 21, 28, 'A'); c.rect(8, 28, 21, 28, 'd')
    for (x0, x1) in ((0, 5), (24, 29)): c.rect(x0, 3, x1, 4, 'A'); c.rect(x0, 3, x0 if x0 == 0 else x1, 11, 'A'); c.rect(x0, 10, x1, 11, 'A')
    c.rect(9, 3, 11, 12, 'W'); c.rect(21, 6, 22, 14, 'd')
    return outline(c.im)

def stamp(label, theme):
    b = {'m': ('m', 'N', 'W'), 'c': ('c', 'T', 'W')}[theme]
    im = box(64, 32, b[0], b[1], b[0], None); d = ImageDraw.Draw(im); rect(d, (4, 4, 59, 27), outline_=b[0])
    t = text(label, b[2], 1); im.alpha_composite(t, ((64 - t.width) // 2, (32 - t.height) // 2)); return im

def app_tile(glyph, theme):
    b = {'c': ('c', 'T'), 'm': ('m', 'N'), 'a': ('a', 'd'), 'W': ('W', 'p')}[theme]
    im = box(32, 32, b[0], b[1], 'K', None); im.alpha_composite(glyph, ((32 - glyph.width) // 2, (32 - glyph.height) // 2)); return im

def g_lanterna():
    c = Cv(); c.rect(3, 0, 10, 4, 'W'); c.rect(4, 5, 9, 12, 'g'); c.rect(5, 12, 8, 13, 'W'); c.rect(6, 1, 7, 3, 'a'); c.pts([(0, 1), (1, 2), (12, 2), (13, 1)], 'a'); return c.out()
def g_calc():
    c = Cv(); c.rect(1, 0, 12, 13, 'W'); c.rect(2, 1, 11, 4, 'c')
    for y in (6, 9, 12 - 0): pass
    for y in (6, 9):
        for x in (2, 5, 8): c.rect(x, y, x + 1, y + 1, 'K')
    c.rect(11, 6, 11, 12, 'm') if False else None
    for x in (2, 5, 8): c.rect(x, 12, x + 1, 12, 'K')
    return c.out()
def g_sol():
    c = Cv(); c.ell(3, 3, 10, 10, 'a')
    for p in [(6, 0, 7, 1), (6, 12, 7, 13), (0, 6, 1, 7), (12, 6, 13, 7), (1, 1, 2, 2), (11, 1, 12, 2), (1, 11, 2, 12), (11, 11, 12, 12)]: c.rect(*p, 'a')
    return c.out()
def g_nota():
    c = Cv(); c.rect(5, 1, 6, 10, 'W'); c.rect(5, 1, 12, 3, 'W'); c.rect(11, 1, 12, 8, 'W'); c.ell(1, 8, 6, 12, 'W'); c.ell(8, 6, 13, 10, 'W'); return c.out()
def g_jogo(): return outline(gamepad().resize((15, 15), Image.NEAREST), 'K') if False else gamepad().resize((16, 16), Image.NEAREST)

def piso(alt):
    im = new(32, 32, 'K'); d = ImageDraw.Draw(im); rect(d, (0, 0, 31, 31), fill='q')
    for p in (0, 16): d.line((p, 0, p, 31), fill=PAL['P']); d.line((0, p, 31, p), fill=PAL['P'])
    random.seed(5 if alt else 2); px = im.load()
    for _ in range(5 if alt else 3):
        x, y = random.randint(1, 30), random.randint(1, 30); px[x, y] = PAL['C']
    if alt:
        d.line((3, 8, 12, 8), fill=PAL['T']); d.line((12, 8, 12, 13), fill=PAL['T']); px[12, 13] = PAL['c']
    return im

def rack():
    im = new(32, 64); d = ImageDraw.Draw(im); rect(d, (0, 0, 31, 63), fill='W'); rect(d, (1, 1, 30, 62), fill='P'); rect(d, (0, 0, 31, 63), outline_='p')
    random.seed(11)
    for i in range(7):
        y = 4 + i * 8; rect(d, (3, y, 28, y + 5), fill='K'); rect(d, (3, y, 28, y), fill='q')
        for j in range(3): d.point((6 + j * 3, y + 3), fill=PAL[random.choice('cmcA')])
        rect(d, (18, y + 2, 26, y + 3), fill='T')
    rect(d, (0, 62, 31, 63), fill='K'); return outline(im)

def terminal():
    c = Cv(30, 30); c.rect(1, 2, 28, 21, 'g'); c.rect(3, 4, 26, 19, 'K'); c.rect(4, 5, 25, 18, 'T')
    for y, w in ((7, 12), (10, 16), (13, 9)): c.rect(6, y, 6 + w, y, 'c')
    c.rect(6, 16, 8, 16, 'a'); c.rect(12, 22, 17, 25, 'g'); c.rect(7, 26, 22, 28, 'g'); c.rect(1, 2, 28, 2, 'W')
    return outline(c.im)

def battle_bg():
    W, H = 320, 180; im = new(W, H, 'K'); d = ImageDraw.Draw(im); random.seed(3)
    for y in range(H):
        t = y / H; col = (int(13 + 20 * t), int(11 + 8 * t), int(20 + 40 * t), 255); d.line((0, y, W, y), fill=col)
    for x in range(0, W, 16): d.line((x, 0, x, H), fill=(59, 31, 80, 255) if x % 64 else (90, 50, 120, 255))
    for y in range(0, H, 16): d.line((0, y, W, y), fill=(59, 31, 80, 255) if y % 64 else (90, 50, 120, 255))
    px = im.load()
    for _ in range(26):
        x, y = random.randrange(0, W, 16), random.randrange(0, H, 16); l = random.randint(2, 6) * 16
        d.line((x, y, min(W - 1, x + l), y), fill=PAL['T']); d.rectangle((x - 1, y - 1, x + 1, y + 1), fill=PAL['c'])
    for _ in range(40):
        x, y = random.randrange(W), random.randrange(H); ch = random.choice('01'); t = text(ch, 'C'); im.alpha_composite(alpha(t, .6), (x, y))
    # vinheta
    v = new(W, H); vd = ImageDraw.Draw(v)
    for i in range(10): vd.rectangle((i, i, W - 1 - i, H - 1 - i), outline=(13, 11, 20, int(200 - i * 20)))
    im.alpha_composite(v); return im

def banner(label, theme, w=192, h=32):
    b = {'c': ('c', 'T', 'W'), 'm': ('m', 'N', 'W'), 'a': ('a', 'd', 'W')}[theme]
    im = box(w, h, b[0], 'K', b[1], b[1]); t = text(label, b[2]); im.alpha_composite(t, ((w - t.width) // 2, (h - t.height) // 2)); return im

def logo():
    W, H = 300, 118; im = new(W, H)
    lk = scale(lock('cyan', True), 2); im.alpha_composite(lk, ((W - 32) // 2, 0))
    a = text('GUARDIÃO', 'c', 4, shadow='T'); b = text('DO FIREWALL', 'm', 3, shadow='N')
    im.alpha_composite(a, ((W - a.width) // 2, 36)); im.alpha_composite(b, ((W - b.width) // 2, 36 + a.height + 8))
    d = ImageDraw.Draw(im); d.line((8, 15, 110, 15), fill=PAL['m']); d.line((190, 15, 292, 15), fill=PAL['c'])
    return im

def run():
    P = '04_fase1_senha/'
    for th, nm in (('c', 'minuscula'), ('m', 'maiuscula'), ('a', 'numero'), ('W', 'simbolo')):
        save(strip([block(th, s) for s in range(3)]), f'{P}bloco_base_{nm}_32x32_3f.png', frames=3, note='frames: normal, hover, colocado (sem letra)')
    chars = string.ascii_lowercase + string.ascii_uppercase + string.digits + '!@#$%&*?-_+='
    save(grid([block_char(c) for c in chars], 10), f'{P}blocos_caracteres_32x32_{len(chars)}f.png', frames=1, note=f'spritesheet 10 colunas, ordem: {chars}')
    save(strip([box(32, 32, 'P', 'q', None, None), box(32, 32, 'a', 'q', 'd', None), box(32, 32, 'c', 'T', 'K', None)]), f'{P}slot_senha_32x32_3f.png', frames=3, note='vazio, hover, ocupado')
    save(box(24, 24, 'c', 'K', 'T', 'C'), f'{P}campo_senha_9slice_24x24.png', note='9-slice corte 8px')
    save(scale(lock('mag', False), 2), f'{P}cadeado_fraco_32x32.png'); save(scale(lock('cyan', True), 2), f'{P}cadeado_forte_32x32.png')
    for k, v in {'relogio': clock(), 'ampulheta': clock()}.items():
        if k == 'relogio': save(v, f'{P}relogio_16x16.png')
    Q = '05_fase2_golpe/'
    for k in ('novo', 'aberto', 'suspeito'): save(envelope(k), f'{Q}email_{k}_32x32.png')
    save(strip([envelope('novo'), envelope('aberto'), envelope('suspeito')]), f'{Q}email_estados_32x32_3f.png', frames=3, note='novo, aberto, suspeito')
    save(box(24, 24, 'W', 'q', 'p', 'g'), f'{Q}email_cartao_9slice_24x24.png', note='9-slice corte 8px (corpo do e-mail)')
    save(stamp('GOLPE!', 'm'), f'{Q}carimbo_golpe_64x32.png'); save(stamp('SEGURO', 'c'), f'{Q}carimbo_seguro_64x32.png')
    save(gamepad(), f'{Q}isca_console_32x32.png', note='isca: console gratis'); save(trofeu(), f'{Q}isca_trofeu_32x32.png', note='isca: premio falso')
    save(scale(gift(), 2), f'{Q}isca_presente_32x32.png'); save(scale(link(), 2), f'{Q}link_suspeito_32x32.png'); save(scale(anzol(), 2), f'{Q}phishing_anzol_icone_32x32.png')
    save(scale(check(), 2), f'{Q}marca_certo_32x32.png'); save(scale(cross(), 2), f'{Q}marca_errado_32x32.png')
    R = '06_fase3_dados/'
    apps = [('lanterna', g_lanterna(), 'a'), ('calculadora', g_calc(), 'c'), ('jogo', g_jogo(), 'm'), ('clima', g_sol(), 'a'), ('fotos', camera(), 'W'), ('musica', g_nota(), 'm'), ('carteira', coin(), 'a'), ('mensagens', chat(), 'c')]
    for k, g, th in apps: save(app_tile(g, th), f'{R}app_{k}_32x32.png', note='icone de aplicativo')
    save(app_tile(eye(), 'm'), f'{R}app_espiao_32x32.png', note='app malicioso disfarcado')
    for k, v in ICONS_PERM.items(): save(v, f'{R}permissao_{k}_16x16.png')
    tg = []
    for on in (0, 1):
        b = box(32, 16, 'c' if on else 'P', 'T' if on else 'q', None, None); kx = 18 if on else 2
        ImageDraw.Draw(b).rectangle((kx, 3, kx + 11, 12), fill=PAL['W' if on else 'g']); tg.append(b)
    save(strip(tg), f'{R}toggle_permissao_32x16_2f.png', frames=2, note='desligado, ligado')
    save(box(24, 24, 'c', 'q', 'T', 'C'), f'{R}pedido_permissao_9slice_24x24.png', note='9-slice corte 8px (cartao do pedido)')
    save(icons_dict_shield(), f'{R}selo_seguro_16x16.png')
    S = '07_cenario/'
    save(battle_bg(), f'{S}fundo_batalha_320x180.png', note='fundo do chefao (tamanho 16:9 base)')
    save(piso(False), f'{S}piso_servidor_32x32.png'); save(piso(True), f'{S}piso_servidor_alt_32x32.png'); save(rack(), f'{S}servidor_rack_34x66.png'); save(terminal(), f'{S}terminal_32x32.png')
    T = '09_titulo/'
    save(logo(), f'{T}logo_guardiao_do_firewall_300x118.png')
    for k, l, th in [('fase1', 'FASE 1: SENHA FORTE', 'c'), ('fase2', 'FASE 2: CAÇA AO GOLPE', 'c'), ('fase3', 'FASE 3: PROTEJA SEUS DADOS', 'c'), ('boss', 'CHEFÃO: O TROJAN', 'm')]:
        save(banner(l, th, 232 if k == 'fase3' else 192), f'{T}banner_{k}_{232 if k == "fase3" else 192}x32.png')
    save(banner('CONSEGUIMOS!', 'c', 128, 40), f'{T}banner_vitoria_128x40.png'); save(banner('SISTEMA INVADIDO', 'm', 168, 40), f'{T}banner_derrota_168x40.png')

def icons_dict_shield(): return shield('c')

if __name__ == '__main__':
    run(); write_manifest()
    import glob
    for pat, nm, cols, k in [('04_*', 'f1', 4, 3), ('05_*', 'f2', 4, 3), ('06_*', 'f3', 5, 3), ('07_*', 'cen', 2, 2), ('09_*', 'tit', 2, 2)]:
        fs = sorted(os.path.relpath(p, OUT) for p in glob.glob(f'{OUT}/{pat}/**/*.png', recursive=True))
        print(sheet_preview([f for f in fs if 'EXEMPLO' not in f], nm + '.png', cols=cols, k=k, bg='P'))
