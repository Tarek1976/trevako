import React, { useState } from 'react';
import { 
  Cpu, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  FileText, 
  Layers, 
  X, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { 
  CorrespondenceType, 
  ToneType, 
  LawDocument, 
  CircularDocument, 
  AttachmentItem,
  StyleProfile 
} from '../types';

interface MultiAIModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: CorrespondenceType;
  organization: string;
  department: string;
  recipientTitle: string;
  recipientName: string;
  subject: string;
  purpose: string;
  referenceNumber: string;
  referenceDate: string;
  tone: ToneType;
  laws: LawDocument[];
  circulars: CircularDocument[];
  attachments: AttachmentItem[];
  styleProfile: StyleProfile;
  useStyleTraining: boolean;
  onApplyOutputToLetter: (text: string) => void;
}

type ModelType = 'deepseek' | 'chatgpt' | 'claude' | 'ollama' | 'gemini';

export const MultiAIModelModal: React.FC<MultiAIModelModalProps> = ({
  isOpen,
  onClose,
  type,
  organization,
  department,
  recipientTitle,
  recipientName,
  subject,
  purpose,
  referenceNumber,
  referenceDate,
  tone,
  laws,
  circulars,
  attachments,
  styleProfile,
  useStyleTraining,
  onApplyOutputToLetter,
}) => {
  const [selectedModel, setSelectedModel] = useState<ModelType>('deepseek');
  const [copied, setCopied] = useState(false);
  const [pastedOutput, setPastedOutput] = useState('');

  if (!isOpen) return null;

  const modelsList: { id: ModelType; name: string; tag: string; link: string; color: string; desc: string }[] = [
    {
      id: 'deepseek',
      name: 'DeepSeek (الذيب سيك R1 / V3)',
      tag: 'مفتوح المصدر / مجاني وقوي',
      link: 'https://chat.deepseek.com',
      color: 'border-blue-500 bg-blue-50/60 text-blue-950',
      desc: 'يمتاز بقدرات التفكير المنطقي والأسانيد القانونية المعقدة والاستنباط النظامي.',
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT (شات جي بي تي - OpenAI)',
      tag: 'الأكثر شهرة',
      link: 'https://chatgpt.com',
      color: 'border-emerald-500 bg-emerald-50/60 text-emerald-950',
      desc: 'صياغة مرنة وسلسة للخطابات والمذكرات السريعة ومحاضر الاجتماعات.',
    },
    {
      id: 'claude',
      name: 'Claude 3.7 (كلود - Anthropic)',
      tag: 'دقة لغوية فائقة',
      link: 'https://claude.ai',
      color: 'border-amber-500 bg-amber-50/60 text-amber-950',
      desc: 'أعلى مستوى في البلاغة الإدارية والتحفظ الدبلوماسي وتجنب الركاكة.',
    },
    {
      id: 'ollama',
      name: 'Ollama / Llama 3 / Qwen',
      tag: 'محلي ومفتوح المصدر 100%',
      link: 'https://ollama.com',
      color: 'border-purple-500 bg-purple-50/60 text-purple-950',
      desc: 'للجهات الحكومية والخاصة التي تشترط تشغيل النماذج داخل الخوادم المغلقة لسرية البيانات.',
    },
    {
      id: 'gemini',
      name: 'Google Gemini (جوجل جمني)',
      tag: 'مدمج ومجاني في النظام',
      link: 'https://gemini.google.com',
      color: 'border-indigo-500 bg-indigo-50/60 text-indigo-950',
      desc: 'معالجة سريعة للنصوص الطويلة والمرفقات الكبيرة والأرشفة الفورية.',
    },
  ];

  // Selected laws & circulars
  const activeLaws = laws.filter((l) => l.selected);
  const activeCirculars = circulars.filter((c) => c.selected);

  // Generate engineered Prompt Packet tailored to the chosen model
  const generatePromptPacket = (): string => {
    const toneDescription: Record<ToneType, string> = {
      official: 'رسمية متزنة ورصينة وفق التقاليد الحكومية',
      firm: 'حازمة وقاطعة تؤكد على تطبيق الأنظمة والمواعيد والمسؤوليات',
      diplomatic: 'دبلوماسية وتعاونية رفيعة المستوى للشراكات والمقامات العليا',
      urgent: 'عاجلة وتؤكد على سرعة الإنجاز والبت الفوري',
      courteous: 'رجائية ومهذبة للغاية مفعمة بعبارات التقدير والاحترام',
    };

    let prompt = '';

    if (selectedModel === 'claude') {
      // Claude prefers XML tags for strict contextual grounding
      prompt += `<system_instruction>
أنت مستشار قانوني ومحرر إداري أول في ديوان الحكومة. مهمتك تحرير [${type}] رسمي مكتمل الأركان باللغة العربية الفصحى الرصينة.
النبرة الإلزامية: ${toneDescription[tone]}.
</system_instruction>

<administrative_context>
- الجهة المصدرة: ${organization || 'الديوان العام'} - ${department}
- المرسل إليه: ${recipientTitle} / ${recipientName} المحترم
- الموضوع: ${subject}
${referenceNumber ? `- إشارة لخطاب سابق رقم: (${referenceNumber}) بتاريخ (${referenceDate})` : ''}
</administrative_context>

${activeLaws.length > 0 ? `<governing_laws>
${activeLaws.map((l, i) => `القانون (${i + 1}): ${l.title}\nالمواد المرجعية:\n${l.content}`).join('\n\n')}
</governing_laws>` : ''}

${activeCirculars.length > 0 ? `<administrative_circulars>
${activeCirculars.map((c, i) => `التعميم (${i + 1}): ${c.title} (رقم: ${c.number} تاريخ: ${c.date})\n${c.content}`).join('\n\n')}
</administrative_circulars>` : ''}

${attachments.length > 0 ? `<attachments_data>
${attachments.map((a, i) => `مرفق (${i + 1}): ${a.name}\n${a.textContent}`).join('\n\n')}
</attachments_data>` : ''}

${useStyleTraining && styleProfile.systemPromptInjection ? `<institutional_style_rules>
${styleProfile.systemPromptInjection}
${styleProfile.formattingRules}
</institutional_style_rules>` : ''}

<task_requirements>
صلب الموضوع والمسوغات المطلوبة:
${purpose || 'صياغة المراسلة المناسبة وفق الأصول الإدارية'}

المطلوب إخراجه:
اكتب النص الكامل للمراسلة الرسمية من البسملة وحتى الخاتمة مع التأصيل من القوانين والمناشير المرفقة أعلاه، بدون شروحات جانبية.
</task_requirements>`;
    } else if (selectedModel === 'deepseek') {
      // DeepSeek format with analytical reasoning requirement
      prompt += `المهمة: إعداد وتحرير مكاتبة إدارية رسمية [${type}] وفق بروتوكول المراسلات الحكومية.

[1] التوجيه والبيانات الأساسية:
- الجهة المصدرة: ${organization || 'الجهة الحكومية'} - ${department}
- المخاطب: ${recipientTitle} / ${recipientName}
- موضوع المعاملة: ${subject}
${referenceNumber ? `- مستند الإشارة: خطاب رقم (${referenceNumber}) وتاريخ (${referenceDate})` : ''}
- النبرة المطلوبة: ${toneDescription[tone]}

[2] الأسانيد النظامية والمناشير الإدارية المرجعية (يجب تضمينها في الديباجة والمتن):
${activeLaws.map((l) => `* نظام: ${l.title} -> نصوص المواد:\n${l.content}`).join('\n')}
${activeCirculars.map((c) => `* تعميم: ${c.title} (رقم ${c.number}) ->\n${c.content}`).join('\n')}

[3] المرفقات والمستندات المحالة:
${attachments.map((a) => `- ${a.name}: ${a.textContent.substring(0, 500)}`).join('\n')}

${useStyleTraining ? `[4] دليل الأسلوب المعتمد للمؤسسة:
${styleProfile.systemPromptInjection}
الخواتم المفضلة: ${styleProfile.closingsGuide}` : ''}

[5] الوقائع والطلب الأساسي المطلوب صياغته:
${purpose}

المطلوب من النموذج (DeepSeek):
قم بتحليل المعطيات واستنباط المواد النظامية المؤيدة وصياغة الخطاب الرسمي الكامل بدءاً من التحية وحتى التوقيع بأسلوب إداري عربي جزيل، مرتب في فقرات أو بنود رقمية واضحة ومقنعة لصاحب الصلاحية.`;
    } else {
      // Standard Markdown structured packet for ChatGPT, Ollama, and Gemini
      prompt += `# نظام إعداد المراسلات الإدارية الرسمية

أنت خبير صياغة إدارية وقانونية في ديوان الوزارات والمؤسسات الرسمية.
قم بصياغة **${type}** محكم ومكتمل الأركان.

## أولاً: بيانات المعاملة
- **الجهة المصدرة**: ${organization} - ${department}
- **المخاطب**: ${recipientTitle} / ${recipientName} المحترم
- **الموضوع**: ${subject}
${referenceNumber ? `- **إشارة إلى**: خطاب رقم ${referenceNumber} بتاريخ ${referenceDate}` : ''}
- **النبرة الإدارية**: ${toneDescription[tone]}

## ثانياً: الأسانيد القانونية والمناشير المعتمدة
${activeLaws.map((l) => `### ${l.title}\n${l.content}`).join('\n\n')}
${activeCirculars.map((c) => `### تعميم رقم ${c.number} - ${c.title}\n${c.content}`).join('\n\n')}

${attachments.length > 0 ? `## ثالثاً: ملخص المرفقات والمستندات
${attachments.map((a) => `- **${a.name}**: ${a.textContent.substring(0, 400)}`).join('\n')}` : ''}

${useStyleTraining ? `## رابعاً: معايير الأسلوب المؤسسي المدرب عليها
${styleProfile.systemPromptInjection}
` : ''}

## خامساً: صلب الموضوع والتعليمات المطلوبة
${purpose || 'يرجى تحرير الخطاب الرسمي بالصيغة الملائمة للغرض أعلاه'}

**تنبيه للموديل**: اكتب نص الخطاب مباشرة متضمناً البسملة، التحية، الديباجة النظامية، صلب الوقائع، التوصيات أو القرارات، الخاتمة الرسمية، والتوقيع وصور الإحاطة.`;
    }

    return prompt;
  };

  const promptPacket = generatePromptPacket();

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptPacket);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyPasted = () => {
    if (pastedOutput.trim()) {
      onApplyOutputToLetter(pastedOutput);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-cairo">
                محول ومولد المطالبات للنماذج الذكية المتعددة
              </h3>
              <p className="text-xs text-slate-400">
                تجهيز حزمة مطالبات دقيقة تشمل المرفقات والأنظمة والمناشير لـ DeepSeek و ChatGPT و Claude و Ollama
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Model Selector Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              اختر نموذج الذكاء الاصطناعي المستهدف:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {modelsList.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    selectedModel === m.id
                      ? `ring-2 ring-purple-600 font-bold ${m.color}`
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{m.name}</span>
                      {selectedModel === m.id && (
                        <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 border border-slate-200 inline-block mb-1.5">
                      {m.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Packet Preview & Copy Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  حزمة المطالبة الإدارية المهيأة (Prompt Packet)
                </span>
                <span className="text-[11px] text-slate-500">
                  (محسنة لبروتوكول {modelsList.find((m) => m.id === selectedModel)?.name})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {modelsList.find((m) => m.id === selectedModel)?.link && (
                  <a
                    href={modelsList.find((m) => m.id === selectedModel)?.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 font-medium"
                  >
                    <span>فتح موقع النموذج</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                <button
                  onClick={handleCopyPrompt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم نسخ الحزمة بنجاح!' : 'نسخ الحزمة الكاملة'}</span>
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={promptPacket}
              rows={10}
              className="w-full p-4 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-xl leading-relaxed focus:outline-none"
            />
          </div>

          {/* Paste Response from Model Section */}
          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-700" />
                الصق الرد الناتج من ({modelsList.find((m) => m.id === selectedModel)?.name}) هنا:
              </span>
              <span className="text-[11px] text-purple-700">
                سيتم إدراجه فوراً في الورقة الرسمية A4 للتنسيق والطباعة
              </span>
            </div>

            <textarea
              value={pastedOutput}
              onChange={(e) => setPastedOutput(e.target.value)}
              rows={5}
              placeholder="الصق نص الخطاب المنشأ من DeepSeek أو ChatGPT أو Claude لتطبيقه في المعاينة الرسمية..."
              className="w-full p-3 bg-white border border-purple-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />

            {pastedOutput.trim() && (
              <button
                onClick={handleApplyPasted}
                className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>اعتماد هذا النص في ورقة الخطاب الرسمية A4</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
