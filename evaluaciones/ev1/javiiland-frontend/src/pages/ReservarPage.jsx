import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import CalendarioMensual from '../components/CalendarioMensual'
import { reservaService } from '../api/reservaService'
import { extractErrorMessage } from '../api/axiosClient'

function formatFechaLarga(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export default function ReservarPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [selectedDate, setSelectedDate] = useState(searchParams.get('fecha') || '')
  const [eventName, setEventName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedDate) {
      setError('Elige una fecha disponible en el calendario.')
      return
    }

    setSubmitting(true)
    try {
      await reservaService.crear({
        reservationDate: selectedDate,
        eventName,
        description,
      })
      setSuccess('¡Reserva creada! Puedes verla en "Mis reservas".')
      setTimeout(() => navigate('/mis-reservas'), 1200)
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo crear la reserva. Es posible que la fecha ya no esté disponible.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="page__heading">
        <h1>Reservar una fecha</h1>
        <p>Elige un día disponible en el calendario y cuéntanos sobre el evento.</p>
      </div>

      <div className="reservar-layout">
        <CalendarioMensual onSelectDay={setSelectedDate} />

        <form onSubmit={handleSubmit} className="form card">
          <div className="field field--readonly">
            <span>Fecha seleccionada</span>
            <strong>{selectedDate ? formatFechaLarga(selectedDate) : 'Ninguna todavía — elige un día verde en el calendario'}</strong>
          </div>

          <label className="field">
            <span>Nombre del evento</span>
            <input
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Cumpleaños de Camila"
              required
            />
          </label>

          <label className="field">
            <span>Descripción (opcional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Número de invitados, horario, detalles del pastel…"
              rows={4}
            />
          </label>

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <button className="btn btn--primary btn--block" type="submit" disabled={submitting || !selectedDate}>
            {submitting ? 'Reservando…' : 'Confirmar reserva'}
          </button>
        </form>
      </div>
    </div>
  )
}
