import React from 'react';
import { 
  FileText, 
  BookOpen, 
  BrainCircuit, 
  Cpu, 
  Archive, 
  PlusCircle, 
  Printer, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'drafter' | 'legal' | 'training' | 'multimodel' | 'archive';
  setActiveTab: (tab: 'drafter' | 'legal' | 'training' | 'multimodel' | 'archive') => void;
  onNewLetter: () => void;
  onPrint: () => void;
  hasContent: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onNewLetter,
  onPrint,
  hasContent,
}) => {
  // Format today's date in Arabic (Gregorian and approximate Hijri)
  const today = new Date();
  const gregorianDate = today.toLocaleDateString('ar-SA-u-ca-gregory', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const hijriDate = today.toLocaleDateString('ar-SA-u-ca-islamic-umalqura', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="no-print bg-slate-950 text-white border-b border-slate-800/80 sticky top-0 z-40 shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 via-amber-600 to-amber-800 flex items-center justify-center shadow-md shadow-amber-950/40 ring-1 ring-amber-400/40">
              <FileText className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white font-cairo flex items-center gap-1.5">
                  <span>ديــوان</span>
                  <span className="text-amber-400 font-light text-sm hidden sm:inline">|</span>
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  المراسلات الذكية
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                المنظومة الإدارية المتكاملة للصياغة والتأصيل النظامي والاعتماد
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/90 shadow-inner overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('drafter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'drafter'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>محرر الصياغة</span>
            </button>

            <button
              onClick={() => setActiveTab('legal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'legal'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>الأنظمة والمناشير</span>
            </button>

            <button
              onClick={() => setActiveTab('training')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'training'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">استوديو التدريب والأسلوب</span>
              <span className="sm:hidden">التدريب</span>
            </button>

            <button
              onClick={() => setActiveTab('multimodel')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'multimodel'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
              title="تجهيز المطالبات للنماذج الأخرى (DeepSeek, ChatGPT, Claude, Ollama)"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">محول النماذج الذكية</span>
              <span className="lg:hidden">النماذج</span>
            </button>

            <button
              onClick={() => setActiveTab('archive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'archive'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>الأرشيف</span>
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onNewLetter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-colors shadow-2xs"
              title="بدء معاملة ومراسلة جديدة فارغة"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">معاملة جديدة</span>
            </button>

            {hasContent && (
              <button
                onClick={onPrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors"
                title="طباعة الخطاب الرسمي المعتمد A4"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">طباعة رسمية A4</span>
              </button>
            )}
          </div>
        </div>

        {/* Informative Sub-bar */}
        <div className="hidden sm:flex items-center justify-between py-1.5 px-1 border-t border-slate-800/60 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              المحرك النشط: <strong className="text-amber-300 font-semibold">Gemini 2.5 Pro</strong>
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">معايير الصياغة الحكومية المعتمدة • تدقيق لغوي وتأصيل نظامي</span>
          </div>
          <div className="flex items-center gap-3">
            <span>التاريخ الهجري: <strong className="text-slate-200">{hijriDate}</strong></span>
            <span className="text-slate-700">•</span>
            <span>الموافق: <strong className="text-slate-300">{gregorianDate}</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
};
