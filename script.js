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

  const HISTORY_KEY = 'danzzcenzz_transaction_history';
  const CHANNEL_URL =
    'https://whatsapp.com/channel/0029Vb90a8bLY6dGF3QxZR0W';

  let pendingService = null;
  let database = null;
  let auth = null;
  let adminWhatsApp = '62882000379621';
  let isSubmitting = false;

  const rupiah = value =>
    'Rp' + Number(value || 0).toLocaleString('id-ID');

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

  function closeChannel() {
    [channelWidget, channelBackdrop].forEach(function (element) {
      if (!element) return;
      element.classList.add('hidden');
      element.classList.remove('show');
      element.style.display = 'none';
    });
  }

  function showHome() {
    if (opening) {
      opening.classList.add('hidden');
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
    closeChannel();

    if (opening) {
      opening.classList.add('hidden');
      opening.style.display = 'none';
    }

    if (home) {
      home.classList.add('hidden');
      home.style.display = 'none';
    }

    if (!payment) {
      alert('Halaman pembayaran tidak ditemukan.');
      showHome();
      return;
    }

    payment.classList.remove('hidden');
    payment.style.display = '';
    window.scrollTo(0, 0);
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', function (event) {
      event.preventDefault();
      showHome();
    });
  }

  setTimeout(showHome, 3000);

  if (closeChannelWidget) {
    closeChannelWidget.addEventListener('click', closeChannel);
  }

  if (channelBackdrop) {
    channelBackdrop.addEventListener('click', closeChannel);
  }

  if (channelWidget) {
    const channelLink = channelWidget.querySelector('.channel-join');

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
        console.error('Firebase login:', error);
      });

      database.ref('settings').on('value', function (snapshot) {
        const settings = snapshot.val();
        if (!settings) return;

        if (settings.adminWhatsApp) {
          adminWhatsApp = String(settings.adminWhatsApp).replace(/\D/g, '');
        }

        if (settings.siteName) {
          document.title = settings.siteName;
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
      }, function (error) {
        console.error('Pengaturan Firebase:', error);
      });
    }
  } catch (error) {
    console.error('Firebase:', error);
  }

  // PRODUK
  function selectProduct(name, price, productId = '') {
    const numericPrice = Number(price);

    if (!name || !Number.isFinite(numericPrice) || numericPrice < 0) {
      alert('Data produk tidak valid.');
      return;
    }

    pendingService = {
      id: productId,
      name: name,
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

  document.addEventListener('click', function (event) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const buyButton = target.closest(
      '.buy-button, .buy-product-btn, .buy-btn, [data-product-index]'
    );

    if (buyButton) {
      event.preventDefault();

      selectProduct(
        buyButton.dataset.service || buyButton.dataset.productName,
        buyButton.dataset.price
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
    backHome.addEventListener('click', function (event) {
      event.preventDefault();
      showHome();
    });
  }

  // RIWAYAT TRANSAKSI
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

    historyContainer.innerHTML = history.map(function (order) {
      const date = order.createdAt ? new Date(order.createdAt) : null;

      const dateText =
        date && !Number.isNaN(date.getTime())
          ? date.toLocaleString('id-ID')
          : '-';

      return `
        <article class="transaction-item">
          <strong>${escapeHTML(order.productName || order.name || 'Produk')}</strong>
          <small>ID Pesanan: ${escapeHTML(order.id || '-')}</small>
          <small>Harga: ${rupiah(order.price)}</small>
          <small>Tanggal: ${escapeHTML(dateText)}</small>
          <span class="transaction-status">
            ${escapeHTML(order.status || 'Menunggu pembayaran')}
          </span>
        </article>
      `;
    }).join('');
  }

  // KONFIRMASI PEMBAYARAN
  if (confirmPayment) {
    confirmPayment.addEventListener('click', async function (event) {
      event.preventDefault();

      if (isSubmitting) return;

      if (!pendingService) {
        alert('Silakan pilih produk terlebih dahulu.');
        return;
      }

      isSubmitting = true;
      confirmPayment.style.pointerEvents = 'none';

      const order = {
        id: 'DZ' + Date.now(),
        productId: pendingService.id || '',
        productName: pendingService.name,
        price: Number(pendingService.price),
        status: 'Menunggu pembayaran',
        createdAt: new Date().toISOString()
      };

      try {
        const history = getHistory();
        history.unshift(order);
        saveHistory(history);
        renderHistory();

        if (database && auth) {
          try {
            let currentUser = auth.currentUser;

            if (!currentUser) {
              const credential = await auth.signInAnonymously();
              currentUser = credential.user;
            }

            if (currentUser) {
              const reference = await database.ref('orders').push({
                ...order,
                userId: currentUser.uid,
                createdAt: firebase.database.ServerValue.TIMESTAMP
              });

              const updatedHistory = getHistory();
              const index = updatedHistory.findIndex(
                item => item.id === order.id
              );

              if (index !== -1) {
                updatedHistory[index].firebaseId = reference.key;
                saveHistory(updatedHistory);
              }
            }
          } catch (error) {
            console.error('Firebase menyimpan pesanan:', error);
          }
        }

        const message = [
          'Halo Admin DANZZCENZZ STORE.',
          '',
          'Saya ingin konfirmasi pesanan.',
          'ID Pesanan: ' + order.id,
          'Produk: ' + order.productName,
          'Harga: ' + rupiah(order.price),
          'Status: ' + order.status,
          '',
          'Saya akan mengirimkan bukti pembayaran.'
        ].join('\n');

        window.location.href =
          'https://wa.me/' +
          adminWhatsApp +
          '?text=' +
          encodeURIComponent(message);
      } catch (error) {
        console.error('Konfirmasi pesanan:', error);
        alert('Terjadi kesalahan saat memproses pesanan.');
      } finally {
        isSubmitting = false;
        confirmPayment.style.pointerEvents = '';
      }
    });
  }

  // NAVIGASI
  const navItems = [
    { nav: $('homeNav'), page: $('homePage') },
    { nav: $('historyNav'), page: $('historyPage') },
    { nav: $('profileNav'), page: $('profilePage') }
  ];

  navItems.forEach(function (item) {
    if (!item.nav || !item.page) return;

    item.nav.addEventListener('click', function (event) {
      event.preventDefault();

      navItems.forEach(function (other) {
        if (other.nav) {
          other.nav.classList.remove('selected', 'active');
        }
      });

      item.nav.classList.add('selected');

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

  // KONDISI AWAL
  renderHistory();

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