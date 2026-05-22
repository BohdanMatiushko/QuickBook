import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/Button';
import { formatPrice, formatDuration } from '../utils/format';
import './Booking.css';

const TIME_SLOTS = ['10:00', '11:30', '14:00', '16:00'];

const DEMO_BY_ID = {
  1: { id: 1, name: 'Консультація терапевта', price: '500.00', duration: '00:30:00', category_name: 'Медицина', description: 'Первинна консультація з терапевтом.' },
  2: { id: 2, name: 'Масаж спини', price: '800.00', duration: '01:00:00', category_name: 'SPA', description: 'Релаксуючий масаж спини.' },
  3: { id: 3, name: 'Стрижка чоловіча', price: '400.00', duration: '00:45:00', category_name: 'Барбершоп', description: 'Класична стрижка та укладка.' },
};

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/services/${id}/`)
      .then((res) => {
        setService(res.data);
        setLoading(false);
      })
      .catch(() => {
        setService(DEMO_BY_ID[id] || { id, name: `Послуга #${id}`, price: '0', duration: '00:30:00' });
        setLoading(false);
      });
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/appointments/', {
        service: Number(id),
        date,
        start_time: `${time}:00`,
        status: 'scheduled',
      });
    } catch (err) {
      console.warn('Appointment API unavailable (MVP demo)', err);
    }
    setSubmitting(false);
    navigate('/dashboard', {
      state: {
        newBooking: {
          service_name: service?.name,
          date,
          start_time: time,
        },
      },
    });
  };

  const minDate = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="container booking-page">
        <p className="loading-text">Завантаження…</p>
      </div>
    );
  }

  return (
    <div className="container booking-page">
      <div className="booking-layout">
        <aside className="service-details glass-panel">
          <span className="service-details-category">{service.category_name}</span>
          <h2>{service.name}</h2>
          {service.description && (
            <p className="service-details-desc">{service.description}</p>
          )}
          <div className="service-details-meta">
            <span>{formatPrice(service.price)}</span>
            <span>{formatDuration(service.duration)}</span>
          </div>
        </aside>

        <div className="glass-panel booking-form-container">
          <h2 className="page-title booking-form-title">
            Оберіть <span className="text-gradient">дату та час</span>
          </h2>

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

            <div className="form-group">
              <label className="form-label" htmlFor="booking-time">Часовий слот</label>
              <div className="time-slots" role="group" aria-label="Доступні часові слоти">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`time-slot ${time === slot ? 'selected' : ''}`}
                    onClick={() => setTime(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              <input type="hidden" required value={time} />
            </div>

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
