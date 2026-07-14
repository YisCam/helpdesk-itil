import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1E3A5F',
          color: '#fff',
          fontSize: '14px',
          borderRadius: '12px',
          padding: '12px 16px',
        },
      }}
    />
  </StrictMode>,
)