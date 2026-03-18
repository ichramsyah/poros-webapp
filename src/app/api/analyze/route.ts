import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API Key is not set.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const body = await req.json();
    const { monthYear, income, totalExpenses, budgets, age = 21, bio = '', previousMonth, targetGoal = '', userName = 'Pengguna' } = body;

    const allocated = budgets.reduce((acc: number, b: any) => acc + b.allocatedAmount, 0);
    const savingRate = income > 0 ? Math.max(0, ((income - totalExpenses) / income) * 100) : 0;

    let trendContext = '';
    if (previousMonth && (previousMonth.income > 0 || previousMonth.totalSpent > 0)) {
      const prevSavingRate = previousMonth.income > 0 ? Math.max(0, ((previousMonth.income - previousMonth.totalSpent) / previousMonth.income) * 100) : 0;
      trendContext = `\n[Context: Data Bulan Sebelumnya]\nPendapatan Rp${previousMonth.income}, Total Pengeluaran Rp${previousMonth.totalSpent}, Saving Rate Aktual: ${prevSavingRate.toFixed(1)}%. BACA DATA INI JIKA ADA SEBAGAI REFERENSI UNTUK MELIHAT PERKEMBANGAN (TREND) USER DAN BERIKAN KOMENTAR/PUJIAN.\n`;
    }

    const prompt = `
Kamu adalah asisten keuangan pribadi bernama "Poros" milik ${userName} yang saat ini berumur ${age} tahun${bio ? ` dengan profil/status utama sebagai: "${bio}"` : ''}. 
TUGAS UTAMA: Evaluasi data keuangan bulanan berikut ini. Dalam memberikan skor, teguran, pujian, dan terutama SARAN (advice), kamu WAJIB mempertimbangkan faktor usia si ${userName} (${age} tahun)${bio ? ` serta latar belakang pekerjaannya/statusnya ("${bio}")` : ''} secara tajam dan spesifik. Sesuaikan teguran/pujian dengan identitasnya. Gunakan panggilan nama "${userName}" secara natural.

ATURAN WAJIB (STRICT RULES):
1. THE HARD NUMBERS: Kamu WAJIB menyebutkan angka nominal sisa uang (Total Pendapatan - Pengeluaran) secara eksplisit. Hitung selisih pastinya.
2. NGEROASTING & NGOBROL (SUMMARY): Buatkan satu paragraf penuh ("Kesimpulan Poros") di mana kamu nyerocos panjang lebar murni meng-analisa keseluruhan bulan ini (pengeluaran, pendapatan, tren), ngomong gaya lu santai tapi tajem kek anak Jaksel. Mulai dengan kalimat pembuka seperti "Dari analisis gw bulan ini...".
3. MVP CATEGORY: Kamu WAJIB menganalisa efisiensi kategori pengeluaran dan menyebutkan Pemenangnya secara detail di bagian \`praise\`.
4. TREND & REKAM JEJAK: Jika ada data bulan sebelumnya, kamu WAJIB menganalisa dan menyebutkan trennya di dalam \`summary\` (contoh: "Bulan ini pengeluaran lo turun Rp 500.000 dibanding bulan lalu, mantap!").
${targetGoal ? `5. TARGET GOAL PENGGUNA: "${targetGoal}". Saran (\`advice\`) yang kamu berikan HARUS merujuk pada target ini. Arahkan nominal uang sisa untuk mencapai target secara konkret!` : '5. Bimbing pengguna mengatur sisa uang secara spesifik berdasarkan umur/pekerjaan di bagian \`advice\`.'}
6. GAYA BAHASA: Panjang lebar, asik, detail, dan komprehensif. Jangan pelit kata. Berikan penjelasan seperti seorang konsultan keuangan. Gunakan 3-5 kalimat untuk tiap poin saran atau pujian.

Berikan output HANYA dalam format JSON strict.

Bulan/Tahun: ${monthYear}
Total Pendapatan: Rp${income}
Total Alokasi Budget: Rp${allocated}
Total Pengeluaran Valid: Rp${totalExpenses}
Saving Rate Aktual: ${savingRate.toFixed(1)}%
${trendContext}

Daftar Kategori beserta Kinerjanya:
${budgets.map((b: any) => `- ${b.category}: Alokasi Rp${b.allocatedAmount}, Terpakai Rp${b.spentAmount} (Sisa Rp${b.allocatedAmount - b.spentAmount})`).join('\n')}

Buatlah laporan analisis keuangan dengan JSON schema berikut ini. Gunakan gaya bahasa asisten yang smart, rada jutek tapi peduli (santai).

{
  "savingRate": ${savingRate}, 
  "healthScore": angka_skor_0_sampai_100,
  "topLeaks": [
    {
      "category": "nama kategori bermasalah", 
      "message": "Pesan teguran detail untuk kategori ini"
    }
  ],
  "summary": "1 Paragraf komprehensif, naratif, asik seperti ngobrol langsung. Berisi rekap seluruh bulan ini, tren bulan lalu (jika ada), pendapatan vs pengeluaran dsb (sekitar 3-5 kalimat full).",
  "praise": "Pesan pujian yang panjang lebar (3-4 kalimat). Sebutkan analisis MVP Category di sini. Jelaskan kenapa itu bagus.",
  "advice": "Saran actionable komprehensif (3-5 kalimat). Wajib sebutkan nominal sisa uang secara persis, dan jabarkan langkah-langkah konkret sesuai TARGET GOAL."
}

Catatan penting:
- topLeaks maksimal 2 objek, kosongkan array jika tidak ada kategori yang bocor/overbudget.
- Jangan tambahkan teks markdown seperti \`\`\`json. Keluarkan raw JSON string text saja.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No response from AI');
    }

    const json = JSON.parse(text);
    return NextResponse.json(json);
  } catch (error) {
    console.error('AI Analysis error:', error);
    return NextResponse.json({ error: 'Failed to generate analysis' }, { status: 500 });
  }
}
