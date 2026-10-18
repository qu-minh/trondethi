import React, { useState } from 'react';
import { 
  Download, Archive, FileSpreadsheet, FileText, CheckCircle2, ShieldCheck, 
  RotateCw, Sparkles, AlertCircle, FileCheck
} from 'lucide-react';
import type { ConfirmedSession } from '../types/exam';
import { 
  generateExamDocxBlob, 
  generateAnswersDocxBlob, 
  generateExcelAnswerKeyBlob, 
  generateZipPackage, 
  downloadFile 
} from '../utils/exporter';

interface StepConfirmedDownloadProps {
  session: ConfirmedSession;
  onModifyExam: () => void;
}

export const StepConfirmedDownload: React.FC<StepConfirmedDownloadProps> = ({
  session,
  onModifyExam,
}) => {
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [selectedCodeForDocx, setSelectedCodeForDocx] = useState<string>(
    session.shuffledExams[0]?.code || ''
  );

  const { originalExam, shuffledExams, summary } = session;
  const metadata = originalExam.metadata;

  // Download all as ZIP
  const handleDownloadZip = async () => {
    try {
      setDownloadingType('zip');
      const blob = await generateZipPackage(shuffledExams, metadata);
      downloadFile(blob, `Bo_de_thi_${metadata.subject || 'mon_thi'}_${shuffledExams.length}_ma_de.zip`);
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi tạo file ZIP.');
    } finally {
      setDownloadingType(null);
    }
  };

  // Download single exam docx
  const handleDownloadSingleDocx = async (code: string) => {
    try {
      setDownloadingType(`docx-${code}`);
      const exam = shuffledExams.find((e) => e.code === code) || shuffledExams[0];
      const blob = await generateExamDocxBlob(exam, metadata, false);
      downloadFile(blob, `De_thi_ma_${code}.docx`);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi tạo file Word.');
    } finally {
      setDownloadingType(null);
    }
  };

  // Download Excel answers
  const handleDownloadExcelAnswers = () => {
    try {
      setDownloadingType('excel');
      const blob = generateExcelAnswerKeyBlob(shuffledExams, metadata);
      downloadFile(blob, `Dap_an_tong_hop_${metadata.subject || 'mon_thi'}.xlsx`);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi tạo file Excel.');
    } finally {
      setDownloadingType(null);
    }
  };

  // Download Word answers
  const handleDownloadWordAnswers = async () => {
    try {
      setDownloadingType('answers-docx');
      const blob = await generateAnswersDocxBlob(shuffledExams, metadata);
      downloadFile(blob, `Dap_an_tat_ca_ma_de.docx`);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi tạo file đáp án Word.');
    } finally {
      setDownloadingType(null);
    }
  };

  // Download combined docx (exam + answer key)
  const handleDownloadCombinedDocx = async (code: string) => {
    try {
      setDownloadingType(`combined-${code}`);
      const exam = shuffledExams.find((e) => e.code === code) || shuffledExams[0];
      const blob = await generateExamDocxBlob(exam, metadata, true);
      downloadFile(blob, `De_thi_va_dap_an_ma_${code}.docx`);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi tạo file tổng hợp.');
    } finally {
      setDownloadingType(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Success Confirmation Card */}
      <div className="bg-white rounded-2xl border border-emerald-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 opacity-80" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Phiên bản đề thi đã được xác nhận thành công!
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Đã khóa an toàn
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Dữ liệu đề thi đã được xác nhận và khóa phiên bản. Hệ thống đã hoàn tất đối chiếu đáp án cho các mã đề.
              </p>
            </div>
          </div>

          <button
            onClick={onModifyExam}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Mở khóa để chỉnh sửa lại</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 relative z-10">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="text-[11px] text-slate-500 font-medium">Số mã đề đã tạo</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{summary.totalCodes} mã đề</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="text-[11px] text-slate-500 font-medium">Tổng số câu hỏi</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{summary.totalQuestions} câu/mã</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="text-[11px] text-slate-500 font-medium">Câu giữ nguyên vị trí</div>
            <div className="text-lg font-bold text-purple-700 mt-0.5">{summary.lockedQuestionsCount} câu</div>
          </div>
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/60">
            <div className="text-[11px] text-blue-800 font-medium">Trạng thái đối chiếu</div>
            <div className="text-lg font-bold text-blue-700 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Đã kiểm tra đối chiếu
            </div>
          </div>
        </div>
      </div>

      {/* Primary Download Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Chọn file tải xuống máy tính
        </h3>

        {/* Big Recommended Card: All in ZIP */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/15 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Archive className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 mb-1">
                <Sparkles className="w-3 h-3" /> KHUYẾN NGHỊ DÀNH CHO GIÁO VIÊN
              </div>
              <h4 className="text-base font-bold">
                Tải trọn bộ tất cả mã đề thi & đáp án (.ZIP)
              </h4>
              <p className="text-xs text-blue-100 mt-1 max-w-md">
                Gói nén đầy đủ bao gồm: Từng file Word (.docx) cho {summary.totalCodes} mã đề, file Excel tổng hợp đáp án (.xlsx) và file Word đáp án (.docx).
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={downloadingType === 'zip'}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {downloadingType === 'zip' ? (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{downloadingType === 'zip' ? 'Đang đóng gói ZIP...' : 'Tải trọn bộ (.ZIP)'}</span>
          </button>
        </div>

        {/* Secondary Downloads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card: Single Docx */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Tải file Word (.docx) từng mã đề</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chọn mã đề cụ thể để tải riêng bản đề thi Word không kèm đáp án
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <select
                value={selectedCodeForDocx}
                onChange={(e) => setSelectedCodeForDocx(e.target.value)}
                className="text-xs font-semibold p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50"
              >
                {shuffledExams.map((e) => (
                  <option key={e.code} value={e.code}>
                    Mã đề {e.code}
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleDownloadSingleDocx(selectedCodeForDocx)}
                disabled={downloadingType === `docx-${selectedCodeForDocx}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Tải Mã {selectedCodeForDocx} (.docx)</span>
              </button>
            </div>
          </div>

          {/* Card: Excel Answers */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Tải bảng tổng hợp đáp án (.xlsx)</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bảng ma trận đối chiếu câu hỏi & các mã đề, chuẩn bị chấm thi hoặc nhập máy chấm trắc nghiệm
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleDownloadExcelAnswers}
                disabled={downloadingType === 'excel'}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Tải bảng đáp án (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Card: Word Answers */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Tải bảng đáp án Word (.docx)</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bảng đáp án định dạng Word trình bày kẻ bảng đẹp mắt, thuận tiện in ấn dán bảng tin
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleDownloadWordAnswers}
                disabled={downloadingType === 'answers-docx'}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Tải đáp án Word (.docx)</span>
              </button>
            </div>
          </div>

          {/* Card: Combined Exam + Answers */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Đề thi kèm đáp án ở cuối (.docx)</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dành cho giáo viên lưu trữ hồ sơ chuyên môn hoặc gửi tổ bộ môn duyệt đề
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleDownloadCombinedDocx(selectedCodeForDocx)}
                disabled={downloadingType === `combined-${selectedCodeForDocx}`}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs border border-purple-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Tải Đề + Đáp án Mã {selectedCodeForDocx}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            Thầy cô muốn điều chỉnh thêm câu hỏi hoặc thêm mã đề?
          </span>
        </div>
        <button
          onClick={onModifyExam}
          className="font-bold text-blue-600 hover:text-blue-800 underline shrink-0"
        >
          Quay lại màn hình trộn
        </button>
      </div>
    </div>
  );
};
