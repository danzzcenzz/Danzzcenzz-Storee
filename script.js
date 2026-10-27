document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  const $ = id => document.getElementById(id);

  const opening = $('opening');
  const skipBtn = $('skipBtn');
  const home = $('home');
  const payment = $('payment');
  const channelWidget = $('channelWidget');
  const channelBackdrop = $('channelBackdrop');
  const closeChannelWidget = $('closeChannelWidget');
  const selectedService = $('selectedService');
  const paymentPrice = $('paymentPrice');
  const confirmPayment = $('confirmPayment');
  const backHome = $('backHome');

  const CHANNEL_URL =
    'https://whatsapp.com/channel/0029Vb90a8bLY6dGF3QxZR0W';

  let database = null;
  let auth = null;
  let pendingService = null;
  let pendingOrder = null;
  let adminWhatsApp = '62882000379621';
  let products = [];

  // FIX OPENING: PASTIKAN HALAMAN UTAMA BISA DIBUKA

  function showHome() {
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

    closeChannel();
    window.scrollTo(0, 0);
  }

  function showInvite() {
    showHome();

    if (channelBackdrop) {
      channelBackdrop.classList.add('show');
      channelBackdrop.style.display = 'block';
    }

    if (channelWidget) {
      channelWidget.classList.add('show');
      channelWidget.style.display = 'block';
    }
  }

  function closeChannel() {
    if (channelWidget) {
      channelWidget.classList.remove('show');
      channelWidget.style.display = 'none';
    }

    if (channelBackdrop) {
      channelBackdrop.classList.remove('show');
      channelBackdrop.style.display = 'none';
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

    if (payment) {
      payment.classList.remove('hidden');
      payment.style.display = '';
    }

    window.scrollTo(0, 0);
  }

  // TOMBOL SKIP

  if (skipBtn) {
    skipBtn.addEventListener('click', function (event) {
      event.preventDefault();
      showHome();
    });
  }

  // PAKSA OPENING SELESAI SETELAH 3 DETIK

  setTimeout(function () {
    if (opening && !opening.classList.contains('hidden')) {
      showHome();
    }
  }, 3000);

  // TOMBOL POPUP CHANNEL

  if (closeChannelWidget) {
    closeChannelWidget.addEventListener('click', closeChannel);
  }

  if (channelBackdrop) {
    channelBackdrop.addEventListener('click', closeChannel);
  }

  if (channelWidget) {
    const channelLink = channelWidget.querySelector('a');

    if (channelLink) {
      channelLink.href = CHANNEL_URL;
      channelLink.target = '_blank';
      channelLink.rel = 'noopener noreferrer';
    }
  }

  // FIREBASE

  try {
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
      database = firebase.database();
      auth = firebase.auth();

      auth.signInAnonymously().catch(function (error) {
        console.error('Firebase Auth:', error);
      });

      // PENGATURAN TOKO

      database.ref('settings').on('value', function (snapshot) {
        const settings = snapshot.val();

        if (!settings) return;

        if (settings.siteName) {
          document.title = settings.siteName;

          document.querySelectorAll(
            '#siteName, #storeName, .site-name, .store-name'
          ).forEach(function (element) {
            element.textContent = settings.siteName;
          });
        }

        if (settings.adminWhatsApp) {
          adminWhatsApp = String(settings.adminWhatsApp)
            .replace(/\D/g, '');
        }

        if (settings.primaryColor) {
          document.documentElement.style.setProperty(
            '--primary-color',
            settings.primaryColor
          );
        }

        if (settings.backgroundColor) {
          document.documentElement.style.setProperty(
            '--background-color',
            settings.backgroundColor
          );
        }

        if (settings.logo) {
          document.querySelectorAll(
            '#logo, #storeLogo, .store-logo'
          ).forEach(function (element) {
            element.src = settings.logo;
          });
        }

        if (settings.banner) {
          document.querySelectorAll(
            '#banner, #storeBanner, .store-banner'
          ).forEach(function (element) {
            element.src = settings.banner;
          });
        }
      });

      // PRODUK FIREBASE

      database.ref('products').on('value', function (snapshot) {
        const data = snapshot.val() || {};

        products = Object.entries(data).map(function ([id, item]) {
          return { id, ...item };
        });

        renderProducts();
      });
    }
  } catch (error) {
    console.error('Firebase error:', error);
  }

  // RENDER PRODUK

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

  function rupiah(value) {
    return 'Rp' + Number(value || 0).toLocaleString('id-ID');
  }

  function renderProducts() {
    const container =
      $('productsContainer') ||
      $('productList') ||
      $('products');

    if (!container) return;

    container.innerHTML = products.map(function (product, index) {
      const name = product.name || product.nama || 'Produk';
      const price = product.price ?? product.harga ?? 0;
      const image = product.image || product.gambar || '';

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
          <p>${rupiah(price)}</p>
          <button type="button"
                  class="buy-product-btn"
                  data-product-index="${index}">
            Beli Sekarang
          </button>
        </div>
      `;
    }).join('');
  }

  // PILIH PRODUK

  function selectProduct(product) {
    if (!product) return;

    pendingService = product;

    if (selectedService) {
      selectedService.textContent =
        product.name || product.nama || 'Produk';
    }

    if (paymentPrice) {
      paymentPrice.textContent = rupiah(
        product.price ?? product.harga ?? 0
      );
    }

    showPayment();
  }

  document.addEventListener('click', function (event) {
    const button = event.target.closest(
      '.buy-product-btn, .buy-btn, [data-product-index]'
    );

    if (!button) return;

    const index = Number(button.dataset.productIndex);

    if (Number.isInteger(index) && products[index]) {
      selectProduct(products[index]);
    }
  });

  // KEMBALI KE BERANDA

  if (backHome) {
    backHome.addEventListener('click', function (event) {
      event.preventDefault();
      showHome();
    });
  }

  // KONFIRMASI PESANAN

  if (confirmPayment) {
    confirmPayment.addEventListener('click', async function (event) {
      event.preventDefault();

      if (!pendingService) {
        alert('Silakan pilih produk terlebih dahulu.');
        return;
      }

      const productName =
        pendingService.name ||
        pendingService.nama ||
        'Produk';

      const price = Number(
        pendingService.price ?? pendingService.harga ?? 0
      );

      const order = {
        id: 'DZ' + Date.now(),
        productId: pendingService.id || '',
        productName: productName,
        price: price,
        status: 'Menunggu pembayaran',
        createdAt: new Date().toISOString()
      };

      pendingOrder = order;

      // SIMPAN RIWAYAT LOKAL

      try {
        const history = JSON.parse(
          localStorage.getItem('danzzcenzz_transaction_history') || '[]'
        );

        history.unshift(order);

        localStorage.setItem(
          'danzzcenzz_transaction_history',
          JSON.stringify(history.slice(0, 50))
        );
      } catch (error) {
        console.error('Riwayat:', error);
      }

      // SIMPAN KE FIREBASE

      if (database && auth && auth.currentUser) {
        try {
          const reference = await database.ref('orders').push({
            ...order,
            userId: auth.currentUser.uid,
            createdAt: firebase.database.ServerValue.TIMESTAMP
          });

          order.firebaseId = reference.key;
        } catch (error) {
          console.error('Simpan pesanan:', error);
        }
      }

      // BUKA WHATSAPP ADMIN

      const message = [
        'Halo Admin DANZZCENZZ STORE.',
        '',
        'ID Pesanan: ' + order.id,
        'Produk: ' + productName,
        'Harga: ' + rupiah(price),
        'Status: ' + order.status
      ].join('\n');

      window.open(
        'https://wa.me/' +
          adminWhatsApp +
          '?text=' +
          encodeURIComponent(message),
        '_blank'
      );
    });
  }

  // NAVIGASI HALAMAN

  const pageIds = {
    homeNav: 'homePage',
    historyNav: 'historyPage',
    profileNav: 'profilePage'
  };

  Object.entries(pageIds).forEach(function ([navId, pageId]) {
    const nav = $(navId);
    const page = $(pageId);

    if (!nav || !page) return;

    nav.addEventListener('click', function (event) {
      event.preventDefault();

      document.querySelectorAll(
        '#homePage, #historyPage, #profilePage'
      ).forEach(function (element) {
        element.classList.add('hidden');
      });

      page.classList.remove('hidden');

      document.querySelectorAll(
        '#homeNav, #historyNav, #profileNav'
      ).forEach(function (element) {
        element.classList.remove('active');
      });

      nav.classList.add('active');
    });
  });

  // TAMPILKAN RIWAYAT TRANSAKSI

  function renderHistory() {
    const container = $('transactionHistory');

    if (!container) return;

    let history = [];

    try {
      history = JSON.parse(
        localStorage.getItem('danzzcenzz_transaction_history') || '[]'
      );
    } catch (error) {
      console.error(error);
    }

    if (!history.length) {
      container.innerHTML = '<p>Belum ada riwayat transaksi.</p>';
      return;
    }

    container.innerHTML = history.map(function (order) {
      return `
        <div class="transaction-item">
          <h3>${escapeHTML(order.productName)}</h3>
          <p>ID: ${escapeHTML(order.id)}</p>
          <p>${rupiah(order.price)}</p>
          <p>${escapeHTML(order.status)}</p>
        </div>
      `;
    }).join('');
  }

  renderHistory();

  // PASTIKAN HALAMAN AWAL TIDAK TERKUNCI

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