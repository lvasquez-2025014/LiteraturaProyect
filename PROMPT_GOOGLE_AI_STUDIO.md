# PROMPT MAESTRO DE INGENIERÍA PARA GOOGLE AI STUDIO
## Proyecto: Plataforma de Fluidez y Comprensión Lectora - Fundación Kinal

> **Instrucciones para Google AI Studio (Gemini 1.5 Pro / Flash):**
> Actúa como un Arquitecto de Software Frontend Senior y Diseñador UX/UI de élite especializado en Angular moderno (Standalone Components, Signals, TypeScript y Vanilla CSS). Tu objetivo es generar el código completo del Frontend para la plataforma web interactiva de lectura y gamificación escolar de **Fundación Kinal**. El código debe ser modular, responsivo, estéticamente premium y listo para integrarse con un backend en NestJS y MongoDB.

---

## 1. Contexto e Identidad del Proyecto

* **Institución:** Fundación Kinal (Colegio Técnico Kinal, Guatemala).
* **Propósito:** Potenciar la comprensión lectora y la fluidez verbal en estudiantes de nivel medio y técnico a través de:
  1. Lectura en voz alta medida con micrófono en tiempo real (Palabras por minuto - PPM mediante Web Speech API).
  2. Gamificación estilo Duolingo (Rutas de 10 niveles, experiencia XP, rachas diarias 🔥 y logros).
  3. Cuestionarios interactivos de comprensión lectora al terminar cada lectura.
  4. Portal docente con métricas en vivo por grado y sección.
  5. Panel administrativo para gestión de roles y cuentas escolares.
* **REGLA DE ORO DE TERMINOLOGÍA:** Queda estrictamente prohibido usar la palabra *"usuario"* en la interfaz y textos visibles. Se debe usar siempre **"Estudiante" / "Alumno"**, **"Docente" / "Profesor"** o **"Comunidad Educativa"**.
* **Paleta de Colores Institucional (Fundación Kinal):**
  * **Azul Cobalto Principal:** `#004AAD` (Acciones primarias, botones, destacados).
  * **Azul Marino Profundo:** `#1C2D5A` / `#23376D` (Títulos, encabezados, bordes oscuros).
  * **Naranja Kinal:** `#F36F21` (Rachas, insignias de fuego, acentos y energía gamificada).
  * **Azul Claro Suave:** `#E8EEFF` (Fondos de tarjetas activas, pills, badges secundarios).
  * **Fondo General:** `#F8FAFC` con sutiles gradientes radiales ambientales.
  * **Superficies:** `#FFFFFF` con sombras suaves de elevación (`0 10px 30px -5px rgba(0, 74, 173, 0.1)`).
* **Tipografía:** `Outfit` (headings y títulos) y `Plus Jakarta Sans` / `Inter` (cuerpo y datos numéricos).

---

## 2. Pila Tecnológica (Stack Frontend)

* **Framework:** Angular 18+ / 22 (Arquitectura basada en **Standalone Components**, sin NgModules).
* **Reactividad:** Angular Signals (`signal`, `computed`, `effect`) e inyección moderna (`inject(ServiceName)`).
* **Estilos:** Vanilla CSS moderno con variables CSS (`:root`), Flexbox, CSS Grid, Glassmorphism y micro-animaciones (sin dependencias externas pesadas).
* **Rutas:** Angular Router con Lazy Loading de páginas funcionales.
* **Cliente HTTP:** `HttpClient` para conectar con API REST en `http://localhost:3000/api`.
* **APIs del Navegador:** `Web Speech API` (`webkitSpeechRecognition` / `SpeechRecognition`) para reconocimiento de voz en lectura en voz alta.

---

## 3. Modelo de Datos e Interfaces TypeScript

```typescript
export type UserRole = 'STUDENT_ROLE' | 'TEACHER_ROLE' | 'ADMIN_ROLE';

export interface UserStats {
  totalXp: number;
  currentLevel: number;
  averageWpm: number;           // Palabras por minuto promedio
  comprehensionRate: number;    // Porcentaje de comprensión (0 - 100%)
  streakDays: number;           // Días de racha consecutiva
  completedReadings: number;    // Total de lecturas finalizadas
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  grade?: string;               // Ej: "5to Perito"
  section?: string;             // Ej: "A", "B"
  stats?: UserStats;
}

export interface Question {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface Reading {
  id: string;
  level: number;                // 1 al 10
  title: string;
  genre: string;                // Ej: "Fábulas", "Leyendas", "Crónicas"
  targetWpm: number;            // Meta de palabras por minuto
  xpReward: number;
  content: string;              // Texto completo de lectura
  wordCount: number;
  questions: Question[];
}

export interface ReadingAttemptResult {
  readingId: string;
  studentId: string;
  wpm: number;
  accuracy: number;
  timeSeconds: number;
  comprehensionScore: number;
  xpEarned: number;
}
```

---

## 4. Estructura de Pantallas y Componentes Requeridos

### Pantalla 1: Login Split-Screen (`/login`)
* **Columna Izquierda (Showcase Inspiracional):**
  * Badge institucional *"Fundación Kinal · Proyecto Literatura"*.
  * Título motivador: *"Despierta tu pasión por la lectura y supera tus límites"*.
  * Subtítulo explicativo de la plataforma.
  * Tarjeta visual con ilustración 3D e insignias flotantes animadas:
    * 🔥 **Racha Activa**: *"¡Cada día cuenta!"*
    * ⚡ **+XP y Logros**: *"Sube de nivel"*
    * 🎙️ **Fluidez en Vivo**: *"Palabras por minuto"*
  * Features grid: *"10 Niveles Gamificados"* y *"Métricas al Instante"*.
