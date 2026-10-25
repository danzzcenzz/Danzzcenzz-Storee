document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // =====================================
    // ELEMEN UTAMA
    // =====================================

    const loadingScreen = document.getElementById("loading-screen");
    const skipButton = document.getElementById("skip-btn");
    const progressBar = document.getElementById("progress-bar");
    const modalOverlay = document.getElementById("modal-overlay");
    const toast = document.getElementById("toast");

    let openingFinished = false;
    let progress = 0;
    let progressTimer = null;
    let toastTimer = null;
    let previousOverflow = "";

    // =====================================
    // OPENING DAN LOADING
    // =====================================

    function finishOpening() {
        if (openingFinished) return;

        openingFinished = true;

        if (progressTimer) {
            clearInterval(progressTimer);
            progressTimer = null;
        }

        if (progressBar) {
            progressBar.style.width = "100%";
        }

        if (loadingScreen) {
            loadingScreen.classList.add("finished");

            // Hilangkan opening dari layar setelah animasi.
            setTimeout(function () {
                loadingScreen.style.display = "none";
            }, 500);
        }

        showToast("Selamat datang di DANZZCENZZ-STORE!");
    }

    if (skipButton) {
        skipButton.addEventListener("click", finishOpening);
    }

    if (progressBar) {
        progressTimer = setInterval(function () {
            if (openingFinished) return;

            progress += 2;

            if (progress >= 100) {
                progress = 100;
                progressBar.style.width = "100%";

                clearInterval(progressTimer);
                progressTimer = null;

                setTimeout(finishOpening, 250);
            } else {
                progressBar.style.width = progress + "%";
            }
        }, 60);
    } else {
        // Cadangan apabila progress bar tidak ditemukan.
        setTimeout(finishOpening, 3000);
    }

    // =====================================
    // NOTIFIKASI
    // =====================================

    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        if (toastTimer) {
            clearTimeout(toastTimer);
        }

        toastTimer = setTimeout(function () {
            toast.classList.remove("show");
        }, 2500);
    }

    // =====================================
    // NAVIGASI BAWAH
    // =====================================

    const navButtons = document.querySelectorAll(".nav-btn");

    const pageSections = [
        document.getElementById("home-section"),
        document.getElementById("product-section"),
        document.getElementById("contact-section")
    ];

    function showPage(pageId) {
        pageSections.forEach(function (section) {
            if (!section) return;

            section.classList.toggle(
                "hidden",
                section.id !== pageId
            );
        });

        navButtons.forEach(function (button) {
            button.classList.toggle(
                "active",
                button.dataset.page === pageId
            );
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    navButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const pageId = button.dataset.page;

            if (!pageId) return;

            showPage(pageId);
        });
    });

    // =====================================
    // MODAL MENGAMBANG
    // =====================================

    const channelModal = document.getElementById("channel-modal");
    const paymentModal = document.getElementById("payment-modal");
    const confirmModal = document.getElementById("confirm-modal");

    const allModals = [
        channelModal,
        paymentModal,
        confirmModal
    ];

    function openModal(modal) {
        if (!modal || !modalOverlay) return;

        allModals.forEach(function (item) {
            if (item) item.classList.add("hidden");
        });

        modal.classList.remove("hidden");
        modalOverlay.classList.add("active");
        modalOverlay.setAttribute("aria-hidden", "false");

        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        if (!modalOverlay) return;

        modalOverlay.classList.remove("active");
        modalOverlay.setAttribute("aria-hidden", "true");

        document.body.style.overflow = previousOverflow;

        setTimeout(function () {
            if (!modalOverlay.classList.contains("active")) {
                allModals.forEach(function (modal) {
                    if (modal) modal.classList.add("hidden");
                });
            }
        }, 260);
    }

    // Tutup modal melalui semua tombol tutup.
    document.querySelectorAll("[data-close-modal]").forEach(function (button) {
        button.addEventListener("click", closeModal);
    });

    // Tutup modal jika pengguna menekan area gelap.
    if (modalOverlay) {
        modalOverlay.addEventListener("click", function (event) {
            if (event.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // Tutup modal menggunakan tombol Escape.
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeModal();
        }
    });

    // =====================================
    // TOMBOL QRIS
    // =====================================

    const openPaymentButton = document.getElementById("open-payment-btn");
    const productPaymentButton = document.getElementById("product-payment-btn");
    const confirmPaymentButton = document.getElementById("confirm-payment-btn");

    if (openPaymentButton) {
        openPaymentButton.addEventListener("click", function () {
            openModal(paymentModal);
        });
    }

    if (productPaymentButton) {
        productPaymentButton.addEventListener("click", function () {
            openModal(paymentModal);
        });
    }

    if (confirmPaymentButton) {
        confirmPaymentButton.addEventListener("click", function () {
            openModal(confirmModal);
        });
    }

    // =====================================
    // ORDER PRODUK
    // =====================================

    const productOrderButton = document.getElementById("product-order-btn");

    if (productOrderButton) {
        productOrderButton.addEventListener("click", function () {
            const orderURL =
                "https://wa.me/62882000379621?text=" +
                encodeURIComponent("Min, saya mau tanya produk dan harga.");

            window.open(orderURL, "_blank", "noopener,noreferrer");
        });
    }

    // =====================================
    // PEMERIKSAAN GAMBAR QRIS
    // =====================================

    const qrisImage = document.getElementById("qris-image");
    const qrisError = document.getElementById("qris-error");

    if (qrisImage && qrisError) {
        qrisImage.addEventListener("error", function () {
            qrisError.classList.remove("hidden");
            qrisImage.classList.add("hidden");
        });

        qrisImage.addEventListener("load", function () {
            qrisError.classList.add("hidden");
            qrisImage.classList.remove("hidden");
        });

        // Periksa juga jika gambar sudah selesai dimuat
        // sebelum event listener terpasang.
        if (qrisImage.complete && qrisImage.naturalWidth === 0) {
            qrisError.classList.remove("hidden");
            qrisImage.classList.add("hidden");
        }
    }

    // =====================================
    // PENGAMAN: OPENING TIDAK BOLEH MACET
    // =====================================

    // Walaupun terjadi masalah pada timer, opening
    // tetap akan selesai setelah batas waktu ini.
    setTimeout(function () {
        if (!openingFinished) {
            finishOpening();
        }
    }, 8000);

});