document.addEventListener('DOMContentLoaded', function () {

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

    // RIWAYAT TRANSAKSI
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
        return String(value).replace(/[&<>"']/g, function (char) {
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
            container.innerHTML = '<p>📂 Belum ada riwayat pesanan.</p>';
            return;
        }

        container.innerHTML = items.map(function (item) {
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
            date: new Date().toLocaleString('id-ID'),
            status: 'Menunggu verifikasi admin'
        });

        try {
            localStorage.setItem(
                HISTORY_KEY,
                JSON.stringify(items.slice(0, 50))
            );

            renderTransactions();
        } catch (error) {
            alert('Riwayat tidak dapat disimpan.');
        }
    }

    // POPUP JOIN CHANNEL
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

    // BERPINDAH DARI OPENING KE BERANDA
function showHome() {
    clearTimeout(openingTimer);

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

    closeChannelPopup();
    window.scrollTo(0, 0);
}

// LANJUT KE BERANDA DENGAN POPUP CHANNEL
function showInvite() {
    showHome();
    openChannelPopup();
}

// TOMBOL SKIP
const skipBtn = document.getElementById('skipBtn');

if (skipBtn) {
    skipBtn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        clearTimeout(openingTimer);
        showInvite();
    });
} else {
    console.error(
        'Tombol SKIP tidak ditemukan. Periksa id="skipBtn" di HTML.'
    );
}

    // TOMBOL TUTUP POPUP
    const closeChannelWidget = document.getElementById('closeChannelWidget');

    if (closeChannelWidget) {
        closeChannelWidget.addEventListener('click', function (event) {
            event.preventDefault();
            closeChannelPopup();
        });
    }

    if (channelBackdrop) {
        channelBackdrop.addEventListener('click', closeChannelPopup);
    }

    // PEMBAYARAN
    function showPayment(service, price = 5000) {
        if (!home || !payment) {
            alert('Elemen halaman pembayaran tidak ditemukan di HTML.');
            return;
        }

        pendingService = service;
        pendingPrice = Number(price || 0);
        paymentConfirmed = false;

        home.classList.add('hidden');
        home.style.display = 'none';

        closeChannelPopup();

        payment.classList.remove('hidden');
        payment.style.display = '';

        const selectedService = document.getElementById('selectedService');

        if (selectedService) {
            selectedService.textContent = 'Pesanan: ' + service;
        }

        const paymentPrice = document.getElementById('paymentPrice');

        if (paymentPrice) {
            paymentPrice.textContent = 'Harga: ' + formatRupiah(pendingPrice);
        }

        const message =
            'Halo min, saya mau order ' + service +
            ' dengan harga ' + formatRupiah(pendingPrice) +
            '. Saya akan mengirim bukti pembayaran QRIS. Mohon diproses ya.';

        const confirmButton = document.getElementById('confirmPayment');

        if (confirmButton) {
            confirmButton.href =
                'https://wa.me/62882000379621?text=' +
                encodeURIComponent(message);
        }

        window.scrollTo(0, 0);
    }

    // TOMBOL PRODUK
    document.querySelectorAll('.buy-button').forEach(function (button) {
        button.addEventListener('click', function () {
            showPayment(
                button.dataset.service || 'Produk',
                Number(button.dataset.price || 10000)
            );
        });
    });

    // TOMBOL LAYANAN
    document.querySelectorAll('.service-card').forEach(function (button) {
        button.addEventListener('click', function () {
            showPayment(
                button.dataset.service || 'Layanan',
                Number(button.dataset.price || 5000)
            );
        });
    });

    // KEMBALI KE BERANDA
    const backHome = document.getElementById('backHome');

    if (backHome) {
        backHome.addEventListener('click', function (event) {
            event.preventDefault();
            showHome();
        });
    }

    // KONFIRMASI PEMBAYARAN
    const confirmPayment = document.getElementById('confirmPayment');

    if (confirmPayment) {
        confirmPayment.addEventListener('click', function () {
            if (pendingService && !paymentConfirmed) {
                saveTransaction(pendingService, pendingPrice);
                paymentConfirmed = true;
            }
        });
    }

    // NAVIGASI HALAMAN
    const horizontalPages = document.getElementById('horizontalPages');

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

        horizontalPages.scrollTo({
            left: storePages[currentStorePage].offsetLeft -
                  horizontalPages.offsetLeft,
            behavior: 'smooth'
        });

        navLinks.forEach(function (link, i) {
            link.classList.toggle('selected', i === currentStorePage);
        });
    }

    navLinks.forEach(function (link, index) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            goStorePage(index);
        });
    });

    if (horizontalPages) {
        horizontalPages.addEventListener('scroll', function () {
            if (!horizontalPages.clientWidth) return;

            const index = Math.round(
                horizontalPages.scrollLeft / horizontalPages.clientWidth
            );

            if (index >= 0 && index < storePages.length) {
                currentStorePage = index;

                navLinks.forEach(function (link, i) {
                    link.classList.toggle('selected', i === index);
                });
            }
        }, { passive: true });
    }

    // MULAI WEBSITE
    renderTransactions();

    openingTimer = setTimeout(function () {
        showInvite();
    }, 3000);

});