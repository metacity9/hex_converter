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
        return <FileText className="w-5 h-5 text-cyan-400" />;
      case 'srec':
        return <Layers className="w-5 h-5 text-blue-400" />;
      case 'raw':
        return <FileDigit className="w-5 h-5 text-amber-400" />;
      case 'code':
        return <Code2 className="w-5 h-5 text-emerald-400" />;
      case 'hardware':
        return <Cpu className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
          <span>변환할 목표 파일 포맷 선택</span>
        </h3>
        {inputFormat && (
          <div className="text-xs sm:text-sm text-slate-400 flex items-center space-x-2">
            <span>현재: <strong className="text-cyan-400 uppercase font-mono">{inputFormat}</strong></span>
            <ArrowRight className="w-4 h-4" />
            <span>목표: <strong className="text-emerald-400 uppercase font-mono">{selectedFormat}</strong></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {SUPPORTED_FORMATS.map((fmt) => {
          const isSelected = selectedFormat === fmt.id;
          const isSameAsInput = inputFormat === fmt.id;

          return (
            <button
              key={fmt.id}
              onClick={() => onSelectFormat(fmt.id)}
              className={`p-5 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between group ${
                isSelected
                  ? 'bg-cyan-950/50 border-cyan-500 shadow-xl shadow-cyan-500/15 ring-2 ring-cyan-500'
                  : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-slate-800/90 border border-slate-700">
                      {getCategoryIcon(fmt.category)}
                    </div>
                    <span className="font-bold text-base text-slate-100 group-hover:text-cyan-300">
                      {fmt.name}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 shadow-md">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                  {fmt.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <div className="flex items-center space-x-1.5">
                  {fmt.extensions.map((ext) => (
                    <span
                      key={ext}
                      className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-300 rounded-md border border-slate-700/60"
                    >
                      {ext}
                    </span>
                  ))}
                </div>

                {isSameAsInput && (
                  <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-bold">
                    원본
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
