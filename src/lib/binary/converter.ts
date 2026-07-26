import type { BinaryFormat, ConversionOptions, FileDataInput, ParsedBinary } from './types';
import { MemoryBuffer } from './MemoryBuffer';
import { parseIntelHex, writeIntelHex } from './parsers/intelHex';
import { parseSRecord, writeSRecord } from './parsers/srecord';
import { parseRawBin, writeRawBin } from './parsers/rawBin';
import { parseHexString, writeHexString } from './parsers/hexString';
import { parseCArray, writeCArray } from './parsers/cArray';
import { parseTITxt, writeTITxt } from './parsers/tiTxt';
import { parseVerilogMem, writeVerilogMem } from './parsers/verilogMem';
import { detectFormat } from './detector';

export function parseFile(input: FileDataInput, formatOverride?: BinaryFormat, baseAddress = 0): ParsedBinary {
  const format = formatOverride || detectFormat(input);
  const textContent = input.text ?? new TextDecoder('utf-8', { fatal: false }).decode(input.content);

  switch (format) {
    case 'intel_hex':
      return parseIntelHex(textContent, input.name);
    case 'srec':
      return parseSRecord(textContent, input.name);
    case 'raw_bin':
      return parseRawBin(input.content, baseAddress, input.name);
    case 'hex_string':
      return parseHexString(textContent, baseAddress, input.name);
    case 'c_array':
      return parseCArray(textContent, baseAddress, input.name);
    case 'ti_txt':
      return parseTITxt(textContent, input.name);
    case 'verilog_vmem':
      return parseVerilogMem(textContent, input.name);
    default:
      return parseRawBin(input.content, baseAddress, input.name);
  }
}

export interface ConvertResult {
  outputFormat: BinaryFormat;
  fileName: string;
  textContent?: string;
  binaryBuffer?: Uint8Array;
  blob: Blob;
  parsed: ParsedBinary;
}

export function convertBinary(
  input: FileDataInput,
  targetFormat: BinaryFormat,
  options: ConversionOptions = {},
  inputFormatOverride?: BinaryFormat
): ConvertResult {
  const parsed = parseFile(input, inputFormatOverride, options.targetBaseAddress || 0);

  let memoryBuffer = new MemoryBuffer(parsed.segments, parsed.entryPoint);
  if (options.baseAddressShift || options.byteSwap) {
    memoryBuffer = memoryBuffer.applyOptions(options);
  }

  const baseName = input.name.substring(0, input.name.lastIndexOf('.')) || input.name;
  let extension = '.bin';
  let textContent: string | undefined = undefined;
  let binaryBuffer: Uint8Array | undefined = undefined;
  let mimeType = 'text/plain';

  const lineChunkSize = options.bytesPerLine ?? 16;

  switch (targetFormat) {
    case 'intel_hex':
      extension = '.hex';
      textContent = writeIntelHex(memoryBuffer, lineChunkSize);
      break;
    case 'srec':
      extension = '.srec';
      textContent = writeSRecord(memoryBuffer, lineChunkSize);
      break;
    case 'raw_bin':
      extension = '.bin';
      binaryBuffer = writeRawBin(memoryBuffer, options.fillByte ?? 0xff, options.targetBaseAddress);
      mimeType = 'application/octet-stream';
      break;
    case 'hex_string':
      extension = '.txt';
      textContent = writeHexString(memoryBuffer, options);
      break;
    case 'c_array':
      extension = '.h';
      textContent = writeCArray(memoryBuffer, options);
      break;
    case 'ti_txt':
      extension = '.txt';
      textContent = writeTITxt(memoryBuffer, lineChunkSize);
      break;
    case 'verilog_vmem':
      extension = '.mem';
      textContent = writeVerilogMem(memoryBuffer, options);
      break;
  }

  const outFileName = `${baseName}_converted${extension}`;
  let blob: Blob;

  if (binaryBuffer) {
    blob = new Blob([binaryBuffer.buffer as ArrayBuffer], { type: mimeType });
  } else {
    blob = new Blob([textContent || ''], { type: mimeType });
  }

  return {
    outputFormat: targetFormat,
    fileName: outFileName,
    textContent,
    binaryBuffer,
    blob,
    parsed,
  };
}
