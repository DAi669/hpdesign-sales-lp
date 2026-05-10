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

  // Showcase modal
  const modal = document.getElementById('showcaseModal');
  const modalClose = document.getElementById('modalClose');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalCta = document.getElementById('modalCta');

  const templateMeta = {
    'cafe-california-open-air': {
      title: 'California Open Air',
      desc: '西海岸×オープンエアの空気感を伝えるカフェ向けデザイン。海青×砂生成×太陽イエローの開放的なパレット、Manroposフォントで現代的な軽快さ。観光客・若年層・湘南散歩客の心を掴む、SNS映えする標準グリッド型レイアウトです。'
    },
    'cafe-editorial-magazine': {
      title: 'Editorial Magazine',
      desc: '雑誌の特集記事のような、見出し・キャプション・引用文・誌面番号を効かせたエディトリアルレイアウト。スプリット2カラムでテキスト密度を保ちつつ、大型タイポと余白で読ませる。40代以上のグルメ層・メディア感度高い層に最適。'
    },
    'cafe-forest-hideaway': {
      title: 'Forest Hideaway',
      desc: '森の隠れ家・ゆったりとした時間が流れる小さなカフェ。葉のモチーフ、丸ゴシック、優しい曲線、Bento グリッドで「居心地の良さ」を視覚化。ファミリー連れ・ペット連れ・隠れ家好きの層にぴったり。'
    },
    'bakery-artisan-rustic': {
      title: 'Artisan Rustic',
      desc: '職人手作り・ナチュラル系のパン屋。茶×クリーム×小麦色の温かみあるパレット。グレイン質感の背景、Crimson Textの欧文セリフ、引用クォートで店主のこだわりを物語る。30-50代主婦・グルメ層向け。'
    },
    'bakery-modern-minimalist': {
      title: 'Modern Minimalist',
      desc: '極限ミニマル。白×黒×シルバー、巨大タイポ、写真主役。装飾を最小限に抑え、商品そのものに集中する設計。若い夫婦・SNS感度高い層・モダン志向の店舗に。'
    },
    'bakery-storytelling-heritage': {
      title: 'Storytelling Heritage',
      desc: '創業ストーリー型・三代記の重厚さ。深ボルドー×真鍮×アイボリーで老舗の品格を演出。紋章・時系列タイムライン・受賞リストで歴史を可視化。創業数十年の老舗パン屋・伝統ある店舗向け。'
    }
  };

  showCards.forEach(card => {
    card.addEventListener('click', () => {
      const slug = card.dataset.slug;
      const meta = templateMeta[slug];
      if (!meta) return;
      modalImg.src = `images/templates/${slug}.png`;
      modalImg.alt = meta.title;
      modalTitle.textContent = meta.title;
      modalDesc.textContent = meta.desc;
      modalCta.href = `#contact?template=${slug}`;
      modalCta.dataset.template = slug;
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.getAttribute('aria-hidden') === 'false') closeModal();
  });

  // Modal CTA → set template select then scroll
  if (modalCta) {
    modalCta.addEventListener('click', (e) => {
      e.preventDefault();
      const slug = modalCta.dataset.template;
      const tpl = document.getElementById('templateSelect');
      if (tpl && slug) {
        for (const opt of tpl.options) {
          if (opt.value === slug) { tpl.value = slug; break; }
        }
      }
      closeModal();
      const contact = document.getElementById('contact');
      if (contact) contact.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  }

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
})();
