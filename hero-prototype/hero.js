(() => {
  const CFG = window.HERO_SEQ;
  const STAGE_W = CFG.stageWidth;
  const STAGE_H = CFG.stageHeight;

  const pin = document.querySelector(".hero-pin");
  const stage = document.querySelector(".stage");
  const canvas = document.querySelector(".hero-canvas");
  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  const status = document.querySelector(".hero-status");

  let viewW = 0;
  let viewH = 0;
  let dpr = 1;

  function fitUI() {
    const scale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H, 1);
    stage.style.transform = `scale(${scale})`;
  }

  function fitCanvas() {
    viewW = pin.clientWidth;
    viewH = pin.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(viewW * dpr));
    canvas.height = Math.max(1, Math.round(viewH * dpr));
    canvas.style.width = `${viewW}px`;
    canvas.style.height = `${viewH}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  }

  function fitAll() {
    fitUI();
    fitCanvas();
  }

  fitAll();
  window.addEventListener("resize", () => {
    fitAll();
    if (window.__heroRedraw) window.__heroRedraw();
  });

  function setStatus(text) {
    if (!status) return;
    if (!text) {
      status.hidden = true;
      status.textContent = "";
      return;
    }
    status.hidden = false;
    status.textContent = text;
  }

  function coverRect(sw, sh, dw, dh) {
    const scale = Math.max(dw / sw, dh / sh);
    const w = sw * scale;
    const h = sh * scale;
    return { x: (dw - w) / 2, y: (dh - h) / 2, w, h };
  }

  function drawCover(source, sw, sh, alpha = 1) {
    if (!sw || !sh || alpha <= 0) return;
    const r = coverRect(sw, sh, viewW, viewH);
    const prev = ctx.globalAlpha;
    ctx.globalAlpha = alpha;
    ctx.drawImage(source, r.x, r.y, r.w, r.h);
    ctx.globalAlpha = prev;
  }

  function clear() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, viewW, viewH);
  }

  function onScroll(handler) {
    if (!window.gsap || !window.ScrollTrigger) {
      console.warn("GSAP не загружен");
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      trigger: ".hero-scroll",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => handler(self.progress),
    });
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(src));
      img.src = src;
    });
  }

  function bookendAlphas(progress) {
    const firstHold = CFG.firstHold ?? 0.06;
    const firstFade = CFG.firstFade ?? 0.12;
    const lastFade = CFG.lastFade ?? 0.9;
    const lastHold = CFG.lastHold ?? 0.97;
    let first = 0;
    let last = 0;
    if (progress <= firstHold) first = 1;
    else if (progress < firstFade) first = 1 - (progress - firstHold) / (firstFade - firstHold);
    if (progress >= lastHold) last = 1;
    else if (progress > lastFade) last = (progress - lastFade) / (lastHold - lastFade);
    return {
      first: Math.max(0, Math.min(1, first)),
      last: Math.max(0, Math.min(1, last)),
    };
  }

  function pathWebp(i) {
    return `${CFG.dir}${CFG.prefix}${String(i).padStart(CFG.pad, "0")}.${CFG.ext}`;
  }

  function pathRaw(i) {
    const pad = CFG.rawPad ?? 2;
    const prefix = CFG.rawPrefix ?? "";
    const ext = CFG.rawExt ?? "png";
    return `${CFG.rawDir}${prefix}${String(i).padStart(pad, "0")}.${ext}`;
  }

  async function resolveMode() {
    // webp sequence?
    try {
      await loadImage(pathWebp(1));
      return { mode: "webp", pathFn: pathWebp };
    } catch (_) {}
    // raw png 01…65?
    try {
      await loadImage(pathRaw(1));
      return { mode: "raw", pathFn: pathRaw };
    } catch (_) {}
    throw new Error("no sequence");
  }

  async function preload(pathFn, count) {
    const frames = new Array(count);
    let loaded = 0;
    const queue = [];
    for (let i = 1; i <= count; i++) queue.push(i);

    async function worker() {
      while (queue.length) {
        const i = queue.shift();
        frames[i - 1] = await loadImage(pathFn(i));
        loaded += 1;
        setStatus(`Загрузка кадров ${loaded}/${count}`);
      }
    }

    await Promise.all([worker(), worker(), worker(), worker(), worker(), worker()]);
    return frames;
  }

  async function initSequence() {
    const { mode, pathFn } = await resolveMode();
    const count = CFG.count;
    setStatus(`Загрузка (${mode})…`);
    const frames = await preload(pathFn, count);

    let firstImg = null;
    let lastImg = null;
    if (CFG.firstHiRes) {
      try {
        firstImg = await loadImage(CFG.firstHiRes);
      } catch (_) {}
    }
    if (CFG.lastHiRes) {
      try {
        lastImg = await loadImage(CFG.lastHiRes);
      } catch (_) {}
    }
    function animProgress(p) {
      const hold = CFG.endHold ?? 0;
      if (hold <= 0) return p;
      const span = 1 - hold;
      return Math.min(1, p / span);
    }

    function frameIndex(p) {
      return Math.round(animProgress(p) * (count - 1));
    }

    let progress = 0;
    let lastIndex = -1;

    function paint() {
      clear();
      const ap = animProgress(progress);
      const { first, last } = bookendAlphas(ap);

      const idx = frameIndex(progress);
      const frame = frames[idx];
      if (frame) {
        drawCover(frame, frame.naturalWidth, frame.naturalHeight, 1);
        lastIndex = idx;
      }

      if (firstImg && first > 0) {
        drawCover(firstImg, firstImg.naturalWidth, firstImg.naturalHeight, first);
      }
      if (lastImg && last > 0) {
        drawCover(lastImg, lastImg.naturalWidth, lastImg.naturalHeight, last);
      }
    }

    window.__heroRedraw = paint;
    setStatus("");
    paint();
    if (typeof window.__rubinLoaderReady === "function") {
      window.__rubinLoaderReady();
    }
    onScroll((p) => {
      progress = p;
      const idx = frameIndex(p);
      const ap = animProgress(p);
      if (idx !== lastIndex || bookendAlphas(ap).first > 0 || bookendAlphas(ap).last > 0) {
        paint();
      }
    });
    console.info(`[hero] sequence ${mode}, ${count} frames, endHold=${CFG.endHold ?? 0}`);
  }

  async function initVideoFallback() {
    const src = CFG.video;
    if (!src) throw new Error("no video");
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    await new Promise((resolve, reject) => {
      video.addEventListener("loadedmetadata", resolve, { once: true });
      video.addEventListener("error", reject, { once: true });
      video.src = src;
      video.load();
    });
    const duration = video.duration;
    let seeking = false;
    let target = 0;
    let progress = 0;

    function paint() {
      clear();
      if (video.videoWidth) drawCover(video, video.videoWidth, video.videoHeight, 1);
    }
    window.__heroRedraw = paint;

    function seek(t) {
      target = Math.max(0, Math.min(t, duration - 0.04));
      if (seeking) return;
      seeking = true;
      const done = () => {
        video.removeEventListener("seeked", done);
        paint();
        seeking = false;
        if (Math.abs(video.currentTime - target) > 0.02) seek(target);
      };
      video.addEventListener("seeked", done);
      try {
        video.currentTime = target;
      } catch (_) {
        seeking = false;
      }
    }

    setStatus("");
    seek(0);
    onScroll((p) => {
      progress = p;
      seek(p * duration);
    });
  }

  initSequence().catch(async (err) => {
    console.warn(err);
    try {
      await initVideoFallback();
    } catch (_) {
      setStatus("Нет кадров. Проверь assets/hero-seq/raw/01.png … 65.png");
    }
  });
})();
