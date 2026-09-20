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
                "id": "q1-1",
                "prompt": "¿Dónde vivía el joven quetzal de plumaje esmeralda?",
                "options": [
                      "En las costas cálidas del Océano Pacífico",
                      "En las altas cumbres de la Sierra de las Minas",
                      "En las cuevas subterráneas de Alta Verapaz",
                      "En el cráter del Volcán de Fuego"
                ],
                "correctIndex": 1,
                "explanation": "El texto sitúa explícitamente la historia en las altas cumbres de la Sierra de las Minas entre helechos gigantes."
          },
          {
                "id": "q1-2",
                "prompt": "¿Qué lección transmitió el anciano guardabosques al quetzal?",
                "options": [
                      "Que el vuelo más veloz es siempre el más respetado",
                      "Que debía alejarse de los seres humanos para sobrevivir",
                      "Que la verdadera libertad requiere serenidad y disciplina ante las tormentas",
                      "Que los quetzales solo deben alimentarse de frutos silvestres"
                ],
                "correctIndex": 2,
                "explanation": "El guardabosques enseñó que la libertad reside en la serenidad para contemplar el camino y la disciplina ante las tormentas."
          },
          {
                "id": "q1-3",
                "prompt": "¿Qué valor humano se resalta al final de la lectura?",
                "options": [
                      "El espíritu de servicio y ayuda desinteresada",
                      "La competencia por ser el más fuerte",
                      "El aislamiento del resto de la comunidad",
                      "La búsqueda de riquezas materiales"
                ],
                "correctIndex": 0,
                "explanation": "El texto concluye enfatizando que el talento brilla más cuando se pone al servicio de los demás guiando a los caminantes."
          },
          {
                "id": "q1-4",
                "prompt": "¿Qué diferenciaba a este quetzal de las demás aves del bosque nuboso?",
                "options": [
                      "Que tenía las alas de color dorado",
                      "Que observaba con atención cada detalle del bosque en vez de solo volar en círculos",
                      "Que no podía volar en las alturas",
                      "Que vivía en soledad dentro de un tronco hueco"
                ],
                "correctIndex": 1,
                "explanation": "A diferencia de otras aves que solo volaban en círculos sobre el dosel, este quetzal observaba con paciencia cada detalle del bosque."
          },
          {
                "id": "q1-5",
                "prompt": "¿Qué tipo de vientos constantes se mencionan como parte del clima del bosque?",
                "options": [
                      "Los vientos alisios",
                      "Los vientos polares",
                      "Los vientos monzónicos",
                      "Los huracanes del Caribe"
                ],
                "correctIndex": 0,
                "explanation": "El texto menciona explícitamente la fuerza de los vientos alisios que soplan en la región."
          },
          {
                "id": "q1-6",
                "prompt": "¿Qué árboles centenarios crecían de manera paciente en la montaña?",
                "options": [
                      "Los cedros centenarios",
                      "Los sauces llorones",
                      "Los eucaliptos australianos",
                      "Las palmeras de coco"
                ],
                "correctIndex": 0,
                "explanation": "El relato destaca la observación del crecimiento paciente de los cedros centenarios."
          },
          {
                "id": "q1-7",
                "prompt": "¿Qué labor solidaria realizaba el quetzal cada amanecer?",
                "options": [
                      "Recolectaba semillas para su nido",
                      "Descendía para guiar a los caminantes extraviados",
                      "Competía en carreras aéreas con los halcones",
                      "Cantaba para despertar al guardabosques"
                ],
                "correctIndex": 1,
                "explanation": "El texto narra que descendía cada amanecer para orientar y guiar a los caminantes perdidos en la niebla."
          },
          {
                "id": "q1-8",
                "prompt": "¿Qué vegetación gigante caracteriza el paisaje donde danza la niebla?",
                "options": [
                      "Cactus espinosos",
                      "Helechos gigantes",
                      "Arbustos desérticos",
                      "Bambúes asiáticos"
                ],
                "correctIndex": 1,
                "explanation": "La historia comienza describiendo la niebla que danza entre los helechos gigantes de la Sierra de las Minas."
          },
          {
                "id": "q1-9",
                "prompt": "Según el texto, ¿por qué la velocidad de las alas no es suficiente para la libertad?",
                "options": [
                      "Porque las alas se cansan rápidamente",
                      "Porque se necesita serenidad para contemplar el camino y disciplina para sortear tormentas",
                      "Porque el viento en contra impide cualquier vuelo veloz",
                      "Porque los depredadores vuelan más rápido"
                ],
                "correctIndex": 1,
                "explanation": "El anciano guardabosques explica que la libertad no reside solo en la velocidad, sino en la serenidad y la disciplina."
          },
          {
                "id": "q1-10",
                "prompt": "¿Qué sensación natural describe el quetzal al observar el contacto del agua con el suelo?",
                "options": [
                      "El sonido del rocío al tocar la tierra fértil",
                      "El estruendo de los rayos en el fango",
                      "El calor sofocante del mediodía",
                      "La sequía persistente en las ramas"
                ],
                "correctIndex": 0,
                "explanation": "El texto resalta su atención al escuchar el sonido del rocío al tocar la tierra fértil."
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
                "id": "q2-1",
                "prompt": "¿Qué instrumento musical tocaba el Sombrerón según la leyenda?",
                "options": [
                      "Una chirimía de barro cocido",
                      "Una guitarra de plata",
                      "Un tambor de cuero de venado",
                      "Una marimba de tecomates"
                ],
                "correctIndex": 1,
                "explanation": "La leyenda narra que en las noches estrelladas se escuchaban las notas cristalinas de una guitarra de plata."
          },
          {
                "id": "q2-2",
                "prompt": "¿Qué labor minuciosa realizaba el Sombrerón con los caballos?",
                "options": [
                      "Cambiaba sus herraduras de hierro",
                      "Trenzaba sus crines con primorosa paciencia",
                      "Los alimentaba con manzanas silvestres",
                      "Los soltaba para que corrieran por las montañas"
                ],
                "correctIndex": 1,
                "explanation": "El personaje solía trenzar las crines de los corceles con esmero y paciencia artística."
          },
          {
                "id": "q2-3",
                "prompt": "¿Por qué salían los artesanos del barrio con lámparas de aceite?",
                "options": [
                      "Para perseguir y atrapar al personaje misterioso",
                      "Para contemplar las trenzas perfectas convertidas en obras de arte",
                      "Para iluminar la iglesia principal del pueblo",
                      "Para vigilar las carretas de madera"
                ],
                "correctIndex": 1,
                "explanation": "Los artesanos salían asombrados para contemplar cómo la precisión de unas manos invisibles transformaba lo cotidiano en arte."
          },
          {
                "id": "q2-4",
                "prompt": "¿Cómo describe el relato la vestimenta y apariencia del Sombrerón?",
                "options": [
                      "Un gigante con túnica negra y capa de terciopelo",
                      "Un diminuto personaje de botas relucientes y cinto relampagueante",
                      "Un jinete misterioso con armadura colonial de plata",
                      "Un mendigo anciano con bastón de madera"
                ],
                "correctIndex": 1,
                "explanation": "El texto lo retrata como un personaje diminuto que portaba botas brillantes y un cinto relampagueante."
          },
          {
                "id": "q2-5",
                "prompt": "¿En qué lugar de Santiago se desarrollaban las apariciones del Sombrerón?",
                "options": [
                      "En las empedradas calles de la Calle Real",
                      "En los muelles del Lago de Atitlán",
                      "En la cima del Cerro de la Cruz",
                      "En los lavaderos públicos del convento"
                ],
                "correctIndex": 0,
                "explanation": "El escenario colonial son las empedradas calles de la Calle Real de Santiago."
          },
          {
                "id": "q2-6",
                "prompt": "¿Cuál era el único anhelo que movía las acciones del Sombrerón?",
                "options": [
                      "Llevarse las joyas de los balcones",
                      "Dejar una estela de música y misterio bajo los balcones coloniales",
                      "Asustar a los niños desobedientes del pueblo",
                      "Buscar oro enterrado en las plazas"
                ],
                "correctIndex": 1,
                "explanation": "El relato afirma que su único anhelo era dejar una huella de música y misterio bajo los balcones tallados."
          },
          {
                "id": "q2-7",
                "prompt": "¿Qué actitud mostraba el Sombrerón hacia los animales y seres vivos?",
                "options": [
                      "Los espantaba con ruidos estridentes",
                      "Jamás lastimaba a criatura alguna",
                      "Los montaba sin permiso durante horas",
                      "Les cortaba el pelo para hacer cuerdas"
                ],
                "correctIndex": 1,
                "explanation": "El texto aclara expresamente que jamás lastimaba a criatura alguna durante sus recorridos nocturnos."
          },
          {
                "id": "q2-8",
                "prompt": "¿De qué material estaban elaborados los balcones coloniales mencionados?",
                "options": [
                      "De hierro fundido europeo",
                      "De madera tallada",
                      "De piedra volcánica negra",
                      "De ladrillo vidriado"
                ],
                "correctIndex": 1,
                "explanation": "El texto resalta los tradicionales balcones coloniales de madera tallada de Santiago."
          },
          {
                "id": "q2-9",
                "prompt": "¿Bajo qué condiciones climáticas y lunares aparecía la música en la calle?",
                "options": [
                      "En noches lluviosas de tormenta eléctrica",
                      "En noches estrelladas de luna llena",
                      "En madrugadas frías de niebla espesa",
                      "En tardes soleadas de fiesta patronal"
                ],
                "correctIndex": 1,
                "explanation": "Los abuelos cuentan que ocurría específicamente en noches estrelladas de luna llena."
          },
          {
                "id": "q2-10",
                "prompt": "¿Qué enseñanza cultural subraya la conclusión de la leyenda?",
                "options": [
                      "Que las leyendas coloniales deben olvidarse con el progreso",
                      "Que el respeto por las narraciones orales preserva el alma de la identidad guatemalteca",
                      "Que los caballos deben guardarse bajo llave por la noche",
                      "Que la música nocturna perturba el descanso cívico"
                ],
                "correctIndex": 1,
                "explanation": "La conclusión afirma que respetar la tradición oral guarda y preserva el alma de la identidad nacional."
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
                "id": "q3-1",
                "prompt": "¿Quiénes eran los Progenitores que dialogaron para crear al ser humano?",
                "options": [
                      "Hunahpú e Ixbalanqué",
                      "Tepeu y Gucumatz",
                      "Tecún Umán y Kaibil Balam",
                      "Quetzalcóatl y Huitzilopochtli"
                ],
                "correctIndex": 1,
                "explanation": "El Popol Vuh nombra como Progenitores primordiales a Tepeu y Gucumatz."
          },
          {
                "id": "q3-2",
                "prompt": "¿De qué mítico lugar procedían las mazorcas sagradas amarillas y blancas?",
                "options": [
                      "Del Valle de Panchoy",
                      "De Paxil y Cayalá",
                      "De las cumbres del Tajumulco",
                      "De las riberas del Río Dulce"
                ],
                "correctIndex": 1,
                "explanation": "Las mazorcas fueron traídas por los animales sabios desde las tierras fértiles de Paxil y Cayalá."
          },
          {
                "id": "q3-3",
                "prompt": "¿Por qué fracasaron los primeros ensayos de creación con lodo y madera?",
                "options": [
                      "Porque eran demasiado pesados para caminar",
                      "Porque el lodo era quebradizo y la madera carecía de memoria y entendimiento",
                      "Porque consumían demasiado maíz en las cosechas",
                      "Porque no podían comunicarse en lengua kʼicheʼ"
                ],
                "correctIndex": 1,
                "explanation": "El lodo se deshacía con el agua y los seres de madera no tenían memoria ni podían dar gracias a los Creadores."
          },
          {
                "id": "q3-4",
                "prompt": "¿Cuáles eran los nombres de los primeros cuatro seres humanos formados?",
                "options": [
                      "Balam Quitzé, Balam Acab, Mahucutah e Iqui Balam",
                      "Hunahpú, Vucub Caquix, Zipacná y Cabracán",
                      "Atitlán, Petén, Izabal y Quiché",
                      "Gucumatz, Huracán, Tohil y Jacawitz"
                ],
                "correctIndex": 0,
                "explanation": "Los primeros cuatro hombres creados de maíz fueron Balam Quitzé, Balam Acab, Mahucutah e Iqui Balam."
          },
          {
                "id": "q3-5",
                "prompt": "¿Qué partes del ser humano fueron moldeadas con la masa del grano sagrado?",
                "options": [
                      "Únicamente los cabellos y las uñas",
                      "Los músculos, la sangre y el aliento vital",
                      "Los ojos y las orejas para escuchar a los dioses",
                      "Las vestiduras y sus armas ceremoniales"
                ],
                "correctIndex": 1,
                "explanation": "Con la masa de maíz blanco y amarillo se formaron los músculos, la sangre y el aliento vital de los primeros humanos."
          },
          {
                "id": "q3-6",
                "prompt": "¿Qué reinaba en el principio antes de que iniciara la creación del cosmos?",
                "options": [
                      "La calma y el silencio sobre las aguas primordiales",
                      "Un gran fuego volcánico incesante",
                      "Guerras continuas entre los dioses del inframundo",
                      "Un viento huracanado sin fin"
                ],
                "correctIndex": 0,
                "explanation": "El relato describe que al principio solo existían la calma y el silencio sobre la superficie de las aguas."
          },
          {
                "id": "q3-7",
                "prompt": "¿Qué cualidad fundamental buscaban los Creadores en el ser humano que iban a formar?",
                "options": [
                      "Que fuera un guerrero implacable contra otros seres",
                      "Que estuviera dotado de entendimiento y fuera capaz de agradecer la belleza del universo",
                      "Que acumulara oro y piedras de jade",
                      "Que pudiera volar más alto que las aves de rapiña"
                ],
                "correctIndex": 1,
                "explanation": "Los dioses deseaban un ser con entendimiento, capaz de venerar los astros y agradecer la vida."
          },
          {
                "id": "q3-8",
                "prompt": "¿Quiénes guiaron y llevaron las mazorcas nutricias hacia los Progenitores?",
                "options": [
                      "Los animales sabios",
                      "Los sacerdotes de Xibalbá",
                      "Los gigantes del bosque",
                      "Las estrellas fugaces"
                ],
                "correctIndex": 0,
                "explanation": "Fueron los animales sabios (el zorro, el coyote, el loro y el cuervo) quienes mostraron el camino al maíz."
          },
          {
                "id": "q3-9",
                "prompt": "¿Cómo contemplaron la creación los primeros cuatro seres humanos al cobrar vida?",
                "options": [
                      "Con temor y deseo de huir del mundo",
                      "Con ojos claros, comprendiendo la ciencia de la tierra y sintiendo gratitud",
                      "Con ceguera y desorientación completa",
                      "Con soberbia frente a los animales del campo"
                ],
                "correctIndex": 1,
                "explanation": "El texto señala que contemplaron el cosmos con ojos claros y gratitud hacia la creación divina."
          },
          {
                "id": "q3-10",
                "prompt": "Además del conocimiento de la tierra, ¿qué virtud esencial descubrieron los seres de maíz?",
                "options": [
                      "El dominio militar sobre los pueblos vecinos",
                      "El valor de la gratitud hacia la vida",
                      "La construcción de pirámides gigantescas",
                      "El cultivo acelerado de plantas medicinales"
                ],
                "correctIndex": 1,
                "explanation": "El Popol Vuh enfatiza que comprendieron el valor espiritual de la gratitud hacia la existencia."
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
                "id": "q4-1",
                "prompt": "¿Qué es exactamente un algoritmo según la definición técnica del texto?",
                "options": [
                      "Un truco de magia reservado para computadoras cuánticas",
                      "Una secuencia precisa y finita de instrucciones diseñada para resolver un problema paso a paso",
                      "Un lenguaje de programación exclusivo de redes sociales",
                      "Un circuito electrónico que almacena contraseñas"
                ],
                "correctIndex": 1,
                "explanation": "El texto define el algoritmo como una secuencia precisa, estructurada y finita de pasos lógicos."
          },
          {
                "id": "q4-2",
                "prompt": "¿Qué principio fundamental antecede a la excelencia técnica en la programación?",
                "options": [
                      "La velocidad de escritura en el teclado",
                      "La claridad conceptual previa",
                      "El costo del equipo de computación",
                      "La cantidad de líneas de código generadas"
                ],
                "correctIndex": 1,
                "explanation": "La lectura postula claramente que la claridad conceptual antecede en todo momento a la excelencia técnica."
          },
          {
                "id": "q4-3",
                "prompt": "¿Para quién debe escribir código un programador ético y profesional?",
                "options": [
                      "Únicamente para los procesadores de silicio",
                      "Para que otro ser humano lo comprenda, mantenga y mejore",
                      "Para ocultar sus secretos a sus compañeros de equipo",
                      "Para generar virus informáticos indetectables"
                ],
                "correctIndex": 1,
                "explanation": "Un buen programador escribe pensando en la legibilidad y colaboración con otros seres humanos."
          },
          {
                "id": "q4-4",
                "prompt": "¿Qué medio mecánico utilizaban los primeros pioneros para programar computadoras?",
                "options": [
                      "Tarjetas perforadas",
                      "Disquetes magnéticos de tres pulgadas",
                      "Pantallas táctiles capacitivas",
                      "Memorias flash USB"
                ],
                "correctIndex": 0,
                "explanation": "El texto menciona la evolución histórica desde los pioneros con tarjetas perforadas hasta la actualidad."
          },
          {
                "id": "q4-5",
                "prompt": "¿Qué tecnología de vanguardia implementan los desarrolladores contemporáneos?",
                "options": [
                      "Redes neuronales artificiales",
                      "Telégrafos de código Morse",
                      "Cálculos en ábaco de madera",
                      "Válvulas de vacío al vacío"
                ],
                "correctIndex": 0,
                "explanation": "Se destaca la implementación contemporánea de redes neuronales artificiales y modelos avanzados."
          },
          {
                "id": "q4-6",
                "prompt": "En la ética del trabajo técnico, ¿qué simboliza una función de software optimizada?",
                "options": [
                      "El orgullo personal del ingeniero",
                      "Respeto hacia quien utilizará esa solución tecnológica",
                      "Una justificación para cobrar honorarios más altos",
                      "Una forma de reducir el sueldo de los diseñadores"
                ],
                "correctIndex": 1,
                "explanation": "Optimizar un código representa un acto de respeto y empatía hacia los usuarios finales."
          },
          {
                "id": "q4-7",
                "prompt": "¿Qué base formativa sustenta la disciplina rigurosa de los talleres de informática?",
                "options": [
                      "El azar y la experimentación sin orden",
                      "El pensamiento lógico estructurado",
                      "La intuición sin verificación de datos",
                      "La copia indiscriminada de foros en internet"
                ],
                "correctIndex": 1,
                "explanation": "El texto subraya que el pensamiento lógico es el pilar de la disciplina en el desarrollo de software."
          },
          {
                "id": "q4-8",
                "prompt": "¿Por qué se desmiente en la lectura que programar sea un acto de magia misteriosa?",
                "options": [
                      "Porque depende de leyes mecánicas del vapor",
                      "Porque se fundamenta en pasos metódicos, verificables y racionales",
                      "Porque cualquiera puede programar sin estudiar ni practicar",
                      "Porque las computadoras no se equivocan jamás"
                ],
                "correctIndex": 1,
                "explanation": "La ingeniería de software es ciencia y método racional, no artificios inexplicables."
          },
          {
                "id": "q4-9",
                "prompt": "¿Qué lugar formativo se menciona al inicio como cuna de la compilación de código?",
                "options": [
                      "Los talleres de informática",
                      "Las oficinas gubernamentales",
                      "Las salas de cine digital",
                      "Los cafés de videojuegos"
                ],
                "correctIndex": 0,
                "explanation": "El texto alude al trabajo riguroso que se vive en los talleres y laboratorios de informática."
          },
          {
                "id": "q4-10",
                "prompt": "¿Qué cualidad de las instrucciones garantiza que un algoritmo no se ejecute infinitamente?",
                "options": [
                      "Que sean infinitas y complejas",
                      "Que sean finitas y tengan un criterio claro de terminación",
                      "Que dependan del clima del procesador",
                      "Que contengan miles de variables aleatorias"
                ],
                "correctIndex": 1,
                "explanation": "Por definición, un algoritmo debe constar de una serie finita y determinada de pasos."
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
                "id": "q5-1",
                "prompt": "¿Qué valle histórico alberga los muros de calicanto de la Antigua Guatemala?",
                "options": [
                      "El Valle de las Vacas",
                      "El Valle de Panchoy",
                      "El Valle del Motagua",
                      "El Valle de la Ermita"
                ],
                "correctIndex": 1,
                "explanation": "El relato histórico se sitúa en el emblemático Valle de Panchoy, asiento de Santiago de los Caballeros."
          },
          {
                "id": "q5-2",
                "prompt": "¿Qué herramienta utilizaban los faroleros coloniales para encender las luminarias?",
                "options": [
                      "Fósforos de azufre importados",
                      "Varas de pino encendidas",
                      "Mecheros de gas butano",
                      "Pilas eléctricas primarias"
                ],
                "correctIndex": 1,
                "explanation": "Los operarios caminaban con varas de ocote y pino encendiendo linterna tras linterna."
          },
          {
                "id": "q5-3",
                "prompt": "¿Qué oficios de trabajadores se beneficiaban del alumbrado para regresar seguros?",
                "options": [
                      "Marineros y pescadores de altamar",
                      "Artesanos, tejedores y carpinteros",
                      "Pilotos aviadores y maquinistas",
                      "Mineros de carbón subterráneo"
                ],
                "correctIndex": 1,
                "explanation": "El texto nombra a los artesanos, tejedores y carpinteros que volvían de sus faenas al hogar."
          },
          {
                "id": "q5-4",
                "prompt": "¿Tras qué accidente geográfico se oculta el sol al atardecer en la ciudad colonial?",
                "options": [
                      "El Volcán Tajumulco",
                      "La silueta imponente del Volcán de Agua",
                      "El Volcán Pacaya",
                      "La Sierra de los Cuchumatanes"
                ],
                "correctIndex": 1,
                "explanation": "La puesta de sol se describe recortada tras la silueta del Volcán de Agua (Hunapú)."
          },
          {
                "id": "q5-5",
                "prompt": "¿En qué siglo histórico se contextualiza la labor cotidiana de estos faroleros?",
                "options": [
                      "En el siglo catorce",
                      "En el siglo dieciocho",
                      "En el siglo veintiuno",
                      "En el siglo diez antes de Cristo"
                ],
                "correctIndex": 1,
                "explanation": "El texto especifica que se trata de los faroleros del siglo dieciocho en la capital del Reino."
          },
          {
                "id": "q5-6",
                "prompt": "¿De qué dependía la seguridad ciudadana nocturna según la crónica?",
                "options": [
                      "De las murallas y fosos defensivos",
                      "De la constancia y disciplina diaria de los faroleros",
                      "De que nadie saliera de sus casas bajo pena de multa",
                      "De los carruajes blindados de la época"
                ],
                "correctIndex": 1,
                "explanation": "La seguridad pública dependía de la puntualidad y constancia cívica de quienes iluminaban la ciudad."
          },
          {
                "id": "q5-7",
                "prompt": "¿Qué color de iluminación bañaba las empedradas calles de la ciudad colonial?",
                "options": [
                      "Luz blanca fluorescente",
                      "Luz ámbar de faroles coloniales",
                      "Luz azulada de gas xenón",
                      "Luz roja de bengalas"
                ],
                "correctIndex": 1,
                "explanation": "Los faroles coloniales emitían una cálida luz ámbar sobre las calles de calicanto."
          },
          {
                "id": "q5-8",
                "prompt": "¿Cuántos siglos de historia y resiliencia resguardan los muros de la ciudad?",
                "options": [
                      "Apenas cincuenta años",
                      "Cinco siglos de historia",
                      "Dos milenios ininterrumpidos",
                      "Diez siglos de conquista"
                ],
                "correctIndex": 1,
                "explanation": "El texto abre destacando el eco de cinco siglos de historia y resiliencia comunitaria."
          },
          {
                "id": "q5-9",
                "prompt": "¿Cómo vincula el texto el oficio del farolero con los jóvenes estudiantes técnicos?",
                "options": [
                      "Les aconseja cambiar de carrera hacia la herrería",
                      "Los inspira a iluminar el futuro con una profesión honesta y comprometida",
                      "Les exige trabajar únicamente en horarios nocturnos",
                      "Les pide restaurar los faroles de calicanto"
                ],
                "correctIndex": 1,
                "explanation": "El compromiso cívico de antaño inspira a los jóvenes técnicos a servir con ética a su sociedad."
          },
          {
                "id": "q5-10",
                "prompt": "¿Qué tipo de material constructivo tradicional forma los muros históricos de Panchoy?",
                "options": [
                      "Concreto armado con varillas de acero",
                      "Calicanto (mezcla de cal, arena y canto rodado)",
                      "Tablayeso prefabricado",
                      "Plástico reforzado con fibra"
                ],
                "correctIndex": 1,
                "explanation": "Los muros coloniales fueron levantados con la técnica ancestral de calicanto."
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
                "id": "q6-1",
                "prompt": "¿Qué templo monumental se eleva en la selva como antena astronómica maya?",
                "options": [
                      "El Templo de las Inscripciones",
                      "El Templo del Gran Jaguar",
                      "El Templo de Rosalila",
                      "La Pirámide de Kukulcán"
                ],
                "correctIndex": 1,
                "explanation": "El texto describe las crestas del Templo del Gran Jaguar (Templo I de Tikal)."
          },
          {
                "id": "q6-2",
                "prompt": "¿Qué invención matemática maya revolucionó el cálculo siglos antes que en Europa?",
                "options": [
                      "El álgebra de matrices",
                      "El concepto del cero",
                      "El cálculo diferencial e integral",
                      "Los logaritmos neperianos"
                ],
                "correctIndex": 1,
                "explanation": "Los matemáticos mayas concibieron el concepto y uso del cero mucho antes que en el continente europeo."
          },
          {
                "id": "q6-3",
                "prompt": "¿El ciclo sinódico de qué cuerpo celeste calcularon con asombrosa exactitud?",
                "options": [
                      "Del planeta Marte",
                      "Del planeta Venus",
                      "De los anillos de Saturno",
                      "Del cometa Halley"
                ],
                "correctIndex": 1,
                "explanation": "Los códices y alineaciones de Tikal registraron el ciclo sinódico de Venus con máxima precisión."
          },
          {
                "id": "q6-4",
                "prompt": "¿En qué región selvática guatemalteca se encuentran los vestigios de Tikal?",
                "options": [
                      "En la costa sur de Escuintla",
                      "En la densa selva petenera",
                      "En los bosques de Chimaltenango",
                      "En las playas de Izabal"
                ],
                "correctIndex": 1,
                "explanation": "Tikal se erige en el corazón de la Reserva de la Biosfera Maya en Petén."
          },
          {
                "id": "q6-5",
                "prompt": "¿Qué proeza de ingeniería lograron los mayas al construir sus pirámides?",
                "options": [
                      "Usaron grúas hidráulicas de vapor",
                      "Transportaron toneladas de piedra caliza sin ruedas metálicas ni bestias de carga",
                      "Importaron granito desde los Andes",
                      "Construyeron túneles ferroviarios"
                ],
                "correctIndex": 1,
                "explanation": "Movieron enormes bloques de caliza mediante organización social, cuerdas y fuerza humana coordinada."
          },
          {
                "id": "q6-6",
                "prompt": "¿Qué eventos cósmicos predijeron los astrónomos mayas con márgenes mínimos de error?",
                "options": [
                      "Eclipses solares y lunares",
                      "La caída de meteoritos en el océano",
                      "Tormentas geomagnéticas modernas",
                      "El choque de galaxias lejanas"
                ],
                "correctIndex": 0,
                "explanation": "La astronomía maya calculó fechas exactas de eclipses solares y tránsitos astrales."
          },
          {
                "id": "q6-7",
                "prompt": "¿A qué profesionales contemporáneos sigue conmoviendo el rigor de los sabios mayas?",
                "options": [
                      "A los astrofísicos modernos",
                      "A los pilotos de carreras",
                      "A los banqueros internacionales",
                      "A los fabricantes de automóviles"
                ],
                "correctIndex": 0,
                "explanation": "El texto señala que la precisión de los cálculos mayas aún conmueve a los astrofísicos de hoy."
          },
          {
                "id": "q6-8",
                "prompt": "¿Cuáles son las dos virtudes metodológicas que permitieron a los mayas trascender milenios?",
                "options": [
                      "El rigor científico y la observación perseverante",
                      "La improvisación y la suerte climática",
                      "El comercio de jade y la diplomacia",
                      "El aislamiento del resto de Mesoamérica"
                ],
                "correctIndex": 0,
                "explanation": "El texto concluye que el rigor científico y la observación tenaz desafiaron el paso del tiempo."
          },
          {
                "id": "q6-9",
                "prompt": "¿De qué material mineral están construidos los templos y calzadas de Tikal?",
                "options": [
                      "Piedra pómez volcánica",
                      "Piedra caliza",
                      "Mármol blanco pulido",
                      "Adobe con paja seca"
                ],
                "correctIndex": 1,
                "explanation": "Las canteras peteneras proporcionaron la resistente piedra caliza para las acrópolis y templos."
          },
          {
                "id": "q6-10",
                "prompt": "¿Qué lección permanente deja la ingeniería maya a los técnicos de hoy?",
                "options": [
                      "Que el conocimiento perseverante y la disciplina erigen obras que superan el tiempo",
                      "Que las construcciones deben abandonarse en la selva",
                      "Que la ciencia antigua no tiene aplicación actual",
                      "Que solo se debe estudiar lo que genera dinero inmediato"
                ],
                "correctIndex": 0,
                "explanation": "La historia demuestra que el rigor y la perseverancia erigen monumentos imperecederos al saber."
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
                "id": "q7-1",
                "prompt": "¿A quiénes protege especialmente el Cadejo Blanco en los caminos?",
                "options": [
                      "A los cazadores furtivos de animales salvajes",
                      "A los caminantes laboriosos que regresan tarde de cumplir sus responsabilidades",
                      "A los bandidos que esperan en las curvas del barranco",
                      "A los jinetes que compiten por apuestas"
                ],
                "correctIndex": 1,
                "explanation": "La tradición resalta que el espíritu blanco cuida a los trabajadores honestos en la noche."
          },
          {
                "id": "q7-2",
                "prompt": "¿En qué se diferencia radicalmente el Cadejo Blanco de su contraparte sombría?",
                "options": [
                      "En que tiene alas gigantescas de lechuza",
                      "En que jamás ataca y actúa como protector silencioso",
                      "En que habla en idiomas extranjeros",
                      "En que huye ante la presencia de seres humanos"
                ],
                "correctIndex": 1,
                "explanation": "A diferencia del cadejo oscuro, el blanco es leal, noble y no daña a nadie."
          },
          {
                "id": "q7-3",
                "prompt": "¿De qué lado del caminante se ubica para escoltarlo fielmente?",
                "options": [
                      "Flotando sobre su cabeza en el aire",
                      "Fielmente a la diestra (a su derecha)",
                      "Tres metros detrás escondido en los arbustos",
                      "Corriendo en círculos alrededor del transeúnte"
                ],
                "correctIndex": 1,
                "explanation": "El relato describe que camina con paso sereno a la diestra del caminante."
          },
          {
                "id": "q7-4",
                "prompt": "¿Hasta qué sitio acompaña el Cadejo Blanco a la persona protegida?",
                "options": [
                      "Hasta la plaza mayor de la ciudad",
                      "Hasta las mismas puertas de su hogar",
                      "Hasta el borde del barranco más peligroso",
                      "Hasta el amanecer en el cementerio"
                ],
                "correctIndex": 1,
                "explanation": "La leyenda afirma que custodia al trabajador hasta dejarlo seguro en la puerta de su casa."
          },
          {
                "id": "q7-5",
                "prompt": "¿Qué rasgos visuales caracterizan la figura del noble animal guardián?",
                "options": [
                      "Pelaje luminoso y mirada serena",
                      "Ojos de fuego ardiente y garras de hierro",
                      "Cuerpo transparente sin sombra",
                      "Pelaje verde oscuro con manchas doradas"
                ],
                "correctIndex": 0,
                "explanation": "El texto describe su pelaje blanco reluciente y una mirada calmada y vigilante."
          },
          {
                "id": "q7-6",
                "prompt": "¿Qué tipo de pasos advierten los caminantes en la oscuridad antes de verlo?",
                "options": [
                      "Pasos silenciosos y rítmicos a su lado",
                      "El trote pesado de un caballo de carga",
                      "El chasquido de ramas rotas con violencia",
                      "Campanillas metálicas estridentes"
                ],
                "correctIndex": 0,
                "explanation": "Los caminantes perciben unos pasos sigilosos y protectores que caminan a su compás."
          },
          {
                "id": "q7-7",
                "prompt": "¿Dónde desciende la niebla en el contexto geográfico descrito en la leyenda?",
                "options": [
                      "Sobre los arrecifes de coral del Caribe",
                      "Sobre los barrancos de la meseta central guatemalteca",
                      "En las dunas del desierto de Zacapa",
                      "En las faldas nevadas de los volcanes andinos"
                ],
                "correctIndex": 1,
                "explanation": "La historia se ambienta en la meseta central y sus característicos barrancos y veredas."
          },
          {
                "id": "q7-8",
                "prompt": "¿Qué valor moral y humano personifica el Cadejo Blanco en la cultura popular?",
                "options": [
                      "El valor de la lealtad protectora",
                      "La venganza contra los enemigos",
                      "La vanidad y el deseo de aplausos",
                      "El egoísmo frente a los necesitados"
                ],
                "correctIndex": 0,
                "explanation": "La tradición ve en el Cadejo Blanco un símbolo entrañable de fidelidad y protección desinteresada."
          },
          {
                "id": "q7-9",
                "prompt": "¿Qué convicción reconfortante transmite la leyenda a los hombres trabajadores?",
                "options": [
                      "Que no vale la pena esforzarse en horarios nocturnos",
                      "Que el esfuerzo honesto siempre encuentra una fuerza benefactora que lo acompaña",
                      "Que la noche está dominada por espíritus destructivos sin esperanza",
                      "Que los animales domésticos son peligrosos en la oscuridad"
                ],
                "correctIndex": 1,
                "explanation": "El relato refuerza la creencia moral de que la rectitud del trabajo honesto atrae amparo y bien."
          },
          {
                "id": "q7-10",
                "prompt": "¿Por qué la noche guatemalteca se describe con \"ojos vigilantes\"?",
                "options": [
                      "Por las cámaras de seguridad electrónicas de la época",
                      "Por la presencia tutelar de seres que cuidan la integridad de los caminantes",
                      "Por la invasión de búhos rapaces en los techos",
                      "Por el brillo de los faros de los automóviles"
                ],
                "correctIndex": 1,
                "explanation": "La metáfora alude al misterio de los guardianes tradicionales que velan en la penumbra."
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
                "id": "q8-1",
                "prompt": "¿A qué fracción de un metro equivale exactamente la escala de un nanómetro?",
                "options": [
                      "A una milésima parte de un metro",
                      "A una millonésima parte de un metro",
                      "A una milmillonésima parte de un metro",
                      "A la mitad exacta de un milímetro"
                ],
                "correctIndex": 2,
                "explanation": "Un nanómetro (1 nm) es igual a 10^-9 metros, es decir, una milmillonésima parte de un metro."
          },
          {
                "id": "q8-2",
                "prompt": "¿Qué tipo de fenómenos físicos rigen la materia a escala nanométrica?",
                "options": [
                      "Fenómenos cuánticos extraordinarios",
                      "Leyes gravitacionales newtonianas clásicas",
                      "Propiedades térmicas a escala de vapor",
                      "Efectos magnéticos de gran volumen"
                ],
                "correctIndex": 0,
                "explanation": "A nivel atómico las leyes mecánicas clásicas ceden su lugar a los fenómenos de la mecánica cuántica."
          },
          {
                "id": "q8-3",
                "prompt": "¿Cuál es la definición profunda de nanotecnología según la lectura técnica?",
                "options": [
                      "Simplemente encoger teléfonos celulares",
                      "La capacidad de manipular átomos y moléculas individuales con precisión",
                      "La invención de plásticos biodegradables",
                      "El reciclaje de pantallas viejas de televisión"
                ],
                "correctIndex": 1,
                "explanation": "La nanotecnología es el diseño y control de la materia átomo por átomo."
          },
          {
                "id": "q8-4",
                "prompt": "¿Qué aplicación médica tendrán las nanomáquinas inteligentes en el futuro?",
                "options": [
                      "Reemplazarán los análisis de sangre en laboratorio",
                      "Patrullarán el torrente sanguíneo neutralizando patógenos antes de causar enfermedad",
                      "Fabricarán vendas quirúrgicas de algodón",
                      "Medirán la estatura del paciente desde afuera"
                ],
                "correctIndex": 1,
                "explanation": "La nanomedicina proyecta dispositivos capaces de neutralizar virus y bacterias directamente en la sangre."
          },
          {
                "id": "q8-5",
                "prompt": "¿Qué material revolucionario se destaca en la ingeniería civil y eléctrica?",
                "options": [
                      "El hormigón tradicional de cal y piedra",
                      "Los nanotubos de carbono",
                      "El alambre de cobre estañado",
                      "Las varillas de hierro dulce"
                ],
                "correctIndex": 1,
                "explanation": "Los nanotubos de carbono ofrecen propiedades mecánicas y eléctricas sin precedentes en la industria."
          },
          {
                "id": "q8-6",
                "prompt": "¿Qué comparación de resistencia mecánica tienen los nanotubos respecto al acero?",
                "options": [
                      "Son diez veces menos resistentes",
                      "Son cien veces más resistentes que el acero",
                      "Tienen exactamente la misma fuerza",
                      "Solo resisten calor moderado"
                ],
                "correctIndex": 1,
                "explanation": "Estructuralmente, los nanotubos de carbono son hasta 100 veces más resistentes a la tracción que el acero."
          },
          {
                "id": "q8-7",
                "prompt": "¿Qué ventaja de peso presentan estos nanotubos frente al acero convencional?",
                "options": [
                      "Pesan el doble por metro cuadrado",
                      "Son cinco veces más ligeros",
                      "Tienen un peso idéntico al plomo",
                      "Son tan pesados que no pueden flotar"
                ],
                "correctIndex": 1,
                "explanation": "Combinan una resistencia colosal con un peso cinco veces menor que el acero."
          },
          {
                "id": "q8-8",
                "prompt": "¿Qué disciplinas científicas fundamentales deben dominar los jóvenes estudiantes técnicos?",
                "options": [
                      "La química y la física aplicada",
                      "La astrología y la numerología",
                      "El mercadeo de electrodomésticos",
                      "La contabilidad manual en libros"
                ],
                "correctIndex": 0,
                "explanation": "El texto enfatiza que la química molecular y la física aplicada son los cimientos de esta tecnología."
          },
          {
                "id": "q8-9",
                "prompt": "¿Cómo describe la lectura el impacto que tendrán los técnicos en la sociedad del mañana?",
                "options": [
                      "Serán espectadores pasivos del desarrollo extranjero",
                      "Serán los arquitectos de una nueva era de prosperidad tecnológica sustentable",
                      "Deberán abandonar la tecnología para regresar al pasado",
                      "Se limitarán a reparar cables dañados"
                ],
                "correctIndex": 1,
                "explanation": "La formación técnica capacita a los jóvenes para liderar y diseñar soluciones sustentables para el país."
          },
          {
                "id": "q8-10",
                "prompt": "¿Qué rama de la medicina innovadora se transformará con estas nanomáquinas?",
                "options": [
                      "La odontología cosmética tradicional",
                      "La medicina regenerativa",
                      "La fisioterapia de masajes",
                      "La farmacia de remedios caseros"
                ],
                "correctIndex": 1,
                "explanation": "La medicina regenerativa aprovechará la nanotecnología para reconstruir tejidos y sanar células."
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
                "id": "q9-1",
                "prompt": "¿Con qué famosa aliteración sonora abre el fragmento de Miguel Ángel Asturias?",
                "options": [
                      "\"En un lugar de la Mancha de cuyo nombre no quiero acordarme...\"",
                      "\"...¡Alumbra, lumbre de alumbre, Luzbel de piedra lumbre sobre la podredumbre!...\"",
                      "\"Canto a la noche oscura que cubre los volcanes...\"",
                      "\"Hombres necios que acusáis a la mujer sin razón...\""
                ],
                "correctIndex": 1,
                "explanation": "Es la célebre apertura rítmica y onomatopéyica de \"El Señor Presidente\"."
          },
          {
                "id": "q9-2",
                "prompt": "¿Qué máximo galardón de las letras mundiales recibió el guatemalteco Miguel Ángel Asturias?",
                "options": [
                      "Premio Pulitzer de Periodismo",
                      "Premio Nobel de Literatura",
                      "Premio Cervantes de Poesía",
                      "Medalla de Oro de la UNESCO"
                ],
                "correctIndex": 1,
                "explanation": "Asturias fue galardonado con el Premio Nobel de Literatura en 1967 por su obra universal."
          },
          {
                "id": "q9-3",
                "prompt": "¿Dónde sonaban las campanas de bronce en la penumbra de la ciudad?",
                "options": [
                      "En la Catedral Metropolitana de Quetzaltenango",
                      "En el Portal del Señor",
                      "En la iglesia de San Francisco en la Antigua",
                      "En el campanario del Cerrito del Carmen"
                ],
                "correctIndex": 1,
                "explanation": "El texto localiza las campanas tañendo su clamor en el Portal del Señor."
          },
          {
                "id": "q9-4",
                "prompt": "¿A qué corriente literaria y vanguardista pertenece la técnica estética de la obra?",
                "options": [
                      "Al neoclasicismo estricto",
                      "Al surrealismo y realismo mágico",
                      "Al romanticismo sentimental",
                      "Al naturalismo frío del siglo diecinueve"
                ],
                "correctIndex": 1,
                "explanation": "Asturias enriqueció la narrativa hispanoamericana combinando mitología maya y técnicas surrealistas."
          },
          {
                "id": "q9-5",
                "prompt": "¿Con qué instrumento quirúrgico compara el texto a las metáforas asturianas?",
                "options": [
                      "Con una sierra de carpintero",
                      "Con un bisturí que disecciona la realidad social con valentía",
                      "Con un martillo de demolición",
                      "Con una tijera de sastre"
                ],
                "correctIndex": 1,
                "explanation": "La metáfora no es adorno, sino un bisturí afilado que revela las contradicciones y dolores sociales."
          },
          {
                "id": "q9-6",
                "prompt": "¿En qué se transforma el lenguaje literario según el análisis de la obra?",
                "options": [
                      "En un manual aburrido de gramática",
                      "En música telúrica que retumba en la conciencia colectiva",
                      "En un susurro inaudible que nadie recuerda",
                      "En una lista de compras de la época colonial"
                ],
                "correctIndex": 1,
                "explanation": "El texto señala que el lenguaje se convierte en música telúrica que despierta la conciencia."
          },
          {
                "id": "q9-7",
                "prompt": "¿Qué dos metáforas definen la función ética de la literatura frente a la injusticia?",
                "options": [
                      "Un escudo contra el olvido y una antorcha de libertad",
                      "Una trampa de dinero y un juego de salón",
                      "Una jaula de oro y una cadena de hierro",
                      "Un espejo roto y una pared en blanco"
                ],
                "correctIndex": 0,
                "explanation": "La lectura concluye que la literatura es escudo protector de la memoria y antorcha de libertad cívica."
          },
          {
                "id": "q9-8",
                "prompt": "¿Qué beneficios intelectuales adquiere quien aprende a leer críticamente esta novela?",
                "options": [
                      "Aprende a memorizar fechas sin entenderlas",
                      "Adquiere una coraza contra el engaño y una voz firme para defender la justicia",
                      "Se desinteresa de los problemas de su comunidad",
                      "Busca únicamente ganar discusiones sin fundamento"
                ],
                "correctIndex": 1,
                "explanation": "La lectura crítica dota al estudiante de criterio, discernimiento contra la mentira y valentía cívica."
          },
          {
                "id": "q9-9",
                "prompt": "¿Qué compromiso cívico demuestra el autor a través de su palabra escrita?",
                "options": [
                      "El halago complaciente hacia los dictadores",
                      "La denuncia valiente y el compromiso con los derechos humanos",
                      "La neutralidad indiferente ante el sufrimiento del pueblo",
                      "La promoción de productos comerciales"
                ],
                "correctIndex": 1,
                "explanation": "Asturias ejerció la literatura como compromiso insobornable con la libertad y la dignidad de su patria."
          },
          {
                "id": "q9-10",
                "prompt": "¿Cómo se describe el ambiente sonoro de la ciudad soñolienta en el fragmento?",
                "options": [
                      "Tráfico ensordecedor de motores",
                      "El clamor de bronce de las campanas tañendo en la penumbra",
                      "El silencio absoluto sin ningún sonido",
                      "Fiestas ruidosas con cohetes de feria"
                ],
                "correctIndex": 1,
                "explanation": "El fragmento recrea el tañido melancólico y pesado de las campanas de bronce en la ciudad."
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
                "id": "q10-1",
                "prompt": "En la cosmovisión maya, ¿de qué materia fértil fue forjado el ser humano?",
                "options": [
                      "Del metal fundido en las forjas",
                      "De la harina fecunda del maíz amasada con sudor y pensamiento",
                      "De la piedra volcánica negra y fría",
                      "De la madera de pino sin savia"
                ],
                "correctIndex": 1,
                "explanation": "La cosmovisión ancestral postula que el ser humano fue hecho de masa de maíz amasada con vida y espíritu."
          },
          {
                "id": "q10-2",
                "prompt": "¿Dónde cobra vida hoy esta herencia milenaria según el texto de culminación?",
                "options": [
                      "En los museos arqueológicos cerrados",
                      "En las aulas, talleres y laboratorios de Fundación Kinal",
                      "En las oficinas financieras del extranjero",
                      "En los campos de batalla históricos"
                ],
                "correctIndex": 1,
                "explanation": "El texto señala que esta herencia de dignidad y trabajo florece en los talleres y laboratorios de Kinal."
          },
          {
                "id": "q10-3",
                "prompt": "¿Con qué se hermana indisolublemente la destreza técnica de los estudiantes?",
                "options": [
                      "Con el afán de enriquecerse a costa de los demás",
                      "Con la formación humana y la dignidad del trabajo bien realizado",
                      "Con la competencia desleal entre compañeros",
                      "Con el desprecio hacia las letras y la filosofía"
                ],
                "correctIndex": 1,
                "explanation": "En Kinal la excelencia técnica va indisolublemente unida a la formación ética y humana."
          },
          {
                "id": "q10-4",
                "prompt": "¿Quién es el verdadero maestro técnico según la filosofía expuesta?",
                "options": [
                      "El que tiene las herramientas más caras importadas",
                      "Quien comprende que cada labor técnica es una expresión de servicio a la familia y a la patria",
                      "El que trabaja lo más rápido posible sin revisar la calidad",
                      "El que solo obedece órdenes mecánicamente"
                ],
                "correctIndex": 1,
                "explanation": "El verdadero profesional técnico entiende que su pericia es vocación de servicio y amor al prójimo."
          },
          {
                "id": "q10-5",
                "prompt": "¿Qué ejemplos concretos de trabajo técnico se mencionan como actos de servicio?",
                "options": [
                      "Comprar repuestos usados sin garantía",
                      "Cada circuito ensamblado, software depurado y motor ajustado con esmero",
                      "Limpiar las mesas únicamente al final del año",
                      "Pintar letreros de propaganda política"
                ],
                "correctIndex": 1,
                "explanation": "Circuitos, líneas de software y motores calibrados son el testimonio palpable del servicio técnico bien hecho."
          },
          {
                "id": "q10-6",
                "prompt": "¿Qué representa alcanzar este décimo nivel del mapa de lectura?",
                "options": [
                      "El final definitivo donde ya no se necesita leer más",
                      "El umbral de una vida profesional marcada por la excelencia, la ética y el amor a Guatemala",
                      "Un certificado para no volver a estudiar literatura",
                      "Una excusa para descansar sin responsabilidades"
                ],
                "correctIndex": 1,
                "explanation": "Llegar al nivel 10 es la puerta de entrada a la madurez profesional y ciudadana del estudiante."
          },
          {
                "id": "q10-7",
                "prompt": "¿Cuáles son los tres valores rectores que distinguen la vida profesional del egresado?",
                "options": [
                      "Riqueza material, fama efímera y astucia comercial",
                      "Excelencia académica, rectitud ética y amor inquebrantable a Guatemala",
                      "Autoridad despótica, ambición y aislamiento",
                      "Conformismo, pereza y rutina"
                ],
                "correctIndex": 1,
                "explanation": "El texto cierra consagrando la excelencia académica, la rectitud ética y el patriotismo constructivo."
          },
          {
                "id": "q10-8",
                "prompt": "¿De qué materiales fríos y estériles NO fue modelado el ser humano según el relato?",
                "options": [
                      "Del metal frío ni de la piedra estéril",
                      "De la tierra negra cultivable",
                      "Del agua cristalina de manantial",
                      "Del aire de las montañas"
                ],
                "correctIndex": 0,
                "explanation": "El ser humano no es un engranaje metálico sin alma ni piedra inerte, sino fruto nutricio de maíz y espíritu."
          },
          {
                "id": "q10-9",
                "prompt": "¿Por qué el trabajo técnico bien hecho dignifica a la persona?",
                "options": [
                      "Porque transforma el esfuerzo cotidiano en progreso para la familia y bien común para el país",
                      "Porque evita que la persona tenga que convivir con los demás",
                      "Porque garantiza trabajar menos horas al día",
                      "Porque sustituye a las leyes morales"
                ],
                "correctIndex": 0,
                "explanation": "El trabajo técnico dignifica cuando se orienta a mejorar la vida familiar y comunitaria."
          },
          {
                "id": "q10-10",
                "prompt": "¿Cuál es el mensaje final para el estudiante de Kinal que culmina esta etapa?",
                "options": [
                      "Que el talento sin ética carece de valor, y que el compromiso con Guatemala empieza en cada labor diaria",
                      "Que ya ha aprendido todo lo que existe en el mundo técnico",
                      "Que debe competir para vencer a sus compañeros de promoción",
                      "Que la literatura no tiene relación con las carreras técnicas"
                ],
                "correctIndex": 0,
                "explanation": "La culminación del nivel 10 es un llamado a la excelencia ética, técnica y ciudadana al servicio del país."
          }
    ]
  }
