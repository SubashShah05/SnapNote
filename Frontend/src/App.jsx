import React from 'react';
import { Route, Routes } from 'react-router-dom';

// Pages
import LandingPage    from './pages/LandingPage';
import Login          from './pages/Login';
import Register       from './pages/Register';
import DashboardPage  from './pages/DashboardPage';
import SettingsPage   from './pages/SettingsPage';
import AdminDashboard from './pages/AdminDashboard';

// Auth
import ProtectedRoute    from './components/ProtectedRoute';
import { AuthProvider }  from './context/AuthContext';
import { NoteProvider }  from './context/NoteContext';
import { TaskProvider }  from './context/TaskContext';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NoteProvider>
          <TaskProvider>
            <Routes>
              {/* Public landing page */}
              <Route path="/" element={<LandingPage />} />

              {/* Auth pages */}
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected dashboard — full-screen, owns its own header/sidebar */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Legacy /create → redirect to dashboard */}
              <Route path="/create" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            </Routes>
          </TaskProvider>
        </NoteProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;