import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState('client');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    const form = e.target;
    const password = form.password.value;
    const confirm = form.confirmPassword.value;

    if (password !== confirm) {
      setError('Паролі не збігаються.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        username: form.username.value,
        email: form.email.value,
        password,
        phone_number: form.phone.value || '',
        first_name: form.firstName?.value || '',
        last_name: form.lastName?.value || '',
        role,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (!err.response) {
        setError('Сервер недоступний. Запустіть backend (docker compose up) і спробуйте знову.');
        return;
      }
      const data = err.response?.data;
      if (typeof data === 'object' && data !== null) {
        const messages = Object.entries(data).flatMap(([, val]) =>
          Array.isArray(val) ? val : [String(val)]
        );
        setError(messages[0] || 'Не вдалося зареєструватися.');
      } else {
        setError('Не вдалося зареєструватися. Спробуйте ще раз.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container booking-page">
      <div className="glass-panel auth-card">
        <h2 className="page-title">
          <span className="text-gradient">Реєстрація</span>
        </h2>

        {error && <div className="auth-message auth-message--error">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Тип акаунту</label>
            <div className="role-toggle">
              <button
                type="button"
                className={role === 'client' ? 'role-btn active' : 'role-btn'}
                onClick={() => setRole('client')}
              >
                Клієнт
              </button>
              <button
                type="button"
                className={role === 'specialist' ? 'role-btn active' : 'role-btn'}
                onClick={() => setRole('specialist')}
              >
                Фахівець
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">Ім&apos;я користувача</label>
            <input
              id="reg-username"
              name="username"
              type="text"
              className="form-control"
              required
              placeholder="ivan_petrenko"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className="form-control"
              required
              placeholder="name@example.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-phone">Телефон</label>
            <input
              id="reg-phone"
              name="phone"
              type="tel"
              className="form-control"
              placeholder="+380..."
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Пароль</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              className="form-control"
              required
              minLength={8}
              placeholder="Мінімум 8 символів"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Підтвердження пароля</label>
            <input
              id="reg-confirm"
              name="confirmPassword"
              type="password"
              className="form-control"
              required
              minLength={8}
              placeholder="Повторіть пароль"
            />
          </div>
          <Button type="submit" variant="primary" className="w-100" disabled={submitting}>
            {submitting ? 'Реєстрація…' : 'Зареєструватися'}
          </Button>
        </form>

        <p className="auth-back">
          <Link to="/login" className="auth-link">
            Вже маєте акаунт? Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
