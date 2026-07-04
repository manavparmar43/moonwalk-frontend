'use client';

import CountdownTimer, { formatDuration } from './CountdownTimer';

export default function OrderCard({ order, onStart, onComplete, onCancel, onDelete }) {
  const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ');
  const staffMode = Boolean(onStart || onComplete || onCancel || onDelete);

  function handleDelete() {
    if (window.confirm(`Permanently delete ${order.customerName}'s order? This cannot be undone.`)) {
      onDelete(order.id);
    }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>{order.customerName}</strong>
        <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
      </div>
      <p>{itemsSummary}</p>
      {order.orderPriority === 'urgent' && <span className="badge badge-cancelled">URGENT</span>}
      {order.chefName && <p>Chef: {order.chefName}</p>}

      {order.status === 'IN_PROGRESS' && (
        <CountdownTimer startedAt={order.startedAt} durationMs={order.prepTimeMs} />
      )}
      {order.status === 'PENDING' && (
        <div className="countdown">{formatDuration(order.estimatedDuration ?? order.prepTimeMs)}</div>
      )}
      {order.status === 'COMPLETED' && order.completedAt && (
        <p>Ready at {new Date(order.completedAt).toLocaleTimeString()}</p>
      )}

      {staffMode && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          {order.status === 'PENDING' && onStart && <button onClick={() => onStart(order.id)}>Start cooking</button>}
          {order.status === 'IN_PROGRESS' && onComplete && (
            <button onClick={() => onComplete(order.id)}>Mark complete</button>
          )}
          {(order.status === 'PENDING' || order.status === 'IN_PROGRESS') && onCancel && (
            <button className="secondary" onClick={() => onCancel(order.id)}>
              Cancel
            </button>
          )}
          {onDelete && (
            <button className="secondary" onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
