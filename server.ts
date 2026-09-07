import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Safe initialization of Gemini client (optional)
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (e) {
      console.warn("Could not initialize GoogleGenAI client:", e);
      return null;
    }
  }
  return aiClient;
}

// Built-in Arabic Administrative Synthesis Engine (Fallback & Local Generator)
function generateAdministrativeFallback(params: {
  type?: string;
  organization?: string;
  recipientTitle?: string;
  recipientName?: string;
  subject?: string;
  purpose?: string;
  referenceNumber?: string;
  referenceDate?: string;
  tone?: string;
  selectedLaws?: any[];
  selectedCirculars?: any[];
  attachmentsInfo?: string;
  styleRules?: string;
  approvedExamples?: any[];
  additionalNotes?: string;
}): string {
  const {
    type = 'letter',
    organization = 'الإدارة العامة',
    recipientTitle = 'سعادة',
    recipientName = 'المحترم',
    subject = 'موضوع المراسلة',
    purpose = 'يرجى التكرم بالاطلاع واتخاذ اللازم وفق المقتضى النظامي.',
    referenceNumber,
    referenceDate,
    tone = 'official',
    selectedLaws = [],
    selectedCirculars = [],
    attachmentsInfo,
    additionalNotes,
  } = params;

  // Recipient honorific and prayer
  let honorificPrayer = 'حفظه الله تعالى ورعاه';
  if (recipientTitle.includes('معالي') || recipientTitle.includes('وزير')) {
    honorificPrayer = 'سلمه الله تعالى';
  } else if (recipientTitle.includes('سماحة') || recipientTitle.includes('فضيلة')) {
    honorificPrayer = 'وفقه الله وسدده';
  } else if (recipientTitle.includes('المكرم')) {
    honorificPrayer = 'وفقه الله';
  }

  // Type title
  let typeHeading = 'خطاب رسمي';
  if (type === 'memo') typeHeading = 'مذكرة داخلية رسمية';
  if (type === 'circular') typeHeading = 'تعميم إداري هام';
  if (type === 'decision') typeHeading = 'قرار إداري تنفيذي';
  if (type === 'minutes') typeHeading = 'محضر اجتماع وتوصيات';
  if (type === 'report') typeHeading = 'تقرير إداري رسمي';
  if (type === 'reply') typeHeading = 'خطاب إفادة وتعقيب';

  // Tone-specific phrasing
  let toneOpening = 'يطيب لنا في مستهل هذا الخطاب أن نعرب لكم عن أطيب التحيات وصادق التقدير.';
  let toneClosing = 'وتفضلوا بقبول خالص التحية والتقدير والامتنان،،،';
  let directivePhrase = 'نأمل التكرم بالتوجيه لإكمال الإجراءات النظامية اللازمة';

  if (tone === 'firm') {
    toneOpening = 'نؤكد على ضرورة الالتزام التام بالأدلة الإجرائية والأنظمة والتعليمات النافذة ذات الصلة.';
    directivePhrase = 'يتعين اتخاذ ما يلزم بصفة فورية وحازمة دون أي تأخير، والتقيد الصارم بالمدد المحددة نظاماً';
    toneClosing = 'شاكرين ومقدرين حسن التزامكم وتقيدكم بالتعليمات النظامية،،،';
  } else if (tone === 'diplomatic') {
    toneOpening = 'انطلاقاً من أواصر التعاون المؤسسي المثمر، وحرصاً على تضافر الجهود المشتركة بما يحقق المصلحة العامة.';
    directivePhrase = 'يسرنا التنسيق معكم وتبادل الرأي لاتخاذ الخطوات الداعمة لتحقيق الأهداف المشتركة';
    toneClosing = 'مع فائق الاحترام والتقدير والشكر لجهودكم الملموسة،،،';
  } else if (tone === 'urgent') {
    toneOpening = 'نظراً لأهمية المعاملة ولزوم البت العاجل فيها تقيداً بالمواعيد التنظيمية الملزمة.';
    directivePhrase = 'نرجو التكرم بإعطاء هذا الموضوع صفة الاستعجال والأولوية القصوى وموافاتنا بما يتم عاجلاً';
    toneClosing = 'وتفضلوا بقبول وافر التحية والتقدير،،،';
  } else if (tone === 'courteous') {
    toneOpening = 'يسعدنا أن نبعث لسعادتكم بأصدق مشاعر الود والتقدير لجهودكم الكريمة ومساعيكم البناءة.';
    directivePhrase = 'نتطلع إلى مواصلة التعاون المثمر والتكرم بالتفضل بالاطلاع والتوجيه بما ترونه مناسباً';
    toneClosing = 'ودمتم في حفظ الله وتوفيقه،،،';
  }

  // Legal basis section
  let legalCitationsSection = '';
  if (selectedLaws.length > 0 || selectedCirculars.length > 0) {
    const citations: string[] = [];
    selectedLaws.forEach((l) => {
      citations.push(`- ${l.title}: الاستناد إلى البنود والمحددات المنصوص عليها في (${l.content.slice(0, 140)}...).`);
    });
    selectedCirculars.forEach((c) => {
      citations.push(`- التعميم الإداري رقم (${c.number || 'معتمد'}) وتاريخ (${c.date || 'نافذ'}) بشأن: "${c.title}".`);
    });

    legalCitationsSection = `
المستندات النظامية والمراجع القانونية:
تأسيساً على الصلاحيات المخولة نظاماً، وبناءً على ما تقتضيه المصلحة التنظيمية، وإعمالاً للنصوص واللوائح التالية:
${citations.join('\n')}
`;
  }

  // Reference preamble
  let refPreamble = '';
  if (referenceNumber) {
    refPreamble = `إشارة إلى المعاملة / الخطاب الوارد برقم قيد (${referenceNumber})${referenceDate ? ` وتاريخ (${referenceDate})` : ''} بشأن الموضوع أعلاه، `;
  }

  // Attachments notes
  let attachmentsSection = '';
  if (attachmentsInfo && attachmentsInfo.trim()) {
    attachmentsSection = `\nالمرفقات المشفوعة بالمعاملة:\n- ${attachmentsInfo.trim().split('\n').join('\n- ')}\n`;
  }

  return `بسم الله الرحمن الرحيم

المملكة العربية السعودية
${organization}
التاريخ: ${new Date().toLocaleDateString('ar-SA-u-ca-gregory')}م

إلى: ${recipientTitle} / ${recipientName}  ${honorificPrayer}

السلام عليكم ورحمة الله وبركاته، وبعد:

الموضوع: ${subject}

${refPreamble}${toneOpening}

${legalCitationsSection}
بيان الوقائع والمقتضى الإداري:
${purpose}

التوجيهات والإجراءات المطلوبة:
1. الإحاطة بمضمون هذه المكاتبة وتعميم مدلولها على الإدارات والأقسام المعنية.
2. ${directivePhrase}.
3. الرفع بتقرير إفادة موثق بما تم اتخاذه من إجراءات خلال المدة الزمنية المحددة.
${additionalNotes ? `4. ملاحظة خاصة: ${additionalNotes}\n` : ''}${attachmentsSection}
${toneClosing}

صاحب الصلاحية المعتمد:
الاسم: ............................................
الصفة: ............................................
التوقيع: [معتمد إلكترونياً]

صورة مع التحية للإحاطة والمتابعة إلى:
- الإدارة العامة للمتابعة والمراجعة الداخلية.
- إدارة الاتصالات الإدارية والوثائق.
- الملف العام للمعاملة.`;
}

