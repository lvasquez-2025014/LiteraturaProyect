import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx-js-style';
import { User, normalizeToAcademicCode } from '../models/user.model';
import { ClassroomActivity, ClassroomActivitySubmission } from '../models/classroom-activity.model';

export interface ExportFilterOptions {
  scope: 'all' | 'history' | 'activities';
  academicCode: string; // 'all' | 'PE4DM' | 'PE5DM' | 'PE6DM'
  section: string; // 'all' | 'A' | 'B' | ...
  activityId?: string; // 'all' o ID específico
  sortBy: 'name' | 'score' | 'code';
  sortOrder: 'asc' | 'desc';
  includeSummary: boolean;
}

export interface StudentExportRow {
  student: User;
  academicCode: string;
  section: string;
  carnet: string;
  name: string;
  email: string;
  completedReadings: number;
  comprehensionRate: number;
  wpm: number;
  activitiesCount: number;
  activitiesAvgScore: number;
  finalScore: number;
  status: string;
  pedagogicalNote: string;
}

// ==========================================
// PALETA DE ESTILOS: AZUL CLARO INSTITUCIONAL
// ==========================================
const BORDER_LIGHT = {
  top: { style: 'thin', color: { rgb: 'CBD5E1' } },
  bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
  left: { style: 'thin', color: { rgb: 'CBD5E1' } },
  right: { style: 'thin', color: { rgb: 'CBD5E1' } },
};

const BORDER_HEADER = {
  top: { style: 'thin', color: { rgb: 'ABC8E8' } },
  bottom: { style: 'medium', color: { rgb: '004AAD' } },
  left: { style: 'thin', color: { rgb: 'ABC8E8' } },
  right: { style: 'thin', color: { rgb: 'ABC8E8' } },
};

