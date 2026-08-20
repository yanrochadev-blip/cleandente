/* ============================================================
   Cleandente RJ — Landing page interactions
   GSAP + ScrollTrigger + Lenis + SplitType
   ============================================================ */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const isCoarsePointer = window.matchMedia(
    "(hover: none), (pointer: coarse)"
  ).matches;

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  }

  if (!prefersReducedMotion && typeof gsap !== "undefined") {
    gsap.config({ force3D: true });
  }

  /* ----------------------------------------------------------
     Smooth Scrolling com Lenis (Inércia / Peso)
     ---------------------------------------------------------- */
  const lenis = new Lenis({
    lerp: 0.07,
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0, 0);

  /* ----------------------------------------------------------
     Navegação suave para links internos
     ---------------------------------------------------------- */
  const smoothScroll = (target) => {
    const el =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;

    if (!lenis) {
      el.scrollIntoView({ behavior: "auto" });
      return;
    }
    lenis.scrollTo(el, { offset: -74, duration: 1.15 });
  };

  document.querySelectorAll("[data-scroll-link]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      e.preventDefault();
      closeMenu();
      smoothScroll(href);
    });
  });

  /* ----------------------------------------------------------
     Navbar state (Pílula Flutuante imediata) + scroll progress
     ---------------------------------------------------------- */
  const navbar = document.getElementById("navbar");
  const progressBar = document.querySelector(".scroll-progress");

  const onScrollNav = () => {
    if(navbar) {
      navbar.classList.toggle("is-scrolled", window.scrollY > 15);
    }
  };
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  if(progressBar) {
    gsap.to(progressBar, {
      width: "100%",
      ease: "none",
      scrollTrigger: {
        start: 0,
        end: "max",
        scrub: 0.4,
        onUpdate: (self) => {
          progressBar.style.width = self.progress * 100 + "%";
        },
      },
    });
  }

  /* ----------------------------------------------------------
     Mobile menu
     ---------------------------------------------------------- */
  const burger = document.getElementById("nav-burger");
  const mobileMenu = document.getElementById("mobile-menu");

  const closeMenu = () => {
    if(burger && mobileMenu) {
      burger.setAttribute("aria-expanded", "false");
      mobileMenu.classList.remove("is-open");
      document.body.style.overflow = "";
    }
  };

  if(burger) {
    burger.addEventListener("click", () => {
      const isOpen = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!isOpen));
      mobileMenu.classList.toggle("is-open", !isOpen);
      document.body.style.overflow = isOpen ? "" : "hidden";
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeMenu();
  });

  /* ----------------------------------------------------------
     Text Reveal on Scroll (O Texto que se escreve - Corrigido Mobile/PC)
     ---------------------------------------------------------- */
  function initTextReveal() {
    if (typeof SplitType === 'undefined' || typeof gsap === 'undefined') return;

    // Mapeamento completo: pegando TODAS as classes de texto do site
    const textElements = document.querySelectorAll(`
      [data-text-reveal],
      .section-title, .section-sub, .section-eyebrow, 
      .contact-title, .contact-sub, .contact-eyebrow,
      .ng-title, .ng-subtitle, .ng-vision-title, .ng-vision-desc,
      .cta-title, .cta-sub, .gallery-title,
      .team-name, .team-cro, .team-bio p,
      .benefit-num, .benefit-item h4, .benefit-item p,
      .smile-step h4, .smile-step p
    `);

    // Usa matchMedia para regras diferentes no PC e no Celular
    let mm = gsap.matchMedia();

    textElements.forEach((el) => {
      const split = new SplitType(el, { types: 'words, chars' });

      // REGRA PARA DESKTOP (PC) - Entrada e saída animada
      mm.add("(min-width: 993px)", () => {
        gsap.from(split.chars, {
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            end: "bottom 10%",
            toggleActions: "play reverse play reverse"
          },
          y: 20,
          opacity: 0,
          duration: 0.3,
          stagger: 0.02,
          ease: "power2.out"
        });
      });

      // REGRA PARA MOBILE (Celular) - Apenas Entrada, sem sumir
      mm.add("(max-width: 992px)", () => {
        gsap.from(split.chars, {
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none" 
          },
          y: 20,
          opacity: 0,
          duration: 0.3,
          stagger: 0.02,
          ease: "power2.out"
        });
      });
    });
  }

  /* ----------------------------------------------------------
     Counter utility
     ---------------------------------------------------------- */
  function countUp(el) {
    const target = parseFloat(el.dataset.counter);
    const decimals = String(el.dataset.counter).includes(".")
      ? String(el.dataset.counter).split(".")[1].length
      : 0;
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";

    const format = (val) =>
      prefix + val.toFixed(decimals).replace(".", ",") + suffix;

    const obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => (el.textContent = format(obj.v)),
    });
  }

  function initCounters() {
    document.querySelectorAll("[data-counter]").forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: () => countUp(el),
      });
    });
  }

  /* ----------------------------------------------------------
     Hero entrance
     ---------------------------------------------------------- */
  if (!prefersReducedMotion && typeof gsap !== 'undefined') {
    const heroElements = gsap.utils.toArray("[data-hero-fade]");
    gsap.set(heroElements, { opacity: 0, y: 30, filter: "blur(6px)" });
    gsap.to(heroElements, {
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      duration: 1.2, 
      stagger: 0.15, 
      ease: "power3.out", 
      delay: 0.2,
      onComplete: () => gsap.set(heroElements, { clearProps: "filter" }),
    });
  }

  /* ----------------------------------------------------------
     Reveal helper
     ---------------------------------------------------------- */
  function createReveal() {
    if (prefersReducedMotion || typeof gsap === 'undefined') return;

    const revealGroups = gsap.utils.toArray(".reveal-group");
    revealGroups.forEach((group) => {
      const children = Array.from(group.children).filter((el) => !el.hasAttribute("data-text-reveal"));
      gsap.set(children, { opacity: 0, y: 40, filter: "blur(6px)" });
      gsap.to(children, {
        opacity: 1, y: 0, filter: "blur(0px)", duration: 1, stagger: 0.14, ease: "power3.out",
        scrollTrigger: { trigger: group, start: "top 82%", toggleActions: "play none none none" },
        onComplete: () => gsap.set(children, { clearProps: "filter" }),
      });
    });

    gsap.utils.toArray(".reveal").forEach((el) => {
      gsap.from(el, {
        opacity: 0, y: 60, scale: 0.96, filter: "blur(6px)", duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
        onComplete: () => gsap.set(el, { clearProps: "filter" }),
      });
    });
  }

  /* ----------------------------------------------------------
     Showcase de Tratamentos
     ---------------------------------------------------------- */
  function initServicesShowcase() {
    const buttons = document.querySelectorAll('.service-btn');
    const imageEl = document.getElementById('sd-image');
    const titleEl = document.getElementById('sd-title');
    const descEl = document.getElementById('sd-desc');

    if (buttons.length === 0 || !imageEl || typeof gsap === 'undefined') return;

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) return;
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const newImg = btn.getAttribute('data-img');
        const newTitle = btn.getAttribute('data-title');
        const newDesc = btn.getAttribute('data-desc');

        gsap.to([imageEl, titleEl, descEl], {
          opacity: 0,
          y: 10,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            imageEl.src = newImg;
            titleEl.textContent = newTitle;
            descEl.textContent = newDesc;
            gsap.to([imageEl, titleEl, descEl], {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.05,
              ease: "power2.out"
            });
          }
        });
      });
    });
  }

  /* ----------------------------------------------------------
     Como Funciona (Scroll Normal Mobile / Pin e SVG Desktop)
     ---------------------------------------------------------- */
  function initComoFunciona() {
    if (prefersReducedMotion || typeof gsap === 'undefined') return;

    const section = document.querySelector('.como-funciona');
    const progressPath = document.querySelector('.smile-progress-path');
    const steps = gsap.utils.toArray('.smile-step');

    if (!section || !progressPath || steps.length === 0) return;

    const pathLength = progressPath.getTotalLength() || 1650;
    gsap.set(progressPath, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength
    });
    gsap.set(steps, { opacity: 0, scale: 0.8, y: 30 });

    let mm = gsap.matchMedia();

    // REGRA 1: DESKTOP (PC) -> Com trava de Scroll e animação do SVG
    mm.add("(min-width: 993px)", () => {
      const pinTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=2200", 
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true
        }
      });

      pinTl.to(progressPath, { strokeDashoffset: 0, duration: steps.length, ease: "none" }, 0);

      steps.forEach((step, index) => {
        pinTl.to(step, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.5)" }, index * 0.9);
      });
    });

    // REGRA 2: MOBILE (Celular) -> Sem Trava (Scroll flui solto), só aparece os cards
    mm.add("(max-width: 992px)", () => {
      steps.forEach((step) => {
        gsap.to(step, {
          opacity: 1, 
          scale: 1, 
          y: 0, 
          duration: 0.6, 
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: step,
            start: "top 85%", 
            toggleActions: "play none none none"
          }
        });
      });
    });
  }

  /* ----------------------------------------------------------
     Tilt & Magnetic
     ---------------------------------------------------------- */
  function initTilt() {
    if (prefersReducedMotion || isCoarsePointer || typeof gsap === 'undefined') return;
    gsap.utils.toArray("[data-tilt]").forEach((card) => {
      const intensity = 4;
      let tx = 0, ty = 0, rx = 0, ry = 0;
      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        tx = px * intensity * 2; ty = py * intensity * 2; ry = px * intensity; rx = -py * intensity;
      });
      card.addEventListener("pointerleave", () => { tx = 0; ty = 0; rx = 0; ry = 0; });
      gsap.ticker.add(() => {
        gsap.to(card, { x: tx, y: ty, rotateX: rx, rotateY: ry, transformPerspective: 900, duration: 0.6, ease: "power3.out", overwrite: "auto" });
      });
    });
  }

  function initMagnetic() {
    if (prefersReducedMotion || isCoarsePointer || typeof gsap === 'undefined') return;
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 0.15;
      el.addEventListener("pointermove", (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);
        gsap.to(el, { x: relX * strength, y: relY * strength, duration: 0.5, ease: "power3.out" });
      });
      el.addEventListener("pointerleave", () => { gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" }); });
    });
  }

  /* ----------------------------------------------------------
     Custom cursor
     ---------------------------------------------------------- */
  function initCursor() {
    if (prefersReducedMotion || isCoarsePointer || typeof gsap === 'undefined') return;
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if(!dot || !ring) return;
    
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    document.addEventListener("pointermove", (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
      gsap.to(dot, { opacity: 1, duration: 0.3 });
      gsap.to(ring, { opacity: 1, duration: 0.3 });
    });
    gsap.ticker.add(() => {
      ringX += (mouseX - 20 - ringX) * 0.16;
      ringY += (mouseY - 20 - ringY) * 0.16;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    });
    const interactive = "a, button, [data-magnetic], .service-card, .timeline-step, .gallery-item";
    document.querySelectorAll(interactive).forEach((el) => {
      el.addEventListener("pointerenter", () => ring.classList.add("is-active"));
      el.addEventListener("pointerleave", () => ring.classList.remove("is-active"));
    });
    document.addEventListener("pointerleave", () => { gsap.to([dot, ring], { opacity: 0, duration: 0.3 }); });
  }

  /* ============================================================
     LÓGICA DO SLIDER DE PROFISSIONAIS
     ============================================================ */
  document.addEventListener('DOMContentLoaded', () => {
    const btnNext = document.getElementById('team-next-btn');
    if(!btnNext) return;

    const teamData = [
      {
        name: "Dra. Renata Strauss",
        cro: "CRO/RJ 34248",
        img: "fotos/renata.png",
        bio: `
          <p>Formada há 17 anos.</p>
          <p><strong>Especialista</strong> em prótese dentária com <strong>foco em reabilitação oral</strong>.</p>
          <p>Dentística <strong>restauradora e ortodontia</strong>.</p>
          <p><strong>Pós graduada</strong> em DTM e fez residência em HOF.</p>
          <p>Criadora dos melhores sorrisos da Cleandente.</p>
          <p>É esposa do Dr Igor Firmo e mãe da Duda e da Manu. Ama viajar em família.</p>
        `
      },
      {
        name: "Dr. Igor Firmo",
        cro: "CRO/RJ 38355",
        img: "fotos/igor.png",
        bio: `
          <p>Formado há 23 anos pela UFF.</p>
          <p><strong>Especialista</strong> em Implante dentário e Estomatologia.</p>
          <p><strong>Pós graduado</strong> em prótese dentária com foco em <strong>odontologia digital e cirurgia oral</strong>.</p>
          <p><strong>Já transformou mais de 18 mil sorrisos.</strong></p>
          <p>É casado com a Dra Renata Strauss e pai das princesas Duda e Manu. Ama ficar em casa curtindo a família.</p>
        `
      }
    ];

    let currentIndex = 0;
    const mainImg = document.getElementById('team-main-img');
    const nameEl = document.getElementById('team-name');
    const croEl = document.getElementById('team-cro');
    const bioEl = document.getElementById('team-bio');
    const previewImg = document.getElementById('preview-img-1');
    const infoSection = document.getElementById('team-info');

    btnNext.addEventListener('click', () => {
      const nextIndex = (currentIndex + 1) % teamData.length;
      const currentPro = teamData[currentIndex];
      const nextPro = teamData[nextIndex];

      if(typeof gsap !== 'undefined') {
        const tl = gsap.timeline();
        tl.to([mainImg, previewImg, infoSection], {
          y: 10,
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
          onComplete: () => {
            mainImg.src = nextPro.img;
            previewImg.src = currentPro.img; 
            nameEl.innerText = nextPro.name;
            croEl.innerText = nextPro.cro;
            bioEl.innerHTML = nextPro.bio;
            currentIndex = nextIndex;
          }
        })
        .to([mainImg, previewImg, infoSection], {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        });
      }
    });
  });

  /* ============================================================
     SCROLL HORIZONTAL - NOSSOS RESULTADOS
     ============================================================ */
  document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      const horizontalSection = document.querySelector(".resultados-horizontal");
      const track = document.querySelector(".hr-track");

      if (horizontalSection && track) {
        function getScrollAmount() {
          let trackWidth = track.scrollWidth;
          return -(trackWidth - window.innerWidth);
        }
        const tween = gsap.to(track, {
          x: getScrollAmount,
          ease: "none"
        });
        ScrollTrigger.create({
          trigger: horizontalSection,
          start: "center center", 
          end: () => `+=${getScrollAmount() * -1}`, 
          pin: true,
          animation: tween,
          scrub: 1,
          invalidateOnRefresh: true 
        });
      }
    }
  });

  /* ============================================================
     FUNCIONALIDADES MOBILE: SWIPE E TROCA DE ABAS
     ============================================================ */
  document.addEventListener('DOMContentLoaded', () => {
    function handleSwipe(element, onSwipeLeft, onSwipeRight) {
      if (!element) return;
      let touchStartX = 0;
      let touchEndX = 0;

      element.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      element.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 50) onSwipeLeft();
        if (touchEndX > touchStartX + 50) onSwipeRight();
      }, { passive: true });
    }

    const servButtons = document.querySelectorAll('.service-btn');
    const servicesShowcase = document.querySelector('.services-showcase');
    let currentServIndex = 0;

    function swipeService(index) {
      if (index < 0 || index >= servButtons.length) return;
      servButtons[index].click(); // Simula o clique no botão para usar a lógica pronta
      currentServIndex = index;
    }

    // Configura o evento de swipe mantendo o controle do index
    servButtons.forEach((btn, idx) => {
      btn.addEventListener('click', () => { currentServIndex = idx; });
    });

    handleSwipe(servicesShowcase, 
      () => { 
        let nextIdx = (currentServIndex + 1) % servButtons.length;
        swipeService(nextIdx);
      },
      () => { 
        let prevIdx = (currentServIndex - 1 + servButtons.length) % servButtons.length;
        swipeService(prevIdx);
      }
    );

    const teamSlider = document.getElementById('team-slider');
    const btnNextTeam = document.getElementById('team-next-btn');
    
    if (teamSlider && btnNextTeam) {
      handleSwipe(teamSlider, 
        () => btnNextTeam.click(),
        () => btnNextTeam.click() 
      );
    }

    if (window.innerWidth <= 992 && typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      const hints = document.querySelectorAll('.swipe-hint');
      hints.forEach(hint => {
        const parent = hint.parentElement;
        ScrollTrigger.create({
          trigger: parent,
          start: "top 60%",
          onEnter: () => {
            gsap.to(hint, { opacity: 1, duration: 0.5 });
            setTimeout(() => { gsap.to(hint, { opacity: 0, duration: 0.5 }); }, 4000);
          }
        });
        parent.addEventListener('touchstart', () => {
          gsap.to(hint, { opacity: 0, duration: 0.3 });
        }, { once: true });
      });
    }
  });
/* ============================================================
   LÓGICA DO AVISO DE COOKIES
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const cookieBanner = document.getElementById("cookie-banner");
  const acceptBtn = document.getElementById("accept-cookies");

  if (cookieBanner && acceptBtn) {
    // Verifica se o usuário já aceitou antes (salvo no navegador)
    if (!localStorage.getItem("cookiesAccepted")) {
      // Espera 2 segundos após o site carregar para mostrar o aviso
      setTimeout(() => {
        cookieBanner.classList.add("show");
      }, 2000);
    }

    // Quando clica em aceitar, esconde o banner e salva a escolha
    acceptBtn.addEventListener("click", () => {
      localStorage.setItem("cookiesAccepted", "true");
      cookieBanner.classList.remove("show");
    });
  }
});
  /* ----------------------------------------------------------
     Init All
     ---------------------------------------------------------- */
  createReveal();
  initTextReveal(); 
  initComoFunciona();
  initTilt();
  initMagnetic();
  initCursor();
  initCounters();
  initServicesShowcase();

  window.addEventListener('load', () => {
    if(typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  });
})();