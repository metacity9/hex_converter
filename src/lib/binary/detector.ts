import type { BinaryFormat, FileDataInput } from './types';

export function detectFormat(fileInput: FileDataInput): BinaryFormat {
  const ext = fileInput.name.toLowerCase().substring(fileInput.name.lastIndexOf('.'));
  const text = fileInput.text || '';

  // Check file extensions first
  if (ext === '.hex' || ext === '.ihex' || ext === '.mcs') return 'intel_hex';
  if (ext === '.srec' || ext === '.s19' || ext === '.s28' || ext === '.s37' || ext === '.mot') return 'srec';
  if (ext === '.bin' || ext === '.raw') return 'raw_bin';
  if (ext === '.c' || ext === '.h' || ext === '.cpp') return 'c_array';
  if (ext === '.mem' || ext === '.vh') return 'verilog_vmem';
  if (ext === '.ti') return 'ti_txt';

  // If text is available, inspect content heuristics
  if (text.length > 0) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const firstFew = lines.slice(0, 20);

    // Intel HEX check: colon start with valid hex
    const intelHexCount = firstFew.filter(l => l.startsWith(':') && /^:[0-9a-fA-F]+$/.test(l)).length;
    if (intelHexCount > 0) return 'intel_hex';

    // Motorola SREC check: S0-S9 start with valid hex
    const srecCount = firstFew.filter(l => /^S[0-9][0-9a-fA-F]+$/i.test(l)).length;
    if (srecCount > 0) return 'srec';

    // C Array check: contains uint8_t, char, array declaration or braces with hex
    if (/const\s+uint8_t|unsigned\s+char|uint8_t\s+\w+\[/i.test(text) || (text.includes('{') && text.includes('}') && text.includes('0x'))) {
      return 'c_array';
    }

    // TI-TXT check: starts with @addr and ends with q
    if (text.includes('@') && /q\s*$/i.test(text)) return 'ti_txt';

    // Verilog VMEM check: contains @ and readmemh/vmem syntax
    if (ext === '.mem' || text.includes('readmemh') || (text.includes('@') && /^\/\//m.test(text))) {
      return 'verilog_vmem';
    }

    // Hex String check: high ratio of hex characters
    const sample = text.substring(0, 1000).replace(/\s+/g, '');
    if (/^(0x[0-9a-fA-F]{1,2}|[0-9a-fA-F]{2})+$/.test(sample)) {
      return 'hex_string';
    }
  }

  // Default fallback if binary non-text file
  return 'raw_bin';
}
