import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Specialists from './pages/Specialists';
import SpecialistDetail from './pages/SpecialistDetail';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import MyServices from './pages/MyServices';
import ServiceForm from './pages/ServiceForm';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main className="page-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/specialists" element={<Specialists />} />
          <Route path="/specialists/:id" element={<SpecialistDetail />} />
          <Route path="/catalog" element={<Navigate to="/specialists" replace />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/my-services"
            element={
              <ProtectedRoute specialistOnly>
                <MyServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-services/new"
            element={
              <ProtectedRoute specialistOnly>
                <ServiceForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-services/:id/edit"
            element={
              <ProtectedRoute specialistOnly>
                <ServiceForm />
              </ProtectedRoute>
            }
          />
          <Route path="/my-services/create" element={<Navigate to="/my-services/new" replace />} />
        </Routes>
      </main>
      <Footer />
    </AuthProvider>
  );
}

export default App;
