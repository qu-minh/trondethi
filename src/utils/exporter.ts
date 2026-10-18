import { Document, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle, Packer } from 'docx';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { ShuffledExam, ExamMetadata } from '../types/exam';

/**
 * Build standard Vietnamese School Exam Header in Word
 */
function createExamHeader(metadata: ExamMetadata, code: string): Paragraph[] {
  return [
    // Top Row: School & Ministry
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: (metadata.schoolName || 'SỞ GD&ĐT ... - TRƯỜNG THPT ...').toUpperCase(),
          bold: true,
          size: 24, // 12pt
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: (metadata.examTitle || 'ĐỀ THI KIỂM TRA CHẤT LƯỢNG').toUpperCase(),
          bold: true,
          size: 26, // 13pt
        }),
      ],
      spacing: { after: 40 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Môn: ${metadata.subject || 'Toán học'} - Khối / Lớp: ${metadata.grade || '12'} | Thời gian làm bài: ${metadata.durationMinutes || 45} phút`,
          italics: true,
          size: 22,
        }),
      ],
      spacing: { after: 120 },
    }),
    // Code highlight
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: `MÃ ĐỀ THI: ${code}`,
          bold: true,
          size: 24,
        }),
      ],
      spacing: { after: 120 },
    }),
    // Student Info line
    metadata.showStudentInfoBox
      ? new Paragraph({
          children: [
            new TextRun({
              text: 'Họ và tên thí sinh: ............................................................................  Số báo danh: ...................  Lớp: .........',
              italics: true,
              size: 20,
            }),
          ],
          spacing: { after: 200 },
        })
      : new Paragraph({ children: [] }),
    // Divider
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '-------------------------------------------------------------------------------------------------',
          size: 16,
          color: '888888',
        }),
      ],
      spacing: { after: 200 },
    }),
  ];
}

/**
 * Generate a single Exam DOCX
 */
export async function generateExamDocxBlob(
  exam: ShuffledExam,
  metadata: ExamMetadata,
  includeAnswersAtEnd: boolean = false
): Promise<Blob> {
  const children: Paragraph[] = [...createExamHeader(metadata, exam.code)];

  // Questions
  exam.questions.forEach((q) => {
    // Question title
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Câu ${q.newIndex}: `,
            bold: true,
            size: 24,
          }),
          new TextRun({
            text: q.content,
            size: 24,
          }),
        ],
        spacing: { before: 160, after: 80 },
      })
    );

    // Options
    q.options.forEach((opt) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `   ${opt.label}. `,
              bold: true,
              size: 24,
            }),
            new TextRun({
              text: opt.content,
              size: 24,
            }),
          ],
          indent: { left: 360 },
          spacing: { after: 40 },
        })
      );
    });
  });

  // End of test note
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '--- HẾT ---',
          bold: true,
          size: 22,
        }),
      ],
      spacing: { before: 300, after: 200 },
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '(Cán bộ coi thi không giải thích gì thêm)',
          italics: true,
          size: 20,
        }),
      ],
      spacing: { after: 300 },
    })
  );

  // Optional Answer Sheet appended at the end
  if (includeAnswersAtEnd) {
    children.push(
      new Paragraph({
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: `ĐÁP ÁN MÃ ĐỀ ${exam.code}`,
            bold: true,
            size: 26,
          }),
        ],
        spacing: { after: 150 },
      })
    );

    exam.questions.forEach((q) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Câu ${q.newIndex}: `,
              bold: true,
            }),
            new TextRun({
              text: `${q.correctKeys.join(', ')}`,
              bold: true,
              color: '0066CC',
            }),
          ],
          spacing: { after: 40 },
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              right: 1000,
              bottom: 1000,
              left: 1000,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Generate Answer Key DOCX for all exam codes
 */
export async function generateAnswersDocxBlob(
  exams: ShuffledExam[],
  metadata: ExamMetadata
): Promise<Blob> {
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: (metadata.schoolName || 'SỞ GD&ĐT ... - TRƯỜNG THPT ...').toUpperCase(),
          bold: true,
          size: 22,
        }),
      ],
      spacing: { after: 40 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `BẢNG TỔNG HỢP ĐÁP ÁN - ${metadata.subject || 'MÔN THI'}`,
          bold: true,
          size: 26,
        }),
      ],
      spacing: { after: 160 },
    }),
  ];

  // Create Answer Table
  // Header: Câu | Mã 101 | Mã 102 | ...
  const numQuestions = exams[0]?.questions.length || 0;

  const headerCells = [
    new TableCell({
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Câu', bold: true })] })],
      width: { size: 1200, type: WidthType.DXA },
    }),
    ...exams.map(
      (e) =>
        new TableCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Mã ${e.code}`, bold: true })] })],
          width: { size: 1800, type: WidthType.DXA },
        })
    ),
  ];

  const tableRows: TableRow[] = [
    new TableRow({
      children: headerCells,
      tableHeader: true,
    }),
  ];

  for (let qNum = 1; qNum <= numQuestions; qNum++) {
    const rowCells = [
      new TableCell({
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${qNum}`, bold: true })] })],
      }),
      ...exams.map((e) => {
        const key = e.answerKeyMap[qNum] || '';
        return new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: key, bold: true, color: '003399' })],
            }),
          ],
        });
      }),
    ];
    tableRows.push(new TableRow({ children: rowCells }));
  }

  const table = new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: '888888' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '888888' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '888888' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '888888' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    },
  });

  children.push(table);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Generate Excel Answer Key Matrix
 */
export function generateExcelAnswerKeyBlob(
  exams: ShuffledExam[],
  metadata: ExamMetadata
): Blob {
  const wb = XLSX.utils.book_new();

  // 1. Matrix Sheet: Row = Question (1..N), Col = Exam Code
  const matrixData: (string | number)[][] = [];

  // Title rows
  matrixData.push([`BẢNG ĐÁP ÁN TỔNG HỢP - ${metadata.subject || 'MÔN THI'}`]);
  matrixData.push([`Trường: ${metadata.schoolName || ''}`, `Thời gian: ${metadata.durationMinutes} phút`]);
  matrixData.push([]); // blank

  // Header
  const headers = ['Câu hỏi', ...exams.map((e) => `Mã đề ${e.code}`)];
  matrixData.push(headers);

  const numQuestions = exams[0]?.questions.length || 0;
  for (let q = 1; q <= numQuestions; q++) {
    const row: (string | number)[] = [q];
    for (const exam of exams) {
      row.push(exam.answerKeyMap[q] || '');
    }
    matrixData.push(row);
  }

  const wsMatrix = XLSX.utils.aoa_to_sheet(matrixData);
  XLSX.utils.book_append_sheet(wb, wsMatrix, 'Đáp Án Ma Trận');

  // 2. Horizontal Sheet (Standard for Optical Mark Readers / OMR):
  // Rows: Mã đề | 1 | 2 | 3 | 4 ...
  const omrData: (string | number)[][] = [];
  const omrHeaders = ['Mã đề', ...Array.from({ length: numQuestions }, (_, i) => `Câu ${i + 1}`)];
  omrData.push(omrHeaders);

  for (const exam of exams) {
    const row: (string | number)[] = [exam.code];
    for (let q = 1; q <= numQuestions; q++) {
      row.push(exam.answerKeyMap[q] || '');
    }
    omrData.push(row);
  }

  const wsOMR = XLSX.utils.aoa_to_sheet(omrData);
  XLSX.utils.book_append_sheet(wb, wsOMR, 'Đáp Án Chấm Thi OMR');

  // Write to ArrayBuffer
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Generate full ZIP package
 */
export async function generateZipPackage(
  exams: ShuffledExam[],
  metadata: ExamMetadata
): Promise<Blob> {
  const zip = new JSZip();

  // 1. Add each exam docx
  for (const exam of exams) {
    const examBlob = await generateExamDocxBlob(exam, metadata, false);
    zip.file(`De_thi_ma_${exam.code}.docx`, examBlob);
  }

  // 2. Add Excel answers
  const excelBlob = generateExcelAnswerKeyBlob(exams, metadata);
  zip.file(`Dap_an_tong_hop.xlsx`, excelBlob);

  // 3. Add Word answers
  const answersDocxBlob = await generateAnswersDocxBlob(exams, metadata);
  zip.file(`Dap_an.docx`, answersDocxBlob);

  // 4. Generate zip blob
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Create a downloadable sample .docx file
 */
export async function createSampleDocxBlob(sampleExamText: string): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'TRƯỜNG THPT MẪU - ĐỀ THI MINH HỌA',
                bold: true,
                size: 26,
              }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '(Định dạng chuẩn tích hợp thẻ [MIX:...])',
                italics: true,
                size: 20,
              }),
            ],
            spacing: { after: 200 },
          }),
          ...sampleExamText.split('\n').map(
            (line) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    bold: line.startsWith('[MIX:Q]') || line.startsWith('Câu'),
                    color: line.startsWith('[MIX:') ? '0066CC' : '000000',
                  }),
                ],
                spacing: { after: line === '' ? 100 : 30 },
              })
          ),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Trigger download of any blob in browser
 */
export function downloadFile(blob: Blob, fileName: string) {
  saveAs(blob, fileName);
}
