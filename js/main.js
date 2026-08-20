/* ============================================================
   Dra. Ana Araújo — Landing page interactions
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

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  if (!prefersReducedMotion) {
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
    // Transforma o navbar assim que o usuário rola mais de 15px para baixo
    navbar.classList.toggle("is-scrolled", window.scrollY > 15);
  };
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

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

  /* ----------------------------------------------------------
     Mobile menu
     ---------------------------------------------------------- */
  const burger = document.getElementById("nav-burger");
  const mobileMenu = document.getElementById("mobile-menu");

  const closeMenu = () => {
    burger.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  burger.addEventListener("click", () => {
    const isOpen = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!isOpen));
    mobileMenu.classList.toggle("is-open", !isOpen);
    document.body.style.overflow = isOpen ? "" : "hidden";
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeMenu();
  });

  /* ----------------------------------------------------------
     Text Reveal on Scroll (O Texto que se escreve)
     ---------------------------------------------------------- */
  function initTextReveal() {
    if (typeof SplitType === 'undefined') {
      console.warn("Script do SplitType não foi encontrado.");
      return;
    }

    const textReveals = document.querySelectorAll('[data-text-reveal]');

    textReveals.forEach((el) => {
      const text = new SplitType(el, { types: 'words, chars' });

      if(text.chars && text.chars.length > 0) {
        gsap.fromTo(text.chars,
          { opacity: 0.1 },
          {
            opacity: 1,
            stagger: 0.05,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              end: 'top 50%',
              scrub: true,
            }
          }
        );
      }
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
     Hero entrance (Novo Layout - Banner e Card Flutuante)
     ---------------------------------------------------------- */
  if (!prefersReducedMotion) {
    const heroElements = gsap.utils.toArray("[data-hero-fade]");
    
    // Esconde os elementos do grid incialmente
    gsap.set(heroElements, { opacity: 0, y: 30, filter: "blur(6px)" });
    
    // Anima a entrada de cada bloco sequencialmente
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
    if (prefersReducedMotion) return;

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
     Novo Showcase de Tratamentos (Interativo)
     ---------------------------------------------------------- */
  function initServicesShowcase() {
    const buttons = document.querySelectorAll('.service-btn');
    const imageEl = document.getElementById('sd-image');
    const titleEl = document.getElementById('sd-title');
    const descEl = document.getElementById('sd-desc');

    if (buttons.length === 0 || !imageEl) return;

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Se o botão clicado já está ativo, não faz nada
        if (btn.classList.contains('active')) return;

        // 1. Remove a classe 'active' de todos e adiciona no clicado
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 2. Pega as informações contidas no HTML do botão clicado
        const newImg = btn.getAttribute('data-img');
        const newTitle = btn.getAttribute('data-title');
        const newDesc = btn.getAttribute('data-desc');

        // 3. Animação de saída e entrada com GSAP
        gsap.to([imageEl, titleEl, descEl], {
          opacity: 0,
          y: 10,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            // Troca os dados
            imageEl.src = newImg;
            titleEl.textContent = newTitle;
            descEl.textContent = newDesc;
            
            // Traz de volta com animação
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
     Nova Animação Pinned: Como Funciona + SVG Draw
     ---------------------------------------------------------- */
  /* ----------------------------------------------------------
     Nova Animação Pinned: Como Funciona + SVG Draw (Curva U)
     ---------------------------------------------------------- */
  function initComoFunciona() {
    if (prefersReducedMotion) return;

    const section = document.querySelector('.como-funciona');
    const progressPath = document.querySelector('.smile-progress-path');
    const steps = gsap.utils.toArray('.smile-step');

    if (!section || !progressPath || steps.length === 0) return;

    // 1. Esconde a linha do SVG antes de rodar
    // Como a curva não muda de tamanho, o length dela (aprox 1600) é mapeado
    const pathLength = progressPath.getTotalLength() || 1650;
    gsap.set(progressPath, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength
    });

    // Esconde os cards no início
    gsap.set(steps, { opacity: 0, scale: 0.8, y: 30 });

    // 2. Cria o gatilho fixo (Pin) na seção
    const pinTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=2200", // Controla a velocidade (2200px de rolagem necessários)
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true
      }
    });

    // 3. Anima desenhando a linha verde escura
    // (Só roda no desktop onde o SVG existe, graças à validação do display do CSS)
    if (window.innerWidth > 992) {
      pinTl.to(progressPath, {
        strokeDashoffset: 0,
        duration: steps.length,
        ease: "none"
      }, 0);
    } else {
      // Cria um gap vazio pro pin funcionar no celular sem dar erro de draw
      pinTl.to({}, { duration: steps.length }, 0);
    }

    // 4. Anima os cards aparecendo
    steps.forEach((step, index) => {
      pinTl.to(step, {
        opacity: 1, 
        scale: 1, 
        y: 0, 
        duration: 0.6, 
        ease: "back.out(1.5)"
      }, index * 0.9); // O index dita o delay de cada card
    });
  }
  /* ----------------------------------------------------------
     Tilt & Magnetic
     ---------------------------------------------------------- */
  function initTilt() {
    if (prefersReducedMotion || isCoarsePointer) return;
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
    if (prefersReducedMotion || isCoarsePointer) return;
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
    if (prefersReducedMotion || isCoarsePointer) return;
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
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

  // Base de dados dos profissionais
  const teamData = [
    {
      name: "Dra. Renata Strauss",
      cro: "CRO/RJ 34248",
      img: "fotos/renata.png", // Ajustado para .png para bater com seu HTML
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
      img: "fotos/igor.png", // Ajustado para .png para bater com seu HTML
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

  // Elementos do DOM
  const mainImg = document.getElementById('team-main-img');
  const nameEl = document.getElementById('team-name');
  const croEl = document.getElementById('team-cro');
  const bioEl = document.getElementById('team-bio');
  const previewImg = document.getElementById('preview-img-1');
  const infoSection = document.getElementById('team-info');

  btnNext.addEventListener('click', () => {
    // Calcula o próximo index (alternando entre 0 e 1)
    const nextIndex = (currentIndex + 1) % teamData.length;
    const currentPro = teamData[currentIndex];
    const nextPro = teamData[nextIndex];

    // GSAP Timeline para uma animação suave
    const tl = gsap.timeline();

    // 1. Esconde as coisas suavemente indo um pouco pra baixo
    tl.to([mainImg, previewImg, infoSection], {
      y: 10,
      opacity: 0,
      duration: 0.3,
      ease: "power2.inOut",
      onComplete: () => {
        // 2. Troca os conteúdos invisivelmente
        mainImg.src = nextPro.img;
        previewImg.src = currentPro.img; // A foto atual vira o preview!
        
        nameEl.innerText = nextPro.name;
        croEl.innerText = nextPro.cro;
        bioEl.innerHTML = nextPro.bio;
        
        currentIndex = nextIndex;
      }
    })
    // 3. Mostra tudo de novo vindo de baixo
    .to([mainImg, previewImg, infoSection], {
      y: 0,
      opacity: 1,
      duration: 0.4,
      ease: "power2.out"
    });
  });
});
/* ============================================================
   SCROLL HORIZONTAL - NOSSOS RESULTADOS
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  // Verifica se o GSAP e o ScrollTrigger estão disponíveis
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const horizontalSection = document.querySelector(".resultados-horizontal");
    const track = document.querySelector(".hr-track");

    if (horizontalSection && track) {
      // Função para calcular o quanto o elemento deve correr para a esquerda
      function getScrollAmount() {
        let trackWidth = track.scrollWidth;
        return -(trackWidth - window.innerWidth);
      }

      // Cria a animação que move a "pista" para a esquerda (eixo X)
      const tween = gsap.to(track, {
        x: getScrollAmount,
        ease: "none"
      });

      // Cria a Trava (Pin) do Scroll
      ScrollTrigger.create({
        trigger: horizontalSection,
        start: "center center", // Trava a tela quando a galeria chega no meio
        end: () => `+=${getScrollAmount() * -1}`, // Libera quando chega no fim da pista
        pin: true,
        animation: tween,
        scrub: 1, // Suaviza o movimento ligado ao scroll do mouse (efeito smooth)
        invalidateOnRefresh: true // Recalcula se o usuário redimensionar a janela
      });
    }
  }
});
/* ============================================================
   EFEITO DE TEXTO REVELADO (ENTRADA E SAÍDA) - TODAS AS SEÇÕES
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  // Verifica se as bibliotecas estão carregadas
  if (typeof gsap !== "undefined" && typeof SplitType !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    // Mapeamento completo: pegando TODAS as classes de texto do site
    const textElements = document.querySelectorAll(`
      .section-title, .section-sub, .section-eyebrow, 
      .contact-title, .contact-sub, .contact-eyebrow,
      .ng-title, .ng-subtitle, .ng-vision-title, .ng-vision-desc,
      .cta-title, .cta-sub, .gallery-title,
      .team-name, .team-cro, .team-bio p,
      .benefit-num, .benefit-item h4, .benefit-item p,
      .smile-step h4, .smile-step p
    `);

    textElements.forEach((el) => {
      // Divide o texto em palavras e depois em caracteres (letras)
      const split = new SplitType(el, { types: 'words, chars' });

      // Cria a animação atrelada ao scroll
      gsap.from(split.chars, {
        scrollTrigger: {
          trigger: el,
          start: "top 90%",  // Começa a escrever quando o elemento aparece na base da tela
          end: "bottom 10%", // Limite para sumir quando passa do topo da tela
          
          // O Segredo da Animação de Entrada e Saída:
          // 1º: play (escreve ao descer)
          // 2º: reverse (apaga ao passar direto pra cima)
          // 3º: play (escreve ao voltar subindo)
          // 4º: reverse (apaga ao voltar pro topo)
          toggleActions: "play reverse play reverse"
        },
        y: 20, // Distância que a letra sobe
        opacity: 0, // Começa invisível
        duration: 0.3, // Velocidade da animação de cada letra
        stagger: 0.02, // O intervalo curtinho que cria o efeito "máquina de escrever"
        ease: "power2.out"
      });
    });
  }
});
/* ============================================================
   FUNCIONALIDADES MOBILE: SWIPE E TROCA DE ABAS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // 1. FUNÇÃO UNIVERSAL DE SWIPE (Arraste)
  function handleSwipe(element, onSwipeLeft, onSwipeRight) {
    if (!element) return;
    let touchStartX = 0;
    let touchEndX = 0;

    element.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    element.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      // Se a distância do arraste for maior que 50 pixels, dispara a ação
      if (touchEndX < touchStartX - 50) onSwipeLeft();
      if (touchEndX > touchStartX + 50) onSwipeRight();
    }, { passive: true });
  }

  // 2. LÓGICA DA SEÇÃO DE SERVIÇOS (Tratamentos)
  const servButtons = document.querySelectorAll('.service-btn');
  const sdTitle = document.getElementById('sd-title');
  const sdDesc = document.getElementById('sd-desc');
  const sdImage = document.getElementById('sd-image');
  const servicesShowcase = document.querySelector('.services-showcase');
  let currentServIndex = 0;

  function updateService(index) {
    if (index < 0 || index >= servButtons.length) return;
    
    // Atualiza botão ativo
    servButtons.forEach(btn => btn.classList.remove('active'));
    const btn = servButtons[index];
    btn.classList.add('active');

    // Animação GSAP na troca do conteúdo
    if (typeof gsap !== "undefined") {
      gsap.to([sdTitle, sdDesc, sdImage], {
        opacity: 0,
        y: 10,
        duration: 0.2,
        onComplete: () => {
          sdTitle.innerText = btn.getAttribute('data-title');
          sdDesc.innerText = btn.getAttribute('data-desc');
          sdImage.src = btn.getAttribute('data-img');
          gsap.to([sdTitle, sdDesc, sdImage], { opacity: 1, y: 0, duration: 0.3 });
        }
      });
    }
    currentServIndex = index;
  }

  // Evento de clique nos botões de serviços (Funciona no PC e Mobile)
  servButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => updateService(idx));
  });

  // Evento de Arraste (Swipe) nos serviços
  handleSwipe(servicesShowcase, 
    () => { // Arrastou para a Esquerda (Próximo)
      let nextIdx = (currentServIndex + 1) % servButtons.length;
      updateService(nextIdx);
    },
    () => { // Arrastou para a Direita (Anterior)
      let prevIdx = (currentServIndex - 1 + servButtons.length) % servButtons.length;
      updateService(prevIdx);
    }
  );

  // 3. LÓGICA DE ARRASTE DOS PROFISSIONAIS
  const teamSlider = document.getElementById('team-slider');
  const btnNextTeam = document.getElementById('team-next-btn');
  
  if (teamSlider && btnNextTeam) {
    handleSwipe(teamSlider, 
      () => btnNextTeam.click(), // Esquerda
      () => btnNextTeam.click()  // Direita (Como são 2, qualquer lado troca)
    );
  }

  // 4. ANIMAÇÃO DE APARECER E SUMIR A "DICA DE ARRASTE"
  if (window.innerWidth <= 992 && typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    const hints = document.querySelectorAll('.swipe-hint');
    
    hints.forEach(hint => {
      const parent = hint.parentElement;
      
      // Quando a seção chega na tela, a dica aparece
      ScrollTrigger.create({
        trigger: parent,
        start: "top 60%", // Aciona quando o topo do elemento chega em 60% da tela
        onEnter: () => {
          gsap.to(hint, { opacity: 1, duration: 0.5 });
          
          // Some automaticamente depois de 4 segundos
          setTimeout(() => {
            gsap.to(hint, { opacity: 0, duration: 0.5 });
          }, 4000);
        }
      });

      // Se o usuário tocar na tela antes dos 4 segundos, a dica some na hora
      parent.addEventListener('touchstart', () => {
        gsap.to(hint, { opacity: 0, duration: 0.3 });
      }, { once: true });
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
initServicesShowcase()
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
})();