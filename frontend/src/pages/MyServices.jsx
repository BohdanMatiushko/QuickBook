import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { formatPrice, formatDuration } from '../utils/format';
import './MyServices.css';

const WEEKDAY_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

function formatWeekdays(days) {
  if (!days?.length || days.length === 7) return 'Щодня';
  return days.map((d) => WEEKDAY_SHORT[d] ?? d).join(', ');
}

function MyServices() {
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadServices = () => {
    setLoading(true);
    setError('');
    api.get('/services/?mine=1')
      .then((res) => setServices(res.data.results || res.data))
      .catch(() => setError('Не вдалося завантажити послуги. Увійдіть як фахівець.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadServices();
  }, [location.key]);

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити цю послугу?')) return;
    try {
      await api.delete(`/services/${id}/`);
      setServices((s) => s.filter((x) => x.id !== id));
    } catch {
      alert('Не вдалося видалити послугу.');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <p className="loading-text">Завантаження…</p>
      </div>
    );
  }

  return (
    <div className="container my-services-page">
      <div className="my-services-header">
        <h2 className="page-title">
          Мої <span className="text-gradient">послуги</span>
        </h2>
        <Link to="/my-services/new" className="btn btn-primary">
          Створити послугу
        </Link>
      </div>

      {error && <div className="auth-message auth-message--error">{error}</div>}

      {services.length === 0 && !loading && !error ? (
        <div className="glass-panel my-services-empty">
          <p>У вас ще немає послуг. Створіть першу — клієнти побачать її в каталозі.</p>
          <Link to="/my-services/new" className="btn btn-primary">
            Створити послугу
          </Link>
        </div>
      ) : (
        <div className="my-services-grid">
          {services.map((s) => (
            <article key={s.id} className="service-card glass-panel">
              <div className="service-category">{s.category_name}</div>
              <h3>{s.name}</h3>
              <div className="service-meta">
                <span>{formatPrice(s.price)}</span>
                <span>{formatDuration(s.duration)}</span>
              </div>
              <p className="service-mode-hint">
                {s.booking_mode === 'fixed_slots' ? 'Фіксовані години' : 'Вільні слоти'}
                {' · '}{formatWeekdays(s.available_weekdays)}
                {s.max_clients > 1 ? ` · до ${s.max_clients} осіб` : ''}
              </p>
              <div className="my-service-actions">
                <Link to={`/my-services/${s.id}/edit`} className="btn btn-secondary">
                  Редагувати
                </Link>
                <button type="button" className="btn btn-danger-outline" onClick={() => handleDelete(s.id)}>
                  Видалити
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyServices;
