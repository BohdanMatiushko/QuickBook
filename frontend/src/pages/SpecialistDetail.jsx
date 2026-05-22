import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { formatPrice, formatDuration } from '../utils/format';
import './Specialists.css';

function SpecialistDetail() {
  const { id } = useParams();
  const [specialist, setSpecialist] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/auth/specialists/${id}/`),
      api.get('/services/', { params: { owner: id } }),
    ])
      .then(([spRes, svcRes]) => {
        setSpecialist(spRes.data);
        setServices(svcRes.data.results || svcRes.data);
      })
      .catch(() => setError('Фахівця не знайдено або сервер недоступний.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container specialists-page">
        <p className="loading-text">Завантаження…</p>
      </div>
    );
  }

  if (error || !specialist) {
    return (
      <div className="container specialists-page">
        <p className="auth-message auth-message--error">{error || 'Фахівець не знайдений.'}</p>
        <Link to="/specialists" className="btn btn-secondary">← До списку фахівців</Link>
      </div>
    );
  }

  return (
    <div className="container specialists-page">
      <Link to="/specialists" className="back-link">← Усі фахівці</Link>

      <header className="specialist-profile glass-panel">
        <span className="specialist-avatar specialist-avatar--lg" aria-hidden="true">
          {specialist.display_name?.[0]?.toUpperCase() || '?'}
        </span>
        <div>
          <h2 className="page-title" style={{ marginBottom: '0.25rem' }}>
            {specialist.display_name}
          </h2>
          <p className="specialist-username">@{specialist.username}</p>
        </div>
      </header>

      <h3 className="specialist-services-title">Послуги фахівця</h3>

      {services.length === 0 ? (
        <p className="empty-catalog">У цього фахівця поки немає активних послуг.</p>
      ) : (
        <div className="services-grid">
          {services.map((service) => (
            <article key={service.id} className="service-card glass-panel">
              <div className="service-category">{service.category_name}</div>
              <h3 className="service-name">{service.name}</h3>
              {service.description && (
                <p className="service-desc-short">{service.description}</p>
              )}
              <div className="service-meta">
                <span className="price">{formatPrice(service.price)}</span>
                <span className="duration">{formatDuration(service.duration)}</span>
              </div>
              <Link to={`/booking/${service.id}`} className="btn btn-primary w-100">
                Забронювати
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default SpecialistDetail;
