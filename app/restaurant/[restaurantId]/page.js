'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from '../../../lib/api';

export default function RestaurantMenuPage({ params }) {
  const { restaurantId } = params;
  const router = useRouter();

  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    apiGet(`/api/menu/${restaurantId}`)
      .then((data) => {
        setRestaurant(data.restaurant);
        setItems(data.items);
      })
      .catch((err) => setError(err.message));
  }, [restaurantId]);

  function setQuantity(menuItemId, value) {
    setQuantities((prev) => ({ ...prev, [menuItemId]: Number(value) }));
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * (quantities[item.id] || 0), 0);

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError('');

    const selected = Object.entries(quantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([menuItemId, quantity]) => ({ menuItemId, quantity }));

    if (selected.length === 0) {
      setError('Choose at least one item');
      return;
    }

    setPlacing(true);
    try {
      const order = await apiPost('/api/orders', { restaurantId, customerName, customerEmail, items: selected });
      router.push(`/order/${order.id}`);
    } catch (err) {
      setError(err.message);
      setPlacing(false);
    }
  }

  if (!restaurant) return <div className="page">{error || 'Loading...'}</div>;

  return (
    <div className="page">
      <h1>{restaurant.name}</h1>

      <form className="card" onSubmit={handlePlaceOrder}>
        <div className="field">
          <label>Your name</label>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
        </div>
        <div className="field">
          <label>Your email (for order tracking)</label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            required
          />
        </div>

        {items.map((item) => (
          <div className="field" key={item.id}>
            <label>
              {item.name} ({item.prepTimeMinutes} min) -- ₹{item.price}
            </label>
            <input
              type="number"
              min="0"
              value={quantities[item.id] || 0}
              onChange={(e) => setQuantity(item.id, e.target.value)}
            />
          </div>
        ))}

        <p>
          <strong>Payment amount: ₹{totalAmount}</strong>
        </p>

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={placing}>
          {placing ? 'Placing order...' : 'Place order'}
        </button>
      </form>
    </div>
  );
}
