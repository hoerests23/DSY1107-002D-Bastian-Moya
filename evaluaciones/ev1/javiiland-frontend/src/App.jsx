import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegistroPage from './pages/RegistroPage'
import ReservarPage from './pages/ReservarPage'
import MisReservasPage from './pages/MisReservasPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import EditarReservaPage from './pages/EditarReservaPage'
import NotFoundPage from './pages/NotFoundPage'
import TestPage from './pages/TestPage'

export default function App() {
  return (
    <Routes>
      <Route path="/test" element={<TestPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/ingresar" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />

        <Route
          path="/reservar"
          element={
            <ProtectedRoute>
              <ReservarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-reservas"
          element={
            <ProtectedRoute>
              <MisReservasPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reservas/:id/editar"
          element={
            <ProtectedRoute requireAdmin>
              <EditarReservaPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
