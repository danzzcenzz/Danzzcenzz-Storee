document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  const $ = id => document.getElementById(id);

  const opening = $('opening');
  const skipBtn = $('skipBtn');
  const home = $('home');
  const payment = $('payment');
  const backHome = $('backHome');
  const selectedService = $('selectedService');
  const paymentPrice = $('paymentPrice');
  const confirmPayment = $('confirmPayment');
  const channelWidget = $('channelWidget');
  const channelBackdrop = $('channelBackdrop');
  const closeChannelWidget = $('closeChannelWidget');
  const horizontalPages = $('horizontalPages');
  const historyContainer = $('transactionHistory');
  const headerVideo = $('headerVideo');
  const productGrid = $('productGrid');

  const HISTORY_KEY = 'danzzcenzz_transaction_history';
  const CHANNEL_URL =
    'https://whatsapp.com/channel/0029Vb90a8bLY6dGF3QxZR0W';

  let pendingService = null;
  let database = null;
  let auth = null;
  let adminWhatsApp = '62882000379621';
  let isSubmitting = false;
  let openingFinished = false;
  let channelShown = false;
  let productsLoaded = false;
  let orderListener = null;
  let settingsListener = null;

  const rupiah = value =>
    'Rp' + Number(value || 0).toLocaleString('id-ID');

  function normalizeWhatsApp(value) {
    let digits = String(value || '').replace(/\D/g, '');

    if (digits.startsWith('00')) {
      digits = digits.slice(2);
    }

    if (digits.startsWith('0')) {
      digits = '62' + digits.slice(1);
    } else if (digits.startsWith('8')) {
      digits = '62' + digits;
    }

    return digits;
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function safeImageURL(value) {
    try {
      const url = new URL(String(value || ''), window.location.href);

      if (url.protocol === 'https:' || url.protocol === 'http:') {
        return url.href;
      }
    } catch (_) {}

    return 'https://i.imgur.com/5glTUQl.jpeg';
  }

  document.body.classList.add('opening-active');

  if (headerVideo) {
    headerVideo.muted = true;
    headerVideo.volume = 1;
    headerVideo.playsInline = true;
  }

  /* =========================
     OPENING DAN NAVIGASI
  ========================= */

  function closeChannel() {
    [channelWidget, channelBackdrop].forEach(element => {
      if (!element) return;

      element.classList.add('hidden');
      element.classList.remove('show');
      element.style.display = 'none';
      element.setAttribute('aria-hidden', 'true');
    });
  }

  function openChannel() {
    if (!channelWidget || !channelBackdrop || channelShown) return;

    channelShown = true;

    [channelBackdrop, channelWidget].forEach(element => {
      element.style.display = '';
      element.classList.remove('hidden');
      element.classList.add('show');
      element.setAttribute('aria-hidden', 'false');
    });

    const link = channelWidget.querySelector('.channel-join');

    if (link) {
      link.href = CHANNEL_URL;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
  }

  function showHome(showInvite = false) {
    if (opening) {
      opening.classList.add('hidden');
      opening.classList.remove('leaving');
      opening.style.display = 'none';
    }

    if (payment) {
      payment.classList.add('hidden');
      payment.style.display = 'none';
    }

    if (home) {
      home.classList.remove('hidden');
      home.style.display = '';
    }

    document.body.classList.remove('opening-active');
    openingFinished = true;

    window.scrollTo(0, 0);

    if (horizontalPages) {
      horizontalPages.scrollLeft = 0;
    }

    if (headerVideo) {
      const playback = headerVideo.play();

      if (playback && playback.catch) {
        playback.catch(() => {});
      }
    }

    if (showInvite) {
      openChannel();
    } else {
      closeChannel();
    }
  }

  function showPayment() {
    closeChannel();

    if (opening) {
      opening.classList.add('hidden');
      opening.style.display = 'none';
    }

    if (home) {
      home.classList.add('hidden');
      home.style.display = 'none';
    }

    document.body.classList.remove('opening-active');

    if (!payment) {
      alert('Halaman pembayaran tidak ditemukan.');
      showHome(false);
      return;
    }

    payment.classList.remove('hidden');
    payment.style.display = '';

    window.scrollTo(0, 0);
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', event => {
      event.preventDefault();

      if (!openingFinished) {
        showHome(true);
      }
    });
  }

  window.setTimeout(() => {
    if (!openingFinished) {
      showHome(true);
    }
  }, 3000);

  if (closeChannelWidget) {
    closeChannelWidget.addEventListener('click', event => {
      event.preventDefault();
      closeChannel();

      if (headerVideo) {
        headerVideo.muted = false;
        headerVideo.volume = 1;

        const playback = headerVideo.play();

        if (playback && playback.catch) {
          playback.catch(error => {
            console.warn('Audio video tidak dapat diputar:', error);
          });
        }
      }
    });
  }

  if (channelBackdrop) {
    channelBackdrop.addEventListener('click', closeChannel);
  }

  /* =========================
     PENGATURAN WEBSITE
  ========================= */

  function setText(selector, value) {
    const element = document.querySelector(selector);

    if (element && value !== undefined && value !== null) {
      element.textContent = String(value);
    }
  }

  function setImage(selector, value) {
    const image = document.querySelector(selector);

    if (!image || !value) return;

    image.src = safeImageURL(value);
  }

  function applySettings(settings) {
    if (!settings) return;

    adminWhatsApp = settings.adminWhatsApp
      ? normalizeWhatsApp(settings.adminWhatsApp)
      : adminWhatsApp;

    if (settings.siteName) {
      document.title = settings.siteName;

      const openingTitle = document.querySelector('#opening h1');

      if (openingTitle) {
        openingTitle.textContent = settings.siteName;
      }

      const profileTitle = document.querySelector('#profilePage h3');

      if (profileTitle) {
        profileTitle.textContent = settings.siteName;
      }
    }

    if (settings.siteTitle) {
      const title = document.querySelector('.header-content h1');

      if (title) {
        title.textContent = settings.siteTitle;
      }
    }

    if (settings.siteDescription) {
      const description = document.querySelector('.header-content p');

      if (description) {
        description.textContent = settings.siteDescription;
      }
    }

    if (settings.siteTagline) {
      const tagline = document.querySelector('#opening .tagline');

      if (tagline) {
        tagline.textContent = settings.siteTagline;
      }
    }

    if (settings.productSectionTitle) {
      setText('.product-heading', settings.productSectionTitle);
    }

    if (settings.aboutTitle) {
      setText('#profilePage .info-panel h2', settings.aboutTitle);
    }

    if (settings.aboutDescription) {
      const profile = document.querySelector('#profilePage .info-panel');

      if (profile) {
        let description = profile.querySelector('[data-about-description]');

        if (!description) {
          description = document.createElement('p');
          description.dataset.aboutDescription = 'true';
          profile.appendChild(description);
        }

        description.textContent = settings.aboutDescription;
      }
    }

    if (settings.footerText) {
      let footer = document.querySelector('[data-store-footer]');

      if (!footer && home) {
        footer = document.createElement('div');
        footer.dataset.storeFooter = 'true';
        footer.className = 'small';
        footer.style.textAlign = 'center';
        footer.style.padding = '16px';

        home.appendChild(footer);
      }

      if (footer) {
        footer.textContent = settings.footerText;
      }
    }

    if (settings.siteColor || settings.primaryColor) {
      const color = settings.siteColor || settings.primaryColor;

      document.documentElement.style.setProperty('--primary-color', color);
      document.documentElement.style.setProperty('--primary', color);
    }

    if (settings.siteBackground || settings.backgroundColor) {
      const color = settings.siteBackground || settings.backgroundColor;

      document.documentElement.style.setProperty('--background-color', color);
    }

    if (settings.siteLogo) {
      setImage('#opening .brand-logo', settings.siteLogo);
      setImage('.header-content .brand-logo', settings.siteLogo);
    }

    if (settings.siteBanner) {
      const header = document.querySelector('.store-header');

      if (header) {
        header.style.backgroundImage =
          'linear-gradient(#10152255,#10152288),url("' +
          safeImageURL(settings.siteBanner).replace(/"/g, '%22') +
          '")';

        header.style.backgroundSize = 'cover';
        header.style.backgroundPosition = 'center';
      }
    }

    if (settings.orderButtonText) {
      document.querySelectorAll('.buy-button').forEach(button => {
        button.textContent = settings.orderButtonText;
      });
    }
  }

  /* =========================
     PRODUK DARI FIREBASE
  ========================= */

  function renderProducts(snapshot) {
    if (!productGrid) return;

    productsLoaded = true;

    const data = snapshot.val() || {};

    const products = Object.entries(data)
      .map(([id, product]) => ({
        id,
        ...(product || {})
      }))
      .filter(product =>
        product.active !== false &&
        product.hidden !== true &&
        String(product.name || '').trim() !== '' &&
        Number.isFinite(Number(product.price)) &&
        Number(product.price) >= 0
      )
      .sort((a, b) => {
        const orderA = Number(a.sortOrder ?? a.createdAt ?? 0);
        const orderB = Number(b.sortOrder ?? b.createdAt ?? 0);

        return orderA - orderB;
      });

    /*
     * Firebase berhasil dibaca tetapi tidak ada produk aktif:
     * jangan tampilkan produk bawaan HTML yang sudah tidak berlaku.
     */
    if (!products.length) {
      productGrid.innerHTML =
        '<p class="empty-products">Belum ada produk tersedia.</p>';

      return;
    }

    productGrid.innerHTML = products.map(product => {
      const name = escapeHTML(product.name);
      const price = Number(product.price);
      const image = escapeHTML(
        safeImageURL(product.image || product.imageUrl)
      );

      return `
        <article class="product-card">
          <img
            src="${image}"
            alt="${name}"
            loading="lazy"
            onerror="this.onerror=null;this.src='https://i.imgur.com/5glTUQl.jpeg'"
          >
          <h3>${name}</h3>
          <p class="product-price">${rupiah(price)}</p>
          <button
            type="button"
            class="buy-button"
            data-product-id="${escapeHTML(product.id)}"
            data-service="${name}"
            data-price="${price}"
          >BELI SEKARANG</button>
        </article>
      `;
    }).join('');
  }

  /* =========================
     RIWAYAT TRANSAKSI
  ========================= */

  function getHistory() {
    try {
      const history = JSON.parse(
        localStorage.getItem(HISTORY_KEY) || '[]'
      );

      return Array.isArray(history) ? history : [];
    } catch (error) {
      console.error('Membaca riwayat:', error);
      return [];
    }
  }

  function saveHistory(history) {
    try {
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history.slice(0, 50))
      );

      return true;
    } catch (error) {
      console.error('Menyimpan riwayat:', error);
      return false;
    }
  }

  function renderHistory() {
    if (!historyContainer) return;

    const history = getHistory();

    if (!history.length) {
      historyContainer.innerHTML =
        '<p>📂 Belum ada riwayat pesanan.</p>';

      return;
    }

    historyContainer.innerHTML = history.map(order => {
      const date = order.createdAt
        ? new Date(order.createdAt)
        : null;

      const dateText =
        date && !Number.isNaN(date.getTime())
          ? date.toLocaleString('id-ID')
          : '-';

      return `
        <article class="transaction-item">
          <strong>${escapeHTML(
            order.productName || order.name || 'Produk'
          )}</strong>
          <small>ID Pesanan: ${escapeHTML(order.id || '-')}</small>
          <small>Harga: ${rupiah(order.price)}</small>
          <small>Tanggal: ${escapeHTML(dateText)}</small>
          <span class="transaction-status">${escapeHTML(
            order.status || 'Menunggu Pembayaran'
          )}</span>
        </article>
      `;
    }).join('');
  }

  /*
   * Dengarkan perubahan pesanan dari Firebase.
   * Jika admin mengubah status, riwayat pada perangkat pelanggan
   * ikut diperbarui untuk pesanan yang sama.
   */
  function startOrderListener() {
    if (!database || !auth) return;

    if (orderListener) {
      database.ref('orders').off('value', orderListener);
    }

    orderListener = snapshot => {
      const firebaseOrders = [];

      snapshot.forEach(child => {
        const order = child.val() || {};

        if (auth.currentUser && order.userId === auth.currentUser.uid) {
          firebaseOrders.push({
            firebaseId: child.key,
            id: order.id || child.key,
            productId: order.productId || '',
            productName: order.productName || order.service || order.name || 'Produk',
            price: Number(order.price || 0),
            status: order.status || 'Menunggu Pembayaran',
            createdAt: order.createdAt || Date.now()
          });
        }
      });

      const history = getHistory();

      firebaseOrders.forEach(remoteOrder => {
        const index = history.findIndex(item =>
          item.firebaseId === remoteOrder.firebaseId ||
          item.id === remoteOrder.id
        );

        if (index >= 0) {
          history[index] = {
            ...history[index],
            ...remoteOrder
          };
        } else {
          history.unshift(remoteOrder);
        }
      });

      saveHistory(history);
      renderHistory();
    };

    database.ref('orders').on(
      'value',
      orderListener,
      error => {
        console.error('Membaca pesanan Firebase:', error);
      }
    );
  }

  /* =========================
     FIREBASE
  ========================= */

  try {
    if (
      typeof firebase !== 'undefined' &&
      firebase.apps &&
      firebase.apps.length
    ) {
      database = firebase.database();
      auth = firebase.auth();

      auth.signInAnonymously()
        .then(() => {
          startOrderListener();
        })
        .catch(error => {
          console.error('Login Firebase anonim gagal:', error);
        });

      if (settingsListener) {
        database.ref('settings').off('value', settingsListener);
      }

      settingsListener = snapshot => {
        applySettings(snapshot.val() || {});
      };

      database.ref('settings').on(
        'value',
        settingsListener,
        error => {
          console.error('Pengaturan Firebase:', error);
        }
      );

      database.ref('products').on(
        'value',
        renderProducts,
        error => {
          console.error('Katalog Firebase gagal dimuat:', error);

          if (productGrid && !productsLoaded) {
            productGrid.insertAdjacentHTML(
              'beforeend',
              '<p class="firebase-error">Produk belum dapat dimuat. Periksa koneksi atau aturan Firebase.</p>'
            );
          }
        }
      );
    }
  } catch (error) {
    console.error('Firebase tidak dapat diinisialisasi:', error);
  }

  /* =========================
     PILIH PRODUK
  ========================= */

  function selectProduct(name, price, productId = '') {
    const numericPrice = Number(price);

    if (
      !name ||
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      alert('Data produk tidak valid.');
      return;
    }

    pendingService = {
      id: productId,
      name,
      price: numericPrice
    };

    if (selectedService) {
      selectedService.textContent = name;
    }

    if (paymentPrice) {
      paymentPrice.textContent = 'Harga: ' + rupiah(numericPrice);
    }

    showPayment();
  }

  document.addEventListener('click', event => {
    const target = event.target;

    if (!(target instanceof Element)) return;

    const buyButton = target.closest(
      '.buy-button, .buy-product-btn, .buy-btn, [data-product-index]'
    );

    if (buyButton) {
      event.preventDefault();

      const name =
        buyButton.dataset.service ||
        buyButton.dataset.productName ||
        buyButton.querySelector('h3')?.textContent;

      selectProduct(
        name,
        buyButton.dataset.price,
        buyButton.dataset.productId || ''
      );

      return;
    }

    const serviceButton = target.closest('.service-card');

    if (serviceButton) {
      event.preventDefault();

      const name = serviceButton.dataset.service || 'Layanan';
      const description = serviceButton.dataset.description || '';

      alert(
        name +
        (description ? '\n' + description : '') +
        '\n\nSilakan hubungi admin untuk informasi layanan ini.'
      );
    }
  });

  if (backHome) {
    backHome.addEventListener('click', event => {
      event.preventDefault();
      showHome(false);
    });
  }

  /* =========================
     KONFIRMASI DAN SIMPAN PESANAN
  ========================= */

  if (confirmPayment) {
    confirmPayment.addEventListener('click', async event => {
      event.preventDefault();

      if (isSubmitting) return;

      if (!pendingService) {
        alert('Silakan pilih produk terlebih dahulu.');
        return;
      }

      if (!database || !auth) {
        alert(
          'Koneksi Firebase belum tersedia. ' +
          'Pesanan belum bisa disimpan. Periksa koneksi internet.'
        );

        return;
      }

      isSubmitting = true;
      confirmPayment.style.pointerEvents = 'none';

      const originalText = confirmPayment.textContent;
      confirmPayment.textContent = 'MENYIMPAN PESANAN...';

      try {
        let currentUser = auth.currentUser;

        if (!currentUser) {
          const credential = await auth.signInAnonymously();
          currentUser = credential.user;
        }

        if (!currentUser) {
          throw new Error('Login pelanggan ke Firebase gagal.');
        }

        const orderId = 'DZ' + Date.now();

        const orderData = {
          id: orderId,
          userId: currentUser.uid,
          customer: 'Pelanggan Website',
          productId: pendingService.id || '',
          productName: pendingService.name,
          service: pendingService.name,
          price: Number(pendingService.price),
          status: 'Menunggu Pembayaran',
          createdAt: firebase.database.ServerValue.TIMESTAMP
        };

        /*
         * Simpan ke path "orders", sama seperti yang dibaca admin.
         * Jika Firebase menolak penulisan, proses dihentikan dan
         * pelanggan diberi pesan, bukan menganggap pesanan tersimpan.
         */
        const reference = await database.ref('orders').push(orderData);

        const localOrder = {
          ...orderData,
          firebaseId: reference.key,
          createdAt: Date.now()
        };

        const history = getHistory();
        history.unshift(localOrder);
        saveHistory(history);
        renderHistory();

        const phone = normalizeWhatsApp(adminWhatsApp);

        if (!phone || phone.length < 10 || phone.length > 15) {
          alert(
            'Pesanan sudah tersimpan di sistem, tetapi nomor WhatsApp admin belum valid. ' +
            'Periksa pengaturan Nomor WhatsApp Admin.'
          );

          return;
        }

        const message = [
          'Halo Admin DANZZCENZZ STORE.',
          '',
          'Saya ingin konfirmasi pesanan.',
          'ID Pesanan: ' + orderId,
          'Produk: ' + pendingService.name,
          'Harga: ' + rupiah(pendingService.price),
          'Status: Menunggu Pembayaran',
          '',
          'Saya akan mengirimkan bukti pembayaran.'
        ].join('\n');

        window.location.href =
          'https://wa.me/' +
          phone +
          '?text=' +
          encodeURIComponent(message);

      } catch (error) {
        console.error('Gagal menyimpan pesanan:', error);

        alert(
          'Pesanan gagal disimpan ke Firebase.\n\n' +
          'Detail: ' + (error.message || 'Kesalahan tidak diketahui') +
          '\n\nJangan tutup halaman ini dulu. Periksa koneksi dan aturan Firebase, lalu coba lagi.'
        );

      } finally {
        isSubmitting = false;
        confirmPayment.style.pointerEvents = '';
        confirmPayment.textContent = originalText;
      }
    });
  }

  /* =========================
     NAVIGASI BAWAH
  ========================= */

  const navItems = [
    { nav: $('homeNav'), page: $('homePage') },
    { nav: $('historyNav'), page: $('historyPage') },
    { nav: $('profileNav'), page: $('profilePage') }
  ];

  navItems.forEach(item => {
    if (!item.nav || !item.page) return;

    item.nav.addEventListener('click', event => {
      event.preventDefault();

      navItems.forEach(other => {
        if (other.nav) {
          other.nav.classList.remove('selected', 'active');
        }
      });

      item.nav.classList.add('selected', 'active');

      if (item.page.id === 'historyPage') {
        renderHistory();
      }

      if (horizontalPages) {
        horizontalPages.scrollTo({
          left: item.page.offsetLeft,
          behavior: 'smooth'
        });
      }
    });
  });

  /* =========================
     PEMULIHAN TAMPILAN
  ========================= */

  renderHistory();
  closeChannel();

  window.addEventListener('pageshow', function () {
    if (!openingFinished) {
      document.body.classList.add('opening-active');
    }
  });

  if (opening) {
    opening.classList.remove('hidden', 'leaving');
    opening.style.display = '';
  }

  if (home) {
    home.classList.add('hidden');
    home.style.display = 'none';
  }

  if (payment) {
    payment.classList.add('hidden');
    payment.style.display = 'none';
  }
});