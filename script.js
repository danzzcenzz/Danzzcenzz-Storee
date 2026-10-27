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

    let ADMIN_WHATSAPP = '62882000379621';

    let openingTimer;
    let pendingService = '';
    let pendingPrice = 5000;
    let paymentConfirmed = false;
    let sendingOrder = false;

    const db = firebase.database();
    const auth = firebase.auth();


    // ========================================
    // FUNGSI BANTUAN
    // ========================================

    function formatRupiah(amount) {
        return 'Rp' + Number(amount || 0).toLocaleString('id-ID');
    }

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


    // ========================================
    // RIWAYAT TRANSAKSI
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
                    <strong>🛍️ ${escapeHTML(item.service || 'Pesanan')}</strong>
                    <small>📅 ${escapeHTML(item.date || '-')}</small>
                    <small>💵 Harga: ${formatRupiah(item.price)}</small>
                    <span class="transaction-status">
                        ${escapeHTML(item.status || 'Menunggu Pembayaran')}
                    </span>
                </article>
            `;
        }).join('');
    }

    function saveTransaction(order) {
        const items = getTransactions();

        const existingIndex = items.findIndex(function (item) {
            return item.id === order.id;
        });

        const transaction = {
            id: order.id,
            service: order.service,
            price: order.price,
            date: order.date,
            status: order.status
        };

        if (existingIndex >= 0) {
            items[existingIndex] = transaction;
        } else {
            items.unshift(transaction);
        }

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
        channelBackdrop.addEventListener('click', closeChannelPopup);
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
            selectedService.textContent = 'Pesanan: ' + service;
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
    // Mendukung produk lama dan produk baru
    // ========================================

    document.addEventListener('click', function (event) {
        const button = event.target.closest('.buy-button');

        if (!button) return;

        event.preventDefault();

        showPayment(
            button.dataset.service || 'Produk',
            Number(button.dataset.price || 10000)
        );
    });


    // ========================================
    // TOMBOL LAYANAN
    // ========================================

    document.addEventListener('click', function (event) {
        const button = event.target.closest('.service-card');

        if (!button) return;

        event.preventDefault();

        showPayment(
            button.dataset.service || 'Layanan',
            Number(button.dataset.price || 5000)
        );
    });


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

            confirmPayment.textContent = '⏳ MENYIMPAN PESANAN...';
            confirmPayment.style.pointerEvents = 'none';

            let whatsappWindow = null;

            try {
                whatsappWindow = window.open('about:blank', '_blank');

                const order = await createFirebaseOrder(
                    pendingService,
                    pendingPrice
                );

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
                    window.location.href = whatsappURL;
                }

            } catch (error) {
                console.error('Gagal membuat pesanan:', error);

                if (whatsappWindow) {
                    whatsappWindow.close();
                }

                alert(
                    'Pesanan belum berhasil disimpan ke Firebase.\n\n' +
                    'Silakan coba lagi.\n\nPesan: ' + error.message
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
                horizontalPages.scrollLeft /
                horizontalPages.clientWidth
            );

            if (index >= 0 && index < storePages.length) {
                currentStorePage = index;

                navLinks.forEach(function (link, i) {
                    link.classList.toggle('selected', i === index);
                });
            }
        }, { passive: true });
    }


    // ========================================
    // RIWAYAT PESANAN DARI FIREBASE
    // ========================================

    renderTransactions();

    auth.onAuthStateChanged(function (user) {
        if (!user) return;

        db.ref('orders')
            .orderByChild('customerUid')
            .equalTo(user.uid)
            .on('value', function (snapshot) {
                const firebaseOrders = snapshot.val() || {};
                const transactions = getTransactions();

                let changed = false;

                transactions.forEach(function (item) {
                    if (!item.id) return;

                    const firebaseOrder = firebaseOrders[item.id];

                    if (
                        firebaseOrder &&
                        firebaseOrder.status &&
                        item.status !== firebaseOrder.status
                    ) {
                        item.status = firebaseOrder.status;
                        changed = true;
                    }
                });

                if (changed) {
                    localStorage.setItem(
                        HISTORY_KEY,
                        JSON.stringify(transactions)
                    );
                }

                renderTransactions();

            }, function (error) {
                console.error(
                    'Gagal menyinkronkan status pesanan:',
                    error
                );
            });
    });


    // ========================================
    // MULAI WEBSITE
    // ========================================

    openingTimer = setTimeout(function () {
        showInvite();
    }, 3000);


    // ========================================
    // PRODUK FIREBASE
    // Pertahankan produk HTML yang sudah ada
    // ========================================

    const productGrid = document.querySelector('.product-grid');

    // Simpan salinan produk bawaan sebelum Firebase dimuat.
    const originalProductCards = productGrid
        ? Array.from(productGrid.children).map(function (card) {
            return card.cloneNode(true);
        })
        : [];

    function createFirebaseProductCard(product) {
        const card = document.createElement('article');
        card.className = 'product-card firebase-product-card';
        card.dataset.firebaseProductId = product.id;

        const image = document.createElement('img');
        image.alt = product.name;
        image.loading = 'lazy';

        if (product.image) {
            image.src = product.image;
        } else {
            image.style.display = 'none';
        }

        image.onerror = function () {
            image.style.display = 'none';
        };

        const title = document.createElement('h3');
        title.textContent = product.name;

        const description = document.createElement('p');
        description.textContent = product.description;

        const price = document.createElement('p');
        price.className = 'product-price';
        price.textContent = formatRupiah(product.price);

        const button = document.createElement('button');
        button.className = 'buy-button';
        button.dataset.service = product.name;
        button.dataset.price = String(product.price);
        button.textContent = 'Beli Sekarang';

        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(price);
        card.appendChild(button);

        return card;
    }

    if (productGrid) {
        db.ref('products').on('value', function (snapshot) {
            // Jika database produk kosong atau gagal berisi data,
            // jangan hapus produk bawaan website.
            if (!snapshot.exists()) return;

            const products = [];

            snapshot.forEach(function (child) {
                const item = child.val() || {};

                if (item.active === false) return;

                products.push({
                    id: child.key,
                    name: item.name || 'Produk',
                    price: Number(item.price || 0),
                    image: item.image || '',
                    description: item.description || ''
                });
            });

            // Bangun ulang dari produk bawaan, bukan dari grid kosong.
            productGrid.replaceChildren();

            originalProductCards.forEach(function (card) {
                productGrid.appendChild(card.cloneNode(true));
            });

            // Produk Firebase memperbarui produk bawaan dengan nama sama.
            products.forEach(function (product) {
                const existingCard = Array.from(
                    productGrid.children
                ).find(function (card) {
                    if (card.classList.contains('firebase-product-card')) {
                        return false;
                    }

                    const title = card.querySelector('h3');

                    const button = card.querySelector('.buy-button');

                    const existingName =
                        button?.dataset.service ||
                        title?.textContent?.trim() ||
                        '';

                    return existingName.toLowerCase() ===
                        product.name.trim().toLowerCase();
                });

                const newCard = createFirebaseProductCard(product);

                if (existingCard) {
                    existingCard.replaceWith(newCard);
                } else {
                    productGrid.appendChild(newCard);
                }
            });

        }, function (error) {
            console.error('Gagal memuat produk Firebase:', error);
        });
    }


    // ========================================
    // PENGATURAN TAMPILAN DARI FIREBASE
    // ========================================

    db.ref('settings').on('value', function (snapshot) {
        const settings = snapshot.val() || {};
        const appearance = settings.appearance || settings;

        if (settings.siteName) {
            document.title = settings.siteName;

            const heading = document.querySelector('header h1');

            if (heading) {
                heading.textContent = settings.siteName;
            }
        }

        if (settings.adminWhatsApp) {
            ADMIN_WHATSAPP = String(settings.adminWhatsApp)
                .replace(/\D/g, '');
        }

        if (appearance.primaryColor) {
            document.documentElement.style.setProperty(
                '--primary-color',
                appearance.primaryColor
            );

            document.querySelectorAll(
                'button, .buy-button'
            ).forEach(function (element) {
                element.style.backgroundColor =
                    appearance.primaryColor;
            });
        }

        if (appearance.backgroundColor) {
            document.body.style.backgroundColor =
                appearance.backgroundColor;
        }

        if (appearance.logo) {
            const logo = document.querySelector('header img');

            if (logo) {
                logo.src = appearance.logo;
            }
        }

        if (appearance.banner) {
            let banner = document.getElementById(
                'firebaseSiteBanner'
            );

            if (!banner) {
                banner = document.createElement('img');
                banner.id = 'firebaseSiteBanner';
                banner.alt = 'Banner website';

                banner.style.cssText =
                    'width:100%;max-height:300px;object-fit:cover;' +
                    'display:block;margin:12px auto;border-radius:12px';

                const header = document.querySelector('header');

                if (header) {
                    header.insertAdjacentElement('afterend', banner);
                }
            }

            banner.src = appearance.banner;
        }
    }, function (error) {
        console.error('Gagal memuat pengaturan tampilan:', error);
    });

});