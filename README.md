# OmniHex - Universal Binary & Hex File Format Converter

OmniHex is a modern, high-performance, sleek, and lightweight web application designed for converting microcontroller, FPGA, and embedded binary files between various formats.

![OmniHex](https://img.shields.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.shields.io/badge/React-19-cyan.svg)
![TypeScript](https://img.shields.shields.io/badge/TypeScript-5.0-blue.svg)
![TailwindCSS](https://img.shields.shields.io/badge/TailwindCSS-v4-purple.svg)

---

## 🌟 Key Features

- **100% Client-Side Privacy**: All file parsing, transformation, and generation are computed locally within your browser using Web APIs. No file content is ever uploaded to a server.
- **Supported Formats**:
  - **Intel HEX** (`.hex`, `.ihex`, `.mcs`) — 8-bit, 16-bit, and 32-bit (INHEX32 record types 00, 01, 02, 03, 04, 05).
  - **Motorola S-Record** (`.srec`, `.s19`, `.s28`, `.s37`, `.mot`) — S0, S1/S2/S3 data records, S7/S8/S9 termination vectors.
  - **Raw Binary** (`.bin`) — Direct byte streams with customizable target base addresses.
  - **Hex String / Text** (`.txt`) — Formatted plain-text hex strings (e.g., `0x12 0x34` or `1234ABCD`).
  - **C/C++ Byte Array** (`.h`, `.c`) — Standard C header array syntax (`const uint8_t data[] = { ... }`).
  - **Texas Instruments TI-TXT** (`.txt`, `.ti`) — MSP430/DSP text format with `@address` blocks.
  - **Verilog VMEM** (`.mem`, `.vh`) — FPGA ROM/RAM initialization file format (`readmemh`).
- **Interactive Memory Map Visualizer**: Visual bar graph showing mapped data blocks vs unmapped gaps, memory span, total bytes, and entry point vectors.
- **Paginated Hex & ASCII Inspector**: Real-time interactive inspection of raw binary bytes with ASCII representations.
- **Advanced Parameters**:
  - Address Offset Shift (+N / -N).
  - Gap Filling Padding Bytes (`0xFF` Flash Erased State default or `0x00`).
  - Endian Byte Swapping (16-bit or 32-bit byte reversal).
- **Preset Test Samples**: Built-in 1-click test samples (STM32 Firmware, SREC Bootloader, EEPROM Config, Verilog ROM) for instant evaluation.

---

## 🛠️ Quick Start

```bash
# Clone the repository
git clone https://github.com/metacity9/hex_converter.git
cd hex_converter

# Install dependencies
npm install

# Start local dev server
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```

---

## 📄 License

MIT License
