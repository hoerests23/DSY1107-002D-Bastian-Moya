import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { extractErrorMessage } from '../api/axiosClient'

const INITIAL_FORM = { username: '', email: '', fullName: '', password: '', confirmPassword: '' }

export default function RegistroPage() {
  const { registrar } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(INITIAL_FORM)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setSubmitting(true)
    try {
      const { confirmPassword, ...registroUsuarioDto } = form
      await registrar(registroUsuarioDto)
      navigate('/', { replace: true })
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo crear la cuenta.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page page--narrow">
      <div className="auth-card">
        <h1>Crear cuenta</h1>
        <p className="auth-card__subtitle">
          Regístrate para poder reservar fechas en el calendario de Javiiland.
        </p>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Nombre completo</span>
            <input name="fullName" value={form.fullName} onChange={handleChange} autoComplete="name" />
          </label>

          <label className="field">
            <span>Usuario</span>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              minLength={4}
              maxLength={50}
              required
            />
            <small>Entre 4 y 50 caracteres.</small>
          </label>

          <label className="field">
            <span>Correo electrónico</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>

          <label className="field">
            <span>Contraseña</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={6}
              required
            />
            <small>Mínimo 6 caracteres.</small>
          </label>

          <label className="field">
            <span>Confirmar contraseña</span>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>

          <button className="btn btn--primary btn--block" type="submit" disabled={submitting}>
            {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-card__footer">
          ¿Ya tienes cuenta? <Link to="/ingresar">Ingresa aquí</Link>
        </p>
      </div>
    </div>
  )
}
