import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import './Auth.css';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = location.state?.registered;

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
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

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
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
          <Button type="submit" variant="primary" className="w-100">
            Увійти
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
