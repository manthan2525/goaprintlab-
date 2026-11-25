import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiRequest } from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function Orders() {
  const location = useLocation();
  const [tab, setTab] = useState('standard');
  const [orders, setOrders] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([apiRequest('/api/orders'), apiRequest('/api/custom-requests')])
      .then(([ordersData, customData]) => {
        setOrders(ordersData);
        setCustomRequests(customData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <h2>Order History &amp; Live Status Tracking</h2>
            <p className="section-subtitle">
              Track your standard catalogue orders and custom 3D model print requests.
            </p>
          </div>
          <Link to="/custom-print" className="btn btn-primary btn-sm">
            New Custom 3D Print
          </Link>
        </div>

        {location.state?.orderPlaced && (
          <div className="alert alert-success">
            Order placed successfully! You can monitor its fabrication status below.
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="tabs">
          <button
            type="button"
            className={`tab-btn ${tab === 'standard' ? 'active' : ''}`}
            onClick={() => setTab('standard')}
          >
            Catalogue Orders ({orders.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === 'custom' ? 'active' : ''}`}
            onClick={() => setTab('custom')}
          >
            Custom 3D Print Requests ({customRequests.length})
          </button>
        </div>

        {loading ? (
          <p>Loading your order history...</p>
        ) : tab === 'standard' ? (
          orders.length === 0 ? (
            <div className="card card-body">
              <p>You have not placed any standard orders yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {orders.map((order) => (
                <div key={order._id} className="card card-body">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 10,
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
                      <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
                        Placed on {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <StatusBadge status={order.orderStatus} />
                      <strong style={{ fontSize: '1.08rem' }}>
                        ₹{order.totalAmount}
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: 8 }}>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: '#f8fafc',
                          borderRadius: 8,
                          fontSize: '0.9rem',
                        }}
                      >
                        <span>
                          <strong>{item.title}</strong> ({item.material}, {item.color},{' '}
                          {item.size}) × {item.quantity}
                        </span>
                        <strong>₹{item.unitPrice * item.quantity}</strong>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 10, fontSize: '0.85rem', color: '#475569' }}>
                    Deliver to: {order.shippingAddress?.fullName},{' '}
                    {order.shippingAddress?.street}, {order.shippingAddress?.city},{' '}
                    {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : customRequests.length === 0 ? (
          <div className="card card-body">
            <p>You have not submitted any custom 3D model requests yet.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Model File</th>
                  <th>Specifications</th>
                  <th>Qty</th>
                  <th>Notes</th>
                  <th>Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {customRequests.map((reqItem) => (
                  <tr key={reqItem._id}>
                    <td>
                      <strong>{reqItem.modelFileName}</strong>
                    </td>
                    <td>
                      {reqItem.material} · {reqItem.color} · {reqItem.size}
                    </td>
                    <td>{reqItem.quantity}</td>
                    <td>{reqItem.notes || '—'}</td>
                    <td>{new Date(reqItem.createdAt).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge status={reqItem.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