const STYLE_TITLE = {
  fill: { fgColor: { rgb: 'EBF3FC' } },
  font: { name: 'Calibri', sz: 14, bold: true, color: { rgb: '002D62' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: {
    top: { style: 'medium', color: { rgb: '004AAD' } },
    bottom: { style: 'thin', color: { rgb: 'ABC8E8' } },
    left: { style: 'medium', color: { rgb: '004AAD' } },
    right: { style: 'medium', color: { rgb: '004AAD' } },
  },
};

const STYLE_SUBTITLE = {
  fill: { fgColor: { rgb: 'EBF3FC' } },
  font: { name: 'Calibri', sz: 10, bold: false, color: { rgb: '284B73' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: {
    top: { style: 'thin', color: { rgb: 'ABC8E8' } },
    bottom: { style: 'medium', color: { rgb: '004AAD' } },
    left: { style: 'medium', color: { rgb: '004AAD' } },
    right: { style: 'medium', color: { rgb: '004AAD' } },
  },
};

const STYLE_HEADER = {
  fill: { fgColor: { rgb: 'D8E8F8' } },
  font: { name: 'Calibri', sz: 10.5, bold: true, color: { rgb: '002447' } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: BORDER_HEADER,
};

const STYLE_KEY_HEADER = {
  fill: { fgColor: { rgb: 'C2DCF5' } },
  font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '001D4A' } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: {
    top: { style: 'medium', color: { rgb: '004AAD' } },
    bottom: { style: 'medium', color: { rgb: '004AAD' } },
    left: { style: 'medium', color: { rgb: '004AAD' } },
    right: { style: 'medium', color: { rgb: '004AAD' } },
  },
};

// Celdas de datos con fondo blanco limpio para lectura sin distracciones
const STYLE_DATA_TEXT = {
  fill: { fgColor: { rgb: 'FFFFFF' } },
  font: { name: 'Calibri', sz: 10, color: { rgb: '1E293B' } },
  alignment: { horizontal: 'left', vertical: 'center' },
  border: BORDER_LIGHT,
};

const STYLE_DATA_CENTER = {
  fill: { fgColor: { rgb: 'FFFFFF' } },
  font: { name: 'Calibri', sz: 10, color: { rgb: '1E293B' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: BORDER_LIGHT,
};

const STYLE_DATA_FINAL_SCORE = {
  fill: { fgColor: { rgb: 'FFFFFF' } },
  font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '002D62' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: {
    top: { style: 'thin', color: { rgb: '93BBE5' } },
    bottom: { style: 'thin', color: { rgb: '93BBE5' } },
    left: { style: 'medium', color: { rgb: '004AAD' } },
    right: { style: 'medium', color: { rgb: '004AAD' } },
  },
};

// Tarjeta de Resumen Estadístico Institucional en Azul Claro
const STYLE_SUMMARY_BANNER = {
  fill: { fgColor: { rgb: 'D8E8F8' } },
  font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '002D62' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: {
    top: { style: 'medium', color: { rgb: '004AAD' } },
    bottom: { style: 'thin', color: { rgb: 'ABC8E8' } },
    left: { style: 'medium', color: { rgb: '004AAD' } },
    right: { style: 'medium', color: { rgb: '004AAD' } },
  },
};

const STYLE_SUMMARY_LABEL = {
  fill: { fgColor: { rgb: 'EBF3FC' } },
  font: { name: 'Calibri', sz: 10.5, bold: true, color: { rgb: '002D62' } },
  alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
  border: {
    top: { style: 'thin', color: { rgb: 'ABC8E8' } },
    bottom: { style: 'thin', color: { rgb: 'ABC8E8' } },
    left: { style: 'medium', color: { rgb: '004AAD' } },
    right: { style: 'thin', color: { rgb: 'ABC8E8' } },
  },
};

const STYLE_SUMMARY_VALUE = {
  fill: { fgColor: { rgb: 'FFFFFF' } },
  font: { name: 'Calibri', sz: 10.5, bold: true, color: { rgb: '002D62' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: {
    top: { style: 'thin', color: { rgb: 'ABC8E8' } },
    bottom: { style: 'thin', color: { rgb: 'ABC8E8' } },
    left: { style: 'thin', color: { rgb: 'ABC8E8' } },
    right: { style: 'medium', color: { rgb: '004AAD' } },
  },
};

@Injectable({
  providedIn: 'root',
})
export class ExcelExportService {
  /**
   * Genera y descarga el libro de Excel con diseño profesional, azul claro institucional,
   * y columnas dinámicamente estiradas para que todos los datos sean visibles al abrir el archivo.
   */
  exportToExcel(
    options: ExportFilterOptions,
    students: User[],
    activities: ClassroomActivity[],
  ): void {
    const wb = XLSX.utils.book_new();
    const timestampStr = this.getFormattedTimestamp();

    // 1. Filtrar y preparar estudiantes
    const processedStudents = this.processStudents(students, activities, options);

    // 2. Construir hojas según el alcance solicitado
    if (options.scope === 'all' || options.scope === 'history') {
      const summarySheet = this.buildSummarySheet(processedStudents, options, timestampStr);
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Cuadro Oficial de Notas');

      const historySheet = this.buildHistorySheet(processedStudents, options, timestampStr);
      XLSX.utils.book_append_sheet(wb, historySheet, 'Detalle Modo Historia');
    }

    if (options.scope === 'all' || options.scope === 'activities') {
      const activitiesSheet = this.buildActivitiesSheet(processedStudents, activities, options, timestampStr);
      XLSX.utils.book_append_sheet(wb, activitiesSheet, 'Actividades en Clase');
    }

    // 3. Generar nombre de archivo claro y pedagógico
    const codeTag = options.academicCode !== 'all' ? `_${options.academicCode}` : '_TODOS';
    const scopeTag = options.scope === 'all' ? 'Notas_Oficiales' : options.scope === 'history' ? 'Modo_Historia' : 'Actividades_Clase';
    const dateTag = new Date().toISOString().slice(0, 10);
    const fileName = `Kinal_Literatura_${scopeTag}${codeTag}_${dateTag}.xlsx`;

    // 4. Descargar archivo
    XLSX.writeFile(wb, fileName);
  }

  private processStudents(
    students: User[],
    activities: ClassroomActivity[],
    options: ExportFilterOptions,
  ): StudentExportRow[] {
    const rows: StudentExportRow[] = [];

    for (const student of students) {
      const rawGrade = student.grade || '';
      const academicCode = normalizeToAcademicCode(rawGrade) || 'PE4DM';
      const section = (student.section || 'D').toUpperCase();

      // Filtrado por Código Académico
      if (options.academicCode !== 'all') {
        const matchesCode =
          academicCode === options.academicCode ||
          rawGrade.toUpperCase().includes(options.academicCode);
        if (!matchesCode) continue;
      }

      // Filtrado por Sección
      if (options.section !== 'all') {
        if (section !== options.section.toUpperCase()) continue;
      }

      // Carnet institucional o derivado del correo
      const cleanEmail = (student.institutionalEmail || student.email || '').toLowerCase();
      const carnet = student.carnet || (cleanEmail.includes('@') ? cleanEmail.split('@')[0] : 'N/A');

      // Métricas de Modo Historia
      const completedReadings = student.stats?.completedReadings || 0;
      const comprehensionRate = student.stats?.comprehensionRate || 0;
      const wpm = student.stats?.averageWpm || 0;

      // Submisiones en Actividades de Clase
      const studentSubmissions: ClassroomActivitySubmission[] = [];
      for (const act of activities) {
        if (options.activityId && options.activityId !== 'all' && act.id !== options.activityId && (act as any)._id !== options.activityId) {
          continue;
        }
        const found = (act.submissions || []).filter(
          (s) =>
            s.studentId === student.id ||
            (s.studentEmail && s.studentEmail.toLowerCase() === cleanEmail) ||
            (s.studentName && s.studentName.toLowerCase().trim() === student.name.toLowerCase().trim()),
        );
        studentSubmissions.push(...found);
      }

      const activitiesCount = studentSubmissions.length;
      const activitiesAvgScore =
        activitiesCount > 0
          ? Math.round(studentSubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / activitiesCount)
          : 0;

      // Calificación final ponderada oficial sobre 100 puntos
      let finalScore = 0;
      if (completedReadings > 0 && activitiesCount > 0) {
        finalScore = Math.round(comprehensionRate * 0.5 + activitiesAvgScore * 0.5);
      } else if (completedReadings > 0) {
        finalScore = comprehensionRate;
      } else if (activitiesCount > 0) {
        finalScore = activitiesAvgScore;
      }

      // Estado académico
      let status = 'Sin Evaluación';
      if (completedReadings > 0 || activitiesCount > 0) {
        if (finalScore >= 80) status = 'Destacado';
        else if (finalScore >= 60) status = 'Aprobado';
        else status = 'En Riesgo';
      }

      // Recomendación Pedagógica breve y concisa para el profesor
      let pedagogicalNote = '';
      if (finalScore >= 80) {
        pedagogicalNote = 'Rendimiento destacado en fluidez y comprensión lectora.';
      } else if (finalScore >= 60) {
        pedagogicalNote = 'Aprobado. Se recomienda reforzar frecuencia de lectura.';
      } else if (completedReadings > 0 || activitiesCount > 0) {
        pedagogicalNote = 'Requiere refuerzo en técnicas de retención y comprensión.';
      } else {
        pedagogicalNote = 'Pendiente de registrar lecturas en el período.';
      }

      rows.push({
        student,
        academicCode,
        section,
        carnet,
        name: student.name,
        email: cleanEmail,
        completedReadings,
        comprehensionRate,
        wpm,
        activitiesCount,
        activitiesAvgScore,
        finalScore,
        status,
        pedagogicalNote,
      });
    }

    // Ordenamiento solicitado
    rows.sort((a, b) => {
      let comp = 0;
      if (options.sortBy === 'score') {
        comp = b.finalScore - a.finalScore;
      } else if (options.sortBy === 'code') {
        comp = a.academicCode.localeCompare(b.academicCode) || a.section.localeCompare(b.section) || a.name.localeCompare(b.name);
      } else {
        comp = a.name.localeCompare(b.name);
      }
      return options.sortOrder === 'desc' ? -comp : comp;
    });

    return rows;
  }

  /**
   * Construye la hoja principal "Cuadro Oficial de Notas":
   * Estructurada, espaciosa, con azul claro institucional y resumen perfectamente visible.
   */
  private buildSummarySheet(
    rows: StudentExportRow[],
    options: ExportFilterOptions,
    timestampStr: string,
  ): XLSX.WorkSheet {
    const ws: XLSX.WorkSheet = {};
    const totalCols = 12; // De Col A (0) a Col L (11)
    const merges: XLSX.Range[] = [];
    const rowHeights: { hpt: number }[] = [];

    // Fila 1: Título Institucional (combinado A1..L1)
    const titleText = 'COLEGIO KINAL — PLAN LECTOR DE LITERATURA';
    const subTitleText = `CUADRO OFICIAL DE CALIFICACIONES  |  CÓDIGO: ${options.academicCode !== 'all' ? options.academicCode : 'TODOS (PE4DM, PE5DM, PE6DM)'}  |  SECCIÓN: ${options.section !== 'all' ? options.section : 'TODAS'}  |  FECHA: ${timestampStr}`;

    for (let c = 0; c < totalCols; c++) {
      const cellRef1 = XLSX.utils.encode_cell({ r: 0, c });
      ws[cellRef1] = { v: c === 0 ? titleText : '', t: 's', s: STYLE_TITLE };

      const cellRef2 = XLSX.utils.encode_cell({ r: 1, c });
      ws[cellRef2] = { v: c === 0 ? subTitleText : '', t: 's', s: STYLE_SUBTITLE };
    }
    merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });
    merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } });
    rowHeights[0] = { hpt: 34 };
    rowHeights[1] = { hpt: 24 };

    // Fila 2 (índice 2): Fila vacía de separación y respiración visual
    rowHeights[2] = { hpt: 12 };

    // Fila 3 (índice 3): Encabezados de columnas
    const headers = [
      'No.',
      'Código Académico',
      'Sección',
      'No. Carnet',
      'Nombre y Apellido del Estudiante',
      'Correo Institucional',
      'Modo Historia (/100)',
      'Velocidad (PPM)',
      'Actividades en Clase (/100)',
      'NOTA FINAL (/100)',
      'Estado Académico',
      'Observaciones Pedagógicas',
    ];

    headers.forEach((h, c) => {
      const cellRef = XLSX.utils.encode_cell({ r: 3, c });
      const isKeyCol = c === 9; // NOTA FINAL
      ws[cellRef] = {
        v: h,
        t: 's',
        s: isKeyCol ? STYLE_KEY_HEADER : STYLE_HEADER,
      };
    });
    rowHeights[3] = { hpt: 32 };

    // Filas 4 en adelante: Datos de estudiantes (fondo blanco limpio)
    let currentRow = 4;
    const dataForWidthCalc: (string | number)[][] = [];

    rows.forEach((r, idx) => {
      const rowData = [
        { v: idx + 1, s: STYLE_DATA_CENTER, t: 'n' },
        { v: r.academicCode, s: STYLE_DATA_CENTER, t: 's' },
        { v: r.section, s: STYLE_DATA_CENTER, t: 's' },
        { v: r.carnet, s: STYLE_DATA_CENTER, t: 's' },
        { v: r.name, s: STYLE_DATA_TEXT, t: 's' },
        { v: r.email, s: STYLE_DATA_TEXT, t: 's' },
        { v: r.completedReadings > 0 ? r.comprehensionRate : 0, s: STYLE_DATA_CENTER, t: 'n' },
        { v: r.wpm, s: STYLE_DATA_CENTER, t: 'n' },
        { v: r.activitiesCount > 0 ? r.activitiesAvgScore : 0, s: STYLE_DATA_CENTER, t: 'n' },
        { v: r.finalScore, s: STYLE_DATA_FINAL_SCORE, t: 'n' },
        { v: r.status, s: STYLE_DATA_CENTER, t: 's' },
        { v: r.pedagogicalNote, s: STYLE_DATA_TEXT, t: 's' },
      ];

      dataForWidthCalc.push(rowData.map((d) => d.v));

      rowData.forEach((item, c) => {
        const cellRef = XLSX.utils.encode_cell({ r: currentRow, c });
        ws[cellRef] = { v: item.v, t: item.t, s: item.s };
      });
      rowHeights[currentRow] = { hpt: 24 };
      currentRow++;
    });

    // Resumen estadístico al pie (perfectamente combinado y visible de inmediato)
    if (options.includeSummary && rows.length > 0) {
      // 2 filas de separación para respiración visual
      rowHeights[currentRow] = { hpt: 14 };
      currentRow++;
      rowHeights[currentRow] = { hpt: 14 };
      currentRow++;

      const totalStudents = rows.length;
      const evaluatedStudents = rows.filter((r) => r.completedReadings > 0 || r.activitiesCount > 0);
      const approvedCount = rows.filter((r) => r.finalScore >= 60).length;
      const outstandingCount = rows.filter((r) => r.finalScore >= 80).length;
      const avgFinalScore =
        evaluatedStudents.length > 0
          ? Math.round(evaluatedStudents.reduce((acc, r) => acc + r.finalScore, 0) / evaluatedStudents.length)
          : 0;
      const avgWpm =
        evaluatedStudents.length > 0
          ? Math.round(evaluatedStudents.reduce((acc, r) => acc + r.wpm, 0) / evaluatedStudents.length)
          : 0;
      const approvalRate =
        evaluatedStudents.length > 0 ? Math.round((approvedCount / evaluatedStudents.length) * 100) : 0;

      // Banner del Resumen: Combinado de Columna B (1) a Columna G (6)
      const bannerRow = currentRow;
      for (let c = 1; c <= 6; c++) {
        const ref = XLSX.utils.encode_cell({ r: bannerRow, c });
        ws[ref] = {
          v: c === 1 ? 'RESUMEN ESTADÍSTICO INSTITUCIONAL · COLEGIO KINAL' : '',
          t: 's',
          s: STYLE_SUMMARY_BANNER,
        };
      }
      merges.push({ s: { r: bannerRow, c: 1 }, e: { r: bannerRow, c: 6 } });
      rowHeights[bannerRow] = { hpt: 28 };
      currentRow++;

      const stats = [
        ['Total de Estudiantes en Lista:', `${totalStudents} alumnos`],
        ['Estudiantes con Evaluaciones Realizadas:', `${evaluatedStudents.length} alumnos`],
        ['Alumnos Aprobados (≥ 60 pts):', `${approvedCount} alumnos (${approvalRate}%)`],
        ['Alumnos Destacados (≥ 80 pts):', `${outstandingCount} alumnos`],
        ['Promedio General de Calificación:', `${avgFinalScore} / 100 puntos`],
        ['Promedio de Velocidad Lectora:', `${avgWpm} PPM (Meta Kinal: 150 PPM)`],
      ];

      stats.forEach(([label, val]) => {
        const statRow = currentRow;
        // Columna B (1) a D (3) para la etiqueta (más de 52 caracteres de ancho: NUNCA se recorta)
        for (let c = 1; c <= 3; c++) {
          const ref = XLSX.utils.encode_cell({ r: statRow, c });
          ws[ref] = {
            v: c === 1 ? label : '',
            t: 's',
            s: STYLE_SUMMARY_LABEL,
          };
        }
        merges.push({ s: { r: statRow, c: 1 }, e: { r: statRow, c: 3 } });

        // Columna E (4) a G (6) para el valor (más de 100 caracteres de ancho)
        for (let c = 4; c <= 6; c++) {
          const ref = XLSX.utils.encode_cell({ r: statRow, c });
          ws[ref] = {
            v: c === 4 ? val : '',
            t: 's',
            s: STYLE_SUMMARY_VALUE,
          };
        }
        merges.push({ s: { r: statRow, c: 4 }, e: { r: statRow, c: 6 } });

        rowHeights[statRow] = { hpt: 25 };
        currentRow++;
      });
    }

    // Configuración de rangos y dimensiones
    ws['!ref'] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: Math.max(3, currentRow - 1), c: totalCols - 1 },
    });

    ws['!merges'] = merges;
    ws['!rows'] = rowHeights;

    // Anchos dinámicos con mínimos generosos para evitar CUALQUIER texto recortado
    const minWidths = [
      8,  // No.
      22, // Código Académico
      12, // Sección
      18, // No. Carnet
      40, // Nombre y Apellido del Estudiante
      36, // Correo Institucional
      24, // Modo Historia (/100)
      18, // Velocidad (PPM)
      28, // Actividades en Clase (/100)
      24, // NOTA FINAL (/100)
      20, // Estado Académico
      60, // Observaciones Pedagógicas (55+ caracteres visibles completos)
    ];

    ws['!cols'] = this.calculateColWidths(headers, dataForWidthCalc, minWidths);

    return ws;
  }

  /**
   * Construye la hoja "Detalle Modo Historia"
   */
  private buildHistorySheet(
    rows: StudentExportRow[],
    options: ExportFilterOptions,
    timestampStr: string,
  ): XLSX.WorkSheet {
    const ws: XLSX.WorkSheet = {};
    const totalCols = 11;
    const merges: XLSX.Range[] = [];
    const rowHeights: { hpt: number }[] = [];

    // Fila 1 y 2: Banners con Azul Claro
    const titleText = 'COLEGIO KINAL — MODO HISTORIA (PLAN LECTOR)';
    const subTitleText = `DETALLE DE LECTURAS INDIVIDUALES  |  CÓDIGO: ${options.academicCode !== 'all' ? options.academicCode : 'TODOS'}  |  FECHA: ${timestampStr}`;

    for (let c = 0; c < totalCols; c++) {
      const cellRef1 = XLSX.utils.encode_cell({ r: 0, c });
      ws[cellRef1] = { v: c === 0 ? titleText : '', t: 's', s: STYLE_TITLE };

      const cellRef2 = XLSX.utils.encode_cell({ r: 1, c });
      ws[cellRef2] = { v: c === 0 ? subTitleText : '', t: 's', s: STYLE_SUBTITLE };
    }
    merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });
    merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } });
    rowHeights[0] = { hpt: 34 };
    rowHeights[1] = { hpt: 24 };
    rowHeights[2] = { hpt: 12 };

    const headers = [
      'No.',
      'Código Académico',
      'Sección',
      'No. Carnet',
      'Estudiante',
      'Título de la Lectura',
      'Nivel',
      'Comprensión (/100)',
      'Velocidad (PPM)',
      'Fecha de Finalización',
      'Resultado',
    ];

    headers.forEach((h, c) => {
      const cellRef = XLSX.utils.encode_cell({ r: 3, c });
      const isKey = c === 7;
      ws[cellRef] = { v: h, t: 's', s: isKey ? STYLE_KEY_HEADER : STYLE_HEADER };
    });
    rowHeights[3] = { hpt: 32 };

    let currentRow = 4;
    let correlative = 1;
    const dataForWidthCalc: (string | number)[][] = [];

    for (const r of rows) {
      const history = r.student.readingHistory || [];
      if (history.length === 0) {
        const rowData = [
          { v: correlative++, s: STYLE_DATA_CENTER, t: 'n' },
          { v: r.academicCode, s: STYLE_DATA_CENTER, t: 's' },
          { v: r.section, s: STYLE_DATA_CENTER, t: 's' },
          { v: r.carnet, s: STYLE_DATA_CENTER, t: 's' },
          { v: r.name, s: STYLE_DATA_TEXT, t: 's' },
          { v: '(Sin lecturas realizadas)', s: STYLE_DATA_TEXT, t: 's' },
          { v: '-', s: STYLE_DATA_CENTER, t: 's' },
          { v: 0, s: STYLE_DATA_FINAL_SCORE, t: 'n' },
          { v: 0, s: STYLE_DATA_CENTER, t: 'n' },
          { v: '-', s: STYLE_DATA_CENTER, t: 's' },
          { v: 'Pendiente', s: STYLE_DATA_CENTER, t: 's' },
        ];
        dataForWidthCalc.push(rowData.map((d) => d.v));
        rowData.forEach((item, c) => {
          ws[XLSX.utils.encode_cell({ r: currentRow, c })] = { v: item.v, t: item.t, s: item.s };
        });
        rowHeights[currentRow] = { hpt: 24 };
        currentRow++;
      } else {
        for (const item of history) {
          const itemDate = new Date(item.completedAt);
          const dateStr = !isNaN(itemDate.getTime())
            ? itemDate.toLocaleDateString('es-GT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Reciente';

          let resultLabel = 'Aprobado';
          if (item.comprehensionScore >= 80) resultLabel = 'Excelente';
          else if (item.comprehensionScore < 60) resultLabel = 'Requiere Refuerzo';

          const rowData = [
            { v: correlative++, s: STYLE_DATA_CENTER, t: 'n' },
            { v: r.academicCode, s: STYLE_DATA_CENTER, t: 's' },
            { v: r.section, s: STYLE_DATA_CENTER, t: 's' },
            { v: r.carnet, s: STYLE_DATA_CENTER, t: 's' },
            { v: r.name, s: STYLE_DATA_TEXT, t: 's' },
            { v: item.readingTitle || `Lectura Nivel ${item.readingLevel || 1}`, s: STYLE_DATA_TEXT, t: 's' },
            { v: item.readingLevel || 1, s: STYLE_DATA_CENTER, t: 'n' },
            { v: item.comprehensionScore, s: STYLE_DATA_FINAL_SCORE, t: 'n' },
            { v: item.wpm, s: STYLE_DATA_CENTER, t: 'n' },
            { v: dateStr, s: STYLE_DATA_CENTER, t: 's' },
            { v: resultLabel, s: STYLE_DATA_CENTER, t: 's' },
          ];

          dataForWidthCalc.push(rowData.map((d) => d.v));
          rowData.forEach((it, c) => {
            ws[XLSX.utils.encode_cell({ r: currentRow, c })] = { v: it.v, t: it.t, s: it.s };
          });
          rowHeights[currentRow] = { hpt: 24 };
          currentRow++;
        }
      }
    }

    ws['!ref'] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: Math.max(3, currentRow - 1), c: totalCols - 1 },
    });

    ws['!merges'] = merges;
    ws['!rows'] = rowHeights;

    const minWidths = [
      8,  // No.
      22, // Código Académico
      12, // Sección
      18, // No. Carnet
      40, // Estudiante
      44, // Título de la Lectura
      12, // Nivel
      24, // Comprensión (/100)
      18, // PPM
      26, // Fecha
      20, // Resultado
    ];

    ws['!cols'] = this.calculateColWidths(headers, dataForWidthCalc, minWidths);

    return ws;
  }

  /**
   * Construye la hoja "Actividades en Clase"
   */
  private buildActivitiesSheet(
    rows: StudentExportRow[],
    activities: ClassroomActivity[],
    options: ExportFilterOptions,
    timestampStr: string,
  ): XLSX.WorkSheet {
    const ws: XLSX.WorkSheet = {};
    const totalCols = 14;
    const merges: XLSX.Range[] = [];
    const rowHeights: { hpt: number }[] = [];

    const titleText = 'COLEGIO KINAL — ACTIVIDADES EN CLASE (EVALUACIONES EN VIVO)';
    const subTitleText = `REGISTRO OFICIAL DE EVALUACIONES EN EL AULA  |  CÓDIGO: ${options.academicCode !== 'all' ? options.academicCode : 'TODOS'}  |  FECHA: ${timestampStr}`;

    for (let c = 0; c < totalCols; c++) {
      const cellRef1 = XLSX.utils.encode_cell({ r: 0, c });
      ws[cellRef1] = { v: c === 0 ? titleText : '', t: 's', s: STYLE_TITLE };

      const cellRef2 = XLSX.utils.encode_cell({ r: 1, c });
      ws[cellRef2] = { v: c === 0 ? subTitleText : '', t: 's', s: STYLE_SUBTITLE };
    }
    merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });
    merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } });
    rowHeights[0] = { hpt: 34 };
    rowHeights[1] = { hpt: 24 };
    rowHeights[2] = { hpt: 12 };

    const headers = [
      'No.',
      'Código Académico',
      'Sección',
      'No. Carnet',
      'Estudiante',
      'Actividad en Clase',
      'Lectura Asociada',
      'Calificación (/100)',
      'Aciertos',
      'Total Preguntas',
      'Tiempo de Lectura',
      'Velocidad (PPM)',
      'Micrófono',
      'Estado',
    ];

    headers.forEach((h, c) => {
      const cellRef = XLSX.utils.encode_cell({ r: 3, c });
      const isKey = c === 7;
      ws[cellRef] = { v: h, t: 's', s: isKey ? STYLE_KEY_HEADER : STYLE_HEADER };
    });
    rowHeights[3] = { hpt: 32 };

    let currentRow = 4;
    let correlative = 1;
    const dataForWidthCalc: (string | number)[][] = [];

    const targetActivities = activities.filter((act) => {
      if (options.activityId && options.activityId !== 'all') {
        return act.id === options.activityId || (act as any)._id === options.activityId;
      }
      return true;
    });

    for (const r of rows) {
      let foundAny = false;
      for (const act of targetActivities) {
        const studentSubs = (act.submissions || []).filter(
          (s) =>
            s.studentId === r.student.id ||
            (s.studentEmail && s.studentEmail.toLowerCase() === r.email.toLowerCase()) ||
            (s.studentName && s.studentName.toLowerCase().trim() === r.name.toLowerCase().trim()),
        );

        for (const sub of studentSubs) {
          foundAny = true;
          const mins = Math.floor((sub.timeSpentSeconds || 0) / 60);
          const secs = (sub.timeSpentSeconds || 0) % 60;
          const timeFormatted = `${mins}m ${secs.toString().padStart(2, '0')}s`;

          const rowData = [
            { v: correlative++, s: STYLE_DATA_CENTER, t: 'n' },
            { v: r.academicCode, s: STYLE_DATA_CENTER, t: 's' },
            { v: r.section, s: STYLE_DATA_CENTER, t: 's' },
            { v: r.carnet, s: STYLE_DATA_CENTER, t: 's' },
            { v: r.name, s: STYLE_DATA_TEXT, t: 's' },
            { v: act.title, s: STYLE_DATA_TEXT, t: 's' },
            { v: act.readingTitle || act.title, s: STYLE_DATA_TEXT, t: 's' },
            { v: sub.score, s: STYLE_DATA_FINAL_SCORE, t: 'n' },
            { v: sub.correctAnswersCount || 0, s: STYLE_DATA_CENTER, t: 'n' },
            { v: sub.totalQuestions || 0, s: STYLE_DATA_CENTER, t: 'n' },
            { v: timeFormatted, s: STYLE_DATA_CENTER, t: 's' },
            { v: sub.wpm || 0, s: STYLE_DATA_CENTER, t: 'n' },
            { v: sub.micUsed ? 'Sí (Oral)' : 'No (Silenciosa)', s: STYLE_DATA_CENTER, t: 's' },
            { v: sub.score >= 60 ? 'Aprobado' : 'No Aprobado', s: STYLE_DATA_CENTER, t: 's' },
          ];

          dataForWidthCalc.push(rowData.map((d) => d.v));
          rowData.forEach((it, c) => {
            ws[XLSX.utils.encode_cell({ r: currentRow, c })] = { v: it.v, t: it.t, s: it.s };
          });
          rowHeights[currentRow] = { hpt: 24 };
          currentRow++;
        }
      }

      if (!foundAny && options.scope === 'activities') {
        const rowData = [
          { v: correlative++, s: STYLE_DATA_CENTER, t: 'n' },
          { v: r.academicCode, s: STYLE_DATA_CENTER, t: 's' },
          { v: r.section, s: STYLE_DATA_CENTER, t: 's' },
          { v: r.carnet, s: STYLE_DATA_CENTER, t: 's' },
          { v: r.name, s: STYLE_DATA_TEXT, t: 's' },
          { v: '(Sin actividades entregadas)', s: STYLE_DATA_TEXT, t: 's' },
          { v: '-', s: STYLE_DATA_TEXT, t: 's' },
          { v: 0, s: STYLE_DATA_FINAL_SCORE, t: 'n' },
          { v: 0, s: STYLE_DATA_CENTER, t: 'n' },
          { v: 0, s: STYLE_DATA_CENTER, t: 'n' },
          { v: '-', s: STYLE_DATA_CENTER, t: 's' },
          { v: 0, s: STYLE_DATA_CENTER, t: 'n' },
          { v: '-', s: STYLE_DATA_CENTER, t: 's' },
          { v: 'Sin Entrega', s: STYLE_DATA_CENTER, t: 's' },
        ];
        dataForWidthCalc.push(rowData.map((d) => d.v));
        rowData.forEach((it, c) => {
          ws[XLSX.utils.encode_cell({ r: currentRow, c })] = { v: it.v, t: it.t, s: it.s };
        });
        rowHeights[currentRow] = { hpt: 24 };
        currentRow++;
      }
    }

    ws['!ref'] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: Math.max(3, currentRow - 1), c: totalCols - 1 },
    });

    ws['!merges'] = merges;
    ws['!rows'] = rowHeights;

    const minWidths = [
      8,  // No.
      22, // Código Académico
      12, // Sección
      18, // No. Carnet
      40, // Estudiante
      40, // Actividad
      40, // Lectura
      24, // Calificación (/100)
      14, // Aciertos
      18, // Total Preguntas
      20, // Tiempo
      18, // PPM
      18, // Micrófono
      20, // Estado
    ];

    ws['!cols'] = this.calculateColWidths(headers, dataForWidthCalc, minWidths);

    return ws;
  }

  /**
   * Calcula el ancho óptimo de cada columna asegurando que ningún texto quede cortado
   * y que al abrir Excel todo esté visible y espacioso de forma natural.
   */
  private calculateColWidths(
    headers: string[],
    dataRows: (string | number)[][],
    minWidths: number[],
  ): { wch: number }[] {
    return headers.map((header, c) => {
      let maxLen = header ? header.length : 10;
      for (const row of dataRows) {
        if (row && row[c] !== undefined && row[c] !== null) {
          const str = String(row[c]);
          if (str.length > maxLen) {
            maxLen = str.length;
          }
        }
      }
      const minW = minWidths[c] || 16;
      // Colchón de 4 caracteres de holgura para evitar cualquier rozamiento con bordes
      const calculated = Math.max(minW, maxLen + 4);
      return { wch: calculated };
    });
  }

  private getFormattedTimestamp(): string {
    const now = new Date();
    return now.toLocaleDateString('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
