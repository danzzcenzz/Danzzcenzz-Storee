const opening = document.getElementById('opening');
const inviteOverlay = document.getElementById('inviteOverlay');
const home = document.getElementById('home');
const payment = document.getElementById('payment');
let openingTimer;

function showInvite() {
  clearTimeout(openingTimer);
  opening.classList.add('hidden');
  home.classList.add('hidden');
  payment.classList.add('hidden');
  inviteOverlay.classList.remove('hidden');
}
function showHome() {
  clearTimeout(openingTimer);
  opening.classList.add('hidden');
  inviteOverlay.classList.add('hidden');
  payment.classList.add('hidden');
  home.classList.remove('hidden');
  window.scrollTo(0, 0);
}
function showPayment(service) {
  home.classList.add('hidden');
  inviteOverlay.classList.add('hidden');
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
document.getElementById('historyNav').addEventListener('click', e => {
  e.preventDefault();
  document.querySelector('.info-panel').scrollIntoView({behavior:'smooth'});
});
document.getElementById('profileNav').addEventListener('click', e => {
  e.preventDefault();
  document.querySelector('.profile-panel').scrollIntoView({behavior:'smooth'});
});

// Opening tampil 3 detik, tombol SKIP dapat digunakan kapan saja.
openingTimer = setTimeout(showInvite, 3000);
