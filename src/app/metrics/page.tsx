'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { getYearlyMetrics, MonthMetric } from '@/lib/firestore';
import { Card, CardContent } from '@/components/ui/card';
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
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
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
        <div className="bg-white p-3 border border-neutral-100 shadow-lg rounded-xl text-xs">
          <p className="font-bold text-neutral-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-medium mt-1">
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
    <div className="min-h-screen bg-neutral-50 pb-28">
      <main className="px-5 pt-12 space-y-6 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-neutral-900">Metrik Tahunan</h1>

          <Select value={selectedYear} onValueChange={(val) => { if (val) setSelectedYear(val); }}>
            <SelectTrigger className="w-28 bg-white border-none shadow-sm rounded-xl font-medium">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden">
            <CardContent className="p-5">
              <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider mb-1">Total Pendapatan</p>
              <h2 className="text-lg font-bold tracking-tight text-poros-600">{formatRupiah(totalIncome)}</h2>
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden">
            <CardContent className="p-5">
              <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider mb-1">Total Pengeluaran</p>
              <h2 className="text-lg font-bold tracking-tight text-poros-400">{formatRupiah(totalExpenditure)}</h2>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-5">
            <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider mb-1">Total Tabungan Bersih</p>
            <h2 className={`text-2xl font-bold tracking-tight ${netSavings >= 0 ? 'text-poros-600' : 'text-red-500'}`}>
              {formatRupiah(netSavings)}
            </h2>
          </CardContent>
        </Card>

        {/* Chart Section */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-neutral-100">
          <h3 className="text-sm font-bold text-neutral-900 mb-6">Grafik Arus Kas ({selectedYear})</h3>

          <div className="h-[300px] w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis
                  dataKey="monthName"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#a3a3a3' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#a3a3a3' }}
                  tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: "compact", compactDisplay: "short" }).format(value)}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f5f5' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />

                <Bar dataKey="income" name="Pendapatan" fill="#441752" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="expenditure" name="Pengeluaran" fill="#c6b2ce" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Line type="monotone" dataKey="Netto" name="Bersih" stroke="#171717" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </main>
    </div>
  );
}
