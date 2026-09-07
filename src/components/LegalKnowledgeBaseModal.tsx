import React, { useState, useRef } from 'react';
import { 
  Scale, 
  Scroll, 
  Plus, 
  Search, 
  Check, 
  Sparkles, 
  FileText, 
  Trash2, 
  X,
  BookOpen,
  Filter,
  Upload,
  FileCheck2,
  Loader2,
  FileCode,
  FileBadge
} from 'lucide-react';
import { extractTextFromPDF } from '../utils/pdfParser';
import { LawDocument, CircularDocument } from '../types';

interface LegalKnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  laws: LawDocument[];
  onToggleLaw: (id: string) => void;
  onAddLaw: (law: LawDocument) => void;
  onDeleteLaw: (id: string) => void;
  circulars: CircularDocument[];
  onToggleCircular: (id: string) => void;
  onAddCircular: (circular: CircularDocument) => void;
  onDeleteCircular: (id: string) => void;
}

export const LegalKnowledgeBaseModal: React.FC<LegalKnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  laws,
  onToggleLaw,
  onAddLaw,
  onDeleteLaw,
  circulars,
  onToggleCircular,
  onAddCircular,
  onDeleteCircular,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'laws' | 'circulars' | 'add_new'>('laws');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Item Form State
  const [newType, setNewType] = useState<'law' | 'circular'>('law');
  const [newTitle, setNewTitle] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newAuthority, setNewAuthority] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  // PDF Upload State
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [pdfPagesCount, setPdfPagesCount] = useState<number | null>(null);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingPdf(true);
    setPdfError(null);

    try {
      const result = await extractTextFromPDF(file);
      setPdfFileName(file.name);
      setPdfPagesCount(result.numPages);
      setNewContent(result.text);

      // If user hasn't set a title yet, derive one from file name
      if (!newTitle.trim()) {
        const cleanName = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
        setNewTitle(result.titleHint || cleanName);
      }

      // Auto-set summary if empty
      if (!newSummary.trim()) {
        const excerpt = result.text.substring(0, 150).replace(/\s+/g, ' ').trim();
        setNewSummary(excerpt ? `${excerpt}...` : `مستند مستخرج من ملف PDF (${result.numPages} صفحات)`);
      }
    } catch (err: any) {
      console.error('PDF extraction error:', err);
      setPdfError(err?.message || 'تعذر استخراج النصوص من ملف الـ PDF. يرجى التأكد من أن الملف غير محمي بكلمة مرور ويحتوي على نصوص.');
    } finally {
      setIsParsingPdf(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearPdf = () => {
    setPdfFileName(null);
    setPdfPagesCount(null);
    setPdfError(null);
  };

  if (!isOpen) return null;

  // AI Document Summarizer
  const handleAnalyzeWithAI = async () => {
    if (!newContent.trim()) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/documents/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docTitle: newTitle,
          docText: newContent,
          docType: newType === 'law' ? 'نظام وقانون' : 'منشور وتعميم إداري',
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateNew = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    if (newType === 'law') {
      const newLaw: LawDocument = {
        id: `law-${Date.now()}`,
        title: newTitle,
        category: 'نظام',
        number: newNumber || 'م/غير محدد',
        year: newYear || '1445هـ',
        summary: newSummary || newContent.substring(0, 100),
        content: newContent,
        keyArticles: analysisResult ? [analysisResult.substring(0, 80)] : ['المواد النظامية المستخرجة'],
        selected: true,
        pdfFileName: pdfFileName || undefined,
        pdfPagesCount: pdfPagesCount || undefined,
      };
      onAddLaw(newLaw);
    } else {
      const newCirc: CircularDocument = {
        id: `circ-${Date.now()}`,
        number: newNumber || `${new Date().getFullYear()}/ت`,
        title: newTitle,
        date: newYear || '1445هـ',
        authority: newAuthority || 'الوزارة / الديوان',
        summary: newSummary || newContent.substring(0, 100),
        content: newContent,
        selected: true,
        pdfFileName: pdfFileName || undefined,
        pdfPagesCount: pdfPagesCount || undefined,
      };
      onAddCircular(newCirc);
    }

    // Reset Form
    setNewTitle('');
    setNewNumber('');
    setNewYear('');
    setNewAuthority('');
    setNewSummary('');
    setNewContent('');
    setPdfFileName(null);
    setPdfPagesCount(null);
    setPdfError(null);
    setAnalysisResult(null);
    setActiveSubTab(newType === 'law' ? 'laws' : 'circulars');
  };

  const filteredLaws = laws.filter(
    (l) => l.title.includes(searchQuery) || l.summary.includes(searchQuery) || l.content.includes(searchQuery)
  );

  const filteredCirculars = circulars.filter(
    (c) => c.title.includes(searchQuery) || c.authority.includes(searchQuery) || c.content.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-cairo">
                مستودع الأنظمة والقوانين والمناشير الإدارية المعتمدة
              </h3>
              <p className="text-xs text-slate-400">
                قاعدة المعرفة الحاكمة لصياغة وتأصيل المراسلات الرسمية بالذكاء الاصطناعي
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation & Search Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveSubTab('laws')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'laws'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>القوانين والأنظمة ({laws.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('circulars')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'circulars'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Scroll className="w-3.5 h-3.5" />
              <span>المناشير والتعاميم الوزارية ({circulars.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('add_new')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'add_new'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-300'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة نظام / منشور جديد</span>
            </button>
          </div>

          {activeSubTab !== 'add_new' && (
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في الأنظمة والمواد..."
                className="w-full pr-8 pl-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Laws View */}
          {activeSubTab === 'laws' && (
            <div className="space-y-3">
              {filteredLaws.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  لا توجد نتائج تطابق بحثك.
                </div>
              ) : (
                filteredLaws.map((law) => (
                  <div
                    key={law.id}
                    className={`p-4 rounded-xl border transition-all ${
                      law.selected
                        ? 'border-amber-400 bg-amber-50/40 ring-1 ring-amber-400/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={law.selected || false}
                          onChange={() => onToggleLaw(law.id)}
                          className="w-4 h-4 mt-1 accent-amber-600 cursor-pointer rounded"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900">{law.title}</h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                              {law.category} {law.number ? `رقم ${law.number}` : ''} ({law.year})
                            </span>
                            {law.pdfFileName && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800 flex items-center gap-1 border border-red-200">
                                <span>PDF</span>
                                {law.pdfPagesCount ? `(${law.pdfPagesCount} ص)` : ''}
                              </span>
                            )}
                            {law.selected && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                مفعّل في المراسلة الحالية
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{law.summary}</p>
                          <div className="pt-2">
                            <details className="text-xs text-slate-700">
                              <summary className="font-semibold text-amber-800 cursor-pointer hover:underline">
                                عرض نصوص المواد القانونية المعتمدة ({law.content.split('\n').length} فقرات)
                              </summary>
                              <pre className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans whitespace-pre-line leading-relaxed text-slate-800">
                                {law.content}
                              </pre>
                            </details>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteLaw(law.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="حذف من المستودع"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Circulars View */}
          {activeSubTab === 'circulars' && (
            <div className="space-y-3">
              {filteredCirculars.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  لا توجد مناشير أو تعاميم تطابق بحثك.
                </div>
              ) : (
                filteredCirculars.map((circ) => (
                  <div
                    key={circ.id}
                    className={`p-4 rounded-xl border transition-all ${
                      circ.selected
                        ? 'border-blue-400 bg-blue-50/40 ring-1 ring-blue-400/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={circ.selected || false}
                          onChange={() => onToggleCircular(circ.id)}
                          className="w-4 h-4 mt-1 accent-blue-600 cursor-pointer rounded"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900">{circ.title}</h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                              تعميم رقم: {circ.number} ({circ.date})
                            </span>
                            {circ.pdfFileName && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800 flex items-center gap-1 border border-red-200">
                                <span>PDF</span>
                                {circ.pdfPagesCount ? `(${circ.pdfPagesCount} ص)` : ''}
                              </span>
                            )}
                            {circ.selected && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                مفعّل في المراسلة الحالية
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-slate-500">
                            الجهة المصدرة: {circ.authority}
                          </p>
                          <p className="text-xs text-slate-600 leading-relaxed">{circ.summary}</p>
                          <div className="pt-2">
                            <details className="text-xs text-slate-700">
                              <summary className="font-semibold text-blue-800 cursor-pointer hover:underline">
                                عرض نص المنشور / التعميم الكامل
                              </summary>
                              <pre className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans whitespace-pre-line leading-relaxed text-slate-800">
                                {circ.content}
                              </pre>
                            </details>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteCircular(circ.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="حذف من المستودع"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Add New Document Tab */}
          {activeSubTab === 'add_new' && (
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-slate-800">نوع الوثيقة الجديدة:</span>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="newType"
                    checked={newType === 'law'}
                    onChange={() => setNewType('law')}
                    className="accent-amber-600"
                  />
                  <span>نظام / قانون / لائحة تنفيذية</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="newType"
                    checked={newType === 'circular'}
                    onChange={() => setNewType('circular')}
                    className="accent-blue-600"
                  />
                  <span>منشور إداري / تعميم وزاري</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    عنوان الوثيقة أو النظام
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: لائحة تفويض الصلاحيات المالية والإدارية"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الرقم والتاريخ
                  </label>
                  <input
                    type="text"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    placeholder="مثال: تعميم 45/99 أو م/12"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* PDF File Upload Zone */}
              <div className="p-3.5 bg-amber-50/50 rounded-xl border border-dashed border-amber-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                      PDF
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        تحميل مستند النظام أو المنشور بصيغة PDF
                      </span>
                      <span className="text-[11px] text-slate-500">
                        سيقوم النظام باستخراج نصوص المواد القانونية أو بنود التعميم تلقائياً
                      </span>
                    </div>
                  </div>

                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".pdf,application/pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                      id="legal-pdf-upload"
                    />
                    <label
                      htmlFor="legal-pdf-upload"
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs ${
                        isParsingPdf
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/70'
                      }`}
                    >
                      {isParsingPdf ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                          <span>جارِ قراءة الـ PDF...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-amber-600" />
                          <span>اختيار ملف PDF</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* PDF Loaded notification card */}
                {pdfFileName && (
                  <div className="mt-2.5 flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-emerald-300 text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold">{pdfFileName}</span>
                      {pdfPagesCount && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                          {pdfPagesCount} {pdfPagesCount === 1 ? 'صفحة' : 'صفحات'}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">
                        (تم استخراج {newContent.length} حرف)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearPdf}
                      className="text-slate-400 hover:text-rose-600 text-[11px] font-bold"
                    >
                      إلغاء الملف
                    </button>
                  </div>
                )}

                {pdfError && (
                  <div className="mt-2 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                    {pdfError}
                  </div>
                )}
              </div>

              {newType === 'circular' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الجهة المصدرة للمنشور / التعميم
                  </label>
                  <input
                    type="text"
                    value={newAuthority}
                    onChange={(e) => setNewAuthority(e.target.value)}
                    placeholder="مثال: مكتب معالي الوزير / الأمانة العامة"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  نبذة مختصرة عن الغرض
                </label>
                <input
                  type="text"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="ملخص محتوى الوثيقة في سطرين..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    النص الكامل للمواد أو بنود المنشور
                  </label>
                  <button
                    type="button"
                    disabled={!newContent.trim() || isAnalyzing}
                    onClick={handleAnalyzeWithAI}
                    className="text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 disabled:opacity-40"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAnalyzing ? 'جارِ التحليل...' : 'استخراج وتحليل المواد بالذكاء الاصطناعي'}</span>
                  </button>
                </div>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={6}
                  placeholder="الصق نصوص المواد القانونية أو نص المنشور الإداري هنا..."
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* AI Analysis Card */}
              {analysisResult && (
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1 text-xs">
                  <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    نتيجة التحليل والاستخلاص القانوني (AI Summary):
                  </span>
                  <div className="whitespace-pre-line text-indigo-900 leading-relaxed max-h-36 overflow-y-auto">
                    {analysisResult}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleCreateNew}
                disabled={!newTitle.trim() || !newContent.trim()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-40"
              >
                حفظ وإضافة إلى المستودع القانوني المعتمد
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            الأنظمة والمناشير المحددة (المعلمة بـ ✓) سيتم تضمينها تلقائياً في متن ومسوغات المراسلة.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
};