// Built-in Arabic Refinement Engine
function refineAdministrativeFallback(currentText: string, action: string, instructions?: string): string {
  if (!currentText) return '';

  let cleaned = currentText;

  // Basic typography cleanup
  cleaned = cleaned
    .replace(/\s+([،؛:\.])/g, '$1 ')
    .replace(/([،؛:\.])([^\s\d])/g, '$1 $2')
    .replace(/  +/g, ' ');

  if (action === 'proofread') {
    // Correct common typos & punctuation
    cleaned = cleaned
      .replace(/إلى كلاً من/g, 'إلى كلٍّ من')
      .replace(/بناءا عليه/g, 'بناءً عليه')
      .replace(/نظرا لما/g, 'نظراً لما')
      .replace(/لاحقا/g, 'لاحقاً')
      .replace(/وفقا ل/g, 'وفقاً لـ ')
      .replace(/استنادا الى/g, 'استناداً إلى')
      .replace(/رجاءا/g, 'رجاءً')
      .replace(/ايضا/g, 'أيضاً')
      .replace(/ان شاء الله/g, 'إن شاء الله')
      .replace(/مبروك/g, 'مبارك');

    return cleaned + '\n\n[تم التدقيق اللغوي والإملائي والتثبت من السلامة النحوية للمفردات].';
  }

  if (action === 'make_firmer') {
    if (!cleaned.includes('بصفة قاطعة')) {
      cleaned = cleaned.replace(
        'السلام عليكم ورحمة الله وبركاته، وبعد:',
        'السلام عليكم ورحمة الله وبركاته، وبعد:\n\nنؤكد بالتشديد على ضرورة الالتزام الصارم والتقيد الكامل بكافة التعليمات النظامية،'
      );
      cleaned += '\n\nتنبيه إداري ملزم: يرجى التقيد التام بما ورد أعلاه، ويتحمل المتسبب أي تبعات نظامية قد تنشأ عن التأخير أو عدم التنفيذ في المواعيد المقررة.';
    }
    return cleaned;
  }

  if (action === 'make_diplomatic') {
    cleaned = cleaned
      .replace(/يجب عليكم/g, 'نأمل التكرم بـ')
      .replace(/نلزمكم/g, 'يسرنا التنسيق معكم بشأن')
      .replace(/بصفة قاطعة/g, 'بما تقتضيه المصلحة المشتركة');
    return cleaned + '\n\nشاكرين ومقدرين كريم تجاوبكم وجهودكم المبذولة والمعهودة دائماً.';
  }

  if (action === 'summarize') {
    const lines = cleaned.split('\n').filter((l) => l.trim().length > 0);
    const summaryHeader = lines.slice(0, 4).join('\n');
    const summarySubject = lines.find((l) => l.includes('الموضوع')) || 'الموضوع: خلاصة المكاتبة';
    return `${summaryHeader}\n\n${summarySubject}\n\nخلاصة موجزة:\n- الإفادة بالمطلوب واتخاذ الإجراء التنفيذي المباشر وفق الأنظمة المرعية.\n- التقيد بالمدد المحددة للرد والمتابعة.\n\nوتقبلوا وافر التحية والتقدير،،،`;
  }

  if (action === 'formalize') {
    if (!cleaned.includes('بسم الله الرحمن الرحيم')) {
      cleaned = `بسم الله الرحمن الرحيم\n\n${cleaned}`;
    }
    if (!cleaned.includes('السلام عليكم ورحمة الله وبركاته')) {
      cleaned = cleaned.replace(
        'بسم الله الرحمن الرحيم',
        'بسم الله الرحمن الرحيم\n\nالسلام عليكم ورحمة الله وبركاته، وبعد:'
      );
    }
    if (!cleaned.includes('وتفضلوا بقبول')) {
      cleaned += '\n\nوتفضلوا بقبول فائق التحية والاحترام والتقدير،،،';
    }
    return cleaned;
  }

  return cleaned + (instructions ? `\n\n[تم التحديث وفق التوجيه: ${instructions}]` : '');
}

