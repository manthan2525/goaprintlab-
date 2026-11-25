import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, refreshCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || 'Goa',
    pincode: user?.address?.pincode || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ shippingAddress: form }),
      });
      await refreshCart();
      navigate('/orders', { state: { orderPlaced: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <h2>Checkout &amp; Delivery Details</h2>
            <p className="section-subtitle">
              Confirm your shipping address to submit your 3D printing order.
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="alert alert-info">
            Your shopping cart is empty. Add products from the catalogue before checking
            out.
          </div>
        ) : (
          <div className="grid-2">
            <form className="card card-body" onSubmit={handleSubmit}>
              <h3 style={{ marginBottom: 16 }}>Shipping Address</h3>
              {error && <div className="alert alert-error">{error}</div>}

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  required
                  className="form-control"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  required
                  className="form-control"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Street / Locality</label>
                <input
                  required
                  className="form-control"
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                />
              </div>

              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    required
                    className="form-control"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">PIN Code</label>
                  <input
                    required
                    className="form-control"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  required
                  className="form-control"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>

              <div className="alert alert-info">
                Payment Mode: Cash on Delivery / Offline Workshop Settlement (per current
                release scope).
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={submitting}
              >
                <CheckCircle2 size={18} />
                {submitting ? 'Placing Order...' : `Place Order — ₹${subtotal}`}
              </button>
            </form>

            <div className="card card-body">
              <h3 style={{ marginBottom: 14 }}>Order Items ({items.length})</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {items.map((item) => (
                  <div
                    key={item._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingBottom: 10,
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    <div>
                      <strong>{item.productId?.title || '3D Product'}</strong>
                      <div style={{ fontSize: '0.84rem', color: '#475569' }}>
                        {item.material} · {item.color} · {item.size} × {item.quantity}
                      </div>
                    </div>
                    <strong>₹{item.unitPrice * item.quantity}</strong>
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 18,
                  fontSize: '1.15rem',
                }}
              >
                <strong>Total Payable</strong>
                <strong>₹{subtotal}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
