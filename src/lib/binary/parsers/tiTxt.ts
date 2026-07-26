import type { ParsedBinary, MemorySegment } from '../types';
import { MemoryBuffer } from '../MemoryBuffer';

export function parseTITxt(text: string, fileName?: string): ParsedBinary {
  const lines = text.split(/\r?\n/);
  const segments: MemorySegment[] = [];
  const warnings: string[] = [];

  let currentAddr: number | null = null;
  let currentBytes: number[] = [];

  const flushBlock = () => {
    if (currentAddr !== null && currentBytes.length > 0) {
      segments.push({
        startAddress: currentAddr,
        data: new Uint8Array(currentBytes),
      });
      currentAddr = null;
      currentBytes = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('@')) {
      flushBlock();
      const addrHex = trimmed.substring(1).trim();
      const addr = parseInt(addrHex, 16);
      if (!isNaN(addr)) {
        currentAddr = addr;
      }
    } else if (trimmed.toLowerCase() === 'q') {
      flushBlock();
      break;
    } else {
      const tokens = trimmed.split(/\s+/);
      for (const tok of tokens) {
        if (/^[0-9a-fA-F]{1,2}$/.test(tok)) {
          const b = parseInt(tok, 16);
          if (currentAddr === null) currentAddr = 0;
          currentBytes.push(b);
        }
      }
    }
  }

  flushBlock();

  const memoryBuffer = new MemoryBuffer(segments);

  return {
    format: 'ti_txt',
    fileName,
    segments: memoryBuffer.getSegments(),
    minAddress: memoryBuffer.getMinAddress(),
    maxAddress: memoryBuffer.getMaxAddress(),
    totalBytes: memoryBuffer.getTotalBytes(),
    warnings,
    errors: [],
  };
}

export function writeTITxt(memoryBuffer: MemoryBuffer, bytesPerLine = 16): string {
  const segments = memoryBuffer.getSegments();
  const lines: string[] = [];

  for (const seg of segments) {
    const addrHex = seg.startAddress.toString(16).padStart(4, '0').toUpperCase();
    lines.push(`@${addrHex}`);

    for (let i = 0; i < seg.data.length; i += bytesPerLine) {
      const chunk = seg.data.subarray(i, i + bytesPerLine);
      const hexTokens = Array.from(chunk).map(b => b.toString(16).padStart(2, '0').toUpperCase());
      lines.push(hexTokens.join(' '));
    }
  }

  lines.push('q');
  return lines.join('\n');
}
