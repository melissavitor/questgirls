from lib import *
from icons import *

THEMES = {  # borda, fundo, linha interna, sombra
 'mag': ('m', 'K', 'P', 'M'),
 'cyan': ('c', 'K', 'T', 'C'),
 'amber': ('a', 'K', 'd', 'd'),
}

def box(w, h, border='m', fill='K', inner='P', shade='M', corner=True):
    im = new(w, h); d = ImageDraw.Draw(im)
    rect(d, (0, 0, w - 1, h - 1), fill=border); rect(d, (1, 1, w - 2, h - 2), fill=fill)
    if inner: rect(d, (2, 2, w - 3, h - 3), outline_=inner)
    px = im.load()
    if shade:
        for x in range(1, w): px[x, h - 1] = PAL[shade]
        for y in range(1, h): px[w - 1, y] = PAL[shade]
    if corner:
        for (x, y) in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]: px[x, y] = PAL['.']
    return im

STATES = ['normal', 'hover', 'pressed', 'disabled']

def btn_frame(w, h, theme, state):
    b, f, i, s = THEMES[theme]
    if state == 'normal': return box(w, h, b, f, i, s), 'W', 0
    if state == 'hover': return box(w, h, 'a', 'P', 'p', 'd'), 'a', 0
    if state == 'pressed': return box(w, h, 'a', 'q', 'K', None), 'W', 1
    return box(w, h, 'P', 'K', 'q', None), 'g', 0

