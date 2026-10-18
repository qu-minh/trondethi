import React, { useState } from 'react';
import { Header } from './components/Header';
import { StepGuide } from './components/StepGuide';
import { StepImport } from './components/StepImport';
import { StepReviewOriginal } from './components/StepReviewOriginal';
import { StepConfig } from './components/StepConfig';
import { StepReviewShuffled } from './components/StepReviewShuffled';
import { StepConfirmedDownload } from './components/StepConfirmedDownload';
import type { AppStep, OriginalExam, MixConfig, ShuffledExam, ConfirmedSession, ExamMetadata } from './types/exam';
import { parsePlainText, getSampleTaggedExamText } from './utils/parser';
import { mixExam } from './utils/mixer';

export const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('guide');
  const [originalExam, setOriginalExam] = useState<OriginalExam | null>(null);
  const [mixConfig, setMixConfig] = useState<MixConfig | null>(null);
  const [shuffledExams, setShuffledExams] = useState<ShuffledExam[]>([]);
  const [confirmedSession, setConfirmedSession] = useState<ConfirmedSession | null>(null);

  // Check which steps can be accessed
  const canNavigateTo = (step: AppStep): boolean => {
    switch (step) {
      case 'guide':
      case 'import':
        return true;
      case 'review_original':
        return !!originalExam;
      case 'config':
        return !!originalExam;
      case 'review_shuffled':
        return shuffledExams.length > 0;
      case 'confirmed':
        return !!confirmedSession;
      default:
        return false;
    }
  };

  // 1. Load sample exam directly (1-click trial)
  const handleLoadSampleExam = () => {
    const sampleText = getSampleTaggedExamText();
    const questions = parsePlainText(sampleText);

    const defaultMetadata: ExamMetadata = {
      schoolName: 'TRƯỜNG THPT NGUYỄN TRÃI',
      subject: 'KHOA HỌC TỰ NHIÊN & XÃ HỘI',
      grade: '12',
      examTitle: 'ĐỀ THI KHẢO SÁT CHẤT LƯỢNG HỌC KỲ I',
      durationMinutes: 45,
      schoolYear: '2026 - 2027',
      semester: 'Học kỳ I',
      teacherName: 'Tổ Chuyên Môn',
      showStudentInfoBox: true,
      fontSize: '12pt',
      fontFamily: 'Times New Roman',
    };

    const exam: OriginalExam = {
      id: `sample-${Date.now()}`,
      title: 'Đề thi mẫu chuẩn',
      fileName: 'de_thi_mau_chuan.docx',
      questions,
      importedAt: new Date().toISOString(),
      rawText: sampleText,
      metadata: defaultMetadata,
    };

    setOriginalExam(exam);
    setShuffledExams([]);
    setConfirmedSession(null);
    setCurrentStep('review_original');
  };

  // 2. Exam imported from file or paste
  const handleExamImported = (exam: OriginalExam) => {
    setOriginalExam(exam);
    setShuffledExams([]);
    setConfirmedSession(null);
    setCurrentStep('review_original');
  };

  // 3. Update original exam questions/options
  const handleUpdateExam = (updated: OriginalExam) => {
    setOriginalExam(updated);
    // If exam changed after confirmation, invalidate confirmed session
    if (confirmedSession) {
      setConfirmedSession(null);
    }
  };

  // 4. Proceed from review original to config
  const handleProceedToConfig = () => {
    setCurrentStep('config');
  };

  // 5. Start Mixing
  const handleStartMixing = (config: MixConfig, updatedMetadata: ExamMetadata) => {
    if (!originalExam) return;

    // Update metadata if changed in config
    const updatedExam: OriginalExam = {
      ...originalExam,
      metadata: updatedMetadata,
    };
    setOriginalExam(updatedExam);
    setMixConfig(config);

    // Run mixing engine
    const results = mixExam(updatedExam.questions, config);
    setShuffledExams(results);
    setConfirmedSession(null);
    setCurrentStep('review_shuffled');
  };

  // 6. Re-mix with current config
  const handleReMix = () => {
    if (!originalExam || !mixConfig) return;
    const newConfig: MixConfig = {
      ...mixConfig,
      seed: Math.floor(Math.random() * 100000),
    };
    setMixConfig(newConfig);
    const results = mixExam(originalExam.questions, newConfig);
    setShuffledExams(results);
    setConfirmedSession(null);
  };

  // 7. Confirm Shuffled Exam
  const handleConfirmExam = () => {
    if (!originalExam || !mixConfig || shuffledExams.length === 0) return;

    const totalQuestions = originalExam.questions.length;
    const lockedQuestionsCount = originalExam.questions.filter((q) => q.lockQuestionPosition).length;
    const lockedOptionsCount = originalExam.questions.filter((q) => q.lockOptionsShuffle).length;
    const unresolvedWarnings = originalExam.questions.reduce((acc, q) => acc + q.warnings.length, 0);

    const session: ConfirmedSession = {
      confirmedAt: new Date().toISOString(),
      originalExam,
      config: mixConfig,
      shuffledExams,
      summary: {
        totalCodes: shuffledExams.length,
        totalQuestions,
        shuffledQuestionsCount: totalQuestions - lockedQuestionsCount,
        lockedQuestionsCount,
        lockedOptionsCount,
        integrityVerified: shuffledExams.every((e) => e.integrityCheckPassed),
        unresolvedWarnings,
      },
    };

    setConfirmedSession(session);
    setCurrentStep('confirmed');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      <Header
        currentStep={currentStep}
        onNavigateStep={(step) => setCurrentStep(step)}
        canNavigateTo={canNavigateTo}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-16">
        {currentStep === 'guide' && (
          <StepGuide
            onLoadSampleExam={handleLoadSampleExam}
            onGoToImport={() => setCurrentStep('import')}
          />
        )}

        {currentStep === 'import' && (
          <StepImport
            onExamImported={handleExamImported}
            onLoadSample={handleLoadSampleExam}
          />
        )}

        {currentStep === 'review_original' && originalExam && (
          <StepReviewOriginal
            originalExam={originalExam}
            onUpdateExam={handleUpdateExam}
            onProceedToConfig={handleProceedToConfig}
          />
        )}

        {currentStep === 'config' && originalExam && (
          <StepConfig
            originalExam={originalExam}
            onStartMixing={handleStartMixing}
            onBackToReviewOriginal={() => setCurrentStep('review_original')}
          />
        )}

        {currentStep === 'review_shuffled' && originalExam && mixConfig && (
          <StepReviewShuffled
            shuffledExams={shuffledExams}
            originalExam={originalExam}
            config={mixConfig}
            onConfirmExam={handleConfirmExam}
            onBackToConfig={() => setCurrentStep('config')}
            onReMix={handleReMix}
          />
        )}

        {currentStep === 'confirmed' && confirmedSession && (
          <StepConfirmedDownload
            session={confirmedSession}
            onModifyExam={() => setCurrentStep('review_shuffled')}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Hệ thống Trộn đề thi Trắc nghiệm Online dành cho Giáo viên</span>
          <span className="text-slate-400">Bảo toàn cấu trúc & Chống sai lệch đáp án tuyệt đối</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
