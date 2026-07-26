import React from 'react';
import type { BinaryFormat, FormatMeta } from '../lib/binary/types';
import { SUPPORTED_FORMATS } from '../lib/binary/types';
import { ArrowRight, Check, Code2, Cpu, FileDigit, FileText, Layers } from 'lucide-react';

interface FormatSelectorProps {
  selectedFormat: BinaryFormat;
  onSelectFormat: (fmt: BinaryFormat) => void;
  inputFormat?: BinaryFormat;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  selectedFormat,
  onSelectFormat,
  inputFormat,
}) => {
  const getCategoryIcon = (category: FormatMeta['category']) => {
    switch (category) {
      case 'hex':
        return <FileText className="w-4 h-4 text-cyan-400" />;
      case 'srec':
        return <Layers className="w-4 h-4 text-blue-400" />;
      case 'raw':
        return <FileDigit className="w-4 h-4 text-amber-400" />;
      case 'code':
        return <Code2 className="w-4 h-4 text-emerald-400" />;
      case 'hardware':
        return <Cpu className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <span>변환 대상 포맷 선택</span>
        </h3>
        {inputFormat && (
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <span>현재: <strong className="text-cyan-400 uppercase">{inputFormat}</strong></span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span>목표: <strong className="text-emerald-400 uppercase">{selectedFormat}</strong></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {SUPPORTED_FORMATS.map((fmt) => {
          const isSelected = selectedFormat === fmt.id;
          const isSameAsInput = inputFormat === fmt.id;

          return (
            <button
              key={fmt.id}
              onClick={() => onSelectFormat(fmt.id)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between group ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
                      {getCategoryIcon(fmt.category)}
                    </div>
                    <span className="font-bold text-sm text-slate-100 group-hover:text-cyan-300">
                      {fmt.name}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {fmt.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <div className="flex items-center space-x-1">
                  {fmt.extensions.map((ext) => (
                    <span
                      key={ext}
                      className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700/60"
                    >
                      {ext}
                    </span>
                  ))}
                </div>

                {isSameAsInput && (
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-medium">
                    원본 포맷
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
