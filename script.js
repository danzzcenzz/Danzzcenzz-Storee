const opening = document.getElementById('opening');
const home = document.getElementById('home');
const payment = document.getElementById('payment');
const channelWidget = document.getElementById('channelWidget');
const channelBackdrop = document.getElementById('channelBackdrop');

let openingTimer;
let pendingService = '';
let pendingPrice = 5000;
let paymentConfirmed = false;

const HISTORY_KEY = 'danzzcenzz_transaction_history';

/* =========================
   RIWAYAT TRANSAKSI
========================= */

function getTransactions() {
    try {
        return JSON.parse(
            localStorage.getItem(HISTORY_KEY) || '[]'
        );
    } catch (error) {
        return [];
    }
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function(char) {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return entities[char];
    });
}

function formatRupiah(amount) {
    return 'Rp' + Number(amount || 0).toLocaleString('id-ID');
}

function renderTransactions() {
    const container = document.getElementById('transactionHistory');

    if (!container) return;

    const items = getTransactions();

    if (!items.length) {
        container.innerHTML =
            '<p>📂 Belum ada riwayat pesanan.</p>';
        return;
    }

    container.innerHTML = items.map(function(item) {
        return `
            <article class="transaction-item">
                <strong>🛍️ ${escapeHTML(item.service || 'Pesanan')}</strong>
                <small>📅 ${escapeHTML(item.date || '-')}</small>
                <small>💵 Harga: ${formatRupiah(item.price ?? 5000)}</small>
                <span class="transaction-status">
                    ${escapeHTML(item.status || 'Menunggu verifikasi admin')}
                </span>
            </article>
        `;
    }).join('');
}

function saveTransaction(service, price) {
    const items = getTransactions();

    items.unshift({
        id: Date.now(),
        service: service,
        price: Number(price || 0),
        date: new Date().toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }),
        status: 'Menunggu verifikasi admin'
    });

    try {
        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(items.slice(0, 50))
        );

        renderTransactions();
    } catch (error) {
        alert('Riwayat tidak dapat disimpan. Periksa penyimpanan browser.');
    }
}

/* =========================
   OPENING DAN TOMBOL SKIP
========================= */

function showInvite() {
    clearTimeout(openingTimer);

    if (!opening || !home || !payment) return;

    opening.classList.add('hidden');
    opening.classList.remove('leaving');

    home.classList.remove('hidden');
    payment.classList.add('hidden');

    openChannelPopup();

    window.scrollTo(0, 0);
}

function openChannelPopup() {
    if (channelWidget) {
        channelWidget.classList.remove('hidden');
    }

    if (channelBackdrop) {
        channelBackdrop.classList.remove('hidden');
    }
}

function closeChannelPopup() {
    if (channelWidget) {
        channelWidget.classList.add('hidden');
    }

    if (channelBackdrop) {
        channelBackdrop.classList.add('hidden');
    }
}

function showHome() {
    clearTimeout(openingTimer);

    if (opening) {
        opening.classList.add('hidden');
        opening.classList.remove('leaving');
    }

    if (payment) {
        payment.classList.add('hidden');
    }

    if (home) {
        home.classList.remove('hidden');
    }

    closeChannelPopup();

    window.scrollTo(0, 0);
}

/* =========================
   PEMBAYARAN
========================= */

function showPayment(service, price = 5000) {
    if (!home || !payment) return;

    pendingService = service;
    pendingPrice = Number(price || 0);
    paymentConfirmed = false;

    home.classList.add('hidden');
    closeChannelPopup();
    payment.classList.remove('hidden');

    const selectedService =
        document.getElementById('selectedService');

    if (selectedService) {
        selectedService.textContent = 'Pesanan: ' + service;
    }

    const paymentPrice =
        document.getElementById('paymentPrice');

    if (paymentPrice) {
        paymentPrice.textContent =
            'Harga: ' + formatRupiah(pendingPrice);
    }

    const message =
        'Halo min, saya mau order ' + service +
        ' dengan harga ' + formatRupiah(pendingPrice) +
        '. Saya akan mengirim bukti pembayaran QRIS. Mohon diproses ya.';

    const confirmButton =
        document.getElementById('confirmPayment');

    if (confirmButton) {
        confirmButton.href =
            'https://wa.me/62882000379621?text=' +
            encodeURIComponent(message);
    }

    window.scrollTo(0, 0);
}

