import React, { useState } from 'react';
import { 
  FileText, 
  Send, 
  Paperclip, 
  Scale, 
  Scroll, 
  BrainCircuit, 
  Cpu, 
  Sparkles, 
  AlertCircle, 
  Plus, 
  Trash2, 
  UploadCloud,
  FileCheck,
  Building,
  Layers,
  HelpCircle,
  FileSignature,
  BookmarkCheck,
  CheckCircle2,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  Compass,
  FileCheck2
} from 'lucide-react';
import { extractTextFromPDF } from '../utils/pdfParser';
import { 
  CorrespondenceType, 
  ToneType, 
  LawDocument, 
  CircularDocument, 
  AttachmentItem,
  CorrespondenceTemplate
} from '../types';
import { correspondenceTemplates } from '../data/templates';
import { TemplatesModal } from './TemplatesModal';

interface DrafterFormProps {
  type: CorrespondenceType;
  setType: (type: CorrespondenceType) => void;
  organization: string;
  setOrganization: (val: string) => void;
  department: string;
  setDepartment: (val: string) => void;
  recipientTitle: string;
  setRecipientTitle: (val: string) => void;
  recipientName: string;
  setRecipientName: (val: string) => void;
  subject: string;
  setSubject: (val: string) => void;
  purpose: string;
  setPurpose: (val: string) => void;
  referenceNumber: string;
  setReferenceNumber: (val: string) => void;
  referenceDate: string;
  setReferenceDate: (val: string) => void;
  urgency: string;
  setUrgency: (val: any) => void;
  tone: ToneType;
  setTone: (tone: ToneType) => void;
  signatoryTitle: string;
  setSignatoryTitle: (val: string) => void;
  signatoryName: string;
  setSignatoryName: (val: string) => void;
  copiesTo: string[];
  setCopiesTo: (copies: string[]) => void;
  // Laws & Circulars
  laws: LawDocument[];
  onToggleLaw: (id: string) => void;
  circulars: CircularDocument[];
  onToggleCircular: (id: string) => void;
  // Attachments
  attachments: AttachmentItem[];
  onAddAttachment: (att: AttachmentItem) => void;
  onRemoveAttachment: (id: string) => void;
  // AI generation
  onGenerate: () => void;
  isGenerating: boolean;
  onOpenMultiModel: () => void;
  onOpenLegalModal: () => void;
  onOpenTrainingModal: () => void;
  useStyleTraining: boolean;
  setUseStyleTraining: (val: boolean) => void;
  onOpenSignatureManager?: () => void;
}

