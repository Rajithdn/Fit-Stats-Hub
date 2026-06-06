import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { setProfile } from '@/lib/firebaseDb';
import { Dumbbell, Mail, Lock, Eye, EyeOff, Loader2, UserPlus, LogIn, ChevronRight, ChevronLeft } from 'lucide-react';

const GOALS = ['Weight Loss', 'Maintenance', 'Lean Bulk', 'Weight Gain'];
const GENDERS = ['male', 'female', 'other'];
const ACTIVITY_LEVELS = [
  { value: 'Sedentary',         label: 'Sedentary',         sub: 'desk job, no exercise' },
  { value: 'Lightly Active',    label: 'Lightly Active',    sub: '1–3 days/week' },
  { value: 'Moderately Active', label: 'Moderately Active', sub: '3–5 days/week' },
  { value: 'Very Active',       label: 'Very Active',       sub: '6–7 days/week' },
  { value: 'Super Active',      label: 'Super Active',      sub: 'athlete / physical job' },
];

type Tab = 'login' | 'register';

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current ? 'w-6 bg-emerald-500' : 'w-3 bg-gray-700'
          }`}
        />
      ))}
    </div>
  );
}

export function Auth() {
  const [tab, setTab] = useState<Tab>('login');

  // Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Register step 1 — account
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);

  // Register step 2 — personal
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');

  // Register step 3 — fitness
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('Moderately Active');
  const [goal, setGoal] = useState('Weight Loss');

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function switchTab(t: Tab) {
    setTab(t);
    setError('');
    setStep(1);
  }

  function friendlyError(code: string) {
    if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential'))
      return 'Invalid email or password';
    if (code.includes('email-already-in-use')) return 'Email already registered';
    if (code.includes('invalid-email')) return 'Invalid email address';
    if (code.includes('weak-password')) return 'Password must be at least 6 characters';
    if (code.includes('too-many-requests')) return 'Too many attempts — try again later';
    return 'Something went wrong. Try again.';
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError('Enter email and password'); return; }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // onAuthStateChanged in App.tsx handles the rest
    } catch (err: any) {
      setError(friendlyError(err.code ?? ''));
    } finally {
      setLoading(false);
    }
  }

  function handleStep1Next(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!regEmail.trim() || !regEmail.includes('@')) { setError('Enter a valid email'); return; }
    if (!regPassword || regPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setStep(2);
  }

  function handleStep2Next(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Enter your name'); return; }
    const parsedAge = parseInt(age);
    if (!age || isNaN(parsedAge) || parsedAge < 10 || parsedAge > 120) {
      setError('Enter a valid age (10–120)'); return;
    }
    setStep(3);
  }

  async function handleStep3Submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const h = parseFloat(height), w = parseFloat(weight), tw = parseFloat(targetWeight);
    if (!height || isNaN(h) || h < 100 || h > 250) { setError('Enter a valid height (100–250 cm)'); return; }
    if (!weight || isNaN(w) || w < 30 || w > 300)  { setError('Enter a valid weight (30–300 kg)'); return; }
    if (!targetWeight || isNaN(tw) || tw < 30 || tw > 300) { setError('Enter a valid target weight'); return; }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, regEmail.trim(), regPassword);
      await setProfile(cred.user.uid, {
        name: name.trim(),
        age: parseInt(age),
        gender,
        height: h,
        weight: w,
        targetWeight: tw,
        activityLevel,
        goal,
        dailyCalorieGoal: 2000,
        stepGoal: 10000,
        theme: 'dark',
        profilePhoto: '',
      });
      // onAuthStateChanged in App.tsx handles navigation
    } catch (err: any) {
      setError(friendlyError(err.code ?? ''));
      setStep(1);
    } finally {
      setLoading(false);
    }
  }

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 30 : -30 }),
    center: { opacity: 1, x: 0 },
    exit:  (dir: number) => ({ opacity: 0, x: dir > 0 ? -30 : 30 }),
  };

  const inputCls =
    'w-full bg-gray-800 border border-gray-700 rounded-xl py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm';

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-950 px-4 py-8">
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
                  tab === t ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" custom={1}>
            {/* ── LOGIN ── */}
            {tab === 'login' ? (
              <motion.form
                key="login"
                custom={-1}
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" autoComplete="email"
                      className={`${inputCls} pl-10 pr-4`} />
                  </div>
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" autoComplete="current-password"
                      className={`${inputCls} pl-10 pr-11`} />
                    <button type="button" onClick={() => setShowPw((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                    {error}
                  </motion.p>
                )}
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn className="w-4 h-4" /> Sign In</>}
                </button>
              </motion.form>

            ) : step === 1 ? (
              /* ── REGISTER STEP 1 ── */
              <motion.form key="reg-1" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.2 }} onSubmit={handleStep1Next} className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-gray-400 text-xs">Step 1 of 3 — Account</p>
                  <StepDots current={1} total={3} />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="you@example.com" autoComplete="email"
                      className={`${inputCls} pl-10 pr-4`} />
                  </div>
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type={showRegPw ? 'text' : 'password'} value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="min 6 characters" autoComplete="new-password"
                      className={`${inputCls} pl-10 pr-11`} />
                    <button type="button" onClick={() => setShowRegPw((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showRegPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                    {error}
                  </motion.p>
                )}
                <button type="submit"
                  className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 transition-all flex items-center justify-center gap-2 mt-2">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </motion.form>

            ) : step === 2 ? (
              /* ── REGISTER STEP 2 ── */
              <motion.form key="reg-2" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.2 }} onSubmit={handleStep2Next} className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-gray-400 text-xs">Step 2 of 3 — Personal Info</p>
                  <StepDots current={2} total={3} />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1.5">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name"
                    className={`${inputCls} px-4`} />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1.5">Age</label>
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 25" min={10} max={120}
                    className={`${inputCls} px-4`} />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1.5">Gender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {GENDERS.map((g) => (
                      <button key={g} type="button" onClick={() => setGender(g)}
                        className={`py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                          gender === g
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                        }`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                    {error}
                  </motion.p>
                )}
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => { setStep(1); setError(''); }}
                    className="flex-1 py-3 rounded-xl font-semibold text-gray-300 bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button type="submit"
                    className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 transition-all flex items-center justify-center gap-2">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.form>

            ) : (
              /* ── REGISTER STEP 3 ── */
              <motion.form key="reg-3" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.2 }} onSubmit={handleStep3Submit} className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-gray-400 text-xs">Step 3 of 3 — Fitness Info</p>
                  <StepDots current={3} total={3} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Height (cm)', val: height, set: setHeight, ph: '170', min: 100, max: 250 },
                    { label: 'Weight (kg)', val: weight, set: setWeight, ph: '70', min: 30, max: 300 },
                    { label: 'Target (kg)', val: targetWeight, set: setTargetWeight, ph: '65', min: 30, max: 300 },
                  ].map(({ label, val, set: sv, ph, min, max }) => (
                    <div key={label}>
                      <label className="text-gray-300 text-xs font-medium block mb-1.5">{label}</label>
                      <input type="number" value={val} onChange={(e) => sv(e.target.value)} placeholder={ph} min={min} max={max} step={0.1}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1.5">Activity Level</label>
                  <div className="space-y-1.5">
                    {ACTIVITY_LEVELS.map((a) => (
                      <button key={a.value} type="button" onClick={() => setActivityLevel(a.value)}
                        className={`w-full py-2 px-3 rounded-xl text-sm text-left transition-all flex items-center justify-between ${
                          activityLevel === a.value
                            ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'
                            : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                        }`}>
                        <span className="font-medium">{a.label}</span>
                        <span className="text-xs opacity-70">{a.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1.5">Goal</label>
                  <div className="grid grid-cols-2 gap-2">
                    {GOALS.map((g) => (
                      <button key={g} type="button" onClick={() => setGoal(g)}
                        className={`py-2.5 px-3 rounded-xl text-sm font-medium text-center transition-all ${
                          goal === g
                            ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'
                            : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                        }`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                    {error}
                  </motion.p>
                )}
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => { setStep(2); setError(''); }}
                    className="flex-1 py-3 rounded-xl font-semibold text-gray-300 bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-4 h-4" /> Create Account</>}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-center text-gray-500 text-xs mt-6">
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              {tab === 'login' ? 'Register here' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">Developed by Rajith</p>
      </motion.div>
    </div>
  );
}
