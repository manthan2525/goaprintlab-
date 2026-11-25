import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const SIZE_MULTIPLIERS = { Small: 1.0, Medium: 1.25, Large: 1.5 };
const MATERIAL_SURCHARGES = { PLA: 0, PETG: 80, ABS: 120, TPU: 150, Resin: 220 };

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiRequest(`/api/products/${id}`)
      .then((data) => {
        setProduct(data);
        setMaterial(data.materials?.[0] || 'PLA');
        setColor(data.colors?.[0] || 'Matte Black');
        setSize(data.sizes?.[0] || 'Medium');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const unitPrice = useMemo(() => {
    if (!product) return 0;
    const mult = SIZE_MULTIPLIERS[size] || 1.0;
    const extra = MATERIAL_SURCHARGES[material] || 0;
    return Math.round(product.basePrice * mult + extra);
  }, [product, material, size]);

  async function handleAddToCart() {
    if (!user) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    setSubmitting(true);
    setFeedback('');
    setError('');
    try {
      await addToCart({
        productId: product._id,
        material,
        color,
        size,
        quantity,
      });
      setFeedback('Configured 3D product added to your shopping cart.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container section">
        <p>Loading product specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container section">
        <div className="alert alert-error">{error || 'Product not found.'}</div>
        <Link to="/catalogue" className="btn btn-secondary">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const imageSrc =
    product.images?.[0] || '/uploads/products/default-3d-product.svg';

  return (
    <section className="section">
      <div className="container">
        <Link
          to="/catalogue"
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: 20 }}
        >
          <ArrowLeft size={15} />
          Back to Catalogue
        </Link>

        <div className="grid-2">
          <div className="card" style={{ overflow: 'hidden', background: '#0f172a' }}>
            <img
              src={imageSrc}
              alt={product.title}
              style={{ width: '100%', height: '100%', maxHeight: 420, objectFit: 'cover' }}
            />
          </div>

          <div className="card card-body">
            <div className="product-meta" style={{ marginBottom: 8 }}>
              <span className="category-tag">{product.category}</span>
              <span className="status-badge status-delivered">
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <h1 style={{ fontSize: '1.75rem', marginBottom: 8 }}>{product.title}</h1>
            <p style={{ color: '#475569', marginBottom: 18 }}>{product.description}</p>

            <div
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: '#f1f5f9',
                marginBottom: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                  Configured Unit Price
                </div>
                <strong style={{ fontSize: '1.5rem' }}>₹{unitPrice}</strong>
              </div>
              <div style={{ fontSize: '0.84rem', color: '#475569' }}>
                Base: ₹{product.basePrice}
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {feedback && (
              <div className="alert alert-success">
                {feedback}{' '}
                <Link to="/cart" style={{ textDecoration: 'underline', fontWeight: 700 }}>
                  Go to Cart
                </Link>
              </div>
            )}

            <div className="form-group">
              <span className="form-label">Filament Material</span>
              <div className="option-chips">
                {(product.materials || []).map((mat) => (
                  <button
                    key={mat}
                    type="button"
                    className={`option-chip ${material === mat ? 'selected' : ''}`}
                    onClick={() => setMaterial(mat)}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <span className="form-label">Filament Colour</span>
              <div className="option-chips">
                {(product.colors || []).map((col) => (
                  <button
                    key={col}
                    type="button"
                    className={`option-chip ${color === col ? 'selected' : ''}`}
                    onClick={() => setColor(col)}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <span className="form-label">Print Size / Scale</span>
              <div className="option-chips">
                {(product.sizes || []).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    className={`option-chip ${size === sz ? 'selected' : ''}`}
                    onClick={() => setSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ maxWidth: 140 }}>
              <label className="form-label" htmlFor="qty-input">
                Quantity
              </label>
              <input
                id="qty-input"
                type="number"
                min={1}
                max={50}
                className="form-control"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={!product.inStock || submitting}
              onClick={handleAddToCart}
            >
              <ShoppingCart size={18} />
              {submitting
                ? 'Adding to Cart...'
                : `Add to Cart — ₹${unitPrice * quantity}`}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
