/**
 * RUBIN Design System — Figma UI-kit builder.
 * Spec: docs/SANA-DESIGN-SYSTEM.md · Algorytm (Standard) + Algorytm Mono.
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
    figma.notify("Algorytm (Standard) не установлен — использую запасной шрифт", { timeout: 8000 });
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
  var fD = fMedium, fB = fMedium, fM = fMedium;

  function hex(h) {
    h = h.replace("#", "");
    return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 };
  }
  function solid(c, a) {
    if (!c || typeof c.r !== "number") c = hex("CCCCCC");
    var p = { type: "SOLID", color: { r: c.r, g: c.g, b: c.b } };
    if (a !== undefined) p.opacity = a;
    return p;
  }

  function pickTextFont(o) {
    o = o || {};
    if (o.font) return o.font;
    if (o.s >= 40) return fD;
    if (o.w >= 500) return fM;
    return fB;
  }

  function layoutChild(f, o) {
    if (!o.parent || o.parent.layoutMode === "NONE") return;
    try {
      if (o.parent.layoutMode === "VERTICAL") {
        if (!o.hugW && o.w) f.layoutAlign = "STRETCH";
        f.layoutGrow = 0;
        if ("layoutSizingVertical" in f) f.layoutSizingVertical = o.fixH && o.h ? "FIXED" : "HUG";
        if ("layoutSizingHorizontal" in f && !o.hugW && o.w) f.layoutSizingHorizontal = "FILL";
      }
      if (o.parent.layoutMode === "HORIZONTAL") {
        if ("layoutSizingVertical" in f) f.layoutSizingVertical = o.fixH && o.h ? "FIXED" : "HUG";
        // FILL и FIXED по горизонтали взаимоисключающи: если задать их вместе,
        // первый ребёнок забирает весь ряд, остальные схлопываются в ноль
        if (o.layoutGrow) {
          if ("layoutSizingHorizontal" in f) f.layoutSizingHorizontal = "FILL";
          else f.layoutGrow = 1;
        } else {
          if ("layoutSizingHorizontal" in f) f.layoutSizingHorizontal = o.hugW ? "HUG" : (o.w ? "FIXED" : "HUG");
          f.layoutGrow = 0;
        }
      }
    } catch (e) {}
  }

  function F(name, o) {
    o = o || {};
    var f = figma.createFrame();
    f.name = name;
    f.clipsContent = false;
    var mode = o.dir || "VERTICAL";
    f.layoutMode = mode;
    if (mode !== "NONE") {
      f.primaryAxisSizingMode = o.fixH ? "FIXED" : "AUTO";
      f.counterAxisSizingMode = o.hugW ? "AUTO" : "FIXED";
      f.itemSpacing = o.gap || 0;
      f.paddingTop = o.pt || 0; f.paddingRight = o.pr || 0; f.paddingBottom = o.pb || 0; f.paddingLeft = o.pl || 0;
      if (o.align) f.primaryAxisAlignItems = o.align;
      if (o.cross) f.counterAxisAlignItems = o.cross;
    }
    f.fills = o.fills !== undefined ? o.fills : [];
    if (o.r != null) f.cornerRadius = o.r;
    if (o.stroke) { f.strokes = [solid(o.stroke)]; f.strokeWeight = o.strokeW || 1; f.strokeAlign = "INSIDE"; }
    if (o.parent) o.parent.appendChild(f);
    if (mode !== "NONE") {
      if (o.fixH && o.h && o.w) {
        f.resize(o.w, o.h);
        f.primaryAxisSizingMode = "FIXED";
        f.counterAxisSizingMode = o.hugW ? "AUTO" : "FIXED";
      } else if (o.w) {
        f.resize(o.w, Math.max(f.height, 1));
        f.primaryAxisSizingMode = "AUTO";
        f.counterAxisSizingMode = o.hugW ? "AUTO" : "FIXED";
      }
      layoutChild(f, o);
    } else if (o.w && o.h) {
      f.resize(o.w, o.h);
    } else if (o.w) {
      f.resize(o.w, Math.max(f.height, 1));
    }
    return f;
  }

  // Интерлиньяж храним процентом от кегля: в шкале это коэффициенты
  // (1.1 / 1.2 / 1.4), и в пикселях они дают дроби вроде 22.4.
  function pctLH(lh, size) {
    return { unit: "PERCENT", value: Math.round((lh / (size || 16)) * 10000) / 100 };
  }

  function T(parent, chars, o) {
    o = o || {};
    var t = figma.createText();
    t.fontName = pickTextFont(o);
    t.characters = chars;
    t.fontSize = o.s || 16;
    t.fills = [solid(o.c)];
    if (o.lh) t.lineHeight = pctLH(o.lh, o.s || 16);
    if (o.ls) t.letterSpacing = { unit: "PIXELS", value: o.ls };
    if (o.align) t.textAlignHorizontal = o.align;
    if (o.vAlign) {
      try { t.textAlignVertical = o.vAlign; } catch (e) {}
    }
    if (o.wdt) { t.textAutoResize = "HEIGHT"; t.resize(o.wdt, t.height); }
    parent.appendChild(t);
    return t;
  }

  function lockPhotoLayout(node, w, h) {
    try {
      node.resize(w, h);
      node.primaryAxisSizingMode = "FIXED";
      node.counterAxisSizingMode = "FIXED";
      node.layoutAlign = "STRETCH";
      node.layoutGrow = 0;
      if ("layoutSizingVertical" in node) node.layoutSizingVertical = "FIXED";
      if ("layoutSizingHorizontal" in node) node.layoutSizingHorizontal = "FILL";
    } catch (e) {}
  }

  function GRAY(parent, w, h, r) {
    var g = F("media", { parent: parent, w: w, h: h, fixH: true, fills: [solid(hex("E4E4E4"))], r: r == null ? 0 : r });
    if (parent && parent.layoutMode !== "NONE") lockPhotoLayout(g, w, h);
    return g;
  }

  var dsApi = createDesignSystemBuilder({ F: F, T: T, solid: solid, hex: hex, fM: fM, fD: fD, fB: fB, fMed: fM, fMono: fMono, fMonoBold: fMonoBold, GRAY: GRAY, pctLH: pctLH });
  await dsApi.generateDesignSystem();
  figma.closePlugin();
})().catch(function (err) {
  figma.notify("DS error: " + String(err), { error: true });
  console.error(err);
});

function createDesignSystemBuilder(ctx) {
  var F = ctx.F, T = ctx.T, solid = ctx.solid, hex = ctx.hex;
  var fM = ctx.fM, fD = ctx.fD, fB = ctx.fB, fMed = ctx.fMed || ctx.fM;
  var fMono = ctx.fMono || ctx.fM, fMonoBold = ctx.fMonoBold || ctx.fMono || ctx.fM;
  var GRAY = ctx.GRAY, pctLH = ctx.pctLH;

  // Бренд RUBIN набираем моноширинным начертанием; здесь красим только диапазон
  // «RUBIN» внутри уже готового текстового узла, вес наследуется от контекста.
  function monoBrand(node, monoFont) {
    if (!node || !monoFont) return node;
    var s = node.characters, re = /RUBIN/g, m;
    while ((m = re.exec(s))) { try { node.setRangeFontName(m.index, m.index + 5, monoFont); } catch (e) {} }
    return node;
  }

  var C = {
    white: hex("FFFFFF"),
    black: hex("000000"),
    offBlack: hex("0A0A0A"),
    sand: hex("F6F5F4"),
    lightGrey: hex("F9F9FB"),
    grey: hex("B8B7C3"),
    darkGrey: hex("A2A2A2"),
    darkErGrey: hex("666666"),
    statBg: hex("F7F7F7"),
    error: hex("FA0019"),
    errorDark: hex("FF5454"),
    mutedText: { r: 0.039, g: 0.039, b: 0.039, a: 0.6 },
    black05: { r: 0, g: 0, b: 0, a: 0.05 },
    black10: { r: 0.039, g: 0.039, b: 0.039, a: 0.1 },
    white10: { r: 1, g: 1, b: 1, a: 0.1 },
    white30: { r: 1, g: 1, b: 1, a: 0.3 },
    mediaGray: hex("E4E4E4"),
  };

  var SPACING = [4, 6, 8, 10, 12, 16, 20, 24, 26, 30, 32, 40, 48, 56, 64, 72, 100, 120];
  var RADII = [6, 8, 12, 16, 24, 32];

  function paintStyle(name, color, alpha) {
    var s = figma.createPaintStyle();
    s.name = name;
    s.paints = [solid(color, alpha)];
    return s;
  }

  function textStyle(name, size, lh, ls, weightFont) {
    var s = figma.createTextStyle();
    s.name = name;
    s.fontName = weightFont || fB;
    s.fontSize = size;
    s.lineHeight = pctLH(lh, size);
    if (ls) s.letterSpacing = { unit: "PIXELS", value: ls };
    return s;
  }

  function effectHairline() {
    var s = figma.createEffectStyle();
    s.name = "Elevation/Card Hairline";
    s.effects = [
      { type: "DROP_SHADOW", color: { r: 0.039, g: 0.039, b: 0.039, a: 0.05 }, offset: { x: 0, y: 0 }, radius: 0, spread: 1, visible: true, blendMode: "NORMAL" },
      { type: "DROP_SHADOW", color: { r: 0.039, g: 0.039, b: 0.039, a: 0.08 }, offset: { x: 0, y: 2 }, radius: 4, spread: 0, visible: true, blendMode: "NORMAL" },
    ];
    return s;
  }

  function effectDropdown() {
    var s = figma.createEffectStyle();
    s.name = "Elevation/Dropdown";
    s.effects = [
      { type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.05 }, offset: { x: 0, y: 0 }, radius: 0, spread: 1, visible: true, blendMode: "NORMAL" },
      { type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.08 }, offset: { x: 0, y: 8 }, radius: 16, spread: 0, visible: true, blendMode: "NORMAL" },
    ];
    return s;
  }

  function sectionTitle(parent, label) {
    var h = F(label, { parent: parent, gap: 8, pt: 48, pb: 24 });
    T(h, label, { s: 24, c: C.offBlack, lh: 28.8, w: 600, font: fM });
    return h;
  }

  function subsection(parent, label) {
    var h = F(label, { parent: parent, gap: 16, pb: 8 });
    T(h, label, { s: 14, c: C.darkErGrey, lh: 20, w: 500, ls: 0.5, font: fM });
    return h;
  }

  function row(parent, gap) {
    return F("row", { parent: parent, dir: "HORIZONTAL", gap: gap || 16, cross: "CENTER", hugW: true });
  }

  function compFromFrame(frame, name) {
    var c = figma.createComponentFromNode(frame);
    c.name = name;
    return c;
  }

  function dims(node) {
    return Math.round(node.width) + " × " + Math.round(node.height);
  }

  function metaLines(parent, lines, w) {
    var m = F("meta", { parent: parent, gap: 4, w: w || 400 });
    (lines || []).forEach(function (line) {
      if (line) T(m, line, { s: 11, c: C.darkErGrey, lh: 15, font: fB });
    });
    return m;
  }

  function layoutComponentSet(set, cols, colW, rowH) {
    cols = cols || 4;
    colW = colW || 200;
    rowH = rowH || 72;
    try { set.layoutMode = "NONE"; } catch (e) {}
    var i = 0;
    var maxW = 0, maxH = 0;
    set.children.forEach(function (child) {
      child.x = (i % cols) * colW + 16;
      child.y = Math.floor(i / cols) * rowH + 16;
      maxW = Math.max(maxW, child.x + child.width);
      maxH = Math.max(maxH, child.y + child.height);
      i++;
    });
    set.resizeWithoutConstraints(maxW + 32, maxH + 32);
    return { w: maxW + 32, h: maxH + 32 };
  }

  function buildRangeTrack(parent, w, fillW) {
    var track = F("track", { parent: parent, w: w, h: 32, fixH: true, r: 12, fills: [solid(C.offBlack, 0.1)] });
    track.layoutMode = "NONE";
    track.clipsContent = true;
    track.resize(w, 32);
    var fill = F("fill", { parent: track, w: fillW, h: 32, r: 12, fills: [solid(C.white)] });
    fill.layoutMode = "NONE";
    fill.resize(fillW, 32);
    fill.x = 0;
    fill.y = 0;
    applyHairline(fill);
    var thumb = F("thumb", { parent: fill, w: 2, h: 21, fixH: true, fills: [solid(C.offBlack)] });
    thumb.layoutMode = "NONE";
    thumb.resize(2, 21);
    thumb.x = Math.max(0, fillW - 2);
    thumb.y = Math.round((32 - 21) / 2);
    return track;
  }

  function variantSetInShowcase(parent, setName, variants, opts) {
    opts = opts || {};
    var block = F(setName, { parent: parent, gap: 16, w: 1400, pb: 32 });
    subsection(block, setName);
    var content = F("content", { parent: block, dir: "HORIZONTAL", gap: 32, w: 1400, cross: "MIN" });
    var holder = F("variants", { parent: content });
    holder.layoutMode = "NONE";
    holder.clipsContent = false;
    var comps = [];
    variants.forEach(function (v) {
      var frame = v.build();
      holder.appendChild(frame);
      comps.push(compFromFrame(frame, v.name));
    });
    var set = comps.length === 1 ? comps[0] : figma.combineAsVariants(comps, holder);
    set.x = 0;
    set.y = 0;
    if (comps.length > 1) {
      set.name = setName;
      var grid = layoutComponentSet(set, opts.cols, opts.colW, opts.rowH);
      holder.resizeWithoutConstraints(grid.w, grid.h);
    } else {
      holder.resizeWithoutConstraints(set.width, set.height);
    }
    var specs = F("specs", { parent: content, gap: 8, w: 420 });
    if (opts.meta) metaLines(specs, opts.meta);
    metaLines(specs, ["— variants —"]);
    variants.forEach(function (v) {
      T(specs, v.name, { s: 10, c: C.darkErGrey, lh: 14, font: fB });
    });
  }

  function showcaseComponent(parent, name, buildFn, meta) {
    var block = F(name, { parent: parent, gap: 12, w: 1400, pb: 32 });
    subsection(block, name);
    var content = F("content", { parent: block, dir: "HORIZONTAL", gap: 32, cross: "MIN", w: 1400 });
    var preview = F("preview", { parent: content });
    preview.layoutMode = "NONE";
    preview.clipsContent = false;
    var frame = buildFn();
    preview.appendChild(frame);
    frame.x = 0;
    frame.y = 0;
    var comp = compFromFrame(frame, name);
    comp.x = 0;
    comp.y = 0;
    preview.resizeWithoutConstraints(comp.width, comp.height);
    var specs = F("specs", { parent: content, gap: 6, w: 420 });
    metaLines(specs, meta || []);
    metaLines(specs, [dims(comp)]);
    return comp;
  }

  function applyHairline(node) {
    try {
      node.effects = [
        { type: "DROP_SHADOW", color: { r: 0.039, g: 0.039, b: 0.039, a: 0.05 }, offset: { x: 0, y: 0 }, radius: 0, spread: 1, visible: true, blendMode: "NORMAL" },
        { type: "DROP_SHADOW", color: { r: 0.039, g: 0.039, b: 0.039, a: 0.08 }, offset: { x: 0, y: 2 }, radius: 4, spread: 0, visible: true, blendMode: "NORMAL" },
      ];
    } catch (e) {}
  }

  function buildBtnInner(label, o) {
    o = o || {};
    var size = o.size || "Default";
    var pr = size === "Header" ? 12 : (size === "Large" ? 24 : 16);
    var pl = size === "Header" ? 12 : (size === "Large" ? 24 : 16);
    var r = size === "Header" ? 36 : 32;
    var fs = size === "Header" ? 14 : 16;
    var lh = size === "Header" ? 19.6 : 22.4;
    var minH = size === "Header" ? 36 : (size === "Large" ? 56 : 38);
    var fills = [];
    if (o.variant === "Primary") fills = [solid(C.black)];
    else if (o.variant === "Soft") fills = [solid(C.black, 0.05)];
    else if (o.variant === "Inverse") fills = [solid(C.white)];
    else if (o.variant === "Ghost") fills = [];
    else if (o.variant === "Secondary") fills = [];
    var textC = o.variant === "Primary" || o.variant === "Secondary" ? C.white : (o.variant === "Inverse" ? C.black : C.black);
    if (o.variant === "Primary") textC = C.white;
    if (o.variant === "Inverse") textC = C.black;
    if (o.variant === "Ghost" && o.theme === "Dark") textC = C.white;
    var f = F("Button", {
      dir: "HORIZONTAL", hugW: true, align: "CENTER", cross: "CENTER",
      pt: 0, pr: pr, pb: 0, pl: pl, r: r, fills: fills, gap: 8,
    });
    if (o.variant === "Ghost") {
      f.strokes = [o.theme === "Dark" ? solid(C.white, 0.1) : solid(C.black, 0.1)];
      f.strokeWeight = 1;
      f.strokeAlign = "INSIDE";
    }
    if (o.variant === "Secondary") {
      f.strokes = [solid(textC)];
      f.strokeWeight = 1;
      f.strokeAlign = "INSIDE";
      f.cornerRadius = 999;
    }
    T(f, label || "Book an intro", { s: fs, c: textC, lh: lh, vAlign: "CENTER", font: fMed });
    try {
      f.resize(f.width, minH);
      f.primaryAxisSizingMode = "AUTO";
      f.counterAxisSizingMode = "FIXED";
    } catch (e) {}
    if (o.state === "Hover" || o.state === "Disabled") f.opacity = 0.6;
    return f;
  }

  function buildFoundations(pageRoot) {
    var sec = F("Foundations", { parent: pageRoot, gap: 32, w: 1400 });
    sectionTitle(sec, "Foundations");

    var colors = subsection(sec, "Color styles");
    var colorRow = row(colors, 12);
    [
      ["Color/Base/White", C.white],
      ["Color/Base/Black", C.black],
      ["Color/Base/Off-black", C.offBlack],
      ["Color/Base/Sand", C.sand],
      ["Color/Base/Light-grey", C.lightGrey],
      ["Color/Semantic/Error", C.error],
    ].forEach(function (pair) {
      paintStyle(pair[0], pair[1]);
      var sw = F(pair[0], { parent: colorRow, w: 72, h: 72, fixH: true, r: 8, fills: [solid(pair[1])], stroke: C.black, strokeW: 1 });
      sw.resize(72, 72);
      T(colorRow, pair[0].split("/").pop(), { s: 10, c: C.darkErGrey, lh: 14 });
    });

    var alphaRow = row(colors, 12);
    [
      ["Color/Alpha/Black-05", C.black, 0.05],
      ["Color/Alpha/Black-10", C.offBlack, 0.1],
      ["Color/Alpha/White-10", C.white, 0.1],
      ["Color/Alpha/White-30", C.white, 0.3],
    ].forEach(function (pair) {
      paintStyle(pair[0], pair[1], pair[2]);
      var cell = F(pair[0], { parent: alphaRow, w: 72, h: 72, fixH: true, r: 8, fills: [solid(pair[1], pair[2])], stroke: C.black, strokeW: 1 });
      cell.resize(72, 72);
    });

    var typo = subsection(sec, "Text styles");
    var typeSpecs = [
      ["Display/72", 72, 72, -1.44, fD],
      ["H2/48", 48, 48, -0.96, fM],
      ["H3/32", 32, 35.2, -0.32, fM],
      ["H4/22", 22, 26.4, -0.22, fM],
      ["Body/16", 16, 22.4, -0.16, fB],
      ["Body Large/24", 24, 28.8, 0, fB],
      ["Caption/14", 14, 19.6, 0, fMed],
      ["Micro/12", 12, 18, 0, fM],
    ];
    typeSpecs.forEach(function (spec) {
      textStyle(spec[0], spec[1], spec[2], spec[3], spec[4]);
      var line = F(spec[0], { parent: typo, gap: 4 });
      T(line, spec[0], { s: 12, c: C.darkErGrey, lh: 16, font: fMed });
      var pct = Math.round((spec[2] / spec[1]) * 1000) / 10;
      T(line, "Aa — " + spec[1] + "px / " + pct + "%", { s: spec[1], c: C.black, lh: spec[2], ls: spec[3], font: spec[4] });
    });

    effectHairline();
    effectDropdown();

    var spacingSec = subsection(sec, "Spacing");
    var spRow = row(spacingSec, 8);
    SPACING.forEach(function (n) {
      var cell = F("Space/" + n, { parent: spRow, dir: "HORIZONTAL", cross: "CENTER", gap: 4 });
      var bar = F("bar", { parent: cell, w: n, h: 24, fixH: true, fills: [solid(C.black, 0.08)] });
      bar.resize(n, 24);
      T(cell, String(n), { s: 10, c: C.darkErGrey, lh: 12 });
    });

    var radiusSec = subsection(sec, "Radius");
    var rRow = row(radiusSec, 16);
    RADII.forEach(function (r) {
      var cell = F("Radius/" + r, { parent: rRow, gap: 8, cross: "CENTER" });
      var box = F("box", { parent: cell, w: 64, h: 64, fixH: true, r: r, fills: [solid(C.sand)], stroke: C.black, strokeW: 1 });
      box.resize(64, 64);
      T(cell, r + "px", { s: 12, c: C.darkErGrey, lh: 16 });
    });

    return sec;
  }

  function buildActions(root) {
    var sec = F("Actions", { parent: root, gap: 24, w: 1400 });
    sectionTitle(sec, "Actions");

    var btnVariants = [];
    ["Primary", "Soft", "Ghost", "Secondary", "Inverse"].forEach(function (variant) {
      ["Default", "Header", "Large"].forEach(function (size) {
        ["Default", "Hover", "Disabled"].forEach(function (state) {
          btnVariants.push({
            name: "Variant=" + variant + ", Size=" + size + ", State=" + state,
            build: function () {
              return buildBtnInner("Book an intro", { variant: variant, size: size, state: state, theme: variant === "Inverse" ? "Dark" : "Light" });
            },
          });
        });
      });
    });
    variantSetInShowcase(sec, "Button", btnVariants, {
      cols: 5, colW: 220, rowH: 76,
      meta: [
        "Default: pr 16 · pl 16 · r 32 · min-h 38",
        "Header: pr 12 · pl 12 · r 36 · min-h 36",
        "Large: pr 24 · pl 24 · r 32 · min-h 56 — основной размер на лендинге",
        "text 16/22.4 (Default, Large) · 14/19.6 (Header)",
      ],
    });

    var iconRoundVariants = [];
    [
      { size: "41", theme: "Light", state: "Default", d: 41, bg: C.white, icon: C.black },
      { size: "40", theme: "Dark", state: "Default", d: 40, bg: C.black, icon: C.white },
      { size: "34", theme: "Light", state: "Default", d: 34, bg: C.black, icon: C.black, alpha: 0.05 },
      { size: "38", theme: "Light", state: "Default", d: 38, bg: C.white, icon: C.black },
      { size: "41", theme: "Light", state: "Disabled", d: 41, bg: C.white, icon: C.black, disabled: true },
    ].forEach(function (o) {
      iconRoundVariants.push({
        name: "Size=" + o.size + ", Theme=" + o.theme + ", State=" + o.state,
        build: function () {
          var f = F("Icon Round", { w: o.d, h: o.d, fixH: true, r: 999, fills: [solid(o.bg, o.alpha)], align: "CENTER", cross: "CENTER" });
          f.resize(o.d, o.d);
          T(f, "→", { s: o.d * 0.41, c: o.icon, align: "CENTER" });
          if (o.disabled) f.opacity = 0.2;
          return f;
        },
      });
    });
    variantSetInShowcase(sec, "Button / Icon Round", iconRoundVariants, { cols: 3, colW: 72, rowH: 64, meta: ["d 34–41px · r 999"] });

    var linkTypes = ["Inline", "Nav", "Submenu", "Footer", "Breadcrumb"];
    var linkStates = ["Default", "Hover", "Active"];
    var linkVariants = [];
    linkTypes.forEach(function (type) {
      linkStates.forEach(function (state) {
        linkVariants.push({
          name: "Type=" + type + ", State=" + state,
          build: function () {
            var f = F("Link", { dir: "HORIZONTAL", hugW: true, cross: "CENTER", gap: 4, pt: type === "Nav" ? 4 : 0, pr: type === "Nav" ? 12 : 0, pb: type === "Nav" ? 0 : 0, pl: type === "Nav" ? 12 : 0, r: type === "Nav" || type === "Submenu" ? 6 : 0 });
            var label = type === "Breadcrumb" ? "Home" : "Products";
            var op = state === "Default" ? (type === "Footer" || type === "Inline" ? 0.6 : 1) : 1;
            if (type === "Inline") {
              var t = T(f, label, { s: 16, c: C.black, lh: 22.4, font: fB });
              t.opacity = op;
              try { t.textDecoration = "UNDERLINE"; } catch (e) {}
            } else {
              var t2 = T(f, label, { s: 14, c: C.offBlack, lh: 19.6, font: fMed });
              t2.opacity = op;
            }
            if (state === "Hover" && (type === "Nav" || type === "Submenu")) {
              f.fills = [solid(C.black, 0.03)];
            }
            if (type === "Breadcrumb") T(f, " / Pricing", { s: 14, c: C.offBlack, lh: 19.6, font: fMed });
            f.resize(f.width, Math.max(f.height, type === "Submenu" ? 40 : type === "Nav" ? 36 : f.height));
            return f;
          },
        });
      });
    });
    variantSetInShowcase(sec, "Link", linkVariants.slice(0, 15), { cols: 3, colW: 180, rowH: 48, meta: ["Nav pt 4 pr 12 · r 6 · h 36", "text 14/19.6 · 16/22.4 inline"] });

    var badges = subsection(sec, "Badge / Pill & Tags");
    var badgeRow = row(badges, 24);
    [
      { name: "Badge / Pill", label: "New", border: true, meta: ["pt 4 pr 6 pb 1 pl 6 · r 8", "text 14/14 · w 600"] },
      { name: "Badge / Eyebrow Tag", label: "Enterprise", sand: true, r: 20, pt: 7, pr: 12, pb: 4, meta: ["pt 7 pr 12 pb 4 · r 20 · sand fill"] },
      { name: "Badge / Tag Uppercase", label: "CASE STUDY", uppercase: true, fs: 9, r: 32, meta: ["text 9/12.6 · ls 0.54 · r 32"] },
      { name: "Badge / Soft Tag", label: "Coming soon", soft: true, r: 8, meta: ["fill black 5% · r 8"] },
      { name: "Badge / Media Tag", label: "New feature", media: true, meta: ["min-h 40 · pl 12 pr 16 · hairline"] },
    ].forEach(function (b) {
      var item = F(b.name, { parent: badgeRow, gap: 8, cross: "CENTER" });
      var f = F("chip", {
        dir: "HORIZONTAL", hugW: true, cross: "CENTER", gap: 6,
        pt: b.pt || 4, pr: b.pr || 6, pb: b.pb || 1, pl: b.pl || 6,
        r: b.r || 8, fills: b.sand ? [solid(C.sand)] : b.soft ? [solid(C.offBlack, 0.05)] : b.media ? [solid(C.white)] : [],
      });
      if (b.border) {
        try {
          f.effects = [{ type: "DROP_SHADOW", color: { r: 0.039, g: 0.039, b: 0.039, a: 1 }, offset: { x: 0, y: 0 }, radius: 0, spread: 1.5, visible: true, blendMode: "NORMAL" }];
        } catch (e) {}
      }
      if (b.media) {
        f.paddingTop = 0; f.paddingBottom = 0; f.paddingLeft = 12; f.paddingRight = 16;
        f.minHeight = 40;
        applyHairline(f);
      }
      T(f, b.label, { s: b.fs || 14, c: C.offBlack, lh: b.fs === 9 ? 12.6 : 14, w: b.uppercase ? 500 : 600, ls: b.uppercase ? 0.54 : -0.14, font: fM });
      item.appendChild(f);
      compFromFrame(f, b.name);
      metaLines(item, b.meta || []);
    });

    return sec;
  }

  function buildInputField(o) {
    o = o || {};
    var theme = o.theme || "Light";
    var state = o.state || "Default";
    var size = o.size || "Pill";
    var isUnderline = size === "Underline";
    var isCompact = size === "Compact";
    var minH = isUnderline ? 36 : isCompact ? 42 : 48;
    var r = isCompact ? 12 : isUnderline ? 0 : 32;
    var fs = isCompact ? 14 : 14;
    var pt = isUnderline ? 10 : isCompact ? 10 : 14;
    var pr = isUnderline ? 0 : isCompact ? 12 : 20;
    var pb = isUnderline ? 10 : isCompact ? 10 : 11;
    var pl = isUnderline ? 0 : isCompact ? 12 : 20;
    var borderA = theme === "Dark" ? 0.3 : 0.1;
    if (state === "Hover" || state === "Filled") borderA = theme === "Dark" ? 0.3 : 0.3;
    if (state === "Focus") borderA = 1;
    var borderColor = state === "Focus" ? (theme === "Dark" ? C.white : C.black) : (theme === "Dark" ? C.white : C.black);
    var f = F("Input", {
      w: 320, h: minH, fixH: !isUnderline,
      pt: pt, pr: pr, pb: pb, pl: pl, r: r,
      fills: [],
      align: "MIN", cross: "MIN",
    });
    if (!isUnderline) {
      f.strokes = [state === "Focus" ? solid(borderColor) : solid(borderColor, borderA)];
      f.strokeWeight = 1;
      f.strokeAlign = "INSIDE";
    } else {
      f.strokes = [solid(borderColor, borderA)];
      f.strokeWeight = 1;
      f.strokeAlign = "INSIDE";
      try { f.strokeBottomWeight = 1; f.strokeTopWeight = 0; f.strokeLeftWeight = 0; f.strokeRightWeight = 0; } catch (e) {}
    }
    var ph = state === "Filled" ? "you@company.com" : "Email address";
    var phColor = theme === "Dark" ? C.white : C.black;
    T(f, ph, { s: fs, c: phColor, lh: 19.6, font: fMed });
    if (state === "Filled") T(f, "", { s: fs }).opacity = 0;
    f.resize(320, minH);
    return f;
  }

  function buildSelectField(o) {
    o = o || {};
    var f = buildInputField(o);
    f.layoutMode = "HORIZONTAL";
    f.primaryAxisAlignItems = "SPACE_BETWEEN";
    f.counterAxisAlignItems = "CENTER";
    var text = f.children[0];
    try {
      text.layoutGrow = 1;
      if ("layoutSizingHorizontal" in text) text.layoutSizingHorizontal = "FILL";
    } catch (e) {}
    if (o.state === "Filled" && f.children.length > 1) {
      try { f.children[1].remove(); } catch (e) {}
    }
    var theme = o.theme || "Light";
    T(f, "▼", { s: 12, c: theme === "Dark" ? C.white : C.black, lh: 19.6 });
    return f;
  }

  function buildForms(root) {
    var sec = F("Forms", { parent: root, gap: 24, w: 1400 });
    sectionTitle(sec, "Forms");

    var inputVariants = [];
    ["Default", "Hover", "Focus", "Filled", "Error"].forEach(function (state) {
      ["Light", "Dark"].forEach(function (theme) {
        ["Pill", "Compact", "Underline"].forEach(function (size) {
          inputVariants.push({
            name: "State=" + state + ", Theme=" + theme + ", Size=" + size,
            build: function () {
              var frame = buildInputField({ state: state, theme: theme, size: size });
              if (theme === "Dark") {
                var wrap = F("wrap", { w: 340, h: frame.height + 16, fixH: true, pt: 8, pb: 8, pl: 8, fills: [solid(C.offBlack)] });
                wrap.appendChild(frame);
                frame.x = 8; frame.y = 8;
                return wrap;
              }
              return frame;
            },
          });
        });
      });
    });
    variantSetInShowcase(sec, "Input / Text", inputVariants.slice(0, 15), { cols: 3, colW: 360, rowH: 64, meta: ["Pill: w 320 · h 48 · r 32 · pt 14 pr 20 pb 11 pl 20", "Compact: h 42 · r 12", "Underline: h 36 · bottom stroke"] });

    var selectVariants = [];
    ["Placeholder", "Filled", "Open"].forEach(function (state) {
      ["Light", "Dark"].forEach(function (theme) {
        selectVariants.push({
          name: "State=" + state + ", Theme=" + theme,
          build: function () {
            return buildSelectField({ state: state === "Placeholder" ? "Default" : "Filled", theme: theme, size: "Pill" });
          },
        });
      });
    });
    variantSetInShowcase(sec, "Input / Select", selectVariants, { cols: 3, colW: 360, rowH: 80, meta: ["w 320 · pill r 32 · chevron right"] });

    var cbVariants = [];
    ["Off", "On", "Hover"].forEach(function (state) {
      ["Light", "Dark"].forEach(function (theme) {
        cbVariants.push({
          name: "State=" + state + ", Theme=" + theme,
          build: function () {
            var f = F("Checkbox", { dir: "HORIZONTAL", gap: 8, cross: "CENTER", hugW: true });
            var box = F("box", { parent: f, w: 20, h: 20, fixH: true, r: 6, fills: state === "On" ? [solid(theme === "Dark" ? C.white : C.black)] : [], stroke: theme === "Dark" ? C.white : C.black, strokeW: 1.25 });
            box.resize(20, 20);
            if (state === "On") T(box, "✓", { s: 12, c: theme === "Dark" ? C.black : C.white, align: "CENTER" });
            T(f, "Accept terms", { s: 14, c: theme === "Dark" ? C.white : C.offBlack, lh: 21, font: fB });
            return f;
          },
        });
      });
    });
    variantSetInShowcase(sec, "Input / Checkbox", cbVariants, { cols: 4, colW: 200, rowH: 40, meta: ["box 20×20 · r 6 · stroke 1.25"] });

    showcaseComponent(sec, "Form / Field · Helper=On, Error=Off", function () {
      var fieldWrap = F("Form / Field", { gap: 6, w: 320 });
      T(fieldWrap, "Work email", { s: 14, c: C.offBlack, lh: 19.6, font: fB });
      fieldWrap.appendChild(buildInputField({ state: "Default", theme: "Light", size: "Pill" }));
      T(fieldWrap, "We'll never share your email.", { s: 14, c: C.offBlack, lh: 19.6, font: fB }).opacity = 0.6;
      return fieldWrap;
    }, ["gap 6 · w 320", "label 14/19.6", "helper opacity 0.6"]);

    showcaseComponent(sec, "Form / Field · Helper=Off, Error=On", function () {
      var fieldErr = F("Form / Field Error", { gap: 6, w: 320 });
      T(fieldErr, "Work email", { s: 14, c: C.offBlack, lh: 19.6, font: fB });
      fieldErr.appendChild(buildInputField({ state: "Error", theme: "Light", size: "Pill" }));
      T(fieldErr, "Please enter a valid email", { s: 14, c: C.error, lh: 20, font: fMed });
      return fieldErr;
    }, ["error Color/Error · 14/20"]);

    showcaseComponent(sec, "Input / Multiselect", function () {
      var ms = F("Input / Multiselect", { w: 320, gap: 0 });
      var msCtrl = F("control", { parent: ms, dir: "HORIZONTAL", gap: 6, pt: 10, pb: 10, pl: 10, pr: 10, r: 23, fills: [solid(C.white)], stroke: C.offBlack, strokeW: 1 });
      var tag = F("tag", { parent: msCtrl, dir: "HORIZONTAL", gap: 8, pt: 6, pr: 8, pb: 2, pl: 14, r: 16, fills: [solid(C.offBlack, 0.05)] });
      T(tag, "Sales", { s: 13, c: C.offBlack, lh: 18, w: 500, font: fM });
      T(msCtrl, "+ Add", { s: 14, c: C.darkErGrey, lh: 19.6, font: fMed });
      return ms;
    }, ["control r 23 · stroke 1", "tag r 16 · fill 5%"]);

    showcaseComponent(sec, "Input / Range", function () {
      var range = F("Input / Range", { w: 400, gap: 12 });
      buildRangeTrack(range, 400, 200);
      T(range, "Number of users", { s: 14, c: C.offBlack, lh: 19.6, font: fB });
      return range;
    }, ["track 400×32 r 12", "fill + thumb 2×21"]);

    return sec;
  }

  function buildNavigation(root) {
    var sec = F("Navigation", { parent: root, gap: 24, w: 1400 });
    sectionTitle(sec, "Navigation");

    var navItemVariants = [];
    ["Default", "Hover", "Active"].forEach(function (state) {
      ["Off", "On"].forEach(function (chevron) {
        navItemVariants.push({
          name: "State=" + state + ", Chevron=" + chevron,
          build: function () {
            var f = F("Nav / Item", { dir: "HORIZONTAL", gap: 4, pt: 4, pr: chevron === "On" ? 8 : 12, pb: 0, pl: 12, r: 6, cross: "CENTER", hugW: true });
            T(f, "Products", { s: 14, c: C.offBlack, lh: 19.6, font: fMed });
            if (chevron === "On") T(f, "▾", { s: 16, c: C.offBlack });
            if (state === "Hover") f.fills = [solid(C.black, 0.03)];
            f.resize(f.width, 36);
            return f;
          },
        });
      });
    });
    variantSetInShowcase(sec, "Nav / Item", navItemVariants, { cols: 3, colW: 160, rowH: 48, meta: ["pt 4 pr 8–12 pl 12 · r 6 · h 36"] });

    showcaseComponent(sec, "Nav / Header · Theme=Light", function () {
      var header = F("Nav / Header", { w: 1496, h: 52, fixH: true, dir: "HORIZONTAL", align: "SPACE_BETWEEN", cross: "CENTER", pl: 32, pr: 32, fills: [solid(C.white)] });
      header.resize(1496, 52);
      T(header, "RUBIN", { s: 14, c: C.offBlack, lh: 19.6, w: 500, font: fMono });
      var navMid = row(header, 16);
      ["Продукт", "Биржа", "Как устроено"].forEach(function (l) { T(navMid, l, { s: 14, c: C.offBlack, lh: 19.6, font: fMed }); });
      var navActs = row(header, 8);
      navActs.appendChild(buildBtnInner("Документация", { variant: "Soft", size: "Header" }));
      navActs.appendChild(buildBtnInner("Начать торговлю", { variant: "Primary", size: "Header" }));
      return header;
    }, ["1496×52 · pl/pr 32", "Header buttons · Soft + Primary"]);

    showcaseComponent(sec, "Tabs / Inline Underline", function () {
      var tabsInline = F("Tabs / Inline Underline", { dir: "HORIZONTAL", gap: 27, hugW: true });
      ["Overview", "Features", "Security"].forEach(function (l, i) {
        var item = F("item", { parent: tabsInline, pt: 8, pb: 8, gap: 0 });
        T(item, l, { s: 14, c: C.offBlack, lh: 19.6, w: 500, font: fM });
        item.opacity = i === 0 ? 1 : 0.4;
        if (i === 0) { item.strokes = [solid(C.offBlack)]; item.strokeBottomWeight = 1; }
      });
      return tabsInline;
    }, ["gap 27 · active underline · opacity 0.4 inactive"]);

    showcaseComponent(sec, "Tabs / Pill", function () {
      var tabsPillWrap = F("Tabs / Pill", { hugW: true });
      var tabsPill = row(tabsPillWrap, 8);
      ["Search", "Create", "Analyze"].forEach(function (l, i) {
        var p = F("pill", { parent: tabsPill, pt: 9, pr: 16, pb: 5, pl: 16, r: 32, fills: i === 0 ? [solid(C.white)] : [] });
        T(p, l, { s: 14, c: C.offBlack, lh: 19.6, w: 500, font: fM });
      });
      return tabsPillWrap;
    }, ["pill pt 9 pr 16 pb 5 pl 16 · r 32", "active fill white"]);

    showcaseComponent(sec, "Nav / Sticky Pill Nav", function () {
      var sticky = F("Nav / Sticky Pill Nav", { dir: "HORIZONTAL", gap: 8, pt: 8, pb: 8, pl: 8, pr: 8, r: 32, fills: [solid(C.offBlack, 0.03)] });
      ["Overview", "Integrations", "Pricing"].forEach(function (l, i) {
        var it = F("item", { parent: sticky, pt: 7, pr: 12, pb: 4, pl: 12, r: 20, fills: i === 0 ? [solid(C.white)] : [] });
        T(it, l, { s: 14, c: C.offBlack, lh: 19.6, w: 500, font: fM });
      });
      return sticky;
    }, ["container r 32 · fill 3%", "item r 20 · active white"]);

    showcaseComponent(sec, "Nav / Dropdown · Width=240", function () {
      var drop240 = F("Nav / Dropdown", { gap: 0, pt: 4, pb: 4, pl: 4, pr: 4, r: 10, w: 240, fills: [solid(C.white)] });
      try {
        drop240.effects = [
          { type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.05 }, offset: { x: 0, y: 0 }, radius: 0, spread: 1, visible: true, blendMode: "NORMAL" },
          { type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.08 }, offset: { x: 0, y: 8 }, radius: 16, spread: 0, visible: true, blendMode: "NORMAL" },
        ];
      } catch (e) {}
      ["Биржа перпов", "AI-агент", "Документация", "Прозрачность"].forEach(function (l) {
        var it = F("item", { parent: drop240, pt: 11, pr: 12, pb: 8, pl: 12, r: 6, gap: 0 });
        T(it, l, { s: 14, c: C.offBlack, lh: 19.6, font: fB });
      });
      return drop240;
    }, ["w 240 · r 10 · dropdown shadow", "item pt 11 pr 12 pb 8 pl 12 r 6"]);

    showcaseComponent(sec, "Nav / Dropdown · Width=472", function () {
      var drop472 = F("Nav / Dropdown Wide", { dir: "HORIZONTAL", gap: 0, pt: 4, pb: 4, pl: 4, pr: 4, r: 10, w: 472, fills: [solid(C.white)] });
      try {
        drop472.effects = [
          { type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.05 }, offset: { x: 0, y: 0 }, radius: 0, spread: 1, visible: true, blendMode: "NORMAL" },
          { type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.08 }, offset: { x: 0, y: 8 }, radius: 16, spread: 0, visible: true, blendMode: "NORMAL" },
        ];
      } catch (e2) {}
      [["Продукт", ["Биржа перпов", "AI-агент"]], ["Ресурсы", ["Документация", "Канал"]]].forEach(function (col) {
        var c = F("col", { parent: drop472, gap: 0, w: 232 });
        try {
          if ("layoutSizingHorizontal" in c) c.layoutSizingHorizontal = "FIXED";
          c.layoutGrow = 0;
          c.resize(232, Math.max(c.height, 1));
        } catch (e3) {}
        T(c, col[0], { s: 12, c: C.offBlack, lh: 18, w: 500, font: fM }).opacity = 0.4;
        col[1].forEach(function (l) {
          var it = F("item", { parent: c, pt: 11, pr: 12, pb: 8, pl: 12, r: 6 });
          T(it, l, { s: 14, c: C.offBlack, lh: 19.6, font: fB });
        });
      });
      return drop472;
    }, ["w 472 · 2 columns · col w 232 (464 / 2)"]);

    var annVariants = [];
    ["Top", "Bottom"].forEach(function (pos) {
      annVariants.push({
        name: "Position=" + pos,
        build: function () {
          var bar = F("Announcement Bar", { w: 1496, dir: "HORIZONTAL", align: "CENTER", cross: "CENTER", pt: 16, pr: 25, pb: 13, pl: 25, fills: [solid(C.offBlack)] });
          T(bar, "Сеть работает в mainnet — ", { s: 15, c: C.white, lh: 21, font: fB });
          var bold = T(bar, "read the announcement", { s: 15, c: C.white, lh: 21, w: 600, font: fM });
          try { bold.textDecoration = "UNDERLINE"; } catch (e) {}
          return bar;
        },
      });
    });
    variantSetInShowcase(sec, "Nav / Announcement Bar", annVariants, { cols: 2, colW: 760, rowH: 56, meta: ["pt 16 pr 25 pb 13 pl 25 · fill off-black", "text 15/21"] });

    showcaseComponent(sec, "Tabs / Vertical Rail", function () {
      var vertWrap = F("Tabs / Vertical Rail", { dir: "HORIZONTAL", gap: 0, pl: 28, hugW: true });
      var rail = F("rail", { parent: vertWrap, w: 4, h: 180, fixH: true, r: 8, fills: [solid(C.offBlack, 0.1)] });
      rail.resize(4, 180);
      var vertItems = F("items", { parent: vertWrap, gap: 0, w: 350 });
      [
        { title: "Search", desc: "Find anything across your workspace", active: true },
        { title: "Create", desc: "Generate content with AI", active: false },
        { title: "Analyze", desc: "Insights from your data", active: false },
      ].forEach(function (it) {
        var itemRow = F("item", { parent: vertItems, dir: "HORIZONTAL", gap: 12, pt: 16, pb: 16, cross: "CENTER" });
        var ind = F("ind", { parent: itemRow, w: 4, h: it.active ? 24 : 0, fixH: true, fills: [solid(C.black)] });
        if (it.active) ind.resize(4, 24);
        var txt = F("txt", { parent: itemRow, gap: 2 });
        T(txt, it.title, { s: 16, c: C.offBlack, lh: 22.4, w: 600, font: fM });
        T(txt, it.desc, { s: 14, c: C.offBlack, lh: 19.6, font: fB }).opacity = 0.8;
        itemRow.opacity = it.active ? 1 : 0.4;
      });
      return vertWrap;
    }, ["rail 4×180 r 8", "item pt/pb 16 · indicator 4×24"]);

    var textListVariants = [];
    ["Default", "Active"].forEach(function (state) {
      textListVariants.push({
        name: "State=" + state,
        build: function () {
          var list = F("Text List Item", { dir: "HORIZONTAL", gap: 8, cross: "CENTER", hugW: true, pt: 8, pb: 8 });
          if (state === "Active") T(list, "→", { s: 32, c: C.offBlack, lh: 35.2, font: fM });
          T(list, "Enterprise search", { s: 32, c: C.offBlack, lh: 35.2, ls: -0.32, font: fM });
          list.opacity = state === "Active" ? 1 : 0.3;
          return list;
        },
      });
    });
    variantSetInShowcase(sec, "Tabs / Text List", textListVariants, { cols: 2, colW: 400, rowH: 48, meta: ["text 32/35.2 · active arrow →"] });

    return sec;
  }

  function buildCards(root) {
    var sec = F("Cards", { parent: root, gap: 24, w: 1400 });
    sectionTitle(sec, "Cards");

    showcaseComponent(sec, "Card / Quote · Avatar=On", function () {
      var quote = F("Card / Quote", { w: 400, gap: 0, r: 24, pt: 24, pr: 24, pb: 64, pl: 24, fills: [solid(C.white)] });
      applyHairline(quote);
      quote.itemSpacing = -24;
      var qInner = F("content", { parent: quote, w: 352, pt: 40, pr: 40, pb: 40, pl: 40, r: 16, fills: [solid(C.sand)], gap: 16 });
      T(qInner, "«Нужны свои независимые контуры»", { s: 18, c: C.offBlack, lh: 24, font: fB, wdt: 272 });
      var author = F("author", { parent: quote, dir: "HORIZONTAL", gap: 12, pl: 40, pb: 30, cross: "CENTER" });
      var av = F("avatar", { parent: author, w: 48, h: 48, fixH: true, r: 999, fills: [solid(C.mediaGray)], stroke: C.white, strokeW: 2 });
      av.resize(48, 48);
      var authTxt = F("txt", { parent: author, gap: 2 });
      monoBrand(T(authTxt, "Команда RUBIN", { s: 14, c: C.offBlack, lh: 19.6, font: fM }), fMono);
      T(authTxt, "Telegram, 08.07.2026", { s: 14, c: C.offBlack, lh: 19.6, font: fB }).opacity = 0.6;
      return quote;
    }, ["w 400 · r 24 · pt 24 pr 24 pb 64 pl 24", "inner sand r 16 · avatar 48 · overlap -24"]);

    showcaseComponent(sec, "Card / Stat", function () {
      var stat = F("Card / Stat", { w: 280, h: 200, fixH: true, pt: 32, pr: 32, pb: 32, pl: 32, r: 8, fills: [solid(C.statBg)], align: "SPACE_BETWEEN" });
      stat.resize(280, 200);
      T(stat, "24/7", { s: 48, c: C.black, lh: 48, ls: -0.96, font: fM });
      T(stat, "Рынок открыт без выходных", { s: 16, c: C.black, lh: 22.4, font: fB });
      return stat;
    }, ["280×200 · r 8 · pt 32", "stat bg #F7F7F7"]);

    showcaseComponent(sec, "Card / Product", function () {
      var prod = F("Card / Product", { w: 400, r: 40, fills: [solid(C.white)] });
      try {
        prod.effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.12 }, offset: { x: 0, y: 8 }, radius: 24, spread: 0, visible: true, blendMode: "NORMAL" }];
      } catch (e) {}
      GRAY(prod, 400, 220, 40);
      var prodBot = F("bottom", { parent: prod, pt: 24, pr: 32, pb: 24, pl: 32, gap: 8 });
      T(prodBot, "Биржа перпов", { s: 32, c: C.offBlack, lh: 35.2, ls: -0.32, font: fM });
      T(prodBot, "Кошелёк или email, пополнение USDC", { s: 16, c: C.offBlack, lh: 22.4, font: fB }).opacity = 0.6;
      return prod;
    }, ["w 400 · r 40 · media 400×220", "shadow y 8 blur 24"]);

    showcaseComponent(sec, "Card / Integrations", function () {
      var integ = F("Card / Integrations", { w: 400, pt: 32, pr: 32, pb: 32, pl: 32, r: 24, fills: [solid(C.offBlack, 0.03)], gap: 24 });
      T(integ, "100+ integrations", { s: 24, c: C.offBlack, lh: 28.8, font: fM });
      var grid = row(integ, 12);
      ["Slack", "Teams", "Drive"].forEach(function (n) {
        var c = F("ic", { parent: grid, w: 40, h: 40, fixH: true, r: 14, fills: [solid(C.white)] });
        c.resize(40, 40);
        applyHairline(c);
        T(c, n.slice(0, 1), { s: 14, c: C.offBlack, align: "CENTER" });
      });
      return integ;
    }, ["w 400 · r 24 · fill 3%", "icons 40×40 r 14"]);

    showcaseComponent(sec, "Card / Service Tile · Theme=Soft", function () {
      var tile = F("Card / Service Tile", { w: 341, h: 104, fixH: true, pt: 20, pr: 24, pb: 20, pl: 24, r: 24, fills: [solid(C.offBlack, 0.05)], align: "SPACE_BETWEEN" });
      tile.resize(341, 104);
      T(tile, "✓", { s: 18, c: C.offBlack });
      T(tile, "Implementation support", { s: 16, c: C.offBlack, lh: 22.4, font: fB });
      return tile;
    }, ["341×104 · r 24 · fill 5%"]);

    showcaseComponent(sec, "Pricing / Plan Column · CTA=Soft", function () {
      var plan = F("Pricing / Plan Column", { w: 464, gap: 12 });
      T(plan, "Team", { s: 32, c: C.offBlack, lh: 35.2, font: fM });
      T(plan, "$30 / user / month", { s: 16, c: C.offBlack, lh: 22.4, w: 600, font: fM });
      plan.appendChild(buildBtnInner("Get started", { variant: "Soft", size: "Default" }));
      var hr = F("hr", { parent: plan, w: 464, h: 1, fixH: true, fills: [solid(C.offBlack, 0.2)] });
      hr.resize(464, 1);
      var check = F("checklist", { parent: plan, gap: 13 });
      ["Unlimited users", "SSO", "Priority support"].forEach(function (l) {
        var li = row(check, 16);
        T(li, "✓", { s: 16, c: C.offBlack });
        T(li, l, { s: 16, c: C.offBlack, lh: 22.4, font: fB });
      });
      return plan;
    }, ["w 464 · gap 12 · checklist gap 13"]);

    showcaseComponent(sec, "Logo / Cell", function () {
      var logoCell = F("Logo / Cell", { w: 160, h: 66, fixH: true, align: "CENTER", cross: "CENTER" });
      logoCell.resize(160, 66);
      T(logoCell, "Partner", { s: 14, c: C.offBlack, lh: 19.6, font: fM }).opacity = 0.4;
      return logoCell;
    }, ["160×66 · text opacity 0.4"]);

    showcaseComponent(sec, "Logo / Strip · Count=6", function () {
      var stripWrap = F("Logo / Strip", { hugW: true });
      var strip = row(stripWrap, 20);
      for (var i = 0; i < 6; i++) {
        var cell = F("cell", { parent: strip, w: 120, h: 66, fixH: true, align: "CENTER", cross: "CENTER" });
        cell.resize(120, 66);
        T(cell, "Logo", { s: 12, c: C.darkErGrey });
      }
      return stripWrap;
    }, ["6 cells · 120×66 · gap 20"]);

    showcaseComponent(sec, "Card / Image 4:5", function () {
      var imgCard = F("Card / Image 4:5", { w: 340, h: 425, fixH: true, r: 24, pt: 32, pr: 27, pb: 32, pl: 27, fills: [solid(C.mediaGray)], align: "SPACE_BETWEEN", gap: 48 });
      imgCard.resize(340, 425);
      T(imgCard, "RUBIN", { s: 14, c: C.white, lh: 19.6, w: 500, font: fMono });
      var imgBot = F("bottom", { parent: imgCard, gap: 8 });
      T(imgBot, "Биржа — это только начало", { s: 24, c: C.white, lh: 28.8, font: fM });
      T(imgBot, "Своя сеть, движок и расчёты", { s: 14, c: C.white, lh: 19.6, font: fB }).opacity = 0.8;
      return imgCard;
    }, ["340×425 · ratio 4:5 · r 24", "pt 32 pr 27 pb 32 pl 27"]);

    var caseVariants = [];
    ["On", "Off"].forEach(function (filter) {
      caseVariants.push({
        name: "Filter=" + filter,
        build: function () {
          var cs = F("Case Study", { w: 260, h: 338, fixH: true, r: 8, pt: 30, pr: 30, pb: 30, pl: 30, fills: [solid(C.mediaGray)], align: "SPACE_BETWEEN", gap: 30 });
          cs.resize(260, 338);
          if (filter === "On") {
            var overlay = F("overlay", { parent: cs, w: 260, h: 338, fixH: true, fills: [solid(C.black, 0.3)] });
            overlay.resize(260, 338);
          }
          T(cs, "LOGO", { s: 12, c: C.white, lh: 16, w: 500, ls: 1, font: fM });
          T(cs, "Зачем бирже собственный L1", { s: 18, c: C.white, lh: 24, font: fM });
          return cs;
        },
      });
    });
    variantSetInShowcase(sec, "Card / Case Study 10:13", caseVariants, { cols: 2, colW: 280, rowH: 360, meta: ["260×338 · ratio 10:13 · r 8", "overlay black 30% when Filter=On"] });

    var hpVariants = [];
    ["Default", "Active"].forEach(function (state) {
      hpVariants.push({
        name: "State=" + state,
        build: function () {
          var hp = F("Product Wide", {
            w: state === "Active" ? 600 : 520,
            pt: 64, pr: state === "Active" ? 75 : 43, pb: 64, pl: state === "Active" ? 75 : 43,
            r: state === "Active" ? 0 : 16,
            fills: [solid(C.sand)], gap: 16, align: "CENTER", cross: "CENTER",
          });
          T(hp, "Биржа перпов", { s: 32, c: C.offBlack, lh: 35.2, align: "CENTER", font: fM });
          T(hp, "Кошелёк или email, пополнение USDC", { s: 16, c: C.offBlack, lh: 22.4, align: "CENTER", font: fB }).opacity = 0.6;
          return hp;
        },
      });
    });
    variantSetInShowcase(sec, "Card / Product Wide", hpVariants, { cols: 2, colW: 620, rowH: 200, meta: ["Default 520 · Active 600 · sand fill", "pt/pb 64 · r 0 active / 16 default"] });

    showcaseComponent(sec, "Quote / Wall Card", function () {
      var wall = F("Quote / Wall Card", { w: 320, pt: 30, pr: 30, pb: 30, pl: 30, r: 35, fills: [solid(C.white)], gap: 16 });
      try {
        wall.effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.1 }, offset: { x: 0, y: 4 }, radius: 24, spread: 0, visible: true, blendMode: "NORMAL" }];
      } catch (e) {}
      T(wall, "«Умный агент без ограничений — это автоматизация риска»", { s: 18, c: C.offBlack, lh: 24, font: fB });
      monoBrand(T(wall, "Команда RUBIN · Telegram, 28.07.2026", { s: 14, c: C.offBlack, lh: 19.6, font: fB }), fMono).opacity = 0.65;
      return wall;
    }, ["w 320 · r 35 · shadow y 4 blur 24", "pt/pr/pb/pl 30"]);

    showcaseComponent(sec, "Pricing / Calculator", function () {
      var calc = F("Pricing / Calculator", { w: 500, gap: 24 });
      var calcSel = buildInputField({ state: "Filled", theme: "Light", size: "Compact" });
      calcSel.resize(200, 38);
      calc.appendChild(calcSel);
      buildRangeTrack(calc, 400, 180);
      T(calc, "$12,000", { s: 72, c: C.offBlack, lh: 72, ls: -2.88, font: fM });
      T(calc, "$30 per user / month", { s: 16, c: C.offBlack, lh: 22.4, font: fB }).opacity = 0.6;
      return calc;
    }, ["w 500 · range 400×32", "display 72/72 ls -2.88"]);

    var compRowVariants = [];
    ["Header", "Body"].forEach(function (type) {
      compRowVariants.push({
        name: "Type=" + type,
        build: function () {
          var cmpRow = F("Comparison Row", { w: 1110, dir: "HORIZONTAL", gap: 20, pt: type === "Header" ? 18 : 40, pb: type === "Header" ? 18 : 40, pr: 40, pl: 40, stroke: C.offBlack, strokeW: 1 });
          try { cmpRow.strokeBottomWeight = 1; cmpRow.strokeTopWeight = 0; } catch (e) {}
          var left = F("left", { parent: cmpRow, w: 337, gap: 4 });
          T(left, type === "Header" ? "Feature" : "Unlimited workspace search", { s: 16, c: C.offBlack, lh: 22.4, font: type === "Header" ? fM : fB });
          if (type === "Body") left.opacity = 0.6;
          var mid = F("mid", { parent: cmpRow, w: 120, align: "CENTER", cross: "CENTER" });
          T(mid, type === "Header" ? "Team" : "✓", { s: 16, c: C.offBlack, lh: 22.4, align: "CENTER", font: fM });
          if (type === "Header") mid.opacity = 0.6;
          var right = F("right", { parent: cmpRow, w: 372, gap: 4 });
          T(right, type === "Header" ? "Enterprise" : "Advanced security controls", { s: 16, c: C.offBlack, lh: 22.4, font: type === "Header" ? fM : fB });
          if (type === "Body") right.opacity = 0.6;
          return cmpRow;
        },
      });
    });
    variantSetInShowcase(sec, "Table / Comparison Row", compRowVariants, { cols: 2, colW: 580, rowH: 100, meta: ["w 1110 · header pt/pb 18 · body 40", "cols left 337 · mid 120 · right 372"] });

    showcaseComponent(sec, "Logo / Grid 7", function () {
      var logoGrid = F("Logo / Grid 7", { dir: "HORIZONTAL", gap: 20, w: 900 });
      for (var lg = 0; lg < 7; lg++) {
        var slot = F("slot", { parent: logoGrid, w: 100, h: 100, fixH: true, align: "CENTER", cross: "CENTER", fills: [solid(C.offBlack, 0.03)] });
        slot.resize(100, 100);
        T(slot, "Logo", { s: 12, c: C.darkErGrey, align: "CENTER" });
      }
      return logoGrid;
    }, ["7 cols · slot 100×100 · gap 20"]);

    return sec;
  }

  function buildFeedback(root) {
    var sec = F("Feedback", { parent: root, gap: 24, w: 1400 });
    sectionTitle(sec, "Feedback");

    var faqVariants = [];
    ["Closed", "Open"].forEach(function (state) {
      faqVariants.push({
        name: "State=" + state,
        build: function () {
          var f = F("FAQ Row", { w: 700, pt: 16, pb: state === "Open" ? 32 : 16, pr: 90, gap: 8, stroke: C.offBlack, strokeW: 1 });
          try { f.strokeTopWeight = 1; f.strokeBottomWeight = 0; f.strokeLeftWeight = 0; f.strokeRightWeight = 0; } catch (e) {}
          T(f, "Нужен ли кошелёк, чтобы начать?", { s: 16, c: C.offBlack, lh: 22.4, w: 500, font: fM });
          if (state === "Open") T(f, "Можно подключить кошелёк через WalletConnect или войти по email.", { s: 16, c: C.offBlack, lh: 22.4, font: fB });
          return f;
        },
      });
    });
    variantSetInShowcase(sec, "Accordion / FAQ Row", faqVariants, { cols: 2, colW: 360, rowH: 80, meta: ["w 700 · top stroke · pr 90", "open pb 32 · closed pb 16"] });

    var darkAccVariants = [];
    ["Default", "Active"].forEach(function (state) {
      darkAccVariants.push({
        name: "State=" + state,
        build: function () {
          var wrap = F("Dark Accordion", { w: 500, pt: 8, pb: state === "Active" ? 16 : 8, pl: 22, gap: 8, fills: [solid(C.offBlack)] });
          var top = row(wrap, 8);
          var marker = F("marker", { parent: top, w: 8, h: 8, fixH: true, r: 0, fills: [solid(C.error)] });
          marker.resize(8, 8);
          marker.opacity = state === "Active" ? 1 : 0.6;
          T(top, "Где исполняются мои сделки?", { s: 22, c: C.white, lh: 33, font: fB });
          top.opacity = state === "Active" ? 1 : 0.6;
          try { wrap.strokes = [solid(C.white, state === "Active" ? 0.6 : 0.3)]; wrap.strokeBottomWeight = 1; } catch (e) {}
          if (state === "Active") {
            T(wrap, "Матчинг, исполнение и клиринг выполняются внутри собственного L1.", { s: 18, c: C.white, lh: 27, font: fB }).opacity = 0.7;
          }
          return wrap;
        },
      });
    });
    variantSetInShowcase(sec, "Accordion / Dark Row", darkAccVariants, { cols: 2, colW: 280, rowH: 120, meta: ["w 500 · fill off-black · pl 22", "marker 8×8 error · text 22/33"] });

    showcaseComponent(sec, "Stat / Key", function () {
      var keyStat = F("Stat / Key", { w: 300, gap: 8, align: "CENTER", cross: "CENTER" });
      T(keyStat, "25%", { s: 48, c: C.offBlack, lh: 48, ls: -0.96, font: fM, align: "CENTER" });
      T(keyStat, "Productivity increase", { s: 14, c: C.offBlack, lh: 19.6, align: "CENTER", font: fB }).opacity = 0.6;
      return keyStat;
    }, ["w 300 · 48/48 ls -0.96", "caption 14 opacity 0.6"]);

    showcaseComponent(sec, "Stat / Counter Circle", function () {
      var counter = F("Stat / Counter Circle", { w: 191, h: 176, fixH: true, r: 64, fills: [solid(C.sand)], align: "CENTER", cross: "CENTER" });
      counter.resize(191, 176);
      T(counter, "112", { s: 112, c: C.offBlack, lh: 112, ls: -3.36, w: 500, font: fM, align: "CENTER" });
      return counter;
    }, ["191×176 · r 64 · sand", "display 112/112 ls -3.36"]);

    showcaseComponent(sec, "Slider / Controls", function () {
      var sliderWrap = F("Slider / Controls", { hugW: true });
      var slider = row(sliderWrap, 16);
      var dots = F("dots", { parent: slider, dir: "HORIZONTAL", gap: 0, pt: 8, pb: 9, pl: 20, pr: 20, r: 34, fills: [solid(C.black, 0.05)], cross: "CENTER" });
      for (var d = 0; d < 4; d++) {
        var dot = F("dot", { parent: dots, w: d === 0 ? 80 : 6, h: 6, fixH: true, r: 8, fills: [solid(d === 0 ? C.black : C.black, d === 0 ? 1 : 0.1)] });
        dot.resize(d === 0 ? 80 : 6, 6);
      }
      slider.appendChild(buildBtnInner("→", { variant: "Soft", size: "Default" }));
      return sliderWrap;
    }, ["dots r 34 · active pill 80×6", "gap 16 to icon button"]);

    showcaseComponent(sec, "Tooltip", function () {
      var tip = F("Tooltip", { gap: 2, align: "CENTER", cross: "CENTER" });
      var tipB = F("bubble", { parent: tip, pt: 5.5, pr: 12, pb: 2, pl: 12, r: 32, fills: [solid(C.black)] });
      T(tipB, "Helpful hint", { s: 14, c: C.white, lh: 19.6, font: fM });
      var trigger = F("trigger", { parent: tip, w: 32, h: 32, fixH: true, pt: 8, pb: 8, pl: 8, pr: 8, align: "CENTER", cross: "CENTER" });
      trigger.resize(32, 32);
      T(trigger, "?", { s: 14, c: C.offBlack, lh: 19.6, align: "CENTER" });
      return tip;
    }, ["bubble r 32 · black fill · above trigger", "trigger pad 8 · text 14/19.6"]);

    showcaseComponent(sec, "List / Check Item", function () {
      var checkWrap = F("List / Check Item", { hugW: true });
      var checkItem = row(checkWrap, 16);
      T(checkItem, "✓", { s: 16, c: C.offBlack });
      T(checkItem, "Пункт списка", { s: 16, c: C.offBlack, lh: 22.4, font: fB });
      return checkWrap;
    }, ["row gap 16 · text 16/22.4"]);

    return sec;
  }

  function buildLayout(root) {
    var sec = F("Layout", { parent: root, gap: 24, w: 1400 });
    sectionTitle(sec, "Layout");

    var mediaVariants = [];
    [
      { ratio: "16:9", w: 400, h: 225 },
      { ratio: "4:5", w: 340, h: 425 },
      { ratio: "1:1", w: 300, h: 300 },
    ].forEach(function (m) {
      ["8", "16", "24", "32"].forEach(function (rad) {
        mediaVariants.push({
          name: "Ratio=" + m.ratio + ", Radius=" + rad + ", Caption=Off, Overlay=None",
          build: function () {
            var f = F("Media", { w: m.w, gap: 0 });
            GRAY(f, m.w, m.h, Number(rad));
            return f;
          },
        });
      });
    });
    variantSetInShowcase(sec, "Media / Frame", mediaVariants.slice(0, 6), { cols: 3, colW: 420, rowH: 240, meta: ["ratios 16:9 · 4:5 · 1:1", "radius 8–32"] });

    showcaseComponent(sec, "Section / CTA Banner · Layout=Split", function () {
      var cta = F("Section / CTA Banner", { w: 1232, h: 200, fixH: true, dir: "HORIZONTAL", align: "SPACE_BETWEEN", cross: "CENTER", pt: 56, pr: 56, pb: 56, pl: 56, r: 16, fills: [solid(C.sand)] });
      cta.resize(1232, 200);
      var ctaL = F("left", { parent: cta, gap: 8 });
      T(ctaL, "Ready to get started?", { s: 48, c: C.offBlack, lh: 48, ls: -0.96, font: fM });
      T(ctaL, "Book an intro with our team.", { s: 18, c: C.offBlack, lh: 24, font: fB }).opacity = 0.6;
      cta.appendChild(buildBtnInner("Book an intro", { variant: "Primary", size: "Default" }));
      return cta;
    }, ["1232×200 · sand · r 16", "pt/pr/pb/pl 56 · H2 48 + body 18"]);

    // Extension: нет на референсе, добавлено под блоки лендинга RUBIN.
    showcaseComponent(sec, "Section / Hero", function () {
      var hero = F("Section / Hero", { w: 1600, gap: 32, align: "CENTER", cross: "CENTER", fills: [solid(C.white)] });
      T(hero, "Заголовок первого экрана", { s: 72, c: C.offBlack, lh: 68, ls: -2.16, font: fM, align: "CENTER", wdt: 1000 });
      T(hero, "Лид в две-три строки: продукт, ключевая выгода и способ входа.", { s: 20, c: C.offBlack, lh: 30, font: fB, align: "CENTER", wdt: 640 });
      var heroActs = F("actions", { parent: hero, dir: "HORIZONTAL", gap: 12, hugW: true, align: "CENTER", cross: "CENTER" });
      heroActs.appendChild(buildBtnInner("Начать торговлю", { variant: "Primary", size: "Large" }));
      heroActs.appendChild(buildBtnInner("Как это работает", { variant: "Soft", size: "Large" }));
      var heroMedia = F("media", { parent: hero, w: 1600, h: 900, fixH: true, r: 24, fills: [solid(C.mediaGray)], align: "CENTER", cross: "CENTER" });
      heroMedia.resize(1600, 900);
      T(heroMedia, "Фото: описание кадра", { s: 14, c: C.darkErGrey, lh: 20, font: fB, align: "CENTER" });
      return hero;
    }, ["extension · нет на референсе", "1600 · H1 72/68 ls −2.16 · media 16:9 r 24", "без кикера: дублировал первую фразу лида", "кнопки вшиты фреймами (Size=Large), от компонента Button не наследуются"]);

    var stepVariants = [];
    ["1", "2", "3"].forEach(function (n) {
      stepVariants.push({
        name: "Number=" + n,
        build: function () {
          var st = F("Step", { w: 400, gap: 16, pt: 32, pr: 32, pb: 32, pl: 32, r: 16, fills: [solid(C.sand)] });
          var badge = F("badge", { w: 40, h: 40, fixH: true, r: 999, fills: [solid(C.offBlack)], align: "CENTER", cross: "CENTER" });
          badge.resize(40, 40);
          T(badge, n, { s: 18, c: C.white, lh: 24, w: 500, font: fM, align: "CENTER" });
          st.appendChild(badge);
          T(st, "Заголовок шага", { s: 24, c: C.offBlack, lh: 28.8, font: fM });
          T(st, "Одно предложение о том, что делает пользователь на этом шаге.", { s: 16, c: C.offBlack, lh: 22.4, font: fB, wdt: 336 });
          return st;
        },
      });
    });
    variantSetInShowcase(sec, "Steps / Card", stepVariants, { cols: 3, colW: 420, rowH: 240, meta: ["extension · нет на референсе", "400 · sand r 16 · бейдж 40 · pt/pb 32"] });

    showcaseComponent(sec, "Timeline / Row 6", function () {
      var timeline = F("Timeline / Row 6", { w: 1600, gap: 24, fills: [solid(C.white)] });
      var tlLine = F("line", { parent: timeline, w: 1600, h: 1, fixH: true, fills: [solid(C.offBlack, 0.2)] });
      tlLine.resize(1600, 1);
      var TL_GAP = 16;
      var TL_COL = Math.floor((1600 - TL_GAP * 5) / 6); // 253 — шесть равных колонок
      var tlRow = F("points", { parent: timeline, w: 1600, dir: "HORIZONTAL", gap: TL_GAP });
      tlRow.counterAxisSizingMode = "AUTO"; // высота ряда — по содержимому, иначе точки обрежутся
      ["Апр 2026", "Май 2026", "Июн 2026", "Июл 2026", "Июл 2026", "Авг 2026"].forEach(function (date) {
        var pnt = F("point", { parent: tlRow, w: TL_COL, gap: 12 });
        // ширина колонки только фиксированная: layoutGrow и FIXED взаимоисключающи,
        // при их сочетании первая точка забирает весь ряд, остальные схлопываются
        try {
          if ("layoutSizingHorizontal" in pnt) pnt.layoutSizingHorizontal = "FIXED";
          pnt.layoutGrow = 0;
          pnt.resize(TL_COL, Math.max(pnt.height, 1));
        } catch (e) {}
        F("dot", { parent: pnt, dir: "NONE", w: 8, h: 8, r: 999, fills: [solid(C.offBlack)] });
        T(pnt, date, { s: 14, c: C.offBlack, lh: 19.6, w: 500, font: fM });
        T(pnt, "Событие одной строкой", { s: 14, c: C.offBlack, lh: 19.6, font: fB, wdt: TL_COL }).opacity = 0.6;
      });
      return timeline;
    }, ["extension · нет на референсе", "1600 · линия 1px black 20% · 6 точек, gap 16"]);

    showcaseComponent(sec, "Divider · Direction=Horizontal, Theme=Light", function () {
      var divH = F("Divider", { w: 400, h: 1, fixH: true, fills: [solid(C.offBlack, 0.2)] });
      divH.resize(400, 1);
      return divH;
    }, ["400×1 · fill black 20%"]);

    showcaseComponent(sec, "Integration / Item · Size=Full", function () {
      var intItem = F("Integration / Item", { w: 360, dir: "HORIZONTAL", gap: 12, pt: 20, pr: 20, pb: 20, pl: 20, r: 32, fills: [solid(C.white)], stroke: C.offBlack, strokeW: 1 });
      var ic = F("icon", { parent: intItem, w: 40, h: 40, fixH: true, r: 10, fills: [solid(C.white)], stroke: C.offBlack, strokeW: 1 });
      ic.resize(40, 40);
      T(ic, "S", { s: 14, c: C.offBlack, align: "CENTER" });
      var intTxt = F("txt", { parent: intItem, gap: 4 });
      T(intTxt, "Slack", { s: 16, c: C.offBlack, lh: 22.4, w: 500, font: fM });
      T(intTxt, "Messaging", { s: 14, c: C.offBlack, lh: 19.6, font: fB }).opacity = 0.6;
      return intItem;
    }, ["w 360 · r 32 · pt 20", "icon 40×40 r 10"]);

    showcaseComponent(sec, "Person / Row", function () {
      var person = F("Person / Row", { dir: "HORIZONTAL", gap: 20, cross: "CENTER", hugW: true });
      var photo = F("photo", { parent: person, w: 48, h: 48, fixH: true, r: 8, fills: [solid(C.mediaGray)] });
      photo.resize(48, 48);
      var pTxt = F("txt", { parent: person, gap: 2 });
      T(pTxt, "Alex Johnson", { s: 16, c: C.offBlack, lh: 22.4, w: 500, font: fM });
      T(pTxt, "Head of Product", { s: 14, c: C.offBlack, lh: 19.6, font: fB }).opacity = 0.6;
      return person;
    }, ["photo 48×48 r 8", "gap 20 · title 16/22.4"]);

    showcaseComponent(sec, "Section / Footer · Theme=Light", function () {
      var foot = F("Section / Footer", { w: 1496, pt: 40, pb: 24, gap: 48, fills: [solid(C.white)] });
      var footInner = row(foot, 80);
      var footL = F("left", { parent: footInner, gap: 20, w: 300 });
      T(footL, "◉", { s: 40, c: C.offBlack });
      T(footL, "Subscribe to our newsletter", { s: 14, c: C.offBlack, lh: 19.6, font: fMed });
      var footR = row(footInner, 20);
      [["Product", ["Agents", "Integrations"]], ["Company", ["About", "Careers"]], ["Resources", ["Help", "Privacy"]]].forEach(function (col) {
        var c = F("col", { parent: footR, gap: 8, w: 160 });
        T(c, col[0], { s: 14, c: C.offBlack, lh: 19.6, w: 500, font: fM });
        col[1].forEach(function (l) { T(c, l, { s: 14, c: C.offBlack, lh: 19.6, font: fB }).opacity = 0.6; });
      });
      return foot;
    }, ["w 1496 · pt 40 pb 24", "3 link cols · w 160"]);

    var brandRow = row(sec, 32);
    showcaseComponent(brandRow, "Brand / Wordmark", function () {
      var wordmark = F("Brand / Wordmark", { hugW: true, cross: "CENTER" });
      T(wordmark, "RUBIN", { s: 24, c: C.offBlack, lh: 24, w: 500, font: fMonoBold });
      return wordmark;
    }, ["text 20/20 · w 500"]);
    showcaseComponent(brandRow, "Brand / Symbol", function () {
      var symbol = F("Brand / Symbol", { w: 40, h: 40, fixH: true, r: 8, fills: [solid(C.offBlack)], align: "CENTER", cross: "CENTER" });
      symbol.resize(40, 40);
      T(symbol, "◉", { s: 24, c: C.white, align: "CENTER" });
      return symbol;
    }, ["40×40 · r 8 · off-black"]);

    showcaseComponent(sec, "Section / Sticky CTA", function () {
      var stickyCta = F("Section / Sticky CTA", { w: 1496, dir: "HORIZONTAL", align: "CENTER", cross: "CENTER", pt: 24, pr: 24, pb: 24, pl: 24, fills: [solid(C.white)] });
      try {
        stickyCta.effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.08 }, offset: { x: 0, y: -8 }, radius: 24, spread: 0, visible: true, blendMode: "NORMAL" }];
      } catch (e) {}
      stickyCta.appendChild(buildBtnInner("Book an intro", { variant: "Primary", size: "Default" }));
      return stickyCta;
    }, ["w 1496 · shadow y -8 blur 24", "pt/pr/pb/pl 24"]);

    showcaseComponent(sec, "Chat bar", function () {
      var chat = F("Chat bar", { w: 900, h: 77, fixH: true, dir: "HORIZONTAL", align: "SPACE_BETWEEN", cross: "CENTER", pt: 12, pr: 12, pb: 12, pl: 16, r: 70, fills: [solid(C.white)] });
      chat.resize(900, 77);
      applyHairline(chat);
      T(chat, "Спросите агента о рынке…", { s: 16, c: C.darkErGrey, lh: 22.4, font: fB });
      var chatBtn = F("send", { parent: chat, dir: "HORIZONTAL", hugW: true, align: "CENTER", cross: "CENTER", pt: 0, pr: 44, pb: 0, pl: 16, r: 40, fills: [solid(C.black)] });
      T(chatBtn, "Send", { s: 14, c: C.white, lh: 19.6, vAlign: "CENTER", font: fMed });
      try {
        chatBtn.resize(chatBtn.width, 38);
        chatBtn.primaryAxisSizingMode = "AUTO";
        chatBtn.counterAxisSizingMode = "FIXED";
      } catch (e) {}
      return chat;
    }, ["900×77 · r 70 · hairline", "send pill r 40 black"]);

    return sec;
  }

  async function generateDesignSystem() {
    figma.notify("Собираю DS…", { timeout: 4000 });

    var pageName = "DS · RUBIN components";
    var page = null;
    figma.root.children.forEach(function (p) {
      if (p.name === pageName) page = p;
    });
    if (!page) page = figma.createPage();
    page.name = pageName;
    await figma.setCurrentPageAsync(page);

    page.children.forEach(function (ch) { ch.remove(); });

    var pageRoot = F("DS · RUBIN components", { parent: page, w: 1728, gap: 48, pt: 80, pb: 80, pl: 64, pr: 64, fills: [solid(C.white)] });
    pageRoot.layoutMode = "VERTICAL";
    pageRoot.primaryAxisSizingMode = "AUTO";
    pageRoot.counterAxisSizingMode = "FIXED";
    pageRoot.resize(1728, pageRoot.height);

    var header = F("header", { parent: pageRoot, gap: 8, pb: 16 });
    T(header, "DS · RUBIN components", { s: 48, c: C.offBlack, lh: 48, ls: -0.96, font: fM });
    T(header, "Algorytm + Algorytm Mono · артборд 1728", { s: 14, c: C.darkErGrey, lh: 19.6, font: fB });

    buildFoundations(pageRoot);
    buildActions(pageRoot);
    buildForms(pageRoot);
    buildNavigation(pageRoot);
    buildCards(pageRoot);
    buildFeedback(pageRoot);
    buildLayout(pageRoot);

    pageRoot.resize(1728, pageRoot.height);
    figma.currentPage.selection = [pageRoot];
    figma.viewport.scrollAndZoomIntoView([pageRoot]);
    figma.notify("DS · RUBIN components — готово");
  }

  return { generateDesignSystem: generateDesignSystem };
}
