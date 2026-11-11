import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Vraag de browser om de opgeslagen gegevens niet zomaar op te ruimen.
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().catch(() => {});
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
