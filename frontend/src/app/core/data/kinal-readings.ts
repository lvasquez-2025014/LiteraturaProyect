import { Reading, StudentPerformance } from '../models/reading.model';
import { User } from '../models/user.model';

export const KINAL_READINGS: Reading[] = [
  {
    id: 'lec-01',
    level: 1,
    title: 'El Quetzal y el Guardián del Bosque Nuboso',
    genre: 'Fábulas y Naturaleza',
    targetWpm: 120,
    xpReward: 120,
    difficulty: 'Básico',
    author: 'Tradición Pedagógica Kinal',
    pedagogicalSource: 'MINEDUC Guatemala — Programa Nacional de Lectura "Leamos Juntos"',
    competencies: ['Fluidez verbal', 'Comprensión literal', 'Educación ambiental y servicio'],
    vocabulary: [
      { word: 'cumbres', meaning: 'Partes más altas de una montaña o sierra donde se condensa la niebla.' },
      { word: 'alisios', meaning: 'Vientos constantes que soplan en las regiones tropicales y regulan el clima.' },
      { word: 'centenarios', meaning: 'Árboles u objetos que han vivido o perdurado cien años o más.' }
    ],
    estimatedMinutes: 2,
    unlocked: true,
    completed: true,
    bestWpm: 128,
    bestComprehension: 100,
    content: `En las altas cumbres de la Sierra de las Minas, donde la niebla danza entre los helechos gigantes, vivía un joven quetzal de plumaje esmeralda. A diferencia de las demás aves que se conformaban con volar en círculos sobre el dosel arbóreo, este quetzal observaba con atención cada detalle del bosque: el sonido del rocío al tocar la tierra fértil, la fuerza de los vientos alisios y el crecimiento paciente de los cedros centenarios. Un anciano guardabosques le enseñó que la verdadera libertad no reside únicamente en la velocidad de las alas, sino en la serenidad para contemplar el camino y la disciplina para sortear las tormentas. Desde entonces, el quetzal descendía cada amanecer para guiar a los caminantes extraviados, demostrando que el talento brilla más cuando se pone al servicio de los demás.`,
    wordCount: 135,
    questions: [
      {
        id: 'q1-1',
        prompt: '¿Dónde vivía el joven quetzal de plumaje esmeralda?',
        options: [
          'En las costas cálidas del Océano Pacífico',
          'En las altas cumbres de la Sierra de las Minas',
          'En las cuevas subterráneas de Alta Verapaz',
          'En el cráter del Volcán de Fuego'
        ],
        correctIndex: 1,
        explanation: 'El texto sitúa explícitamente la historia en las altas cumbres de la Sierra de las Minas entre helechos gigantes.'
      },
      {
        id: 'q1-2',
        prompt: '¿Qué lección transmitió el anciano guardabosques al quetzal?',
        options: [
          'Que el vuelo más veloz es siempre el más respetado',
          'Que debía alejarse de los seres humanos para sobrevivir',
          'Que la verdadera libertad requiere serenidad y disciplina ante las tormentas',
          'Que los quetzales solo deben alimentarse de frutos silvestres'
        ],
        correctIndex: 2,
        explanation: 'El guardabosques enseñó que la libertad reside en la serenidad para contemplar el camino y la disciplina ante las tormentas.'
      },
      {
        id: 'q1-3',
        prompt: '¿Qué valor humano se resalta al final de la lectura?',
        options: [
          'El espíritu de servicio y ayuda desinteresada',
          'La competencia por ser el más fuerte',
          'El aislamiento del resto de la comunidad',
          'La búsqueda de riquezas materiales'
        ],
        correctIndex: 0,
        explanation: 'El texto concluye destacando que el talento brilla más cuando se pone al servicio de los demás guiando a quienes lo necesitan.'
      }
    ]
  },
  {
    id: 'lec-02',
    level: 2,
    title: 'El Sombrerón de la Calle Real',
    genre: 'Leyendas de Guatemala',
    targetWpm: 135,
    xpReward: 140,
    difficulty: 'Básico',
    author: 'Crónicas de Santiago',
    pedagogicalSource: 'UNESCO / CERLALC — Fomento de la Tradición Oral Latinoamericana',
    competencies: ['Comprensión inferencial', 'Apreciación cultural', 'Atención al detalle'],
    vocabulary: [
      { word: 'crines', meaning: 'Conjunto de cerdas o pelos largos que tienen los caballos en la parte superior del cuello.' },
      { word: 'primorosa', meaning: 'Hecha con primor, esmero, delicadeza y gran destreza artística.' },
      { word: 'balcones', meaning: 'Huecos abiertos al exterior de un edificio protegidos con barandillas talladas.' }
    ],
    estimatedMinutes: 2,
    unlocked: true,
    completed: true,
    bestWpm: 142,
    bestComprehension: 100,
    content: `Cuentan los abuelos que en las noches estrelladas de luna llena, por las empedradas calles de la Calle Real de Santiago, se escuchaban las notas cristalinas de una guitarra de plata. El Sombrerón, diminuto personaje de botas relucientes y cinto relampagueante, solía trenzar las crines de los caballos con primorosa paciencia. Jamás lastimaba a criatura alguna; su único anhelo era dejar una estela de música y misterio bajo los balcones coloniales de madera tallada. Los artesanos del barrio salían con lámparas de aceite para contemplar las trenzas perfectas, asombrados de cómo la precisión de unas manos invisibles podía transformar lo cotidiano en una obra de arte. La tradición nos recuerda que el respeto por las narraciones orales preserva el alma de nuestra identidad guatemalteca.`,
    wordCount: 132,
    questions: [
      {
        id: 'q2-1',
        prompt: '¿Qué instrumento musical tocaba el Sombrerón según la leyenda?',
        options: [
          'Una chirimía de barro cocido',
          'Una guitarra de plata de notas cristalinas',
          'Un tamboril ceremonial de madera',
          'Una marimba doble de hormigo'
        ],
        correctIndex: 1,
        explanation: 'La leyenda relata que se escuchaban las notas cristalinas de una guitarra de plata.'
      },
      {
        id: 'q2-2',
        prompt: '¿Qué acción singular realizaba el personaje con los caballos?',
        options: [
          'Los asustaba para que huyeran hacia los potreros',
          'Trenzaba sus crines con primorosa paciencia',
          'Les cambiaba las herraduras de hierro',
          'Los montaba en carreras nocturnas'
        ],
        correctIndex: 1,
        explanation: 'El relato destaca que trenzaba las crines de los caballos con primorosa paciencia y perfección artesanal.'
      },
      {
        id: 'q2-3',
        prompt: '¿Cuál es el significado cultural que subraya el texto?',
        options: [
          'La necesidad de encerrarse temprano por temor a lo desconocido',
          'El valor de la tradición oral para preservar el alma de la identidad nacional',
          'La desconfianza hacia los relatos antiguos',
          'El abandono de las costumbres coloniales'
        ],
        correctIndex: 1,
        explanation: 'El texto concluye afirmando que el respeto por las narraciones orales preserva el alma de la identidad guatemalteca.'
      }
    ]
  },
  {
    id: 'lec-03',
    level: 3,
    title: 'El Popol Vuh y el Origen del Maíz',
    genre: 'Cosmovisión Maya',
    targetWpm: 145,
    xpReward: 160,
    difficulty: 'Intermedio',
    author: 'Códices Mayas Adaptados',
    pedagogicalSource: 'Academia de Geografía e Historia Maya — Códice Popol Vuh',
    competencies: ['Cosmovisión originaria', 'Pensamiento simbólico', 'Análisis causal'],
    vocabulary: [
      { word: 'primordiales', meaning: 'Primitivos, originales o que existen desde el principio de los tiempos.' },
      { word: 'penumbra', meaning: 'Sombra débil entre la luz y la oscuridad absoluta.' },
      { word: 'sagrado', meaning: 'Digno de veneración y respeto supremo por su vínculo con el origen de la vida.' }
    ],
    estimatedMinutes: 2,
    unlocked: true,
    completed: true,
    bestWpm: 150,
    bestComprehension: 67,
    content: `En el principio reinaban la calma y el silencio sobre las aguas primordiales. Los Progenitores, Tepeu y Gucumatz, dialogaron en la penumbra sobre la necesidad de crear un ser dotado de entendimiento, capaz de agradecer la belleza del universo y venerar el curso de los astros. Tras ensayar con el lodo quebradizo y la madera sin memoria, los animales sabios trajeron las mazorcas amarillas y blancas procedentes del mítico Paxil y Cayalá. Con la masa del grano sagrado moldearon los músculos, la sangre y el aliento vital de los primeros cuatro seres humanos: Balam Quitzé, Balam Acab, Mahucutah e Iqui Balam. Al contemplar la creación con ojos claros, estos seres no solo comprendieron la ciencia de la tierra, sino también el valor de la gratitud hacia la vida.`,
    wordCount: 137,
    questions: [
      {
        id: 'q3-1',
        prompt: '¿Cuáles fueron los primeros dos materiales con los que se intentó crear al ser humano?',
        options: [
          'Piedra volcánica y corteza de árbol',
          'Lodo quebradizo y madera sin memoria',
          'Huesos de jaguar y plumas de guacamaya',
          'Ceniza sagrada y oro fundido'
        ],
        correctIndex: 1,
        explanation: 'En el mito del Popol Vuh citado, los primeros ensayos fueron de lodo que se deshacía y madera sin memoria.'
      },
      {
        id: 'q3-2',
        prompt: '¿De qué lugar mítico provenían las mazorcas sagradas?',
        options: [
          'De las playas del Golfo de Honduras',
          'De Paxil y Cayalá',
          'De la cima del Volcán Tajumulco',
          'De los cenotes sagrados de Petén'
        ],
        correctIndex: 1,
        explanation: 'El texto especifica que los animales sabios trajeron las mazorcas amarillas y blancas de Paxil y Cayalá.'
      },
      {
        id: 'q3-3',
        prompt: '¿Cuál era el atributo indispensable que buscaban los Progenitores en su creación?',
        options: [
          'Que dominaran a todos los animales con fuerza física',
          'Que poseyeran entendimiento, memoria y gratitud hacia la existencia',
          'Que construyeran grandes fortalezas de piedra',
          'Que no tuvieran necesidad de alimentarse'
        ],
        correctIndex: 1,
        explanation: 'Los creadores buscaban un ser dotado de entendimiento capaz de agradecer la belleza del universo y venerar los astros.'
      }
    ]
  },
  {
    id: 'lec-04',
    level: 4,
    title: 'Código y Algoritmos: La Chispa Binaria',
    genre: 'Ciencia y Tecnología Kinal',
    targetWpm: 155,
    xpReward: 180,
    difficulty: 'Intermedio',
    author: 'Área Técnica Kinal',
    pedagogicalSource: 'Fundación Kinal — Formación Vocacional y Pensamiento Algorítmico',
    competencies: ['Pensamiento lógico-matemático', 'Ética profesional', 'Vocabulario tecnológico'],
    vocabulary: [
      { word: 'algoritmo', meaning: 'Conjunto ordenado y finito de operaciones que permite hallar la solución a un problema.' },
      { word: 'perforadas', meaning: 'Tarjetas de cartulina con orificios que almacenaban los primeros programas binarios.' },
      { word: 'optimizada', meaning: 'Diseñada para conseguir el máximo rendimiento con el menor gasto de recursos.' }
    ],
    estimatedMinutes: 2,
    unlocked: true,
    completed: false,
    content: `Detrás de cada pantalla luminosa, en cada línea de código compilada en los talleres de informática, late una disciplina rigurosa fundamentada en el pensamiento lógico. Un algoritmo no es magia misteriosa; es una secuencia precisa y finita de instrucciones diseñada para resolver un desafío complejo paso a paso. Desde los pioneros que programaban con tarjetas perforadas hasta los desarrolladores modernos que implementan redes neuronales artificiales, el principio fundamental se mantiene inalterable: la claridad conceptual antecede a la excelencia técnica. Un buen programador no escribe código para que solo una máquina lo ejecute, sino para que otro ser humano lo comprenda y mejore. En la ética del trabajo técnico, cada función optimizada representa respeto hacia quien utilizará esa solución tecnológica.`,
    wordCount: 129,
    questions: [
      {
        id: 'q4-1',
        prompt: '¿Cómo define la lectura el concepto de algoritmo?',
        options: [
          'Un lenguaje exclusivo para computadoras cuánticas',
          'Una secuencia precisa y finita de instrucciones para resolver un problema',
          'Un dispositivo electrónico de memoria ultra rápida',
          'Un error imprevisto en el sistema operativo'
        ],
        correctIndex: 1,
        explanation: 'El texto define al algoritmo como una secuencia precisa y finita de instrucciones orientada a resolver un desafío complejo.'
      },
      {
        id: 'q4-2',
        prompt: 'Según el texto, ¿para quién debe escribir código un buen programador?',
        options: [
          'Únicamente para los servidores de alta velocidad',
          'Para que otro ser humano lo comprenda y mejore colaborativamente',
          'Para ocultar los secretos comerciales de una empresa',
          'Para que nadie más pueda modificar el software'
        ],
        correctIndex: 1,
        explanation: 'La lectura destaca que el código se escribe para que otro ser humano lo entienda y lo perfeccione con sentido de equipo.'
      },
      {
        id: 'q4-3',
        prompt: '¿Qué valor ético del trabajo técnico se resalta en el texto?',
        options: [
          'El respeto y empatía hacia las personas destinatarias mediante la optimización',
          'La rapidez sin importar los errores que puedan surgir',
          'El cobro elevado por cada línea desarrollada',
          'La sustitución del factor humano por la máquina'
        ],
        correctIndex: 0,
        explanation: 'El texto indica que cada función optimizada representa respeto hacia quien utilizará esa solución tecnológica.'
      }
    ]
  },
  {
    id: 'lec-05',
    level: 5,
    title: 'Crónicas de la Antigua: Los Faroles de Santiago',
    genre: 'Crónica Histórica',
    targetWpm: 165,
    xpReward: 200,
    difficulty: 'Intermedio',
    author: 'Archivo Histórico',
    pedagogicalSource: 'Archivo Histórico del Valle de Panchoy — Crónica Colonial de Santiago',
    competencies: ['Sentido cívico', 'Historia nacional', 'Memoria comunitaria'],
    vocabulary: [
      { word: 'calicanto', meaning: 'Mampostería de piedra unida con cal y arena característica de la arquitectura colonial.' },
      { word: 'faroleros', meaning: 'Personas encargadas de encender y cuidar los faroles del alumbrado público nocturno.' },
      { word: 'resiliencia', meaning: 'Capacidad de sobreponerse a catástrofes y renacer con mayor fortaleza.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `El valle de Panchoy guarda en sus muros de calicanto el eco de cinco siglos de historia y resiliencia. Cuando el sol se oculta tras la silueta imponente del Volcán de Agua, la Antigua Guatemala se ilumina con la luz ámbar de sus faroles coloniales. Aquellos faroleros del siglo dieciocho caminaban con varas de pino encendiendo linterna por linterna, asegurando que los artesanos, tejedores y carpinteros regresaran sanos a sus hogares tras agotadoras jornadas de labor. No era un oficio menor; de su constancia dependía la seguridad de toda la comunidad. Aquel compromiso diario con el deber cívico es el mismo espíritu que hoy inspira a los jóvenes técnicos a iluminar el futuro con su profesión honesta y comprometida.`,
    wordCount: 125,
    questions: [
      {
        id: 'q5-1',
        prompt: '¿En qué valle se encuentra asentada la Antigua Guatemala según la crónica?',
        options: [
          'En el Valle de las Vacas',
          'En el Valle de Panchoy',
          'En el Valle de la Ermita',
          'En el Valle de Salamá'
        ],
        correctIndex: 1,
        explanation: 'La crónica inicia indicando que el valle de Panchoy guarda el eco de cinco siglos de historia.'
      },
      {
        id: 'q5-2',
        prompt: '¿Cuál era la misión principal de los antiguos faroleros?',
        options: [
          'Vender velas y aceite a los comerciantes de la plaza',
          'Encender linterna por linterna para asegurar el tránsito seguro de los artesanos',
          'Tocar las campanas de las iglesias a medianoche',
          'Pintar las fachadas de los conventos de amarillo'
        ],
        correctIndex: 1,
        explanation: 'Los faroleros garantizaban con constancia que los trabajadores regresaran seguros a sus hogares con luz en el camino.'
      },
      {
        id: 'q5-3',
        prompt: '¿Qué analogía formativa establece el texto al concluir?',
        options: [
          'Compara la labor de los faroleros con el compromiso de los jóvenes técnicos de iluminar el futuro',
          'Critica los métodos antiguos frente a la tecnología moderna',
          'Señala que los volcanes amenazan el desarrollo industrial',
          'Sugiere abandonar los oficios manuales'
        ],
        correctIndex: 0,
        explanation: 'El texto enlaza la constancia de los faroleros con el deber de los jóvenes técnicos de iluminar el porvenir con su trabajo.'
      }
    ]
  },
  {
    id: 'lec-06',
    level: 6,
    title: 'Misterios y Astronomía en Tikal',
    genre: 'Arqueología y Ciencia',
    targetWpm: 175,
    xpReward: 220,
    difficulty: 'Avanzado',
    author: 'Estudios Mesoamericanos',
    pedagogicalSource: 'Instituto de Antropología e Historia (IDAEH) — Astronomía y Arquitectura de Tikal',
    competencies: ['Rigor científico', 'Arqueología maya', 'Pensamiento crítico'],
    vocabulary: [
      { word: 'sinódico', meaning: 'Tiempo que tarda un planeta en volver a la misma posición aparente respecto al Sol y la Tierra.' },
      { word: 'eclipses', meaning: 'Ocultación transitoria total o parcial de un astro por la interposición de otro cuerpo celeste.' },
      { word: 'prodigiosos', meaning: 'Extraordinarios, excelentes y que causan gran admiración por su genialidad.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `En lo profundo de la selva petenera, las crestas del Templo del Gran Jaguar se elevan como antenas astronómicas hacia el firmamento estrellado. Los sabios mayas no solo fueron constructores portentosos capaces de transportar toneladas de piedra caliza sin bestias de carga ni ruedas metálicas; fueron, ante todo, matemáticos prodigiosos que idearon el concepto del cero siglos antes de que este fuera adoptado en Europa. Con una exactitud que aún conmueve a los astrofísicos modernos, calcularon el ciclo sinódico de Venus y predijeron eclipses solares con márgenes de error mínimos. Estudiar la ingeniería maya nos enseña que el rigor científico y la observación perseverante son capaces de trascender milenios, erigiendo monumentos al conocimiento que desafían el paso del tiempo.`,
    wordCount: 128,
    questions: [
      {
        id: 'q6-1',
        prompt: '¿Qué hito matemático mayance destaca el texto como adelantado a Europa?',
        options: [
          'La creación del ábaco de bronce',
          'La concepción matemática del número cero',
          'La geometría analítica tridimensional',
          'El cálculo infinitesimal integral'
        ],
        correctIndex: 1,
        explanation: 'El texto enfatiza que los mayas idearon el concepto del cero siglos antes de su adopción en Europa.'
      },
      {
        id: 'q6-2',
        prompt: '¿El ciclo de qué planeta calcularon con asombrosa exactitud los sabios de Tikal?',
        options: [
          'Marte',
          'Júpiter',
          'Venus',
          'Saturno'
        ],
        correctIndex: 2,
        explanation: 'Se menciona puntualmente el cálculo milimétrico del ciclo sinódico de Venus y la predicción de eclipses.'
      },
      {
        id: 'q6-3',
        prompt: '¿Cuál es la lección de la ingeniería maya según el autor?',
        options: [
          'Que el rigor científico y la observación perseverante trascienden las eras',
          'Que las pirámides tenían propósitos estrictamente bélicos',
          'Que sin tecnología digital no es posible hacer ciencia',
          'Que el conocimiento debe guardarse en secreto'
        ],
        correctIndex: 0,
        explanation: 'La conclusión sintetiza que el rigor científico y la observación perseverante son monumentos eternos al conocimiento.'
      }
    ]
  },
  {
    id: 'lec-07',
    level: 7,
    title: 'La Leyenda del Cadejo Blanco',
    genre: 'Tradición Oral',
    targetWpm: 180,
    xpReward: 240,
    difficulty: 'Avanzado',
    author: 'Cuentos y Leyendas de la Meseta Central',
    pedagogicalSource: 'Centro de Estudios Folklóricos (CEFOL - USAC) — Tradición Oral de Guatemala',
    competencies: ['Valores morales', 'Comprensión de narrativas orales', 'Fluidez expresiva'],
    vocabulary: [
      { word: 'asechanzas', meaning: 'Engaños o peligros urdidos para perjudicar o sorprender a alguien.' },
      { word: 'benefactora', meaning: 'Fuerza o persona que hace el bien y ayuda desinteresadamente a otra.' },
      { word: 'transeúnte', meaning: 'Persona que transita o camina por una calle o lugar público.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `La noche guatemalteca tiene ojos vigilantes. Cuando la niebla desciende sobre los barrancos de la meseta central, los caminantes que regresan a altas horas de la noche tras cumplir con sus responsabilidades sienten a menudo unos pasos silenciosos a su lado. Se trata del Cadejo Blanco, un ser protector de pelaje luminoso y mirada serena que resguarda a los hombres laboriosos contra los peligros y asechanzas de la oscuridad. A diferencia de su contraparte sombría, este noble espíritu jamás ataca; camina fielmente a la diestra del transeúnte hasta dejarlo a las puertas de su hogar. La tradición popular plasma en esta figura el valor de la lealtad protectora y la convicción de que el esfuerzo honesto siempre encuentra una fuerza benefactora que lo acompaña en el camino.`,
    wordCount: 133,
    questions: [
      {
        id: 'q7-1',
        prompt: '¿Cuál es la función del Cadejo Blanco en la tradición relatada?',
        options: [
          'Asustar a los habitantes de las aldeas',
          'Proteger y custodiar a los caminantes laboriosos hasta su hogar',
          'Cuidar los tesoros enterrados en los volcanes',
          'Guíar a los rebaños de ovejas'
        ],
        correctIndex: 1,
        explanation: 'El relato describe al Cadejo Blanco como un protector fiel que resguarda al transeúnte honrado hasta la puerta de su casa.'
      },
      {
        id: 'q7-2',
        prompt: '¿Cómo se describe el comportamiento del Cadejo Blanco?',
        options: [
          'Agresivo y ruidoso en las encrucijadas',
          'Silencioso, de mirada serena y sin atacar jamás',
          'Temeroso de la luz y esquivo',
          'Invisible y burlón con los viajeros'
        ],
        correctIndex: 1,
        explanation: 'El texto aclara que es un ser de pasos silenciosos, pelaje luminoso, mirada serena que jamás agrede.'
      },
      {
        id: 'q7-3',
        prompt: '¿Qué valor moral representa esta leyenda en la cultura comunitaria?',
        options: [
          'La desconfianza en el prójimo durante la noche',
          'La convicción de que la lealtad y el esfuerzo honesto son protegidos',
          'El temor paralizante ante la naturaleza',
          'La superstición sin fundamento ético'
        ],
        correctIndex: 1,
        explanation: 'La historia encarna la convicción de que el trabajo honesto y la lealtad atraen fuerzas protectoras y bienestar.'
      }
    ]
  },
  {
    id: 'lec-08',
    level: 8,
    title: 'Nanotecnología y el Futuro de la Ingeniería',
    genre: 'Tecnología y Futuro',
    targetWpm: 190,
    xpReward: 260,
    difficulty: 'Avanzado',
    author: 'Divulgación Científica Kinal',
    pedagogicalSource: 'Revista de Divulgación Científica y Tecnológica — Fronteras de la Nanociencia',
    competencies: ['Comprensión científica avanzada', 'Innovación sustentable', 'Física y nanotecnología aplicada'],
    vocabulary: [
      { word: 'nanómetro', meaning: 'Unidad de longitud que equivale a la milmillonésima parte de un metro (10^-9 m).' },
      { word: 'cuánticos', meaning: 'Fenómenos físicos a escala subatómica que difieren de la física clásica tradicional.' },
      { word: 'patógenos', meaning: 'Agentes biológicos microscópicos capaces de producir enfermedades en un organismo.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `En la escala del nanómetro, una milmillonésima parte de un metro, las leyes convencionales de la física dan paso a fenómenos cuánticos extraordinarios. La nanotecnología no es simplemente la miniaturización de componentes electrónicos; es la capacidad del ser humano para manipular átomos y moléculas individuales con precisión quirúrgica. En los campos de la medicina regenerativa, nanomáquinas inteligentes patrullarán el torrente sanguíneo neutralizando patógenos antes de que originen enfermedades. En la ingeniería civil y eléctrica, nanotubos de carbono cien veces más resistentes que el acero y cinco veces más ligeros revolucionarán la infraestructura energética mundial. Los estudiantes técnicos que hoy dominan los fundamentos de la química y la física aplicada serán los arquitectos de esta nueva era de prosperidad tecnológica sustentable.`,
    wordCount: 129,
    questions: [
      {
        id: 'q8-1',
        prompt: '¿A cuánto equivale exactamente un nanómetro?',
        options: [
          'A la milésima parte de un milímetro',
          'A una milmillonésima parte de un metro',
          'A la millonésima parte de un centímetro',
          'A la mitad de un micrómetro'
        ],
        correctIndex: 1,
        explanation: 'El texto indica con precisión que un nanómetro corresponde a una milmillonésima parte de un metro.'
      },
      {
        id: 'q8-2',
        prompt: '¿Qué propiedad sobresaliente poseen los nanotubos de carbono mencionados?',
        options: [
          'Son cien veces más resistentes que el acero y cinco veces más ligeros',
          'Son biodegradables en menos de veinticuatro horas',
          'Emiten luz fosforescente continua sin consumir energía',
          'Son extremadamente frágiles pero conductores térmicos'
        ],
        correctIndex: 0,
        explanation: 'La lectura detalla que son 100 veces más resistentes que el acero y 5 veces más livianos.'
      },
      {
        id: 'q8-3',
        prompt: '¿Qué rol asigna el texto a los estudiantes técnicos de la actualidad?',
        options: [
          'Ser meros consumidores pasivos de tecnología extranjera',
          'Ser los futuros arquitectos de una era de prosperidad tecnológica sustentable',
          'Limitarse a la reparación de artefactos antiguos',
          'Abandonar los estudios teóricos en favor de la improvisación'
        ],
        correctIndex: 1,
        explanation: 'El texto afirma que los estudiantes técnicos serán los arquitectos de una era sustentable gracias al dominio científico.'
      }
    ]
  },
  {
    id: 'lec-09',
    level: 9,
    title: 'El Señor Presidente: Metáfora y Retórica',
    genre: 'Literatura Clásica de Guatemala',
    targetWpm: 200,
    xpReward: 280,
    difficulty: 'Avanzado',
    author: 'Miguel Ángel Asturias (Adaptación Didáctica)',
    pedagogicalSource: 'MINEDUC & UNESCO — Clásicos de la Literatura Hispanoamericana (Premio Nobel 1967)',
    competencies: ['Comprensión crítico-valorativa', 'Apreciación de figuras retóricas', 'Juicio cívico y ético'],
    vocabulary: [
      { word: 'lumbre', meaning: 'Fuego, brasa o luz viva que alumbra e ilumina en medio de la penumbra.' },
      { word: 'telúrica', meaning: 'Perteneciente o relativo a las fuerzas profundas, magnéticas y vitales de la tierra.' },
      { word: 'disecciona', meaning: 'Analiza detalladamente y con precisión quirúrgica una realidad o concepto.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `...¡Alumbra, lumbre de alumbre, Luzbel de piedra lumbre sobre la podredumbre!... Las campanas del Portal del Señor tañían su clamor de bronce en la penumbra de la ciudad soñolienta. Miguel Ángel Asturias, Premio Nobel de Literatura de Guatemala, plasmó en esta obra maestra la fuerza deslumbrante del surrealismo y el compromiso cívico de la palabra escrita. Cada metáfora asturiana no es un adorno superfluo, sino un bisturí que disecciona la realidad social con valentía y hondura poética. El lenguaje se transforma en música telúrica que retumba en la conciencia colectiva, demostrando que la literatura es un escudo contra el olvido y una antorcha de libertad para las generaciones venideras. Quien aprende a leer críticamente esta prosa adquiere una coraza contra el engaño y una voz firme para defender la justicia.`,
    wordCount: 139,
    questions: [
      {
        id: 'q9-1',
        prompt: '¿Qué prestigioso galardón universal obtuvo el autor Miguel Ángel Asturias?',
        options: [
          'Premio Cervantes de las Letras',
          'Premio Nobel de Literatura',
          'Premio Pulitzer de Crónica',
          'Premio Príncipe de Asturias'
        ],
        correctIndex: 1,
        explanation: 'Miguel Ángel Asturias fue galardonado con el Premio Nobel de Literatura en 1967 por su cumbre literaria.'
      },
      {
        id: 'q9-2',
        prompt: '¿Qué papel cumple la metáfora en la poética asturiana según el texto?',
        options: [
          'Un simple adorno decorativo para entretener sin contenido',
          'Un bisturí que disecciona la realidad social con hondura poética y valentía',
          'Un recurso cómico para desviar la atención de los problemas',
          'Una imitación de los clásicos grecolatinos'
        ],
        correctIndex: 1,
        explanation: 'El texto afirma que no es un adorno superfluo, sino un bisturí que analiza la realidad con valentía.'
      },
      {
        id: 'q9-3',
        prompt: '¿Qué beneficio formativo otorga la lectura crítica de esta obra?',
        options: [
          'Una coraza contra el engaño y voz firme para defender la justicia',
          'Memorización de datos sin aplicación práctica',
          'Distanciamiento de los problemas del país',
          'Aprender técnicas de oratoria comercial'
        ],
        correctIndex: 0,
        explanation: 'Se concluye que la lectura crítica brinda discernimiento y una voz comprometida con la verdad cívica.'
      }
    ]
  },
  {
    id: 'lec-10',
    level: 10,
    title: 'Hombres de Maíz: La Gran Epopeya del Trabajo Técnico',
    genre: 'Literatura y Técnica Kinal',
    targetWpm: 210,
    xpReward: 300,
    difficulty: 'Avanzado',
    author: 'Cátedra Mayor de Humanidades Kinal',
    pedagogicalSource: 'Fundación Kinal — Cátedra Mayor de Humanidades, Vocación Técnica y Trascendencia Social',
    competencies: ['Comprensión sintética y valorativa', 'Ética profesional y vocacional', 'Identidad cultural y servicio ciudadano'],
    vocabulary: [
      { word: 'cosmovisión', meaning: 'Manera de ver e interpretar el mundo y la existencia que tiene una cultura o pueblo.' },
      { word: 'fecunda', meaning: 'Que produce de manera abundante, fértil y provechosa.' },
      { word: 'umbral', meaning: 'Parte inicial, entrada o principio de una nueva etapa vital o profesional.' }
    ],
    estimatedMinutes: 4,
    unlocked: false,
    completed: false,
    content: `En la cosmovisión maya, el ser humano no fue forjado del metal frío ni de la piedra estéril, sino de la harina fecunda del maíz amasada con sudor, pensamiento y esperanza. Esta herencia milenaria cobra vida hoy en las aulas, talleres y laboratorios de Fundación Kinal, donde la destreza técnica se hermana indisolublemente con la formación humana y la dignidad del trabajo bien realizado. El verdadero maestro técnico no es aquel que se conforma con dominar los instrumentos de su oficio, sino quien comprende que cada circuito ensamblado, cada línea de software depurada y cada motor ajustado son expresiones concretas de servicio a la familia y a la patria. Alcanzar este décimo nivel no es el final de una ruta, sino el umbral de una vida profesional caracterizada por la excelencia académica, la rectitud ética y el amor inquebrantable a Guatemala.`,
    wordCount: 147,
    questions: [
      {
        id: 'q10-1',
        prompt: '¿Con qué elemento se asocia el trabajo técnico en las aulas de Fundación Kinal?',
        options: [
          'Con la ganancia monetaria inmediata sin importar los medios',
          'Con la formación humana y la dignidad del trabajo bien hecho al servicio comunitario',
          'Con el aislamiento de la realidad social de Guatemala',
          'Con la competencia destructiva entre compañeros'
        ],
        correctIndex: 1,
        explanation: 'El texto destaca que la destreza técnica se hermana con la formación ética y la dignidad del trabajo servicial.'
      },
      {
        id: 'q10-2',
        prompt: 'Según el texto, ¿qué caracteriza al auténtico maestro técnico?',
        options: [
          'Comprender que cada labor realizada es una expresión de servicio a la familia y a la nación',
          'Poseer las herramientas más caras del mercado',
          'Trabajar únicamente de manera solitaria',
          'Evitar compartir sus conocimientos con los aprendices'
        ],
        correctIndex: 0,
        explanation: 'Se señala que el verdadero maestro ve en su oficio una vía concreta de servicio para el bien común.'
      },
      {
        id: 'q10-3',
        prompt: '¿Qué representa alcanzar el décimo nivel de lectura en esta plataforma?',
        options: [
          'El cierre definitivo de todo aprendizaje',
          'El umbral de una vida profesional de excelencia, rectitud y compromiso con Guatemala',
          'Un requisito burocrático sin trascendencia formativa',
          'La obtención de un título honorífico sin esfuerzo'
        ],
        correctIndex: 1,
        explanation: 'El epílogo proclama que culminar el décimo nivel es el inicio de una vida técnica guiada por la excelencia y la ética.'
      }
    ]
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-student-01',
    name: 'Juan Pablo Morales Castillo',
    email: 'jmorales@kinal.edu.gt',
    role: 'STUDENT_ROLE',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    grade: '5to Perito en Computación',
    section: 'A',
    status: 'Activo',
    stats: {
      totalXp: 1840,
      currentLevel: 4,
      averageWpm: 172,
      comprehensionRate: 92,
      streakDays: 7,
      completedReadings: 3
    }
  },
  {
    id: 'usr-teacher-01',
    name: 'Prof. Carlos Eduardo Méndez',
    email: 'cmendez@kinal.edu.gt',
    role: 'TEACHER_ROLE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    grade: 'Coordinador de Lengua y Literatura',
    section: 'Ciclo Diversificado',
    status: 'Activo'
  },
  {
    id: 'usr-admin-01',
    name: 'Licda. Marcela Estrada',
    email: 'mestrada@kinal.edu.gt',
    role: 'ADMIN_ROLE',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    grade: 'Dirección Académica',
    section: 'Fundación Kinal',
    status: 'Activo'
  }
];

export const MOCK_STUDENTS_PERFORMANCE: StudentPerformance[] = [
  {
    student: {
      id: 'usr-st-01',
      name: 'Juan Pablo Morales Castillo',
      email: 'jmorales@kinal.edu.gt',
      role: 'STUDENT_ROLE',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      grade: '5to Perito en Computación',
      section: 'A',
      status: 'Activo',
      stats: {
        totalXp: 1840,
        currentLevel: 4,
        averageWpm: 172,
        comprehensionRate: 92,
        streakDays: 7,
        completedReadings: 3
      }
    },
    averageWpm: 172,
    comprehensionRate: 92,
    streakDays: 7,
    completedReadings: 3,
    status: 'Destacado',
    weeklyHistory: [
      { week: 'Sem 1', wpm: 142, comprehension: 88 },
      { week: 'Sem 2', wpm: 156, comprehension: 90 },
      { week: 'Sem 3', wpm: 165, comprehension: 94 },
      { week: 'Sem 4', wpm: 172, comprehension: 92 }
    ],
    recentReadings: [
      { title: 'El Popol Vuh y el Origen del Maíz', date: 'Ayer', wpm: 150, score: 67 },
      { title: 'El Sombrerón de la Calle Real', date: 'Hace 3 días', wpm: 142, score: 100 },
      { title: 'El Quetzal y el Guardián', date: 'Hace 6 días', wpm: 128, score: 100 }
    ]
  },
  {
    student: {
      id: 'usr-st-02',
      name: 'Diego Alejandro Gómez Vásquez',
      email: 'dgomez@kinal.edu.gt',
      role: 'STUDENT_ROLE',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      grade: '5to Perito en Computación',
      section: 'A',
      status: 'Activo',
      stats: {
        totalXp: 2450,
        currentLevel: 5,
        averageWpm: 188,
        comprehensionRate: 96,
        streakDays: 12,
        completedReadings: 4
      }
    },
    averageWpm: 188,
    comprehensionRate: 96,
    streakDays: 12,
    completedReadings: 4,
    status: 'Destacado',
    weeklyHistory: [
      { week: 'Sem 1', wpm: 155, comprehension: 92 },
      { week: 'Sem 2', wpm: 168, comprehension: 95 },
      { week: 'Sem 3', wpm: 180, comprehension: 98 },
      { week: 'Sem 4', wpm: 188, comprehension: 96 }
    ],
    recentReadings: [
      { title: 'Código y Algoritmos: La Chispa Binaria', date: 'Hoy', wpm: 188, score: 100 },
      { title: 'El Popol Vuh y el Origen del Maíz', date: 'Hace 2 días', wpm: 175, score: 100 }
    ]
  },
  {
    student: {
      id: 'usr-st-03',
      name: 'Brandon Josué Hernández López',
      email: 'bhernandez@kinal.edu.gt',
      role: 'STUDENT_ROLE',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      grade: '5to Perito en Computación',
      section: 'A',
      status: 'Activo',
      stats: {
        totalXp: 980,
        currentLevel: 2,
        averageWpm: 118,
        comprehensionRate: 64,
        streakDays: 1,
        completedReadings: 1
      }
    },
    averageWpm: 118,
    comprehensionRate: 64,
    streakDays: 1,
    completedReadings: 1,
    status: 'Atención Requerida',
    weeklyHistory: [
      { week: 'Sem 1', wpm: 105, comprehension: 58 },
      { week: 'Sem 2', wpm: 112, comprehension: 60 },
      { week: 'Sem 3', wpm: 115, comprehension: 62 },
      { week: 'Sem 4', wpm: 118, comprehension: 64 }
    ],
    recentReadings: [
      { title: 'El Quetzal y el Guardián', date: 'Hace 4 días', wpm: 118, score: 64 }
    ]
  },
  {
    student: {
      id: 'usr-st-04',
      name: 'Josué Daniel Cabrera Aguilar',
      email: 'jcabrera@kinal.edu.gt',
      role: 'STUDENT_ROLE',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      grade: '5to Perito en Computación',
      section: 'B',
      status: 'Activo',
      stats: {
        totalXp: 1520,
        currentLevel: 3,
        averageWpm: 154,
        comprehensionRate: 85,
        streakDays: 5,
        completedReadings: 2
      }
    },
    averageWpm: 154,
    comprehensionRate: 85,
    streakDays: 5,
    completedReadings: 2,
    status: 'En Progreso',
    weeklyHistory: [
      { week: 'Sem 1', wpm: 130, comprehension: 78 },
      { week: 'Sem 2', wpm: 140, comprehension: 82 },
      { week: 'Sem 3', wpm: 148, comprehension: 86 },
      { week: 'Sem 4', wpm: 154, comprehension: 85 }
    ],
    recentReadings: [
      { title: 'El Sombrerón de la Calle Real', date: 'Hace 2 días', wpm: 154, score: 85 }
    ]
  },
  {
    student: {
      id: 'usr-st-05',
      name: 'Gabriel Estuardo Álvarez Ortiz',
      email: 'galvarez@kinal.edu.gt',
      role: 'STUDENT_ROLE',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      grade: '4to Bachillerato en Computación',
      section: 'A',
      status: 'Activo',
      stats: {
        totalXp: 2100,
        currentLevel: 4,
        averageWpm: 168,
        comprehensionRate: 90,
        streakDays: 9,
        completedReadings: 3
      }
    },
    averageWpm: 168,
    comprehensionRate: 90,
    streakDays: 9,
    completedReadings: 3,
    status: 'Destacado',
    weeklyHistory: [
      { week: 'Sem 1', wpm: 138, comprehension: 84 },
      { week: 'Sem 2', wpm: 150, comprehension: 88 },
      { week: 'Sem 3', wpm: 162, comprehension: 91 },
      { week: 'Sem 4', wpm: 168, comprehension: 90 }
    ],
    recentReadings: [
      { title: 'El Popol Vuh y el Origen del Maíz', date: 'Ayer', wpm: 168, score: 90 }
    ]
  },
  {
    student: {
      id: 'usr-st-06',
      name: 'Rodrigo Antonio Fuentes Solís',
      email: 'rfuentes@kinal.edu.gt',
      role: 'STUDENT_ROLE',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      grade: '5to Perito en Electricidad',
      section: 'A',
      status: 'Activo',
      stats: {
        totalXp: 1350,
        currentLevel: 3,
        averageWpm: 146,
        comprehensionRate: 80,
        streakDays: 4,
        completedReadings: 2
      }
    },
    averageWpm: 146,
    comprehensionRate: 80,
    streakDays: 4,
    completedReadings: 2,
    status: 'En Progreso',
    weeklyHistory: [
      { week: 'Sem 1', wpm: 125, comprehension: 74 },
      { week: 'Sem 2', wpm: 134, comprehension: 78 },
      { week: 'Sem 3', wpm: 140, comprehension: 82 },
      { week: 'Sem 4', wpm: 146, comprehension: 80 }
    ],
    recentReadings: [
      { title: 'El Sombrerón de la Calle Real', date: 'Hace 3 días', wpm: 146, score: 80 }
    ]
  },
  {
    student: {
      id: 'usr-st-07',
      name: 'Mario Roberto Paz Quiñónez',
      email: 'mpaz@kinal.edu.gt',
      role: 'STUDENT_ROLE',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      grade: '4to Bachillerato en Computación',
      section: 'B',
      status: 'Activo',
      stats: {
        totalXp: 740,
        currentLevel: 2,
        averageWpm: 110,
        comprehensionRate: 58,
        streakDays: 0,
        completedReadings: 1
      }
    },
    averageWpm: 110,
    comprehensionRate: 58,
    streakDays: 0,
    completedReadings: 1,
    status: 'Atención Requerida',
    weeklyHistory: [
      { week: 'Sem 1', wpm: 100, comprehension: 50 },
      { week: 'Sem 2', wpm: 104, comprehension: 52 },
      { week: 'Sem 3', wpm: 108, comprehension: 55 },
      { week: 'Sem 4', wpm: 110, comprehension: 58 }
    ],
    recentReadings: [
      { title: 'El Quetzal y el Guardián', date: 'Hace 8 días', wpm: 110, score: 58 }
    ]
  },
  {
    student: {
      id: 'usr-st-08',
      name: 'Javier Alejandro Morales Rivas',
      email: 'jmoralesr@kinal.edu.gt',
      role: 'STUDENT_ROLE',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      grade: '5to Perito en Mecánica',
      section: 'A',
      status: 'Activo',
      stats: {
        totalXp: 1680,
        currentLevel: 3,
        averageWpm: 160,
        comprehensionRate: 88,
        streakDays: 6,
        completedReadings: 2
      }
    },
    averageWpm: 160,
    comprehensionRate: 88,
    streakDays: 6,
    completedReadings: 2,
    status: 'En Progreso',
    weeklyHistory: [
      { week: 'Sem 1', wpm: 135, comprehension: 80 },
      { week: 'Sem 2', wpm: 145, comprehension: 84 },
      { week: 'Sem 3', wpm: 152, comprehension: 86 },
      { week: 'Sem 4', wpm: 160, comprehension: 88 }
    ],
    recentReadings: [
      { title: 'El Sombrerón de la Calle Real', date: 'Hace 4 días', wpm: 160, score: 88 }
    ]
  }
];
