import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileUp, Send } from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

export default function CustomPrint() {
  const { user } = useAuth();
  const [modelFile, setModelFile] = useState(null);
  const [material, setMaterial] = useState('PLA');
  const [color, setColor] = useState('Matte Black');
  const [size, setSize] = useState('Medium (100% Scale)');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requests, setRequests] = useState([]);

  async function loadRequests() {
    if (!user) return;
    try {
      const data = await apiRequest('/api/custom-requests');
      setRequests(data);
    } catch {
      // Ignore initial load errors
    }
  }

  useEffect(() => {
    loadRequests();
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!modelFile) {
      setError('Please select a .stl, .obj, or .3mf 3D model file.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('modelFile', modelFile);
      formData.append('material', material);
      formData.append('color', color);
      formData.append('size', size);
      formData.append('quantity', String(quantity));
      formData.append('notes', notes);

      await apiRequest('/api/custom-requests', {
        method: 'POST',
        body: formData,
      });

      setSuccess(
        'Custom 3D printing request submitted! Our workshop administrator will review your model.'
      );
      setModelFile(null);
      setNotes('');
      setQuantity(1);
      await loadRequests();
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
            <h2>Custom 3D Printing Request</h2>
            <p className="section-subtitle">
              Upload your CAD mesh (.STL, .OBJ, or .3MF) and specify fabrication parameters.
            </p>
          </div>
        </div>

        {!user ? (
          <div className="card card-body" style={{ textAlign: 'center', padding: 36 }}>
            <h3 style={{ marginBottom: 8 }}>Login Required for Custom 3D Uploads</h3>
            <p style={{ color: '#475569', marginBottom: 18 }}>
              Please log in or register an account so you can submit 3D model files and
              track approval status.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Create Account
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <form className="card card-body" onSubmit={handleSubmit}>
              <h3 style={{ marginBottom: 16 }}>Submit 3D Model File</h3>

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <div className="form-group">
                <label className="form-label" htmlFor="model-file-input">
                  3D Model File (.stl, .obj, .3mf — Max 25 MB)
                </label>
                <div
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: 10,
                    padding: 20,
                    textAlign: 'center',
                    background: '#f8fafc',
                  }}
                >
                  <FileUp size={28} color="#0284c7" style={{ marginBottom: 8 }} />
                  <input
                    id="model-file-input"
                    type="file"
                    accept=".stl,.obj,.3mf"
                    onChange={(e) => setModelFile(e.target.files?.[0] || null)}
                  />
                  {modelFile && (
                    <div style={{ marginTop: 8, fontSize: '0.86rem', color: '#0369a1' }}>
                      Selected: <strong>{modelFile.name}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Filament Material</label>
                  <select
                    className="form-control"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                  >
                    <option value="PLA">PLA (Standard Prototyping)</option>
                    <option value="PETG">PETG (Durable &amp; Heat Resistant)</option>
                    <option value="ABS">ABS (Functional Mechanical)</option>
                    <option value="TPU">TPU (Flexible Elastomer)</option>
                    <option value="Resin">SLA Resin (High Detail)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Filament Colour</label>
                  <select
                    className="form-control"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  >
                    <option value="Matte Black">Matte Black</option>
                    <option value="Arctic White">Arctic White</option>
                    <option value="Ocean Blue">Ocean Blue</option>
                    <option value="Sunset Orange">Sunset Orange</option>
                    <option value="Slate Grey">Slate Grey</option>
                    <option value="Emerald Green">Emerald Green</option>
                  </select>
                </div>
              </div>

              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Target Size / Scale</label>
                  <input
                    required
                    className="form-control"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="e.g., 100% Scale or 120mm × 80mm"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    required
                    type="number"
                    min={1}
                    max={100}
                    className="form-control"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Print Instructions (Infill %, Layer Height, Supports)
                </label>
                <textarea
                  rows={3}
                  className="form-control"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional: e.g., 20% infill, 0.2mm layer height, brim enabled..."
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={submitting}
              >
                <Send size={16} />
                {submitting ? 'Uploading & Submitting...' : 'Submit Custom Print Request'}
              </button>
            </form>

            <div className="card card-body">
              <h3 style={{ marginBottom: 14 }}>Your Recent Custom Requests</h3>
              {requests.length === 0 ? (
                <p style={{ color: '#64748b' }}>
                  You have not submitted any custom 3D model files yet.
                </p>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {requests.map((reqItem) => (
                    <div
                      key={reqItem._id}
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <strong>{reqItem.modelFileName}</strong>
                        <StatusBadge status={reqItem.status} />
                      </div>
                      <div style={{ fontSize: '0.86rem', color: '#475569' }}>
                        {reqItem.material} · {reqItem.color} · {reqItem.size} · Qty:{' '}
                        {reqItem.quantity}
                      </div>
                      {reqItem.notes && (
                        <div
                          style={{
                            fontSize: '0.83rem',
                            color: '#64748b',
                            marginTop: 4,
                          }}
                        >
                          Notes: {reqItem.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