,
  {
    "id": "lec-11",
    "level": 11,
    "title": "La Flor del Amate y la Sombra Misteriosa",
    "genre": "Tradición Oral y Misterio",
    "targetWpm": 170,
    "xpReward": 160,
    "difficulty": "Intermedio",
    "author": "Tradición Popular de Sacatepéquez",
    "pedagogicalSource": "MINEDUC Guatemala — Antología de Tradiciones Populares y Cuentos Orales",
    "competencies": [
      "Comprensión inferencial",
      "Resiliencia ante la incertidumbre",
      "Identidad comunitaria"
    ],
    "vocabulary": [
      {
        "word": "efímera",
        "meaning": "Que dura muy poco tiempo o es pasajera."
      },
      {
        "word": "temple",
        "meaning": "Fuerza interior y serenidad frente a los momentos difíciles."
      },
      {
        "word": "penumbra",
        "meaning": "Sombra débil entre la luz y la oscuridad que incita al misterio."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "En los patios traseros de los pueblos coloniales crecen los árboles de amate, cuyas hojas espesas ocultan antiguos secretos. Cuentan los cronistas que a la medianoche florece una flor blanca y radiante que solo dura unos instantes antes de desvanecerse. Aquel que logre capturar esa flor efímera obtendrá la fortuna de la sabiduría, pero deberá superar la prueba del miedo frente a la sombra del guardián de la arboleda. La verdadera riqueza, sin embargo, no está en el oro prometido por la leyenda, sino en el temple y la perseverancia de quien no retrocede ante las dificultades del camino y comprende el valor del esfuerzo diario.",
    "wordCount": 113,
    "questions": [
      {
        "id": "q11-1",
        "prompt": "¿Qué propiedad singular posee la legendaria flor del amate?",
        "options": [
          "Florece durante semanas bajo la luz del mediodía",
          "Florece a la medianoche con un resplandor blanco que dura solo unos instantes",
          "Produce frutos venenosos de color púrpura",
          "Solo puede verse desde las cumbres de los volcanes"
        ],
        "correctIndex": 1,
        "explanation": "El texto explica que florece a la medianoche como una luz efímera que dura breves instantes."
      },
      {
        "id": "q11-2",
        "prompt": "¿Cuál es la verdadera enseñanza que encierra la leyenda?",
        "options": [
          "Que el valor real reside en el temple y la perseverancia ante las dificultades",
          "Que la riqueza material fácil es la meta suprema del ser humano",
          "Que nunca se debe salir de casa después del anochecer",
          "Que los árboles antiguos deben talarse para evitar peligros"
        ],
        "correctIndex": 0,
        "explanation": "La moraleja subraya que la riqueza auténtica radica en la constancia y el coraje frente a los retos."
      },
      {
        "id": "q11-3",
        "prompt": "¿En qué región se sitúa la tradición narrada?",
        "options": [
          "Pueblos coloniales de Sacatepéquez",
          "Las islas del Caribe centroamericano",
          "El desierto de Atacama",
          "Las llanuras costeras del Océano Ártico"
        ],
        "correctIndex": 0,
        "explanation": "La tradición pertenece al acervo colonial de los pueblos históricos de Sacatepéquez."
      }
    ]
  },
  {
    "id": "lec-12",
    "level": 12,
    "title": "Las Huellas Cosmogónicas del Popol Vuh",
    "genre": "Mitología Sagrada Maya",
    "targetWpm": 172,
    "xpReward": 165,
    "difficulty": "Intermedio",
    "author": "Consejo de Ancianos Quichés",
    "pedagogicalSource": "Fray Francisco Ximénez — Manuscrito de Santo Tomás Chichicastenango",
    "competencies": [
      "Cosmovisión originaria",
      "Pensamiento crítico ancestral",
      "Valoración de recursos naturales"
    ],
    "vocabulary": [
      {
        "word": "cosmogónico",
        "meaning": "Relativo al origen mítico y formación del universo."
      },
      {
        "word": "quietud",
        "meaning": "Estado de sosiego, calma y ausencia de movimiento."
      },
      {
        "word": "perfeccionamiento",
        "meaning": "Proceso continuado de mejora hasta alcanzar la excelencia."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "Antes del amanecer de la creación, no existía el cielo visible ni la tierra poblada; solo la inmensidad del mar en reposo bajo la calma absoluta. Los Procreadores, Tepeu y Gucumatz, meditaron en la penumbra sobre la forma adecuada de crear al ser consciente. Tras ensayar con el barro frágil y la madera insensible, hallaron en las mazorcas de maíz blanco y amarillo la sustancia vital capaz de albergar espíritu, agradecimiento y razón. Así nacieron los primeros guardianes del orden cósmico, encomendados a cuidar la armonía de la naturaleza y honrar con gratitud cada fruto brindado por la tierra fértil.",
    "wordCount": 104,
    "questions": [
      {
        "id": "q12-1",
        "prompt": "¿Quiénes fueron las deidades que meditaron sobre la creación del ser humano?",
        "options": [
          "Tepeu y Gucumatz",
          "Kukulcán y Quetzalcóatl",
          "Hunahpú e Ixbalanqué",
          "Huracán y Cabracán"
        ],
        "correctIndex": 0,
        "explanation": "El texto nombra a Tepeu y Gucumatz como los Procreadores que meditaron en la penumbra primordial."
      },
      {
        "id": "q12-2",
        "prompt": "¿Por qué el maíz fue el material elegido sobre el barro y la madera?",
        "options": [
          "Porque era el material más barato y fácil de moldear",
          "Porque albergaba la sustancia vital capaz de espíritu, agradecimiento y razón",
          "Porque los dioses no tenían acceso a otros recursos minerales",
          "Porque resistía el calor de los hornos volcánicos"
        ],
        "correctIndex": 1,
        "explanation": "A diferencia de los intentos previos, el maíz proveyó conciencia, gratitud y entendimiento armónico."
      },
      {
        "id": "q12-3",
        "prompt": "¿Cuál era la encomienda de los primeros seres creados?",
        "options": [
          "Conquistar y destruir a los pueblos vecinos",
          "Cuidar la armonía de la naturaleza y honrar con gratitud la tierra",
          "Construir pirámides de oro en el fondo del mar",
          "Permanecer en silencio sin comunicarse"
        ],
        "correctIndex": 1,
        "explanation": "Los seres humanos fueron designados guardianes del equilibrio natural y de la memoria cósmica."
      }
    ]
  },
  {
    "id": "lec-13",
    "level": 13,
    "title": "El Relojero de Antigua y la Campana Silente",
    "genre": "Narrativa Filosófica",
    "targetWpm": 175,
    "xpReward": 170,
    "difficulty": "Intermedio",
    "author": "Crónicas del Valle de Panchoy",
    "pedagogicalSource": "Fundación Kinal — Humanidades y Sentido del Tiempo",
    "competencies": [
      "Gestión del tiempo",
      "Paciencia y minuciosidad técnica",
      "Solidaridad comunitaria"
    ],
    "vocabulary": [
      {
        "word": "engranajes",
        "meaning": "Ruedas dentadas que encajan entre sí para transmitir movimiento."
      },
      {
        "word": "silente",
        "meaning": "Que permanece en absoluto silencio, callado y quieto."
      },
      {
        "word": "restauración",
        "meaning": "Reparación cuidadosa para devolver a una obra su esplendor original."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "En un pequeño taller junto al Arco de Santa Catalina, Don Anselmo reparaba minuciosamente los engranajes de los péndulos coloniales. Sostenía que el tiempo no se mide por el tic-tac mecánico de las ruedas de bronce, sino por el valor con que aprovechamos cada minuto al servicio de los demás. Cuando la gran campana del convento enmudeció por una fisura interna, el anciano artesano demostró que con paciencia, cálculo exacto y dedicación es posible restaurar la armonía perdida en toda una comunidad congregada para escuchar su tañido renovado.",
    "wordCount": 93,
    "questions": [
      {
        "id": "q13-1",
        "prompt": "¿Dónde se ubicaba el taller del maestro artesano Don Anselmo?",
        "options": [
          "En el muelle pesquero de Champerico",
          "Junto al histórico Arco de Santa Catalina en Antigua Guatemala",
          "En las cavernas de Lanquin",
          "En la plaza principal de Chiquimula"
        ],
        "correctIndex": 1,
        "explanation": "El relato se ambienta expresamente junto al emblemático Arco de Santa Catalina."
      },
      {
        "id": "q13-2",
        "prompt": "¿Qué concepción del tiempo defendía Don Anselmo?",
        "options": [
          "Que el tiempo es solo dinero acumulable",
          "Que el tiempo se mide por el valor con que se aprovecha al servicio del prójimo",
          "Que los relojes mecánicos controlan el destino de los hombres",
          "Que el pasado es lo único que merece consideración"
        ],
        "correctIndex": 1,
        "explanation": "El relojero enseñaba que el verdadero valor del tiempo reside en el servicio generoso hacia los demás."
      },
      {
        "id": "q13-3",
        "prompt": "¿Cómo resolvió Don Anselmo el problema de la campana enmudecida?",
        "options": [
          "Fundiéndola y tirándola al río Pensativo",
          "Mediante paciencia, cálculo exacto y dedicación técnica meticulosa",
          "Comprando una campana extranjera de menor tamaño",
          "Ignorando la petición de los vecinos"
        ],
        "correctIndex": 1,
        "explanation": "Su intervención unió el cálculo riguroso con la paciencia artesanal para devolver el tañido a la campana."
      }
    ]
  },
  {
    "id": "lec-14",
    "level": 14,
    "title": "Los Vientos Legendarios del Volcán Tajumulco",
    "genre": "Poesía y Paisajismo",
    "targetWpm": 178,
    "xpReward": 175,
    "difficulty": "Intermedio",
    "author": "Lírica del Altiplano Occidental",
    "pedagogicalSource": "Instituto Geográfico Nacional — Patrimonio Natural de Guatemala",
    "competencies": [
      "Apreciación estética",
      "Superación personal",
      "Respeto al entorno biogeográfico"
    ],
    "vocabulary": [
      {
        "word": "gélido",
        "meaning": "Extremadamente frío o helado."
      },
      {
        "word": "telúricas",
        "meaning": "Pertenecientes o relativas a la fuerza viva de la tierra y los volcanes."
      },
      {
        "word": "inquebrantable",
        "meaning": "Que no se rinde, deforma ni quiebra ante la adversidad."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "Sobre la cumbre más alta de Centroamérica, el aire gélido del Tajumulco susurra memorias milenarias que desafían el horizonte. Los montañistas que ascienden sus escarpadas laderas aprenden que cada paso requiere concentración, equilibrio y respeto por las fuerzas telúricas de la montaña. Al alcanzar la cima sobre el manto blanco de las nubes, la vista abarca las tierras fértiles de San Marcos hasta el océano resplandeciente, recordándonos que las metas más ambiciosas solo se conquistan con disciplina diaria, pasos firmes y un espíritu inquebrantable.",
    "wordCount": 88,
    "questions": [
      {
        "id": "q14-1",
        "prompt": "¿Cuál es la distinción geográfica del volcán Tajumulco?",
        "options": [
          "Es el cráter más activo del Caribe",
          "Es la cumbre montañosa más alta de Centroamérica",
          "Es la única montaña submarina del país",
          "Es el lago de lava más extenso de América del Sur"
        ],
        "correctIndex": 1,
        "explanation": "El Tajumulco ostenta la mayor altitud topográfica de toda la región centroamericana (4,220 msnm)."
      },
      {
        "id": "q14-2",
        "prompt": "¿Qué lección física y mental reciben los montañistas durante el ascenso?",
        "options": [
          "Que la prisa es indispensable para evitar el cansancio",
          "Que cada paso exige concentración, equilibrio y disciplina continuada",
          "Que se debe competir agresivamente contra los compañeros de marcha",
          "Que la cima solo pertenece a quienes viajan con vehículos mecánicos"
        ],
        "correctIndex": 1,
        "explanation": "La ascensión demanda ritmo constante, prudencia y respeto escrupuloso por la geografía de montaña."
      },
      {
        "id": "q14-3",
        "prompt": "¿Qué panorama se contempla al alcanzar la cima del Tajumulco?",
        "options": [
          "El mar congelado del Polo Norte",
          "Las tierras fértiles de San Marcos hasta el océano Pacífico",
          "Una selva tropical cerrada sin visibilidad",
          "Únicamente depósitos de ceniza sin horizonte"
        ],
        "correctIndex": 1,
        "explanation": "Desde la cumbre se visualiza el altiplano marquense y la inmensidad del litoral pacífico."
      }
    ]
  },
  {
    "id": "lec-15",
    "level": 15,
    "title": "La Brújula de Fray Bartolomé en Verapaz",
    "genre": "Crónica Histórica Colonial",
    "targetWpm": 180,
    "xpReward": 180,
    "difficulty": "Intermedio",
    "author": "Documentos Históricos de Tezulutlán",
    "pedagogicalSource": "Archivo General de Centroamérica — Crónicas de Verapaz",
    "competencies": [
      "Resolución pacífica de conflictos",
      "Pensamiento ético y diplomático",
      "Comunicación intercultural"
    ],
    "vocabulary": [
      {
        "word": "Tezulutlán",
        "meaning": "Nombre originario de Verapaz que significaba \"Tierra de Guerra\"."
      },
      {
        "word": "diplomacia",
        "meaning": "Uso del diálogo y la negociación para resolver desacuerdos pacíficamente."
      },
      {
        "word": "acervo",
        "meaning": "Conjunto de bienes culturales y morales acumulados por tradición."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "En las húmedas montañas de Tezulutlán, conocida como la Tierra de Guerra, Fray Bartolomé de las Casas propuso un método revolucionario: pacificar mediante el diálogo, la música y el respeto mutuo en lugar de las armas. Los mercaderes mayas aprendieron versos sacros en idioma q'eqchi' y los cantaron en los mercados remotos, despertando la curiosidad y la confianza de los caciques. Aquella expedición demostró que la razón y la palabra pacífica poseen mayor fuerza civilizatoria que cualquier ejército de hierro.",
    "wordCount": 81,
    "questions": [
      {
        "id": "q15-1",
        "prompt": "¿Cuál era el nombre originario de la región antes de llamarse Verapaz?",
        "options": [
          "Tezulutlán o Tierra de Guerra",
          "Petén Itzá",
          "Iximché la Grande",
          "Guaymoco del Sur"
        ],
        "correctIndex": 0,
        "explanation": "Antes de la evangelización pacífica, los conquistadores llamaban Tezulutlán (Tierra de Guerra) a la región."
      },
      {
        "id": "q15-2",
        "prompt": "¿Qué instrumento pacífico utilizó la expedición para acercarse a los caciques?",
        "options": [
          "La música y versos poéticos en idioma q'eqchi' interpretados por mercaderes",
          "El envío de tropas con armaduras pesadas",
          "La imposición de tributos forzosos",
          "La construcción de fortalezas de piedra"
        ],
        "correctIndex": 0,
        "explanation": "El método empleó coplas musicales y lenguaje originario para entablar un diálogo de mutuo respeto."
      },
      {
        "id": "q15-3",
        "prompt": "¿Qué principio ético e histórico validó este suceso en Guatemala?",
        "options": [
          "Que el diálogo y la palabra justa son más eficaces que la violencia armada",
          "Que la fuerza física siempre vence a los argumentos morales",
          "Que el comercio debe prohibirse en zonas montañosas",
          "Que las diferencias culturales son imposibles de reconciliar"
        ],
        "correctIndex": 0,
        "explanation": "La pacificación pacífica demostró el poder trascendental de la diplomacia ética y la empatía."
      }
    ]
  },
  {
    "id": "lec-16",
    "level": 16,
    "title": "El Tejedor de Patzún y los Colores Sagrados",
    "genre": "Costumbrismo y Arte Textil",
    "targetWpm": 182,
    "xpReward": 185,
    "difficulty": "Intermedio",
    "author": "Maestros del Telar de Cintura",
    "pedagogicalSource": "Ministerio de Cultura y Deportes — Patrimonio Textil Maya",
    "competencies": [
      "Apreciación del arte textil",
      "Laboriosidad y perseverancia",
      "Geometría ancestral"
    ],
    "vocabulary": [
      {
        "word": "lanzadera",
        "meaning": "Pieza de madera con hilo que pasa a través de la urdimbre para tejer."
      },
      {
        "word": "urdimbre",
        "meaning": "Conjunto de hilos paralelos sobre los que se entrelaza la trama de un tejido."
      },
      {
        "word": "simbología",
        "meaning": "Significado profundo que transmiten los signos y figuras en un contexto cultural."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "Entre hilos de algodón teñidos con cochinilla y corteza de aliso, el maestro artesano de Patzún cruzaba la lanzadera con precisión matemática. Cada figura geométrica bordada en el güipil encerraba un relato astronómico: el curso del sol, la fertilidad de los volcanes y la memoria de los abuelos. El tejedor enseñaba a los jóvenes aprendices que la paciencia es el telar del carácter humano, donde cada virtud tejida con perseverancia forma un manto digno para toda la vida profesional.",
    "wordCount": 82,
    "questions": [
      {
        "id": "q16-1",
        "prompt": "¿Qué elementos naturales empleaba el maestro artesano para teñir los hilos de algodón?",
        "options": [
          "Cochinilla y corteza de aliso",
          "Pinturas sintéticas importadas de Europa",
          "Polvo de carbón y petróleo crudo",
          "Oxidación de clavos de hierro"
        ],
        "correctIndex": 0,
        "explanation": "Los tintes naturales ancestrales se obtienen de la cochinilla y diversas cortezas vegetales."
      },
      {
        "id": "q16-2",
        "prompt": "¿Qué significado contienen las figuras geométricas plasmadas en el güipil tradicional?",
        "options": [
          "Relatos astronómicos, el curso solar y la memoria de las generaciones pasadas",
          "Simples adornos sin ningún tipo de contexto cultural",
          "Marcas de precio para la venta en el extranjero",
          "Planos para construir caminos vecinales"
        ],
        "correctIndex": 0,
        "explanation": "El textil maya constituye un documento vivo que codifica astronomía, cosmovisión e historia comunitaria."
      },
      {
        "id": "q16-3",
        "prompt": "¿Qué comparación moral realizaba el maestro tejedor con respecto a la paciencia?",
        "options": [
          "Que la paciencia es el telar que teje el carácter humano y las virtudes",
          "Que la paciencia hace que el trabajo sea innecesariamente lento",
          "Que solo quienes no tienen herramientas modernas necesitan paciencia",
          "Que la prisa es la principal virtud del buen trabajador"
        ],
        "correctIndex": 0,
        "explanation": "El maestro asimilaba la formación de hábitos éticos a la trama paciente y perseverante del telar."
      }
    ]
  },
  {
    "id": "lec-17",
    "level": 17,
    "title": "Ecos en las Cavernas Secretas de Candelaria",
    "genre": "Aventura y Espeleología",
    "targetWpm": 185,
    "xpReward": 190,
    "difficulty": "Intermedio",
    "author": "Exploradores del Río Subterráneo",
    "pedagogicalSource": "Parque Nacional Cuevas de Candelaria — Alta Verapaz",
    "competencies": [
      "Espíritu de exploración",
      "Gestión de riesgos en terreno",
      "Conservación de ecosistemas kársticos"
    ],
    "vocabulary": [
      {
        "word": "kárstico",
        "meaning": "Paisaje de roca caliza esculpido por la disolución natural del agua."
      },
      {
        "word": "estalactitas",
        "meaning": "Concreciones de carbonato cálcico que cuelgan del techo de las cuevas."
      },
      {
        "word": "Xibalbá",
        "meaning": "Inframundo en la mitología maya, morada de pruebas y transformaciones."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "Bajo el suelo kárstico de Alta Verapaz, el río subterráneo fluye en medio de colosales bóvedas de estalactitas que reflejan la luz tenue de las linternas. En la antigüedad maya, estas galerías eran consideradas portales sagrados hacia Xibalbá, donde los héroes míticos demostraron su valentía frente a los enigmas de la sombra. Navegar estas aguas mansas en la penumbra enseña al explorador a agudizar sus sentidos, mantener la calma en situaciones límite y valorar el patrimonio hídrico subterráneo de Guatemala.",
    "wordCount": 83,
    "questions": [
      {
        "id": "q17-1",
        "prompt": "¿Qué fenómeno geológico caracteriza al Parque de las Cuevas de Candelaria?",
        "options": [
          "Un cráter volcánico con géiseres de vapor caliente",
          "Un colosal sistema kárstico con un río subterráneo navegable",
          "Un glaciar de hielo perpetuo en la selva",
          "Una duna de arena movediza"
        ],
        "correctIndex": 1,
        "explanation": "Candelaria es uno de los sistemas subterráneos fluviales más imponentes y extensos de América Latina."
      },
      {
        "id": "q17-2",
        "prompt": "¿Qué connotación sagrada tenían estas grutas en la cosmovisión maya clásica?",
        "options": [
          "Eran consideradas portales ceremoniales de acceso a Xibalbá",
          "Servían como silos para almacenar maíz tostado",
          "Eran depósitos para arrojar herramientas inservibles",
          "Se consideraban lugares prohibidos a los que nadie podía acercarse"
        ],
        "correctIndex": 0,
        "explanation": "En la tradición maya, las cuevas constituían umbrales de comunicación directa con el plano sagrado."
      },
      {
        "id": "q17-3",
        "prompt": "¿Qué capacidad personal fomenta la exploración de espacios subterráneos?",
        "options": [
          "El pánico incontrolable y la prisa desmedida",
          "La agudeza de los sentidos, la serenidad en situaciones límite y el respeto al medio",
          "El descuido deliberado de las medidas de seguridad",
          "La destrucción de formaciones rocosas milenarias"
        ],
        "correctIndex": 1,
        "explanation": "La espeleología educativa fortalece el autocontrol, la concentración y el cuidado del entorno frágil."
      }
    ]
  },
  {
    "id": "lec-18",
    "level": 18,
    "title": "El Vuelo Heroico del Rabinal Achí",
    "genre": "Dramaturgia Prehispánica",
    "targetWpm": 188,
    "xpReward": 200,
    "difficulty": "Intermedio",
    "author": "Danza-Drama Tradicional Maya Achí",
    "pedagogicalSource": "UNESCO — Obra Maestra del Patrimonio Oral e Inmaterial de la Humanidad",
    "competencies": [
      "Análisis dramático clásico",
      "Ética de la palabra empeñada",
      "Dignidad cívica"
    ],
    "vocabulary": [
      {
        "word": "Kajyub",
        "meaning": "Antigua ciudadela fortificada y centro político del pueblo Rabinaleb."
      },
      {
        "word": "parlamento",
        "meaning": "Discurso solemne pronunciado por un personaje en una obra teatral."
      },
      {
        "word": "linaje",
        "meaning": "Ascendencia, serie de progenitores y honor familiar transmitido."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "Frente al Consejo de los Cuatro Jaguares en la fortaleza de Kajyub', el valiente guerrero K'iche' Achí defiende su honor con discursos de elevada poesía ceremonial. El drama del Rabinal Achí representa el único texto teatral prehispánico conservado íntegro en Mesoamérica, donde el enfrentamiento no se decide por la fuerza bruta, sino por la dignidad de la palabra, el cumplimiento leal de los juramentos empeñados y el respeto sagrado a las normas comunitarias de justicia y honorabilidad.",
    "wordCount": 80,
    "questions": [
      {
        "id": "q18-1",
        "prompt": "¿Por qué el Rabinal Achí posee una relevancia literaria e histórica excepcional en América?",
        "options": [
          "Porque fue escrito por un autor renacentista español",
          "Porque es la única obra dramática prehispánica conservada sin influencia textual hispana",
          "Porque fue la primera novela impresa en papel de maguey",
          "Porque se representaba únicamente en Europa"
        ],
        "correctIndex": 1,
        "explanation": "La UNESCO declaró al Rabinal Achí obra maestra por preservar intacta la dramaturgia originaria maya."
      },
      {
        "id": "q18-2",
        "prompt": "¿En qué lugar fortificado se desarrolla la acción principal del parlamento?",
        "options": [
          "En la fortaleza de Kajyub', capital del señorío Rabinaleb",
          "En las costas de Puerto Barrios",
          "En el puerto de Iztapa",
          "En las faldas del Volcán de Agua"
        ],
        "correctIndex": 0,
        "explanation": "El drama tiene lugar en la ciudadela de Kajyub', en las inmediaciones del actual Rabinal, Baja Verapaz."
      },
      {
        "id": "q18-3",
        "prompt": "¿Qué valor preponderante guía las acciones y parlamentos de los protagonistas?",
        "options": [
          "La traición silenciosa para conservar privilegios personales",
          "La dignidad cívica, el cumplimiento de la palabra empeñada y el honor",
          "El desprecio por las costumbres y leyes del pueblo",
          "La acumulación desmedida de botín de guerra"
        ],
        "correctIndex": 1,
        "explanation": "El texto enaltece la nobleza del carácter, la verdad en el decir y la lealtad incondicional al juramento."
      }
    ]
  },
  {
    "id": "lec-19",
    "level": 19,
    "title": "Hombres de Maíz y la Rebelión del Bosque",
    "genre": "Realismo Mágico Guatemalteco",
    "targetWpm": 190,
    "xpReward": 210,
    "difficulty": "Avanzado",
    "author": "Inspirado en Miguel Ángel Asturias",
    "pedagogicalSource": "Premio Nobel de Literatura 1967 — Cátedra Asturiana",
    "competencies": [
      "Realismo mágico mesoamericano",
      "Conciencia ecológica comunitaria",
      "Riqueza estilística"
    ],
    "vocabulary": [
      {
        "word": "guerrillero",
        "meaning": "Combatiente que defiende su territorio frente a fuerzas opresoras."
      },
      {
        "word": "tala",
        "meaning": "Corte masivo e indiscriminado de árboles de una selva o bosque."
      },
      {
        "word": "antepasados",
        "meaning": "Generaciones pretéritas de cuya memoria nos nutrimos."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "Gaspar Ilóm despierta en las altas cumbres de Ilom con el corazón inquieto por el gemido de la montaña. Los taladores codiciosos avanzan con hachas afiladas sobre los bosques milenarios, derribando ceibas sagradas que sostenían el susurro del viento. El héroe comprende que defender la tierra no es una cuestión de apego material, sino un deber espiritual: quien siembra maíz para vivir honra la creación divina, pero quien incendia la selva para especular destruye el futuro de sus propios hijos. Su voz se alza como trueno en los barrancos para convocar a la defensa de la vida y la dignidad del campesino.",
    "wordCount": 104,
    "questions": [
      {
        "id": "q19-1",
        "prompt": "¿Quién es el protagonista que encabeza la defensa de los bosques milenarios?",
        "options": [
          "Don Pedro de Alvarado",
          "Gaspar Ilóm en las cumbres de Ilóm",
          "El señor Presidente de la capital",
          "Fray Matías de Córdova"
        ],
        "correctIndex": 1,
        "explanation": "Gaspar Ilóm es la figura central de la novela cumbre \"Hombres de Maíz\" de Miguel Ángel Asturias."
      },
      {
        "id": "q19-2",
        "prompt": "¿Qué contraste moral fundamental plantea la lectura?",
        "options": [
          "Sembrar maíz con respeto para sustentar la vida frente a la destrucción mercantil del bosque",
          "La superioridad de las herramientas mecánicas sobre el trabajo agrícola manual",
          "El abandono de los campos para migrar a las grandes ciudades industriales",
          "La eliminación de las tradiciones orales en favor de leyes extranjeras"
        ],
        "correctIndex": 0,
        "explanation": "Asturias opone la comunión sagrada con la tierra frente a la voracidad destructiva del mercantilismo."
      },
      {
        "id": "q19-3",
        "prompt": "¿Qué galardón universal reconoció la obra cumbre de este autor guatemalteco?",
        "options": [
          "El Premio Nobel de la Paz",
          "El Premio Nobel de Literatura en 1967",
          "La Medalla Olímpica de Bellas Artes",
          "El Premio Pulitzer de Periodismo"
        ],
        "correctIndex": 1,
        "explanation": "Miguel Ángel Asturias fue laureado con el Premio Nobel de Literatura en 1967 por su prosa universal."
      }
    ]
  },
  {
    "id": "lec-20",
    "level": 20,
    "title": "El Trovador de la Plaza Mayor de Santiago",
    "genre": "Romance Histórico",
    "targetWpm": 192,
    "xpReward": 215,
    "difficulty": "Avanzado",
    "author": "Tradición Lírica Colonial",
    "pedagogicalSource": "Sociedad de Geografía e Historia de Guatemala",
    "competencies": [
      "Apreciación métrica",
      "Contexto sociopolítico colonial",
      "Expresión oratoria"
    ],
    "vocabulary": [
      {
        "word": "trovador",
        "meaning": "Poeta que cantaba y componía sus versos en plazas y palacios públicos."
      },
      {
        "word": "alfanje",
        "meaning": "Espada curva empleada en tiempos pretéritos por guardias y soldados."
      },
      {
        "word": "pregonero",
        "meaning": "Funcionario que hacía saber en voz alta y pública los bandos y avisos."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "Al caer la tarde sobre las arcadas del Palacio de los Capitanes Generales, las cuerdas de una vihuela rompían el silencio del empedrado. El trovador cantaba romances sobre los navegantes que arribaban al Golfo Dulce con cargamentos de libros y especias ultramarinas. En sus estrofas no solo había elogios al amor cortesano, sino sutiles advertencias a los gobernantes para que administraran justicia con rectitud y compasión hacia los artesanos y comerciantes que levantaban con sus manos la grandeza de la ciudad colonial.",
    "wordCount": 88,
    "questions": [
      {
        "id": "q20-1",
        "prompt": "¿Frente a qué emblemático edificio cantaba el trovador al atardecer?",
        "options": [
          "El Palacio de los Capitanes Generales en la Plaza Mayor",
          "El puerto fluvial de San Felipe",
          "La catedral neoclásica de Quetzaltenango",
          "El convento de Santo Domingo en Cobán"
        ],
        "correctIndex": 0,
        "explanation": "La escena ocurre en la Plaza Mayor de Santiago de los Caballeros, frente a la Capitanía General."
      },
      {
        "id": "q20-2",
        "prompt": "¿Qué mensaje crítico contenían las estrofas del cantor popular?",
        "options": [
          "Invitaban a quemar los libros procedentes del extranjero",
          "Exhortaban a las autoridades a ejercer la justicia con rectitud y compasión hacia los trabajadores",
          "Pedían el cierre de todos los talleres artesanales",
          "Demandaban más impuestos para la corona metropolitana"
        ],
        "correctIndex": 1,
        "explanation": "El cantor popular empleaba el romance como vehículo cívico para reclamar equidad y honradez pública."
      },
      {
        "id": "q20-3",
        "prompt": "¿Qué instrumento musical acompañaba el canto del trovador colonial?",
        "options": [
          "Una batería electrónica contemporánea",
          "Una vihuela de cuerdas pulsadas",
          "Una trompeta militar de bronce pesado",
          "Un órgano monumental de tubos de plomo"
        ],
        "correctIndex": 1,
        "explanation": "La vihuela fue el antecesor instrumental directo de la guitarra clásica en la lírica hispanoamericana."
      }
    ]
  },
  {
    "id": "lec-21",
    "level": 21,
    "title": "La Leyenda de la Tatuana y el Barco de Carbón",
    "genre": "Relato Mítico Colonial",
    "targetWpm": 195,
    "xpReward": 220,
    "difficulty": "Avanzado",
    "author": "Cuentos de Leyendas de Guatemala",
    "pedagogicalSource": "MINEDUC Guatemala — Antología de la Narrativa Tradicional",
    "competencies": [
      "Pensamiento alegórico",
      "Libertad de conciencia",
      "Imaginación poética"
    ],
    "vocabulary": [
      {
        "word": "Tatuana",
        "meaning": "Personaje legendario que encarna el anhelo de libertad frente al encierro."
      },
      {
        "word": "alegoría",
        "meaning": "Figura literaria que representa una idea abstracta mediante símbolos concretos."
      },
      {
        "word": "bergatín",
        "meaning": "Embarcación ligera de dos palos con velas desplegadas al viento."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "Encerrada en las mazmorras frías de la Real Cárcel de la ciudad, acusada de prácticas prohibidas por su sabiduría sobre plantas curativas, la Tatuana mantuvo la serenidad de su espíritu. Con un trozo de carbón vegetal desprendido del brasero, dibujó en la pared encalada un bergantín velero con todas sus velas desplegadas. Pronunciando una plegaria a las fuerzas del viento y la libertad, subió a bordo del navío dibujado y zarpó a través de los muros de piedra ante la mirada atónita de los centinelas, recordando que ninguna prisión terrenal puede encadenar a una mente libre y noble.",
    "wordCount": 97,
    "questions": [
      {
        "id": "q21-1",
        "prompt": "¿Con qué elemento dibujó la Tatuana su mítico barco en la pared de la prisión?",
        "options": [
          "Con un pincel de oro con tinta indeleble",
          "Con un humilde trozo de carbón vegetal desprendido del brasero",
          "Con una espada de acero templado",
          "Con cera derretida de una vela de parafina"
        ],
        "correctIndex": 1,
        "explanation": "La leyenda narra que trazó el navío mágico con un simple carboncillo sobre el muro de cal."
      },
      {
        "id": "q21-2",
        "prompt": "¿Qué simboliza la fuga milagrosa del barco de carbón?",
        "options": [
          "La superioridad de los piratas en las costas de ultramar",
          "Que el espíritu humano y la libertad de conciencia jamás pueden ser aprisionados",
          "La necesidad de construir prisiones más profundas y blindadas",
          "El peligro de aprender a dibujar navíos marinos"
        ],
        "correctIndex": 1,
        "explanation": "El mito es una metáfora universal de la soberanía interior y la indoblegable libertad del pensamiento."
      },
      {
        "id": "q21-3",
        "prompt": "¿Por qué razón original había sido encarcelada la protagonista?",
        "options": [
          "Por sus profundos conocimientos curativos de la botánica que incomodaban al poder",
          "Por robar un cofre de plata en la catedral mayor",
          "Por negarse a pagar el peaje en el río Motagua",
          "Por haber vendido mapas náuticos falsificados"
        ],
        "correctIndex": 0,
        "explanation": "Su sabiduría tradicional en herbolaria y curanderismo despertaba sospechas en la sociedad colonial."
      }
    ]
  },
  {
    "id": "lec-22",
    "level": 22,
    "title": "El Viento en los Trigales de Quetzaltenango",
    "genre": "Estampa Regional y Memoria",
    "targetWpm": 198,
    "xpReward": 225,
    "difficulty": "Avanzado",
    "author": "Cronistas de Los Altos",
    "pedagogicalSource": "Casa de la Cultura de Occidente — Xelajú",
    "competencies": [
      "Identidad regional guatemalteca",
      "Apreciación del paisaje productivo",
      "Memoria colectiva"
    ],
    "vocabulary": [
      {
        "word": "Los Altos",
        "meaning": "Región histórica occidental de Guatemala con capital en Quetzaltenango."
      },
      {
        "word": "chajalele",
        "meaning": "Canto rítmico y alegre de aves campestres en la madrugada."
      },
      {
        "word": "tenacidad",
        "meaning": "Fuerza que impulsa a continuar sin desmayar hasta lograr el objetivo."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "En las madrugadas brumosas del valle de Palajunoj, el viento desciende desde el volcán Santa María meciendo las espigas doradas de trigo. Los campesinos quetzaltecos inician sus faenas entonando coplas de labor, agradeciendo la tierra volcánica que prodiga harina sustanciosa para el pan de la región. En esta tierra de hombres laboriosos y poetas inspirados, el frío del altiplano no entumece los dedos, sino que aviva el fuego de la tenacidad: cada surco cultivado con esmero es un tributo vivo al trabajo honrado que alimenta el progreso de la nación.",
    "wordCount": 91,
    "questions": [
      {
        "id": "q22-1",
        "prompt": "¿En qué emblemático valle del occidente se ambienta la estampa campesina?",
        "options": [
          "En el valle de Palajunoj, al pie del volcán Santa María",
          "En el desierto de Zacapa",
          "En las playas de arena negra del Iztapa",
          "En las sabanas de Petén"
        ],
        "correctIndex": 0,
        "explanation": "El valle de Palajunoj en Quetzaltenango es célebre por su vocación agrícola y belleza volcánica."
      },
      {
        "id": "q22-2",
        "prompt": "¿Qué efecto tiene el clima frío del altiplano sobre el carácter de los agricultores?",
        "options": [
          "Los obliga a renunciar al trabajo en el campo",
          "Aviva la tenacidad y el compromiso con el esfuerzo productivo constante",
          "Provoca el abandono total de los sembradíos de trigo",
          "Genera apatía y resignación pasiva"
        ],
        "correctIndex": 1,
        "explanation": "El texto señala poéticamente que el rigor del clima forja la reciedumbre y temple del trabajador altocense."
      },
      {
        "id": "q22-3",
        "prompt": "¿Qué cultivo emblemático protagoniza la narración del paisaje quetzalteco?",
        "options": [
          "Las espigas doradas de trigo en tierras volcánicas",
          "Plantaciones extensivas de algodón costero",
          "Palmas africanas para biocombustibles",
          "Arbustos de té verde oriental"
        ],
        "correctIndex": 0,
        "explanation": "El trigo es el cultivo histórico tradicional vinculado a los molinos y panaderías de Quetzaltenango."
      }
    ]
  },
  {
    "id": "lec-23",
    "level": 23,
    "title": "La Carta Perdida en el Valle de Panchoy",
    "genre": "Crónica de Archivo Colonial",
    "targetWpm": 200,
    "xpReward": 230,
    "difficulty": "Avanzado",
    "author": "Archiveros del Reino de Guatemala",
    "pedagogicalSource": "Archivo Histórico de la Municipalidad de Antigua Guatemala",
    "competencies": [
      "Investigación documental",
      "Rigor histórico",
      "Apreciación del patrimonio escrito"
    ],
    "vocabulary": [
      {
        "word": "pergamino",
        "meaning": "Piel adobada de res o carnero preparada para escribir sobre ella."
      },
      {
        "word": "paleografía",
        "meaning": "Ciencia que estudia e interpreta la escritura y signos de documentos antiguos."
      },
      {
        "word": "legajo",
        "meaning": "Conjunto atado de papeles y documentos que tratan de un mismo asunto."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "En una alacena olvidada del ayuntamiento colonial, un joven investigador halló un pliego sellado con lacre carmesí que databa de 1680. Al descifrar la caligrafía procesal, descubrió un memorial suscrito por albañiles y canteros indígenas que solicitaban mejoras en las condiciones de seguridad en la edificación del acueducto municipal. El documento reveló que la historia no la escriben únicamente los capitanes ilustres, sino los miles de artífices anónimos cuyos nombres quedaron grabados en las argamasas y arcos que todavía sostienen los templos de nuestra patria.",
    "wordCount": 88,
    "questions": [
      {
        "id": "q23-1",
        "prompt": "¿Quiénes suscribían el memorial histórico hallado en el pliego de 1680?",
        "options": [
          "Comerciantes de telas de seda de Sevilla",
          "Albañiles y canteros indígenas constructores del acueducto",
          "Soldados mercenarios de las galeras reales",
          "Gobernadores extranjeros de paso por la capitanía"
        ],
        "correctIndex": 1,
        "explanation": "El documento fue redactado por los artífices y constructores originarios de las obras públicas coloniales."
      },
      {
        "id": "q23-2",
        "prompt": "¿Cuál es la reflexión medular que despierta el hallazgo del legajo?",
        "options": [
          "Que los documentos viejos deben quemarse para ahorrar espacio físico",
          "Que la historia también la forjaron miles de trabajadores anónimos con sus obras cotidianas",
          "Que solo las batallas armadas tienen derecho a ser recordadas",
          "Que los acueductos coloniales no tenían ninguna utilidad práctica"
        ],
        "correctIndex": 1,
        "explanation": "El rescate histórico reivindica el protagonismo de los constructores y trabajadores de base en la sociedad."
      },
      {
        "id": "q23-3",
        "prompt": "¿Qué disciplina científica permite transcribir e interpretar estos manuscritos antiguos?",
        "options": [
          "La paleografía y archivística documental",
          "La meteorología atmosférica",
          "La termodinámica aplicada",
          "La botánica experimental"
        ],
        "correctIndex": 0,
        "explanation": "La paleografía descifra escrituras arcaicas y abre el acceso al conocimiento documental del pasado."
      }
    ]
  },
  {
    "id": "lec-24",
    "level": 24,
    "title": "El Artesano de Jade y Estelas de Quiriguá",
    "genre": "Arqueología y Epigrafía Maya",
    "targetWpm": 202,
    "xpReward": 235,
    "difficulty": "Avanzado",
    "author": "Epigrafistas de la Cuenca del Motagua",
    "pedagogicalSource": "Parque Arqueológico de Quiriguá — Izabal",
    "competencies": [
      "Escultura monumental maya",
      "Comprensión calendárica",
      "Paciencia técnica y rigor"
    ],
    "vocabulary": [
      {
        "word": "estela",
        "meaning": "Monolito de piedra vertical labrado con inscripciones conmemorativas y retratos."
      },
      {
        "word": "epigrafía",
        "meaning": "Estudio e interpretación de inscripciones esculpidas sobre materiales duros."
      },
      {
        "word": "Quiriguá",
        "meaning": "Ciudad maya famosa por poseer las estelas de piedra más altas del mundo maya."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "A orillas del caudaloso río Motagua, donde yacen los yacimientos más ricos de jadeita verde manzana, los escultores mayas de Quiriguá desafiaron la dureza de la arenisca. Con cinceles de basalto y abrasivos de arena volcánica, el maestro tallador inmortalizó en la Estela E el ascenso del rey K'ak' Tiliw Chan Yopaat. Cada glifo labrado en la roca viva requería meses de paciencia meticulosa para asegurar que las fechas calendáricas perduraran milenios intactas. Aquellas moles de piedra nos recuerdan que cuando la técnica se une al propósito trascendente, la obra sobrevive al paso implacable de los siglos.",
    "wordCount": 97,
    "questions": [
      {
        "id": "q24-1",
        "prompt": "¿Por qué las estelas de Quiriguá son mundialmente célebres en la arqueología?",
        "options": [
          "Porque son las esculturas líticas monolíticas más altas y monumentales del mundo maya",
          "Porque fueron talladas en madera de pino balsa",
          "Porque se construyeron en solo veinticuatro horas de trabajo",
          "Porque no tienen ninguna inscripción jeroglífica"
        ],
        "correctIndex": 0,
        "explanation": "La Estela E de Quiriguá supera los 10 metros de altura, siendo el mayor monolito labrado del Nuevo Mundo."
      },
      {
        "id": "q24-2",
        "prompt": "¿Qué herramientas utilizaban los maestros escultores para doblegar la roca arenisca?",
        "options": [
          "Sierras eléctricas con punta de diamante",
          "Cinceles de basalto templado y arena abrasiva con agua",
          "Explosivos de pólvora negra",
          "Ganchos de alambre galvanizado"
        ],
        "correctIndex": 1,
        "explanation": "Los artesanos mayas dominaban técnicas líticas de gran sofisticación mediante rocas duras y abrasión."
      },
      {
        "id": "q24-3",
        "prompt": "¿Cuál es el valor universal que transmite la perseverancia de los talladores de Quiriguá?",
        "options": [
          "Que la técnica aliada a un propósito trascendente crea obras que vencen al tiempo",
          "Que es mejor terminar las obras con rapidez sin cuidar los detalles",
          "Que el arte de la escultura debe mantenerse en secreto absoluto",
          "Que las piedras blandas son siempre preferibles a las duras"
        ],
        "correctIndex": 0,
        "explanation": "La devoción a la excelencia formal y matemática convierte el oficio humano en patrimonio perenne."
      }
    ]
  },
  {
    "id": "lec-25",
    "level": 25,
    "title": "El Guardián del Faro de Livingston",
    "genre": "Cultura Garífuna y Caribe",
    "targetWpm": 205,
    "xpReward": 240,
    "difficulty": "Avanzado",
    "author": "Crónicas de la Bahía de Amatique",
    "pedagogicalSource": "Comunidad Garífuna de Livingston — Patrimonio Cultural Inmaterial",
    "competencies": [
      "Multiculturalidad guatemalteca",
      "Tradición marítima",
      "Responsabilidad profesional"
    ],
    "vocabulary": [
      {
        "word": "garífuna",
        "meaning": "Pueblo afrodescendiente con lengua, danza y gastronomía única en el Caribe guatemalteco."
      },
      {
        "word": "bajío",
        "meaning": "Banco de arena o roca bajo el agua poco profunda donde pueden encallar barcos."
      },
      {
        "word": "vigilancia",
        "meaning": "Cuidado atento y continuado para evitar accidentes o pérdidas."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "Don Celso encendía la linterna del faro de Livingston cada crepúsculo, orientando a los cayucos de pescadores que cruzaban la boca del río Dulce hacia el mar abierto. Con el compás de los tambores garífunas resonando a lo lejos desde la playa, el anciano vigía vigilaba los bancos de arena y los arrecifes traicioneros de la bahía. Sabía que su soledad en la torre resguardaba la vida y el regreso seguro de decenas de padres de familia a sus hogares. Aquel humilde deber cumplido con fidelidad insobornable constituye el corazón de la responsabilidad profesional que dignifica cualquier oficio humano.",
    "wordCount": 97,
    "questions": [
      {
        "id": "q25-1",
        "prompt": "¿Qué función vital desempeñaba Don Celso desde la torre del faro costero?",
        "options": [
          "Vender pescado enlatado a los navíos mercantes",
          "Guiar con luz a los pescadores y prevenir que encallaran en los bajíos peligrosos",
          "Bloquear el paso de embarcaciones comunitarias",
          "Tocar tambores ceremoniales toda la noche"
        ],
        "correctIndex": 1,
        "explanation": "La guardia nocturna del farero salvaguardaba la navegación y las vidas de la comunidad pesquera."
      },
      {
        "id": "q25-2",
        "prompt": "¿Qué pueblo y cultura enriquecen con sus tradiciones este rincón del Caribe guatemalteco?",
        "options": [
          "La cultura y pueblo Garífuna de Livingston",
          "Los pastores nómadas del Tíbet",
          "Los esquimales del Ártico occidental",
          "Los colonos sajones del siglo XIX"
        ],
        "correctIndex": 0,
        "explanation": "Livingston es el hogar histórico y epicentro vivo de la vibrante cultura garífuna en Guatemala."
      },
      {
        "id": "q25-3",
        "prompt": "¿Qué principio ético destaca la vocación de servicio del farero?",
        "options": [
          "El cumplimiento fiel y silencioso de la responsabilidad profesional por el prójimo",
          "El desinterés por el bienestar de los compañeros de trabajo",
          "El cobro abusivo a los navegantes extraviados",
          "El abandono de la guardia en días lluviosos"
        ],
        "correctIndex": 0,
        "explanation": "La constancia del farero es ejemplo de la nobleza del trabajo técnico cuando vela por la seguridad comunitaria."
      }
    ]
  },
  {
    "id": "lec-26",
    "level": 26,
    "title": "La Balada del Hormigo y la Marimba Kinal",
    "genre": "Música y Patrimonio Nacional",
    "targetWpm": 208,
    "xpReward": 245,
    "difficulty": "Avanzado",
    "author": "Cátedra de Arte y Musicología Kinal",
    "pedagogicalSource": "Conservatorio Nacional de Música \"Germán Alcántara\"",
    "competencies": [
      "Identidad sonora nacional",
      "Acústica y ebanistería de precisión",
      "Trabajo en equipo armónico"
    ],
    "vocabulary": [
      {
        "word": "hormigo",
        "meaning": "Madera fina guatemalteca que canta, empleada para fabricar las teclas de marimba."
      },
      {
        "word": "resonadores",
        "meaning": "Cajas o tubos colocados bajo las teclas para amplificar el sonido con calidez."
      },
      {
        "word": "polifonía",
        "meaning": "Conjunto de sonidos o voces que suenan simultáneamente en perfecta concordia."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "En las manos diestras del ebanista, la madera rojiza del árbol de hormigo se convierte en teclado musical capaz de hacer vibrar el alma de toda una nación. Cada tecla debe cepillarse con precisión milimétrica para que su tono resuene afinado sobre los resonadores de madera de cedro. Cuando los jóvenes marimbistas de Fundación Kinal interpretan al unísono las notas de \"Luna de Xelajú\", no solo ejecutan una partitura: demuestran que la armonía social se alcanza cuando cada individuo afina sus destrezas con rigor y las coordina al compás solidario de sus hermanos.",
    "wordCount": 94,
    "questions": [
      {
        "id": "q26-1",
        "prompt": "¿Qué especie maderable guatemalteca es insustituible para fabricar las teclas de la marimba?",
        "options": [
          "La madera del árbol de hormigo",
          "El pino blanco resinoso",
          "El eucalipto aromático australiano",
          "El bambú hueco de río"
        ],
        "correctIndex": 0,
        "explanation": "El hormigo (Platymiscium dimorphandrum) es mundialmente conocido como la madera que canta."
      },
      {
        "id": "q26-2",
        "prompt": "¿Qué analogía moral se establece a partir del ensamble instrumental de la marimba?",
        "options": [
          "Que el ejecutante solitario no necesita escuchar a los demás",
          "Que la armonía colectiva exige que cada uno prepare su destreza y coopere solidariamente",
          "Que la música debe reemplazar todos los estudios técnicos y científicos",
          "Que los instrumentos antiguos deben abandonarse por pistas sintéticas"
        ],
        "correctIndex": 1,
        "explanation": "La orquestación de la marimba enseña sincronía, humildad y colaboración fraternal."
      },
      {
        "id": "q26-3",
        "prompt": "¿Qué célebre obra musical de la identidad guatemalteca se cita en la narración?",
        "options": [
          "La marcha militar de las legiones romanas",
          "El vals inmortal \"Luna de Xelajú\" de Paco Pérez",
          "Un réquiem barroco austriaco",
          "Una balada pop comercial extranjera"
        ],
        "correctIndex": 1,
        "explanation": "\"Luna de Xelajú\", compuesta por Paco Pérez, es el himno sentimental de la identidad musical del país."
      }
    ]
  },
  {
    "id": "lec-27",
    "level": 27,
    "title": "El Astrónomo de Uaxactún y los Eclipses",
    "genre": "Astronomía y Matemática Maya",
    "targetWpm": 210,
    "xpReward": 250,
    "difficulty": "Avanzado",
    "author": "Observatorio Astronómico de Petén",
    "pedagogicalSource": "Instituto de Antropología e Historia — Grupo E de Uaxactún",
    "competencies": [
      "Cálculo matemático astronómico",
      "Observación empírica",
      "Paciencia investigativa"
    ],
    "vocabulary": [
      {
        "word": "equinoccio",
        "meaning": "Momento del año en que el día y la noche tienen exactamente la misma duración."
      },
      {
        "word": "solsticio",
        "meaning": "Época en que el sol se halla en uno de los dos trópicos señalando el cambio estacional."
      },
      {
        "word": "zenit",
        "meaning": "Punto del firmamento verticalmente situado sobre la cabeza del observador."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "Desde la plataforma del Grupo E en la ciudad selvática de Uaxactún, el sacerdote astrónomo observaba el alineamiento perfecto del sol al despuntar sobre los tres templos del horizonte este. Siglos antes de la invención del telescopio óptico, los sabios mayas calcularon con exactitud asombrosa la duración del año solar trópico, el ciclo sinódico de Venus y las fechas críticas de los eclipses lunares. Este colosal monumento de arquitectura astronómica demuestra que el rigor científico, la paciencia observacional y el amor al conocimiento florecieron con esplendor soberbio en el corazón de nuestras selvas mesoamericanas.",
    "wordCount": 94,
    "questions": [
      {
        "id": "q27-1",
        "prompt": "¿Qué complejo arquitectónico de Uaxactún funcionaba como observatorio conmemorativo solar?",
        "options": [
          "El muelle flotante de Sayaxché",
          "La plataforma astronómica del Grupo E alineada con tres templos orientales",
          "La cueva funeraria de Naj Tunich",
          "El palacio de gobierno de Santiago Atitlán"
        ],
        "correctIndex": 1,
        "explanation": "El Grupo E de Uaxactún es el primer complejo astronómico conmemorativo documentado de la civilización maya."
      },
      {
        "id": "q27-2",
        "prompt": "¿Qué fenómenos celestes calcularon con exactitud los astrónomos mayas prehispánicos?",
        "options": [
          "El año trópico, los ciclos de Venus y la recurrencia periódica de eclipses",
          "La velocidad de los motores de reacción atómica",
          "El magnetismo del núcleo de Saturno con satélites artificiales",
          "La temperatura del interior de los meteoritos caídos"
        ],
        "correctIndex": 0,
        "explanation": "La matemática vigesimal y el sistema posicional con cero permitieron cálculos astronómicos sin parangón."
      },
      {
        "id": "q27-3",
        "prompt": "¿Cuál es el testimonio histórico fundamental que lega este complejo a la juventud actual?",
        "options": [
          "Que el rigor investigativo y la ciencia florecieron con esplendor en nuestra propia tierra",
          "Que la astronomía antigua no tenía fundamento observacional empírico",
          "Que las matemáticas no son necesarias para comprender el universo",
          "Que los edificios antiguos carecían de planificación previa"
        ],
        "correctIndex": 0,
        "explanation": "Inspirar orgullo y vocación por las ciencias exactas y el pensamiento metódico a partir de la herencia propia."
      }
    ]
  },
  {
    "id": "lec-28",
    "level": 28,
    "title": "El Manuscrito Secreto de Chichicastenango",
    "genre": "Literatura Maya Quiché",
    "targetWpm": 215,
    "xpReward": 260,
    "difficulty": "Avanzado",
    "author": "Custodios de la Tradición Sagrada",
    "pedagogicalSource": "Biblioteca Municipal de Santo Tomás Chichicastenango",
    "competencies": [
      "Conservación del patrimonio bibliográfico",
      "Respeto al libro como objeto de memoria",
      "Hermeneútica textual"
    ],
    "vocabulary": [
      {
        "word": "custodio",
        "meaning": "Persona encargada de cuidar, guardar y defender con celo un tesoro cultural."
      },
      {
        "word": "proscrito",
        "meaning": "Que ha sido prohibido o desterrado por mandatos de autoridad."
      },
      {
        "word": "hermenéutica",
        "meaning": "Arte y ciencia de interpretar textos para develar su sentido original."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "Durante décadas de persecución y censura, los sabios principales de Chichicastenango ocultaron el códice sagrado bajo el piso de sus hogares de adobe, protegiéndolo de las llamas de la incomprensión. Fue en los albores del siglo XVIII cuando Fray Francisco Ximénez, respetando la lengua nativa k'iche', transcribió en columnas paralelas el texto que hoy conocemos como el Popol Vuh. La lealtad de aquellos guardianes anónimos salvó de la extinción definitiva el libro sagrado más bello de la América indígena, probando que el amor a las letras es el mejor escudo para defender la identidad de los pueblos.",
    "wordCount": 97,
    "questions": [
      {
        "id": "q28-1",
        "prompt": "¿Cómo lograron los ancianos proteger el manuscrito sagrado de la destrucción colonial?",
        "options": [
          "Ocultándolo celosamente bajo el suelo de sus casas de adobe por generaciones",
          "Enviándolo por correo marítimo a una universidad de Asia",
          "Arrojándolo a las aguas profundas del lago Atitlán",
          "Publicándolo en periódicos de gran tirada comercial"
        ],
        "correctIndex": 0,
        "explanation": "La custodia secreta y solidaria de los abuelos mayas preservó el texto hasta encontrar a un fraile respetuoso."
      },
      {
        "id": "q28-2",
        "prompt": "¿Qué religioso e historiador transcribió y tradujo el texto en Chichicastenango?",
        "options": [
          "Fray Francisco Ximénez",
          "Fray Diego de Landa",
          "Fray Toribio de Benavente",
          "Fray Juan de Zumárraga"
        ],
        "correctIndex": 0,
        "explanation": "Fray Francisco Ximénez realizó la célebre traducción bilingüe k'iche'-castellano a inicios del siglo XVIII."
      },
      {
        "id": "q28-3",
        "prompt": "¿Qué lección permanente aporta la salvaguarda de este tesoro bibliográfico?",
        "options": [
          "Que el amor al libro y a la lectura constituye el baluarte supremo de la identidad cultural",
          "Que los libros antiguos pierden vigencia cuando cambian las modas literarias",
          "Que la censura oficial es indispensable para la tranquilidad social",
          "Que no tiene sentido conservar textos en idiomas originarios"
        ],
        "correctIndex": 0,
        "explanation": "El rescate del Popol Vuh demuestra que la memoria escrita es el más poderoso escudo de dignidad de los pueblos."
      }
    ]
  },
  {
    "id": "lec-29",
    "level": 29,
    "title": "El Manifiesto Humanista del Técnico Kinal",
    "genre": "Ética y Vocación de Servicio",
    "targetWpm": 218,
    "xpReward": 270,
    "difficulty": "Avanzado",
    "author": "Cátedra Mayor de Humanidades Kinal",
    "pedagogicalSource": "Fundación Kinal — Ideario Formativo Institucional",
    "competencies": [
      "Ética profesional",
      "Humanización del trabajo técnico",
      "Compromiso social transformador"
    ],
    "vocabulary": [
      {
        "word": "ideario",
        "meaning": "Conjunto de ideas y principios éticos que orientan la conducta de una institución."
      },
      {
        "word": "mecanicismo",
        "meaning": "Tendencia a considerar al ser humano como un simple engranaje de producción."
      },
      {
        "word": "trascendencia",
        "meaning": "Resultado o efecto que sobrepasa los límites del tiempo y beneficia a la sociedad."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "En los talleres y laboratorios de Fundación Kinal, la técnica no es un fin en sí misma, sino el medio noble por el cual el ser humano perfecciona su propia alma y transforma positivamente su comunidad. El auténtico técnico humanista rechaza la frialdad del mecanicismo ciego; comprende que detrás de cada plano de ingeniería, de cada circuito integrado y de cada línea de código computacional palpitan vidas humanas que confían en la seguridad de su labor. Trabajar con honradez es orar con las manos y construir con la mente una patria más justa, solidaria y próspera para todos.",
    "wordCount": 97,
    "questions": [
      {
        "id": "q29-1",
        "prompt": "¿Qué papel desempeña la técnica en la filosofía formativa de Fundación Kinal?",
        "options": [
          "Un medio noble para perfeccionar el carácter humano y servir comunitariamente",
          "Un mecanismo puramente lucrativo para desplazar a los trabajadores",
          "Una rutina obligatoria sin ningún propósito moral o social",
          "Un pasatiempo exclusivo de laboratorio sin aplicación práctica"
        ],
        "correctIndex": 0,
        "explanation": "En Kinal la destreza técnica se subordina a la dignidad humana y a la vocación de servicio desinteresado."
      },
      {
        "id": "q29-2",
        "prompt": "¿Qué principio orienta el trabajo de cada profesional graduado de Kinal?",
        "options": [
          "Comprender que detrás de cada desarrollo técnico hay seres humanos cuya seguridad depende de su honradez",
          "Reducir costos a cualquier precio sacrificando la calidad de los materiales",
          "Ocultar los errores técnicos a los clientes y compañeros",
          "Competir despiadadamente contra otros egresados"
        ],
        "correctIndex": 0,
        "explanation": "La excelencia profesional se fundamenta en la rectitud ética y la responsabilidad ante la sociedad."
      },
      {
        "id": "q29-3",
        "prompt": "¿Qué metáfora sintetiza la consagración al trabajo bien elaborado?",
        "options": [
          "Trabajar con honradez es orar con las manos y construir con la mente",
          "Hacer lo mínimo necesario para cobrar el salario quincenal",
          "Esperar que otros resuelvan los desafíos del país",
          "Delegar siempre la responsabilidad en las máquinas"
        ],
        "correctIndex": 0,
        "explanation": "La labor diaria bien ejecutada adquiere una dimensión espiritual de servicio fecundo hacia los demás."
      }
    ]
  },
  {
    "id": "lec-30",
    "level": 30,
    "title": "La Batalla Oratoria del Cerro del Carmen",
    "genre": "Elocuencia y Comunicación Efectiva",
    "targetWpm": 220,
    "xpReward": 280,
    "difficulty": "Avanzado",
    "author": "Cronistas de la Nueva Guatemala de la Asunción",
    "pedagogicalSource": "Sociedad de Oratoria y Debate Forense de Guatemala",
    "competencies": [
      "Oratoria y persuasión ética",
      "Claridad sintáctica",
      "Liderazgo comunicativo"
    ],
    "vocabulary": [
      {
        "word": "elocuencia",
        "meaning": "Facultad de hablar con fluidez, elegancia y poder persuasivo de convencimiento."
      },
      {
        "word": "cerro del Carmen",
        "meaning": "Colina histórica de la ciudad donde se erigió la primera ermita en el siglo XVII."
      },
      {
        "word": "rectitud",
        "meaning": "Firmeza de conducta guiada por la moral, la justicia y la verdad."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "Bajo la sombra de los cipreses de la ermita del Cerrito del Carmen, los jóvenes debatientes de la capital se congregaban para contrastar visiones sobre el porvenir de la república. Frente a un público expectante, el orador más destacado no fue aquel que recurrió a los gritos altisonantes o a la descalificación del adversario, sino quien expuso argumentos serenos, fundamentados en datos verídicos y dictados por una profunda honradez intelectual. La verdadera elocuencia no consiste en subyugar con artificios, sino en iluminar las conciencias para caminar juntos hacia la concordia social.",
    "wordCount": 93,
    "questions": [
      {
        "id": "q30-1",
        "prompt": "¿Dónde se celebraban las competencias oratorias juveniles en la capital?",
        "options": [
          "En las colinas históricas del Cerrito del Carmen",
          "En el hipódromo del norte abandonado",
          "En los sótanos del Banco de Guatemala",
          "En el muelle de carga de Santo Tomás de Castilla"
        ],
        "correctIndex": 0,
        "explanation": "El Cerrito del Carmen es un rincón emblemático cargado de memoria y paisaje ciudadano."
      },
      {
        "id": "q30-2",
        "prompt": "¿Qué cualidad caracterizó al orador más persuasivo del certamen?",
        "options": [
          "Argumentos serenos, datos verídicos e irreprochable honradez intelectual",
          "Gritos estridentes y ataques personales contra los rivales",
          "Frases en idiomas incomprensibles para confundir al jurado",
          "Lectura acelerada sin pausas ni entonación"
        ],
        "correctIndex": 0,
        "explanation": "La oratoria virtuosa descansa en la solidez lógica, la calma y el respeto genuino al interlocutor."
      },
      {
        "id": "q30-3",
        "prompt": "¿Cuál es el propósito más noble de la palabra persuasiva en la sociedad?",
        "options": [
          "Iluminar conciencias y guiar a la comunidad hacia la concordia y el entendimiento",
          "Manipular las emociones para obtener beneficios electorales mezquinos",
          "Sembrar división y enemistad entre familias",
          "Silenciar a quienes opinan de manera diferente"
        ],
        "correctIndex": 0,
        "explanation": "El fin supremo de la comunicación elocuente es el bien común y la convivencia pacífica."
      }
    ]
  },
  {
    "id": "lec-31",
    "level": 31,
    "title": "El Acueducto de Pinula y la Ingeniería Colonial",
    "genre": "Infraestructura y Bien Común",
    "targetWpm": 222,
    "xpReward": 290,
    "difficulty": "Avanzado",
    "author": "Cuerpo de Ingenieros y Topógrafos",
    "pedagogicalSource": "Colegio de Ingenieros de Guatemala — Historia de las Obras Civiles",
    "competencies": [
      "Ingeniería civil patrimonial",
      "Cálculo hidráulico",
      "Sentido social de la infraestructura"
    ],
    "vocabulary": [
      {
        "word": "arquería",
        "meaning": "Serie de arcos superpuestos o continuos que sostienen una estructura o canal."
      },
      {
        "word": "topografía",
        "meaning": "Técnica de describir y delinear detalladamente la superficie de un terreno."
      },
      {
        "word": "hidráulica",
        "meaning": "Rama de la física que estudia el equilibrio y movimiento de los fluidos de agua."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "Para dotar de agua pura a la naciente Nueva Guatemala de la Asunción tras los terremotos de Santa Marta, los alarifes coloniales diseñaron los imponentes arcos de ladrillo del Acueducto de Pinula. A lo largo de leguas de terreno ondulado, la pendiente se calculó con niveles de agua y plomadas rudimentarias, logrando que el líquido vital descendiera por gravedad constante hasta las fuentes públicas del centro urbano. Esta monumental obra de ingeniería hidráulica demuestra que la técnica bien concebida es el soporte invisible pero imprescindible que garantiza la salud, higiene y dignidad de toda la ciudadanía.",
    "wordCount": 97,
    "questions": [
      {
        "id": "q31-1",
        "prompt": "¿Cuál fue la misión primordial del Acueducto de Pinula en la historia de la capital?",
        "options": [
          "Abastecer de agua potable por gravedad a la nueva capital tras los terremotos de 1773",
          "Servir de muro militar contra invasiones de ultramar",
          "Funcionar como pista de carreras de carruajes virreinales",
          "Desviar los ríos hacia las haciendas privadas"
        ],
        "correctIndex": 0,
        "explanation": "El acueducto fue la arteria vital que hizo viable el traslado y subsistencia de la nueva metrópoli."
      },
      {
        "id": "q31-2",
        "prompt": "¿Cómo lograron los constructores una pendiente hidráulica perfecta sin equipos modernos?",
        "options": [
          "Con niveles de agua de vaso comunicante y plomadas de precisión artesanal",
          "Mediante cálculos empíricos al azar sin medir distancias",
          "Contratando satélites de radar topográfico",
          "Esperando que el agua encontrara su propio curso en zanjas abiertas"
        ],
        "correctIndex": 0,
        "explanation": "El ingenio empírico de los alarifes aplicó la física elemental de fluidos con exactitud admirable."
      },
      {
        "id": "q31-3",
        "prompt": "¿Qué valor cívico enseña la historia de las grandes obras de infraestructura?",
        "options": [
          "Que la técnica civil es el soporte que garantiza la salud, bienestar y dignidad colectiva",
          "Que las ciudades no necesitan obras de abastecimiento planificadas",
          "Que las fuentes públicas deben cerrarse al pueblo trabajador",
          "Que el agua debe venderse a precios inalcanzables"
        ],
        "correctIndex": 0,
        "explanation": "El acceso al agua y saneamiento es la base material de los derechos humanos y la vida civilizada."
      }
    ]
  },
  {
    "id": "lec-32",
    "level": 32,
    "title": "El Canto del Chajalele en la Alborada",
    "genre": "Lírica Campesina y Naturaleza",
    "targetWpm": 225,
    "xpReward": 300,
    "difficulty": "Avanzado",
    "author": "Poetas de la Sierra de Chuacús",
    "pedagogicalSource": "Asociación de Escritores Mayas de Guatemala",
    "competencies": [
      "Sensibilidad poética",
      "Biología ornitológica regional",
      "Puntualidad en el deber"
    ],
    "vocabulary": [
      {
        "word": "chajalele",
        "meaning": "Ave del altiplano conocida por su trino madrugador que anuncia el amanecer."
      },
      {
        "word": "alborada",
        "meaning": "Momento de la mañana en que empieza a clarear antes de salir el sol."
      },
      {
        "word": "surco",
        "meaning": "Hendidura longitudinal que se hace en la tierra con el arado para sembrar."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "Mucho antes de que el sol despunte sobre las lomas de San Jerónimo, el canto agudo y alegre del chajalele rompe la niebla fría de los pajonales. Su trino mañanero es el reloj de la campiña guatemalteca: despierta a los sembradores de habas, convoca a los arrieros y recuerda que la madrugada pertenece a quienes tienen la voluntad despierta. El ave no exige recompensas ni aplausos por su labor; canta por la pura vocación de anunciar la luz que renueva la tierra, dando un vivo ejemplo de gratuidad, puntualidad y amor generoso por la existencia cotidiana.",
    "wordCount": 96,
    "questions": [
      {
        "id": "q32-1",
        "prompt": "¿Qué función cumple tradicionalmente el canto del chajalele en los campos guatemaltecos?",
        "options": [
          "Anunciar el inicio de la alborada y despertar con su trino a los trabajadores del campo",
          "Avisar de la llegada de tormentas huracanadas en el mar",
          "Ahuyentar a las abejas de los sembradíos",
          "Marcar la hora de dormir a las mascotas domésticas"
        ],
        "correctIndex": 0,
        "explanation": "El chajalele es el ave madrugadora por excelencia, reloj natural del campesinado en las veredas altas."
      },
      {
        "id": "q32-2",
        "prompt": "¿Qué actitud vital ejemplifica el ave con su trino gratuito al amanecer?",
        "options": [
          "La vocación sincera de servir sin exigir aplausos ni vanidades personales",
          "La pereza ante la llegada del invierno",
          "El miedo a los rayos solares de la mañana",
          "El egoísmo frente a las demás aves del nido"
        ],
        "correctIndex": 0,
        "explanation": "Su canto celebra la luz y el comienzo del día como un acto generoso de puntualidad desinteresada."
      },
      {
        "id": "q32-3",
        "prompt": "¿A quiénes pertenece el valor de la madrugada según la reflexión lírica?",
        "options": [
          "A quienes tienen la voluntad despierta y el ánimo presto al deber productivo",
          "Únicamente a quienes no necesitan descansar en la noche",
          "A los comerciantes ambulantes de la costa",
          "A los viajeros extranjeros que no conocen el camino"
        ],
        "correctIndex": 0,
        "explanation": "La disciplina de madrugar se asocia en el texto con la excelencia del carácter y la determinación."
      }
    ]
  },
  {
    "id": "lec-33",
    "level": 33,
    "title": "La Declaración de Independencia en el Palacio Real",
    "genre": "Historia y Conciencia Ciudadana",
    "targetWpm": 228,
    "xpReward": 310,
    "difficulty": "Avanzado",
    "author": "Historiadores del Bicentenario",
    "pedagogicalSource": "Academia de Geografía e Historia de Guatemala — Archivo de 1821",
    "competencies": [
      "Pensamiento cívico crítico",
      "Análisis del proceso independentista",
      "Responsabilidad republicana"
    ],
    "vocabulary": [
      {
        "word": "emancipación",
        "meaning": "Liberación respecto de un poder, autoridad o tutela de gobierno opresor."
      },
      {
        "word": "bando",
        "meaning": "Edicto o mandato solemne publicado por una autoridad en plaza pública."
      },
      {
        "word": "soberanía",
        "meaning": "Poder político supremo que reside en el pueblo para autodeterminarse libremente."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "La mañana del quince de septiembre de mil ochocientos veintiuno, los pasillos del Palacio de los Capitanes vibraban con el fervor de los patriotas congregados para deliberar sobre la emancipación política. Mientras las campanas doblaban con júbilo en la plaza colmada de ciudadanos, Don José Cecilio del Valle redactó con mano firme el acta que proclamaba la soberanía de las provincias de Centroamérica. Aquella histórica rúbrica no fue el punto final de una lucha, sino el inicio de una inmensa responsabilidad compartida: construir una república libre donde la educación, la honradez y la concordia sean los cimientos inmutables de la paz.",
    "wordCount": 100,
    "questions": [
      {
        "id": "q33-1",
        "prompt": "¿Quién redactó con pulso firme el texto original del Acta de Independencia de 1821?",
        "options": [
          "Don José Cecilio del Valle",
          "El rey Fernando VII de España",
          "El mariscal Sucre en los Andes",
          "Simón Bolívar en Caracas"
        ],
        "correctIndex": 0,
        "explanation": "José Cecilio del Valle, sabio humanista y jurista, redactó los artículos del Acta de Independencia."
      },
      {
        "id": "q33-2",
        "prompt": "¿Cómo describe el texto el significado histórico de la firma emancipadora?",
        "options": [
          "Como el inicio de una inmensa responsabilidad compartida para edificar una nación justa y educada",
          "Como un trámite protocolario sin relevancia para el pueblo trabajador",
          "Como el permiso para descuidar las leyes y las obligaciones civiles",
          "Como el final de todos los problemas sociales de Centroamérica"
        ],
        "correctIndex": 0,
        "explanation": "La independencia se plantea como un compromiso activo y cotidiano de civismo y educación continua."
      },
      {
        "id": "q33-3",
        "prompt": "¿Cuáles son los cimientos inmutables señalados para afianzar la paz republicana?",
        "options": [
          "La educación sólida, la honradez de gobernantes y ciudadanos, y la concordia fraterna",
          "El gasto militar desmedido y el cierre de fronteras comerciales",
          "La imposición violenta de ideologías foráneas",
          "La exclusión de las comunidades rurales del progreso educativo"
        ],
        "correctIndex": 0,
        "explanation": "La verdadera libertad sólo fructifica mediante el saber ético, la probidad y la unidad cívica."
      }
    ]
  },
  {
    "id": "lec-34",
    "level": 34,
    "title": "Voces Inmortales de la Academia Guatemalteca",
    "genre": "Ensayo y Riqueza del Idioma",
    "targetWpm": 230,
    "xpReward": 320,
    "difficulty": "Avanzado",
    "author": "Cátedra de Lingüística Aplicada Kinal",
    "pedagogicalSource": "Academia Guatemalteca de la Lengua — RAE",
    "competencies": [
      "Enriquecimiento léxico",
      "Dominio del idioma español",
      "Identidad lingüística mesoamericana"
    ],
    "vocabulary": [
      {
        "word": "guatemaltequismos",
        "meaning": "Palabras o locuciones propias del habla popular y culta de Guatemala."
      },
      {
        "word": "sinonimia",
        "meaning": "Relación entre palabras que comparten un significado equivalente o afín."
      },
      {
        "word": "dicción",
        "meaning": "Forma correcta y clara de pronunciar las palabras y estructurar oraciones."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "El idioma español hablado en Guatemala es un río caudaloso donde confluyen la elegancia de la prosa de Cervantes con las sonoridades ancestrales de veintidós idiomas mayas, el xinka y el garífuna. Vocablos entrañables como \"chispudo\", \"chilero\" o \"chucho\" encierran una calidez afectiva que ninguna traducción literal puede agotar. El estudiante técnico que cultiva la lectura amplia no solo mejora su velocidad lectora y ortografía, sino que se convierte en un comunicador persuasivo, capaz de defender proyectos de alto calibre con elegancia, precisión conceptual y genuino arraigo en la riqueza verbal de su pueblo.",
    "wordCount": 95,
    "questions": [
      {
        "id": "q34-1",
        "prompt": "¿Qué ríos culturales nutren la singularidad del habla cotidiana y literaria de Guatemala?",
        "options": [
          "La tradición clásica castellana entretejida con 22 idiomas mayas, el xinka y el garífuna",
          "Únicamente influencias anglosajonas de los medios masivos",
          "El dialecto colonial de las islas Filipinas sin mezclas locales",
          "Traducciones automatizadas de manuales de maquinaria"
        ],
        "correctIndex": 0,
        "explanation": "Nuestra lengua es un patrimonio mestizo y plurilingüe enriquecido por milenios de historia compartida."
      },
      {
        "id": "q34-2",
        "prompt": "¿Qué ventaja profesional adquiere el técnico que domina ampliamente su idioma materno?",
        "options": [
          "La capacidad de comunicar ideas complejas con precisión, elegancia y liderazgo persuasivo",
          "El desinterés por las materias científicas y matemáticas",
          "La imposibilidad de trabajar en equipos internacionales",
          "El rechazo a la tecnología digital moderna"
        ],
        "correctIndex": 0,
        "explanation": "El dominio lingüístico potencia el liderazgo técnico, la formulación de proyectos y el éxito profesional."
      },
      {
        "id": "q34-3",
        "prompt": "¿Qué término coloquial guatemalteco alude a una persona avispada, rápida y capaz?",
        "options": [
          "Chispudo",
          "Lento",
          "Rezongón",
          "Tumbado"
        ],
        "correctIndex": 0,
        "explanation": "\"Chispudo\" es el guatemaltequismo por excelencia para designar agilidad mental, proactividad y destreza."
      }
    ]
  },
  {
    "id": "lec-35",
    "level": 35,
    "title": "La Travesía por los Cañones del Río Usumacinta",
    "genre": "Aventura y Soberanía Territorial",
    "targetWpm": 232,
    "xpReward": 330,
    "difficulty": "Avanzado",
    "author": "Expedicionarios de la Selva Lacandona",
    "pedagogicalSource": "Comisión de Límites y Aguas Internacionales — Frontera Petenera",
    "competencies": [
      "Geografía fluvial fronteriza",
      "Liderazgo expedicionario",
      "Conservación de biosferas"
    ],
    "vocabulary": [
      {
        "word": "raudales",
        "meaning": "Lugares de un río donde la corriente es extremadamente rápida y turbulenta."
      },
      {
        "word": "meandros",
        "meaning": "Curvas pronunciadas y sinuosas que describe el curso de un río caudaloso."
      },
      {
        "word": "biodiversidad",
        "meaning": "Variedad inmensa de especies animales y vegetales que habitan un ecosistema."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "Navegar los raudales espumosos del río Usumacinta a través del Cañón de Boca del Cerro es internarse en el corazón verde más indómito de Petén. Las paredes calizas de más de trescientos metros de altura se alzan como murallas guardianas de la selva virgen, donde los monos aulladores custodian las ruinas cubiertas de musgo de Piedras Negras y Yaxchilán. Los tripulantes que manejan el timón en los remolinos aprenden que la fuerza bruta es inútil si no va acompañada por la lectura atenta de la corriente y la serenidad ante el peligro, lección fundamental para gobernar la propia vida frente a las tempestades del mundo.",
    "wordCount": 104,
    "questions": [
      {
        "id": "q35-1",
        "prompt": "¿Qué ciudades arqueológicas mayas flanquean el curso caudaloso del Usumacinta?",
        "options": [
          "Piedras Negras y Yaxchilán en medio de la selva virgen",
          "Copán Ruinas y Tazumal",
          "Monte Albán y Teotihuacán",
          "Machu Picchu y Cusco"
        ],
        "correctIndex": 0,
        "explanation": "El Usumacinta fue la gran autopista fluvial de urbes mayas monumentales del periodo clásico."
      },
      {
        "id": "q35-2",
        "prompt": "¿Qué enseñanza de navegación fluvial aplica directamente al gobierno del carácter humano?",
        "options": [
          "Que la fuerza física ciega es estéril sin la lectura prudente del entorno y la calma reflexiva",
          "Que se debe navegar a máxima velocidad con los ojos cerrados",
          "Que es imposible superar cualquier corriente de agua",
          "Que los ríos caudalosos deben secarse con muros de contención"
        ],
        "correctIndex": 0,
        "explanation": "El timonel experto vence el peligro estudiando la corriente con serenidad y prudencia técnica."
      },
      {
        "id": "q35-3",
        "prompt": "¿Qué frontera natural delimita este imponente accidente hidrográfico?",
        "options": [
          "La frontera fluvial occidental entre Guatemala y México",
          "El límite entre Guatemala y El Salvador",
          "La desembocadura del canal de Panamá",
          "El estrecho marítimo de Magallanes"
        ],
        "correctIndex": 0,
        "explanation": "El río Usumacinta es el límite fluvial internacional más caudaloso del norte guatemalteco."
      }
    ]
  },
  {
    "id": "lec-36",
    "level": 36,
    "title": "El Filósofo del Callejón del Fino Trato",
    "genre": "Crítica Social y Filosofía Práctica",
    "targetWpm": 235,
    "xpReward": 340,
    "difficulty": "Avanzado",
    "author": "Ensayistas del Centro Histórico",
    "pedagogicalSource": "Facultad de Humanidades — Ensayos Éticos sobre la Convivencia",
    "competencies": [
      "Urbanidad y cortesía cívica",
      "Filosofía moral aplicada",
      "Empatía social en la urbe"
    ],
    "vocabulary": [
      {
        "word": "urbanidad",
        "meaning": "Comportamiento cortés, comedido y atento a las buenas costumbres cívicas."
      },
      {
        "word": "afabilidad",
        "meaning": "Cualidad en el trato que hace grata y acogedora la conversación."
      },
      {
        "word": "pragmatismo",
        "meaning": "Preferencia por lo práctico y útil en la solución de problemas cotidianos."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "En una modesta zapatería del callejón del Fino Trato, cerca de la iglesia de La Candelaria, el maestro zapatero Don Lisandro solía decir que la cortesía es el aceite que evita que la maquinaria social rechine con aspereza. Mientras cosía suelas de cuero con hilo encerado, conversaba con estudiantes, médicos y cargadores del mercado, dispensando a todos el mismo respeto escrupuloso y afecto fraterno. Aquel hombre sencillo practicaba una filosofía cotidiana profunda: quien cultiva la delicadeza en el saludo y la honradez en el trabajo manual transforma su entorno más eficazmente que quienes escriben tratados voluminosos pero olvidan mirar con ternura al prójimo.",
    "wordCount": 104,
    "questions": [
      {
        "id": "q36-1",
        "prompt": "¿Cómo definía el maestro artesano zapatero el valor de la cortesía en la sociedad?",
        "options": [
          "Como el aceite lubricante que impide que la convivencia comunitaria rechine con aspereza",
          "Como una pérdida de tiempo reservada a fiestas de palacio",
          "Como una debilidad de quienes no saben imponer su voluntad por la fuerza",
          "Como un requisito que solo deben cumplir los niños en la escuela"
        ],
        "correctIndex": 0,
        "explanation": "Don Lisandro concebía los modales amables y el buen trato como el bálsamo de la paz comunitaria."
      },
      {
        "id": "q36-2",
        "prompt": "¿Qué actitud demostraba Don Lisandro hacia las personas que visitaban su taller?",
        "options": [
          "El mismo respeto escrupuloso y afecto fraterno sin distinción de oficio o posición económica",
          "Desprecio hacia quienes vestían ropas de trabajo humilde",
          "Interés exclusivo en quienes le dejaban grandes propinas en monedas",
          "Indiferencia absoluta manteniéndose callado todo el día"
        ],
        "correctIndex": 0,
        "explanation": "Su vida ejemplificaba la auténtica igualdad de trato y la dignidad universal de toda persona humana."
      },
      {
        "id": "q36-3",
        "prompt": "¿Cuál es la conclusión ética que se desprende de este relato del Centro Histórico?",
        "options": [
          "Que la ternura y la honradez práctica son más transformadoras que la teoría vacía de obras",
          "Que la filosofía solo puede enseñarse en bibliotecas con libros de cuero",
          "Que los zapateros no deben hablar con los clientes de su negocio",
          "Que la aspereza en el trato es síntoma de firmeza moral"
        ],
        "correctIndex": 0,
        "explanation": "La coherencia entre el trabajo honesto y la bondad en el trato cotidiano es la cumbre de la sabiduría."
      }
    ]
  },
  {
    "id": "lec-37",
    "level": 37,
    "title": "La Gran Polifonía de las Campanas de La Merced",
    "genre": "Ensayo Literario y Estética Sonora",
    "targetWpm": 240,
    "xpReward": 350,
    "difficulty": "Avanzado",
    "author": "Cátedra de Estética Barroca Kinal",
    "pedagogicalSource": "Patrimonio Sonoro de la Nueva Guatemala — Consejo Nacional de la Cultura",
    "competencies": [
      "Comprensión estética superior",
      "Sincronía rítmica avanzada",
      "Trascendencia del arte sacro"
    ],
    "vocabulary": [
      {
        "word": "polifonía",
        "meaning": "Simultaneidad de sonidos armónicos que forman un todo estético sobrecogedor."
      },
      {
        "word": "bronce",
        "meaning": "Aleación resistente de cobre y estaño empleada para fundir campanas sonoras."
      },
      {
        "word": "cadencia",
        "meaning": "Ritmo y medida regular de los sonidos que acompañan una composición."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "Cuando el campanario mayor del templo barroco de La Merced hace sonar su juego de bronce en las fiestas patrias y patronales, el valle entero de la capital se inunda de ondas armónicas que estremecen los corazones. Cada campana posee un peso, afinación y grosor particular: la más pequeña canta con trinos plateados de júbilo, mientras el campanil mayor impone su bajo profundo que hace retumbar las torres centenarias. En esa polifonía sublime no hay discordia ni celos entre notas; la belleza conmovedora surge precisamente de la diversidad de timbres que cooperan en un único concierto de alabanza y esperanza para toda la república.",
    "wordCount": 104,
    "questions": [
      {
        "id": "q37-1",
        "prompt": "¿De qué fenómeno acústico y estético surge la conmovedora belleza del tañido de La Merced?",
        "options": [
          "De la diversidad de timbres que cooperan armónicamente sin discordia ni celos",
          "Del ruido ensordecedor de una sola sirena de alarma de vapor",
          "De la repetición monótona de un único golpe metálico seco",
          "De la música grabada en altavoces de baja fidelidad"
        ],
        "correctIndex": 0,
        "explanation": "La armonía polifónica resulta de la complementariedad fraterna de notas agudas y graves."
      },
      {
        "id": "q37-2",
        "prompt": "¿Qué elemento material conforma la fundición de las campanas centenarias?",
        "options": [
          "La aleación clásica de bronce afinado (cobre y estaño)",
          "Plástico prensado con resinas epóxicas",
          "Lámina galvanizada de zinc oxidado",
          "Arcilla secada al sol"
        ],
        "correctIndex": 0,
        "explanation": "El bronce de campana es una aleación milenaria diseñada para emitir vibraciones prolongadas y ricas."
      },
      {
        "id": "q37-3",
        "prompt": "¿Qué lección cívica proyecta la polifonía de las campanas hacia la convivencia ciudadana?",
        "options": [
          "Que la diversidad de talentos y orígenes de los ciudadanos enriquece la unidad armónica del país",
          "Que todas las personas deben pensar y actuar de manera idéntica y obligatoria",
          "Que solo quienes tienen mayor volumen tienen derecho a expresar su voz",
          "Que la música debe ser prohibida en los espacios comunitarios"
        ],
        "correctIndex": 0,
        "explanation": "La analogía sonora exalta la pluralidad fecunda en la construcción de una patria unida y solidaria."
      }
    ]
  },
  {
    "id": "lec-38",
    "level": 38,
    "title": "La Cúspide Kinal: Excelencia Técnica que Trasciende",
    "genre": "Liderazgo, Trascendencia y Futuro",
    "targetWpm": 250,
    "xpReward": 500,
    "difficulty": "Avanzado",
    "author": "Dirección General y Consejo Directivo Kinal",
    "pedagogicalSource": "Fundación Kinal — Cúspide del Programa Formativo y Trascendencia Ciudadana",
    "competencies": [
      "Liderazgo transformador",
      "Visión prospectiva de futuro",
      "Excelencia integral y servicio cristiano"
    ],
    "vocabulary": [
      {
        "word": "cúspide",
        "meaning": "Punto más alto de una montaña o la cima superior del desarrollo formativo."
      },
      {
        "word": "trascender",
        "meaning": "Dejar una huella bienhechora que perdura más allá de nuestra propia existencia."
      },
      {
        "word": "vocación",
        "meaning": "Llamado interior a consagrar la vida y talentos a una causa de servicio digno."
      }
    ],
    "estimatedMinutes": 3,
    "unlocked": false,
    "completed": false,
    "content": "Alcanzar la cima de la trigésima octava lectura es coronar una de las travesías intelectuales y éticas más ambiciosas que un estudiante guatemalteco puede emprender. Desde aquel primer vuelo del quetzal en las nieblas de la Sierra de las Minas hasta este umbral de maestría lectora, cada palabra articulada a más de doscientas cincuenta palabras por minuto ha templado tu atención, ensanchado tu léxico y afinado tu espíritu crítico. Recuerda que el lema de Kinal —\"Excelencia que trasciende\"— no es un eslogan publicitario, sino un mandato sagrado: tu destreza técnica, tu pensamiento reflexivo y tu bondad moral deben convertirse en luz, progreso y esperanza viva para los más necesitados de nuestra amada Guatemala. ¡Adelante con valentía, nobleza y amor constante al prójimo!",
    "wordCount": 125,
    "questions": [
      {
        "id": "q38-1",
        "prompt": "¿Qué representa la culminación del nivel 38 en la plataforma pedagógica de lectura?",
        "options": [
          "La coronación de una rigurosa travesía de fluidez, análisis crítico y formación ética integral",
          "El cierre definitivo de los estudios sin necesidad de volver a leer jamás",
          "Un requisito insignificante que no aporta valor al desarrollo profesional",
          "Un simple juego informático sin sustento en la realidad del país"
        ],
        "correctIndex": 0,
        "explanation": "El nivel 38 sella el dominio de la lectura veloz comprensiva aunada al compromiso social de servicio."
      },
      {
        "id": "q38-2",
        "prompt": "¿Cuál es el lema institucional fundacional de Kinal que sella el epílogo del programa?",
        "options": [
          "\"Excelencia que trasciende\"",
          "\"El más fuerte sobrevive\"",
          "\"Ganar a cualquier costo\"",
          "\"Tranquilidad sin esfuerzo\""
        ],
        "correctIndex": 0,
        "explanation": "\"Excelencia que trasciende\" sintetiza la vocación de irradiar bondad y competencia técnica a la sociedad."
      },
      {
        "id": "q38-3",
        "prompt": "¿Hacia qué propósito supremo debe orientarse la preparación de los egresados de Kinal?",
        "options": [
          "Convertirse en luz, progreso y esperanza transformadora para Guatemala y los más vulnerables",
          "Buscar el enriquecimiento personal sin importar las consecuencias colectivas",
          "Aislarse de los desafíos comunitarios de la nación",
          "Olvidar los valores humanos adquiridos durante el aprendizaje"
        ],
        "correctIndex": 0,
        "explanation": "El fin último de toda formación académica y técnica es el bien común y la elevación moral del prójimo."
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
