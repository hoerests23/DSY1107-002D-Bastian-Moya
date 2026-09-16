import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="page page--narrow page--center">
      <h1>Página no encontrada</h1>
      <p>El enlace que seguiste no existe o se movió.</p>
      <Link to="/" className="btn btn--primary">
        Volver al calendario
      </Link>
    </div>
  )
}
