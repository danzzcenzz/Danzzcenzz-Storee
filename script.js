const opening = document.getElementById('opening');
const inviteOverlay = document.getElementById('inviteOverlay');
const home = document.getElementById('home');
const payment = document.getElementById('payment');
const magazineOverlay = document.getElementById('magazineOverlay');
let magazineIndex = 0;
let openingTimer;

function showInvite() {
  // Opening slides upward, then reveal the homepage and magazine popup.
  clearTimeout(openingTimer);
  if (opening.classList.contains('leaving') || opening.classList.contains('hidden')) return;
  opening.classList.add('leaving');
  setTimeout(() => {
    opening.classList.add('hidden');
    home.classList.remove('hidden');
    document.getElementById('channelWidget').classList.remove('hidden');
    payment.classList.add('hidden');
    inviteOverlay.classList.add('hidden');
    magazineOverlay.classList.remove('hidden');
    setMagazinePage(0);
    window.scrollTo(0, 0);
  }, 560);
}
function showHome() {
  clearTimeout(openingTimer);
  opening.classList.add('hidden');
  opening.classList.remove('leaving');
  inviteOverlay.classList.add('hidden');
  payment.classList.add('hidden');
  home.classList.remove('hidden');
  document.getElementById('channelWidget').classList.remove('hidden');
  magazineOverlay.classList.remove('hidden');
  setMagazinePage(0);
  window.scrollTo(0, 0);
}
function showPayment(service) {
  home.classList.add('hidden');
  document.getElementById('channelWidget').classList.add('hidden');
  document.getElementById('openChannelWidget').classList.add('hidden');
  inviteOverlay.classList.add('hidden');
  magazineOverlay.classList.add('hidden');
  payment.classList.remove('hidden');
  document.getElementById('selectedService').textContent = 'Pesanan: ' + service;
  // Teks WhatsApp otomatis menyesuaikan layanan yang dipilih.
  const message = `Halo min, saya mau order ${service}. Saya akan mengirim bukti pembayaran QRIS. Mohon diproses ya.`;
  document.getElementById('confirmPayment').href =
    'https://wa.me/62882000379621?text=' + encodeURIComponent(message);
  window.scrollTo(0, 0);
}

document.getElementById('skipBtn').addEventListener('click', showInvite);
document.getElementById('closeInvite').addEventListener('click', showHome);
document.querySelectorAll('.service-card').forEach(button => {
  button.addEventListener('click', () => showPayment(button.dataset.service));
});
document.getElementById('backHome').addEventListener('click', showHome);
// Navigasi halaman seperti majalah: geser ke kiri/kanan, bukan scroll ke bawah.
const horizontalPages = document.getElementById('horizontalPages');
const storePages = Array.from(document.querySelectorAll('.store-page'));
const navLinks = [
  document.getElementById('homeNav'),
  document.getElementById('historyNav'),
  document.getElementById('profileNav')
];
let currentStorePage = 0;
function goStorePage(index) {
  currentStorePage = Math.max(0, Math.min(index, storePages.length - 1));
  horizontalPages.scrollTo({left: storePages[currentStorePage].offsetLeft - horizontalPages.offsetLeft, behavior:'smooth'});
  navLinks.forEach((link, i) => link.classList.toggle('selected', i === currentStorePage));
}
navLinks.forEach((link, i) => link.addEventListener('click', e => {
  e.preventDefault();
  goStorePage(i);
}));
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

// Opening tampil 3 detik, tombol SKIP dapat digunakan kapan saja.
openingTimer = setTimeout(showInvite, 3000);


// Navigasi pop-up bergaya majalah di halaman utama.
const magazinePages = Array.from(document.querySelectorAll('.magazine-page'));
function setMagazinePage(index) {
  magazineIndex = Math.max(0, Math.min(index, magazinePages.length - 1));
  magazinePages.forEach((page, i) => page.classList.toggle('active', i === magazineIndex));
  document.getElementById('magazineCount').textContent = `0${magazineIndex + 1} / 0${magazinePages.length}`;
  document.getElementById('magazinePrev').disabled = magazineIndex === 0;
  document.getElementById('magazineNext').disabled = magazineIndex === magazinePages.length - 1;
}
document.getElementById('magazinePrev').addEventListener('click', () => setMagazinePage(magazineIndex - 1));
document.getElementById('magazineNext').addEventListener('click', () => setMagazinePage(magazineIndex + 1));
function closeMagazine() { magazineOverlay.classList.add('hidden'); document.getElementById('channelWidget').classList.remove('hidden'); }
document.getElementById('closeMagazine').addEventListener('click', closeMagazine);
document.getElementById('magazineDone').addEventListener('click', closeMagazine);

// Jendela WhatsApp Channel dibuat seperti majalah: bisa digeser kiri/kanan.
const channelWidget = document.getElementById('channelWidget');
const channelSlides = document.getElementById('channelSlides');
const channelPages = Array.from(document.querySelectorAll('.channel-slide'));
const channelPrev = document.getElementById('channelPrev');
const channelNext = document.getElementById('channelNext');
const channelCount = document.getElementById('channelCount');
let channelIndex = 0;
function setChannelPage(index, smooth = true) {
  channelIndex = Math.max(0, Math.min(index, channelPages.length - 1));
  channelSlides.scrollTo({left: channelIndex * channelSlides.clientWidth, behavior: smooth ? 'smooth' : 'auto'});
  channelPages.forEach((page, i) => page.classList.toggle('active', i === channelIndex));
  channelCount.textContent = `0${channelIndex + 1} / 0${channelPages.length}`;
  channelPrev.disabled = channelIndex === 0;
  channelNext.disabled = channelIndex === channelPages.length - 1;
}
channelPrev.addEventListener('click', () => setChannelPage(channelIndex - 1));
channelNext.addEventListener('click', () => setChannelPage(channelIndex + 1));
let channelTouchStartX = 0;
channelSlides.addEventListener('touchstart', e => { channelTouchStartX = e.changedTouches[0].clientX; }, {passive:true});
channelSlides.addEventListener('touchend', e => {
  const delta = e.changedTouches[0].clientX - channelTouchStartX;
  if (Math.abs(delta) > 45) setChannelPage(channelIndex + (delta < 0 ? 1 : -1));
}, {passive:true});
channelSlides.addEventListener('scroll', () => {
  const idx = Math.round(channelSlides.scrollLeft / channelSlides.clientWidth);
  if (idx !== channelIndex && idx >= 0 && idx < channelPages.length) {
    channelIndex = idx;
    channelPages.forEach((page, i) => page.classList.toggle('active', i === channelIndex));
    channelCount.textContent = `0${channelIndex + 1} / 0${channelPages.length}`;
    channelPrev.disabled = channelIndex === 0;
    channelNext.disabled = channelIndex === channelPages.length - 1;
  }
});

document.getElementById('closeChannelWidget').addEventListener('click', () => { channelWidget.classList.add('hidden'); document.getElementById('openChannelWidget').classList.remove('hidden'); });
document.getElementById('openChannelWidget').addEventListener('click', () => { document.getElementById('openChannelWidget').classList.add('hidden'); channelWidget.classList.remove('hidden'); setChannelPage(0, false); });
setChannelPage(0, false);