import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Supports weights 100-900
import '@fontsource-variable/inter';

import './index.css'
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