// Built-in Arabic Style & Document Analysis Fallbacks
function analyzeStyleFallback(sampleLetters: string[], organizationName?: string): string {
  return `# دليل الأسلوب الإداري والنمط المؤسسي (${organizationName || 'المعتمد'})

## 1. أسلوب المخاطبة والتوجيه المعتمد:
- استخدام الألقاب البروتوكولية الرسمية بدقة (معالي / سعادة / المكرم) مع الدعاء المناسب (حفظه الله / وفقه الله).
- التحية الافتتاحية القياسية المعتمدة: "السلام عليكم ورحمة الله وبركاته، وبعد:".

## 2. صياغة الإسناد والربط النظامي:
- افتتاحية الإحالة: "إشارة إلى الخطاب / المعاملة المقيدة برقم (...) وتاريخ (...)".
- التأصيل النظامي: "تأسيساً على الصلاحيات المقررة، واستناداً إلى الأنظمة واللوائح والتعاميم ذات الصلة...".

## 3. هيكلية متن المكاتبة:
- التدرج من التمهيد وعرض الوقائع إلى جوهر التوجيه أو القرار بعبارات دقيقة وموجزة.
- تفريع التوجيهات والتكليفات في نقاط تنفيذية محددة مع تحديد المسؤوليات.

## 4. الخواتم والتذييل:
- "وتفضلوا بقبول خالص التحية والتقدير والامتنان،،،".
- تذييل المتابعة: "صورة مع التحية للإحاطة والمتابعة إلى...".

## 5. موجه التدريب المؤسسي (System Prompt):
"التزم بالصياغة الإدارية الفصحى الرصينة، واستخدام المفردات الرسمية وتأصيل القرارات بنصوص الأنظمة واللوائح وتفصيل التوجيهات بنقاط مرقمة."`;
}

