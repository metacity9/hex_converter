export type BinaryFormat =
  | 'intel_hex'
  | 'srec'
  | 'raw_bin'
  | 'hex_string'
  | 'c_array'
  | 'ti_txt'
  | 'verilog_vmem';

export interface FormatMeta {
  id: BinaryFormat;
  name: string;
  extensions: string[];
  description: string;
  isText: boolean;
  category: 'hex' | 'srec' | 'raw' | 'code' | 'hardware';
}

export const SUPPORTED_FORMATS: FormatMeta[] = [
  {
    id: 'intel_hex',
    name: 'Intel HEX',
    extensions: ['.hex', '.ihex', '.mcs'],
    description: 'Standard 8-bit, 16-bit, 32-bit Intel Hexadecimal object file format with checksums and addresses',
    isText: true,
    category: 'hex',
  },
  {
    id: 'srec',
    name: 'Motorola S-Record',
    extensions: ['.srec', '.s19', '.s28', '.s37', '.mot'],
    description: 'Motorola SREC ASCII file format with 16-bit, 24-bit, or 32-bit memory addressing',
    isText: true,
    category: 'srec',
  },
  {
    id: 'raw_bin',
    name: 'Raw Binary',
    extensions: ['.bin', '.raw'],
    description: 'Pure binary stream byte array without memory address metadata',
    isText: false,
    category: 'raw',
  },
  {
    id: 'hex_string',
    name: 'Hex String / Text',
    extensions: ['.txt', '.hexstr'],
    description: 'Formatted plain-text hexadecimal strings (e.g. 0x12, 1234, 0xAB 0xCD)',
    isText: true,
    category: 'hex',
  },
  {
    id: 'c_array',
    name: 'C/C++ Byte Array',
    extensions: ['.c', '.h', '.cpp'],
    description: 'C/C++ source array format (e.g. const uint8_t data[] = { 0x00, ... })',
    isText: true,
    category: 'code',
  },
  {
    id: 'ti_txt',
    name: 'Texas Instruments TXT',
    extensions: ['.txt', '.ti'],
    description: 'TI MSP430/DSP text format with @address markers and q termination',
    isText: true,
    category: 'hex',
  },
  {
    id: 'verilog_vmem',
    name: 'Verilog VMEM / Readmemh',
    extensions: ['.mem', '.vh'],
    description: 'Hex memory initialization file for Verilog readmemh directives',
    isText: true,
    category: 'hardware',
  },
];

export interface MemorySegment {
  startAddress: number;
  data: Uint8Array;
}

export interface ParsedBinary {
  format: BinaryFormat;
  fileName?: string;
  segments: MemorySegment[];
  minAddress: number;
  maxAddress: number;
  totalBytes: number;
  entryPoint?: number;
  warnings: string[];
  errors: string[];
}

export interface ConversionOptions {
  baseAddressShift?: number; // Shift start address by +N or -N
  fillByte?: number; // 0x00 to 0xFF (default 0xFF for unmapped gap spaces)
  byteSwap?: 'none' | 'swap16' | 'swap32'; // Endianness swap
  targetBaseAddress?: number; // Explicit override base address for raw bin or formatted output
  cArrayName?: string; // Variable name for C array export
  cBytesPerLine?: number; // Formatting: number of hex values per line
  tiTxtHeaderAddress?: boolean;
  verilogAddrPrefix?: boolean;
}

export interface FileDataInput {
  name: string;
  content: Uint8Array;
  text?: string;
}
