/**
 * Pixel-perfect reference site clones (original copy + real images via wsrv.nl).
 * Included into code.js at build time — do not set as manifest main directly.
 */
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

  // ——— Site clone builders ———

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
