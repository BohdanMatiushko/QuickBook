import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import './Auth.css';

function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // MVP: лист із посиланням — після підключення email/API на бекенді
    setSent(true);
  };

  return (
    <div className="container booking-page">
      <div className="glass-panel auth-card">
        <h2 className="page-title">
          <span className="text-gradient">Відновлення</span> пароля
        </h2>

        {sent ? (
          <>
            <div className="auth-message auth-message--success">
              Якщо обліковий запис з адресою <strong>{email}</strong> існує, ми надіслали
              інструкції для скидання пароля на пошту.
            </div>
            <Link to="/login" className="btn btn-primary w-100">
              Повернутися до входу
            </Link>
          </>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Введіть email, який ви використовували при реєстрації. Ми надішлемо посилання
              для створення нового пароля.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Email</label>
                <input
                  id="forgot-email"
                  type="email"
                  className="form-control"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
              <Button type="submit" variant="primary" className="w-100">
                Надіслати посилання
              </Button>
            </form>
            <p className="auth-back">
              <Link to="/login" className="auth-link">
                ← Повернутися до входу
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
