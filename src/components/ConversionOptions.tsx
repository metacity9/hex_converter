import React from 'react';
import type { ConversionOptions as OptionsType, BinaryFormat } from '../lib/binary/types';
import { Sliders, RefreshCw, Hash, Code, Layers, AlignLeft, Type } from 'lucide-react';

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

  const isTextFormat = targetFormat !== 'raw_bin';

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border border-slate-800 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>{isAdvancedMode ? '고급 메모리 & 포맷 출력 상세 설정' : '출력 포맷 구성 상세 설정'}</span>
        </h3>
        <button
          onClick={() =>
            onChange({
              fillByte: 0xff,
              baseAddressShift: 0,
              byteSwap: 'none',
              bytesPerLine: 16,
              prefix0x: false,
              hexGroupSize: 1,
              delimiter: 'space',
              hexCase: 'upper',
              cType: 'uint8_t',
            })
          }
          className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center space-x-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>기본 설정으로 리셋</span>
        </button>
      </div>

      {/* Output Format Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Bytes Per Line Selection */}
        {isTextFormat && (
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>한 줄당 출력 바이트 수 (Bytes Per Line)</span>
            </label>
            <p className="text-[11px] text-slate-400">
              한 행에 출력할 데이터 바이트 수 (1, 4, 8, 16, 32, 64 바이트)
            </p>
            <select
              value={options.bytesPerLine ?? 16}
              onChange={(e) => onChange({ ...options, bytesPerLine: parseInt(e.target.value, 10) })}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value={1}>1 Byte / Line (줄당 1바이트)</option>
              <option value={4}>4 Bytes / Line (줄당 4바이트)</option>
              <option value={8}>8 Bytes / Line (줄당 8바이트)</option>
              <option value={12}>12 Bytes / Line (줄당 12바이트)</option>
              <option value={16}>16 Bytes / Line (줄당 16바이트 - Default)</option>
              <option value={32}>32 Bytes / Line (줄당 32바이트)</option>
              <option value={64}>64 Bytes / Line (줄당 64바이트)</option>
            </select>
          </div>
        )}

        {/* Hex String / Text Format Options */}
        {targetFormat === 'hex_string' && (
          <>
            {/* 0x Prefix Toggle */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Code className="w-3.5 h-3.5 text-emerald-400" />
                <span>0x 접두사 (Hex Prefix 0x)</span>
              </label>
              <p className="text-[11px] text-slate-400">
                16진수 값 앞에 `0x` 접두사 추가 여부
              </p>
              <select
                value={options.prefix0x ? 'true' : 'false'}
                onChange={(e) => onChange({ ...options, prefix0x: e.target.value === 'true' })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="false">접두사 없음 (예: 12 34 AB CD)</option>
                <option value="true">0x 접두사 포함 (예: 0x12 0x34 0xAB 0xCD)</option>
              </select>
            </div>

            {/* Byte Grouping Size */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Hash className="w-3.5 h-3.5 text-purple-400" />
                <span>바이트 그룹화 단위 (Byte Grouping)</span>
              </label>
              <p className="text-[11px] text-slate-400">
                1바이트, 2바이트(16-bit), 4바이트(32-bit) 묶음 출력
              </p>
              <select
                value={options.hexGroupSize ?? 1}
                onChange={(e) => onChange({ ...options, hexGroupSize: parseInt(e.target.value, 10) as any })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value={1}>1 바이트 단위 (0x12 0x34 0x56 0x78)</option>
                <option value={2}>2 바이트 워드 (0x1234 0x5678)</option>
                <option value={4}>4 바이트 더블워드 (0x12345678)</option>
              </select>
            </div>

            {/* Token Delimiter */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Type className="w-3.5 h-3.5 text-amber-400" />
                <span>구분자 기호 (Delimiter)</span>
              </label>
              <p className="text-[11px] text-slate-400">
                바이트 또는 토큰 사이의 분리 기호
              </p>
              <select
                value={options.delimiter || 'space'}
                onChange={(e) => onChange({ ...options, delimiter: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
              >
                <option value="space">공백 (Space: "0x12 0x34")</option>
                <option value="comma_space">쉼표+공백 (Comma Space: "0x12, 0x34")</option>
                <option value="comma">쉼표 (Comma: "0x12,0x34")</option>
                <option value="none">붙여쓰기 (None: "1234ABCD")</option>
                <option value="newline">줄바꿈 (Newline)</option>
              </select>
            </div>
          </>
        )}

        {/* C Array Format Controls */}
        {targetFormat === 'c_array' && (
          <>
            {/* C Data Type */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Code className="w-3.5 h-3.5 text-emerald-400" />
                <span>C 배열 데이터 타입 (Data Type)</span>
              </label>
              <p className="text-[11px] text-slate-400">
                uint8_t (1byte), uint16_t (2byte), uint32_t (4byte)
              </p>
              <select
                value={options.cType || 'uint8_t'}
                onChange={(e) => onChange({ ...options, cType: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="uint8_t">uint8_t (8-bit Byte Array)</option>
                <option value="uint16_t">uint16_t (16-bit Short Array)</option>
                <option value="uint32_t">uint32_t (32-bit Word Array)</option>
              </select>
            </div>

            {/* C Array Identifier */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>C 배열 변수 이름 (Array Name)</span>
              </label>
              <input
                type="text"
                placeholder="firmware_data"
                value={options.cArrayName || ''}
                onChange={(e) => onChange({ ...options, cArrayName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </>
        )}

        {/* Verilog Word Grouping */}
        {targetFormat === 'verilog_vmem' && (
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Hash className="w-3.5 h-3.5 text-purple-400" />
              <span>Verilog 워드 비트 폭 (Word Size)</span>
            </label>
            <p className="text-[11px] text-slate-400">
              8-bit (Byte), 16-bit, 32-bit (Word)
            </p>
            <select
              value={options.hexGroupSize ?? 1}
              onChange={(e) => onChange({ ...options, hexGroupSize: parseInt(e.target.value, 10) as any })}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value={1}>8-bit Byte Hex (예: AB CD 12 34)</option>
              <option value={2}>16-bit Word Hex (예: ABCD 1234)</option>
              <option value={4}>32-bit Word Hex (예: ABCD1234)</option>
            </select>
          </div>
        )}

        {/* Upper vs Lower Case Hex */}
        {isTextFormat && (
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Type className="w-3.5 h-3.5 text-cyan-400" />
              <span>16진수 대소문자 표기 (Hex Case)</span>
            </label>
            <p className="text-[11px] text-slate-400">
              대문자 (0x12AB) 또는 소문자 (0x12ab)
            </p>
            <select
              value={options.hexCase || 'upper'}
              onChange={(e) => onChange({ ...options, hexCase: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="upper">대문자 (Uppercase: 0x12AB - Default)</option>
              <option value="lower">소문자 (Lowercase: 0x12ab)</option>
            </select>
          </div>
        )}

        {/* Advanced Memory Transformations (Always available in Advanced Mode) */}
        {isAdvancedMode && (
          <>
            {/* Address Offset Shift */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                <span>시작 주소 오프셋 이동 (Base Address Shift)</span>
              </label>
              <p className="text-[11px] text-slate-400">
                메모리 주소를 +N 또는 -N 만큼 이동 (예: 0x1000)
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

            {/* Gap Fill Byte */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>빈 메모리 갭 패딩 값 (Gap Fill Byte)</span>
              </label>
              <p className="text-[11px] text-slate-400">
                비어있는 주소 영역을 채울 바이트 값 (기본: 0xFF)
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
          </>
        )}
      </div>
    </div>
  );
};
