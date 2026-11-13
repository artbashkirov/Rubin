/**
 * Hero — 117-frame sequence (frame-0000…0116) + idle loop.
 *
 * Idle: assets/landing/hero-idle.mp4
 *
 * Sequence (chrono file order, reverse:false):
 *   frame-0000 = girl cafe start (scroll start) — master L05
 *   frame-0116 = last scroll frame (approved end)
 * Narrative: cafe orbit → dark → flat UI → explode
 */
window.HERO_SEQ = {
  preferSequence: true,

  dir: "../assets/hero-seq/webp/",
  prefix: "frame-",
  ext: "webp",
  pad: 4,
  /** Первый номер файла и кол-во: frame-0000 … frame-0116 */
  startIndex: 0,
  count: 117,

  rawDir: "../assets/hero-seq/raw/",
  rawPrefix: "",
  rawExt: "jpg",
  rawPad: 2,

  // Idle loop: до скролла — L05 луп; после доигрыша цикла — sequence
  idleVideo: "../assets/landing/hero-idle.mp4?v=idle-user-0d3b",
  idleExitAt: 0.001,
  idleReenterAt: 0.01,

  // Последние N% скролла: hold на exploded + fade в section 2
  endHold: 0.08,
  endFade: true,

  // Конец секвенции (кадр 116): автоплей распада → белый → section 2.
  // mode "live" — 3D-плиты кодом (hero-explode.js); "video" — готовый ролик из video.
  explode: {
    mode: "live",
    video: "../assets/landing/explode/explode.mp4",
    duration: 1.45,
    whiteOut: 0.4,
    image: "../assets/landing/explode/terminal-master@2x.png",
    // мастер с прозрачными дырками на месте кусков
    rest: "../assets/landing/explode/terminal-rest@2x.png",
    // px исходного скриншота terminal-flat-live-raw.png
    source: { w: 3456, h: 2000 },
    // где UI стоит в кадре 116 (px стейджа 1728×972)
    box: { x: 194, y: 110, w: 1339, h: 752 },
    // толщина и скругление кусков (px стейджа), набираются вместе с объёмом
    depth: 10,
    radius: 8,
    // Остальной интерфейс гаснет, разлетаются только 5 кусков (как assets/landing/explode/).
    // rects — [x0, y0, x1, y1] в px исходника (несколько — кусок из частей, летят вместе);
    // z — насколько кусок выходит к камере
    panels: [
      { id: "markets", rects: [[0, 102, 1588, 290]], z: 110 },
      { id: "orders", rects: [[1594, 102, 2176, 1496], [2176, 225, 2816, 1496]], z: 70 },
      { id: "leverage", rects: [[2176, 102, 2816, 225]], z: 150 },
      { id: "tv", rects: [[2816, 0, 3456, 445]], z: 130 },
      { id: "news", rects: [[2816, 445, 3456, 2000]], z: 60 },
    ],
  },

  // Заголовок/подзаголовок (.copy): плавно гаснут в начале разворота
  // (номера файлов frame-NNNN; при startIndex:0)
  copyFadeFrom: 10,
  copyFadeTo: 28,

  firstHiRes: null,
  lastHiRes: null,
  firstHold: 0,
  firstFade: 0,
  lastFade: 1,
  lastHold: 1,

  // файлы уже в порядке рассказа
  reverse: false,

  video: "../assets/landing/hero-v2.mp4",
  videoFallbacks: ["../assets/landing/hero-explode.mp4"],

  stageWidth: 1728,
  stageHeight: 972,
};
