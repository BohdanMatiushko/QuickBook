import { Link } from 'react-router-dom';

function Dashboard() {
  return (
    <div className="container">
      <h2 className="page-title">Особистий <span className="text-gradient">Кабінет</span></h2>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3>Ваші майбутні записи</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
          У вас поки немає активних бронювань.
        </p>
        <Link to="/catalog" className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
          Перейти до каталогу
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
