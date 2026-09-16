import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { reservaService } from '../api/reservaService'
import { extractErrorMessage } from '../api/axiosClient'

export default function EditarReservaPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    reservaService
      .buscarPorId(id)
      .then((reserva) => {
        if (!active) return
        setForm({
          reservationDate: reserva.fechaReserva,
          eventName: reserva.nombreEvento,
          description: reserva.descripcion || '',
          status: reserva.status,
        })
      })
      .catch((err) => {
        if (active) setError(extractErrorMessage(err, 'No se pudo cargar la reserva.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await reservaService.actualizar(id, form)
      navigate('/admin')
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo actualizar la reserva.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="page page--narrow"><p className="muted">Cargando…</p></div>
  if (error && !form) return <div className="page page--narrow"><p className="form-error">{error}</p></div>

  return (
    <div className="page page--narrow">
      <div className="card">
        <h1>Editar reserva #{id}</h1>

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Fecha</span>
            <input
              type="date"
              name="reservationDate"
              value={form.reservationDate}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Nombre del evento</span>
            <input name="eventName" value={form.eventName} onChange={handleChange} required />
          </label>

          <label className="field">
            <span>Descripción</span>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} />
          </label>

          <label className="field">
            <span>Estado</span>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="CONFIRMED">Confirmada</option>
              <option value="CANCELLED">Cancelada</option>
            </select>
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => navigate('/admin')}>
              Volver
            </button>
            <button className="btn btn--primary" type="submit" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
