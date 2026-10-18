import React, { useState } from 'react';
import { 
  AlertTriangle, Lock, Unlock, Shuffle, ChevronDown, ChevronUp, 
  Edit3, Trash2, Plus, ArrowRight, ShieldAlert, Filter
} from 'lucide-react';
import type { OriginalExam, Question } from '../types/exam';

interface StepReviewOriginalProps {
  originalExam: OriginalExam;
  onUpdateExam: (updated: OriginalExam) => void;
  onProceedToConfig: () => void;
}

export const StepReviewOriginal: React.FC<StepReviewOriginalProps> = ({
  originalExam,
  onUpdateExam,
  onProceedToConfig,
}) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    // Expand first 5 by default
    const map: Record<string, boolean> = {};
    originalExam.questions.forEach((q, i) => {
      map[q.id] = i < 5 || q.warnings.length > 0;
    });
    return map;
  });

  const [filterMode, setFilterMode] = useState<'all' | 'warnings' | 'locked'>('all');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [hasConfirmedBypassWarnings, setHasConfirmedBypassWarnings] = useState(false);

  const questions = originalExam.questions;

  // Statistics
  const totalQuestions = questions.length;
  const questionsWithWarnings = questions.filter((q) => q.warnings.length > 0);
  const questionsMissingKey = questions.filter((q) => q.correctKeys.length === 0);
  const questionsWithReference = questions.filter((q) => q.warnings.some((w) => w.type === 'reference'));
  const lockedPositionCount = questions.filter((q) => q.lockQuestionPosition).length;
  const lockedOptionsCount = questions.filter((q) => q.lockOptionsShuffle).length;

  // Toggle expand
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const map: Record<string, boolean> = {};
    questions.forEach((q) => (map[q.id] = true));
    setExpandedIds(map);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  // Update a single question
  const updateQuestion = (updatedQ: Question) => {
    const newQuestions = questions.map((q) => (q.id === updatedQ.id ? updatedQ : q));
    onUpdateExam({
      ...originalExam,
      questions: newQuestions,
    });
  };

  // Toggle lock position
  const toggleLockPosition = (q: Question) => {
    updateQuestion({
      ...q,
      lockQuestionPosition: !q.lockQuestionPosition,
    });
  };

  // Toggle lock options
  const toggleLockOptions = (q: Question) => {
    updateQuestion({
      ...q,
      lockOptionsShuffle: !q.lockOptionsShuffle,
    });
  };

  // Set correct key
  const toggleCorrectKey = (q: Question, label: string) => {
    let newKeys: string[];
    if (q.correctKeys.includes(label)) {
      newKeys = q.correctKeys.filter((k) => k !== label);
    } else {
      newKeys = [...q.correctKeys, label].sort();
    }

    // Recheck warnings
    const updatedWarnings = q.warnings.filter((w) => w.type !== 'missing_key');
    if (newKeys.length === 0) {
      updatedWarnings.push({
        type: 'missing_key',
        message: 'Chưa có đáp án đúng cho câu này.',
        suggestedAction: 'set_key',
      });
    }

    updateQuestion({
      ...q,
      correctKeys: newKeys,
      warnings: updatedWarnings,
    });
  };

  // Lock options quick action for reference warnings
  const handleAutoLockReferenceQuestions = () => {
    const newQuestions = questions.map((q) => {
      const hasRef = q.warnings.some((w) => w.type === 'reference');
      if (hasRef) {
        return { ...q, lockOptionsShuffle: true };
      }
      return q;
    });
    onUpdateExam({ ...originalExam, questions: newQuestions });
  };

  // Delete question
  const handleDeleteQuestion = (id: string) => {
    if (window.confirm('Thầy cô có chắc chắn muốn xóa câu hỏi này khỏi đề thi không?')) {
      const filtered = questions.filter((q) => q.id !== id);
      // Renumber
      filtered.forEach((q, idx) => (q.originalIndex = idx + 1));
      onUpdateExam({ ...originalExam, questions: filtered });
    }
  };

  // Add new question
  const handleAddNewQuestion = () => {
    const newIdx = questions.length + 1;
    const newQ: Question = {
      id: `q-${Date.now()}-${newIdx}`,
      originalIndex: newIdx,
      content: 'Nhập nội dung câu hỏi mới vào đây...',
      options: [
        { id: `opt-${newIdx}-A`, label: 'A', content: 'Phương án A' },
        { id: `opt-${newIdx}-B`, label: 'B', content: 'Phương án B' },
        { id: `opt-${newIdx}-C`, label: 'C', content: 'Phương án C' },
        { id: `opt-${newIdx}-D`, label: 'D', content: 'Phương án D' },
      ],
      correctKeys: ['A'],
      lockQuestionPosition: false,
      lockOptionsShuffle: false,
      warnings: [],
    };
    onUpdateExam({
      ...originalExam,
      questions: [...questions, newQ],
    });
    setExpandedIds((prev) => ({ ...prev, [newQ.id]: true }));
    setEditingQuestionId(newQ.id);
  };

  // Filtered list
  const filteredQuestions = questions.filter((q) => {
    if (filterMode === 'warnings') return q.warnings.length > 0;
    if (filterMode === 'locked') return q.lockQuestionPosition || q.lockOptionsShuffle;
    return true;
  });

  // Critical error check
  const hasCriticalErrors = questionsMissingKey.length > 0;
  const canProceed = !hasCriticalErrors || hasConfirmedBypassWarnings;

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      {/* Title & Stats Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Đề gốc đã nhận diện
              </span>
              <span className="text-xs text-slate-400">File: {originalExam.fileName}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {originalExam.metadata.examTitle || 'Đề kiểm tra trắc nghiệm'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddNewQuestion}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            >
              <Plus className="w-4 h-4 text-slate-600" />
              <span>Thêm câu hỏi</span>
            </button>
            <button
              onClick={onProceedToConfig}
              disabled={!canProceed}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Kiểm tra đề gốc & Tiếp tục</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Badges / Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="text-xs text-slate-500 font-medium">Tổng số câu hỏi</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{totalQuestions} câu</div>
          </div>
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60">
            <div className="text-xs text-amber-700 font-medium">Cảnh báo tham chiếu</div>
            <div className="text-xl font-bold text-amber-800 mt-0.5">{questionsWithReference.length} câu</div>
          </div>
          <div className="p-3 bg-red-50/70 rounded-xl border border-red-200/60">
            <div className="text-xs text-red-700 font-medium">Chưa có đáp án</div>
            <div className="text-xl font-bold text-red-800 mt-0.5">{questionsMissingKey.length} câu</div>
          </div>
          <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200/60">
            <div className="text-xs text-indigo-700 font-medium">Đã đặt khóa cố định</div>
            <div className="text-xl font-bold text-indigo-800 mt-0.5">
              {lockedPositionCount} vị trí / {lockedOptionsCount} đáp án
            </div>
          </div>
        </div>
      </div>

      {/* Warning Alert Banner (if reference warnings or missing keys exist) */}
      {questionsWithReference.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Lưu ý quan trọng về câu có tham chiếu đáp án: </span>
              Phát hiện {questionsWithReference.length} câu có nội dung chứa tham chiếu nhãn như <em>"A và C đều đúng"</em> hoặc <em>"Tất cả đều sai"</em>. Nếu đảo đáp án, các câu này sẽ bị sai lệch nội dung.
            </div>
          </div>
          <button
            onClick={handleAutoLockReferenceQuestions}
            className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors"
          >
            Khóa đáp án tất cả câu này
          </button>
        </div>
      )}

      {/* Missing Key Critical Alert */}
      {hasCriticalErrors && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Lỗi nghiêm trọng: </span>
              Có {questionsMissingKey.length} câu hỏi chưa có đáp án đúng. Vui lòng bấm chọn đáp án A, B, C, D cho các câu này bên dưới trước khi trộn đề.
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-red-700">
            <input
              type="checkbox"
              checked={hasConfirmedBypassWarnings}
              onChange={(e) => setHasConfirmedBypassWarnings(e.target.checked)}
              className="rounded text-red-600"
            />
            <span>Xác nhận tạm bỏ qua và tự bổ sung sau</span>
          </label>
        </div>
      )}

      {/* Filters and Expand/Collapse Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Lọc câu:
          </span>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              filterMode === 'all' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả ({totalQuestions})
          </button>
          <button
            onClick={() => setFilterMode('warnings')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              filterMode === 'warnings' ? 'bg-amber-100 text-amber-800 font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Có cảnh báo ({questionsWithWarnings.length})
          </button>
          <button
            onClick={() => setFilterMode('locked')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              filterMode === 'locked' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Đang khóa ({lockedPositionCount + lockedOptionsCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-100"
          >
            Mở rộng tất cả
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={collapseAll}
            className="text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-100"
          >
            Thu gọn tất cả
          </button>
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => {
          const isExpanded = !!expandedIds[q.id];
          const isEditing = editingQuestionId === q.id;
          const hasWarnings = q.warnings.length > 0;
          const isMissingKey = q.correctKeys.length === 0;

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl border transition-all ${
                isMissingKey
                  ? 'border-red-300 shadow-xs ring-1 ring-red-100'
                  : hasWarnings
                  ? 'border-amber-300 shadow-xs'
                  : 'border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 cursor-pointer" onClick={() => toggleExpand(q.id)}>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0 border border-blue-200">
                    {q.originalIndex}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-slate-900">
                        Câu {q.originalIndex}
                      </span>

                      {/* Correct Key Badge */}
                      {q.correctKeys.length > 0 ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Đáp án đúng: {q.correctKeys.join(', ')}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 animate-pulse">
                          Chưa có đáp án!
                        </span>
                      )}

                      {/* Lock status badges */}
                      {q.lockQuestionPosition && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-purple-100 text-purple-700 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Khóa vị trí
                        </span>
                      )}
                      {q.lockOptionsShuffle && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Khóa đáp án
                        </span>
                      )}
                    </div>

                    {/* Preview Content (truncated if collapsed) */}
                    <p className={`text-xs sm:text-sm text-slate-700 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
                      {q.content}
                    </p>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditingQuestionId(isEditing ? null : q.id)}
                    title={isEditing ? 'Đóng chế độ sửa' : 'Chỉnh sửa nội dung câu hỏi'}
                    className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isEditing ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    title="Xóa câu hỏi này"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleExpand(q.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Warnings details inside card if any */}
              {q.warnings.length > 0 && (
                <div className="mx-4 sm:mx-5 mb-3 p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 space-y-1.5">
                  {q.warnings.map((w, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{w.message}</span>
                      </div>
                      {w.suggestedAction === 'lock_options' && !q.lockOptionsShuffle && (
                        <button
                          onClick={() => toggleLockOptions(q)}
                          className="shrink-0 px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px]"
                        >
                          Khóa đáp án ngay
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Expanded Area: Options & Lock Controls */}
              {isExpanded && (
                <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-100 space-y-4">
                  {/* Edit mode: Textareas */}
                  {isEditing ? (
                    <div className="space-y-3 pt-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Nội dung câu hỏi:
                      </label>
                      <textarea
                        rows={3}
                        value={q.content}
                        onChange={(e) => updateQuestion({ ...q, content: e.target.value })}
                        className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                      />

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-700">
                          Các phương án trả lời (Bấm vào chữ A, B, C, D để đặt đáp án đúng):
                        </label>
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = q.correctKeys.includes(opt.label);
                          return (
                            <div key={opt.id} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleCorrectKey(q, opt.label)}
                                className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border transition-all ${
                                  isCorrect
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-emerald-50'
                                }`}
                              >
                                {opt.label}
                              </button>
                              <input
                                type="text"
                                value={opt.content}
                                onChange={(e) => {
                                  const newOpts = [...q.options];
                                  newOpts[optIdx] = { ...opt, content: e.target.value };
                                  updateQuestion({ ...q, options: newOpts });
                                }}
                                className="flex-1 text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden"
                              />
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => setEditingQuestionId(null)}
                          className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                        >
                          Lưu chỉnh sửa
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode: Options List */
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Danh sách phương án (Nhấp vào ký tự để đổi đáp án đúng):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt) => {
                          const isCorrect = q.correctKeys.includes(opt.label);
                          return (
                            <div
                              key={opt.id}
                              onClick={() => toggleCorrectKey(q, opt.label)}
                              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                                isCorrect
                                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 ring-1 ring-emerald-200'
                                  : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/50'
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 ${
                                  isCorrect ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-300 text-slate-700'
                                }`}
                              >
                                {opt.label}
                              </div>
                              <span className="text-xs sm:text-sm leading-relaxed flex-1">
                                {opt.content}
                              </span>
                              {isCorrect && (
                                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                                  Đúng
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Lock Controls Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Lock Position Button */}
                      <button
                        onClick={() => toggleLockPosition(q)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                          q.lockQuestionPosition
                            ? 'bg-purple-50 text-purple-700 border-purple-200 font-semibold'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {q.lockQuestionPosition ? <Lock className="w-3.5 h-3.5 text-purple-600" /> : <Unlock className="w-3.5 h-3.5" />}
                        <span>{q.lockQuestionPosition ? 'Vị trí câu: Đang khóa (cố định số thứ tự)' : 'Khóa vị trí câu này'}</span>
                      </button>

                      {/* Lock Options Shuffle Button */}
                      <button
                        onClick={() => toggleLockOptions(q)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                          q.lockOptionsShuffle
                            ? 'bg-amber-50 text-amber-800 border-amber-200 font-semibold'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {q.lockOptionsShuffle ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Shuffle className="w-3.5 h-3.5" />}
                        <span>{q.lockOptionsShuffle ? 'Thứ tự đáp án: Đang khóa (không đảo A, B, C, D)' : 'Khóa trộn đáp án câu này'}</span>
                      </button>
                    </div>

                    <span className="text-slate-400 text-[11px]">
                      {q.lockOptionsShuffle
                        ? 'Giữ nguyên A, B, C, D'
                        : 'Sẽ được đảo ngẫu nhiên'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Action Footer */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-600">
          <span className="font-semibold text-slate-900">{totalQuestions} câu hỏi</span> đã sẵn sàng để trộn.
          {questionsMissingKey.length > 0 && (
            <span className="text-red-600 ml-1">
              (Lưu ý: Có {questionsMissingKey.length} câu chưa chọn đáp án)
            </span>
          )}
        </div>

        <button
          onClick={onProceedToConfig}
          disabled={!canProceed}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95"
        >
          <span>Kiểm tra đề gốc & Chuyển sang Cấu hình trộn</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
