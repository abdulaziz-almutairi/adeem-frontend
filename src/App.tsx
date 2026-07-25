import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/layout/Navbar';
import ChatToasts from './components/notifications/ChatToasts';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/chat/ChatPage';
import AppointmentChatPage from './pages/chat/AppointmentChatPage';
import BookingPage from './pages/booking/BookingPage';
import PaymentPage from './pages/payment/PaymentPage';
import VideoCallPage from './pages/video/VideoCallPage';
import DoctorDashboard from './pages/dashboard/DoctorDashboard';
import PatientDashboard from './pages/dashboard/PatientDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import { dashboardPathForRole } from './utils/roles';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: string }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return <>{children}</>;
};

function AppRoutes() {
  const { user } = useAuth();
  const isVideoPage = window.location.pathname.includes('video-call');

  return (
    <>
      {!isVideoPage && <Navbar />}
      <ChatToasts />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={user ? <Navigate to={dashboardPathForRole(user.role)} /> : <LoginPage />}
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/booking" element={<ProtectedRoute role="PATIENT"><BookingPage /></ProtectedRoute>} />
        <Route path="/ai-chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/chat/:appointmentId" element={<ProtectedRoute><AppointmentChatPage /></ProtectedRoute>} />
        <Route path="/payment/:appointmentId" element={<ProtectedRoute role="PATIENT"><PaymentPage /></ProtectedRoute>} />
        <Route path="/video-call/:id" element={<ProtectedRoute><VideoCallPage /></ProtectedRoute>} />
        <Route path="/doctor/dashboard" element={<ProtectedRoute role="DOCTOR"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/patient/dashboard" element={<ProtectedRoute role="PATIENT"><PatientDashboard /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;