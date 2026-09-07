import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  Check, 
  Calendar, 
  Briefcase, 
  ShieldAlert, 
  Users, 
  HelpCircle, 
  Award, 
  Coins, 
  Clock, 
  Layers,
  ArrowRight,
  FileText
} from 'lucide-react';
import { CorrespondenceTemplate } from '../types';
import { correspondenceTemplates } from '../data/templates';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: CorrespondenceTemplate) => void;
  selectedTemplateId?: string | null;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  selectedTemplateId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');

  const categories = [
    'الكل',
    'الموارد البشرية',
    'المهام والقرارات',
    'خدمة المستفيدين والشكاوى',
    'المالية والمشاريع',
    'التنسيق والاتصال'
  ];

  const filteredTemplates = useMemo(() => {
    return correspondenceTemplates.filter((tpl) => {
      const matchesCategory = selectedCategory === 'الكل' || tpl.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        tpl.name.toLowerCase().includes(q) ||
        tpl.subject.toLowerCase().includes(q) ||
        tpl.description.toLowerCase().includes(q) ||
        tpl.purpose.toLowerCase().includes(q) ||
        tpl.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calendar':
        return <Calendar className="w-5 h-5 text-amber-600" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-emerald-600" />;
      case 'Users':
        return <Users className="w-5 h-5 text-purple-600" />;
      case 'HelpCircle':
        return <HelpCircle className="w-5 h-5 text-rose-600" />;
      case 'Award':
        return <Award className="w-5 h-5 text-amber-500" />;
      case 'Coins':
        return <Coins className="w-5 h-5 text-emerald-600" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-indigo-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const getToneBadge = (tone: string) => {
    switch (tone) {
      case 'firm':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">حازم</span>;
      case 'diplomatic':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">دبلوماسي</span>;
      case 'urgent':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">عاجل</span>;
      case 'courteous':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">رجائي وتقديري</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">رسمي متزن</span>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'letter': return 'خطاب رسمي';
      case 'memo': return 'مذكرة داخلية';
      case 'circular': return 'تعميم إداري';
      case 'decision': return 'قرار إداري';
      case 'reply': return 'رد رسمي / إفادة';
      case 'minutes': return 'محضر اجتماع';
      case 'report': return 'تقرير إداري';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-linear-to-r from-slate-900 via-slate-800 to-amber-950 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">دليل القوالب الإدارية الجاهزة</h3>
                <span className="text-[11px] font-semibold bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/40">
                  {correspondenceTemplates.length} قوالب معتمدة
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                اختر قالباً نموذجياً لتعبئة الحقول وتوليد مكاتبة رسمية محكمة الصياغة بنقرة واحدة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، الموضوع، مثل: طلب إجازة، تكليف عمل، رد على شكوى، اجتماع..."
              className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white shadow-2xs"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                مسح
              </button>
            )}
          </div>

          {/* Categories bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Layers className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
              <p className="text-sm font-bold text-slate-600">لا توجد قوالب مطابقة لبحثك</p>
              <p className="text-xs text-slate-400">جرب كتابة كلمات بحث أخرى أو اختر تصنيفاً مختلفاً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredTemplates.map((tpl) => {
                const isCurrent = selectedTemplateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      onSelectTemplate(tpl);
                      onClose();
                    }}
                    className={`group cursor-pointer p-4 rounded-xl border transition-all text-right flex flex-col justify-between hover:shadow-md ${
                      isCurrent
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-amber-100/70 flex items-center justify-center shrink-0 transition-colors">
                            {renderIcon(tpl.iconName)}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
                              {tpl.name}
                            </h4>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {tpl.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {getTypeLabel(tpl.type)}
                          </span>
                          {getToneBadge(tpl.tone)}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                        {tpl.description}
                      </p>

                      {/* Preview fields */}
                      <div className="bg-slate-50/90 rounded-lg p-2.5 border border-slate-200/80 space-y-1.5 mb-3 text-[11px]">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-slate-400 font-semibold">الموضوع:</span>
                          <span className="font-bold text-slate-800 truncate max-w-[240px]">{tpl.subject}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-slate-400 font-semibold">المرسل إليه:</span>
                          <span className="text-slate-700 font-medium truncate max-w-[240px]">{tpl.recipientTitle} / {tpl.recipientName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-700 group-hover:text-amber-800 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>تطبيق القالب وتعبئة النموذج</span>
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-amber-50 group-hover:bg-amber-600 group-hover:text-white text-amber-700 flex items-center justify-center transition-colors">
                        <ArrowRight className="w-4 h-4 rotate-180" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            يمكنك دائماً تعديل أي حقل بعد تطبيق القالب بحرية تامة
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-bold"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
