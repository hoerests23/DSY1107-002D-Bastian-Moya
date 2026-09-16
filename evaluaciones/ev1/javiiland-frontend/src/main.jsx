import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { MsalAuthProvider } from './context/AuthProvider'
import { AuthProvider } from './context/AuthContext'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <MsalAuthProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MsalAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
