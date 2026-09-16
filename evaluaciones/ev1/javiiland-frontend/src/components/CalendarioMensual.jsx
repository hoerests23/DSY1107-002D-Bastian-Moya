import { useEffect, useMemo, useState } from 'react'
import { reservaService } from '../api/reservaService'
import { extractErrorMessage } from '../api/axiosClient'

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function toIsoDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function startOfMonth(year, month) {
  return new Date(year, month, 1)
}

function endOfMonth(year, month) {
  return new Date(year, month + 1, 0)
}

/**
 * Genera la grilla del mes (incluyendo días del mes anterior/siguiente
 * para completar semanas Lunes-Domingo).
 */
function buildMonthGrid(year, month) {
  const first = startOfMonth(year, month)
  const last = endOfMonth(year, month)

  // getDay(): 0=domingo..6=sábado -> lo convertimos a 0=lunes..6=domingo
  const firstWeekday = (first.getDay() + 6) % 7
  const gridStart = new Date(first)
  gridStart.setDate(first.getDate() - firstWeekday)

  const lastWeekday = (last.getDay() + 6) % 7
  const gridEnd = new Date(last)
  gridEnd.setDate(last.getDate() + (6 - lastWeekday))

  const days = []
  const cursor = new Date(gridStart)
  while (cursor <= gridEnd) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

export default function CalendarioMensual({ onSelectDay, selectable = true }) {
  const today = useMemo(() => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return t
  }, [])

  const [cursorDate, setCursorDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [disponibilidad, setDisponibilidad] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const year = cursorDate.getFullYear()
  const month = cursorDate.getMonth()
  const days = useMemo(() => buildMonthGrid(year, month), [year, month])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    const inicio = toIsoDate(startOfMonth(year, month))
    const fin = toIsoDate(endOfMonth(year, month))

    reservaService
      .calendario(inicio, fin)
      .then((data) => {
        if (!active) return
        const map = {}
        data.forEach((entry) => {
          map[entry.date] = entry.available
        })
        setDisponibilidad(map)
      })
      .catch((err) => {
        if (!active) return
        setError(extractErrorMessage(err, 'No se pudo cargar el calendario.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [year, month])

  function goToPrevMonth() {
    setCursorDate(new Date(year, month - 1, 1))
  }

  function goToNextMonth() {
    setCursorDate(new Date(year, month + 1, 1))
  }

  function goToToday() {
    setCursorDate(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  return (
    <div className="calendario">
      <div className="calendario__header">
        <div className="calendario__title">
          <h2>
            {MESES[month]} <span className="calendario__year">{year}</span>
          </h2>
          <button className="link-button" onClick={goToToday}>
            Ir a hoy
          </button>
        </div>
        <div className="calendario__nav">
          <button className="icon-button" onClick={goToPrevMonth} aria-label="Mes anterior">
            ‹
          </button>
          <button className="icon-button" onClick={goToNextMonth} aria-label="Mes siguiente">
            ›
          </button>
        </div>
      </div>

      <div className="calendario__legend">
        <span className="legend-item">
          <i className="legend-dot legend-dot--free" /> Disponible
        </span>
        <span className="legend-item">
          <i className="legend-dot legend-dot--taken" /> Ocupado
        </span>
        <span className="legend-item">
          <i className="legend-dot legend-dot--past" /> Fecha pasada
        </span>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="calendario__grid calendario__grid--headings">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="calendario__weekday">
            {d}
          </div>
        ))}
      </div>

      <div className={`calendario__grid ${loading ? 'calendario__grid--loading' : ''}`}>
        {days.map((day) => {
          const iso = toIsoDate(day)
          const inCurrentMonth = day.getMonth() === month
          const isPast = day < today
          const isToday = day.getTime() === today.getTime()
          const available = disponibilidad[iso]
          const known = available !== undefined

          let cellState = 'unknown'
          if (isPast) cellState = 'past'
          else if (known) cellState = available ? 'free' : 'taken'

          const clickable = selectable && cellState === 'free' && inCurrentMonth

          return (
            <button
              key={iso}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onSelectDay?.(iso)}
              className={[
                'calendario__day',
                `calendario__day--${cellState}`,
                inCurrentMonth ? '' : 'calendario__day--muted',
                isToday ? 'calendario__day--today' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="calendario__day-number">{day.getDate()}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
