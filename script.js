document.addEventListener("DOMContentLoaded", function () {
"use strict";

const ADMIN_NUMBER = "62882000379621";
const CHANNEL_URL = "https://whatsapp.com/channel/0029Vb90a8bLY6dGF3QxZR0W";

const opening = document.getElementById("opening");
const mainContent = document.getElementById("mainContent");
const skipBtn = document.getElementById("skipBtn");
const welcomePopup = document.getElementById("welcomePopup");
const continueBtn = document.getElementById("continueBtn");
const closeWelcome = document.getElementById("closeWelcome");

const qrisPopup = document.getElementById("qrisPopup");
const confirmPopup = document.getElementById("confirmPopup");

let openingFinished = false;
let openingTimer;

function showMainPage() {
if (openingFinished) return;
openingFinished = true;
clearTimeout(openingTimer);

if (opening) {
  opening.classList.add("hide");
  opening.style.display = "none";
}

if (mainContent) {
  mainContent.classList.remove("hidden");
  mainContent.style.display = "block";
}

window.scrollTo(0, 0);

// Tampilkan jendela mengambang setelah halaman utama siap.
window.setTimeout(function () {
  if (welcomePopup) {
    welcomePopup.classList.remove("hidden");
  }
}, 250);

}

// Skip dan timer memakai fungsi yang sama.
if (skipBtn) {
skipBtn.addEventListener("click", showMainPage);
}

openingTimer = window.setTimeout(showMainPage, 3000);

// Tutup jendela sambutan dan lanjutkan ke toko.
function closeWelcomeWindow() {
if (welcomePopup) welcomePopup.classList.add("hidden");
}

if (continueBtn) {
continueBtn.addEventListener("click", closeWelcomeWindow);
}

if (closeWelcome) {
closeWelcome.addEventListener("click", closeWelcomeWindow);
}

// Tombol HOME.
const homeBtn = document.getElementById("homeBtn");

if (homeBtn) {
homeBtn.addEventListener("click", function () {
window.scrollTo({ top: 0, behavior: "smooth" });
});
}

// Membuka dan menutup popup.
function openPopup(popup) {
if (popup) popup.classList.remove("hidden");
}

function closePopup(popup) {
if (popup) popup.classList.add("hidden");
}

const showQris = document.getElementById("showQris");

if (showQris) {
showQris.addEventListener("click", function () {
openPopup(qrisPopup);
});
}

document.querySelectorAll("[data-close]").forEach(function (button) {
button.addEventListener("click", function () {
const targetId = button.getAttribute("data-close");
closePopup(document.getElementById(targetId));
});
});

[qrisPopup, confirmPopup, welcomePopup].forEach(function (popup) {
if (!popup) return;

popup.addEventListener("click", function (event) {
  if (event.target === popup) {
    closePopup(popup);
  }
});

});

document.addEventListener("keydown", function (event) {
if (event.key === "Escape") {
closePopup(qrisPopup);
closePopup(confirmPopup);
closePopup(welcomePopup);
}
});

// ORDER SEKARANG: langsung membuka chat WhatsApp admin.
document.querySelectorAll(".order-btn").forEach(function (button) {
button.addEventListener("click", function () {
const product = button.getAttribute("data-product") || "Produk";
const message =
"Min, saya mau order " + product +
". Mohon informasi harga dan cara pembayarannya.";

  const whatsappURL =
    "https://wa.me/" + ADMIN_NUMBER +
    "?text=" + encodeURIComponent(message);

  window.open(whatsappURL, "_blank", "noopener");
});

});

// Konfirmasi pembayaran.
const confirmPayment = document.getElementById("confirmPayment");
const sendProof = document.getElementById("sendProof");

if (confirmPayment) {
confirmPayment.addEventListener("click", function () {
closePopup(qrisPopup);

  const message =
    "Min, saya ingin konfirmasi pembayaran. Saya akan mengirimkan bukti pembayaran.";

  if (sendProof) {
    sendProof.href =
      "https://wa.me/" + ADMIN_NUMBER +
      "?text=" + encodeURIComponent(message);
  }

  openPopup(confirmPopup);
});

}

// Pastikan tautan channel mengarah ke channel yang benar.
document.querySelectorAll('a[href*="whatsapp.com/channel"]').forEach(function (link) {
link.href = CHANNEL_URL;
link.target = "_blank";
link.rel = "noopener noreferrer";
});
});