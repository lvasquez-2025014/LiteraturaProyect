export const environment = {
  production: true,
  // Al desplegar en Vercel, puedes sustituir esta URL por la URL pública de tu backend en Render
  // Ejemplo: 'https://literatura-proyect-backend.onrender.com/api'
  apiUrl: (typeof window !== 'undefined' && (window as any).__API_URL__) || 'http://localhost:3000/api',
};
