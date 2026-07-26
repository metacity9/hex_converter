import React, { useState } from 'react';
import type { ParsedBinary } from '../lib/binary/types';
import { MemoryBuffer } from '../lib/binary/MemoryBuffer';
import { Eye, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';

interface HexViewerProps {
  parsedBinary: ParsedBinary | null;
}

export const HexViewer: React.FC<HexViewerProps> = ({ parsedBinary }) => {
  const [page, setPage] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!parsedBinary || parsedBinary.segments.length === 0) return null;

  const memoryBuffer = new MemoryBuffer(parsedBinary.segments);
  const { buffer, baseAddress } = memoryBuffer.toContiguousBuffer();

  const pageSize = 256; // 16 lines * 16 bytes = 256 bytes per page
  const totalPages = Math.max(1, Math.ceil(buffer.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);

  const startByteIdx = currentPage * pageSize;
  const pageBuffer = buffer.subarray(startByteIdx, Math.min(buffer.length, startByteIdx + pageSize));

  // Break pageBuffer into 16-byte rows
  const rows: { address: number; bytes: number[] }[] = [];
  for (let i = 0; i < pageBuffer.length; i += 16) {
    const rowBytes = Array.from(pageBuffer.subarray(i, i + 16));
    rows.push({
      address: baseAddress + startByteIdx + i,
      bytes: rowBytes,
    });
  }

  const handleCopyPage = () => {
    const lines = rows.map(row => {
      const addrStr = `0x${row.address.toString(16).padStart(8, '0').toUpperCase()}`;
      const hexStr = row.bytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
      const asciiStr = row.bytes.map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('');
      return `${addrStr}: ${hexStr.padEnd(48, ' ')} | ${asciiStr}`;
    });
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span>실시간 Hex & ASCII 뷰어 (Hex Inspector)</span>
        </h3>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={handleCopyPage}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '복사됨' : '현재 페이지 복사'}</span>
          </button>

          {/* Pagination Controls */}
          <div className="flex items-center space-x-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
            <button
              disabled={currentPage === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="p-0.5 text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:hover:text-slate-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] text-slate-300 font-mono px-2">
              {currentPage + 1} / {totalPages} 페이지
            </span>
            <button
              disabled={currentPage >= totalPages - 1}
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              className="p-0.5 text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:hover:text-slate-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hex Grid Table */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs overflow-x-auto">
        <div className="grid grid-cols-[100px_1fr_160px] gap-4 font-bold text-slate-500 pb-2 border-b border-slate-800 text-[11px]">
          <div>OFFSET</div>
          <div className="grid grid-cols-16 gap-1 text-center">
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i}>{i.toString(16).toUpperCase()}</span>
            ))}
          </div>
          <div className="text-right">ASCII</div>
        </div>

        <div className="divide-y divide-slate-900/60 pt-2 space-y-1">
          {rows.map((row, rIdx) => (
            <div
              key={rIdx}
              className="grid grid-cols-[100px_1fr_160px] gap-4 py-0.5 items-center hover:bg-cyan-500/5 px-1 rounded transition-colors group"
            >
              <span className="text-cyan-400 font-semibold">
                0x{row.address.toString(16).padStart(8, '0').toUpperCase()}
              </span>

              <div className="grid grid-cols-16 gap-1 text-center">
                {row.bytes.map((b, bIdx) => (
                  <span
                    key={bIdx}
                    className={`rounded ${
                      b === 0x00
                        ? 'text-slate-600'
                        : b === 0xff
                        ? 'text-slate-500'
                        : 'text-slate-200 group-hover:text-cyan-300'
                    }`}
                  >
                    {b.toString(16).padStart(2, '0').toUpperCase()}
                  </span>
                ))}
                {Array.from({ length: 16 - row.bytes.length }).map((_, i) => (
                  <span key={i} className="text-slate-800">..</span>
                ))}
              </div>

              <div className="text-right text-slate-400 tracking-widest font-mono text-[11px]">
                {row.bytes.map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
