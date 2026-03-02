const PRODUCT_KEY = 'gb_saved_products';

const statusEl = document.getElementById('status');
const productsEl = document.getElementById('products');
const saveBtn = document.getElementById('saveCurrent');

function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.style.color = isError ? '#d93025' : '#188038';
}

async function getSavedProducts() {
  const data = await chrome.storage.local.get(PRODUCT_KEY);
  return data[PRODUCT_KEY] || [];
}

async function setSavedProducts(products) {
  await chrome.storage.local.set({ [PRODUCT_KEY]: products });
}

function createProductId(url) {
  const base = `${url}|${Date.now()}|${Math.random().toString(36).slice(2)}`;
  return btoa(unescape(encodeURIComponent(base))).replace(/=/g, '');
}

function formatDate(isoDate) {
  try {
    return new Date(isoDate).toLocaleString('vi-VN');
  } catch {
    return isoDate;
  }
}

async function renderProducts() {
  const products = await getSavedProducts();
  productsEl.innerHTML = '';

  if (!products.length) {
    productsEl.innerHTML = '<p class="empty">Chưa có sản phẩm nào được lưu.</p>';
    return;
  }

  for (const product of products) {
    const item = document.createElement('article');
    item.className = 'product';

    const image = document.createElement('img');
    image.src = product.mainImage || '';
    image.alt = product.title || 'Ảnh sản phẩm';

    const meta = document.createElement('div');
    meta.className = 'meta';

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = product.title || '(Không có tiêu đề)';

    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = product.priceText || 'Chưa có giá';

    const savedAt = document.createElement('div');
    savedAt.style.fontSize = '11px';
    savedAt.style.color = '#666';
    savedAt.textContent = `Lưu lúc: ${formatDate(product.savedAt)}`;

    const actions = document.createElement('div');
    actions.className = 'actions';

    const openDetailBtn = document.createElement('button');
    openDetailBtn.textContent = 'Mở chi tiết';
    openDetailBtn.addEventListener('click', () => {
      const url = chrome.runtime.getURL(`detail.html?id=${encodeURIComponent(product.id)}`);
      chrome.tabs.create({ url });
    });

    const openSourceBtn = document.createElement('button');
    openSourceBtn.textContent = 'Mở nguồn';
    openSourceBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: product.sourceUrl });
    });

    actions.append(openDetailBtn, openSourceBtn);
    meta.append(title, price, savedAt, actions);
    item.append(image, meta);

    productsEl.appendChild(item);
  }
}

async function saveCurrentProduct() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id || !tab.url?.includes('greetbuy.com/goods/')) {
    setStatus('Hãy mở một trang sản phẩm greetbuy.com trước.', true);
    return;
  }

  const response = await chrome.tabs.sendMessage(tab.id, { type: 'GB_CAPTURE_PRODUCT' });
  if (!response?.ok) {
    setStatus(response?.error || 'Không lấy được dữ liệu từ trang.', true);
    return;
  }

  const product = response.data;
  const savedProducts = await getSavedProducts();

  const id = createProductId(product.sourceUrl);
  savedProducts.unshift({
    id,
    ...product,
    savedAt: new Date().toISOString()
  });

  await setSavedProducts(savedProducts);
  setStatus('Đã lưu sản phẩm thành công.');
  await renderProducts();
}

saveBtn.addEventListener('click', () => {
  saveCurrentProduct().catch((error) => {
    setStatus(error?.message || 'Có lỗi xảy ra khi lưu sản phẩm.', true);
  });
});

renderProducts();
