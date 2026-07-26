import type { ParsedBinary } from '../types';
import type { ConversionOptions } from '../types';
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

export function writeHexString(memoryBuffer: MemoryBuffer, options: ConversionOptions = {}): string {
  const { buffer } = memoryBuffer.toContiguousBuffer(options);
  const bytesPerLine = options.bytesPerLine ?? 16;
  const groupSize = options.hexGroupSize ?? 1;
  const prefix = options.prefix0x ? '0x' : '';
  const isUpper = (options.hexCase || 'upper') === 'upper';

  let separator = ' ';
  if (options.delimiter === 'comma') separator = ',';
  else if (options.delimiter === 'comma_space') separator = ', ';
  else if (options.delimiter === 'none') separator = '';
  else if (options.delimiter === 'newline') separator = '\n';

  const lines: string[] = [];
  let currentLineTokens: string[] = [];
  let bytesInCurrentLine = 0;

  for (let i = 0; i < buffer.length; i += groupSize) {
    const chunk = buffer.subarray(i, Math.min(buffer.length, i + groupSize));
    let groupHex = '';

    // Convert group of bytes into single hex token
    for (let j = 0; j < chunk.length; j++) {
      const b = chunk[j];
      const bHex = b.toString(16).padStart(2, '0');
      groupHex += isUpper ? bHex.toUpperCase() : bHex.toLowerCase();
    }

    const token = `${prefix}${groupHex}`;
    currentLineTokens.push(token);
    bytesInCurrentLine += chunk.length;

    if (bytesInCurrentLine >= bytesPerLine || i + groupSize >= buffer.length) {
      lines.push(currentLineTokens.join(separator));
      currentLineTokens = [];
      bytesInCurrentLine = 0;
    }
  }

  return lines.join('\n');
}
