import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const imageSrc =
    product.images?.[0] || '/uploads/products/default-3d-product.svg';

  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`} className="product-thumb">
        <img src={imageSrc} alt={product.title} />
      </Link>
      <div className="product-info">
        <div className="product-meta">
          <span className="category-tag">{product.category}</span>
          <span className="price-text">₹{product.basePrice}</span>
        </div>

        <Link to={`/products/${product._id}`} className="product-title">
          {product.title}
        </Link>

        <p className="product-desc">{product.description}</p>

        <div className="pill-list">
          {(product.materials || []).map((mat) => (
            <span key={mat} className="spec-pill">
              {mat}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          <Link
            to={`/products/${product._id}`}
            className="btn btn-primary btn-sm"
            style={{ width: '100%' }}
          >
            Customize &amp; Order
          </Link>
        </div>
      </div>
    </article>
  );
}
