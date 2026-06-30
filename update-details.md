# Rencana Perombakan Desain Minimalis & Modern - Poros Web App

Berikut adalah rencana detail perombakan tata letak, desain, tipografi, dan logo aplikasi agar menjadi lebih **minimalis, modern, dan classy** menggunakan kombinasi warna **Hitam, Hijau, Putih, dan Abu-abu**, serta menghapus seluruh unsur warna ungu.

---

## 1. Pembaruan Font & Logo Baru
* **Logo Baru**: Mengganti logo lama [[logo.png](file:///c:/D/Project/poros-webapp/public/logo.png)] dengan logo abstrak minimalis bermotif geometris hijau-silver berlatar belakang hitam yang baru saja dibuat.
* **Tipografi Modern (Inter)**: Mengubah font aplikasi di [[layout.tsx](file:///c:/D/Project/poros-webapp/src/app/layout.tsx)] dan [[globals.css](file:///c:/D/Project/poros-webapp/src/app/globals.css)] dari Poppins menjadi **Inter** yang memberikan kesan minimalis dan profesional.

---

## 2. Penghapusan Sisa Warna Ungu
* Menghapus semua definisi variabel warna ungu di [[globals.css](file:///c:/D/Project/poros-webapp/src/app/globals.css)].
* Memastikan semua kelas warna CSS di seluruh berkas hanya mengarah ke spektrum **hitam pekat, hijau emerald, putih, dan abu-abu**.

---

## 3. Redesain Komponen & Tata Letak (Dashboard & Pages)
* **Dashboard ([page.tsx](file:///c:/D/Project/poros-webapp/src/app/page.tsx))**:
  * Mengubah kartu saldo utama (Balance Card) menjadi widget bergaris tipis (zinc-800) tanpa gradien mencolok, menampilkan nominal uang sisa dalam ukuran besar dengan font monospace/sleek.
  * Mengubah progress bar jatah budget yang tebal menjadi garis tipis (1px - 2px) yang minimalis.
  * Meratakan tampilan transaksi terakhir menjadi baris-baris daftar (list) dengan pemisah garis tipis yang bersih.
* **Halaman Login ([login/page.tsx](file:///c:/D/Project/poros-webapp/src/app/login/page.tsx))**:
  * Menghapus efek cahaya melingkar (glowing orbs) di background untuk menciptakan latar belakang yang benar-benar gelap pekat, bersih, dan classy.
  * Menampilkan logo geometris baru yang kontras di tengah layar dengan frame tipis.
  * Tombol masuk Google disederhanakan tanpa drop shadow tebal.
* **Navigasi Bawah ([BottomNav.tsx](file:///c:/D/Project/poros-webapp/src/components/BottomNav.tsx))**:
  * Mengubah floating pill menu menjadi baris menu tipis di bagian bawah tanpa bayangan tebal, memberikan kesan mengambang yang flat dan premium.
* **Analisis AI ([AiAnalysisCard.tsx](file:///c:/D/Project/poros-webapp/src/components/AiAnalysisCard.tsx))**:
  * Kartu analisis diubah dari model kotak-kotak bertumpuk menjadi baris-baris teks terstruktur dengan penunjuk garis vertikal berwarna di sisi kiri untuk membedakan kategori (Pencapaian, Kebocoran, Saran).

---

Silakan tinjau rencana di atas. Jika Anda setuju, klik tombol **Proceed** atau beri tahu saya agar saya dapat langsung mengimplementasikannya.
