(() => {
  const CFG = window.HERO_SEQ;

  const pin = document.querySelector(".hero-pin");
  const canvas = document.querySelector(".hero-canvas");
  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  const status = document.querySelector(".hero-status");

  // ≤950 (как в hero.css): статичный первый кадр — без лупа, секвенции и распада, их файлы не грузим
  const mobileQuery = window.matchMedia("(max-width: 950px)");
  const MOBILE = mobileQuery.matches;
  // режим выбирается при загрузке — при переходе через брейкпоинт (поворот планшета, ресайз окна) перезагружаемся
  mobileQuery.addEventListener("change", () => window.location.reload());

  let viewW = 0;
  let viewH = 0;
  let dpr = 1;

  // :root zoom (шире 1728): layout в CSS-px артборда, scrollY/innerHeight — в px окна
  function pageZoom() {
    return parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
  }

  function fitCanvas() {
    viewW = pin.clientWidth;
    viewH = pin.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2) * pageZoom();
    canvas.width = Math.max(1, Math.round(viewW * dpr));
    canvas.height = Math.max(1, Math.round(viewH * dpr));
    canvas.style.width = `${viewW}px`;
    canvas.style.height = `${viewH}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    if (explode) explode.layout(viewW, viewH);
  }

  const EX = MOBILE ? null : CFG.explode || null;
  let flash = null;
  if (EX) {
    flash = document.createElement("div");
    flash.className = "page-flash";
    flash.setAttribute("aria-hidden", "true");
    document.body.appendChild(flash);
  }
  const explode =
    EX && EX.mode !== "video" && window.HeroExplode
      ? window.HeroExplode.create({ pin, flash, cfg: EX, stageW: CFG.stageWidth, stageH: CFG.stageHeight })
      : null;

  fitCanvas();
  window.addEventListener("resize", () => {
    fitCanvas();
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

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(src));
      img.src = src;
    });
  }

  function fileNumber(arrayIndex) {
    return (CFG.startIndex ?? 1) + arrayIndex;
  }

  function pathWebp(arrayIndex) {
    return `${CFG.dir}${CFG.prefix}${String(fileNumber(arrayIndex)).padStart(CFG.pad, "0")}.${CFG.ext}`;
  }

  function pathRaw(arrayIndex) {
    const pad = CFG.rawPad ?? 2;
    const prefix = CFG.rawPrefix ?? "";
    const ext = CFG.rawExt ?? "png";
    return `${CFG.rawDir}${prefix}${String(fileNumber(arrayIndex)).padStart(pad, "0")}.${ext}`;
  }

  async function resolveMode() {
    try {
      await loadImage(pathWebp(0));
      return { mode: "webp", pathFn: pathWebp };
    } catch (_) {}
    try {
      await loadImage(pathRaw(0));
      return { mode: "raw", pathFn: pathRaw };
    } catch (_) {}
    throw new Error("no sequence");
  }

  /** Грузит кадры сразу в общий массив — скролл работает по мере загрузки, не ждёт все 144. */
  async function preloadInto(frames, pathFn, count, onProgress) {
    const queue = [];
    for (let i = 0; i < count; i++) queue.push(i);
    let loaded = frames.filter(Boolean).length;
    const failed = [];

    async function loadOne(arrayIndex) {
      const src = pathFn(arrayIndex);
      try {
        frames[arrayIndex] = await loadImage(src);
      } catch (_) {
        try {
          frames[arrayIndex] = await loadImage(`${src}${src.includes("?") ? "&" : "?"}r=1`);
        } catch (err) {
          failed.push(fileNumber(arrayIndex));
          console.warn("[hero] frame fail", fileNumber(arrayIndex), err);
          return;
        }
      }
      loaded += 1;
      if (onProgress) onProgress(loaded, count, arrayIndex);
    }

    async function worker() {
      while (queue.length) {
        await loadOne(queue.shift());
      }
    }

    await Promise.all([worker(), worker(), worker(), worker(), worker(), worker(), worker(), worker()]);
    if (failed.length > count * 0.1) {
      throw new Error(`frames failed: ${failed.slice(0, 8).join(",")}… (${failed.length})`);
    }
    return { loaded, failed };
  }

  function tryLoadIdleVideo(src) {
    if (!src) return Promise.resolve(null);
    return new Promise((resolve) => {
      const v = document.createElement("video");
      v.muted = true;
      v.defaultMuted = true;
      v.volume = 0;
      v.playsInline = true;
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      v.setAttribute("webkit-playsinline", "");
      v.preload = "auto";
      v.loop = true;
      v.autoplay = true;
      let done = false;
      const finish = (val) => {
        if (done) return;
        done = true;
        resolve(val);
      };
      v.addEventListener(
        "error",
        () => {
          console.warn("[hero] idle video error", src, v.error);
          finish(null);
        },
        { once: true }
      );
      const ok = () => {
        if (v.videoWidth) finish(v);
      };
      v.addEventListener("loadeddata", ok);
      v.addEventListener("canplay", ok);
      v.addEventListener("canplaythrough", ok, { once: true });
      setTimeout(() => {
        if (v.videoWidth) finish(v);
        else {
          console.warn("[hero] idle video timeout", src);
          finish(null);
        }
      }, 8000);
      // absolute from site root avoids path issues with query strings
      const abs = src.startsWith("http") || src.startsWith("/")
        ? src
        : new URL(src, window.location.href).href;
      v.src = abs;
      v.load();
    });
  }

  async function initSequence() {
    const { mode, pathFn } = await resolveMode();
    const count = CFG.count;
    const seqStartIdx = CFG.reverse ? count - 1 : 0;

    // Сразу постер (мастер), не ждём 144 кадра — иначе чёрный экран
    setStatus("");
    let frames = new Array(count);
    const startFrame = await loadImage(pathFn(seqStartIdx));
    frames[seqStartIdx] = startFrame;
    clear();
    drawCover(startFrame, startFrame.naturalWidth, startFrame.naturalHeight, 1);

    if (MOBILE) {
      window.__heroRedraw = () => {
        clear();
        drawCover(startFrame, startFrame.naturalWidth, startFrame.naturalHeight, 1);
      };
      console.info("[hero] mobile — static first frame");
      return;
    }

    const idleVideo = await tryLoadIdleVideo(CFG.idleVideo);

    let scrollProgress = 0;
    let phase = idleVideo ? "idle" : "sequence";
    let rafId = 0;
    let lastSeqIndex = -1;
    let framesReady = false;
    /** Скроллнул во время idle — доигрываем текущий цикл лупа, потом sequence. */
    let pendingSequence = false;
    /** После возврата в idle игнорим инерцию скролла. */
    let idleGestureGateUntil = 0;
    let idlePrevTime = 0;
    /** Разрешить возврат в idle только после того, как ушли вглубь секвенции. */
    let allowIdleReenter = false;
    const exitAt = CFG.idleExitAt ?? 0.001;
    const reenterAt = CFG.idleReenterAt ?? 0.01;
    /** Распад стартует, когда скролл доходит до последнего кадра (начало endHold). */
    const explodeAt = 1 - (CFG.endHold ?? 0);
    let prevProgress = 0;
    let explodeLockY = 0;
    /** Обратный проход из section 2: последний кадр без затухания — разворот назад, как только ушла section 2. */
    let returning = false;
    /** Повторный распад вниз — только если на обратном проходе реально ушли в секвенцию. */
    let explodeArmed = true;
    const rearmAt = explodeAt - 0.06;
    /**
     * Кадр ведём от точки разворота скролла: вниз — к последнему кадру к explodeAt (тот же запас под инерцию,
     * что и в первом проходе), вверх — к первому кадру к началу. С самого верха это ровно p / explodeAt.
     */
    let seqF = 0;
    let seqDir = 1;
    let anchorP = 0;
    let anchorF = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const explodeImageReady = explode
      ? Promise.all(
          [EX.image, EX.rest].filter(Boolean).map((src) =>
            loadImage(src)
              .then((img) => (img.decode ? img.decode().catch(() => {}) : null))
              .catch((err) => console.warn("[hero] explode image", src, err))
          )
        )
      : Promise.resolve();
    let explodeVideo = null;
    if (EX && EX.mode === "video") {
      explodeVideo = document.createElement("video");
      explodeVideo.muted = true;
      explodeVideo.playsInline = true;
      explodeVideo.setAttribute("muted", "");
      explodeVideo.setAttribute("playsinline", "");
      explodeVideo.preload = "auto";
      explodeVideo.src = EX.video;
    }

    function resetSeq(p, f, dir) {
      seqF = f;
      seqDir = dir;
      anchorP = p;
      anchorF = f;
    }

    function updateSeqFrame(p) {
      const d = p > scrollProgress ? 1 : p < scrollProgress ? -1 : 0;
      if (d && d !== seqDir) resetSeq(scrollProgress, seqF, d);
      const down = seqDir > 0;
      const toP = down ? (returning && !explodeArmed ? 1 : explodeAt) : 0;
      const toF = down ? count - 1 : 0;
      const span = toP - anchorP;
      const k = span === 0 ? 1 : Math.min(1, Math.max(0, (p - anchorP) / span));
      seqF = anchorF + (toF - anchorF) * k;
    }

    function frameIndex() {
      const forward = Math.round(seqF);
      return CFG.reverse ? count - 1 - forward : forward;
    }

    function nearestFrame(idx) {
      if (frames[idx]) return { frame: frames[idx], idx };
      for (let d = 1; d < count; d++) {
        if (idx - d >= 0 && frames[idx - d]) return { frame: frames[idx - d], idx: idx - d };
        if (idx + d < count && frames[idx + d]) return { frame: frames[idx + d], idx: idx + d };
      }
      return { frame: startFrame, idx: seqStartIdx };
    }

    function paintSequence() {
      clear();
      const want = frameIndex();
      const { frame, idx } = nearestFrame(want);
      if (frame) {
        drawCover(frame, frame.naturalWidth, frame.naturalHeight, 1);
        lastSeqIndex = idx;
      }
    }

    function paintIdleVideo() {
      if (phase !== "idle") return;
      clear();
      if (idleVideo && idleVideo.videoWidth) {
        drawCover(idleVideo, idleVideo.videoWidth, idleVideo.videoHeight, 1);
      } else if (startFrame) {
        drawCover(startFrame, startFrame.naturalWidth, startFrame.naturalHeight, 1);
      }
    }

    function stopRaf() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    function ensureIdlePlaying() {
      if (!idleVideo || phase !== "idle") return;
      idleVideo.loop = true;
      idleVideo.muted = true;
      if (idleVideo.paused) {
        const play = idleVideo.play();
        if (play && typeof play.catch === "function") {
          play.catch((err) => console.warn("[hero] idle play blocked", err));
        }
      }
    }

    function tickIdle() {
      if (phase !== "idle") {
        stopRaf();
        return;
      }
      ensureIdlePlaying();
      paintIdleVideo();
      rafId = requestAnimationFrame(tickIdle);
    }

    function lockScrollTop() {
      if (window.scrollY !== 0) window.scrollTo(0, 0);
      scrollProgress = 0;
      resetSeq(0, 0, 1);
      applyEndFade(0);
      applyCopyFade(0);
    }

    function enterSequence() {
      const wasIdle = phase === "idle" || pendingSequence;
      pendingSequence = false;
      allowIdleReenter = false;
      returning = false;
      explodeArmed = true;
      phase = "sequence";
      stopRaf();
      setStatus("");
      if (idleVideo) {
        try {
          idleVideo.pause();
          idleVideo.currentTime = 0;
        } catch (_) {}
      }
      // разворот с начала — скролл за время доигрыша лупа не учитываем
      window.scrollTo(0, 0);
      scrollProgress = 0;
      prevProgress = 0;
      resetSeq(0, 0, 1);
      applyEndFade(0);
      applyCopyFade(0);
      paintSequence();
      if (wasIdle) console.info("[hero] sequence start @ frame", lastSeqIndex);
    }

    function enterIdle() {
      if (!idleVideo) {
        enterSequence();
        return;
      }
      pendingSequence = false;
      allowIdleReenter = false;
      returning = false;
      explodeArmed = true;
      // длинный gate: инерция trackpad иначе снова заказывает sequence
      idleGestureGateUntil = performance.now() + 1600;
      phase = "idle";
      lastSeqIndex = -1;
      idlePrevTime = 0;
      lockScrollTop();
      idleVideo.muted = true;
      idleVideo.defaultMuted = true;
      idleVideo.loop = true;
      const kick = () => {
        if (phase !== "idle") return;
        ensureIdlePlaying();
      };
      try {
        idleVideo.pause();
        idleVideo.currentTime = 0;
      } catch (_) {}
      idleVideo.addEventListener("seeked", kick, { once: true });
      idleVideo.addEventListener("canplay", kick, { once: true });
      kick();
      paintIdleVideo();
      tickIdle();
      console.info("[hero] idle loop", idleVideo.videoWidth, idleVideo.videoHeight);
    }

    function finishIdleAndEnterSequence() {
      if (phase !== "idle" || !pendingSequence) return;
      enterSequence();
    }

    /**
     * Жест скролла в idle: НЕ выключаем video.loop (иначе после возврата наверх
     * луп отыгрывает 1 раз и становится статикой). Ждём wrap цикла, потом sequence.
     */
    function requestSequenceAfterLoop() {
      if (!idleVideo || phase !== "idle") return;
      if (performance.now() < idleGestureGateUntil) return;
      if (pendingSequence) return;
      pendingSequence = true;
      idlePrevTime = idleVideo.currentTime || 0;
      lockScrollTop();
      ensureIdlePlaying();
      console.info(
        "[hero] pending sequence — wait loop wrap",
        idlePrevTime.toFixed(2),
        "/",
        (idleVideo.duration || 0).toFixed(2)
      );
    }

    if (idleVideo) {
      idleVideo.loop = true;
      idleVideo.addEventListener("timeupdate", () => {
        if (phase !== "idle") {
          idlePrevTime = idleVideo.currentTime || 0;
          return;
        }
        const t = idleVideo.currentTime || 0;
        const dur = idleVideo.duration || 0;
        // доиграли цикл после заказа sequence → в разворот
        if (pendingSequence && dur > 0 && idlePrevTime > dur * 0.55 && t < Math.min(0.5, dur * 0.2)) {
          finishIdleAndEnterSequence();
          idlePrevTime = t;
          return;
        }
        idlePrevTime = t;
      });
    }

    function applyEndFade(p) {
      if (returning) {
        pin.style.setProperty("--hero-end-fade", "1");
        return;
      }
      if (!CFG.endFade) {
        pin.style.removeProperty("--hero-end-fade");
        return;
      }
      const hold = CFG.endHold ?? 0;
      if (hold <= 0) {
        pin.style.setProperty("--hero-end-fade", "1");
        return;
      }
      const start = 1 - hold;
      const opacity = p <= start ? 1 : Math.max(0, 1 - (p - start) / hold);
      pin.style.setProperty("--hero-end-fade", String(opacity));
    }

    /** Fade заголовка в начале разворота (по номерам кадров). */
    function applyCopyFade() {
      const from = CFG.copyFadeFrom;
      const to = CFG.copyFadeTo;
      if (from == null || to == null || to <= from) {
        pin.style.setProperty("--hero-copy-fade", "1");
        return;
      }
      const frame = (CFG.startIndex ?? 0) + seqF;
      let opacity = 1;
      if (frame <= from) opacity = 1;
      else if (frame >= to) opacity = 0;
      else opacity = 1 - (frame - from) / (to - from);
      pin.style.setProperty("--hero-copy-fade", String(Math.max(0, Math.min(1, opacity))));
    }

    function explodeLive() {
      return explodeImageReady.then(() => {
        const duration = reducedMotion ? 0.01 : EX.duration;
        const run = explode.play(duration);
        // кадр 116 держим под распадом, пока тот проявляется; дальше гасим — иначе он виден по краям наклона и в дырах
        const fadeMs = ((EX.fadeIn ?? 0) / (EX.duration || 1)) * duration * 1000;
        if (fadeMs > 0) setTimeout(() => phase === "explode" && clear(), fadeMs + 34);
        else clear();
        return run;
      });
    }

    function explodeFromVideo() {
      const v = explodeVideo;
      return new Promise((resolve) => {
        let raf = 0;
        let finished = false;
        const done = () => {
          if (finished) return;
          finished = true;
          cancelAnimationFrame(raf);
          flash.style.opacity = "1";
          resolve();
        };
        const tick = () => {
          if (v.videoWidth) {
            clear();
            drawCover(v, v.videoWidth, v.videoHeight, 1);
          }
          // ролик может не заканчиваться белым — добеливаем последние 0.4 с
          const left = (v.duration || EX.duration) - v.currentTime;
          flash.style.opacity = String(Math.pow(Math.min(1, Math.max(0, 1 - left / 0.4)), 2));
          if (v.ended) {
            done();
            return;
          }
          raf = requestAnimationFrame(tick);
        };
        v.addEventListener("error", done, { once: true });
        setTimeout(done, ((v.duration || EX.duration) + 4) * 1000);
        try {
          v.currentTime = 0;
        } catch (_) {}
        const play = v.play();
        if (play && typeof play.catch === "function") play.catch(done);
        raf = requestAnimationFrame(tick);
      });
    }

    function fadeFlashOut() {
      const dur = (EX.whiteOut ?? 0.6) * 1000;
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        flash.style.opacity = String(Math.pow(1 - k, 3));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    function finishExplode() {
      if (explode) explode.reset();
      phase = "sequence";
      prevProgress = 1;
      scrollProgress = 1;
      returning = true;
      explodeArmed = false;
      resetSeq(1, count - 1, 1);
      const next = document.querySelector(".showcase");
      if (next) window.scrollTo(0, next.offsetTop * pageZoom());
      onProgress(nativeProgress());
      fadeFlashOut();
      console.info("[hero] explode done → section 2");
    }

    function startExplode() {
      phase = "explode";
      returning = false;
      explodeLockY = Math.min(window.scrollY, heroEndY());
      if (Math.abs(window.scrollY - explodeLockY) > 1) window.scrollTo(0, explodeLockY);
      scrollProgress = explodeAt;
      seqF = count - 1;
      pin.style.setProperty("--hero-end-fade", "1");
      paintSequence();
      const run = explodeVideo ? explodeFromVideo() : explode ? explodeLive() : Promise.resolve();
      run.then(finishExplode);
      console.info("[hero] explode start", EX.mode);
    }

    function onProgress(p) {
      // пока idle (в т.ч. доигрыш лупа) — секвенцию не скраббим
      if (phase === "idle") {
        lockScrollTop();
        return;
      }

      if (phase === "explode") {
        if (Math.abs(window.scrollY - explodeLockY) > 1) window.scrollTo(0, explodeLockY);
        return;
      }

      // только при движении вниз через последний кадр и когда он уже загружен
      if (returning && p < rearmAt) explodeArmed = true;
      const crossed = EX && explodeArmed && prevProgress < explodeAt && p >= explodeAt && frames[count - 1];
      prevProgress = p;
      if (crossed) {
        startExplode();
        return;
      }

      updateSeqFrame(p);
      scrollProgress = p;
      if (p >= 1 && !returning) {
        returning = true;
        explodeArmed = false;
        resetSeq(1, seqF, 1);
      }
      applyEndFade(p);
      applyCopyFade();

      // возврат в луп только после того, как реально ушли в разворот и вернулись наверх
      if (p > reenterAt + 0.02) allowIdleReenter = true;
      if (idleVideo && allowIdleReenter && p <= reenterAt) {
        enterIdle();
        return;
      }

      paintSequence();
    }

    /** В idle жесты скролла не двигают страницу — только заказывают переход после лупа. */
    function onIdleScrollGesture(e) {
      if (phase === "explode") {
        if (e && e.cancelable) e.preventDefault();
        return;
      }
      if (phase !== "idle") return;
      if (e && typeof e.preventDefault === "function") e.preventDefault();
      lockScrollTop();
      if (performance.now() < idleGestureGateUntil) return;
      requestSequenceAfterLoop();
    }

    window.__heroRedraw = () => {
      if (phase === "sequence") paintSequence();
      else paintIdleVideo();
    };

    // Idle сразу; секвенцию догружаем в фоне
    if (idleVideo) {
      enterIdle();
      console.info("[hero] idle playing; preloading sequence in background");
    } else {
      phase = "sequence";
      paintSequence();
      console.info("[hero] no idle — poster + sequence preload");
    }

    setStatus("Загрузка разворота…");
    preloadInto(frames, pathFn, count, (loaded, total) => {
      if (loaded === 1 || loaded % 24 === 0 || loaded === total) {
        setStatus(loaded < total ? `Загрузка разворота… ${loaded}/${total}` : "");
      }
      if (phase === "sequence") paintSequence();
    })
      .then(({ loaded, failed }) => {
        framesReady = true;
        setStatus("");
        console.info(`[hero] sequence ready (${mode}, ${loaded}/${count}, fail=${failed.length})`);
        if (phase === "sequence") paintSequence();
      })
      .catch((err) => {
        console.warn("[hero] sequence preload failed", err);
        setStatus("Ошибка загрузки кадров");
      });

    function heroRange() {
      const el = document.querySelector(".hero-scroll");
      if (!el) return null;
      const z = pageZoom();
      return { top: el.offsetTop * z, range: Math.max(1, el.offsetHeight * z - window.innerHeight) };
    }

    function heroEndY() {
      const r = heroRange();
      return r ? r.top + r.range : window.scrollY;
    }

    function nativeProgress() {
      const r = heroRange();
      if (!r) return 0;
      return Math.min(1, Math.max(0, (window.scrollY - r.top) / r.range));
    }

    function bindScrollScrub() {
      const onScroll = () => {
        if (phase === "idle") {
          lockScrollTop();
          return;
        }
        onProgress(nativeProgress());
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      onScroll();
    }

    bindScrollScrub();

    window.__heroDebug = () => ({
      phase,
      pendingSequence,
      idleGateMs: Math.max(0, idleGestureGateUntil - performance.now()),
      allowIdleReenter,
      returning,
      explodeArmed,
      seqF,
      scrollProgress,
      lastSeqIndex,
      framesReady,
      loaded: frames.filter(Boolean).length,
      count,
      idleT: idleVideo ? idleVideo.currentTime : null,
      idlePaused: idleVideo ? idleVideo.paused : null,
      idleLoop: idleVideo ? idleVideo.loop : null,
      gsap: typeof window.gsap,
      zoom: pageZoom(),
      explodeMode: EX ? EX.mode : null,
    });

    window.__heroExplode = {
      start: () => phase === "sequence" && startExplode(),
      seek: (t) => {
        if (!explode) return;
        clear();
        explode.seek(t);
      },
      reset: () => {
        if (explode) explode.reset();
        flash.style.opacity = "0";
        if (phase === "sequence") paintSequence();
      },
    };

    // passive:false — чтобы preventDefault держал страницу на месте, пока идёт idle/доигрыш
    window.addEventListener("wheel", onIdleScrollGesture, { passive: false });
    window.addEventListener("touchmove", onIdleScrollGesture, { passive: false });
    window.addEventListener(
      "keydown",
      (e) => {
        if (!["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Spacebar"].includes(e.key)) {
          return;
        }
        onIdleScrollGesture(e);
      },
      { passive: false }
    );

    console.info(`[hero] boot ${mode}, reverse=${!!CFG.reverse}, idle=${!!idleVideo}, framesReady=${framesReady}`);
  }

  initSequence().catch((err) => {
    console.warn(err);
    setStatus("Нет кадров. Проверь assets/hero-seq/webp/");
  });

  const featureVideos = [...document.querySelectorAll(".feature__media video")];
  if (featureVideos.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const featureObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.play().catch(() => {});
          else entry.target.pause();
        }
      },
      { threshold: 0.25 }
    );
    featureVideos.forEach((video) => featureObserver.observe(video));
  }

  document.querySelectorAll(".roll__label").forEach((label) => {
    const chars = [...label.textContent.trim()];
    label.textContent = "";
    chars.forEach((ch, i) => {
      if (ch === " ") {
        label.append(Object.assign(document.createElement("span"), { className: "roll__space", textContent: " " }));
        return;
      }
      const cell = document.createElement("span");
      cell.className = "roll__char";
      const track = document.createElement("span");
      track.className = "roll__track";
      track.style.setProperty("--i", i);
      for (let k = 0; k < 2; k++) track.append(Object.assign(document.createElement("span"), { textContent: ch }));
      cell.append(track);
      label.append(cell);
    });
  });
})();
