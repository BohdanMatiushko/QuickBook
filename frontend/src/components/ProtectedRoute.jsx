import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, specialistOnly = false, clientOnly = false }) {
  const { user, loading, isSpecialist } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container booking-page">
        <p className="loading-text">Завантаження…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (specialistOnly && !isSpecialist) {
    return <Navigate to="/dashboard" replace />;
  }

  if (clientOnly && isSpecialist) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
