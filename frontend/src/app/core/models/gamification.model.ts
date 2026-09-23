export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'fluidez' | 'comprension' | 'constancia' | 'especial';
  xpReward: number;
  coinsReward: number;
  unlocked?: boolean;
  progress?: number; // 0 a 100
}

export interface League {
  id: 'bronce' | 'plata' | 'oro' | 'zafiro' | 'diamante';
  name: string;
  badge: string;
  minXp: number;
  maxXp: number;
  multiplier: number;
  color: string;
  gradient: string;
  description: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  rewardXp: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
}

export interface CosmeticItem {
  id: string;
  name: string;
  type: 'frame' | 'title';
  icon: string;
  cost: number;
  unlockedByLevel?: number;
  description: string;
  previewClass: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatarUrl?: string;
  grade: string;
  section: string;
  totalXp: number;
  currentLevel: number;
  averageWpm: number;
  comprehensionRate: number;
  streakDays: number;
  equippedTitle?: string;
  equippedFrame?: string;
}

/* =====================================================================
 * CATÁLOGO INSTITUCIONAL DE LOGROS
 * ===================================================================== */
export const KINAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-welcome',
    title: 'Bienvenida Lectora',
    description: 'Inicia sesión institucional y activa tu perfil de lector/a.',
    icon: '🎖️',
    category: 'especial',
    xpReward: 30,
    coinsReward: 15,
  },
  {
    id: 'ach-first-step',
    title: 'Primer Despegue Literario',
    description: 'Completa exitosamente tu primera lectura en vivo con micrófono.',
    icon: '🚀',
    category: 'fluidez',
    xpReward: 50,
    coinsReward: 25,
  },
  {
    id: 'ach-speed-140',
    title: 'Velocista del Quetzal',
    description: 'Alcanza una velocidad de al menos 140 PPM en cualquier reto.',
    icon: '⚡',
    category: 'fluidez',
    xpReward: 80,
    coinsReward: 35,
  },
  {
    id: 'ach-speed-170',
    title: 'Halcón de la Sierra',
    description: 'Supera el récord institucional de 170 PPM con lectura fluida.',
    icon: '🦅',
    category: 'fluidez',
    xpReward: 120,
    coinsReward: 50,
  },
  {
    id: 'ach-perfect-comp',
    title: 'Comprensión Perfecta',
    description: 'Obtén 100% de aciertos en las 3 preguntas de análisis crítico.',
    icon: '🎯',
    category: 'comprension',
    xpReward: 70,
    coinsReward: 30,
  },
  {
    id: 'ach-critical-mind',
    title: 'Mente Crítica y Analítica',
    description: 'Mantén un promedio de comprensión mayor a 85% en 3 o más lecturas.',
    icon: '🧠',
    category: 'comprension',
    xpReward: 100,
    coinsReward: 45,
  },
  {
    id: 'ach-streak-3',
    title: 'Fuego Sagrado',
    description: 'Mantén una racha activa de 3 días consecutivos leyendo.',
    icon: '🔥',
    category: 'constancia',
    xpReward: 60,
    coinsReward: 30,
  },
  {
    id: 'ach-streak-7',
    title: 'Volcán de Agua Imparable',
    description: 'Alcanza una racha legendaria de 7 días consecutivos de práctica.',
    icon: '🌋',
    category: 'constancia',
    xpReward: 150,
    coinsReward: 80,
  },
  {
    id: 'ach-bibliophile',
    title: 'Gran Bibliófilo',
    description: 'Supera 5 obras literarias de autores guatemaltecos y clásicos.',
    icon: '📖',
    category: 'constancia',
    xpReward: 100,
    coinsReward: 40,
  },
  {
    id: 'ach-kinal-master',
    title: 'Maestro Técnico de la Palabra',
    description: 'Llega al Nivel 10 y domina la gran epopeya del trabajo técnico.',
    icon: '👑',
    category: 'especial',
    xpReward: 250,
    coinsReward: 100,
  },
  {
    id: 'ach-coins-200',
    title: 'Tesorero de Sabiduría',
    description: 'Acumula 200 Monedas de Sabiduría gracias a tu esfuerzo lector.',
    icon: '🪙',
    category: 'especial',
    xpReward: 75,
    coinsReward: 50,
  },
  {
    id: 'ach-focus-zen',
    title: 'Enfoque Absoluto',
    description: 'Completa un desafío utilizando el Modo Enfoque activado.',
    icon: '👁️',
    category: 'especial',
    xpReward: 40,
    coinsReward: 20,
  }
];

/* =====================================================================
 * LIGAS ESCOLARES
 * ===================================================================== */
