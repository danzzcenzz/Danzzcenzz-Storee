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
  const historyContainer = $('transactionHistory');

  const HISTORY_KEY = 'danzzcenzz_transaction_history';
  const CHANNEL_URL =
    'https://whatsapp.com/channel/0029Vb90a8bLY6dGF3QxZR0W';

  let database = null;
  let auth = null;
  let pendingService = null;
  let adminWhatsApp = '62882000379621';
  let firebaseProducts = [];

  // ==================================================
  // FUNGSI DASAR
  // ==================================================

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

  function getHistory() {
    try {
      const data = JSON.parse(
        localStorage.getItem(HISTORY_KEY) || '[]'
      );

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Gagal membaca riwayat:', error);
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
      console.error('Gagal menyimpan riwayat:', error);
      return false;
    }
  }

  // ==================================================
  // HALAMAN PEMBUKA DAN BERANDA
  // ==================================================

  function closeChannel() {
    if (channelWidget) {
      channelWidget.classList.remove('show');
      channelWidget.classList.add('hidden');
      channelWidget.style.display = 'none';
    }

    if (channelBackdrop) {
      channelBackdrop.classList.remove('show');
      channelBackdrop.classList.add('hidden');
      channelBackdrop.style.display = 'none';
    }
  }

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

  function showPayment() {
    if (!pendingService) return;

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

  if (skipBtn) {
    skipBtn.addEventListener('click', function (event) {
      event.preventDefault();
      showHome();
    });
  }

  setTimeout(function () {
    if (opening && !opening.classList.contains('hidden')) {
      showHome();
    }
  }, 3000);

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

  // ==================================================
  // FIREBASE
  // ==================================================

  try {
    if (
      typeof firebase !== 'undefined' &&
      firebase.apps &&
      firebase.apps.length
    ) {
      database = firebase.database();
      auth = firebase.auth();

      auth.signInAnonymously().catch(function (error) {
        console.error('Firebase Auth:', error);
      });

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

      database.ref('products').on('value', function (snapshot) {
        const data = snapshot.val() || {};

        firebaseProducts = Object.entries(data).map(function (entry) {
          return {
            id: entry[0],
            ...entry[1]
          };
        });

        renderFirebaseProducts();
      });
    }
  } catch (error) {
    console.error('Firebase error:', error);
  }

  // ==================================================
  // PRODUK FIREBASE
  // ==================================================

  function renderFirebaseProducts() {
    const container =
      $('productsContainer') ||
      $('productList') ||
      $('products');

    if (!container) return;

    container.innerHTML = firebaseProducts.map(function (product, index) {
      const name = product.name || product.nama || 'Produk';
      const price = Number(product.price ?? product.harga ?? 0);
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
          <p class="product-price">${rupiah(price)}</p>
          <button
            type="button"
            class="buy-product-btn"
            data-product-index="${index}">
            Beli Sekarang
          </button>
        </div>
      `;
    }).join('');
  }

  // ==================================================
  // PILIH PRODUK DAN BUKA PEMBAYARAN
  // ==================================================

  function selectProduct(product) {
    if (!product) {
      alert('Produk tidak ditemukan.');
      return;
    }

    const name =
      product.name ||
      product.nama ||
      product.service ||
      product.dataset?.service ||
      'Produk';

    const price = Number(
      product.price ??
      product.harga ??
      product.dataset?.price ??
      0
    );

    pendingService = {
      id: product.id || '',
      name: String(name),
      price: price
    };

    if (selectedService) {
      selectedService.textContent = pendingService.name;
    }

    if (paymentPrice) {
      paymentPrice.textContent = rupiah(pendingService.price);
    }

    showPayment();
  }

  // FIX UTAMA:
  // Mendukung .buy-button sesuai HTML website kamu,
  // juga tombol produk Firebase dan .buy-btn.

  document.addEventListener('click', function (event) {
    const target = event.target;

    if (!(target instanceof Element)) return;

    const button = target.closest(
      '.buy-button, .buy-product-btn, .buy-btn, [data-product-index]'
    );

    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    // Tombol produk yang berasal dari Firebase
    if (button.hasAttribute('data-product-index')) {
      const index = Number(button.dataset.productIndex);

      if (
        Number.isInteger(index) &&
        firebaseProducts[index]
      ) {
        selectProduct(firebaseProducts[index]);
        return;
      }
    }

    // Tombol produk yang sudah tertulis di HTML
    if (
      button.classList.contains('buy-button') ||
      button.classList.contains('buy-btn')
    ) {
      const serviceName =
        button.dataset.service ||
        button.dataset.name ||
        button.dataset.product ||
        button.closest('.product-card')?.querySelector('h3')?.textContent ||
        'Produk';

      const price = Number(
        button.dataset.price ||
        button.dataset.harga ||
        0
      );

      selectProduct({
        id: button.dataset.id || '',
        name: serviceName,
        price: price
      });
    }
  }, true);

  // ==================================================
  // KEMBALI DARI PEMBAYARAN
  // ==================================================

  if (backHome) {
    backHome.addEventListener('click', function (event) {
      event.preventDefault();
      showHome();
    });
  }

  // ==================================================
  // RIWAYAT TRANSAKSI RAPI
  // ==================================================

  function renderHistory() {
    const container = historyContainer;
    if (!container) return;

    const history = getHistory();

    if (!history.length) {
      container.innerHTML = `
        <div style="
          padding:24px 12px;
          text-align:center;
          background:#f4fcff;
          border:1px dashed #00bfff;
          border-radius:14px;
          color:#44515c;
        ">
          <div style="font-size:34px;margin-bottom:8px;">📦</div>
          <strong>Belum Ada Transaksi</strong>
          <p style="margin:7px 0 0;font-size:13px;">
            Pesanan kamu akan muncul di sini.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = history.map(function (order) {
      const name = order.productName || order.name || 'Produk';
      const id = order.id || '-';
      const price = Number(order.price || 0);
      const status = order.status || 'Menunggu pembayaran';

      let dateText = '-';

      if (order.createdAt) {
        const date = new Date(order.createdAt);

        if (!Number.isNaN(date.getTime())) {
          dateText = date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      }

      return `
        <article class="transaction-item" style="
          margin:12px 0;
          padding:14px;
          border:1px solid #b5edff;
          border-radius:14px;
          background:#ffffff;
          box-shadow:0 3px 12px rgba(0,150,220,.09);
          overflow-wrap:anywhere;
        ">
          <div style="
            display:flex;
            align-items:flex-start;
            justify-content:space-between;
            gap:10px;
          ">
            <strong style="
              display:block;
              flex:1;
              min-width:0;
              font-size:15px;
              line-height:1.4;
              color:#142238;
            ">${escapeHTML(name)}</strong>

            <span style="
              flex-shrink:0;
              font-size:14px;
              font-weight:900;
              color:#0077d9;
              white-space:nowrap;
            ">${rupiah(price)}</span>
          </div>

          <div style="
            margin-top:10px;
            padding-top:9px;
            border-top:1px solid #e6f3f8;
            color:#65717c;
            font-size:12px;
            line-height:1.8;
          ">
            <div>ID: ${escapeHTML(id)}</div>
            <div>Tanggal: ${escapeHTML(dateText)}</div>
          </div>

          <div style="
            display:inline-block;
            margin-top:9px;
            padding:5px 10px;
            border-radius:20px;
            background:#fff4d6;
            color:#815700;
            border:1px solid #f0cf79;
            font-size:11px;
            font-weight:900;
          ">
            ${escapeHTML(status)}
          </div>
        </article>
      `;
    }).join('');
  }

  renderHistory();

  // ==================================================
  // KONFIRMASI PESANAN
  // ==================================================

  let processingOrder = false;

  if (confirmPayment) {
    confirmPayment.addEventListener('click', async function (event) {
      event.preventDefault();

      if (processingOrder) return;

      if (!pendingService) {
        alert('Silakan pilih produk terlebih dahulu.');
        return;
      }

      processingOrder = true;
      confirmPayment.disabled = true;

      const originalText = confirmPayment.textContent;
      confirmPayment.textContent = 'Memproses pesanan...';

      try {
        const order = {
          id: 'DZ' + Date.now(),
          productId: pendingService.id || '',
          productName: pendingService.name,
          price: pendingService.price,
          status: 'Menunggu pembayaran',
          createdAt: new Date().toISOString()
        };

        // Simpan riwayat lokal agar langsung muncul
        const history = getHistory();
        history.unshift(order);
        saveHistory(history);
        renderHistory();

        // Simpan ke Firebase jika tersedia
        if (database) {
          try {
            if (auth && !auth.currentUser) {
              await auth.signInAnonymously();
            }

            const userId =
              auth && auth.currentUser
                ? auth.currentUser.uid
                : null;

            const firebaseOrder = {
              ...order,
              userId: userId,
              createdAt: firebase.database.ServerValue.TIMESTAMP
            };

            const reference = await database.ref('orders').push(
              firebaseOrder
            );

            order.firebaseId = reference.key;

            const updatedHistory = getHistory();
            const savedIndex = updatedHistory.findIndex(function (item) {
              return item.id === order.id;
            });

            if (savedIndex !== -1) {
              updatedHistory[savedIndex].firebaseId = reference.key;
              saveHistory(updatedHistory);
            }

            renderHistory();
          } catch (error) {
            console.error('Gagal menyimpan pesanan ke Firebase:', error);
          }
        }

        // Buka WhatsApp admin
        const message = [
          'Halo Admin DANZZCENZZ STORE.',
          '',
          'Saya ingin memesan:',
          'ID Pesanan: ' + order.id,
          'Produk: ' + order.productName,
          'Harga: ' + rupiah(order.price),
          'Status: ' + order.status,
          '',
          'Mohon instruksi pembayaran. Terima kasih.'
        ].join('\n');

        const whatsappURL =
          'https://wa.me/' +
          adminWhatsApp +
          '?text=' +
          encodeURIComponent(message);

        const whatsappWindow = window.open(
          whatsappURL,
          '_blank',
          'noopener,noreferrer'
        );

        if (!whatsappWindow) {
          alert(
            'Pesanan tersimpan. Jika WhatsApp tidak terbuka, ' +
            'izinkan pop-up atau buka WhatsApp secara manual.'
          );
        }
      } catch (error) {
        console.error('Gagal memproses pesanan:', error);
        alert('Terjadi kesalahan saat memproses pesanan.');
      } finally {
        processingOrder = false;
        confirmPayment.disabled = false;
        confirmPayment.textContent = originalText;
      }
    });
  }

  // ==================================================
  // NAVIGASI BAWAH: HOME, RIWAYAT, PROFIL
  // ==================================================

  const navItems = [
    { navId: 'homeNav', pageId: 'homePage', index: 0 },
    { navId: 'historyNav', pageId: 'historyPage', index: 1 },
    { navId: 'profileNav', pageId: 'profilePage', index: 2 }
  ];

  const horizontalPages =
    document.querySelector('.horizontal-pages');

  function activateNavigation(navId) {
    navItems.forEach(function (item) {
      const nav = $(item.navId);
      if (!nav) return;

      const active = item.navId === navId;

      nav.classList.toggle('selected', active);
      nav.classList.toggle('active', active);

      if (active) {
        nav.setAttribute('aria-current', 'page');
      } else {
        nav.removeAttribute('aria-current');
      }
    });
  }

  navItems.forEach(function (item) {
    const nav = $(item.navId);
    const page = $(item.pageId);

    if (!nav || !page) return;

    nav.addEventListener('click', function (event) {
      event.preventDefault();

      if (item.pageId === 'historyPage') {
        renderHistory();
      }

      if (horizontalPages) {
        horizontalPages.scrollTo({
          left: item.index * horizontalPages.clientWidth,
          behavior: 'smooth'
        });
      } else {
        page.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }

      activateNavigation(item.navId);
    });
  });

  // Perbarui navigasi saat halaman digeser dengan jari
  if (horizontalPages) {
    let scrollTimer;

    horizontalPages.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);

      scrollTimer = setTimeout(function () {
        const width = horizontalPages.clientWidth;
        if (!width) return;

        const index = Math.max(
          0,
          Math.min(
            navItems.length - 1,
            Math.round(horizontalPages.scrollLeft / width)
          )
        );

        activateNavigation(navItems[index].navId);

        if (index === 1) {
          renderHistory();
        }
      }, 100);
    });
  }

  // ==================================================
  // KONDISI AWAL
  // ==================================================

  if (opening) {
    opening.classList.remove('hidden', 'leaving');
    opening.style.display = '';
  }

  if (home) {
    home.classList.remove('hidden');
    home.style.display = '';
  }

  if (payment) {
    payment.classList.add('hidden');
    payment.style.display = 'none';
  }

  closeChannel();
  activateNavigation('homeNav');
});