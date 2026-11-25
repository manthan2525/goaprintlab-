import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { apiRequest } from '../api/client';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['All', 'Prototypes', 'Decor', 'Gadgets', 'Architectural', 'Gifts'];
const MATERIALS = ['All', 'PLA', 'PETG', 'ABS', 'TPU', 'Resin'];

export default function Catalogue() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [material, setMaterial] = useState('All');

  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (category !== 'All') params.set('category', category);
    if (material !== 'All') params.set('material', material);

    setLoading(true);
    setError('');
    apiRequest(`/api/products?${params.toString()}`)
      .then((data) => setProducts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, category, material]);

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <h2>3D-Printed Product Catalogue</h2>
            <p className="section-subtitle">
              Search and filter ready-to-print models by category or filament material.
            </p>
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-search" style={{ position: 'relative' }}>
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
              }}
            />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: 38 }}
              placeholder="Search products (e.g., gear, planter, lamp)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: 160 }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: 160 }}
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            aria-label="Filter by material"
          >
            {MATERIALS.map((mat) => (
              <option key={mat} value={mat}>
                Material: {mat}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <p>Loading catalogue...</p>
        ) : products.length === 0 ? (
          <div className="card card-body">
            <p>No products matched your current search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid-3">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
