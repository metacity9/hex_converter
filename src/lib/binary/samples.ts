import type { BinaryFormat, FileDataInput } from './types';
import { MemoryBuffer } from './MemoryBuffer';
import { writeIntelHex } from './parsers/intelHex';
import { writeSRecord } from './parsers/srecord';
import { writeVerilogMem } from './parsers/verilogMem';

export interface PresetSample {
  id: string;
  title: string;
  format: BinaryFormat;
  description: string;
  fileInput: FileDataInput;
}

export function getPresetSamples(): PresetSample[] {
  const stm32Data = new Uint8Array(64);
  const encoder = new TextEncoder();
  const magic = encoder.encode("OmniHex ARM Firmware v1.0 - STM32 MCU Target");
  stm32Data.set(magic.subarray(0, Math.min(magic.length, 64)), 0);

  const mem1 = new MemoryBuffer([
    { startAddress: 0x08000000, data: stm32Data },
  ], 0x08000004);

  const hexText = writeIntelHex(mem1);

  const bootData = new Uint8Array(48);
  const bootMagic = encoder.encode("SREC Bootloader v2.4 (0x00010000)");
  bootData.set(bootMagic.subarray(0, Math.min(bootMagic.length, 48)), 0);

  const mem2 = new MemoryBuffer([
    { startAddress: 0x00010000, data: bootData },
  ], 0x00010000);

  const srecText = writeSRecord(mem2);

  const romData = new Uint8Array(32);
  for (let i = 0; i < 32; i++) romData[i] = (i * 7 + 0x13) & 0xff;
  const mem3 = new MemoryBuffer([{ startAddress: 0x0000, data: romData }]);
  const vmemText = writeVerilogMem(mem3);

  return [
    {
      id: 'intel_hex_sample',
      title: 'STM32 MCU Firmware (.hex)',
      format: 'intel_hex',
      description: 'Intel HEX file with 0x08000000 flash start address & vector table',
      fileInput: {
        name: 'stm32_firmware_sample.hex',
        content: new TextEncoder().encode(hexText),
        text: hexText,
      },
    },
    {
      id: 'srec_sample',
      title: 'Motorola SREC Bootloader (.s19)',
      format: 'srec',
      description: 'Motorola S-Record 32-bit address bootloader segment',
      fileInput: {
        name: 'bootloader_sample.srec',
        content: new TextEncoder().encode(srecText),
        text: srecText,
      },
    },
    {
      id: 'raw_bin_sample',
      title: 'EEPROM Config Data (.bin)',
      format: 'raw_bin',
      description: 'Raw binary stream with header signatures',
      fileInput: {
        name: 'eeprom_config.bin',
        content: encoder.encode("EEPROM_CONFIG_HEADER_0x88_OK_FLAGS_0xFF_SYSTEM"),
      },
    },
    {
      id: 'verilog_vmem_sample',
      title: 'FPGA ROM Initializer (.mem)',
      format: 'verilog_vmem',
      description: 'Verilog readmemh hardware ROM file',
      fileInput: {
        name: 'fpga_rom.mem',
        content: new TextEncoder().encode(vmemText),
        text: vmemText,
      },
    },
  ];
}
