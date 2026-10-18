import React, { useState } from 'react';
import { Shuffle, Sliders, Hash, CheckCircle2, RotateCw, ArrowLeft, Settings, Info } from 'lucide-react';
import type { OriginalExam, MixConfig, ExamMetadata } from '../types/exam';

interface StepConfigProps {
  originalExam: OriginalExam;
  onStartMixing: (config: MixConfig, updatedMetadata: ExamMetadata) => void;
  onBackToReviewOriginal: () => void;
}

export const StepConfig: React.FC<StepConfigProps> = ({
  originalExam,
  onStartMixing,
  onBackToReviewOriginal,
}) => {
  const [numCodes, setNumCodes] = useState<number>(4);
  const [startCode, setStartCode] = useState<number>(101);

  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(true);
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 100000));
  const [showSeedTooltip, setShowSeedTooltip] = useState<boolean>(false);

  // Metadata customization
  const [metadata, setMetadata] = useState<ExamMetadata>(originalExam.metadata);

  // Stats from original exam
  const totalQuestions = originalExam.questions.length;
  const lockedQuestionsCount = originalExam.questions.filter((q) => q.lockQuestionPosition).length;
  const lockedOptionsCount = originalExam.questions.filter((q) => q.lockOptionsShuffle).length;

  // Compute code list
  const getEffectiveCodes = (): string[] => {
    const list: string[] = [];
    for (let i = 0; i < numCodes; i++) {
      list.push(String(startCode + i));
    }
    return list;
  };

  const handleStart = () => {
    const codes = getEffectiveCodes();
    if (codes.length === 0) {
      alert('Vui lòng nhập ít nhất 1 mã đề thi.');
      return;
    }

    const config: MixConfig = {
      numCodes: codes.length,
      codes,
      shuffleQuestions,
      shuffleOptions,
      seed,
      preservePassageGroups: true,
    };

    onStartMixing(config, metadata);
  };

  const currentCodes = getEffectiveCodes();

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Bước 2: Cấu hình và thực hiện trộn đề</h2>
        <p className="text-sm text-slate-500 mt-1">
          Thiết lập số lượng mã đề, quy tắc đảo câu hỏi, hoán vị phương án và thông tin tiêu đề đề thi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Mixing Rules */}
        <div className="md:col-span-2 space-y-5">
          {/* Section: Mã đề thi */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Hash className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Thiết lập số lượng mã đề</h3>
            </div>

            {/* Presets: 2, 4, 6, 8 mã đề */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Chọn nhanh số lượng mã đề cần tạo:
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {[2, 4, 6, 8].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumCodes(n)}
                    className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                      numCodes === n
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {n} Mã đề
                  </button>
                ))}
              </div>
            </div>

            {/* Custom or Start Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mã đề bắt đầu:
                </label>
                <input
                  type="number"
                  value={startCode}
                  onChange={(e) => setStartCode(parseInt(e.target.value, 10) || 101)}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                  placeholder="101"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Ví dụ: 101, 201, 357...</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Số lượng mã đề tùy chỉnh (1 - 24):
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={numCodes}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(24, parseInt(e.target.value, 10) || 1));
                    setNumCodes(val);
                  }}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>

            {/* Preview Codes Chips */}
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100">
              <div className="text-[11px] font-semibold text-blue-900 mb-2">
                Danh sách các mã đề sẽ được tạo ({currentCodes.length} mã đề):
              </div>
              <div className="flex flex-wrap gap-2">
                {currentCodes.map((code) => (
                  <span
                    key={code}
                    className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 font-bold text-xs rounded-lg shadow-2xs"
                  >
                    Mã {code}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Tùy chọn đảo */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sliders className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Quy tắc xáo trộn đề</h3>
            </div>

            <div className="space-y-3">
              {/* Shuffle Questions */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900">Trộn thứ tự câu hỏi</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Các câu hỏi sẽ được hoán đổi vị trí ngẫu nhiên giữa các mã đề (ngoại trừ {lockedQuestionsCount} câu đã khóa vị trí).
                  </div>
                </div>
              </label>

              {/* Shuffle Options */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900">Trộn thứ tự đáp án (A, B, C, D)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Các phương án trả lời sẽ được hoán đổi vị trí và tự động cập nhật lại chữ cái đáp án đúng (ngoại trừ {lockedOptionsCount} câu đã khóa đáp án).
                  </div>
                </div>
              </label>
            </div>

            {/* Seed setting */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center gap-1.5 relative">
                <span className="text-xs font-semibold text-slate-800">
                  Mã hạt giống (Seed)
                </span>
                <button
                  type="button"
                  onClick={() => setShowSeedTooltip(!showSeedTooltip)}
                  onMouseEnter={() => setShowSeedTooltip(true)}
                  onMouseLeave={() => setShowSeedTooltip(false)}
                  className="text-slate-400 hover:text-blue-600 transition-colors p-0.5 rounded-full hover:bg-slate-100 focus:outline-hidden"
                  aria-label="Thông tin về mã hạt giống"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                {/* Tooltip Popover */}
                {showSeedTooltip && (
                  <div
                    className="absolute bottom-full left-0 mb-2 w-72 sm:w-80 p-3 bg-slate-900 text-slate-100 text-xs rounded-xl shadow-xl z-30 leading-relaxed border border-slate-800"
                    onMouseEnter={() => setShowSeedTooltip(true)}
                    onMouseLeave={() => setShowSeedTooltip(false)}
                  >
                    <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>Mã hạt giống (Seed) là gì?</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Mã Seed giúp tái tạo thứ tự xáo trộn của đề thi. Khi sử dụng cùng mã Seed, cùng đề gốc, cùng thiết lập và cùng phiên bản thuật toán, hệ thống có thể tạo lại kết quả xáo trộn tương ứng. Nếu để trống hoặc thay đổi mã Seed, kết quả có thể khác nhau tùy cách hệ thống xử lý.
                    </p>
                    <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-900" />
                  </div>
                )}
              </div>

              {/* Dòng mô tả ngắn gọn bên dưới tiêu đề */}
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Giúp tạo lại cùng một cách xáo trộn khi sử dụng cùng mã Seed và giữ nguyên các thiết lập, dữ liệu đầu vào.
              </p>

              {/* Ô nhập seed và nút tạo ngẫu nhiên */}
              <div className="flex items-center gap-2 pt-0.5">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setSeed(isNaN(val) ? 0 : val);
                    }}
                    placeholder="Nhập mã seed số..."
                    className="w-full text-xs font-mono font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white text-slate-800"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setSeed(Math.floor(Math.random() * 900000) + 100000)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200/80 transition-colors shrink-0"
                  title="Tạo mã seed ngẫu nhiên mới"
                >
                  <RotateCw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Đổi seed</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Metadata & Summary */}
        <div className="space-y-5">
          {/* Exam Header Customization */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Settings className="w-4 h-4 text-slate-600" />
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Thông tin trên đề thi</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Tên trường / Đơn vị:</label>
                <input
                  type="text"
                  value={metadata.schoolName}
                  onChange={(e) => setMetadata({ ...metadata, schoolName: e.target.value })}
                  placeholder="TRƯỜNG THPT NGUYỄN TRÃI"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tiêu đề bài thi:</label>
                <input
                  type="text"
                  value={metadata.examTitle}
                  onChange={(e) => setMetadata({ ...metadata, examTitle: e.target.value })}
                  placeholder="ĐỀ THI KIỂM TRA HỌC KỲ I"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Môn học:</label>
                  <input
                    type="text"
                    value={metadata.subject}
                    onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                    placeholder="Toán học"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Thời gian (phút):</label>
                  <input
                    type="number"
                    value={metadata.durationMinutes}
                    onChange={(e) => setMetadata({ ...metadata, durationMinutes: parseInt(e.target.value, 10) || 45 })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Khối / Lớp:</label>
                <input
                  type="text"
                  value={metadata.grade}
                  onChange={(e) => setMetadata({ ...metadata, grade: e.target.value })}
                  placeholder="12"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={metadata.showStudentInfoBox}
                  onChange={(e) => setMetadata({ ...metadata, showStudentInfoBox: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span className="text-[11px] text-slate-600">Hiện khung Họ tên & SBD học sinh</span>
              </label>
            </div>
          </div>

          {/* Mixing Summary Card */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-md space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Tổng quan cấu hình
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Tổng số câu hỏi:</span>
                <span className="font-bold">{totalQuestions} câu</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Số mã đề sẽ tạo:</span>
                <span className="font-bold text-blue-400">{currentCodes.length} mã đề</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Câu khóa vị trí:</span>
                <span className="font-bold text-purple-400">{lockedQuestionsCount} câu</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Câu khóa đáp án:</span>
                <span className="font-bold text-amber-400">{lockedOptionsCount} câu</span>
              </div>
              <div className="flex justify-between py-1 text-slate-300">
                <span className="text-slate-400">Kiểm tra đáp án:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Tự động đối chiếu
                </span>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full mt-3 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Shuffle className="w-4 h-4" />
              <span>Tiến hành Trộn đề</span>
            </button>
          </div>
        </div>
      </div>

      {/* Back button */}
      <div className="flex justify-start">
        <button
          onClick={onBackToReviewOriginal}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại kiểm tra đề gốc</span>
        </button>
      </div>
    </div>
  );
};
