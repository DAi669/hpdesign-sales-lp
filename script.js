// 合同会社DRAI 営業LP - vanilla JS
(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  let scrollY = 0; let ticking = false;
  const header = document.getElementById('siteHeader');
  const progressBar = document.getElementById('scrollProgressBar');

  // Scroll handler
  function onScroll() {
    scrollY = window.scrollY || 0;
    if (!ticking) {
      requestAnimationFrame(() => {
        if (header) header.classList.toggle('scrolled', scrollY > 24);
        if (progressBar) {
          const docH = document.documentElement.scrollHeight - window.innerHeight;
          const ratio = docH > 0 ? scrollY / docH : 0;
          progressBar.style.width = (ratio * 100).toFixed(2) + '%';
        }
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('navList');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const open = navList.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navList.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  // Hero stat count-up
  const stats = document.querySelectorAll('.stat-num[data-count-to]');
  function countUp(el) {
    const target = parseInt(el.dataset.countTo, 10);
    if (reduced) { el.textContent = target.toLocaleString(); return; }
    const dur = 1300; const start = performance.now();
    const initial = parseInt(el.textContent.replace(/,/g, ''), 10) || 0;
    function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(initial + (target - initial) * eased).toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    const sIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { countUp(e.target); sIo.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    stats.forEach(el => sIo.observe(el));
  }

  // Section fade-up
  if ('IntersectionObserver' in window && !reduced) {
    const targets = document.querySelectorAll('.about, .showcase, .cases, .flow, .price, .faq, .contact');
    targets.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = 'opacity 0.9s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1)';
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(el => io.observe(el));
  }

  // Showcase filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const showCards = document.querySelectorAll('.show-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      showCards.forEach(card => {
        const cat = card.dataset.category;
        const visible = filter === 'all' || cat === filter;
        card.dataset.hidden = visible ? 'false' : 'true';
      });
    });
  });

  // Showcase v2: cards open live URL via overlay <a>. No modal needed.
  // Legacy modal element kept hidden in DOM for safety; ignore if present.

  // URL parameter ?template=xxx → set form select on load
  const urlParams = new URLSearchParams(window.location.search);
  const tplParam = urlParams.get('template');
  if (tplParam) {
    const tpl = document.getElementById('templateSelect');
    if (tpl) {
      for (const opt of tpl.options) {
        if (opt.value === tplParam) { tpl.value = tplParam; break; }
      }
    }
  }

  // === 2026-05-12 大規模改修: アニメーション強化 ===
  // (1) スクロール進捗バーは既存実装（line 9 周辺）で処理済

  // (2) Floating Contact (FAB) スクロール後表示
  const fab = document.getElementById('fabContact');
  if (fab) {
    const showFab = () => {
      if (window.scrollY > 600) fab.classList.add('shown');
      else fab.classList.remove('shown');
    };
    document.addEventListener('scroll', showFab, { passive: true });
    showFab();
  }

  // (3) スクロールリビール（fade-in）
  if ('IntersectionObserver' in window && !reduced) {
    const targets = document.querySelectorAll(
      '.pillar, .show-card, .case-card, .tier-card, .compare-row, .flow-step, .faq-item, .price-tiers, .mid-cta, .mini-cta-inner, .section-title, .section-lead, .about-pillars'
    );
    targets.forEach(el => el.classList.add('fade-in'));
    const fio = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('in'), i * 24);
          fio.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach(el => fio.observe(el));
  }

  // (4) 統計数字カウントアップは既存ロジック（line 44-66）で実行済み。
  //     ここで再実装すると衝突して 0 で止まる問題があるため削除済み。

  // (5) マグネティック CTA ボタン
  if (!reduced && window.matchMedia('(min-width: 901px)').matches) {
    document.querySelectorAll('[data-magnet]').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  // (6) Hero Bento タイル軽い視差（マウス追従）
  if (!reduced && window.matchMedia('(min-width: 901px)').matches) {
    const bento = document.querySelector('.hero-bento');
    if (bento) {
      const tiles = bento.querySelectorAll('.bento-tile');
      bento.addEventListener('mousemove', (e) => {
        const r = bento.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        tiles.forEach((t, i) => {
          const depth = (i % 3 + 1) * 4;
          t.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
        });
      });
      bento.addEventListener('mouseleave', () => {
        tiles.forEach(t => { t.style.transform = ''; });
      });
    }
  }
})();
