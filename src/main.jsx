import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import store from './store';
import App from './App';
import './index.css';
import { initDynamicFavicon } from './utils/favicon';

// Initialize custom tab icon logo
initDynamicFavicon();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-center"
          gutter={12}
          containerClassName=""
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1E293B',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '14px',
              padding: '14px 20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
              maxWidth: '420px'
            },
            success: {
              style: {
                background: '#0B3B24',
                borderLeft: '3px solid #10B981',
                boxShadow: '0 8px 32px rgba(16,185,129,0.15), 0 0 0 1px rgba(16,185,129,0.1)'
              },
              iconTheme: { primary: '#10B981', secondary: '#0B3B24' }
            },
            error: {
              style: {
                background: '#3B0B0B',
                borderLeft: '3px solid #EF4444',
                boxShadow: '0 8px 32px rgba(239,68,68,0.15), 0 0 0 1px rgba(239,68,68,0.1)'
              },
              iconTheme: { primary: '#EF4444', secondary: '#3B0B0B' }
            },
            loading: {
              style: {
                background: '#1E293B',
                borderLeft: '3px solid #3B82F6'
              }
            }
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
