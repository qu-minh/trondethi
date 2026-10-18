import React from 'react';
import { BookOpen, FileCheck, CheckCircle2, Shuffle, Eye, Download, HelpCircle } from 'lucide-react';
import type { AppStep } from '../types/exam';

interface HeaderProps {
  currentStep: AppStep;
  onNavigateStep: (step: AppStep) => void;
  canNavigateTo: (step: AppStep) => boolean;
}

const STEPS: { key: AppStep; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'guide', label: '1. Hướng dẫn & Mẫu', icon: HelpCircle },
  { key: 'import', label: '2. Tải đề lên', icon: BookOpen },
  { key: 'review_original', label: '3. Đề gốc', icon: FileCheck },
  { key: 'config', label: '4. Cấu hình trộn', icon: Shuffle },
  { key: 'review_shuffled', label: '5. Review đề trộn', icon: Eye },
  { key: 'confirmed', label: '6. Tải xuống', icon: Download },
];

export const Header: React.FC<HeaderProps> = ({ currentStep, onNavigateStep, canNavigateTo }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigateStep('guide')}>
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Shuffle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">TRỘN ĐỀ ONLINE</span>
              <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                Dành cho giáo viên
              </span>
            </div>
            <p className="text-xs text-slate-500">Bảo toàn 100% độ chính xác câu hỏi & đáp án</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Xử lý an toàn trên trình duyệt, không gửi đề lên máy chủ</span>
          </div>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="border-t border-slate-100 bg-slate-50/70 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between min-w-[680px] py-2.5">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCurrent = currentStep === step.key;
              const isClickable = canNavigateTo(step.key);

              return (
                <button
                  key={step.key}
                  disabled={!isClickable}
                  onClick={() => onNavigateStep(step.key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : isClickable
                      ? 'text-slate-700 hover:text-blue-600 hover:bg-white'
                      : 'text-slate-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-white' : ''}`} />
                  <span>{step.label}</span>
                  {idx < STEPS.length - 1 && (
                    <span className="text-slate-300 ml-2 select-none">/</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
