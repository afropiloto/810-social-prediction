import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {PrivyProvider} from '@privy-io/react-auth';
import App from './App.tsx';
import './index.css';

window.onerror = function(message) {
  if (typeof message === 'string' && message.includes('Cannot redefine property: ethereum')) {
    return true;
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID || ''}
      config={{
        loginMethods: ['email', 'sms', 'wallet'],
        appearance: {theme: 'dark'},
      }}
    >
      <App />
    </PrivyProvider>
  </StrictMode>,
);
