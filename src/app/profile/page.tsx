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
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
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
    <div className="min-h-screen bg-neutral-50 pb-20">
      <main className="px-5 pt-12 space-y-6 max-w-md mx-auto">
        {/* User Info Card */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-neutral-100 flex flex-col items-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-poros-500/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-poros-500/5 rounded-full blur-2xl" />

          <div className="relative w-24 h-24 bg-gradient-to-br from-poros-50 to-poros-100 rounded-[1.8rem] p-1 flex items-center justify-center mb-5 text-poros-600 border ring-4 ring-white shadow-sm">
            {user.photoURL ? <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-[1.5rem] object-cover" /> : <User className="w-10 h-10" />}
            {age !== null && <div className="absolute -bottom-2 -right-2 bg-poros-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg border-2 border-white shadow-sm">{age} th</div>}
          </div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">{user.displayName}</h2>
          <p className="text-sm text-neutral-500 font-medium mt-0.5">{user.email}</p>
        </div>

        {/* Persoanal Info Section */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-neutral-100 overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-poros-600" /> Data Diri
            </h3>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="text-xs font-semibold text-poros-600 bg-poros-50 px-3 py-1.5 rounded-full hover:bg-poros-100 transition-colors" disabled={isSaving}>
                Ubah
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setIsEditing(false)} className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-full hover:bg-neutral-200 transition-colors" disabled={isSaving}>
                  Batal
                </button>
                <button onClick={handleSave} className="text-xs font-semibold text-white bg-poros-600 px-3 py-1.5 rounded-full hover:bg-poros-700 transition-colors flex items-center gap-1" disabled={isSaving}>
                  {isSaving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Simpan'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {/* Place of Birth */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-poros-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-poros-600" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-0.5 block">Tempat Lahir</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.placeOfBirth}
                    onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                    className="w-full text-sm font-medium border-b border-poros-200 focus:border-poros-500 focus:outline-none py-1 bg-transparent transition-colors"
                    placeholder="Contoh: Jakarta"
                  />
                ) : (
                  <p className="text-sm font-semibold text-neutral-900">{profile.placeOfBirth || '-'}</p>
                )}
              </div>
            </div>

            {/* Date of Birth */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-poros-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-poros-600" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-0.5 block">Tanggal Lahir</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full text-sm font-medium border-b border-poros-200 focus:border-poros-500 focus:outline-none py-1 bg-transparent transition-colors cursor-pointer"
                  />
                ) : (
                  <p className="text-sm font-semibold text-neutral-900">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-poros-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-5 h-5 text-poros-600" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-0.5 block">Deskripsi Singkat (Pekerjaan/Status)</label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full text-sm font-medium border-b border-poros-200 focus:border-poros-500 focus:outline-none py-1 bg-transparent transition-colors resize-none h-16"
                    placeholder="Contoh: Mahasiswa semester 8, devops engineer"
                  />
                ) : (
                  <p className="text-sm font-semibold text-neutral-900 leading-snug">{profile.bio || '-'}</p>
                )}
              </div>
            </div>
            {/* Target & Life Goal */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-poros-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Target className="w-5 h-5 text-poros-600" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-0.5 block">Target Tabungan / Life Goal</label>
                {isEditing ? (
                  <textarea
                    value={formData.targetGoal}
                    onChange={(e) => setFormData({ ...formData, targetGoal: e.target.value })}
                    className="w-full text-sm font-medium border-b border-poros-200 focus:border-poros-500 focus:outline-none py-1 bg-transparent transition-colors resize-none h-16"
                    placeholder="Contoh: Kumpulin dana darurat kelapa keluarga Rp 15 Juta"
                  />
                ) : (
                  <p className="text-sm font-semibold text-neutral-900 leading-snug">{profile.targetGoal || '-'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-neutral-100 overflow-hidden px-4">
          <button className="w-full py-4 flex items-center gap-4 text-left hover:bg-neutral-50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-600">
              <Settings className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-neutral-900">Preferensi Aplikasi</h4>
              <p className="text-[11px] text-neutral-500 line-clamp-1">Keamanan & personalisasi AI</p>
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 pb-8">
          <Button variant="outline" className="w-full h-14 rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 bg-white shadow-sm font-bold text-sm cursor-pointer" onClick={() => auth.signOut()}>
            <LogOut className="w-5 h-5 mr-2" />
            Keluar Akun
          </Button>
        </div>
      </main>
    </div>
  );
}
