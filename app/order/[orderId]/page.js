'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '../../../lib/api';
import { getSocket } from '../../../lib/socket';
import CountdownTimer, { formatDuration } from '../../../components/CountdownTimer';

const MESSAGES = {
  COMPLETED: 'Order complete. Enjoy!',
  CANCELLED: 'This order was cancelled.',
};

export default function OrderTrackingPage({ params }) {
  const { orderId } = params;
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet(`/api/orders/${orderId}`)
      .then(setOrder)
      .catch((err) => setError(err.message));

    const socket = getSocket();
    socket.emit('join', `order:${orderId}`);
    socket.on('order:update', (update) => setOrder((prev) => ({ ...prev, ...update })));

    return () => socket.off('order:update');
  }, [orderId]);

  if (error) return <div className="page error">{error}</div>;
  if (!order) return <div className="page">Loading...</div>;

  const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ');
  const totalAmount = order.items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  return (
    <div className="page">
      <h1>Order for {order.customerName}</h1>
      <div className="card" style={{ textAlign: 'center' }}>
        <p>Order #{order.orderNum} -- {order.restaurant.name}</p>
        <p>{order.customerEmail}</p>
        <p>{itemsSummary}</p>
        <p>
          <strong>Payment amount: ₹{totalAmount}</strong>
        </p>
        {order.status === 'COMPLETED' ? (
          <>
            <p>{MESSAGES.COMPLETED}</p>
            {order.completedAt && <p>Ready at {new Date(order.completedAt).toLocaleTimeString()}</p>}
          </>
        ) : order.status === 'CANCELLED' ? (
          <p>{MESSAGES.CANCELLED}</p>
        ) : order.status === 'PENDING' ? (
          <div className="countdown">{formatDuration(order.estimatedDuration ?? order.prepTimeMs)}</div>
        ) : (
          <>
            <p>Preparation now</p>
            <CountdownTimer startedAt={order.startedAt} durationMs={order.prepTimeMs} />
          </>
        )}
        <p className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</p>
        {order.status === 'IN_PROGRESS' && typeof order.estimatedDuration === 'number' && (
          <p>Estimated duration: {formatDuration(order.estimatedDuration)}</p>
        )}
      </div>
    </div>
  );
}
