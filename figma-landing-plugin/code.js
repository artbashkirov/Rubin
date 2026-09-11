/**
 * RUBIN — 13 reference layouts × RUBIN copy · Google Sans
 * Refs: basecraft, 11x, kling, vidu, moonvalley, luma, runway,
 *       tavus, harvey, descript, arcads, sana, synthesia
 */
(async function main() {
  var available = await figma.listAvailableFontsAsync();
  var byFamily = {};
  available.forEach(function (f) {
    if (!byFamily[f.fontName.family]) byFamily[f.fontName.family] = [];
    byFamily[f.fontName.family].push(f.fontName.style);
  });

  async function loadGoogleSans() {
    var families = ["Google Sans", "Google Sans Text"];
    var want = ["Regular", "Medium", "Bold", "SemiBold"];
    for (var i = 0; i < families.length; i++) {
      var fam = families[i];
      if (!byFamily[fam]) continue;
      var loaded = {};
      for (var j = 0; j < want.length; j++) {
        if (byFamily[fam].indexOf(want[j]) !== -1) {
          var fn = { family: fam, style: want[j] };
          await figma.loadFontAsync(fn);
          loaded[want[j]] = fn;
        }
      }
      if (Object.keys(loaded).length) {
        return {
          family: fam,
          regular: loaded.Regular || loaded.Medium || loaded.Bold,
          medium: loaded.Medium || loaded.SemiBold || loaded.Bold || loaded.Regular,
          bold: loaded.Bold || loaded.SemiBold || loaded.Medium || loaded.Regular,
          display: loaded.Medium || loaded.Bold || loaded.SemiBold || loaded.Regular,
        };
      }
    }
    return null;
  }

  async function pickFont(candidates, styles) {
    for (var i = 0; i < candidates.length; i++) {
      var fam = candidates[i];
      if (!byFamily[fam]) continue;
      for (var j = 0; j < styles.length; j++) {
        if (byFamily[fam].indexOf(styles[j]) !== -1) {
          var fn = { family: fam, style: styles[j] };
          await figma.loadFontAsync(fn);
          return fn;
        }
      }
      var fn2 = { family: fam, style: byFamily[fam][0] };
      await figma.loadFontAsync(fn2);
      return fn2;
    }
    var fb = { family: "Inter", style: "Regular" };
    await figma.loadFontAsync(fb);
    return fb;
  }

  var gs = await loadGoogleSans();
  var fDisplay, fBody, fMed, fontLabel;
  if (gs) {
    fDisplay = gs.display;
    fBody = gs.regular;
    fMed = gs.medium;
    fontLabel = gs.family;
  } else {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    try { await figma.loadFontAsync({ family: "Inter", style: "Medium" }); } catch (e) {}
    var fallback = ["Google Sans Text", "Product Sans", "Inter"];
    fDisplay = await pickFont(fallback, ["Medium", "Bold", "SemiBold", "Regular"]);
    fBody = await pickFont(fallback, ["Regular", "Medium"]);
    fMed = await pickFont([fBody.family].concat(fallback), ["Medium", "SemiBold", "Bold", "Regular"]);
    fontLabel = fDisplay.family + " (fallback)";
  }

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
  function shadow(n, y, blur, a) {
    try {
      n.effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: a || 0.12 }, offset: { x: 0, y: y || 16 }, radius: blur || 40, spread: 0, visible: true, blendMode: "NORMAL" }];
    } catch (e) {}
  }

  var fD = fDisplay, fB = fBody, fM = fMed;
  var fontBox = { current: null };

  // Site fonts → nearest match from fonts installed / available in Figma (cannot fetch WOFF from URLs).
  var REF_FONT_SPECS = {
    basecraft: { site: "Google Sans", sans: ["Google Sans", "Google Sans Text", "Product Sans"], display: ["Google Sans", "Google Sans Text"] },
    "11x": { site: "ES Allianz", sans: ["Inter", "Helvetica Neue", "Arial"], display: ["Inter", "Helvetica Neue"] },
    kling: { site: "PingFang SC", sans: ["PingFang SC", "Noto Sans SC", "Inter"], display: ["PingFang SC", "Noto Sans SC", "Inter"] },
    vidu: { site: "system-ui", sans: ["Inter", "Roboto", "Helvetica Neue"], display: ["Inter", "Roboto"] },
    moonvalley: { site: "PP Neue Corp", sans: ["Inter Tight", "Inter", "Helvetica Neue"], display: ["Inter Tight", "Inter"] },
    luma: { site: "Graphik", sans: ["Graphik", "Inter", "Helvetica Neue"], display: ["Graphik", "Inter"] },
    runway: { site: "abcNormal", sans: ["Inter", "Helvetica Neue", "Arial"], display: ["Inter", "Helvetica Neue"] },
    tavus: { site: "Perfectly Nineties", sans: ["Inter", "Helvetica Neue"], serif: ["Georgia", "Playfair Display", "Times New Roman"], display: ["Georgia", "Playfair Display"], useSerifH1: true },
    harvey: { site: "Harvey Serif", sans: ["Inter", "Helvetica Neue"], serif: ["Georgia", "Libre Baskerville", "Times New Roman", "Instrument Serif"], display: ["Georgia", "Libre Baskerville"], useSerifH1: true },
    descript: { site: "Brett", sans: ["Inter", "Poppins", "DM Sans"], display: ["Inter", "Poppins"] },
    arcads: { site: "Sohne", sans: ["Inter", "Helvetica Now Display", "DM Sans"], display: ["Inter", "Helvetica Now Display"] },
    sana: { site: "Sana Sans", sans: ["Inter", "Google Sans", "Helvetica Neue"], display: ["Inter", "Google Sans"] },
    synthesia: { site: "Basiersquare", sans: ["Inter", "Work Sans", "Helvetica Neue"], display: ["Inter", "Work Sans"] },
  };

  async function loadRefFontSet(spec) {
    var body = await pickFont(spec.sans, ["Regular", "Light", "Medium"]);
    var medium = await pickFont(spec.sans, ["Medium", "SemiBold", "Bold", "Regular"]);
    var display = await pickFont(spec.display || spec.sans, ["Medium", "Bold", "SemiBold", "Regular"]);
    var serif = spec.serif ? await pickFont(spec.serif, ["Regular", "Medium", "Bold", "Italic"]) : null;
    var used = display.family;
    var resolved = used === spec.site ? used : (used + " ≈ " + spec.site);
    return { site: spec.site, body: body, medium: medium, display: display, serif: serif, useSerifH1: !!spec.useSerifH1, resolved: resolved };
  }

  async function loadAllRefFontSets() {
    var sets = {};
    var keys = Object.keys(REF_FONT_SPECS);
    for (var i = 0; i < keys.length; i++) sets[keys[i]] = await loadRefFontSet(REF_FONT_SPECS[keys[i]]);
    return sets;
  }

  function pickTextFont(o) {
    o = o || {};
    if (o.font) return o.font;
    var fs = fontBox.current;
    if (fs) {
      if (fs.useSerifH1 && fs.serif && o.s >= 48) return fs.serif;
      if (o.s >= 40) return fs.display;
      if (o.w >= 500) return fs.medium;
      return fs.body;
    }
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
        f.layoutGrow = o.layoutGrow || 0;
        if ("layoutSizingVertical" in f) f.layoutSizingVertical = o.fixH && o.h ? "FIXED" : "HUG";
        if ("layoutSizingHorizontal" in f) f.layoutSizingHorizontal = o.hugW ? "HUG" : (o.w ? "FIXED" : "HUG");
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
      f.primaryAxisSizingMode = "FIXED";
      f.counterAxisSizingMode = "FIXED";
    } else if (o.w) {
      f.resize(o.w, Math.max(f.height, 1));
    }
    if (o.sh) shadow(f, o.shY, o.shB, o.shA);
    return f;
  }

  function T(parent, chars, o) {
    o = o || {};
    var t = figma.createText();
    t.fontName = pickTextFont(o);
    t.characters = chars;
    t.fontSize = o.s || 16;
    t.fills = [solid(o.c)];
    if (o.lh) t.lineHeight = { unit: "PIXELS", value: o.lh };
    if (o.ls) t.letterSpacing = { unit: "PIXELS", value: o.ls };
    if (o.align) t.textAlignHorizontal = o.align;
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

  function PH(parent, w, h, label, bg, r, mediaType) {
    var p = F("media", {
      parent: parent,
      w: w,
      h: h,
      fixH: true,
      fills: [solid(bg || hex("E4E4E4"))],
      r: r == null ? 12 : r,
    });
    if (parent && parent.layoutMode !== "NONE") lockPhotoLayout(p, w, h);
    return p;
  }

  function GRAY(parent, w, h, r) {
    var g = F("media", { parent: parent, w: w, h: h, fixH: true, fills: [solid(hex("E4E4E4"))], r: r == null ? 0 : r });
    if (parent && parent.layoutMode !== "NONE") lockPhotoLayout(g, w, h);
    return g;
  }

  var page = figma.createPage();
  page.name = "RUBIN · 13 референсов + Sana clone · Google Sans";
  await figma.setCurrentPageAsync(page);

  // Figma createImageAsync accepts ONLY PNG / JPEG / GIF — not WebP / SVG.
  // Proxy through wsrv.nl to convert Sana CDN assets to JPEG/PNG.
  function sanaJpg(path, w) {
    var src = path.indexOf("http") === 0 ? path.replace(/^https?:\/\//, "") : ("sana-labs.b-cdn.net/" + path);
    return "https://wsrv.nl/?url=" + encodeURIComponent(src) + "&output=jpg&q=85" + (w ? ("&w=" + w) : "");
  }
  function sanaPng(path, w) {
    var src = path.indexOf("http") === 0 ? path.replace(/^https?:\/\//, "") : ("sana-labs.b-cdn.net/" + path);
    return "https://wsrv.nl/?url=" + encodeURIComponent(src) + "&output=png" + (w ? ("&w=" + w) : "");
  }

  var SANA_IMG = {
    hero: sanaJpg("products/sana/sana-hero.webp", 1600),
    platformA: sanaJpg("agents/features/agents_carousel_search.webp", 900),
    platformB: sanaJpg("agents/features/agents_carousel_search.webp", 900),
    featureA: sanaJpg("agents/features/agents_carousel_search.webp", 1400),
    featureB: sanaJpg("agents-features-bg.webp", 1400),
    quoteA: sanaJpg("agents/agents-quote-bg-01.webp", 900),
    quoteB: sanaJpg("agents/agents-quote-bg-02.webp", 900),
    model: sanaJpg("agents/agents-model-agnostic.webp", 1000),
    teams: sanaJpg("agents/agents-banner-01.webp", 1000),
    partnership: sanaJpg("agents/agents-partnerships.webp", 1400),
    ios: sanaJpg("agents/agents-ios-app.webp", 800),
    logos: [
      "strava", "polestar", "merck", "apollo.io", "robinhood", "amgen", "electrolux",
    ].map(function (n) { return sanaPng("partners/black/" + n + ".svg", 320); }),
    integrations: [
      "google-meet", "google-drive", "google-calendar", "dropbox", "confluence", "jira",
      "servicenow", "salesforce", "teams", "sharepoint", "workday", "slack",
    ].map(function (n) {
      return sanaPng("https://sanalabs.com/img/assistant-platform-integrations-icons/" + n + ".svg", 128);
    }),
    security: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (i) {
      var n = (i < 10 ? "0" : "") + i;
      return sanaPng("https://sanalabs.com/img/assistant-platform-integrations-icons/agents-security-icons-" + n + ".svg", 128);
    }),
  };
  var imageCache = {};

  async function preloadSanaImages() {
    var urls = [];
    Object.keys(SANA_IMG).forEach(function (k) {
      if (Array.isArray(SANA_IMG[k])) urls = urls.concat(SANA_IMG[k]);
      else urls.push(SANA_IMG[k]);
    });
    urls = urls.filter(function (u, i, a) { return a.indexOf(u) === i; });
    var ok = 0;
    var fail = 0;
    for (var i = 0; i < urls.length; i++) {
      try {
        imageCache[urls[i]] = await figma.createImageAsync(urls[i]);
        ok++;
      } catch (e) {
        fail++;
        console.warn("Sana image failed:", urls[i], e);
      }
    }
    return { ok: ok, fail: fail, total: urls.length };
  }

  function IMG(parent, w, h, url, r, scaleMode) {
    var cached = url && imageCache[url];
    var fills = cached ? [{ type: "IMAGE", scaleMode: scaleMode || "FILL", imageHash: cached.hash }] : [solid(hex("E4E4E4"))];
    var g = F(url ? url.split("/").pop() : "img", { parent: parent, w: w, h: h, fixH: true, fills: fills, r: r == null ? 0 : r });
    if (parent && parent.layoutMode !== "NONE") lockPhotoLayout(g, w, h);
    return g;
  }

  function cloneMedia(parent, w, h, r, url, useImages, scaleMode) {
    if (useImages && url) return IMG(parent, w, h, url, r, scaleMode);
    return GRAY(parent, w, h, r);
  }

  function BTN_SM(parent, label, bg, tc, r) {
    var b = F("btn", { parent: parent, dir: "HORIZONTAL", hugW: true, hugH: true, align: "CENTER", cross: "CENTER", pt: 10, pr: 22, pb: 10, pl: 22, fills: [solid(bg)], r: r == null ? 999 : r });
    T(b, label, { s: 14, c: tc, w: 500, font: pickTextFont({ w: 500 }) });
    return b;
  }

  function BTN(parent, label, bg, tc, r) {
    return BTN_SM(parent, label, bg, tc, r);
  }

  function NAV_SANA(root, t) {
    var nav = F("00 Навигация", { parent: root, w: 1440, h: 48, fixH: true, dir: "HORIZONTAL", align: "SPACE_BETWEEN", cross: "CENTER", pl: t.padX, pr: t.padX, fills: [solid(t.bg)] });
    nav.resize(1440, 48); nav.primaryAxisSizingMode = "FIXED"; nav.counterAxisSizingMode = "FIXED";
    T(nav, "RUBIN", { s: 14, c: t.text, w: 500, ls: 1.2, font: fM });
    var mid = F("mid", { parent: nav, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 28, cross: "CENTER" });
    ["Продукт", "Возможности", "Люди", "Тарифы"].forEach(function (l) { T(mid, l, { s: 14, c: t.muted }); });
    var acts = F("acts", { parent: nav, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 16, cross: "CENTER" });
    T(acts, "Войти", { s: 14, c: t.muted });
    BTN_SM(acts, "Начать", t.accent, t.accentText, t.rBtn);
    return nav;
  }

  function FOOT_SANA(root, t) {
    var foot = F("12 Подвал", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 80, pb: 48, pl: t.padX, pr: t.padX, gap: 48 });
    var cols = F("cols", { parent: foot, w: cw(t), dir: "HORIZONTAL", gap: 80, align: "SPACE_BETWEEN" });
    [["RUBIN", ["Продукт", "Возможности", "Люди", "Тарифы"]], ["Компания", ["О нас", "Блог", "Карьера", "Пресса"]], ["Поддержка", ["Помощь", "Безопасность", "Комиссии", "Контакты"]]].forEach(function (col) {
      var c = F("col", { parent: cols, w: 200, gap: 16 });
      T(c, col[0], { s: 14, c: t.text, w: 500, font: fM });
      col[1].forEach(function (l) { T(c, l, { s: 14, c: t.muted }); });
    });
    var nl = F("nl", { parent: foot, w: cw(t), dir: "HORIZONTAL", gap: 40, align: "SPACE_BETWEEN", cross: "CENTER" });
    T(nl, "© 2026 RUBIN · Крипта — это про людей", { s: 13, c: t.muted });
    var er = F("er", { parent: nl, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 10, cross: "CENTER" });
    var em = F("em", { parent: er, w: 220, h: 44, fixH: true, align: "MIN", cross: "CENTER", pl: 16, fills: [solid(t.bg)], r: 999, stroke: t.line });
    em.resize(220, 44); em.primaryAxisSizingMode = "FIXED"; em.counterAxisSizingMode = "FIXED";
    T(em, "you@email.com", { s: 14, c: t.muted });
    BTN_SM(er, "Начать", t.accent, t.accentText, t.rBtn);
  }

  function NAV_SANA_CLONE(root, t) {
    var nav = F("00 Nav", { parent: root, w: 1440, h: 48, fixH: true, dir: "HORIZONTAL", align: "SPACE_BETWEEN", cross: "CENTER", pl: t.padX, pr: t.padX, fills: [solid(t.bg)] });
    nav.resize(1440, 48); nav.primaryAxisSizingMode = "FIXED"; nav.counterAxisSizingMode = "FIXED";
    T(nav, "Sana", { s: 14, c: t.text, w: 500, ls: 1.2, font: fM });
    var mid = F("mid", { parent: nav, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 24, cross: "CENTER" });
    ["Products", "Capabilities", "Solutions", "Resources", "Pricing"].forEach(function (l) { T(mid, l, { s: 14, c: t.muted }); });
    var acts = F("acts", { parent: nav, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 16, cross: "CENTER" });
    ["Mission", "Careers", "Log in"].forEach(function (l) { T(acts, l, { s: 14, c: t.muted }); });
    BTN_SM(acts, "Book an intro", t.accent, t.accentText, t.rBtn);
    return nav;
  }

  function FOOT_SANA_CLONE(root, t) {
    var foot = F("Footer", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 80, pb: 48, pl: t.padX, pr: t.padX, gap: 48 });
    var cols = F("cols", { parent: foot, w: cw(t), dir: "HORIZONTAL", gap: 80, align: "SPACE_BETWEEN" });
    [["Product", ["Sana Agents", "Integrations", "Security", "Pricing"]], ["Company", ["About", "Blog", "Careers", "Press"]], ["Resources", ["Help center", "Privacy", "Terms", "Contact"]]].forEach(function (col) {
      var c = F("col", { parent: cols, w: 200, gap: 16 });
      T(c, col[0], { s: 14, c: t.text, w: 500, font: fM });
      col[1].forEach(function (l) { T(c, l, { s: 14, c: t.muted }); });
    });
    var nl = F("nl", { parent: foot, w: cw(t), dir: "HORIZONTAL", gap: 40, align: "SPACE_BETWEEN", cross: "CENTER" });
    T(nl, "© 2026 Sana Labs", { s: 13, c: t.muted });
    var er = F("er", { parent: nl, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 10, cross: "CENTER" });
    var em = F("em", { parent: er, w: 260, h: 44, fixH: true, align: "MIN", cross: "CENTER", pl: 16, fills: [solid(t.bg)], r: 999, stroke: t.line });
    em.resize(260, 44); em.primaryAxisSizingMode = "FIXED"; em.counterAxisSizingMode = "FIXED";
    T(em, "you@email.com", { s: 14, c: t.muted });
    BTN_SM(er, "Subscribe", t.accent, t.accentText, t.rBtn);
  }

  function NAV(root, t, px, navH) {
    var nav = F("00 Навигация", { parent: root, w: 1440, h: navH || 64, fixH: true, dir: "HORIZONTAL", align: "SPACE_BETWEEN", cross: "CENTER", pl: px, pr: px, fills: [solid(t.bg)] });
    nav.resize(1440, navH || 64); nav.primaryAxisSizingMode = "FIXED"; nav.counterAxisSizingMode = "FIXED";
    if (t.line) { nav.strokes = [solid(t.line)]; nav.strokeBottomWeight = 1; nav.strokeTopWeight = 0; nav.strokeLeftWeight = 0; nav.strokeRightWeight = 0; }
    T(nav, "RUBIN", { s: 14, c: t.text, w: 500, ls: 1.2, font: fM });
    var acts = F("acts", { parent: nav, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 20, cross: "CENTER" });
    ["Продукт", "Люди", "Доверие"].forEach(function (l) { T(acts, l, { s: 14, c: t.muted }); });
    BTN(acts, "Начать", t.accent, t.accentText, t.rBtn);
    return nav;
  }

  function FOOT(root, t, px) {
    var foot = F("10 Подвал", { parent: root, w: 1440, fills: [solid(t.surface2 || t.bg)], pt: 56, pb: 36, pl: px, pr: px, gap: 32 });
    T(foot, "RUBIN · Крипта — это про людей", { s: 13, c: t.muted });
    T(foot, "© 2026 RUBIN · " + t.ref, { s: 12, c: t.muted });
  }

  function finalize(root) {
    root.layoutMode = "VERTICAL";
    root.itemSpacing = 0;
    root.clipsContent = false;
    root.counterAxisSizingMode = "FIXED";
    root.primaryAxisSizingMode = "AUTO";
    root.children.forEach(function (ch) {
      try {
        ch.clipsContent = false;
        if ("layoutAlign" in ch) { ch.layoutAlign = "STRETCH"; ch.layoutGrow = 0; }
        if (ch.type === "FRAME" && ch.width !== 1440) {
          ch.counterAxisSizingMode = "FIXED";
          ch.resize(1440, ch.height);
        }
      } catch (e) {}
    });
    root.resize(1440, root.height);
  }

  function unclip(node) {
    try {
      if (node.type === "FRAME") node.clipsContent = false;
      if ("children" in node) node.children.forEach(unclip);
    } catch (e) {}
  }

  // ——— RUBIN copy ———
  var H1 = "Крипта — это\nпро людей";
  var LEAD = "Понятный старт без страха и пафоса. Биржа на человеческом языке — с подсказками рядом и без обещаний доходности.";
  var MYTHS = [
    ["«Это слишком сложно»", "Три шага старта — без учебника. Сложные инструменты лежат глубже и ждут, когда понадобятся.", "Человек за ноутбуком"],
    ["«Это опасно»", "Риски есть в любых финансах. Показываем, где лежат средства и что происходит на каждом шаге.", "Руки · телефон"],
    ["«Это не для меня»", "Крипта — не клуб посвящённых. Обычные люди начинают с малого.", "Двое разговаривают"],
  ];
  var STEPS = [
    ["01", "Создайте аккаунт", "Пара минут. Каждое поле объяснено.", "Регистрация"],
    ["02", "Пополните баланс", "Комиссию видно до подтверждения.", "Пополнение"],
    ["03", "Первая сделка", "Подсказки рядом. Можно с малой суммы.", "Сделка"],
  ];
  var PEOPLE = [
    ["Анна, 29", "Начала с 3 000 ₽", "Анна · окно"],
    ["Игорь, 41", "Рядом с работой", "Игорь · цех"],
    ["Мария, 34", "Понятный язык", "Мария · кофе"],
    ["Кирилл, 26", "С фондового рынка", "Кирилл · вечер"],
  ];
  var FEATS = [
    ["Понятный экран", "Сумма, цена и кнопка — всё для первой покупки.", "Экран · покупка"],
    ["Кошелёк рядом", "Баланс и вывод в одном месте.", "Экран · кошелёк"],
    ["Подсказки", "Термины раскрываются прямо в интерфейсе.", "Экран · подсказка"],
  ];
  var METRICS = [["24/7", "поддержка"], ["100%", "резервы"], ["0 ₽", "скрытых комиссий"], ["500 ₽", "минимальный старт"]];
  var LOGOS = ["Медиа", "Аудит", "Партнёр", "Комьюнити", "ВУЗ"];
  var RUBIN_METRICS6 = [
    ["Новичок", "15 мин", "до первой покупки"],
    ["Семья", "3 000 ₽", "спокойный старт"],
    ["Фрилансер", "24/7", "поддержка рядом"],
    ["Инвестор", "100%", "прозрачные резервы"],
    ["Бизнес", "0 ₽", "скрытых комиссий"],
    ["Все", "3", "шага до старта"],
  ];
  var RUBIN_QUOTES = [
    ["«Начала с трёх тысяч — и впервые поняла, что происходит на каждом шаге.»", "Анна, 29", "Начала с 3 000 ₽", "Анна · окно"],
    ["«Рядом с работой, между сменами — всё объяснено человеческим языком.»", "Игорь, 41", "Рядом с работой", "Игорь · цех"],
  ];
  var RUBIN_FEAT_SLIDER = [
    ["Три шага до первой сделки.", "Регистрация, пополнение и покупка — каждый шаг объяснён простым языком.", "Три шага", "Видео · три шага"],
    ["Понятный экран покупки", "Сумма, цена и кнопка — всё на одном экране.", "Экран", "Видео · экран покупки"],
    ["Баланс и вывод в одном месте", "Видно, где лежат средства и сколько стоит вывод.", "Кошелёк", "Видео · кошелёк"],
    ["Подсказки рядом с каждым действием", "Термины раскрываются прямо в интерфейсе.", "Подсказки", "Видео · подсказки"],
    ["Люди важнее интерфейса", "Поддержка и комьюнити — без скринов профита.", "Люди", "Видео · люди"],
  ];
  var RUBIN_PRICING = [
    ["Старт", "0 ₽", ["Регистрация бесплатно", "Минимум от 500 ₽", "Базовые подсказки", "Поддержка в чате"]],
    ["Стандарт", "от 0,1%", ["Все способы пополнения", "Прозрачные комиссии", "Приоритетная поддержка", "Расширенные подсказки"]],
    ["Бизнес", "Индивидуально", ["Счёт для юрлиц", "Персональный менеджер", "API-доступ", "SLA и аудит"]],
  ];

  var COL = 1560;
  var ROW_H = 18000;

  var DAY = {
    bg: hex("FFFFFF"), surface: hex("FFFFFF"), surface2: hex("F6F5F4"),
    text: hex("0A1217"), muted: hex("6A7278"), accent: hex("0A1217"), accentText: hex("FFFFFF"),
    dark: hex("0A1217"), line: hex("E8E7E5"), footDark: false,
    ph: [hex("F6F5F4"), hex("F0EFED"), hex("EBEAE8"), hex("E8E7E5"), hex("F2F1EF")],
  };

  var refs = [
    { key: "01", ref: "basecraft.ru", title: "01 · Basecraft", layout: "basecraft", x: 0, y: 0,
      padX: 120, padY: 96, rBtn: 999 },
    { key: "02", ref: "11x.ai", title: "02 · 11x", layout: "11x", x: COL, y: 0,
      padX: 96, padY: 120, rBtn: 999 },
    { key: "03", ref: "kling.ai", title: "03 · Kling", layout: "kling", x: COL * 2, y: 0,
      padX: 80, padY: 100, rBtn: 999 },
    { key: "04", ref: "vidu.com", title: "04 · Vidu", layout: "vidu", x: COL * 3, y: 0,
      padX: 104, padY: 96, rBtn: 999 },
    { key: "05", ref: "moonvalley.ai", title: "05 · Moonvalley", layout: "moonvalley", x: COL * 4, y: 0,
      padX: 96, padY: 100, rBtn: 999 },
    { key: "06", ref: "lumalabs.ai", title: "06 · Luma", layout: "luma", x: COL * 5, y: 0,
      padX: 96, padY: 120, rBtn: 999 },
    { key: "07", ref: "runwayml.com", title: "07 · Runway", layout: "runway", x: COL * 6, y: 0,
      padX: 96, padY: 100, rBtn: 8 },
    { key: "08", ref: "tavus.io", title: "08 · Tavus", layout: "tavus", x: 0, y: ROW_H,
      padX: 104, padY: 100, rBtn: 999 },
    { key: "09", ref: "harvey.ai", title: "09 · Harvey", layout: "harvey", x: COL, y: ROW_H,
      padX: 120, padY: 140, rBtn: 4 },
    { key: "10", ref: "descript.com", title: "10 · Descript", layout: "descript", x: COL * 2, y: ROW_H,
      padX: 96, padY: 96, rBtn: 999 },
    { key: "11", ref: "arcads.ai", title: "11 · Arcads", layout: "arcads", x: COL * 3, y: ROW_H,
      padX: 96, padY: 88, rBtn: 999 },
    { key: "12", ref: "sanalabs.com/products/sana", title: "12 · Sana", layout: "sana", x: COL * 4, y: ROW_H,
      padX: 104, padY: 100, rBtn: 999 },
    { key: "13", ref: "synthesia.io", title: "13 · Synthesia", layout: "synthesia", x: COL * 5, y: ROW_H,
      padX: 104, padY: 96, rBtn: 999 },
  ].map(function (r) {
    return Object.assign({}, DAY, r);
  });

  function cw(t) { return 1440 - t.padX * 2; }
  function ph(t, i) { return t.ph[i % t.ph.length]; }
  function videoH16x9(w) { return Math.round(w * 9 / 16); }

  function VID(parent, w, label, bg, r) {
    var h = videoH16x9(w);
    var p = PH(parent, w, h, label || "Видео · 16:9 · немой луп · люди", bg, r, "video");
    return p;
  }

  function buildFullBleedVideoHero(root, t, opts) {
    opts = opts || {};
    var w = cw(t);
    NAV(root, t, t.padX, opts.navH || 56);
    var vh = videoH16x9(1440);
    var hero = F("01 Герой", { parent: root, w: 1440, h: vh, fixH: true, dir: "NONE", fills: [solid(t.bg)] });
    hero.resize(1440, vh);
    hero.primaryAxisSizingMode = "FIXED";
    hero.counterAxisSizingMode = "FIXED";
    var vid = VID(hero, 1440, opts.videoLabel || "Видео · 16:9 · немой луп · люди", opts.videoBg || ph(t, 0), 0);
    vid.x = 0;
    vid.y = 0;
    if (opts.scrim !== false) {
      var scrim = figma.createRectangle();
      scrim.resize(opts.scrimW || 720, vh);
      scrim.x = 0;
      scrim.y = 0;
      scrim.fills = [solid(opts.scrimColor || hex("FFFFFF"), opts.scrimA != null ? opts.scrimA : 0.72)];
      hero.appendChild(scrim);
    }
    var tc = opts.textColor || t.text;
    var lc = opts.leadColor || t.muted;
    T(hero, H1, { s: opts.h1 || 56, c: tc, lh: (opts.h1 || 56) + 2, ls: opts.ls || -1, wdt: opts.h1w || 520 }).x = t.padX;
    hero.children[hero.children.length - 1].y = opts.h1y != null ? opts.h1y : Math.round(vh * 0.32);
    T(hero, LEAD, { s: opts.leadS || 18, c: lc, lh: 28, wdt: opts.leadw || 440 }).x = t.padX;
    hero.children[hero.children.length - 1].y = opts.leady != null ? opts.leady : Math.round(vh * 0.52);
    if (opts.chips) {
      var chips = F("chips", { parent: hero, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 10 });
      opts.chips.forEach(function (c) {
        var ch = F("chip", { parent: chips, hugW: true, hugH: true, pt: 10, pr: 14, pb: 10, pl: 14, fills: [solid(hex("FFFFFF"), 0.9)], r: 999, stroke: t.line, strokeW: 1 });
        T(ch, c, { s: 13, c: opts.chipColor || tc });
      });
      chips.x = t.padX;
      chips.y = opts.chipsY != null ? opts.chipsY : Math.round(vh * 0.64);
    }
    if (opts.cta !== false) {
      BTN(hero, "Начать", opts.btnBg || t.accent, opts.btnText || t.accentText, t.rBtn).x = t.padX;
      hero.children[hero.children.length - 1].y = opts.ctaY != null ? opts.ctaY : Math.round(vh * 0.74);
    }
    if (opts.cards) {
      opts.cards.forEach(function (wk, wi) {
        var card = F("worker", { parent: hero, w: 280, h: 380, fixH: true, gap: 12, pt: 16, pr: 16, pb: 20, pl: 16, fills: [solid(t.bg)], r: 12, stroke: t.line, sh: true, shY: 20, shB: 50, shA: 0.12 });
        card.resize(280, 380);
        card.primaryAxisSizingMode = "FIXED";
        card.counterAxisSizingMode = "FIXED";
        card.x = 1440 - t.padX - 580 + wi * 300;
        card.y = (opts.cardsY != null ? opts.cardsY : 180) + wi * 40;
        PH(card, 248, 240, wk[2], ph(t, wi), 8);
        T(card, wk[0], { s: 20, c: t.text, w: 500 });
        T(card, wk[1], { s: 14, c: t.muted });
      });
    }
    return { w: w, hero: hero, vh: vh };
  }

  function buildVideoHero(root, t, opts) {
    opts = opts || {};
    var w = cw(t);
    NAV(root, t, t.padX, opts.navH || 64);
    var hero = F("01 Герой", { parent: root, w: 1440, fills: [solid(t.bg)], pt: opts.pt || 80, pb: opts.pb || 64, pl: t.padX, pr: t.padX, gap: opts.gap || 48, align: opts.center ? "CENTER" : "MIN", cross: opts.center ? "CENTER" : "MIN" });
    if (opts.eyebrow) T(hero, opts.eyebrow, { s: 13, c: t.muted, w: 500, ls: 2, align: opts.center ? "CENTER" : "LEFT" });
    T(hero, H1, { s: opts.h1 || 72, c: t.text, lh: (opts.h1 || 72) + 4, ls: opts.ls || -2, wdt: opts.h1w || 800, align: opts.center ? "CENTER" : "LEFT" });
    T(hero, LEAD, { s: opts.lead || 18, c: t.muted, lh: 28, wdt: opts.leadw || 560, align: opts.center ? "CENTER" : "LEFT" });
    if (opts.cta !== false) { var acts = F("acts", { parent: hero, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 16, cross: "CENTER" }); BTN(acts, "Начать", t.accent, t.accentText, t.rBtn); }
    var vw = opts.videoW || w;
    var vid = VID(hero, vw, opts.videoLabel || "Видео · 16:9 · немой луп · люди", ph(t, 0), opts.videoR != null ? opts.videoR : 16);
    if (opts.sh) shadow(vid, 24, 60, 0.15);
    return { w: w, hero: hero };
  }

  function buildBasecraft(root, t) {
    var w = cw(t);
    buildFullBleedVideoHero(root, t, {
      navH: 56,
      scrimW: 800,
      scrimA: 0.78,
      scrimColor: hex("FFFFFF"),
      h1: 56,
      h1w: 520,
      h1y: 200,
      leady: 340,
      chips: ["Без VPN", "Счёт для юрлиц", "Поддержка 24/7"],
      chipsY: 460,
      ctaY: 540,
      videoBg: ph(t, 0),
    });
    // Metrics 6-col like basecraft
    var met = F("02 Метрики", { parent: root, w: 1440, fills: [solid(t.surface)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    T(met, "Крепта под контролем", { s: 40, c: t.text, lh: 44, wdt: 600 });
    T(met, "Понятный старт — это не один экран, а целый спокойный процесс от регистрации до первой сделки.", { s: 18, c: t.muted, lh: 28, wdt: 560 });
    var mrow = F("mrow", { parent: met, w: w, dir: "HORIZONTAL", gap: 16 });
    METRICS.concat([["3", "шага до старта"], ["15", "минут до первой покупки"]]).forEach(function (m, i) {
      var mc = F("m", { parent: mrow, w: (w - 80) / 6, gap: 8, pt: 24, pr: 16, pb: 24, pl: 16, fills: [solid(ph(t, i))], r: 16 });
      T(mc, m[0], { s: 32, c: t.text, w: 500, lh: 36 });
      T(mc, m[1], { s: 13, c: t.muted, wdt: (w - 80) / 6 - 32, lh: 18 });
    });
    // Gallery 3x2
    var gal = F("03 Галерея", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 24 });
    T(gal, "Что мы можем создать вместе", { s: 40, c: t.text, lh: 44 });
    var g1 = F("g1", { parent: gal, w: w, dir: "HORIZONTAL", gap: 16 });
    var g2 = F("g2", { parent: gal, w: w, dir: "HORIZONTAL", gap: 16 });
    ["Студийный портрет", "Первая сделка", "Lifestyle", "Мобильный доступ", "Команда", "Поддержка"].forEach(function (g, gi) {
      var gw = (w - 32) / 3;
      var card = F("g", { parent: gi < 3 ? g1 : g2, w: gw, gap: 12, fills: [solid(t.surface)], r: 16, sh: true, shY: 10, shB: 28 });
      PH(card, gw, 200, g, ph(t, gi), 0);
      var gc = F("gc", { parent: card, w: gw, gap: 4, pt: 16, pr: 20, pb: 20, pl: 20 });
      T(gc, g, { s: 18, c: t.text, w: 500 });
    });
    // Myths tinted
    var myths = F("04 Мифы", { parent: root, w: 1440, fills: [solid(t.surface)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    T(myths, "Кажется сложно.\nНа деле — иначе.", { s: 40, c: t.text, lh: 44, wdt: 480 });
    var mr = F("mr", { parent: myths, w: w, dir: "HORIZONTAL", gap: 16 });
    MYTHS.forEach(function (m, i) {
      var mw = (w - 32) / 3;
      var c = F("m", { parent: mr, w: mw, fills: [solid(ph(t, i))], r: 16 });
      PH(c, mw, 180, m[2], ph(t, i), 0);
      var cp = F("cp", { parent: c, w: mw, gap: 10, pt: 20, pr: 20, pb: 24, pl: 20 });
      T(cp, m[0], { s: 20, c: t.text, w: 500, lh: 26, wdt: mw - 40 });
      T(cp, m[1], { s: 15, c: t.muted, lh: 23, wdt: mw - 40 });
    });
    buildStepsBlock(root, t, w, "light");
    buildProductBlock(root, t, w, "light");
    buildRubinExtended(root, t, w, "light", ["logo", "quotes", "clarity", "teams", "support", "trustGrid", "mobile", "pricing", "emailCta"]);
    FOOT(root, t, t.padX);
  }

  function build11x(root, t) {
    var w = cw(t);
    buildFullBleedVideoHero(root, t, {
      navH: 72,
      scrimW: 720,
      scrimA: 0.82,
      scrimColor: hex("FFFFFF"),
      h1: 112,
      h1w: 580,
      h1y: 320,
      ls: -3,
      leady: 500,
      ctaY: 580,
      videoBg: ph(t, 0),
      cards: [["Анна", "Помогает начать", "Портрет · Анна"], ["Игорь", "Рядом с работой", "Портрет · Игорь"]],
      cardsY: 160,
    });
    // People full-bleed strips
    var people = F("02 Люди", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: 0, pl: t.padX, pr: t.padX, gap: 48 });
    T(people, "Люди рядом —\nне скрины профита", { s: 56, c: t.text, lh: 60, wdt: 700 });
    var pr = F("pr", { parent: people, w: 1440, dir: "HORIZONTAL", gap: 4 });
    PEOPLE.forEach(function (p, i) {
      PH(pr, 356, 480, p[2], ph(t, i), 2);
    });
    buildMythsBlock(root, t, w, "light");
    buildStepsBlock(root, t, w, "light");
    buildTrustBlock(root, t, w, "light");
    buildProductBlock(root, t, w, "light");
    buildRubinExtended(root, t, w, "light", ["featureSlider", "logo", "quotes", "clarity", "teams", "support", "trustGrid", "mobile", "pricing", "emailCta"]);
    FOOT(root, t, t.padX);
  }

  function buildKling(root, t) {
    buildVideoHero(root, t, { center: true, h1: 80, h1w: 900, videoR: 20, pt: 100, sh: true, eyebrow: "ПОНЯТНАЯ КРИПТОБИРЖА" });
    var w = cw(t);
    var feats = F("02 Возможности", { parent: root, w: 1440, fills: [solid(t.surface)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 40 });
    T(feats, "Как начать за три шага", { s: 48, c: t.text, lh: 52, align: "CENTER" });
    var fr = F("fr", { parent: feats, w: w, dir: "HORIZONTAL", gap: 24 });
    STEPS.forEach(function (s, i) {
      var sw = (w - 48) / 3;
      var c = F("s", { parent: fr, w: sw, gap: 16, fills: [solid(ph(t, i))], r: 16 });
      PH(c, sw, 220, s[3], ph(t, i + 1), 12);
      var cp = F("cp", { parent: c, w: sw, gap: 8, pt: 20, pr: 20, pb: 24, pl: 20 });
      T(cp, s[0], { s: 48, c: t.text, w: 500, lh: 48 });
      T(cp, s[1], { s: 20, c: t.text, w: 500, lh: 26, wdt: sw - 40 });
      T(cp, s[2], { s: 15, c: t.muted, lh: 22, wdt: sw - 40 });
    });
    buildMythsBlock(root, t, w, "light");
    buildProductBlock(root, t, w, "light");
    buildRubinExtended(root, t, w, "light", ["metrics6", "people", "dual", "featureSlider", "logo", "quotes", "clarity", "teams", "support", "trustGrid", "mobile", "pricing", "emailCta"]);
    FOOT(root, t, t.padX);
  }

  function buildVidu(root, t) {
    var w = cw(t);
    NAV(root, t, t.padX);
    var hero = F("01 Герой", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 80, pb: 80, pl: t.padX, pr: t.padX, gap: 0 });
    var split = F("split", { parent: hero, w: w, dir: "HORIZONTAL", gap: 64, cross: "CENTER" });
    var copy = F("copy", { parent: split, w: w - 520, gap: 28 });
    T(copy, H1, { s: 64, c: t.text, lh: 68, ls: -2, wdt: w - 520 });
    T(copy, LEAD, { s: 18, c: t.muted, lh: 28, wdt: 420 });
    BTN(copy, "Начать", t.accent, t.accentText, t.rBtn);
    var portrait = VID(split, 520, "Видео · 16:9 · спокойный портрет · дневной свет", ph(t, 0), 24);
    shadow(portrait, 24, 60, 0.12);
    buildDualVideoRow(root, t, w);
    buildMythsBlock(root, t, w, "light");
    buildStepsBlock(root, t, w, "light");
    buildTrustBlock(root, t, w, "light");
    buildProductBlock(root, t, w, "light");
    buildRubinExtended(root, t, w, "light", ["metrics6", "quotes", "clarity", "teams", "support", "trustGrid", "mobile", "pricing", "emailCta"]);
    FOOT(root, t, t.padX);
  }

  function buildMoonvalley(root, t) {
    buildVideoHero(root, t, { center: false, h1: 88, h1w: 700, videoW: cw(t), pt: 64, sh: true, eyebrow: "КИНО · ЛЮДИ · КРИПТА", leadw: 520, videoR: 12 });
    var w = cw(t);
    var narrative = F("02 История", { parent: root, w: 1440, fills: [solid(t.surface)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 48 });
    T(narrative, "Сначала кажется сложно.\nПотом — люди.", { s: 48, c: t.text, lh: 54, wdt: 600 });
    var nr = F("nr", { parent: narrative, w: w, dir: "HORIZONTAL", gap: 24 });
    PH(nr, (w - 24) / 2, 400, "До · страх и непонятность", ph(t, 0), 12);
    PH(nr, (w - 24) / 2, 400, "После · спокойный старт", ph(t, 1), 12);
    buildPeopleGrid(root, t, w, 2, 2);
    buildMythsBlock(root, t, w, "light");
    buildProductBlock(root, t, w, "light");
    buildRubinExtended(root, t, w, "light", ["metrics6", "logo", "quotes", "clarity", "teams", "support", "trustGrid", "mobile", "pricing", "emailCta"]);
    FOOT(root, t, t.padX);
  }

  function buildLuma(root, t) {
    buildVideoHero(root, t, { center: true, h1: 96, h1w: 1000, ls: -3, pt: 120, pb: 80, gap: 64, sh: true });
    var w = cw(t);
    var stats = F("02 Цифры", { parent: root, w: 1440, fills: [solid(t.surface)], pt: 80, pb: 80, pl: t.padX, pr: t.padX, gap: 48 });
    var sr = F("sr", { parent: stats, w: w, dir: "HORIZONTAL", gap: 48, align: "SPACE_BETWEEN" });
    METRICS.forEach(function (m) {
      var sc = F("s", { parent: sr, w: (w - 144) / 4, gap: 8 });
      T(sc, m[0], { s: 64, c: t.text, w: 500, lh: 64 });
      T(sc, m[1], { s: 16, c: t.muted, lh: 24 });
    });
    buildMythsBlock(root, t, w, "light");
    buildStepsBlock(root, t, w, "light");
    buildProductBlock(root, t, w, "light");
    buildRubinExtended(root, t, w, "light", ["people", "logo", "quotes", "clarity", "teams", "support", "trustGrid", "mobile", "pricing", "emailCta"]);
    FOOT(root, t, t.padX);
  }

  function buildRunway(root, t) {
    var w = cw(t);
    NAV(root, t, t.padX);
    var hero = F("01 Герой", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 100, pb: 80, pl: t.padX, pr: t.padX, gap: 40 });
    T(hero, H1, { s: 72, c: t.text, lh: 76, ls: -2, wdt: 800 });
    T(hero, LEAD, { s: 20, c: t.muted, lh: 30, wdt: 560 });
    BTN(hero, "Начать", t.accent, t.accentText, t.rBtn);
    VID(hero, w, "Видео · 16:9 · инструмент · экран · руки", ph(t, 0), 8);
    var tools = F("02 Инструменты", { parent: root, w: 1440, fills: [solid(t.surface)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    T(tools, "Что внутри", { s: 40, c: t.text, lh: 44 });
    var tr = F("tr", { parent: tools, w: w, dir: "HORIZONTAL", gap: 16 });
    FEATS.forEach(function (f, i) {
      var tw = (w - 32) / 3;
      var c = F("tool", { parent: tr, w: tw, gap: 16, pt: 24, pr: 24, pb: 28, pl: 24, fills: [solid(t.bg)], r: 8, stroke: t.line });
      PH(c, tw - 48, 160, f[2], ph(t, i), 6);
      T(c, f[0], { s: 22, c: t.text, w: 500, lh: 28 });
      T(c, f[1], { s: 15, c: t.muted, lh: 22, wdt: tw - 48 });
    });
    buildMythsBlock(root, t, w, "light");
    buildStepsBlock(root, t, w, "light");
    buildTrustBlock(root, t, w, "light");
    buildRubinExtended(root, t, w, "light", ["people", "logo", "quotes", "clarity", "teams", "support", "trustGrid", "mobile", "pricing", "emailCta"]);
    FOOT(root, t, t.padX);
  }

  function buildTavus(root, t) {
    var w = cw(t);
    NAV(root, t, t.padX);
    var hero = F("01 Герой", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 80, pb: 80, pl: t.padX, pr: t.padX, gap: 40 });
    T(hero, "Вы ещё не встречали\nкриптобиржу такой", { s: 72, c: t.text, lh: 76, ls: -2, wdt: 800 });
    T(hero, "Человечный AI-подход: понятные слова, подсказки в контексте и люди важнее интерфейса.", { s: 20, c: t.muted, lh: 30, wdt: 620 });
    var vidWrap = F("video", { parent: hero, w: w, dir: "HORIZONTAL", gap: 20, cross: "CENTER" });
    var mainVid = VID(vidWrap, w - 280, "Видео · 16:9 · face-to-face · человек", ph(t, 0), 16);
    shadow(mainVid, 20, 48, 0.2);
    var faceCta = F("fc", { parent: vidWrap, w: 260, gap: 20, pt: 40 });
    BTN(faceCta, "Начать", t.accent, t.accentText, t.rBtn);
    T(faceCta, "Поговорите с RUBIN как с другом — без жаргона.", { s: 15, c: t.muted, lh: 22, wdt: 240 });
    var models = F("02 Модели", { parent: root, w: 1440, fills: [solid(t.surface)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 48 });
    T(models, "Три опоры доверия", { s: 48, c: t.text, lh: 52 });
    var md = F("md", { parent: models, w: w, dir: "HORIZONTAL", gap: 20 });
    [["Ясность", "Понятные слова вместо жаргона", "Сцена · объяснение"], ["Безопасность", "Где лежат средства — простым языком", "Сцена · хранение"], ["Люди", "Поддержка и комьюнити без скринов профита", "Сцена · люди"]].forEach(function (m, i) {
      var mw = (w - 40) / 3;
      var c = F("model", { parent: md, w: mw, gap: 16, fills: [solid(ph(t, i))], r: 16, sh: true, shY: 12, shB: 32, shA: 0.2 });
      PH(c, mw, 240, m[2], ph(t, i + 1), 0);
      var cp = F("cp", { parent: c, w: mw, gap: 8, pt: 24, pr: 24, pb: 28, pl: 24 });
      T(cp, m[0], { s: 24, c: t.text, w: 500, lh: 30 });
      T(cp, m[1], { s: 15, c: t.muted, lh: 22, wdt: mw - 48 });
    });
    buildMythsBlock(root, t, w, "light");
    buildStepsBlock(root, t, w, "light");
    buildProductBlock(root, t, w, "light");
    buildRubinExtended(root, t, w, "light", ["trust", "logo", "quotes", "clarity", "teams", "support", "trustGrid", "mobile", "pricing", "emailCta"]);
    FOOT(root, t, t.padX);
  }

  function buildHarvey(root, t) {
    var w = cw(t);
    NAV(root, t, t.padX, 56);
    var hero = F("01 Герой", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 160, pb: 120, pl: t.padX, pr: t.padX, gap: 32, align: "CENTER", cross: "CENTER" });
    T(hero, H1, { s: 64, c: t.text, lh: 68, wdt: 800, align: "CENTER" });
    T(hero, "Строго. Понятно. Без пафоса. Биржа для людей, которые ценят ясность формулировок так же, как юристы ценят точность.", { s: 20, c: t.muted, lh: 32, wdt: 640, align: "CENTER" });
    BTN(hero, "Начать", t.accent, t.accentText, t.rBtn);
    VID(hero, w, "Видео · 16:9 · спокойный старт · люди", ph(t, 0), 4);
    var trust = F("02 Доверие", { parent: root, w: 1440, fills: [solid(t.surface)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 64 });
    var tr = F("tr", { parent: trust, w: w, dir: "HORIZONTAL", gap: 80 });
    [["Доказательство резервов", "Публичное доказательство — читаемый формат, без «верьте нам»."], ["Прозрачные комиссии", "Цена сделки видна до подтверждения. Без мелкого шрифта."], ["Риски названы словами", "Волатильность и мошенники — честный разговор, не сноска в соглашении."]].forEach(function (item) {
      var col = F("col", { parent: tr, w: (w - 160) / 3, gap: 16 });
      T(col, item[0], { s: 24, c: t.text, w: 500, lh: 30, wdt: (w - 160) / 3 - 20 });
      T(col, item[1], { s: 16, c: t.muted, lh: 26, wdt: (w - 160) / 3 - 20 });
    });
    buildMythsBlock(root, t, w, "strict");
    buildStepsBlock(root, t, w, "strict");
    buildRubinExtended(root, t, w, "strict", ["people", "logo", "quotes", "teams", "support", "trustGrid", "mobile", "pricing", "emailCta"]);
    FOOT(root, t, t.padX);
  }

  function buildDescript(root, t) {
    var w = cw(t);
    NAV(root, t, t.padX);
    var hero = F("01 Герой", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 80, pb: 80, pl: t.padX, pr: t.padX, gap: 0 });
    var split = F("split", { parent: hero, w: w, dir: "HORIZONTAL", gap: 48, cross: "CENTER" });
    var copy = F("copy", { parent: split, w: w - 640, gap: 24 });
    T(copy, H1, { s: 56, c: t.text, lh: 60, ls: -1.5, wdt: w - 640 });
    T(copy, LEAD, { s: 18, c: t.muted, lh: 28, wdt: 400 });
    BTN(copy, "Начать", t.accent, t.accentText, t.rBtn);
    VID(split, 640, "Видео · 16:9 · продукт · workflow", ph(t, 0), 16);
    var flow = F("02 Процесс", { parent: root, w: 1440, fills: [solid(t.surface)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 40 });
    T(flow, "Как начать за три шага", { s: 40, c: t.text, lh: 44 });
    STEPS.forEach(function (s, i) {
      var row = F("step", { parent: flow, w: w, dir: "HORIZONTAL", gap: 32, pt: 32, pb: 32, cross: "CENTER", fills: [] });
      row.strokes = [solid(t.line)]; row.strokeTopWeight = 1; row.strokeLeftWeight = 0; row.strokeRightWeight = 0; row.strokeBottomWeight = 0;
      T(row, s[0], { s: 14, c: t.accent, w: 500, ls: 2, wdt: 48 });
      var sc = F("sc", { parent: row, w: w - 200, gap: 8 });
      T(sc, s[1], { s: 28, c: t.text, w: 500, lh: 34 });
      T(sc, s[2], { s: 16, c: t.muted, lh: 24, wdt: w - 280 });
      PH(row, 140, 100, s[3], ph(t, i), 10);
    });
    buildMythsBlock(root, t, w, "light");
    buildProductBlock(root, t, w, "light");
    buildRubinExtended(root, t, w, "light", ["people", "trust", "logo", "quotes", "clarity", "teams", "support", "trustGrid", "mobile", "pricing", "emailCta"]);
    FOOT(root, t, t.padX);
  }

  function buildArcads(root, t) {
    var w = cw(t);
    NAV(root, t, t.padX);
    var hero = F("01 Герой", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 80, pb: 48, pl: t.padX, pr: t.padX, gap: 24 });
    T(hero, H1, { s: 56, c: t.text, lh: 60, ls: -1, wdt: 700 });
    T(hero, LEAD, { s: 18, c: t.muted, lh: 28, wdt: 520 });
    BTN(hero, "Начать", t.accent, t.accentText, t.rBtn);
    VID(hero, w, "Видео · 16:9 · люди · спокойный момент", ph(t, 0), 16);
    var grid = F("02 Рекламные карточки", { parent: root, w: 1440, fills: [solid(t.surface)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 20 });
    T(grid, "Люди вместо скринов профита", { s: 36, c: t.text, lh: 40 });
    var r1 = F("r1", { parent: grid, w: w, dir: "HORIZONTAL", gap: 20 });
    var r2 = F("r2", { parent: grid, w: w, dir: "HORIZONTAL", gap: 20 });
    PEOPLE.forEach(function (p, i) {
      var pw = (w - 20) / 2;
      var card = F("ad", { parent: i < 2 ? r1 : r2, w: pw, gap: 16, fills: [solid(t.bg)], r: 16, stroke: t.line, sh: true, shY: 8, shB: 24 });
      PH(card, pw, 320, p[2], ph(t, i), 0);
      var cp = F("cp", { parent: card, w: pw, gap: 6, pt: 20, pr: 24, pb: 24, pl: 24 });
      T(cp, p[0], { s: 20, c: t.text, w: 500 });
      T(cp, p[1], { s: 14, c: t.muted });
    });
    buildMythsBlock(root, t, w, "light");
    buildStepsBlock(root, t, w, "light");
    buildTrustBlock(root, t, w, "light");
    buildProductBlock(root, t, w, "light");
    buildRubinExtended(root, t, w, "light", ["logo", "quotes", "clarity", "teams", "support", "trustGrid", "mobile", "pricing", "emailCta"]);
    FOOT(root, t, t.padX);
  }

  function buildSanaFeatureSlider(root, t, w) {
    var feats = [
      ["Три шага до первой сделки.", "Регистрация, пополнение и покупка — каждый шаг объяснён простым языком.", "Видео · три шага"],
      ["Понятный экран покупки", "Сумма, цена и кнопка — всё на одном экране.", "Видео · экран покупки"],
      ["Баланс и вывод в одном месте", "Видно, где лежат средства и сколько стоит вывод.", "Видео · кошелёк"],
      ["Подсказки рядом с каждым действием", "Термины раскрываются прямо в интерфейсе.", "Видео · подсказки"],
      ["Люди важнее интерфейса", "Поддержка и комьюнити — без скринов профита.", "Видео · люди"],
    ];
    var vh = videoH16x9(w);
    var slider = F("03 Слайдер", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 40, align: "CENTER", cross: "CENTER" });
    T(slider, feats[0][0], { s: 48, c: t.text, lh: 52, align: "CENTER", wdt: 800 });
    T(slider, feats[0][1], { s: 18, c: t.muted, lh: 28, align: "CENTER", wdt: 640 });
    var viewport = F("viewport", { parent: slider, w: w, h: vh, fixH: true, dir: "NONE", fills: [] });
    viewport.resize(w, vh);
    viewport.primaryAxisSizingMode = "FIXED";
    viewport.counterAxisSizingMode = "FIXED";
    viewport.clipsContent = true;
    var gap = 18;
    feats.slice(0, 2).forEach(function (f, i) {
      var slide = VID(viewport, w, f[2], ph(t, i), 24);
      slide.x = i * (w + gap);
      slide.y = 0;
    });
    var featTabs = F("feat-tabs", { parent: slider, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 8, cross: "CENTER" });
    ["Три шага", "Экран", "Кошелёк", "Подсказки", "Люди"].forEach(function (tab, i) {
      var pill = F("tab", { parent: featTabs, hugW: true, hugH: true, pt: 10, pr: 16, pb: 10, pl: 16, fills: [solid(i === 0 ? t.text : t.surface2)], r: 999, stroke: i === 0 ? undefined : t.line });
      T(pill, tab, { s: 14, c: i === 0 ? t.accentText : t.text, w: 500, font: fM });
    });
    var controls = F("controls", { parent: slider, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 24, cross: "CENTER" });
    var arrows = F("arrows", { parent: controls, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 12, cross: "CENTER" });
    ["←", "→"].forEach(function (a) {
      var ar = F("arr", { parent: arrows, w: 44, h: 44, fixH: true, align: "CENTER", cross: "CENTER", fills: [solid(t.surface2)], r: 999, stroke: t.line });
      ar.resize(44, 44);
      ar.primaryAxisSizingMode = "FIXED";
      ar.counterAxisSizingMode = "FIXED";
      T(ar, a, { s: 18, c: t.text, w: 500 });
    });
    var dots = F("dots", { parent: controls, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 8, cross: "CENTER" });
    feats.forEach(function (_, di) {
      var dot = F("dot", { parent: dots, w: di === 0 ? 24 : 8, h: 8, fixH: true, fills: [solid(di === 0 ? t.text : t.line)], r: 999 });
      dot.resize(di === 0 ? 24 : 8, 8);
      dot.primaryAxisSizingMode = "FIXED";
      dot.counterAxisSizingMode = "FIXED";
    });
  }

  function buildSana(root, t) {
    var w = cw(t);
    var cardGap = 18;
    var cardW = Math.floor((w - cardGap) / 2);
    var cardH = 560;

    NAV_SANA(root, t);

    // 01 Hero — центр + большой видеоблок на первом экране (как Sana)
    var hero = F("01 Герой", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 64, pb: 80, pl: t.padX, pr: t.padX, gap: 28, align: "CENTER", cross: "CENTER" });
    T(hero, "RUBIN", { s: 12, c: t.muted, w: 500, ls: 1.6, align: "CENTER", font: fM });
    T(hero, H1, { s: 88, c: t.text, lh: 84, ls: -2.6, wdt: 900, align: "CENTER" });
    T(hero, LEAD, { s: 20, c: t.muted, lh: 30, wdt: 560, align: "CENTER" });
    BTN(hero, "Начать", t.accent, t.accentText, t.rBtn);
    VID(hero, w, "Видео · 16:9 · hero · люди", ph(t, 0), 24);

    // 02 Platform — H2 + tabs + dual cards
    var platform = F("02 Платформа", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 100, pb: t.padY, pl: t.padX, pr: t.padX, gap: 48, align: "CENTER", cross: "CENTER" });
    T(platform, "Биржа для реальной жизни", { s: 48, c: t.text, lh: 52, align: "CENTER", wdt: 800 });
    T(platform, "Спокойный способ начать с криптой — без жаргона, без пафоса и без обещаний лёгких денег.", { s: 18, c: t.muted, lh: 28, align: "CENTER", wdt: 640 });
    var tabs = F("tabs", { parent: platform, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 8, cross: "CENTER" });
    ["Регистрация", "Пополнение", "Сделка", "Кошелёк", "Люди"].forEach(function (tab, i) {
      var pill = F("tab", { parent: tabs, hugW: true, hugH: true, pt: 10, pr: 16, pb: 10, pl: 16, fills: [solid(i === 0 ? t.text : t.surface2)], r: 999, stroke: i === 0 ? undefined : t.line });
      T(pill, tab, { s: 14, c: i === 0 ? t.accentText : t.text, w: 500, font: fM });
    });
    var dual = F("dual", { parent: platform, w: w, dir: "HORIZONTAL", gap: cardGap });
    [
      ["Первая сделка", "Человек · спокойный момент · покупка на небольшую сумму", "Экран · покупка"],
      ["Кошелёк рядом", "Баланс и вывод в одном экране · без лишних шагов", "Экран · кошелёк"],
    ].forEach(function (c, i) {
      var card = F("card", { parent: dual, w: cardW, fills: [solid(t.surface2)], r: 24, stroke: t.line, sh: true, shY: 16, shB: 48, shA: 0.06 });
      PH(card, cardW, cardH, c[2], ph(t, i), 0);
      var cp = F("cp", { parent: card, w: cardW, gap: 8, pt: 28, pr: 32, pb: 32, pl: 32 });
      T(cp, c[0], { s: 24, c: t.text, w: 500, lh: 30 });
      T(cp, c[1], { s: 15, c: t.muted, lh: 23, wdt: cardW - 64 });
    });

    buildSanaFeatureSlider(root, t, w);

    // 08 Metrics strip — 6 case-study cards
    var metrics = F("08 Метрики", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 80, pb: 80, pl: t.padX, pr: t.padX, gap: 32 });
    var mrow = F("mrow", { parent: metrics, w: w, dir: "HORIZONTAL", gap: 12 });
    [
      ["Новичок", "15 мин", "до первой покупки"],
      ["Семья", "3 000 ₽", "спокойный старт"],
      ["Фрилансер", "24/7", "поддержка рядом"],
      ["Инвестор", "100%", "прозрачные резервы"],
      ["Бизнес", "0 ₽", "скрытых комиссий"],
      ["Все", "3", "шага до старта"],
    ].forEach(function (m, i) {
      var mw = (w - 60) / 6;
      var c = F("m", { parent: mrow, w: mw, gap: 12, pt: 24, pr: 16, pb: 24, pl: 16, fills: [solid(t.surface2)], r: 16, stroke: t.line });
      T(c, m[0], { s: 13, c: t.muted, w: 500, ls: 0.5 });
      T(c, m[1], { s: 36, c: t.text, w: 500, lh: 40 });
      T(c, m[2], { s: 14, c: t.muted, lh: 20, wdt: mw - 32 });
    });

    // 09 Testimonials — quote carousel (2 visible cards)
    var quotes = F("09 Отзывы", { parent: root, w: 1440, fills: [solid(t.surface2)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    var qr = F("qr", { parent: quotes, w: w, dir: "HORIZONTAL", gap: 18 });
    [
      ["«Начала с трёх тысяч — и впервые поняла, что происходит на каждом шаге.»", "Анна, 29", "Начала с 3 000 ₽", "Анна · окно"],
      ["«Рядом с работой, между сменами — всё объяснено человеческим языком.»", "Игорь, 41", "Рядом с работой", "Игорь · цех"],
    ].forEach(function (q, i) {
      var qw = (w - 18) / 2;
      var c = F("q", { parent: qr, w: qw, gap: 24, pt: 40, pr: 40, pb: 40, pl: 40, fills: [solid(t.bg)], r: 24, stroke: t.line });
      T(c, q[0], { s: 22, c: t.text, lh: 32, wdt: qw - 80 });
      var au = F("au", { parent: c, w: qw - 80, dir: "HORIZONTAL", gap: 16, cross: "CENTER" });
      PH(au, 56, 56, q[3], ph(t, i), 999);
      var ac = F("ac", { parent: au, gap: 4 });
      T(ac, q[1], { s: 15, c: t.text, w: 500, font: fM });
      T(ac, q[2], { s: 13, c: t.muted });
    });
    var dots = F("dots", { parent: quotes, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 8, cross: "CENTER" });
    [0, 1, 2, 3, 4].forEach(function (di) {
      var dot = F("dot", { parent: dots, w: di === 0 ? 24 : 8, h: 8, fixH: true, fills: [solid(di === 0 ? t.text : t.line)], r: 999 });
      dot.resize(di === 0 ? 24 : 8, 8); dot.primaryAxisSizingMode = "FIXED"; dot.counterAxisSizingMode = "FIXED";
    });

    // 10 Clarity block — split (Model agnostic → «Биржа без жаргона»)
    var clarity = F("10 Ясность", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 0 });
    var clSplit = F("split", { parent: clarity, w: w, dir: "HORIZONTAL", gap: 64, cross: "CENTER" });
    var clCopy = F("copy", { parent: clSplit, w: (w - 64) / 2, gap: 20 });
    T(clCopy, "Биржа без жаргона", { s: 40, c: t.text, lh: 44, wdt: (w - 64) / 2 });
    T(clCopy, "Термины раскрываются прямо в интерфейсе. Сложные инструменты лежат глубже — и ждут, когда понадобятся.", { s: 18, c: t.muted, lh: 28, wdt: (w - 64) / 2 - 20 });
    BTN(clCopy, "Начать", t.accent, t.accentText, t.rBtn);
    VID(clSplit, (w - 64) / 2, "Видео · понятный язык", ph(t, 0), 24);

    // 11 Teams tabs — «Крипта для разных людей»
    var teams = F("11 Команды", { parent: root, w: 1440, fills: [solid(t.surface2)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 40 });
    T(teams, "Крипта для разных людей", { s: 40, c: t.text, lh: 44, wdt: 600 });
    var teamTabs = F("ttabs", { parent: teams, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 20, cross: "CENTER" });
    ["→ Новички", "Инвесторы", "Бизнес", "Семьи", "Фрилансеры"].forEach(function (tab, i) {
      T(teamTabs, tab, { s: 15, c: i === 0 ? t.text : t.muted, w: 500, font: i === 0 ? fM : fB });
    });
    var teamPanel = F("panel", { parent: teams, w: w, dir: "HORIZONTAL", gap: 48, cross: "CENTER" });
    var tpCopy = F("tpc", { parent: teamPanel, w: w - 520, gap: 16 });
    T(tpCopy, "Начните с малого — без страха и без учебника", { s: 28, c: t.text, lh: 34, wdt: w - 520 });
    T(tpCopy, MYTHS[0][1], { s: 16, c: t.muted, lh: 26, wdt: w - 520 });
    VID(teamPanel, 520, "Видео · новичок", ph(t, 1), 20);

    // 12 Partnership — список преимуществ
    var partner = F("12 Партнёрство", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 40, align: "CENTER", cross: "CENTER" });
    T(partner, "ПОДДЕРЖКА", { s: 12, c: t.muted, w: 500, ls: 1.6, align: "CENTER" });
    T(partner, "Сопровождаем\nна каждом шаге", { s: 48, c: t.text, lh: 52, align: "CENTER", wdt: 700 });
    T(partner, "Понятный старт — это не один экран, а целый спокойный процесс от регистрации до первой сделки.", { s: 18, c: t.muted, lh: 28, align: "CENTER", wdt: 640 });
    var pl = F("plist", { parent: partner, w: w, dir: "HORIZONTAL", gap: 48 });
    [
      ["Персональный онбординг", "Помогаем пройти первые три шага без стресса."],
      ["Поддержка 24/7", "Живые люди — не бот с шаблонами."],
      ["Понятные материалы", "Без жаргона и без обещаний доходности."],
      ["Комьюнити", "Обычные люди делятся опытом — без скринов профита."],
    ].forEach(function (item, i) {
      var col = F("col", { parent: pl, w: (w - 144) / 4, gap: 10 });
      T(col, "→ " + item[0], { s: 16, c: t.text, w: 500, font: fM, wdt: (w - 144) / 4 - 10 });
      T(col, item[1], { s: 14, c: t.muted, lh: 22, wdt: (w - 144) / 4 - 10 });
    });
    BTN(partner, "Начать", t.accent, t.accentText, t.rBtn);

    // 13 Integrations + Security — две колонки
    var trust = F("13 Безопасность", { parent: root, w: 1440, fills: [solid(t.surface2)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 48 });
    T(trust, "Надёжность и прозрачность", { s: 40, c: t.text, lh: 44, align: "CENTER", wdt: 700 });
    T(trust, "RUBIN соединяет понятный интерфейс с прозрачными процессами — безопасно и предсказуемо.", { s: 18, c: t.muted, lh: 28, align: "CENTER", wdt: 640 });
    var trSplit = F("tsplit", { parent: trust, w: w, dir: "HORIZONTAL", gap: 48 });
    [["Способы пополнения", ["Карта", "СБП", "Банк", "P2P", "Счёт юрлица", "Криптокошелёк"]], ["Безопасность", ["Резервы", "2FA", "Шифрование", "Аудит", "KYC", "SLA"]]].forEach(function (side, si) {
      var col = F("sc", { parent: trSplit, w: (w - 48) / 2, gap: 24, pt: 32, pr: 32, pb: 32, pl: 32, fills: [solid(t.bg)], r: 24, stroke: t.line });
      T(col, side[0], { s: 20, c: t.text, w: 500, font: fM });
      var grid = F("grid", { parent: col, w: (w - 48) / 2 - 64, dir: "HORIZONTAL", gap: 10 });
      var g2 = F("g2", { parent: col, w: (w - 48) / 2 - 64, dir: "HORIZONTAL", gap: 10 });
      side[1].forEach(function (logo, li) {
        var lw = ((w - 48) / 2 - 64 - 20) / 3;
        var lc = F("logo", { parent: li < 3 ? grid : g2, w: lw, h: 52, fixH: true, align: "CENTER", cross: "CENTER", fills: [solid(t.surface2)], r: 12, stroke: t.line });
        lc.resize(lw, 52); lc.primaryAxisSizingMode = "FIXED"; lc.counterAxisSizingMode = "FIXED";
        T(lc, logo, { s: 12, c: t.muted, w: 500 });
      });
    });

    // 14 Mobile app — split
    var mobile = F("14 Приложение", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 0 });
    var mobSplit = F("msplit", { parent: mobile, w: w, dir: "HORIZONTAL", gap: 80, cross: "CENTER" });
    var mobCopy = F("mc", { parent: mobSplit, w: w - 400, gap: 20 });
    T(mobCopy, "МОБИЛЬНОЕ ПРИЛОЖЕНИЕ", { s: 12, c: t.muted, w: 500, ls: 1.6 });
    T(mobCopy, "Биржа в кармане", { s: 48, c: t.text, lh: 52, wdt: w - 400 });
    T(mobCopy, "Пополнение, покупка и вывод — с подсказками рядом. Можно начать с малой суммы прямо с телефона.", { s: 18, c: t.muted, lh: 28, wdt: 480 });
    BTN(mobCopy, "Начать", t.accent, t.accentText, t.rBtn);
    PH(mobSplit, 320, 640, "Мокап · iOS · экран покупки", ph(t, 2), 32);

    // 15 Logo strip
    var logos = F("15 Логотипы", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 64, pb: 64, pl: t.padX, pr: t.padX, gap: 32, align: "CENTER", cross: "CENTER" });
    T(logos, "RUBIN — биржа, которой доверяют", { s: 24, c: t.text, lh: 30, align: "CENTER", wdt: 600 });
    var lr = F("lr", { parent: logos, w: w, dir: "HORIZONTAL", gap: 12 });
    LOGOS.concat(["Банк", "Фонд"]).forEach(function (l, i) {
      var lw = (w - 72) / 7;
      var c = F("logo", { parent: lr, w: lw, h: 56, fixH: true, align: "CENTER", cross: "CENTER", fills: [solid(t.surface2)], r: 12, stroke: t.line });
      c.resize(lw, 56); c.primaryAxisSizingMode = "FIXED"; c.counterAxisSizingMode = "FIXED";
      T(c, l, { s: 13, c: t.muted, w: 500 });
    });

    // 16 Pricing — 3 columns
    var pricing = F("16 Тарифы", { parent: root, w: 1440, fills: [solid(t.surface2)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 48, align: "CENTER", cross: "CENTER" });
    T(pricing, "Тарифы", { s: 48, c: t.text, lh: 52, align: "CENTER" });
    var prow = F("prow", { parent: pricing, w: w, dir: "HORIZONTAL", gap: 18 });
    [
      ["Старт", "0 ₽", ["Регистрация бесплатно", "Минимум от 500 ₽", "Базовые подсказки", "Поддержка в чате"]],
      ["Стандарт", "от 0,1%", ["Все способы пополнения", "Прозрачные комиссии", "Приоритетная поддержка", "Расширенные подсказки"]],
      ["Бизнес", "Индивидуально", ["Счёт для юрлиц", "Персональный менеджер", "API-доступ", "SLA и аудит"]],
    ].forEach(function (plan, i) {
      var pw = (w - 36) / 3;
      var c = F("plan", { parent: prow, w: pw, gap: 20, pt: 36, pr: 32, pb: 36, pl: 32, fills: [solid(t.bg)], r: 24, stroke: t.line, sh: i === 1, shY: 12, shB: 32, shA: 0.08 });
      T(c, plan[0], { s: 20, c: t.text, w: 500, font: fM });
      T(c, plan[1], { s: 36, c: t.text, w: 500, lh: 40 });
      plan[2].forEach(function (feat) {
        T(c, "— " + feat, { s: 14, c: t.muted, lh: 22, wdt: pw - 64 });
      });
      BTN(c, i === 2 ? "Связаться" : "Начать", t.accent, t.accentText, t.rBtn);
    });

    // 17 Myths — borrowed block in Sana card style
    var myths = F("17 Мифы", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 40 });
    T(myths, "Кажется сложно.\nНа деле — иначе.", { s: 40, c: t.text, lh: 44, wdt: 480 });
    var mr = F("mr", { parent: myths, w: w, dir: "HORIZONTAL", gap: 18 });
    MYTHS.forEach(function (m, i) {
      var mw = (w - 36) / 3;
      var c = F("m", { parent: mr, w: mw, gap: 16, pt: 28, pr: 28, pb: 28, pl: 28, fills: [solid(t.surface2)], r: 24, stroke: t.line });
      PH(c, mw - 56, 160, m[2], ph(t, i), 16);
      T(c, m[0], { s: 20, c: t.text, w: 500, lh: 26, wdt: mw - 56 });
      T(c, m[1], { s: 15, c: t.muted, lh: 23, wdt: mw - 56 });
    });

    // 18 Final CTA card
    var cta = F("18 Призыв", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 80, pb: 80, pl: t.padX, pr: t.padX });
    var ctaCard = F("cta", { parent: cta, w: w, dir: "HORIZONTAL", gap: 40, pt: 56, pr: 56, pb: 56, pl: 56, cross: "CENTER", align: "SPACE_BETWEEN", fills: [solid(t.surface2)], r: 28, stroke: t.line });
    var cc = F("cc", { parent: ctaCard, w: 560, gap: 12 });
    T(cc, "Начни сегодня", { s: 44, c: t.text, lh: 48, ls: -1 });
    T(cc, "Спокойный вход. Без пафоса.", { s: 18, c: t.muted, lh: 28 });
    var er = F("er", { parent: ctaCard, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 10, cross: "CENTER" });
    var em = F("em", { parent: er, w: 260, h: 52, fixH: true, align: "MIN", cross: "CENTER", pl: 20, fills: [solid(t.bg)], r: 999, stroke: t.line });
    em.resize(260, 52); em.primaryAxisSizingMode = "FIXED"; em.counterAxisSizingMode = "FIXED";
    T(em, "you@email.com", { s: 15, c: t.muted });
    BTN(er, "Начать", t.accent, t.accentText, t.rBtn);

    FOOT_SANA(root, t);
  }

  function buildSanaCloneFeatureSlider(root, t, w, useImages) {
    var feats = [
      ["Run complex, multi-step processes.", "Automate workflows across your tools with AI agents that handle the full process end to end.", "Automate"],
      ["Generate collaborative content in any format", "Create pitch decks, memos, and deliverables with AI that understands your company context.", "Create"],
      ["Turn data into live dashboards and reports", "Analyze data from across your systems and get live insights without manual reporting.", "Analyze"],
      ["Take instant actions across your tools", "Act on insights instantly — update CRMs, assign tickets, and trigger workflows.", "Act"],
      ["All the latest company docs and data", "Find anything across your knowledge base, apps, and files in seconds.", "Find"],
    ];
    var vh = videoH16x9(w);
    var slider = F("03 Features", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 40, align: "CENTER", cross: "CENTER" });
    T(slider, feats[0][0], { s: 48, c: t.text, lh: 52, align: "CENTER", wdt: 800 });
    T(slider, feats[0][1], { s: 18, c: t.muted, lh: 28, align: "CENTER", wdt: 640 });
    var viewport = F("viewport", { parent: slider, w: w, h: vh, fixH: true, dir: "NONE", fills: [] });
    viewport.resize(w, vh);
    viewport.primaryAxisSizingMode = "FIXED";
    viewport.counterAxisSizingMode = "FIXED";
    viewport.clipsContent = true;
    var gap = 18;
    var slideUrls = [SANA_IMG.featureA, SANA_IMG.featureB];
    feats.slice(0, 2).forEach(function (_, i) {
      var slide = cloneMedia(viewport, w, vh, 24, slideUrls[i], useImages);
      slide.x = i * (w + gap);
      slide.y = 0;
    });
    var featTabs = F("feat-tabs", { parent: slider, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 8, cross: "CENTER" });
    feats.forEach(function (f, i) {
      var pill = F("tab", { parent: featTabs, hugW: true, hugH: true, pt: 10, pr: 16, pb: 10, pl: 16, fills: [solid(i === 0 ? t.text : t.surface2)], r: 999, stroke: i === 0 ? undefined : t.line });
      T(pill, f[2], { s: 14, c: i === 0 ? t.accentText : t.text, w: 500, font: fM });
    });
    var controls = F("controls", { parent: slider, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 24, cross: "CENTER" });
    var arrows = F("arrows", { parent: controls, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 12, cross: "CENTER" });
    ["←", "→"].forEach(function (a) {
      var ar = F("arr", { parent: arrows, w: 44, h: 44, fixH: true, align: "CENTER", cross: "CENTER", fills: [solid(t.surface2)], r: 999, stroke: t.line });
      ar.resize(44, 44);
      ar.primaryAxisSizingMode = "FIXED";
      ar.counterAxisSizingMode = "FIXED";
      T(ar, a, { s: 18, c: t.text, w: 500 });
    });
    var dots = F("dots", { parent: controls, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 8, cross: "CENTER" });
    feats.forEach(function (_, di) {
      var dot = F("dot", { parent: dots, w: di === 0 ? 24 : 8, h: 8, fixH: true, fills: [solid(di === 0 ? t.text : t.line)], r: 999 });
      dot.resize(di === 0 ? 24 : 8, 8);
      dot.primaryAxisSizingMode = "FIXED";
      dot.counterAxisSizingMode = "FIXED";
    });
  }

  function buildSanaClone(root, t, useImages) {
    var w = cw(t);
    var cardGap = 18;
    var cardW = Math.floor((w - cardGap) / 2);
    var cardH = 560;

    NAV_SANA_CLONE(root, t);

    var hero = F("01 Hero", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 64, pb: 80, pl: t.padX, pr: t.padX, gap: 28, align: "CENTER", cross: "CENTER" });
    T(hero, "Sana", { s: 12, c: t.muted, w: 500, ls: 1.6, align: "CENTER", font: fM });
    T(hero, "Real work,\nAdvanced analysis,\nRepetitive tasks,\ndone with AI", { s: 88, c: t.text, lh: 84, ls: -2.6, wdt: 900, align: "CENTER" });
    T(hero, "Accelerate work with AI agents that collaborate, automate, and think alongside your teams.", { s: 20, c: t.muted, lh: 30, wdt: 640, align: "CENTER" });
    BTN(hero, "Book an intro", t.accent, t.accentText, t.rBtn);
    cloneMedia(hero, w, videoH16x9(w), 24, SANA_IMG.hero, useImages);

    var platform = F("02 Platform", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 100, pb: t.padY, pl: t.padX, pr: t.padX, gap: 48, align: "CENTER", cross: "CENTER" });
    T(platform, "Your all-in-one AI platform\nfor real work", { s: 48, c: t.text, lh: 52, align: "CENTER", wdt: 800 });
    T(platform, "A seamless, beautiful way to bring AI into your company's apps, knowledge, and culture.", { s: 18, c: t.muted, lh: 28, align: "CENTER", wdt: 640 });
    var tabs = F("tabs", { parent: platform, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 8, cross: "CENTER" });
    ["Automate", "Create", "Analyze", "Act", "Find"].forEach(function (tab, i) {
      var pill = F("tab", { parent: tabs, hugW: true, hugH: true, pt: 10, pr: 16, pb: 10, pl: 16, fills: [solid(i === 0 ? t.text : t.surface2)], r: 999, stroke: i === 0 ? undefined : t.line });
      T(pill, tab, { s: 14, c: i === 0 ? t.accentText : t.text, w: 500, font: fM });
    });
    var dual = F("dual", { parent: platform, w: w, dir: "HORIZONTAL", gap: cardGap });
    [SANA_IMG.platformA, SANA_IMG.platformB].forEach(function (url, i) {
      var card = F("card", { parent: dual, w: cardW, fills: [solid(t.surface2)], r: 24, stroke: t.line, sh: true, shY: 16, shB: 48, shA: 0.06 });
      cloneMedia(card, cardW, cardH, 0, url, useImages);
    });

    buildSanaCloneFeatureSlider(root, t, w, useImages);

    var metrics = F("04 Metrics", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 80, pb: 80, pl: t.padX, pr: t.padX, gap: 32 });
    var mrow = F("mrow", { parent: metrics, w: w, dir: "HORIZONTAL", gap: 12 });
    [
      ["Fintech scale-up", "10 hours", "saved per week, per employee"],
      ["Global law firm", "62%", "prep time saved"],
      ["Leading manufacturer", "95%", "faster product answers"],
      ["Mining manufacturer", "50%", "time saved in R&D"],
      ["Renewable energy company", "66%", "time saved in R&D"],
      ["Industrial leader", "2×", "more customer service issues resolved"],
    ].forEach(function (m) {
      var mw = (w - 60) / 6;
      var c = F("m", { parent: mrow, w: mw, gap: 12, pt: 24, pr: 16, pb: 24, pl: 16, fills: [solid(t.surface2)], r: 16, stroke: t.line });
      T(c, m[0], { s: 13, c: t.muted, w: 500, ls: 0.5 });
      T(c, m[1], { s: 36, c: t.text, w: 500, lh: 40 });
      T(c, m[2], { s: 14, c: t.muted, lh: 20, wdt: mw - 32 });
    });

    var quotes = F("05 Testimonials", { parent: root, w: 1440, fills: [solid(t.surface2)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    var qr = F("qr", { parent: quotes, w: w, dir: "HORIZONTAL", gap: 18 });
    [
      ["\"All of a sudden, a valuation memo that our CFO previously spent almost a week preparing was completed within three or four hours.\"", "Chief Sustainability Officer", "Leading renewable energy company", SANA_IMG.quoteA],
      ["\"If we removed Sana Agents, there would be a revolt.\"", "Managing Director", "Global private equity firm", SANA_IMG.quoteB],
    ].forEach(function (q, i) {
      var qw = (w - 18) / 2;
      if (useImages) {
        var card = F("q", { parent: qr, w: qw, h: 380, fixH: true, dir: "NONE", fills: [], r: 24, clipsContent: true });
        card.cornerRadius = 24;
        var bg = cloneMedia(card, qw, 380, 0, q[3], true);
        bg.x = 0; bg.y = 0;
        var overlay = F("overlay", { parent: card, w: qw, gap: 20, pt: 40, pr: 40, pb: 40, pl: 40 });
        overlay.x = 0; overlay.y = 0;
        T(overlay, q[0], { s: 22, c: hex("FFFFFF"), lh: 32, wdt: qw - 80 });
        T(overlay, q[1], { s: 15, c: hex("FFFFFF"), w: 500, font: fM });
        T(overlay, q[2], { s: 13, c: hex("FFFFFF"), wdt: qw - 80 });
      } else {
        var c = F("q", { parent: qr, w: qw, gap: 24, pt: 40, pr: 40, pb: 40, pl: 40, fills: [solid(t.bg)], r: 24, stroke: t.line });
        T(c, q[0], { s: 22, c: t.text, lh: 32, wdt: qw - 80 });
        var au = F("au", { parent: c, w: qw - 80, dir: "HORIZONTAL", gap: 16, cross: "CENTER" });
        GRAY(au, 56, 56, 999);
        var ac = F("ac", { parent: au, gap: 4 });
        T(ac, q[1], { s: 15, c: t.text, w: 500, font: fM });
        T(ac, q[2], { s: 13, c: t.muted });
      }
    });
    var qdots = F("dots", { parent: quotes, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 8, cross: "CENTER" });
    [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach(function (di) {
      var dot = F("dot", { parent: qdots, w: di === 0 ? 24 : 8, h: 8, fixH: true, fills: [solid(di === 0 ? t.text : t.line)], r: 999 });
      dot.resize(di === 0 ? 24 : 8, 8); dot.primaryAxisSizingMode = "FIXED"; dot.counterAxisSizingMode = "FIXED";
    });

    var model = F("06 Model agnostic", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 0 });
    var mSplit = F("split", { parent: model, w: w, dir: "HORIZONTAL", gap: 64, cross: "CENTER" });
    var mCopy = F("copy", { parent: mSplit, w: (w - 64) / 2, gap: 20 });
    T(mCopy, "Model agnostic", { s: 40, c: t.text, lh: 44, wdt: (w - 64) / 2 });
    T(mCopy, "Only use the AI models that work best for you. With Sana, you can choose and switch between leading models as you need.", { s: 18, c: t.muted, lh: 28, wdt: (w - 64) / 2 - 20 });
    BTN(mCopy, "Book an intro", t.accent, t.accentText, t.rBtn);
    cloneMedia(mSplit, (w - 64) / 2, videoH16x9((w - 64) / 2), 24, SANA_IMG.model, useImages);

    var teams = F("07 Teams", { parent: root, w: 1440, fills: [solid(t.surface2)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 40 });
    T(teams, "Every team gets smarter with Sana", { s: 40, c: t.text, lh: 44, wdt: 600 });
    var teamTabs = F("ttabs", { parent: teams, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 20, cross: "CENTER" });
    ["→ Sales teams", "Customer support", "In-house operations", "Financial services", "Industrial companies", "Law firms"].forEach(function (tab, i) {
      T(teamTabs, tab, { s: 15, c: i === 0 ? t.text : t.muted, w: 500, font: i === 0 ? fM : fB });
    });
    var teamPanel = F("panel", { parent: teams, w: w, dir: "HORIZONTAL", gap: 48, cross: "CENTER" });
    var tpCopy = F("tpc", { parent: teamPanel, w: w - 520, gap: 16 });
    T(tpCopy, "Optimize every stage of the deal lifecycle", { s: 28, c: t.text, lh: 34, wdt: w - 520 });
    T(tpCopy, "AI that helps you prep for calls, answers your RFPs, and updates your CRM.", { s: 16, c: t.muted, lh: 26, wdt: w - 520 });
    cloneMedia(teamPanel, 520, videoH16x9(520), 20, SANA_IMG.teams, useImages);

    var partner = F("08 Partnership", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 40, align: "CENTER", cross: "CENTER" });
    if (useImages) cloneMedia(partner, w, 280, 24, SANA_IMG.partnership, true);
    T(partner, "ENTERPRISE PARTNERSHIP SERVICES", { s: 12, c: t.muted, w: 500, ls: 1.6, align: "CENTER" });
    T(partner, "Driving AI adoption together", { s: 48, c: t.text, lh: 52, align: "CENTER", wdt: 700 });
    T(partner, "AI is revolutionizing work in real time. Our partnership-led approach helps your organization become truly AI-first.", { s: 18, c: t.muted, lh: 28, align: "CENTER", wdt: 640 });
    var pl = F("plist", { parent: partner, w: w, dir: "HORIZONTAL", gap: 48 });
    [
      ["Dedicated deployment lead", "Complete implementation support"],
      ["Tailored onboarding", "Priority support"],
      ["AI strategy and consulting", "Change management model"],
      ["Community, events, and resources", ""],
    ].forEach(function (item) {
      var col = F("col", { parent: pl, w: (w - 144) / 4, gap: 10 });
      T(col, "→ " + item[0], { s: 16, c: t.text, w: 500, font: fM, wdt: (w - 144) / 4 - 10 });
      if (item[1]) T(col, item[1], { s: 14, c: t.muted, lh: 22, wdt: (w - 144) / 4 - 10 });
    });
    BTN(partner, "Book an intro", t.accent, t.accentText, t.rBtn);

    var trust = F("09 Integrations", { parent: root, w: 1440, fills: [solid(t.surface2)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 48 });
    T(trust, "Enterprise-grade integrations and security", { s: 40, c: t.text, lh: 44, align: "CENTER", wdt: 700 });
    T(trust, "Sana connects with 100+ applications and unifies your company's data securely.", { s: 18, c: t.muted, lh: 28, align: "CENTER", wdt: 640 });
    var trSplit = F("tsplit", { parent: trust, w: w, dir: "HORIZONTAL", gap: 48 });
    [
      ["Connect your daily tools automatically", SANA_IMG.integrations],
      ["Security you can stand by", SANA_IMG.security],
    ].forEach(function (side) {
      var col = F("sc", { parent: trSplit, w: (w - 48) / 2, gap: 24, pt: 32, pr: 32, pb: 32, pl: 32, fills: [solid(t.bg)], r: 24, stroke: t.line });
      T(col, side[0], { s: 20, c: t.text, w: 500, font: fM });
      var grid = F("grid", { parent: col, w: (w - 48) / 2 - 64, dir: "HORIZONTAL", gap: 10 });
      var g2 = F("g2", { parent: col, w: (w - 48) / 2 - 64, dir: "HORIZONTAL", gap: 10 });
      var g3 = F("g3", { parent: col, w: (w - 48) / 2 - 64, dir: "HORIZONTAL", gap: 10 });
      var g4 = F("g4", { parent: col, w: (w - 48) / 2 - 64, dir: "HORIZONTAL", gap: 10 });
      var rows = [grid, g2, g3, g4];
      var labels = side[0].indexOf("Security") === 0
        ? ["Custom user roles", "Encryption", "Flexible groups", "User provisioning", "SOC 2 Type 2", "GDPR compliant", "ISO 27001", "SAML SSO", "Advanced permissions", "Domain verification", "Regional deploys", "Audit logging"]
        : ["Google Meet", "Google Drive", "Google Calendar", "Dropbox", "Confluence", "Jira", "ServiceNow", "Salesforce", "Microsoft Teams", "SharePoint", "Workday", "Slack"];
      side[1].forEach(function (logoUrl, li) {
        var lw = ((w - 48) / 2 - 64 - 20) / 3;
        var lc = F("logo", { parent: rows[Math.floor(li / 3)], w: lw, h: 52, fixH: true, align: "CENTER", cross: "CENTER", fills: [solid(useImages ? t.surface2 : hex("E4E4E4"))], r: 12, stroke: useImages ? undefined : t.line });
        lc.resize(lw, 52); lc.primaryAxisSizingMode = "FIXED"; lc.counterAxisSizingMode = "FIXED";
        if (useImages) cloneMedia(lc, lw - 16, 36, 0, logoUrl, true, "FIT");
        else T(lc, labels[li], { s: 11, c: t.muted, w: 500 });
      });
    });

    var mobile = F("10 iOS app", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 0 });
    var mobSplit = F("msplit", { parent: mobile, w: w, dir: "HORIZONTAL", gap: 80, cross: "CENTER" });
    var mobCopy = F("mc", { parent: mobSplit, w: w - 400, gap: 20 });
    T(mobCopy, "AGENTS IOS APP", { s: 12, c: t.muted, w: 500, ls: 1.6 });
    T(mobCopy, "A polymath in your pocket", { s: 48, c: t.text, lh: 52, wdt: w - 400 });
    T(mobCopy, "Connect all your work apps to get instant answers to anything and solve hours of complex tasks in seconds. Missed a meeting? No problem. The recap is just a tap away.", { s: 18, c: t.muted, lh: 28, wdt: 480 });
    BTN(mobCopy, "Download on iOS", t.accent, t.accentText, t.rBtn);
    cloneMedia(mobSplit, 320, 640, 32, SANA_IMG.ios, useImages);

    var logos = F("11 Logos", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 64, pb: 64, pl: t.padX, pr: t.padX, gap: 32, align: "CENTER", cross: "CENTER" });
    T(logos, "Sana is trusted by leading enterprises across industries", { s: 24, c: t.text, lh: 30, align: "CENTER", wdt: 700 });
    var lr = F("lr", { parent: logos, w: w, dir: "HORIZONTAL", gap: 12 });
    (useImages ? SANA_IMG.logos : ["Enterprise A", "Enterprise B", "Enterprise C", "Enterprise D", "Enterprise E", "Enterprise F", "Enterprise G"]).forEach(function (item) {
      var lw = (w - 72) / 7;
      var c = F("logo", { parent: lr, w: lw, h: 56, fixH: true, align: "CENTER", cross: "CENTER", fills: [solid(useImages ? t.bg : hex("E4E4E4"))], r: 12 });
      c.resize(lw, 56); c.primaryAxisSizingMode = "FIXED"; c.counterAxisSizingMode = "FIXED";
      if (useImages) cloneMedia(c, lw - 20, 40, 0, item, true, "FIT");
    });

    var pricing = F("12 Pricing", { parent: root, w: 1440, fills: [solid(t.surface2)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 48, align: "CENTER", cross: "CENTER" });
    T(pricing, "Pricing", { s: 48, c: t.text, lh: 52, align: "CENTER" });
    var prow = F("prow", { parent: pricing, w: w, dir: "HORIZONTAL", gap: 18 });
    [
      ["Enterprise", "Custom pricing", ["Unlimited members per workspace and documents per integration", "Enterprise integrations", "Domain verification, SAML-based SSO, and SCIM", "Extended range of LLMs", "Analytics dashboard to measure impact", "Dedicated success team, priority support, and SLA", "MCP client for building your own integrations"]],
      ["Team", "$30 per user / month", ["Unlimited queries and meeting recordings", "Up to 50 members per workspace", "Popular integrations incl. Asana, Gmail, Outlook, Zendesk", "OpenAI and Claude model selection", "Enterprise data processing agreement", "10,000 documents per integration", "Priority in email and chat support"]],
      ["Free", "$0", ["10 meetings per month — invite members for more", "Up to 5 members per workspace", "Unlimited assistants and prompt templates", "Meeting integrations with Calendar, Drive, Meet, Teams, and Zoom", "Data integrations with Confluence, Google Drive, OneDrive, Notion, and Sharepoint", "1,000 documents per integration", "Help center support"]],
    ].forEach(function (plan, i) {
      var pw = (w - 36) / 3;
      var c = F("plan", { parent: prow, w: pw, gap: 20, pt: 36, pr: 32, pb: 36, pl: 32, fills: [solid(t.bg)], r: 24, stroke: t.line, sh: i === 1, shY: 12, shB: 32, shA: 0.08 });
      T(c, plan[0], { s: 20, c: t.text, w: 500, font: fM });
      T(c, plan[1], { s: 36, c: t.text, w: 500, lh: 40 });
      plan[2].forEach(function (feat) {
        T(c, "— " + feat, { s: 14, c: t.muted, lh: 22, wdt: pw - 64 });
      });
      BTN(c, i === 0 ? "Contact sales" : i === 1 ? "Get started" : "Sign up free", t.accent, t.accentText, t.rBtn);
    });

    var cta = F("13 CTA", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 80, pb: 80, pl: t.padX, pr: t.padX });
    var ctaCard = F("cta", { parent: cta, w: w, dir: "HORIZONTAL", gap: 40, pt: 56, pr: 56, pb: 56, pl: 56, cross: "CENTER", align: "SPACE_BETWEEN", fills: [solid(t.surface2)], r: 28, stroke: t.line });
    var cc = F("cc", { parent: ctaCard, w: 560, gap: 12 });
    T(cc, "Build expert AI agents in minutes", { s: 44, c: t.text, lh: 48, ls: -1 });
    T(cc, "Book an intro to see Sana in action.", { s: 18, c: t.muted, lh: 28 });
    var er = F("er", { parent: ctaCard, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 10, cross: "CENTER" });
    BTN(er, "Book an intro", t.accent, t.accentText, t.rBtn);

    FOOT_SANA_CLONE(root, t);
  }

  function NAV_LANDING(root, t) {
    var nav = F("00 Nav", { parent: root, w: 1440, h: 48, fixH: true, dir: "HORIZONTAL", align: "SPACE_BETWEEN", cross: "CENTER", pl: t.padX, pr: t.padX, fills: [solid(t.bg)] });
    nav.resize(1440, 48); nav.primaryAxisSizingMode = "FIXED"; nav.counterAxisSizingMode = "FIXED";
    T(nav, "RUBIN", { s: 14, c: t.text, w: 500, ls: 1.2, font: fM });
    var mid = F("mid", { parent: nav, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 24, cross: "CENTER" });
    ["О продукте", "Прозрачность", "Где купить", "Документация", "Для новичков"].forEach(function (l) { T(mid, l, { s: 14, c: t.muted }); });
    var acts = F("acts", { parent: nav, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 16, cross: "CENTER" });
    T(acts, "Документация", { s: 14, c: t.muted });
    BTN_SM(acts, "Получить RUBIN", t.accent, t.accentText, t.rBtn);
    return nav;
  }

  function FOOT_LANDING(root, t) {
    var foot = F("Footer", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 80, pb: 48, pl: t.padX, pr: t.padX, gap: 48 });
    var cols = F("cols", { parent: foot, w: cw(t), dir: "HORIZONTAL", gap: 80, align: "SPACE_BETWEEN" });
    [["Продукт", ["Что такое RUBIN", "Схема работы", "Где используется", "Получить RUBIN"]], ["Прозрачность", ["Обеспечение", "Смарт-контракт", "Аудит", "CoinGecko"]], ["Ресурсы", ["Документация", "Новости", "Для новичков", "Контакты"]]].forEach(function (col) {
      var c = F("col", { parent: cols, w: 200, gap: 16 });
      T(c, col[0], { s: 14, c: t.text, w: 500, font: fM });
      col[1].forEach(function (l) { T(c, l, { s: 14, c: t.muted }); });
    });
    var nl = F("nl", { parent: foot, w: cw(t), dir: "HORIZONTAL", gap: 40, align: "SPACE_BETWEEN", cross: "CENTER" });
    T(nl, "© 2026 RUBIN — рублёвый стейблкоин", { s: 13, c: t.muted });
    var er = F("er", { parent: nl, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 10, cross: "CENTER" });
    var em = F("em", { parent: er, w: 260, h: 44, fixH: true, align: "MIN", cross: "CENTER", pl: 16, fills: [solid(t.bg)], r: 999, stroke: t.line });
    em.resize(260, 44); em.primaryAxisSizingMode = "FIXED"; em.counterAxisSizingMode = "FIXED";
    T(em, "hello@rubin.ru", { s: 14, c: t.muted });
    BTN_SM(er, "Получить RUBIN", t.accent, t.accentText, t.rBtn);
  }

  function buildLandingFeatureSlider(root, t, w, useImages, name, feats) {
    var vh = videoH16x9(w);
    var slider = F(name || "03 Features", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 40, align: "CENTER", cross: "CENTER" });
    T(slider, feats[0][0], { s: 48, c: t.text, lh: 52, align: "CENTER", wdt: 800 });
    T(slider, feats[0][1], { s: 18, c: t.muted, lh: 28, align: "CENTER", wdt: 640 });
    var viewport = F("viewport", { parent: slider, w: w, h: vh, fixH: true, dir: "NONE", fills: [] });
    viewport.resize(w, vh);
    viewport.primaryAxisSizingMode = "FIXED";
    viewport.counterAxisSizingMode = "FIXED";
    viewport.clipsContent = true;
    var gap = 18;
    feats.slice(0, 2).forEach(function (_, i) {
      var slide = cloneMedia(viewport, w, vh, 24, null, useImages);
      slide.x = i * (w + gap);
      slide.y = 0;
    });
    var featTabs = F("feat-tabs", { parent: slider, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 8, cross: "CENTER" });
    feats.forEach(function (f, i) {
      var pill = F("tab", { parent: featTabs, hugW: true, hugH: true, pt: 10, pr: 16, pb: 10, pl: 16, fills: [solid(i === 0 ? t.text : t.surface2)], r: 999, stroke: i === 0 ? undefined : t.line });
      T(pill, f[2], { s: 14, c: i === 0 ? t.accentText : t.text, w: 500, font: fM });
    });
    var controls = F("controls", { parent: slider, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 24, cross: "CENTER" });
    var arrows = F("arrows", { parent: controls, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 12, cross: "CENTER" });
    ["←", "→"].forEach(function (a) {
      var ar = F("arr", { parent: arrows, w: 44, h: 44, fixH: true, align: "CENTER", cross: "CENTER", fills: [solid(t.surface2)], r: 999, stroke: t.line });
      ar.resize(44, 44);
      ar.primaryAxisSizingMode = "FIXED";
      ar.counterAxisSizingMode = "FIXED";
      T(ar, a, { s: 18, c: t.text, w: 500 });
    });
    var dots = F("dots", { parent: controls, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 8, cross: "CENTER" });
    feats.forEach(function (_, di) {
      var dot = F("dot", { parent: dots, w: di === 0 ? 24 : 8, h: 8, fixH: true, fills: [solid(di === 0 ? t.text : t.line)], r: 999 });
      dot.resize(di === 0 ? 24 : 8, 8);
      dot.primaryAxisSizingMode = "FIXED";
      dot.counterAxisSizingMode = "FIXED";
    });
  }

  function buildRubinLanding(root, t, useImages) {
    var w = cw(t);
    var cardGap = 18;
    var cardW = Math.floor((w - cardGap) / 2);
    var cardH = 560;

    NAV_LANDING(root, t);

    // 01 Hero — QI
    var hero = F("01 Hero", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 64, pb: 80, pl: t.padX, pr: t.padX, gap: 28, align: "CENTER", cross: "CENTER" });
    T(hero, "RUBIN", { s: 12, c: t.muted, w: 500, ls: 1.6, align: "CENTER", font: fM });
    T(hero, "Рублёвый стейблкоин\nдля международных\nрасчётов и on-chain\nопераций", { s: 72, c: t.text, lh: 72, ls: -2.6, wdt: 900, align: "CENTER" });
    T(hero, "Для квалифицированных инвесторов и бизнеса: переводы, хранение рублёвой стоимости и операции в блокчейне без банковских ограничений.", { s: 20, c: t.muted, lh: 30, wdt: 640, align: "CENTER" });
    BTN(hero, "Получить RUBIN", t.accent, t.accentText, t.rBtn);
    cloneMedia(hero, w, videoH16x9(w), 24, null, useImages);

    // 02 Platform — Что такое RUBIN
    var platform = F("02 Platform", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 100, pb: t.padY, pl: t.padX, pr: t.padX, gap: 48, align: "CENTER", cross: "CENTER" });
    T(platform, "Что такое RUBIN", { s: 48, c: t.text, lh: 52, align: "CENTER", wdt: 800 });
    T(platform, "RUBIN — рублёвый стейблкоин с привязкой 1:1 к российскому рублю. Стабильность национальной валюты и возможности блокчейна для международных операций.", { s: 18, c: t.muted, lh: 28, align: "CENTER", wdt: 640 });
    var tabs = F("tabs", { parent: platform, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 8, cross: "CENTER" });
    ["1:1 к ₽", "Переводы", "24/7", "Блокчейн", "Обеспечение"].forEach(function (tab, i) {
      var pill = F("tab", { parent: tabs, hugW: true, hugH: true, pt: 10, pr: 16, pb: 10, pl: 16, fills: [solid(i === 0 ? t.text : t.surface2)], r: 999, stroke: i === 0 ? undefined : t.line });
      T(pill, tab, { s: 14, c: i === 0 ? t.accentText : t.text, w: 500, font: fM });
    });
    var dual = F("dual", { parent: platform, w: w, dir: "HORIZONTAL", gap: cardGap });
    [null, null].forEach(function (url) {
      var card = F("card", { parent: dual, w: cardW, fills: [solid(t.surface2)], r: 24, stroke: t.line, sh: true, shY: 16, shB: 48, shA: 0.06 });
      cloneMedia(card, cardW, cardH, 0, url, useImages);
    });

    // 03 Feature slider — свойства
    buildLandingFeatureSlider(root, t, w, useImages, "03 Features", [
      ["1 RUBIN = 1 ₽", "Привязка один к одному к российскому рублю — стабильная единица для расчётов и хранения стоимости.", "1:1"],
      ["Быстрые международные переводы", "Отправка и получение средств без банковских ограничений и выходных.", "Переводы"],
      ["Доступ 24/7", "Операции в любое время — блокчейн не закрывается на праздники.", "24/7"],
      ["Прозрачный блокчейн", "Публичные транзакции и открытая сеть — проверка в любой момент.", "Прозрачность"],
      ["Обеспечение в рублях", "Эмиссия только при наличии рублёвого обеспечения — политика прозрачности проекта.", "Обеспечение"],
    ]);

    // 04 Metrics
    var metrics = F("04 Metrics", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 80, pb: 80, pl: t.padX, pr: t.padX, gap: 32 });
    var mrow = F("mrow", { parent: metrics, w: w, dir: "HORIZONTAL", gap: 12 });
    [
      ["Привязка", "1:1", "к российскому рублю"],
      ["Сеть", "TRON", "публичный блокчейн"],
      ["Доступ", "24/7", "отправка и получение"],
      ["Эмиссия", "под ₽", "только с обеспечением"],
      ["Проверка", "on-chain", "смарт-контракт"],
      ["Рынок", "открыт", "данные на CoinGecko"],
    ].forEach(function (m) {
      var mw = (w - 60) / 6;
      var c = F("m", { parent: mrow, w: mw, gap: 12, pt: 24, pr: 16, pb: 24, pl: 16, fills: [solid(t.surface2)], r: 16, stroke: t.line });
      T(c, m[0], { s: 13, c: t.muted, w: 500, ls: 0.5 });
      T(c, m[1], { s: 36, c: t.text, w: 500, lh: 40 });
      T(c, m[2], { s: 14, c: t.muted, lh: 20, wdt: mw - 32 });
    });

    // 05 Split — схема работы
    var model = F("05 Scheme", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 0 });
    var mSplit = F("split", { parent: model, w: w, dir: "HORIZONTAL", gap: 64, cross: "CENTER" });
    var mCopy = F("copy", { parent: mSplit, w: (w - 64) / 2, gap: 20 });
    T(mCopy, "Схема работы RUBIN", { s: 40, c: t.text, lh: 44, wdt: (w - 64) / 2 });
    T(mCopy, "Эмиссия RUBIN осуществляется только при наличии обеспечения в рублях. Такой подход поддерживает стабильность стоимости и привязку 1 RUBIN = 1 ₽. Данные об обеспечении и выпуске публикуются в рамках политики прозрачности.", { s: 18, c: t.muted, lh: 28, wdt: (w - 64) / 2 - 20 });
    BTN(mCopy, "Смотреть прозрачность", t.accent, t.accentText, t.rBtn);
    cloneMedia(mSplit, (w - 64) / 2, videoH16x9((w - 64) / 2), 24, null, useImages);

    // 06 Teams — где используется
    var teams = F("06 Use cases", { parent: root, w: 1440, fills: [solid(t.surface2)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 40 });
    T(teams, "Где используется RUBIN", { s: 40, c: t.text, lh: 44, wdt: 600 });
    var teamTabs = F("ttabs", { parent: teams, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 20, cross: "CENTER" });
    ["→ Международные переводы", "B2B-расчёты", "Сохранение стоимости", "Крипто-инфраструктура"].forEach(function (tab, i) {
      T(teamTabs, tab, { s: 15, c: i === 0 ? t.text : t.muted, w: 500, font: i === 0 ? fM : fB });
    });
    var teamPanel = F("panel", { parent: teams, w: w, dir: "HORIZONTAL", gap: 48, cross: "CENTER" });
    var tpCopy = F("tpc", { parent: teamPanel, w: w - 520, gap: 16 });
    T(tpCopy, "Быстрые и надёжные переводы по всему миру", { s: 28, c: t.text, lh: 34, wdt: w - 520 });
    T(tpCopy, "Используйте RUBIN для операций с зарубежными партнёрами, хранения рублёвой ликвидности в цифровой форме и работы в кошельках, биржах и цифровых сервисах.", { s: 16, c: t.muted, lh: 26, wdt: w - 520 });
    cloneMedia(teamPanel, 520, videoH16x9(520), 20, null, useImages);

    // 07 Integrations — ресурсы и прозрачность
    var trust = F("07 Transparency", { parent: root, w: 1440, fills: [solid(t.surface2)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 48 });
    T(trust, "Ресурсы и прозрачность", { s: 40, c: t.text, lh: 44, align: "CENTER", wdt: 700 });
    T(trust, "Открытые данные об обеспечении, выпуске и безопасности — для тех, кто проверяет перед использованием.", { s: 18, c: t.muted, lh: 28, align: "CENTER", wdt: 640 });
    var trSplit = F("tsplit", { parent: trust, w: w, dir: "HORIZONTAL", gap: 48 });
    [
      ["Рынок и контракт", ["CoinGecko", "Цена и объём", "Смарт-контракт", "Адрес on-chain", "Explorer", "Проверка tx", "TRON", "Сеть выпуска", "Документация", "Спецификация", "API / данные", "Интеграции"]],
      ["Аудит и обеспечение", ["Аудит", "Независимая проверка", "Обеспечение", "Рублёвый резерв", "Эмиссия", "Политика выпуска", "Отчётность", "Ключевые KPI", "Прозрачность", "Публичные данные", "Безопасность", "Контроль доступа"]],
    ].forEach(function (side) {
      var col = F("sc", { parent: trSplit, w: (w - 48) / 2, gap: 24, pt: 32, pr: 32, pb: 32, pl: 32, fills: [solid(t.bg)], r: 24, stroke: t.line });
      T(col, side[0], { s: 20, c: t.text, w: 500, font: fM });
      var grid = F("grid", { parent: col, w: (w - 48) / 2 - 64, dir: "HORIZONTAL", gap: 10 });
      var g2 = F("g2", { parent: col, w: (w - 48) / 2 - 64, dir: "HORIZONTAL", gap: 10 });
      var g3 = F("g3", { parent: col, w: (w - 48) / 2 - 64, dir: "HORIZONTAL", gap: 10 });
      var g4 = F("g4", { parent: col, w: (w - 48) / 2 - 64, dir: "HORIZONTAL", gap: 10 });
      var rows = [grid, g2, g3, g4];
      side[1].forEach(function (label, li) {
        var lw = ((w - 48) / 2 - 64 - 20) / 3;
        var lc = F("logo", { parent: rows[Math.floor(li / 3)], w: lw, h: 52, fixH: true, align: "CENTER", cross: "CENTER", fills: [solid(t.surface2)], r: 12, stroke: t.line });
        lc.resize(lw, 52); lc.primaryAxisSizingMode = "FIXED"; lc.counterAxisSizingMode = "FIXED";
        T(lc, label, { s: 11, c: t.muted, w: 500 });
      });
    });

    // 08 News as testimonials
    var quotes = F("08 News", { parent: root, w: 1440, fills: [solid(t.surface2)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    T(quotes, "Новости и медиа", { s: 40, c: t.text, lh: 44, wdt: 600 });
    T(quotes, "Последние публикации, обновления и материалы о RUBIN", { s: 18, c: t.muted, lh: 28, wdt: 560 });
    var qr = F("qr", { parent: quotes, w: w, dir: "HORIZONTAL", gap: 18 });
    [
      ["«RUBIN завершил тестирование системы расчётов для ВЭД»", "28 апреля 2026", "Кошелёк · Новости", null],
      ["«Токен RUBIN завершил тесты расчётов — на горизонте доступ для бизнеса и частных клиентов»", "28 апреля 2026", "Кошелёк · Обновление", null],
    ].forEach(function (q, i) {
      var qw = (w - 18) / 2;
      if (useImages) {
        var card = F("q", { parent: qr, w: qw, h: 380, fixH: true, dir: "NONE", fills: [], r: 24 });
        card.cornerRadius = 24;
        card.clipsContent = true;
        var bg = cloneMedia(card, qw, 380, 0, q[3], true);
        bg.x = 0; bg.y = 0;
        var overlay = F("overlay", { parent: card, w: qw, gap: 20, pt: 40, pr: 40, pb: 40, pl: 40 });
        overlay.x = 0; overlay.y = 0;
        T(overlay, q[0], { s: 22, c: hex("FFFFFF"), lh: 32, wdt: qw - 80 });
        T(overlay, q[1], { s: 15, c: hex("FFFFFF"), w: 500, font: fM });
        T(overlay, q[2], { s: 13, c: hex("FFFFFF"), wdt: qw - 80 });
      } else {
        var c = F("q", { parent: qr, w: qw, gap: 24, pt: 40, pr: 40, pb: 40, pl: 40, fills: [solid(t.bg)], r: 24, stroke: t.line });
        T(c, q[0], { s: 22, c: t.text, lh: 32, wdt: qw - 80 });
        T(c, q[1], { s: 15, c: t.text, w: 500, font: fM });
        T(c, q[2], { s: 13, c: t.muted });
      }
    });
    var qdots = F("dots", { parent: quotes, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 8, cross: "CENTER" });
    [0, 1, 2, 3, 4].forEach(function (di) {
      var dot = F("dot", { parent: qdots, w: di === 0 ? 24 : 8, h: 8, fixH: true, fills: [solid(di === 0 ? t.text : t.line)], r: 999 });
      dot.resize(di === 0 ? 24 : 8, 8); dot.primaryAxisSizingMode = "FIXED"; dot.counterAxisSizingMode = "FIXED";
    });

    // 09 Partnership — новая эпоха
    var partner = F("09 Era", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 40, align: "CENTER", cross: "CENTER" });
    if (useImages) cloneMedia(partner, w, 280, 24, null, true);
    T(partner, "НОВАЯ ЭПОХА ГЛОБАЛЬНЫХ РАСЧЁТОВ", { s: 12, c: t.muted, w: 500, ls: 1.6, align: "CENTER" });
    T(partner, "Стабильность рубля\nи преимущества блокчейна", { s: 48, c: t.text, lh: 52, align: "CENTER", wdt: 700 });
    T(partner, "RUBIN объединяет национальную валюту и цифровую инфраструктуру для международных расчётов в открытой экономике.", { s: 18, c: t.muted, lh: 28, align: "CENTER", wdt: 640 });
    var pl = F("plist", { parent: partner, w: w, dir: "HORIZONTAL", gap: 48 });
    [
      ["Многополярность", "Развитие новых центров экономической силы"],
      ["Финансовая независимость", "Свобода расчётов и защита национальных интересов"],
      ["Открытая экономика", "Новые цифровые инструменты для глобальной экономики"],
      ["Устойчивое будущее", "Справедливая и открытая финансовая среда"],
    ].forEach(function (item) {
      var col = F("col", { parent: pl, w: (w - 144) / 4, gap: 10 });
      T(col, "→ " + item[0], { s: 16, c: t.text, w: 500, font: fM, wdt: (w - 144) / 4 - 10 });
      T(col, item[1], { s: 14, c: t.muted, lh: 22, wdt: (w - 144) / 4 - 10 });
    });
    BTN(partner, "Получить RUBIN", t.accent, t.accentText, t.rBtn);

    // 10 Logos / get
    var logos = F("10 Get RUBIN", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 64, pb: 64, pl: t.padX, pr: t.padX, gap: 32, align: "CENTER", cross: "CENTER" });
    T(logos, "Получить RUBIN на проверенных площадках", { s: 24, c: t.text, lh: 30, align: "CENTER", wdt: 700 });
    T(logos, "Покупайте и обменивайте RUBIN с доступом для пользователей из разных стран", { s: 16, c: t.muted, lh: 24, align: "CENTER", wdt: 560 });
    var lr = F("lr", { parent: logos, w: w, dir: "HORIZONTAL", gap: 12 });
    ["Биржа A", "Биржа B", "DEX", "OTC", "Кошелёк", "Кастодиан", "Партнёр"].forEach(function (item) {
      var lw = (w - 72) / 7;
      var c = F("logo", { parent: lr, w: lw, h: 56, fixH: true, align: "CENTER", cross: "CENTER", fills: [solid(t.surface2)], r: 12, stroke: t.line });
      c.resize(lw, 56); c.primaryAxisSizingMode = "FIXED"; c.counterAxisSizingMode = "FIXED";
      T(c, item, { s: 12, c: t.muted, w: 500 });
    });

    // 11 CTA — QI
    var cta = F("11 CTA", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 80, pb: 80, pl: t.padX, pr: t.padX });
    var ctaCard = F("cta", { parent: cta, w: w, dir: "HORIZONTAL", gap: 40, pt: 56, pr: 56, pb: 56, pl: 56, cross: "CENTER", align: "SPACE_BETWEEN", fills: [solid(t.surface2)], r: 28, stroke: t.line });
    var cc = F("cc", { parent: ctaCard, w: 560, gap: 12 });
    T(cc, "Присоединяйтесь к новой цифровой экономике", { s: 44, c: t.text, lh: 48, ls: -1, wdt: 560 });
    T(cc, "Используйте RUBIN для международных расчётов без границ.", { s: 18, c: t.muted, lh: 28 });
    var er = F("er", { parent: ctaCard, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 10, cross: "CENTER" });
    BTN(er, "Получить RUBIN", t.accent, t.accentText, t.rBtn);

    // ——— Новички (в конце) ———

    // 12 Split — для начинающих
    var beginner = F("12 Beginners", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 0 });
    var bSplit = F("split", { parent: beginner, w: w, dir: "HORIZONTAL", gap: 64, cross: "CENTER" });
    var bCopy = F("copy", { parent: bSplit, w: (w - 64) / 2, gap: 20 });
    T(bCopy, "ЕСЛИ ВЫ ТОЛЬКО НАЧИНАЕТЕ", { s: 12, c: t.muted, w: 500, ls: 1.6 });
    T(bCopy, "Что такое стейблкоин\nпростыми словами", { s: 40, c: t.text, lh: 44, wdt: (w - 64) / 2 });
    T(bCopy, "Стейблкоин — это цифровой актив, привязанный к стабильной валюте. RUBIN привязан к рублю: 1 RUBIN ≈ 1 ₽. Его можно переводить, хранить и использовать в блокчейне — без резких скачков курса, как у обычной криптовалюты.", { s: 18, c: t.muted, lh: 28, wdt: (w - 64) / 2 - 20 });
    BTN(bCopy, "Открыть документацию", t.accent, t.accentText, t.rBtn);
    cloneMedia(bSplit, (w - 64) / 2, videoH16x9((w - 64) / 2), 24, null, useImages);

    // 13 Feature slider — FAQ для новичков
    buildLandingFeatureSlider(root, t, w, useImages, "13 Beginner FAQ", [
      ["Как купить RUBIN?", "На проверенных торговых площадках: зарегистрируйтесь, пройдите проверку при необходимости и обменяйте рубли или другую валюту на RUBIN.", "Купить"],
      ["Где хранить?", "В совместимом кошельке сети TRON или у кастодиана / на бирже — как вам удобнее контролировать доступ.", "Хранить"],
      ["Чем отличается от «крипты»?", "Обычные криптовалюты волатильны. RUBIN привязан к рублю — цена стремится оставаться около 1 ₽.", "Отличие"],
      ["Зачем он нужен новичку?", "Чтобы переводить и хранить рублёвую стоимость в цифровой форме — без глубокого трейдинга.", "Зачем"],
      ["С чего начать?", "Прочитайте документацию, выберите площадку и сделайте небольшой тестовый перевод.", "Старт"],
    ]);

    // 14 Pricing pattern → 3 шага
    var pricing = F("14 Steps", { parent: root, w: 1440, fills: [solid(t.surface2)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 48, align: "CENTER", cross: "CENTER" });
    T(pricing, "Три шага для новичка", { s: 48, c: t.text, lh: 52, align: "CENTER" });
    var prow = F("prow", { parent: pricing, w: w, dir: "HORIZONTAL", gap: 18 });
    [
      ["01", "Площадка", ["Выберите проверенную биржу или сервис", "Создайте аккаунт", "При необходимости пройдите KYC", "Подготовьте способ оплаты"]],
      ["02", "Покупка RUBIN", ["Обменяйте рубли или другую валюту", "Проверьте курс и комиссию", "Дождитесь зачисления", "Сохраните адрес кошелька"]],
      ["03", "Использование", ["Храните RUB-стоимость в цифре", "Отправьте перевод партнёру", "Или держите в кошельке", "Сверяйте операции on-chain"]],
    ].forEach(function (plan, i) {
      var pw = (w - 36) / 3;
      var c = F("plan", { parent: prow, w: pw, gap: 20, pt: 36, pr: 32, pb: 36, pl: 32, fills: [solid(t.bg)], r: 24, stroke: t.line, sh: i === 1, shY: 12, shB: 32, shA: 0.08 });
      T(c, plan[0], { s: 20, c: t.text, w: 500, font: fM });
      T(c, plan[1], { s: 36, c: t.text, w: 500, lh: 40 });
      plan[2].forEach(function (feat) {
        T(c, "— " + feat, { s: 14, c: t.muted, lh: 22, wdt: pw - 64 });
      });
      BTN(c, i === 2 ? "Открыть документацию" : "Далее", t.accent, t.accentText, t.rBtn);
    });

    // 15 Soft CTA beginners
    var cta2 = F("15 CTA beginners", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 80, pb: 80, pl: t.padX, pr: t.padX });
    var ctaCard2 = F("cta", { parent: cta2, w: w, dir: "HORIZONTAL", gap: 40, pt: 56, pr: 56, pb: 56, pl: 56, cross: "CENTER", align: "SPACE_BETWEEN", fills: [solid(t.surface2)], r: 28, stroke: t.line });
    var cc2 = F("cc", { parent: ctaCard2, w: 560, gap: 12 });
    T(cc2, "Узнайте больше — без спешки", { s: 44, c: t.text, lh: 48, ls: -1, wdt: 560 });
    T(cc2, "Документация и прозрачные данные помогут разобраться в своём темпе.", { s: 18, c: t.muted, lh: 28 });
    var er2 = F("er", { parent: ctaCard2, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 10, cross: "CENTER" });
    BTN(er2, "Открыть документацию", t.accent, t.accentText, t.rBtn);

    FOOT_LANDING(root, t);
  }

  function buildSynthesia(root, t) {
    var w = cw(t);
    NAV(root, t, t.padX);
    var hero = F("01 Герой", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 80, pb: 64, pl: t.padX, pr: t.padX, gap: 40, align: "CENTER", cross: "CENTER" });
    T(hero, H1, { s: 64, c: t.text, lh: 68, ls: -2, wdt: 900, align: "CENTER" });
    T(hero, LEAD, { s: 18, c: t.muted, lh: 28, wdt: 600, align: "CENTER" });
    BTN(hero, "Начать", t.accent, t.accentText, t.rBtn);
    VID(hero, w, "Видео · 16:9 · люди · спокойный момент", ph(t, 0), 16);
    // Avatar grid 4x2
    var avatars = F("02 Аватары", { parent: root, w: 1440, fills: [solid(t.surface)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 24 });
    T(avatars, "Люди рядом — не скрины профита", { s: 40, c: t.text, lh: 44, align: "CENTER" });
    var rows = [F("r1", { parent: avatars, w: w, dir: "HORIZONTAL", gap: 16 }), F("r2", { parent: avatars, w: w, dir: "HORIZONTAL", gap: 16 })];
    PEOPLE.concat(PEOPLE).forEach(function (p, i) {
      var aw = (w - 48) / 4;
      var card = F("av", { parent: rows[i < 4 ? 0 : 1], w: aw, gap: 10, fills: [solid(t.bg)], r: 12, stroke: t.line });
      PH(card, aw, 200, p[2], ph(t, i), 8);
      var cp = F("cp", { parent: card, w: aw, gap: 4, pt: 12, pr: 16, pb: 16, pl: 16 });
      T(cp, p[0], { s: 16, c: t.text, w: 500 });
      T(cp, p[1], { s: 13, c: t.muted });
    });
    buildLogoStrip(root, t, w);
    buildMythsBlock(root, t, w, "light");
    buildStepsBlock(root, t, w, "light");
    buildRubinExtended(root, t, w, "light", ["metrics6", "quotes", "clarity", "teams", "support", "trustGrid", "mobile", "pricing", "emailCta"]);
    FOOT(root, t, t.padX);
  }
  function buildLogoStrip(root, t, w) {
    var logos = F("01b Логотипы", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 40, pb: 40, pl: t.padX, pr: t.padX, gap: 20 });
    if (t.line) { logos.strokes = [solid(t.line)]; logos.strokeTopWeight = 1; logos.strokeBottomWeight = 1; logos.strokeLeftWeight = 0; logos.strokeRightWeight = 0; }
    T(logos, "О нас пишут и нас проверяют", { s: 13, c: t.muted, w: 500, ls: 1.2 });
    var lr = F("lr", { parent: logos, w: w, dir: "HORIZONTAL", gap: 12 });
    LOGOS.forEach(function (l, i) {
      var lw = (w - 48) / 5;
      var c = F("logo", { parent: lr, w: lw, h: 64, fixH: true, align: "CENTER", cross: "CENTER", fills: [solid(ph(t, i))], r: 12 });
      c.resize(lw, 64); c.primaryAxisSizingMode = "FIXED"; c.counterAxisSizingMode = "FIXED";
      T(c, l, { s: 14, c: t.text, w: 500 });
    });
  }

  function buildDualVideoRow(root, t, w) {
    var sec = F("02 Два продукта", { parent: root, w: 1440, fills: [solid(t.surface || t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    var dr = F("dr", { parent: sec, w: w, dir: "HORIZONTAL", gap: 18 });
    [["Первая сделка", "Человек · момент"], ["Кошелёк", "Руки · телефон"]].forEach(function (d, i) {
      var dw = (w - 18) / 2;
      var c = F("d", { parent: dr, w: dw, gap: 16, fills: [solid(t.bg)], r: 20, stroke: t.line, sh: true, shY: 12, shB: 32 });
      PH(c, dw, 400, d[1], ph(t, i), 0);
      var cp = F("cp", { parent: c, w: dw, gap: 6, pt: 20, pr: 24, pb: 24, pl: 24 });
      T(cp, d[0], { s: 22, c: t.text, w: 500 });
    });
  }

  function buildPeopleGrid(root, t, w, cols, rows) {
    var sec = F("Люди", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 24 });
    T(sec, "Люди рядом — не скрины профита", { s: 40, c: t.text, lh: 44, wdt: 560 });
    var gap = 16;
    for (var r = 0; r < rows; r++) {
      var row = F("pr" + r, { parent: sec, w: w, dir: "HORIZONTAL", gap: gap });
      for (var c = 0; c < cols; c++) {
        var idx = r * cols + c;
        if (idx >= PEOPLE.length) break;
        var pw = (w - gap * (cols - 1)) / cols;
        var card = F("p", { parent: row, w: pw, gap: 12, fills: [solid(t.surface || ph(t, idx))], r: 16, stroke: t.line });
        PH(card, pw, 280, PEOPLE[idx][2], ph(t, idx), 0);
        var cp = F("cp", { parent: card, w: pw, gap: 4, pt: 16, pr: 16, pb: 20, pl: 16 });
        T(cp, PEOPLE[idx][0], { s: 18, c: t.text, w: 500 });
        T(cp, PEOPLE[idx][1], { s: 14, c: t.muted });
      }
    }
  }

  function buildMythsBlock(root, t, w, style) {
    var bg = style === "dark" ? t.bg : (style === "warm" ? t.surface : t.surface || t.bg);
    var myths = F("Мифы", { parent: root, w: 1440, fills: [solid(bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    T(myths, "Кажется сложно.\nНа деле — иначе.", { s: style === "dark" ? 48 : 40, c: style === "dark" ? hex("FFFFFF") : t.text, lh: style === "dark" ? 52 : 44, wdt: 560 });
    var mr = F("mr", { parent: myths, w: w, dir: "HORIZONTAL", gap: 16 });
    MYTHS.forEach(function (m, i) {
      var mw = (w - 32) / 3;
      var c = F("m", { parent: mr, w: mw, gap: 14, pt: style === "sana" ? 28 : 24, pr: 24, pb: 28, pl: 24,
        fills: [solid(style === "dark" ? hex("141414") : style === "warm" ? ph(t, i) : (t.surface2 || ph(t, i)))],
        r: style === "strict" ? 4 : 16, stroke: style === "sana" || style === "light" ? t.line : undefined });
      if (style === "warm" || style === "light" || style === "sana") {
        PH(c, mw - (style === "sana" ? 56 : 48), 140, m[2], ph(t, i), 12);
      }
      T(c, m[0], { s: 20, c: style === "dark" ? hex("FFFFFF") : t.text, w: 500, lh: 26, wdt: mw - 48 });
      T(c, m[1], { s: 15, c: style === "dark" ? hex("888888") : t.muted, lh: 23, wdt: mw - 48 });
    });
  }

  function buildStepsBlock(root, t, w, style) {
    var steps = F("Три шага", { parent: root, w: 1440, fills: [solid(style === "dark" ? t.surface : t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    T(steps, "Как начать за три шага", { s: 40, c: style === "dark" ? hex("FFFFFF") : t.text, lh: 44 });
    var sr = F("sr", { parent: steps, w: w, dir: "HORIZONTAL", gap: 16 });
    STEPS.forEach(function (s, i) {
      var sw = (w - 32) / 3;
      var c = F("s", { parent: sr, w: sw, gap: 14, pt: 20, pr: 20, pb: 24, pl: 20,
        fills: [solid(style === "dark" ? hex("1A1A1A") : (t.surface2 || t.surface || ph(t, i)))], r: 16, stroke: t.line });
      PH(c, sw - 40, 180, s[3], ph(t, i), 12);
      T(c, "Шаг " + s[0], { s: 12, c: t.muted, w: 500, ls: 1.4 });
      T(c, s[1], { s: 20, c: style === "dark" ? hex("FFFFFF") : t.text, w: 500, lh: 26, wdt: sw - 48 });
      T(c, s[2], { s: 15, c: t.muted, lh: 22, wdt: sw - 48 });
    });
  }

  function buildProductBlock(root, t, w, style) {
    var prod = F("Продукт", { parent: root, w: 1440, fills: [solid(style === "dark" ? t.bg : t.surface || t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    T(prod, "Что внутри", { s: 40, c: style === "dark" ? hex("FFFFFF") : t.text, lh: 44 });
    PH(prod, w, 420, "Мокап · спокойный экран в руках", ph(t, 0), style === "dark" ? 4 : 16);
    var fr = F("fr", { parent: prod, w: w, dir: "HORIZONTAL", gap: 16 });
    FEATS.forEach(function (f, i) {
      var fw = (w - 32) / 3;
      var c = F("f", { parent: fr, w: fw, gap: 10, pt: 20, pr: 20, pb: 24, pl: 20,
        fills: [solid(style === "dark" ? hex("141414") : t.bg)], r: 12, stroke: t.line });
      T(c, f[0], { s: 18, c: style === "dark" ? hex("FFFFFF") : t.text, w: 500, lh: 24 });
      T(c, f[1], { s: 14, c: t.muted, lh: 22, wdt: fw - 40 });
    });
  }

  function buildCtaBlock(root, t, w, style) {
    var cta = F("Призыв", { parent: root, w: 1440, fills: [solid(style === "dark" ? t.bg : t.bg)], pt: t.padY + 20, pb: t.padY + 20, pl: t.padX, pr: t.padX, gap: 24, align: "CENTER", cross: "CENTER" });
    T(cta, "Начни сегодня", { s: 48, c: style === "dark" ? hex("FFFFFF") : t.text, lh: 52, align: "CENTER" });
    T(cta, "Спокойный вход. Без пафоса и гонки.", { s: 18, c: style === "dark" ? hex("888888") : t.muted, lh: 28, align: "CENTER" });
    BTN(cta, "Начать", t.accent, t.accentText, t.rBtn);
  }

  function buildTrustBlock(root, t, w, style) {
    var trust = F("Доверие", { parent: root, w: 1440, fills: [solid(style === "dark" ? t.surface : t.surface2 || t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    T(trust, "Доверие — через людей\nи понятные слова", { s: 40, c: style === "dark" ? hex("FFFFFF") : t.text, lh: 44, wdt: 560 });
    var tr = F("tr", { parent: trust, w: w, dir: "HORIZONTAL", gap: 16 });
    METRICS.forEach(function (m, i) {
      var tw = (w - 48) / 4;
      var c = F("m", { parent: tr, w: tw, gap: 8, pt: 24, pr: 20, pb: 24, pl: 20,
        fills: [solid(style === "dark" ? hex("1A1A1A") : t.bg)], r: 12, stroke: t.line });
      T(c, m[0], { s: 36, c: style === "dark" ? hex("FFFFFF") : t.text, w: 500, lh: 40 });
      T(c, m[1], { s: 14, c: t.muted, lh: 20, wdt: tw - 40 });
    });
  }

  function sc(style, t) {
    return {
      text: t.text,
      muted: t.muted,
      bg: t.bg,
      sec: t.surface2 || t.surface || t.bg,
      card: t.surface2 || t.surface || t.bg,
      card2: t.bg,
      r: style === "strict" ? 4 : style === "sana" ? 24 : 16,
    };
  }

  function buildRubinMetrics6(root, t, w, style, name) {
    var c = sc(style, t);
    var metrics = F(name || "Метрики", { parent: root, w: 1440, fills: [solid(c.bg)], pt: 80, pb: 80, pl: t.padX, pr: t.padX, gap: 32 });
    var mrow = F("mrow", { parent: metrics, w: w, dir: "HORIZONTAL", gap: 12 });
    RUBIN_METRICS6.forEach(function (m, i) {
      var mw = (w - 60) / 6;
      var card = F("m", { parent: mrow, w: mw, gap: 12, pt: 24, pr: 16, pb: 24, pl: 16, fills: [solid(c.card)], r: c.r, stroke: t.line });
      T(card, m[0], { s: 13, c: c.muted, w: 500, ls: 0.5 });
      T(card, m[1], { s: 36, c: c.text, w: 500, lh: 40 });
      T(card, m[2], { s: 14, c: c.muted, lh: 20, wdt: mw - 32 });
    });
  }

  function buildRubinQuotes(root, t, w, style, name) {
    var c = sc(style, t);
    var quotes = F(name || "Отзывы", { parent: root, w: 1440, fills: [solid(c.sec)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    var qr = F("qr", { parent: quotes, w: w, dir: "HORIZONTAL", gap: 18 });
    RUBIN_QUOTES.forEach(function (q, i) {
      var qw = (w - 18) / 2;
      var card = F("q", { parent: qr, w: qw, gap: 24, pt: 40, pr: 40, pb: 40, pl: 40, fills: [solid(c.card2)], r: c.r, stroke: t.line });
      T(card, q[0], { s: 22, c: c.text, lh: 32, wdt: qw - 80 });
      var au = F("au", { parent: card, w: qw - 80, dir: "HORIZONTAL", gap: 16, cross: "CENTER" });
      PH(au, 56, 56, q[3], ph(t, i), 999);
      var ac = F("ac", { parent: au, gap: 4 });
      T(ac, q[1], { s: 15, c: c.text, w: 500, font: fM });
      T(ac, q[2], { s: 13, c: c.muted });
    });
    var dots = F("dots", { parent: quotes, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 8, cross: "CENTER" });
    [0, 1, 2, 3, 4].forEach(function (di) {
      var dot = F("dot", { parent: dots, w: di === 0 ? 24 : 8, h: 8, fixH: true, fills: [solid(di === 0 ? c.text : t.line)], r: 999 });
      dot.resize(di === 0 ? 24 : 8, 8); dot.primaryAxisSizingMode = "FIXED"; dot.counterAxisSizingMode = "FIXED";
    });
  }

  function buildRubinClaritySplit(root, t, w, style, name) {
    var c = sc(style, t);
    var clarity = F(name || "Ясность", { parent: root, w: 1440, fills: [solid(c.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 0 });
    var split = F("split", { parent: clarity, w: w, dir: "HORIZONTAL", gap: 64, cross: "CENTER" });
    var copy = F("copy", { parent: split, w: (w - 64) / 2, gap: 20 });
    T(copy, "Биржа без жаргона", { s: 40, c: c.text, lh: 44, wdt: (w - 64) / 2 });
    T(copy, "Термины раскрываются прямо в интерфейсе. Сложные инструменты лежат глубже — и ждут, когда понадобятся.", { s: 18, c: c.muted, lh: 28, wdt: (w - 64) / 2 - 20 });
    BTN(copy, "Начать", t.accent, t.accentText, t.rBtn);
    VID(split, (w - 64) / 2, "Видео · понятный язык", ph(t, 0), c.r);
  }

  function buildRubinTeams(root, t, w, style, name) {
    var c = sc(style, t);
    var teams = F(name || "Команды", { parent: root, w: 1440, fills: [solid(c.sec)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 40 });
    T(teams, "Крипта для разных людей", { s: 40, c: c.text, lh: 44, wdt: 600 });
    var teamTabs = F("ttabs", { parent: teams, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 20, cross: "CENTER" });
    ["→ Новички", "Инвесторы", "Бизнес", "Семьи", "Фрилансеры"].forEach(function (tab, i) {
      T(teamTabs, tab, { s: 15, c: i === 0 ? c.text : c.muted, w: 500, font: i === 0 ? fM : fB });
    });
    var panel = F("panel", { parent: teams, w: w, dir: "HORIZONTAL", gap: 48, cross: "CENTER" });
    var tpCopy = F("tpc", { parent: panel, w: w - 520, gap: 16 });
    T(tpCopy, "Начните с малого — без страха и без учебника", { s: 28, c: c.text, lh: 34, wdt: w - 520 });
    T(tpCopy, MYTHS[0][1], { s: 16, c: c.muted, lh: 26, wdt: w - 520 });
    VID(panel, 520, "Видео · новичок", ph(t, 1), style === "strict" ? 4 : 20);
  }

  function buildRubinSupport(root, t, w, style, name) {
    var c = sc(style, t);
    var partner = F(name || "Поддержка", { parent: root, w: 1440, fills: [solid(c.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 40, align: "CENTER", cross: "CENTER" });
    T(partner, "ПОДДЕРЖКА", { s: 12, c: c.muted, w: 500, ls: 1.6, align: "CENTER" });
    T(partner, "Сопровождаем\nна каждом шаге", { s: 48, c: c.text, lh: 52, align: "CENTER", wdt: 700 });
    T(partner, "Понятный старт — это не один экран, а целый спокойный процесс от регистрации до первой сделки.", { s: 18, c: c.muted, lh: 28, align: "CENTER", wdt: 640 });
    var pl = F("plist", { parent: partner, w: w, dir: "HORIZONTAL", gap: 48 });
    [
      ["Персональный онбординг", "Помогаем пройти первые три шага без стресса."],
      ["Поддержка 24/7", "Живые люди — не бот с шаблонами."],
      ["Понятные материалы", "Без жаргона и без обещаний доходности."],
      ["Комьюнити", "Обычные люди делятся опытом — без скринов профита."],
    ].forEach(function (item) {
      var col = F("col", { parent: pl, w: (w - 144) / 4, gap: 10 });
      T(col, "→ " + item[0], { s: 16, c: c.text, w: 500, font: fM, wdt: (w - 144) / 4 - 10 });
      T(col, item[1], { s: 14, c: c.muted, lh: 22, wdt: (w - 144) / 4 - 10 });
    });
    BTN(partner, "Начать", t.accent, t.accentText, t.rBtn);
  }

  function buildRubinTrustGrid(root, t, w, style, name) {
    var c = sc(style, t);
    var trust = F(name || "Безопасность", { parent: root, w: 1440, fills: [solid(c.sec)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 48 });
    T(trust, "Надёжность и прозрачность", { s: 40, c: c.text, lh: 44, align: "CENTER", wdt: 700 });
    T(trust, "RUBIN соединяет понятный интерфейс с прозрачными процессами — безопасно и предсказуемо.", { s: 18, c: c.muted, lh: 28, align: "CENTER", wdt: 640 });
    var trSplit = F("tsplit", { parent: trust, w: w, dir: "HORIZONTAL", gap: 48 });
    [
      ["Способы пополнения", ["Карта", "СБП", "Банк", "P2P", "Счёт юрлица", "Криптокошелёк"]],
      ["Безопасность", ["Резервы", "2FA", "Шифрование", "Аудит", "KYC", "SLA"]],
    ].forEach(function (side, si) {
      var col = F("sc", { parent: trSplit, w: (w - 48) / 2, gap: 24, pt: 32, pr: 32, pb: 32, pl: 32, fills: [solid(c.card2)], r: c.r, stroke: t.line });
      T(col, side[0], { s: 20, c: c.text, w: 500, font: fM });
      var grid = F("grid", { parent: col, w: (w - 48) / 2 - 64, dir: "HORIZONTAL", gap: 10 });
      var g2 = F("g2", { parent: col, w: (w - 48) / 2 - 64, dir: "HORIZONTAL", gap: 10 });
      side[1].forEach(function (logo, li) {
        var lw = ((w - 48) / 2 - 64 - 20) / 3;
        var lc = F("logo", { parent: li < 3 ? grid : g2, w: lw, h: 52, fixH: true, align: "CENTER", cross: "CENTER", fills: [solid(c.card)], r: 12, stroke: t.line });
        lc.resize(lw, 52); lc.primaryAxisSizingMode = "FIXED"; lc.counterAxisSizingMode = "FIXED";
        T(lc, logo, { s: 12, c: c.muted, w: 500 });
      });
    });
  }

  function buildRubinMobile(root, t, w, style, name) {
    var c = sc(style, t);
    var mobile = F(name || "Приложение", { parent: root, w: 1440, fills: [solid(c.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 0 });
    var mobSplit = F("msplit", { parent: mobile, w: w, dir: "HORIZONTAL", gap: 80, cross: "CENTER" });
    var mobCopy = F("mc", { parent: mobSplit, w: w - 400, gap: 20 });
    T(mobCopy, "МОБИЛЬНОЕ ПРИЛОЖЕНИЕ", { s: 12, c: c.muted, w: 500, ls: 1.6 });
    T(mobCopy, "Биржа в кармане", { s: 48, c: c.text, lh: 52, wdt: w - 400 });
    T(mobCopy, "Пополнение, покупка и вывод — с подсказками рядом. Можно начать с малой суммы прямо с телефона.", { s: 18, c: c.muted, lh: 28, wdt: 480 });
    BTN(mobCopy, "Начать", t.accent, t.accentText, t.rBtn);
    PH(mobSplit, 320, 640, "Мокап · iOS · экран покупки", ph(t, 2), 32);
  }

  function buildRubinPricing(root, t, w, style, name) {
    var c = sc(style, t);
    var pricing = F(name || "Тарифы", { parent: root, w: 1440, fills: [solid(c.sec)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 48, align: "CENTER", cross: "CENTER" });
    T(pricing, "Тарифы", { s: 48, c: c.text, lh: 52, align: "CENTER" });
    var prow = F("prow", { parent: pricing, w: w, dir: "HORIZONTAL", gap: 18 });
    RUBIN_PRICING.forEach(function (plan, i) {
      var pw = (w - 36) / 3;
      var card = F("plan", { parent: prow, w: pw, gap: 20, pt: 36, pr: 32, pb: 36, pl: 32, fills: [solid(c.card2)], r: c.r, stroke: t.line, sh: i === 1, shY: 12, shB: 32, shA: 0.08 });
      T(card, plan[0], { s: 20, c: c.text, w: 500, font: fM });
      T(card, plan[1], { s: 36, c: c.text, w: 500, lh: 40 });
      plan[2].forEach(function (feat) {
        T(card, "— " + feat, { s: 14, c: c.muted, lh: 22, wdt: pw - 64 });
      });
      BTN(card, i === 2 ? "Связаться" : "Начать", t.accent, t.accentText, t.rBtn);
    });
  }

  function buildRubinEmailCta(root, t, w, style, name) {
    var c = sc(style, t);
    var cta = F(name || "Призыв", { parent: root, w: 1440, fills: [solid(c.bg)], pt: 80, pb: 80, pl: t.padX, pr: t.padX });
    var ctaCard = F("cta", { parent: cta, w: w, dir: "HORIZONTAL", gap: 40, pt: 56, pr: 56, pb: 56, pl: 56, cross: "CENTER", align: "SPACE_BETWEEN", fills: [solid(c.card)], r: style === "sana" ? 28 : c.r, stroke: t.line });
    var cc = F("cc", { parent: ctaCard, w: 560, gap: 12 });
    T(cc, "Начни сегодня", { s: 44, c: c.text, lh: 48, ls: -1 });
    T(cc, "Спокойный вход. Без пафоса.", { s: 18, c: c.muted, lh: 28 });
    var er = F("er", { parent: ctaCard, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 10, cross: "CENTER" });
    var em = F("em", { parent: er, w: 260, h: 52, fixH: true, align: "MIN", cross: "CENTER", pl: 20, fills: [solid(c.bg)], r: 999, stroke: t.line });
    em.resize(260, 52); em.primaryAxisSizingMode = "FIXED"; em.counterAxisSizingMode = "FIXED";
    T(em, "you@email.com", { s: 15, c: c.muted });
    BTN(er, "Начать", t.accent, t.accentText, t.rBtn);
  }

  function buildRubinFeatureSlider(root, t, w, style, name) {
    var c = sc(style, t);
    var vh = videoH16x9(w);
    var slider = F(name || "Слайдер", { parent: root, w: 1440, fills: [solid(c.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 40, align: "CENTER", cross: "CENTER" });
    T(slider, RUBIN_FEAT_SLIDER[0][0], { s: 48, c: c.text, lh: 52, align: "CENTER", wdt: 800 });
    T(slider, RUBIN_FEAT_SLIDER[0][1], { s: 18, c: c.muted, lh: 28, align: "CENTER", wdt: 640 });
    var viewport = F("viewport", { parent: slider, w: w, h: vh, fixH: true, dir: "NONE", fills: [] });
    viewport.resize(w, vh); viewport.primaryAxisSizingMode = "FIXED"; viewport.counterAxisSizingMode = "FIXED"; viewport.clipsContent = true;
    RUBIN_FEAT_SLIDER.slice(0, 2).forEach(function (f, i) {
      var slide = VID(viewport, w, f[3], ph(t, i), c.r);
      slide.x = i * (w + 18); slide.y = 0;
    });
    var featTabs = F("feat-tabs", { parent: slider, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 8, cross: "CENTER" });
    RUBIN_FEAT_SLIDER.forEach(function (f, i) {
      var pill = F("tab", { parent: featTabs, hugW: true, hugH: true, pt: 10, pr: 16, pb: 10, pl: 16, fills: [solid(i === 0 ? t.text : c.card)], r: 999, stroke: i === 0 ? undefined : t.line });
      T(pill, f[2], { s: 14, c: i === 0 ? t.accentText : c.text, w: 500, font: fM });
    });
    var controls = F("controls", { parent: slider, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 24, cross: "CENTER" });
    var arrows = F("arrows", { parent: controls, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 12, cross: "CENTER" });
    ["←", "→"].forEach(function (a) {
      var ar = F("arr", { parent: arrows, w: 44, h: 44, fixH: true, align: "CENTER", cross: "CENTER", fills: [solid(c.card)], r: 999, stroke: t.line });
      ar.resize(44, 44); ar.primaryAxisSizingMode = "FIXED"; ar.counterAxisSizingMode = "FIXED";
      T(ar, a, { s: 18, c: c.text, w: 500 });
    });
    var dots = F("dots", { parent: controls, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 8, cross: "CENTER" });
    RUBIN_FEAT_SLIDER.forEach(function (_, di) {
      var dot = F("dot", { parent: dots, w: di === 0 ? 24 : 8, h: 8, fixH: true, fills: [solid(di === 0 ? c.text : t.line)], r: 999 });
      dot.resize(di === 0 ? 24 : 8, 8); dot.primaryAxisSizingMode = "FIXED"; dot.counterAxisSizingMode = "FIXED";
    });
  }

  function buildRubinPlatformDual(root, t, w, style, name) {
    var c = sc(style, t);
    var cardGap = 18;
    var cardW = Math.floor((w - cardGap) / 2);
    var cardH = 560;
    var platform = F(name || "Платформа", { parent: root, w: 1440, fills: [solid(c.bg)], pt: 100, pb: t.padY, pl: t.padX, pr: t.padX, gap: 48, align: "CENTER", cross: "CENTER" });
    T(platform, "Биржа для реальной жизни", { s: 48, c: c.text, lh: 52, align: "CENTER", wdt: 800 });
    T(platform, LEAD, { s: 18, c: c.muted, lh: 28, align: "CENTER", wdt: 640 });
    var tabs = F("tabs", { parent: platform, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 8, cross: "CENTER" });
    ["Регистрация", "Пополнение", "Сделка", "Кошелёк", "Люди"].forEach(function (tab, i) {
      var pill = F("tab", { parent: tabs, hugW: true, hugH: true, pt: 10, pr: 16, pb: 10, pl: 16, fills: [solid(i === 0 ? t.text : c.card)], r: 999, stroke: i === 0 ? undefined : t.line });
      T(pill, tab, { s: 14, c: i === 0 ? t.accentText : c.text, w: 500, font: fM });
    });
    var dual = F("dual", { parent: platform, w: w, dir: "HORIZONTAL", gap: cardGap });
    [
      ["Первая сделка", "Человек · спокойный момент · покупка на небольшую сумму", "Экран · покупка"],
      ["Кошелёк рядом", "Баланс и вывод в одном экране · без лишних шагов", "Экран · кошелёк"],
    ].forEach(function (item, i) {
      var card = F("card", { parent: dual, w: cardW, fills: [solid(c.card)], r: c.r, stroke: t.line, sh: true, shY: 16, shB: 48, shA: 0.06 });
      PH(card, cardW, cardH, item[2], ph(t, i), 0);
      var cp = F("cp", { parent: card, w: cardW, gap: 8, pt: 28, pr: 32, pb: 32, pl: 32 });
      T(cp, item[0], { s: 24, c: c.text, w: 500, lh: 30 });
      T(cp, item[1], { s: 15, c: c.muted, lh: 23, wdt: cardW - 64 });
    });
  }

  function buildRubinExtended(root, t, w, style, blocks) {
    var fns = {
      logo: function () { buildLogoStrip(root, t, w); },
      metrics6: function () { buildRubinMetrics6(root, t, w, style); },
      quotes: function () { buildRubinQuotes(root, t, w, style); },
      clarity: function () { buildRubinClaritySplit(root, t, w, style); },
      teams: function () { buildRubinTeams(root, t, w, style); },
      support: function () { buildRubinSupport(root, t, w, style); },
      trustGrid: function () { buildRubinTrustGrid(root, t, w, style); },
      mobile: function () { buildRubinMobile(root, t, w, style); },
      pricing: function () { buildRubinPricing(root, t, w, style); },
      emailCta: function () { buildRubinEmailCta(root, t, w, style); },
      featureSlider: function () { buildRubinFeatureSlider(root, t, w, style); },
      platformDual: function () { buildRubinPlatformDual(root, t, w, style); },
      people: function () { buildPeopleGrid(root, t, w, 2, 2); },
      dual: function () { buildDualVideoRow(root, t, w); },
      steps: function () { buildStepsBlock(root, t, w, style); },
      myths: function () { buildMythsBlock(root, t, w, style); },
      product: function () { buildProductBlock(root, t, w, style); },
      trust: function () { buildTrustBlock(root, t, w, style); },
    };
    blocks.forEach(function (k) { if (fns[k]) fns[k](); });
  }

  function buildMythsStepsTrust(root, t, w, style) { buildMythsBlock(root, t, w, style); buildStepsBlock(root, t, w, style); buildTrustBlock(root, t, w, style); buildProductBlock(root, t, w, style); buildRubinEmailCta(root, t, w, style); }
  function buildMythsStepsCta(root, t, w, style) { buildMythsBlock(root, t, w, style); buildStepsBlock(root, t, w, style); buildRubinEmailCta(root, t, w, style); }
  function buildMythsProductCta(root, t, w, style) { buildMythsBlock(root, t, w, style); buildProductBlock(root, t, w, style); buildRubinEmailCta(root, t, w, style); }
  function buildStepsProductCta(root, t, w, style) { buildStepsBlock(root, t, w, style); buildProductBlock(root, t, w, style); buildRubinEmailCta(root, t, w, style); }

  var builders = {
    basecraft: buildBasecraft, "11x": build11x, kling: buildKling, vidu: buildVidu,
    moonvalley: buildMoonvalley, luma: buildLuma, runway: buildRunway, tavus: buildTavus,
    harvey: buildHarvey, descript: buildDescript, arcads: buildArcads, sana: buildSana, synthesia: buildSynthesia,
  };

  var roots = [];
  refs.forEach(function (t) {
    var root = F(t.title, { w: 1440, fills: [solid(t.bg)], gap: 0 });
    root.x = t.x; root.y = t.y;
    root.layoutMode = "VERTICAL";
    root.primaryAxisSizingMode = "AUTO";
    root.counterAxisSizingMode = "FIXED";
    root.clipsContent = false;
    page.appendChild(root);
    var build = builders[t.layout];
    if (build) build(root, t);
    finalize(root);
    unclip(root);
    roots.push(root);
  });

  var sanaCloneTheme = {
    ref: "sanalabs.com/products/sana",
    bg: hex("FFFFFF"),
    surface: hex("FFFFFF"),
    surface2: hex("F6F5F4"),
    text: hex("0A1217"),
    muted: hex("6A7278"),
    accent: hex("0A1217"),
    accentText: hex("FFFFFF"),
    line: hex("E8E7E5"),
    padX: 104,
    padY: 100,
    rBtn: 999,
    ph: [hex("E4E4E4"), hex("DCDCDC"), hex("ECECEC")],
  };
  var cloneRoot = F("14 · Sana clone (ref)", { w: 1440, fills: [solid(hex("FFFFFF"))], gap: 0 });
  cloneRoot.x = COL * 6;
  cloneRoot.y = ROW_H;
  cloneRoot.layoutMode = "VERTICAL";
  cloneRoot.primaryAxisSizingMode = "AUTO";
  cloneRoot.counterAxisSizingMode = "FIXED";
  cloneRoot.clipsContent = false;
  page.appendChild(cloneRoot);
  buildSanaClone(cloneRoot, sanaCloneTheme, false);
  finalize(cloneRoot);
  unclip(cloneRoot);
  roots.push(cloneRoot);

  var imgCount = { ok: 0, fail: 0, total: 0 };
  try {
    figma.notify("Загружаю изображения Sana…", { timeout: 2000 });
    imgCount = await preloadSanaImages();
  } catch (e) {
    console.warn("Sana preload error", e);
  }
  var imgRoot = F("15 · Sana clone (images)", { w: 1440, fills: [solid(hex("FFFFFF"))], gap: 0 });
  imgRoot.x = 0;
  imgRoot.y = ROW_H * 2;
  imgRoot.layoutMode = "VERTICAL";
  imgRoot.primaryAxisSizingMode = "AUTO";
  imgRoot.counterAxisSizingMode = "FIXED";
  imgRoot.clipsContent = false;
  page.appendChild(imgRoot);
  buildSanaClone(imgRoot, sanaCloneTheme, true);
  finalize(imgRoot);
  unclip(imgRoot);
  roots.push(imgRoot);

  // Label row
  var note = figma.createText();
  note.fontName = fB;
  note.characters = "RUBIN · 13 референсов + Sana clone · " + fontLabel + " · наши блоки + их верстка";
  note.fontSize = 12;
  note.fills = [solid(hex("888888"))];
  note.x = 0;
  note.y = -48;
  page.appendChild(note);

  var refFontSets = await loadAllRefFontSets();
  var refCloneApi = createRefCloneBuilders({ F: F, T: T, BTN: BTN, BTN_SM: BTN_SM, solid: solid, hex: hex, cw: cw, videoH16x9: videoH16x9, cloneMedia: cloneMedia, shadow: shadow, fM: fM, fD: fD, fB: fB, finalize: finalize, unclip: unclip, imageCache: imageCache, fontBox: fontBox, refFontSets: refFontSets });
  var sanaUrls = [];
  Object.keys(SANA_IMG).forEach(function (k) {
    if (Array.isArray(SANA_IMG[k])) sanaUrls = sanaUrls.concat(SANA_IMG[k]);
    else sanaUrls.push(SANA_IMG[k]);
  });
  var refResult = await refCloneApi.generateRefClonePage(buildSanaClone, sanaCloneTheme, sanaUrls);

  var landingPage = figma.createPage();
  landingPage.name = "RUBIN · Landing";
  await figma.setCurrentPageAsync(landingPage);
  var landingTheme = Object.assign({}, sanaCloneTheme, { ref: "" });
  var landingRoot = F("RUBIN · Landing", { w: 1440, fills: [solid(hex("FFFFFF"))], gap: 0 });
  landingRoot.x = 0;
  landingRoot.y = 0;
  landingRoot.layoutMode = "VERTICAL";
  landingRoot.primaryAxisSizingMode = "AUTO";
  landingRoot.counterAxisSizingMode = "FIXED";
  landingRoot.clipsContent = false;
  landingPage.appendChild(landingRoot);
  buildRubinLanding(landingRoot, landingTheme, false);
  finalize(landingRoot);
  unclip(landingRoot);

  var landingNote = figma.createText();
  landingNote.fontName = fB;
  landingNote.characters = "RUBIN · Landing · QI сначала · новички в конце";
  landingNote.fontSize = 12;
  landingNote.fills = [solid(hex("888888"))];
  landingNote.x = 0;
  landingNote.y = -48;
  landingPage.appendChild(landingNote);

  figma.currentPage.selection = [landingRoot];
  figma.viewport.scrollAndZoomIntoView([landingRoot]);
  figma.notify("RUBIN · Landing + 13 ref clones · imgs " + refResult.imgCount.ok + "/" + refResult.imgCount.total);
  figma.closePlugin();
})().catch(function (err) {
  figma.notify("Ошибка: " + String(err), { error: true });
  console.error(err);
});

function createRefCloneBuilders(ctx) {
  var F = ctx.F, T = ctx.T, BTN = ctx.BTN, BTN_SM = ctx.BTN_SM, solid = ctx.solid, hex = ctx.hex;
  var cw = ctx.cw, videoH16x9 = ctx.videoH16x9, cloneMedia = ctx.cloneMedia, shadow = ctx.shadow;
  var fM = ctx.fM, fD = ctx.fD, fB = ctx.fB, finalize = ctx.finalize, unclip = ctx.unclip, imageCache = ctx.imageCache;
  var fontBox = ctx.fontBox, refFontSets = ctx.refFontSets;

  function proxyUrl(url, w, fmt) {
    fmt = fmt || "jpg";
    if (!url) return null;
    if (url.indexOf("wsrv.nl") !== -1) return url;
    var src = url.replace(/^https?:\/\//, "");
    return "https://wsrv.nl/?url=" + encodeURIComponent(src) + "&output=" + fmt + (fmt === "jpg" ? "&q=85" : "") + (w ? ("&w=" + w) : "");
  }

  function pJpg(url, w) { return proxyUrl(url, w, "jpg"); }

  var REF_IMG = {
    basecraft: {
      hero: pJpg("https://basecraft.ru/landing/hero-poster.jpg", 1600),
      platform: pJpg("https://basecraft.ru/landing/platform-showcase/background.webp", 1400),
      tab: pJpg("https://basecraft.ru/landing/platform-showcase/tab-brand-dna-hq.webp", 900),
      gallery: [
        pJpg("https://basecraft.ru/landing/gallery-1.webp", 600),
        pJpg("https://basecraft.ru/landing/features/production-images-demo.webp", 600),
        pJpg("https://basecraft.ru/landing/features/production-video-poster.webp", 600),
      ],
    },
    "11x": {
      hero: pJpg("https://cdn.prod.website-files.com/66fe5a1a88c73ef8f270d312/67312606ff40e81cde3f1b32_11x%20OG.jpg", 1600),
      alice: pJpg("https://cdn.prod.website-files.com/66fe5a1a88c73ef8f270d312/69b9ceafb9304b2ef784fa75_alice.webp", 600),
      julian: pJpg("https://cdn.prod.website-files.com/66fe5a1a88c73ef8f270d312/69b9ce9a604bff621847ab48_Julian.webp", 600),
      founder: pJpg("https://cdn.prod.website-files.com/66fe9fa77365b6a7b3cd0fbe/6a5771f831053d4c30d26d04_Founder.png", 800),
    },
    kling: {
      hero: pJpg("https://s16-kling.klingai.com/kos/s101/nlav112918/kling-homepage-aio/assets/images/page1-poster-0-en-__scq5Xs.jpg", 1600),
      cover: pJpg("https://s16-kling.klingai.com/kos/s101/nlav112918/kling-homepage-aio/assets/images/page1-v3-cover-1-DqNSFhji.jpeg", 900),
      mac: pJpg("https://s16-kling.klingai.com/kos/s101/nlav112918/kling-homepage-aio/assets/images/mac-C8Y_Wdfl.png", 1000),
    },
    vidu: {
      hero: pJpg("https://image01.cf.vidu.studio/vidu/media-asset/herovideos1-b1cbe149.webp", 1400),
      grid: [
        pJpg("https://image01.cf.vidu.studio/vidu/media-asset/herovideos2-694ad93a.webp", 600),
        pJpg("https://image01.cf.vidu.studio/vidu/media-asset/hero_claw-01ef6461.webp", 600),
        pJpg("https://image01.cf.vidu.studio/vidu/media-asset/dragon-732eda77.webp", 600),
        pJpg("https://image01.cf.vidu.studio/vidu/media-asset/football-52181e57.webp", 600),
      ],
    },
    moonvalley: {
      hero: pJpg("https://framerusercontent.com/images/Ig37EUbAl2HFWWFfsy9PM6MVk.png", 1600),
      cards: [
        pJpg("https://framerusercontent.com/images/Ig37EUbAl2HFWWFfsy9PM6MVk.png", 700),
        pJpg("https://framerusercontent.com/images/Ig37EUbAl2HFWWFfsy9PM6MVk.png", 700),
      ],
    },
    luma: {
      hero: pJpg("https://cdn.sanity.io/images/2ylxvaa2/production/0bfd4636b5e513ee7950e36e123f32bb8b25f924-2328x960.png", 1600),
      cards: [
        pJpg("https://cdn.sanity.io/images/2ylxvaa2/production/099e66ae6ba403cb556111d6a1aadf6a8f4cb79b-1920x1080.png", 900),
        pJpg("https://cdn.sanity.io/images/2ylxvaa2/production/97f67e5a2d71508ea393b791c2dce49693c30c3d-2688x1536.png", 900),
      ],
    },
    runway: {
      hero: pJpg("https://d3phaj0sisr2ct.cloudfront.net/site/assets/homepage-og-card-v3.webp", 1600),
      cards: [
        pJpg("https://d3phaj0sisr2ct.cloudfront.net/site/assets/lionsgate_a.webp", 700),
        pJpg("https://d3phaj0sisr2ct.cloudfront.net/site/assets/v2_rw-uk-1.webp", 700),
        pJpg("https://d3phaj0sisr2ct.cloudfront.net/site/assets/unveil-salomon-cover.webp", 700),
      ],
    },
    tavus: {
      hero: pJpg("https://cdn.prod.website-files.com/68c8e57d6e512b9573db146f/68ee0de82eeac37be67f824a_Hero-v2.avif", 1600),
      cta: pJpg("https://cdn.prod.website-files.com/68c8e57d6e512b9573db146f/68c8e57e6e512b9573db1a50_hero-cta-bg.webp", 1200),
      cards: [
        pJpg("https://cdn.prod.website-files.com/68c8e57d6e512b9573db146f/6a3a707756f891fb38c32133_cvi-eq-5.avif", 600),
        pJpg("https://cdn.prod.website-files.com/68c8e57d6e512b9573db146f/68f0e0628f97ea257bd5dd30_art.avif", 600),
      ],
    },
    harvey: {
      hero: pJpg("https://www.harvey.ai/videos/impact-hero-poster.webp", 1600),
      cards: [
        pJpg("https://cdn.sanity.io/images/07s0r5r6/production/9a4b2e0eec438fb56057db128a11ade2c04c01cf-2400x1260.png", 900),
        pJpg("https://cdn.sanity.io/images/07s0r5r6/production/d3dcef152521107b64a52cf8dcd6dbe2e8481d92-2400x1260.png", 900),
      ],
    },
    descript: {
      hero: pJpg("https://static-cdn.descript.com/descript-website/images/home-hero-transparent-poster.webp", 1600),
      cards: [
        pJpg("https://cdn.builder.io/api/v1/image/assets%2Ffcea5005d671451e9b07839c893228d0%2Fb1cf2c175fbe4a028dff4622ee1ce727", 800),
        pJpg("https://static-cdn.descript.com/descript-website/images/nav-bg-texture-1.jpg", 800),
      ],
    },
    arcads: {
      hero: pJpg("https://cdn.prod.website-files.com/685001cf708232477ed43d3f/68da563ea5e493b26164233f_89390cabe8513c0347edea93f13c221e_videoframe_0.webp", 1600),
      actors: [
        pJpg("https://cdn.prod.website-files.com/685001cf708232477ed43d3f/6851eaba37917ae43ec0d600_ChatGPT%20Image%20Apr%202%202025%20UCG%20Actor%20Portrait%20(2)%201.avif", 500),
        pJpg("https://cdn.prod.website-files.com/685001cf708232477ed43d3f/6851eaba1ac78cd8efc7ad67_Portrait%20UCG%20Apr%202%202025%201.avif", 500),
        pJpg("https://cdn.prod.website-files.com/685001cf708232477ed43d3f/68c7dcfda9eb08d6b048a16e_videoframe_0%20(1).webp", 500),
        pJpg("https://cdn.prod.website-files.com/685001cf708232477ed43d3f/68c7dcfd117bb751fd375e56_videoframe_0%20(2).webp", 500),
      ],
    },
    synthesia: {
      hero: pJpg("https://cdn.prod.website-files.com/65e89895c5a4b8d764c0d710/68930e72909a061b976b95c3_home-create-poster.webp", 1600),
      cards: [
        pJpg("https://cdn.prod.website-files.com/65e89895c5a4b8d764c0d710/68089aad33745cf5ea4cf572_edit.webp", 600),
        pJpg("https://cdn.prod.website-files.com/65e89895c5a4b8d764c0d710/68089aad43b7b2ee4bf64885_collaborate.webp", 600),
        pJpg("https://cdn.prod.website-files.com/65e89895c5a4b8d764c0d710/68089aac108a8b3ab2cbac9e_translate.webp", 600),
      ],
    },
  };

  function collectRefImgUrls() {
    var urls = [];
    function walk(obj) {
      Object.keys(obj).forEach(function (k) {
        if (typeof obj[k] === "string") urls.push(obj[k]);
        else if (Array.isArray(obj[k])) obj[k].forEach(function (u) { if (u) urls.push(u); });
        else if (obj[k] && typeof obj[k] === "object") walk(obj[k]);
      });
    }
    walk(REF_IMG);
    return urls.filter(function (u, i, a) { return u && a.indexOf(u) === i; });
  }

  async function preloadRefImages(extraUrls) {
    var urls = collectRefImgUrls().concat(extraUrls || []);
    urls = urls.filter(function (u, i, a) { return u && a.indexOf(u) === i; });
    var ok = 0, fail = 0;
    for (var i = 0; i < urls.length; i++) {
      if (imageCache[urls[i]]) { ok++; continue; }
      try {
        imageCache[urls[i]] = await figma.createImageAsync(urls[i]);
        ok++;
      } catch (e) {
        fail++;
        console.warn("Ref image failed:", urls[i], e);
      }
    }
    return { ok: ok, fail: fail, total: urls.length };
  }

  function NAV_REF(root, t, brand, links, cta) {
    var nav = F("00 Nav", { parent: root, w: 1440, h: t.navH || 48, fixH: true, dir: "HORIZONTAL", align: "SPACE_BETWEEN", cross: "CENTER", pl: t.padX, pr: t.padX, fills: [solid(t.navBg || t.bg)] });
    nav.resize(1440, t.navH || 48);
    nav.primaryAxisSizingMode = "FIXED";
    nav.counterAxisSizingMode = "FIXED";
    T(nav, brand, { s: 14, c: t.navText || t.text, w: 500, ls: 1.2, font: fM });
    var mid = F("mid", { parent: nav, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 20, cross: "CENTER" });
    (links || []).forEach(function (l) { T(mid, l, { s: 14, c: t.navMuted || t.muted }); });
    var acts = F("acts", { parent: nav, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 16, cross: "CENTER" });
    if (cta) BTN_SM(acts, cta, t.accent, t.accentText, t.rBtn);
    return nav;
  }

  function FOOT_REF(root, t, brand) {
    var foot = F("Footer", { parent: root, w: 1440, fills: [solid(t.footBg || t.bg)], pt: 64, pb: 40, pl: t.padX, pr: t.padX, gap: 24 });
    T(foot, "© 2026 " + brand + " · Reference clone for layout study", { s: 13, c: t.muted });
    T(foot, t.ref || "", { s: 12, c: t.muted });
    if (refFontSets && t.refKey && refFontSets[t.refKey]) {
      T(foot, "Font: " + refFontSets[t.refKey].resolved, { s: 11, c: t.muted });
    }
  }

  function heroFullBleed(root, t, img, copy) {
    var vh = copy.vh || 900;
    NAV_REF(root, t, copy.brand, copy.nav, copy.cta);
    var hero = F("01 Hero", { parent: root, w: 1440, h: vh, fixH: true, dir: "NONE", fills: [solid(t.bg)] });
    hero.resize(1440, vh);
    hero.primaryAxisSizingMode = "FIXED";
    hero.counterAxisSizingMode = "FIXED";
    var bg = cloneMedia(hero, 1440, vh, 0, img, true);
    bg.x = 0; bg.y = 0;
    if (copy.scrim !== false) {
      var scrim = figma.createRectangle();
      scrim.resize(copy.scrimW || 760, vh);
      scrim.x = 0; scrim.y = 0;
      scrim.fills = [solid(copy.scrimColor || t.bg, copy.scrimA != null ? copy.scrimA : 0.75)];
      hero.appendChild(scrim);
    }
    var tc = copy.textColor || t.text;
    var lc = copy.leadColor || t.muted;
    T(hero, copy.h1, { s: copy.h1s || 56, c: tc, lh: (copy.h1s || 56) + 4, ls: copy.ls || -1.5, wdt: copy.h1w || 560 }).x = t.padX;
    hero.children[hero.children.length - 1].y = copy.h1y != null ? copy.h1y : 200;
    if (copy.lead) {
      T(hero, copy.lead, { s: copy.leadS || 18, c: lc, lh: 28, wdt: copy.leadw || 480 }).x = t.padX;
      hero.children[hero.children.length - 1].y = copy.leady != null ? copy.leady : 320;
    }
    if (copy.cta) {
      BTN(hero, copy.cta, copy.btnBg || t.accent, copy.btnText || t.accentText, t.rBtn).x = t.padX;
      hero.children[hero.children.length - 1].y = copy.ctaY != null ? copy.ctaY : 420;
    }
    if (copy.cards) {
      copy.cards.forEach(function (wk, wi) {
        var card = F("card", { parent: hero, w: 280, h: 380, fixH: true, gap: 12, pt: 16, pr: 16, pb: 20, pl: 16, fills: [solid(t.cardBg || t.bg)], r: 12, stroke: t.line, sh: true, shY: 16, shB: 40, shA: 0.1 });
        card.resize(280, 380);
        card.primaryAxisSizingMode = "FIXED";
        card.counterAxisSizingMode = "FIXED";
        card.x = 1440 - t.padX - 580 + wi * 300;
        card.y = (copy.cardsY != null ? copy.cardsY : 140) + wi * 36;
        cloneMedia(card, 248, 240, 8, wk.img, true);
        T(card, wk.title, { s: 20, c: tc, w: 500 });
        T(card, wk.sub, { s: 14, c: lc });
      });
    }
    return { w: cw(t), hero: hero, vh: vh };
  }

  function heroCenter(root, t, img, copy) {
    var w = cw(t);
    NAV_REF(root, t, copy.brand, copy.nav, copy.cta);
    var hero = F("01 Hero", { parent: root, w: 1440, fills: [solid(t.bg)], pt: copy.pt || 80, pb: copy.pb || 64, pl: t.padX, pr: t.padX, gap: copy.gap || 32, align: "CENTER", cross: "CENTER" });
    if (copy.eyebrow) T(hero, copy.eyebrow, { s: 12, c: t.muted, w: 500, ls: 1.6, align: "CENTER", font: fM });
    T(hero, copy.h1, { s: copy.h1s || 72, c: t.text, lh: (copy.h1s || 72) + 4, ls: copy.ls || -2, wdt: copy.h1w || 900, align: "CENTER" });
    if (copy.lead) T(hero, copy.lead, { s: copy.leadS || 20, c: t.muted, lh: 30, wdt: copy.leadw || 640, align: "CENTER" });
    if (copy.cta) BTN(hero, copy.cta, t.accent, t.accentText, t.rBtn);
    var mh = copy.mediaH || videoH16x9(w);
    var media = cloneMedia(hero, w, mh, copy.mediaR != null ? copy.mediaR : 20, img, true);
    if (copy.sh) shadow(media, 20, 48, 0.12);
    return { w: w, hero: hero };
  }

  function sectionHeading(parent, t, title, lead, center) {
    T(parent, title, { s: 40, c: t.text, lh: 44, wdt: center ? 800 : 700, align: center ? "CENTER" : "LEFT" });
    if (lead) T(parent, lead, { s: 18, c: t.muted, lh: 28, wdt: center ? 640 : 560, align: center ? "CENTER" : "LEFT" });
  }

  function gridCards(parent, t, w, items, cols, imgH, r) {
    cols = cols || 3;
    imgH = imgH || 220;
    r = r == null ? 16 : r;
    var gap = 16;
    var rows = Math.ceil(items.length / cols);
    for (var ri = 0; ri < rows; ri++) {
      var row = F("row" + ri, { parent: parent, w: w, dir: "HORIZONTAL", gap: gap });
      for (var ci = 0; ci < cols; ci++) {
        var idx = ri * cols + ci;
        if (idx >= items.length) break;
        var item = items[idx];
        var cw2 = (w - gap * (cols - 1)) / cols;
        var card = F("card", { parent: row, w: cw2, gap: 12, fills: [solid(t.cardBg || t.surface2 || t.bg)], r: r, stroke: t.line });
        if (item.img) cloneMedia(card, cw2, imgH, r, item.img, true);
        var cp = F("cp", { parent: card, w: cw2, gap: 8, pt: 20, pr: 20, pb: 24, pl: 20 });
        if (item.title) T(cp, item.title, { s: item.ts || 20, c: t.text, w: 500, lh: 26, wdt: cw2 - 40 });
        if (item.sub) T(cp, item.sub, { s: 15, c: t.muted, lh: 22, wdt: cw2 - 40 });
      }
    }
  }

  function metricsRow(parent, t, w, metrics) {
    var mrow = F("metrics", { parent: parent, w: w, dir: "HORIZONTAL", gap: 12 });
    var n = metrics.length;
    metrics.forEach(function (m) {
      var mw = (w - (n - 1) * 12) / n;
      var c = F("m", { parent: mrow, w: mw, gap: 8, pt: 24, pr: 16, pb: 24, pl: 16, fills: [solid(t.surface2 || t.surface || t.bg)], r: 16, stroke: t.line });
      if (m[0]) T(c, m[0], { s: 13, c: t.muted, w: 500, ls: 0.5 });
      T(c, m[1], { s: 32, c: t.text, w: 500, lh: 36 });
      T(c, m[2], { s: 14, c: t.muted, lh: 20, wdt: mw - 32 });
    });
  }

  function addSec(root, name, t, opts) {
    opts = opts || {};
    return F(name, {
      parent: root, w: 1440,
      fills: [solid(opts.bg || (opts.alt ? (t.surface2 || t.surface || t.bg) : t.bg))],
      pt: opts.py != null ? opts.py : t.padY, pb: opts.py != null ? opts.py : t.padY,
      pl: t.padX, pr: t.padX, gap: opts.gap || 32,
      align: opts.center ? "CENTER" : "MIN", cross: opts.center ? "CENTER" : "MIN",
    });
  }

  function pillTabs(parent, t, labels) {
    var row = F("pills", { parent: parent, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 8, cross: "CENTER" });
    labels.forEach(function (tab, i) {
      var pill = F("tab", { parent: row, hugW: true, hugH: true, pt: 10, pr: 16, pb: 10, pl: 16, fills: [solid(i === 0 ? t.text : (t.surface2 || t.bg))], r: 999, stroke: i === 0 ? undefined : t.line });
      T(pill, tab, { s: 14, c: i === 0 ? t.accentText : t.text, w: 500, font: fM });
    });
    return row;
  }

  function splitBlock(parent, t, w, copy, img, flip) {
    var sp = F("split", { parent: parent, w: w, dir: "HORIZONTAL", gap: 48, cross: "CENTER" });
    var half = (w - 48) / 2;
    var mkCopy = function () {
      var c = F("copy", { parent: sp, w: half, gap: 16 });
      if (copy.eyebrow) T(c, copy.eyebrow, { s: 12, c: t.muted, w: 500, ls: 1.4 });
      T(c, copy.title, { s: copy.ts || 36, c: t.text, lh: (copy.ts || 36) + 4, wdt: half - 10 });
      if (copy.lead) T(c, copy.lead, { s: 16, c: t.muted, lh: 26, wdt: half - 10 });
      if (copy.cta) BTN(c, copy.cta, t.accent, t.accentText, t.rBtn);
      return c;
    };
    var mkMedia = function () {
      return cloneMedia(sp, half, copy.imgH || videoH16x9(half), copy.r != null ? copy.r : 16, img, true);
    };
    if (flip) { mkMedia(); mkCopy(); } else { mkCopy(); mkMedia(); }
  }

  function logoStrip(parent, t, w, labels) {
    var row = F("logos", { parent: parent, w: w, dir: "HORIZONTAL", gap: 32, align: "SPACE_BETWEEN", cross: "CENTER" });
    labels.forEach(function (lbl) {
      T(row, lbl, { s: 13, c: t.muted, w: 500, ls: 0.5, align: "CENTER" });
    });
  }

  function quoteCards(parent, t, w, quotes) {
    var qr = F("qr", { parent: parent, w: w, dir: "HORIZONTAL", gap: 18 });
    var qw = (w - 18 * (quotes.length - 1)) / quotes.length;
    quotes.forEach(function (q) {
      var c = F("q", { parent: qr, w: qw, gap: 16, pt: 32, pr: 32, pb: 32, pl: 32, fills: [solid(t.surface2 || t.bg)], r: 16, stroke: t.line });
      T(c, q[0], { s: 18, c: t.text, lh: 28, wdt: qw - 64 });
      T(c, q[1], { s: 14, c: t.muted, w: 500, font: fM });
      if (q[2]) T(c, q[2], { s: 13, c: t.muted, wdt: qw - 64 });
    });
  }

  function faqBlock(parent, t, w, items) {
    items.forEach(function (item, i) {
      var row = F("faq", { parent: parent, w: w, gap: 8, pt: 22, pb: 22 });
      if (i === 0 || i === items.length - 1) {
        row.strokes = [solid(t.line)];
        row.strokeTopWeight = i === 0 ? 1 : 0;
        row.strokeBottomWeight = 1;
        row.strokeLeftWeight = 0;
        row.strokeRightWeight = 0;
      } else {
        row.strokes = [solid(t.line)];
        row.strokeBottomWeight = 1;
        row.strokeTopWeight = 0;
        row.strokeLeftWeight = 0;
        row.strokeRightWeight = 0;
      }
      T(row, item[0], { s: 18, c: t.text, w: 500, lh: 24, wdt: w - 20 });
      if (item[1]) T(row, item[1], { s: 15, c: t.muted, lh: 22, wdt: w - 20 });
    });
  }

  function pricingCards(parent, t, w, plans) {
    var prow = F("prow", { parent: parent, w: w, dir: "HORIZONTAL", gap: 18 });
    plans.forEach(function (plan, i) {
      var pw = (w - 18 * (plans.length - 1)) / plans.length;
      var c = F("plan", { parent: prow, w: pw, gap: 16, pt: 32, pr: 28, pb: 32, pl: 28, fills: [solid(t.bg)], r: 20, stroke: t.line, sh: i === 1, shY: 12, shB: 32, shA: 0.08 });
      T(c, plan[0], { s: 18, c: t.text, w: 500, font: fM });
      T(c, plan[1], { s: 32, c: t.text, w: 500, lh: 36 });
      (plan[2] || []).forEach(function (feat) {
        T(c, "— " + feat, { s: 14, c: t.muted, lh: 22, wdt: pw - 56 });
      });
      BTN(c, plan[3] || "Get started", t.accent, t.accentText, t.rBtn);
    });
  }

  function ctaBlock(parent, t, w, title, lead, btn) {
    var card = F("cta", { parent: parent, w: w, gap: 20, pt: 56, pr: 56, pb: 56, pl: 56, fills: [solid(t.surface2 || t.surface || t.bg)], r: 24, stroke: t.line, align: "CENTER", cross: "CENTER" });
    T(card, title, { s: 40, c: t.text, lh: 44, align: "CENTER", wdt: 680 });
    if (lead) T(card, lead, { s: 18, c: t.muted, lh: 28, align: "CENTER", wdt: 560 });
    BTN(card, btn, t.accent, t.accentText, t.rBtn);
  }

  function stepsList(parent, t, w, steps) {
    steps.forEach(function (s, i) {
      var row = F("step", { parent: parent, w: w, dir: "HORIZONTAL", gap: 24, pt: 28, pb: 28, cross: "CENTER" });
      row.strokes = [solid(t.line)]; row.strokeTopWeight = 1; row.strokeBottomWeight = 0; row.strokeLeftWeight = 0; row.strokeRightWeight = 0;
      T(row, s[0], { s: 14, c: t.muted, w: 500, ls: 1, wdt: 48 });
      var sc = F("sc", { parent: row, w: w - 200, gap: 8 });
      T(sc, s[1], { s: 24, c: t.text, w: 500, lh: 30 });
      if (s[2]) T(sc, s[2], { s: 15, c: t.muted, lh: 22, wdt: w - 220 });
      if (s[3]) cloneMedia(row, 120, 80, 8, s[3], true);
    });
  }

  function buildBasecraftRef(root, t) {
    var w = cw(t);
    var imgs = REF_IMG.basecraft;
    heroFullBleed(root, t, imgs.hero, {
      brand: "Basecraft", nav: ["Платформа", "Brand DNA", "Flow", "Команды", "Тарифы"], cta: "Начать",
      h1: "Креатив\nпод контролем", h1s: 56, h1y: 180, lead: "Единый workspace для AI-продакшна: от Brand DNA до финального рендера.", leady: 300, ctaY: 400,
      scrimColor: hex("FFFFFF"), scrimA: 0.78, textColor: hex("101010"), leadColor: hex("444444"),
    });
    var stats = F("02 Stats", { parent: root, w: 1440, fills: [solid(t.surface)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    sectionHeading(stats, t, "80–120 креативов в месяц", "20+ AI-моделей в одном workspace.");
    metricsRow(stats, t, w, [["", "80–120", "креативов"], ["", "20+", "AI-моделей"], ["", "1", "workspace"]]);
    var tabs = F("03 Workflow", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    sectionHeading(tabs, t, "Один workflow. Разные задачи.");
    var pillRow = F("pills", { parent: tabs, dir: "HORIZONTAL", hugW: true, hugH: true, gap: 8, cross: "CENTER" });
    ["Кампании", "Каталоги", "Контент", "Видео", "Brand DNA"].forEach(function (tab, i) {
      var pill = F("tab", { parent: pillRow, hugW: true, hugH: true, pt: 10, pr: 16, pb: 10, pl: 16, fills: [solid(i === 0 ? t.text : t.surface2)], r: 999, stroke: i === 0 ? undefined : t.line });
      T(pill, tab, { s: 14, c: i === 0 ? t.accentText : t.text, w: 500, font: fM });
    });
    cloneMedia(tabs, w, videoH16x9(w), 16, imgs.platform, true);
    var gal = F("04 Gallery", { parent: root, w: 1440, fills: [solid(t.surface)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 24 });
    sectionHeading(gal, t, "Что мы можем создать вместе?");
    gridCards(gal, t, w, [
      { img: imgs.gallery[0], title: "Кампания", sub: "Brand-safe креативы" },
      { img: imgs.gallery[1], title: "Изображения", sub: "Production-ready" },
      { img: imgs.gallery[2], title: "Видео", sub: "AI video pipeline" },
    ], 3, 240, 16);
    var g2 = addSec(root, "05 Gallery row 2", t, { alt: true });
    gridCards(g2, t, w, [
      { img: imgs.gallery[0], title: "Lifestyle", sub: "Каталожная съёмка" },
      { img: imgs.gallery[1], title: "Мобильный доступ", sub: "Креативы под все форматы" },
      { img: imgs.gallery[2], title: "Команда", sub: "Совместная работа" },
    ], 3, 240, 16);
    var brand = addSec(root, "06 Brand DNA", t, {});
    splitBlock(brand, t, w, { eyebrow: "BRAND DNA", title: "Превратите бренд-гайд\nв рабочую систему", lead: "Brand DNA превращает ваш гайдлайн в правила для каждой генерации.", cta: "Узнать больше", imgH: 360, r: 16 }, imgs.tab, false);
    var prod = addSec(root, "07 Production", t, { alt: true });
    sectionHeading(prod, t, "Инструменты продакшна");
    gridCards(prod, t, w, [
      { img: imgs.gallery[1], title: "Изображения", sub: "Production-ready stills" },
      { img: imgs.gallery[2], title: "Видео", sub: "AI video pipeline" },
    ], 2, 280, 16);
    var before = addSec(root, "08 Before/After", t, {});
    sectionHeading(before, t, "Меньше ручной работы", "До и после — один workflow вместо десяти инструментов.");
    var ba = F("ba", { parent: before, w: w, dir: "HORIZONTAL", gap: 24 });
    cloneMedia(ba, (w - 24) / 2, 320, 16, imgs.platform, true);
    cloneMedia(ba, (w - 24) / 2, 320, 16, imgs.hero, true);
    var security = addSec(root, "09 Security", t, { alt: true });
    splitBlock(security, t, w, { title: "Безопасность и приватность", lead: "Enterprise-grade контроль доступа, приватные модели и аудит.", ts: 32 }, imgs.tab, true);
    var teams = addSec(root, "10 Teams", t, {});
    sectionHeading(teams, t, "Решения для команд", "Маркетинг · E-commerce · Агентства · In-house");
    metricsRow(teams, t, w, [["Marketing", "10×", "быстрее продакшн"], ["E-com", "80+", "креативов/мес"], ["Agency", "1", "workspace"]]);
    var pricing = addSec(root, "11 Pricing", t, { alt: true, center: true });
    sectionHeading(pricing, t, "Тарифы", null, true);
    pricingCards(pricing, t, w, [
      ["Starter", "Бесплатно", ["5 проектов", "Базовые модели", "Community support"], "Начать"],
      ["Pro", "от ₽9 900", ["Unlimited projects", "Brand DNA", "Priority support"], "Выбрать Pro"],
      ["Enterprise", "Custom", ["SSO", "Dedicated support", "Custom models"], "Связаться"],
    ]);
    var faq = addSec(root, "12 FAQ", t, {});
    sectionHeading(faq, t, "FAQ");
    faqBlock(faq, t, w, [
      ["Какие AI-модели поддерживаются?", "20+ моделей включая SeeDance, GPT, Grok и другие."],
      ["Можно ли использовать свой Brand DNA?", "Да — загрузите гайдлайн и все генерации будут on-brand."],
      ["Есть ли API?", "Enterprise-план включает API-доступ."],
    ]);
    ctaBlock(addSec(root, "13 CTA", t, { alt: true, center: true }), t, w, "Готовы взять креатив\nпод контроль?", "Начните бесплатно сегодня.", "Начать");
    FOOT_REF(root, t, "Basecraft");
  }

  function build11xRef(root, t) {
    var w = cw(t);
    var imgs = REF_IMG["11x"];
    heroFullBleed(root, t, imgs.hero, {
      brand: "11x", nav: ["Product", "Customers", "Company"], cta: "Book a demo",
      h1: "The AI\nGrowth Company", h1s: 112, h1y: 280, ls: -3,
      lead: "Digital workers that identify, research, personalize, and engage — at scale.", leady: 480, ctaY: 580,
      scrimA: 0.82, cards: [
        { img: imgs.alice, title: "Alice", sub: "AI SDR" },
        { img: imgs.julian, title: "Julian", sub: "AI Phone Agent" },
      ], cardsY: 120,
    });
    var workers = F("02 Workers", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 40 });
    sectionHeading(workers, t, "Meet our digital workers", "Alice and Julian transform your workforce.");
    var wr = F("wr", { parent: workers, w: w, dir: "HORIZONTAL", gap: 24 });
    [
      { img: imgs.alice, title: "Alice", sub: "Your AI SDR — identifies and engages leads 24/7." },
      { img: imgs.julian, title: "Julian", sub: "Your AI phone agent — natural conversations at scale." },
    ].forEach(function (wk) {
      var cw2 = (w - 24) / 2;
      var card = F("w", { parent: wr, w: cw2, gap: 16, fills: [solid(t.surface2)], r: 16, stroke: t.line });
      cloneMedia(card, cw2, 360, 16, wk.img, true);
      var cp = F("cp", { parent: card, w: cw2, gap: 8, pt: 24, pr: 28, pb: 28, pl: 28 });
      T(cp, wk.title, { s: 28, c: t.text, w: 500, lh: 32 });
      T(cp, wk.sub, { s: 16, c: t.muted, lh: 24, wdt: cw2 - 56 });
    });
    cloneMedia(workers, w, videoH16x9(w), 16, imgs.founder, true);
    var amplify = addSec(root, "03 Amplify", t, { alt: true });
    sectionHeading(amplify, t, "Amplify Intelligence,\nAccelerate Growth", null, true);
    pillTabs(amplify, t, ["Identify", "Research", "Personalize", "Engage"]);
    cloneMedia(amplify, w, videoH16x9(w), 16, imgs.founder, true);
    var pipeline = addSec(root, "04 Pipeline", t, {});
    sectionHeading(pipeline, t, "Pipeline from leads\nyou'd written off");
    metricsRow(pipeline, t, w, [["3×", "3×", "more meetings booked"], ["40%", "40%", "faster response time"], ["24/7", "24/7", "always-on outreach"]]);
    var stories = addSec(root, "05 Stories", t, { alt: true });
    sectionHeading(stories, t, "Customer stories", "How leading companies use Alice and Julian.");
    quoteCards(stories, t, w, [
      ["\"Alice booked 3× more meetings in the first month.\"", "VP Sales", "Series B SaaS"],
      ["\"Julian sounds so natural, prospects don't know it's AI.\"", "Head of Growth", "Fintech"],
    ]);
    cloneMedia(stories, w, 280, 16, imgs.hero, true);
    var logos = addSec(root, "06 Logos", t, {});
    logoStrip(logos, t, w, ["Deel", "Salesforce", "Gong", "Ramp", "Brex", "Notion"]);
    ctaBlock(addSec(root, "07 CTA", t, { alt: true, center: true }), t, w, "Ready to hire\nyour digital workers?", "Book a demo with our team.", "Book a demo");
    FOOT_REF(root, t, "11x");
  }

  function buildKlingRef(root, t) {
    var w = cw(t);
    var imgs = REF_IMG.kling;
    var vh = 960;
    NAV_REF(root, t, "Kling AI", ["Creative Studio", "Tools", "Resources", "API"], "Sign in");
    var hero = F("01 Hero", { parent: root, w: 1440, h: vh, fixH: true, dir: "NONE", fills: [solid(t.bg)] });
    hero.resize(1440, vh);
    hero.primaryAxisSizingMode = "FIXED";
    hero.counterAxisSizingMode = "FIXED";
    var bg = cloneMedia(hero, 1440, vh, 0, imgs.hero, true);
    bg.x = 0; bg.y = 0;
    T(hero, "Kling AI Video\nand Image Generator", { s: 64, c: hex("FFFFFF"), lh: 68, ls: -2, wdt: 700 }).x = t.padX;
    hero.children[hero.children.length - 1].y = Math.round(vh * 0.35);
    BTN(hero, "Try Kling", t.accent, t.accentText, t.rBtn).x = t.padX;
    hero.children[hero.children.length - 1].y = Math.round(vh * 0.55);
    var tools = F("02 AI Tools", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    sectionHeading(tools, t, "AI Tools", null, true);
    gridCards(tools, t, w, [
      { img: imgs.cover, title: "Omni", sub: "All-in-one generation" },
      { img: imgs.mac, title: "Video", sub: "Text & image to video" },
      { img: imgs.cover, title: "Image", sub: "High-quality stills" },
    ], 3, 260, 20);
    var more = addSec(root, "03 More tools", t, { alt: true });
    gridCards(more, t, w, [
      { img: imgs.mac, title: "Sound", sub: "AI audio generation" },
      { img: imgs.cover, title: "Effects", sub: "Video effects & transitions" },
      { img: imgs.hero, title: "Extend", sub: "Extend video duration" },
    ], 3, 240, 20);
    var resources = addSec(root, "04 Resources", t, {});
    sectionHeading(resources, t, "Resources", "Tutorials · API docs · Community · Blog", true);
    splitBlock(resources, t, w, { title: "Kling API", lead: "Integrate Kling AI into your product with our developer API.", cta: "View API docs", imgH: 300 }, imgs.mac, false);
    var app = addSec(root, "05 App", t, { alt: true, center: true });
    sectionHeading(app, t, "Download Kling App", "Create on the go with iOS and Android.", true);
    cloneMedia(app, 400, 400, 24, imgs.cover, true);
    FOOT_REF(root, t, "Kling AI");
  }

  function buildViduRef(root, t) {
    var w = cw(t);
    var imgs = REF_IMG.vidu;
    heroCenter(root, t, imgs.hero, {
      brand: "Vidu", nav: ["Features", "Pricing", "Creator Plan", "Try Vidu"], cta: "Try Vidu",
      h1: "What you imagine\nis what Vidu", h1s: 64, lead: "Reference to Video · Image to Video · AI templates for everyone.", leadS: 18,
      mediaR: 24, sh: true,
    });
    var feats = F("02 Features", { parent: root, w: 1440, fills: [solid(t.surface)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    sectionHeading(feats, t, "Why Vidu AI Video Generator?", null, true);
    gridCards(feats, t, w, imgs.grid.map(function (img, i) {
      return { img: img, title: ["Vidu Claw", "Reference to Video", "Image to Video", "Templates"][i], sub: "Create stunning AI video" };
    }), 2, 280, 20);
    var claw = addSec(root, "03 Vidu Claw", t, { alt: true });
    splitBlock(claw, t, w, { eyebrow: "NEW", title: "Vidu Claw", lead: "Your AI video assistant — describe it, get it.", cta: "Try Claw", imgH: 340 }, imgs.grid[1], false);
    var refVid = addSec(root, "04 Reference to Video", t, {});
    splitBlock(refVid, t, w, { title: "Reference to Video", lead: "Upload a reference image and generate consistent video.", ts: 32 }, imgs.grid[0], true);
    var i2v = addSec(root, "05 Image to Video", t, { alt: true });
    splitBlock(i2v, t, w, { title: "Image to Video", lead: "Bring still images to life with cinematic motion.", ts: 32 }, imgs.grid[2], false);
    var templates = addSec(root, "06 Templates", t, {});
    sectionHeading(templates, t, "Templates for Everyone", null, true);
    gridCards(templates, t, w, imgs.grid.map(function (img, i) {
      return { img: img, title: ["Cinematic", "Anime", "Realistic", "Fantasy"][i], sub: "One-click templates" };
    }), 4, 200, 12);
    var creators = addSec(root, "07 Creators", t, { alt: true });
    sectionHeading(creators, t, "What Do Creators Say", null, true);
    quoteCards(creators, t, w, [
      ["\"Vidu changed how I create content.\"", "@creator1", "YouTube"],
      ["\"Reference to Video is a game changer.\"", "@creator2", "TikTok"],
    ]);
    var faq = addSec(root, "08 FAQ", t, {});
    sectionHeading(faq, t, "FAQ", null, true);
    faqBlock(faq, t, w, [
      ["Is Vidu free?", "Free tier available with Creator Plan upgrade."],
      ["What formats are supported?", "MP4, WebM up to 4K resolution."],
    ]);
    ctaBlock(addSec(root, "09 CTA", t, { alt: true, center: true }), t, w, "Free Your Creativity", "Join millions of creators worldwide.", "Try Vidu");
    FOOT_REF(root, t, "Vidu");
  }

  function buildMoonvalleyRef(root, t) {
    var w = cw(t);
    var imgs = REF_IMG.moonvalley;
    heroFullBleed(root, t, imgs.hero, {
      brand: "Moonvalley", nav: ["MAREY", "Showcase", "Team", "Pricing"], cta: "Get started",
      h1: "DIRECT\nEVERY DETAIL", h1s: 88, h1y: 240, ls: -1,
      lead: "Fully licensed. Commercially safe AI video for the screen.", leady: 400, ctaY: 500,
      scrimColor: hex("100C08"), scrimA: 0.55, textColor: hex("FFFFFF"), leadColor: hex("CCCCCC"),
      btnBg: hex("FFFFFF"), btnText: hex("100C08"),
    });
    var built = F("02 Built", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    sectionHeading(built, t, "BUILT FOR THE SCREEN");
    gridCards(built, t, w, [
      { img: imgs.cards[0], title: "Pose control", sub: "Direct character motion" },
      { img: imgs.cards[1], title: "Camera control", sub: "Cinematic framing" },
    ], 2, 320, 12);
    var licensed = addSec(root, "03 Licensed", t, { alt: true, center: true });
    sectionHeading(licensed, t, "FULLY LICENSED,\nCommercially safe", "Train on licensed data. Use anywhere.", true);
    var controls = addSec(root, "04 Controls", t, {});
    sectionHeading(controls, t, "CREATE WITHOUT COMPROMISE");
    gridCards(controls, t, w, [
      { img: imgs.cards[0], title: "Pose", sub: "Character control" },
      { img: imgs.cards[1], title: "Camera", sub: "Cinematic angles" },
      { img: imgs.hero, title: "Motion", sub: "Trajectory paths" },
      { img: imgs.cards[0], title: "Trajectory", sub: "Precise paths" },
    ], 2, 260, 12);
    var blog = addSec(root, "05 Blog", t, { alt: true });
    splitBlock(blog, t, w, { eyebrow: "BEYOND THE FRAME", title: "Latest from the blog", lead: "Research, tutorials, and creator stories.", cta: "Read blog" }, imgs.hero, false);
    var partners = addSec(root, "06 Partners", t, {});
    sectionHeading(partners, t, "INFERENCE PARTNERS", "ComfyUI · fal.ai · Replicate");
    logoStrip(partners, t, w, ["ComfyUI", "fal.ai", "Replicate", "Hugging Face"]);
    ctaBlock(addSec(root, "07 CTA", t, { alt: true, center: true }), t, w, "Start creating\nwith Moonvalley", "Commercially safe AI video.", "Get started");
    FOOT_REF(root, t, "Moonvalley");
  }

  function buildLumaRef(root, t) {
    var w = cw(t);
    var imgs = REF_IMG.luma;
    heroCenter(root, t, imgs.hero, {
      brand: "Luma", nav: ["Product", "Pricing", "API", "Enterprise"], cta: "Get started",
      eyebrow: "LUMA AI", h1: "Imagination just\ngot a team", h1s: 52, lead: "Where ideas become the work — Luma agents for creative teams.", gap: 40, pt: 100,
      mediaH: 480, mediaR: 16,
    });
    var product = F("02 Product", { parent: root, w: 1440, fills: [solid(t.surface2)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    sectionHeading(product, t, "Where ideas become the work", null, true);
    gridCards(product, t, w, [
      { img: imgs.cards[0], title: "Luma Agents", sub: "AI teammates for creative work" },
      { img: imgs.cards[1], title: "RAY3.2", sub: "Latest research models" },
    ], 2, 300, 20);
    var logosL = addSec(root, "03 Logos", t, {});
    sectionHeading(logosL, t, "The fastest creative teams choose Luma", null, true);
    logoStrip(logosL, t, w, ["Adobe", "Nike", "Apple", "Spotify", "Netflix", "Google"]);
    var agents = addSec(root, "04 Agents", t, { alt: true });
    splitBlock(agents, t, w, { eyebrow: "LUMA AGENTS", title: "Luma agents product", lead: "AI teammates that understand your creative workflow and execute tasks autonomously.", cta: "Try agents", imgH: 360 }, imgs.cards[0], false);
    var research = addSec(root, "05 Research", t, {});
    sectionHeading(research, t, "Recent News & Research");
    gridCards(research, t, w, [
      { img: imgs.cards[1], title: "Open Physical AI Lab", sub: "Research · 2026" },
      { img: imgs.cards[0], title: "RAY3.2", sub: "Model release" },
      { img: imgs.hero, title: "UNI-1", sub: "Unified multimodal model" },
    ], 3, 220, 16);
    var team = addSec(root, "06 Team", t, { alt: true, center: true });
    sectionHeading(team, t, "Team & Community", "Careers · Learning Center · Discord", true);
    ctaBlock(addSec(root, "07 CTA", t, { center: true }), t, w, "Imagination just\ngot a team", "Start creating with Luma today.", "Get started");
    FOOT_REF(root, t, "Luma");
  }

  function buildRunwayRef(root, t) {
    var w = cw(t);
    var imgs = REF_IMG.runway;
    NAV_REF(root, t, "Runway", ["Creative", "Dev", "Robotics", "Research", "Pricing"], "Sign up");
    var hero = F("01 Hero", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 80, pb: 64, pl: t.padX, pr: t.padX, gap: 32 });
    T(hero, "Building Real-World\nIntelligence", { s: 50, c: t.text, lh: 54, ls: -1.5, wdt: 700 });
    T(hero, "Runway Creative · Runway Dev · Runway Robotics — three platforms, one mission.", { s: 18, c: t.muted, lh: 28, wdt: 560 });
    BTN(hero, "Explore Runway", t.accent, t.accentText, t.rBtn);
    cloneMedia(hero, w, videoH16x9(w), 8, imgs.hero, true);
    var platforms = F("02 Platforms", { parent: root, w: 1440, fills: [solid(t.surface2)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    sectionHeading(platforms, t, "How Runway is used");
    gridCards(platforms, t, w, imgs.cards.map(function (img, i) {
      return { img: img, title: ["Creative", "Enterprise", "Research"][i], sub: "Real-world intelligence" };
    }), 3, 220, 8);
    var three = addSec(root, "03 Three platforms", t, { alt: true });
    sectionHeading(three, t, "Three platforms.\nOne mission.");
    gridCards(three, t, w, [
      { img: imgs.hero, title: "Runway Creative", sub: "For creators and studios" },
      { img: imgs.cards[0], title: "Runway Dev", sub: "For developers and products" },
      { img: imgs.cards[1], title: "Runway Robotics", sub: "Physical world intelligence" },
    ], 3, 240, 8);
    var tabsR = addSec(root, "04 Tabs", t, {});
    pillTabs(tabsR, t, ["How Runway is Used", "Create with Agent", "Workflows", "Enterprise", "Models"]);
    cloneMedia(tabsR, w, videoH16x9(w), 8, imgs.cards[2], true);
    var researchR = addSec(root, "05 Research", t, { alt: true });
    sectionHeading(researchR, t, "Research");
    gridCards(researchR, t, w, [
      { img: imgs.cards[0], title: "GWM-1", sub: "General World Model" },
      { img: imgs.cards[1], title: "Gen-4.5", sub: "Latest video model" },
      { img: imgs.cards[2], title: "General World Models", sub: "Research paper" },
    ], 3, 200, 8);
    var news = addSec(root, "06 News", t, {});
    sectionHeading(news, t, "Recent News");
    gridCards(news, t, w, imgs.cards.map(function (img, i) {
      return { img: img, title: ["Runway × Lionsgate", "Runway UK", "Salomon"][i], sub: "News · 2026" };
    }), 3, 180, 8);
    ctaBlock(addSec(root, "07 CTA", t, { alt: true, center: true }), t, w, "Building the future\nof intelligence", "Join Runway Creative, Dev, or Robotics.", "Sign up");
    FOOT_REF(root, t, "Runway");
  }

  function buildTavusRef(root, t) {
    var w = cw(t);
    var imgs = REF_IMG.tavus;
    NAV_REF(root, t, "Tavus", ["Solutions", "Enterprise", "Pricing"], "Book a demo");
    var hero = F("01 Hero", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 80, pb: 64, pl: t.padX, pr: t.padX, gap: 32 });
    T(hero, "You've never met\nAI like this", { s: 88, c: t.text, lh: 88, ls: -2.5, wdt: 800 });
    T(hero, "Speak with Charlie — human connection in every AI interaction.", { s: 20, c: t.muted, lh: 30, wdt: 560 });
    BTN(hero, "Speak with Charlie", t.accent, t.accentText, t.rBtn);
    cloneMedia(hero, w, videoH16x9(w), 16, imgs.hero, true);
    var products = F("02 Products", { parent: root, w: 1440, fills: [solid(t.surface2)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    sectionHeading(products, t, "Our products");
    gridCards(products, t, w, imgs.cards.map(function (img, i) {
      return { img: img, title: ["CVI", "PAL Maker"][i], sub: "Conversational video intelligence" };
    }), 2, 300, 16);
    cloneMedia(products, w, 200, 16, imgs.cta, true);
    var useCases = addSec(root, "03 Use cases", t, {});
    sectionHeading(useCases, t, "Infinite use cases", "Sales · Support · Training · Onboarding");
    gridCards(useCases, t, w, imgs.cards.map(function (img, i) {
      return { img: img, title: ["Sales", "Support"][i], sub: "Personalized video at scale" };
    }), 2, 260, 16);
    var conv = addSec(root, "04 Conversation", t, { alt: true });
    splitBlock(conv, t, w, { title: "What if you could talk\nto your computer like a friend?", lead: "Natural, empathetic AI conversations powered by CVI.", cta: "Learn more", imgH: 340 }, imgs.hero, false);
    var models = addSec(root, "05 Models", t, {});
    sectionHeading(models, t, "Models");
    gridCards(models, t, w, [
      { img: imgs.cards[0], title: "Phoenix-3", sub: "Real-time video AI" },
      { img: imgs.cards[1], title: "Raven-0", sub: "Emotion-aware model" },
    ], 2, 280, 16);
    var build = addSec(root, "06 Build", t, { alt: true });
    splitBlock(build, t, w, { eyebrow: "DEVELOPERS", title: "Build with us", lead: "API access for custom integrations and white-label solutions.", cta: "View docs", imgH: 300 }, imgs.cta, true);
    ctaBlock(addSec(root, "07 CTA", t, { center: true }), t, w, "Bring human connection\nto every AI interaction", "Book a demo with our team.", "Book a demo");
    FOOT_REF(root, t, "Tavus");
  }

  function buildHarveyRef(root, t) {
    var w = cw(t);
    var imgs = REF_IMG.harvey;
    NAV_REF(root, t, "Harvey", ["Platform", "Solutions", "Customers", "Security"], "Request demo");
    var hero = F("01 Hero", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 120, pb: 80, pl: t.padX, pr: t.padX, gap: 32 });
    T(hero, "Practice\nMade Perfect", { s: 96, c: t.text, lh: 92, ls: -2, wdt: 700 });
    T(hero, "Harvey is AI designed for legal work — built for the world's leading law firms.", { s: 20, c: t.muted, lh: 32, wdt: 560 });
    BTN(hero, "Request a demo", t.accent, t.accentText, t.rBtn);
    cloneMedia(hero, w, videoH16x9(w), 4, imgs.hero, true);
    var stats = F("02 Stats", { parent: root, w: 1440, fills: [solid(t.surface)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    metricsRow(stats, t, w, [["", "25+", "Am Law 100 firms"], ["", "200,000+", "Users"], ["", "2,400+", "Law firms"]]);
    var cases = F("03 Cases", { parent: root, w: 1440, fills: [solid(t.bg)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    sectionHeading(cases, t, "Real impact for real clients");
    gridCards(cases, t, w, imgs.cards.map(function (img, i) {
      return { img: img, title: "Case study " + (i + 1), sub: "Enterprise legal AI deployment" };
    }), 2, 280, 4);
    var intro = addSec(root, "04 Intro", t, { alt: true, center: true });
    sectionHeading(intro, t, "Harvey is AI designed for legal work", "Collaboration · Analysis · Drafting · Research", true);
    cloneMedia(intro, w, 360, 4, imgs.hero, true);
    var carousel = addSec(root, "05 Customers", t, {});
    sectionHeading(carousel, t, "The top legal teams use Harvey for");
    logoStrip(carousel, t, w, ["A&O Shearman", "Macfarlanes", "Freshfields", "DLA Piper", "Ashurst"]);
    var security = addSec(root, "06 Security", t, { alt: true });
    splitBlock(security, t, w, { title: "Enterprise-grade\nsecurity and controls", lead: "SOC 2 Type II · GDPR · SSO · Audit logging · Data residency.", ts: 32 }, imgs.cards[0], false);
    ctaBlock(addSec(root, "07 CTA", t, { center: true }), t, w, "Unlock Professional\nClass AI", "Request a demo for your firm.", "Request a demo");
    FOOT_REF(root, t, "Harvey");
  }

  function buildDescriptRef(root, t) {
    var w = cw(t);
    var imgs = REF_IMG.descript;
    NAV_REF(root, t, "Descript", ["Video editing", "Podcasting", "AI tools", "Pricing"], "Sign up free");
    var hero = F("01 Hero", { parent: root, w: 1440, fills: [solid(t.bg)], pt: 80, pb: 64, pl: t.padX, pr: t.padX, gap: 32, align: "CENTER", cross: "CENTER" });
    T(hero, "AI Video Editor", { s: 56, c: t.text, lh: 60, align: "CENTER", wdt: 800 });
    T(hero, "Edit video like a doc. Underlord AI agent included.", { s: 18, c: t.muted, lh: 28, align: "CENTER", wdt: 560 });
    BTN(hero, "Get started free", t.accent, t.accentText, t.rBtn);
    cloneMedia(hero, w, videoH16x9(w), 16, imgs.hero, true);
    var tools = F("02 Tools", { parent: root, w: 1440, fills: [solid(t.surface2)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    sectionHeading(tools, t, "Best AI Tools", null, true);
    gridCards(tools, t, w, imgs.cards.map(function (img, i) {
      return { img: img, title: ["AI Video Agent", "Transcription"][i], sub: "Edit faster with AI" };
    }), 2, 260, 16);
    var agent = addSec(root, "03 AI Agent", t, {});
    splitBlock(agent, t, w, { eyebrow: "UNDERLORD", title: "AI Video Agent", lead: "Tell Underlord what you want — it edits your video for you.", cta: "Try Underlord", imgH: 340 }, imgs.hero, false);
    var transcribe = addSec(root, "04 Transcription", t, { alt: true });
    splitBlock(transcribe, t, w, { title: "Transcription Editor", lead: "Edit video by editing text. Remove filler words in one click.", ts: 32 }, imgs.cards[0], true);
    var editor = addSec(root, "05 One editor", t, {});
    sectionHeading(editor, t, "One video editor for all this", "Video · Podcast · Screen recording · AI voice");
    gridCards(editor, t, w, [
      { img: imgs.hero, title: "Video editing", sub: "Edit like a doc" },
      { img: imgs.cards[1], title: "Podcasting", sub: "Record and edit" },
      { img: imgs.cards[0], title: "Screen recording", sub: "Capture and share" },
    ], 3, 200, 16);
    var biz = addSec(root, "06 Business", t, { alt: true });
    sectionHeading(biz, t, "Whatever your business needs");
    quoteCards(biz, t, w, [
      ["\"Descript cut our editing time in half.\"", "Marketing lead", "SaaS company"],
      ["\"The AI agent is magic for our podcast.\"", "Producer", "Media studio"],
    ]);
    var pricing = addSec(root, "07 Pricing", t, { center: true });
    sectionHeading(pricing, t, "Pricing", null, true);
    pricingCards(pricing, t, w, [
      ["Free", "$0", ["1 hour/month", "Basic AI tools"], "Sign up free"],
      ["Hobbyist", "$12/mo", ["10 hours/month", "Underlord AI"], "Get started"],
      ["Pro", "$24/mo", ["30 hours/month", "Team features"], "Go Pro"],
    ]);
    ctaBlock(addSec(root, "08 CTA", t, { alt: true, center: true }), t, w, "Video editing\nsoftware at its finest", "Start free today.", "Get started free");
    FOOT_REF(root, t, "Descript");
  }

  function buildArcadsRef(root, t) {
    var w = cw(t);
    var imgs = REF_IMG.arcads;
    heroCenter(root, t, imgs.hero, {
      brand: "Arcads", nav: ["Features", "Industries", "Login"], cta: "Create ad",
      h1: "Create winning ads\nwith AI", h1s: 56, lead: "The most realistic AI actors for performance marketing.", mediaR: 16, sh: true,
    });
    var actors = F("02 Actors", { parent: root, w: 1440, fills: [solid(t.surface)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    sectionHeading(actors, t, "The most realistic AI Actors", null, true);
    gridCards(actors, t, w, imgs.actors.map(function (img, i) {
      return { img: img, title: "AI Actor " + (i + 1), sub: "UGC-style performance" };
    }), 2, 320, 16);
    var workflow = addSec(root, "03 Workflow", t, { alt: true, center: true });
    sectionHeading(workflow, t, "New: Create Workflow", "Build multi-step ad pipelines with AI.", true);
    cloneMedia(workflow, w, videoH16x9(w), 16, imgs.hero, true);
    var examples = addSec(root, "04 Examples", t, {});
    sectionHeading(examples, t, "Used by millions of the best marketers");
    gridCards(examples, t, w, imgs.actors.map(function (img, i) {
      return { img: img, title: "Ad example " + (i + 1), sub: "Performance creative" };
    }), 2, 280, 16);
    var leaders = addSec(root, "05 Leaders", t, { alt: true });
    quoteCards(leaders, t, w, [
      ["\"Arcads is the future of performance marketing.\"", "Growth expert", "DTC brand"],
      ["\"Most realistic AI actors I've seen.\"", "CMO", "E-commerce"],
    ]);
    var features = addSec(root, "06 Features", t, {});
    sectionHeading(features, t, "Features", null, true);
    gridCards(features, t, w, [
      { img: imgs.actors[0], title: "Create Actor", sub: "Custom AI personas" },
      { img: imgs.actors[1], title: "AI Video Editing", sub: "Edit in seconds" },
      { img: imgs.actors[2], title: "Emotion control", sub: "Fine-tune delivery" },
      { img: imgs.actors[3], title: "Localize", sub: "40+ languages" },
    ], 2, 240, 16);
    ctaBlock(addSec(root, "07 CTA", t, { alt: true, center: true }), t, w, "Ready to dominate\nyour category?", "Create your first AI ad today.", "Create ad");
    FOOT_REF(root, t, "Arcads");
  }

  function buildSynthesiaRef(root, t) {
    var w = cw(t);
    var imgs = REF_IMG.synthesia;
    heroCenter(root, t, imgs.hero, {
      brand: "Synthesia", nav: ["Platform", "Solutions", "Pricing", "Enterprise"], cta: "Get started",
      h1: "All-in-one AI Video\nplatform for business", h1s: 80, ls: -2.5, lead: "Train, market and sell like a Fortune 100 company.", gap: 36,
      mediaR: 20,
    });
    var platform = F("02 Platform", { parent: root, w: 1440, fills: [solid(t.surface2)], pt: t.padY, pb: t.padY, pl: t.padX, pr: t.padX, gap: 32 });
    sectionHeading(platform, t, "One platform to create, localize, manage and publish", null, true);
    gridCards(platform, t, w, imgs.cards.map(function (img, i) {
      return { img: img, title: ["Edit", "Collaborate", "Translate"][i], sub: "Enterprise AI video" };
    }), 3, 220, 16);
    var logosS = addSec(root, "03 Logos", t, {});
    sectionHeading(logosS, t, "Trusted by Fortune 100 companies", null, true);
    logoStrip(logosS, t, w, ["Heineken", "Zoom", "SAP", "McDonald's", "Accenture", "Reuters"]);
    var train = addSec(root, "04 Train", t, { alt: true, center: true });
    sectionHeading(train, t, "Train, market and sell\nlike a Fortune 100 company", null, true);
    cloneMedia(train, w, videoH16x9(w), 20, imgs.hero, true);
    var featuresS = addSec(root, "05 Features", t, {});
    sectionHeading(featuresS, t, "One platform — nine superpowers");
    gridCards(featuresS, t, w, imgs.cards.concat(imgs.cards).map(function (img, i) {
      return { img: img, title: ["Create", "Edit", "Collaborate", "Translate", "Personalize", "Publish"][i], sub: "Enterprise feature" };
    }), 3, 200, 16);
    var demo = addSec(root, "06 Demo", t, { alt: true, center: true });
    sectionHeading(demo, t, "Try out our free AI Video Tool", "Create a video in minutes — no credit card.", true);
    cloneMedia(demo, w, 400, 20, imgs.cards[0], true);
    var loved = addSec(root, "07 Loved", t, {});
    quoteCards(loved, t, w, [
      ["\"Synthesia saved us 80% on video production.\"", "L&D Manager", "Fortune 500"],
      ["\"Best AI video platform for enterprise.\"", "Marketing Director", "Tech company"],
    ]);
    var faqS = addSec(root, "08 FAQ", t, { alt: true });
    sectionHeading(faqS, t, "FAQ", null, true);
    faqBlock(faqS, t, w, [
      ["Can I use my own avatars?", "Yes — upload custom avatars on Enterprise plan."],
      ["What languages are supported?", "140+ languages with native voices."],
    ]);
    ctaBlock(addSec(root, "09 CTA", t, { center: true }), t, w, "Ready to try Synthesia?", "Start creating AI videos today.", "Get started");
    FOOT_REF(root, t, "Synthesia");
  }

  var REF_THEMES = {
    basecraft: { ref: "basecraft.ru", bg: hex("101010"), surface: hex("1A1A1A"), surface2: hex("242424"), text: hex("FFFFFF"), muted: hex("A0A0A0"), accent: hex("FFFFFF"), accentText: hex("101010"), line: hex("333333"), cardBg: hex("1A1A1A"), padX: 120, padY: 96, rBtn: 999, navH: 56 },
    "11x": { ref: "11x.ai", bg: hex("FFFFFF"), surface2: hex("F5F5F5"), text: hex("0A0A0A"), muted: hex("666666"), accent: hex("0A0A0A"), accentText: hex("FFFFFF"), line: hex("E5E5E5"), padX: 96, padY: 120, rBtn: 999, navH: 72 },
    kling: { ref: "kling.ai", bg: hex("000000"), surface: hex("111111"), surface2: hex("1A1A1A"), text: hex("FFFFFF"), muted: hex("888888"), accent: hex("FFFFFF"), accentText: hex("000000"), line: hex("333333"), padX: 80, padY: 100, rBtn: 999, navH: 56 },
    vidu: { ref: "vidu.com", bg: hex("020B13"), surface: hex("0A1520"), surface2: hex("122030"), text: hex("FFFFFF"), muted: hex("8899AA"), accent: hex("FFFFFF"), accentText: hex("020B13"), line: hex("1A3040"), cardBg: hex("0A1520"), padX: 104, padY: 96, rBtn: 999 },
    moonvalley: { ref: "moonvalley.com", bg: hex("100C08"), surface: hex("1A1410"), surface2: hex("241C16"), text: hex("FFFFFF"), muted: hex("AA9988"), accent: hex("FFFFFF"), accentText: hex("100C08"), line: hex("332820"), padX: 96, padY: 100, rBtn: 999 },
    luma: { ref: "lumalabs.ai", bg: hex("FFFFFF"), surface2: hex("F6F6F6"), text: hex("0A0A0A"), muted: hex("666666"), accent: hex("0A0A0A"), accentText: hex("FFFFFF"), line: hex("E8E8E8"), padX: 96, padY: 120, rBtn: 999 },
    runway: { ref: "runway.com", bg: hex("FFFFFF"), surface2: hex("F4F4F4"), text: hex("0A0A0A"), muted: hex("666666"), accent: hex("0A0A0A"), accentText: hex("FFFFFF"), line: hex("E0E0E0"), padX: 96, padY: 100, rBtn: 8 },
    tavus: { ref: "tavus.io", bg: hex("F7F4EF"), surface2: hex("EDEAE4"), text: hex("1A1A1A"), muted: hex("666660"), accent: hex("1A1A1A"), accentText: hex("F7F4EF"), line: hex("DDD8D0"), padX: 104, padY: 100, rBtn: 999 },
    harvey: { ref: "harvey.ai", bg: hex("0F0E0D"), surface: hex("1A1918"), surface2: hex("242220"), text: hex("FFFFFF"), muted: hex("999990"), accent: hex("FFFFFF"), accentText: hex("0F0E0D"), line: hex("333330"), padX: 120, padY: 140, rBtn: 4 },
    descript: { ref: "descript.com", bg: hex("FFF7FA"), surface2: hex("FFEDF3"), text: hex("1A1A1A"), muted: hex("666666"), accent: hex("1A1A1A"), accentText: hex("FFFFFF"), line: hex("F0D8E0"), padX: 96, padY: 96, rBtn: 999 },
    arcads: { ref: "arcads.ai", bg: hex("121212"), surface: hex("1A1A1A"), surface2: hex("222222"), text: hex("FFFFFF"), muted: hex("888888"), accent: hex("FFFFFF"), accentText: hex("121212"), line: hex("333333"), cardBg: hex("1A1A1A"), padX: 96, padY: 88, rBtn: 999 },
    synthesia: { ref: "synthesia.io", bg: hex("FFFFFF"), surface2: hex("F5F5F7"), text: hex("0A0A0A"), muted: hex("666666"), accent: hex("0A0A0A"), accentText: hex("FFFFFF"), line: hex("E8E8EA"), padX: 104, padY: 96, rBtn: 999 },
  };

  var REF_CLONE_SITES = [
    { key: "basecraft", title: "Ref · Basecraft", build: buildBasecraftRef },
    { key: "11x", title: "Ref · 11x", build: build11xRef },
    { key: "kling", title: "Ref · Kling", build: buildKlingRef },
    { key: "vidu", title: "Ref · Vidu", build: buildViduRef },
    { key: "moonvalley", title: "Ref · Moonvalley", build: buildMoonvalleyRef },
    { key: "luma", title: "Ref · Luma", build: buildLumaRef },
    { key: "runway", title: "Ref · Runway", build: buildRunwayRef },
    { key: "tavus", title: "Ref · Tavus", build: buildTavusRef },
    { key: "harvey", title: "Ref · Harvey", build: buildHarveyRef },
    { key: "descript", title: "Ref · Descript", build: buildDescriptRef },
    { key: "arcads", title: "Ref · Arcads", build: buildArcadsRef },
    { key: "sana", title: "Ref · Sana", build: null },
    { key: "synthesia", title: "Ref · Synthesia", build: buildSynthesiaRef },
  ];

  async function generateRefClonePage(buildSanaClone, sanaCloneTheme, sanaExtraUrls) {
    var clonePage = figma.createPage();
    clonePage.name = "Refs · pixel perfect clones";
    var CLONE_COL = 1560;
    var CLONE_ROW = 42000;
    var roots = [];

    figma.notify("Загружаю изображения референсов…", { timeout: 3000 });
    var imgCount = await preloadRefImages(sanaExtraUrls || []);

    REF_CLONE_SITES.forEach(function (site, i) {
      var col = i % 7;
      var row = Math.floor(i / 7);
      var theme = site.key === "sana"
        ? Object.assign({}, sanaCloneTheme, { refKey: "sana" })
        : Object.assign({}, REF_THEMES[site.key], { refKey: site.key });
      if (fontBox) fontBox.current = refFontSets ? refFontSets[site.key] : null;
      var root = F(site.title, { w: 1440, fills: [solid(theme.bg)], gap: 0 });
      root.x = col * CLONE_COL;
      root.y = row * CLONE_ROW;
      root.layoutMode = "VERTICAL";
      root.primaryAxisSizingMode = "AUTO";
      root.counterAxisSizingMode = "FIXED";
      root.clipsContent = false;
      clonePage.appendChild(root);
      if (site.key === "sana") {
        buildSanaClone(root, theme, true);
      } else if (site.build) {
        site.build(root, theme);
      }
      finalize(root);
      unclip(root);
      roots.push(root);
      if (fontBox) fontBox.current = null;
    });

    var note = figma.createText();
    note.fontName = ctx.fB;
    note.characters = "Refs · pixel perfect clones · per-site fonts (best Figma match) · images via wsrv.nl";
    note.fontSize = 12;
    note.fills = [solid(hex("888888"))];
    note.x = 0;
    note.y = -48;
    clonePage.appendChild(note);

    return { page: clonePage, roots: roots, imgCount: imgCount };
  }

  return {
    generateRefClonePage: generateRefClonePage,
    preloadRefImages: preloadRefImages,
    collectRefImgUrls: collectRefImgUrls,
  };
}

