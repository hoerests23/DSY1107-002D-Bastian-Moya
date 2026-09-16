import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'

export default function Layout() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <p>Javiiland &middot; Espacio para fiestas y eventos infantiles</p>
      </footer>
    </div>
  )
}
