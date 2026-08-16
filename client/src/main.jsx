import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { StoreProvider } from './store/StoreProvider'
import App from './App.jsx'

// The service is injected here at the composition root. Swap HttpRecordService
// for a fake in a test harness and nothing below changes.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
)
