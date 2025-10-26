// filters.js — generic filter logic for all product listing pages
(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const filtersEl = document.querySelector('aside.filters');
    const productsContainer = document.querySelector('section.products');
    if (!filtersEl || !productsContainer) return;

    const productCards = Array.from(productsContainer.querySelectorAll('.product-card'));
    if (productCards.length === 0) return;

    // Map visible filter group names to dataset keys (camelCase)
    const dimensionKeyMap = new Map([
      ['Color', 'color'],
      ['Size', 'size'],
      ['Fit', 'fit'],
      ['Promotions', 'promotionPercent'],
      ['Discount', 'discountPercent'],
      ['Brand', 'brand'],
      ['Design', 'design'],
      ['Fabric', 'fabric'],
      ['Browse', 'category'],
      ['Sleeve Length', 'sleeveLength'],
      ['Wash', 'wash'],
      ['Type', 'type'],
      ['Gender', 'gender'],
    ]);

    const checkboxMap = new Map(); // input -> { dimName, valueText }
    const knownValuesByDim = new Map(); // dimName -> [values (label texts)]
    const filterGroups = Array.from(filtersEl.querySelectorAll('.filter-group'));

    // Build checkbox maps and known values list
    filterGroups.forEach(group => {
      const titleEl = group.querySelector('.filter-title');
      if (!titleEl) return;
      const dimName = titleEl.textContent.trim();
      if (!dimName) return;

      const optionLabels = Array.from(group.querySelectorAll('.filter-option'));
      const values = [];
      optionLabels.forEach(labelEl => {
        const input = labelEl.querySelector('input[type="checkbox"]');
        if (!input) return;
        const labelText = normalizeWhitespace(labelEl.textContent);
        checkboxMap.set(input, { dimName, valueText: labelText });
        values.push(labelText);
        input.addEventListener('change', applyFilters);
      });
      if (values.length) knownValuesByDim.set(dimName, values);
    });

    // Price: support either single slider (acts as max) or min/max sliders if present
    const priceMinInput = filtersEl.querySelector('#price-min');
    const priceMaxInput = filtersEl.querySelector('#price-max');
    const singlePriceInput =
      filtersEl.querySelector('#price-range') ||
      filtersEl.querySelector('.price-slider input[type="range"]');

    if (priceMinInput) priceMinInput.addEventListener('input', applyFilters);
    if (priceMaxInput) priceMaxInput.addEventListener('input', applyFilters);
    if (singlePriceInput) singlePriceInput.addEventListener('input', applyFilters);

    // Search bar (optional)
    const searchInput = document.querySelector('.search-bar input[type="search"]');
    if (searchInput) searchInput.addEventListener('input', debounce(applyFilters, 120));

    // Cache computed product meta
    const metaCache = new WeakMap();

    function getActiveFilters() {
      const map = new Map(); // dimName -> Set of selected values
      checkboxMap.forEach(({ dimName, valueText }, input) => {
        if (input.checked) {
          const set = map.get(dimName) || new Set();
          set.add(valueText);
          map.set(dimName, set);
        }
      });
      return map;
    }

    function getPriceRange() {
      let min = 0;
      let max = Number.POSITIVE_INFINITY;
      if (priceMinInput && priceMinInput.value) min = Number(priceMinInput.value);
      if (priceMaxInput && priceMaxInput.value) max = Number(priceMaxInput.value);
      if (!priceMinInput && !priceMaxInput && singlePriceInput && singlePriceInput.value) {
        max = Number(singlePriceInput.value);
      }
      return { min, max };
    }

    function getSearchQuery() {
      return searchInput ? normalizeText(searchInput.value) : '';
    }

    function applyFilters() {
      const active = getActiveFilters();
      const range = getPriceRange();
      const q = getSearchQuery();

      productCards.forEach(card => {
        const meta = getProductMeta(card);
        const show = productMatches(meta, active, range, q);
        card.style.display = show ? '' : 'none';
      });
    }

    function productMatches(meta, active, range, q) {
      // Price
      if (Number.isFinite(range.min) || Number.isFinite(range.max)) {
        if (typeof meta.price === 'number') {
          if (meta.price < range.min || meta.price > range.max) return false;
        }
      }

      // Search
      if (q) {
        const hay = normalizeText((meta.nameText || '') + ' ' + (meta.altText || ''));
        if (!hay.includes(q)) return false;
      }

      // All other selected filters (AND across groups; OR within a group)
      for (const [dimName, selectedSet] of active) {
        if (selectedSet.size === 0) continue;

        if (dimName === 'Promotions') {
          if (!matchPercent(meta.promotionPercent, selectedSet)) return false;
          continue;
        }
        if (dimName === 'Discount') {
          if (!matchPercent(meta.discountPercent, selectedSet)) return false;
          continue;
        }

        const key = dimensionKeyMap.get(dimName) || dimName;
        const values = Array.isArray(meta[key]) ? meta[key] : [];
        if (values.length === 0) return false;

        const selected = Array.from(selectedSet).map(v => normalizeText(v));
        const hasAny = values.some(v => selected.includes(normalizeText(v)));
        if (!hasAny) return false;
      }

      return true;
    }

    function matchPercent(productPercent, selectedSet) {
      if (selectedSet.size === 0) return true;
      if (typeof productPercent !== 'number') return false;
      // Treat selected values (e.g., "Extra 10%") as minimum thresholds
      const thresholds = Array.from(selectedSet).map(v => {
        const m = String(v).match(/(\d+)/);
        return m ? Number(m[1]) : NaN;
      }).filter(n => !Number.isNaN(n));
      if (thresholds.length === 0) return true;
      const requiredMin = Math.min(...thresholds);
      return productPercent >= requiredMin;
    }

    function getProductMeta(card) {
      if (metaCache.has(card)) return metaCache.get(card);

      const d = card.dataset || {};
      const nameEl = card.querySelector('.product-info span');
      const nameText = nameEl ? nameEl.textContent.trim() : '';
      const img = card.querySelector('img');
      const altText = img && img.alt ? img.alt.trim() : '';
      const badgesText = Array.from(card.querySelectorAll('.badge'))
        .map(b => b.textContent.trim())
        .join(' ');
      const bigText = normalizeText([nameText, altText, badgesText].join(' '));

      const meta = {
        // Prefer data-* if present; else infer from visible label sets within text
        brand: readDimList('Brand', 'brand'),
        color: readDimList('Color', 'color'),
        size: readDimList('Size', 'size'),
        fit: readDimList('Fit', 'fit'),
        design: readDimList('Design', 'design'),
        fabric: readDimList('Fabric', 'fabric'),
        category: readDimList('Browse', 'category'),
        sleeveLength: readDimList('Sleeve Length', 'sleeveLength'),
        wash: readDimList('Wash', 'wash'),
        type: readDimList('Type', 'type'),
        gender: readDimList('Gender', 'gender'),
        price: readPrice(),
        oldPrice: readOldPrice(),
        discountPercent: readDiscountPercent(),
        promotionPercent: readPromotionPercent(),
        nameText,
        altText,
      };

      metaCache.set(card, meta);
      return meta;

      function readDimList(groupName, datasetKey) {
        const ds = d[datasetKey];
        if (ds) return splitList(ds);
        const known = knownValuesByDim.get(groupName) || [];
        const matches = known.filter(v => bigText.includes(normalizeText(v)));
        return unique(matches);
      }

      function readPrice() {
        if (d.price) return asNumber(d.price);
        const priceSection = card.querySelector('.price-section');
        if (priceSection) {
          const m = priceSection.textContent.match(/(\d[\d,]*)/);
          if (m) return asNumber(m[1]);
        }
        return undefined;
      }

      function readOldPrice() {
        if (d.oldPrice) return asNumber(d.oldPrice);
        const el = card.querySelector('.old-price');
        if (!el) return undefined;
        const m = el.textContent.match(/(\d[\d,]*)/);
        return m ? asNumber(m[1]) : undefined;
      }

      function readDiscountPercent() {
        if (d.discountPercent) return asNumber(d.discountPercent);
        const badge = Array.from(card.querySelectorAll('.badge')).find(b => /%/.test(b.textContent));
        if (badge) {
          const m = badge.textContent.match(/(\d+)\s*%/);
          if (m) return asNumber(m[1]);
        }
        const p = readPrice();
        const o = readOldPrice();
        if (typeof p === 'number' && typeof o === 'number' && o > p) {
          return Math.round(((o - p) / o) * 100);
        }
        return undefined;
      }

      function readPromotionPercent() {
        if (d.promotionPercent) return asNumber(d.promotionPercent);
        const badge = Array.from(card.querySelectorAll('.badge')).find(b => /extra/i.test(b.textContent));
        if (!badge) return undefined;
        const m = badge.textContent.match(/(\d+)\s*%/i);
        return m ? asNumber(m[1]) : undefined;
      }
    }

    // Utils
    function splitList(s) {
      return String(s)
        .split(',')
        .map(v => v.trim())
        .filter(Boolean);
    }
    function unique(arr) {
      return Array.from(new Set(arr));
    }
    function normalizeWhitespace(s) {
      return String(s || '').replace(/\s+/g, ' ').trim();
    }
    function normalizeText(s) {
      return normalizeWhitespace(s)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    }
    function asNumber(s) {
      return Number(String(s).replace(/[^\d]/g, ''));
    }
    function debounce(fn, delay) {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(null, args), delay);
      };
    }

    // Initial run
    applyFilters();
  });
})();

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('.search-bar input[type="search"]');
    const products = Array.from(document.querySelectorAll('.product-card'));

    if (!input || products.length === 0) return;

    // Prepare searchable text on each product card
    products.forEach((p) => {
      const titleEl = p.querySelector('.product-info span');
      const img = p.querySelector('img.product-image');
      const badges = Array.from(p.querySelectorAll('.badge')).map(b => b.textContent).join(' ');
      const extras = p.getAttribute('data-search-extra') || '';
      const text = [
        titleEl ? titleEl.textContent : '',
        img ? img.alt : '',
        badges,
        extras
      ].join(' ').toLowerCase();
      p.dataset.search = text;
      // Keep original title in dataset so you can implement highlighting later if desired
      if (titleEl) p.dataset.title = titleEl.textContent;
    });

    // Create accessible, visually-hidden live region to announce results
    let live = document.getElementById('search-results-live');
    if (!live) {
      live = document.createElement('div');
      live.id = 'search-results-live';
      live.setAttribute('aria-live', 'polite');
      live.setAttribute('aria-atomic', 'true');
      // visually hide but keep accessible
      live.style.position = 'absolute';
      live.style.left = '-9999px';
      live.style.width = '1px';
      live.style.height = '1px';
      live.style.overflow = 'hidden';
      document.body.appendChild(live);
    }

    // Debounce helper
    const debounce = (fn, ms = 180) => {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), ms);
      };
    };

    const showAll = () => {
      products.forEach(p => p.style.display = '');
      live.textContent = `${products.length} item${products.length !== 1 ? 's' : ''}`;
    };

    const performSearch = () => {
      const q = (input.value || '').trim().toLowerCase();
      if (!q) {
        showAll();
        return;
      }
      const tokens = q.split(/\s+/).filter(Boolean);
      let matchCount = 0;

      products.forEach(p => {
        const hay = p.dataset.search || '';
        const ok = tokens.every(tok => hay.includes(tok));
        p.style.display = ok ? '' : 'none';
        if (ok) matchCount++;
      });

      live.textContent = `${matchCount} result${matchCount !== 1 ? 's' : ''} for "${input.value}"`;
    };

    input.addEventListener('input', debounce(performSearch, 150));
    input.addEventListener('search', performSearch);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        // Run immediately on Enter and focus the first visible product
        performSearch();
        const first = document.querySelector('.product-card:not([style*="display: none"])');
        if (first) first.focus();
      } else if (e.key === 'Escape') {
        // clear search on Escape
        input.value = '';
        performSearch();
      }
    });

    // Initial run (in case there's a preserved value)
    performSearch();
  });
})();