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

const HISTORY_KEY = 'danzzcenzz_transaction_history';
const CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb90a8bLY6dGF3QxZR0W';

let pendingService = null;
let database = null;
let auth = null;
let adminWhatsApp = '62882000379621';
let isSubmitting = false;
let openingFinished = false;
let channelShown = false;

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

/* VIDEO HEADER */

if (headerVideo) {
headerVideo.muted = true;
headerVideo.playsInline = true;
}

async function playHeaderVideo() {
if (!headerVideo) return;

try {
  await headerVideo.play();
} catch (error) {
  console.warn('Video belum dapat diputar:', error);
}

}

/* POPUP WHATSAPP */

function closeChannel() {
channelShown = false;

[channelWidget, channelBackdrop].forEach(function (element) {
  if (!element) return;

  element.classList.add('hidden');
  element.classList.remove('show');
  element.style.display = 'none';
  element.setAttribute('aria-hidden', 'true');
});

document.body.classList.remove('channel-open');

}

function openChannel() {
if (!channelWidget || !channelBackdrop) return;

if (channelShown) return;

channelShown = true;

[channelBackdrop, channelWidget].forEach(function (element) {
  element.classList.remove('hidden');
  element.classList.add('show');
  element.style.display = 'block';
  element.setAttribute('aria-hidden', 'false');
});

channelWidget.style.display = 'block';
channelBackdrop.style.display = 'block';

const joinButton = channelWidget.querySelector('.channel-join');

if (joinButton) {
  joinButton.href = CHANNEL_URL;
  joinButton.target = '_blank';
  joinButton.rel = 'noopener noreferrer';
}

}

function showHome(showInvite = false) {
if (opening) {
opening.classList.add('leaving');

  window.setTimeout(function () {
    opening.classList.add('hidden');
    opening.style.display = 'none';
  }, 560);
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

if (showInvite) {
  openChannel();
} else {
  closeChannel();
}

if (headerVideo) {
  headerVideo.muted = true;
  playHeaderVideo();
}

if (horizontalPages) {
  horizontalPages.scrollLeft = 0;
}

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
  showHome(false);
  return;
}

payment.classList.remove('hidden');
payment.style.display = '';

document.body.classList.remove('opening-active');

window.scrollTo(0, 0);

}

if (skipBtn) {
skipBtn.addEventListener('click', function (event) {
event.preventDefault();

  if (!openingFinished) {
    showHome(true);
  }
});

}

/* OTOMATIS LEWATI OPENING */

window.setTimeout(function () {
if (!openingFinished) {
showHome(true);
}
}, 3000);

/* TOMBOL X POPUP */

if (closeChannelWidget) {
closeChannelWidget.addEventListener('click', function (event) {
event.preventDefault();
event.stopPropagation();
closeChannel();
});
}

/* KLIK AREA GELAP UNTUK MENUTUP POPUP */

if (channelBackdrop) {
channelBackdrop.addEventListener('click', function (event) {
event.preventDefault();
closeChannel();
});
}

/* FIREBASE */

try {
if (
typeof firebase !== 'undefined' &&
firebase.apps &&
firebase.apps.length
) {
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

/* PILIH PRODUK */

function selectProduct(name, price, productId = '') {
const numericPrice = Number(price);

if (
  !name ||
  price === undefined ||
  price === null ||
  price === '' ||
  !Number.isFinite(numericPrice) ||
  numericPrice < 0
) {
  alert('Data produk tidak valid.');
  return;
}

pendingService = {
  id: productId,
  name: String(name),
  price: numericPrice
};

if (selectedService) {
  selectedService.textContent = pendingService.name;
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

  const productName =
    buyButton.dataset.service ||
    buyButton.dataset.productName ||
    buyButton.getAttribute('data-name');

  const productPrice =
    buyButton.dataset.price ||
    buyButton.getAttribute('data-price');

  selectProduct(
    productName,
    productPrice,
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
backHome.addEventListener('click', function (event) {
event.preventDefault();
showHome(false);
});
}

/* RIWAYAT TRANSAKSI */

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
  const date = order.createdAt
    ? new Date(order.createdAt)
    : null;

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
      <span class="transaction-status">${escapeHTML(order.status || 'Menunggu pembayaran')}</span>
    </article>
  `;
}).join('');

}

/* KONFIRMASI PEMBAYARAN */

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

          const index = updatedHistory.findIndex(function (item) {
            return item.id === order.id;
          });

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

/* NAVIGASI BERANDA, RIWAYAT, PROFIL */

const navItems = [
{ nav: $('homeNav'), page: $('homePage') },
{ nav: $('historyNav'), page: $('historyPage') },
{ nav: $('profileNav'), page: $('profilePage') }
];

function setActiveNav(activeItem) {
navItems.forEach(function (item) {
if (!item.nav) return;

  item.nav.classList.remove('selected', 'active');

  if (item === activeItem) {
    item.nav.classList.add('selected');
  }
});

}

navItems.forEach(function (item) {
if (!item.nav || !item.page) return;

item.nav.addEventListener('click', function (event) {
  event.preventDefault();

  setActiveNav(item);

  if (item.page.id === 'historyPage') {
    renderHistory();
  }

  if (horizontalPages) {
    const pages = Array.from(horizontalPages.children);
    const index = pages.indexOf(item.page);

    if (index >= 0) {
      horizontalPages.scrollTo({
        left: index * horizontalPages.clientWidth,
        behavior: 'smooth'
      });
    } else {
      horizontalPages.scrollTo({
        left: item.page.offsetLeft,
        behavior: 'smooth'
      });
    }
  }
});

});

/* UPDATE NAVIGASI SAAT HALAMAN DIGESER */

if (horizontalPages) {
let scrollTimer;

horizontalPages.addEventListener('scroll', function () {
  window.clearTimeout(scrollTimer);

  scrollTimer = window.setTimeout(function () {
    const pages = Array.from(horizontalPages.children);

    if (!pages.length || !horizontalPages.clientWidth) return;

    const index = Math.round(
      horizontalPages.scrollLeft / horizontalPages.clientWidth
    );

    const currentPage = pages[index];

    if (!currentPage) return;

    const matchingItem = navItems.find(function (item) {
      return item.page === currentPage;
    });

    if (matchingItem) {
      setActiveNav(matchingItem);

      if (currentPage.id === 'historyPage') {
        renderHistory();
      }
    }
  }, 100);
}, { passive: true });

}

/* KONDISI AWAL */

renderHistory();
closeChannel();

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

document.body.classList.add('opening-active');

setActiveNav(navItems[0]);
});