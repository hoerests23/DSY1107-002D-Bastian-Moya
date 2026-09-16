import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { reservaService } from '../api/reservaService'
import { extractErrorMessage } from '../api/axiosClient'
import { useAuth } from '../context/AuthContext'
import ReservaCard from '../components/ReservaCard'

export default function MisReservasPage() {
  const { usuario } = useAuth()
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    reservaService
      .listarPorUsuario(usuario.id)
      .then((data) => {
        if (active) setReservas(data)
      })
      .catch((err) => {
        if (active) setError(extractErrorMessage(err, 'No se pudieron cargar tus reservas.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [usuario.id])

  const ordenadas = [...reservas].sort((a, b) => a.fechaReserva.localeCompare(b.fechaReserva))

  return (
    <div className="page">
      <div className="page__heading">
        <h1>Mis reservas</h1>
        <p>Estas son las fechas que has apartado en Javiiland.</p>
      </div>

      {error && <p className="form-error">{error}</p>}
      {loading && <p className="muted">Cargando…</p>}

      {!loading && ordenadas.length === 0 && !error && (
        <div className="empty-state">
          <p>Todavía no tienes reservas.</p>
          <Link to="/reservar" className="btn btn--primary">
            Reservar una fecha
          </Link>
        </div>
      )}

      <div className="reserva-grid">
        {ordenadas.map((reserva) => (
          <ReservaCard key={reserva.id} reserva={reserva} />
        ))}
      </div>

      <p className="muted note">
        ¿Necesitas cambiar o cancelar una reserva? Pide a un administrador que la modifique desde el panel de admin.
      </p>
    </div>
  )
}
