import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Імітація логіну
    navigate('/dashboard');
  };

  return (
    <div className="container booking-page">
      <div className="glass-panel booking-form-container">
        <h2 className="page-title">Вхід в <span className="text-gradient">Систему</span></h2>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" required placeholder="name@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input type="password" className="form-control" required placeholder="••••••••" />
          </div>
          <div className="form-group" style={{ marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary w-100">Увійти</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
