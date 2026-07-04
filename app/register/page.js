'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    restaurantName: '',
    adminName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiPost('/api/auth/register', form);
      setSuccess('Restaurant created successfully! Redirecting to login...');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="auth-layout">
        <div className="auth-brand">
          <h1>Register your restaurant</h1>
          <p>
            This creates your restaurant and your own admin account in one step. Registration is for restaurant
            owners only -- customers never need an account, they just place orders and track them by email link.
          </p>
        </div>

        <form className="card" onSubmit={handleSubmit}>
          <div className="field">
            <label>Restaurant name</label>
            <input value={form.restaurantName} onChange={(e) => update('restaurantName', e.target.value)} required />
          </div>
          <div className="field">
            <label>Your name</label>
            <input value={form.adminName} onChange={(e) => update('adminName', e.target.value)} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create restaurant'}
          </button>
        </form>
      </div>
    </div>
  );
}
