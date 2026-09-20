import { TestBed } from '@angular/core/testing';
import {
  normalizeSpanishWord,
  toPhoneticKey,
  isPhoneticMatch,
  getWordEquivalents,
  SpeechRecognitionService,
} from './speech-recognition.service';
import { ReadingReaderComponent } from '../../features/student/components/reading-reader/reading-reader.component';
import { Reading } from '../models/reading.model';

describe('Speech Recognition & Phonetic Alignment Engine', () => {
  describe('normalizeSpanishWord', () => {
    it('should remove accents and diacritics', () => {
      expect(normalizeSpanishWord('había')).toBe('habia');
      expect(normalizeSpanishWord('canción')).toBe('cancion');
      expect(normalizeSpanishWord('bilingüe')).toBe('bilingue');
    });

    it('should remove all punctuation and typography marks', () => {
      expect(normalizeSpanishWord('¡Hola!')).toBe('hola');
      expect(normalizeSpanishWord('¿Dónde?')).toBe('donde');
      expect(normalizeSpanishWord('Minas,')).toBe('minas');
      expect(normalizeSpanishWord('bosque:')).toBe('bosque');
      expect(normalizeSpanishWord('«Quetzal»')).toBe('quetzal');
    });
  });

  describe('isPhoneticMatch', () => {
    it('should match exact and case-insensitive words', () => {
      expect(isPhoneticMatch('En', 'en')).toBe(true);
      expect(isPhoneticMatch('Sierra', 'sierra')).toBe(true);
    });

    it('should handle seseo, betacismo and yeismo', () => {
      expect(isPhoneticMatch('caza', 'casa')).toBe(true);
      expect(isPhoneticMatch('haber', 'haver')).toBe(true);
      expect(isPhoneticMatch('llave', 'yave')).toBe(true);
    });

    it('should handle numbers and digits', () => {
      expect(isPhoneticMatch('1', 'uno')).toBe(true);
      expect(isPhoneticMatch('un', '1')).toBe(true);
      expect(isPhoneticMatch('tres', '3')).toBe(true);
    });

    it('should handle regular plurals and singulars', () => {
      expect(isPhoneticMatch('alas', 'ala')).toBe(true);
      expect(isPhoneticMatch('cedros', 'cedro')).toBe(true);
      expect(isPhoneticMatch('quetzales', 'quetzal')).toBe(true);
    });

    it('should handle contractions and colloquial forms', () => {
      expect(isPhoneticMatch('pa', 'para')).toBe(true);
      expect(isPhoneticMatch('tonces', 'entonces')).toBe(true);
    });

    it('should handle explicit variants for difficult Mayan names without collapsing unrelated sounds', () => {
      expect(getWordEquivalents("q'eqchi'")).toContain('quechi');
      expect(isPhoneticMatch('quechi', "q'eqchi'")).toBe(true);
      expect(toPhoneticKey('tsutujil')).not.toBe(toPhoneticKey('chutujil'));
    });

    it('should tolerate minor acoustic noise with Levenshtein distance', () => {
      expect(isPhoneticMatch('esmeraldas', 'esmeralda')).toBe(true);
      expect(isPhoneticMatch('montanas', 'montana')).toBe(true);
    });
  });

  describe('ReadingReaderComponent Multi-Token Sliding Window Alignment', () => {
    let component: ReadingReaderComponent;
    const mockReading: Reading = {
      id: 'test-1',
      level: 1,
      title: 'El Quetzal y el Guardián',
      genre: 'Fábulas',
      targetWpm: 120,
      xpReward: 100,
      difficulty: 'Básico',
      author: 'Kinal',
      pedagogicalSource: 'MINEDUC',
      competencies: ['Fluidez'],
      vocabulary: [],
      estimatedMinutes: 2,
      unlocked: true,
      completed: false,
      content: 'En las altas cumbres de la Sierra de las Minas donde la niebla danza entre los helechos gigantes',
      wordCount: 18,
      questions: [],
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ReadingReaderComponent],
      }).compileComponents();

      const fixture = TestBed.createComponent(ReadingReaderComponent);
      component = fixture.componentInstance;
      component.reading = mockReading;
      component.ngOnInit();
    });

    it('should initialize words and pre-normalized lists correctly', () => {
      expect(component.words.length).toBe(18);
      expect(component.words[0]).toBe('En');
      expect(component.words[1]).toBe('las');
      expect(component.normalizedWords[0]).toBe('en');
    });

    it('should preview interim words without committing academic progress', () => {
      // El reconocedor todavía puede corregir "En las" en el siguiente evento.
      (component as any).processSpeechTokens({
        finalTokens: [],
        interimTokens: ['en', 'las'],
        candidateAlts: [],
        wordsSpokenCount: 2,
        currentWpm: 100,
      });

      expect(component.currentWordIndex).toBe(0);
      expect(component.previewWordIndex).toBe(2);
      expect((component as any).confirmedMatchedWords).toBe(0);

      // Solo el resultado final se convierte en avance y palabras medidas.
      (component as any).processSpeechTokens({
        finalTokens: ['en', 'las'],
        interimTokens: [],
        candidateAlts: [],
        wordsSpokenCount: 2,
        currentWpm: 100,
      });

      expect(component.currentWordIndex).toBe(2);
      expect(component.previewWordIndex).toBe(2);
      expect((component as any).confirmedMatchedWords).toBe(2);
    });

    it('should smoothly advance even if the first word was clipped by mic delay', () => {
      // Supongamos que el micrófono recortó "En" y captó directamente "las altas cumbres"
      (component as any).processSpeechTokens({
        finalTokens: [],
        interimTokens: ['las', 'altas', 'cumbres'],
        candidateAlts: [],
        wordsSpokenCount: 3,
        currentWpm: 110,
      });

      // Debe anclarse en "las" y avanzar hasta cumbres (índice 4)
      expect(component.currentWordIndex).toBe(0);
      expect(component.previewWordIndex).toBe(4);
    });

    it('should NOT freeze on long continuous interim speech', () => {
      // Simular primera frase
      (component as any).processSpeechTokens({
        finalTokens: [],
        interimTokens: ['en', 'las', 'altas', 'cumbres'],
        candidateAlts: [],
        wordsSpokenCount: 4,
        currentWpm: 120,
      });
      expect(component.currentWordIndex).toBe(0);
      expect(component.previewWordIndex).toBe(4);

      // El estudiante sigue hablando continuamente sin pausa final: el búfer interino crece
      (component as any).processSpeechTokens({
        finalTokens: [],
        interimTokens: ['en', 'las', 'altas', 'cumbres', 'de', 'la', 'sierra', 'de', 'las', 'minas'],
        candidateAlts: [],
        wordsSpokenCount: 10,
        currentWpm: 125,
      });

      // Debe continuar previsualizando hasta "minas" sin registrar palabras aún no finales.
      expect(component.currentWordIndex).toBe(0);
      expect(component.previewWordIndex).toBe(10);
    });

    it('should handle title spoken before reading text without getting lost', () => {
      // El estudiante lee: "El quetzal y el guardián. En las altas cumbres..."
      (component as any).processSpeechTokens({
        finalTokens: [],
        interimTokens: ['el', 'quetzal', 'y', 'el', 'guardian', 'en', 'las', 'altas', 'cumbres'],
        candidateAlts: [],
        wordsSpokenCount: 9,
        currentWpm: 120,
      });

      expect(component.currentWordIndex).toBe(0);
      expect(component.previewWordIndex).toBe(4);
    });

    it('should strictly maintain monotonicity and never regress', () => {
      (component as any).processSpeechTokens({
        finalTokens: ['en', 'las', 'altas'],
        interimTokens: ['cumbres'],
        candidateAlts: [],
        wordsSpokenCount: 4,
        currentWpm: 120,
      });
      const advanced = component.currentWordIndex;
      expect(advanced).toBe(3);
      expect(component.previewWordIndex).toBe(4);

      // Una repetición o ruido no debe hacer retroceder el cursor
      (component as any).processSpeechTokens({
        finalTokens: ['en', 'las', 'altas'],
        interimTokens: ['altas'],
        candidateAlts: [],
        wordsSpokenCount: 4,
        currentWpm: 120,
      });

      expect(component.currentWordIndex).toBe(advanced);
    });

    it('should select best anchor with highest match count when word appears multiple times (user screenshot scenario)', () => {
      const longMockReading: Reading = {
        ...mockReading,
        content:
          'En las altas cumbres vivía un joven quetzal de plumaje esmeralda. Las aves volaban sobre el dosel arbóreo, este quetzal observaba con atención cada detalle del bosque',
        wordCount: 26,
        questions: [
          {
            id: 'q1',
            prompt: '¿Quién observaba?',
            options: ['El quetzal', 'El águila'],
            correctIndex: 0,
            explanation: 'El texto menciona al quetzal',
          },
        ],
      };
      component.reading = longMockReading;
      component.ngOnInit();

      // Supongamos que el estudiante está en la palabra 6 ("quetzal") y luego lee:
      // "quetzal este quetzal observaba con atención cada detalle del bosque"
      component.currentWordIndex = 6;
      (component as any).confirmedWordIndex = 6;

      (component as any).processSpeechTokens({
        finalTokens: [],
        interimTokens: ['quetzal', 'este', 'quetzal', 'observaba', 'con', 'atencion', 'cada', 'detalle', 'del', 'bosq'],
        candidateAlts: [],
        wordsSpokenCount: 10,
        currentWpm: 120,
      });

      // Debe anclar en el segundo quetzal ("este quetzal observaba...") porque tiene 9 coincidencias y avanzar
      expect(component.currentWordIndex).toBe(6);
      expect(component.previewWordIndex).toBe(component.totalWords);
    });

    it('should match in-progress words by prefix (e.g. bosq -> bosque)', () => {
      component.currentWordIndex = 3;
      (component as any).confirmedWordIndex = 3;

      // El alumno está en "cumbres" (3) y pronuncia "cumbres" mientras interim todavía dice "cumbr"
      (component as any).processSpeechTokens({
        finalTokens: [],
        interimTokens: ['cumbr'],
        candidateAlts: [],
        wordsSpokenCount: 1,
        currentWpm: 100,
      });

      expect(component.currentWordIndex).toBe(3);
      expect(component.previewWordIndex).toBe(4);
    });

    it('should seamlessly read through dialogue dashes and typography quotes without freezing', () => {
      const dashReading: Reading = {
        ...mockReading,
        content: 'Recuerda que el lema de Kinal —"Excelencia que trasciende"— no es un eslogan',
        wordCount: 13,
      };
      component.reading = dashReading;
      component.ngOnInit();

      // Leer primera mitad antes de la raya de diálogo
      (component as any).processSpeechTokens({
        finalTokens: ['recuerda', 'que', 'el', 'lema', 'de', 'kinal'],
        interimTokens: [],
        candidateAlts: [],
        wordsSpokenCount: 6,
        currentWpm: 120,
      });

      expect(component.currentWordIndex).toBe(6);

      // Leer a través de la raya de diálogo y comillas
      (component as any).processSpeechTokens({
        finalTokens: ['recuerda', 'que', 'el', 'lema', 'de', 'kinal', 'excelencia', 'que', 'trasciende'],
        interimTokens: [],
        candidateAlts: [],
        wordsSpokenCount: 9,
        currentWpm: 120,
      });

      expect(component.currentWordIndex).toBe(9);
    });

    it('should effortlessly hop over skipped medium words without freezing or breaking the sentence', () => {
      const skipReading: Reading = {
        ...mockReading,
        content: 'En las altas cumbres de la Sierra de las Minas vivía un joven quetzal',
        wordCount: 14,
      };
      component.reading = skipReading;
      component.ngOnInit();

      // El estudiante omite la palabra "cumbres" (7 letras) y lee directamente "de la Sierra"
      (component as any).processSpeechTokens({
        finalTokens: ['en', 'las', 'altas', 'de', 'la', 'sierra'],
        interimTokens: [],
        candidateAlts: [],
        wordsSpokenCount: 6,
        currentWpm: 120,
      });

      // Debe sincronizarse y avanzar hasta después de la palabra Sierra (índice 7)
      expect(component.currentWordIndex).toBe(7);
    });

    it('should align multi-token spoken numbers to digits in text (1821 -> mil ochocientos veintiuno)', () => {
      const dateReading: Reading = {
        ...mockReading,
        content: 'En el año 1821 se proclamó la independencia durante el siglo XIX',
        wordCount: 11,
      };
      component.reading = dateReading;
      component.ngOnInit();

      (component as any).processSpeechTokens({
        finalTokens: ['en', 'el', 'ano', 'mil', 'ochocientos', 'veintiuno'],
        interimTokens: [],
        candidateAlts: [],
        wordsSpokenCount: 6,
        currentWpm: 120,
      });

      // Debe avanzar más allá de '1821' (índice 4)
      expect(component.currentWordIndex).toBeGreaterThanOrEqual(4);
    });

    it('should allow student to interactively re-anchor by clicking any word during recording', () => {
      component.isRecording = true;
      component.currentWordIndex = 2;

      // El alumno hace clic en la palabra en el índice 7
      component.onWordClick(component.words[7], 7);

      expect(component.currentWordIndex).toBe(7);
      expect((component as any).confirmedWordIndex).toBe(7);
      expect(component.previewWordIndex).toBe(7);
      expect(component.reanchorToastMessage).toContain('8');
    });

    it('should not use an unrelated recognition alternative as matching evidence', () => {
      component.currentWordIndex = 2;
      (component as any).confirmedWordIndex = 2;

      (component as any).processSpeechTokens({
        finalTokens: [],
        interimTokens: ['ruido'],
        // Antes una alternativa aislada podía hacer avanzar el cursor aunque
        // no perteneciera al token "ruido" ni a esta posición.
        candidateAlts: ['cumbres'],
        wordsSpokenCount: 1,
        currentWpm: 100,
      });

      expect(component.currentWordIndex).toBe(2);
      expect(component.previewWordIndex).toBe(2);
    });

    it('should not discard a legitimate reading word merely because it can be a filler', () => {
      expect((component as any).isFiller('este')).toBe(false);
      expect((component as any).isFiller('bueno')).toBe(false);
      expect((component as any).isFiller('eh')).toBe(true);
    });

    it('should calculate PPM from confirmed matches instead of cursor position', () => {
      component.secondsElapsed = 60;
      component.currentWordIndex = 12;
      (component as any).confirmedMatchedWords = 5;

      component.updateLiveWpm();

      expect(component.currentWpm).toBe(5);
    });

    it('should not mark pending words as read when the student finishes manually', () => {
      component.reading = {
        ...component.reading,
        questions: [{
          id: 'finish-q1',
          prompt: 'Pregunta de prueba',
          options: ['Opción'],
          correctIndex: 0,
        }],
      };
      component.selectedAnswers = [-1];
      component.currentWordIndex = 5;
      component.previewWordIndex = 8;
      (component as any).confirmedWordIndex = 5;
      (component as any).confirmedMatchedWords = 4;

      component.finishReading();

      expect(component.currentWordIndex).toBe(5);
      expect(component.previewWordIndex).toBe(5);
      expect((component as any).confirmedMatchedWords).toBe(4);
      expect(component.showQuiz).toBe(true);
    });

    it('should strictly prevent jumping 3 lines (>= 15 words) on isolated words or stopwords', () => {
      // Caso crítico reportado por el usuario: el estudiante lee desde el inicio y el cursor salta 3 líneas
      component.currentWordIndex = 0;
      (component as any).confirmedWordIndex = 0;

      // Simular que el reconocedor capta una palabra que aparece 3 líneas más abajo (ej. "quetzal" o "de las")
      (component as any).processSpeechTokens({
        finalTokens: [],
        interimTokens: ['quetzal'],
        candidateAlts: [],
        wordsSpokenCount: 1,
        currentWpm: 120,
      });

      // NO debe saltar a la palabra 21/22 ni avanzar arbitrariamente
      expect(component.currentWordIndex).toBe(0);

      // Simular par de stopwords ("de las") que aparecen más adelante
      component.currentWordIndex = 11;
      (component as any).confirmedWordIndex = 11;

      (component as any).processSpeechTokens({
        finalTokens: [],
        interimTokens: ['de', 'las'],
        candidateAlts: [],
        wordsSpokenCount: 2,
        currentWpm: 120,
      });

      // NO debe saltar a las palabras 27-29 (+18 palabras / 2-3 líneas)
      expect(component.currentWordIndex).toBe(11);
    });

    it('should mathematically limit single-word advance to at most 2 words', () => {
      component.currentWordIndex = 2; // palabra "altas"
      (component as any).confirmedWordIndex = 2;

      // El alumno lee la palabra contigua omitiendo 1 palabra ("cumbres")
      (component as any).processSpeechTokens({
        finalTokens: ['cumbres'],
        interimTokens: [],
        candidateAlts: [],
        wordsSpokenCount: 1,
        currentWpm: 100,
      });

      // El salto debe ser exactamente de 2 palabras (a índice 4: "de")
      expect(component.currentWordIndex).toBe(4);
    });

    it('should read smoothly through consecutive sentences without arbitrary line jumps', () => {
      component.currentWordIndex = 0;
      (component as any).confirmedWordIndex = 0;

      const sentence1 = ['en', 'las', 'altas', 'cumbres', 'de', 'la', 'sierra'];
      (component as any).processSpeechTokens({
        finalTokens: sentence1,
        interimTokens: [],
        candidateAlts: [],
        wordsSpokenCount: sentence1.length,
        currentWpm: 130,
      });
      expect(component.currentWordIndex).toBe(7);

      const sentence2 = ['de', 'las', 'minas', 'donde', 'la', 'niebla', 'danza'];
      (component as any).processSpeechTokens({
        finalTokens: [...sentence1, ...sentence2],
        interimTokens: [],
        candidateAlts: [],
        wordsSpokenCount: sentence1.length + sentence2.length,
        currentWpm: 130,
      });
      expect(component.currentWordIndex).toBe(14);
    });
  });
});