/* =========================
   EVENT TOMBOL SKIP
========================= */

const skipBtn = document.getElementById('skipBtn');

if (skipBtn) {
    skipBtn.addEventListener('click', function(event) {
        event.preventDefault();
        showInvite();
    });
}

/* =========================
   TOMBOL PRODUK
========================= */

document.querySelectorAll('.buy-button').forEach(function(button) {
    button.addEventListener('click', function() {
        const service = button.dataset.service || 'Produk';
        const price = Number(button.dataset.price || 10000);

        showPayment(service, price);
    });
});

/* =========================
   TOMBOL LAYANAN LAMA
========================= */

document.querySelectorAll('.service-card').forEach(function(button) {
    button.addEventListener('click', function() {
        showPayment(
            button.dataset.service || 'Layanan',
            Number(button.dataset.price || 5000)
        );
    });
});

/* =========================
   KEMBALI KE BERANDA
========================= */

const backHome = document.getElementById('backHome');

if (backHome) {
    backHome.addEventListener('click', function(event) {
        event.preventDefault();
        showHome();
    });
}

/* =========================
   KONFIRMASI PEMBAYARAN
========================= */

const confirmPayment =
    document.getElementById('confirmPayment');

if (confirmPayment) {
    confirmPayment.addEventListener('click', function() {
        if (pendingService && !paymentConfirmed) {
            saveTransaction(pendingService, pendingPrice);
            paymentConfirmed = true;
        }
    });
}

/* =========================
   POPUP JOIN SALURAN
========================= */

const closeChannelWidget =
    document.getElementById('closeChannelWidget');

if (closeChannelWidget) {
    closeChannelWidget.addEventListener('click', function(event) {
        event.preventDefault();
        closeChannelPopup();
    });
}

if (channelBackdrop) {
    channelBackdrop.addEventListener(
        'click',
        closeChannelPopup
    );
}

/* =========================
   NAVIGASI HALAMAN
========================= */

const horizontalPages =
    document.getElementById('horizontalPages');

const storePages = Array.from(
    document.querySelectorAll('.store-page')
);

const navLinks = [
    document.getElementById('homeNav'),
    document.getElementById('historyNav'),
    document.getElementById('profileNav')
].filter(Boolean);

let currentStorePage = 0;

function goStorePage(index) {
    if (!horizontalPages || !storePages.length) return;

    currentStorePage = Math.max(
        0,
        Math.min(index, storePages.length - 1)
    );

    const targetPage = storePages[currentStorePage];

    horizontalPages.scrollTo({
        left: targetPage.offsetLeft - horizontalPages.offsetLeft,
        behavior: 'smooth'
    });

    navLinks.forEach(function(link, i) {
        link.classList.toggle(
            'selected',
            i === currentStorePage
        );
    });
}

navLinks.forEach(function(link, index) {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        goStorePage(index);
    });
});

if (horizontalPages) {
    let touchStartX = 0;

    horizontalPages.addEventListener('touchstart', function(event) {
        touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    horizontalPages.addEventListener('touchend', function(event) {
        const delta =
            event.changedTouches[0].clientX - touchStartX;

        if (Math.abs(delta) > 45) {
            goStorePage(
                currentStorePage + (delta < 0 ? 1 : -1)
            );
        }
    }, { passive: true });

    horizontalPages.addEventListener('scroll', function() {
        if (!horizontalPages.clientWidth) return;

        const index = Math.round(
            horizontalPages.scrollLeft /
            horizontalPages.clientWidth
        );

        if (
            index !== currentStorePage &&
            index >= 0 &&
            index < storePages.length
        ) {
            currentStorePage = index;

            navLinks.forEach(function(link, i) {
                link.classList.toggle(
                    'selected',
                    i === index
                );
            });
        }
    }, { passive: true });
}

/* =========================
   MULAI WEBSITE
========================= */

renderTransactions();

/* Pastikan opening bisa dilewati setelah 3 detik */
openingTimer = setTimeout(function() {
    showInvite();
}, 3000);