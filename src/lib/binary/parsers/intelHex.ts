import type { ParsedBinary, MemorySegment } from '../types';
import { MemoryBuffer } from '../MemoryBuffer';

export function parseIntelHex(text: string, fileName?: string): ParsedBinary {
  const lines = text.split(/\r?\n/);
  const segments: MemorySegment[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  let upperAddress = 0;
  let entryPoint: number | undefined = undefined;

  let currentBlockStart: number | null = null;
  let currentBlockData: number[] = [];

  const flushBlock = () => {
    if (currentBlockStart !== null && currentBlockData.length > 0) {
      segments.push({
        startAddress: currentBlockStart,
        data: new Uint8Array(currentBlockData),
      });
      currentBlockStart = null;
      currentBlockData = [];
    }
  };

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const rawLine = lines[lineNum].trim();
    if (!rawLine) continue;

    if (!rawLine.startsWith(':')) {
      continue;
    }

    const hex = rawLine.substring(1);
    if (hex.length < 10) {
      warnings.push(`Line ${lineNum + 1}: Line too short, skipped.`);
      continue;
    }

    const byteCount = parseInt(hex.substring(0, 2), 16);
    const address = parseInt(hex.substring(2, 6), 16);
    const recordType = parseInt(hex.substring(6, 8), 16);

    if (isNaN(byteCount) || isNaN(address) || isNaN(recordType)) {
      warnings.push(`Line ${lineNum + 1}: Invalid hex fields.`);
      continue;
    }

    if (hex.length < 8 + byteCount * 2 + 2) {
      warnings.push(`Line ${lineNum + 1}: Data truncated.`);
      continue;
    }

    const checksumStr = hex.substring(8 + byteCount * 2, 8 + byteCount * 2 + 2);
    const checksumGiven = parseInt(checksumStr, 16);

    let sum = byteCount + (address >> 8) + (address & 0xff) + recordType;
    const dataBytes: number[] = [];
    for (let i = 0; i < byteCount; i++) {
      const b = parseInt(hex.substring(8 + i * 2, 10 + i * 2), 16);
      dataBytes.push(b);
      sum += b;
    }
    const checksumCalc = (~sum + 1) & 0xff;

    if (checksumGiven !== checksumCalc) {
      warnings.push(`Line ${lineNum + 1}: Checksum mismatch (calc 0x${checksumCalc.toString(16).padStart(2, '0').toUpperCase()}, got 0x${checksumGiven.toString(16).padStart(2, '0').toUpperCase()})`);
    }

    if (recordType === 0) {
      const fullAddress = upperAddress + address;
      if (currentBlockStart === null) {
        currentBlockStart = fullAddress;
        currentBlockData = dataBytes;
      } else if (currentBlockStart + currentBlockData.length === fullAddress) {
        currentBlockData.push(...dataBytes);
      } else {
        flushBlock();
        currentBlockStart = fullAddress;
        currentBlockData = dataBytes;
      }
    } else if (recordType === 1) {
      flushBlock();
      break;
    } else if (recordType === 2) {
      flushBlock();
      if (dataBytes.length >= 2) {
        upperAddress = ((dataBytes[0] << 8) | dataBytes[1]) << 4;
      }
    } else if (recordType === 3) {
      if (dataBytes.length >= 4) {
        const cs = (dataBytes[0] << 8) | dataBytes[1];
        const ip = (dataBytes[2] << 8) | dataBytes[3];
        entryPoint = (cs << 4) + ip;
      }
    } else if (recordType === 4) {
      flushBlock();
      if (dataBytes.length >= 2) {
        upperAddress = ((dataBytes[0] << 8) | dataBytes[1]) << 16;
      }
    } else if (recordType === 5) {
      if (dataBytes.length >= 4) {
        entryPoint = ((dataBytes[0] << 24) | (dataBytes[1] << 16) | (dataBytes[2] << 8) | dataBytes[3]) >>> 0;
      }
    }
  }

  flushBlock();

  const memoryBuffer = new MemoryBuffer(segments, entryPoint);
  return {
    format: 'intel_hex',
    fileName,
    segments: memoryBuffer.getSegments(),
    minAddress: memoryBuffer.getMinAddress(),
    maxAddress: memoryBuffer.getMaxAddress(),
    totalBytes: memoryBuffer.getTotalBytes(),
    entryPoint,
    warnings,
    errors,
  };
}

export function writeIntelHex(memoryBuffer: MemoryBuffer, lineChunkSize = 16): string {
  const segments = memoryBuffer.getSegments();
  const lines: string[] = [];
  let currentUpperAddr = -1;

  for (const seg of segments) {
    let offset = 0;
    const totalLen = seg.data.length;

    while (offset < totalLen) {
      const currentAddr = seg.startAddress + offset;
      const upper16 = (currentAddr >>> 16) & 0xffff;
      const lower16 = currentAddr & 0xffff;

      if (upper16 !== currentUpperAddr) {
        currentUpperAddr = upper16;
        const recordType = 4;
        const byteCount = 2;
        const uHigh = (upper16 >> 8) & 0xff;
        const uLow = upper16 & 0xff;
        let sum = byteCount + 0 + 0 + recordType + uHigh + uLow;
        const checksum = (~sum + 1) & 0xff;
        lines.push(`:02000004${uHigh.toString(16).padStart(2, '0')}${uLow.toString(16).padStart(2, '0')}${checksum.toString(16).padStart(2, '0')}`.toUpperCase());
      }

      const chunkSize = Math.min(lineChunkSize, totalLen - offset, 0x10000 - lower16);
      const chunk = seg.data.subarray(offset, offset + chunkSize);

      let sum = chunkSize + ((lower16 >> 8) & 0xff) + (lower16 & 0xff) + 0;
      let hexData = '';

      for (let i = 0; i < chunk.length; i++) {
        const b = chunk[i];
        sum += b;
        hexData += b.toString(16).padStart(2, '0');
      }

      const checksum = (~sum + 1) & 0xff;
      const addrHex = lower16.toString(16).padStart(4, '0');
      const countHex = chunkSize.toString(16).padStart(2, '0');
      const csHex = checksum.toString(16).padStart(2, '0');

      lines.push(`:${countHex}${addrHex}00${hexData}${csHex}`.toUpperCase());
      offset += chunkSize;
    }
  }

  if (memoryBuffer.entryPoint !== undefined) {
    const ep = memoryBuffer.entryPoint >>> 0;
    const b0 = (ep >>> 24) & 0xff;
    const b1 = (ep >>> 16) & 0xff;
    const b2 = (ep >>> 8) & 0xff;
    const b3 = ep & 0xff;
    const sum = 4 + 0 + 0 + 5 + b0 + b1 + b2 + b3;
    const checksum = (~sum + 1) & 0xff;
    const epHex = `${b0.toString(16).padStart(2, '0')}${b1.toString(16).padStart(2, '0')}${b2.toString(16).padStart(2, '0')}${b3.toString(16).padStart(2, '0')}`;
    lines.push(`:04000005${epHex}${checksum.toString(16).padStart(2, '0')}`.toUpperCase());
  }

  lines.push(':00000001FF');
  return lines.join('\n');
}
