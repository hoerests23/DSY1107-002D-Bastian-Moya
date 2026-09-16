import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../context/msalConfig'; // Ajusta la ruta a tu msalConfig
import { apiGet } from '../api/apiClient';            // Ajusta la ruta a tu apiClient

export default function TestPage() {
  const { instance, accounts } = useMsal();
  const [apiResult, setApiResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Usuario activo en MSAL
  const activeAccount = accounts[0];

  // 1. Iniciar sesión con Microsoft Entra ID
  const handleMicrosoftLogin = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (err) {
      console.error('Error al iniciar sesión con Microsoft:', err);
    }
  };

  // 2. Cerrar sesión
  const handleMicrosoftLogout = () => {
    instance.logoutPopup();
  };

  // 3. Probar obtención de token y llamada API
  const handleTestApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: activeAccount,
      });

      const token = response.accessToken;
      console.log('Access Token obtenido:', token);

      const data = await apiGet('/api/usuarios', token);
      setApiResult(data);
    } catch (err) {
      console.error('Error en prueba API:', err);
      setError(err.message || 'Error al conectar con la API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Página de Prueba - Microsoft Entra ID</h2>

      <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Estado de Usuario (MSAL)</h3>
        {activeAccount ? (
          <div>
            <p><strong>Usuario:</strong> {activeAccount.name || activeAccount.username}</p>
            <p><strong>Email/Cuenta:</strong> {activeAccount.username}</p>
            <button onClick={handleMicrosoftLogout}>Cerrar sesión de Microsoft</button>
          </div>
        ) : (
          <div>
            <p>No hay sesión de Microsoft activa.</p>
            <button onClick={handleMicrosoftLogin}>Iniciar sesión con Microsoft</button>
          </div>
        )}
      </div>

      <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Prueba de Petición HTTP Protegida</h3>
        <button onClick={handleTestApi} disabled={!activeAccount || loading}>
          {loading ? 'Cargando...' : 'Obtener Token y Probar API (/api/demo)'}
        </button>

        {apiResult && (
          <div style={{ marginTop: '1rem', background: '#f0f0f0', padding: '1rem', borderRadius: '4px' }}>
            <h4>Respuesta del Backend:</h4>
            <pre>{JSON.stringify(apiResult, null, 2)}</pre>
          </div>
        )}

        {error && (
          <p style={{ color: 'red', marginTop: '1rem' }}>
            <strong>Detalle:</strong> {error}
          </p>
        )}
      </div>
    </div>
  );
}