export const DrafterForm: React.FC<DrafterFormProps> = ({
  type,
  setType,
  organization,
  setOrganization,
  department,
  setDepartment,
  recipientTitle,
  setRecipientTitle,
  recipientName,
  setRecipientName,
  subject,
  setSubject,
  purpose,
  setPurpose,
  referenceNumber,
  setReferenceNumber,
  referenceDate,
  setReferenceDate,
  urgency,
  setUrgency,
  tone,
  setTone,
  signatoryTitle,
  setSignatoryTitle,
  signatoryName,
  setSignatoryName,
  copiesTo,
  setCopiesTo,
  laws,
  onToggleLaw,
  circulars,
  onToggleCircular,
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  onGenerate,
  isGenerating,
  onOpenMultiModel,
  onOpenLegalModal,
  onOpenTrainingModal,
  useStyleTraining,
  setUseStyleTraining,
  onOpenSignatureManager,
}) => {
  const [newCopyInput, setNewCopyInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [appliedTemplateId, setAppliedTemplateId] = useState<string | null>(null);
  const [appliedTemplateName, setAppliedTemplateName] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'all' | 1 | 2 | 3 | 4>('all');

  const handleApplyTemplate = (tpl: CorrespondenceTemplate) => {
    setType(tpl.type);
    setRecipientTitle(tpl.recipientTitle);
    setRecipientName(tpl.recipientName);
    setSubject(tpl.subject);
    setPurpose(tpl.purpose);
    setTone(tpl.tone);
    setUrgency(tpl.urgency);
    setSignatoryTitle(tpl.signatoryTitle);
    if (tpl.signatoryName) {
      setSignatoryName(tpl.signatoryName);
    }
    if (tpl.copiesTo && tpl.copiesTo.length > 0) {
      setCopiesTo(tpl.copiesTo);
    }
    if (tpl.referenceNumber) {
      setReferenceNumber(tpl.referenceNumber);
    } else {
      setReferenceNumber('');
    }
    if (tpl.referenceDate) {
      setReferenceDate(tpl.referenceDate);
    } else {
      setReferenceDate('');
    }
    setAppliedTemplateId(tpl.id);
    setAppliedTemplateName(tpl.name);
  };

  const correspondenceTypes: { id: CorrespondenceType; label: string; desc: string }[] = [
    { id: 'letter', label: 'خطاب رسمي', desc: 'مخاطبة بين الوزارات والجهات الخارجية' },
    { id: 'memo', label: 'مذكرة داخلية', desc: 'مكاتبة بين الإدارات والأقسام الداخلية' },
    { id: 'circular', label: 'تعميم إداري', desc: 'تعليمات موجهة لكافة الموظفين أو الفروع' },
    { id: 'decision', label: 'قرار إداري', desc: 'قرارات نافذة (تشكيل لجان، تفويض، عقوبات)' },
    { id: 'reply', label: 'رد رسمي / إفادة', desc: 'إجابة نظامية على استفسار أو معاملة واردة' },
    { id: 'minutes', label: 'محضر اجتماع', desc: 'توثيق مجريات وقرارات جلسات اللجان' },
    { id: 'report', label: 'تقرير إداري', desc: 'عرض وقائع وتوصيات مفصلة للإدارة العليا' },
  ];

  const toneOptions: { id: ToneType; label: string; desc: string }[] = [
    { id: 'official', label: 'رسمي متزن', desc: 'النمط الحكومي القياسي الرصين' },
    { id: 'firm', label: 'حازم وقاطع', desc: 'تأكيد الالتزام بالمدد والعقوبات والتنفيذ' },
    { id: 'diplomatic', label: 'دبلوماسي رفيع', desc: 'تعاوني للشراكات والمستويات العليا' },
    { id: 'urgent', label: 'عاجل وفوري', desc: 'طلب البت السريع واستيفاء المتطلبات' },
    { id: 'courteous', label: 'رجائي وتقديري', desc: 'لطلب الاستثناءات أو الاعتمادات التقديرية' },
  ];

  const handleAddCopy = () => {
    if (newCopyInput.trim()) {
      setCopiesTo([...copiesTo, newCopyInput.trim()]);
      setNewCopyInput('');
    }
  };

  const handleRemoveCopy = (index: number) => {
    setCopiesTo(copiesTo.filter((_, i) => i !== index));
  };

  // Handle file attachment (Text, Word, PDF text extractor)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const fileList: File[] = Array.from(files);
    for (const file of fileList) {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        try {
          const { text, numPages } = await extractTextFromPDF(file);
          onAddAttachment({
            id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            type: 'application/pdf',
            textContent: text.substring(0, 25000),
            summary: `ملف PDF (${numPages} صفحات) - تم استخراج النصوص بنجاح للتأصيل الإداري`,
            dateAdded: new Date().toLocaleDateString('ar-SA'),
          });
        } catch (err) {
          console.error('PDF parsing error:', err);
          onAddAttachment({
            id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            type: 'application/pdf',
            textContent: `[مستند مرفق بصيغة PDF: ${file.name}]`,
            dateAdded: new Date().toLocaleDateString('ar-SA'),
          });
        }
      } else if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = (event.target?.result as string) || '';
          onAddAttachment({
            id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            type: file.type || 'text/plain',
            textContent: text.substring(0, 20000),
            dateAdded: new Date().toLocaleDateString('ar-SA'),
          });
        };
        reader.readAsText(file);
      } else {
        onAddAttachment({
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type || 'document',
          textContent: `[مستند مرفق: ${file.name} - وثيقة إدارية رسمية مشفوعة بالمعاملة]`,
          dateAdded: new Date().toLocaleDateString('ar-SA'),
        });
      }
    }
    setIsUploading(false);
  };

  const selectedLawsCount = laws.filter((l) => l.selected).length;
  const selectedCircularsCount = circulars.filter((c) => c.selected).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-6 overflow-y-auto">
      {/* Step / Section Navigation Bar */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 flex items-center justify-between gap-1 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          <button
            type="button"
            onClick={() => setActiveSection('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'all'
                ? 'bg-white text-slate-950 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            عرض الكل
          </button>
          <button
            type="button"
            onClick={() => setActiveSection(1)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSection === 1
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/15 flex items-center justify-center text-[10px]">١</span>
            <span>القالب والنوع</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection(2)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSection === 2
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/15 flex items-center justify-center text-[10px]">٢</span>
            <span>الموضوع والأطراف</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection(3)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSection === 3
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/15 flex items-center justify-center text-[10px]">٣</span>
            <span>الأسانيد والمرفقات</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection(4)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSection === 4
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/15 flex items-center justify-center text-[10px]">٤</span>
            <span>الاعتماد والتوقيع</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Templates & Correspondence Type */}
      {(activeSection === 'all' || activeSection === 1) && (
        <div className="space-y-4 pb-2 border-b border-slate-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                ١
              </span>
              <div>
                <h3 className="text-xs font-black text-slate-900">القوالب الجاهزة وتصنيف نوع المراسلة</h3>
                <p className="text-[11px] text-slate-500">اختر قالباً نموذجياً أو حدد نوع المكاتبة الإدارية</p>
              </div>
            </div>
            {appliedTemplateName && (
              <span className="text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                القالب: {appliedTemplateName}
              </span>
            )}
          </div>

          {/* Ready-made Administrative Templates Section */}
          <div className="bg-gradient-to-r from-amber-50/90 via-amber-100/40 to-slate-50 border border-amber-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0">
                  <BookmarkCheck className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      القوالب الإدارية الجاهزة (Templates)
                    </span>
                    <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                      تعبئة تلقائية
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    اختر قالباً افتراضياً لتعبئة الحقول والموضوع والأهداف الرسمية بنقرة واحدة
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTemplatesModalOpen(true)}
                className="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 hover:border-amber-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs shrink-0 self-start sm:self-auto"
              >
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>استعراض كافة القوالب ({correspondenceTemplates.length})</span>
              </button>
            </div>

            {/* Quick Template Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {correspondenceTemplates.slice(0, 4).map((tpl) => {
                const isSelected = appliedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className={`p-2.5 rounded-xl text-right transition-all border flex items-center justify-between text-xs font-bold ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white hover:bg-amber-50/70 border-slate-200 text-slate-700 hover:border-amber-300'
                    }`}
                  >
                    <span className="truncate">{tpl.name}</span>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0 mr-1" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-amber-500 opacity-70 shrink-0 mr-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Secondary row for additional popular templates */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {correspondenceTemplates.slice(4, 7).map((tpl) => {
                const isSelected = appliedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className={`p-2 rounded-xl text-right transition-all border flex items-center justify-between text-xs font-medium ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                        : 'bg-white/80 hover:bg-amber-50/70 border-slate-200 text-slate-700 hover:border-amber-300'
                    }`}
                  >
                    <span className="truncate">{tpl.name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 mr-1" />}
                  </button>
                );
              })}
            </div>

            {/* Feedback Banner when a template is applied */}
            {appliedTemplateName && (
              <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-emerald-900 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    تم تطبيق قالب <strong>«{appliedTemplateName}»</strong> وتعبئة بيانات المرسل إليه، الموضوع، الأهداف، النبرة ودرجة الأسبقية آلياً.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedTemplateId(null);
                    setAppliedTemplateName(null);
                  }}
                  className="text-emerald-700 hover:text-rose-600 text-[11px] font-bold underline shrink-0 mr-2"
                >
                  إخفاء الإشعار
                </button>
              </div>
            )}
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              نوع المراسلة الإدارية
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {correspondenceTypes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    type === t.id
                      ? 'border-amber-500 bg-amber-50/70 text-slate-950 font-bold ring-1 ring-amber-500/30'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>{t.label}</span>
                    {type === t.id && <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {activeSection === 1 && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveSection(2)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>التالي: أطراف المكاتبة وموضوعها</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: Parties & Subject & Core Request */}
      {(activeSection === 'all' || activeSection === 2) && (
        <div className="space-y-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
              ٢
            </span>
            <div>
              <h3 className="text-xs font-black text-slate-900">أطراف المكاتبة والموضوع الرسمي والمسوغات</h3>
              <p className="text-[11px] text-slate-500">الجهة المصدرة، المرسل إليه، عنوان المعاملة وتفاصيل الطلب</p>
            </div>
          </div>

          {/* Basic Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الجهة المصدرة (الوزارة / الهيئة)
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="مثال: وزارة الموارد البشرية والتنمية الاجتماعية"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الإدارة أو القطاع المصدر
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="مثال: الإدارة العامة للاتصالات والمراسلات"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Recipient Title and Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                اللقب والصفة الرسمية
              </label>
              <select
                value={recipientTitle}
                onChange={(e) => setRecipientTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                <option value="معالي">معالي (للوزراء ورؤساء الهيئات)</option>
                <option value="سعادة">سعادة (للوكلاء والمديرين العامين)</option>
                <option value="فضيلة">فضيلة (للقضاة والجهات الشرعية)</option>
                <option value="المكرم">المكرم (للموظفين والأفراد)</option>
                <option value="السيد">السيد (للجهات والشركات)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                المرسل إليه (المسمى أو الإدارة أو الشخص)
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="مثال: وكيل الوزارة للتخطيط والميزانية / مدير عام الشؤون الإدارية"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Subject & Reference */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                موضوع المراسلة (العنوان الرسمي)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثال: طلب تعزيز مالي عاجل لمشروع التحول الرقمي وحوكمة البيانات"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs md:text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50/40"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  الإشارة لخطاب/معاملة سابقة (رقم القيد السابق)
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="مثال: 45/1098/ق أو اختياري"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  تاريخ الخطاب السابق المشار إليه
                </label>
                <input
                  type="text"
                  value={referenceDate}
                  onChange={(e) => setReferenceDate(e.target.value)}
                  placeholder="مثال: 1445/08/12هـ"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                />
              </div>
            </div>
          </div>

          {/* Purpose & Core Request (Prompt Context) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-800">
                صلب الموضوع ومسوغات الطلب والتعليمات المطلوبة
              </label>
              <span className="text-[10px] text-slate-400">
                اكتب رؤوس أقلام أو المسودة وسيقوم الذكاء الاصطناعي بصياغتها رسمياً
              </span>
            </div>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={4}
              placeholder="مثال: نحتاج الموافقة على تشكيل لجنة تحقيق عاجلة نظراً لوجود ملاحظات في تقرير الجرد الأخير، مع الاستناد لمواد نظام الانضباط الوظيفي ومنشور تشكيل اللجان، مع إعطائهم مهلة أسبوعين لرفع التقرير النهائي..."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs sm:text-sm leading-relaxed focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {activeSection === 2 && (
            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveSection(1)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق: القالب والنوع</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSection(3)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>التالي: الأسانيد والمرفقات</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: Legal Grounding, Circulars & Attachments */}
      {(activeSection === 'all' || activeSection === 3) && (
        <div className="space-y-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
              ٣
            </span>
            <div>
              <h3 className="text-xs font-black text-slate-900">التأصيل النظامي والمناشير والمرفقات</h3>
              <p className="text-[11px] text-slate-500">ربط المعاملة بالمواد والأنظمة والمرفقات والمذكرات الداعمة</p>
            </div>
          </div>

          {/* Integrated Legal Grounding & Circulars Bar */}
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-700" />
                <h4 className="text-xs font-bold text-amber-950">
                  الأسانيد القانونية والمناشير المعتمدة في الخطاب
                </h4>
              </div>
              <button
                type="button"
                onClick={onOpenLegalModal}
                className="text-[11px] font-bold text-amber-800 hover:text-amber-900 underline underline-offset-2 flex items-center gap-1"
              >
                <span>إدارة المستودع القانوني</span>
                <span className="bg-amber-200/70 px-1.5 py-0.2 rounded-full text-[10px]">
                  {selectedLawsCount + selectedCircularsCount} محدد
                </span>
              </button>
            </div>
            <p className="text-[11px] text-amber-900/80">
              سيقوم الذكاء الاصطناعي باقتباس مواد الأنظمة والمناشير المحددة وتأصيل ديباجة الخطاب استناداً إليها:
            </p>

            {/* Selected Laws Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {laws.map((law) => (
                <button
                  key={law.id}
                  type="button"
                  onClick={() => onToggleLaw(law.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                    law.selected
                      ? 'bg-amber-600 text-white font-semibold border-amber-700 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <span>{law.title}</span>
                  {law.selected && <span className="text-[10px]">✓</span>}
                </button>
              ))}

              {circulars.map((circ) => (
                <button
                  key={circ.id}
                  type="button"
                  onClick={() => onToggleCircular(circ.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                    circ.selected
                      ? 'bg-blue-600 text-white font-semibold border-blue-700 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <Scroll className="w-3 h-3" />
                  <span>منشور: {circ.title.substring(0, 30)}...</span>
                  {circ.selected && <span className="text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-800">
                  المرفقات والمستندات الخاصة بالمعاملة ({attachments.length})
                </span>
              </div>

              <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{isUploading ? 'جارِ التحميل...' : 'إضافة ملف أو مستند'}</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg"
                />
              </label>
            </div>

            {attachments.length === 0 ? (
              <p className="text-[11px] text-slate-400 py-1">
                لا توجد مرفقات حالية. يمكنك رفع ملفات تقارير أو محاضر أو عروض أسعار لتلخيصها وربطها بالخطاب.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{att.name}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">({att.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveAttachment(att.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="حذف المرفق"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Institutional Style Training Memory Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/60 border border-purple-200/80">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-purple-700 shrink-0" />
              <div>
                <p className="text-xs font-bold text-purple-950">
                  تطبيق أسلوب المؤسسة المدرب عليه (Style Memory)
                </p>
                <p className="text-[10px] text-purple-800/80">
                  يحاكي النماذج المعتمدة السابقة والمفردات والتحيات المخصصة لجهتكم.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenTrainingModal}
                className="text-[11px] font-bold text-purple-700 hover:underline"
              >
                تخصيص التدريب
              </button>
              <input
                type="checkbox"
                checked={useStyleTraining}
                onChange={(e) => setUseStyleTraining(e.target.checked)}
                className="w-4 h-4 accent-purple-600 cursor-pointer rounded"
              />
            </div>
          </div>

          {activeSection === 3 && (
            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveSection(2)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق: أطراف المكاتبة والموضوع</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSection(4)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>التالي: النبرة والاعتماد</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: Tone, Urgency, Signatory & Copies */}
      {(activeSection === 'all' || activeSection === 4) && (
        <div className="space-y-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center">
              ٤
            </span>
            <div>
              <h3 className="text-xs font-black text-slate-900">النبرة الإدارية والاعتماد والتوقيع</h3>
              <p className="text-[11px] text-slate-500">أسلوب الصياغة، درجة السرية والأسبقية، والموقع المعتمد</p>
            </div>
          </div>

          {/* Tone & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                النبرة الإدارية (Tone of Voice)
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as ToneType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                {toneOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} - {opt.desc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                درجة الأسبقية والسرية
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                <option value="عادي">عادي</option>
                <option value="عاجل">عاجل</option>
                <option value="عاجل جداً">عاجل جداً</option>
                <option value="سري">سري</option>
                <option value="سري للغاية">سري للغاية</option>
              </select>
            </div>
          </div>

          {/* Signatory & Copies To */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700">بيانات المسؤول المعتمد والتوقيع</span>
              {onOpenSignatureManager && (
                <button
                  type="button"
                  onClick={onOpenSignatureManager}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors"
                >
                  <FileSignature className="w-3 h-3 text-blue-600" />
                  <span>إعداد التوقيع الرقمي</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  صفة صاحب الصلاحية الموقع
                </label>
                <input
                  type="text"
                  value={signatoryTitle}
                  onChange={(e) => setSignatoryTitle(e.target.value)}
                  placeholder="مثال: وكيل الوزارة للخدمات المشتركة"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  اسم المسؤول الموقع
                </label>
                <input
                  type="text"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  placeholder="مثال: د. عبد العزيز بن فهد آل سعود"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Copies To List */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              نسخ للإحاطة والمتابعة (صورة مع التحية إلى)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newCopyInput}
                onChange={(e) => setNewCopyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCopy())}
                placeholder="مثال: مدير إدارة الشؤون القانونية والمراجعة"
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCopy}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md border border-slate-300"
              >
                إضافة جهة
              </button>
            </div>
            {copiesTo.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {copiesTo.map((copy, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-[11px] text-slate-700"
                  >
                    <span>{copy}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCopy(i)}
                      className="text-slate-400 hover:text-rose-600 mr-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {activeSection === 4 && (
            <div className="flex justify-start pt-2">
              <button
                type="button"
                onClick={() => setActiveSection(3)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق: الأسانيد والمرفقات</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sticky / Permanent Bottom Action Bar */}
      <div className="pt-2 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>النوع: {correspondenceTypes.find(t => t.id === type)?.label}</span>
          </span>
          <span>{selectedLawsCount + selectedCircularsCount} أسانيد نظامية محددة</span>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>جارِ الصياغة والتأصيل النظامي عبر Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>صياغة المراسلة بالذكاء الاصطناعي (Gemini المباشر)</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenMultiModel}
          className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs border border-slate-800 transition-all flex items-center justify-center gap-2"
        >
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>تجهيز حزمة المطالبة للنماذج الأخرى (DeepSeek / Claude / ChatGPT / Ollama)</span>
        </button>
      </div>

      {/* Full Templates Browser Modal */}
      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={handleApplyTemplate}
        selectedTemplateId={appliedTemplateId}
      />
    </div>
  );
};
