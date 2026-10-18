export interface OptionItem {
  id: string;
  label: string; // 'A', 'B', 'C', 'D', etc.
  content: string;
}

export interface QuestionWarning {
  type: 'reference' | 'missing_key' | 'missing_options' | 'duplicate_options';
  message: string;
  suggestedAction?: 'lock_options' | 'set_key';
}

export interface Question {
  id: string;
  originalIndex: number; // 1-based
  content: string;
  options: OptionItem[];
  correctKeys: string[]; // e.g. ['A'] or ['A', 'C']
  lockQuestionPosition: boolean;
  lockOptionsShuffle: boolean;
  warnings: QuestionWarning[];
  passageGroup?: string; // If part of a shared reading passage
}

export interface ExamMetadata {
  schoolName: string;
  subject: string;
  grade: string;
  examTitle: string;
  durationMinutes: number;
  schoolYear: string;
  semester: string;
  teacherName?: string;
  showStudentInfoBox: boolean;
  fontSize: '12pt' | '13pt' | '14pt';
  fontFamily: 'Times New Roman' | 'Arial';
}

export interface OriginalExam {
  id: string;
  title: string;
  fileName: string;
  questions: Question[];
  importedAt: string;
  rawText?: string;
  metadata: ExamMetadata;
}

export interface ShuffledOption extends OptionItem {
  originalLabel: string; // The label it had in the original question
}

export interface ShuffledQuestion {
  id: string;
  originalId: string;
  originalIndex: number; // 1-based
  newIndex: number;      // 1-based
  content: string;
  options: ShuffledOption[];
  correctKeys: string[]; // Updated new keys (e.g. ['C'])
  originalCorrectKeys: string[]; // E.g. ['A']
  lockQuestionPosition: boolean;
  lockOptionsShuffle: boolean;
  warnings: QuestionWarning[];
  passageGroup?: string;
}

export interface ShuffledExam {
  code: string;
  questions: ShuffledQuestion[];
  answerKeyMap: Record<number, string>; // { 1: 'A', 2: 'C', ... }
  integrityCheckPassed: boolean;
  checksum: string;
}

export interface MixConfig {
  numCodes: number;
  codes: string[];
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  seed: number;
  preservePassageGroups: boolean;
}

export interface ConfirmedSession {
  confirmedAt: string;
  originalExam: OriginalExam;
  config: MixConfig;
  shuffledExams: ShuffledExam[];
  summary: {
    totalCodes: number;
    totalQuestions: number;
    shuffledQuestionsCount: number;
    lockedQuestionsCount: number;
    lockedOptionsCount: number;
    integrityVerified: boolean;
    unresolvedWarnings: number;
  };
}

export type AppStep = 'guide' | 'import' | 'review_original' | 'config' | 'review_shuffled' | 'confirmed';
