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
  // 日数経過で数字を増やす（CEO指示・2026-05-12）
  // data-stat-base-date を基準日とし、1日あたり data-stat-per-day 件増加
  // 例: 2026-05-12 基準・+0.7/日 → 100日後で +70
  function computeDynamicTarget(el) {
    const baseDate = el.dataset.statBaseDate;
    const baseNum = parseFloat(el.dataset.statBase || el.dataset.countTo || '0');
    const perDay = parseFloat(el.dataset.statPerDay || '0');
    if (!baseDate || isNaN(perDay) || perDay === 0) return parseInt(el.dataset.countTo, 10);
    const base = new Date(baseDate + 'T00:00:00');
    const now = new Date();
    const days = Math.max(0, Math.floor((now - base) / (1000 * 60 * 60 * 24)));
    return Math.floor(baseNum + perDay * days);
  }
  function countUp(el) {
    // data-stat-base-date があれば日数経過で目標値を再計算
    const target = el.dataset.statBaseDate
      ? computeDynamicTarget(el)
      : parseInt(el.dataset.countTo, 10);
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
    }, { threshold: 0, rootMargin: '0px 0px -80px 0px' });
    targets.forEach(el => io.observe(el));
  }

  // === Showcase 親子フィルタ（2026-05-12 大規模改修） ===
  // 仕様:
  //  - 親カテゴリ5個 (food/beauty/wellness/medical/lifestyle) + すべて(all)
  //  - 親クリック → 子チップ(第2行)を展開してフィルタ
  //  - 子クリック → 該当 data-category のみ表示
  //  - 「すべて」クリック → 子チップ閉じる + 全カード表示
  //  - 件数バッジは DOM から動的算出（37件想定でも自動追従）
  (() => {
    const parentBtns = document.querySelectorAll('.parent-btn');
    const childWrap = document.getElementById('childFilter');
    const showCards = document.querySelectorAll('.show-card');
    if (!parentBtns.length || !childWrap || !showCards.length) return;

    // カテゴリスラッグ → 日本語ラベル変換マップ
    const childLabels = {
      'cafe': 'カフェ', 'bakery': 'ベーカリー', 'izakaya': '居酒屋',
      'ramen': 'ラーメン', 'sushi': '寿司', 'bistro': 'ビストロ',
      'wine': 'ワインバー', 'tea': '日本茶', 'craft-beer': 'クラフトビール',
      'korean-bbq': '焼肉', 'soba': '蕎麦', 'ice-cream': 'ジェラート',
      'crepe': 'クレープ',
      'salon': 'サロン', 'nail': 'ネイル',
      'esthetic': 'エステ', 'barber': 'バーバー',
      'yoga': 'ヨガ', 'fitness': 'フィットネス',
      'boxing': 'ボクシング', 'seitai': '整骨院', 'acupuncture': '鍼灸',
      'dental': '歯科', 'pediatric': '小児科',
      'ophthalmology': '眼科', 'internal-medicine': '内科', 'chiropractic': 'カイロ',
      'floristry': '生花店', 'dance': 'ダンス', 'piano': 'ピアノ',
      'music': '音楽教室', 'art': '絵画教室'
    };

    // 親→子の許可リスト（CEO 設計通り）。HTMLに無い子もここに書いておくと
    // software-engineer-a が追加した時点で自動で出現する
    const parentMap = {
      'food': ['cafe','bakery','izakaya','ramen','sushi','bistro','wine','tea','craft-beer','korean-bbq','soba','ice-cream','crepe'],
      'beauty': ['salon','nail','esthetic','barber'],
      'wellness': ['yoga','fitness','boxing','seitai','acupuncture'],
      'medical': ['dental','pediatric','ophthalmology','internal-medicine','chiropractic'],
      'lifestyle': ['floristry','dance','piano','music','art']
    };

    // DOM 上に実在するカード数を集計（37件想定／実際は30件＋新規分）
    function countCards(predicate) {
      let n = 0;
      showCards.forEach(c => { if (predicate(c)) n++; });
      return n;
    }

    // 件数バッジ初期反映
    function updateParentCounts() {
      document.querySelectorAll('.count[data-count-for]').forEach(span => {
        const key = span.dataset.countFor;
        if (key === 'all') {
          span.textContent = showCards.length;
        } else {
          span.textContent = countCards(c => c.dataset.parent === key);
        }
      });
    }
    updateParentCounts();

    // 子チップエリアの開閉制御
    function closeChild() {
      childWrap.dataset.open = 'false';
      childWrap.setAttribute('aria-hidden', 'true');
      childWrap.innerHTML = '';
    }
    function openChild(parentKey) {
      // 親に属し、かつ実カードが1件以上あるスラッグのみチップ化
      const slugs = (parentMap[parentKey] || []).filter(slug => {
        return countCards(c => c.dataset.category === slug) > 0;
      });
      // 「親カテゴリすべて」チップを先頭に
      const html = [
        `<button class="filter-btn child-btn active" data-child="__parent__" data-parent-key="${parentKey}" role="tab" aria-selected="true">この分類すべて <span class="count">${countCards(c => c.dataset.parent === parentKey)}</span></button>`
      ];
      slugs.forEach(slug => {
        const cnt = countCards(c => c.dataset.category === slug);
        const label = childLabels[slug] || slug;
        html.push(`<button class="filter-btn child-btn" data-child="${slug}" role="tab" aria-selected="false">${label} <span class="count">${cnt}</span></button>`);
      });
      childWrap.innerHTML = html.join('');
      childWrap.dataset.open = 'true';
      childWrap.setAttribute('aria-hidden', 'false');
      // 子チップにクリックハンドラ
      childWrap.querySelectorAll('.child-btn').forEach(cb => {
        cb.addEventListener('click', () => onChildClick(cb, parentKey));
      });
    }

    // カード表示更新
    // 「すべて」かつ未展開のときだけ最初の3件のみ表示。それ以外は通常通り。
    const moreWrap = document.getElementById('showcaseMore');
    const moreBtn = document.getElementById('btnShowAllTemplates');
    const hiddenCountEl = document.getElementById('hiddenCount');
    const COLLAPSED_VISIBLE = 3;
    function isExpanded() {
      return moreWrap && moreWrap.dataset.state === 'expanded';
    }
    function applyFilter({ parent = 'all', child = null } = {}) {
      const collapsedDefault = (parent === 'all' && !child) && !isExpanded();
      let visibleCount = 0;
      showCards.forEach(card => {
        let visible = false;
        if (parent === 'all') {
          visible = true;
        } else if (!child || child === '__parent__') {
          visible = card.dataset.parent === parent;
        } else {
          visible = card.dataset.category === child;
        }
        // 「すべて」初期表示は先頭3件のみに制限
        if (visible && collapsedDefault) {
          if (visibleCount >= COLLAPSED_VISIBLE) {
            card.dataset.position = 'hidden';
            card.dataset.hidden = 'true';
          } else {
            card.dataset.position = '';
            card.dataset.hidden = 'false';
            visibleCount++;
          }
        } else {
          card.dataset.position = '';
          card.dataset.hidden = visible ? 'false' : 'true';
        }
      });
      // もっと見るボタンの表示制御
      if (moreWrap && moreBtn) {
        const showButton = (parent === 'all' && !child);
        moreWrap.style.display = showButton ? 'flex' : 'none';
        if (showButton) {
          const total = showCards.length;
          const remain = total - COLLAPSED_VISIBLE;
          if (hiddenCountEl) hiddenCountEl.textContent = isExpanded() ? '閉じる' : `+${remain}件`;
          moreBtn.firstChild && (moreBtn.childNodes[0].nodeValue = isExpanded()
            ? '参考イメージを折りたたむ '
            : 'すべての参考イメージを見る ');
          moreBtn.setAttribute('aria-expanded', isExpanded() ? 'true' : 'false');
        }
      }
    }

    // もっと見るボタンのトグル
    if (moreBtn && moreWrap) {
      moreBtn.addEventListener('click', () => {
        const willExpand = moreWrap.dataset.state !== 'expanded';
        moreWrap.dataset.state = willExpand ? 'expanded' : 'collapsed';
        applyFilter({ parent: 'all' });
        if (!willExpand) {
          // 折りたたみ時、showcase 冒頭にスクロール戻す
          document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // 親クリック
    parentBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const parentKey = btn.dataset.parent;
        // ボタン active 切り替え
        parentBtns.forEach(b => {
          const active = b === btn;
          b.classList.toggle('active', active);
          b.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        if (parentKey === 'all') {
          closeChild();
          applyFilter({ parent: 'all' });
        } else {
          openChild(parentKey);
          applyFilter({ parent: parentKey });
        }
      });
    });

    // 子クリック
    function onChildClick(cb, parentKey) {
      const childKey = cb.dataset.child;
      childWrap.querySelectorAll('.child-btn').forEach(b => {
        const active = b === cb;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      applyFilter({ parent: parentKey, child: childKey });
    }

    // 初期: 「すべて」が active、子は閉じている、3件のみ表示 + ボタン
    applyFilter({ parent: 'all' });
  })();

  // Showcase v2: cards open live URL via overlay <a>. No modal needed.

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
