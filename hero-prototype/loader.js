(() => {
  const MIN_MS = 2300;
  const started = performance.now();
  const el = document.querySelector(".site-loader");
  if (!el) return;

  document.body.classList.add("is-booting");

  let framesReady = false;
  let painted = false;
  let startedReveal = false;

  function revealSite() {
    if (startedReveal) return;
    startedReveal = true;

    const run = () => {
      const gsap = window.gsap;
      if (!gsap) {
        el.classList.add("is-done");
        document.body.classList.remove("is-booting");
        document.body.classList.add("is-revealed");
        setTimeout(() => el.remove(), 500);
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power2.out", duration: 0.38 },
        onComplete: () => {
          document.body.classList.remove("is-booting");
          document.body.classList.add("is-revealed");
          el.remove();
        },
      });

      // 1) Сначала полностью убираем лоадер
      tl.to(el, { opacity: 0, duration: 0.4, ease: "power1.out" }, 0);
      tl.set(el, { visibility: "hidden", pointerEvents: "none" });

      // 2) Только после этого — staggered fade контента (без наложений)
      const t0 = 0.42;

      tl.fromTo(
        ".hero-canvas",
        { opacity: 0 },
        { opacity: 1, duration: 0.45 },
        t0
      );
      tl.fromTo(
        ".stage__scrim",
        { opacity: 0 },
        { opacity: 1, duration: 0.4 },
        t0 + 0.06
      );

      tl.fromTo(
        ".nav__logo",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.36 },
        t0 + 0.12
      );
      tl.fromTo(
        ".nav__mid a",
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.32, stagger: 0.045 },
        t0 + 0.18
      );
      tl.fromTo(
        ".nav__cta",
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.34 },
        t0 + 0.38
      );

      tl.fromTo(
        ".copy h1",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.42 },
        t0 + 0.44
      );
      tl.fromTo(
        ".copy p",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4 },
        t0 + 0.56
      );

      tl.fromTo(
        ".after",
        { opacity: 0 },
        { opacity: 1, duration: 0.35 },
        t0 + 0.68
      );
    };

    if (window.gsap) run();
    else setTimeout(run, 50);
  }

  function tryHide() {
    if (!framesReady || !painted) return;
    const wait = Math.max(0, MIN_MS - (performance.now() - started));
    setTimeout(revealSite, wait);
  }

  window.__rubinLoaderReady = () => {
    framesReady = true;
    painted = true;
    tryHide();
  };

  window.addEventListener("load", () => {
    setTimeout(() => {
      if (!startedReveal) {
        framesReady = true;
        painted = true;
        tryHide();
      }
    }, MIN_MS + 400);
  });
})();
