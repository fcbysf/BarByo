// Disable React DevTools globally to prevent extension-related lag and errors
if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
    for (const [key, value] of Object.entries(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)) {
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] = typeof value === 'function' ? () => { } : null;
    }
}

import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initGA } from './services/analytics'

// Initialize Google Analytics
initGA();

createRoot(document.getElementById('root')).render(
    <App />
)
