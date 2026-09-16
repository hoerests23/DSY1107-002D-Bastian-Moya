/// <reference types="vite/client" />

import type { Configuration, RedirectRequest } from '@azure/msal-browser';

// Aseguramos que siempre sean strings (si vienen undefined, usan string vacío)
const clientId = import.meta.env.VITE_AZURE_CLIENT_ID as string;
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID as string;
const apiScope = import.meta.env.VITE_AZURE_SCOPES as string;

console.log('clientId:', clientId, 'tenantId:', tenantId, 'apiScope:', apiScope);

export const msalConfig: Configuration = {
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
};

export const loginRequest: RedirectRequest = {
  scopes: ['openid', 'profile', apiScope].filter(Boolean), // Evita scopes vacíos
};

export const apiScopes = [apiScope];