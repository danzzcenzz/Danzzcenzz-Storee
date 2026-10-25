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
  document.getElementById('confirmPayment').href = 'https://wa.me/62882000379621?text=' + encodeURIComponent(message);
  window.scrollTo(0, 0);
}

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


// Riwayat transaksi disimpan pada browser pengguna (localStorage).
const historyContainer = document.getElementById('transactionHistory');
const HISTORY_KEY = 'danzzcenzz_transaction_history_v1';
function loadTransactions() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch (error) { return []; }
}
function renderTransactions() {
  if (!historyContainer) return;
  const transactions = loadTransactions();
  if (!transactions.length) {
    historyContainer.innerHTML = '<p>📂 Belum ada riwayat pesanan.</p>';
    return;
  }
  historyContainer.innerHTML = transactions.map(item => `
    <article class="transaction-item">
      <div class="transaction-item-head"><strong>${escapeHTML(item.service)}</strong><span class="transaction-status">${escapeHTML(item.status)}</span></div>
      <p><strong>ID:</strong> ${escapeHTML(item.id)}</p>
      <p><strong>Tanggal:</strong> ${escapeHTML(item.date)}</p>
      <p><strong>Pembayaran:</strong> ${escapeHTML(item.payment)}</p>
    </article>
  `).join('');
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function recordTransaction() {
  const service = document.getElementById('selectedService').textContent.replace(/^Pesanan:\s*/, '');
  const transaction = {
    id: 'DZ' + Date.now().toString().slice(-8),
    service,
    date: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
    status: 'Menunggu verifikasi admin',
    payment: 'Konfirmasi dikirim via WhatsApp'
  };
  const transactions = loadTransactions();
  transactions.unshift(transaction);
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(transactions.slice(0, 100))); } catch (error) {}
  renderTransactions();
}
renderTransactions();
document.getElementById('confirmPayment').addEventListener('click', recordTransaction);

openingTimer = setTimeout(showInvite, 3000);