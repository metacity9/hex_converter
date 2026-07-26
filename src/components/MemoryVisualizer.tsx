import React from 'react';
import type { ParsedBinary } from '../lib/binary/types';
import { HardDrive } from 'lucide-react';

interface MemoryVisualizerProps {
  parsedBinary: ParsedBinary | null;
}

export const MemoryVisualizer: React.FC<MemoryVisualizerProps> = ({ parsedBinary }) => {
  if (!parsedBinary || parsedBinary.segments.length === 0) return null;

  const { minAddress, maxAddress, totalBytes, segments, entryPoint } = parsedBinary;
  const span = Math.max(1, maxAddress - minAddress + 1);

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <HardDrive className="w-4 h-4 text-cyan-400" />
          <span>메모리 맵 구조 시각화 (Memory Map Visualizer)</span>
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          총 {segments.length}개 메모리 블록 / {totalBytes.toLocaleString()} Bytes ({(totalBytes / 1024).toFixed(2)} KB)
        </span>
      </div>

      {/* Info Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block">시작 주소 (Start)</span>
          <span className="text-sm font-bold font-mono text-cyan-400">
            0x{minAddress.toString(16).padStart(8, '0').toUpperCase()}
          </span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block">종료 주소 (End)</span>
          <span className="text-sm font-bold font-mono text-cyan-400">
            0x{maxAddress.toString(16).padStart(8, '0').toUpperCase()}
          </span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block">메모리 스팬 (Span)</span>
          <span className="text-sm font-bold font-mono text-emerald-400">
            {(span / 1024).toFixed(2)} KB
          </span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block">엔트리 포인트 (Vector)</span>
          <span className="text-sm font-bold font-mono text-purple-400">
            {entryPoint !== undefined
              ? `0x${entryPoint.toString(16).padStart(8, '0').toUpperCase()}`
              : 'N/A'}
          </span>
        </div>
      </div>

      {/* Visual Memory Map Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
          <span>0x{minAddress.toString(16).padStart(8, '0').toUpperCase()}</span>
          <span>0x{maxAddress.toString(16).padStart(8, '0').toUpperCase()}</span>
        </div>

        <div className="h-6 w-full bg-slate-950 rounded-lg p-0.5 border border-slate-800 relative flex overflow-hidden">
          {segments.map((seg, idx) => {
            const startRel = ((seg.startAddress - minAddress) / span) * 100;
            const widthRel = Math.max(0.5, (seg.data.length / span) * 100);

            return (
              <div
                key={idx}
                style={{
                  left: `${startRel}%`,
                  width: `${widthRel}%`,
                }}
                className="absolute top-0 bottom-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-sm opacity-90 hover:opacity-100 transition-opacity cursor-pointer group"
                title={`Block ${idx + 1}: 0x${seg.startAddress.toString(16).padStart(8, '0').toUpperCase()} (${seg.data.length} bytes)`}
              />
            );
          })}
        </div>

        <div className="flex items-center space-x-4 text-[11px] text-slate-400 pt-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-cyan-500 to-blue-500" />
            <span>할당된 데이터 블록 (Mapped Data)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-950 border border-slate-800" />
            <span>비어있는 메모리 갭 (Unmapped Gap)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
