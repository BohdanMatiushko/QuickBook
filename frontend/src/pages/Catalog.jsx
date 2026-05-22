import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatPrice, formatDuration } from '../utils/format';
import './Catalog.css';

const DEMO_SERVICES = [
  { id: 1, name: 'Консультація терапевта', price: '500.00', duration: '00:30:00', category_name: 'Медицина' },
  { id: 2, name: 'Масаж спини', price: '800.00', duration: '01:00:00', category_name: 'SPA' },
  { id: 3, name: 'Стрижка чоловіча', price: '400.00', duration: '00:45:00', category_name: 'Барбершоп' },
];

function Catalog() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Усі');

  useEffect(() => {
    api.get('/services/')
      .then((res) => {
        setServices(res.data.results || res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('API error, using demo data', err);
        setServices(DEMO_SERVICES);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const names = [...new Set(services.map((s) => s.category_name).filter(Boolean))];
    return ['Усі', ...names];
  }, [services]);

  const filtered = useMemo(() => {
    if (activeCategory === 'Усі') return services;
    return services.filter((s) => s.category_name === activeCategory);
  }, [services, activeCategory]);

  if (loading) {
    return (
      <div className="container catalog-page">
        <p className="loading-text">Завантаження каталогу…</p>
      </div>
    );
  }

  return (
    <div className="container catalog-page">
      <h2 className="page-title">
        Наші <span className="text-gradient">Послуги</span>
      </h2>

      <div className="catalog-layout">
        <aside className="catalog-filters glass-panel">
          <h3>Категорії</h3>
          <ul>
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  type="button"
                  className={activeCategory === cat ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="services-grid">
          {filtered.length === 0 ? (
            <p className="empty-catalog">У цій категорії поки немає послуг.</p>
          ) : (
            filtered.map((service) => (
              <article key={service.id} className="service-card glass-panel">
                <div className="service-image-placeholder" aria-hidden="true" />
                <div className="service-category">{service.category_name}</div>
                <h3 className="service-name">{service.name}</h3>
                <div className="service-meta">
                  <span className="price">{formatPrice(service.price)}</span>
                  <span className="duration">{formatDuration(service.duration)}</span>
                </div>
                <Link to={`/booking/${service.id}`} className="btn btn-primary w-100">
                  Забронювати
                </Link>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Catalog;
