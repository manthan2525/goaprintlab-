import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

export default function Cart() {
  const { user } = useAuth();
  const { items, subtotal, loading, updateQuantity, removeItem } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleQtyChange(itemId, qty) {
    setBusy(true);
    setError('');
    try {
      await updateQuantity(itemId, qty);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(itemId) {
    setBusy(true);
    setError('');
    try {
      await removeItem(itemId);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <section className="section">
        <div className="container">
          <div className="card card-body" style={{ textAlign: 'center', padding: 40 }}>
            <ShoppingBag size={36} color="#0284c7" style={{ margin: '0 auto 12px' }} />
            <h2 style={{ marginBottom: 8 }}>Sign In to View Your Shopping Cart</h2>
            <p style={{ color: '#475569', marginBottom: 20 }}>
              Log in or register to save customized 3D-printed products to your cart.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
              <Link to="/catalogue" className="btn btn-secondary">
                Browse Catalogue
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <h2>Your Shopping Cart</h2>
            <p className="section-subtitle">
              Review your selected 3D-printed items, materials, colours, and quantities.
            </p>
          </div>
          <Link to="/catalogue" className="btn btn-secondary btn-sm">
            Continue Shopping
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <p>Loading cart...</p>
        ) : items.length === 0 ? (
          <div className="card card-body" style={{ textAlign: 'center', padding: 40 }}>
            <h3 style={{ marginBottom: 8 }}>Your cart is currently empty</h3>
            <p style={{ color: '#475569', marginBottom: 18 }}>
              Explore our 3D-printed catalogue or submit a custom 3D model request.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <Link to="/catalogue" className="btn btn-primary">
                Browse Products
              </Link>
              <Link to="/custom-print" className="btn btn-secondary">
                Custom 3D Print
              </Link>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
              gap: 24,
              alignItems: 'start',
            }}
          >
            <div style={{ display: 'grid', gap: 14 }}>
              {items.map((item) => (
                <CartItem
                  key={item._id}
                  item={item}
                  disabled={busy}
                  onUpdateQty={handleQtyChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            <aside className="card card-body">
              <h3 style={{ marginBottom: 14 }}>Order Summary</h3>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                  color: '#475569',
                }}
              >
                <span>Items Subtotal</span>
                <strong>₹{subtotal}</strong>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 14,
                  color: '#475569',
                }}
              >
                <span>Shipping (Goa Local)</span>
                <strong>Free</strong>
              </div>
              <hr style={{ border: 0, borderTop: '1px solid #e2e8f0', marginBottom: 14 }} />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.15rem',
                  marginBottom: 18,
                }}
              >
                <strong>Total</strong>
                <strong>₹{subtotal}</strong>
              </div>
              <Link to="/checkout" className="btn btn-primary" style={{ width: '100%' }}>
                Proceed to Checkout
                <ArrowRight size={17} />
              </Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
