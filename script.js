"use strict";

document.addEventListener("DOMContentLoaded", () => {
const loadingScreen = document.getElementById("loading-screen");
const store = document.getElementById("store-container");
const skipButton = document.getElementById("skip-btn");

const waPopup = document.getElementById("wa-popup");
const closeWaPopup = document.getElementById("close-wa-popup");

const paymentPopup = document.getElementById("payment-popup");
const closePayment = document.getElementById("close-payment");
const paymentProduct = document.getElementById("payment-product");
const confirmButton = document.getElementById("confirm-payment");

const adminNumber = "62882000379621";
const channelUrl = "https://whatsapp.com/channel/0029Vb90a8bLY6dGF3QxZR0W";

let currentProduct = "";
let openingFinished = false;
let popupTimer;

// OPENING
function openStore() {
    if (openingFinished) return;
    openingFinished = true;

    clearTimeout(popupTimer);

    loadingScreen.hidden = true;
    loadingScreen.style.display = "none";

    store.hidden = false;

    popupTimer = setTimeout(() => {
        if (!sessionStorage.getItem("waPopupSeen")) {
            waPopup.hidden = false;
        }
    }, 600);
}

skipButton.addEventListener("click", openStore);
setTimeout(openStore, 4000);

// TUTUP POPUP WHATSAPP
function hideWaPopup() {
    waPopup.hidden = true;
    sessionStorage.setItem("waPopupSeen", "yes");
}

closeWaPopup.addEventListener("click", hideWaPopup);

waPopup.addEventListener("click", event => {
    if (event.target === waPopup) hideWaPopup();
});

// NAVIGASI
const navButtons = document.querySelectorAll(".nav-item");
const tabs = document.querySelectorAll(".tab-content");

navButtons.forEach(button => {
    button.addEventListener("click", () => {
        const target = button.dataset.tab;

        tabs.forEach(tab => {
            tab.hidden = tab.id !== "tab-" + target;
        });

        navButtons.forEach(nav => {
            nav.classList.toggle("active", nav === button);
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});

// BUKA POPUP QRIS UNTUK SEMUA PRODUK
document.querySelectorAll("[data-product]").forEach(button => {
    button.addEventListener("click", () => {
        currentProduct = button.dataset.product;
        paymentProduct.textContent = "Produk: " + currentProduct;
        paymentPopup.hidden = false;
    });
});

// TUTUP POPUP PEMBAYARAN
function hidePayment() {
    paymentPopup.hidden = true;
}

closePayment.addEventListener("click", hidePayment);

paymentPopup.addEventListener("click", event => {
    if (event.target === paymentPopup) hidePayment();
});

// KONFIRMASI PEMBAYARAN MELALUI WHATSAPP
confirmButton.addEventListener("click", () => {
    if (!currentProduct) {
        alert("Silakan pilih produk terlebih dahulu.");
        return;
    }

    const message =
        "Halo Admin DANZZCENZZ-STORE, saya ingin konfirmasi pembayaran.\n\n" +
        "Produk: " + currentProduct + "\n" +
        "Status: Saya sudah melakukan pembayaran melalui QRIS.\n\n" +
        "Mohon bantu cek pembayaran saya. Saya akan mengirimkan bukti pembayaran melalui chat ini.";

    const whatsappUrl =
        "https://wa.me/" + adminNumber +
        "?text=" + encodeURIComponent(message);

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
});

// ESC UNTUK MENUTUP POPUP
document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        waPopup.hidden = true;
        paymentPopup.hidden = true;
    }
});

// CATAT PRODUK YANG DIPILIH SECARA LOKAL
// Ini bukan bukti pembayaran dan tidak memverifikasi transaksi.
document.querySelectorAll("[data-product]").forEach(button => {
    button.addEventListener("contextmenu", event => {
        event.preventDefault();
    });
});

});