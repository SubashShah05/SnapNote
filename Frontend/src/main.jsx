import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import './index.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#16161f',
            color: '#fff',
            border: '1px solid #1e1e2e'
          }
        }} />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);