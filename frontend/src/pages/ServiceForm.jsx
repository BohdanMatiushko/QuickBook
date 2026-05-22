import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { ensureCsrf } from '../services/api';
import Button from '../components/Button';
import './ServiceForm.css';

const DURATION_PRESETS = [
  { label: '20 хв', value: '00:20:00' },
  { label: '30 хв', value: '00:30:00' },
  { label: '45 хв', value: '00:45:00' },
  { label: '1 год', value: '01:00:00' },
  { label: '1.5 год', value: '01:30:00' },
];

const WEEKDAYS = [
  { value: 0, label: 'Пн' },
  { value: 1, label: 'Вт' },
  { value: 2, label: 'Ср' },
  { value: 3, label: 'Чт' },
  { value: 4, label: 'Пт' },
  { value: 5, label: 'Сб' },
  { value: 6, label: 'Нд' },
];

const ALL_DAYS = WEEKDAYS.map((d) => d.value);

function ServiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(Boolean(isEdit));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    categoryInput: '',
    description: '',
    price: '',
    duration: '00:30:00',
    max_clients: 1,
    booking_mode: 'duration_slots',
    fixed_times: '09:00, 16:00, 20:00',
    weekdays: [...ALL_DAYS],
  });

  useEffect(() => {
    const loadCats = api.get('/categories/').then((res) => res.data.results || res.data);

    if (!isEdit) {
      loadCats.then(setCategories).catch(() => setError('Не вдалося завантажити категорії.'));
      return;
    }

    Promise.all([api.get(`/services/${id}/`), loadCats])
      .then(([svcRes, cats]) => {
        setCategories(cats);
        const s = svcRes.data;
        setForm({
          name: s.name,
          categoryInput: s.category_name || '',
          description: s.description || '',
          price: s.price,
          duration: s.duration,
          max_clients: s.max_clients,
          booking_mode: s.booking_mode,
          fixed_times: (s.time_slots || []).map((t) => String(t.start_time).slice(0, 5)).join(', '),
          weekdays: s.available_weekdays?.length ? s.available_weekdays : [...ALL_DAYS],
        });
      })
      .catch(() => setError('Не вдалося завантажити послугу.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleWeekday = (day) => {
    setForm((f) => {
      const has = f.weekdays.includes(day);
      const weekdays = has ? f.weekdays.filter((d) => d !== day) : [...f.weekdays, day].sort();
      return { ...f, weekdays };
    });
  };

  const resolveCategoryPayload = () => {
    const name = form.categoryInput.trim();
    if (!name) return null;
    const match = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (match) return { category: match.id };
    return { category_name: name };
  };

  const buildPayload = () => {
    const cat = resolveCategoryPayload();
    const time_slots =
      form.booking_mode === 'fixed_slots'
        ? form.fixed_times
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
            .map((t) => ({ start_time: t.length === 5 ? `${t}:00` : t }))
        : [];

    return {
      ...cat,
      name: form.name,
      description: form.description,
      price: form.price,
      duration: form.duration,
      max_clients: Number(form.max_clients),
      booking_mode: form.booking_mode,
      available_weekdays: form.weekdays,
      is_active: true,
      time_slots,
    };
  };

  const formatApiError = (err) => {
    if (!err.response) {
      return 'Сервер недоступний. Перевірте, чи запущений backend (docker compose up).';
    }
    const data = err.response.data;
    if (typeof data === 'object' && data !== null) {
      return Object.entries(data)
        .flatMap(([, val]) => (Array.isArray(val) ? val : [String(val)]))
        .join(' ');
    }
    return 'Помилка збереження.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.categoryInput.trim()) {
      setError('Вкажіть категорію.');
      return;
    }
    if (form.weekdays.length === 0) {
      setError('Оберіть хоча б один день для запису.');
      return;
    }
    if (form.booking_mode === 'fixed_slots' && !form.fixed_times.trim()) {
      setError('Вкажіть години через кому (наприклад 09:00, 16:00).');
      return;
    }

    const payload = buildPayload();
    setSubmitting(true);
    try {
      await ensureCsrf();
      if (isEdit) {
        await api.patch(`/services/${id}/`, payload);
      } else {
        await api.post('/services/', payload);
      }
      navigate('/my-services', { replace: true });
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container service-form-page">
        <p className="loading-text">Завантаження…</p>
      </div>
    );
  }

  return (
    <div className="container service-form-page">
      <div className="glass-panel service-form-card">
        <h2 className="page-title">
          {isEdit ? 'Редагувати' : 'Створити'}{' '}
          <span className="text-gradient">послугу</span>
        </h2>

        {error && <div className="auth-message auth-message--error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="svc-name">Назва</label>
            <input
              id="svc-name"
              className="form-control"
              required
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="svc-category">Категорія</label>
            <input
              id="svc-category"
              className="form-control"
              list="category-suggestions"
              required
              placeholder="Оберіть зі списку або введіть свою"
              value={form.categoryInput}
              onChange={(e) => update('categoryInput', e.target.value)}
            />
            <datalist id="category-suggestions">
              {categories.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
            <small className="form-hint">Загальні категорії або ваша власна назва</small>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="svc-desc">Опис</label>
            <textarea
              id="svc-desc"
              className="form-control"
              rows={3}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="svc-price">Ціна (грн)</label>
              <input
                id="svc-price"
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                required
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="svc-duration">Тривалість візиту</label>
              <select
                id="svc-duration"
                className="form-control"
                value={form.duration}
                onChange={(e) => update('duration', e.target.value)}
              >
                {DURATION_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="svc-booking-mode">Тип запису</label>
            <select
              id="svc-booking-mode"
              className="form-control"
              value={form.booking_mode}
              onChange={(e) => update('booking_mode', e.target.value)}
            >
              <option value="fixed_slots">Фіксовані години (плитки, напр. 09:00, 16:00)</option>
              <option value="duration_slots">Вільний вибір часу за тривалістю (стрічка)</option>
            </select>
            <small className="form-hint">
              {form.booking_mode === 'fixed_slots'
                ? 'Клієнт обирає з ваших годин — відображення плитками.'
                : 'Клієнт обирає слот за тривалістю послуги — відображення стрічкою.'}
            </small>
          </div>

          {form.booking_mode === 'fixed_slots' && (
            <div className="form-group">
              <label className="form-label" htmlFor="svc-times">Години (через кому)</label>
              <input
                id="svc-times"
                className="form-control"
                required
                placeholder="09:00, 16:00, 20:00"
                value={form.fixed_times}
                onChange={(e) => update('fixed_times', e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="svc-max">Макс. клієнтів на один слот</label>
            <input
              id="svc-max"
              type="number"
              min="1"
              className="form-control"
              value={form.max_clients}
              onChange={(e) => update('max_clients', e.target.value)}
            />
          </div>

          <div className="form-group">
            <span className="form-label">Дні, коли можна записатися</span>
            <div className="weekday-picker">
              {WEEKDAYS.map((d) => (
                <label key={d.value} className="weekday-chip">
                  <input
                    type="checkbox"
                    checked={form.weekdays.includes(d.value)}
                    onChange={() => toggleWeekday(d.value)}
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-100" disabled={submitting}>
            {submitting ? 'Збереження…' : isEdit ? 'Зберегти' : 'Створити послугу'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ServiceForm;
