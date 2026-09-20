import { TestBed } from '@angular/core/testing';
import {
  normalizeSpanishWord,
  toPhoneticKey,
  isPhoneticMatch,
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

    it('should advance when the first word is read', () => {
      // Simular que el estudiante dice "En las"
      (component as any).processSpeechTokens({
        finalTokens: [],
        interimTokens: ['en', 'las'],
        candidateAlts: [],
        wordsSpokenCount: 2,
        currentWpm: 100,
      });

      expect(component.currentWordIndex).toBe(2);
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
      expect(component.currentWordIndex).toBe(4);
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
      expect(component.currentWordIndex).toBe(4);

      // El estudiante sigue hablando continuamente sin pausa final: el búfer interino crece
      (component as any).processSpeechTokens({
        finalTokens: [],
        interimTokens: ['en', 'las', 'altas', 'cumbres', 'de', 'la', 'sierra', 'de', 'las', 'minas'],
        candidateAlts: [],
        wordsSpokenCount: 10,
        currentWpm: 125,
      });

      // Debe continuar avanzando hasta "minas" (índice 10), ¡NO congelarse en 4!
      expect(component.currentWordIndex).toBe(10);
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

      expect(component.currentWordIndex).toBe(4);
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
      expect(advanced).toBe(4);

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
      expect(component.currentWordIndex).toBe(component.totalWords);
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

      expect(component.currentWordIndex).toBe(4);
    });
  });
});
