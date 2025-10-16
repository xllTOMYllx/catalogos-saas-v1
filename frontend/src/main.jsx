import React from 'react';
import ReactDOM from 'react-dom/client';
import { Router } from './routes/Router.jsx';  // Importa tu Router
import './index.css';  // Tailwind

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router />  {/* Usa tu Router como raíz */}
  </React.StrictMode>,
);