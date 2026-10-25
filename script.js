document.addEventListener("DOMContentLoaded", function () {
  const opening = document.getElementById("opening");
  const mainContent = document.getElementById("mainContent");
  const skipBtn = document.getElementById("skipBtn");

  const qrisPopup = document.getElementById("qrisPopup");
  const confirmPopup = document.getElementById("confirmPopup");

  const adminNumber = "62882000379621";
  const channelURL =
    "https://whatsapp.com/channel/0029Vb90a8bLY6dGF3QxZR0W";

  /* OPENING */
  let openingFinished = false;
  let openingTimer;

  function finishOpening() {
    if (openingFinished) return;

    openingFinished = true;
    clearTimeout(openingTimer);

    // Sembunyikan opening secara langsung.
    opening.classList.add("hide");
    opening.style.display = "none";

    // Pastikan halaman utama terlihat.
    mainContent.classList.remove("hidden");
    mainContent.style.removeProperty("display");

    // Bersihkan inline display jika ada aturan lama.
    mainContent.style.opacity = "1";

    window.scrollTo(0, 0);
  }

  // Tombol Skip.
  skipBtn.addEventListener("click", finishOpening);

  // Jaga-jaga jika tombol tidak tertekan.
  openingTimer = setTimeout(finishOpening, 3000);

  /* HOME */
  const homeBtn = document.getElementById("homeBtn");

  if (homeBtn) {
    homeBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  /* POPUP */
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
      const popupID = button.getAttribute("data-close");
      closePopup(document.getElementById(popupID));
    });
  });

  [qrisPopup, confirmPopup].forEach(function (popup) {
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
    }
  });

  /* ORDER PRODUK */
  document.querySelectorAll(".order-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      const product = button.dataset.product || "Produk";
      const message =
        "Min, saya mau order " + product +
        ". Mohon informasi harga dan cara pembayarannya.";

      const url =
        "https://wa.me/" + adminNumber +
        "?text=" + encodeURIComponent(message);

      window.open(url, "_blank");
    });
  });

  /* KONFIRMASI PEMBAYARAN */
  const confirmPayment = document.getElementById("confirmPayment");
  const sendProof = document.getElementById("sendProof");

  if (confirmPayment) {
    confirmPayment.addEventListener("click", function () {
      closePopup(qrisPopup);
      openPopup(confirmPopup);

      const message =
        "Min, saya ingin konfirmasi pembayaran. " +
        "Saya akan mengirimkan bukti pembayaran.";

      if (sendProof) {
        sendProof.href =
          "https://wa.me/" + adminNumber +
          "?text=" + encodeURIComponent(message);
      }
    });
  }

  /* PASTIKAN LINK CHANNEL TETAP AKTIF */
  document.querySelectorAll('a[href*="whatsapp.com/channel"]').forEach(
    function (link) {
      link.href = channelURL;
      link.target = "_blank";
      link.rel = "noopener";
    }
  );
});