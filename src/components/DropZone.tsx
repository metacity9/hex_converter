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
          className={`relative border-2 border-dashed rounded-2xl p-8 lg:p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01] shadow-2xl shadow-cyan-500/20'
              : 'border-slate-700/80 hover:border-cyan-500/60 bg-slate-900/40 hover:bg-slate-900/70'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-lg group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-semibold text-slate-100 mb-1">
            변환할 바이너리/HEX 파일을 드래그 앤 드롭하세요
          </h3>
          <p className="text-xs text-slate-400 mb-6 max-w-md mx-auto">
            Intel HEX (`.hex`), Motorola S-Record (`.s19`), Raw Binary (`.bin`), C-Array (`.c`), TI-TXT, Verilog VMEM 지원
          </p>

          <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/25 transition-all">
            내 컴퓨터에서 파일 선택
          </button>
        </div>
      ) : (
        /* Loaded File Card */
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <h4 className="text-base font-bold text-slate-100">
                    {currentFile.name}
                  </h4>
                  {activeFormatMeta && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                      <span>{activeFormatMeta.name}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
                  <span>크기: {(currentFile.content.length / 1024).toFixed(2)} KB ({currentFile.content.length.toLocaleString()} Bytes)</span>
                  {parsedBinary && (
                    <span>
                      주소 범위: 0x{parsedBinary.minAddress.toString(16).padStart(8, '0').toUpperCase()} ~ 0x{parsedBinary.maxAddress.toString(16).padStart(8, '0').toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClearFile}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              title="파일 삭제"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Format auto-detect override control */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">자동 감지된 포맷:</span>
              <span className="text-slate-200 font-semibold">{formatMeta?.name || 'Raw Binary'}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">입력 포맷 수동지정:</span>
              <select
                value={overrideFormat || ''}
                onChange={(e) => onOverrideFormatChange(e.target.value ? (e.target.value as BinaryFormat) : null)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500"
              >
                <option value="">자동 감지 사용 ({formatMeta?.name || 'Auto'})</option>
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
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 space-y-1">
              <div className="flex items-center space-x-1.5 font-semibold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>파싱 파서 경고 ({parsedBinary.warnings.length}건)</span>
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
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              <span>즉시 테스트 가능한 예제 파일 (1-Click)</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {samples.map((sample: PresetSample) => (
              <button
                key={sample.id}
                onClick={() => onFileLoaded(sample.fileInput)}
                className="p-3 rounded-xl bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 flex items-center justify-between">
                  <span>{sample.title}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                    {sample.format}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
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
