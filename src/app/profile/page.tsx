'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, User, Settings, Edit2, Save, X, MapPin, Calendar, Heart, FileText, Target } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { getUserProfile, updateUserProfile, UserProfile } from '@/lib/firestore';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ placeOfBirth: '', dateOfBirth: '', bio: '', targetGoal: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      getUserProfile(user.uid, user.email || '', user.displayName || '').then((p) => {
        setProfile(p);
        setFormData({ placeOfBirth: p.placeOfBirth || '', dateOfBirth: p.dateOfBirth || '', bio: p.bio || '', targetGoal: p.targetGoal || '' });
      });
    }
  }, [user, loading, router]);

  if (loading || !user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-4 border-poros-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, formData);
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      setIsSaving(false);
    }
  };

  const calculateAge = (dobString?: string) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  const age = calculateAge(profile.dateOfBirth);

  return (
    <div className="min-h-screen bg-black text-zinc-100 pb-32">
      <main className="px-6 pt-16 space-y-8 max-w-md mx-auto">
        {/* User Info Header Widget */}
        <section className="py-6 border-b border-zinc-900 flex flex-col items-center text-center relative overflow-hidden">
          <div className="relative w-20 h-20 bg-zinc-950 rounded-2xl p-0.5 flex items-center justify-center mb-4 text-poros-500 border border-zinc-900">
            {user.photoURL ? <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-[0.9rem] object-cover" /> : <User className="w-8 h-8" />}
            {age !== null && <div className="absolute -bottom-1.5 -right-1.5 bg-poros-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded border border-zinc-950">{age} th</div>}
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">{user.displayName}</h2>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">{user.email}</p>
        </section>

        {/* Personal Info Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-poros-500" /> Data Diri
            </h3>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="text-[11px] font-semibold text-poros-500 bg-poros-500/10 px-3 py-1 rounded-full border border-poros-500/20 hover:bg-poros-500/20 transition-colors cursor-pointer" disabled={isSaving}>
                Ubah
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setIsEditing(false)} className="text-[11px] font-semibold text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full hover:bg-zinc-800 transition-colors cursor-pointer" disabled={isSaving}>
                  Batal
                </button>
                <button onClick={handleSave} className="text-[11px] font-bold text-black bg-poros-500 px-3 py-1 rounded-full hover:bg-poros-600 transition-colors flex items-center gap-1 cursor-pointer" disabled={isSaving}>
                  {isSaving ? <div className="w-2.5 h-2.5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : 'Simpan'}
                </button>
              </div>
            )}
          </div>

          <div className="divide-y divide-zinc-900 border-b border-zinc-900">
            {/* Place of Birth */}
            <div className="py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-850 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="flex-1">
                <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 mb-0.5 block">Tempat Lahir</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.placeOfBirth}
                    onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                    className="w-full text-xs font-semibold border border-zinc-900 bg-zinc-950 text-white rounded-lg px-2 py-1.5 focus:border-poros-500 focus:outline-none transition-colors"
                    placeholder="Contoh: Jakarta"
                  />
                ) : (
                  <p className="text-sm font-semibold text-zinc-200">{profile.placeOfBirth || '-'}</p>
                )}
              </div>
            </div>

            {/* Date of Birth */}
            <div className="py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-850 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="flex-1">
                <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 mb-0.5 block">Tanggal Lahir</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full text-xs font-semibold border border-zinc-900 bg-zinc-950 text-white rounded-lg px-2 py-1.5 focus:border-poros-500 focus:outline-none transition-colors cursor-pointer"
                  />
                ) : (
                  <p className="text-sm font-semibold text-zinc-200">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="py-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-850 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="flex-1">
                <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 mb-0.5 block">Status / Pekerjaan</label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full text-xs font-semibold border border-zinc-900 bg-zinc-950 text-white rounded-lg px-2.5 py-1.5 focus:border-poros-500 focus:outline-none transition-colors resize-none h-16"
                    placeholder="Contoh: Mahasiswa semester 8, devops engineer"
                  />
                ) : (
                  <p className="text-sm font-semibold text-zinc-200 leading-snug">{profile.bio || '-'}</p>
                )}
              </div>
            </div>

            {/* Target & Life Goal */}
            <div className="py-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-850 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Target className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="flex-1">
                <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 mb-0.5 block">Target Tabungan</label>
                {isEditing ? (
                  <textarea
                    value={formData.targetGoal}
                    onChange={(e) => setFormData({ ...formData, targetGoal: e.target.value })}
                    className="w-full text-xs font-semibold border border-zinc-900 bg-zinc-950 text-white rounded-lg px-2.5 py-1.5 focus:border-poros-500 focus:outline-none transition-colors resize-none h-16"
                    placeholder="Contoh: Kumpulin dana darurat kepala keluarga Rp 15 Juta"
                  />
                ) : (
                  <p className="text-sm font-semibold text-zinc-200 leading-snug">{profile.targetGoal || '-'}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Menu Items List */}
        <section className="divide-y divide-zinc-900 border-t border-b border-zinc-900">
          <button className="w-full py-4 flex items-center gap-4 text-left hover:bg-zinc-950/40 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-850 flex items-center justify-center text-zinc-500">
              <Settings className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white">Preferensi Aplikasi</h4>
              <p className="text-[10px] text-zinc-500 line-clamp-1">Keamanan & personalisasi AI</p>
            </div>
          </button>
        </section>

        {/* Logout Button */}
        <div className="pt-2 pb-8">
          <Button variant="outline" className="w-full h-12 rounded-xl border border-rose-950/40 text-rose-450 hover:bg-rose-950/20 hover:text-rose-400 bg-zinc-950 shadow-md font-bold text-xs cursor-pointer" onClick={() => auth.signOut()}>
            <LogOut className="w-4 h-4 mr-2" />
            Keluar Akun
          </Button>
        </div>
      </main>
    </div>
  );
}
