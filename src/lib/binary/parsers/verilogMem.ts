import type { ParsedBinary, MemorySegment, ConversionOptions } from '../types';
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

export function writeVerilogMem(memoryBuffer: MemoryBuffer, options: ConversionOptions = {}): string {
  const segments = memoryBuffer.getSegments();
  const bytesPerLine = options.bytesPerLine ?? 16;
  const wordSize = options.hexGroupSize ?? 1; // 1, 2, or 4 bytes per word
  const isUpper = (options.hexCase || 'upper') === 'upper';

  const lines: string[] = ['// Verilog Memory Initialization File (readmemh)'];

  for (const seg of segments) {
    const addrHex = seg.startAddress.toString(16).padStart(8, '0');
    lines.push(`@${isUpper ? addrHex.toUpperCase() : addrHex.toLowerCase()}`);

    for (let i = 0; i < seg.data.length; i += bytesPerLine) {
      const lineChunk = seg.data.subarray(i, Math.min(seg.data.length, i + bytesPerLine));
      const tokens: string[] = [];

      for (let w = 0; w < lineChunk.length; w += wordSize) {
        const wordBytes = lineChunk.subarray(w, Math.min(lineChunk.length, w + wordSize));
        let wordHex = '';
        for (let b = 0; b < wordBytes.length; b++) {
          const bHex = wordBytes[b].toString(16).padStart(2, '0');
          wordHex += isUpper ? bHex.toUpperCase() : bHex.toLowerCase();
        }
        tokens.push(wordHex);
      }

      lines.push(tokens.join(' '));
    }
  }

  return lines.join('\n');
}
