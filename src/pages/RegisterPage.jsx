import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', confirm_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full border-4 border-primary bg-surface-container-lowest p-8 flex flex-col gap-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        
        <div className="text-center">
          <h2 className="text-5xl font-black tracking-tighter uppercase mb-2">CREATE ACCOUNT</h2>
          <p className="text-text-muted font-bold text-sm tracking-widest uppercase">Join the movement</p>
        </div>

        {error && (
          <div className="p-4 border-2 border-error bg-error/10 text-error font-bold text-sm tracking-wider uppercase text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="first_name" className="font-bold text-sm tracking-widest uppercase">FIRST NAME</label>
              <input id="first_name" type="text" className="w-full p-4 border-2 border-primary bg-surface font-bold text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:border-on-surface transition-colors" placeholder="John" value={form.first_name} onChange={updateField('first_name')} required />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="last_name" className="font-bold text-sm tracking-widest uppercase">LAST NAME</label>
              <input id="last_name" type="text" className="w-full p-4 border-2 border-primary bg-surface font-bold text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:border-on-surface transition-colors" placeholder="Doe" value={form.last_name} onChange={updateField('last_name')} required />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-bold text-sm tracking-widest uppercase">EMAIL</label>
            <input id="email" type="email" className="w-full p-4 border-2 border-primary bg-surface font-bold text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:border-on-surface transition-colors" placeholder="you@example.com" value={form.email} onChange={updateField('email')} required />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="font-bold text-sm tracking-widest uppercase">PASSWORD</label>
            <input id="password" type="password" className="w-full p-4 border-2 border-primary bg-surface font-bold text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:border-on-surface transition-colors" placeholder="••••••••" value={form.password} onChange={updateField('password')} required />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="confirm_password" className="font-bold text-sm tracking-widest uppercase">CONFIRM PASSWORD</label>
            <input id="confirm_password" type="password" className="w-full p-4 border-2 border-primary bg-surface font-bold text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:border-on-surface transition-colors" placeholder="••••••••" value={form.confirm_password} onChange={updateField('confirm_password')} required />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-full py-4 text-xl tracking-widest border-2 border-primary hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed mt-2" 
            disabled={loading}
          >
            {loading ? <span className="w-6 h-6 border-4 border-on-primary border-t-transparent rounded-full animate-spin inline-block"></span> : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-border"></div>
          </div>
          <div className="relative bg-surface-container-lowest px-4">
            <span className="font-bold text-sm tracking-widest uppercase text-text-muted">OR</span>
          </div>
        </div>

        <a 
          href="http://localhost:3000/auth/google" 
          className="flex items-center justify-center gap-3 w-full py-4 border-2 border-primary bg-surface font-bold text-sm tracking-widest uppercase hover:bg-surface-container-high transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          SIGN UP WITH GOOGLE
        </a>

        <p className="text-center font-bold text-sm tracking-wider uppercase text-text-muted mt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-on-surface transition-colors underline underline-offset-4">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
