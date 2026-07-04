'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../lib/api';
import { getUser } from '../lib/auth';
import { getSocket } from '../lib/socket';
import MenuItemForm from './MenuItemForm';
import AdminOrderForm from './AdminOrderForm';
import ChefForm from './ChefForm';
import MenuItemRow from './MenuItemRow';
import ChefRow from './ChefRow';
import OrderRow from './OrderRow';

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);

  const [activeTab, setActiveTab] = useState('panel');
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [allRestaurantsError, setAllRestaurantsError] = useState('');
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [editingChef, setEditingChef] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('normal');

  function selectPriorityFilter(priority) {
    setPriorityFilter(priority);
    setSelectedOrderIds([]);
  }

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const loadOrders = useCallback(async () => {
    try {
      const data = await apiGet('/api/orders');
      setOrders([...data].sort((a, b) => a.orderNum - b.orderNum));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const loadRestaurant = useCallback(async () => {
    try {
      const data = await apiGet('/api/restaurants/me');
      setRestaurant(data);
      const menu = await apiGet(`/api/menu/${data.id}`);
      setMenuItems(menu.items);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const loadChefs = useCallback(async () => {
    try {
      setChefs(await apiGet('/api/chefs'));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) return;

    setUser(currentUser);
    loadOrders();
    loadRestaurant();
    loadChefs();

    const socket = getSocket();
    socket.emit('join', `restaurant:${currentUser.restaurantId}`);
    socket.on('kitchen:update', loadOrders);

    return () => socket.off('kitchen:update', loadOrders);
  }, [loadOrders, loadRestaurant, loadChefs]);

  useEffect(() => {
    if (activeTab !== 'restaurants' || !user?.isSuperUser) return;

    apiGet('/api/superuser/restaurants')
      .then(setAllRestaurants)
      .catch((err) => setAllRestaurantsError(err.message));
  }, [activeTab, user]);

  async function runAction(action, successText) {
    try {
      await action();
      await loadOrders();
      setNotice({ type: 'success', text: successText });
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    }
  }

  const handleComplete = (orderId) => runAction(() => apiPatch(`/api/orders/${orderId}/complete`), 'Order completed.');
  const handleCancel = (orderId) => runAction(() => apiPatch(`/api/orders/${orderId}/cancel`), 'Order cancelled.');

  function toggleOrderSelect(orderId) {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  }

  async function handleStartCooking() {
    try {
      await apiPatch('/api/orders/start-bulk', { orderIds: selectedOrderIds });
      setSelectedOrderIds([]);
      await loadOrders();
      setNotice({ type: 'success', text: 'Selected orders started.' });
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    }
  }

  async function handleAddMenuItem(item) {
    try {
      await apiPost('/api/menu', item);
      await loadRestaurant();
      setNotice({ type: 'success', text: 'Menu item added.' });
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
      throw err;
    }
  }

  async function handleAddOrder(order) {
    try {
      await apiPost('/api/orders/admin', order);
      await loadOrders();
      setNotice({ type: 'success', text: 'Order has been placed and a confirmation email has been sent to the customer.' });
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
      throw err;
    }
  }

  async function handleAddChef(chef) {
    try {
      await apiPost('/api/chefs', chef);
      await loadChefs();
      setNotice({ type: 'success', text: 'Chef added.' });
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
      throw err;
    }
  }

  async function handleUpdateMenuItem(id, data) {
    try {
      await apiPatch(`/api/menu/${id}`, data);
      await loadRestaurant();
      setNotice({ type: 'success', text: 'Menu item updated.' });
      setEditingMenuItem(null);
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
      throw err;
    }
  }

  async function handleUpdateChef(id, data) {
    try {
      await apiPatch(`/api/chefs/${id}`, data);
      await loadChefs();
      setNotice({ type: 'success', text: 'Chef updated.' });
      setEditingChef(null);
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
      throw err;
    }
  }

  async function handleSaveOrder(id, data) {
    try {
      await apiPatch(`/api/orders/${id}`, data);
      await loadOrders();
      setNotice({ type: 'success', text: 'Order updated.' });
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
      throw err;
    }
  }

  function handleDelete(order) {
    if (window.confirm(`Permanently delete ${order.customerName}'s order? This cannot be undone.`)) {
      runAction(() => apiDelete(`/api/orders/${order.id}`), 'Order deleted.');
    }
  }

  async function handleDeleteMenuItem(item) {
    if (window.confirm(`Permanently delete "${item.name}"? This cannot be undone.`)) {
      try {
        await apiDelete(`/api/menu/${item.id}`);
        await loadRestaurant();
        setNotice({ type: 'success', text: 'Menu item deleted.' });
        if (editingMenuItem?.id === item.id) setEditingMenuItem(null);
      } catch (err) {
        setNotice({ type: 'error', text: err.message });
      }
    }
  }

  async function handleDeleteChef(chef) {
    if (window.confirm(`Permanently delete "${chef.chefName}"? This cannot be undone.`)) {
      try {
        await apiDelete(`/api/chefs/${chef.id}`);
        await loadChefs();
        setNotice({ type: 'success', text: 'Chef deleted.' });
        if (editingChef?.id === chef.id) setEditingChef(null);
      } catch (err) {
        setNotice({ type: 'error', text: err.message });
      }
    }
  }

  if (error) return <p className="error">{error}</p>;
  if (!restaurant) return <p>Loading...</p>;

  return (
    <div>
      <div className="panel-header">
        <h2>{restaurant.name}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => setActiveTab(activeTab === 'chefs' ? 'panel' : 'chefs')}>
            {activeTab === 'chefs' ? 'Back to panel' : 'Add kitchen resource'}
          </button>
          {user?.isSuperUser && (
            <button onClick={() => setActiveTab(activeTab === 'restaurants' ? 'panel' : 'restaurants')}>
              {activeTab === 'restaurants' ? 'Back' : 'All restaurants'}
            </button>
          )}
        </div>
      </div>

      {notice && <p className={notice.type === 'success' ? 'success' : 'error'}>{notice.text}</p>}

      {activeTab === 'chefs' ? (
        <>
          <div className="grid-2">
            <MenuItemForm
              editingItem={editingMenuItem}
              onAdd={handleAddMenuItem}
              onUpdate={handleUpdateMenuItem}
              onCancelEdit={() => setEditingMenuItem(null)}
            />
            <ChefForm
              editingChef={editingChef}
              onAdd={handleAddChef}
              onUpdate={handleUpdateChef}
              onCancelEdit={() => setEditingChef(null)}
            />
          </div>

          <h3>Menu List</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Prep time</th>
                  <th>Price</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.length === 0 && (
                  <tr>
                    <td colSpan={4}>No menu items added yet.</td>
                  </tr>
                )}
                {menuItems.map((item) => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    onEdit={setEditingMenuItem}
                    onDelete={handleDeleteMenuItem}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <h3>Chef List</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Max concurrent orders</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {chefs.length === 0 && (
                  <tr>
                    <td colSpan={5}>No chefs added yet.</td>
                  </tr>
                )}
                {chefs.map((chef) => (
                  <ChefRow key={chef.id} chef={chef} onEdit={setEditingChef} onDelete={handleDeleteChef} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : activeTab === 'restaurants' ? (
        <>
          <p>{allRestaurants.length} restaurant(s) running on this system.</p>
          {allRestaurantsError && <p className="error">{allRestaurantsError}</p>}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Orders</th>
                  <th>Menu items</th>
                  <th>Staff</th>
                  <th>Kitchen capacity</th>
                </tr>
              </thead>
              <tbody>
                {allRestaurants.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r._count.orders}</td>
                    <td>{r._count.menuItems}</td>
                    <td>{r._count.users}</td>
                    <td>{r.kitchenCapacity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <AdminOrderForm menuItems={menuItems} chefs={chefs} onAdd={handleAddOrder} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              {selectedOrderIds.length > 0 && (
                <button onClick={handleStartCooking}>Start cooking ({selectedOrderIds.length})</button>
              )}
            </div>
            <div className="tabs">
              <button
                className={priorityFilter === 'normal' ? 'active' : 'secondary'}
                onClick={() => selectPriorityFilter('normal')}
              >
                Normal
              </button>
              <button
                className={priorityFilter === 'urgent' ? 'active' : 'secondary'}
                onClick={() => selectPriorityFilter('urgent')}
              >
                Urgent
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="col-checkbox">Select</th>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Chef</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th className="col-countdown">Countdown</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.filter((o) => o.orderPriority === priorityFilter).length === 0 && (
                  <tr>
                    <td colSpan={9}>No {priorityFilter} orders yet.</td>
                  </tr>
                )}
                {orders
                  .filter((o) => o.orderPriority === priorityFilter)
                  .map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      menuItems={menuItems}
                      chefs={chefs}
                      onSave={handleSaveOrder}
                      onComplete={handleComplete}
                      onCancel={handleCancel}
                      onDelete={handleDelete}
                      selected={selectedOrderIds.includes(order.id)}
                      onToggleSelect={toggleOrderSelect}
                    />
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
