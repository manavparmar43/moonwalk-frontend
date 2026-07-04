'use client';

import { useState, useEffect } from 'react';

export default function ChefForm({ editingChef, onAdd, onUpdate, onCancelEdit }) {
  const [chefName, setChefName] = useState('');
  const [chefEmail, setChefEmail] = useState('');
  const [status, setStatus] = useState('active');
  const [maxConcurrentOrders, setMaxConcurrentOrders] = useState(1);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingChef) {
      setChefName(editingChef.chefName);
      setChefEmail(editingChef.chefEmail);
      setStatus(editingChef.status);
      setMaxConcurrentOrders(editingChef.maxConcurrentOrders);
    } else {
      setChefName('');
      setChefEmail('');
      setStatus('active');
      setMaxConcurrentOrders(1);
    }
  }, [editingChef]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const data = { chefName, chefEmail, status, maxConcurrentOrders: Number(maxConcurrentOrders) };
    try {
      if (editingChef) {
        await onUpdate(editingChef.id, data);
      } else {
        await onAdd(data);
        setChefName('');
        setChefEmail('');
        setStatus('active');
        setMaxConcurrentOrders(1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>{editingChef ? 'Edit chef' : 'Add chef'}</h3>
      <div className="form-grid">
        <div className="field">
          <label>Chef name</label>
          <input value={chefName} onChange={(e) => setChefName(e.target.value)} required />
        </div>
        <div className="field">
          <label>Chef email</label>
          <input type="email" value={chefEmail} onChange={(e) => setChefEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="field">
          <label>Max concurrent orders</label>
          <input
            type="number"
            min="1"
            value={maxConcurrentOrders}
            onChange={(e) => setMaxConcurrentOrders(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="row-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : editingChef ? 'Update chef' : 'Add chef'}
        </button>
        {editingChef && (
          <button type="button" className="secondary" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
