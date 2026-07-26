import type { ParsedBinary, MemorySegment } from '../types';
import { MemoryBuffer } from '../MemoryBuffer';

export function parseVerilogMem(text: string, fileName?: string): ParsedBinary {
  const clean = text.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  const tokens = clean.split(/\s+/).filter(t => t.length > 0);

  const segments: MemorySegment[] = [];
  let currentAddr = 0;
  let currentBytes: number[] = [];

  const flushBlock = () => {
    if (currentBytes.length > 0) {
      segments.push({
        startAddress: currentAddr,
        data: new Uint8Array(currentBytes),
      });
      currentAddr = currentAddr + currentBytes.length;
      currentBytes = [];
    }
  };

  for (const tok of tokens) {
    if (tok.startsWith('@')) {
      flushBlock();
      const addr = parseInt(tok.substring(1), 16);
      if (!isNaN(addr)) {
        currentAddr = addr;
      }
    } else if (/^[0-9a-fA-F]+$/.test(tok)) {
      if (tok.length % 2 === 0) {
        for (let i = 0; i < tok.length; i += 2) {
          currentBytes.push(parseInt(tok.substring(i, i + 2), 16));
        }
      } else {
        currentBytes.push(parseInt(tok, 16));
      }
    }
  }

  flushBlock();

  const memoryBuffer = new MemoryBuffer(segments);

  return {
    format: 'verilog_vmem',
    fileName,
    segments: memoryBuffer.getSegments(),
    minAddress: memoryBuffer.getMinAddress(),
    maxAddress: memoryBuffer.getMaxAddress(),
    totalBytes: memoryBuffer.getTotalBytes(),
    warnings: [],
    errors: [],
  };
}

export function writeVerilogMem(memoryBuffer: MemoryBuffer, bytesPerLine = 16): string {
  const segments = memoryBuffer.getSegments();
  const lines: string[] = ['// Verilog Memory Initialization File (readmemh)'];

  for (const seg of segments) {
    lines.push(`@${seg.startAddress.toString(16).padStart(8, '0').toUpperCase()}`);
    for (let i = 0; i < seg.data.length; i += bytesPerLine) {
      const chunk = seg.data.subarray(i, i + bytesPerLine);
      const hexTokens = Array.from(chunk).map(b => b.toString(16).padStart(2, '0').toUpperCase());
      lines.push(hexTokens.join(' '));
    }
  }

  return lines.join('\n');
}