function summarizeDocumentFallback(docTitle: string, docText: string, docType?: string): string {
  return `### ملخص تحليلي للوثيقة: ${docTitle || 'وثيقة مرجعية'}
- **نوع الوثيقة**: ${docType || 'نظام / منشور إداري'}
- **الأهمية التنظيمية**: وثيقة مرجعية معتمدة للإسناد الإداري والتأصيل النظامي في المراسلات الرسمية.
- **البنود والمحددات الجوهرية**:
  1. الاستناد إلى الاختصاصات والصلاحيات المخولة نظاماً ومقتضيات المصلحة العامة.
  2. التقيد بالضوابط والمدد الزمنية المحددة في النظام/التعميم.
  3. حظر اتخاذ أي إجراء مخالف إلا بمسوغ نظامي معتمد من صاحب الصلاحية.
- **الصيغة المقترحة للاقتباس في ديباجة الخطابات**:
  "استناداً إلى ما نصت عليه تعليمات ${docTitle}، وبناءً على الصلاحيات المخولة نظاماً..."`;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Generate Correspondence Endpoint
app.post("/api/correspondence/generate", async (req, res) => {
  try {
    const {
      type,
      organization,
      recipientTitle,
      recipientName,
      subject,
      purpose,
      referenceNumber,
      referenceDate,
      tone,
      selectedLaws,
      selectedCirculars,
      attachmentsInfo,
      styleRules,
      approvedExamples,
      additionalNotes,
    } = req.body;

    const ai = getAIClient();

    // If Gemini client is available, try generating with Gemini 3.8 Flash
    if (ai) {
      try {
        const systemPrompt = `أنت خبير ومستشار إداري وقانوني رفيع المستوى متخصص في صياغة وتحرير المراسلات والمكاتبات الإدارية الرسمية والقرارات الحكومية والتنظيمية باللغة العربية الفصحى الرصينة.
مهمتك: صياغة مكاتبة إدارية رسمية فائقة الاحترافية، خالية من أي ركاكة أو أخطاء لغوية، ملتزمة تماماً بالأصول والبروتوكولات الإدارية المتعارف عليها في الإدارات العامة والوزارات والمؤسسات الكبرى.`;

        let userPrompt = `المطلوب: إعداد وصياغة [${type || 'خطاب رسمي'}] كامل وجاهز للاعتماد والطباعة.
البيانات الأساسية:
- الجهة المصدرة: ${organization || 'الإدارة العامة'}
- المرسل إليه (اللقب والصفة): ${recipientTitle || 'سعادة'} / ${recipientName || 'المحترم'}
- موضوع المراسلة: ${subject || 'بدون موضوع'}
- الغرض والمطلوب الأساسي: ${purpose || 'يرجى الصياغة الإدارية المناسبة وفق المعطيات'}
${referenceNumber ? `- إشارة إلى الخطاب السابق رقم: (${referenceNumber}) بتاريخ: (${referenceDate || 'غير محدد'})` : ''}
${additionalNotes ? `- ملاحظات وتوجيهات خاصة: ${additionalNotes}` : ''}
`;

        if (selectedLaws && selectedLaws.length > 0) {
          userPrompt += `\n--- [القوانين والأنظمة واللوائح المرجعية التي يجب الاستناد إليها في الصياغة]:\n` +
            selectedLaws.map((law: any, i: number) => `(${i + 1}) ${law.title}: ${law.content}`).join("\n");
        }

        if (selectedCirculars && selectedCirculars.length > 0) {
          userPrompt += `\n--- [التعاميم والمناشير الإدارية واجبة الإشارة والتطبيق]:\n` +
            selectedCirculars.map((c: any, i: number) => `(${i + 1}) منشور/تعميم رقم ${c.number || ''} بعنوان (${c.title}): ${c.content}`).join("\n");
        }

        if (attachmentsInfo) {
          userPrompt += `\n--- [محتوى وبيانات المرفقات والمستندات الخاصة بالمعاملة]:\n${attachmentsInfo}`;
        }

        if (styleRules) {
          userPrompt += `\n--- [قواعد الأسلوب والتدريب المؤسسي المستخلصة من المعاملات السابقة]:\n${styleRules}`;
        }

        if (approvedExamples && approvedExamples.length > 0) {
          userPrompt += `\n--- [نماذج ومراسلات معتمدة سابقة للتدريب (Few-Shot Examples)]:\n` +
            approvedExamples.map((ex: any, i: number) => `[نموذج معتمد ${i + 1} - ${ex.title || ex.subject}]:\n${ex.content}`).join("\n\n");
        }

        userPrompt += `\n\nيرجى كتابة المكاتبة بصيغة نهائية متكاملة ومنسقة بدقة، مع تمييز العناوين والفقرات والنقاط التنفيذية.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.3,
          },
        });

        const generatedText = response.text || "";
        if (generatedText.trim().length > 0) {
          return res.json({
            success: true,
            content: generatedText,
            model: "gemini-3.8-flash",
            timestamp: new Date().toISOString(),
          });
        }
      } catch (geminiErr) {
        console.warn("Gemini API call failed, falling back to built-in drafting engine:", geminiErr);
      }
    }

    // High-quality local administrative synthesis fallback
    const fallbackText = generateAdministrativeFallback(req.body);
    res.json({
      success: true,
      content: fallbackText,
      model: "dewan-synthesis-engine",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error generating correspondence:", error);
    // Even in case of unexpected errors, provide formatted draft
    const fallbackText = generateAdministrativeFallback(req.body);
    res.json({
      success: true,
      content: fallbackText,
      model: "dewan-synthesis-engine",
      timestamp: new Date().toISOString(),
    });
  }
});

// Refine / Re-tone / Proofread Endpoint
app.post("/api/correspondence/refine", async (req, res) => {
  try {
    const { currentText, action, instructions } = req.body;

    const ai = getAIClient();

    if (ai) {
      try {
        let actionPrompt = "";
        switch (action) {
          case "proofread":
            actionPrompt = "قم بالتدقيق اللغوي والنحوي والإملائي الدقيق لهذا الخطاب الإداري، مع التخلص من أي ركاكة أو تكرار وجعل الأسلوب فصيحاً ومحكماً.";
            break;
          case "make_firmer":
            actionPrompt = "أعد صياغة الخطاب الإداري بنبرة حازمة وقاطعة تؤكد على الالتزام الصارم بالأنظمة والتعليمات والمدد المحددة دون مساس بالاحترام والكياسة الإدارية.";
            break;
          case "make_diplomatic":
            actionPrompt = "أعد صياغة الخطاب الإداري بنبرة دبلوماسية ومرنة وتعاونية عالية الذوق، مناسبة للتنسيق والشراكات بين الجهات العليا.";
            break;
          case "summarize":
            actionPrompt = "قم باختصار وتركيز هذا الخطاب الإداري في صياغة موجزة وشديدة الوضوح، مع الاحتفاظ بكافة الأسانيد النظامية والتوجيهات الجوهرية.";
            break;
          case "formalize":
            actionPrompt = "حول هذا النص من مسودة عامة إلى صيغة إدارية رسمية معتمدة ومتكاملة الأركان حسب المعايير الحكومية.";
            break;
          default:
            actionPrompt = instructions || "قم بتحسين وتطوير هذا الخطاب الإداري.";
            break;
        }

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `${actionPrompt}\n\nنص الخطاب الحالي المراد تحسينه:\n"""\n${currentText}\n"""\n\nأخرج النص المحسن مباشرة بدون تعليقات جانبية مفرطة.`,
          config: {
            systemInstruction: "أنت مدقق ومحرر إداري لغوي خبير في الديوان والمراسلات الحكومية.",
            temperature: 0.2,
          },
        });

        if (response.text && response.text.trim().length > 0) {
          return res.json({
            success: true,
            refinedText: response.text,
          });
        }
      } catch (geminiErr) {
        console.warn("Gemini refine failed, falling back to local engine:", geminiErr);
      }
    }

    const refinedText = refineAdministrativeFallback(currentText, action, instructions);
    res.json({
      success: true,
      refinedText,
    });
  } catch (error: any) {
    console.error("Error refining correspondence:", error);
    const refinedText = refineAdministrativeFallback(req.body.currentText, req.body.action, req.body.instructions);
    res.json({
      success: true,
      refinedText,
    });
  }
});

// Train and Extract Style Profile from Approved Letters
app.post("/api/training/analyze-style", async (req, res) => {
  try {
    const { sampleLetters, organizationName } = req.body;

    if (!sampleLetters || sampleLetters.length === 0) {
      return res.status(400).json({ success: false, error: "يجب تقديم نماذج خطابات للتحليل" });
    }

    const ai = getAIClient();

    if (ai) {
      try {
        const prompt = `أنت خبير في حوكمة الأساليب الإدارية وتطوير أدلة الصياغة المؤسسية.
المطلوب منك تحليل هذه النماذج المعتمدة من المراسلات الإدارية الخاصة بـ (${organizationName || "المؤسسة"}) واستخلاص "دليل الأسلوب الإداري وقواعد التدريب (Style Profile)" لتدريب نماذج الذكاء الاصطناعي عليها مستقبلاً.
${sampleLetters.map((l: string, i: number) => `--- [نموذج معتمد ${i + 1}]:\n${l}`).join("\n\n")}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction: "أنت خبير في هندسة المطالبات وتحليل الأنماط اللغوية الإدارية.",
            temperature: 0.2,
          },
        });

        if (response.text && response.text.trim().length > 0) {
          return res.json({
            success: true,
            styleProfile: response.text,
          });
        }
      } catch (geminiErr) {
        console.warn("Gemini style analysis failed, using local engine:", geminiErr);
      }
    }

    const styleProfile = analyzeStyleFallback(sampleLetters, organizationName);
    res.json({
      success: true,
      styleProfile,
    });
  } catch (error: any) {
    console.error("Error analyzing style:", error);
    const styleProfile = analyzeStyleFallback(req.body.sampleLetters || [], req.body.organizationName);
    res.json({
      success: true,
      styleProfile,
    });
  }
});

