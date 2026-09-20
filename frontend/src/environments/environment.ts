const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '');

export const environment = {
  production: !isLocalhost,
  // Conectar a backend local si se ejecuta en localhost; en despliegue público usar Render
  apiUrl: isLocalhost
    ? 'http://localhost:3000/api'
    : (typeof window !== 'undefined' && (window as any).__API_URL__) || 'https://literaturaproyect.onrender.com/api',
};
