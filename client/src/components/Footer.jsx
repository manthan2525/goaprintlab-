import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h4>GoaPrintLab</h4>
          <p style={{ maxWidth: 420, fontSize: '0.9rem' }}>
            On-demand 3D Printing E-Commerce &amp; Custom Additive Manufacturing Storefront.
            Built with MongoDB, Express.js, React.js, and Node.js.
          </p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <div style={{ display: 'grid', gap: 6, fontSize: '0.9rem' }}>
            <Link to="/catalogue">Browse Catalogue</Link>
            <Link to="/custom-print">Custom 3D Print Upload</Link>
            <Link to="/orders">Order Tracking</Link>
          </div>
        </div>

        <div>
          <h4>Workshop Location</h4>
          <p style={{ fontSize: '0.9rem' }}>
            Miramar Innovation Hub, Panaji, Goa 403001
            <br />
            support@goaprintlab.in
          </p>
        </div>
      </div>
    </footer>
  );
}
