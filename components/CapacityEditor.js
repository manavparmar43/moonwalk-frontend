'use client';

import { useState } from 'react';

export default function CapacityEditor({ kitchenCapacity, onChange }) {
  const [value, setValue] = useState(kitchenCapacity);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onChange(Number(value));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="capacity-editor">
      <label>Kitchen stations</label>
      <input type="number" min="1" value={value} onChange={(e) => setValue(e.target.value)} />
      <button className="secondary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Update'}
      </button>
    </div>
  );
}
