const PRODUCT_KEY = 'gb_saved_products';

function getIdFromQuery() {
  const params = new URLSearchParams(location.search);
  return params.get('id');
}

async function loadProducts() {
  const data = await chrome.storage.local.get(PRODUCT_KEY);
  return data[PRODUCT_KEY] || [];
}

function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function render() {
  const app = document.getElementById('app');
  const id = getIdFromQuery();
  const products = await loadProducts();
  const product = products.find((p) => p.id === id);

  if (!product) {
    app.innerHTML = '<p>Không tìm thấy sản phẩm đã lưu.</p>';
    return;
  }

  const specsText = Object.keys(product.specs || {}).length
    ? JSON.stringify(product.specs, null, 2)
    : 'Không có thông số.';

  app.innerHTML = `
    <article class="card">
      <div class="header">
        <img src="${escapeHtml(product.mainImage || '')}" alt="${escapeHtml(product.title || '')}" />
        <div>
          <h1>${escapeHtml(product.title || '(Không có tiêu đề)')}</h1>
          <p class="price">${escapeHtml(product.priceText || 'Chưa có giá')}</p>
          <p>${escapeHtml(product.description || '')}</p>
          <p><b>Nguồn:</b> ${escapeHtml(product.sourceUrl)}</p>
          <div class="actions">
            <button id="openSource">Mở trang gốc greetbuy.com</button>
          </div>
        </div>
      </div>

      <section>
        <h2>Thông số thu thập được</h2>
        <pre>${escapeHtml(specsText)}</pre>
      </section>
    </article>
  `;

  document.getElementById('openSource')?.addEventListener('click', () => {
    chrome.tabs.create({ url: product.sourceUrl });
  });
}

render();
