import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './context/ThemeContext'
import { EmotionProvider } from './context/EmotionContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <EmotionProvider>
        <App />
      </EmotionProvider>
    </ThemeProvider>
  </StrictMode>
)