import React, { useState } from 'react';
import { 
  Download, Copy, Check, ArrowRight, CheckCircle2, 
  Shuffle, ChevronDown, ChevronUp, Sparkles, HelpCircle
} from 'lucide-react';
import { getSampleTaggedExamText } from '../utils/parser';
import { createSampleDocxBlob, downloadFile } from '../utils/exporter';

interface StepGuideProps {
  onLoadSampleExam: () => void;
  onGoToImport: () => void;
}

const SHORT_SAMPLE = `[MIX:Q]
Câu 1. Thủ đô của Việt Nam là gì?
[MIX:A] Hà Nội
[MIX:B] Đà Nẵng
[MIX:C] Huế
[MIX:D] Cần Thơ
[MIX:KEY] A
[MIX:END]`;

export const StepGuide: React.FC<StepGuideProps> = ({ onLoadSampleExam, onGoToImport }) => {
  const [copied, setCopied] = useState(false);
  const [showDetailedGuide, setShowDetailedGuide] = useState(false);
  const fullSampleText = getSampleTaggedExamText();

  const handleCopyShortSample = () => {
    navigator.clipboard.writeText(SHORT_SAMPLE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxtSample = () => {
    const blob = new Blob([fullSampleText], { type: 'text/plain;charset=utf-8' });
    downloadFile(blob, 'de_thi_mau_chuan.txt');
  };

  const handleDownloadDocxSample = async () => {
    const blob = await createSampleDocxBlob(fullSampleText);
    downloadFile(blob, 'de_thi_mau_chuan.docx');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* 1. Header / Giới thiệu tinh gọn */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            Công cụ hỗ trợ giáo viên
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Trộn đề thi trắc nghiệm trực tuyến
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Hỗ trợ xáo trộn thứ tự câu hỏi và phương án, kiểm tra đề gốc trực quan, đối chiếu đáp án trước khi tải trọn bộ file Word và Excel về máy tính.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={onGoToImport}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <span>Bắt đầu tải file lên</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLoadSampleExam}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors"
            >
              <span>Thử nghiệm với đề mẫu</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quy trình 3 bước trực quan */}
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Quy trình sử dụng gồm 3 bước:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Bước 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100">
                  1
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Chuẩn bị đề thi</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Soạn đề theo file Word (<code className="text-slate-700">.docx</code>) hoặc Text (<code className="text-slate-700">.txt</code>). Định dạng câu hỏi và các phương án rõ ràng.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={handleDownloadDocxSample}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-[11px] transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Mẫu .docx</span>
              </button>
              <button
                onClick={handleDownloadTxtSample}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Mẫu .txt</span>
              </button>
            </div>
          </div>

          {/* Bước 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                  2
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Tải lên & kiểm tra</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Xem lại danh sách câu hỏi đã nhận diện trên màn hình. Phát hiện câu có tham chiếu để khóa phương án hoặc chỉnh sửa trực tiếp.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Cho phép sửa nội dung câu hỏi</span>
            </div>
          </div>

          {/* Bước 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                  3
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Trộn đề & tải xuống</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Thiết lập số mã đề, review đề thi học sinh và đối chiếu đáp án từng mã đề trước khi tải về file Word và Excel.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
              <Shuffle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Xuất Word (.docx), Excel (.xlsx), ZIP</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Khu vực Ký hiệu định dạng chuẩn */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-xs sm:text-sm">Ký hiệu định dạng câu hỏi</h2>
            <p className="text-[11px] text-slate-500">
              Có thể dùng thẻ chuẩn <code className="text-blue-700 font-mono">[MIX:...]</code> hoặc cấu trúc Word thông thường
            </p>
          </div>
          <button
            onClick={handleCopyShortSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors self-start sm:self-auto"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã sao chép ví dụ' : 'Sao chép ví dụ'}</span>
          </button>
        </div>

        {/* Bảng ký hiệu súc tích */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
            <code className="text-blue-700 font-mono font-bold block mb-0.5">[MIX:Q]</code>
            <span className="text-[11px] text-slate-600">Bắt đầu câu hỏi</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
            <code className="text-blue-700 font-mono font-bold block mb-0.5">[MIX:A] .. [MIX:D]</code>
            <span className="text-[11px] text-slate-600">Phương án trả lời</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
            <code className="text-blue-700 font-mono font-bold block mb-0.5">[MIX:KEY] A</code>
            <span className="text-[11px] text-slate-600">Đáp án đúng (VD: A, B)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
            <code className="text-blue-700 font-mono font-bold block mb-0.5">[MIX:END]</code>
            <span className="text-[11px] text-slate-600">Kết thúc câu hỏi</span>
          </div>
        </div>

        {/* Ví dụ ngắn 1 câu */}
        <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-3">
          <div className="text-[11px] font-semibold text-slate-500 mb-1.5">Ví dụ minh họa 1 câu hoàn chỉnh:</div>
          <pre className="text-xs font-mono text-slate-800 leading-relaxed overflow-x-auto whitespace-pre">
{SHORT_SAMPLE}
          </pre>
        </div>

        <div className="text-[11px] text-slate-500 italic">
          * Ghi chú: Thầy/cô cũng có thể sử dụng file Word bình thường với dạng: <strong>"Câu 1. ... A. ... B. ... C. ... D. ... Đáp án: A"</strong>. Hệ thống sẽ tự động nhận diện cấu trúc.
        </div>
      </div>

      {/* 4. Hướng dẫn chi tiết & Lưu ý (Dạng mở rộng / Accordion) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          onClick={() => setShowDetailedGuide(!showDetailedGuide)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span className="text-xs sm:text-sm font-semibold text-slate-800">
              Xem hướng dẫn chi tiết & các lưu ý kỹ thuật
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>{showDetailedGuide ? 'Thu gọn' : 'Xem chi tiết'}</span>
            {showDetailedGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showDetailedGuide && (
          <div className="px-5 pb-5 pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-3 leading-relaxed">
            <div>
              <strong className="text-slate-900 block mb-0.5">1. Câu hỏi có tham chiếu phương án (Ví dụ: "A và C đều đúng"):</strong>
              Nếu câu hỏi có phương án chứa cụm từ tham chiếu nhãn như <em>"A và C đều đúng"</em> hoặc <em>"Tất cả đều sai"</em>, hệ thống sẽ tự động hiển thị cảnh báo. Thầy/cô chỉ cần bấm nút <strong>"Khóa đáp án câu này"</strong> để giữ nguyên thứ tự A, B, C, D nhằm bảo đảm nội dung không bị sai lệch.
            </div>

            <div>
              <strong className="text-slate-900 block mb-0.5">2. Khóa vị trí câu hỏi:</strong>
              Đối với các câu hỏi đọc hiểu chung một đoạn văn bản hoặc các câu hỏi cần giữ nguyên thứ tự làm bài, thầy/cô có thể bật tùy chọn <strong>"Khóa vị trí"</strong> ở bước kiểm tra đề gốc.
            </div>

            <div>
              <strong className="text-slate-900 block mb-0.5">3. Câu có nhiều đáp án đúng:</strong>
              Nếu câu hỏi có nhiều hơn một đáp án đúng (ví dụ cả A và C đều đúng), ghi theo cú pháp: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">[MIX:KEY] A,C</code> hoặc <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">Đáp án: A, C</code>. Hệ thống sẽ cập nhật cả hai chữ cái tương ứng sau khi hoán vị.
            </div>

            <div>
              <strong className="text-slate-900 block mb-0.5">4. Bảo mật dữ liệu đề thi:</strong>
              Mọi tác vụ phân tích file Word, xử lý hoán vị và đóng gói file tải về đều được thực hiện trực tiếp trên trình duyệt máy tính của thầy/cô. Đề thi không được gửi lên máy chủ bên ngoài.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
