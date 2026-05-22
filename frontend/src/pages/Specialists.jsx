import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Specialists.css';

function Specialists() {
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      api.get('/auth/specialists/', { params: search ? { search } : {} })
        .then((res) => {
          setSpecialists(res.data.results || res.data);
        })
        .catch(() => {
          setError('Не вдалося завантажити список фахівців. Перевірте, чи запущений backend.');
          setSpecialists([]);
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="container specialists-page">
      <h2 className="page-title">
        Наші <span className="text-gradient">Фахівці</span>
      </h2>
      <p className="specialists-subtitle">
        Знайдіть фахівця за імʼям, перегляньте його послуги та забронюйте візит.
      </p>

      <div className="specialists-search glass-panel">
        <label className="form-label" htmlFor="specialist-search">Пошук за імʼям</label>
        <input
          id="specialist-search"
          type="search"
          className="form-control"
          placeholder="Наприклад: Іван, Марія, petrenko…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="auth-message auth-message--error">{error}</div>}

      {loading ? (
        <p className="loading-text">Завантаження…</p>
      ) : specialists.length === 0 ? (
        <p className="empty-catalog">
          {search ? 'За цим запитом фахівців не знайдено.' : 'Поки немає зареєстрованих фахівців.'}
        </p>
      ) : (
        <div className="specialists-grid">
          {specialists.map((sp) => (
            <Link
              key={sp.id}
              to={`/specialists/${sp.id}`}
              className="specialist-card glass-panel"
            >
              <span className="specialist-avatar" aria-hidden="true">
                {sp.display_name?.[0]?.toUpperCase() || '?'}
              </span>
              <h3>{sp.display_name}</h3>
              <p className="specialist-username">@{sp.username}</p>
              <span className="specialist-services-count">
                {sp.services_count}{' '}
                {sp.services_count === 1 ? 'послуга' : 'послуг'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Specialists;
