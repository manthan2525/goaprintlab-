import { Trash2 } from 'lucide-react';

export default function CartItem({ item, onUpdateQty, onRemove, disabled }) {
  const product = item.productId || {};
  const imageSrc =
    product.images?.[0] || '/uploads/products/default-3d-product.svg';

  return (
    <div
      className="card"
      style={{
        padding: 16,
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <img
        src={imageSrc}
        alt={product.title || '3D Product'}
        style={{
          width: 96,
          height: 72,
          objectFit: 'cover',
          borderRadius: 8,
          background: '#0f172a',
        }}
      />

      <div style={{ flex: '1 1 220px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>
          {product.title || '3D Printed Item'}
        </h3>
        <div className="pill-list">
          <span className="spec-pill">Material: {item.material}</span>
          <span className="spec-pill">Colour: {item.color}</span>
          <span className="spec-pill">Size: {item.size}</span>
        </div>
        <div style={{ marginTop: 6, fontSize: '0.88rem', color: '#475569' }}>
          Unit Price: <strong>₹{item.unitPrice}</strong>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={disabled || item.quantity <= 1}
          onClick={() => onUpdateQty(item._id, item.quantity - 1)}
        >
          -
        </button>
        <span style={{ minWidth: 26, textAlign: 'center', fontWeight: 700 }}>
          {item.quantity}
        </span>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={disabled}
          onClick={() => onUpdateQty(item._id, item.quantity + 1)}
        >
          +
        </button>
      </div>

      <div style={{ minWidth: 90, textAlign: 'right', fontWeight: 700 }}>
        ₹{item.unitPrice * item.quantity}
      </div>

      <button
        type="button"
        className="btn btn-danger btn-sm"
        disabled={disabled}
        onClick={() => onRemove(item._id)}
        aria-label="Remove item"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
