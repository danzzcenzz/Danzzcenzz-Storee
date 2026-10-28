document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const opening = $('opening'), skipBtn = $('skipBtn'), home = $('home'), payment = $('payment');
  const backHome = $('backHome'), selectedService = $('selectedService'), paymentPrice = $('paymentPrice');
  const confirmPayment = $('confirmPayment'), channelWidget = $('channelWidget'), channelBackdrop = $('channelBackdrop');
  const closeChannelWidget = $('closeChannelWidget'), horizontalPages = $('horizontalPages');
  const historyContainer = $('transactionHistory'), headerVideo = $('headerVideo');
  const HISTORY_KEY = 'danzzcenzz_transaction_history';
  const CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb90a8bLY6dGF3QxZR0W';
  let pendingService = null, database = null, auth = null;
  let adminWhatsApp = '62882000379621', isSubmitting = false, openingFinished = false, channelShown = false;
  const rupiah = value => 'Rp' + Number(value || 0).toLocaleString('id-ID');
  function normalizeWhatsApp(value) {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.startsWith('0')) digits = '62' + digits.slice(1);
    else if (digits.startsWith('8')) digits = '62' + digits;
    return digits;
  }
  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }

  // Kunci scroll selama opening agar tidak bisa digeser keluar layar.
  document.body.classList.add('opening-active');
  if (headerVideo) { headerVideo.muted = true; headerVideo.volume = 1; headerVideo.playsInline = true; }

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
    if (!channelWidget || !channelBackdrop) return;
    if (channelShown) return;
    channelShown = true;
    [channelBackdrop, channelWidget].forEach(element => {
      element.style.display = '';
      element.classList.remove('hidden');
      element.classList.add('show');
      element.setAttribute('aria-hidden', 'false');
    });
    const link = channelWidget.querySelector('.channel-join');
    if (link) { link.href = CHANNEL_URL; link.target = '_blank'; link.rel = 'noopener noreferrer'; }
  }
  function showHome(showInvite = false) {
    if (opening) { opening.classList.add('hidden'); opening.classList.remove('leaving'); opening.style.display = 'none'; }
    if (payment) { payment.classList.add('hidden'); payment.style.display = 'none'; }
    if (home) { home.classList.remove('hidden'); home.style.display = ''; }
    document.body.classList.remove('opening-active');
    openingFinished = true;
    window.scrollTo(0, 0);
    if (horizontalPages) horizontalPages.scrollLeft = 0;
    if (headerVideo) { const p = headerVideo.play(); if (p && p.catch) p.catch(() => {}); }
    if (showInvite) openChannel(); else closeChannel();
  }
  function showPayment() {
    closeChannel();
    if (opening) { opening.classList.add('hidden'); opening.style.display = 'none'; }
    if (home) { home.classList.add('hidden'); home.style.display = 'none'; }
    document.body.classList.remove('opening-active');
    if (!payment) { alert('Halaman pembayaran tidak ditemukan.'); showHome(false); return; }
    payment.classList.remove('hidden'); payment.style.display = '';
    window.scrollTo(0, 0);
  }
  if (skipBtn) skipBtn.addEventListener('click', event => { event.preventDefault(); if (!openingFinished) showHome(true); });
  window.setTimeout(() => { if (!openingFinished) showHome(true); }, 3000);

  if (closeChannelWidget) closeChannelWidget.addEventListener('click', event => {
    event.preventDefault();
    closeChannel();
    if (headerVideo) {
      headerVideo.muted = false;
      headerVideo.volume = 1;
      const playback = headerVideo.play();
      if (playback && playback.catch) playback.catch(error => console.warn('Audio video tidak dapat diputar oleh browser:', error));
    }
  });
  if (channelBackdrop) channelBackdrop.addEventListener('click', closeChannel);

  // Firebase: jika konfigurasi tidak tersedia, toko tetap dapat digunakan.
  try {
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
      database = firebase.database(); auth = firebase.auth();
      auth.signInAnonymously().catch(error => console.error('Firebase login:', error));
      database.ref('settings').on('value', snapshot => {
        const settings = snapshot.val(); if (!settings) return;
        if (settings.adminWhatsApp) adminWhatsApp = normalizeWhatsApp(settings.adminWhatsApp);
        if (settings.siteName) document.title = settings.siteName;
        if (settings.primaryColor) document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
        if (settings.backgroundColor) document.documentElement.style.setProperty('--background-color', settings.backgroundColor);
      }, error => console.error('Pengaturan Firebase:', error));
      database.ref('products').on('value', renderProducts, error => console.error('Katalog Firebase tidak dapat dimuat; memakai produk bawaan:', error));
    }
  } catch (error) { console.error('Firebase:', error); }

  // Sinkronkan katalog dari Firebase; jika gagal, produk HTML yang sudah ada tetap tampil.
  const productGrid = $('productGrid');
  function renderProducts(snapshot) {
    if (!productGrid || !snapshot || !snapshot.exists()) return;
    const data = snapshot.val() || {};
    const products = Object.entries(data).map(([id, product]) => ({ id, ...(product || {}) }))
      .filter(product => product.active !== false && product.hidden !== true && product.name && Number.isFinite(Number(product.price)))
      .sort((a, b) => Number(a.sortOrder ?? a.createdAt ?? 0) - Number(b.sortOrder ?? b.createdAt ?? 0));
    if (!products.length) return;
    productGrid.innerHTML = products.map(product => {
      const name = escapeHTML(product.name);
      const price = Number(product.price);
      const image = escapeHTML(product.image || product.imageUrl || 'https://i.imgur.com/5glTUQl.jpeg');
      const description = escapeHTML(product.description || '');
      return `<article class="product-card"><img src="${image}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='https://i.imgur.com/5glTUQl.jpeg'"><h3>${name}</h3><p class="product-price">${rupiah(price)}</p><button class="buy-button" data-product-id="${escapeHTML(product.id)}" data-service="${name}" data-price="${price}" ${description ? `aria-label="Beli ${name}"` : ''}>BELI SEKARANG</button></article>`;
    }).join('');
  }

  function selectProduct(name, price, productId = '') {
    const numericPrice = Number(price);
    if (!name || !Number.isFinite(numericPrice) || numericPrice < 0) { alert('Data produk tidak valid.'); return; }
    pendingService = {id: productId, name, price: numericPrice};
    if (selectedService) selectedService.textContent = name;
    if (paymentPrice) paymentPrice.textContent = 'Harga: ' + rupiah(numericPrice);
    showPayment();
  }
  document.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const buyButton = target.closest('.buy-button, .buy-product-btn, .buy-btn, [data-product-index]');
    if (buyButton) {
      event.preventDefault();
      const name = buyButton.dataset.service || buyButton.dataset.productName || buyButton.querySelector('h3')?.textContent;
      selectProduct(name, buyButton.dataset.price, buyButton.dataset.productId || '');
      return;
    }
    const serviceButton = target.closest('.service-card');
    if (serviceButton) {
      event.preventDefault();
      const name = serviceButton.dataset.service || 'Layanan', description = serviceButton.dataset.description || '';
      alert(name + (description ? '\n' + description : '') + '\n\nSilakan hubungi admin untuk informasi layanan ini.');
    }
  });
  if (backHome) backHome.addEventListener('click', event => { event.preventDefault(); showHome(false); });

  function getHistory() {
    try { const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); return Array.isArray(history) ? history : []; }
    catch (error) { console.error('Membaca riwayat:', error); return []; }
  }
  function saveHistory(history) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50))); return true; }
    catch (error) { console.error('Menyimpan riwayat:', error); return false; }
  }
  function renderHistory() {
    if (!historyContainer) return;
    const history = getHistory();
    if (!history.length) { historyContainer.innerHTML = '<p>📂 Belum ada riwayat pesanan.</p>'; return; }
    historyContainer.innerHTML = history.map(order => {
      const date = order.createdAt ? new Date(order.createdAt) : null;
      const dateText = date && !Number.isNaN(date.getTime()) ? date.toLocaleString('id-ID') : '-';
      return `<article class="transaction-item"><strong>${escapeHTML(order.productName || order.name || 'Produk')}</strong><small>ID Pesanan: ${escapeHTML(order.id || '-')}</small><small>Harga: ${rupiah(order.price)}</small><small>Tanggal: ${escapeHTML(dateText)}</small><span class="transaction-status">${escapeHTML(order.status || 'Menunggu pembayaran')}</span></article>`;
    }).join('');
  }

  if (confirmPayment) confirmPayment.addEventListener('click', async event => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!pendingService) { alert('Silakan pilih produk terlebih dahulu.'); return; }
    isSubmitting = true; confirmPayment.style.pointerEvents = 'none';
    const order = {id:'DZ' + Date.now(), productId:pendingService.id || '', productName:pendingService.name, price:Number(pendingService.price), status:'Menunggu pembayaran', createdAt:new Date().toISOString()};
    try {
      const history = getHistory(); history.unshift(order); saveHistory(history); renderHistory();
      if (database && auth) {
        try {
          let currentUser = auth.currentUser;
          if (!currentUser) { const credential = await auth.signInAnonymously(); currentUser = credential.user; }
          if (currentUser) {
            const reference = await database.ref('orders').push({...order, userId:currentUser.uid, createdAt:firebase.database.ServerValue.TIMESTAMP});
            const updatedHistory = getHistory(), index = updatedHistory.findIndex(item => item.id === order.id);
            if (index !== -1) { updatedHistory[index].firebaseId = reference.key; saveHistory(updatedHistory); }
          }
        } catch (error) { console.error('Firebase menyimpan pesanan:', error); }
      }
      const message = ['Halo Admin DANZZCENZZ STORE.','','Saya ingin konfirmasi pesanan.','ID Pesanan: ' + order.id,'Produk: ' + order.productName,'Harga: ' + rupiah(order.price),'Status: ' + order.status,'','Saya akan mengirimkan bukti pembayaran.'].join('\n');
      const phone = normalizeWhatsApp(adminWhatsApp);
      if (!phone || phone.length < 10 || phone.length > 15) {
        alert('Nomor WhatsApp admin belum valid. Periksa pengaturan Nomor WhatsApp Admin di aplikasi admin.');
        return;
      }
      window.location.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
    } catch (error) { console.error('Konfirmasi pesanan:', error); alert('Terjadi kesalahan saat memproses pesanan.'); }
    finally { isSubmitting = false; confirmPayment.style.pointerEvents = ''; }
  });

  const navItems = [{nav:$('homeNav'),page:$('homePage')},{nav:$('historyNav'),page:$('historyPage')},{nav:$('profileNav'),page:$('profilePage')}];
  navItems.forEach(item => {
    if (!item.nav || !item.page) return;
    item.nav.addEventListener('click', event => {
      event.preventDefault();
      navItems.forEach(other => { if (other.nav) other.nav.classList.remove('selected','active'); });
      item.nav.classList.add('selected','active');
      if (item.page.id === 'historyPage') renderHistory();
      if (horizontalPages) horizontalPages.scrollTo({left:item.page.offsetLeft, behavior:'smooth'});
    });
  });
  renderHistory();
  closeChannel();
  if (opening) { opening.classList.remove('hidden','leaving'); opening.style.display = ''; }
  if (home) { home.classList.add('hidden'); home.style.display = 'none'; }
  if (payment) { payment.classList.add('hidden'); payment.style.display = 'none'; }
});