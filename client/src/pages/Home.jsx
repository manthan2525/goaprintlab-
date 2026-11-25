import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Upload, PackageCheck, ArrowRight, Sparkles } from 'lucide-react';
import { apiRequest } from '../api/client';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/api/products')
      .then((data) => setFeatured(data.slice(0, 6)))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="hero-tag">
              <Sparkles size={15} />
              On-Demand 3D Printing Workshop in Goa
            </div>
            <h1>Precision 3D-Printed Products &amp; Custom Fabrication</h1>
            <p>
              Browse ready-to-print engineering prototypes, coastal decor, and smart desk
              gadgets—or upload your own STL/OBJ 3D model for custom printing in PLA, PETG,
              ABS, or TPU.
            </p>
            <div className="hero-cta">
              <Link to="/catalogue" className="btn btn-primary">
                Explore Catalogue
                <ArrowRight size={17} />
              </Link>
              <Link to="/custom-print" className="btn btn-outline-light">
                <Upload size={17} />
                Upload 3D Model
              </Link>
            </div>
          </div>

          <div className="hero-card">
            <h3 style={{ fontSize: '1.05rem', color: '#f8fafc' }}>
              End-to-End Additive Manufacturing
            </h3>
            <div className="hero-stat-row">
              <div className="hero-stat">
                <strong>5+ Filaments</strong>
                <span>PLA, PETG, ABS, TPU, Resin</span>
              </div>
              <div className="hero-stat">
                <strong>.STL / .OBJ</strong>
                <span>Direct custom 3D file upload</span>
              </div>
              <div className="hero-stat">
                <strong>Custom Fit</strong>
                <span>Material, colour &amp; scale options</span>
              </div>
              <div className="hero-stat">
                <strong>Live Status</strong>
                <span>Track from slicing to delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Featured 3D-Printed Products</h2>
              <p className="section-subtitle">
                Configure filament material, colour, and size before ordering.
              </p>
            </div>
            <Link to="/catalogue" className="btn btn-secondary btn-sm">
              View All Products
            </Link>
          </div>

          {loading ? (
            <p>Loading featured 3D products...</p>
          ) : (
            <div className="grid-3">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 12 }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2>How GoaPrintLab Works</h2>
              <p className="section-subtitle">
                Simple workflow for both catalogue purchases and bespoke 3D model prints.
              </p>
            </div>
          </div>

          <div className="grid-3">
            <div className="card card-body">
              <Layers size={28} color="#0284c7" style={{ marginBottom: 10 }} />
              <h3 style={{ marginBottom: 6 }}>1. Choose or Upload</h3>
              <p style={{ color: '#475569', fontSize: '0.92rem' }}>
                Select a curated item from the catalogue or upload your own .STL / .OBJ /
                .3MF 3D mesh file.
              </p>
            </div>
            <div className="card card-body">
              <Upload size={28} color="#0284c7" style={{ marginBottom: 10 }} />
              <h3 style={{ marginBottom: 6 }}>2. Configure Specifications</h3>
              <p style={{ color: '#475569', fontSize: '0.92rem' }}>
                Pick your preferred filament (PLA, PETG, ABS, TPU), colour, scale/size,
                and print notes.
              </p>
            </div>
            <div className="card card-body">
              <PackageCheck size={28} color="#0284c7" style={{ marginBottom: 10 }} />
              <h3 style={{ marginBottom: 6 }}>3. Track Fabrication</h3>
              <p style={{ color: '#475569', fontSize: '0.92rem' }}>
                Monitor real-time status updates from Pending and Printing through Shipped
                and Delivered.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
