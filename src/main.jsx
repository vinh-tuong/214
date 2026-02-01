import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import CharacterPage from './pages/CharacterPage.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/character" element={<CharacterPage />} />
        <Route path="/character/:character" element={<CharacterPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
