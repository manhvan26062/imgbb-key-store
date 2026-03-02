(() => {
  const text = (el) => (el?.textContent || "").trim();

  function getMeta(...selectors) {
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (!el) continue;
      const value = el.getAttribute("content") || el.getAttribute("value") || text(el);
      if (value) return value.trim();
    }
    return "";
  }

  function collectImages() {
    const candidates = [
      ...document.querySelectorAll('img[src]'),
      ...document.querySelectorAll('[style*="background-image"]')
    ];

    const urls = new Set();
    for (const node of candidates) {
      if (node.tagName === 'IMG') {
        const src = node.currentSrc || node.src;
        if (src) urls.add(src);
      } else {
        const style = getComputedStyle(node).backgroundImage;
        const match = style.match(/url\(["']?(.*?)["']?\)/i);
        if (match?.[1]) urls.add(match[1]);
      }
    }

    return [...urls].filter((url) => /^https?:\/\//i.test(url));
  }

  function collectJsonLd() {
    const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')];
    const parsed = [];
    for (const script of scripts) {
      try {
        parsed.push(JSON.parse(script.textContent));
      } catch {
        // ignore invalid json-ld
      }
    }
    return parsed;
  }

  function collectSpecs() {
    const map = {};
    const rows = document.querySelectorAll('table tr, .specs tr, .detail tr, .attr tr, .attributes tr');
    rows.forEach((row) => {
      const cells = row.querySelectorAll('th,td');
      if (cells.length >= 2) {
        const key = text(cells[0]);
        const value = text(cells[1]);
        if (key && value) map[key] = value;
      }
    });
    return map;
  }

  function collectProductData() {
    const title =
      text(document.querySelector('h1')) ||
      getMeta('meta[property="og:title"]', 'meta[name="title"]') ||
      document.title;

    const description =
      getMeta('meta[property="og:description"]', 'meta[name="description"]') ||
      text(document.querySelector('.desc, .description, [class*="desc"]'));

    const priceCandidates = [
      ...document.querySelectorAll('[class*="price" i], .price, .goods-price, [data-price]')
    ]
      .map((el) => text(el))
      .filter(Boolean);

    const images = collectImages();
    const specs = collectSpecs();

    return {
      sourceUrl: location.href,
      sourceHost: location.host,
      title,
      description,
      priceText: priceCandidates[0] || "",
      priceCandidates,
      images,
      mainImage: images[0] || getMeta('meta[property="og:image"]'),
      specs,
      htmlSnapshot: document.documentElement.outerHTML,
      jsonLd: collectJsonLd(),
      capturedAt: new Date().toISOString()
    };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== 'GB_CAPTURE_PRODUCT') return;

    try {
      const data = collectProductData();
      sendResponse({ ok: true, data });
    } catch (error) {
      sendResponse({ ok: false, error: error?.message || 'Không thể đọc dữ liệu sản phẩm.' });
    }

    return true;
  });
})();
