// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './msalConfig';

export const msalInstance = new PublicClientApplication(msalConfig);

msalInstance.addEventCallback((event) => {
  if (
    (event.eventType === EventType.LOGIN_SUCCESS ||
      event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) &&
    event.payload?.account
  ) {
    msalInstance.setActiveAccount(event.payload.account);
  }
});

export function MsalAuthProvider({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const hasRun = useRef(false);

useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    msalInstance
      .initialize()
      .then(async () => {
        try {
          // Si falla por problemas de caché de redirección, lo atrapamos aquí para no congelar la app
          const response = await msalInstance.handleRedirectPromise();
          if (response?.account) {
            msalInstance.setActiveAccount(response.account);
            navigate('/', { replace: true });
            return;
          }
        } catch (redirectError) {
          console.warn('Advertencia en handleRedirectPromise ignorada:', redirectError);
        }

        // Revisar cuentas existentes en caché
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          msalInstance.setActiveAccount(accounts[0]);
        }
      })
      .catch((err) => {
        console.error('Error crítico al inicializar MSAL:', err);
      })
      .finally(() => {
        // Esto garantiza que la pantalla NUNCA se quede en blanco, pase lo que pase
        setIsInitialized(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  if (!isInitialized) {
    return null;
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}