import React, { useState } from 'react';
import { 
  Archive, 
  Search, 
  Trash2, 
  FileText, 
  Calendar, 
  ExternalLink, 
  X, 
  Printer, 
  Copy, 
  Check,
  CheckCircle2
} from 'lucide-react';
import { CorrespondenceRecord, CorrespondenceType } from '../types';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: CorrespondenceRecord[];
  onLoadRecord: (record: CorrespondenceRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  onClose,
  records,
  onLoadRecord,
  onDeleteRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<CorrespondenceRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredRecords = records.filter(
    (r) =>
      r.subject.includes(searchQuery) ||
      r.refNumber.includes(searchQuery) ||
      r.recipientName.includes(searchQuery) ||
      r.organization.includes(searchQuery)
  );

  const handleCopyText = async (record: CorrespondenceRecord) => {
    try {
      await navigator.clipboard.writeText(record.content);
      setCopiedId(record.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const typeLabels: Record<CorrespondenceType, string> = {
    letter: 'خطاب رسمي',
    memo: 'مذكرة داخلية',
    circular: 'تعميم إداري',
    decision: 'قرار إداري',
    minutes: 'محضر اجتماع',
    report: 'تقرير إداري',
    reply: 'رد رسمي',
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-cairo">
                أرشيف المراسلات والمعاملات الإدارية ({records.length})
              </h3>
              <p className="text-xs text-slate-400">
                سجل المراسلات الصادرة والواردة والقرارات المعتمدة
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث برقم القيد، الموضوع، أو الجهة المرسل إليها..."
              className="w-full pr-9 pl-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Archive className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold">لا توجد مكاتبات محفوظة في الأرشيف حالياً</p>
              <p className="text-xs mt-1">عند صياغة أي معاملة، اضغط على زر "أرشفة" لحفظها والرجوع إليها دائماً.</p>
            </div>
          ) : (
            filteredRecords.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 bg-white shadow-2xs transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {rec.refNumber}
                      </span>
                      <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {typeLabels[rec.type] || rec.type}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {rec.dateHijri}هـ ({rec.dateGregorian}م)
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 pt-0.5">{rec.subject}</h4>
                    <p className="text-xs text-slate-600">
                      إلى: <strong className="text-slate-800">{rec.recipientTitle} / {rec.recipientName}</strong> • {rec.organization}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyText(rec)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-1"
                      title="نسخ النص"
                    >
                      {copiedId === rec.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => {
                        onLoadRecord(rec);
                        onClose();
                      }}
                      className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-2xs transition-all flex items-center gap-1"
                      title="فتح المعاملة في المحرر"
                    >
                      <span>فتح في المحرر</span>
                    </button>

                    <button
                      onClick={() => onDeleteRecord(rec.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="حذف من الأرشيف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Excerpt */}
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {rec.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
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
