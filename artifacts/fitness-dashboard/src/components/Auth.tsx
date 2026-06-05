import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, User, Lock, Eye, EyeOff, Loader2, UserPlus, LogIn, ChevronRight, ChevronLeft } from 'lucide-react';
import { apiFetch, setToken, today } from '@/lib/api';
import { useStore } from '@/store/useStore';

async function fetchAllUserData() {
  const [profile, foodLogs, workoutLogs, stepEntries, measurements, dailyLog] = await Promise.all([
    apiFetch('/api/profile'),
    apiFetch(`/api/food-logs?date=${today()}`),
    apiFetch('/api/workout-logs'),
    apiFetch('/api/steps'),
    apiFetch('/api/measurements'),
    apiFetch(`/api/daily-logs?date=${today()}`),
  ]);
  return { profile, foodLogs, workoutLogs, stepEntries, measurements, dailyLog } as any;
}

type Tab = 'login' | 'register';

interface AuthResponse {
  token: string;
  username: string;
  userId: number;
}

const GOALS = ['Weight Loss', 'Muscle Gain', 'Maintain Weight', 'Improve Fitness', 'Increase Strength'];
const GENDERS = ['male', 'female', 'other'];

export function Auth() {
  const [tab, setTab] = useState<Tab>('login');

  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register step 1
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);

  // Register step 2
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [goal, setGoal] = useState('Weight Loss');

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loadUserData } = useStore();

  function switchTab(t: Tab) {
    setTab(t);
    setError('');
    setStep(1);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) { setError('Enter username and password'); return; }
    setLoading(true);
    try {
      const data = await apiFetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password }),
      });
      setToken(data.token, rememberMe);
      const userData = await fetchAllUserData();
      login(data.token, data.username, data.userId);
      loadUserData(userData);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleStep1Next(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!regUsername.trim()) { setError('Enter a username'); return; }
    if (!regPassword || regPassword.length < 4) { setError('Password must be at least 4 characters'); return; }
    setStep(2);
  }

  async function handleStep2Submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const parsedAge = parseInt(age);
    if (!age || isNaN(parsedAge) || parsedAge < 10 || parsedAge > 120) {
      setError('Enter a valid age (10–120)');
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: regUsername.trim(),
          password: regPassword,
          age: parsedAge,
          gender,
          goal,
        }),
      });
      setToken(data.token, true);
      const userData = await fetchAllUserData();
      login(data.token, data.username, data.userId);
      loadUserData(userData);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setStep(1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
            <Dumbbell className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">TermFit</h1>
          <p className="text-gray-400 mt-1 text-sm">Your personal fitness companion</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex rounded-xl bg-gray-800 p-1 mb-6">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  tab === t
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1.5">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="your_username"
                      autoComplete="username"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-11 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRememberMe((v) => !v)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                      rememberMe
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-gray-600 bg-transparent'
                    }`}
                  >
                    {rememberMe && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span className="text-gray-400 text-sm select-none cursor-pointer" onClick={() => setRememberMe((v) => !v)}>
                    Remember me
                  </span>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn className="w-4 h-4" /> Sign In</>}
                </button>
              </motion.form>
            ) : step === 1 ? (
              <motion.form
                key="register-step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleStep1Next}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-gray-400 text-xs">Step 1 of 2 — Account details</p>
                  <div className="flex gap-1">
                    <div className="w-6 h-1.5 rounded-full bg-emerald-500" />
                    <div className="w-6 h-1.5 rounded-full bg-gray-700" />
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1.5">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="your_username"
                      autoComplete="username"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showRegPw ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-11 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPw((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showRegPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">Minimum 4 characters</p>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="register-step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleStep2Submit}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-gray-400 text-xs">Step 2 of 2 — Your profile</p>
                  <div className="flex gap-1">
                    <div className="w-6 h-1.5 rounded-full bg-emerald-500" />
                    <div className="w-6 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1.5">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 25"
                    min={10}
                    max={120}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1.5">Gender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {GENDERS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-2.5 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
                          gender === g
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1.5">Fitness Goal</label>
                  <div className="space-y-2">
                    {GOALS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGoal(g)}
                        className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium text-left transition-all duration-200 ${
                          goal === g
                            ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'
                            : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(''); }}
                    className="flex-1 py-3 rounded-xl font-semibold text-gray-300 bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-4 h-4" /> Create Account</>}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-center text-gray-500 text-xs mt-6">
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              {tab === 'login' ? 'Register here' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Developed by Rajith
        </p>
      </motion.div>
    </div>
  );
}
