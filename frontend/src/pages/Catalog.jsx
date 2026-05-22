import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Catalog.css';

function Catalog() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Демо-дані на випадок, якщо бекенд недоступний
    const demoServices = [
      { id: 1, name: 'Консультація терапевта', price: '500.00', duration: '00:30:00', category_name: 'Медицина' },
      { id: 2, name: 'Масаж спини', price: '800.00', duration: '01:00:00', category_name: 'SPA' },
      { id: 3, name: 'Стрижка чоловіча', price: '400.00', duration: '00:45:00', category_name: 'Барбершоп' },
    ];

    api.get('/services/')
      .then(res => {
        setServices(res.data.results || res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("API error, using demo data", err);
        setServices(demoServices);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container"><p>Завантаження...</p></div>;

  return (
    <div className="container catalog-page">
      <h2 className="page-title">Наші <span className="text-gradient">Послуги</span></h2>
      <div className="services-grid">
        {services.map(service => (
          <div key={service.id} className="service-card glass-panel">
            <div className="service-category">{service.category_name}</div>
            <h3 className="service-name">{service.name}</h3>
            <div className="service-meta">
              <span className="price">{service.price} грн</span>
              <span className="duration">{service.duration}</span>
            </div>
            <Link to={`/booking/${service.id}`} className="btn btn-primary w-100">
              Забронювати
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Catalog;