def labeled(w, h, label, theme='mag', icon=None, k=1):
    frames = []
    for st in STATES:
        im, tc, off = btn_frame(w, h, theme, st)
        t = text(label, tc, k)
        ic = None
        if icon is not None:
            ic = icon if st != 'disabled' else alpha(icon, .45)
        total = t.width + (ic.width + 4 if ic else 0)
        x = (w - total) // 2
        if icon is not None and w <= 128 and total > w - 8: x = 6
        y = (h - t.height) // 2 + off
        if ic: im.alpha_composite(ic, (x, (h - ic.height) // 2 + off)); x += ic.width + 4
        im.alpha_composite(t, (x, y))
        frames.append(im)
    return strip(frames)

def icon_btn(glyph, theme='mag'):
    frames = []
    for st in STATES:
        im, tc, off = btn_frame(32, 32, theme, st)
        g = glyph if st != 'disabled' else alpha(glyph, .45)
        im.alpha_composite(g, ((32 - g.width) // 2, (32 - g.height) // 2 + off)); frames.append(im)
    return strip(frames)

# ---- glifos dos botoes de icone (14x14 antes do contorno) ----
def g_gear():
    c = Cv(); c.ell(2, 2, 11, 11, 'W')
    for (x0, y0, x1, y1) in [(5, 0, 8, 2), (5, 11, 8, 13), (0, 5, 2, 8), (11, 5, 13, 8)]: c.rect(x0, y0, x1, y1, 'W')
    for (x, y) in [(2, 2), (10, 2), (2, 10), (10, 10)]: c.rect(x, y, x + 1, y + 1, 'W')
    c.ell(5, 5, 8, 8, '.'); return c.out()
def g_speaker(on=True):
    c = Cv(); c.rect(0, 5, 2, 8, 'W'); c.poly([(3, 5), (7, 1), (7, 12), (3, 8)], 'W')
    if on:
        c.pts([(9, 5), (10, 6), (10, 7), (9, 8)], 'c'); c.pts([(11, 3), (12, 4), (12, 5), (12, 6), (12, 7), (12, 8), (12, 9), (11, 10)], 'c')
    else:
        for i in range(5): c.p(9 + i, 4 + i, 'm'); c.p(9 + i, 8 - i, 'm')
    return c.out()
def g_pause():
    c = Cv(); c.rect(2, 1, 5, 12, 'W'); c.rect(8, 1, 11, 12, 'W'); return c.out()
def g_menu():
    c = Cv()
    for y in (2, 6, 10): c.rect(0, y, 13, y + 1, 'W')
    return c.out()
def g_close():
    return cross()
def g_back():
    c = Cv(); c.poly([(0, 6), (6, 0), (6, 4), (13, 4), (13, 9), (6, 9), (6, 13)], 'W'); return c.out()
def g_info():
    return outline(text('i', 'c', 2), 'K')
def g_help():
    return outline(text('?', 'a', 2), 'K')
def g_map():
    c = Cv(); c.rect(0, 2, 13, 12, 'W'); c.rect(4, 2, 4, 12, 'g'); c.rect(9, 2, 9, 12, 'g'); c.pts([(2, 5), (6, 8), (11, 5), (11, 9)], 'm'); return c.out()

def run():
    out = []
    # ---- caixas 9-slice ----
    dlg = box(24, 24, 'm', 'K', 'P', 'M'); out.append(save(dlg, '01_ui/caixas/dialogo_caixa_9slice_24x24.png', note='9-slice, corte 8px'))
    save(box(24, 24, 'c', 'K', 'T', 'C'), '01_ui/caixas/retrato_moldura_9slice_24x24.png', note='9-slice, corte 8px')
    save(box(16, 16, 'm', 'M', None, 'N'), '01_ui/caixas/nome_etiqueta_9slice_16x16.png', note='9-slice, corte 4px (etiqueta do nome, ex: MAYA)')
    save(box(24, 24, 'p', 'q', 'P', None), '01_ui/caixas/painel_generico_9slice_24x24.png', note='9-slice, corte 8px')
    save(box(24, 24, 'a', 'K', 'd', 'd'), '01_ui/caixas/painel_destaque_9slice_24x24.png', note='9-slice, corte 8px')
    # opcoes do quiz
    q = [box(24, 24, 'P', 'q', None, None), box(24, 24, 'c', 'P', 'p', 'C'), box(24, 24, 'c', 'T', 'C', 'K'), box(24, 24, 'm', 'N', 'M', 'K')]
    save(strip(q), '01_ui/caixas/quiz_opcao_9slice_24x24_4f.png', frames=4, note='frames: normal, selecionada, correta, errada (9-slice, corte 8px)')
    # letras A-D do quiz
    ls = []
    for ch in 'ABCD':
        b = box(16, 16, 'a', 'K', 'd', 'd'); t = text(ch, 'a'); b.alpha_composite(t, ((16 - t.width) // 2, (16 - t.height) // 2)); ls.append(b)
    save(strip(ls), '01_ui/caixas/quiz_letras_ABCD_16x16_4f.png', frames=4)
    # setas
    save(strip([seta_baixo(), shift(seta_baixo(), 0, 1)]), '01_ui/cursores/dialogo_seta_continuar_8x8_2f.png', frames=2, note='seta de avancar dialogo (pisca/desce)')
    save(strip([cursor_seta(), shift(cursor_seta(), 1, 0)]), '01_ui/cursores/cursor_escolha_8x8_2f.png', frames=2, note='cursor das opcoes de dialogo')
    save(mouse_ptr(), '01_ui/cursores/mouse_ponteiro_12x14.png')
    # exemplo composto de dialogo (para conferir proporcao)
    ex = new(320, 88)
    ex.alpha_composite(scale9(box(24, 24, 'c', 'K', 'T', 'C'), 8, 64, 64), (8, 8))
    ex.alpha_composite(scale9(dlg, 8, 232, 64), (80, 8))
    ex.alpha_composite(scale9(box(16, 16, 'm', 'M', None, 'N'), 4, 56, 16), (92, 0))
    ex.alpha_composite(text('MAYA', 'W'), (100, 4))
    ex.alpha_composite(text('Parece que alguem acessou', 'W'), (92, 26)); ex.alpha_composite(text('o sistema... Mas como?', 'W'), (92, 40))
    ex.alpha_composite(shift(seta_baixo(), 0, 0), (300, 60))
    ex.alpha_composite(icon_silhouette(), (24, 24))
    save(ex, '01_ui/caixas/EXEMPLO_dialogo_montado_320x88.png', note='exemplo de como montar a caixa (so referencia)')

    # ---- botoes ----
    lab = {'jogar': 'JOGAR', 'continuar': 'CONTINUAR', 'voltar': 'VOLTAR', 'reiniciar': 'REINICIAR', 'creditos': 'CRÉDITOS', 'opcoes': 'OPÇÕES', 'sair': 'SAIR'}
    for k, v in lab.items():
        save(labeled(96, 32, v), f'01_ui/botoes/btn_{k}_96x32_4f.png', frames=4, note='frames: normal, hover, pressed, disabled')
    save(labeled(96, 32, '', 'mag'), '01_ui/botoes/btn_vazio_96x32_4f.png', frames=4, note='base sem texto (use texto do Phaser)')
    save(labeled(128, 40, '', 'mag'), '01_ui/botoes/btn_vazio_128x40_4f.png', frames=4, note='base grande sem texto')
    for k, v in {'iniciar_missao': 'INICIAR MISSÃO', 'proxima_fase': 'PRÓXIMA FASE', 'tentar_de_novo': 'TENTAR DE NOVO'}.items():
        save(labeled(128, 40, v, 'cyan' if k != 'tentar_de_novo' else 'mag'), f'01_ui/botoes/btn_{k}_128x40_4f.png', frames=4, note='frames: normal, hover, pressed, disabled')
    # botoes do menu de batalha
    bat = [('analisar', 'ANALISAR', lupa()), ('defender', 'DEFENDER', shield('c')), ('item', 'ITEM', mochila()), ('denunciar', 'DENUNCIAR', flag())]
    for k, v, ic in bat:
        save(labeled(112, 32, v, 'mag', ic), f'02_batalha/menu/btn_{k}_112x32_4f.png', frames=4, note='frames: normal, hover, pressed, disabled')
    # decisoes das fases 2 e 3
    save(labeled(96, 32, 'GOLPE', 'mag', cross()), '05_fase2_golpe/btn_golpe_96x32_4f.png', frames=4)
    save(labeled(96, 32, 'SEGURO', 'cyan', check()), '05_fase2_golpe/btn_seguro_96x32_4f.png', frames=4)
    save(labeled(96, 32, 'ACEITAR', 'cyan', check()), '06_fase3_dados/btn_aceitar_96x32_4f.png', frames=4)
    save(labeled(96, 32, 'NEGAR', 'mag', cross()), '06_fase3_dados/btn_negar_96x32_4f.png', frames=4)
    # botoes de icone
    for k, g, th in [('config', g_gear(), 'mag'), ('som_ligado', g_speaker(True), 'mag'), ('som_mudo', g_speaker(False), 'mag'), ('pausa', g_pause(), 'mag'), ('menu', g_menu(), 'mag'),
                     ('fechar', g_close(), 'mag'), ('voltar', g_back(), 'mag'), ('info', g_info(), 'cyan'), ('ajuda', g_help(), 'cyan'), ('mapa', g_map(), 'cyan')]:
        save(icon_btn(g, th), f'01_ui/botoes/btn_icone_{k}_32x32_4f.png', frames=4, note='frames: normal, hover, pressed, disabled')
    # ---- barras ----
    fr = box(128, 16, 'W', 'K', None, None); d = ImageDraw.Draw(fr); rect(d, (3, 3, 124, 12), fill='q'); rect(d, (3, 3, 124, 12), outline_='P')
    save(fr, '01_ui/barras/barra_frame_128x16.png', note='moldura; area interna 120x8 em (4,4)')
    fr2 = fr.copy(); px = fr2.load()
    for pct in (66, 33):
        x = 4 + int(120 * pct / 100)
        for y in range(3, 13): px[x, y] = PAL['a']
    save(fr2, '01_ui/barras/barra_frame_marcas_66_33_128x16.png', note='moldura com marcas dos gatilhos de quiz (66% e 33%)')
    for nome, (hi, mid, lo) in {'ameaca': ('m', 'M', 'N'), 'vida': ('c', 'C', 'T'), 'tempo': ('a', 'A', 'd'), 'alerta': ('r', 'r', 'R')}.items():
        f = new(120, 8); dd = ImageDraw.Draw(f); rect(dd, (0, 0, 119, 7), fill=mid); rect(dd, (0, 0, 119, 1), fill=hi); rect(dd, (0, 6, 119, 7), fill=lo)
        pf = f.load()
        for x in range(0, 120, 8): pf[x, 3] = PAL[lo]; pf[x, 4] = PAL[lo]
        save(f, f'01_ui/barras/barra_preenchimento_{nome}_120x8.png', note='recorte com setCrop() conforme a porcentagem')
    # HP do jogador (pips)
    pips = [heart(True), heart(False)]
    save(strip(pips), '01_ui/barras/hp_coracao_16x16_2f.png', frames=2, note='cheio, vazio')
    sp = []
    for n in range(6):
        im = new(96, 16); h = box(96, 16, 'W', 'K', None, None)
        im.alpha_composite(h)
        for i in range(5): im.alpha_composite(Image.new('RGBA', (14, 8), PAL['c' if i < n else 'P']), (4 + i * 18, 4)) if True else None
        sp.append(im)
    save(strip(sp), '01_ui/barras/forca_senha_96x16_6f.png', frames=6, note='medidor de forca da senha: 0 a 5 segmentos')
    # icones
    allic = {**ICONS_UI}
    for k, v in allic.items():
        save(v, f'01_ui/icones/{k}_16x16.png')

def icon_silhouette():
    r = ["....KKKK....", "..KKPPPPKK..", ".KPPPPPPPPK.", ".KPPPPPPPPK.", ".KPPPPPPPPK.", "..KPPPPPPK..", "...KKPPKK...", "..KPPPPPPK..", ".KPPPPPPPPK.", "KPPPPPPPPPPK"]
    return outline(art([x.replace('K', 'p') for x in r]), 'K')

def scale9(src, c, w, h):
    """9-slice manual (corte c) para montar exemplos"""
    sw, sh = src.size; out = new(w, h)
    parts = lambda box_: src.crop(box_)
    out.paste(parts((0, 0, c, c)), (0, 0)); out.paste(parts((sw - c, 0, sw, c)), (w - c, 0))
    out.paste(parts((0, sh - c, c, sh)), (0, h - c)); out.paste(parts((sw - c, sh - c, sw, sh)), (w - c, h - c))
    out.paste(parts((c, 0, sw - c, c)).resize((w - 2 * c, c), Image.NEAREST), (c, 0))
    out.paste(parts((c, sh - c, sw - c, sh)).resize((w - 2 * c, c), Image.NEAREST), (c, h - c))
    out.paste(parts((0, c, c, sh - c)).resize((c, h - 2 * c), Image.NEAREST), (0, c))
    out.paste(parts((sw - c, c, sw, sh - c)).resize((c, h - 2 * c), Image.NEAREST), (w - c, c))
    out.paste(parts((c, c, sw - c, sh - c)).resize((w - 2 * c, h - 2 * c), Image.NEAREST), (c, c))
    return out

if __name__ == '__main__':
    run(); write_manifest()
    import glob
    fs = sorted(os.path.relpath(p, OUT) for p in glob.glob(OUT + '/01_ui/**/*.png', recursive=True))
    print(len(fs)); print(sheet_preview([f for f in fs if 'botoes' in f][:24], 'ui_botoes.png', cols=3, k=2))
    print(sheet_preview([f for f in fs if 'caixas' in f or 'barras' in f or 'cursores' in f], 'ui_caixas.png', cols=2, k=2))
