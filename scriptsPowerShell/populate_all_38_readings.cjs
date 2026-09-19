const fs = require('fs');
const path = require('path');

const targetFilePath = path.join(__dirname, '..', 'frontend', 'src', 'app', 'core', 'data', 'kinal-readings.ts');
let fileContent = fs.readFileSync(targetFilePath, 'utf-8');

// The new readings for levels 11 through 38
const additionalReadings = [
  // ETAPA 3: Niveles 11 al 18
  {
    id: 'lec-11',
    level: 11,
    title: 'La Flor del Amate y la Sombra Misteriosa',
    genre: 'Tradición Oral y Misterio',
    targetWpm: 170,
    xpReward: 160,
    difficulty: 'Intermedio',
    author: 'Tradición Popular de Sacatepéquez',
    pedagogicalSource: 'MINEDUC Guatemala — Antología de Tradiciones Populares y Cuentos Orales',
    competencies: ['Comprensión inferencial', 'Resiliencia ante la incertidumbre', 'Identidad comunitaria'],
    vocabulary: [
      { word: 'efímera', meaning: 'Que dura muy poco tiempo o es pasajera.' },
      { word: 'temple', meaning: 'Fuerza interior y serenidad frente a los momentos difíciles.' },
      { word: 'penumbra', meaning: 'Sombra débil entre la luz y la oscuridad que incita al misterio.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `En los patios traseros de los pueblos coloniales crecen los árboles de amate, cuyas hojas espesas ocultan antiguos secretos. Cuentan los cronistas que a la medianoche florece una flor blanca y radiante que solo dura unos instantes antes de desvanecerse. Aquel que logre capturar esa flor efímera obtendrá la fortuna de la sabiduría, pero deberá superar la prueba del miedo frente a la sombra del guardián de la arboleda. La verdadera riqueza, sin embargo, no está en el oro prometido por la leyenda, sino en el temple y la perseverancia de quien no retrocede ante las dificultades del camino y comprende el valor del esfuerzo diario.`,
    wordCount: 113,
    questions: [
      {
        id: 'q11-1',
        prompt: '¿Qué propiedad singular posee la legendaria flor del amate?',
        options: [
          'Florece durante semanas bajo la luz del mediodía',
          'Florece a la medianoche con un resplandor blanco que dura solo unos instantes',
          'Produce frutos venenosos de color púrpura',
          'Solo puede verse desde las cumbres de los volcanes'
        ],
        correctIndex: 1,
        explanation: 'El texto explica que florece a la medianoche como una luz efímera que dura breves instantes.'
      },
      {
        id: 'q11-2',
        prompt: '¿Cuál es la verdadera enseñanza que encierra la leyenda?',
        options: [
          'Que el valor real reside en el temple y la perseverancia ante las dificultades',
          'Que la riqueza material fácil es la meta suprema del ser humano',
          'Que nunca se debe salir de casa después del anochecer',
          'Que los árboles antiguos deben talarse para evitar peligros'
        ],
        correctIndex: 0,
        explanation: 'La moraleja subraya que la riqueza auténtica radica en la constancia y el coraje frente a los retos.'
      },
      {
        id: 'q11-3',
        prompt: '¿En qué región se sitúa la tradición narrada?',
        options: [
          'Pueblos coloniales de Sacatepéquez',
          'Las islas del Caribe centroamericano',
          'El desierto de Atacama',
          'Las llanuras costeras del Océano Ártico'
        ],
        correctIndex: 0,
        explanation: 'La tradición pertenece al acervo colonial de los pueblos históricos de Sacatepéquez.'
      }
    ]
  },
  {
    id: 'lec-12',
    level: 12,
    title: 'Las Huellas Cosmogónicas del Popol Vuh',
    genre: 'Mitología Sagrada Maya',
    targetWpm: 172,
    xpReward: 165,
    difficulty: 'Intermedio',
    author: 'Consejo de Ancianos Quichés',
    pedagogicalSource: 'Fray Francisco Ximénez — Manuscrito de Santo Tomás Chichicastenango',
    competencies: ['Cosmovisión originaria', 'Pensamiento crítico ancestral', 'Valoración de recursos naturales'],
    vocabulary: [
      { word: 'cosmogónico', meaning: 'Relativo al origen mítico y formación del universo.' },
      { word: 'quietud', meaning: 'Estado de sosiego, calma y ausencia de movimiento.' },
      { word: 'perfeccionamiento', meaning: 'Proceso continuado de mejora hasta alcanzar la excelencia.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `Antes del amanecer de la creación, no existía el cielo visible ni la tierra poblada; solo la inmensidad del mar en reposo bajo la calma absoluta. Los Procreadores, Tepeu y Gucumatz, meditaron en la penumbra sobre la forma adecuada de crear al ser consciente. Tras ensayar con el barro frágil y la madera insensible, hallaron en las mazorcas de maíz blanco y amarillo la sustancia vital capaz de albergar espíritu, agradecimiento y razón. Así nacieron los primeros guardianes del orden cósmico, encomendados a cuidar la armonía de la naturaleza y honrar con gratitud cada fruto brindado por la tierra fértil.`,
    wordCount: 104,
    questions: [
      {
        id: 'q12-1',
        prompt: '¿Quiénes fueron las deidades que meditaron sobre la creación del ser humano?',
        options: [
          'Tepeu y Gucumatz',
          'Kukulcán y Quetzalcóatl',
          'Hunahpú e Ixbalanqué',
          'Huracán y Cabracán'
        ],
        correctIndex: 0,
        explanation: 'El texto nombra a Tepeu y Gucumatz como los Procreadores que meditaron en la penumbra primordial.'
      },
      {
        id: 'q12-2',
        prompt: '¿Por qué el maíz fue el material elegido sobre el barro y la madera?',
        options: [
          'Porque era el material más barato y fácil de moldear',
          'Porque albergaba la sustancia vital capaz de espíritu, agradecimiento y razón',
          'Porque los dioses no tenían acceso a otros recursos minerales',
          'Porque resistía el calor de los hornos volcánicos'
        ],
        correctIndex: 1,
        explanation: 'A diferencia de los intentos previos, el maíz proveyó conciencia, gratitud y entendimiento armónico.'
      },
      {
        id: 'q12-3',
        prompt: '¿Cuál era la encomienda de los primeros seres creados?',
        options: [
          'Conquistar y destruir a los pueblos vecinos',
          'Cuidar la armonía de la naturaleza y honrar con gratitud la tierra',
          'Construir pirámides de oro en el fondo del mar',
          'Permanecer en silencio sin comunicarse'
        ],
        correctIndex: 1,
        explanation: 'Los seres humanos fueron designados guardianes del equilibrio natural y de la memoria cósmica.'
      }
    ]
  },
  {
    id: 'lec-13',
    level: 13,
    title: 'El Relojero de Antigua y la Campana Silente',
    genre: 'Narrativa Filosófica',
    targetWpm: 175,
    xpReward: 170,
    difficulty: 'Intermedio',
    author: 'Crónicas del Valle de Panchoy',
    pedagogicalSource: 'Fundación Kinal — Humanidades y Sentido del Tiempo',
    competencies: ['Gestión del tiempo', 'Paciencia y minuciosidad técnica', 'Solidaridad comunitaria'],
    vocabulary: [
      { word: 'engranajes', meaning: 'Ruedas dentadas que encajan entre sí para transmitir movimiento.' },
      { word: 'silente', meaning: 'Que permanece en absoluto silencio, callado y quieto.' },
      { word: 'restauración', meaning: 'Reparación cuidadosa para devolver a una obra su esplendor original.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `En un pequeño taller junto al Arco de Santa Catalina, Don Anselmo reparaba minuciosamente los engranajes de los péndulos coloniales. Sostenía que el tiempo no se mide por el tic-tac mecánico de las ruedas de bronce, sino por el valor con que aprovechamos cada minuto al servicio de los demás. Cuando la gran campana del convento enmudeció por una fisura interna, el anciano artesano demostró que con paciencia, cálculo exacto y dedicación es posible restaurar la armonía perdida en toda una comunidad congregada para escuchar su tañido renovado.`,
    wordCount: 93,
    questions: [
      {
        id: 'q13-1',
        prompt: '¿Dónde se ubicaba el taller del maestro artesano Don Anselmo?',
        options: [
          'En el muelle pesquero de Champerico',
          'Junto al histórico Arco de Santa Catalina en Antigua Guatemala',
          'En las cavernas de Lanquin',
          'En la plaza principal de Chiquimula'
        ],
        correctIndex: 1,
        explanation: 'El relato se ambienta expresamente junto al emblemático Arco de Santa Catalina.'
      },
      {
        id: 'q13-2',
        prompt: '¿Qué concepción del tiempo defendía Don Anselmo?',
        options: [
          'Que el tiempo es solo dinero acumulable',
          'Que el tiempo se mide por el valor con que se aprovecha al servicio del prójimo',
          'Que los relojes mecánicos controlan el destino de los hombres',
          'Que el pasado es lo único que merece consideración'
        ],
        correctIndex: 1,
        explanation: 'El relojero enseñaba que el verdadero valor del tiempo reside en el servicio generoso hacia los demás.'
      },
      {
        id: 'q13-3',
        prompt: '¿Cómo resolvió Don Anselmo el problema de la campana enmudecida?',
        options: [
          'Fundiéndola y tirándola al río Pensativo',
          'Mediante paciencia, cálculo exacto y dedicación técnica meticulosa',
          'Comprando una campana extranjera de menor tamaño',
          'Ignorando la petición de los vecinos'
        ],
        correctIndex: 1,
        explanation: 'Su intervención unió el cálculo riguroso con la paciencia artesanal para devolver el tañido a la campana.'
      }
    ]
  },
  {
    id: 'lec-14',
    level: 14,
    title: 'Los Vientos Legendarios del Volcán Tajumulco',
    genre: 'Poesía y Paisajismo',
    targetWpm: 178,
    xpReward: 175,
    difficulty: 'Intermedio',
    author: 'Lírica del Altiplano Occidental',
    pedagogicalSource: 'Instituto Geográfico Nacional — Patrimonio Natural de Guatemala',
    competencies: ['Apreciación estética', 'Superación personal', 'Respeto al entorno biogeográfico'],
    vocabulary: [
      { word: 'gélido', meaning: 'Extremadamente frío o helado.' },
      { word: 'telúricas', meaning: 'Pertenecientes o relativas a la fuerza viva de la tierra y los volcanes.' },
      { word: 'inquebrantable', meaning: 'Que no se rinde, deforma ni quiebra ante la adversidad.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `Sobre la cumbre más alta de Centroamérica, el aire gélido del Tajumulco susurra memorias milenarias que desafían el horizonte. Los montañistas que ascienden sus escarpadas laderas aprenden que cada paso requiere concentración, equilibrio y respeto por las fuerzas telúricas de la montaña. Al alcanzar la cima sobre el manto blanco de las nubes, la vista abarca las tierras fértiles de San Marcos hasta el océano resplandeciente, recordándonos que las metas más ambiciosas solo se conquistan con disciplina diaria, pasos firmes y un espíritu inquebrantable.`,
    wordCount: 88,
    questions: [
      {
        id: 'q14-1',
        prompt: '¿Cuál es la distinción geográfica del volcán Tajumulco?',
        options: [
          'Es el cráter más activo del Caribe',
          'Es la cumbre montañosa más alta de Centroamérica',
          'Es la única montaña submarina del país',
          'Es el lago de lava más extenso de América del Sur'
        ],
        correctIndex: 1,
        explanation: 'El Tajumulco ostenta la mayor altitud topográfica de toda la región centroamericana (4,220 msnm).'
      },
      {
        id: 'q14-2',
        prompt: '¿Qué lección física y mental reciben los montañistas durante el ascenso?',
        options: [
          'Que la prisa es indispensable para evitar el cansancio',
          'Que cada paso exige concentración, equilibrio y disciplina continuada',
          'Que se debe competir agresivamente contra los compañeros de marcha',
          'Que la cima solo pertenece a quienes viajan con vehículos mecánicos'
        ],
        correctIndex: 1,
        explanation: 'La ascensión demanda ritmo constante, prudencia y respeto escrupuloso por la geografía de montaña.'
      },
      {
        id: 'q14-3',
        prompt: '¿Qué panorama se contempla al alcanzar la cima del Tajumulco?',
        options: [
          'El mar congelado del Polo Norte',
          'Las tierras fértiles de San Marcos hasta el océano Pacífico',
          'Una selva tropical cerrada sin visibilidad',
          'Únicamente depósitos de ceniza sin horizonte'
        ],
        correctIndex: 1,
        explanation: 'Desde la cumbre se visualiza el altiplano marquense y la inmensidad del litoral pacífico.'
      }
    ]
  },
  {
    id: 'lec-15',
    level: 15,
    title: 'La Brújula de Fray Bartolomé en Verapaz',
    genre: 'Crónica Histórica Colonial',
    targetWpm: 180,
    xpReward: 180,
    difficulty: 'Intermedio',
    author: 'Documentos Históricos de Tezulutlán',
    pedagogicalSource: 'Archivo General de Centroamérica — Crónicas de Verapaz',
    competencies: ['Resolución pacífica de conflictos', 'Pensamiento ético y diplomático', 'Comunicación intercultural'],
    vocabulary: [
      { word: 'Tezulutlán', meaning: 'Nombre originario de Verapaz que significaba "Tierra de Guerra".' },
      { word: 'diplomacia', meaning: 'Uso del diálogo y la negociación para resolver desacuerdos pacíficamente.' },
      { word: 'acervo', meaning: 'Conjunto de bienes culturales y morales acumulados por tradición.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `En las húmedas montañas de Tezulutlán, conocida como la Tierra de Guerra, Fray Bartolomé de las Casas propuso un método revolucionario: pacificar mediante el diálogo, la música y el respeto mutuo en lugar de las armas. Los mercaderes mayas aprendieron versos sacros en idioma q'eqchi' y los cantaron en los mercados remotos, despertando la curiosidad y la confianza de los caciques. Aquella expedición demostró que la razón y la palabra pacífica poseen mayor fuerza civilizatoria que cualquier ejército de hierro.`,
    wordCount: 81,
    questions: [
      {
        id: 'q15-1',
        prompt: '¿Cuál era el nombre originario de la región antes de llamarse Verapaz?',
        options: [
          'Tezulutlán o Tierra de Guerra',
          'Petén Itzá',
          'Iximché la Grande',
          'Guaymoco del Sur'
        ],
        correctIndex: 0,
        explanation: 'Antes de la evangelización pacífica, los conquistadores llamaban Tezulutlán (Tierra de Guerra) a la región.'
      },
      {
        id: 'q15-2',
        prompt: '¿Qué instrumento pacífico utilizó la expedición para acercarse a los caciques?',
        options: [
          'La música y versos poéticos en idioma q\'eqchi\' interpretados por mercaderes',
          'El envío de tropas con armaduras pesadas',
          'La imposición de tributos forzosos',
          'La construcción de fortalezas de piedra'
        ],
        correctIndex: 0,
        explanation: 'El método empleó coplas musicales y lenguaje originario para entablar un diálogo de mutuo respeto.'
      },
      {
        id: 'q15-3',
        prompt: '¿Qué principio ético e histórico validó este suceso en Guatemala?',
        options: [
          'Que el diálogo y la palabra justa son más eficaces que la violencia armada',
          'Que la fuerza física siempre vence a los argumentos morales',
          'Que el comercio debe prohibirse en zonas montañosas',
          'Que las diferencias culturales son imposibles de reconciliar'
        ],
        correctIndex: 0,
        explanation: 'La pacificación pacífica demostró el poder trascendental de la diplomacia ética y la empatía.'
      }
    ]
  },
  {
    id: 'lec-16',
    level: 16,
    title: 'El Tejedor de Patzún y los Colores Sagrados',
    genre: 'Costumbrismo y Arte Textil',
    targetWpm: 182,
    xpReward: 185,
    difficulty: 'Intermedio',
    author: 'Maestros del Telar de Cintura',
    pedagogicalSource: 'Ministerio de Cultura y Deportes — Patrimonio Textil Maya',
    competencies: ['Apreciación del arte textil', 'Laboriosidad y perseverancia', 'Geometría ancestral'],
    vocabulary: [
      { word: 'lanzadera', meaning: 'Pieza de madera con hilo que pasa a través de la urdimbre para tejer.' },
      { word: 'urdimbre', meaning: 'Conjunto de hilos paralelos sobre los que se entrelaza la trama de un tejido.' },
      { word: 'simbología', meaning: 'Significado profundo que transmiten los signos y figuras en un contexto cultural.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `Entre hilos de algodón teñidos con cochinilla y corteza de aliso, el maestro artesano de Patzún cruzaba la lanzadera con precisión matemática. Cada figura geométrica bordada en el güipil encerraba un relato astronómico: el curso del sol, la fertilidad de los volcanes y la memoria de los abuelos. El tejedor enseñaba a los jóvenes aprendices que la paciencia es el telar del carácter humano, donde cada virtud tejida con perseverancia forma un manto digno para toda la vida profesional.`,
    wordCount: 82,
    questions: [
      {
        id: 'q16-1',
        prompt: '¿Qué elementos naturales empleaba el maestro artesano para teñir los hilos de algodón?',
        options: [
          'Cochinilla y corteza de aliso',
          'Pinturas sintéticas importadas de Europa',
          'Polvo de carbón y petróleo crudo',
          'Oxidación de clavos de hierro'
        ],
        correctIndex: 0,
        explanation: 'Los tintes naturales ancestrales se obtienen de la cochinilla y diversas cortezas vegetales.'
      },
      {
        id: 'q16-2',
        prompt: '¿Qué significado contienen las figuras geométricas plasmadas en el güipil tradicional?',
        options: [
          'Relatos astronómicos, el curso solar y la memoria de las generaciones pasadas',
          'Simples adornos sin ningún tipo de contexto cultural',
          'Marcas de precio para la venta en el extranjero',
          'Planos para construir caminos vecinales'
        ],
        correctIndex: 0,
        explanation: 'El textil maya constituye un documento vivo que codifica astronomía, cosmovisión e historia comunitaria.'
      },
      {
        id: 'q16-3',
        prompt: '¿Qué comparación moral realizaba el maestro tejedor con respecto a la paciencia?',
        options: [
          'Que la paciencia es el telar que teje el carácter humano y las virtudes',
          'Que la paciencia hace que el trabajo sea innecesariamente lento',
          'Que solo quienes no tienen herramientas modernas necesitan paciencia',
          'Que la prisa es la principal virtud del buen trabajador'
        ],
        correctIndex: 0,
        explanation: 'El maestro asimilaba la formación de hábitos éticos a la trama paciente y perseverante del telar.'
      }
    ]
  },
  {
    id: 'lec-17',
    level: 17,
    title: 'Ecos en las Cavernas Secretas de Candelaria',
    genre: 'Aventura y Espeleología',
    targetWpm: 185,
    xpReward: 190,
    difficulty: 'Intermedio',
    author: 'Exploradores del Río Subterráneo',
    pedagogicalSource: 'Parque Nacional Cuevas de Candelaria — Alta Verapaz',
    competencies: ['Espíritu de exploración', 'Gestión de riesgos en terreno', 'Conservación de ecosistemas kársticos'],
    vocabulary: [
      { word: 'kárstico', meaning: 'Paisaje de roca caliza esculpido por la disolución natural del agua.' },
      { word: 'estalactitas', meaning: 'Concreciones de carbonato cálcico que cuelgan del techo de las cuevas.' },
      { word: 'Xibalbá', meaning: 'Inframundo en la mitología maya, morada de pruebas y transformaciones.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `Bajo el suelo kárstico de Alta Verapaz, el río subterráneo fluye en medio de colosales bóvedas de estalactitas que reflejan la luz tenue de las linternas. En la antigüedad maya, estas galerías eran consideradas portales sagrados hacia Xibalbá, donde los héroes míticos demostraron su valentía frente a los enigmas de la sombra. Navegar estas aguas mansas en la penumbra enseña al explorador a agudizar sus sentidos, mantener la calma en situaciones límite y valorar el patrimonio hídrico subterráneo de Guatemala.`,
    wordCount: 83,
    questions: [
      {
        id: 'q17-1',
        prompt: '¿Qué fenómeno geológico caracteriza al Parque de las Cuevas de Candelaria?',
        options: [
          'Un cráter volcánico con géiseres de vapor caliente',
          'Un colosal sistema kárstico con un río subterráneo navegable',
          'Un glaciar de hielo perpetuo en la selva',
          'Una duna de arena movediza'
        ],
        correctIndex: 1,
        explanation: 'Candelaria es uno de los sistemas subterráneos fluviales más imponentes y extensos de América Latina.'
      },
      {
        id: 'q17-2',
        prompt: '¿Qué connotación sagrada tenían estas grutas en la cosmovisión maya clásica?',
        options: [
          'Eran consideradas portales ceremoniales de acceso a Xibalbá',
          'Servían como silos para almacenar maíz tostado',
          'Eran depósitos para arrojar herramientas inservibles',
          'Se consideraban lugares prohibidos a los que nadie podía acercarse'
        ],
        correctIndex: 0,
        explanation: 'En la tradición maya, las cuevas constituían umbrales de comunicación directa con el plano sagrado.'
      },
      {
        id: 'q17-3',
        prompt: '¿Qué capacidad personal fomenta la exploración de espacios subterráneos?',
        options: [
          'El pánico incontrolable y la prisa desmedida',
          'La agudeza de los sentidos, la serenidad en situaciones límite y el respeto al medio',
          'El descuido deliberado de las medidas de seguridad',
          'La destrucción de formaciones rocosas milenarias'
        ],
        correctIndex: 1,
        explanation: 'La espeleología educativa fortalece el autocontrol, la concentración y el cuidado del entorno frágil.'
      }
    ]
  },
  {
    id: 'lec-18',
    level: 18,
    title: 'El Vuelo Heroico del Rabinal Achí',
    genre: 'Dramaturgia Prehispánica',
    targetWpm: 188,
    xpReward: 200,
    difficulty: 'Intermedio',
    author: 'Danza-Drama Tradicional Maya Achí',
    pedagogicalSource: 'UNESCO — Obra Maestra del Patrimonio Oral e Inmaterial de la Humanidad',
    competencies: ['Análisis dramático clásico', 'Ética de la palabra empeñada', 'Dignidad cívica'],
    vocabulary: [
      { word: 'Kajyub', meaning: 'Antigua ciudadela fortificada y centro político del pueblo Rabinaleb.' },
      { word: 'parlamento', meaning: 'Discurso solemne pronunciado por un personaje en una obra teatral.' },
      { word: 'linaje', meaning: 'Ascendencia, serie de progenitores y honor familiar transmitido.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `Frente al Consejo de los Cuatro Jaguares en la fortaleza de Kajyub', el valiente guerrero K'iche' Achí defiende su honor con discursos de elevada poesía ceremonial. El drama del Rabinal Achí representa el único texto teatral prehispánico conservado íntegro en Mesoamérica, donde el enfrentamiento no se decide por la fuerza bruta, sino por la dignidad de la palabra, el cumplimiento leal de los juramentos empeñados y el respeto sagrado a las normas comunitarias de justicia y honorabilidad.`,
    wordCount: 80,
    questions: [
      {
        id: 'q18-1',
        prompt: '¿Por qué el Rabinal Achí posee una relevancia literaria e histórica excepcional en América?',
        options: [
          'Porque fue escrito por un autor renacentista español',
          'Porque es la única obra dramática prehispánica conservada sin influencia textual hispana',
          'Porque fue la primera novela impresa en papel de maguey',
          'Porque se representaba únicamente en Europa'
        ],
        correctIndex: 1,
        explanation: 'La UNESCO declaró al Rabinal Achí obra maestra por preservar intacta la dramaturgia originaria maya.'
      },
      {
        id: 'q18-2',
        prompt: '¿En qué lugar fortificado se desarrolla la acción principal del parlamento?',
        options: [
          'En la fortaleza de Kajyub\', capital del señorío Rabinaleb',
          'En las costas de Puerto Barrios',
          'En el puerto de Iztapa',
          'En las faldas del Volcán de Agua'
        ],
        correctIndex: 0,
        explanation: 'El drama tiene lugar en la ciudadela de Kajyub\', en las inmediaciones del actual Rabinal, Baja Verapaz.'
      },
      {
        id: 'q18-3',
        prompt: '¿Qué valor preponderante guía las acciones y parlamentos de los protagonistas?',
        options: [
          'La traición silenciosa para conservar privilegios personales',
          'La dignidad cívica, el cumplimiento de la palabra empeñada y el honor',
          'El desprecio por las costumbres y leyes del pueblo',
          'La acumulación desmedida de botín de guerra'
        ],
        correctIndex: 1,
        explanation: 'El texto enaltece la nobleza del carácter, la verdad en el decir y la lealtad incondicional al juramento.'
      }
    ]
  },

  // ETAPA 4: Niveles 19 al 28
  {
    id: 'lec-19',
    level: 19,
    title: 'Hombres de Maíz y la Rebelión del Bosque',
    genre: 'Realismo Mágico Guatemalteco',
    targetWpm: 190,
    xpReward: 210,
    difficulty: 'Avanzado',
    author: 'Inspirado en Miguel Ángel Asturias',
    pedagogicalSource: 'Premio Nobel de Literatura 1967 — Cátedra Asturiana',
    competencies: ['Realismo mágico mesoamericano', 'Conciencia ecológica comunitaria', 'Riqueza estilística'],
    vocabulary: [
      { word: 'guerrillero', meaning: 'Combatiente que defiende su territorio frente a fuerzas opresoras.' },
      { word: 'tala', meaning: 'Corte masivo e indiscriminado de árboles de una selva o bosque.' },
      { word: 'antepasados', meaning: 'Generaciones pretéritas de cuya memoria nos nutrimos.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `Gaspar Ilóm despierta en las altas cumbres de Ilom con el corazón inquieto por el gemido de la montaña. Los taladores codiciosos avanzan con hachas afiladas sobre los bosques milenarios, derribando ceibas sagradas que sostenían el susurro del viento. El héroe comprende que defender la tierra no es una cuestión de apego material, sino un deber espiritual: quien siembra maíz para vivir honra la creación divina, pero quien incendia la selva para especular destruye el futuro de sus propios hijos. Su voz se alza como trueno en los barrancos para convocar a la defensa de la vida y la dignidad del campesino.`,
    wordCount: 104,
    questions: [
      {
        id: 'q19-1',
        prompt: '¿Quién es el protagonista que encabeza la defensa de los bosques milenarios?',
        options: [
          'Don Pedro de Alvarado',
          'Gaspar Ilóm en las cumbres de Ilóm',
          'El señor Presidente de la capital',
          'Fray Matías de Córdova'
        ],
        correctIndex: 1,
        explanation: 'Gaspar Ilóm es la figura central de la novela cumbre "Hombres de Maíz" de Miguel Ángel Asturias.'
      },
      {
        id: 'q19-2',
        prompt: '¿Qué contraste moral fundamental plantea la lectura?',
        options: [
          'Sembrar maíz con respeto para sustentar la vida frente a la destrucción mercantil del bosque',
          'La superioridad de las herramientas mecánicas sobre el trabajo agrícola manual',
          'El abandono de los campos para migrar a las grandes ciudades industriales',
          'La eliminación de las tradiciones orales en favor de leyes extranjeras'
        ],
        correctIndex: 0,
        explanation: 'Asturias opone la comunión sagrada con la tierra frente a la voracidad destructiva del mercantilismo.'
      },
      {
        id: 'q19-3',
        prompt: '¿Qué galardón universal reconoció la obra cumbre de este autor guatemalteco?',
        options: [
          'El Premio Nobel de la Paz',
          'El Premio Nobel de Literatura en 1967',
          'La Medalla Olímpica de Bellas Artes',
          'El Premio Pulitzer de Periodismo'
        ],
        correctIndex: 1,
        explanation: 'Miguel Ángel Asturias fue laureado con el Premio Nobel de Literatura en 1967 por su prosa universal.'
      }
    ]
  },
  {
    id: 'lec-20',
    level: 20,
    title: 'El Trovador de la Plaza Mayor de Santiago',
    genre: 'Romance Histórico',
    targetWpm: 192,
    xpReward: 215,
    difficulty: 'Avanzado',
    author: 'Tradición Lírica Colonial',
    pedagogicalSource: 'Sociedad de Geografía e Historia de Guatemala',
    competencies: ['Apreciación métrica', 'Contexto sociopolítico colonial', 'Expresión oratoria'],
    vocabulary: [
      { word: 'trovador', meaning: 'Poeta que cantaba y componía sus versos en plazas y palacios públicos.' },
      { word: 'alfanje', meaning: 'Espada curva empleada en tiempos pretéritos por guardias y soldados.' },
      { word: 'pregonero', meaning: 'Funcionario que hacía saber en voz alta y pública los bandos y avisos.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `Al caer la tarde sobre las arcadas del Palacio de los Capitanes Generales, las cuerdas de una vihuela rompían el silencio del empedrado. El trovador cantaba romances sobre los navegantes que arribaban al Golfo Dulce con cargamentos de libros y especias ultramarinas. En sus estrofas no solo había elogios al amor cortesano, sino sutiles advertencias a los gobernantes para que administraran justicia con rectitud y compasión hacia los artesanos y comerciantes que levantaban con sus manos la grandeza de la ciudad colonial.`,
    wordCount: 88,
    questions: [
      {
        id: 'q20-1',
        prompt: '¿Frente a qué emblemático edificio cantaba el trovador al atardecer?',
        options: [
          'El Palacio de los Capitanes Generales en la Plaza Mayor',
          'El puerto fluvial de San Felipe',
          'La catedral neoclásica de Quetzaltenango',
          'El convento de Santo Domingo en Cobán'
        ],
        correctIndex: 0,
        explanation: 'La escena ocurre en la Plaza Mayor de Santiago de los Caballeros, frente a la Capitanía General.'
      },
      {
        id: 'q20-2',
        prompt: '¿Qué mensaje crítico contenían las estrofas del cantor popular?',
        options: [
          'Invitaban a quemar los libros procedentes del extranjero',
          'Exhortaban a las autoridades a ejercer la justicia con rectitud y compasión hacia los trabajadores',
          'Pedían el cierre de todos los talleres artesanales',
          'Demandaban más impuestos para la corona metropolitana'
        ],
        correctIndex: 1,
        explanation: 'El cantor popular empleaba el romance como vehículo cívico para reclamar equidad y honradez pública.'
      },
      {
        id: 'q20-3',
        prompt: '¿Qué instrumento musical acompañaba el canto del trovador colonial?',
        options: [
          'Una batería electrónica contemporánea',
          'Una vihuela de cuerdas pulsadas',
          'Una trompeta militar de bronce pesado',
          'Un órgano monumental de tubos de plomo'
        ],
        correctIndex: 1,
        explanation: 'La vihuela fue el antecesor instrumental directo de la guitarra clásica en la lírica hispanoamericana.'
      }
    ]
  },
  {
    id: 'lec-21',
    level: 21,
    title: 'La Leyenda de la Tatuana y el Barco de Carbón',
    genre: 'Relato Mítico Colonial',
    targetWpm: 195,
    xpReward: 220,
    difficulty: 'Avanzado',
    author: 'Cuentos de Leyendas de Guatemala',
    pedagogicalSource: 'MINEDUC Guatemala — Antología de la Narrativa Tradicional',
    competencies: ['Pensamiento alegórico', 'Libertad de conciencia', 'Imaginación poética'],
    vocabulary: [
      { word: 'Tatuana', meaning: 'Personaje legendario que encarna el anhelo de libertad frente al encierro.' },
      { word: 'alegoría', meaning: 'Figura literaria que representa una idea abstracta mediante símbolos concretos.' },
      { word: 'bergatín', meaning: 'Embarcación ligera de dos palos con velas desplegadas al viento.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `Encerrada en las mazmorras frías de la Real Cárcel de la ciudad, acusada de prácticas prohibidas por su sabiduría sobre plantas curativas, la Tatuana mantuvo la serenidad de su espíritu. Con un trozo de carbón vegetal desprendido del brasero, dibujó en la pared encalada un bergantín velero con todas sus velas desplegadas. Pronunciando una plegaria a las fuerzas del viento y la libertad, subió a bordo del navío dibujado y zarpó a través de los muros de piedra ante la mirada atónita de los centinelas, recordando que ninguna prisión terrenal puede encadenar a una mente libre y noble.`,
    wordCount: 97,
    questions: [
      {
        id: 'q21-1',
        prompt: '¿Con qué elemento dibujó la Tatuana su mítico barco en la pared de la prisión?',
        options: [
          'Con un pincel de oro con tinta indeleble',
          'Con un humilde trozo de carbón vegetal desprendido del brasero',
          'Con una espada de acero templado',
          'Con cera derretida de una vela de parafina'
        ],
        correctIndex: 1,
        explanation: 'La leyenda narra que trazó el navío mágico con un simple carboncillo sobre el muro de cal.'
      },
      {
        id: 'q21-2',
        prompt: '¿Qué simboliza la fuga milagrosa del barco de carbón?',
        options: [
          'La superioridad de los piratas en las costas de ultramar',
          'Que el espíritu humano y la libertad de conciencia jamás pueden ser aprisionados',
          'La necesidad de construir prisiones más profundas y blindadas',
          'El peligro de aprender a dibujar navíos marinos'
        ],
        correctIndex: 1,
        explanation: 'El mito es una metáfora universal de la soberanía interior y la indoblegable libertad del pensamiento.'
      },
      {
        id: 'q21-3',
        prompt: '¿Por qué razón original había sido encarcelada la protagonista?',
        options: [
          'Por sus profundos conocimientos curativos de la botánica que incomodaban al poder',
          'Por robar un cofre de plata en la catedral mayor',
          'Por negarse a pagar el peaje en el río Motagua',
          'Por haber vendido mapas náuticos falsificados'
        ],
        correctIndex: 0,
        explanation: 'Su sabiduría tradicional en herbolaria y curanderismo despertaba sospechas en la sociedad colonial.'
      }
    ]
  },
  {
    id: 'lec-22',
    level: 22,
    title: 'El Viento en los Trigales de Quetzaltenango',
    genre: 'Estampa Regional y Memoria',
    targetWpm: 198,
    xpReward: 225,
    difficulty: 'Avanzado',
    author: 'Cronistas de Los Altos',
    pedagogicalSource: 'Casa de la Cultura de Occidente — Xelajú',
    competencies: ['Identidad regional guatemalteca', 'Apreciación del paisaje productivo', 'Memoria colectiva'],
    vocabulary: [
      { word: 'Los Altos', meaning: 'Región histórica occidental de Guatemala con capital en Quetzaltenango.' },
      { word: 'chajalele', meaning: 'Canto rítmico y alegre de aves campestres en la madrugada.' },
      { word: 'tenacidad', meaning: 'Fuerza que impulsa a continuar sin desmayar hasta lograr el objetivo.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `En las madrugadas brumosas del valle de Palajunoj, el viento desciende desde el volcán Santa María meciendo las espigas doradas de trigo. Los campesinos quetzaltecos inician sus faenas entonando coplas de labor, agradeciendo la tierra volcánica que prodiga harina sustanciosa para el pan de la región. En esta tierra de hombres laboriosos y poetas inspirados, el frío del altiplano no entumece los dedos, sino que aviva el fuego de la tenacidad: cada surco cultivado con esmero es un tributo vivo al trabajo honrado que alimenta el progreso de la nación.`,
    wordCount: 91,
    questions: [
      {
        id: 'q22-1',
        prompt: '¿En qué emblemático valle del occidente se ambienta la estampa campesina?',
        options: [
          'En el valle de Palajunoj, al pie del volcán Santa María',
          'En el desierto de Zacapa',
          'En las playas de arena negra del Iztapa',
          'En las sabanas de Petén'
        ],
        correctIndex: 0,
        explanation: 'El valle de Palajunoj en Quetzaltenango es célebre por su vocación agrícola y belleza volcánica.'
      },
      {
        id: 'q22-2',
        prompt: '¿Qué efecto tiene el clima frío del altiplano sobre el carácter de los agricultores?',
        options: [
          'Los obliga a renunciar al trabajo en el campo',
          'Aviva la tenacidad y el compromiso con el esfuerzo productivo constante',
          'Provoca el abandono total de los sembradíos de trigo',
          'Genera apatía y resignación pasiva'
        ],
        correctIndex: 1,
        explanation: 'El texto señala poéticamente que el rigor del clima forja la reciedumbre y temple del trabajador altocense.'
      },
      {
        id: 'q22-3',
        prompt: '¿Qué cultivo emblemático protagoniza la narración del paisaje quetzalteco?',
        options: [
          'Las espigas doradas de trigo en tierras volcánicas',
          'Plantaciones extensivas de algodón costero',
          'Palmas africanas para biocombustibles',
          'Arbustos de té verde oriental'
        ],
        correctIndex: 0,
        explanation: 'El trigo es el cultivo histórico tradicional vinculado a los molinos y panaderías de Quetzaltenango.'
      }
    ]
  },
  {
    id: 'lec-23',
    level: 23,
    title: 'La Carta Perdida en el Valle de Panchoy',
    genre: 'Crónica de Archivo Colonial',
    targetWpm: 200,
    xpReward: 230,
    difficulty: 'Avanzado',
    author: 'Archiveros del Reino de Guatemala',
    pedagogicalSource: 'Archivo Histórico de la Municipalidad de Antigua Guatemala',
    competencies: ['Investigación documental', 'Rigor histórico', 'Apreciación del patrimonio escrito'],
    vocabulary: [
      { word: 'pergamino', meaning: 'Piel adobada de res o carnero preparada para escribir sobre ella.' },
      { word: 'paleografía', meaning: 'Ciencia que estudia e interpreta la escritura y signos de documentos antiguos.' },
      { word: 'legajo', meaning: 'Conjunto atado de papeles y documentos que tratan de un mismo asunto.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `En una alacena olvidada del ayuntamiento colonial, un joven investigador halló un pliego sellado con lacre carmesí que databa de 1680. Al descifrar la caligrafía procesal, descubrió un memorial suscrito por albañiles y canteros indígenas que solicitaban mejoras en las condiciones de seguridad en la edificación del acueducto municipal. El documento reveló que la historia no la escriben únicamente los capitanes ilustres, sino los miles de artífices anónimos cuyos nombres quedaron grabados en las argamasas y arcos que todavía sostienen los templos de nuestra patria.`,
    wordCount: 88,
    questions: [
      {
        id: 'q23-1',
        prompt: '¿Quiénes suscribían el memorial histórico hallado en el pliego de 1680?',
        options: [
          'Comerciantes de telas de seda de Sevilla',
          'Albañiles y canteros indígenas constructores del acueducto',
          'Soldados mercenarios de las galeras reales',
          'Gobernadores extranjeros de paso por la capitanía'
        ],
        correctIndex: 1,
        explanation: 'El documento fue redactado por los artífices y constructores originarios de las obras públicas coloniales.'
      },
      {
        id: 'q23-2',
        prompt: '¿Cuál es la reflexión medular que despierta el hallazgo del legajo?',
        options: [
          'Que los documentos viejos deben quemarse para ahorrar espacio físico',
          'Que la historia también la forjaron miles de trabajadores anónimos con sus obras cotidianas',
          'Que solo las batallas armadas tienen derecho a ser recordadas',
          'Que los acueductos coloniales no tenían ninguna utilidad práctica'
        ],
        correctIndex: 1,
        explanation: 'El rescate histórico reivindica el protagonismo de los constructores y trabajadores de base en la sociedad.'
      },
      {
        id: 'q23-3',
        prompt: '¿Qué disciplina científica permite transcribir e interpretar estos manuscritos antiguos?',
        options: [
          'La paleografía y archivística documental',
          'La meteorología atmosférica',
          'La termodinámica aplicada',
          'La botánica experimental'
        ],
        correctIndex: 0,
        explanation: 'La paleografía descifra escrituras arcaicas y abre el acceso al conocimiento documental del pasado.'
      }
    ]
  },
  {
    id: 'lec-24',
    level: 24,
    title: 'El Artesano de Jade y Estelas de Quiriguá',
    genre: 'Arqueología y Epigrafía Maya',
    targetWpm: 202,
    xpReward: 235,
    difficulty: 'Avanzado',
    author: 'Epigrafistas de la Cuenca del Motagua',
    pedagogicalSource: 'Parque Arqueológico de Quiriguá — Izabal',
    competencies: ['Escultura monumental maya', 'Comprensión calendárica', 'Paciencia técnica y rigor'],
    vocabulary: [
      { word: 'estela', meaning: 'Monolito de piedra vertical labrado con inscripciones conmemorativas y retratos.' },
      { word: 'epigrafía', meaning: 'Estudio e interpretación de inscripciones esculpidas sobre materiales duros.' },
      { word: 'Quiriguá', meaning: 'Ciudad maya famosa por poseer las estelas de piedra más altas del mundo maya.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `A orillas del caudaloso río Motagua, donde yacen los yacimientos más ricos de jadeita verde manzana, los escultores mayas de Quiriguá desafiaron la dureza de la arenisca. Con cinceles de basalto y abrasivos de arena volcánica, el maestro tallador inmortalizó en la Estela E el ascenso del rey K'ak' Tiliw Chan Yopaat. Cada glifo labrado en la roca viva requería meses de paciencia meticulosa para asegurar que las fechas calendáricas perduraran milenios intactas. Aquellas moles de piedra nos recuerdan que cuando la técnica se une al propósito trascendente, la obra sobrevive al paso implacable de los siglos.`,
    wordCount: 97,
    questions: [
      {
        id: 'q24-1',
        prompt: '¿Por qué las estelas de Quiriguá son mundialmente célebres en la arqueología?',
        options: [
          'Porque son las esculturas líticas monolíticas más altas y monumentales del mundo maya',
          'Porque fueron talladas en madera de pino balsa',
          'Porque se construyeron en solo veinticuatro horas de trabajo',
          'Porque no tienen ninguna inscripción jeroglífica'
        ],
        correctIndex: 0,
        explanation: 'La Estela E de Quiriguá supera los 10 metros de altura, siendo el mayor monolito labrado del Nuevo Mundo.'
      },
      {
        id: 'q24-2',
        prompt: '¿Qué herramientas utilizaban los maestros escultores para doblegar la roca arenisca?',
        options: [
          'Sierras eléctricas con punta de diamante',
          'Cinceles de basalto templado y arena abrasiva con agua',
          'Explosivos de pólvora negra',
          'Ganchos de alambre galvanizado'
        ],
        correctIndex: 1,
        explanation: 'Los artesanos mayas dominaban técnicas líticas de gran sofisticación mediante rocas duras y abrasión.'
      },
      {
        id: 'q24-3',
        prompt: '¿Cuál es el valor universal que transmite la perseverancia de los talladores de Quiriguá?',
        options: [
          'Que la técnica aliada a un propósito trascendente crea obras que vencen al tiempo',
          'Que es mejor terminar las obras con rapidez sin cuidar los detalles',
          'Que el arte de la escultura debe mantenerse en secreto absoluto',
          'Que las piedras blandas son siempre preferibles a las duras'
        ],
        correctIndex: 0,
        explanation: 'La devoción a la excelencia formal y matemática convierte el oficio humano en patrimonio perenne.'
      }
    ]
  },
  {
    id: 'lec-25',
    level: 25,
    title: 'El Guardián del Faro de Livingston',
    genre: 'Cultura Garífuna y Caribe',
    targetWpm: 205,
    xpReward: 240,
    difficulty: 'Avanzado',
    author: 'Crónicas de la Bahía de Amatique',
    pedagogicalSource: 'Comunidad Garífuna de Livingston — Patrimonio Cultural Inmaterial',
    competencies: ['Multiculturalidad guatemalteca', 'Tradición marítima', 'Responsabilidad profesional'],
    vocabulary: [
      { word: 'garífuna', meaning: 'Pueblo afrodescendiente con lengua, danza y gastronomía única en el Caribe guatemalteco.' },
      { word: 'bajío', meaning: 'Banco de arena o roca bajo el agua poco profunda donde pueden encallar barcos.' },
      { word: 'vigilancia', meaning: 'Cuidado atento y continuado para evitar accidentes o pérdidas.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `Don Celso encendía la linterna del faro de Livingston cada crepúsculo, orientando a los cayucos de pescadores que cruzaban la boca del río Dulce hacia el mar abierto. Con el compás de los tambores garífunas resonando a lo lejos desde la playa, el anciano vigía vigilaba los bancos de arena y los arrecifes traicioneros de la bahía. Sabía que su soledad en la torre resguardaba la vida y el regreso seguro de decenas de padres de familia a sus hogares. Aquel humilde deber cumplido con fidelidad insobornable constituye el corazón de la responsabilidad profesional que dignifica cualquier oficio humano.`,
    wordCount: 97,
    questions: [
      {
        id: 'q25-1',
        prompt: '¿Qué función vital desempeñaba Don Celso desde la torre del faro costero?',
        options: [
          'Vender pescado enlatado a los navíos mercantes',
          'Guiar con luz a los pescadores y prevenir que encallaran en los bajíos peligrosos',
          'Bloquear el paso de embarcaciones comunitarias',
          'Tocar tambores ceremoniales toda la noche'
        ],
        correctIndex: 1,
        explanation: 'La guardia nocturna del farero salvaguardaba la navegación y las vidas de la comunidad pesquera.'
      },
      {
        id: 'q25-2',
        prompt: '¿Qué pueblo y cultura enriquecen con sus tradiciones este rincón del Caribe guatemalteco?',
        options: [
          'La cultura y pueblo Garífuna de Livingston',
          'Los pastores nómadas del Tíbet',
          'Los esquimales del Ártico occidental',
          'Los colonos sajones del siglo XIX'
        ],
        correctIndex: 0,
        explanation: 'Livingston es el hogar histórico y epicentro vivo de la vibrante cultura garífuna en Guatemala.'
      },
      {
        id: 'q25-3',
        prompt: '¿Qué principio ético destaca la vocación de servicio del farero?',
        options: [
          'El cumplimiento fiel y silencioso de la responsabilidad profesional por el prójimo',
          'El desinterés por el bienestar de los compañeros de trabajo',
          'El cobro abusivo a los navegantes extraviados',
          'El abandono de la guardia en días lluviosos'
        ],
        correctIndex: 0,
        explanation: 'La constancia del farero es ejemplo de la nobleza del trabajo técnico cuando vela por la seguridad comunitaria.'
      }
    ]
  },
  {
    id: 'lec-26',
    level: 26,
    title: 'La Balada del Hormigo y la Marimba Kinal',
    genre: 'Música y Patrimonio Nacional',
    targetWpm: 208,
    xpReward: 245,
    difficulty: 'Avanzado',
    author: 'Cátedra de Arte y Musicología Kinal',
    pedagogicalSource: 'Conservatorio Nacional de Música "Germán Alcántara"',
    competencies: ['Identidad sonora nacional', 'Acústica y ebanistería de precisión', 'Trabajo en equipo armónico'],
    vocabulary: [
      { word: 'hormigo', meaning: 'Madera fina guatemalteca que canta, empleada para fabricar las teclas de marimba.' },
      { word: 'resonadores', meaning: 'Cajas o tubos colocados bajo las teclas para amplificar el sonido con calidez.' },
      { word: 'polifonía', meaning: 'Conjunto de sonidos o voces que suenan simultáneamente en perfecta concordia.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `En las manos diestras del ebanista, la madera rojiza del árbol de hormigo se convierte en teclado musical capaz de hacer vibrar el alma de toda una nación. Cada tecla debe cepillarse con precisión milimétrica para que su tono resuene afinado sobre los resonadores de madera de cedro. Cuando los jóvenes marimbistas de Fundación Kinal interpretan al unísono las notas de "Luna de Xelajú", no solo ejecutan una partitura: demuestran que la armonía social se alcanza cuando cada individuo afina sus destrezas con rigor y las coordina al compás solidario de sus hermanos.`,
    wordCount: 94,
    questions: [
      {
        id: 'q26-1',
        prompt: '¿Qué especie maderable guatemalteca es insustituible para fabricar las teclas de la marimba?',
        options: [
          'La madera del árbol de hormigo',
          'El pino blanco resinoso',
          'El eucalipto aromático australiano',
          'El bambú hueco de río'
        ],
        correctIndex: 0,
        explanation: 'El hormigo (Platymiscium dimorphandrum) es mundialmente conocido como la madera que canta.'
      },
      {
        id: 'q26-2',
        prompt: '¿Qué analogía moral se establece a partir del ensamble instrumental de la marimba?',
        options: [
          'Que el ejecutante solitario no necesita escuchar a los demás',
          'Que la armonía colectiva exige que cada uno prepare su destreza y coopere solidariamente',
          'Que la música debe reemplazar todos los estudios técnicos y científicos',
          'Que los instrumentos antiguos deben abandonarse por pistas sintéticas'
        ],
        correctIndex: 1,
        explanation: 'La orquestación de la marimba enseña sincronía, humildad y colaboración fraternal.'
      },
      {
        id: 'q26-3',
        prompt: '¿Qué célebre obra musical de la identidad guatemalteca se cita en la narración?',
        options: [
          'La marcha militar de las legiones romanas',
          'El vals inmortal "Luna de Xelajú" de Paco Pérez',
          'Un réquiem barroco austriaco',
          'Una balada pop comercial extranjera'
        ],
        correctIndex: 1,
        explanation: '"Luna de Xelajú", compuesta por Paco Pérez, es el himno sentimental de la identidad musical del país.'
      }
    ]
  },
  {
    id: 'lec-27',
    level: 27,
    title: 'El Astrónomo de Uaxactún y los Eclipses',
    genre: 'Astronomía y Matemática Maya',
    targetWpm: 210,
    xpReward: 250,
    difficulty: 'Avanzado',
    author: 'Observatorio Astronómico de Petén',
    pedagogicalSource: 'Instituto de Antropología e Historia — Grupo E de Uaxactún',
    competencies: ['Cálculo matemático astronómico', 'Observación empírica', 'Paciencia investigativa'],
    vocabulary: [
      { word: 'equinoccio', meaning: 'Momento del año en que el día y la noche tienen exactamente la misma duración.' },
      { word: 'solsticio', meaning: 'Época en que el sol se halla en uno de los dos trópicos señalando el cambio estacional.' },
      { word: 'zenit', meaning: 'Punto del firmamento verticalmente situado sobre la cabeza del observador.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `Desde la plataforma del Grupo E en la ciudad selvática de Uaxactún, el sacerdote astrónomo observaba el alineamiento perfecto del sol al despuntar sobre los tres templos del horizonte este. Siglos antes de la invención del telescopio óptico, los sabios mayas calcularon con exactitud asombrosa la duración del año solar trópico, el ciclo sinódico de Venus y las fechas críticas de los eclipses lunares. Este colosal monumento de arquitectura astronómica demuestra que el rigor científico, la paciencia observacional y el amor al conocimiento florecieron con esplendor soberbio en el corazón de nuestras selvas mesoamericanas.`,
    wordCount: 94,
    questions: [
      {
        id: 'q27-1',
        prompt: '¿Qué complejo arquitectónico de Uaxactún funcionaba como observatorio conmemorativo solar?',
        options: [
          'El muelle flotante de Sayaxché',
          'La plataforma astronómica del Grupo E alineada con tres templos orientales',
          'La cueva funeraria de Naj Tunich',
          'El palacio de gobierno de Santiago Atitlán'
        ],
        correctIndex: 1,
        explanation: 'El Grupo E de Uaxactún es el primer complejo astronómico conmemorativo documentado de la civilización maya.'
      },
      {
        id: 'q27-2',
        prompt: '¿Qué fenómenos celestes calcularon con exactitud los astrónomos mayas prehispánicos?',
        options: [
          'El año trópico, los ciclos de Venus y la recurrencia periódica de eclipses',
          'La velocidad de los motores de reacción atómica',
          'El magnetismo del núcleo de Saturno con satélites artificiales',
          'La temperatura del interior de los meteoritos caídos'
        ],
        correctIndex: 0,
        explanation: 'La matemática vigesimal y el sistema posicional con cero permitieron cálculos astronómicos sin parangón.'
      },
      {
        id: 'q27-3',
        prompt: '¿Cuál es el testimonio histórico fundamental que lega este complejo a la juventud actual?',
        options: [
          'Que el rigor investigativo y la ciencia florecieron con esplendor en nuestra propia tierra',
          'Que la astronomía antigua no tenía fundamento observacional empírico',
          'Que las matemáticas no son necesarias para comprender el universo',
          'Que los edificios antiguos carecían de planificación previa'
        ],
        correctIndex: 0,
        explanation: 'Inspirar orgullo y vocación por las ciencias exactas y el pensamiento metódico a partir de la herencia propia.'
      }
    ]
  },
  {
    id: 'lec-28',
    level: 28,
    title: 'El Manuscrito Secreto de Chichicastenango',
    genre: 'Literatura Maya Quiché',
    targetWpm: 215,
    xpReward: 260,
    difficulty: 'Avanzado',
    author: 'Custodios de la Tradición Sagrada',
    pedagogicalSource: 'Biblioteca Municipal de Santo Tomás Chichicastenango',
    competencies: ['Conservación del patrimonio bibliográfico', 'Respeto al libro como objeto de memoria', 'Hermeneútica textual'],
    vocabulary: [
      { word: 'custodio', meaning: 'Persona encargada de cuidar, guardar y defender con celo un tesoro cultural.' },
      { word: 'proscrito', meaning: 'Que ha sido prohibido o desterrado por mandatos de autoridad.' },
      { word: 'hermenéutica', meaning: 'Arte y ciencia de interpretar textos para develar su sentido original.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `Durante décadas de persecución y censura, los sabios principales de Chichicastenango ocultaron el códice sagrado bajo el piso de sus hogares de adobe, protegiéndolo de las llamas de la incomprensión. Fue en los albores del siglo XVIII cuando Fray Francisco Ximénez, respetando la lengua nativa k'iche', transcribió en columnas paralelas el texto que hoy conocemos como el Popol Vuh. La lealtad de aquellos guardianes anónimos salvó de la extinción definitiva el libro sagrado más bello de la América indígena, probando que el amor a las letras es el mejor escudo para defender la identidad de los pueblos.`,
    wordCount: 97,
    questions: [
      {
        id: 'q28-1',
        prompt: '¿Cómo lograron los ancianos proteger el manuscrito sagrado de la destrucción colonial?',
        options: [
          'Ocultándolo celosamente bajo el suelo de sus casas de adobe por generaciones',
          'Enviándolo por correo marítimo a una universidad de Asia',
          'Arrojándolo a las aguas profundas del lago Atitlán',
          'Publicándolo en periódicos de gran tirada comercial'
        ],
        correctIndex: 0,
        explanation: 'La custodia secreta y solidaria de los abuelos mayas preservó el texto hasta encontrar a un fraile respetuoso.'
      },
      {
        id: 'q28-2',
        prompt: '¿Qué religioso e historiador transcribió y tradujo el texto en Chichicastenango?',
        options: [
          'Fray Francisco Ximénez',
          'Fray Diego de Landa',
          'Fray Toribio de Benavente',
          'Fray Juan de Zumárraga'
        ],
        correctIndex: 0,
        explanation: 'Fray Francisco Ximénez realizó la célebre traducción bilingüe k\'iche\'-castellano a inicios del siglo XVIII.'
      },
      {
        id: 'q28-3',
        prompt: '¿Qué lección permanente aporta la salvaguarda de este tesoro bibliográfico?',
        options: [
          'Que el amor al libro y a la lectura constituye el baluarte supremo de la identidad cultural',
          'Que los libros antiguos pierden vigencia cuando cambian las modas literarias',
          'Que la censura oficial es indispensable para la tranquilidad social',
          'Que no tiene sentido conservar textos en idiomas originarios'
        ],
        correctIndex: 0,
        explanation: 'El rescate del Popol Vuh demuestra que la memoria escrita es el más poderoso escudo de dignidad de los pueblos.'
      }
    ]
  },

  // ETAPA 5: Niveles 29 al 38
  {
    id: 'lec-29',
    level: 29,
    title: 'El Manifiesto Humanista del Técnico Kinal',
    genre: 'Ética y Vocación de Servicio',
    targetWpm: 218,
    xpReward: 270,
    difficulty: 'Avanzado',
    author: 'Cátedra Mayor de Humanidades Kinal',
    pedagogicalSource: 'Fundación Kinal — Ideario Formativo Institucional',
    competencies: ['Ética profesional', 'Humanización del trabajo técnico', 'Compromiso social transformador'],
    vocabulary: [
      { word: 'ideario', meaning: 'Conjunto de ideas y principios éticos que orientan la conducta de una institución.' },
      { word: 'mecanicismo', meaning: 'Tendencia a considerar al ser humano como un simple engranaje de producción.' },
      { word: 'trascendencia', meaning: 'Resultado o efecto que sobrepasa los límites del tiempo y beneficia a la sociedad.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `En los talleres y laboratorios de Fundación Kinal, la técnica no es un fin en sí misma, sino el medio noble por el cual el ser humano perfecciona su propia alma y transforma positivamente su comunidad. El auténtico técnico humanista rechaza la frialdad del mecanicismo ciego; comprende que detrás de cada plano de ingeniería, de cada circuito integrado y de cada línea de código computacional palpitan vidas humanas que confían en la seguridad de su labor. Trabajar con honradez es orar con las manos y construir con la mente una patria más justa, solidaria y próspera para todos.`,
    wordCount: 97,
    questions: [
      {
        id: 'q29-1',
        prompt: '¿Qué papel desempeña la técnica en la filosofía formativa de Fundación Kinal?',
        options: [
          'Un medio noble para perfeccionar el carácter humano y servir comunitariamente',
          'Un mecanismo puramente lucrativo para desplazar a los trabajadores',
          'Una rutina obligatoria sin ningún propósito moral o social',
          'Un pasatiempo exclusivo de laboratorio sin aplicación práctica'
        ],
        correctIndex: 0,
        explanation: 'En Kinal la destreza técnica se subordina a la dignidad humana y a la vocación de servicio desinteresado.'
      },
      {
        id: 'q29-2',
        prompt: '¿Qué principio orienta el trabajo de cada profesional graduado de Kinal?',
        options: [
          'Comprender que detrás de cada desarrollo técnico hay seres humanos cuya seguridad depende de su honradez',
          'Reducir costos a cualquier precio sacrificando la calidad de los materiales',
          'Ocultar los errores técnicos a los clientes y compañeros',
          'Competir despiadadamente contra otros egresados'
        ],
        correctIndex: 0,
        explanation: 'La excelencia profesional se fundamenta en la rectitud ética y la responsabilidad ante la sociedad.'
      },
      {
        id: 'q29-3',
        prompt: '¿Qué metáfora sintetiza la consagración al trabajo bien elaborado?',
        options: [
          'Trabajar con honradez es orar con las manos y construir con la mente',
          'Hacer lo mínimo necesario para cobrar el salario quincenal',
          'Esperar que otros resuelvan los desafíos del país',
          'Delegar siempre la responsabilidad en las máquinas'
        ],
        correctIndex: 0,
        explanation: 'La labor diaria bien ejecutada adquiere una dimensión espiritual de servicio fecundo hacia los demás.'
      }
    ]
  },
  {
    id: 'lec-30',
    level: 30,
    title: 'La Batalla Oratoria del Cerro del Carmen',
    genre: 'Elocuencia y Comunicación Efectiva',
    targetWpm: 220,
    xpReward: 280,
    difficulty: 'Avanzado',
    author: 'Cronistas de la Nueva Guatemala de la Asunción',
    pedagogicalSource: 'Sociedad de Oratoria y Debate Forense de Guatemala',
    competencies: ['Oratoria y persuasión ética', 'Claridad sintáctica', 'Liderazgo comunicativo'],
    vocabulary: [
      { word: 'elocuencia', meaning: 'Facultad de hablar con fluidez, elegancia y poder persuasivo de convencimiento.' },
      { word: 'cerro del Carmen', meaning: 'Colina histórica de la ciudad donde se erigió la primera ermita en el siglo XVII.' },
      { word: 'rectitud', meaning: 'Firmeza de conducta guiada por la moral, la justicia y la verdad.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `Bajo la sombra de los cipreses de la ermita del Cerrito del Carmen, los jóvenes debatientes de la capital se congregaban para contrastar visiones sobre el porvenir de la república. Frente a un público expectante, el orador más destacado no fue aquel que recurrió a los gritos altisonantes o a la descalificación del adversario, sino quien expuso argumentos serenos, fundamentados en datos verídicos y dictados por una profunda honradez intelectual. La verdadera elocuencia no consiste en subyugar con artificios, sino en iluminar las conciencias para caminar juntos hacia la concordia social.`,
    wordCount: 93,
    questions: [
      {
        id: 'q30-1',
        prompt: '¿Dónde se celebraban las competencias oratorias juveniles en la capital?',
        options: [
          'En las colinas históricas del Cerrito del Carmen',
          'En el hipódromo del norte abandonado',
          'En los sótanos del Banco de Guatemala',
          'En el muelle de carga de Santo Tomás de Castilla'
        ],
        correctIndex: 0,
        explanation: 'El Cerrito del Carmen es un rincón emblemático cargado de memoria y paisaje ciudadano.'
      },
      {
        id: 'q30-2',
        prompt: '¿Qué cualidad caracterizó al orador más persuasivo del certamen?',
        options: [
          'Argumentos serenos, datos verídicos e irreprochable honradez intelectual',
          'Gritos estridentes y ataques personales contra los rivales',
          'Frases en idiomas incomprensibles para confundir al jurado',
          'Lectura acelerada sin pausas ni entonación'
        ],
        correctIndex: 0,
        explanation: 'La oratoria virtuosa descansa en la solidez lógica, la calma y el respeto genuino al interlocutor.'
      },
      {
        id: 'q30-3',
        prompt: '¿Cuál es el propósito más noble de la palabra persuasiva en la sociedad?',
        options: [
          'Iluminar conciencias y guiar a la comunidad hacia la concordia y el entendimiento',
          'Manipular las emociones para obtener beneficios electorales mezquinos',
          'Sembrar división y enemistad entre familias',
          'Silenciar a quienes opinan de manera diferente'
        ],
        correctIndex: 0,
        explanation: 'El fin supremo de la comunicación elocuente es el bien común y la convivencia pacífica.'
      }
    ]
  },
  {
    id: 'lec-31',
    level: 31,
    title: 'El Acueducto de Pinula y la Ingeniería Colonial',
    genre: 'Infraestructura y Bien Común',
    targetWpm: 222,
    xpReward: 290,
    difficulty: 'Avanzado',
    author: 'Cuerpo de Ingenieros y Topógrafos',
    pedagogicalSource: 'Colegio de Ingenieros de Guatemala — Historia de las Obras Civiles',
    competencies: ['Ingeniería civil patrimonial', 'Cálculo hidráulico', 'Sentido social de la infraestructura'],
    vocabulary: [
      { word: 'arquería', meaning: 'Serie de arcos superpuestos o continuos que sostienen una estructura o canal.' },
      { word: 'topografía', meaning: 'Técnica de describir y delinear detalladamente la superficie de un terreno.' },
      { word: 'hidráulica', meaning: 'Rama de la física que estudia el equilibrio y movimiento de los fluidos de agua.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `Para dotar de agua pura a la naciente Nueva Guatemala de la Asunción tras los terremotos de Santa Marta, los alarifes coloniales diseñaron los imponentes arcos de ladrillo del Acueducto de Pinula. A lo largo de leguas de terreno ondulado, la pendiente se calculó con niveles de agua y plomadas rudimentarias, logrando que el líquido vital descendiera por gravedad constante hasta las fuentes públicas del centro urbano. Esta monumental obra de ingeniería hidráulica demuestra que la técnica bien concebida es el soporte invisible pero imprescindible que garantiza la salud, higiene y dignidad de toda la ciudadanía.`,
    wordCount: 97,
    questions: [
      {
        id: 'q31-1',
        prompt: '¿Cuál fue la misión primordial del Acueducto de Pinula en la historia de la capital?',
        options: [
          'Abastecer de agua potable por gravedad a la nueva capital tras los terremotos de 1773',
          'Servir de muro militar contra invasiones de ultramar',
          'Funcionar como pista de carreras de carruajes virreinales',
          'Desviar los ríos hacia las haciendas privadas'
        ],
        correctIndex: 0,
        explanation: 'El acueducto fue la arteria vital que hizo viable el traslado y subsistencia de la nueva metrópoli.'
      },
      {
        id: 'q31-2',
        prompt: '¿Cómo lograron los constructores una pendiente hidráulica perfecta sin equipos modernos?',
        options: [
          'Con niveles de agua de vaso comunicante y plomadas de precisión artesanal',
          'Mediante cálculos empíricos al azar sin medir distancias',
          'Contratando satélites de radar topográfico',
          'Esperando que el agua encontrara su propio curso en zanjas abiertas'
        ],
        correctIndex: 0,
        explanation: 'El ingenio empírico de los alarifes aplicó la física elemental de fluidos con exactitud admirable.'
      },
      {
        id: 'q31-3',
        prompt: '¿Qué valor cívico enseña la historia de las grandes obras de infraestructura?',
        options: [
          'Que la técnica civil es el soporte que garantiza la salud, bienestar y dignidad colectiva',
          'Que las ciudades no necesitan obras de abastecimiento planificadas',
          'Que las fuentes públicas deben cerrarse al pueblo trabajador',
          'Que el agua debe venderse a precios inalcanzables'
        ],
        correctIndex: 0,
        explanation: 'El acceso al agua y saneamiento es la base material de los derechos humanos y la vida civilizada.'
      }
    ]
  },
  {
    id: 'lec-32',
    level: 32,
    title: 'El Canto del Chajalele en la Alborada',
    genre: 'Lírica Campesina y Naturaleza',
    targetWpm: 225,
    xpReward: 300,
    difficulty: 'Avanzado',
    author: 'Poetas de la Sierra de Chuacús',
    pedagogicalSource: 'Asociación de Escritores Mayas de Guatemala',
    competencies: ['Sensibilidad poética', 'Biología ornitológica regional', 'Puntualidad en el deber'],
    vocabulary: [
      { word: 'chajalele', meaning: 'Ave del altiplano conocida por su trino madrugador que anuncia el amanecer.' },
      { word: 'alborada', meaning: 'Momento de la mañana en que empieza a clarear antes de salir el sol.' },
      { word: 'surco', meaning: 'Hendidura longitudinal que se hace en la tierra con el arado para sembrar.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `Mucho antes de que el sol despunte sobre las lomas de San Jerónimo, el canto agudo y alegre del chajalele rompe la niebla fría de los pajonales. Su trino mañanero es el reloj de la campiña guatemalteca: despierta a los sembradores de habas, convoca a los arrieros y recuerda que la madrugada pertenece a quienes tienen la voluntad despierta. El ave no exige recompensas ni aplausos por su labor; canta por la pura vocación de anunciar la luz que renueva la tierra, dando un vivo ejemplo de gratuidad, puntualidad y amor generoso por la existencia cotidiana.`,
    wordCount: 96,
    questions: [
      {
        id: 'q32-1',
        prompt: '¿Qué función cumple tradicionalmente el canto del chajalele en los campos guatemaltecos?',
        options: [
          'Anunciar el inicio de la alborada y despertar con su trino a los trabajadores del campo',
          'Avisar de la llegada de tormentas huracanadas en el mar',
          'Ahuyentar a las abejas de los sembradíos',
          'Marcar la hora de dormir a las mascotas domésticas'
        ],
        correctIndex: 0,
        explanation: 'El chajalele es el ave madrugadora por excelencia, reloj natural del campesinado en las veredas altas.'
      },
      {
        id: 'q32-2',
        prompt: '¿Qué actitud vital ejemplifica el ave con su trino gratuito al amanecer?',
        options: [
          'La vocación sincera de servir sin exigir aplausos ni vanidades personales',
          'La pereza ante la llegada del invierno',
          'El miedo a los rayos solares de la mañana',
          'El egoísmo frente a las demás aves del nido'
        ],
        correctIndex: 0,
        explanation: 'Su canto celebra la luz y el comienzo del día como un acto generoso de puntualidad desinteresada.'
      },
      {
        id: 'q32-3',
        prompt: '¿A quiénes pertenece el valor de la madrugada según la reflexión lírica?',
        options: [
          'A quienes tienen la voluntad despierta y el ánimo presto al deber productivo',
          'Únicamente a quienes no necesitan descansar en la noche',
          'A los comerciantes ambulantes de la costa',
          'A los viajeros extranjeros que no conocen el camino'
        ],
        correctIndex: 0,
        explanation: 'La disciplina de madrugar se asocia en el texto con la excelencia del carácter y la determinación.'
      }
    ]
  },
  {
    id: 'lec-33',
    level: 33,
    title: 'La Declaración de Independencia en el Palacio Real',
    genre: 'Historia y Conciencia Ciudadana',
    targetWpm: 228,
    xpReward: 310,
    difficulty: 'Avanzado',
    author: 'Historiadores del Bicentenario',
    pedagogicalSource: 'Academia de Geografía e Historia de Guatemala — Archivo de 1821',
    competencies: ['Pensamiento cívico crítico', 'Análisis del proceso independentista', 'Responsabilidad republicana'],
    vocabulary: [
      { word: 'emancipación', meaning: 'Liberación respecto de un poder, autoridad o tutela de gobierno opresor.' },
      { word: 'bando', meaning: 'Edicto o mandato solemne publicado por una autoridad en plaza pública.' },
      { word: 'soberanía', meaning: 'Poder político supremo que reside en el pueblo para autodeterminarse libremente.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `La mañana del quince de septiembre de mil ochocientos veintiuno, los pasillos del Palacio de los Capitanes vibraban con el fervor de los patriotas congregados para deliberar sobre la emancipación política. Mientras las campanas doblaban con júbilo en la plaza colmada de ciudadanos, Don José Cecilio del Valle redactó con mano firme el acta que proclamaba la soberanía de las provincias de Centroamérica. Aquella histórica rúbrica no fue el punto final de una lucha, sino el inicio de una inmensa responsabilidad compartida: construir una república libre donde la educación, la honradez y la concordia sean los cimientos inmutables de la paz.`,
    wordCount: 100,
    questions: [
      {
        id: 'q33-1',
        prompt: '¿Quién redactó con pulso firme el texto original del Acta de Independencia de 1821?',
        options: [
          'Don José Cecilio del Valle',
          'El rey Fernando VII de España',
          'El mariscal Sucre en los Andes',
          'Simón Bolívar en Caracas'
        ],
        correctIndex: 0,
        explanation: 'José Cecilio del Valle, sabio humanista y jurista, redactó los artículos del Acta de Independencia.'
      },
      {
        id: 'q33-2',
        prompt: '¿Cómo describe el texto el significado histórico de la firma emancipadora?',
        options: [
          'Como el inicio de una inmensa responsabilidad compartida para edificar una nación justa y educada',
          'Como un trámite protocolario sin relevancia para el pueblo trabajador',
          'Como el permiso para descuidar las leyes y las obligaciones civiles',
          'Como el final de todos los problemas sociales de Centroamérica'
        ],
        correctIndex: 0,
        explanation: 'La independencia se plantea como un compromiso activo y cotidiano de civismo y educación continua.'
      },
      {
        id: 'q33-3',
        prompt: '¿Cuáles son los cimientos inmutables señalados para afianzar la paz republicana?',
        options: [
          'La educación sólida, la honradez de gobernantes y ciudadanos, y la concordia fraterna',
          'El gasto militar desmedido y el cierre de fronteras comerciales',
          'La imposición violenta de ideologías foráneas',
          'La exclusión de las comunidades rurales del progreso educativo'
        ],
        correctIndex: 0,
        explanation: 'La verdadera libertad sólo fructifica mediante el saber ético, la probidad y la unidad cívica.'
      }
    ]
  },
  {
    id: 'lec-34',
    level: 34,
    title: 'Voces Inmortales de la Academia Guatemalteca',
    genre: 'Ensayo y Riqueza del Idioma',
    targetWpm: 230,
    xpReward: 320,
    difficulty: 'Avanzado',
    author: 'Cátedra de Lingüística Aplicada Kinal',
    pedagogicalSource: 'Academia Guatemalteca de la Lengua — RAE',
    competencies: ['Enriquecimiento léxico', 'Dominio del idioma español', 'Identidad lingüística mesoamericana'],
    vocabulary: [
      { word: 'guatemaltequismos', meaning: 'Palabras o locuciones propias del habla popular y culta de Guatemala.' },
      { word: 'sinonimia', meaning: 'Relación entre palabras que comparten un significado equivalente o afín.' },
      { word: 'dicción', meaning: 'Forma correcta y clara de pronunciar las palabras y estructurar oraciones.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `El idioma español hablado en Guatemala es un río caudaloso donde confluyen la elegancia de la prosa de Cervantes con las sonoridades ancestrales de veintidós idiomas mayas, el xinka y el garífuna. Vocablos entrañables como "chispudo", "chilero" o "chucho" encierran una calidez afectiva que ninguna traducción literal puede agotar. El estudiante técnico que cultiva la lectura amplia no solo mejora su velocidad lectora y ortografía, sino que se convierte en un comunicador persuasivo, capaz de defender proyectos de alto calibre con elegancia, precisión conceptual y genuino arraigo en la riqueza verbal de su pueblo.`,
    wordCount: 95,
    questions: [
      {
        id: 'q34-1',
        prompt: '¿Qué ríos culturales nutren la singularidad del habla cotidiana y literaria de Guatemala?',
        options: [
          'La tradición clásica castellana entretejida con 22 idiomas mayas, el xinka y el garífuna',
          'Únicamente influencias anglosajonas de los medios masivos',
          'El dialecto colonial de las islas Filipinas sin mezclas locales',
          'Traducciones automatizadas de manuales de maquinaria'
        ],
        correctIndex: 0,
        explanation: 'Nuestra lengua es un patrimonio mestizo y plurilingüe enriquecido por milenios de historia compartida.'
      },
      {
        id: 'q34-2',
        prompt: '¿Qué ventaja profesional adquiere el técnico que domina ampliamente su idioma materno?',
        options: [
          'La capacidad de comunicar ideas complejas con precisión, elegancia y liderazgo persuasivo',
          'El desinterés por las materias científicas y matemáticas',
          'La imposibilidad de trabajar en equipos internacionales',
          'El rechazo a la tecnología digital moderna'
        ],
        correctIndex: 0,
        explanation: 'El dominio lingüístico potencia el liderazgo técnico, la formulación de proyectos y el éxito profesional.'
      },
      {
        id: 'q34-3',
        prompt: '¿Qué término coloquial guatemalteco alude a una persona avispada, rápida y capaz?',
        options: [
          'Chispudo',
          'Lento',
          'Rezongón',
          'Tumbado'
        ],
        correctIndex: 0,
        explanation: '"Chispudo" es el guatemaltequismo por excelencia para designar agilidad mental, proactividad y destreza.'
      }
    ]
  },
  {
    id: 'lec-35',
    level: 35,
    title: 'La Travesía por los Cañones del Río Usumacinta',
    genre: 'Aventura y Soberanía Territorial',
    targetWpm: 232,
    xpReward: 330,
    difficulty: 'Avanzado',
    author: 'Expedicionarios de la Selva Lacandona',
    pedagogicalSource: 'Comisión de Límites y Aguas Internacionales — Frontera Petenera',
    competencies: ['Geografía fluvial fronteriza', 'Liderazgo expedicionario', 'Conservación de biosferas'],
    vocabulary: [
      { word: 'raudales', meaning: 'Lugares de un río donde la corriente es extremadamente rápida y turbulenta.' },
      { word: 'meandros', meaning: 'Curvas pronunciadas y sinuosas que describe el curso de un río caudaloso.' },
      { word: 'biodiversidad', meaning: 'Variedad inmensa de especies animales y vegetales que habitan un ecosistema.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `Navegar los raudales espumosos del río Usumacinta a través del Cañón de Boca del Cerro es internarse en el corazón verde más indómito de Petén. Las paredes calizas de más de trescientos metros de altura se alzan como murallas guardianas de la selva virgen, donde los monos aulladores custodian las ruinas cubiertas de musgo de Piedras Negras y Yaxchilán. Los tripulantes que manejan el timón en los remolinos aprenden que la fuerza bruta es inútil si no va acompañada por la lectura atenta de la corriente y la serenidad ante el peligro, lección fundamental para gobernar la propia vida frente a las tempestades del mundo.`,
    wordCount: 104,
    questions: [
      {
        id: 'q35-1',
        prompt: '¿Qué ciudades arqueológicas mayas flanquean el curso caudaloso del Usumacinta?',
        options: [
          'Piedras Negras y Yaxchilán en medio de la selva virgen',
          'Copán Ruinas y Tazumal',
          'Monte Albán y Teotihuacán',
          'Machu Picchu y Cusco'
        ],
        correctIndex: 0,
        explanation: 'El Usumacinta fue la gran autopista fluvial de urbes mayas monumentales del periodo clásico.'
      },
      {
        id: 'q35-2',
        prompt: '¿Qué enseñanza de navegación fluvial aplica directamente al gobierno del carácter humano?',
        options: [
          'Que la fuerza física ciega es estéril sin la lectura prudente del entorno y la calma reflexiva',
          'Que se debe navegar a máxima velocidad con los ojos cerrados',
          'Que es imposible superar cualquier corriente de agua',
          'Que los ríos caudalosos deben secarse con muros de contención'
        ],
        correctIndex: 0,
        explanation: 'El timonel experto vence el peligro estudiando la corriente con serenidad y prudencia técnica.'
      },
      {
        id: 'q35-3',
        prompt: '¿Qué frontera natural delimita este imponente accidente hidrográfico?',
        options: [
          'La frontera fluvial occidental entre Guatemala y México',
          'El límite entre Guatemala y El Salvador',
          'La desembocadura del canal de Panamá',
          'El estrecho marítimo de Magallanes'
        ],
        correctIndex: 0,
        explanation: 'El río Usumacinta es el límite fluvial internacional más caudaloso del norte guatemalteco.'
      }
    ]
  },
  {
    id: 'lec-36',
    level: 36,
    title: 'El Filósofo del Callejón del Fino Trato',
    genre: 'Crítica Social y Filosofía Práctica',
    targetWpm: 235,
    xpReward: 340,
    difficulty: 'Avanzado',
    author: 'Ensayistas del Centro Histórico',
    pedagogicalSource: 'Facultad de Humanidades — Ensayos Éticos sobre la Convivencia',
    competencies: ['Urbanidad y cortesía cívica', 'Filosofía moral aplicada', 'Empatía social en la urbe'],
    vocabulary: [
      { word: 'urbanidad', meaning: 'Comportamiento cortés, comedido y atento a las buenas costumbres cívicas.' },
      { word: 'afabilidad', meaning: 'Cualidad en el trato que hace grata y acogedora la conversación.' },
      { word: 'pragmatismo', meaning: 'Preferencia por lo práctico y útil en la solución de problemas cotidianos.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `En una modesta zapatería del callejón del Fino Trato, cerca de la iglesia de La Candelaria, el maestro zapatero Don Lisandro solía decir que la cortesía es el aceite que evita que la maquinaria social rechine con aspereza. Mientras cosía suelas de cuero con hilo encerado, conversaba con estudiantes, médicos y cargadores del mercado, dispensando a todos el mismo respeto escrupuloso y afecto fraterno. Aquel hombre sencillo practicaba una filosofía cotidiana profunda: quien cultiva la delicadeza en el saludo y la honradez en el trabajo manual transforma su entorno más eficazmente que quienes escriben tratados voluminosos pero olvidan mirar con ternura al prójimo.`,
    wordCount: 104,
    questions: [
      {
        id: 'q36-1',
        prompt: '¿Cómo definía el maestro artesano zapatero el valor de la cortesía en la sociedad?',
        options: [
          'Como el aceite lubricante que impide que la convivencia comunitaria rechine con aspereza',
          'Como una pérdida de tiempo reservada a fiestas de palacio',
          'Como una debilidad de quienes no saben imponer su voluntad por la fuerza',
          'Como un requisito que solo deben cumplir los niños en la escuela'
        ],
        correctIndex: 0,
        explanation: 'Don Lisandro concebía los modales amables y el buen trato como el bálsamo de la paz comunitaria.'
      },
      {
        id: 'q36-2',
        prompt: '¿Qué actitud demostraba Don Lisandro hacia las personas que visitaban su taller?',
        options: [
          'El mismo respeto escrupuloso y afecto fraterno sin distinción de oficio o posición económica',
          'Desprecio hacia quienes vestían ropas de trabajo humilde',
          'Interés exclusivo en quienes le dejaban grandes propinas en monedas',
          'Indiferencia absoluta manteniéndose callado todo el día'
        ],
        correctIndex: 0,
        explanation: 'Su vida ejemplificaba la auténtica igualdad de trato y la dignidad universal de toda persona humana.'
      },
      {
        id: 'q36-3',
        prompt: '¿Cuál es la conclusión ética que se desprende de este relato del Centro Histórico?',
        options: [
          'Que la ternura y la honradez práctica son más transformadoras que la teoría vacía de obras',
          'Que la filosofía solo puede enseñarse en bibliotecas con libros de cuero',
          'Que los zapateros no deben hablar con los clientes de su negocio',
          'Que la aspereza en el trato es síntoma de firmeza moral'
        ],
        correctIndex: 0,
        explanation: 'La coherencia entre el trabajo honesto y la bondad en el trato cotidiano es la cumbre de la sabiduría.'
      }
    ]
  },
  {
    id: 'lec-37',
    level: 37,
    title: 'La Gran Polifonía de las Campanas de La Merced',
    genre: 'Ensayo Literario y Estética Sonora',
    targetWpm: 240,
    xpReward: 350,
    difficulty: 'Avanzado',
    author: 'Cátedra de Estética Barroca Kinal',
    pedagogicalSource: 'Patrimonio Sonoro de la Nueva Guatemala — Consejo Nacional de la Cultura',
    competencies: ['Comprensión estética superior', 'Sincronía rítmica avanzada', 'Trascendencia del arte sacro'],
    vocabulary: [
      { word: 'polifonía', meaning: 'Simultaneidad de sonidos armónicos que forman un todo estético sobrecogedor.' },
      { word: 'bronce', meaning: 'Aleación resistente de cobre y estaño empleada para fundir campanas sonoras.' },
      { word: 'cadencia', meaning: 'Ritmo y medida regular de los sonidos que acompañan una composición.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `Cuando el campanario mayor del templo barroco de La Merced hace sonar su juego de bronce en las fiestas patrias y patronales, el valle entero de la capital se inunda de ondas armónicas que estremecen los corazones. Cada campana posee un peso, afinación y grosor particular: la más pequeña canta con trinos plateados de júbilo, mientras el campanil mayor impone su bajo profundo que hace retumbar las torres centenarias. En esa polifonía sublime no hay discordia ni celos entre notas; la belleza conmovedora surge precisamente de la diversidad de timbres que cooperan en un único concierto de alabanza y esperanza para toda la república.`,
    wordCount: 104,
    questions: [
      {
        id: 'q37-1',
        prompt: '¿De qué fenómeno acústico y estético surge la conmovedora belleza del tañido de La Merced?',
        options: [
          'De la diversidad de timbres que cooperan armónicamente sin discordia ni celos',
          'Del ruido ensordecedor de una sola sirena de alarma de vapor',
          'De la repetición monótona de un único golpe metálico seco',
          'De la música grabada en altavoces de baja fidelidad'
        ],
        correctIndex: 0,
        explanation: 'La armonía polifónica resulta de la complementariedad fraterna de notas agudas y graves.'
      },
      {
        id: 'q37-2',
        prompt: '¿Qué elemento material conforma la fundición de las campanas centenarias?',
        options: [
          'La aleación clásica de bronce afinado (cobre y estaño)',
          'Plástico prensado con resinas epóxicas',
          'Lámina galvanizada de zinc oxidado',
          'Arcilla secada al sol'
        ],
        correctIndex: 0,
        explanation: 'El bronce de campana es una aleación milenaria diseñada para emitir vibraciones prolongadas y ricas.'
      },
      {
        id: 'q37-3',
        prompt: '¿Qué lección cívica proyecta la polifonía de las campanas hacia la convivencia ciudadana?',
        options: [
          'Que la diversidad de talentos y orígenes de los ciudadanos enriquece la unidad armónica del país',
          'Que todas las personas deben pensar y actuar de manera idéntica y obligatoria',
          'Que solo quienes tienen mayor volumen tienen derecho a expresar su voz',
          'Que la música debe ser prohibida en los espacios comunitarios'
        ],
        correctIndex: 0,
        explanation: 'La analogía sonora exalta la pluralidad fecunda en la construcción de una patria unida y solidaria.'
      }
    ]
  },
  {
    id: 'lec-38',
    level: 38,
    title: 'La Cúspide Kinal: Excelencia Técnica que Trasciende',
    genre: 'Liderazgo, Trascendencia y Futuro',
    targetWpm: 250,
    xpReward: 500,
    difficulty: 'Avanzado',
    author: 'Dirección General y Consejo Directivo Kinal',
    pedagogicalSource: 'Fundación Kinal — Cúspide del Programa Formativo y Trascendencia Ciudadana',
    competencies: ['Liderazgo transformador', 'Visión prospectiva de futuro', 'Excelencia integral y servicio cristiano'],
    vocabulary: [
      { word: 'cúspide', meaning: 'Punto más alto de una montaña o la cima superior del desarrollo formativo.' },
      { word: 'trascender', meaning: 'Dejar una huella bienhechora que perdura más allá de nuestra propia existencia.' },
      { word: 'vocación', meaning: 'Llamado interior a consagrar la vida y talentos a una causa de servicio digno.' }
    ],
    estimatedMinutes: 3,
    unlocked: false,
    completed: false,
    content: `Alcanzar la cima de la trigésima octava lectura es coronar una de las travesías intelectuales y éticas más ambiciosas que un estudiante guatemalteco puede emprender. Desde aquel primer vuelo del quetzal en las nieblas de la Sierra de las Minas hasta este umbral de maestría lectora, cada palabra articulada a más de doscientas cincuenta palabras por minuto ha templado tu atención, ensanchado tu léxico y afinado tu espíritu crítico. Recuerda que el lema de Kinal —"Excelencia que trasciende"— no es un eslogan publicitario, sino un mandato sagrado: tu destreza técnica, tu pensamiento reflexivo y tu bondad moral deben convertirse en luz, progreso y esperanza viva para los más necesitados de nuestra amada Guatemala. ¡Adelante con valentía, nobleza y amor constante al prójimo!`,
    wordCount: 125,
    questions: [
      {
        id: 'q38-1',
        prompt: '¿Qué representa la culminación del nivel 38 en la plataforma pedagógica de lectura?',
        options: [
          'La coronación de una rigurosa travesía de fluidez, análisis crítico y formación ética integral',
          'El cierre definitivo de los estudios sin necesidad de volver a leer jamás',
          'Un requisito insignificante que no aporta valor al desarrollo profesional',
          'Un simple juego informático sin sustento en la realidad del país'
        ],
        correctIndex: 0,
        explanation: 'El nivel 38 sella el dominio de la lectura veloz comprensiva aunada al compromiso social de servicio.'
      },
      {
        id: 'q38-2',
        prompt: '¿Cuál es el lema institucional fundacional de Kinal que sella el epílogo del programa?',
        options: [
          '"Excelencia que trasciende"',
          '"El más fuerte sobrevive"',
          '"Ganar a cualquier costo"',
          '"Tranquilidad sin esfuerzo"'
        ],
        correctIndex: 0,
        explanation: '"Excelencia que trasciende" sintetiza la vocación de irradiar bondad y competencia técnica a la sociedad.'
      },
      {
        id: 'q38-3',
        prompt: '¿Hacia qué propósito supremo debe orientarse la preparación de los egresados de Kinal?',
        options: [
          'Convertirse en luz, progreso y esperanza transformadora para Guatemala y los más vulnerables',
          'Buscar el enriquecimiento personal sin importar las consecuencias colectivas',
          'Aislarse de los desafíos comunitarios de la nación',
          'Olvidar los valores humanos adquiridos durante el aprendizaje'
        ],
        correctIndex: 0,
        explanation: 'El fin último de toda formación académica y técnica es el bien común y la elevación moral del prójimo.'
      }
    ]
  }
];

// Find insertion index before `export const INITIAL_USERS`
const marker = 'export const INITIAL_USERS';
const markerPos = fileContent.indexOf(marker);

if (markerPos === -1) {
  console.error('Could not find marker in kinal-readings.ts');
  process.exit(1);
}

// Find the last `]` of KINAL_READINGS before markerPos
const lastBracketPos = fileContent.lastIndexOf('];', markerPos);
if (lastBracketPos === -1) {
  console.error('Could not find closing bracket of KINAL_READINGS');
  process.exit(1);
}

// Generate the TypeScript code for the additional readings
const additionalReadingsCode = ',\n' + additionalReadings.map(r => '  ' + JSON.stringify(r, null, 2).replace(/\n/g, '\n  ')).join(',\n') + '\n';

// Construct the new file content
const newContent = fileContent.slice(0, lastBracketPos) + additionalReadingsCode + fileContent.slice(lastBracketPos);

fs.writeFileSync(targetFilePath, newContent, 'utf-8');
console.log('Successfully updated kinal-readings.ts with all 38 readings!');
