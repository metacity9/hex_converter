import type { MemorySegment, ConversionOptions } from './types';

export class MemoryBuffer {
  private segments: MemorySegment[] = [];
  public entryPoint?: number;

  constructor(segments: MemorySegment[] = [], entryPoint?: number) {
    this.segments = this.normalizeSegments(segments);
    this.entryPoint = entryPoint;
  }

  /**
   * Sorts and merges overlapping/contiguous memory segments.
   */
  private normalizeSegments(rawSegments: MemorySegment[]): MemorySegment[] {
    if (rawSegments.length === 0) return [];

    // Filter empty segments
    const valid = rawSegments.filter(s => s.data && s.data.length > 0);
    if (valid.length === 0) return [];

    // Sort by start address
    valid.sort((a, b) => a.startAddress - b.startAddress);

    const merged: MemorySegment[] = [];
    let current = {
      startAddress: valid[0].startAddress,
      data: new Uint8Array(valid[0].data),
    };

    for (let i = 1; i < valid.length; i++) {
      const next = valid[i];
      const currentEnd = current.startAddress + current.data.length;

      if (next.startAddress <= currentEnd) {
        // Overlap or contiguous
        const newEnd = Math.max(currentEnd, next.startAddress + next.data.length);
        const newData = new Uint8Array(newEnd - current.startAddress);
        newData.set(current.data, 0);

        const offsetInCurrent = next.startAddress - current.startAddress;
        newData.set(next.data, offsetInCurrent);

        current.data = newData;
      } else {
        merged.push(current);
        current = {
          startAddress: next.startAddress,
          data: new Uint8Array(next.data),
        };
      }
    }
    merged.push(current);

    return merged;
  }

  public getSegments(): MemorySegment[] {
    return this.segments;
  }

  public getMinAddress(): number {
    if (this.segments.length === 0) return 0;
    return this.segments[0].startAddress;
  }

  public getMaxAddress(): number {
    if (this.segments.length === 0) return 0;
    const last = this.segments[this.segments.length - 1];
    return last.startAddress + last.data.length - 1;
  }

  public getTotalBytes(): number {
    return this.segments.reduce((acc, seg) => acc + seg.data.length, 0);
  }

  /**
   * Returns contiguous byte array between minAddress and maxAddress,
   * filling unmapped memory gaps with `fillByte` (default 0xFF).
   */
  public toContiguousBuffer(options: ConversionOptions = {}): { buffer: Uint8Array; baseAddress: number } {
    if (this.segments.length === 0) {
      return { buffer: new Uint8Array(0), baseAddress: 0 };
    }

    const fillByte = options.fillByte ?? 0xff;
    const minAddr = options.targetBaseAddress !== undefined ? options.targetBaseAddress : this.getMinAddress();
    const maxAddr = Math.max(this.getMaxAddress(), minAddr);

    const totalSpan = maxAddr - minAddr + 1;
    const buffer = new Uint8Array(totalSpan);
    buffer.fill(fillByte);

    for (const seg of this.segments) {
      const targetOffset = seg.startAddress - minAddr;
      if (targetOffset >= 0 && targetOffset < totalSpan) {
        const copyLength = Math.min(seg.data.length, totalSpan - targetOffset);
        buffer.set(seg.data.subarray(0, copyLength), targetOffset);
      }
    }

    // Apply byte swap if requested
    const swappedBuffer = this.applyByteSwap(buffer, options.byteSwap);

    return {
      buffer: swappedBuffer,
      baseAddress: minAddr + (options.baseAddressShift || 0),
    };
  }

  /**
   * Transforms segments according to ConversionOptions (shift address, byte swap).
   */
  public applyOptions(options: ConversionOptions): MemoryBuffer {
    const shift = options.baseAddressShift || 0;
    const swapMode = options.byteSwap || 'none';

    const newSegments: MemorySegment[] = this.segments.map(seg => {
      const swappedData = this.applyByteSwap(seg.data, swapMode);
      return {
        startAddress: Math.max(0, seg.startAddress + shift),
        data: swappedData,
      };
    });

    const newEntryPoint = this.entryPoint !== undefined ? Math.max(0, this.entryPoint + shift) : undefined;
    return new MemoryBuffer(newSegments, newEntryPoint);
  }

  private applyByteSwap(data: Uint8Array, swapMode?: 'none' | 'swap16' | 'swap32'): Uint8Array {
    if (!swapMode || swapMode === 'none' || data.length < 2) return data;

    const output = new Uint8Array(data);

    if (swapMode === 'swap16') {
      for (let i = 0; i < output.length - 1; i += 2) {
        const temp = output[i];
        output[i] = output[i + 1];
        output[i + 1] = temp;
      }
    } else if (swapMode === 'swap32') {
      for (let i = 0; i < output.length - 3; i += 4) {
        const b0 = output[i];
        const b1 = output[i + 1];
        const b2 = output[i + 2];
        const b3 = output[i + 3];

        output[i] = b3;
        output[i + 1] = b2;
        output[i + 2] = b1;
        output[i + 3] = b0;
      }
    }

    return output;
  }
}
