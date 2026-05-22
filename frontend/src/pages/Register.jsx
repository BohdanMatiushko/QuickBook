import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import './Auth.css';

function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    const form = e.target;
    const password = form.password.value;
    const confirm = form.confirmPassword.value;

    if (password !== confirm) {
      setError('Паролі не збігаються.');
      return;
    }

    // MVP: підключення API реєстрації — наступний етап
    navigate('/login', { state: { registered: true } });
  };

  return (
    <div className="container booking-page">
      <div className="glass-panel auth-card">
        <h2 className="page-title">
          <span className="text-gradient">Реєстрація</span>
        </h2>

        {error && <div className="auth-message auth-message--info">{error}</div>}

        <form onSubmit={handleRegister}>
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
          <Button type="submit" variant="primary" className="w-100">
            Зареєструватися
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