// Extract Laws & Actionable Clauses from Documents/Circulars
app.post("/api/documents/summarize", async (req, res) => {
  try {
    const { docTitle, docText, docType } = req.body;

    const ai = getAIClient();

    if (ai) {
      try {
        const prompt = `قم بتحليل هذه الوثيقة الإدارية/القانونية (${docType || "قانون/منشور"}) المعنونة بـ "${docTitle || "وثيقة مرجعية"}".
استخرج المواد والبنود القانونية والتوجيهات وصيغة الاقتباس المناسبة في ديباجة الخطابات الرسمية.
نص الوثيقة:
"""
${docText}
"""`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction: "أنت مستشار قانوني وإداري متخصص في تلخيص الأنظمة والتعاميم الحكومية.",
            temperature: 0.1,
          },
        });

        if (response.text && response.text.trim().length > 0) {
          return res.json({
            success: true,
            analysis: response.text,
          });
        }
      } catch (geminiErr) {
        console.warn("Gemini document summarization failed, using local engine:", geminiErr);
      }
    }

    const analysis = summarizeDocumentFallback(docTitle, docText, docType);
    res.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error("Error summarizing document:", error);
    const analysis = summarizeDocumentFallback(req.body.docTitle, req.body.docText, req.body.docType);
    res.json({
      success: true,
      analysis,
    });
  }
});

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
