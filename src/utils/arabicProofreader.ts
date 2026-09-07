/**
 * أداة التدقيق اللغوي والإملائي والإداري المدمجة لمحرر المراسلات الرسمية
 * تكشف الأخطاء الشائعة في المخاطبات والكتب والقرارات الحكومية
 */

export interface ProofreadMatch {
  id: string;
  original: string;
  replacement: string;
  index: number;
  length: number;
  category: 'spelling' | 'grammar' | 'protocol';
  categoryLabel: string;
  explanation: string;
}

interface RuleDefinition {
  regex: RegExp;
  replacement: string | ((matched: string) => string);
  category: 'spelling' | 'grammar' | 'protocol';
  categoryLabel: string;
  explanation: string;
}

const RULES: RuleDefinition[] = [
  // 1. همزة الوصل والقطع في الأفعال والمصادر الإدارية
  {
    regex: /\bإستناد[اً]/gu,
    replacement: 'استناداً',
    category: 'spelling',
    categoryLabel: 'خطأ همزة وصل',
    explanation: 'همزة (استناداً) همزة وصل لأنها مصدر الفعل السداسي (استند)، والصواب كتابتها بألف دون همزة: (استناداً).',
  },
  {
    regex: /\bإجتماع\b/gu,
    replacement: 'اجتماع',
    category: 'spelling',
    categoryLabel: 'خطأ همزة وصل',
    explanation: 'همزة (اجتماع) همزة وصل لأنها مصدر الفعل الخماسي (اجتمع)، والصواب كتابتها دون همزة.',
  },
  {
    regex: /\bإعتماد\b/gu,
    replacement: 'اعتماد',
    category: 'spelling',
    categoryLabel: 'خطأ همزة وصل',
    explanation: 'همزة (اعتماد) همزة وصل لأنها مصدر خماسي (اعتمد)، والصواب رسمها دون همزة.',
  },
  {
    regex: /\bإختصاص\b/gu,
    replacement: 'اختصاص',
    category: 'spelling',
    categoryLabel: 'خطأ همزة وصل',
    explanation: 'همزة (اختصاص) همزة وصل (مصدر اختص)، والصواب عدم وضع همزة تحت الألف.',
  },
  {
    regex: /\bإستلام\b/gu,
    replacement: 'استلام',
    category: 'spelling',
    categoryLabel: 'خطأ همزة وصل',
    explanation: 'همزة (استلام) همزة وصل (مصدر استلم)، والصواب: (استلام).',
  },
  {
    regex: /\bإستفسار\b/gu,
    replacement: 'استفسار',
    category: 'spelling',
    categoryLabel: 'خطأ همزة وصل',
    explanation: 'همزة (استفسار) همزة وصل (مصدر سداسي استفسر)، وتكتب دون همزة.',
  },
  {
    regex: /\bإستفسارات\b/gu,
    replacement: 'استفسارات',
    category: 'spelling',
    categoryLabel: 'خطأ همزة وصل',
    explanation: 'تكتب همزة وصل دون رسم الهمزة: (استفسارات).',
  },
  {
    regex: /\bإستكمال\b/gu,
    replacement: 'استكمال',
    category: 'spelling',
    categoryLabel: 'خطأ همزة وصل',
    explanation: 'مصدر سداسي يبدأ بهمزة وصل: (استكمال).',
  },
  {
    regex: /\bإستعجال\b/gu,
    replacement: 'استعجال',
    category: 'spelling',
    categoryLabel: 'خطأ همزة وصل',
    explanation: 'مصدر سداسي يبدأ بهمزة وصل: (استعجال).',
  },
  {
    regex: /\bإستثناء\b/gu,
    replacement: 'استثناء',
    category: 'spelling',
    categoryLabel: 'خطأ همزة وصل',
    explanation: 'همزة وصل سداسية: (استثناء).',
  },
  {
    regex: /\bإستخدام\b/gu,
    replacement: 'استخدام',
    category: 'spelling',
    categoryLabel: 'خطأ همزة وصل',
    explanation: 'همزة وصل سداسية: (استخدام).',
  },

  // 2. همزات قطع أُسقطت همزتها
  {
    regex: /\bاجراءات\b/gu,
    replacement: 'إجراءات',
    category: 'spelling',
    categoryLabel: 'همزة قطع ساقطة',
    explanation: 'كلمة (إجراءات) تبدأ بهمزة قطع مكسورة، والصواب إثبات الهمزة تحت الألف: (إجراءات).',
  },
  {
    regex: /\bاشعار\b/gu,
    replacement: 'إشعار',
    category: 'spelling',
    categoryLabel: 'همزة قطع ساقطة',
    explanation: 'مصدر الفعل الرباعي (أشعر) يبدأ بهمزة قطع واجبة الإثبات: (إشعار).',
  },
  {
    regex: /\bاحالة\b/gu,
    replacement: 'إحالة',
    category: 'spelling',
    categoryLabel: 'همزة قطع ساقطة',
    explanation: 'مصدر الفعل الرباعي (أحال) همزته قطع: (إحالة).',
  },
  {
    regex: /\bافادة\b/gu,
    replacement: 'إفادة',
    category: 'spelling',
    categoryLabel: 'همزة قطع ساقطة',
    explanation: 'مصدر الفعل الرباعي (أفاد) همزته قطع واجبة: (إفادة).',
  },
  {
    regex: /\bالغاء\b/gu,
    replacement: 'إلغاء',
    category: 'spelling',
    categoryLabel: 'همزة قطع ساقطة',
    explanation: 'مصدر الفعل الرباعي (ألغى) همزته قطع: (إلغاء).',
  },
  {
    regex: /\bالزام\b/gu,
    replacement: 'إلزام',
    category: 'spelling',
    categoryLabel: 'همزة قطع ساقطة',
    explanation: 'همزة قطع واجبة الإثبات: (إلزام).',
  },
  {
    regex: /\bانهاء\b/gu,
    replacement: 'إنهاء',
    category: 'spelling',
    categoryLabel: 'همزة قطع ساقطة',
    explanation: 'مصدر الفعل الرباعي (أنهى) همزته قطع: (إنهاء).',
  },
  {
    regex: /\bادارة\b/gu,
    replacement: 'إدارة',
    category: 'spelling',
    categoryLabel: 'همزة قطع ساقطة',
    explanation: 'همزة قطع واجبة الإثبات في (إدارة).',
  },

  // 3. أخطاء تنوين النصب الشائعة بعد الهمزة المتطرفة
  {
    regex: /\bبناءاً\s+على\b/gu,
    replacement: 'بناءً على',
    category: 'spelling',
    categoryLabel: 'رسم تنوين خاطئ',
    explanation: 'الهمزة المتطرفة إذا سبقتها ألف مد لا يلحقها ألف تنوين، فالصواب: (بناءً على) وليس (بناءاً).',
  },
  {
    regex: /\bابتداءاً\b/gu,
    replacement: 'ابتداءً',
    category: 'spelling',
    categoryLabel: 'رسم تنوين خاطئ',
    explanation: 'الهمزة المتطرفة المسبوقة بألف لا تزاد بعدها ألف تنوين: (ابتداءً).',
  },
  {
    regex: /\bرجاءاً\b/gu,
    replacement: 'رجاءً',
    category: 'spelling',
    categoryLabel: 'رسم تنوين خاطئ',
    explanation: 'الصواب كتابتها بتنوين فوق الهمزة مباشرة: (رجاءً).',
  },
  {
    regex: /\bمساءاً\b/gu,
    replacement: 'مساءً',
    category: 'spelling',
    categoryLabel: 'رسم تنوين خاطئ',
    explanation: 'الصواب وضع التنوين على الهمزة: (مساءً).',
  },
  {
    regex: /\bجزءاً\b/gu,
    replacement: 'جزءًا',
    category: 'spelling',
    categoryLabel: 'رسم تنوين',
    explanation: 'الهمزة لم تسبق بألف مد فتوضع ألف التنوين بعدها: (جزءًا).',
  },

  // 4. أخطاء النحو والتركيب اللغوي (أل التعريف مع غير)
  {
    regex: /\bالغير\s+قابلة\b/gu,
    replacement: 'غير القابلة',
    category: 'grammar',
    categoryLabel: 'خطأ تعريفي نحوي',
    explanation: '(غير) لا تقبل (أل) التعريف لأنها متوغلة في الإبهام، والصواب تعريف المضاف إليه بعدها: (غير القابلة).',
  },
  {
    regex: /\bالغير\s+مسموح\b/gu,
    replacement: 'غير المسموح',
    category: 'grammar',
    categoryLabel: 'خطأ تعريفي نحوي',
    explanation: 'الصواب إدخال أداة التعريف على المضاف إليه: (غير المسموح).',
  },
  {
    regex: /\bالغير\s+مسؤول\b/gu,
    replacement: 'غير المسؤول',
    category: 'grammar',
    categoryLabel: 'خطأ تعريفي نحوي',
    explanation: 'الصواب تعريف المضاف إليه: (غير المسؤول).',
  },
  {
    regex: /\bالغير\s+جائز\b/gu,
    replacement: 'غير الجائز',
    category: 'grammar',
    categoryLabel: 'خطأ تعريفي نحوي',
    explanation: 'الصواب: (غير الجائز).',
  },
  {
    regex: /\bالغير\s+مستوف[يى]\b/gu,
    replacement: 'غير المستوفي',
    category: 'grammar',
    categoryLabel: 'خطأ تعريفي نحوي',
    explanation: 'الصواب: (غير المستوفي).',
  },
  {
    regex: /\bالغير\s+مشمول\b/gu,
    replacement: 'غير المشمول',
    category: 'grammar',
    categoryLabel: 'خطأ تعريفي نحوي',
    explanation: 'الصواب: (غير المشمول).',
  },
  {
    regex: /\bالغير\b/gu,
    replacement: 'غيرهم أو الآخرين',
    category: 'grammar',
    categoryLabel: 'استعمال كلمة الغير',
    explanation: 'في اللغة الفصيحة، يفضل استبدال كلمة (الغير) بـ (الآخرين) أو (الطرف الآخر).',
  },

  // 5. كسر همزة إن بعد حيث
  {
    regex: /\bحيث\s+أن\b/gu,
    replacement: 'حيث إن',
    category: 'grammar',
    categoryLabel: 'كسر همزة إن',
    explanation: 'تكسر همزة (إن) وجوباً بعد ظرف المكان والزمان (حيث)، فالصواب: (حيث إن) بكسر الهمزة.',
  },

  // 6. لا زال vs ما زال
  {
    regex: /\bلا\s*زال\b/gu,
    replacement: 'ما زال',
    category: 'grammar',
    categoryLabel: 'أداة النفي مع الماضي',
    explanation: '(لا) لا تنفي الفعل الماضي إلا في سياق الدعاء أو التكرار، والصواب للإخبار بالاستمرار هو: (ما زال).',
  },
  {
    regex: /\bلا\s*زالت\b/gu,
    replacement: 'ما زالت',
    category: 'grammar',
    categoryLabel: 'أداة النفي مع الماضي',
    explanation: 'الصواب للإخبار باستمرار الحال: (ما زالت).',
  },

  // 7. صياغات الأسلوب الإداري والبروتوكول الرسمي
  {
    regex: /\bتواجد\s+الموظفين\b/gu,
    replacement: 'وجود الموظفين',
    category: 'protocol',
    categoryLabel: 'أسلوب إداري رصين',
    explanation: '(التواجد) لغةً هو إظهار شدة الوجد والعشق والحزن، والصواب للإشارة لحضور الموظفين أو الأشياء هو: (وجود الموظفين) أو (حضورهم).',
  },
  {
    regex: /\bتواجد\s+العاملين\b/gu,
    replacement: 'وجود العاملين',
    category: 'protocol',
    categoryLabel: 'أسلوب إداري رصين',
    explanation: 'الصواب: (وجود العاملين) أو (حضور العاملين).',
  },
  {
    regex: /\bيتواجد\b/gu,
    replacement: 'يوجد / يحضر',
    category: 'protocol',
    categoryLabel: 'استعمال تواجد',
    explanation: 'الأفضل في الخطابات الرسمية استخدام: (يوجد) أو (يحضر) أو (يداوم).',
  },
  {
    regex: /\bكافة\s+الموظفين\b/gu,
    replacement: 'الموظفين كافة / جميع الموظفين',
    category: 'protocol',
    categoryLabel: 'موقع كلمة كافة',
    explanation: '(كافة) تأتي حالاً ولا تضاف في فصيح اللغة، فالصواب: (الموظفين كافة) أو (جميع الموظفين).',
  },
  {
    regex: /\bكافة\s+الإدارات\b/gu,
    replacement: 'الإدارات كافة / جميع الإدارات',
    category: 'protocol',
    categoryLabel: 'موقع كلمة كافة',
    explanation: 'الصواب: (الإدارات كافة) أو (جميع الإدارات).',
  },
  {
    regex: /\bكافة\s+الأطراف\b/gu,
    replacement: 'الأطراف كافة / جميع الأطراف',
    category: 'protocol',
    categoryLabel: 'موقع كلمة كافة',
    explanation: 'الصواب: (الأطراف كافة) أو (جميع الأطراف).',
  },
  {
    regex: /\bمدراء\b/gu,
    replacement: 'مديرون / مديرين',
    category: 'grammar',
    categoryLabel: 'جمع المذكر السالم',
    explanation: 'اسم الفاعل من الفعل الرباعي (أدار) هو (مُدير)، ويجمع جمع مذكر سالم: (مديرون) رفعاً و(مديرين) نصباً وجراً، وجمع التكسير (مدراء) غير قياسي.',
  },
  {
    regex: /\bمدرائنا\b/gu,
    replacement: 'مديرينا',
    category: 'grammar',
    categoryLabel: 'جمع كلمة مدير',
    explanation: 'الصواب: (مديرينا).',
  },
  {
    regex: /\bمبروك\b/gu,
    replacement: 'مبارك',
    category: 'protocol',
    categoryLabel: 'المعجم الرسمي',
    explanation: '(مبروك) اسم مفعول من الفعل بَرَكَ (بَرَكَ البعير)، أما التهنئة الصائبة فمشتقة من بارك: (مبارك) أو (تهانينا المباركة).',
  },
  {
    regex: /\bيرجى\s+التكرم\b/gu,
    replacement: 'نرجو التكرم / يُرجى التكرم',
    category: 'protocol',
    categoryLabel: 'أدب المخاطبة الرسمية',
    explanation: 'في المكاتبات الرسمية، يستحسن نسبة الرجاء للمتكلم: (نرجو التكرم) أو ضبط الفعل بالبناء للمجهول مضبوطاً: (يُرجى التكرم).',
  },
  {
    regex: /\bمسؤلية\b/gu,
    replacement: 'مسؤولية',
    category: 'spelling',
    categoryLabel: 'رسم الهمزة المتوسطة',
    explanation: 'الهمزة المتوسطة المضمومة يتبعها واو فتكتب على الواو: (مسؤولية).',
  },
  {
    regex: /\bشؤن\b/gu,
    replacement: 'شؤون',
    category: 'spelling',
    categoryLabel: 'رسم الهمزة المتوسطة',
    explanation: 'الصواب إثبات الواو: (شؤون).',
  },
  {
    regex: /\bأخصائي\b/gu,
    replacement: 'اختصاصي',
    category: 'protocol',
    categoryLabel: 'المصطلح الوظيفي',
    explanation: 'في بطاقات الوصف الوظيفي والأنظمة، المصطلح القياسي هو: (اختصاصي) المشتق من الاختصاص.',
  },
  {
    regex: /\bأكد\s+على\b/gu,
    replacement: 'أكد أن / أكد الشيء',
    category: 'grammar',
    categoryLabel: 'تعدي الفعل أكد',
    explanation: 'الفعل (أكّد) يتعدى بنفسه دون حاجة لحرف الجر (على)، فيقال: (أكّد ضرورة الالتزام) أو (أكّد أن الموعد قد حان).',
  },
  {
    regex: /\bبالرغم\s+من\b/gu,
    replacement: 'على الرغم من',
    category: 'protocol',
    categoryLabel: 'التعبير اللغوي الدقيق',
    explanation: 'الأصح والأفصح في لغة الإدارة: (على الرغم من) بدلاً من (بالرغم من).',
  },
  {
    regex: /\bكتابنا\s+رقم\b/gu,
    replacement: 'خطابنا رقم / مكاتبتنا رقم',
    category: 'protocol',
    categoryLabel: 'مصطلحات الاتصالات الإدارية',
    explanation: 'في الأعراف الحكومية والإدارية، يسمى المحرر الصادر (خطاباً) أو (مكاتبة) وليس (كتاباً).',
  },
  {
    regex: /\bلفت\s+نظر\b/gu,
    replacement: 'توجيه عناية / إشعار نظامي',
    category: 'protocol',
    categoryLabel: 'دبلوماسية التخاطب',
    explanation: 'في المخاطبات الإدارية الرصينة، يفضل استخدام: (توجيه عناية) أو (إشعار نظامي) لتجنب الفجاجة.',
  },
];

