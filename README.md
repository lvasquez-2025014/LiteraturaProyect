# 📖 Plataforma de Fluidez y Comprensión Lectora — Fundación Kinal

Plataforma web interactiva orientada al desarrollo de la fluidez verbal y comprensión lectora para estudiantes de nivel medio y técnico de **Fundación Kinal (Guatemala)**. Combina gamificación estilo Duolingo, lectura interactiva en voz alta evaluada mediante la **Web Speech API**, métricas docentes en tiempo real (PPM y comprensión) y un panel de administración escolar.

---

## 🚀 Arquitectura y Tecnologías

* **Frontend:**
  * Framework: **Angular 22** (Standalone Components, Angular Signals, Reactive Forms).
  * Estilos: **Vanilla CSS** con sistema de diseño y paleta institucional de Fundación Kinal (`#004AAD`, `#1C2D5A`, `#F36F21`, `#E8EEFF`).
  * APIs del Navegador: **Web Speech API** para reconocimiento de voz continuo (`es-GT`).
  * Efectos Visuales: Celebraciones con `canvas-confetti`.
* **Backend:**
  * Framework: **NestJS 11** (Arquitectura modular con TypeScript y RxJS).
  * Base de Datos: **MongoDB** nativo con Mongoose/Driver oficial (`literaturaProyect`).
  * Autenticación: **JWT** (JSON Web Tokens) y **Google OAuth 2.0**.
  * Despliegue: Preparado para **Render** (Backend) y **Vercel** (Frontend).

---

## 🌟 Características Principales

1. **🎙️ Módulo Lector en Tiempo Real (Karaoke y Tacómetro de PPM):**
   * Detección de voz en vivo conforme el estudiante lee en voz alta.
   * Resaltado palabra por palabra (karaoke) y cálculo dinámico de Palabras por Minuto (**PPM**).
   * Cuestionario de comprensión lectora (3 preguntas pedagógicas con retroalimentación inmediata).
   * Pantalla de victoria con recompensas en experiencia (**XP**) y desbloqueo de niveles.
2. **🗺️ Ruta Gamificada de 10 Niveles (Roadmap):**
   * Obras de la literatura guatemalteca (Popol Vuh, El Cadejo, El Sombrerón, Tecún Umán) y textos técnicos formativos de Kinal (Código Limpio, Circuitos Eléctricos, Motores).
   * Progreso visual con nodos bloqueados, activos y completados con medallas de oro.
3. **📊 Portal Docente de Monitoreo Académico:**
   * Filtros dinámicos por **Grado** (Computación, Electricidad, Mecánica, Bachillerato) y **Sección** (A, B, C).
   * Indicadores grupales: Promedio de PPM de salón, tasa de comprensión global y conteo de rachas activas (≥3 días 🔥).
   * Ficha individual del estudiante con gráfica de evolución semanal y notas pedagógicas.
4. **🛡️ Panel de Administración y Control Escolar:**
   * Gestión de cuentas de Estudiantes, Docentes y Administradores.
   * Asignación de roles, grados, secciones y activación/baja de cuentas.

---

## 🛠️ Ejecución Local

### Prerrequisitos
* **Node.js** (v20 o superior)
* **pnpm** (`npm install -g pnpm`)
* **MongoDB** local o clúster en MongoDB Atlas

### 1. Iniciar el Backend
```bash
cd backend
pnpm install
cp .env.example .env # Configura tus credenciales y puerto
pnpm run dev
# Servidor disponible en http://localhost:3000/api
```

### 2. Iniciar el Frontend
```bash
cd frontend
pnpm install
pnpm start
# Aplicación disponible en http://localhost:4200
```

---

## ☁️ Guía de Despliegue en la Nube

### 🟢 1. Despliegue del Backend en Render
1. En [Render Dashboard](https://dashboard.render.com/), crea un **New Web Service**.
2. Conecta este repositorio de GitHub.
3. Configuración del servicio:
   * **Root Directory:** `backend`
   * **Environment:** `Node`
   * **Build Command:** `pnpm install && pnpm run build`
   * **Start Command:** `node dist/main.js` (o `pnpm run start`)
4. Variables de Entorno (**Environment Variables**):
   * `NODE_ENV`: `production`
   * `PORT`: `3000` (Render lo asigna dinámicamente)
   * `MONGO_URL`: Cadena de conexión de MongoDB Atlas (ej. `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority`)
   * `DB_NAME`: `literaturaProyect`
   * `JWT_SECRET`: Llave segura para firma de tokens
   * `JWT_EXPIRES_IN`: `7d`
   * `GOOGLE_CLIENT_ID`: ID de cliente OAuth de Google Cloud
   * `GOOGLE_CLIENT_SECRET`: Secreto de cliente OAuth de Google Cloud
   * `FRONTEND_URL`: URL de tu frontend en Vercel (ej. `https://literaturaproyect.vercel.app`)

### ⚡ 2. Despliegue del Frontend en Vercel
1. En [Vercel Dashboard](https://vercel.com/new), importa este repositorio de GitHub.
2. Configuración del proyecto:
   * **Root Directory:** `frontend`
   * **Framework Preset:** `Angular`
   * **Build Command:** `pnpm run build`
   * **Output Directory:** `dist/frontend/browser`
3. En `frontend/src/environments/environment.ts`, coloca la URL generada por Render:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://tu-backend-en-render.onrender.com/api',
   };
   ```
4. Haz clic en **Deploy**. El archivo `vercel.json` incluido gestionará automáticamente el enrutamiento SPA.

---

## 📜 Estándar de Dominio y Terminología
En cumplimiento con los lineamientos pedagógicos institucionales, queda erradicado el término *"usuario"* en la interfaz visual y mensajes del sistema, empleando estrictamente:
* **Estudiante / Alumno**
* **Docente / Profesor**
* **Comunidad Educativa / Cuentas Escolares**

---
© Fundación Kinal — Plataforma de Fluidez y Comprensión Lectora
