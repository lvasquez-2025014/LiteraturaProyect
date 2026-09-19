export const environment = {
  production: true,
  // URL pública del backend desplegado en Render
  apiUrl: (typeof window !== 'undefined' && (window as any).__API_URL__) || 'https://literaturaproyect.onrender.com/api',
};
