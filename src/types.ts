export type CorrespondenceType =
  | 'letter'     // خطاب رسمي
  | 'memo'       // مذكرة إدارية داخلية
  | 'circular'   // تعميم إداري
  | 'decision'   // قرار إداري رسمي
  | 'minutes'    // محضر اجتماع رسمي
  | 'report'     // تقرير إداري
  | 'reply';     // رد رسمي / إفادة

export type ToneType =
  | 'official'    // رسمي متزن
  | 'firm'        // حازم وقاطع
  | 'diplomatic'  // دبلوماسي وتعاوني
  | 'urgent'      // عاجل وفوري
  | 'courteous';  // رجائي ومقدم بالاحترام

export interface LawDocument {
  id: string;
  title: string;
  category: 'قانون' | 'لائحة تنفيذية' | 'نظام' | 'مرسوم';
  number?: string;
  year?: string;
  summary: string;
  content: string;
  keyArticles: string[];
  selected?: boolean;
  pdfFileName?: string;
  pdfPagesCount?: number;
}

export interface CircularDocument {
  id: string;
  number: string;
  title: string;
  date: string;
  authority: string;
  summary: string;
  content: string;
  selected?: boolean;
  pdfFileName?: string;
  pdfPagesCount?: number;
}

export interface AttachmentItem {
  id: string;
  name: string;
  size: string;
  type: string;
  textContent: string;
  summary?: string;
  dateAdded: string;
}

export interface TrainingExample {
  id: string;
  title: string;
  type: CorrespondenceType;
  subject: string;
  content: string;
  tone: ToneType;
  notes?: string;
  approvedDate: string;
  tags: string[];
  pdfFileName?: string;
  pdfPagesCount?: number;
}

export interface StyleProfile {
  organizationName: string;
  department: string;
  country: string;
  salutationsGuide: string;
  closingsGuide: string;
  formattingRules: string;
  vocabularyGuidelines: string;
  systemPromptInjection: string;
  lastTrainedAt?: string;
}

export interface SignatureConfig {
  imageUrl: string | null;
  isEnabled: boolean;
  width: number;
  positionX: number;
  positionY: number;
  alignment: 'left' | 'center' | 'right';
  rotation: number;
  opacity: number;
  showOfficialStamp: boolean;
}

export interface CorrespondenceTemplate {
  id: string;
  name: string;
  category: 'الموارد البشرية' | 'المهام والقرارات' | 'خدمة المستفيدين والشكاوى' | 'المالية والمشاريع' | 'التنسيق والاتصال';
  iconName: string;
  description: string;
  type: CorrespondenceType;
  recipientTitle: string;
  recipientName: string;
  subject: string;
  purpose: string;
  tone: ToneType;
  urgency: 'عادي' | 'عاجل' | 'عاجل جداً' | 'سري';
  signatoryTitle: string;
  signatoryName?: string;
  copiesTo: string[];
  referenceNumber?: string;
  referenceDate?: string;
}

export interface CorrespondenceRecord {
  id: string;
  type: CorrespondenceType;
  refNumber: string;
  dateHijri: string;
  dateGregorian: string;
  organization: string;
  department: string;
  recipientTitle: string;
  recipientName: string;
  subject: string;
  purpose: string;
  referencePrevNumber?: string;
  referencePrevDate?: string;
  urgency: 'عادي' | 'عاجل' | 'عاجل جداً' | 'سري' | 'سري للغاية';
  tone: ToneType;
  content: string;
  selectedLawIds: string[];
  selectedCircularIds: string[];
  attachmentsCount: number;
  signatoryTitle: string;
  signatoryName: string;
  copiesTo: string[];
  status: 'مسودة' | 'معتمد' | 'قيد المراجعة' | 'مؤرشف';
  createdAt: string;
}
