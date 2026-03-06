# Tabung Menabung 💸

**Tabung Menabung** adalah aplikasi pencatatan keuangan pribadi (Personal Finance Tracker) berbasis web yang dirancang sangat minimalis, difokuskan untuk penggunaan di handphone (*mobile-first*), cepat, dan mudah dipahami oleh siapapun.

Dibangun dengan *tech stack* modern untuk menjamin kepuasan pengguna. Aplikasi ini memiliki fitur manajemen kategori budget, pencatatan pengeluaran harian, pengelolaan pendapatan bulanan, serta fitur riwayat bulan-bulan sebelumnya yang disimpan aman dengan layanan Cloud Google.

## ✨ Fitur Utama
- **Autentikasi Cepat:** Login menggunakan akun Google (Google Sign-In) yang di-handle dengan Firebase Authentication. Aman dan praktis.
- **Set Total Pendapatan:** Catat jumlah gajian / pemasukan bulan ini untuk melihat perbandingan secara *real-time* dengan pengeluaranmu.
- **Kategori Budget 100% Fleksibel:** Buat sendiri kotak alokasi budget bulanan (contoh: "Makan", "Cicilan", "Nongkrong"). Atur dana dan edit nominalnya kapan saja.
- **Pencatatan Cepat Laksana Petir:** Tombol mengambang `+` (Floating Action Button) yang bisa ditekan kapan pun untuk mencatat *expense* baru seketika.
- **Riwayat Pengeluaran (Current Month):** Pantau seluruh pengeluaran terkini di dashboard. Tersedia juga fitur "Reset Data" untuk membersihkan history pengeluaran bulan ini saja jika kamu keliru atau sekedar *testing*.
- **Arsip Bulanan (History):** Klik ikon "Jam" untuk kembali melihat arsip alokasi data dan pengeluaran utuh dari bulan-bulan yang telah terlewati.
- **Desain Kelas Bintang Lima:** Layar *dashboard* menggunakan *font* Poppins, *icon* Shadcn yang rapi, *progress bar* dinamis, dan kursor interaktif dengan tema gradien Emerald Green.

## 🛠️ Tech Stack
- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Backend & Database:** [Firebase SDK](https://firebase.google.com/) (Authentication & Firestore)
- **Typography:** [Google Fonts (Poppins)](https://fonts.google.com/specimen/Poppins)
- **Date Utility:** [date-fns](https://date-fns.org/)

## 🚀 Cara Instalasi & Menjalankan (Development)

Untuk menjalankan proyek ini secara lokal di komputermu, ikuti langkah berikut:

### 1. Kloning Repository & Install Dependencies
Pastikan Node.js sudah terinstal. Buka *terminal* dan ketik:
```bash
git clone https://github.com/ichramsyah/tabung-menabung-webapp.git
cd tabung-menabung-webapp
npm install
```

### 2. Siapkan Firebase (Wajib)
Aplikasi ini sangat bergantung pada Firebase. Kamu harus membuat layanan database sendiri:
1. Buka [Firebase Console](https://console.firebase.google.com/) dan buat project baru.
2. Aktifkan fitur **Authentication** > **Google Sign-In**.
3. Aktifkan fitur **Firestore Database**.
4. Di bagian **Project Settings**, dapatkan config "Web App" API Keys milikmu.

### 3. Konfigurasi Environment Variables
Buat file bernama `.env.local` di sebelah *package.json* (root), dan masukkan credential dari Firebase:
```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyA..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="id-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="id-project"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="id-project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcde"
```

### 4. Setup Firestore Security Rules
Di Firebase Console, buka menu Firestore -> tab **Rules**, lalu _copy-paste_ aturan di bawah ini agar database aman dan fitur berfungsi normal:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /budgets/{budgetId} {
      allow read, delete: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create, update: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /expenses/{expenseId} {
      allow read, delete: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create, update: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /income/{incomeId} {
      allow read, delete: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create, update: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 5. Running Server
Jalankan server *development*:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browsermu!

## 📦 Panduan Deployment (Vercel)
Aplikasi ini 100% *compatible* untuk langsung di-_deploy_ gratis ke [Vercel](https://vercel.com).
1. *Push* kode ini ke akun Github kamu.
2. Buka Vercel dan buat *New Project* dari repository Github tersebut.
3. **PENTING:** Tambahkan semua kunci (`NEXT_PUBLIC_FIREBASE_...`) dari tahap `.env.local` ke kolom **Environment Variables** di _dashboard setting_ Vercel sebelum menekan tombol *Deploy*.

---
_Dibuat dengan bantuan sistem AI kolaboratif - 2026._
