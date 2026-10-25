// Inisialisasi data riwayat dari localStorage agar data tetap tersimpan saat di-refresh
let riwayatTransaksi = JSON.parse(localStorage.getItem('danzz_riwayat')) || [];

// Variabel sementara untuk menyimpan produk yang sedang dipilih di modal
let produkTerpilih = null;

// Fungsi untuk mengganti halaman (Tab Navigasi Bawah)
function switchPage(pageId, element) {
    // Sembunyikan semua halaman
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    
    // Matikan status aktif di semua tombol navigasi
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Tampilkan halaman terpilih & aktifkan tombolnya
    document.getElementById(`page-${pageId}`).classList.add('active');
    element.classList.add('active');
}

// Fungsi untuk merender/menampilkan data riwayat ke dalam HTML secara dinamis
function renderRiwayat() {
    const kontainerRiwayat = document.getElementById('daftar-riwayat-konten');
    
    if (riwayatTransaksi.length === 0) {
        kontainerRiwayat.innerHTML = `<p class="status-kosong">🔸 Belum ada riwayat pesanan.</p>`;
        return;
    }

    // Map data array menjadi elemen kotak transaksi terstruktur
    kontainerRiwayat.innerHTML = riwayatTransaksi.map(item => `
        <div class="kartu-transaksi-item">
            <div class="trx-info-kiri">
                <span class="trx-nama-produk">${item.nama}</span>
                <span class="trx-tanggal">${item.waktu}</span>
            </div>
            <div class="trx-info-kanan">
                <span class="trx-harga">${item.harga}</span>
                <span class="trx-status-badge">${item.status}</span>
            </div>
        </div>
    `).join('');
}

// Fungsi membuka modal pembayaran
function bukaModalKonfirmasi(namaProduk, hargaProduk) {
    produkTerpilih = { nama: namaProduk, harga: hargaProduk };
    document.getElementById('modal-detail-produk').innerText = `Konfirmasi pembayaran untuk "${namaProduk}" seharga ${hargaProduk}?`;
    document.getElementById('modal-pembayaran').classList.add('open');
}

// Fungsi menutup modal
function tutupModal() {
    document.getElementById('modal-pembayaran').classList.remove('open');
    produkTerpilih = null;
}

// Fungsi UTAMA: Menambahkan riwayat otomatis setelah konfirmasi diklik
function prosesKonfirmasiPembayaran() {
    if (!produkTerpilih) return;

    // Format opsi waktu lokal Indonesia
    const opsiWaktu = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    const waktuSekarang = new Date().toLocaleDateString('id-ID', opsiWaktu);

    // Membuat objek transaksi baru
    const transaksiBaru = {
        nama: produkTerpilih.nama,
        harga: produkTerpilih.harga,
        waktu: waktuSekarang,
        status: 'Sukses'
    };

    // Memasukkan data baru ke urutan paling atas (unshift)
    riwayatTransaksi.unshift(transaksiBaru);

    // Simpan perubahan ke memori browser
    localStorage.setItem('danzz_riwayat', JSON.stringify(riwayatTransaksi));

    // Perbarui visual daftar riwayat seketika
    renderRiwayat();

    // Tutup modal popup
    tutupModal();

    // Otomatis arahkan pengguna ke halaman Riwayat agar perubahan langsung terlihat
    const tombolRiwayatNav = document.querySelectorAll('.nav-item')[1];
    switchPage('riwayat', tombolRiwayatNav);
}

// Jalankan fungsi render riwayat pertama kali saat dokumen selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    renderRiwayat();
});