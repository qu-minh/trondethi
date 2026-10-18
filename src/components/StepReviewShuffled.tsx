import React, { useState } from 'react';
import { 
  Eye, CheckCircle2, FileText, ArrowRight, ArrowLeft, RotateCw, GitCompare, 
  ShieldCheck, Printer
} from 'lucide-react';
import type { ShuffledExam, OriginalExam, MixConfig } from '../types/exam';

interface StepReviewShuffledProps {
  shuffledExams: ShuffledExam[];
  originalExam: OriginalExam;
  config: MixConfig;
  onConfirmExam: () => void;
  onBackToConfig: () => void;
  onReMix: () => void;
}

export const StepReviewShuffled: React.FC<StepReviewShuffledProps> = ({
  shuffledExams,
  originalExam,
  onConfirmExam,
  onBackToConfig,
  onReMix,
}) => {
  const [selectedCode, setSelectedCode] = useState<string>(shuffledExams[0]?.code || '');
  const [viewMode, setViewMode] = useState<'student' | 'teacher_answers' | 'compare'>('teacher_answers');

  const currentExam = shuffledExams.find((e) => e.code === selectedCode) || shuffledExams[0];

  if (!currentExam) {
    return <div>Không tìm thấy dữ liệu mã đề.</div>;
  }

  // Answer key summary table for quick scanning
  const answerEntries = Object.entries(currentExam.answerKeyMap).map(([qNum, key]) => ({
    num: parseInt(qNum, 10),
    key,
  }));

  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      {/* Top Banner / Heading */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Đã hoàn tất trộn đề & tự động đối chiếu đáp án
              </span>
              <span className="text-xs text-slate-400">Đã tạo {shuffledExams.length} mã đề</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Review kết quả các mã đề thi đã trộn
            </h2>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onBackToConfig}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sửa cấu hình</span>
            </button>
            <button
              onClick={onReMix}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            >
              <RotateCw className="w-4 h-4" />
              <span>Trộn lại</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>In mã đề này</span>
            </button>
            <button
              onClick={onConfirmExam}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác nhận đề đã trộn</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Exam Code Tabs */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
              Chọn mã đề xem:
            </span>
            {shuffledExams.map((exam) => {
              const isSelected = exam.code === selectedCode;
              return (
                <button
                  key={exam.code}
                  onClick={() => setSelectedCode(exam.code)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Mã đề {exam.code}
                </button>
              );
            })}
          </div>

          {/* View Mode Switcher */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs shrink-0">
            <button
              onClick={() => setViewMode('student')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'student' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Xem đề học sinh</span>
            </button>
            <button
              onClick={() => setViewMode('teacher_answers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'teacher_answers' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem kèm đáp án</span>
            </button>
            <button
              onClick={() => setViewMode('compare')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'compare' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Đối chiếu đề gốc</span>
            </button>
          </div>
        </div>
      </div>

      {/* Answer Key Quick Scan Strip */}
      {viewMode !== 'student' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Bảng đáp án nhanh mã đề {currentExam.code}:</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Tổng số: {currentExam.questions.length} câu
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
            {answerEntries.map((item) => (
              <div
                key={item.num}
                className="px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <span className="text-slate-500">{item.num}:</span>
                <span className="text-blue-700 font-bold">{item.key}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paper Header Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* School & Subject Header */}
        <div className="text-center pb-6 border-b border-slate-200 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
            {originalExam.metadata.schoolName}
          </div>
          <h1 className="text-lg sm:text-xl font-bold uppercase text-slate-900">
            {originalExam.metadata.examTitle}
          </h1>
          <div className="text-xs italic text-slate-600">
            Môn: {originalExam.metadata.subject} — Khối {originalExam.metadata.grade} | Thời gian: {originalExam.metadata.durationMinutes} phút
          </div>
          <div className="pt-2 flex justify-end">
            <div className="px-3 py-1 bg-slate-900 text-white font-bold text-xs rounded-md">
              MÃ ĐỀ THI: {currentExam.code}
            </div>
          </div>
          {originalExam.metadata.showStudentInfoBox && (
            <div className="pt-3 text-left text-xs italic text-slate-500 border-t border-dashed border-slate-200 mt-2">
              Họ và tên thí sinh: .................................................................................... Số báo danh: ....................... Lớp: .............
            </div>
          )}
        </div>

        {/* Student View Warning Notice */}
        {viewMode === 'student' && (
          <div className="p-3 rounded-xl bg-slate-100 text-slate-600 text-xs text-center border border-slate-200">
            Đang ở <strong>Chế độ Xem đề thi học sinh</strong>: Không hiển thị màu sắc hoặc ký hiệu làm lộ đáp án đúng.
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-6">
          {currentExam.questions.map((q) => {
            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border transition-all ${
                  viewMode === 'compare'
                    ? 'bg-indigo-50/30 border-indigo-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Comparison Banner if in Compare Mode */}
                {viewMode === 'compare' && (
                  <div className="mb-3 pb-2 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-900">
                        Đối chiếu: Câu {q.newIndex} (Mã {currentExam.code})
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="px-2 py-0.5 rounded bg-white border border-indigo-200 text-indigo-700 font-semibold">
                        Gốc là Câu {q.originalIndex}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Đáp án gốc:</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 font-bold text-slate-800">
                        {q.originalCorrectKeys.join(',')}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="text-slate-600">Đáp án mới:</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-600 font-bold text-white">
                        {q.correctKeys.join(',')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Question title */}
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-sm text-slate-900 shrink-0">
                    Câu {q.newIndex}:
                  </span>
                  <div className="text-sm text-slate-800 leading-relaxed font-normal flex-1">
                    {q.content}
                  </div>
                </div>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 pl-2 sm:pl-4">
                  {q.options.map((opt) => {
                    const isCorrect = q.correctKeys.includes(opt.label);
                    const showCorrectHighlight = viewMode !== 'student' && isCorrect;

                    return (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-lg border text-xs sm:text-sm flex items-start gap-2.5 transition-all ${
                          showCorrectHighlight
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium ring-1 ring-emerald-200'
                            : 'bg-slate-50/50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 ${
                            showCorrectHighlight
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-white border border-slate-300 text-slate-700'
                          }`}
                        >
                          {opt.label}
                        </span>

                        <span className="leading-relaxed flex-1">
                          {opt.content}
                        </span>

                        {/* If in compare mode, show what original label this option was */}
                        {viewMode === 'compare' && (
                          <span className="text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                            (Gốc: {opt.originalLabel})
                          </span>
                        )}

                        {showCorrectHighlight && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                            Đáp án đúng
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer of exam */}
        <div className="text-center pt-6 border-t border-slate-200 text-xs text-slate-500">
          <p className="font-bold text-slate-700">--- HẾT ---</p>
          <p className="italic mt-1">(Cán bộ coi thi không giải thích gì thêm)</p>
        </div>
      </div>

      {/* Confirmation Callout Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>Thầy cô đã kiểm tra xong toàn bộ nội dung?</span>
          </h3>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            Bấm "Xác nhận đề đã trộn" để khóa phiên bản này và mở khu vực tải trọn bộ file Word (.docx), file Excel đáp án (.xlsx) và file nén (.zip).
          </p>
        </div>

        <button
          onClick={onConfirmExam}
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-md hover:bg-emerald-50 transition-all active:scale-95"
        >
          <span>Xác nhận đề đã trộn & Tải về</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
