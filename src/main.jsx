import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppThemeProvider } from './theme/AppThemeProvider.jsx';
import App from './App.jsx';
import './index.scss';
import { Provider } from 'react-redux';
import { store } from './store/store.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppThemeProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </AppThemeProvider>
  </StrictMode>,
);
