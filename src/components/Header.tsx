import React from 'react';
import { Binary, Sparkles, Sliders, HelpCircle } from 'lucide-react';

interface HeaderProps {
  mode: 'simple' | 'advanced';
  onModeToggle: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ mode, onModeToggle, onOpenHelp }) => {
  return (
    <header className="w-full glass-panel border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xl">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
          <Binary className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent tracking-tight">
              OmniHex
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-full">
              v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Universal Binary & Hex Format Converter
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-3">
        {/* Simple vs Advanced Mode Toggle */}
        <div className="bg-slate-900/80 p-1 rounded-xl border border-slate-800 flex items-center">
          <button
            onClick={() => mode !== 'simple' && onModeToggle()}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'simple'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>심플 모드</span>
          </button>

          <button
            onClick={() => mode !== 'advanced' && onModeToggle()}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'advanced'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>고급 모드</span>
          </button>
        </div>

        {/* Help button */}
        <button
          onClick={onOpenHelp}
          className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-cyan-400 border border-slate-700/50 transition-colors"
          title="포맷 설명 및 사용 가이드"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
