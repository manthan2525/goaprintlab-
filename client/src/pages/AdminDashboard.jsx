import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, Download } from 'lucide-react';
import { apiRequest } from '../api/client';
import StatusBadge from '../components/StatusBadge';

const ORDER_STATUSES = [
  'Pending',
  'Processing',
  'Printing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const CUSTOM_STATUSES = [
  'Pending Review',
  'Approved',
  'Printing',
  'Completed',
  'Rejected',
];

const EMPTY_PRODUCT = {
  title: '',
  category: 'Prototypes',
  description: '',
  basePrice: '',
  materials: 'PLA, PETG, ABS',
  colors: 'Matte Black, Arctic White, Ocean Blue',
  sizes: 'Small, Medium, Large',
  inStock: true,
};

export default function AdminDashboard() {
  const [tab, setTab] = useState('products');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalCustomRequests: 0,
    totalRevenue: 0,
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [imageFiles, setImageFiles] = useState([]);
  const [savingProduct, setSavingProduct] = useState(false);

  async function loadAllData() {
    setLoading(true);
    setError('');
    try {
      const [statsData, productsData, ordersData, customData, customersData] =
        await Promise.all([
          apiRequest('/api/admin/stats'),
          apiRequest('/api/products'),
          apiRequest('/api/admin/orders'),
          apiRequest('/api/admin/custom-requests'),
          apiRequest('/api/admin/customers'),
        ]);
      setStats(statsData);
      setProducts(productsData);
      setOrders(ordersData);
      setCustomRequests(customData);
      setCustomers(customersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, []);

  function startEdit(product) {
    setEditingId(product._id);
    setProductForm({
      title: product.title,
      category: product.category,
      description: product.description,
      basePrice: String(product.basePrice),
      materials: (product.materials || []).join(', '),
      colors: (product.colors || []).join(', '),
      sizes: (product.sizes || []).join(', '),
      inStock: product.inStock,
    });
    setImageFiles([]);
  }

  function resetForm() {
    setEditingId(null);
    setProductForm(EMPTY_PRODUCT);
    setImageFiles([]);
  }

  async function handleProductSubmit(e) {
    e.preventDefault();
    setSavingProduct(true);
    setError('');
    setFeedback('');

    try {
      const formData = new FormData();
      formData.append('title', productForm.title);
      formData.append('category', productForm.category);
      formData.append('description', productForm.description);
      formData.append('basePrice', String(productForm.basePrice));
      formData.append('materials', productForm.materials);
      formData.append('colors', productForm.colors);
      formData.append('sizes', productForm.sizes);
      formData.append('inStock', String(productForm.inStock));

      for (const file of imageFiles) {
        formData.append('images', file);
      }

      if (editingId) {
        await apiRequest(`/api/products/${editingId}`, {
          method: 'PUT',
          body: formData,
        });
        setFeedback('Product updated successfully.');
      } else {
        await apiRequest('/api/products', {
          method: 'POST',
          body: formData,
        });
        setFeedback('New 3D product added to catalogue.');
      }

      resetForm();
      await loadAllData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProduct(false);
    }
  }

  async function handleDeleteProduct(productId) {
    setError('');
    setFeedback('');
    try {
      await apiRequest(`/api/products/${productId}`, { method: 'DELETE' });
      setFeedback('Product deleted from catalogue.');
      await loadAllData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleOrderStatusChange(orderId, orderStatus) {
    setError('');
    setFeedback('');
    try {
      const updated = await apiRequest(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ orderStatus }),
      });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      setFeedback(`Order status updated to "${orderStatus}".`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCustomStatusChange(requestId, status) {
    setError('');
    setFeedback('');
    try {
      const updated = await apiRequest(`/api/admin/custom-requests/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setCustomRequests((prev) =>
        prev.map((r) => (r._id === requestId ? updated : r))
      );
      setFeedback(`Custom 3D request updated to "${status}".`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <h2>GoaPrintLab Admin Dashboard</h2>
            <p className="section-subtitle">
              Manage 3D products, customer accounts, standard orders, and uploaded 3D
              models.
            </p>
          </div>
        </div>

        <div className="grid-4" style={{ marginBottom: 24 }}>
          <div className="card card-body">
            <div style={{ fontSize: '0.84rem', color: '#64748b' }}>Catalogue Products</div>
            <strong style={{ fontSize: '1.6rem' }}>{stats.totalProducts}</strong>
          </div>
          <div className="card card-body">
            <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
              Registered Customers
            </div>
            <strong style={{ fontSize: '1.6rem' }}>{stats.totalCustomers}</strong>
          </div>
          <div className="card card-body">
            <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
              Orders / Custom Prints
            </div>
            <strong style={{ fontSize: '1.6rem' }}>
              {stats.totalOrders} / {stats.totalCustomRequests}
            </strong>
          </div>
          <div className="card card-body">
            <div style={{ fontSize: '0.84rem', color: '#64748b' }}>Order Revenue</div>
            <strong style={{ fontSize: '1.6rem', color: '#059669' }}>
              ₹{stats.totalRevenue}
            </strong>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {feedback && <div className="alert alert-success">{feedback}</div>}

        <div className="tabs">
          <button
            type="button"
            className={`tab-btn ${tab === 'products' ? 'active' : ''}`}
            onClick={() => setTab('products')}
          >
            Products ({products.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === 'orders' ? 'active' : ''}`}
            onClick={() => setTab('orders')}
          >
            Orders ({orders.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === 'custom' ? 'active' : ''}`}
            onClick={() => setTab('custom')}
          >
            Custom 3D Requests ({customRequests.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === 'customers' ? 'active' : ''}`}
            onClick={() => setTab('customers')}
          >
            Customers ({customers.length})
          </button>
        </div>

        {loading ? (
          <p>Loading dashboard data...</p>
        ) : tab === 'products' ? (
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <form className="card card-body" onSubmit={handleProductSubmit}>
              <h3 style={{ marginBottom: 14 }}>
                {editingId ? 'Edit 3D Product' : 'Add New 3D Product'}
              </h3>

              <div className="form-group">
                <label className="form-label">Product Title</label>
                <input
                  required
                  className="form-control"
                  value={productForm.title}
                  onChange={(e) =>
                    setProductForm({ ...productForm, title: e.target.value })
                  }
                />
              </div>

              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({ ...productForm, category: e.target.value })
                    }
                  >
                    <option value="Prototypes">Prototypes</option>
                    <option value="Decor">Decor</option>
                    <option value="Gadgets">Gadgets</option>
                    <option value="Architectural">Architectural</option>
                    <option value="Gifts">Gifts</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Base Price (INR ₹)</label>
                  <input
                    required
                    type="number"
                    min={0}
                    className="form-control"
                    value={productForm.basePrice}
                    onChange={(e) =>
                      setProductForm({ ...productForm, basePrice: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  required
                  rows={3}
                  className="form-control"
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({ ...productForm, description: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Materials (comma-separated)</label>
                <input
                  className="form-control"
                  value={productForm.materials}
                  onChange={(e) =>
                    setProductForm({ ...productForm, materials: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Colours (comma-separated)</label>
                <input
                  className="form-control"
                  value={productForm.colors}
                  onChange={(e) =>
                    setProductForm({ ...productForm, colors: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sizes (comma-separated)</label>
                <input
                  className="form-control"
                  value={productForm.sizes}
                  onChange={(e) =>
                    setProductForm({ ...productForm, sizes: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product Image (optional upload)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                />
              </div>

              <div className="form-group" style={{ flexDirection: 'row', gap: 8 }}>
                <input
                  id="in-stock-check"
                  type="checkbox"
                  checked={productForm.inStock}
                  onChange={(e) =>
                    setProductForm({ ...productForm, inStock: e.target.checked })
                  }
                />
                <label htmlFor="in-stock-check" className="form-label">
                  In Stock &amp; Available
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingProduct}
                >
                  <Plus size={16} />
                  {savingProduct
                    ? 'Saving...'
                    : editingId
                      ? 'Update Product'
                      : 'Create Product'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod._id}>
                      <td>
                        <strong>{prod.title}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {(prod.materials || []).join(', ')}
                        </div>
                      </td>
                      <td>{prod.category}</td>
                      <td>₹{prod.basePrice}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => startEdit(prod)}
                            aria-label={`Edit ${prod.title}`}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteProduct(prod._id)}
                            aria-label={`Delete ${prod.title}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : tab === 'orders' ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord._id}>
                    <td>
                      <strong>#{ord._id.slice(-8).toUpperCase()}</strong>
                    </td>
                    <td>
                      <div>{ord.userId?.name || ord.shippingAddress?.fullName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {ord.userId?.email}
                      </div>
                    </td>
                    <td>
                      {ord.items.map((it, i) => (
                        <div key={i} style={{ fontSize: '0.84rem' }}>
                          {it.title} ({it.material}, {it.size}) × {it.quantity}
                        </div>
                      ))}
                    </td>
                    <td>
                      <strong>₹{ord.totalAmount}</strong>
                    </td>
                    <td>
                      <StatusBadge status={ord.orderStatus} />
                    </td>
                    <td>
                      <select
                        className="form-control"
                        value={ord.orderStatus}
                        onChange={(e) =>
                          handleOrderStatusChange(ord._id, e.target.value)
                        }
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tab === 'custom' ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>3D Model File</th>
                  <th>Specs</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Review Action</th>
                </tr>
              </thead>
              <tbody>
                {customRequests.map((reqItem) => (
                  <tr key={reqItem._id}>
                    <td>
                      <div>{reqItem.userId?.name || 'Customer'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {reqItem.userId?.email}
                      </div>
                    </td>
                    <td>
                      <a
                        href={reqItem.modelFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        <Download size={14} />
                        {reqItem.modelFileName}
                      </a>
                    </td>
                    <td>
                      {reqItem.material} · {reqItem.color} · {reqItem.size} (Qty{' '}
                      {reqItem.quantity})
                    </td>
                    <td>{reqItem.notes || '—'}</td>
                    <td>
                      <StatusBadge status={reqItem.status} />
                    </td>
                    <td>
                      <select
                        className="form-control"
                        value={reqItem.status}
                        onChange={(e) =>
                          handleCustomStatusChange(reqItem._id, e.target.value)
                        }
                      >
                        {CUSTOM_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City / State</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((cust) => (
                  <tr key={cust._id}>
                    <td>
                      <strong>{cust.name}</strong>
                    </td>
                    <td>{cust.email}</td>
                    <td>{cust.phone || '—'}</td>
                    <td>
                      {cust.address?.city || '—'}, {cust.address?.state || 'Goa'}
                    </td>
                    <td>{new Date(cust.createdAt).toLocaleDateString()}</td>
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
