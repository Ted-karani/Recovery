import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

try {
  const t = localStorage.getItem('forward_theme')
  if (t) document.documentElement.dataset.theme = t
} catch {}

createRoot(document.getElementById('root')).render(<App />)