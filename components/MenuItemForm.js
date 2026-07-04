'use client';

import { useState, useEffect } from 'react';

export default function MenuItemForm({ editingItem, onAdd, onUpdate, onCancelEdit }) {
  const [name, setName] = useState('');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(5);
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setPrepTimeMinutes(editingItem.prepTimeMinutes);
      setPrice(editingItem.price);
    } else {
      setName('');
      setPrepTimeMinutes(5);
      setPrice('');
    }
  }, [editingItem]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const data = { name, prepTimeMinutes: Number(prepTimeMinutes), price: Number(price) };
    try {
      if (editingItem) {
        await onUpdate(editingItem.id, data);
      } else {
        await onAdd(data);
        setName('');
        setPrepTimeMinutes(5);
        setPrice('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>{editingItem ? 'Edit menu item' : 'Add menu item'}</h3>
      <div className="form-grid">
        <div className="field full">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label>Prep time (minutes)</label>
          <input
            type="number"
            min="1"
            value={prepTimeMinutes}
            onChange={(e) => setPrepTimeMinutes(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Price (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="row-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : editingItem ? 'Update item' : 'Add item'}
        </button>
        {editingItem && (
          <button type="button" className="secondary" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
