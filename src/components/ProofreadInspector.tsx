import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowLeft, 
  Check, 
  X, 
  BookOpen, 
  Wand2, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { ProofreadMatch } from '../utils/arabicProofreader';

interface ProofreadInspectorProps {
  matches: ProofreadMatch[];
  activeMatchId: string | null;
  onSelectMatch: (id: string) => void;
  onApplyCorrection: (match: ProofreadMatch) => void;
  onApplyAll: () => void;
  onDismissMatch: (id: string) => void;
  onRunAIDeepScan: () => void;
  isDeepScanning: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const ProofreadInspector: React.FC<ProofreadInspectorProps> = ({
  matches,
  activeMatchId,
  onSelectMatch,
  onApplyCorrection,
  onApplyAll,
  onDismissMatch,
  onRunAIDeepScan,
  isDeepScanning,
  isOpen,
  onToggleOpen,
}) => {
  if (!isOpen) return null;

  const getCategoryBadge = (cat: ProofreadMatch['category']) => {
    switch (cat) {
      case 'spelling':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'grammar':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'protocol':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="no-print bg-slate-900 text-slate-100 rounded-xl border border-slate-700 shadow-xl overflow-hidden mb-4 transition-all">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-slate-950 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-cairo flex items-center gap-2">
              <span>مدقق الأخطاء الإملائية والنحوية والمخاطبات الرسمية</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-bold border ${
                matches.length > 0 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {matches.length > 0 ? `${matches.length} ملاحظة مكتشفة` : 'النص سليم'}
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">
              تظليل تلقائي وتصحيح فوري لهمزات الوصل والقطع، التنوين، وقواعد الخطاب الحكومي
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {matches.length > 0 && (
            <button
              onClick={onApplyAll}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors"
              title="تطبيق جميع التصحيحات المقترحة تلقائياً على الخطاب"
            >
              <Check className="w-3.5 h-3.5" />
              <span>تصحيح الكل ({matches.length})</span>
            </button>
          )}

          <button
            onClick={onRunAIDeepScan}
            disabled={isDeepScanning}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            title="فحص عميق وشامل باستخدام نموذج الذكاء الاصطناعي"
          >
            {isDeepScanning ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>جارِ الفحص المعمق...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>فحص معمق (AI)</span>
              </>
            )}
          </button>

          <button
            onClick={onToggleOpen}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            title="إخفاء لوحة التدقيق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body: List of detected issues */}
      <div className="p-3 max-h-64 overflow-y-auto space-y-2">
        {matches.length === 0 ? (
          <div className="py-6 text-center text-slate-400 flex flex-col items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1" />
            <p className="text-xs font-bold text-slate-200">
              لم يتم رصد أي أخطاء إملائية أو نحوية شائعة في النص الحالي!
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              النص متوافق مع قواعد الرسم الإداري واللغوي. يمكنك الضغط على "فحص معمق (AI)" للتدقيق السياقي الإضافي.
            </p>
          </div>
        ) : (
          matches.map((item) => {
            const isActive = activeMatchId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectMatch(item.id)}
                className={`p-2.5 rounded-lg border transition-all text-xs cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 border-amber-400 ring-1 ring-amber-400/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getCategoryBadge(item.category)}`}>
                        {item.categoryLabel}
                      </span>
                      <span className="font-bold text-rose-400 line-through">
                        {item.original}
                      </span>
                      <ArrowLeft className="w-3 h-3 text-slate-500" />
                      <span className="font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                        {item.replacement}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed pr-1">
                      {item.explanation}
                    </p>
                  </div>

                  {/* Actions for this specific issue */}
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onApplyCorrection(item);
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
                      title="استبدال بالصحيح"
                    >
                      <Check className="w-3 h-3" />
                      <span>استبدال</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDismissMatch(item.id);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-200 rounded"
                      title="تجاهل هذه الملاحظة"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
