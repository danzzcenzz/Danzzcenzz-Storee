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

function getTransactions() {
try {
return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
} catch (error) {
return [];
}
}

function escapeHTML(value) {
return String(value).replace(/[&<>"']/g, char => ({
'&': '&',
'<': '<',
'>': '>',
'"': '"',
"'": '''
}[char]));
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

container.innerHTML = items.map(item => "<article class="transaction-item"> <strong>🛍️ ${escapeHTML(item.service || 'Pesanan')}</strong> <small>📅 ${escapeHTML(item.date || '-')}</small> <small>💵 Harga: ${formatRupiah(item.price ?? 5000)}</small> <span class="transaction-status"> ${escapeHTML(item.status || 'Menunggu verifikasi admin')} </span> </article>").join('');
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
localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 50)));
renderTransactions();
} catch (error) {
alert('Riwayat tidak dapat disimpan. Periksa pengaturan penyimpanan browser.');
}
}

function showInvite() {
clearTimeout(openingTimer);

if (
!opening ||
opening.classList.contains('leaving') ||
opening.classList.contains('hidden')
) {
return;
}

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
if (channelWidget) channelWidget.classList.remove('hidden');
if (channelBackdrop) channelBackdrop.classList.remove('hidden');
}

function closeChannelPopup() {
if (channelWidget) channelWidget.classList.add('hidden');
if (channelBackdrop) channelBackdrop.classList.add('hidden');
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

function showPayment(service, price = 5000) {
pendingService = service;
pendingPrice = Number(price || 0);
paymentConfirmed = false;

home.classList.add('hidden');
closeChannelPopup();
payment.classList.remove('hidden');

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

/* Tombol melewati opening */
const skipBtn = document.getElementById('skipBtn');
if (skipBtn) {
skipBtn.addEventListener('click', showInvite);
}

/* Tombol beli pada produk */
document.querySelectorAll('.buy-button').forEach(button => {
button.addEventListener('click', () => {
const service = button.dataset.service || 'Produk';
const price = Number(button.dataset.price || 10000);
showPayment(service, price);
});
});

/* Tombol layanan lama, jika masih digunakan */
document.querySelectorAll('.service-card').forEach(button => {
button.addEventListener('click', () => {
showPayment(button.dataset.service || 'Layanan', 5000);
});
});

/* Kembali ke beranda */
const backHome = document.getElementById('backHome');
if (backHome) {
backHome.addEventListener('click', showHome);
}

/* Konfirmasi pembayaran dan simpan riwayat */
const confirmPayment = document.getElementById('confirmPayment');
if (confirmPayment) {
confirmPayment.addEventListener('click', () => {
if (pendingService && !paymentConfirmed) {
saveTransaction(pendingService, pendingPrice);
paymentConfirmed = true;
}
});
}

/* Popup Join Saluran */
const closeChannelWidget = document.getElementById('closeChannelWidget');

if (closeChannelWidget) {
closeChannelWidget.addEventListener('click', closeChannelPopup);
}

if (channelBackdrop) {
channelBackdrop.addEventListener('click', closeChannelPopup);
}

/* Navigasi Beranda, Riwayat, dan Profil */
const horizontalPages = document.getElementById('horizontalPages');
const storePages = Array.from(document.querySelectorAll('.store-page'));

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

navLinks.forEach((link, i) => {
link.classList.toggle('selected', i === currentStorePage);
});
}

navLinks.forEach((link, index) => {
link.addEventListener('click', event => {
event.preventDefault();
goStorePage(index);
});
});

if (horizontalPages) {
let touchStartX = 0;

horizontalPages.addEventListener('touchstart', event => {
touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

horizontalPages.addEventListener('touchend', event => {
const delta = event.changedTouches[0].clientX - touchStartX;

if (Math.abs(delta) > 45) {
  goStorePage(currentStorePage + (delta < 0 ? 1 : -1));
}

}, { passive: true });

horizontalPages.addEventListener('scroll', () => {
if (!horizontalPages.clientWidth) return;

const index = Math.round(
  horizontalPages.scrollLeft / horizontalPages.clientWidth
);

if (
  index !== currentStorePage &&
  index >= 0 &&
  index < storePages.length
) {
  currentStorePage = index;

  navLinks.forEach((link, i) => {
    link.classList.toggle('selected', i === index);
  });
}

}, { passive: true });
}

/* Tampilkan riwayat transaksi */
renderTransactions();

/* Opening otomatis */
openingTimer = setTimeout(showInvite, 3000);