import type { ParsedBinary } from '../types';
import { MemoryBuffer } from '../MemoryBuffer';

export function parseRawBin(content: Uint8Array, baseAddress = 0, fileName?: string): ParsedBinary {
  const segments = [
    {
      startAddress: baseAddress,
      data: new Uint8Array(content),
    },
  ];

  const memoryBuffer = new MemoryBuffer(segments);

  return {
    format: 'raw_bin',
    fileName,
    segments: memoryBuffer.getSegments(),
    minAddress: memoryBuffer.getMinAddress(),
    maxAddress: memoryBuffer.getMaxAddress(),
    totalBytes: memoryBuffer.getTotalBytes(),
    warnings: [],
    errors: [],
  };
}

export function writeRawBin(memoryBuffer: MemoryBuffer, fillByte = 0xff, targetBaseAddress?: number): Uint8Array {
  const { buffer } = memoryBuffer.toContiguousBuffer({ fillByte, targetBaseAddress });
  return buffer;
}
