'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { getYearlyMetrics, MonthMetric } from '@/lib/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MetricsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<MonthMetric[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState<string[]>([currentYear]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        setIsLoadingData(true);
        const data = await getYearlyMetrics(user.uid, selectedYear);
        setMetrics(data);

        // Generate years (Current year - 4 to Current year)
        const years = Array.from({ length: 5 }, (_, i) => (parseInt(currentYear) - i).toString());
        setAvailableYears(years);

      } catch (error) {
        console.error('Failed to load metrics:', error);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, [user, selectedYear, currentYear]);

  if (loading || !user || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-4 border-poros-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 p-3 border border-zinc-800 shadow-lg rounded-xl text-xs">
          <p className="font-bold text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.name === 'Pendapatan' ? '#10b981' : entry.name === 'Pengeluaran' ? '#a1a1aa' : '#ffffff' }} className="font-medium mt-1">
              {entry.name}: {formatRupiah(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartData = metrics.map(m => {
    const [y, mStr] = m.monthYear.split('-');
    const date = new Date(parseInt(y), parseInt(mStr) - 1, 1);
    return {
      ...m,
      monthName: format(date, 'MMM', { locale: id }), // "Jan", "Feb"
      Netto: m.income - m.expenditure
    };
  });

  const totalIncome = metrics.reduce((sum, m) => sum + m.income, 0);
  const totalExpenditure = metrics.reduce((sum, m) => sum + m.expenditure, 0);
  const netSavings = totalIncome - totalExpenditure;

  return (
    <div className="min-h-screen bg-black text-zinc-100 pb-32">
      <main className="px-6 pt-16 space-y-8 max-w-md mx-auto">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <h1 className="text-xl font-bold tracking-tight text-white uppercase tracking-wider">Metrik Tahunan</h1>

          <Select value={selectedYear} onValueChange={(val) => { if (val) setSelectedYear(val); }}>
            <SelectTrigger className="w-24 h-9 bg-zinc-950 border border-zinc-900 shadow-sm rounded-xl font-medium text-xs text-zinc-300 cursor-pointer">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year} className="cursor-pointer text-xs">{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Flat Summary Columns */}
        <section className="grid grid-cols-2 py-2 border-b border-zinc-900">
          <div className="pr-4 border-r border-zinc-900">
            <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider mb-1">Total Masuk</p>
            <h2 className="text-xl font-semibold text-poros-500 font-mono">{formatRupiah(totalIncome)}</h2>
          </div>
          <div className="pl-4">
            <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider mb-1">Total Keluar</p>
            <h2 className="text-xl font-semibold text-zinc-400 font-mono">{formatRupiah(totalExpenditure)}</h2>
          </div>
        </section>

        <section className="py-2 border-b border-zinc-900">
          <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider mb-1">Total Tabungan Bersih</p>
          <h2 className={`text-2xl font-semibold font-mono ${netSavings >= 0 ? 'text-white' : 'text-rose-500'}`}>
            {formatRupiah(netSavings)}
          </h2>
        </section>

        {/* Chart Section */}
        <section className="border border-zinc-900 bg-zinc-950/20 p-5 rounded-2xl">
          <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-400 mb-6">Grafik Arus Kas ({selectedYear})</h3>

          <div className="h-[280px] w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                <XAxis
                  dataKey="monthName"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#71717a' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#71717a' }}
                  tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: "compact", compactDisplay: "short" }).format(value)}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#09090b', opacity: 0.5 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', paddingTop: '20px' }} />

                <Bar dataKey="income" name="Pendapatan" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={20} />
                <Bar dataKey="expenditure" name="Pengeluaran" fill="#27272a" radius={[3, 3, 0, 0]} maxBarSize={20} />
                <Line type="monotone" dataKey="Netto" name="Bersih" stroke="#ffffff" strokeWidth={1.5} dot={{ r: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
}
