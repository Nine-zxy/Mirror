import React from 'react'
import ReactDOM from 'react-dom/client'
import { SyncProvider } from './sync/SyncContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SyncProvider>
      <App />
    </SyncProvider>
  </React.StrictMode>
)
