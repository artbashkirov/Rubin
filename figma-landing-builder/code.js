/**
 * RUBIN Landing — сборка артборда 1728 из компонентов страницы «DS · RUBIN components».
 * Содержание секций: docs/RUBIN-LANDING-BLOCKS.md §5 (колонка v1, 17 секций).
 * Атомы ставятся инстансами DS; секции — обычные авто-лейауты поверх них.
 */
(async function main() {
  var available = await figma.listAvailableFontsAsync();
  var byFamily = {};
  available.forEach(function (f) {
    if (!byFamily[f.fontName.family]) byFamily[f.fontName.family] = [];
    byFamily[f.fontName.family].push(f.fontName.style);
  });

  function normStyle(s) { return String(s).toLowerCase().replace(/[\s\-_]+/g, ""); }
  function famTokens(fam) { return String(fam).toLowerCase().split(/[^a-z]+/).filter(Boolean); }

  // Трильные версии Algorytm регистрируются по-разному: одним семейством со
  // стилями (Medium/Bold/…) либо отдельным семейством на начертание. Ловим оба.
  function algorytmFamilies() {
    var std = [], mono = [];
    Object.keys(byFamily).forEach(function (fam) {
      if (!/algor/i.test(fam)) return;
      if (/mono/i.test(fam)) mono.push(fam);
      else if (!/(clear|flip|soft|sport)/i.test(fam)) std.push(fam);
    });
    return { std: std, mono: mono };
  }

  async function loadFN(fam, style) {
    var fn = { family: fam, style: style };
    await figma.loadFontAsync(fn);
    return fn;
  }

  async function pickWeight(fams, chain) {
    if (!fams || !fams.length) return null;
    for (var w = 0; w < chain.length; w++) {
      var want = normStyle(chain[w]);
      for (var i = 0; i < fams.length; i++) {
        var styles = byFamily[fams[i]] || [];
        for (var j = 0; j < styles.length; j++) {
          if (normStyle(styles[j]).indexOf("italic") !== -1) continue;
          if (normStyle(styles[j]) === want) return await loadFN(fams[i], styles[j]);
        }
      }
      for (var k = 0; k < fams.length; k++) {
        if (famTokens(fams[k]).indexOf(chain[w].toLowerCase()) === -1) continue;
        var st = byFamily[fams[k]] || [], chosen = null;
        for (var m = 0; m < st.length; m++) {
          if (normStyle(st[m]).indexOf("italic") === -1) { chosen = st[m]; if (normStyle(st[m]) === "regular") break; }
        }
        if (chosen) return await loadFN(fams[k], chosen);
      }
    }
    for (var p = 0; p < fams.length; p++) {
      var s2 = byFamily[fams[p]] || [];
      for (var q = 0; q < s2.length; q++) { if (normStyle(s2[q]).indexOf("italic") === -1) return await loadFN(fams[p], s2[q]); }
    }
    return null;
  }

  async function pickFallback(candidates, styles) {
    for (var i = 0; i < candidates.length; i++) {
      var fam = candidates[i];
      if (!byFamily[fam]) continue;
      for (var j = 0; j < styles.length; j++) {
        if (byFamily[fam].indexOf(styles[j]) !== -1) return await loadFN(fam, styles[j]);
      }
      return await loadFN(fam, byFamily[fam][0]);
    }
    var fb = { family: "Inter", style: "Regular" };
    await figma.loadFontAsync(fb);
    return fb;
  }

  var alg = algorytmFamilies();
  var fMedium, fMono, fMonoBold;
  if (alg.std.length) {
    fMedium = await pickWeight(alg.std, ["Medium", "Regular", "Semibold", "Bold"]);
  } else {
    figma.notify("Algorytm (Standard) не установлен — макет собран запасным шрифтом", { timeout: 8000 });
    fMedium = await pickFallback(["Inter"], ["Medium", "Regular"]);
  }
  if (alg.mono.length) {
    fMono = await pickWeight(alg.mono, ["Medium", "Regular", "Semibold", "Bold"]);
    fMonoBold = await pickWeight(alg.mono, ["Bold", "Semibold", "Medium"]);
  } else {
    figma.notify("Algorytm Mono не установлен — RUBIN набран запасным шрифтом", { timeout: 8000 });
    fMono = await pickFallback(["Roboto Mono", "Inter"], ["Medium", "Regular"]);
    fMonoBold = await pickFallback(["Roboto Mono", "Inter"], ["Bold", "SemiBold", "Medium"]);
  }

  // Заголовки и абзацы — Algorytm Medium (единое начертание по требованию).
  var fB = fMedium, fM = fMedium;

  function hex(h) {
    h = h.replace("#", "");
    return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 };
  }
  function solid(c, a) {
    var p = { type: "SOLID", color: { r: c.r, g: c.g, b: c.b } };
    if (a !== undefined) p.opacity = a;
    return p;
  }

  var C = {
    white: hex("FFFFFF"),
    offBlack: hex("0A0A0A"),
    sand: hex("F6F5F4"),
    mediaGray: hex("E4E4E4"),
    muted: hex("666666"),
  };

  var W = 1728;
  var PAD_X = 64;
  var CW = W - PAD_X * 2;
  var PAD_Y = 120;

  function F(name, o) {
    o = o || {};
    var f = figma.createFrame();
    f.name = name;
    f.clipsContent = false;
    var mode = o.dir || "VERTICAL";
    f.layoutMode = mode;
    if (mode !== "NONE") {
      f.itemSpacing = o.gap || 0;
      f.paddingTop = o.pt || 0;
      f.paddingRight = o.pr || 0;
      f.paddingBottom = o.pb || 0;
      f.paddingLeft = o.pl || 0;
    }
    f.fills = o.fills !== undefined ? o.fills : [];
    if (o.r != null) f.cornerRadius = o.r;
    if (o.stroke) { f.strokes = [solid(o.stroke, o.strokeA)]; f.strokeWeight = o.strokeW || 1; f.strokeAlign = "INSIDE"; }
    if (o.parent) o.parent.appendChild(f);
    if (mode === "NONE") {
      if (o.w && o.h) f.resize(o.w, o.h);
      else if (o.w) f.resize(o.w, Math.max(f.height, 1));
      return f;
    }

    // resize() переводит обе оси auto-layout в FIXED, поэтому режимы размеров ставим только после него.
    var fixedH = !!(o.fixH && o.h);
    var hugW = !!o.hugW;
    if (o.w || fixedH) {
      f.resize(o.w || Math.max(f.width, 1), fixedH ? o.h : Math.max(f.height, 1));
    }
    // У VERTICAL главная ось — высота, у HORIZONTAL — ширина.
    if (mode === "VERTICAL") {
      f.counterAxisSizingMode = hugW ? "AUTO" : "FIXED";
      f.primaryAxisSizingMode = fixedH ? "FIXED" : "AUTO";
    } else {
      f.primaryAxisSizingMode = hugW || !o.w ? "AUTO" : "FIXED";
      f.counterAxisSizingMode = fixedH ? "FIXED" : "AUTO";
    }
    if (o.align) f.primaryAxisAlignItems = o.align;
    if (o.cross) f.counterAxisAlignItems = o.cross;

    if (o.parent && o.parent.layoutMode === "HORIZONTAL") {
      // FILL и FIXED по горизонтали взаимоисключающи: если задать их вместе,
      // первый ребёнок забирает весь ряд, остальные схлопываются в ноль
      if (o.grow) {
        if ("layoutSizingHorizontal" in f) f.layoutSizingHorizontal = "FILL";
        else f.layoutGrow = 1;
      } else {
        if ("layoutSizingHorizontal" in f) f.layoutSizingHorizontal = hugW ? "HUG" : (o.w ? "FIXED" : "HUG");
        f.layoutGrow = 0;
      }
      if ("layoutSizingVertical" in f) f.layoutSizingVertical = fixedH ? "FIXED" : "HUG";
    } else if (o.parent && o.parent.layoutMode === "VERTICAL" && !hugW && o.w) {
      f.layoutAlign = "STRETCH";
    }
    return f;
  }

  // Бренд RUBIN: капсим упоминания и красим диапазон моноширинным начертанием.
  // Вес моно наследует контекст (по умолчанию Medium), логотип задаёт свой явно.
  function brandify(node, monoFont) {
    var up = node.characters.replace(/rubin/gi, "RUBIN");
    if (up !== node.characters) node.characters = up;
    var re = /RUBIN/g, m;
    while ((m = re.exec(node.characters))) { try { node.setRangeFontName(m.index, m.index + 5, monoFont); } catch (e) {} }
    return node;
  }

  function T(parent, chars, o) {
    o = o || {};
    var t = figma.createText();
    t.fontName = o.font || (o.w >= 500 ? fM : fB);
    t.characters = chars;
    t.fontSize = o.s || 16;
    t.fills = [solid(o.c || C.offBlack, o.a)];
    // Процент от кегля, а не пиксели: коэффициенты шкалы (1.1 / 1.4) в пикселях дают дроби
    if (o.lh) t.lineHeight = { unit: "PERCENT", value: Math.round((o.lh / (o.s || 16)) * 10000) / 100 };
    if (o.ls) t.letterSpacing = { unit: "PIXELS", value: o.ls };
    if (o.align) t.textAlignHorizontal = o.align;
    parent.appendChild(t);
    if (o.brand !== false) brandify(t, o.monoFont || fMono);
    if (o.wdt) { t.textAutoResize = "HEIGHT"; t.resize(o.wdt, t.height); }
    else if (parent.layoutMode === "VERTICAL") { try { t.layoutAlign = "STRETCH"; t.textAutoResize = "HEIGHT"; } catch (e) {} }
    return t;
  }

  /**
   * Выравнивает высоту карточек в ряду. Ряд нельзя оставить hug и одновременно
   * растянуть все карточки — высоту будет не от чего считать, и ряд схлопнется.
   * Поэтому сначала измеряем самую высокую, фиксируем ряд, а потом растягиваем остальные.
   */
  function equalizeRow(row) {
    var maxH = 0;
    row.children.forEach(function (ch) { if (ch.height > maxH) maxH = ch.height; });
    if (maxH <= 1) return row;
    try {
      row.resize(row.width, maxH);
      row.counterAxisSizingMode = "FIXED";
      row.children.forEach(function (ch) {
        if ("layoutSizingVertical" in ch) ch.layoutSizingVertical = "FILL";
        else ch.layoutAlign = "STRETCH";
      });
    } catch (e) {}
    return row;
  }

  function GRAY(parent, w, h, r, caption) {
    var g = F("media", { parent: parent, w: w, h: h, fixH: true, r: r == null ? 24 : r, fills: [solid(C.mediaGray)], align: "CENTER", cross: "CENTER", pl: 24, pr: 24 });
    if (caption) T(g, caption, { s: 14, c: C.muted, align: "CENTER", wdt: Math.min(w - 48, 520) });
    return g;
  }

  // ——— DS: индекс компонентов и инстансы ———————————————————————————

  var DS_PAGE = "DS · RUBIN components";

  async function buildComponentIndex() {
    await figma.loadAllPagesAsync();
    var idx = {};
    var canonical = null;
    var otherPages = [];
    figma.root.children.forEach(function (pg) {
      if (pg.name === DS_PAGE) canonical = pg;
      else if (pg.name.indexOf("DS ·") === 0) otherPages.push(pg.name);
    });
    // Читаем только каноническую страницу: старые страницы «DS · …» с прошлых
    // прогонов остаются в файле, и инстансы молча собирались бы из них.
    var scan = canonical ? [canonical] : [];
    scan.forEach(function (pg) {
      var found = pg.findAllWithCriteria({ types: ["COMPONENT_SET", "COMPONENT"] });
      found.forEach(function (n) {
        if (n.type === "COMPONENT" && n.parent && n.parent.type === "COMPONENT_SET") return;
        if (!idx[n.name]) idx[n.name] = n;
      });
    });
    return { index: idx, pages: scan.length, ignored: otherPages };
  }

  var DS = {};
  var missing = [];

  // «Variant=Primary, Size=Large, State=Default» → { Variant: "Primary", … }
  function parseVariant(str) {
    var out = {};
    String(str).split(",").forEach(function (part) {
      var kv = part.split("=");
      if (kv.length === 2) out[kv[0].trim()] = kv[1].trim();
    });
    return out;
  }

  function instance(name, variantName) {
    var node = DS[name];
    if (!node) {
      if (missing.indexOf(name) === -1) missing.push(name);
      return null;
    }
    if (node.type === "COMPONENT_SET") {
      var target = null;
      if (variantName) {
        // Сравниваем свойства, а не строку имени: Figma переставляет свойства
        // местами, и точное совпадение по имени молча даёт вариант по умолчанию.
        var want = parseVariant(variantName);
        node.children.forEach(function (ch) {
          if (target) return;
          var props = ch.variantProperties || parseVariant(ch.name);
          var ok = true;
          for (var k in want) {
            if (want[k] !== props[k]) { ok = false; break; }
          }
          if (ok) target = ch;
        });
      }
      if (!target && variantName) {
        var label = name + " · " + variantName;
        if (missing.indexOf(label) === -1) missing.push(label);
      }
      if (!target) target = node.defaultVariant || node.children[0];
      return target ? target.createInstance() : null;
    }
    return node.createInstance();
  }

  // Large (h 56) — размер кнопок на всей странице; в закреплённой шапке остаётся Header
  var BTN_PRIMARY = "Variant=Primary, Size=Large, State=Default";
  var BTN_SOFT = "Variant=Soft, Size=Large, State=Default";

  async function setTexts(inst, values) {
    if (!inst) return;
    var texts = inst.findAll(function (n) { return n.type === "TEXT"; });
    for (var i = 0; i < texts.length && i < values.length; i++) {
      if (values[i] == null) continue;
      var fn = texts[i].fontName;
      if (fn === figma.mixed) continue;
      await figma.loadFontAsync(fn);
      texts[i].characters = values[i];
      brandify(texts[i], fMono);
    }
  }

  async function place(parent, name, values, opts) {
    opts = opts || {};
    var inst = instance(name, opts.variant);
    if (!inst) return null;
    parent.appendChild(inst);
    if (values) await setTexts(inst, values);
    try {
      if (parent.layoutMode === "HORIZONTAL") {
        if (opts.grow || opts.fill) {
          if ("layoutSizingHorizontal" in inst) inst.layoutSizingHorizontal = "FILL";
          else inst.layoutGrow = 1;
        } else {
          inst.layoutGrow = 0;
        }
      } else if (parent.layoutMode === "VERTICAL" && opts.fill) {
        inst.layoutAlign = "STRETCH";
      }
    } catch (e) {}
    return inst;
  }

  // ——— Секции ————————————————————————————————————————————————————

  function section(root, name, o) {
    o = o || {};
    return F(name, {
      parent: root,
      w: W,
      gap: o.gap == null ? 48 : o.gap,
      pt: o.pt == null ? PAD_Y : o.pt,
      pb: o.pb == null ? PAD_Y : o.pb,
      pl: PAD_X,
      pr: PAD_X,
      fills: [solid(o.bg || C.white)],
      align: o.align,
      cross: o.cross,
    });
  }

  function h2(parent, text, o) {
    o = o || {};
    return T(parent, text, { s: 48, lh: 52, ls: -0.96, font: fM, align: o.align, wdt: o.wdt || 900 });
  }

  function lead(parent, text, o) {
    o = o || {};
    return T(parent, text, { s: 24, lh: 28.8, c: C.offBlack, align: o.align, wdt: o.wdt || 720 });
  }

  function kicker(parent, text, o) {
    o = o || {};
    return T(parent, text, { s: 12, lh: 16, ls: 1.6, c: C.muted, font: fM, align: o.align });
  }

  function cardGrid(parent, items, cols, o) {
    o = o || {};
    var gap = o.gap == null ? 18 : o.gap;
    var colW = Math.floor((CW - gap * (cols - 1)) / cols);
    var rows = [];
    var grid = F("grid", { parent: parent, w: CW, gap: gap });
    for (var i = 0; i < items.length; i += cols) {
      var r = F("row", { parent: grid, w: CW, dir: "HORIZONTAL", gap: gap });
      rows.push(r);
      for (var j = i; j < i + cols && j < items.length; j++) {
        var it = items[j];
        var card = F("card", { parent: r, w: colW, gap: 12, pt: 32, pr: 32, pb: 32, pl: 32, r: 16, fills: [solid(o.bg || C.sand)] });
        T(card, it[0], { s: 24, lh: 28.8, font: fM, wdt: colW - 64 });
        if (it[1]) T(card, it[1], { s: 16, lh: 22.4, c: C.offBlack, wdt: colW - 64 });
      }
      equalizeRow(r);
    }
    return grid;
  }

  async function checkList(parent, width, items) {
    var list = F("list", { parent: parent, w: width, gap: 10 });
    for (var i = 0; i < items.length; i++) {
      await place(list, "List / Check Item", [null, items[i]]);
    }
    return list;
  }

  async function pills(parent, labels) {
    var wrap = F("tabs", { parent: parent, dir: "HORIZONTAL", gap: 8, hugW: true, cross: "CENTER" });
    for (var i = 0; i < labels.length; i++) {
      await place(wrap, "Button", [labels[i]], { variant: i === 0 ? BTN_PRIMARY : BTN_SOFT });
    }
    return wrap;
  }

  async function actions(parent, primary, secondary, center) {
    var wrap = F("actions", { parent: parent, dir: "HORIZONTAL", gap: 12, hugW: true, cross: "CENTER" });
    if (center) wrap.layoutAlign = "CENTER";
    await place(wrap, "Button", [primary], { variant: BTN_PRIMARY });
    if (secondary) await place(wrap, "Button", [secondary], { variant: BTN_SOFT });
    return wrap;
  }

  /** Плитка как Card / Service Tile: soft или тёмный CTA. */
  function serviceTile(parent, label, opts) {
    opts = opts || {};
    var dark = !!opts.dark;
    var tile = F(dark ? "Card / Service Tile · CTA" : "Card / Service Tile · Soft", {
      parent: parent,
      w: opts.w,
      h: 104,
      fixH: true,
      pt: 20,
      pr: 24,
      pb: 20,
      pl: 24,
      r: 24,
      gap: 26,
      fills: [solid(C.offBlack, dark ? 1 : 0.05)],
      align: "SPACE_BETWEEN",
    });
    tile.resize(opts.w, 104);
    T(tile, dark ? "→" : "✓", { s: 18, c: dark ? C.white : C.offBlack });
    T(tile, label, { s: 16, lh: 22.4, c: dark ? C.white : C.offBlack, font: fB, wdt: opts.w - 48 });
    return tile;
  }

  /**
   * Split: медиа слева + сетка плиток 2 колонки справа.
   * ctaLabel — опционально; если есть, последняя плитка тёмная.
   */
  function mediaTilesSplit(parent, caption, softLabels, ctaLabel) {
    var gap = 48;
    var mediaW = Math.floor((CW - gap) / 2);
    var gridW = CW - gap - mediaW;
    var tileGap = 12;
    var tileW = Math.floor((gridW - tileGap) / 2);
    var labels = ctaLabel ? softLabels.concat([ctaLabel]) : softLabels.slice();
    var rowsN = Math.ceil(labels.length / 2);
    var mediaH = 104 * rowsN + tileGap * (rowsN - 1);
    var split = F("split", { parent: parent, w: CW, dir: "HORIZONTAL", gap: gap, cross: "MIN" });
    GRAY(split, mediaW, mediaH, 24, caption);
    var grid = F("tiles", { parent: split, w: gridW, gap: tileGap });
    for (var j = 0; j < labels.length; j += 2) {
      var r = F("row", { parent: grid, w: gridW, dir: "HORIZONTAL", gap: tileGap });
      serviceTile(r, labels[j], { w: tileW, dark: !!(ctaLabel && j === labels.length - 1) });
      if (j + 1 < labels.length) {
        serviceTile(r, labels[j + 1], { w: tileW, dark: !!(ctaLabel && j + 1 === labels.length - 1) });
      }
    }
    return split;
  }

  async function buildLanding(root) {
    // 01 · Nav
    var nav = F("00 Nav", { parent: root, w: W, h: 72, fixH: true, dir: "HORIZONTAL", align: "SPACE_BETWEEN", cross: "CENTER", pl: PAD_X, pr: PAD_X, fills: [solid(C.white)] });
    T(nav, "RUBIN", { s: 24, lh: 24, ls: 1.2, font: fMonoBold, brand: false });
    var navMid = F("mid", { parent: nav, dir: "HORIZONTAL", gap: 24, hugW: true, cross: "CENTER" });
    ["Продукт", "Биржа", "Прозрачность", "Новости", "Для новичков"].forEach(function (l) {
      T(navMid, l, { s: 14, lh: 19.6, c: C.offBlack, a: 0.7 });
    });
    var navActs = F("acts", { parent: nav, dir: "HORIZONTAL", gap: 8, hugW: true, cross: "CENTER" });
    T(navActs, "Документация", { s: 14, lh: 19.6, c: C.offBlack, a: 0.7 });
    await place(navActs, "Button", ["Начать торговлю"], { variant: "Variant=Primary, Size=Header, State=Default" });

    // 02 · Hero
    var hero = section(root, "01 Hero", { gap: 32, pt: 64, cross: "CENTER" });
    var HERO_H1 = "Торгуйте с плечом со своего кошелька";
    var HERO_LEAD = "Rubin — perp DEX-биржа на собственном L1. Топовые пары, плечо до 5x и пополнение в USDC — без лишних шагов и старой логики CEX.";
    var heroInst = await place(hero, "Section / Hero", [
      HERO_H1,
      HERO_LEAD,
      "Начать торговлю",
      "Как это работает",
      "Фото: девушка с ноутбуком в кафе (urban / tech)",
    ], { fill: true });
    if (!heroInst) {
      T(hero, HERO_H1, { s: 72, lh: 68, ls: -2.16, font: fM, align: "CENTER", wdt: 1100 });
      T(hero, HERO_LEAD, { s: 20, lh: 30, c: C.offBlack, align: "CENTER", wdt: 720 });
      await actions(hero, "Начать торговлю", "Как это работает", true);
      GRAY(hero, CW, Math.round(CW * 9 / 16), 24, "Фото: девушка с ноутбуком в кафе (urban / tech)");
    }

    // 03 · Что такое Rubin — только определение
    var what = section(root, "02 Что такое", { cross: "CENTER" });
    h2(what, "Что такое Rubin", { align: "CENTER", wdt: 900 });
    lead(what, "Rubin — собственный L1 (EVM, mainnet) и DEX бессрочных фьючерсов на нём. Не витрина поверх чужого движка: сеть, исполнение и расчёты принадлежат команде.", { align: "CENTER", wdt: 820 });
    GRAY(what, CW, 560, 24, "UI терминала перпов (общий вид)");

    // 04 · Основные свойства — выгоды трейдера (без повтора L1)
    var props = section(root, "03 Свойства", { bg: C.sand, cross: "CENTER" });
    h2(props, "Основные свойства", { align: "CENTER", wdt: 900 });
    lead(props, "Что важно, когда открываете позицию — без метрик, которых нет в источниках.", { align: "CENTER", wdt: 720 });
    cardGrid(props, [
      ["Перпы уже в работе", "BTC, ETH, HYPE и другие; long и short на одном экране"],
      ["Плечо и риск", "До 5x, кросс-маржа, market, limit, stop-loss, take-profit"],
      ["Общая ликвидность", "Один контур на всю сеть, а не десятки изолированных стаканов"],
      ["Простой вход", "WalletConnect или email; пополнение USDC, газ за депозит берёт платформа"],
      ["AI-агент", "Сделки через чат или голос; терминал остаётся"],
      ["Один контур", "То, что видно в терминале, и есть то, что исполняется в сети"],
    ], 3, { bg: C.white });

    // 04 · scheme / journey — снято с v1 (слишком базовый)

    // 05 · Биржа перпов — split: медиа + 6 плиток (как в макете)
    var perps = section(root, "05 Биржа перпов", { bg: C.sand });
    h2(perps, "Первый продукт — DEX бессрочных фьючерсов", { wdt: 1000 });
    lead(perps, "Пары, ордера и депозит уже в продукте — подключаете кошелёк или email и торгуете.", { wdt: 820 });
    mediaTilesSplit(perps, "Фото / UI: человек с продуктом", [
      "Топ-пары: BTC, ETH, HYPE…",
      "Кросс-маржа на счёт",
      "Газ за депозит берёт платформа",
      "USDC через Ethereum и Arbitrum",
      "Один стакан на всю сеть",
      "WalletConnect или email",
    ]);

    // 07 · Что можно делать
    var uses = section(root, "06 Что можно делать", { cross: "CENTER" });
    h2(uses, "Что можно делать на Rubin", { align: "CENTER", wdt: 900 });
    lead(uses, "Один счёт и один стакан — четыре разных способа работать с рынком.", { align: "CENTER", wdt: 720 });
    await pills(uses, ["Перпы с плечом", "Управление риском", "AI-агент", "Вход и пополнение"]);
    GRAY(uses, CW, Math.round(CW * 10 / 16), 24, "Интерфейс меняется по табу: терминал / панель риска / чат с агентом / экран пополнения");
    cardGrid(uses, [
      ["Перпы с плечом", "BTC, ETH, HYPE и другие пары; long и short на одном экране"],
      ["Управление риском", "Кросс-маржа, market и limit, стоп-лосс и тейк-профит"],
      ["Торговля через AI-агента", "Постановка и снятие ордеров в чате или голосом, в рамках заданных лимитов"],
      ["Вход и пополнение", "WalletConnect или email; USDC через Ethereum и Arbitrum"],
    ], 4);
    await actions(uses, "Начать торговлю");

    // 08 · Ресурсы и прозрачность
    var trans = section(root, "07 Прозрачность", { bg: C.sand });
    h2(trans, "Ресурсы и прозрачность", { wdt: 900 });
    lead(trans, "Показываем то, что уже можно проверить, и не выдумываем отчёты.", { wdt: 720 });
    cardGrid(trans, [
      ["Документация", "Как начать, ввод и вывод, работа с ордерами"],
      ["Проверка on-chain", "Сеть публичная и EVM-совместимая; ссылка на обозреватель — уточняется"],
      ["Публичный канал", "Анонсы и хроника продукта в Telegram"],
      ["Независимый разбор", "Материал DeCenter о стеке и инфраструктуре"],
    ], 2, { bg: C.white });
    T(trans, "Аудиты, on-chain-дашборды и рыночные виджеты — в работе; слот оставляем под будущие ссылки.", { s: 14, lh: 20, c: C.muted, wdt: 900 });
    await actions(trans, "Открыть документацию", "Читать DeCenter");

    // 08 · Кто стоит за Rubin
    var team = section(root, "07a Команда", { bg: C.sand });
    h2(team, "Кто стоит за Rubin", { wdt: 900 });
    lead(team, "Основатели и разработчики, ранее работавшие над крупными сервисами Яндекса, с многолетним опытом высоконагруженных систем. Вместе с ними над проектом работают специалисты в финтехе, банковской инфраструктуре и регулировании.", { wdt: 820 });
    GRAY(team, CW, Math.round(CW * 9 / 16), 24, "Фото: команда за работой");
    cardGrid(team, [
      ["Высокие нагрузки", "Опыт крупных сервисов Яндекса: нагрузка, отказоустойчивость, эксплуатация"],
      ["Финтех и банки", "Специалисты по банковской инфраструктуре и расчётам"],
      ["Регулирование", "Понимание требований к финансовым сервисам"],
    ], 3, { bg: C.white });

    // 09 · Независимые контуры
    var era = section(root, "08 Независимые контуры", { cross: "CENTER" });
    kicker(era, "НОВАЯ ЭПОХА ГЛОБАЛЬНЫХ РАСЧЁТОВ", { align: "CENTER" });
    h2(era, "Свои независимые контуры", { align: "CENTER", wdt: 900 });
    lead(era, "Когда доступ к продуктам зависит не от технологии, а от географии пользователя, зависимость от зарубежной инфраструктуры — уже не абстрактный риск. Rubin строит контур, которым команда владеет сама.", { align: "CENTER", wdt: 820 });
    GRAY(era, CW, 420, 24, "Карта: закрытый внешний контур против собственного контура Rubin");
    cardGrid(era, [
      ["Независимость стека", "Свой L1, движок и расчёты"],
      ["Контроль доступа", "Правила не диктует чужая платформа"],
      ["Открытый вход", "Кошелёк или email, без посредника между вами и рынком"],
      ["Долгий горизонт", "Биржа как первая точка, дальше — экосистема продуктов"],
    ], 4);

    // 10 · AI-агент
    var ai = section(root, "11 AI-агент", { bg: C.sand });
    h2(ai, "Торговля через AI-агента", { wdt: 900 });
    lead(ai, "Агент видит тот же рынок, что и вы: читает стакан и свечи, проверяет баланс и открытые позиции, ставит и снимает ордера. Терминал никуда не девается — просто рядом появляется чат.", { wdt: 820 });
    cardGrid(ai, [
      ["Рынок", "Спросить про цену, стакан и свечи словами, а не кликами"],
      ["Счёт", "Баланс, открытые позиции и заявки одной фразой"],
      ["Ордера", "Открыть, изменить и закрыть позицию из диалога"],
      ["Чат или голос", "С телефона, когда терминал под рукой не открыть"],
    ], 4, { bg: C.white });
    GRAY(ai, CW, Math.round(CW * 9 / 16), 24, "Чат с агентом и тот же стакан в терминале");
    var limits = F("limits", { parent: ai, w: CW, gap: 16, pt: 32, pr: 32, pb: 32, pl: 32, r: 16, fills: [solid(C.white)] });
    T(limits, "Границы риска задаёте вы", { s: 24, lh: 28.8, font: fM });
    await checkList(limits, CW - 64, [
      "Риск на одну сделку",
      "Дневной лимит убытка",
      "Разрешённые рынки и максимальное плечо",
      "Обязательный стоп-лосс",
      "Запрет бесконтрольного усреднения",
    ]);
    T(limits, "Порядок прав: только чтение → тестовый счёт с лимитом → боевой счёт.", { s: 15, lh: 21, c: C.offBlack, wdt: CW - 64 });
    await actions(ai, "Подключить агента", "Как настроить лимиты");

    // 11 · Регуляторный контекст
    var reg = section(root, "13 Регуляторика");
    h2(reg, "С 1 сентября 2026 правила меняются", { wdt: 1000 });
    lead(reg, "4 августа 2026 подписан закон «О цифровой валюте и цифровых правах»; основные положения — с 1 сентября 2026.", { wdt: 820 });
    await checkList(reg, CW, [
      "Крипта как имущество с судебной защитой",
      "Регулятор — Банк России",
      "Покупка через регулируемых посредников; для неквалифицированных инвесторов — тестирование и лимиты",
      "Переходный период для «серой» инфраструктуры до 1 июля 2027",
    ]);
    GRAY(reg, CW, 360, 24, "Таймлайн: 04.08 → 01.09 → 01.07.2027");
    T(reg, "Материал носит информационный характер и не является юридической консультацией.", { s: 14, lh: 20, c: C.muted, wdt: 900 });
    await actions(reg, "Читать канал");

    // 12 · Новости
    var news = section(root, "14 Новости", { bg: C.sand });
    h2(news, "Новости и хроника", { wdt: 900 });
    lead(news, "Публичные анонсы команды — без обещаний метрик, только то, что уже вышло.", { wdt: 720 });
    await place(news, "Timeline / Row 6", [
      "Апр 2026", "Бета perp DEX на своём L1; депозиты USDC",
      "Май 2026", "Email-вход; торговое соревнование",
      "Июн 2026", "Ребрендинг в Rubin; аккаунты и балансы на месте",
      "Июл 2026", "Зачем свой L1; AI-агент на бирже; реф-программа",
      "Июл 2026", "Материал DeCenter",
      "Авг 2026", "Новые сервисы на технологии Rubin",
    ], { fill: true });
    await actions(news, "Читать канал", "Материал DeCenter");

    // 13 · Как начать
    var get = section(root, "15 Как начать");
    h2(get, "Как начать", { wdt: 900 });
    lead(get, "Три входа в один продукт — без списка вымышленных бирж-партнёров.", { wdt: 720 });
    cardGrid(get, [
      ["Биржа", "Торговля перпами · домен уточняется"],
      ["Документация", "Как войти, пополнить счёт и открыть первую позицию"],
      ["Канал", "Анонсы, обновления и поддержка в Telegram"],
    ], 3);
    var resStrip = F("resources", { parent: get, w: CW, dir: "HORIZONTAL", gap: 12 });
    ["Документация", "Telegram", "DeCenter"].forEach(function (l) {
      var cell = F("cell", { parent: resStrip, w: Math.floor((CW - 24) / 3), h: 88, fixH: true, r: 16, fills: [solid(C.sand)], align: "CENTER", cross: "CENTER" });
      T(cell, l, { s: 16, lh: 22.4, font: fM, align: "CENTER" });
    });
    equalizeRow(resStrip);

    // 14 · Основной CTA
    var cta = section(root, "16 CTA", { cross: "CENTER" });
    h2(cta, "Начните с того, что вам ближе", { align: "CENTER", wdt: 900 });
    lead(cta, "Открыть первую позицию или сперва разобраться, как всё устроено.", { align: "CENTER", wdt: 720 });
    var ctaRow = F("cta-row", { parent: cta, w: CW, dir: "HORIZONTAL", gap: 18 });
    var ctaCards = [
      ["Уже торгуете", "Подключите кошелёк и откройте позицию.", "Начать торговлю", "Фото: трейдер с ноутбуком за рабочим столом"],
      ["Только присматриваетесь", "Разберитесь в перпах и рисках без спешки.", "Как это работает", "Фото: человек с телефоном изучает материалы"],
    ];
    for (var ci = 0; ci < ctaCards.length; ci++) {
      var cw2 = Math.floor((CW - 18) / 2);
      var cc = F("cta-card", { parent: ctaRow, w: cw2, gap: 16, pt: 48, pr: 48, pb: 48, pl: 48, r: 16, fills: [solid(C.sand)] });
      var cmW = cw2 - 96;
      GRAY(cc, cmW, Math.round(cmW * 9 / 16), 12, ctaCards[ci][3]);
      T(cc, ctaCards[ci][0], { s: 32, lh: 36, font: fM, wdt: cw2 - 96 });
      T(cc, ctaCards[ci][1], { s: 18, lh: 26, c: C.offBlack, wdt: cw2 - 96 });
      await place(cc, "Button", [ctaCards[ci][2]], { variant: BTN_PRIMARY });
    }
    equalizeRow(ctaRow);

    // 15 · Для новичков
    var beg = section(root, "17 Для новичков", { bg: C.sand, cross: "CENTER" });
    kicker(beg, "ЕСЛИ ВЫ ТОЛЬКО НАЧИНАЕТЕ", { align: "CENTER" });
    h2(beg, "DEX и бессрочные контракты простыми словами", { align: "CENTER", wdt: 1000 });
    lead(beg, "Минимум терминов, чтобы понять экран сделки. Торговля с плечом — риск полной потери средств; начинайте с суммы, которую готовы потерять.", { align: "CENTER", wdt: 820 });
    cardGrid(beg, [
      ["DEX", "Биржа, где сделка идёт с вашего кошелька, без хранения средств у посредника"],
      ["Перп", "Контракт на цену актива без срока истечения"],
      ["Long и short", "Ставка на рост или на падение цены"],
      ["Плечо и кросс-маржа", "Усиливают и прибыль, и убыток; стоп-лосс ограничивает потерю"],
    ], 4, { bg: C.white });
    GRAY(beg, CW, Math.round(CW * 9 / 16), 24, "Экран сделки с выносками: цена, размер, плечо, стоп");
    await actions(beg, "Как это работает", null, true);

    // 16 · FAQ
    var faq = section(root, "18 FAQ");
    h2(faq, "Частые вопросы", { wdt: 900 });
    var faqList = F("faq-list", { parent: faq, w: CW, gap: 0 });
    var faqItems = [
      ["Нужен ли кошелёк, чтобы начать?", "Можно подключить кошелёк через WalletConnect или войти по email."],
      ["Чем пополнять счёт?", "USDC в сетях Ethereum и Arbitrum; комиссию сети за депозит берёт платформа."],
      ["Чем DEX отличается от привычной биржи?", "Торговля идёт с вашего кошелька, средства не лежат у посредника."],
      ["Какие пары доступны?", "BTC, ETH, HYPE и другие; полный список уточняется."],
      ["Какое доступно плечо?", "До 5x на топовых парах."],
      ["А что с риском?", "Плечо усиливает убыток. Используйте стоп-лосс. Это не инвестиционная рекомендация."],
    ];
    for (var fi = 0; fi < faqItems.length; fi++) {
      await place(faqList, "Accordion / FAQ Row", [faqItems[fi][0], faqItems[fi][1]], { fill: true, variant: "State=Closed" });
    }

    // 17 · Три шага + футер
    var stepsSec = section(root, "19 Шаги", { bg: C.sand });
    h2(stepsSec, "С чего начать", { wdt: 900 });
    var stepsRow = F("steps-row", { parent: stepsSec, w: CW, dir: "HORIZONTAL", gap: 18 });
    var stepData = [
      ["Вход", "Подключите кошелёк или войдите по email."],
      ["Пополнение", "Переведите USDC в сети Ethereum или Arbitrum."],
      ["Первая позиция", "Выберите пару, размер и направление, поставьте стоп-лосс."],
    ];
    for (var si = 0; si < stepData.length; si++) {
      var st = await place(stepsRow, "Steps / Card", [String(si + 1), stepData[si][0], stepData[si][1]], { grow: 1, fill: true, variant: "Number=" + (si + 1) });
      if (!st) {
        var fallback = F("step", { parent: stepsRow, w: Math.floor((CW - 36) / 3), gap: 12, pt: 32, pr: 32, pb: 32, pl: 32, r: 16, fills: [solid(C.white)] });
        T(fallback, String(si + 1), { s: 18, font: fM });
        T(fallback, stepData[si][0], { s: 24, lh: 28.8, font: fM });
        T(fallback, stepData[si][1], { s: 16, lh: 22.4, c: C.offBlack });
      }
    }
    equalizeRow(stepsRow);
    var stepMedia = F("step-media", { parent: stepsSec, w: CW, dir: "HORIZONTAL", gap: 18 });
    ["Кошелёк / QR", "Пополнение", "Открытие позиции"].forEach(function (cap) {
      GRAY(stepMedia, Math.floor((CW - 36) / 3), 380, 24, cap);
    });
    equalizeRow(stepMedia);
    await actions(stepsSec, "Перейти на биржу", "Открыть документацию");

    var footer = section(root, "19 Футер", { pt: 80, pb: 48, gap: 48 });
    var footCols = F("cols", { parent: footer, w: CW, dir: "HORIZONTAL", gap: 80, align: "SPACE_BETWEEN" });
    [
      ["Продукт", ["Что такое", "Биржа", "AI-агент"]],
      ["Начать", ["Как начать", "Пополнение", "Первая позиция", "FAQ"]],
      ["Ресурсы", ["Документация", "Прозрачность", "DeCenter", "Telegram"]],
      ["Контакты", ["Поддержка"]],
    ].forEach(function (col) {
      var c = F("col", { parent: footCols, w: 240, gap: 12 });
      T(c, col[0], { s: 14, lh: 19.6, font: fM });
      col[1].forEach(function (l) { T(c, l, { s: 14, lh: 19.6, c: C.offBlack, a: 0.6 }); });
    });
    var legal = F("legal", { parent: footer, w: CW, gap: 8 });
    T(legal, "© 2026 RUBIN", { s: 13, lh: 18, c: C.muted });
    T(legal, "Не является инвестиционной рекомендацией и юридической консультацией. Торговля с плечом связана с риском полной потери средств.", { s: 13, lh: 18, c: C.muted, wdt: 900 });
  }

  // ——— Запуск —————————————————————————————————————————————————————

  var found = await buildComponentIndex();
  DS = found.index;
  if (!found.pages) {
    figma.notify("Не найдена страница «DS · RUBIN components». Сначала запустите плагин RUBIN DS.", { error: true, timeout: 8000 });
    figma.closePlugin();
    return;
  }
  if (found.ignored.length) {
    figma.notify("В файле есть старые страницы DS, они не используются: " + found.ignored.join(", ") + ". Их лучше удалить.", { timeout: 10000 });
  }

  var pageName = "RUBIN · Landing 1728";
  var page = null;
  figma.root.children.forEach(function (p) { if (p.name === pageName) page = p; });
  if (!page) page = figma.createPage();
  page.name = pageName;
  await figma.setCurrentPageAsync(page);
  page.children.slice().forEach(function (ch) { ch.remove(); });

  var root = F("RUBIN · Landing 1728", { parent: page, w: W, gap: 0, fills: [solid(C.white)] });
  root.x = 0;
  root.y = 0;
  root.clipsContent = false;

  await buildLanding(root);

  root.resize(W, root.height);
  figma.currentPage.selection = [root];
  figma.viewport.scrollAndZoomIntoView([root]);

  if (missing.length) {
    figma.notify("Собрано, но не найдены компоненты: " + missing.join(", "), { timeout: 10000 });
    console.warn("Missing DS components:", missing);
  } else {
    figma.notify("RUBIN · Landing 1728 — готово, 17 секций");
  }
  figma.closePlugin();
})().catch(function (err) {
  figma.notify("Ошибка: " + String(err), { error: true });
  console.error(err);
});
