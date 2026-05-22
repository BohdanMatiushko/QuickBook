import { Link } from 'react-router-dom';
import './Home.css';

const FEATURES = [
  {
    icon: '⚡',
    title: 'Миттєве бронювання',
    text: 'Оберіть послугу, дату та час — підтвердження за кілька секунд.',
  },
  {
    icon: '📅',
    title: 'Зручний календар',
    text: 'Бачите лише вільні слоти та керуєте записами в одному кабінеті.',
  },
  {
    icon: '✨',
    title: 'Преміальний досвід',
    text: 'Сучасний інтерфейс без зайвого шуму — фокус на вашому часі.',
  },
];

function Home() {
  return (
    <div className="home-container">
      <section className="hero">
        <div className="container hero-content">
          <h1 className="hero-title">
            Бронюй послуги <br/>
            <span className="text-gradient">Швидко та Зручно</span>
          </h1>
          <p className="hero-subtitle">
            Преміальний сервіс для керування вашим часом. Знайдіть найкращих фахівців та забронюйте візит в один клік.
          </p>
          <div className="hero-actions">
            <Link to="/catalog" className="btn btn-primary btn-lg">Записатися зараз</Link>
            <Link to="/catalog" className="btn btn-secondary btn-lg">Переглянути послуги</Link>
          </div>
        </div>
        <div className="hero-glow" aria-hidden="true" />
      </section>

      <section className="features container">
        <h2 className="features-title">
          Чому <span className="text-gradient">QuickBook</span>
        </h2>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <article key={f.title} className="feature-card glass-panel">
              <span className="feature-icon" aria-hidden="true">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
