import { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { FormatSelector } from './components/FormatSelector';
import { ConversionOptions } from './components/ConversionOptions';
import { MemoryVisualizer } from './components/MemoryVisualizer';
import { HexViewer } from './components/HexViewer';
import { FormatGuideSection } from './components/FormatGuideSection';
import { InfoModal } from './components/InfoModal';
import type { FileDataInput, BinaryFormat, ConversionOptions as OptionsType, ParsedBinary } from './lib/binary/types';
import type { ConvertResult } from './lib/binary/converter';
import { parseFile, convertBinary } from './lib/binary/converter';
import { detectFormat } from './lib/binary/detector';
import { Download, Copy, Check, ChevronDown, Sliders, HardDrive, Eye } from 'lucide-react';

export function App() {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  const [currentFile, setCurrentFile] = useState<FileDataInput | null>(null);
  const [overrideInputFormat, setOverrideInputFormat] = useState<BinaryFormat | null>(null);
  const [targetFormat, setTargetFormat] = useState<BinaryFormat>('intel_hex');
  const [options, setOptions] = useState<OptionsType>({
    fillByte: 0xff,
    baseAddressShift: 0,
    byteSwap: 'none',
    bytesPerLine: 16,
    prefix0x: false,
    hexGroupSize: 1,
    delimiter: 'space',
    hexCase: 'upper',
    cType: 'uint8_t',
  });
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);
  const [activeTab, setActiveTab] = useState<'options' | 'memory' | 'viewer' | null>(null);

  // Auto-detect input format
  const detectedFormat = useMemo(() => {
    if (!currentFile) return null;
    return detectFormat(currentFile);
  }, [currentFile]);

  const activeInputFormat = overrideInputFormat || detectedFormat || 'raw_bin';

  // Parse input binary structure
  const parsedBinary: ParsedBinary | null = useMemo(() => {
    if (!currentFile) return null;
    try {
      return parseFile(currentFile, activeInputFormat, options.targetBaseAddress || 0);
    } catch (e) {
      console.error('Failed to parse file:', e);
      return null;
    }
  }, [currentFile, activeInputFormat, options.targetBaseAddress]);

  // Real-time conversion preview result
  const conversionResult: ConvertResult | null = useMemo(() => {
    if (!currentFile || !parsedBinary) return null;
    try {
      return convertBinary(currentFile, targetFormat, options, activeInputFormat);
    } catch (e) {
      console.error('Conversion failed:', e);
      return null;
    }
  }, [currentFile, targetFormat, options, activeInputFormat, parsedBinary]);

  // Handle file download
  const handleDownload = () => {
    if (!conversionResult) return;

    const url = URL.createObjectURL(conversionResult.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = conversionResult.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Celebratory confetti effect
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#06b6d4', '#3b82f6', '#10b981', '#a855f7'],
    });
  };

  // Handle copy text result
  const handleCopyText = () => {
    if (!conversionResult?.textContent) return;
    navigator.clipboard.writeText(conversionResult.textContent);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Header Navigation */}
      <Header
        mode={mode}
        onModeToggle={() => setMode(m => (m === 'simple' ? 'advanced' : 'simple'))}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Banner / Headline */}
        <div className="text-center space-y-2 py-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-slate-100 via-slate-200 to-cyan-300 bg-clip-text text-transparent">
            OmniHex 바이너리 파일 변환기
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            100% 로컬 브라우저에서 안전하게 파일 포맷을 변환하세요.
          </p>
        </div>

        {/* 1. Drag & Drop Zone */}
        <DropZone
          currentFile={currentFile}
          parsedBinary={parsedBinary}
          detectedFormat={detectedFormat}
          overrideFormat={overrideInputFormat}
          onFileLoaded={(file) => {
            setCurrentFile(file);
            setOverrideInputFormat(null);
          }}
          onOverrideFormatChange={setOverrideInputFormat}
          onClearFile={() => {
            setCurrentFile(null);
            setOverrideInputFormat(null);
            setActiveTab(null);
          }}
        />

        {/* 2. Target Format Selection & Main Action Bar */}
        {currentFile && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Target Format Selector */}
            <FormatSelector
              selectedFormat={targetFormat}
              onSelectFormat={setTargetFormat}
              inputFormat={activeInputFormat}
            />

            {/* Simple Primary Result & Download Bar */}
            {conversionResult && (
              <div className="glass-panel rounded-2xl p-5 border border-cyan-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 glow-cyan">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center space-x-2 justify-center sm:justify-start">
                    <span className="text-xs font-semibold text-slate-400">변환할 파일:</span>
                    <span className="text-sm font-extrabold text-cyan-400 font-mono">
                      {conversionResult.fileName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {conversionResult.binaryBuffer
                      ? `용량: ${(conversionResult.binaryBuffer.length / 1024).toFixed(2)} KB`
                      : `출력: ${(conversionResult.textContent?.split('\n').length || 0).toLocaleString()} 줄`}
                  </p>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  {conversionResult.textContent && (
                    <button
                      onClick={handleCopyText}
                      className="flex-1 sm:flex-initial px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
                    >
                      {copiedResult ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                      <span>{copiedResult ? '복사 완료' : '텍스트 복사'}</span>
                    </button>
                  )}

                  <button
                    onClick={handleDownload}
                    className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-105 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>변환 파일 즉시 다운로드</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. Secondary Detailed Tools (Collapsible / Lower Section) */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  상세 분석 & 세부 설정 (선택사항)
                </span>
                <span className="text-[11px] text-slate-500">
                  필요에 따라 세부 포맷 구성이나 메모리를 검사하세요.
                </span>
              </div>

              {/* Sub-tab Toggle Bar */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveTab(activeTab === 'options' ? null : 'options')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    activeTab === 'options'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>세부 포맷 설정</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeTab === 'options' ? 'rotate-180' : ''}`} />
                </button>

                <button
                  onClick={() => setActiveTab(activeTab === 'memory' ? null : 'memory')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    activeTab === 'memory'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>메모리 맵 구조</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeTab === 'memory' ? 'rotate-180' : ''}`} />
                </button>

                <button
                  onClick={() => setActiveTab(activeTab === 'viewer' ? null : 'viewer')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    activeTab === 'viewer'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Hex & ASCII 뷰어</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeTab === 'viewer' ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Active Tab Panel */}
              {activeTab === 'options' && (
                <div className="animate-in fade-in duration-200">
                  <ConversionOptions
                    options={options}
                    onChange={setOptions}
                    targetFormat={targetFormat}
                    isAdvancedMode={mode === 'advanced'}
                  />
                </div>
              )}

              {activeTab === 'memory' && (
                <div className="animate-in fade-in duration-200">
                  <MemoryVisualizer parsedBinary={parsedBinary} />
                </div>
              )}

              {activeTab === 'viewer' && (
                <div className="animate-in fade-in duration-200">
                  <HexViewer parsedBinary={parsedBinary} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Bottom Scroll Section: Dedicated File Format Guide */}
        <FormatGuideSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 glass-panel mt-auto">
        <p>OmniHex Binary Converter — 100% Client-side Offline Security & Speed</p>
      </footer>

      {/* Help Modal */}
      <InfoModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
