import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  Smile, 
  Minimize2, 
  FileText, 
  ArrowLeft,
  X,
  Send
} from 'lucide-react';

interface RefineToolbarProps {
  isOpen: boolean;
  onClose: () => void;
  currentContent: string;
  onApplyRefined: (newText: string) => void;
}

export const RefineToolbar: React.FC<RefineToolbarProps> = ({
  isOpen,
  onClose,
  currentContent,
  onApplyRefined,
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [refinedResult, setRefinedResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRefineAction = async (action: string, instructions?: string) => {
    if (!currentContent.trim()) {
      setErrorMsg('نص الخطاب فارغ، يرجى كتابة أو توليد مسودة أولاً');
      return;
    }

    setLoadingAction(action);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/correspondence/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentText: currentContent,
          action,
          instructions: instructions || customPrompt,
        }),
      });

      const data = await response.json();
      if (data.success && data.refinedText) {
        setRefinedResult(data.refinedText);
      } else {
        setErrorMsg(data.error || 'تعذر تحسين النص');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleApply = () => {
    if (refinedResult) {
      onApplyRefined(refinedResult);
      onClose();
      setRefinedResult(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base font-cairo">
              أدوات التدقيق والتحسين الإداري الذكي (AI Refine)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Quick Action Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              اختر إجراء التحسين المطلوب:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={!!loadingAction}
                onClick={() => handleRefineAction('proofread')}
                className="p-3 text-right rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all flex items-start gap-2.5 bg-slate-50/50"
              >
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">تدقيق لغوي وإملائي محكم</div>
                  <div className="text-[11px] text-slate-500">إصلاح الركاكة، وضبط النحو وعلامات الترقيم</div>
                </div>
              </button>

              <button
                type="button"
                disabled={!!loadingAction}
                onClick={() => handleRefineAction('make_firmer')}
                className="p-3 text-right rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all flex items-start gap-2.5 bg-slate-50/50"
              >
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-800 shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">رفع نبرة الحزم والصرامة</div>
                  <div className="text-[11px] text-slate-500">تأكيد الالتزام بالأنظمة والمواعيد والمسؤوليات</div>
                </div>
              </button>

              <button
                type="button"
                disabled={!!loadingAction}
                onClick={() => handleRefineAction('make_diplomatic')}
                className="p-3 text-right rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all flex items-start gap-2.5 bg-slate-50/50"
              >
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800 shrink-0">
                  <Smile className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">صياغة دبلوماسية وتعاونية</div>
                  <div className="text-[11px] text-slate-500">للتنسيق بين الجهات والشركاء والمقامات العليا</div>
                </div>
              </button>

              <button
                type="button"
                disabled={!!loadingAction}
                onClick={() => handleRefineAction('summarize')}
                className="p-3 text-right rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all flex items-start gap-2.5 bg-slate-50/50"
              >
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-800 shrink-0">
                  <Minimize2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">اختصار وإيجاز إداري</div>
                  <div className="text-[11px] text-slate-500">تركيز المطالب مع الحفاظ على الأسانيد النظامية</div>
                </div>
              </button>
            </div>
          </div>

          {/* Custom Instruction Box */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              أو اكتب تعليمات تحسين خاصة (توجيه حر):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="مثال: أضف فقرة تؤكد على مراعاة الميزانية المقررة في الربع الثالث..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <button
                type="button"
                disabled={!customPrompt.trim() || !!loadingAction}
                onClick={() => handleRefineAction('custom', customPrompt)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>تطبيق</span>
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {loadingAction && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center flex items-center justify-center gap-2 text-xs font-bold text-amber-900">
              <div className="w-4 h-4 border-2 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
              <span>جارِ معالجة وتدقيق الخطاب إدارياً...</span>
            </div>
          )}

          {/* Refined Result Preview */}
          {refinedResult && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  معاينة النص بعد التحسين:
                </span>
                <span className="text-[10px] text-slate-400">يمكنك اعتماده الآن في الخطاب</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-emerald-200 rounded-xl max-h-56 overflow-y-auto text-xs sm:text-sm whitespace-pre-line leading-relaxed text-slate-800">
                {refinedResult}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
          >
            إلغاء
          </button>
          {refinedResult && (
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              اعتماد واستبدال في الخطاب الرسمي
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
