'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Heart } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import ForgotPasswordModal from '@/components/modals/ForgotPasswordModal';

const BASE_URL = 'http://127.0.0.1:8000/api';

function routeForRole(role: string): string {
  const r = role?.toLowerCase();
  if (r === 'employee') return '/employee/dashboard';
  if (r === 'manager') return '/manager/dashboard';
  if (r === 'employer') return '/employer/dashboard';
  if (r === 'admin' || r === 'super_admin') return '/admin/dashboard';
  return '/employee/dashboard';
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const { refreshUser } = useAuth();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setFieldError('Please fill in all fields.');
      return;
    }
    setFieldError('');
    setLoading(true);

    try {
      // Step 1 — credentials → access_token
      const { data: loginData } = await axios.post(`${BASE_URL}/auth/login`, {
        email: email.trim(),
        password,
      });
      const access_token: string = loginData.access_token;
      if (!access_token) throw new Error('No access token received');

      // Persist token immediately
      localStorage.setItem('access_token', access_token);

      // Step 2 — GET /api/auth/me → full profile with role
      const { data: meData } = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      // API returns { database_profile: {...} }
      const profile = meData?.database_profile ?? meData?.user ?? meData;
      if (!profile?.role) throw new Error('No profile data received');

      // Persist profile — AuthContext reads this on next render
      localStorage.setItem('user_profile', JSON.stringify(profile));

      // ── NEW: Force context to update BEFORE redirecting ──
      await refreshUser();

      toast.success(`Welcome back, ${profile.first_name || 'there'}!`);

      // Navigate based on role
      router.push(routeForRole(profile.role));

    } catch (err: any) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_profile');
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Invalid email or password.';
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">

      {/* Video background */}
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="/assets/bgvideo/bg1.mp4" type="video/mp4" />
      </video>

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-5 py-2.5 bg-white/40 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">D</span>
          </div>
          <span className="text-sm font-semibold text-gray-700">Diltak.ai</span>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg bg-white/90 hover:bg-white transition-colors shadow-sm"
        >
          <ArrowLeft className="h-3 w-3" />
          Go to Webpage
        </Link>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md flex flex-col">

          <AnimatePresence mode="wait">

            {/* ── Login form ── */}
            {!loading && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-t-2xl shadow-xl overflow-hidden"
              >
                <div className="px-10 pt-10 pb-8">
                  <h1 className="text-2xl font-bold text-gray-900">Login to Diltak.ai</h1>
                </div>

                <div className="px-10 pb-10 space-y-5">
                  {fieldError && (
                    <p className="text-[11px] text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">{fieldError}</p>
                  )}

                  <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="username"
                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-colors"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPw ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="enter password"
                          className="w-full text-sm px-3.5 py-2.5 pr-10 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPw ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-center pt-5">
                      <button
                        type="submit"
                        className="px-14 py-2.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
                      >
                        Login
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* ── Loading screen ── */}
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-t-2xl shadow-xl px-10 py-12 flex flex-col items-center gap-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 self-start">Loading your session...</h2>
                <motion.div
                  animate={{ scale: [1, 1.18, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Heart className="h-16 w-16 text-emerald-500 fill-emerald-500" />
                </motion.div>
                <div className="px-14 py-2.5 text-sm font-semibold text-white bg-emerald-500 rounded-lg opacity-80">
                  <motion.span animate={{ opacity: [1, 0.45, 1] }} transition={{ duration: 1.1, repeat: Infinity }}>
                    Loading...
                  </motion.span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Footer strip — same width, attached below card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-b-2xl shadow-xl border-t border-gray-100 px-10 py-3 flex items-center justify-between">
            <button
              onClick={() => setShowForgot(true)}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Forgot username/password?
            </button>
            <span className="text-xs text-gray-500">Terms &amp; Conditions</span>
          </div>
        </div>
      </main>

      <ForgotPasswordModal isOpen={showForgot} onClose={() => setShowForgot(false)} />
    </div>
  );
}
