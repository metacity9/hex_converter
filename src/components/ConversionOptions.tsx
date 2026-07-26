import React from 'react';
import type { ConversionOptions as OptionsType, BinaryFormat } from '../lib/binary/types';
import { Sliders, RefreshCw, Hash, Code, Layers } from 'lucide-react';

interface ConversionOptionsProps {
  options: OptionsType;
  onChange: (options: OptionsType) => void;
  targetFormat: BinaryFormat;
  isAdvancedMode: boolean;
}

export const ConversionOptions: React.FC<ConversionOptionsProps> = ({
  options,
  onChange,
  targetFormat,
  isAdvancedMode,
}) => {
  if (!isAdvancedMode) return null;

  const handleShiftChange = (val: string) => {
    let num = 0;
    if (val.trim().startsWith('0x') || val.trim().startsWith('0X')) {
      num = parseInt(val.trim(), 16);
    } else {
      num = parseInt(val.trim(), 10);
    }
    onChange({ ...options, baseAddressShift: isNaN(num) ? 0 : num });
  };

  const handleTargetBaseAddrChange = (val: string) => {
    if (!val.trim()) {
      onChange({ ...options, targetBaseAddress: undefined });
      return;
    }
    let num = 0;
    if (val.trim().startsWith('0x') || val.trim().startsWith('0X')) {
      num = parseInt(val.trim(), 16);
    } else {
      num = parseInt(val.trim(), 10);
    }
    onChange({ ...options, targetBaseAddress: isNaN(num) ? undefined : num });
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>고급 변환 설정 (Advanced Parameters)</span>
        </h3>
        <button
          onClick={() => onChange({ fillByte: 0xff, baseAddressShift: 0, byteSwap: 'none' })}
          className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center space-x-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>기본값 초기화</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Address Offset Shift */}
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <Hash className="w-3.5 h-3.5 text-cyan-400" />
            <span>시작 주소 오프셋 이동 (Base Address Shift)</span>
          </label>
          <p className="text-[11px] text-slate-400">
            메모리 주소를 +N 또는 -N 만큼 이동 (예: 0x1000 또는 -0x8000000)
          </p>
          <input
            type="text"
            placeholder="예: 0x0000 또는 4096"
            value={
              options.baseAddressShift
                ? `0x${options.baseAddressShift.toString(16).toUpperCase()}`
                : ''
            }
            onChange={(e) => handleShiftChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Gap Fill Byte (Padding) */}
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>빈 메모리 갭 패딩 값 (Gap Fill Byte)</span>
          </label>
          <p className="text-[11px] text-slate-400">
            비어있는 주소 영역을 채울 바이트 값 (기본: 0xFF - Flash Unprogrammed)
          </p>
          <select
            value={options.fillByte ?? 0xff}
            onChange={(e) => onChange({ ...options, fillByte: parseInt(e.target.value, 10) })}
            className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value={255}>0xFF (Flash Erased State - Default)</option>
            <option value={0}>0x00 (Zero Filled)</option>
            <option value={170}>0xAA (Alternating Pattern)</option>
            <option value={85}>0x55 (Alternating Pattern)</option>
          </select>
        </div>

        {/* Endian Byte Swapping */}
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>바이트 순서 변경 (Endian Swap)</span>
          </label>
          <p className="text-[11px] text-slate-400">
            16-bit 또는 32-bit 엔디안 바이트 위치 교환
          </p>
          <select
            value={options.byteSwap || 'none'}
            onChange={(e) => onChange({ ...options, byteSwap: e.target.value as any })}
            className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="none">변환 안함 (Original Endianness)</option>
            <option value="swap16">16-bit Swap (Byte Pair Exchange: AB CD → BA DC)</option>
            <option value="swap32">32-bit Swap (Word Reversal: 12 34 56 78 → 78 56 34 12)</option>
          </select>
        </div>

        {/* Raw Binary Base Address Override */}
        {targetFormat === 'raw_bin' && (
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Raw BIN 대상 시작 주소 지정
            </label>
            <input
              type="text"
              placeholder="예: 0x08000000"
              value={
                options.targetBaseAddress !== undefined
                  ? `0x${options.targetBaseAddress.toString(16).toUpperCase()}`
                  : ''
              }
              onChange={(e) => handleTargetBaseAddrChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        )}

        {/* C Array Name Settings */}
        {targetFormat === 'c_array' && (
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Code className="w-3.5 h-3.5 text-cyan-400" />
              <span>C 배열 변수 이름 (Array Identifier)</span>
            </label>
            <input
              type="text"
              placeholder="firmware_data"
              value={options.cArrayName || ''}
              onChange={(e) => onChange({ ...options, cArrayName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};
