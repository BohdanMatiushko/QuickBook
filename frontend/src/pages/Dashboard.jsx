import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatStatus } from '../utils/format';
import './Dashboard.css';

function ClientDashboard() {
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/appointments/')
      .then((res) => {
        const list = res.data.results || res.data;
        const scheduled = list.filter((a) => a.status === 'scheduled');
        const done = list.filter((a) => a.status !== 'scheduled');
        setUpcoming(scheduled);
        setPast(done);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Скасувати цей запис?')) return;
    try {
      await api.patch(`/appointments/${id}/`, { status: 'cancelled' });
      load();
    } catch {
      alert('Не вдалося скасувати запис.');
    }
  };

  if (loading) {
    return <p className="loading-text">Завантаження записів…</p>;
  }

  return (
    <>
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
                    {formatDate(a.date)} · {String(a.start_time).slice(0, 5)}
                  </span>
                  <span className={`status-badge status-${a.status}`}>
                    {formatStatus(a.status)}
                  </span>
                </div>
                <Button variant="secondary" type="button" onClick={() => handleCancel(a.id)}>
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
                    {formatDate(a.date)} · {String(a.start_time).slice(0, 5)}
                  </span>
                  <span className={`status-badge status-${a.status}`}>
                    {formatStatus(a.status)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link to="/specialists" className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
        Перейти до фахівців
      </Link>
    </>
  );
}

function SpecialistDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/appointments/?role=specialist'),
      api.get('/auth/notifications/'),
    ])
      .then(([aptRes, notifRes]) => {
        setAppointments(aptRes.data.results || aptRes.data);
        setNotifications(notifRes.data.results || notifRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await api.post(`/auth/notifications/${id}/mark_read/`);
    setNotifications((list) =>
      list.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  if (loading) {
    return <p className="loading-text">Завантаження…</p>;
  }

  return (
    <>
      <section className="dashboard-section glass-panel">
        <div className="dashboard-section-header">
          <h3>Сповіщення</h3>
          <Link to="/my-services/new" className="btn btn-primary btn-sm">
            + Нова послуга
          </Link>
        </div>
        {notifications.length === 0 ? (
          <p className="dashboard-empty">Немає нових сповіщень.</p>
        ) : (
          <ul className="notification-list">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`notification-item ${n.is_read ? 'read' : 'unread'}`}
              >
                <strong>{n.title}</strong>
                <p>{n.message}</p>
                <span className="appointment-meta">
                  {new Date(n.created_at).toLocaleString('uk-UA')}
                </span>
                {!n.is_read && (
                  <button type="button" className="mark-read-btn" onClick={() => markRead(n.id)}>
                    Прочитано
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dashboard-section glass-panel">
        <h3>Записи клієнтів</h3>
        {appointments.length === 0 ? (
          <p className="dashboard-empty">Поки немає бронювань на ваші послуги.</p>
        ) : (
          <ul className="appointment-list">
            {appointments.map((a) => (
              <li key={a.id} className="appointment-item">
                <div>
                  <strong>{a.client_name || 'Клієнт'}</strong>
                  <span className="appointment-meta">
                    {a.service_name} · {formatDate(a.date)} · {String(a.start_time).slice(0, 5)}
                  </span>
                  <span className={`status-badge status-${a.status}`}>
                    {formatStatus(a.status)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link to="/my-services" className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
        Мої послуги
      </Link>
    </>
  );
}

function Dashboard() {
  const { user, isSpecialist } = useAuth();

  return (
    <div className="container dashboard-page">
      <h2 className="page-title">
        {isSpecialist ? (
          <>Кабінет <span className="text-gradient">фахівця</span></>
        ) : (
          <>Особистий <span className="text-gradient">кабінет</span></>
        )}
      </h2>
      <p className="dashboard-greeting">
        Вітаємо, {user?.first_name || user?.username}!
      </p>

      {isSpecialist ? <SpecialistDashboard /> : <ClientDashboard />}
    </div>
  );
}

export default Dashboard;
