'use client';

import { useState } from 'react';
import CountdownTimer, { formatDuration } from './CountdownTimer';

export default function OrderRow({
  order,
  menuItems,
  chefs,
  onSave,
  onComplete,
  onCancel,
  onDelete,
  selected,
  onToggleSelect,
}) {
  const [editing, setEditing] = useState(false);
  const firstItem = order.items[0] || {};
  const [customerName, setCustomerName] = useState(order.customerName);
  const [customerEmail, setCustomerEmail] = useState(order.customerEmail);
  const [menuItemId, setMenuItemId] = useState(firstItem.menuItemId || '');
  const [quantity, setQuantity] = useState(firstItem.quantity || 1);
  const [chefId, setChefId] = useState(order.chefId || '');
  const [orderPriority, setOrderPriority] = useState(order.orderPriority || 'normal');
  const [saving, setSaving] = useState(false);

  const canEdit = order.status === 'PENDING';

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(order.id, {
        customerName,
        customerEmail,
        items: [{ menuItemId, quantity: Number(quantity) }],
        chefId: chefId || undefined,
        orderPriority,
      });
      setEditing(false);
    } catch {
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setCustomerName(order.customerName);
    setCustomerEmail(order.customerEmail);
    setMenuItemId(firstItem.menuItemId || '');
    setQuantity(firstItem.quantity || 1);
    setChefId(order.chefId || '');
    setOrderPriority(order.orderPriority || 'normal');
    setEditing(false);
  }

  if (editing) {
    return (
      <tr>
        <td></td>
        <td>#{order.orderNum}</td>
        <td>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            style={{ marginTop: '0.4rem' }}
          />
        </td>
        <td>
          <select value={menuItemId} onChange={(e) => setMenuItemId(e.target.value)}>
            {menuItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} -- ₹{item.price}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={{ marginTop: '0.4rem' }}
          />
        </td>
        <td>
          <select value={chefId} onChange={(e) => setChefId(e.target.value)}>
            <option value="">Unassigned</option>
            {chefs.map((chef) => (
              <option key={chef.id} value={chef.id}>
                {chef.chefName}
              </option>
            ))}
          </select>
        </td>
        <td>
          <select value={orderPriority} onChange={(e) => setOrderPriority(e.target.value)}>
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
          </select>
        </td>
        <td>
          <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
        </td>
        <td>--</td>
        <td>
          <div className="row-actions">
            <button className="icon-btn" title="Save" onClick={handleSave} disabled={saving}>
              <i className={saving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-check'} />
            </button>
            <button className="secondary icon-btn" title="Cancel" onClick={handleCancelEdit}>
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ');

  return (
    <tr>
      <td>
        {order.status === 'PENDING' && (
          <input type="checkbox" checked={Boolean(selected)} onChange={() => onToggleSelect(order.id)} />
        )}
      </td>
      <td>#{order.orderNum}</td>
      <td>{order.customerName}</td>
      <td>{itemsSummary}</td>
      <td>{order.chefName || '--'}</td>
      <td>
        {order.orderPriority === 'urgent' ? <span className="badge badge-cancelled">URGENT</span> : 'Normal'}
      </td>
      <td>
        <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
        {order.status === 'IN_PROGRESS' && typeof order.estimatedDuration === 'number' && (
          <div>{formatDuration(order.estimatedDuration)}</div>
        )}
      </td>
      <td>
        {order.status === 'IN_PROGRESS' && (
          <CountdownTimer startedAt={order.startedAt} durationMs={order.prepTimeMs} />
        )}
        {order.status === 'PENDING' && (
          <div className="countdown">{formatDuration(order.estimatedDuration ?? order.prepTimeMs)}</div>
        )}
        {order.status === 'COMPLETED' &&
          order.completedAt &&
          `Ready at ${new Date(order.completedAt).toLocaleTimeString()}`}
      </td>
      <td>
        <div className="row-actions">
          {canEdit && (
            <button className="secondary icon-btn" title="Edit" onClick={() => setEditing(true)}>
              <i className="fa-solid fa-pen" />
            </button>
          )}
          {order.status === 'IN_PROGRESS' && (
            <button className="icon-btn" title="Complete" onClick={() => onComplete(order.id)}>
              <i className="fa-solid fa-check" />
            </button>
          )}
          {(order.status === 'PENDING' || order.status === 'IN_PROGRESS') && (
            <button className="secondary icon-btn" title="Cancel" onClick={() => onCancel(order.id)}>
              <i className="fa-solid fa-ban" />
            </button>
          )}
          <button className="secondary icon-btn" title="Delete" onClick={() => onDelete(order)}>
            <i className="fa-solid fa-trash" />
          </button>
        </div>
      </td>
    </tr>
  );
}
