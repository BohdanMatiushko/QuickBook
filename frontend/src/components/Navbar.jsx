import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, isAuthenticated, isSpecialist, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  const displayName = user?.first_name || user?.username || user?.email;

  return (
    <nav className="navbar glass-panel">
      <div className="container nav-content">
        <Link to="/" className="brand">
          <span className="text-gradient">QuickBook</span>
        </Link>
        <ul className="nav-links">
          <li><Link to="/">Головна</Link></li>
          <li><Link to="/specialists">Фахівці</Link></li>
          {isSpecialist && (
            <li><Link to="/my-services">Мої послуги</Link></li>
          )}
          {isAuthenticated && (
            <li><Link to="/dashboard">Кабінет</Link></li>
          )}
        </ul>
        <div className="nav-actions" ref={menuRef}>
          {isAuthenticated ? (
            <div className="user-menu">
              <button
                type="button"
                className="user-menu-trigger"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
              >
                <span className="user-avatar">{displayName?.[0]?.toUpperCase() || '?'}</span>
                <span className="user-menu-label">
                  <strong>{displayName}</strong>
                  <small>{isSpecialist ? 'Фахівець' : 'Клієнт'}</small>
                </span>
              </button>
              {menuOpen && (
                <div className="user-menu-dropdown glass-panel">
                  <p className="user-menu-email">{user.email}</p>
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                    Особистий кабінет
                  </Link>
                  {isSpecialist && (
                    <Link to="/my-services/new" onClick={() => setMenuOpen(false)}>
                      Створити послугу
                    </Link>
                  )}
                  <button type="button" className="user-menu-logout" onClick={handleLogout}>
                    Вийти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-secondary">Увійти</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