* **Columna Derecha (Formulario Minimalista):**
  * Tarjeta limpia con badge *"Portal Institucional"*.
  * Formulario reactivo: Correo Institucional + Contraseña (con botón ver/ocultar).
  * Botón principal *"Iniciar Sesión"* en azul Kinal con respuesta táctil.
  * Botón oficial de Google OAuth / Microsoft 365.
  * Pie de página institucional: *"Centro Educativo Técnico Kinal"*.

---

### Pantalla 2: Dashboard del Estudiante (`/estudiante`)
* **Barra de Navegación (`Navbar`):**
  * Logo Kinal Literatura.
  * Pills gamificadas: Racha actual (🔥 días), XP acumulado (⚡ XP) y Nivel actual (⭐ Nvl. X).
  * Perfil del alumno (avatar, nombre y grado/sección) + Botón Salir.
* **Hero Banner Personalizado:**
  * Saludo: *"¡Bienvenido de nuevo, [Nombre del Alumno]! 👋"*.
  * Barra de progreso de nivel (XP actual vs XP requerido para el siguiente nivel).
  * Botón CTA destacado: *"🚀 Iniciar Próxima Lectura"*.
* **Métricas Principales (Grid de 4 Tarjetas):**
  * ⚡ **Velocidad Promedio:** `X` Palabras / Minuto (PPM).
  * 🎯 **Comprensión:** `X%` Rendimiento General.
  * 🔥 **Racha Actual:** `X` Días consecutivos.
  * 📖 **Lecturas Superadas:** `X` Textos completados.
* **Mapa de Ruta Gamificado (Roadmap estilo Duolingo):**
  * Nodos visuales de niveles (Nivel 1 al Nivel 10) organizados en camino sinuoso.
  * Estados de cada nodo:
    * **Completado:** Estrella dorada, puntaje y opción de releer.
    * **Activo/Actual:** Resaltado con pulso en azul Kinal y botón *"Comenzar reto"*.
    * **Bloqueado:** Icono de candado con requisitos para desbloquear.

---

### Pantalla 3: Módulo de Lectura en Voz Alta con Micrófono (`/lectura/:id`)
* **Encabezado del Lector:**
  * Título de la obra, género y meta de velocidad (ej. *"Meta: 180 PPM"*).
  * Cronómetro de lectura en tiempo real (`00:00`).
  * Indicador en vivo de **PPM actual** calculado dinámicamente.
* **Lienzo de Lectura (Reading Canvas):**
  * Tipografía amplia, espaciado cómodo y alto contraste para descanso visual.
  * El texto divide las palabras en tokens para resaltar en tiempo real la palabra que el estudiante va pronunciando mediante la Web Speech API.
* **Barra de Control de Audio:**
  * Botón circular grande de **Micrófono** con animación de ondas de voz al estar grabando.
  * Controles para pausar, reiniciar o finalizar lectura.
* **Modal de Cuestionario de Comprensión (Al finalizar):**
  * 3 preguntas de opción múltiple con retroalimentación inmediata.
* **Pantalla de Victoria / Recompensas:**
  * Celebración con confeti, medallas obtenidas, XP ganado y comparativa de su velocidad respecto a la meta.

---

### Pantalla 4: Dashboard del Docente (`/profesor`)
* **Métricas Grupales:**
  * Promedio de velocidad lectora (PPM) del salón.
  * Porcentaje promedio de comprensión.
  * Total de estudiantes asignados.
* **Filtros Escolares:**
  * Selector de Grado (ej. *4to Bachillerato, 5to Perito*) y Sección (*A, B, C*).
* **Tabla de Estudiantes en Tiempo Real:**
  * Columnas: Estudiante (Avatar + Nombre), Correo, Grado/Sección, PPM, Barra de Comprensión (%), Estado (*Destacado*, *En Progreso*, *Atención Requerida*).
  * Modal de Historial Detallado al hacer clic en un estudiante para ver su evolución gráfica de velocidad a lo largo de las semanas.

---

### Pantalla 5: Panel de Administración Escolar (`/admin`)
* **Directorio General de Cuentas:**
  * Tabla con todas las cuentas registradas en MongoDB.
  * Selector desplegable inline para cambiar el rol (`Estudiante`, `Profesor / Docente`, `Administrador`).
  * Botón para dar de baja o eliminar cuentas.
* **Modal para Registrar Docente o Estudiante:**
  * Nombre completo, correo institucional, contraseña inicial, rol, grado y sección.

---

## 5. Requisitos de Salida esperados de Google AI Studio

1. Generar los archivos `.ts`, `.html` y `.css` para cada componente utilizando Angular Standalone (`standalone: true`).
2. Declarar todas las variables CSS de Kinal en `:root` dentro de `styles.css`.
3. Crear un servicio `SpeechRecognitionService` en Angular para gestionar el micrófono y la Web Speech API con eventos `onresult`, `onerror` y `onend`.
4. Implementar diseño 100% responsivo para computadoras de escritorio, tablets y teléfonos móviles.
5. Código listo y limpio para copiar e implementar directamente en el proyecto existente.
