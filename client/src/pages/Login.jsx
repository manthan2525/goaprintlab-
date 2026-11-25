import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'admin' && redirectTo === '/') {
        navigate('/admin');
      } else {
        navigate(redirectTo);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section">
      <div className="container auth-wrapper">
        <div className="card card-body">
          <h2 style={{ marginBottom: 6 }}>Sign In to GoaPrintLab</h2>
          <p style={{ color: '#475569', fontSize: '0.92rem', marginBottom: 20 }}>
            Access your cart, custom 3D print requests, and order tracking.
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={submitting}
            >
              <LogIn size={17} />
              {submitting ? 'Signing In...' : 'Login'}
            </button>
          </form>

          <div
            style={{
              marginTop: 18,
              padding: 12,
              borderRadius: 8,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: '0.84rem',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Quick Demo Credentials:</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setEmail('customer@goaprintlab.in');
                  setPassword('Customer@123');
                }}
              >
                Fill Customer Demo
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setEmail('admin@goaprintlab.in');
                  setPassword('Admin@123');
                }}
              >
                Fill Admin Demo
              </button>
            </div>
          </div>

          <p style={{ marginTop: 16, fontSize: '0.9rem', textAlign: 'center' }}>
            New to GoaPrintLab?{' '}
            <Link to="/register" style={{ color: '#0284c7', fontWeight: 600 }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
