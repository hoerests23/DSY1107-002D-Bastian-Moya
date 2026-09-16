function formatFecha(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('es-MX', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ReservaCard({ reserva, footer, showUsuario = false }) {
  const isCancelled = reserva.status === 'CANCELLED'
  const esBloqueo = reserva.tipo === 'BLOQUEO'

  return (
    <article className={`reserva-card ${isCancelled ? 'reserva-card--cancelled' : ''} ${esBloqueo ? 'reserva-card--bloqueo' : ''}`}>
      <div className="reserva-card__ticket-notch" aria-hidden="true" />
      <div className="reserva-card__body">
        <div className="reserva-card__top">
          <span className="reserva-card__date">{formatFecha(reserva.fechaReserva)}</span>
          <span className={`status status--${reserva.status?.toLowerCase()}`}>
            {isCancelled ? 'Cancelada' : 'Confirmada'}
          </span>
        </div>
        {esBloqueo && <span className="badge badge--bloqueo">Bloqueo interno</span>}
        <h3 className="reserva-card__event">{reserva.nombreEvento}</h3>
        {reserva.descripcion && <p className="reserva-card__description">{reserva.descripcion}</p>}
        {showUsuario && !esBloqueo && (
          <p className="reserva-card__owner">
            Reservado por <strong>{reserva.nombreUsuario}</strong>
          </p>
        )}
      </div>
      {footer && <div className="reserva-card__footer">{footer}</div>}
    </article>
  )
}
