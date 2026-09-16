import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { reservaService } from '../api/reservaService'
import { usuarioService } from '../api/usuarioService'
import { extractErrorMessage } from '../api/axiosClient'
import ReservaCard from '../components/ReservaCard'

const FILTROS = [
  { id: 'ALL', label: 'Todas' },
  { id: 'CONFIRMED', label: 'Confirmadas' },
  { id: 'CANCELLED', label: 'Canceladas' },
]

const CREATE_FORM_INICIAL = { usuarioId: '', reservationDate: '', eventName: '', description: '', esBloqueo: false }

export default function AdminDashboardPage() {
  const [reservas, setReservas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('CONFIRMED')

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState(CREATE_FORM_INICIAL)
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)

  const [cancellingId, setCancellingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [reservasData, usuariosData] = await Promise.all([
        reservaService.listar(),
        usuarioService.listar(),
      ])
      setReservas(reservasData)
      setUsuarios(usuariosData)
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudieron cargar las reservas.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const reservasFiltradas = useMemo(() => {
    const filtradas = filtro === 'ALL' ? reservas : reservas.filter((r) => r.status === filtro)
    return [...filtradas].sort((a, b) => b.fechaReserva.localeCompare(a.fechaReserva))
  }, [reservas, filtro])

  async function handleCancelar(id) {
    if (!window.confirm('¿Seguro que quieres cancelar esta reserva? La fecha quedará libre de nuevo.')) return
    setCancellingId(id)
    try {
      await reservaService.cancelar(id)
      await loadData()
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo cancelar la reserva.'))
    } finally {
      setCancellingId(null)
    }
  }

  async function handleEliminarDefinitivo(id, tipo) {
    const mensaje =
      tipo === 'BLOQUEO'
        ? '¿Eliminar este bloqueo definitivamente? No se puede deshacer.'
        : '¿Eliminar esta reserva definitivamente? Se borra del historial y no se puede deshacer. Si solo quieres liberar la fecha, usa "Cancelar" en vez de esto.'
    if (!window.confirm(mensaje)) return
    setDeletingId(id)
    try {
      await reservaService.eliminarDefinitivo(id)
      await loadData()
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo eliminar la reserva.'))
    } finally {
      setDeletingId(null)
    }
  }

  function handleCreateChange(e) {
    const { name, type, value, checked } = e.target
    setCreateForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleCreateSubmit(e) {
    e.preventDefault()
    setCreateError('')

    if (!createForm.esBloqueo && !createForm.usuarioId) {
      setCreateError('Elige a nombre de qué usuario se hace la reserva, o marca "Bloquear día".')
      return
    }

    setCreating(true)
    try {
      await reservaService.crearComoAdmin({
        reservationDate: createForm.reservationDate,
        eventName: createForm.eventName,
        description: createForm.description,
        usuarioId: createForm.esBloqueo ? undefined : Number(createForm.usuarioId),
      })
      setCreateForm(CREATE_FORM_INICIAL)
      setShowCreateForm(false)
      await loadData()
    } catch (err) {
      setCreateError(extractErrorMessage(err, 'No se pudo crear la reserva. Verifica que la fecha esté libre.'))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="page">
      <div className="page__heading page__heading--split">
        <div>
          <h1>Panel de administración</h1>
          <p>Gestiona todas las reservas de Javiiland: crea, edita, cancela o bloquea cualquier fecha.</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowCreateForm((v) => !v)}>
          {showCreateForm ? 'Cerrar' : 'Nueva reserva'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateSubmit} className="form card admin-create-form">
          <h2>Crear reserva o bloquear un día</h2>

          <label className="field field--checkbox">
            <input type="checkbox" name="esBloqueo" checked={createForm.esBloqueo} onChange={handleCreateChange} />
            <span>Bloquear día (sin cliente asociado) — mantención, uso personal, corrección de error, etc.</span>
          </label>

          <div className="form-row">
            {!createForm.esBloqueo && (
              <label className="field">
                <span>Usuario</span>
                <select name="usuarioId" value={createForm.usuarioId} onChange={handleCreateChange} required>
                  <option value="">Selecciona un usuario</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName || u.username} (@{u.username})
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="field">
              <span>Fecha</span>
              <input
                type="date"
                name="reservationDate"
                value={createForm.reservationDate}
                onChange={handleCreateChange}
                required
              />
            </label>
          </div>

          <label className="field">
            <span>{createForm.esBloqueo ? 'Motivo del bloqueo' : 'Nombre del evento'}</span>
            <input
              name="eventName"
              value={createForm.eventName}
              onChange={handleCreateChange}
              placeholder={createForm.esBloqueo ? 'Mantención del local' : ''}
              required
            />
          </label>

          <label className="field">
            <span>Descripción (opcional)</span>
            <textarea name="description" value={createForm.description} onChange={handleCreateChange} rows={3} />
          </label>

          {createError && <p className="form-error">{createError}</p>}

          <button className="btn btn--primary" type="submit" disabled={creating}>
            {creating ? 'Guardando…' : createForm.esBloqueo ? 'Bloquear día' : 'Crear reserva'}
          </button>
        </form>
      )}

      <div className="tabs">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            className={`tab ${filtro === f.id ? 'tab--active' : ''}`}
            onClick={() => setFiltro(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}
      {loading && <p className="muted">Cargando…</p>}

      {!loading && reservasFiltradas.length === 0 && !error && (
        <p className="muted">No hay reservas en esta categoría.</p>
      )}

      <div className="reserva-grid">
        {reservasFiltradas.map((reserva) => (
          <ReservaCard
            key={reserva.id}
            reserva={reserva}
            showUsuario
            footer={
              <>
                <Link to={`/admin/reservas/${reserva.id}/editar`} className="btn btn--ghost btn--small">
                  Editar
                </Link>
                {reserva.status !== 'CANCELLED' && (
                  <button
                    className="btn btn--danger btn--small"
                    onClick={() => handleCancelar(reserva.id)}
                    disabled={cancellingId === reserva.id}
                  >
                    {cancellingId === reserva.id ? 'Cancelando…' : 'Cancelar'}
                  </button>
                )}
                <button
                  className="btn btn--danger btn--small"
                  onClick={() => handleEliminarDefinitivo(reserva.id, reserva.tipo)}
                  disabled={deletingId === reserva.id}
                >
                  {deletingId === reserva.id ? 'Eliminando…' : 'Eliminar'}
                </button>
              </>
            }
          />
        ))}
      </div>
    </div>
  )
}
