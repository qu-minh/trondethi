import React, { useState, useRef } from 'react';
import { Upload, FileUp, FileText, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { parseDocxFile, parsePlainText, getSampleTaggedExamText } from '../utils/parser';
import type { Question, OriginalExam, ExamMetadata } from '../types/exam';

interface StepImportProps {
  onExamImported: (exam: OriginalExam) => void;
  onLoadSample: () => void;
}

export const StepImport: React.FC<StepImportProps> = ({ onExamImported, onLoadSample }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultMetadata: ExamMetadata = {
    schoolName: 'TRƯỜNG THPT NGUYỄN TRÃI',
    subject: 'KHOA HỌC TỰ NHIÊN',
    grade: '12',
    examTitle: 'ĐỀ THI KIỂM TRA HỌC KỲ I',
    durationMinutes: 45,
    schoolYear: '2026 - 2027',
    semester: 'Học kỳ I',
    teacherName: '',
    showStudentInfoBox: true,
    fontSize: '12pt',
    fontFamily: 'Times New Roman',
  };

  const handleProcessFile = async (file: File) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      let questions: Question[] = [];
      let rawText = '';

      if (file.name.endsWith('.docx')) {
        const result = await parseDocxFile(file);
        questions = result.questions;
        rawText = result.rawText;
      } else if (file.name.endsWith('.txt')) {
        const text = await file.text();
        questions = parsePlainText(text);
        rawText = text;
      } else {
        throw new Error('Chỉ hỗ trợ file Word định dạng .docx hoặc file văn bản .txt');
      }

      if (questions.length === 0) {
        throw new Error(
          'Không tìm thấy câu hỏi trắc nghiệm nào trong file. Vui lòng kiểm tra lại định dạng "Câu 1. ... A. ... B. ..." hoặc các thẻ [MIX:Q]...[MIX:A]... theo hướng dẫn.'
        );
      }

      const originalExam: OriginalExam = {
        id: `exam-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        questions,
        importedAt: new Date().toISOString(),
        rawText,
        metadata: {
          ...defaultMetadata,
          examTitle: file.name.replace(/\.[^/.]+$/, '').toUpperCase(),
        },
      };

      onExamImported(originalExam);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Có lỗi xảy ra khi đọc file. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleProcessPastedText = () => {
    if (!pastedText.trim()) {
      setErrorMessage('Vui lòng dán nội dung đề thi vào ô bên dưới');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const questions = parsePlainText(pastedText);
      if (questions.length === 0) {
        throw new Error('Không nhận diện được câu hỏi nào từ nội dung vừa dán.');
      }

      const originalExam: OriginalExam = {
        id: `exam-${Date.now()}`,
        title: 'Đề thi nhập trực tiếp',
        fileName: 'de_thi_nhap_tay.txt',
        questions,
        importedAt: new Date().toISOString(),
        rawText: pastedText,
        metadata: defaultMetadata,
      };

      onExamImported(originalExam);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Bước 1: Tải đề thi lên hệ thống</h2>
        <p className="text-sm text-slate-500 mt-1">
          Hỗ trợ file Word (.docx), file Text (.txt) hoặc dán trực tiếp nội dung đề thi
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'upload' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Tải file từ máy tính</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'paste' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Dán nội dung văn bản</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Lỗi nhận diện đề thi: </span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Upload Box */}
      {activeTab === 'upload' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
              : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/50 shadow-xs'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".docx,.txt"
            className="hidden"
          />

          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs">
            {loading ? (
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileUp className="w-8 h-8" />
            )}
          </div>

          <h3 className="text-base font-semibold text-slate-900">
            {loading ? 'Đang phân tích cấu trúc đề thi...' : 'Kéo thả file đề thi vào đây hoặc bấm để chọn'}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">
            Hỗ trợ định dạng <strong>.docx</strong> (Microsoft Word) và <strong>.txt</strong>
          </p>

          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium text-xs shadow-xs hover:bg-blue-700 transition-colors">
            <Upload className="w-4 h-4" />
            <span>Chọn file từ máy tính</span>
          </div>
        </div>
      ) : (
        /* Paste Text Area */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <label className="block text-xs font-semibold text-slate-700">
            Dán nội dung đề thi vào khung bên dưới:
          </label>
          <textarea
            rows={12}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder={`Câu 1. Thủ đô của Việt Nam là gì?\nA. Hà Nội\nB. Đà Nẵng\nC. Huế\nD. Cần Thơ\nĐáp án: A\n\nCâu 2. ...`}
            className="w-full text-xs font-mono p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden leading-relaxed"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setPastedText(getSampleTaggedExamText())}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Chèn nội dung mẫu
            </button>
            <button
              onClick={handleProcessPastedText}
              disabled={loading || !pastedText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Phân tích và xem đề</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Try Sample Button */}
      <div className="pt-2 flex items-center justify-center">
        <div className="flex items-center gap-3 p-3 px-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Chưa có sẵn file? Hãy thử nghiệm ngay với bộ đề mẫu 8 câu:</span>
          <button
            onClick={onLoadSample}
            className="font-bold underline text-amber-800 hover:text-amber-950 inline-flex items-center gap-1 cursor-pointer ml-1"
          >
            <span>Nạp đề mẫu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
