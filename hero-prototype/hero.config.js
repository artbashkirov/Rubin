/**
 * Hero — 65-frame sequence.
 * После optimize-frames.py кадры в webp/ как frame-0001.webp …
 * Пока webp нет — плеер возьмёт raw/01.png … 65.png
 */
window.HERO_SEQ = {
  preferSequence: true,

  // сжатая секвенция (после optimize-frames.py)
  dir: "../assets/hero-seq/webp/",
  prefix: "frame-",
  ext: "webp",
  pad: 4,
  count: 65,

  // фолбэк на сырые PNG, если webp ещё нет
  rawDir: "../assets/hero-seq/raw/",
  rawPrefix: "",
  rawExt: "png",
  rawPad: 2,

  // Короткая пауза на кадре 65, потом отпускаем pin
  endHold: 0.08,

  // Только острый старт; финал = frame-0065 из секвенции (без оверлея — иначе ghost)
  firstHiRes: "../assets/landing/Frame 16@2x.png",
  lastHiRes: null,
  firstHold: 0.06,
  firstFade: 0.12,
  lastFade: 1,
  lastHold: 1,

  video: "../assets/landing/hero-v1.mp4",
  videoFallbacks: [],

  stageWidth: 1728,
  stageHeight: 1000,
};
