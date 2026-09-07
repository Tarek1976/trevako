import React, { useState, useMemo, useRef } from 'react';
import { 
  Printer, 
  Copy, 
  Check, 
  Download, 
  Edit3, 
  Sparkles, 
  BrainCircuit, 
  FileCheck2, 
  Stamp, 
  Cpu, 
  Maximize2, 
  QrCode,
  ShieldAlert,
  SpellCheck,
  CheckCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Wand2,
  FileSignature,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  X
} from 'lucide-react';
import { CorrespondenceType, ToneType, SignatureConfig } from '../types';
import { 
  analyzeArabicText, 
  applyCorrection, 
  applyAllCorrections, 
  ProofreadMatch 
} from '../utils/arabicProofreader';
import { ProofreadInspector } from './ProofreadInspector';

interface OfficialLetterPreviewProps {
  type: CorrespondenceType;
  refNumber: string;
  dateHijri: string;
  dateGregorian: string;
  organization: string;
  department: string;
  recipientTitle: string;
  recipientName: string;
  subject: string;
  urgency: string;
  tone: ToneType;
  content: string;
  onContentChange: (newContent: string) => void;
  attachmentsCount: number;
  signatoryTitle: string;
  signatoryName: string;
  copiesTo: string[];
  signatureConfig: SignatureConfig;
  onSignatureConfigChange: (config: SignatureConfig) => void;
  onOpenSignatureManager: () => void;
  onOpenRefine: () => void;
  onOpenMultiModel: () => void;
  onSaveAsTrainingExample: () => void;
  onSaveToArchive: () => void;
}

