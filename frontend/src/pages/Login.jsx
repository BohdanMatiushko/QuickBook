import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const justRegistered = location.state?.registered;
  const from = location.state?.from || '/dashboard';
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const form = e.target;
    try {
      await login(form.email.value, form.password.value);
      navigate(from, { replace: true });
    } catch (err) {
      if (!err.response) {
        setError('Сервер недоступний. Запустіть backend і спробуйте знову.');
        return;
      }
      const msg = err.response?.data;
      if (typeof msg === 'object' && msg.non_field_errors) {
        setError(msg.non_field_errors[0]);
      } else if (msg?.detail) {
        setError(msg.detail);
      } else {
        setError('Невірний email або пароль.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container booking-page">
      <div className="glass-panel auth-card">
        <h2 className="page-title">Вхід в <span className="text-gradient">Систему</span></h2>

        {justRegistered && (
          <div className="auth-message auth-message--success">
            Реєстрацію завершено. Увійдіть, використовуючи email і пароль.
          </div>
        )}

        {error && <div className="auth-message auth-message--error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              className="form-control"
              required
              placeholder="name@example.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Пароль</label>
            <input
              id="login-password"
              name="password"
              type="password"
              className="form-control"
              required
              placeholder="••••••••"
            />
            <div className="auth-forgot">
              <Link to="/forgot-password" className="auth-link">
                Відновити пароль
              </Link>
            </div>
          </div>
          <Button type="submit" variant="primary" className="w-100" disabled={submitting}>
            {submitting ? 'Вхід…' : 'Увійти'}
          </Button>
        </form>

        <div className="auth-divider">або</div>

        <p className="auth-footer-text">Ще немає облікового запису?</p>
        <Link to="/register" className="btn btn-secondary w-100">
          Зареєструватися
        </Link>
      </div>
    </div>
  );
}

export default Login;
