const opening = document.getElementById('opening');
const home = document.getElementById('home');
const payment = document.getElementById('payment');
const channelWidget = document.getElementById('channelWidget');
const channelBackdrop = document.getElementById('channelBackdrop');
let openingTimer;

function showInvite() {
  clearTimeout(openingTimer);
  if (opening.classList.contains('leaving') || opening.classList.contains('hidden')) return;
  opening.classList.add('leaving');
  setTimeout(() => {
    opening.classList.add('hidden');
    home.classList.remove('hidden');
    payment.classList.add('hidden');
    openChannelPopup();
    window.scrollTo(0, 0);
  }, 560);
}
function openChannelPopup() {
  channelWidget.classList.remove('hidden');
  channelBackdrop.classList.remove('hidden');
}
function closeChannelPopup() {
  channelWidget.classList.add('hidden');
  channelBackdrop.classList.add('hidden');
}
function showHome() {
  clearTimeout(openingTimer);
  opening.classList.add('hidden');
  opening.classList.remove('leaving');
  payment.classList.add('hidden');
  home.classList.remove('hidden');
  closeChannelPopup();
  window.scrollTo(0, 0);
}
function showPayment(service) {
  home.classList.add('hidden');
  closeChannelPopup();
  payment.classList.remove('hidden');
  document.getElementById('selectedService').textContent = 'Pesanan: ' + service;
  const message = `Halo min, saya mau order ${service}. Saya akan mengirim bukti pembayaran QRIS. Mohon diproses ya.`;
  const confirmLink = document.getElementById('confirmPayment');
  confirmLink.href = 'https://wa.me/62882000379621?text=' + encodeURIComponent(message);
  confirmLink.dataset.service = service;
  window.scrollTo(0, 0);
}

// Riwayat lokal: pesanan tercatat saat pengguna menekan tombol konfirmasi.
const HISTORY_KEY = 'danzzcenzz_transactions_v1';
function readTransactions() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch (_) { return []; }
}
function renderTransactions() {
  const panel = document.querySelector('#historyPage .info-panel');
  if (!panel) return;
  const items = readTransactions();
  panel.innerHTML = '<h2>🧾 RIWAYAT TRANSAKSI</h2>' + (items.length ? items.map(item =>
    `<article class="transaction-item"><strong>${escapeHTML(item.service)}</strong><p>💰 ${escapeHTML(item.price)} · <span class="transaction-status">Menunggu konfirmasi</span></p><small>${escapeHTML(item.date)}</small></article>`
  ).join('') : '<p>📂 Belum ada riwayat pesanan.</p>');
}
function escapeHTML(value) {
  return String(value).replace(/[&<>\"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[char]));
}
document.getElementById('confirmPayment').addEventListener('click', () => {
  const link = document.getElementById('confirmPayment');
  const service = link.dataset.service || 'Pesanan';
  const items = readTransactions();
  items.unshift({service, price:'Rp 5.000', date:new Date().toLocaleString('id-ID'), status:'Menunggu konfirmasi'});
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 50))); } catch (_) {}
  renderTransactions();
});
renderTransactions();

document.getElementById('skipBtn').addEventListener('click', showInvite);
document.querySelectorAll('.service-card').forEach(button => button.addEventListener('click', () => showPayment(button.dataset.service)));
document.getElementById('backHome').addEventListener('click', showHome);
document.getElementById('closeChannelWidget').addEventListener('click', closeChannelPopup);
channelBackdrop.addEventListener('click', closeChannelPopup);

// Navigasi halaman utama: Beranda, Riwayat, dan Profil.
const horizontalPages = document.getElementById('horizontalPages');
const storePages = Array.from(document.querySelectorAll('.store-page'));
const navLinks = [document.getElementById('homeNav'), document.getElementById('historyNav'), document.getElementById('profileNav')];
let currentStorePage = 0;
function goStorePage(index) {
  currentStorePage = Math.max(0, Math.min(index, storePages.length - 1));
  horizontalPages.scrollTo({left: storePages[currentStorePage].offsetLeft - horizontalPages.offsetLeft, behavior:'smooth'});
  navLinks.forEach((link, i) => link.classList.toggle('selected', i === currentStorePage));
}
navLinks.forEach((link, i) => link.addEventListener('click', e => { e.preventDefault(); goStorePage(i); }));
let touchStartX = 0;
horizontalPages.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, {passive:true});
horizontalPages.addEventListener('touchend', e => {
  const delta = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) > 45) goStorePage(currentStorePage + (delta < 0 ? 1 : -1));
}, {passive:true});
horizontalPages.addEventListener('scroll', () => {
  const idx = Math.round(horizontalPages.scrollLeft / horizontalPages.clientWidth);
  if (idx !== currentStorePage && idx >= 0 && idx < storePages.length) {
    currentStorePage = idx;
    navLinks.forEach((link, i) => link.classList.toggle('selected', i === idx));
  }
}, {passive:true});

openingTimer = setTimeout(showInvite, 3000);