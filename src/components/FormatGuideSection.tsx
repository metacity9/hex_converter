import React from 'react';
import { SUPPORTED_FORMATS } from '../lib/binary/types';
import { BookOpen, FileText, Layers, FileDigit, Code2, Cpu } from 'lucide-react';

export const FormatGuideSection: React.FC = () => {
  const getFormatIcon = (category: string) => {
    switch (category) {
      case 'hex':
        return <FileText className="w-7 h-7 text-cyan-400" />;
      case 'srec':
        return <Layers className="w-7 h-7 text-blue-400" />;
      case 'raw':
        return <FileDigit className="w-7 h-7 text-amber-400" />;
      case 'code':
        return <Code2 className="w-7 h-7 text-emerald-400" />;
      case 'hardware':
        return <Cpu className="w-7 h-7 text-purple-400" />;
      default:
        return <FileText className="w-7 h-7 text-cyan-400" />;
    }
  };

  return (
    <section className="w-full pt-16 pb-16 border-t border-slate-800/80 mt-16 space-y-10">
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs sm:text-sm font-bold">
          <BookOpen className="w-4 h-4" />
          <span>포맷 백과사전 & 상세 가이드</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          지원하는 바이너리 파일 포맷 특징
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          마이크로컨트롤러, 임베디드 시스템, FPGA에서 자주 사용되는 주요 이진 파일 규격입니다.
        </p>
      </div>

      {/* Format Explanation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {SUPPORTED_FORMATS.map((fmt) => (
          <div
            key={fmt.id}
            className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3.5 group shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 group-hover:border-cyan-500/30 transition-colors">
                  {getFormatIcon(fmt.category)}
                </div>
                <div>
                  <h4 className="font-extrabold text-base sm:text-lg text-slate-100 group-hover:text-cyan-300">
                    {fmt.name}
                  </h4>
                  <div className="flex items-center space-x-1.5 mt-1">
                    {fmt.extensions.map((ext) => (
                      <span
                        key={ext}
                        className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-300 rounded-md border border-slate-700"
                      >
                        {ext}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-1">
              {fmt.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
