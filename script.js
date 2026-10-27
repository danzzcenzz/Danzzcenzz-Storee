document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  const opening = $('#opening');
  const home = $('#home');
  const payment = $('#payment');

  let openingTimer = null;
  let currentProduct = null;
  let currentOrder = null;
  let database = null;
  let auth = null;
  let settings = {};
  let products = [];

  const DEFAULT_WHATSAPP = '62882000379621';
  const CHANNEL_URL =
    'https://whatsapp.com/channel/0029Vb90a8bLY6dGF3QxZR0W';

  let adminWhatsApp = DEFAULT_WHATSAPP;

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function formatRupiah(value) {
    return 'Rp' + Number(value || 0).toLocaleString('id-ID');
  }

  function getElement(...selectors) {
    for (const selector of selectors) {
      const element = $(selector);
      if (element) return element;
    }
    return null;
  }

  function showPage(page) {
    [home, payment].forEach(function (element) {
      if (element) {
        element.classList.add('hidden');
        element.style.display = 'none';
      }
    });

    if (page) {
      page.classList.remove('hidden');
      page.style.display = '';
    }
  }

  function closeInvite() {
    const popup = getElement(
      '#channelPopup',
      '#channel-popup',
      '.channel-popup',
      '#invitePopup',
      '#invite-popup'
    );

    const backdrop = getElement(
      '#channelBackdrop',
      '#channel-backdrop',
      '.channel-backdrop'
    );

    if (popup) {
      popup.classList.remove('show', 'active', 'visible');
      popup.style.display = 'none';
    }

    if (backdrop) {
      backdrop.classList.remove('show', 'active', 'visible');
      backdrop.style.display = 'none';
    }

    document.body.classList.remove('popup-open');
  }

  function showInvite() {
    if (openingTimer) {
      clearTimeout(openingTimer);
      openingTimer = null;
    }

    if (opening) {
      opening.classList.add('leaving');
      opening.style.opacity = '0';

      setTimeout(function () {
        opening.style.display = 'none';
        opening.classList.add('hidden');
      }, 350);
    }

    if (home) {
      home.classList.remove('hidden');
      home.style.display = '';
    }

    if (payment) {
      payment.classList.add('hidden');
      payment.style.display = 'none';
    }

    const popup = getElement(
      '#channelPopup',
      '#channel-popup',
      '.channel-popup',
      '#invitePopup',
      '#invite-popup'
    );

    const backdrop = getElement(
      '#channelBackdrop',
      '#channel-backdrop',
      '.channel-backdrop'
    );

    if (popup) {
      popup.style.display = '';
      popup.classList.add('show');
    }

    if (backdrop) {
      backdrop.style.display = '';
      backdrop.classList.add('show');
    }
  }

  function showHome() {
    closeInvite();

    if (openingTimer) {
      clearTimeout(openingTimer);
      openingTimer = null;
    }

    if (opening) {
      opening.style.display = 'none';
      opening.classList.add('hidden');
    }

    showPage(home);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showPayment() {
    closeInvite();

    if (openingTimer) {
      clearTimeout(openingTimer);
      openingTimer = null;
    }

    if (opening) {
      opening.style.display = 'none';
      opening.classList.add('hidden');
    }

    showPage(payment);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function notify(message) {
    const toast = getElement('#toast', '#toastMessage', '.toast');

    if (toast) {
      toast.textContent = message;
      toast.classList.add('show');

      setTimeout(function () {
        toast.classList.remove('show');
      }, 2500);
    } else {
      alert(message);
    }
  }

  function getFirebase() {
    if (typeof firebase === 'undefined') return false;

    try {
      if (!firebase.apps.length) {
        return false;
      }

      database = firebase.database();
      auth = firebase.auth();

      return true;
    } catch (error) {
      console.error('Firebase:', error);
      return false;
    }
  }

  function ensureAuth() {
    if (!auth) return Promise.resolve(null);

    if (auth.currentUser) {
      return Promise.resolve(auth.currentUser);
    }

    return auth.signInAnonymously()
      .then(function (credential) {
        return credential.user;
      })
      .catch(function (error) {
        console.error('Login anonim gagal:', error);
        return null;
      });
  }

  function saveTransaction(order) {
    try {
      const key = 'danzzcenzz_transaction_history';
      const history = JSON.parse(localStorage.getItem(key) || '[]');

      history.unshift({
        ...order,
        savedAt: new Date().toISOString()
      });

      localStorage.setItem(key, JSON.stringify(history.slice(0, 50)));
    } catch (error) {
      console.error('Riwayat transaksi:', error);
    }
  }

  function createOrder(product) {
    const order = {
      id: 'DZ' + Date.now(),
      productId: product.id || '',
      productName: product.name || product.nama || 'Produk',
      price: Number(product.price || product.harga || 0),
      status: 'Menunggu pembayaran',
      createdAt: new Date().toISOString()
    };

    currentOrder = order;
    saveTransaction(order);

    return ensureAuth().then(function (user) {
      if (!database || !user) return order;

      return database.ref('orders').push({
        ...order,
        userId: user.uid,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      }).then(function (reference) {
        order.firebaseId = reference.key;
        currentOrder = order;
        return order;
      }).catch(function (error) {
        console.error('Simpan pesanan gagal:', error);
        return order;
      });
    });
  }

  function updateText(selectors, value) {
    const element = getElement(...selectors);
    if (element && value !== undefined && value !== null) {
      element.textContent = value;
    }
  }

  function updateImage(selectors, url) {
    const element = getElement(...selectors);
    if (element && url) {
      element.src = url;
      element.style.display = '';
    }
  }

  function applySettings(data) {
    if (!data) return;

    settings = data;

    if (data.siteName) {
      updateText(
        ['#siteName', '#storeName', '.site-name', '.store-name'],
        data.siteName
      );

      document.title = data.siteName;
    }

    if (data.adminWhatsApp) {
      adminWhatsApp = String(data.adminWhatsApp).replace(/\D/g, '');
    }

    if (data.primaryColor) {
      document.documentElement.style.setProperty(
        '--primary-color',
        data.primaryColor
      );
    }

    if (data.backgroundColor) {
      document.documentElement.style.setProperty(
        '--background-color',
        data.backgroundColor
      );
    }

    if (data.logo) {
      updateImage(['#logo', '#storeLogo', '.store-logo'], data.logo);
    }

    if (data.banner) {
      updateImage(['#banner', '#storeBanner', '.store-banner'], data.banner);
    }
  }

  function renderProducts(items) {
    products = Array.isArray(items)
      ? items
      : Object.entries(items || {}).map(function ([id, item]) {
          return { id, ...item };
        });

    const container = getElement(
      '#productsContainer',
      '#productList',
      '#products',
      '.products-container'
    );

    if (!container) return;

    container.innerHTML = products.map(function (item, index) {
      const name = item.name || item.nama || 'Produk';
      const price = Number(item.price || item.harga || 0);
      const image = item.image || item.gambar || item.photo || '';

      return `
        <div class="product-card">
          ${
            image
              ? `<img src="${escapeHTML(image)}"
                    alt="${escapeHTML(name)}"
                    loading="lazy">`
              : ''
          }
          <h3>${escapeHTML(name)}</h3>
          <p>${formatRupiah(price)}</p>
          <button type="button"
            class="buy-product-btn"
            data-product-index="${index}">
            Beli Sekarang
          </button>
        </div>
      `;
    }).join('');
  }

  function openWhatsApp(order) {
    const message = [
      'Halo Admin DANZZCENZZ STORE, saya ingin konfirmasi pesanan.',
      '',
      'ID Pesanan: ' + order.id,
      'Produk: ' + order.productName,
      'Harga: ' + formatRupiah(order.price),
      'Status: ' + order.status
    ].join('\n');

    const url =
      'https://wa.me/' +
      adminWhatsApp +
      '?text=' +
      encodeURIComponent(message);

    window.open(url, '_blank');
  }

  function handleBuy(product) {
    if (!product) return;

    currentProduct = product;

    const name = product.name || product.nama || 'Produk';
    const price = Number(product.price || product.harga || 0);

    updateText(
      ['#paymentProductName', '#selectedProductName', '#productName'],
      name
    );

    updateText(
      ['#paymentPrice', '#selectedProductPrice', '#productPrice'],
      formatRupiah(price)
    );

    const paymentImage = getElement(
      '#paymentProductImage',
      '#selectedProductImage'
    );

    if (paymentImage) {
      const image = product.image || product.gambar || product.photo;

      if (image) {
        paymentImage.src = image;
        paymentImage.style.display = '';
      }
    }

    showPayment();
  }

  document.addEventListener('click', function (event) {
    const target = event.target.closest('button, a, [data-action]');

    if (!target) return;

    if (
      target.matches(
        '#skipOpening, #skip-opening, .skip-opening, [data-action="skip"]'
      )
    ) {
      event.preventDefault();
      showHome();
      return;
    }

    if (
      target.matches(
        '#closePopup, #close-popup, .close-popup, [data-action="close-popup"]'
      )
    ) {
      event.preventDefault();
      closeInvite();
      return;
    }

    if (
      target.matches(
        '#joinChannel, #join-channel, .join-channel, [data-action="join-channel"]'
      )
    ) {
      target.setAttribute('target', '_blank');
      target.setAttribute('rel', 'noopener noreferrer');
      target.setAttribute('href', CHANNEL_URL);
      closeInvite();
      return;
    }

    if (
      target.matches(
        '#backHome, #back-home, .back-home, [data-action="home"]'
      )
    ) {
      event.preventDefault();
      showHome();
      return;
    }

    if (
      target.matches(
        '#confirmPayment, #confirm-payment, .confirm-payment, [data-action="confirm-payment"]'
      )
    ) {
      event.preventDefault();

      if (!currentProduct) {
        notify('Pilih produk terlebih dahulu.');
        return;
      }

      createOrder(currentProduct).then(function (order) {
        openWhatsApp(order);
      });

      return;
    }

    const buyButton = target.closest(
      '.buy-product-btn, .buy-btn, [data-product-index]'
    );

    if (buyButton) {
      const index = Number(buyButton.dataset.productIndex);

      if (Number.isInteger(index) && products[index]) {
        handleBuy(products[index]);
      }
    }
  });

  const channelBackdrop = getElement(
    '#channelBackdrop',
    '#channel-backdrop',
    '.channel-backdrop'
  );

  if (channelBackdrop) {
    channelBackdrop.addEventListener('click', closeInvite);
  }

  const horizontalPages = getElement(
    '#horizontalPages',
    '.horizontal-pages',
    '.page-container'
  );

  if (horizontalPages) {
    horizontalPages.addEventListener('scroll', function () {
      document.dispatchEvent(new CustomEvent('store:page-scroll'));
    }, { passive: true });
  }

  if (getFirebase()) {
    ensureAuth();

    database.ref('settings').on('value', function (snapshot) {
      applySettings(snapshot.val());
    }, function (error) {
      console.error('Pengaturan gagal dimuat:', error);
    });

    database.ref('products').on('value', function (snapshot) {
      renderProducts(snapshot.val() || {});
    }, function (error) {
      console.error('Produk gagal dimuat:', error);
    });
  }

  if (opening) {
    opening.style.display = '';
    opening.classList.remove('hidden', 'leaving');
  }

  if (home) {
    home.classList.add('hidden');
    home.style.display = 'none';
  }

  if (payment) {
    payment.classList.add('hidden');
    payment.style.display = 'none';
  }

  openingTimer = setTimeout(function () {
    showInvite();
  }, 3000);
});