export const OfficialLetterPreview: React.FC<OfficialLetterPreviewProps> = ({
  type,
  refNumber,
  dateHijri,
  dateGregorian,
  organization,
  department,
  recipientTitle,
  recipientName,
  subject,
  urgency,
  content,
  onContentChange,
  attachmentsCount,
  signatoryTitle,
  signatoryName,
  copiesTo,
  signatureConfig,
  onSignatureConfigChange,
  onOpenSignatureManager,
  onOpenRefine,
  onOpenMultiModel,
  onSaveAsTrainingExample,
  onSaveToArchive,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  // In-Editor Proofreading State
  const [isProofreaderOpen, setIsProofreaderOpen] = useState(true);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [dismissedMatchIds, setDismissedMatchIds] = useState<string[]>([]);
  const [isDeepScanning, setIsDeepScanning] = useState(false);
  const [editTab, setEditTab] = useState<'text' | 'preview_highlights'>('text');

  // Quick signature control panel state & drag interaction
  const [showQuickSignatureControls, setShowQuickSignatureControls] = useState(false);
  const [isDraggingSignature, setIsDraggingSignature] = useState(false);
  const dragOrigin = useRef<{ startX: number; startY: number; initPosX: number; initPosY: number }>({
    startX: 0,
    startY: 0,
    initPosX: 0,
    initPosY: 0,
  });

  // Real-time analysis of Arabic text
  const allMatches = useMemo(() => analyzeArabicText(content), [content]);
  const activeMatches = useMemo(
    () => allMatches.filter((m) => !dismissedMatchIds.includes(m.id)),
    [allMatches, dismissedMatchIds]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Drag handlers for the signature on preview sheet
  const handlePointerDownSignature = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDraggingSignature(true);
    dragOrigin.current = {
      startX: e.clientX,
      startY: e.clientY,
      initPosX: signatureConfig.positionX,
      initPosY: signatureConfig.positionY,
    };
  };

  const handlePointerMoveSignature = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSignature) return;
    const deltaX = e.clientX - dragOrigin.current.startX;
    const deltaY = e.clientY - dragOrigin.current.startY;
    onSignatureConfigChange({
      ...signatureConfig,
      positionX: Math.round(dragOrigin.current.initPosX + deltaX),
      positionY: Math.round(dragOrigin.current.initPosY + deltaY),
    });
  };

  const handlePointerUpSignature = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingSignature) {
      setIsDraggingSignature(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleDownloadDoc = () => {
    const signatureHtml = signatureConfig.isEnabled && signatureConfig.imageUrl
      ? `<br/><img src='${signatureConfig.imageUrl}' width='${signatureConfig.width}' style='margin-top:6px;display:block;'/>`
      : `<div style='border-bottom:1px solid #777;width:130px;height:35px;margin-top:5px;'></div>`;

    const headerHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40' dir='rtl'>
      <head><meta charset='utf-8'><title>${subject}</title>
      <style>body{font-family:'Traditional Arabic',Arial;font-size:16pt;direction:rtl;text-align:right;}</style>
      </head><body>
      <div style='text-align:center;font-weight:bold;font-size:18pt;'>بسم الله الرحمن الرحيم</div>
      <div style='text-align:right;'>${organization} - ${department}</div>
      <div style='text-align:left;'>الرقم: ${refNumber} | التاريخ: ${dateHijri}هـ</div>
      <hr/>
      <h3>الموضوع: ${subject}</h3>
      <p><strong>${recipientTitle} / ${recipientName} المحترم</strong></p>
      <p>السلام عليكم ورحمة الله وبركاته، وبعد:</p>
      <div>${content.replace(/\n/g, '<br/>')}</div>
      <br/><br/>
      <div style='text-align:left;'>
        <strong>${signatoryTitle}</strong><br/>
        ${signatoryName}
        ${signatureHtml}
      </div>
      </body></html>
    `;
    const blob = new Blob([headerHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `مراسلة_إدارية_${refNumber.replace(/[\/\\]/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Proofreading Handlers
  const handleApplySingleCorrection = (match: ProofreadMatch) => {
    const updated = applyCorrection(content, match);
    onContentChange(updated);
    setActiveMatchId(null);
    setSavedStatus(`تم استبدال (${match.original}) بـ (${match.replacement})`);
    setTimeout(() => setSavedStatus(null), 3000);
  };

  const handleApplyAllCorrections = () => {
    if (activeMatches.length === 0) return;
    const count = activeMatches.length;
    const updated = applyAllCorrections(content, activeMatches);
    onContentChange(updated);
    setActiveMatchId(null);
    setSavedStatus(`✓ تم تصحيح جميع الملاحظات اللغوية والإملائية بنجاح (${count} موضعاً).`);
    setTimeout(() => setSavedStatus(null), 4000);
  };

  const handleDismissMatch = (id: string) => {
    setDismissedMatchIds((prev) => [...prev, id]);
    if (activeMatchId === id) setActiveMatchId(null);
  };

  const handleRunAIDeepScan = async () => {
    if (!content.trim()) return;
    setIsDeepScanning(true);
    setSavedStatus(null);

    try {
      const res = await fetch('/api/correspondence/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentText: content,
          action: 'proofread',
          instructions: 'تدقيق نحوي وإملائي محكم مع الحفاظ الكامل على الأرقام والبيانات الإدارية الرسمية.',
        }),
      });

      const data = await res.json();
      if (data.success && data.refinedText) {
        onContentChange(data.refinedText);
        setSavedStatus('✓ اكتمل الفحص المعمق وتم تطبيق التحسينات اللغوية الإدارية بنجاح.');
        setTimeout(() => setSavedStatus(null), 5000);
      }
    } catch (err) {
      console.error('Failed AI deep scan', err);
    } finally {
      setIsDeepScanning(false);
    }
  };

  const typeLabels: Record<CorrespondenceType, string> = {
    letter: 'خطاب رسمي',
    memo: 'مذكرة داخلية',
    circular: 'تعميم إداري',
    decision: 'قرار إداري',
    minutes: 'محضر اجتماع',
    report: 'تقرير إداري',
    reply: 'رد رسمي / إفادة',
  };

  // Render Highlighted Text with interactive markers
  const renderHighlightedContent = (rawText: string) => {
    if (!activeMatches || activeMatches.length === 0) {
      return <span className="whitespace-pre-line">{rawText}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    activeMatches.forEach((m, idx) => {
      // Chunk before match
      if (m.index > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>{rawText.substring(lastIndex, m.index)}</span>
        );
      }

      const isActive = activeMatchId === m.id;
      const categoryStyle =
        m.category === 'spelling'
          ? 'underline decoration-rose-500 decoration-wavy decoration-2 bg-rose-50/80 hover:bg-rose-100 text-rose-950'
          : m.category === 'grammar'
          ? 'underline decoration-amber-500 decoration-wavy decoration-2 bg-amber-50/80 hover:bg-amber-100 text-amber-950'
          : 'underline decoration-purple-500 decoration-wavy decoration-2 bg-purple-50/80 hover:bg-purple-100 text-purple-950';

      elements.push(
        <span
          key={`match-${m.id}-${idx}`}
          className="relative inline-block"
        >
          <span
            onClick={(e) => {
              e.stopPropagation();
              setActiveMatchId(isActive ? null : m.id);
            }}
            title={`${m.categoryLabel}: ${m.explanation} (انقر للتصحيح: ${m.replacement})`}
            className={`cursor-pointer px-1 py-0.5 rounded font-semibold transition-all ${categoryStyle} ${
              isActive ? 'ring-2 ring-amber-500 shadow-xs' : ''
            }`}
          >
            {m.original}
          </span>

          {/* Inline Suggestion Popover */}
          {isActive && (
            <span
              onClick={(e) => e.stopPropagation()}
              className="no-print absolute bottom-full mb-2 right-0 z-40 bg-slate-900 text-white text-xs p-3 rounded-xl shadow-2xl border border-slate-700 w-64 text-right block animate-in fade-in zoom-in-95 duration-150"
            >
              <span className="flex items-center justify-between pb-1 border-b border-slate-800 mb-1.5">
                <span className="font-bold text-amber-400 text-[11px]">{m.categoryLabel}</span>
                <button
                  onClick={() => setActiveMatchId(null)}
                  className="text-slate-400 hover:text-white text-[10px]"
                >
                  ✕
                </button>
              </span>
              <span className="block text-[11px] text-slate-300 leading-snug mb-2">
                {m.explanation}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleApplySingleCorrection(m)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-2 rounded-lg text-[10px] flex items-center justify-center gap-1 shadow-xs"
                >
                  <Check className="w-3 h-3" />
                  <span>تصحيح: {m.replacement}</span>
                </button>
                <button
                  onClick={() => handleDismissMatch(m.id)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px]"
                >
                  تجاهل
                </button>
              </div>
            </span>
          )}
        </span>
      );

      lastIndex = m.index + m.length;
    });

    // Remainder
    if (lastIndex < rawText.length) {
      elements.push(<span key="text-end">{rawText.substring(lastIndex)}</span>);
    }

    return <div className="whitespace-pre-line leading-relaxed">{elements}</div>;
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
      {/* Top Action Toolbar (Hidden during Print) */}
      <div className="no-print bg-white px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            معاينة الورقة الرسمية المعتمدة ({typeLabels[type]})
          </span>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-all ${
              isEditing 
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-600' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'إنهاء التحرير' : 'تحرير النص'}</span>
          </button>

          {/* Dedicated Proofreading Tool Switch with dynamic counter */}
          <button
            onClick={() => setIsProofreaderOpen(!isProofreaderOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              isProofreaderOpen
                ? 'bg-slate-900 text-white border-slate-950 shadow-xs'
                : activeMatches.length > 0
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}
            title="أداة تظليل وتدقيق الأخطاء الإملائية والنحوية والمخاطبات"
          >
            <SpellCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>التدقيق اللغوي</span>
            {activeMatches.length > 0 ? (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                {activeMatches.length}
              </span>
            ) : (
              <span className="text-emerald-500 text-[10px]">✓ سليم</span>
            )}
          </button>

          {/* Digital Signature & Position Control Button */}
          <button
            onClick={onOpenSignatureManager}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              signatureConfig.isEnabled && signatureConfig.imageUrl
                ? 'bg-blue-900 text-white border-blue-950 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="إدارة وضبط صورة التوقيع الرقمي للمسؤول المعتمد"
          >
            <FileSignature className="w-3.5 h-3.5 text-amber-400" />
            <span>التوقيع الرقمي</span>
            {signatureConfig.isEnabled && signatureConfig.imageUrl ? (
              <span className="bg-blue-700 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                {signatureConfig.width}px
              </span>
            ) : (
              <span className="text-slate-400 text-[10px]">+ إضافة</span>
            )}
          </button>

          {/* Toggle Quick Sliders on the Preview */}
          {signatureConfig.imageUrl && (
            <button
              onClick={() => setShowQuickSignatureControls(!showQuickSignatureControls)}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                showQuickSignatureControls 
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs font-bold' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="لوحة الضبط السريع لموضع وحجم التوقيع في المعاينة"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* AI Refine Button */}
          <button
            onClick={onOpenRefine}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors"
            title="تدقيق وتحسين الصياغة وتعديل النبرة"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>تحسين النبرة (AI)</span>
          </button>

          {/* Multi AI Engine Button */}
          <button
            onClick={onOpenMultiModel}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200 transition-colors"
            title="تجهيز المطالبة للنماذج الأخرى مثل DeepSeek / ChatGPT / Claude"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
            <span>محول النماذج (DeepSeek...)</span>
          </button>

          {/* Add to Training Memory */}
          <button
            onClick={() => {
              onSaveAsTrainingExample();
              setSavedStatus('تم الحفظ في قاعدة التدريب');
              setTimeout(() => setSavedStatus(null), 3000);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-300 transition-colors"
            title="إضافة هذا الخطاب لتدريب الذكاء الاصطناعي على أسلوب المؤسسة مستقبلاً"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-amber-600" />
            <span>حفظ للتدريب</span>
          </button>

          {/* Copy Text */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
            title="نسخ النص"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
          </button>

          {/* Word Download */}
          <button
            onClick={handleDownloadDoc}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
            title="تنزيل كملف Word"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Word</span>
          </button>

          {/* Save to Archive */}
          <button
            onClick={() => {
              onSaveToArchive();
              setSavedStatus('تم الحفظ في الأرشيف');
              setTimeout(() => setSavedStatus(null), 3000);
            }}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
            title="حفظ المعاملة في الأرشيف"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-slate-700" />
            <span>أرشفة</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            title="طباعة الخطاب الرسمي المعتمد"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة A4</span>
          </button>
        </div>
      </div>

      {savedStatus && (
        <div className="no-print bg-emerald-50 text-emerald-800 text-xs font-semibold px-4 py-2 border-b border-emerald-200 flex items-center justify-between animate-in fade-in">
          <span>{savedStatus}</span>
          <button onClick={() => setSavedStatus(null)} className="text-emerald-700 hover:underline text-[11px]">إغلاق</button>
        </div>
      )}

      {/* Quick Signature Position & Size Control Bar (Non-printing) */}
      {showQuickSignatureControls && signatureConfig.imageUrl && (
        <div className="no-print bg-slate-900 text-white px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs shadow-md animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-bold text-amber-400">
              <Sliders className="w-3.5 h-3.5" />
              <span>ضبط موضع وحجم التوقيع:</span>
            </span>
            <span className="text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              يمكنك أيضاً سحب التوقيع مباشرة بالفأرة على الورقة
            </span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Width Slider */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">الحجم:</span>
              <input
                type="range"
                min="60"
                max="260"
                value={signatureConfig.width}
                onChange={(e) => onSignatureConfigChange({ ...signatureConfig, width: Number(e.target.value) })}
                className="w-24 accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
              <span className="font-mono text-amber-300 text-[11px] w-9">{signatureConfig.width}px</span>
            </div>

            {/* X Offset */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">أفقي (X):</span>
              <input
                type="range"
                min="-120"
                max="120"
                value={signatureConfig.positionX}
                onChange={(e) => onSignatureConfigChange({ ...signatureConfig, positionX: Number(e.target.value) })}
                className="w-20 accent-blue-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
              <span className="font-mono text-slate-300 text-[11px] w-7">{signatureConfig.positionX}</span>
            </div>

            {/* Y Offset */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">رأسي (Y):</span>
              <input
                type="range"
                min="-60"
                max="60"
                value={signatureConfig.positionY}
                onChange={(e) => onSignatureConfigChange({ ...signatureConfig, positionY: Number(e.target.value) })}
                className="w-20 accent-blue-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
              <span className="font-mono text-slate-300 text-[11px] w-7">{signatureConfig.positionY}</span>
            </div>

            {/* Rotation */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">الميلان:</span>
              <input
                type="range"
                min="-25"
                max="25"
                value={signatureConfig.rotation}
                onChange={(e) => onSignatureConfigChange({ ...signatureConfig, rotation: Number(e.target.value) })}
                className="w-16 accent-emerald-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
              <span className="font-mono text-slate-300 text-[11px] w-7">{signatureConfig.rotation}°</span>
            </div>

            {/* Reset position */}
            <button
              onClick={() => onSignatureConfigChange({ ...signatureConfig, positionX: 0, positionY: 0, rotation: 0 })}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="إعادة التوقيع للموضع الافتراضي"
            >
              تصفير الموضع
            </button>

            {/* Full Manager Button */}
            <button
              onClick={onOpenSignatureManager}
              className="text-[11px] px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
            >
              إعدادات متقدمة
            </button>

            {/* Close Slider Bar */}
            <button
              onClick={() => setShowQuickSignatureControls(false)}
              className="p-1 text-slate-400 hover:text-white rounded"
              title="إغلاق شريط الضبط"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Official A4 Paper Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
        {/* Integrated Proofreading Inspector Drawer (Non-printing) */}
        <div className="w-full max-w-4xl">
          <ProofreadInspector
            matches={activeMatches}
            activeMatchId={activeMatchId}
            onSelectMatch={setActiveMatchId}
            onApplyCorrection={handleApplySingleCorrection}
            onApplyAll={handleApplyAllCorrections}
            onDismissMatch={handleDismissMatch}
            onRunAIDeepScan={handleRunAIDeepScan}
            isDeepScanning={isDeepScanning}
            isOpen={isProofreaderOpen}
            onToggleOpen={() => setIsProofreaderOpen(!isProofreaderOpen)}
          />
        </div>

        <div 
          id="official-letterhead"
          className="print-sheet bg-white text-slate-950 w-full max-w-4xl min-h-[1100px] shadow-xl rounded-sm p-8 sm:p-14 border border-slate-300 relative flex flex-col justify-between"
          style={{ fontFamily: "'Cairo', 'Amiri', serif" }}
        >
          {/* Header Section */}
          <div>
            <div className="grid grid-cols-3 items-start border-b-2 border-slate-800 pb-5 mb-6">
              {/* Right Side: Entity Info */}
              <div className="text-right space-y-1">
                <p className="text-xs font-bold text-slate-600 tracking-wider">المملكة العربية السعودية</p>
                <h2 className="text-base font-black text-slate-900 leading-snug">{organization || 'الوزارة / الديوان العام'}</h2>
                <p className="text-xs font-semibold text-slate-700">{department || 'الإدارة العامة للمراسلات والاتصالات الإدارية'}</p>
              </div>

              {/* Center: Official Coat of Arms & Basmala */}
              <div className="flex flex-col items-center justify-center text-center">
                {/* Official Emblem Icon */}
                <div className="w-12 h-12 rounded-full border border-amber-800/40 flex items-center justify-center mb-1 text-amber-800 bg-amber-50/50">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div className="font-amiri text-lg font-bold text-slate-900 tracking-wide">
                  بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ
                </div>
                {urgency && urgency !== 'عادي' && (
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                    <ShieldAlert className="w-3 h-3" />
                    {urgency}
                  </span>
                )}
              </div>

              {/* Left Side: Metadata Box */}
              <div className="text-left text-xs space-y-1.5 bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex justify-between items-center text-slate-800">
                  <span className="font-bold text-slate-600">الرقم:</span>
                  <span className="font-mono font-bold text-slate-950">{refNumber}</span>
                </div>
                <div className="flex justify-between items-center text-slate-800">
                  <span className="font-bold text-slate-600">التاريخ:</span>
                  <span className="font-medium text-slate-900">{dateHijri}هـ</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 text-[11px]">
                  <span>الموافق:</span>
                  <span>{dateGregorian}م</span>
                </div>
                <div className="flex justify-between items-center text-slate-800">
                  <span className="font-bold text-slate-600">المشفوعات:</span>
                  <span className="font-bold text-slate-900">
                    {attachmentsCount > 0 ? `${attachmentsCount} مستند/مرفق` : 'لا يوجد'}
                  </span>
                </div>
              </div>
            </div>

            {/* Subject Banner */}
            <div className="bg-slate-50 border border-slate-300 rounded px-4 py-2.5 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">الموضوع:</span>
                <span className="text-sm font-extrabold text-slate-800 underline decoration-slate-400 decoration-1 underline-offset-4">
                  {subject || 'إعداد مكاتبة إدارية رسمية'}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                {typeLabels[type]}
              </span>
            </div>

            {/* Recipient Addressee */}
            <div className="mb-6 space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                {recipientTitle} / {recipientName || 'الجهة المعنية'}
                <span className="mr-3 text-slate-700 font-semibold">المحترم</span>
              </h3>
              <p className="text-sm font-semibold text-slate-800 pr-2">
                السلام عليكم ورحمة الله وبركاته، وبعد:
              </p>
            </div>

            {/* Body Content */}
            <div className="mb-8 leading-relaxed text-slate-900 text-justify">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-amber-50 p-2 rounded-lg border border-amber-200">
                    <span className="text-xs font-bold text-amber-900">
                      وضع التحرير المباشر: يمكنك الكتابة بحرية، وتقوم أداة التدقيق برصد الملاحظات تلقائياً.
                    </span>

                    <div className="flex items-center gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setEditTab('text')}
                        className={`px-2.5 py-1 rounded font-bold transition-colors ${
                          editTab === 'text'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        محرر الكتابة
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditTab('preview_highlights')}
                        className={`px-2.5 py-1 rounded font-bold transition-colors ${
                          editTab === 'preview_highlights'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        معاينة التظليل ({activeMatches.length})
                      </button>
                    </div>
                  </div>

                  {editTab === 'text' ? (
                    <textarea
                      value={content}
                      onChange={(e) => onContentChange(e.target.value)}
                      rows={18}
                      className="w-full p-4 border border-amber-400 rounded-lg text-sm md:text-base leading-relaxed font-cairo focus:ring-2 focus:ring-amber-500 focus:outline-none bg-amber-50/20"
                    />
                  ) : (
                    <div className="p-4 border border-slate-300 rounded-lg bg-white min-h-[350px] text-sm md:text-base">
                      {renderHighlightedContent(content)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="prose max-w-none text-slate-900 text-sm md:text-base font-cairo">
                  {content ? (
                    isProofreaderOpen ? (
                      renderHighlightedContent(content)
                    ) : (
                      <div className="whitespace-pre-line leading-relaxed">{content}</div>
                    )
                  ) : (
                    <div className="py-20 text-center text-slate-400">
                      <p className="text-base font-semibold mb-2">لم يتم إنشاء نص المراسلة بعد</p>
                      <p className="text-xs">
                        استخدم نموذج الإعداد على اليمين لتوليد الخطاب بالذكاء الاصطناعي مع الأسانيد والقوانين المرفقة.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Signatory, Stamp & Verification Footer */}
          <div className="pt-6 border-t border-slate-200 mt-auto">
            {/* Signatory Grid */}
            <div className="grid grid-cols-2 items-end mb-6">
              {/* Left/Barcode & Verification */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-600 text-xs">
                  <div className="p-1 border border-slate-300 rounded bg-slate-50">
                    <QrCode className="w-10 h-10 text-slate-800" />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] font-bold text-slate-800 tracking-wider">
                      REF-{refNumber.replace(/[\/\\]/g, '-')}
                    </p>
                    <p className="text-[10px] text-slate-500">معاملة معتمدة إلكترونياً</p>
                    <p className="text-[9px] text-slate-400">صادرة بموجب أنظمة التعاملات الرسمية</p>
                  </div>
                </div>
              </div>

              {/* Right/Signatory Name, Title, Digital Signature & Official Stamp */}
              <div className="text-left pl-4 space-y-1 relative group/signatory">
                {/* Simulated Official Blue Stamp */}
                {signatureConfig.showOfficialStamp && (
                  <div className="absolute -top-10 left-12 opacity-85 pointer-events-none transform -rotate-12 border-2 border-dashed border-blue-700/60 rounded-full w-24 h-24 flex flex-col items-center justify-center text-blue-800 font-bold p-1 text-[9px] text-center z-10 select-none">
                    <span className="text-[8px] font-black">{organization || 'الديوان العام'}</span>
                    <span className="text-[7px] text-blue-900">الاتصالات الإدارية</span>
                    <span className="text-[8px] border-t border-b border-blue-600 py-0.5 my-0.5">معتمد رسمياً</span>
                    <span className="text-[7px]">{dateHijri}هـ</span>
                  </div>
                )}

                <p className="text-sm font-bold text-slate-800">{signatoryTitle || 'صاحب الصلاحية'}</p>
                <p className="text-base font-black text-slate-900 pt-1">{signatoryName || 'اسم المسؤول المعتمد'}</p>

                {/* Digital Signature Container */}
                <div className={`relative min-h-[60px] flex ${
                  signatureConfig.alignment === 'center' 
                    ? 'justify-center' 
                    : signatureConfig.alignment === 'right' 
                    ? 'justify-end' 
                    : 'justify-start'
                } items-end pt-1`}>
                  {signatureConfig.isEnabled && signatureConfig.imageUrl ? (
                    <div
                      className={`relative inline-block select-none cursor-grab active:cursor-grabbing group/sig transition-shadow rounded-sm ${
                        isDraggingSignature ? 'ring-2 ring-blue-500 shadow-md bg-blue-50/20' : 'hover:ring-1 hover:ring-blue-400'
                      }`}
                      style={{
                        transform: `translate(${signatureConfig.positionX}px, ${signatureConfig.positionY}px) rotate(${signatureConfig.rotation}deg)`,
                        opacity: signatureConfig.opacity,
                        touchAction: 'none',
                      }}
                      onPointerDown={handlePointerDownSignature}
                      onPointerMove={handlePointerMoveSignature}
                      onPointerUp={handlePointerUpSignature}
                      onPointerCancel={handlePointerUpSignature}
                      title="اسحب بالفأرة لتغيير مكان التوقيع بدقة على الورقة"
                    >
                      <img
                        src={signatureConfig.imageUrl}
                        alt="التوقيع الرقمي"
                        style={{ width: `${signatureConfig.width}px` }}
                        className="pointer-events-none drop-shadow-2xs select-none max-w-none block"
                        draggable={false}
                      />

                      {/* On-Hover Quick Floating Controls (Hidden during print) */}
                      <div className="no-print absolute -top-8 right-1/2 transform translate-x-1/2 bg-slate-900/90 backdrop-blur-xs text-white rounded-md shadow-lg py-0.5 px-1.5 flex items-center gap-1 opacity-0 group-hover/sig:opacity-100 transition-opacity z-30 text-[10px] whitespace-nowrap">
                        <span className="flex items-center text-amber-300 mr-0.5">
                          <Move className="w-2.5 h-2.5" />
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSignatureConfigChange({
                              ...signatureConfig,
                              width: Math.max(60, signatureConfig.width - 10),
                            });
                          }}
                          className="px-1 py-0.5 hover:bg-slate-700 rounded text-[9px]"
                          title="تصغير الحجم"
                        >
                          -
                        </button>
                        <span className="font-mono text-[9px] text-slate-300">{signatureConfig.width}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSignatureConfigChange({
                              ...signatureConfig,
                              width: Math.min(260, signatureConfig.width + 10),
                            });
                          }}
                          className="px-1 py-0.5 hover:bg-slate-700 rounded text-[9px]"
                          title="تكبير الحجم"
                        >
                          +
                        </button>
                        <div className="w-px h-2.5 bg-slate-700" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSignatureConfigChange({
                              ...signatureConfig,
                              rotation: signatureConfig.rotation - 2,
                            });
                          }}
                          className="px-1 py-0.5 hover:bg-slate-700 rounded text-[9px]"
                          title="تدوير لليسار"
                        >
                          ↺
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSignatureConfigChange({
                              ...signatureConfig,
                              rotation: signatureConfig.rotation + 2,
                            });
                          }}
                          className="px-1 py-0.5 hover:bg-slate-700 rounded text-[9px]"
                          title="تدوير لليمين"
                        >
                          ↻
                        </button>
                        <div className="w-px h-2.5 bg-slate-700" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenSignatureManager();
                          }}
                          className="px-1.5 py-0.5 hover:bg-slate-700 text-amber-400 rounded text-[9px] font-bold"
                          title="إعدادات وضبط التوقيع"
                        >
                          تعديل
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={onOpenSignatureManager}
                      className="no-print h-10 w-32 border border-dashed border-slate-300 hover:border-amber-500 rounded text-slate-400 hover:text-amber-700 text-[10px] flex items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-amber-50/30"
                      title="انقر لإدراج صورة توقيع رقمي للمسؤول"
                    >
                      + إضافة توقيع رقمي
                    </div>
                  )}

                  {/* Fallback signature line when printing without an image */}
                  {(!signatureConfig.isEnabled || !signatureConfig.imageUrl) && (
                    <div className="print-only h-9 w-28 border-b border-slate-400 text-slate-400 text-[10px] flex items-end justify-start italic">
                      التوقيع الرسمي المعتمد
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Copies to (صورة مع التحية إلى) */}
            {copiesTo && copiesTo.length > 0 && (
              <div className="pt-3 border-t border-dashed border-slate-200 text-xs text-slate-600">
                <span className="font-bold text-slate-800 ml-1">صورة مع التحية إلى:</span>
                <ul className="list-disc list-inside inline-flex flex-wrap gap-x-4 gap-y-1 pr-2">
                  {copiesTo.map((copy, index) => (
                    <li key={index} className="text-slate-700">{copy}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
