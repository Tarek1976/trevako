import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DrafterForm } from './components/DrafterForm';
import { OfficialLetterPreview } from './components/OfficialLetterPreview';
import { RefineToolbar } from './components/RefineToolbar';
import { MultiAIModelModal } from './components/MultiAIModelModal';
import { LegalKnowledgeBaseModal } from './components/LegalKnowledgeBaseModal';
import { TrainingStudioModal } from './components/TrainingStudioModal';
import { ArchiveModal } from './components/ArchiveModal';
import { DigitalSignatureManager } from './components/DigitalSignatureManager';
import { 
  CorrespondenceType, 
  ToneType, 
  LawDocument, 
  CircularDocument, 
  AttachmentItem, 
  TrainingExample, 
  StyleProfile, 
  CorrespondenceRecord,
  SignatureConfig
} from './types';
import { 
  initialLaws, 
  initialCirculars, 
  initialTrainingExamples, 
  initialStyleProfile 
} from './data/initialData';
import { 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  BrainCircuit, 
  BookOpen, 
  Cpu,
  Columns,
  Maximize2,
  FileEdit,
  Eye,
  Paperclip,
  Scale,
  Stamp
} from 'lucide-react';

export default function App() {
  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<'drafter' | 'legal' | 'training' | 'multimodel' | 'archive'>('drafter');
  const [isRefineOpen, setIsRefineOpen] = useState(false);
  const [isMultiModelOpen, setIsMultiModelOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isSignatureManagerOpen, setIsSignatureManagerOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'split' | 'form' | 'preview'>('split');

  // Digital Signature State
  const defaultSignatureConfig: SignatureConfig = {
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 110" width="320" height="110"><path d="M25 75 C 60 20, 100 80, 140 35 C 170 5, 190 60, 230 40 C 260 25, 295 50, 275 85 C 235 95, 160 85, 90 70 C 50 60, 30 75, 45 85" fill="none" stroke="%231e3a8a" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M70 45 Q 140 15, 220 30" fill="none" stroke="%231e3a8a" stroke-width="3" stroke-linecap="round"/><path d="M145 35 L 158 12 L 175 38" fill="none" stroke="%231e3a8a" stroke-width="3" stroke-linecap="round"/><circle cx="205" cy="22" r="3.5" fill="%231e3a8a"/><circle cx="218" cy="18" r="3.5" fill="%231e3a8a"/></svg>',
    isEnabled: true,
    width: 140,
    positionX: 0,
    positionY: 0,
    alignment: 'left',
    rotation: -3,
    opacity: 0.95,
    showOfficialStamp: true,
  };

  const [signatureConfig, setSignatureConfig] = useState<SignatureConfig>(() => {
    const saved = localStorage.getItem('dewan_signature_config');
    return saved ? JSON.parse(saved) : defaultSignatureConfig;
  });

  // Correspondence Fields
  const [type, setType] = useState<CorrespondenceType>('letter');
  const [refNumber, setRefNumber] = useState('46/10892/ق');
  const [organization, setOrganization] = useState('وزارة الموارد البشرية والتنمية الاجتماعية');
  const [department, setDepartment] = useState('الإدارة العامة للاتصالات والمراسلات الإدارية');
  const [recipientTitle, setRecipientTitle] = useState('معالي');
  const [recipientName, setRecipientName] = useState('وزير المالية والتخطيط الاقتصادي');
  const [subject, setSubject] = useState('طلب اعتماد مالي إضافي لتنفيذ مشروع أتمتة الإجراءات والربط البيني');
  const [purpose, setPurpose] = useState('نظراً للتوسع في خطة التحول الرقمي وصدور تعميم تسريع وتيرة المعاملات، نحتاج الموافقة على توفير دعم مالي تكميلي لمرحلة توريد البرمجيات وتأهيل الكوادر وفق المادة (74) من نظام المنافسات، مع الإشارة لخطابنا السابق رقم 45/8812.');
  const [referenceNumber, setReferenceNumber] = useState('45/8812/ت');
  const [referenceDate, setReferenceDate] = useState('1445/09/20هـ');
  const [urgency, setUrgency] = useState<string>('عاجل');
  const [tone, setTone] = useState<ToneType>('diplomatic');
  const [signatoryTitle, setSignatoryTitle] = useState('نائب وزير الموارد البشرية');
  const [signatoryName, setSignatoryName] = useState('م. عبد الله بن تركي العتيبي');
  const [copiesTo, setCopiesTo] = useState<string[]>([
    'معالي الوزير (للإحاطة والتفضل بالاطلاع)',
    'وكيل الوزارة للتحول الرقمي والأمن السيبراني',
    'مدير عام المراجعة الداخلية والحوكمة',
  ]);

  // Initial Content for letter
  const [content, setContent] = useState<string>(`إشارة إلى الأمر السامي الكريم رقم (7820) وتاريخ 1444/08/15هـ، وإلى تعميم معاليكم رقم (1445/7892/ت) بشأن تسريع وتيرة المعاملات والتحول الرقمي، وإلحاقاً لخطابنا رقم (45/8812/ت) وتاريخ 1445/09/20هـ.

نود إحاطة معاليكم علماً بأنه انطلاقاً من الحرص على استكمال منظومة الأتمتة الشاملة وربط الخدمات الإدارية بالمنصات الحكومية الموحدة، فقد قامت الإدارة الفنية بإعداد الخطة التنفيذية للمرحلة الثانية من مشروع البنية التحتية والربط البيني.

وحيث تبيّن بعد حصر متطلبات الربط وحوكمة البيانات ضرورة تغذية بند التجهيزات والبرمجيات بمبلغ تكميلي قدره (650,000) ستمائة وخمسون ألف ريال لضمان استيفاء المعايير الإلزامية للأمن السيبراني وعدم تأثر وتيرة تقديم الخدمات؛
واستناداً إلى أحكام المادة (74) من نظام المنافسات والمشتريات الحكومية، وإلى الصلاحيات المفوضة لمعاليكم نظاماً؛

نأمل من معاليكم التكرم بالاطلاع، والتوجيه بالموافقة على اعتماد المناقلة المالية المطلوبة لتغذية البند المالي المذكور، لتمكيننا من استكمال إجراءات الترسية والبدء الفوري في التنفيذ.

شاكرين ومقدرين لمعاليكم دائم الدعم والرعاية،،،
وتفضلوا بقبول أسمى آيات التقدير والاحترام.`);

  // Knowledge Base State
  const [laws, setLaws] = useState<LawDocument[]>(() => {
    const saved = localStorage.getItem('dewan_laws');
    return saved ? JSON.parse(saved) : initialLaws;
  });

  const [circulars, setCirculars] = useState<CircularDocument[]>(() => {
    const saved = localStorage.getItem('dewan_circulars');
    return saved ? JSON.parse(saved) : initialCirculars;
  });

  const [attachments, setAttachments] = useState<AttachmentItem[]>([
    {
      id: 'att-init-1',
      name: 'التقرير_الفني_لمشروع_الربط_البيني.pdf',
      size: '2.4 MB',
      type: 'pdf',
      textContent: 'تقرير فني متكامل يوضح مراحل الربط الآلي بين أنظمة الوزارة ومنصات البيانات المشتركة وتكلفة التجهيزات.',
      dateAdded: '1446/01/10هـ',
    },
    {
      id: 'att-init-2',
      name: 'محضر_لجنة_فحص_عروض_الأسعار.pdf',
      size: '850 KB',
      type: 'pdf',
      textContent: 'محضر اجتماع لجنة التقييم المالي والفني لعروض الشركات المؤهلة وتوصيات الترسية المبدئية.',
      dateAdded: '1446/01/14هـ',
    }
  ]);

  // Training & Style Memory State
  const [trainingExamples, setTrainingExamples] = useState<TrainingExample[]>(() => {
    const saved = localStorage.getItem('dewan_training_examples');
    return saved ? JSON.parse(saved) : initialTrainingExamples;
  });

  const [styleProfile, setStyleProfile] = useState<StyleProfile>(() => {
    const saved = localStorage.getItem('dewan_style_profile');
    return saved ? JSON.parse(saved) : initialStyleProfile;
  });

  const [useStyleTraining, setUseStyleTraining] = useState<boolean>(true);

  // Archive Records
  const [records, setRecords] = useState<CorrespondenceRecord[]>(() => {
    const saved = localStorage.getItem('dewan_archive_records');
    return saved ? JSON.parse(saved) : [];
  });

  // UI status
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('dewan_laws', JSON.stringify(laws));
  }, [laws]);

  useEffect(() => {
    localStorage.setItem('dewan_circulars', JSON.stringify(circulars));
  }, [circulars]);

  useEffect(() => {
    localStorage.setItem('dewan_training_examples', JSON.stringify(trainingExamples));
  }, [trainingExamples]);

  useEffect(() => {
    localStorage.setItem('dewan_style_profile', JSON.stringify(styleProfile));
  }, [styleProfile]);

  useEffect(() => {
    localStorage.setItem('dewan_archive_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('dewan_signature_config', JSON.stringify(signatureConfig));
  }, [signatureConfig]);

  // Dates
  const today = new Date();
  const dateGregorian = today.toLocaleDateString('ar-SA-u-ca-gregory', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dateHijri = today.toLocaleDateString('ar-SA-u-ca-islamic-umalqura', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  // Handler: Generate with Gemini
  const handleGenerateCorrespondence = async () => {
    setIsGenerating(true);
    setNotification(null);

    const activeLaws = laws.filter((l) => l.selected);
    const activeCirculars = circulars.filter((c) => c.selected);

    try {
      const response = await fetch('/api/correspondence/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          organization,
          recipientTitle,
          recipientName,
          subject,
          purpose,
          referenceNumber,
          referenceDate,
          tone,
          selectedLaws: activeLaws,
          selectedCirculars: activeCirculars,
          attachmentsInfo: attachments.map((a) => `${a.name}: ${a.textContent}`).join('\n'),
          styleRules: useStyleTraining ? `${styleProfile.systemPromptInjection}\n${styleProfile.formattingRules}` : '',
          approvedExamples: useStyleTraining ? trainingExamples.slice(0, 2) : [],
          additionalNotes: `التزم بالتنسيق الإداري الرصين، وضع أرقام المواد والأنظمة في الديباجة والمتن.`,
        }),
      });

      const data = await response.json();
      if (data.success && data.content) {
        setContent(data.content);
        setNotification({
          type: 'success',
          message: 'تم إعداد وصياغة المراسلة وتأصيلها نظامياً بنجاح بواسطة الذكاء الاصطناعي (Gemini).',
        });
        setTimeout(() => setNotification(null), 5000);
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'حدث خطأ أثناء الصياغة بالذكاء الاصطناعي',
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'فشل الاتصال بخادم الذكاء الاصطناعي',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Law Handlers
  const handleToggleLaw = (id: string) => {
    setLaws((prev) =>
      prev.map((l) => (l.id === id ? { ...l, selected: !l.selected } : l))
    );
  };

  const handleAddLaw = (law: LawDocument) => {
    setLaws((prev) => [law, ...prev]);
  };

  const handleDeleteLaw = (id: string) => {
    setLaws((prev) => prev.filter((l) => l.id !== id));
  };

  // Circular Handlers
  const handleToggleCircular = (id: string) => {
    setCirculars((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleAddCircular = (circ: CircularDocument) => {
    setCirculars((prev) => [circ, ...prev]);
  };

  const handleDeleteCircular = (id: string) => {
    setCirculars((prev) => prev.filter((c) => c.id !== id));
  };

  // Attachments
  const handleAddAttachment = (att: AttachmentItem) => {
    setAttachments((prev) => [att, ...prev]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Training Handlers
  const handleAddTrainingExample = (example: TrainingExample) => {
    setTrainingExamples((prev) => [example, ...prev]);
  };

  const handleDeleteTrainingExample = (id: string) => {
    setTrainingExamples((prev) => prev.filter((e) => e.id !== id));
  };

  // Save Current Letter as Training Example
  const handleSaveCurrentAsTraining = () => {
    const newEx: TrainingExample = {
      id: `train-${Date.now()}`,
      title: `${type} معتمد - ${subject.substring(0, 40)}`,
      type,
      subject,
      content,
      tone,
      approvedDate: dateHijri,
      tags: ['مراسلة_معتمدة', type, tone],
    };
    handleAddTrainingExample(newEx);
  };

  // Save Current Letter to Archive
  const handleSaveToArchive = () => {
    const newRecord: CorrespondenceRecord = {
      id: `rec-${Date.now()}`,
      type,
      refNumber,
      dateHijri,
      dateGregorian,
      organization,
      department,
      recipientTitle,
      recipientName,
      subject,
      purpose,
      referencePrevNumber: referenceNumber,
      referencePrevDate: referenceDate,
      urgency: urgency as any,
      tone,
      content,
      selectedLawIds: laws.filter((l) => l.selected).map((l) => l.id),
      selectedCircularIds: circulars.filter((c) => c.selected).map((c) => c.id),
      attachmentsCount: attachments.length,
      signatoryTitle,
      signatoryName,
      copiesTo,
      status: 'معتمد',
      createdAt: new Date().toISOString(),
    };
    setRecords((prev) => [newRecord, ...prev]);
  };

  // Load Record from Archive
  const handleLoadRecord = (record: CorrespondenceRecord) => {
    setType(record.type);
    setRefNumber(record.refNumber);
    setOrganization(record.organization);
    setDepartment(record.department);
    setRecipientTitle(record.recipientTitle);
    setRecipientName(record.recipientName);
    setSubject(record.subject);
    setPurpose(record.purpose);
    setReferenceNumber(record.referencePrevNumber || '');
    setReferenceDate(record.referencePrevDate || '');
    setUrgency(record.urgency);
    setTone(record.tone);
    setContent(record.content);
    setSignatoryTitle(record.signatoryTitle);
    setSignatoryName(record.signatoryName);
    setCopiesTo(record.copiesTo || []);
    setActiveTab('drafter');
  };

  // New Letter
  const handleNewLetter = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setRefNumber(`46/${randomSuffix}/ق`);
    setSubject('');
    setPurpose('');
    setContent('');
    setReferenceNumber('');
    setReferenceDate('');
    setActiveTab('drafter');
  };

  // Quick Tab Switch Router
  const handleNavTab = (tab: 'drafter' | 'legal' | 'training' | 'multimodel' | 'archive') => {
    if (tab === 'legal') {
      setIsLegalModalOpen(true);
    } else if (tab === 'training') {
      setIsTrainingModalOpen(true);
    } else if (tab === 'multimodel') {
      setIsMultiModelOpen(true);
    } else if (tab === 'archive') {
      setIsArchiveOpen(true);
    } else {
      setActiveTab('drafter');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-cairo">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleNavTab}
        onNewLetter={handleNewLetter}
        onPrint={() => window.print()}
        hasContent={!!content}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3 w-full">
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all shadow-xs ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-700 px-2"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace (Split Screen: Drafter & Official Preview) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
        {/* Executive Workspace Bar (Non-printing) */}
        <div className="no-print mb-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3 px-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-100 text-slate-800 px-3 py-1 rounded-xl text-xs font-bold border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>المعاملة:</span>
              <strong className="text-slate-900 font-black truncate max-w-[200px] sm:max-w-xs">
                {subject || 'مسودة معاملة إدارية جديدة'}
              </strong>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              <span className="bg-slate-50 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1 font-medium text-[11px]">
                <Scale className="w-3 h-3 text-amber-600" />
                <span>{laws.filter(l => l.selected).length + circulars.filter(c => c.selected).length} أسانيد</span>
              </span>

              <span className="bg-slate-50 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1 font-medium text-[11px]">
                <Paperclip className="w-3 h-3 text-indigo-600" />
                <span>{attachments.length} مرفقات</span>
              </span>

              {content && (
                <span className="bg-slate-50 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1 font-medium text-[11px]">
                  <FileText className="w-3 h-3 text-emerald-600" />
                  <span>{content.trim().split(/\s+/).length} كلمة</span>
                </span>
              )}

              {signatureConfig.isEnabled && signatureConfig.imageUrl && (
                <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-lg border border-blue-200 flex items-center gap-1 font-bold text-[11px]">
                  <Stamp className="w-3 h-3 text-blue-600" />
                  <span>توقيع معتمد</span>
                </span>
              )}
            </div>
          </div>

          {/* Layout Mode Controls */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-end md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setLayoutMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                layoutMode === 'split'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="عرض متوازن: النموذج على اليمين والمعاينة على اليسار"
            >
              <Columns className="w-3.5 h-3.5 text-amber-600" />
              <span>شاشة مزدوجة</span>
            </button>

            <button
              type="button"
              onClick={() => setLayoutMode('form')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                layoutMode === 'form'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="توسيع نموذج الصياغة فقط للتركيز على إدخال البيانات"
            >
              <FileEdit className="w-3.5 h-3.5 text-blue-600" />
              <span>تركيز الصياغة</span>
            </button>

            <button
              type="button"
              onClick={() => setLayoutMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                layoutMode === 'preview'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="توسيع المعاينة الرسمية A4 للتدقيق والقراءة والطباعة"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>معاينة A4 كاملة</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
          {/* Right Column: Drafter Controls & Grounding (Hidden on print) */}
          <div
            className={`no-print space-y-4 ${
              layoutMode === 'split'
                ? 'lg:col-span-5'
                : layoutMode === 'form'
                ? 'lg:col-span-12'
                : 'hidden'
            }`}
          >
            <DrafterForm
              type={type}
              setType={setType}
              organization={organization}
              setOrganization={setOrganization}
              department={department}
              setDepartment={setDepartment}
              recipientTitle={recipientTitle}
              setRecipientTitle={setRecipientTitle}
              recipientName={recipientName}
              setRecipientName={setRecipientName}
              subject={subject}
              setSubject={setSubject}
              purpose={purpose}
              setPurpose={setPurpose}
              referenceNumber={referenceNumber}
              setReferenceNumber={setReferenceNumber}
              referenceDate={referenceDate}
              setReferenceDate={setReferenceDate}
              urgency={urgency}
              setUrgency={setUrgency}
              tone={tone}
              setTone={setTone}
              signatoryTitle={signatoryTitle}
              setSignatoryTitle={setSignatoryTitle}
              signatoryName={signatoryName}
              setSignatoryName={setSignatoryName}
              copiesTo={copiesTo}
              setCopiesTo={setCopiesTo}
              laws={laws}
              onToggleLaw={handleToggleLaw}
              circulars={circulars}
              onToggleCircular={handleToggleCircular}
              attachments={attachments}
              onAddAttachment={handleAddAttachment}
              onRemoveAttachment={handleRemoveAttachment}
              onGenerate={handleGenerateCorrespondence}
              isGenerating={isGenerating}
              onOpenMultiModel={() => setIsMultiModelOpen(true)}
              onOpenLegalModal={() => setIsLegalModalOpen(true)}
              onOpenTrainingModal={() => setIsTrainingModalOpen(true)}
              useStyleTraining={useStyleTraining}
              setUseStyleTraining={setUseStyleTraining}
              onOpenSignatureManager={() => setIsSignatureManagerOpen(true)}
            />
          </div>

          {/* Left Column: Authentic Official A4 Letterhead Preview */}
          <div
            className={`h-full min-h-[900px] ${
              layoutMode === 'split'
                ? 'lg:col-span-7'
                : layoutMode === 'preview'
                ? 'lg:col-span-12'
                : 'hidden'
            }`}
          >
            <OfficialLetterPreview
              type={type}
              refNumber={refNumber}
              dateHijri={dateHijri}
              dateGregorian={dateGregorian}
              organization={organization}
              department={department}
              recipientTitle={recipientTitle}
              recipientName={recipientName}
              subject={subject}
              urgency={urgency}
              tone={tone}
              content={content}
              onContentChange={setContent}
              attachmentsCount={attachments.length}
              signatoryTitle={signatoryTitle}
              signatoryName={signatoryName}
              copiesTo={copiesTo}
              signatureConfig={signatureConfig}
              onSignatureConfigChange={setSignatureConfig}
              onOpenSignatureManager={() => setIsSignatureManagerOpen(true)}
              onOpenRefine={() => setIsRefineOpen(true)}
              onOpenMultiModel={() => setIsMultiModelOpen(true)}
              onSaveAsTrainingExample={handleSaveCurrentAsTraining}
              onSaveToArchive={handleSaveToArchive}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <RefineToolbar
        isOpen={isRefineOpen}
        onClose={() => setIsRefineOpen(false)}
        currentContent={content}
        onApplyRefined={setContent}
      />

      <DigitalSignatureManager
        isOpen={isSignatureManagerOpen}
        onClose={() => setIsSignatureManagerOpen(false)}
        config={signatureConfig}
        onChangeConfig={setSignatureConfig}
      />

      <MultiAIModelModal
        isOpen={isMultiModelOpen}
        onClose={() => setIsMultiModelOpen(false)}
        type={type}
        organization={organization}
        department={department}
        recipientTitle={recipientTitle}
        recipientName={recipientName}
        subject={subject}
        purpose={purpose}
        referenceNumber={referenceNumber}
        referenceDate={referenceDate}
        tone={tone}
        laws={laws}
        circulars={circulars}
        attachments={attachments}
        styleProfile={styleProfile}
        useStyleTraining={useStyleTraining}
        onApplyOutputToLetter={setContent}
      />

      <LegalKnowledgeBaseModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        laws={laws}
        onToggleLaw={handleToggleLaw}
        onAddLaw={handleAddLaw}
        onDeleteLaw={handleDeleteLaw}
        circulars={circulars}
        onToggleCircular={handleToggleCircular}
        onAddCircular={handleAddCircular}
        onDeleteCircular={handleDeleteCircular}
      />

      <TrainingStudioModal
        isOpen={isTrainingModalOpen}
        onClose={() => setIsTrainingModalOpen(false)}
        trainingExamples={trainingExamples}
        onAddTrainingExample={handleAddTrainingExample}
        onDeleteTrainingExample={handleDeleteTrainingExample}
        styleProfile={styleProfile}
        onUpdateStyleProfile={setStyleProfile}
      />

      <ArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        records={records}
        onLoadRecord={handleLoadRecord}
        onDeleteRecord={(id) => setRecords((prev) => prev.filter((r) => r.id !== id))}
      />
    </div>
  );
}
