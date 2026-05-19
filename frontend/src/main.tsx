'use client';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Wake up the backend on Render free tier (avoids cold start for the first real request)
const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/api\/?$/, '');
if (BACKEND_URL) {
  fetch(`${BACKEND_URL}/health`, { method: 'GET' }).catch(() => {/* ignore */});
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
