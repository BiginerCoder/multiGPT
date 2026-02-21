import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import axios from 'axios';
import LoadingSpinner from './components/Loading.tsx';

axios.defaults.withCredentials = true;

function AuthWrapper() {
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('/api/check-auth');

        if (res.data.authenticated) {
          window.location.replace('/multiGPT');
          return;
        }
      } catch {
        console.log('No valid session');
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  if (!authChecked) {
    return <LoadingSpinner fullScreen text="Checking authentication..." />;
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthWrapper />
  </StrictMode>
);
