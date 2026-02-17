import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import axios from 'axios';
import { useEffect } from 'react';
import { useState } from 'react';
import LoadingSpinner from './components/Loading.tsx'; 

axios.defaults.withCredentials = true;

function AuthWrapper() {
 const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/check-auth");

        if (res.data.authenticated) {
          // 🚀 user never sees landing page
          window.location.replace("http://localhost:3001/multiGPT");
          return;
        }
      } catch (err) {
        console.log("No valid session");
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  // 🔒 BLOCK UI COMPLETELY until auth check finishes
  if (!authChecked) {
    return (
      <LoadingSpinner
        fullScreen
        text="Checking authentication..."
      />
    );
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
