document.addEventListener("DOMContentLoaded", function () {
  const opening = document.getElementById("opening");
  const mainContent = document.getElementById("mainContent");
  const skipBtn = document.getElementById("skipBtn");

  const channelPopup = document.getElementById("channelPopup");
  const qrisPopup = document.getElementById("qrisPopup");
  const confirmPopup = document.getElementById("confirmPopup");

  const orderLink =
    "https://wa.me/62882000379621?text=min%20mau%20order%20video%20";

  const channelLink =
    "https://whatsapp.com/channel/0029Vb90a8bLY6dGF3QxZR0W";

  // OPENING: tombol Skip langsung membuka halaman utama
  let openingFinished = false;

  function finishOpening() {
    if (openingFinished) return;

    openingFinished = true;
    mainContent.classList.remove("hidden");
    opening.classList.add("fade-out");

    window.setTimeout(function () {
      opening.classList.add("hidden");
    }, 450);
  }

  skipBtn.addEventListener("click", finishOpening);

  // Otomatis membuka halaman utama setelah 2 detik
  window.setTimeout(finishOpening, 2000);

  // Tombol Home
  document.getElementById("homeBtn").addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Fungsi membuka dan menutup popup
  function openPopup(popup) {
    popup.classList.remove("hidden");
  }

  function closePopup(popup) {
    popup.classList.add("hidden");
  }

  document.getElementById("showChannel").addEventListener("click", function () {
    openPopup(channelPopup);
  });

  document.getElementById("closeChannel").addEventListener("click", function () {
    closePopup(channelPopup);
  });

  document.getElementById("showQris").addEventListener("click", function () {
    openPopup(qrisPopup);
  });

  document.getElementById("closeQris").addEventListener("click", function () {
    closePopup(qrisPopup);
  });

  document.getElementById("closeConfirm").addEventListener("click", function () {
    closePopup(confirmPopup);
  });

  // Order produk melalui WhatsApp
  document.querySelectorAll(".order-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      const product = button.dataset.product || "Produk";
      const message =
        "Min, saya mau order " + product + ". Mohon informasi harga dan cara pembayarannya.";

      window.open(
        "https://wa.me/62882000379621?text=" + encodeURIComponent(message),
        "_blank"
      );
    });
  });

  // Konfirmasi pembayaran
  document.getElementById("confirmPayment").addEventListener("click", function () {
    closePopup(qrisPopup);
    openPopup(confirmPopup);

    const message =
      "Min, saya ingin konfirmasi pembayaran. Saya akan mengirimkan bukti pembayaran.";
    document.getElementById("sendProof").href =
      "https://wa.me/62882000379621?text=" + encodeURIComponent(message);
  });

  // Klik tombol gabung di popup
  channelPopup.querySelector(".green").addEventListener("click", function () {
    window.open(channelLink, "_blank");
  });

  // Menutup popup jika bagian gelap di luar kartu ditekan
  [channelPopup, qrisPopup, confirmPopup].forEach(function (popup) {
    popup.addEventListener("click", function (event) {
      if (event.target === popup) {
        closePopup(popup);
      }
    });
  });

  // Menutup popup dengan tombol Escape
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closePopup(channelPopup);
      closePopup(qrisPopup);
      closePopup(confirmPopup);
    }
  });
});