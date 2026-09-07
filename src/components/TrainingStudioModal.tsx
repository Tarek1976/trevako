import React, { useState, useRef } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  BookOpen, 
  Plus, 
  Trash2, 
  Check, 
  FileText, 
  X, 
  Download, 
  Upload, 
  CheckCircle2,
  RefreshCw,
  FileCheck2,
  Loader2
} from 'lucide-react';
import { extractTextFromPDF } from '../utils/pdfParser';
import { TrainingExample, StyleProfile } from '../types';

interface TrainingStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainingExamples: TrainingExample[];
  onAddTrainingExample: (example: TrainingExample) => void;
  onDeleteTrainingExample: (id: string) => void;
  styleProfile: StyleProfile;
  onUpdateStyleProfile: (profile: StyleProfile) => void;
}

export const TrainingStudioModal: React.FC<TrainingStudioModalProps> = ({
  isOpen,
  onClose,
  trainingExamples,
  onAddTrainingExample,
  onDeleteTrainingExample,
  styleProfile,
  onUpdateStyleProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'examples' | 'add_example'>('profile');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // New Training Example Form
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  // PDF Upload State for Training Example
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

      if (!newTitle.trim()) {
        const cleanName = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
        setNewTitle(result.titleHint || cleanName);
      }

      if (!newSubject.trim()) {
        setNewSubject(result.titleHint || 'مكاتبة رسمية نموذجية');
      }

      if (!newTags.trim()) {
        setNewTags('معتمد, تدريب, نموذج PDF');
      }
    } catch (err: any) {
      console.error('Training PDF extraction error:', err);
      setPdfError(err?.message || 'تعذر استخراج النصوص من ملف PDF للتدريب.');
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

  // Run AI Style Analysis across approved precedent letters
  const handleRunStyleAnalysis = async () => {
    if (trainingExamples.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisReport(null);

    try {
      const response = await fetch('/api/training/analyze-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleLetters: trainingExamples.map((ex) => `[${ex.title} - ${ex.subject}]:\n${ex.content}`),
          organizationName: styleProfile.organizationName,
        }),
      });

      const data = await response.json();
      if (data.success && data.styleProfile) {
        setAnalysisReport(data.styleProfile);
        // Automatically inject refined rules into styleProfile
        onUpdateStyleProfile({
          ...styleProfile,
          systemPromptInjection: data.styleProfile.substring(0, 1000),
          lastTrainedAt: new Date().toISOString().split('T')[0],
        });
      }
    } catch (err) {
      console.error('Error analyzing style:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateExample = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const newEx: TrainingExample = {
      id: `train-${Date.now()}`,
      title: newTitle,
      type: 'letter',
      subject: newSubject || newTitle,
      content: newContent,
      tone: 'official',
      approvedDate: new Date().toLocaleDateString('ar-SA'),
      tags: newTags ? newTags.split(',').map((t) => t.trim()) : ['معتمد'],
      pdfFileName: pdfFileName || undefined,
      pdfPagesCount: pdfPagesCount || undefined,
    };

    onAddTrainingExample(newEx);
    setNewTitle('');
    setNewSubject('');
    setNewContent('');
    setNewTags('');
    setPdfFileName(null);
    setPdfPagesCount(null);
    setPdfError(null);
    setActiveTab('examples');
  };

  const handleExportProfile = () => {
    const json = JSON.stringify({ styleProfile, trainingExamples }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ملف_تدريب_الأسلوب_الإداري_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-cairo">
                مركز تدريب الذكاء الاصطناعي على أسلوب المؤسسة (Training Studio)
              </h3>
              <p className="text-xs text-slate-400">
                تدريب النماذج التراكمي على النماذج السابقة والمصطلحات المعتمدة لصياغة مطابقة تماماً للمستقبل
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>دليل أسلوب الصياغة المؤسسي</span>
            </button>

            <button
              onClick={() => setActiveTab('examples')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'examples'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>النماذج السابقة المعتمدة للتدريب ({trainingExamples.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('add_example')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'add_example'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-300'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة نموذج معتمد جديد</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportProfile}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
              title="تصدير ملف التدريب كـ JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>تصدير ملف التدريب</span>
            </button>

            <button
              onClick={handleRunStyleAnalysis}
              disabled={isAnalyzing || trainingExamples.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>جارِ تحليل وتدريب النظام...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>تحليل وتدريب الذكاء الاصطناعي الآن</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Active Profile Settings */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 text-xs text-purple-900 leading-relaxed flex items-center justify-between">
                <div>
                  <span className="font-bold text-purple-950 block">حالة ملف التدريب المؤسسي:</span>
                  <span>تم تدريب النموذج واستخلاص القواعد من ({trainingExamples.length}) مراسلات معتمدة سابقة. آخر تحديث: {styleProfile.lastTrainedAt || 'اليوم'}.</span>
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>

              {/* Analysis Report if generated */}
              {analysisReport && (
                <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-2 border border-purple-500/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      تقرير استخلاص نمط الصياغة الإدارية والتدريب التراكمي (AI Style Extraction):
                    </span>
                    <span className="text-emerald-400 font-semibold">✓ تم تحديث الموجهات التلقائية</span>
                  </div>
                  <pre className="text-xs font-sans whitespace-pre-line leading-relaxed max-h-52 overflow-y-auto p-2 bg-slate-950/70 rounded border border-slate-800 text-slate-300">
                    {analysisReport}
                  </pre>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    صيغ التوجيه والتحية المعتمدة للمؤسسة
                  </label>
                  <textarea
                    rows={4}
                    value={styleProfile.salutationsGuide}
                    onChange={(e) =>
                      onUpdateStyleProfile({ ...styleProfile, salutationsGuide: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    صيغ الخواتم والتذييل المعتمدة
                  </label>
                  <textarea
                    rows={4}
                    value={styleProfile.closingsGuide}
                    onChange={(e) =>
                      onUpdateStyleProfile({ ...styleProfile, closingsGuide: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المعجم والمفردات اللغوية المفضلة للجهة
                </label>
                <textarea
                  rows={3}
                  value={styleProfile.vocabularyGuidelines}
                  onChange={(e) =>
                    onUpdateStyleProfile({ ...styleProfile, vocabularyGuidelines: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  موجه التدريب المباشر للذكاء الاصطناعي (System Instruction Injection)
                </label>
                <p className="text-[11px] text-slate-500 mb-1.5">
                  يتم حقن هذا النص في كافة طلبات التوليد لضمان محاكاة الذكاء الاصطناعي لأسلوب ديوانكم بنسبة 100%.
                </p>
                <textarea
                  rows={3}
                  value={styleProfile.systemPromptInjection}
                  onChange={(e) =>
                    onUpdateStyleProfile({ ...styleProfile, systemPromptInjection: e.target.value })
                  }
                  className="w-full p-2.5 font-mono text-xs border border-purple-300 rounded-xl leading-relaxed bg-purple-50/20 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Approved Examples List */}
          {activeTab === 'examples' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                هذه النماذج المعتمدة تُستخدم كأمثلة تدريبية فورية (Few-Shot Context) لتعليم نماذج الذكاء الاصطناعي كيفية صياغة المكاتبات القادمة باحترافية تامة.
              </p>

              {trainingExamples.map((ex) => (
                <div
                  key={ex.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 bg-white shadow-2xs space-y-2 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">{ex.title}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                          {ex.approvedDate}
                        </span>
                        {ex.pdfFileName && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800 flex items-center gap-1 border border-red-200">
                            <span>PDF</span>
                            {ex.pdfPagesCount ? `(${ex.pdfPagesCount} ص)` : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-600 mt-0.5">الموضوع: {ex.subject}</p>
                    </div>

                    <button
                      onClick={() => onDeleteTrainingExample(ex.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="حذف النموذج من التدريب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Text preview */}
                  <details className="text-xs text-slate-700">
                    <summary className="font-semibold text-purple-800 cursor-pointer hover:underline">
                      عرض نص المراسلة المعتمدة ({ex.content.length} حرف)
                    </summary>
                    <pre className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans whitespace-pre-line leading-relaxed text-slate-800">
                      {ex.content}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}

          {/* Add New Training Precedent */}
          {activeTab === 'add_example' && (
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800">
                تزويد النظام بنموذج معتمد جديد لتدريب الذكاء الاصطناعي عليه للمكاتبات القادمة
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    عنوان النموذج التدريبي
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: خطاب رسمي معتمد - رد على استفسار رقابي"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    موضوع المراسلة
                  </label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="مثال: الرد على تقرير ديوان المحاسبة بشأن العقود"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* PDF File Upload Zone for Training */}
              <div className="p-3.5 bg-purple-50/50 rounded-xl border border-dashed border-purple-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                      PDF
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        تحميل نموذج مراسلة سابقة معتمدة بصيغة PDF
                      </span>
                      <span className="text-[11px] text-slate-500">
                        سيقوم النظام باستخراج نص المراسلة المعتمدة تلقائياً لتدريب الذكاء الاصطناعي عليها
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
                      id="training-pdf-upload"
                    />
                    <label
                      htmlFor="training-pdf-upload"
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs ${
                        isParsingPdf
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-white border border-purple-300 text-purple-900 hover:bg-purple-100/70'
                      }`}
                    >
                      {isParsingPdf ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                          <span>جارِ قراءة الـ PDF...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-purple-600" />
                          <span>اختيار ملف PDF</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* PDF Loaded notification card */}
                {pdfFileName && (
                  <div className="mt-2.5 flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-purple-300 text-xs text-purple-800">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span className="font-semibold">{pdfFileName}</span>
                      {pdfPagesCount && (
                        <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الوسوم والتصنيفات (مفصولة بفواصل)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="مثال: رقابة، مالي، رد رسمي، تدقيق"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  نص المراسلة المعتمدة بالكامل (كما صدرت واعتمدت)
                </label>
                <textarea
                  rows={8}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="الصق هنا نص الخطاب أو القرار أو التعميم النموذجي ليتعلم منه النظام الأسلوب والصيغ..."
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleCreateExample}
                disabled={!newTitle.trim() || !newContent.trim()}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-40"
              >
                إضافة النموذج لقاعدة التدريب التراكمي
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            تراكم النماذج المعتمدة يعزز دقة ومحاكاة الذكاء الاصطناعي للمراسلات المستقبلية.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
