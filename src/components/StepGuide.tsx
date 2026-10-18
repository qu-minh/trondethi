import React, { useState } from 'react';
import { Download, Copy, Check, Sparkles, ArrowRight, FileText, Lock } from 'lucide-react';
import { getSampleTaggedExamText } from '../utils/parser';
import { createSampleDocxBlob, downloadFile } from '../utils/exporter';

interface StepGuideProps {
  onLoadSampleExam: () => void;
  onGoToImport: () => void;
}

export const StepGuide: React.FC<StepGuideProps> = ({ onLoadSampleExam, onGoToImport }) => {
  const [copied, setCopied] = useState(false);
  const sampleText = getSampleTaggedExamText();

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxtSample = () => {
    const blob = new Blob([sampleText], { type: 'text/plain;charset=utf-8' });
    downloadFile(blob, 'de_thi_mau_chuan.txt');
  };

  const handleDownloadDocxSample = async () => {
    const blob = await createSampleDocxBlob(sampleText);
    downloadFile(blob, 'de_thi_mau_chuan.docx');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6">
      {/* Hero Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Hệ thống trộn đề trắc nghiệm giáo dục chuẩn quốc gia
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Trộn đề thi trắc nghiệm chính xác, minh bạch và an toàn
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
            Xem trực tiếp đề gốc ngay khi tải lên, kiểm tra từng phương án và đáp án đúng trước khi trộn. 
            Review trực quan toàn bộ mã đề sau khi trộn, tự động phát hiện câu có tham chiếu ("A và C đều đúng") 
            và xuất trọn bộ file Word, Excel, ZIP chỉ trong một cú nhấp chuột.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onGoToImport}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 shadow-md transition-all active:scale-95"
            >
              <span>Tải file đề thi của thầy cô</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLoadSampleExam}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/40 text-white border border-white/30 font-semibold text-sm hover:bg-blue-500/60 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Nạp đề mẫu thử nghiệm ngay</span>
            </button>
          </div>
        </div>
      </div>

      {/* Download Sample Files Quick Action */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Tải file đề thi mẫu chuẩn về máy</h3>
            <p className="text-xs text-slate-500">Thầy cô có thể tải về để tham khảo định dạng hoặc chỉnh sửa nội dung bài thi</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleDownloadDocxSample}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-xs border border-blue-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Tải file Word (.docx)</span>
          </button>
          <button
            onClick={handleDownloadTxtSample}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs border border-slate-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Tải file Text (.txt)</span>
          </button>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-3">
            1
          </div>
          <h3 className="font-semibold text-slate-900 text-sm mb-1.5">Chuẩn bị file Word thông thường</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hệ thống nhận diện tự động cấu trúc đề Word phổ thông của giáo viên: <br />
            <strong>"Câu 1. ..."</strong>, các phương án <strong>"A. ... B. ... C. ... D. ..."</strong> và đáp án <strong>"Đáp án: A"</strong> (hoặc bảng đáp án ở cuối đề).
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mb-3">
            2
          </div>
          <h3 className="font-semibold text-slate-900 text-sm mb-1.5">Định dạng chuẩn thẻ [MIX:...]</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Độ chính xác 100% tuyệt đối. Sử dụng các thẻ: <br />
            <code className="text-blue-600 font-mono text-[11px]">[MIX:Q]</code>: Bắt đầu câu hỏi <br />
            <code className="text-blue-600 font-mono text-[11px]">[MIX:A] .. [MIX:D]</code>: Phương án <br />
            <code className="text-blue-600 font-mono text-[11px]">[MIX:KEY] A</code>: Đáp án đúng <br />
            <code className="text-blue-600 font-mono text-[11px]">[MIX:END]</code>: Kết thúc câu
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm mb-3">
            3
          </div>
          <h3 className="font-semibold text-slate-900 text-sm mb-1.5">Khóa vị trí & Xử lý tham chiếu</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Các câu như <em>"A và C đều đúng"</em> hoặc <em>"Tất cả đều sai"</em> sẽ được tự động phát hiện cảnh báo để thầy cô chọn <strong>Khóa trộn đáp án</strong>, tránh gây sai nghĩa khi đảo chỗ.
          </p>
        </div>
      </div>

      {/* Code Sample Block */}
      <div className="bg-slate-900 rounded-xl p-5 text-slate-200 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
            <span className="text-xs font-mono text-slate-400 ml-2">Vi_du_dinh_dang_chuan.txt</span>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép mẫu'}</span>
          </button>
        </div>

        <pre className="mt-3 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto max-h-60 p-2">
          {sampleText.split('\n').slice(0, 24).join('\n')}
          {'\n... (và các câu tiếp theo)'}
        </pre>
      </div>

      {/* Feature notice */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
        <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Cam kết bảo mật & Quyền riêng tư: </span>
          Mọi thao tác đọc file, phân tích câu hỏi, hoán vị và xuất file đều chạy trực tiếp 100% trong bộ nhớ trình duyệt máy tính của thầy cô. Không có bất kỳ dữ liệu đề thi nào được truyền tải lên internet.
        </div>
      </div>
    </div>
  );
};
