import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer id="contacts" className="site-footer glass-panel">
      <div className="container footer-content">
        <div className="footer-brand">
          <span className="text-gradient">QuickBook</span>
          <p>Преміальний сервіс онлайн-бронювання послуг</p>
        </div>
        <div className="footer-links">
          <h4>Навігація</h4>
          <ul>
            <li><Link to="/">Головна</Link></li>
            <li><Link to="/catalog">Послуги</Link></li>
            <li><Link to="/dashboard">Кабінет</Link></li>
          </ul>
        </div>
        <div className="footer-contact">
          <h4>Контакти</h4>
          <p>hello@quickbook.ua</p>
          <p>+380 (44) 000-00-00</p>
        </div>
      </div>
      <p className="footer-copy">&copy; 2026 QuickBook. Всі права захищені.</p>
    </footer>
  );
}

export default Footer;
