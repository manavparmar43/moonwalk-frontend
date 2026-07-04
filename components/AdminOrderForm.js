'use client';

import { useState, useEffect } from 'react';

export default function AdminOrderForm({ menuItems, chefs = [], onAdd }) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [menuItemId, setMenuItemId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [chefId, setChefId] = useState('');
  const [orderPriority, setOrderPriority] = useState('normal');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  const hasMenu = menuItems.length > 0;
  const hasChefs = chefs.length > 0;
  const hasResources = hasMenu && hasChefs;
  const selectedItem = menuItems.find((item) => item.id === menuItemId);
  const totalAmount = selectedItem ? selectedItem.price * Number(quantity || 0) : 0;

  useEffect(() => {
    if (hasMenu && !menuItems.some((item) => item.id === menuItemId)) {
      setMenuItemId(menuItems[0].id);
    }
    if (!hasMenu) {
      setMenuItemId('');
    }
  }, [menuItems, hasMenu, menuItemId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!menuItemId || quantity <= 0) {
      setError('Choose a menu item and quantity');
      return;
    }
    if (!chefId) {
      setError('Select a chef.');
      return;
    }

    setPlacing(true);
    try {
      await onAdd({
        customerName,
        customerEmail,
        items: [{ menuItemId, quantity: Number(quantity) }],
        chefId: chefId || undefined,
        orderPriority,
      });
      setCustomerName('');
      setCustomerEmail('');
      setQuantity(1);
      setChefId('');
      setOrderPriority('normal');
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>Add customer order</h3>
      {!hasResources && <p className="error">Add a kitchen resource first.</p>}

      <div className="form-grid">
        <div className="field">
          <label>Customer name</label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            disabled={!hasResources}
            required
          />
        </div>
        <div className="field">
          <label>Customer email</label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            disabled={!hasResources}
            required
          />
        </div>
        <div className="field full">
          <label>Menu list</label>
          <select value={menuItemId} onChange={(e) => setMenuItemId(e.target.value)} disabled={!hasResources} required>
            {!hasMenu && <option value="">No menu items yet</option>}
            {menuItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.prepTimeMinutes} min) -- ₹{item.price}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={!hasResources}
          />
        </div>
        <div className="field">
          <label>Chef</label>
          <select value={chefId} onChange={(e) => setChefId(e.target.value)} disabled={!hasResources}>
            <option value="">Unassigned</option>
            {chefs.map((chef) => (
              <option key={chef.id} value={chef.id}>
                {chef.chefName} ({chef.status})
              </option>
            ))}
          </select>
        </div>
        <div className="field full">
          <label>Order priority</label>
          <select value={orderPriority} onChange={(e) => setOrderPriority(e.target.value)} disabled={!hasResources}>
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {hasResources && (
        <p>
          <strong>Payment amount: ₹{totalAmount}</strong>
        </p>
      )}

      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={placing || !hasResources}>
        {placing ? 'Adding...' : 'Add order'}
      </button>
    </form>
  );
}
