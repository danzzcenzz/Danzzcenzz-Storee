document.addEventListener('DOMContentLoaded', function () {

    // ========================================
    // KONFIGURASI WEBSITE
    // ========================================

    const opening = document.getElementById('opening');
    const home = document.getElementById('home');
    const payment = document.getElementById('payment');

    const channelWidget = document.getElementById('channelWidget');
    const channelBackdrop = document.getElementById('channelBackdrop');

    const HISTORY_KEY = 'danzzcenzz_transaction_history';

    const ADMIN_WHATSAPP = '62882000379621';

    let openingTimer;
    let pendingService = '';
    let pendingPrice = 5000;
    let paymentConfirmed = false;
    let sendingOrder = false;

    // Firebase sudah diinisialisasi di index.html.
    const db = firebase.database();
    const auth = firebase.auth();


    // ========================================
    // FORMAT HARGA
    // ========================================

    function formatRupiah(amount) {
        return 'Rp' + Number(amount || 0).toLocaleString('id-ID');
    }


    // ========================================
    // RIWAYAT TRANSAKSI LOKAL
    // ========================================

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
        return String(value ?? '').replace(/[&<>"']/g, function (char) {
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


    function renderTransactions() {
    const container = document.getElementById('transactionHistory');

    if (!container) return;

    const items = getTransactions();

    if (!items.length) {
        container.innerHTML =
            '<p>📂 Belum ada riwayat pesanan.</p>';
        return;
    }

    container.innerHTML = items.map(function (item) {
        return `
            <article class="transaction-item">
                <strong>
                    🛍️ ${escapeHTML(item.service || 'Pesanan')}
                </strong>

                <small>
                    📅 ${escapeHTML(item.date || '-')}
                </small>

                <small>
                    💵 Harga: ${formatRupiah(item.price)}
                </small>

                <span class="transaction-status">
                    ${escapeHTML(
                        item.status || 'Menunggu Pembayaran'
                    )}
                </span>
            </article>
        `;
    }).join('');
}

        container.innerHTML = items.map(function (item) {
            return `
                <article class="transaction-item">
                    <strong>
                        🛍️ ${escapeHTML(item.service || 'Pesanan')}
                    </strong>

                    <small>
                        📅 ${escapeHTML(item.date || '-')}
                    </small>

                    <small>
                        💵 Harga: ${formatRupiah(item.price)}
                    </small>

                    <span class="transaction-status">
                        ${escapeHTML(
                            item.status || 'Menunggu Pembayaran'
                        )}
                    </span>
                </article>
            `;
        }).join('');
    }


    function saveTransaction(order) {
        const items = getTransactions();

        items.unshift({
            id: order.id,
            service: order.service,
            price: order.price,
            date: order.date,
            status: order.status
        });

        try {
            localStorage.setItem(
                HISTORY_KEY,
                JSON.stringify(items.slice(0, 50))
            );

            renderTransactions();
        } catch (error) {
            console.error('Riwayat lokal gagal disimpan:', error);
        }
    }


    // ========================================
    // AUTENTIKASI PELANGGAN
    // ========================================

    async function getCustomerUser() {

        if (auth.currentUser) {
            return auth.currentUser;
        }

        const result = await auth.signInAnonymously();

        return result.user;
    }


    // ========================================
    // SIMPAN PESANAN KE FIREBASE
    // ========================================

    async function createFirebaseOrder(service, price) {

        const user = await getCustomerUser();

        const now = Date.now();

        const order = {
            customer: 'Pelanggan',
            customerUid: user.uid,
            service: service,
            price: Number(price),
            status: 'Menunggu Pembayaran',
            date: new Date(now).toLocaleString('id-ID'),
            createdAt: now
        };

        const orderRef = db.ref('orders').push();

        await orderRef.set(order);

        return {
            id: orderRef.key,
            ...order
        };
    }


    // ========================================
    // POPUP CHANNEL WHATSAPP
    // ========================================

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


    // ========================================
    // TAMPILKAN BERANDA
    // ========================================

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


    function showInvite() {
        showHome();
        openChannelPopup();
    }


    // ========================================
    // TOMBOL SKIP
    // ========================================

    const skipBtn = document.getElementById('skipBtn');

    if (skipBtn) {
        skipBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();

            clearTimeout(openingTimer);

            showInvite();
        });
    }


    // ========================================
    // TUTUP POPUP CHANNEL
    // ========================================

    const closeChannelWidget =
        document.getElementById('closeChannelWidget');

    if (closeChannelWidget) {
        closeChannelWidget.addEventListener('click', function (event) {
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


    // ========================================
    // HALAMAN PEMBAYARAN
    // ========================================

    function showPayment(service, price = 5000) {

        if (!home || !payment) {
            alert('Halaman pembayaran tidak ditemukan.');
            return;
        }

        pendingService = service;
        pendingPrice = Number(price || 0);

        paymentConfirmed = false;
        sendingOrder = false;

        home.classList.add('hidden');
        home.style.display = 'none';

        closeChannelPopup();

        payment.classList.remove('hidden');
        payment.style.display = '';

        const selectedService =
            document.getElementById('selectedService');

        if (selectedService) {
            selectedService.textContent =
                'Pesanan: ' + service;
        }

        const paymentPrice =
            document.getElementById('paymentPrice');

        if (paymentPrice) {
            paymentPrice.textContent =
                'Harga: ' + formatRupiah(pendingPrice);
        }

        const confirmButton =
            document.getElementById('confirmPayment');

        if (confirmButton) {
            confirmButton.href = '#';
            confirmButton.textContent =
                '✓ KONFIRMASI PEMBAYARAN VIA WHATSAPP';

            confirmButton.style.pointerEvents = '';
            confirmButton.style.opacity = '1';
        }

        window.scrollTo(0, 0);
    }


    // ========================================
    // TOMBOL BELI PRODUK
    // ========================================

    document.querySelectorAll('.buy-button').forEach(
        function (button) {

            button.addEventListener('click', function () {

                showPayment(
                    button.dataset.service || 'Produk',
                    Number(button.dataset.price || 10000)
                );

            });

        }
    );


    // ========================================
    // TOMBOL LAYANAN
    // ========================================

    document.querySelectorAll('.service-card').forEach(
        function (button) {

            button.addEventListener('click', function () {

                showPayment(
                    button.dataset.service || 'Layanan',
                    Number(button.dataset.price || 5000)
                );

            });

        }
    );


    // ========================================
    // KEMBALI KE BERANDA
    // ========================================

    const backHome = document.getElementById('backHome');

    if (backHome) {
        backHome.addEventListener('click', function (event) {

            event.preventDefault();

            showHome();

        });
    }


    // ========================================
    // KONFIRMASI PESANAN
    // FIREBASE -> WHATSAPP
    // ========================================

    const confirmPayment =
        document.getElementById('confirmPayment');

    if (confirmPayment) {

        confirmPayment.addEventListener('click', async function (event) {

            event.preventDefault();

            if (!pendingService) {
                alert('Silakan pilih produk terlebih dahulu.');
                return;
            }

            if (paymentConfirmed || sendingOrder) {
                return;
            }

            sendingOrder = true;

            confirmPayment.textContent =
                '⏳ MENYIMPAN PESANAN...';

            confirmPayment.style.pointerEvents = 'none';

            // Siapkan tab WhatsApp ketika klik dilakukan.
            // Ini membantu mencegah pemblokiran popup browser.
            let whatsappWindow = null;

            try {

                whatsappWindow = window.open('about:blank', '_blank');

                // Simpan ke Firebase terlebih dahulu.
                const order = await createFirebaseOrder(
                    pendingService,
                    pendingPrice
                );

                // Simpan juga untuk riwayat lokal.
                saveTransaction(order);

                paymentConfirmed = true;

                const message =
                    'Halo min, saya mau order.\n\n' +
                    'ID Pesanan: ' + order.id + '\n' +
                    'Produk: ' + order.service + '\n' +
                    'Harga: ' + formatRupiah(order.price) + '\n' +
                    'Status: ' + order.status + '\n\n' +
                    'Saya akan mengirim bukti pembayaran QRIS. ' +
                    'Mohon diperiksa dan diproses ya.';

                const whatsappURL =
                    'https://wa.me/' +
                    ADMIN_WHATSAPP +
                    '?text=' +
                    encodeURIComponent(message);

                if (whatsappWindow) {

                    whatsappWindow.location.href = whatsappURL;

                } else {

                    // Jika tab baru diblokir browser,
                    // arahkan halaman saat ini ke WhatsApp.
                    window.location.href = whatsappURL;

                }

            } catch (error) {

                console.error(
                    'Gagal membuat pesanan:',
                    error
                );

                if (whatsappWindow) {
                    whatsappWindow.close();
                }

                alert(
                    'Pesanan belum berhasil disimpan ke Firebase.\n\n' +
                    'Silakan coba lagi.\n\n' +
                    'Pesan: ' + error.message
                );

            } finally {

                sendingOrder = false;

                if (!paymentConfirmed) {

                    confirmPayment.textContent =
                        '✓ KONFIRMASI PEMBAYARAN VIA WHATSAPP';

                    confirmPayment.style.pointerEvents = '';
                    confirmPayment.style.opacity = '1';

                }

            }

        });

    }


    // ========================================
    // NAVIGASI HALAMAN
    // ========================================

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

        if (!horizontalPages || !storePages.length) {
            return;
        }

        currentStorePage = Math.max(
            0,
            Math.min(index, storePages.length - 1)
        );

        horizontalPages.scrollTo({
            left:
                storePages[currentStorePage].offsetLeft -
                horizontalPages.offsetLeft,
            behavior: 'smooth'
        });

        navLinks.forEach(function (link, i) {

            link.classList.toggle(
                'selected',
                i === currentStorePage
            );

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

            if (!horizontalPages.clientWidth) {
                return;
            }

            const index = Math.round(
                horizontalPages.scrollLeft /
                horizontalPages.clientWidth
            );

            if (index >= 0 && index < storePages.length) {

                currentStorePage = index;

                navLinks.forEach(function (link, i) {

                    link.classList.toggle(
                        'selected',
                        i === index
                    );

                });

            }

        }, { passive: true });

    }


    // ========================================
    // MULAI WEBSITE
    // ========================================

    renderTransactions();

    openingTimer = setTimeout(function () {

        showInvite();

    }, 3000);

});