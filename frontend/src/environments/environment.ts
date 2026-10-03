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
  googleClientId: '968679340678-cjpl9gauolrps73cd16330ohmvqp9kvt.apps.googleusercontent.com',
  storageKeys: {
    token: '__sec_lv_a9f12b7c6e',
    user: '__sec_lv_d48f001c9d',
    lastActivity: '__sec_lv_8fceea145f',
    lastRenew: '__sec_lv_b2532a014e',
    salt: 'LvSec!2026#k9$XmQ7vL8zP3wR1',
  },
};

