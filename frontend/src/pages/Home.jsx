import { Link } from 'react-router-dom';
import './Home.css';

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
            <Link to="/catalog" className="btn btn-primary btn-lg">Переглянути послуги</Link>
          </div>
        </div>
        <div className="hero-glow"></div>
      </section>
    </div>
  );
}

export default Home;
