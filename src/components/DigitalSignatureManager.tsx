import React, { useRef, useState, useEffect } from 'react';
import { 
  FileSignature, 
  Upload, 
  PenTool, 
  Trash2, 
  RotateCcw, 
  Move, 
  ZoomIn, 
  Check, 
  X, 
  Sparkles, 
  Stamp,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import { SignatureConfig } from '../types';

interface DigitalSignatureManagerProps {
  isOpen: boolean;
  onClose: () => void;
  config: SignatureConfig;
  onChangeConfig: (newConfig: SignatureConfig) => void;
  signatoryName: string;
}

// Preset Calligraphy SVG Signatures
const PRESET_SIGNATURES = [
  {
    id: 'preset-1',
    name: 'توقيع إداري رسمي (طغراء ديوانية)',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" width="300" height="100"><path d="M20 70 Q 60 10, 110 50 T 180 30 T 250 65 Q 280 20, 260 85 Q 210 95, 140 70 Q 70 50, 30 75 Z" fill="none" stroke="%231e3a8a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M70 45 Q 120 20, 200 40" fill="none" stroke="%231e3a8a" stroke-width="3"/><path d="M130 35 L 140 15 L 155 38" fill="none" stroke="%231e3a8a" stroke-width="3"/></svg>`,
  },
  {
    id: 'preset-2',
    name: 'توقيع ديواني كلاسيكي (حبر أزرق ملكي)',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" width="300" height="100"><path d="M30 65 C 80 15, 120 90, 170 35 C 210 -5, 260 75, 280 45 C 240 85, 100 85, 40 70" fill="none" stroke="%231e40af" stroke-width="3.5" stroke-linecap="round"/><circle cx="210" cy="25" r="3" fill="%231e40af"/><circle cx="225" cy="22" r="3" fill="%231e40af"/></svg>`,
  },
  {
    id: 'preset-3',
    name: 'توقيع عصري تنفيذي (حبر أسود فحمي)',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" width="300" height="100"><path d="M25 55 Q 75 15, 130 55 T 230 45 Q 275 35, 270 70 Q 230 85, 160 70 L 50 80" fill="none" stroke="%230f172a" stroke-width="4" stroke-linecap="round"/><path d="M165 40 L 175 25" fill="none" stroke="%230f172a" stroke-width="3"/></svg>`,
  },
];

export const DigitalSignatureManager: React.FC<DigitalSignatureManagerProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  signatoryName,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'draw' | 'presets'>('upload');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#1e3a8a'); // Royal blue default

  // Canvas drawing handlers
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.strokeStyle = penColor;
      }
    }
  }, [activeTab, penColor]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveDrawnSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onChangeConfig({
      ...config,
      imageUrl: dataUrl,
      isEnabled: true,
    });
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onChangeConfig({
        ...config,
        imageUrl: dataUrl,
        isEnabled: true,
      });
    };
    reader.readAsDataURL(file);
  };

  const resetAdjustments = () => {
    onChangeConfig({
      ...config,
      width: 140,
      positionX: 0,
      positionY: 0,
      rotation: 0,
      opacity: 1,
      alignment: 'left',
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-cairo">
                إدارة وضبط التوقيع الرقمي للمسؤول المعتمد
              </h3>
              <p className="text-xs text-slate-400">
                إضافة صورة التوقيع، التحكم بحجمها وموضعها وزاوية ميلانها على الخطاب
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>رفع صورة توقيع</span>
            </button>

            <button
              onClick={() => setActiveTab('draw')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'draw'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>رسم التوقيع يدوياً</span>
            </button>

            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'presets'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>نماذج جاهزة</span>
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.isEnabled}
              onChange={(e) => onChangeConfig({ ...config, isEnabled: e.target.checked })}
              className="w-4 h-4 rounded accent-amber-600 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800">تفعيل التوقيع بالخطاب</span>
          </label>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Active Signature Preview Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">
                التوقيع المعتمد حالياً باسم: ({signatoryName || 'صاحب الصلاحية'})
              </span>
              <span className="text-[11px] text-slate-500">
                {config.imageUrl ? 'تم إدراج التوقيع الرقمي بنجاح' : 'لم يتم تحديد أو رفع صورة توقيع بعد'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {config.imageUrl ? (
                <div className="w-28 h-12 bg-white border border-slate-300 rounded-lg p-1 flex items-center justify-center overflow-hidden shadow-2xs">
                  <img
                    src={config.imageUrl}
                    alt="التوقيع الرقمي"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-28 h-12 bg-slate-100 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-[10px] text-slate-400">
                  فارغ
                </div>
              )}

              {config.imageUrl && (
                <button
                  onClick={() => onChangeConfig({ ...config, imageUrl: null, isEnabled: false })}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="إلغاء وحذف التوقيع"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tab 1: Upload File */}
          {activeTab === 'upload' && (
            <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-6 text-center transition-all bg-slate-50/50">
              <Upload className="w-8 h-8 mx-auto text-amber-600 mb-2" />
              <p className="text-xs font-bold text-slate-800">
                اختر صورة التوقيع من جهازك (PNG مفرغة، JPG، SVG)
              </p>
              <p className="text-[11px] text-slate-500 mt-1 mb-4">
                يفضل استخدام صورة ذات خلفية شفافة للحصول على مظهر التوقيع الرسمي الأصلي
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>استعراض ملف التوقيع</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Tab 2: Interactive Draw Pad */}
          {activeTab === 'draw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  ارسم توقيعك بالفأرة أو شاشة اللمس:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">لون الحبر:</span>
                  <button
                    type="button"
                    onClick={() => setPenColor('#1e3a8a')}
                    className={`w-5 h-5 rounded-full bg-blue-900 border-2 ${
                      penColor === '#1e3a8a' ? 'border-amber-400 scale-110' : 'border-white'
                    }`}
                    title="حبر أزرق ملكي"
                  />
                  <button
                    type="button"
                    onClick={() => setPenColor('#0f172a')}
                    className={`w-5 h-5 rounded-full bg-slate-900 border-2 ${
                      penColor === '#0f172a' ? 'border-amber-400 scale-110' : 'border-white'
                    }`}
                    title="حبر أسود رسمي"
                  />
                  <button
                    type="button"
                    onClick={() => setPenColor('#047857')}
                    className={`w-5 h-5 rounded-full bg-emerald-700 border-2 ${
                      penColor === '#047857' ? 'border-amber-400 scale-110' : 'border-white'
                    }`}
                    title="حبر أخضر ديواني"
                  />
                </div>
              </div>

              <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-36 cursor-crosshair touch-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-rose-600 font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>مسح اللوحة</span>
                </button>

                <button
                  type="button"
                  onClick={saveDrawnSignature}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>اعتماد هذا التوقيع المرسوم</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                اختر من النماذج الخطية المعتمدة للمراسلات الحكومية:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PRESET_SIGNATURES.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onChangeConfig({
                        ...config,
                        imageUrl: preset.svg,
                        isEnabled: true,
                      });
                    }}
                    className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                      config.imageUrl === preset.svg
                        ? 'border-purple-600 ring-2 ring-purple-600/30 bg-purple-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="h-16 flex items-center justify-center p-1 bg-slate-50/60 rounded-lg mb-2">
                      <img src={preset.svg} alt={preset.name} className="max-h-full max-w-full" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fine-Tuning Size, Position, and Rotation Controls */}
          {config.imageUrl && (
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  التحكم الدقيق في الحجم والموضع وزاوية الميلان:
                </span>
                <button
                  type="button"
                  onClick={resetAdjustments}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                >
                  إعادة ضبط القيم الافتراضية
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                {/* Size Slider */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-700">عرض وحجم التوقيع:</span>
                    <span className="font-mono text-amber-800 font-bold">{config.width}px</span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={260}
                    step={5}
                    value={config.width}
                    onChange={(e) => onChangeConfig({ ...config, width: Number(e.target.value) })}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>

                {/* Rotation Slider */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-700">زاوية الميلان الطبيعية:</span>
                    <span className="font-mono text-amber-800 font-bold">{config.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min={-20}
                    max={20}
                    step={1}
                    value={config.rotation}
                    onChange={(e) => onChangeConfig({ ...config, rotation: Number(e.target.value) })}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>

                {/* Horizontal X Offset */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-700">الإزاحة الأفقية (يمين / يسار):</span>
                    <span className="font-mono text-amber-800 font-bold">{config.positionX}px</span>
                  </div>
                  <input
                    type="range"
                    min={-120}
                    max={120}
                    step={2}
                    value={config.positionX}
                    onChange={(e) => onChangeConfig({ ...config, positionX: Number(e.target.value) })}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>

                {/* Vertical Y Offset */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-700">الإزاحة الرأسية (أعلى / أسفل):</span>
                    <span className="font-mono text-amber-800 font-bold">{config.positionY}px</span>
                  </div>
                  <input
                    type="range"
                    min={-60}
                    max={60}
                    step={2}
                    value={config.positionY}
                    onChange={(e) => onChangeConfig({ ...config, positionY: Number(e.target.value) })}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>

                {/* Opacity Slider */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-700">شفافية وتطابق الحبر:</span>
                    <span className="font-mono text-amber-800 font-bold">{Math.round(config.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={1.0}
                    step={0.05}
                    value={config.opacity}
                    onChange={(e) => onChangeConfig({ ...config, opacity: Number(e.target.value) })}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>

                {/* Alignment Selection */}
                <div>
                  <span className="block font-semibold text-slate-700 mb-1.5">جهة موضع التوقيع:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onChangeConfig({ ...config, alignment: 'left' })}
                      className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 ${
                        config.alignment === 'left'
                          ? 'bg-amber-600 text-white border-amber-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                      <span>يسار (الرسمي)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeConfig({ ...config, alignment: 'center' })}
                      className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 ${
                        config.alignment === 'center'
                          ? 'bg-amber-600 text-white border-amber-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                      <span>وسط</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeConfig({ ...config, alignment: 'right' })}
                      className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 ${
                        config.alignment === 'right'
                          ? 'bg-amber-600 text-white border-amber-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                      <span>يمين</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Official Stamp Toggle */}
              <div className="flex items-center justify-between p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <Stamp className="w-4 h-4 text-blue-700" />
                  <div>
                    <span className="text-xs font-bold text-blue-950 block">الختم الإداري الأزرق المعتمد</span>
                    <span className="text-[10px] text-blue-800">إظهار ختم الإدارة الدائري المائل بجوار التوقيع</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.showOfficialStamp}
                  onChange={(e) => onChangeConfig({ ...config, showOfficialStamp: e.target.checked })}
                  className="w-4 h-4 rounded accent-blue-700 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            يمكنك أيضاً سحب وتعديل موضع التوقيع مباشرة داخل معاينة الخطاب A4.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
          >
            تطبيق وحفظ
          </button>
        </div>
      </div>
    </div>
  );
};
