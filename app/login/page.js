'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '../../lib/api';
import { saveAuth } from '../../lib/auth';
import { encryptPayload } from '../../lib/crypto';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@moonwalk.test');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = encryptPayload({ email, password });
      const { token, user } = await apiPost('/api/auth/login', { payload });
      saveAuth(token, user);
      router.push(user.isSuperUser ? '/superuser' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="auth-layout">
        <div className="auth-brand">
          <h1>Welcome back</h1>
          <p>Log in to manage your kitchen queue, track orders in real time, and keep customers updated.</p>
        </div>

        <form className="card" onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div className="field">
            <label>Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}
