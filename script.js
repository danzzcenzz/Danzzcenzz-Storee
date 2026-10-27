const opening = document.getElementById('opening');
const home = document.getElementById('home');
const payment = document.getElementById('payment');
const channelWidget = document.getElementById('channelWidget');
const channelBackdrop = document.getElementById('channelBackdrop');
let openingTimer;
let pendingService = '';
let pendingPrice = 10000;

const HISTORY_KEY = 'danzzcenzz_transaction_history';
function getTransactions() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch (error) { return []; }
}
function formatPrice(price) {
  return 'Rp' + Number(price || 0).toLocaleString('id-ID');
}
function renderTransactions() {
  const container = document.getElementById('transactionHistory');
  if (!container) return;
  const items = getTransactions();
  if (!items.length) {
    container.innerHTML = '<p>📂 Belum ada riwayat pesanan.</p>';
    return;
  }
  container.innerHTML = items.map(item => `
    <article class="transaction-item">
      <strong>🛍️ ${escapeHTML(item.service)}</strong>
      <small>📅 ${escapeHTML(item.date)}</small>
      <small>💵 Harga: ${formatPrice(item.price || 10000)}</small>
      <span class="transaction-status">Menunggu verifikasi admin</span>
    </article>`).join('');
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[char]));
}
function saveTransaction(service, price) {
  const items = getTransactions();
  items.unshift({
    id: Date.now(), service, price,
    date: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
  });
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 50)));
    renderTransactions();
  } catch (error) {
    alert('Riwayat tidak dapat disimpan di browser ini. Silakan izinkan penyimpanan situs.');
  }
}
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
function showPayment(service, price = 10000) {
  home.classList.add('hidden');
  closeChannelPopup();
  payment.classList.remove('hidden');
  pendingService = service;
  pendingPrice = Number(price || 10000);
  document.getElementById('selectedService').textContent = 'Pesanan: ' + service;
  const priceElement = document.getElementById('paymentPrice');
  if (priceElement) priceElement.textContent = 'Harga: ' + formatPrice(pendingPrice);
  const message = `Halo min, saya mau order ${service} dengan harga ${formatPrice(pendingPrice)}. Saya akan mengirim bukti pembayaran QRIS. Mohon diproses ya.`;
  document.getElementById('confirmPayment').href = 'https://wa.me/62882000379621?text=' + encodeURIComponent(message);
  window.scrollTo(0, 0);
}

document.getElementById('skipBtn').addEventListener('click', showInvite);
document.querySelectorAll('.product-card').forEach(button => {
  button.addEventListener('click', () => showPayment(button.dataset.service, button.dataset.price));
});
document.getElementById('backHome').addEventListener('click', showHome);
document.getElementById('confirmPayment').addEventListener('click', () => {
  if (pendingService) saveTransaction(pendingService, pendingPrice);
});
renderTransactions();
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
