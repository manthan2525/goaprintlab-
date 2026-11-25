import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Box, ShoppingCart, Upload, User, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand-link">
          <span className="brand-badge">
            <Box size={20} />
          </span>
          <span>GoaPrintLab</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/" end className="nav-link">
            Home
          </NavLink>
          <NavLink to="/catalogue" className="nav-link">
            Catalogue
          </NavLink>
          <NavLink to="/custom-print" className="nav-link">
            <Upload size={15} />
            Custom 3D Print
          </NavLink>
          {user && (
            <NavLink to="/orders" className="nav-link">
              My Orders
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className="nav-link">
              <ShieldCheck size={15} />
              Admin
            </NavLink>
          )}
        </nav>

        <div className="nav-actions">
          <Link to="/cart" className="cart-pill" aria-label="Shopping Cart">
            <ShoppingCart size={17} />
            <span>Cart</span>
            <span className="cart-count">{itemCount}</span>
          </Link>

          {user ? (
            <>
              <Link to="/profile" className="nav-link">
                <User size={16} />
                <span>{user.name.split(' ')[0]}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline-light btn-sm"
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-light btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
