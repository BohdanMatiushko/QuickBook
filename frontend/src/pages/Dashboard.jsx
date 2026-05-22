import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import { formatDate, formatStatus } from '../utils/format';
import './Dashboard.css';

const INITIAL_UPCOMING = [
  {
    id: 101,
    service_name: 'Масаж спини',
    date: '2026-05-28',
    start_time: '14:00',
    status: 'scheduled',
  },
];

const INITIAL_PAST = [
  {
    id: 99,
    service_name: 'Консультація терапевта',
    date: '2026-04-10',
    start_time: '10:00',
    status: 'completed',
    canReview: true,
  },
];

function Dashboard() {
  const location = useLocation();
  const [upcoming, setUpcoming] = useState(INITIAL_UPCOMING);
  const [past, setPast] = useState(INITIAL_PAST);

  useEffect(() => {
    const nb = location.state?.newBooking;
    if (!nb) return;
    setUpcoming((prev) => [
      {
        id: Date.now(),
        service_name: nb.service_name || 'Нова послуга',
        date: nb.date,
        start_time: nb.start_time,
        status: 'scheduled',
      },
      ...prev,
    ]);
    window.history.replaceState({}, document.title);
  }, [location.state]);

  const handleCancel = (appointmentId) => {
    if (!window.confirm('Скасувати цей запис?')) return;
    const item = upcoming.find((a) => a.id === appointmentId);
    if (!item) return;
    setUpcoming((u) => u.filter((a) => a.id !== appointmentId));
    setPast((p) => [{ ...item, status: 'cancelled', canReview: false }, ...p]);
  };

  const handleReview = (appointmentId) => {
    const rating = window.prompt('Оцінка від 1 до 5:', '5');
    if (!rating) return;
    setPast((list) =>
      list.map((a) =>
        a.id === appointmentId ? { ...a, canReview: false, reviewed: true } : a
      )
    );
    alert('Дякуємо за відгук!');
  };

  return (
    <div className="container dashboard-page">
      <h2 className="page-title">
        Особистий <span className="text-gradient">Кабінет</span>
      </h2>

      <section className="dashboard-section glass-panel">
        <h3>Майбутні записи</h3>
        {upcoming.length === 0 ? (
          <p className="dashboard-empty">У вас немає активних бронювань.</p>
        ) : (
          <ul className="appointment-list">
            {upcoming.map((a) => (
              <li key={a.id} className="appointment-item">
                <div>
                  <strong>{a.service_name}</strong>
                  <span className="appointment-meta">
                    {formatDate(a.date)} · {a.start_time}
                  </span>
                  <span className={`status-badge status-${a.status}`}>
                    {formatStatus(a.status)}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => handleCancel(a.id)}
                >
                  Скасувати
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dashboard-section glass-panel">
        <h3>Минулі записи</h3>
        {past.length === 0 ? (
          <p className="dashboard-empty">Історія порожня.</p>
        ) : (
          <ul className="appointment-list">
            {past.map((a) => (
              <li key={a.id} className="appointment-item">
                <div>
                  <strong>{a.service_name}</strong>
                  <span className="appointment-meta">
                    {formatDate(a.date)} · {a.start_time}
                  </span>
                  <span className={`status-badge status-${a.status}`}>
                    {formatStatus(a.status)}
                  </span>
                </div>
                {a.canReview && a.status === 'completed' && (
                  <Button
                    variant="primary"
                    type="button"
                    onClick={() => handleReview(a.id)}
                  >
                    Залишити відгук
                  </Button>
                )}
                {a.reviewed && (
                  <span className="reviewed-label">Відгук надіслано</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link to="/catalog" className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
        Перейти до каталогу
      </Link>
    </div>
  );
}

export default Dashboard;
