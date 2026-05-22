import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar glass-panel">
      <div className="container nav-content">
        <Link to="/" className="brand">
          <span className="text-gradient">QuickBook</span>
        </Link>
        <ul className="nav-links">
          <li><Link to="/">Головна</Link></li>
          <li><Link to="/catalog">Послуги</Link></li>
          <li><Link to="/dashboard">Кабінет</Link></li>
        </ul>
        <div className="nav-actions">
          <Link to="/login" className="btn btn-secondary">Увійти</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
