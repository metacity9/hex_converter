import React, { useState, useRef } from 'react';
import { UploadCloud, FileCode, CheckCircle2, AlertTriangle, X, Play } from 'lucide-react';
import type { FileDataInput, ParsedBinary, BinaryFormat } from '../lib/binary/types';
import { SUPPORTED_FORMATS } from '../lib/binary/types';
import { getPresetSamples } from '../lib/binary/samples';
import type { PresetSample } from '../lib/binary/samples';

interface DropZoneProps {
  currentFile: FileDataInput | null;
  parsedBinary: ParsedBinary | null;
  detectedFormat: BinaryFormat | null;
  overrideFormat: BinaryFormat | null;
  onFileLoaded: (file: FileDataInput) => void;
  onOverrideFormatChange: (fmt: BinaryFormat | null) => void;
  onClearFile: () => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
  currentFile,
  parsedBinary,
  detectedFormat,
  overrideFormat,
  onFileLoaded,
  onOverrideFormatChange,
  onClearFile,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const samples = getPresetSamples();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result instanceof ArrayBuffer) {
        const content = new Uint8Array(result);
        let text: string | undefined;
        try {
          text = new TextDecoder('utf-8', { fatal: true }).decode(content);
        } catch {
          text = undefined;
        }

        onFileLoaded({
          name: file.name,
          content,
          text,
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const formatMeta = detectedFormat
    ? SUPPORTED_FORMATS.find(f => f.id === detectedFormat)
    : null;

  const activeFormatMeta = (overrideFormat || detectedFormat)
    ? SUPPORTED_FORMATS.find(f => f.id === (overrideFormat || detectedFormat))
    : null;

  return (
    <div className="w-full space-y-4">
      {/* Drag & Drop Area */}
      {!currentFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-10 lg:p-14 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01] shadow-2xl shadow-cyan-500/20'
              : 'border-slate-700/80 hover:border-cyan-500/60 bg-slate-900/50 hover:bg-slate-900/80'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center text-cyan-400 shadow-xl group-hover:scale-110 transition-transform">
            <UploadCloud className="w-10 h-10" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mb-2">
            변환할 파일 선택 또는 드래그 앤 드롭
          </h3>
          <p className="text-sm text-slate-400 mb-8 max-w-lg mx-auto">
            Intel HEX, Motorola S-Record, Raw BIN, C-Array, TI-TXT, Verilog VMEM 등 지원
          </p>

          <button className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all">
            내 컴퓨터에서 파일 열기
          </button>
        </div>
      ) : (
        /* Loaded File Card - Ultra Clean */
        <div className="glass-panel rounded-3xl p-6 border border-cyan-500/40 shadow-xl relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <FileCode className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                  <h4 className="text-lg font-extrabold text-slate-100">
                    {currentFile.name}
                  </h4>
                  {activeFormatMeta && (
                    <span className="px-3 py-1 text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{activeFormatMeta.name}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-xs sm:text-sm text-slate-400 mt-1 font-mono">
                  <span>{(currentFile.content.length / 1024).toFixed(2)} KB ({currentFile.content.length.toLocaleString()} Bytes)</span>
                  {parsedBinary && (
                    <span>
                      주소: 0x{parsedBinary.minAddress.toString(16).padStart(8, '0').toUpperCase()} ~ 0x{parsedBinary.maxAddress.toString(16).padStart(8, '0').toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClearFile}
              className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-colors"
              title="파일 삭제 및 새로 선택"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Format auto-detect override control */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">감지 포맷:</span>
              <span className="text-slate-100 font-bold">{formatMeta?.name || 'Raw Binary'}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">포맷 변경:</span>
              <select
                value={overrideFormat || ''}
                onChange={(e) => onOverrideFormatChange(e.target.value ? (e.target.value as BinaryFormat) : null)}
                className="bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-semibold"
              >
                <option value="">자동 감지 ({formatMeta?.name || 'Auto'})</option>
                {SUPPORTED_FORMATS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Warnings list if any */}
          {parsedBinary?.warnings && parsedBinary.warnings.length > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs sm:text-sm text-amber-300 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>파일 파싱 경고 ({parsedBinary.warnings.length}건)</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                {parsedBinary.warnings.slice(0, 3).map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Quick Test Presets (For users without immediate files) */}
      {!currentFile && (
        <div className="glass-card rounded-3xl p-5 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <Play className="w-4 h-4 text-cyan-400" />
              <span>클릭 한번으로 시작하는 예제 테스트 파일</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {samples.map((sample: PresetSample) => (
              <button
                key={sample.id}
                onClick={() => onFileLoaded(sample.fileInput)}
                className="p-4 rounded-2xl bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group"
              >
                <div className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 flex items-center justify-between">
                  <span>{sample.title}</span>
                  <span className="text-xs uppercase font-mono px-2 py-0.5 bg-slate-800 text-slate-400 rounded-lg">
                    {sample.format}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-1">
                  {sample.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