export const KINAL_LEAGUES: League[] = [
  {
    id: 'bronce',
    name: 'Liga Bronce',
    badge: '🥉',
    minXp: 0,
    maxXp: 499,
    multiplier: 1.0,
    color: '#b45309',
    gradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
    description: 'El umbral inicial: despierta tu hábito lector y da tus primeros pasos.',
  },
  {
    id: 'plata',
    name: 'Liga Plata',
    badge: '🥈',
    minXp: 500,
    maxXp: 1199,
    multiplier: 1.1,
    color: '#64748b',
    gradient: 'linear-gradient(135deg, #475569 0%, #94a3b8 100%)',
    description: 'Consolidación de vocabulario y mejora constante en tu ritmo de lectura.',
  },
  {
    id: 'oro',
    name: 'Liga Oro',
    badge: '🥇',
    minXp: 1200,
    maxXp: 2499,
    multiplier: 1.25,
    color: '#d97706',
    gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
    description: 'Excelencia técnica y fluidez verbal destacada en tu salón.',
  },
  {
    id: 'zafiro',
    name: 'Liga Zafiro Cobalto',
    badge: '💎',
    minXp: 2500,
    maxXp: 4999,
    multiplier: 1.4,
    color: '#004AAD',
    gradient: 'linear-gradient(135deg, #004AAD 0%, #3b82f6 100%)',
    description: 'Lectores ejemplares con capacidad de retención crítica sobresaliente.',
  },
  {
    id: 'diamante',
    name: 'Liga Diamante y Maestría',
    badge: '👑',
    minXp: 5000,
    maxXp: 99999,
    multiplier: 1.6,
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
    description: 'La élite de la palabra: líderes humanistas con vocación de servicio.',
  }
];

/* =====================================================================
 * TIENDA BOUTIQUE DE PERSONALIZACIÓN LITERARIA
 * ===================================================================== */
export const KINAL_COSMETICS: CosmeticItem[] = [
  // Marcos
  {
    id: 'frame-default',
    name: 'Orla Básica de Aprendiz',
    type: 'frame',
    icon: '🔘',
    cost: 0,
    description: 'Marco sobrio e institucional para iniciar tu trayectoria.',
    previewClass: 'frame-default',
  },
  {
    id: 'frame-blue',
    name: 'Aura Azul Cobalto',
    type: 'frame',
    icon: '🔷',
    cost: 120,
    description: 'Resalta tu avatar con el brillo cobalto institucional.',
    previewClass: 'frame-blue',
  },
  {
    id: 'frame-orange',
    name: 'Halo Naranja Fervor',
    type: 'frame',
    icon: '🔶',
    cost: 180,
    description: 'Un enérgico halo anaranjado que simboliza pasión y dinamismo.',
    previewClass: 'frame-orange',
  },
  {
    id: 'frame-gold',
    name: 'Corona Dorada del Quetzal',
    type: 'frame',
    icon: '✨',
    cost: 300,
    description: 'Borde dorado brillante reservado para lectores dedicados.',
    previewClass: 'frame-gold',
  },
  {
    id: 'frame-jade',
    name: 'Engranaje Técnico y Jade Maya',
    type: 'frame',
    icon: '⚙️',
    cost: 450,
    description: 'Fusión sublime entre la cosmovisión milenaria y la tecnología moderna.',
    previewClass: 'frame-jade',
  },

  // Títulos
  {
    id: 'title-cadete',
    name: 'Cadete de las Letras',
    type: 'title',
    icon: '🎖️',
    cost: 0,
    description: 'Tu título fundacional como estudiante y lector activo.',
    previewClass: 'title-badge-default',
  },
  {
    id: 'title-explorador',
    name: 'Explorador del Bosque Nuboso',
    type: 'title',
    icon: '🌿',
    cost: 80,
    description: 'Inspirado en la Sierra de las Minas y la agilidad del quetzal.',
    previewClass: 'title-badge-green',
  },
  {
    id: 'title-cronista',
    name: 'Cronista de Santiago',
    type: 'title',
    icon: '📜',
    cost: 150,
    description: 'Investigador incansable de la historia colonial de Guatemala.',
    previewClass: 'title-badge-amber',
  },
  {
    id: 'title-asturias',
    name: 'Voz del Premio Nobel',
    type: 'title',
    icon: '🖋️',
    cost: 250,
    description: 'Homenaje a la potencia literaria y poética de Miguel Ángel Asturias.',
    previewClass: 'title-badge-purple',
  },
  {
    id: 'title-ingeniero',
    name: 'Lector Destacado',
    type: 'title',
    icon: '🏛️',
    cost: 400,
    description: 'La máxima distinción: técnica de excelencia al servicio del prójimo.',
    previewClass: 'title-badge-kinal',
  }
];
