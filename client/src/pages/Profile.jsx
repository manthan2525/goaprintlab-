import { useState } from 'react';
import { Save } from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUserState } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || 'Goa',
    pincode: user?.address?.pincode || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      const data = await apiRequest('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          address: {
            street: form.street,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
        }),
      });
      updateUserState(data.user);
      setSuccess('Profile details updated in MongoDB.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="section-header">
          <div>
            <h2>User Profile</h2>
            <p className="section-subtitle">
              Manage your contact details and default shipping address.
            </p>
          </div>
        </div>

        <form className="card card-body" onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" value={user?.email || ''} disabled />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <input
              className="form-control"
              value={(user?.role || 'customer').toUpperCase()}
              disabled
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              required
              className="form-control"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              className="form-control"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input
              className="form-control"
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
            />
          </div>

          <div className="grid-3" style={{ gap: 12 }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                className="form-control"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                className="form-control"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">PIN Code</label>
              <input
                className="form-control"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={17} />
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </section>
  );
}
