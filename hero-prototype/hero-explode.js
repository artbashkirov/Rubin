/**
 * Распад терминала в конце hero: интерфейс целиком наклоняется в трапецию
 * (низ ближе, верх дальше), затем одновременно гаснет всё, кроме кусков,
 * а куски становятся 3D-плитами, растут, летят на камеру и уходят в белый.
 * Геометрия — в px стейджа 1728×972 (как кадры секвенции).
 */
window.HeroExplode = (() => {
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const seg = (t, a, b) => clamp01((t - a) / (b - a));
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  // 0 → 1: старт с нулевой скоростью, в конце скорость m1 (кубический Эрмит)
  const hermite = (x, m1) => 3 * x * x - 2 * x * x * x + (x * x * x - x * x) * m1;

  function el(tag, cls, parent) {
    const node = document.createElement(tag);
    node.className = cls;
    if (parent) parent.appendChild(node);
    return node;
  }

  function create({ pin, flash, cfg, stageW, stageH }) {
    const box = cfg.box;
    const src = cfg.source;
    const sx = box.w / src.w;
    const sy = box.h / src.h;
    const depth = cfg.depth ?? 10;
    const radius = cfg.radius ?? 0;
    const LAYERS = 6;

    const root = el("div", "hero-explode");
    root.setAttribute("aria-hidden", "true");
    const stage = el("div", "hero-explode__stage", root);
    stage.style.width = `${stageW}px`;
    stage.style.height = `${stageH}px`;

    const place = (node) => {
      node.style.left = `${box.x}px`;
      node.style.top = `${box.y}px`;
      node.style.width = `${box.w}px`;
      node.style.height = `${box.h}px`;
    };

    const group = el("div", "hero-explode__group", stage);
    place(group);

    // остальной интерфейс (с дырками под куски) наклоняется вместе с кусками
    const base = el("div", "hero-explode__base", group);
    base.style.backgroundImage = `url("${cfg.rest}")`;

    const slabs = cfg.panels.map((p) => {
      const rects = p.rects.map(([x0, y0, x1, y1]) => ({
        x: x0 * sx,
        y: y0 * sy,
        w: (x1 - x0) * sx,
        h: (y1 - y0) * sy,
      }));
      const x = Math.min(...rects.map((r) => r.x));
      const y = Math.min(...rects.map((r) => r.y));
      const w = Math.max(...rects.map((r) => r.x + r.w)) - x;
      const h = Math.max(...rects.map((r) => r.y + r.h)) - y;

      const slab = el("div", "hero-explode__slab", group);
      slab.style.left = `${x}px`;
      slab.style.top = `${y}px`;
      slab.style.width = `${w}px`;
      slab.style.height = `${h}px`;

      rects.forEach((r) => {
        const part = el("div", "hero-explode__part", slab);
        part.style.left = `${r.x - x}px`;
        part.style.top = `${r.y - y}px`;
        part.style.width = `${r.w}px`;
        part.style.height = `${r.h}px`;
        // толщина — стопка тонких слоёв (так торец повторяет скругление углов)
        for (let k = 1; k <= LAYERS; k++) {
          const layer = el("i", "hero-explode__layer", part);
          layer.style.setProperty("--k", String(k / LAYERS));
          if (k === 1) layer.classList.add("hero-explode__layer--rim");
        }
        const face = el("div", "hero-explode__face", part);
        face.style.backgroundImage = `url("${cfg.image}")`;
        face.style.backgroundSize = `${box.w}px ${box.h}px`;
        face.style.backgroundPosition = `${-r.x}px ${-r.y}px`;
      });

      return {
        slab,
        ox: x + w / 2 - box.w / 2,
        oy: y + h / 2 - box.h / 2,
        z: p.z ?? 0,
      };
    });

    const shade = el("div", "hero-explode__shade", root);

    pin.appendChild(root);

    function layout(viewW, viewH) {
      const scale = Math.max(viewW / stageW, viewH / stageH);
      const x = (viewW - stageW * scale) / 2;
      const y = (viewH - stageH * scale) / 2;
      stage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    }

    // этапы в секундах: наклон в трапецию → с одной точки вся трансформация до опорного
    // кадра (куски объёмные, целиком в кадре) → лёгкий дрейф к камере до белого
    const dur = cfg.duration ?? 1.45;
    const TILT_END = 0.75 / dur;
    const ANCHOR = 1.05 / dur;
    const FLASH_FROM = 1.1 / dur;
    const DRIFT = 0.6;
    // кадр 116 темнее и мягче мастера: распад проявляется поверх него в его тоне и к концу наклона выходит на свою яркость
    const FADE_IN = (cfg.fadeIn ?? 0) / dur;
    const TONE = cfg.matchBrightness ?? 1;

    function render(t, driveFlash = true) {
      const tilt = easeInOut(seg(t, 0, TILT_END));
      const vol = easeOut(seg(t, TILT_END, ANCHOR));
      const grow =
        t <= ANCHOR
          ? hermite(seg(t, TILT_END, ANCHOR), (DRIFT * (ANCHOR - TILT_END)) / (1 - ANCHOR))
          : 1 + (DRIFT * (t - ANCHOR)) / (1 - ANCHOR);

      base.style.opacity = String(1 - vol);
      group.style.setProperty("--slab-depth", `${depth * vol}px`);
      group.style.setProperty("--slab-radius", `${radius * vol}px`);
      group.style.transform =
        `translateZ(${165 * grow}px) rotateX(${26 * tilt}deg) scale(${1 - 0.06 * tilt})`;

      // куски остаются параллельными — без поворотов по дуге
      const spread = 0.033 * grow;
      for (const s of slabs) {
        s.slab.style.transform =
          `translate3d(${s.ox * spread}px, ${s.oy * spread}px, ${1 + s.z * 0.44 * grow}px)`;
      }

      root.style.opacity = String(FADE_IN > 0 ? seg(t, 0, FADE_IN) : 1);
      // затемнение отдельным слоем: фильтр на 3D-группе заставляет перерисовывать её и даёт фриз на старте разлёта
      // и уходит до старта разлёта: живой слой поверх 3D-плит в этот момент тоже даёт фриз
      const dim = (1 - TONE) * (1 - easeInOut(seg(t, 0, TILT_END * 0.6)));
      shade.style.opacity = String(dim);
      shade.style.display = dim > 0 ? "" : "none";
      root.style.filter = `brightness(${1 + 0.8 * seg(t, ANCHOR, 0.95)})`;
      if (driveFlash) flash.style.opacity = String(Math.pow(seg(t, FLASH_FROM, 1), 2));
    }

    let raf = 0;

    function play(duration) {
      cancelAnimationFrame(raf);
      root.classList.add("is-active");
      render(0);
      return new Promise((resolve) => {
        const t0 = performance.now();
        const tick = (now) => {
          const t = clamp01((now - t0) / (duration * 1000));
          render(t);
          if (t < 1) raf = requestAnimationFrame(tick);
          else resolve();
        };
        raf = requestAnimationFrame(tick);
      });
    }

    function seek(t) {
      cancelAnimationFrame(raf);
      root.classList.add("is-active");
      render(clamp01(t));
    }

    function reset() {
      cancelAnimationFrame(raf);
      root.classList.remove("is-active");
      render(0, false);
    }

    reset();
    return { layout, play, seek, reset };
  }

  return { create };
})();
