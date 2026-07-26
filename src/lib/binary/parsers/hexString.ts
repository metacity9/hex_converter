import type { ParsedBinary } from '../types';
import { MemoryBuffer } from '../MemoryBuffer';

export function parseHexString(text: string, baseAddress = 0, fileName?: string): ParsedBinary {
  const clean = text
    .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
    .replace(/0x|0X/g, ' ')
    .replace(/[,;:\r\n\t]/g, ' ');

  const tokens = clean.split(/\s+/).filter(t => t.length > 0);
  const bytes: number[] = [];

  for (const token of tokens) {
    if (/^[0-9a-fA-F]+$/.test(token)) {
      if (token.length % 2 === 0) {
        for (let i = 0; i < token.length; i += 2) {
          bytes.push(parseInt(token.substring(i, i + 2), 16));
        }
      } else if (token.length === 1) {
        bytes.push(parseInt(token, 16));
      }
    }
  }

  const segments = [
    {
      startAddress: baseAddress,
      data: new Uint8Array(bytes),
    },
  ];

  const memoryBuffer = new MemoryBuffer(segments);

  return {
    format: 'hex_string',
    fileName,
    segments: memoryBuffer.getSegments(),
    minAddress: memoryBuffer.getMinAddress(),
    maxAddress: memoryBuffer.getMaxAddress(),
    totalBytes: memoryBuffer.getTotalBytes(),
    warnings: bytes.length === 0 ? ['No valid hex bytes found in input text.'] : [],
    errors: [],
  };
}

export function writeHexString(memoryBuffer: MemoryBuffer, bytesPerLine = 16, prefix0x = false): string {
  const { buffer } = memoryBuffer.toContiguousBuffer();
  const lines: string[] = [];

  for (let i = 0; i < buffer.length; i += bytesPerLine) {
    const chunk = buffer.subarray(i, i + bytesPerLine);
    const hexTokens = Array.from(chunk).map(b => (prefix0x ? '0x' : '') + b.toString(16).padStart(2, '0').toUpperCase());
    lines.push(hexTokens.join(' '));
  }

  return lines.join('\n');
}
