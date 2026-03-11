import { useState } from 'react';
import { Fish, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    // Simulate authentication delay
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    localStorage.setItem('tightlines_user', JSON.stringify({ email, name: email.split('@')[0] }));
    onLogin();
  };

  return (
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(180deg, #2a1a0e 0%, #1c1917 40%, #1c1917 100%)' }}>

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #d97706 0%, transparent 70%)' }} />

      {/* Logo */}
      <div className="mb-6 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-amber-700/60 mb-4"
          style={{ background: 'linear-gradient(135deg, #3c2415 0%, #2a1a0e 100%)', boxShadow: '0 0 30px rgba(217,119,6,0.15)' }}>
          <Fish className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-amber-50" style={{ fontFamily: 'Bitter, Georgia, serif' }}>TightLines</h1>
        <p className="text-[10px] text-amber-600 tracking-[0.25em] uppercase">Fly Fishing Journal</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="card-rugged p-5 space-y-4">
          <div>
            <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="angler@example.com"
              className="w-full input-rugged"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full input-rugged pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-warm py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px bg-stone-700" />
          <span className="text-[10px] text-stone-500 uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-stone-700" />
        </div>

        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              localStorage.setItem('tightlines_user', JSON.stringify({ email: 'guest', name: 'Angler' }));
              setLoading(false);
              onLogin();
            }, 800);
          }}
          className="w-full bg-stone-800 text-stone-300 py-2.5 rounded-lg font-medium text-sm border border-stone-700 hover:bg-stone-700 transition-colors"
        >
          Continue as Guest
        </button>

        <p className="text-center text-[10px] text-stone-600 mt-4">
          By signing in, you agree to our Terms of Service
        </p>
      </form>

      {/* Developer credit */}
      <div className="absolute bottom-8">
        <p className="text-[10px] text-stone-600 tracking-wide">Developed by</p>
        <p className="text-xs text-stone-400 font-semibold tracking-wider text-center">BLACKSTAQ</p>
      </div>
    </div>
  );
}
