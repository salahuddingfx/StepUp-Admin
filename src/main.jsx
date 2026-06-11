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
          position="top-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#fff',
              fontSize: '11px',
              borderRadius: '8px'
            }
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
