import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api, { ensureCsrf } from '../services/api';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDuration } from '../utils/format';
import './Booking.css';

const WEEKDAY_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

function formatWeekdays(days) {
  if (!days?.length || days.length === 7) return 'щодня';
  return days.map((d) => WEEKDAY_SHORT[d]).join(', ');
}

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    api.get(`/services/${id}/`)
      .then((res) => {
        setService(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Послугу не знайдено.');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!date || !service) {
      setAvailability(null);
      return;
    }
    setLoadingSlots(true);
    setTime('');
    api.get(`/services/${id}/availability/`, { params: { date } })
      .then((res) => setAvailability(res.data))
      .catch(() => setAvailability(null))
      .finally(() => setLoadingSlots(false));
  }, [date, id, service]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/booking/${id}` } });
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await ensureCsrf();
      await api.post('/appointments/', {
        service: Number(id),
        date,
        start_time: `${time}:00`,
        status: 'scheduled',
      });
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object') {
        const msg = Object.values(data).flat()[0];
        setError(typeof msg === 'string' ? msg : 'Не вдалося забронювати.');
      } else {
        setError('Не вдалося забронювати. Оберіть інший час.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];
  const displayMode = availability?.display_mode || service?.display_mode || 'timeline';
  const slots = availability?.slots || [];
  const availableSlots = slots.filter((s) => s.is_available);
  const busySlots = slots.filter((s) => s.is_busy);

  if (loading) {
    return (
      <div className="container booking-page">
        <p className="loading-text">Завантаження…</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container booking-page">
        <p className="loading-text">{error || 'Послуга недоступна.'}</p>
      </div>
    );
  }

  return (
    <div className="container booking-page">
      <div className="booking-layout">
        <aside className="service-details glass-panel">
          <span className="service-details-category">{service.category_name}</span>
          <h2>{service.name}</h2>
          {service.owner_name && (
            <p className="service-specialist">Фахівець: {service.owner_name}</p>
          )}
          {service.description && (
            <p className="service-details-desc">{service.description}</p>
          )}
          <div className="service-details-meta">
            <span>{formatPrice(service.price)}</span>
            <span>{formatDuration(service.duration)}</span>
          </div>
          <p className="service-weekdays-hint">
            Запис: {formatWeekdays(service.available_weekdays)}
          </p>
        </aside>

        <div className="glass-panel booking-form-container">
          <h2 className="page-title booking-form-title">
            Оберіть <span className="text-gradient">дату та час</span>
          </h2>

          {error && <div className="auth-message auth-message--error">{error}</div>}

          <form onSubmit={handleBooking}>
            <div className="form-group">
              <label className="form-label" htmlFor="booking-date">Дата візиту</label>
              <input
                id="booking-date"
                type="date"
                className="form-control"
                required
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {date && (
              <>
                {availability?.day_unavailable ? (
                  <p className="dashboard-empty">
                    У цей день запис недоступний. Оберіть іншу дату ({formatWeekdays(service.available_weekdays)}).
                  </p>
                ) : (
                  <>
                {busySlots.length > 0 && (
                  <div className="form-group busy-hours-section">
                    <label className="form-label">Зайняті години</label>
                    <ul className="busy-hours-list">
                      {busySlots.map((slot) => (
                        <li key={slot.time} className="busy-hour-item">
                          <span>{slot.time}</span>
                          {slot.spots_remaining !== undefined && service.max_clients > 1 ? (
                            <span className="busy-spots">
                              {slot.booked_count}/{service.max_clients} · ще {slot.spots_remaining}
                            </span>
                          ) : (
                            <span className="busy-label">зайнято</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Вільний час</label>
                  {loadingSlots ? (
                    <p className="loading-text">Завантаження слотів…</p>
                  ) : availableSlots.length === 0 ? (
                    <p className="dashboard-empty">На цю дату немає вільних слотів.</p>
                  ) : (
                    <div
                      className={
                        displayMode === 'tiles'
                          ? 'time-slots time-slots--tiles'
                          : 'time-slots time-slots--timeline'
                      }
                      role="group"
                      aria-label="Вільні часові слоти"
                    >
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          className={`time-slot ${time === slot.time ? 'selected' : ''}`}
                          onClick={() => setTime(slot.time)}
                        >
                          {slot.time}
                          {service.max_clients > 1 && slot.spots_remaining != null && (
                            <small>до {slot.spots_remaining + (slot.booked_count || 0)} місць</small>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                  </>
                )}
              </>
            )}

            <div className="form-group" style={{ marginTop: '2rem' }}>
              <Button
                type="submit"
                variant="primary"
                className="w-100"
                disabled={!date || !time || submitting}
              >
                {submitting ? 'Обробка…' : 'Підтвердити бронювання'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Booking;