/**
 * فحص النص واستخراج جميع الملاحظات والتظليلات مع مواقعها في النص
 */
export function analyzeArabicText(text: string): ProofreadMatch[] {
  if (!text || typeof text !== 'string') return [];

  const matches: ProofreadMatch[] = [];

  RULES.forEach((rule, ruleIdx) => {
    // Reset regex index
    rule.regex.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = rule.regex.exec(text)) !== null) {
      const original = match[0];
      const replacement =
        typeof rule.replacement === 'function'
          ? rule.replacement(original)
          : rule.replacement;

      matches.push({
        id: `match-${ruleIdx}-${match.index}`,
        original,
        replacement,
        index: match.index,
        length: original.length,
        category: rule.category,
        categoryLabel: rule.categoryLabel,
        explanation: rule.explanation,
      });

      // Avoid infinite loop if zero-length regex
      if (match.index === rule.regex.lastIndex) {
        rule.regex.lastIndex++;
      }
    }
  });

  // Sort matches by appearance in text
  matches.sort((a, b) => a.index - b.index);

  // Filter overlapping matches
  const filtered: ProofreadMatch[] = [];
  let lastEnd = -1;

  for (const m of matches) {
    if (m.index >= lastEnd) {
      filtered.push(m);
      lastEnd = m.index + m.length;
    }
  }

  return filtered;
}

/**
 * استبدال ملاحظة محددة في النص
 */
export function applyCorrection(text: string, match: ProofreadMatch): string {
  if (match.index < 0 || match.index + match.length > text.length) {
    // Fallback: replace first occurrence of original
    return text.replace(match.original, match.replacement);
  }

  return (
    text.substring(0, match.index) +
    match.replacement +
    text.substring(match.index + match.length)
  );
}

/**
 * استبدال وتصحيح كافة الملاحظات دفعة واحدة
 */
export function applyAllCorrections(text: string, matches: ProofreadMatch[]): string {
  if (!matches || matches.length === 0) return text;

  // Sort in reverse order of index to prevent index shifts
  const sorted = [...matches].sort((a, b) => b.index - a.index);
  let result = text;

  for (const m of sorted) {
    result =
      result.substring(0, m.index) +
      m.replacement +
      result.substring(m.index + m.length);
  }

  return result;
}
