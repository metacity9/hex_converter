import type { ParsedBinary, MemorySegment } from '../types';
import { MemoryBuffer } from '../MemoryBuffer';

export function parseSRecord(text: string, fileName?: string): ParsedBinary {
  const lines = text.split(/\r?\n/);
  const segments: MemorySegment[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

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
    if (!rawLine || !rawLine.startsWith('S')) continue;

    const recordType = rawLine.substring(0, 2).toUpperCase();
    const hex = rawLine.substring(2);
    if (hex.length < 4) continue;

    const count = parseInt(hex.substring(0, 2), 16);
    if (isNaN(count) || hex.length < count * 2) {
      warnings.push(`Line ${lineNum + 1}: Invalid S-Record length.`);
      continue;
    }

    const recordBytes: number[] = [];
    let sum = count;
    for (let i = 1; i <= count; i++) {
      const b = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
      recordBytes.push(b);
      if (i < count) {
        sum += b;
      }
    }

    const checksumGiven = recordBytes[recordBytes.length - 1];
    const checksumCalc = (~sum) & 0xff;

    if (checksumGiven !== checksumCalc) {
      warnings.push(`Line ${lineNum + 1}: S-Record checksum error (calc 0x${checksumCalc.toString(16).padStart(2, '0').toUpperCase()}, got 0x${checksumGiven.toString(16).padStart(2, '0').toUpperCase()})`);
    }

    let addrLength = 0;
    if (recordType === 'S1' || recordType === 'S9') addrLength = 2;
    else if (recordType === 'S2' || recordType === 'S8') addrLength = 3;
    else if (recordType === 'S3' || recordType === 'S7') addrLength = 4;

    if (addrLength > 0) {
      let address = 0;
      for (let i = 0; i < addrLength; i++) {
        address = (address << 8) | recordBytes[i];
      }

      address = address >>> 0;
      const dataBytes = recordBytes.slice(addrLength, recordBytes.length - 1);

      if (recordType === 'S1' || recordType === 'S2' || recordType === 'S3') {
        if (currentBlockStart === null) {
          currentBlockStart = address;
          currentBlockData = dataBytes;
        } else if (currentBlockStart + currentBlockData.length === address) {
          currentBlockData.push(...dataBytes);
        } else {
          flushBlock();
          currentBlockStart = address;
          currentBlockData = dataBytes;
        }
      } else if (recordType === 'S7' || recordType === 'S8' || recordType === 'S9') {
        entryPoint = address;
        flushBlock();
        break;
      }
    }
  }

  flushBlock();

  const memoryBuffer = new MemoryBuffer(segments, entryPoint);
  return {
    format: 'srec',
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

export function writeSRecord(memoryBuffer: MemoryBuffer, lineChunkSize = 16): string {
  const segments = memoryBuffer.getSegments();
  const maxAddr = memoryBuffer.getMaxAddress();
  const lines: string[] = [];

  const hdrText = 'OMNIHEX';
  const hdrBytes = Array.from(hdrText).map(c => c.charCodeAt(0));
  const s0Count = 2 + hdrBytes.length + 1;
  let s0Sum = s0Count + 0 + 0;
  let s0Hex = `S0${s0Count.toString(16).padStart(2, '0')}0000`;
  for (const b of hdrBytes) {
    s0Sum += b;
    s0Hex += b.toString(16).padStart(2, '0');
  }
  const s0Cs = (~s0Sum) & 0xff;
  lines.push(`${s0Hex}${s0Cs.toString(16).padStart(2, '0')}`.toUpperCase());

  let recType = 'S3';
  let termType = 'S7';
  let addrLen = 4;

  if (maxAddr <= 0xffff) {
    recType = 'S1';
    termType = 'S9';
    addrLen = 2;
  } else if (maxAddr <= 0xffffff) {
    recType = 'S2';
    termType = 'S8';
    addrLen = 3;
  }

  for (const seg of segments) {
    let offset = 0;
    while (offset < seg.data.length) {
      const chunkSize = Math.min(lineChunkSize, seg.data.length - offset);
      const chunk = seg.data.subarray(offset, offset + chunkSize);
      const currentAddr = (seg.startAddress + offset) >>> 0;

      const recordCount = addrLen + chunkSize + 1;
      let sum = recordCount;

      let addrHex = '';
      for (let i = addrLen - 1; i >= 0; i--) {
        const addrByte = (currentAddr >>> (i * 8)) & 0xff;
        sum += addrByte;
        addrHex += addrByte.toString(16).padStart(2, '0');
      }

      let dataHex = '';
      for (let i = 0; i < chunk.length; i++) {
        const b = chunk[i];
        sum += b;
        dataHex += b.toString(16).padStart(2, '0');
      }

      const checksum = (~sum) & 0xff;
      const countHex = recordCount.toString(16).padStart(2, '0');
      const csHex = checksum.toString(16).padStart(2, '0');

      lines.push(`${recType}${countHex}${addrHex}${dataHex}${csHex}`.toUpperCase());
      offset += chunkSize;
    }
  }

  const ep = memoryBuffer.entryPoint ?? memoryBuffer.getMinAddress();
  const termCount = addrLen + 1;
  let termSum = termCount;
  let termAddrHex = '';
  for (let i = addrLen - 1; i >= 0; i--) {
    const b = (ep >>> (i * 8)) & 0xff;
    termSum += b;
    termAddrHex += b.toString(16).padStart(2, '0');
  }
  const termCs = (~termSum) & 0xff;
  lines.push(`${termType}${termCount.toString(16).padStart(2, '0')}${termAddrHex}${termCs.toString(16).padStart(2, '0')}`.toUpperCase());

  return lines.join('\n');
}
