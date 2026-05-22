import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Booking.css';

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleBooking = (e) => {
    e.preventDefault();
    // В реальному житті тут буде POST запит через api.js
    alert(`Бронювання успішне! Послуга: ${id}, Дата: ${date}, Час: ${time}`);
    navigate('/dashboard');
  };

  return (
    <div className="container booking-page">
      <div className="glass-panel booking-form-container">
        <h2 className="page-title">Оформлення <span className="text-gradient">Бронювання</span></h2>
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-muted)' }}>
          Оберіть зручний час для візиту
        </p>
        
        <form onSubmit={handleBooking}>
          <div className="form-group">
            <label className="form-label">Оберіть дату</label>
            <input 
              type="date" 
              className="form-control" 
              required 
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Оберіть час</label>
            <select 
              className="form-control" 
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
            >
              <option value="" disabled>Оберіть вільний слот</option>
              <option value="10:00">10:00</option>
              <option value="11:30">11:30</option>
              <option value="14:00">14:00</option>
              <option value="16:00">16:00</option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary w-100">Підтвердити бронювання</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Booking;
