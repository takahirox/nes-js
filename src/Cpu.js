import {Register8bit, Register16bit} from './Register.js';
import {Memory} from './Memory.js';
import {Utility} from './Utility.js';

/**
 * Ricoh 6502
 * Refer to https://wiki.nesdev.com/w/index.php/CPU
 */
function Cpu() {

  // registers

  this.pc = new Register16bit();
  this.sp = new Register8bit();
  this.a = new Register8bit();
  this.x = new Register8bit();
  this.y = new Register8bit();
  this.p = new CpuStatusRegister();

  // CPU inside RAM

  this.ram = new Memory(64 * 1024);  // 64KB

  // other devices

  this.ppu = null;  // set by setPpu()
  this.apu = null;  // set by setApu()
  this.pad1 = null; // set by setJoypad1()
  this.pad2 = null; // set by setJoypad2()

  // cartridge ROM

  this.rom = null;  // set by setRom()

  // Executing an instruction takes 1, 2, or more cycles.
  // .stallCycle represents the number of cycles left to
  // complete the currently executed instruction.

  this.stallCycle = 0;
}

// Interrups

Cpu.INTERRUPTS = {
  NMI:   0,
  RESET: 1,
  IRQ:   2,
  BRK:   3  // not interrupt but instruction
};

Cpu.INTERRUPT_HANDLER_ADDRESSES = [];
Cpu.INTERRUPT_HANDLER_ADDRESSES[Cpu.INTERRUPTS.NMI]   = 0xFFFA;
Cpu.INTERRUPT_HANDLER_ADDRESSES[Cpu.INTERRUPTS.RESET] = 0xFFFC;
Cpu.INTERRUPT_HANDLER_ADDRESSES[Cpu.INTERRUPTS.IRQ]   = 0xFFFE;
Cpu.INTERRUPT_HANDLER_ADDRESSES[Cpu.INTERRUPTS.BRK]   = 0xFFFE;

// Instructions

Cpu.INSTRUCTIONS = {
  INV: {'id':  0, 'name': 'inv'}, // Invalid
  ADC: {'id':  1, 'name': 'adc'},
  AND: {'id':  2, 'name': 'and'},
  ASL: {'id':  3, 'name': 'asl'},
  BCC: {'id':  4, 'name': 'bcc'},
  BCS: {'id':  5, 'name': 'bcs'},
  BEQ: {'id':  6, 'name': 'beq'},
  BIT: {'id':  7, 'name': 'bit'},
  BMI: {'id':  8, 'name': 'bmi'},
  BNE: {'id':  9, 'name': 'bne'},
  BPL: {'id': 10, 'name': 'bpl'},
  BRK: {'id': 11, 'name': 'brk'},
  BVC: {'id': 12, 'name': 'bvc'},
  BVS: {'id': 13, 'name': 'bvs'},
  CLC: {'id': 14, 'name': 'clc'},
  CLD: {'id': 15, 'name': 'cld'},
  CLI: {'id': 16, 'name': 'cli'},
  CLV: {'id': 17, 'name': 'clv'},
  CMP: {'id': 18, 'name': 'cmp'},
  CPX: {'id': 19, 'name': 'cpx'},
  CPY: {'id': 20, 'name': 'cpy'},
  DEC: {'id': 21, 'name': 'dec'},
  DEX: {'id': 22, 'name': 'dex'},
  DEY: {'id': 23, 'name': 'dey'},
  EOR: {'id': 24, 'name': 'eor'},
  INC: {'id': 25, 'name': 'inc'},
  INX: {'id': 26, 'name': 'inx'},
  INY: {'id': 27, 'name': 'iny'},
  JMP: {'id': 28, 'name': 'jmp'},
  JSR: {'id': 29, 'name': 'jsr'},
  LDA: {'id': 30, 'name': 'lda'},
  LDX: {'id': 31, 'name': 'ldx'},
  LDY: {'id': 32, 'name': 'ldy'},
  LSR: {'id': 33, 'name': 'lsr'},
  NOP: {'id': 34, 'name': 'nop'},
  ORA: {'id': 35, 'name': 'ora'},
  PHA: {'id': 36, 'name': 'pha'},
  PHP: {'id': 37, 'name': 'php'},
  PLA: {'id': 38, 'name': 'pla'},
  PLP: {'id': 39, 'name': 'plp'},
  ROL: {'id': 40, 'name': 'rol'},
  ROR: {'id': 41, 'name': 'ror'},
  RTI: {'id': 42, 'name': 'rti'},
  RTS: {'id': 43, 'name': 'rts'},
  SBC: {'id': 44, 'name': 'sbc'},
  SEC: {'id': 45, 'name': 'sec'},
  SED: {'id': 46, 'name': 'sed'},
  SEI: {'id': 47, 'name': 'sei'},
  STA: {'id': 48, 'name': 'sta'},
  STX: {'id': 49, 'name': 'stx'},
  STY: {'id': 50, 'name': 'sty'},
  TAX: {'id': 51, 'name': 'tax'},
  TAY: {'id': 52, 'name': 'tay'},
  TSX: {'id': 53, 'name': 'tsx'},
  TXA: {'id': 54, 'name': 'txa'},
  TXS: {'id': 55, 'name': 'txs'},
  TYA: {'id': 56, 'name': 'tya'}
};

// Addressing modes

Cpu.ADDRESSINGS = {
  IMMEDIATE:           {'id':  0, 'pc': 2, 'name': 'immediate'},
  ABSOLUTE:            {'id':  1, 'pc': 3, 'name': 'absolute'},
  INDEXED_ABSOLUTE_X:  {'id':  2, 'pc': 3, 'name': 'indexed_absolute_x'},
  INDEXED_ABSOLUTE_Y:  {'id':  3, 'pc': 3, 'name': 'indexed_absolute_y'},
  ZERO_PAGE:           {'id':  4, 'pc': 2, 'name': 'zero_page'},
  INDEXED_ZERO_PAGE_X: {'id':  5, 'pc': 2, 'name': 'indexed_zero_page_x'},
  INDEXED_ZERO_PAGE_Y: {'id':  6, 'pc': 2, 'name': 'indexed_zero_page_y'},
  IMPLIED:             {'id':  7, 'pc': 1, 'name': 'implied'},
  ACCUMULATOR:         {'id':  8, 'pc': 1, 'name': 'accumulator'},
  INDIRECT:            {'id':  9, 'pc': 3, 'name': 'indirect'},
  INDEXED_INDIRECT_X:  {'id': 10, 'pc': 2, 'name': 'indexed_indirect_x'},
  INDEXED_INDIRECT_Y:  {'id': 11, 'pc': 2, 'name': 'indexed_indirect_y'},
  RELATIVE:            {'id': 12, 'pc': 2, 'name': 'relative'}
};

// Operations (the combinations of interuction and addressing mode)
// Decoding in advance because it's much easier than implementing decoder.

Cpu.OPS = [
  /* 0x00 */ {'instruction': Cpu.INSTRUCTIONS.BRK, 'cycle': 7, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x01 */ {'instruction': Cpu.INSTRUCTIONS.ORA, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_X},
  /* 0x02 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x03 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x04 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x05 */ {'instruction': Cpu.INSTRUCTIONS.ORA, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x06 */ {'instruction': Cpu.INSTRUCTIONS.ASL, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x07 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x08 */ {'instruction': Cpu.INSTRUCTIONS.PHP, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x09 */ {'instruction': Cpu.INSTRUCTIONS.ORA, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0x0A */ {'instruction': Cpu.INSTRUCTIONS.ASL, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.ACCUMULATOR},
  /* 0x0B */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x0C */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x0D */ {'instruction': Cpu.INSTRUCTIONS.ORA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x0E */ {'instruction': Cpu.INSTRUCTIONS.ASL, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x0F */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x10 */ {'instruction': Cpu.INSTRUCTIONS.BPL, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.RELATIVE},
  /* 0x11 */ {'instruction': Cpu.INSTRUCTIONS.ORA, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_Y},
  /* 0x12 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x13 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x14 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x15 */ {'instruction': Cpu.INSTRUCTIONS.ORA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0x16 */ {'instruction': Cpu.INSTRUCTIONS.ASL, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0x17 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x18 */ {'instruction': Cpu.INSTRUCTIONS.CLC, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x19 */ {'instruction': Cpu.INSTRUCTIONS.ORA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_Y},
  /* 0x1A */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x1B */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x1C */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x1D */ {'instruction': Cpu.INSTRUCTIONS.ORA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0x1E */ {'instruction': Cpu.INSTRUCTIONS.ASL, 'cycle': 7, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0x1F */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x20 */ {'instruction': Cpu.INSTRUCTIONS.JSR, 'cycle': 0, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x21 */ {'instruction': Cpu.INSTRUCTIONS.AND, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_X},
  /* 0x22 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x23 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x24 */ {'instruction': Cpu.INSTRUCTIONS.BIT, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x25 */ {'instruction': Cpu.INSTRUCTIONS.AND, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x26 */ {'instruction': Cpu.INSTRUCTIONS.ROL, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x27 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x28 */ {'instruction': Cpu.INSTRUCTIONS.PLP, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x29 */ {'instruction': Cpu.INSTRUCTIONS.AND, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0x2A */ {'instruction': Cpu.INSTRUCTIONS.ROL, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.ACCUMULATOR},
  /* 0x2B */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x2C */ {'instruction': Cpu.INSTRUCTIONS.BIT, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x2D */ {'instruction': Cpu.INSTRUCTIONS.AND, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x2E */ {'instruction': Cpu.INSTRUCTIONS.ROL, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x2F */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x30 */ {'instruction': Cpu.INSTRUCTIONS.BMI, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.RELATIVE},
  /* 0x31 */ {'instruction': Cpu.INSTRUCTIONS.AND, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_Y},
  /* 0x32 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x33 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x34 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x35 */ {'instruction': Cpu.INSTRUCTIONS.AND, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0x36 */ {'instruction': Cpu.INSTRUCTIONS.ROL, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0x37 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x38 */ {'instruction': Cpu.INSTRUCTIONS.SEC, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x39 */ {'instruction': Cpu.INSTRUCTIONS.AND, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_Y},
  /* 0x3A */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x3B */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x3C */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x3D */ {'instruction': Cpu.INSTRUCTIONS.AND, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0x3E */ {'instruction': Cpu.INSTRUCTIONS.ROL, 'cycle': 7, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0x3F */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x40 */ {'instruction': Cpu.INSTRUCTIONS.RTI, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x41 */ {'instruction': Cpu.INSTRUCTIONS.EOR, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_X},
  /* 0x42 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x43 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x44 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x45 */ {'instruction': Cpu.INSTRUCTIONS.EOR, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x46 */ {'instruction': Cpu.INSTRUCTIONS.LSR, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x47 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x48 */ {'instruction': Cpu.INSTRUCTIONS.PHA, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x49 */ {'instruction': Cpu.INSTRUCTIONS.EOR, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0x4A */ {'instruction': Cpu.INSTRUCTIONS.LSR, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.ACCUMULATOR},
  /* 0x4B */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x4C */ {'instruction': Cpu.INSTRUCTIONS.JMP, 'cycle': 0, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x4D */ {'instruction': Cpu.INSTRUCTIONS.EOR, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x4E */ {'instruction': Cpu.INSTRUCTIONS.LSR, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x4F */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x50 */ {'instruction': Cpu.INSTRUCTIONS.BVC, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.RELATIVE},
  /* 0x51 */ {'instruction': Cpu.INSTRUCTIONS.EOR, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_Y},
  /* 0x52 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x53 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x54 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x55 */ {'instruction': Cpu.INSTRUCTIONS.EOR, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0x56 */ {'instruction': Cpu.INSTRUCTIONS.LSR, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0x57 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x58 */ {'instruction': Cpu.INSTRUCTIONS.CLI, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x59 */ {'instruction': Cpu.INSTRUCTIONS.EOR, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_Y},
  /* 0x5A */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x5B */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x5C */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x5D */ {'instruction': Cpu.INSTRUCTIONS.EOR, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0x5E */ {'instruction': Cpu.INSTRUCTIONS.LSR, 'cycle': 7, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0x5F */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x60 */ {'instruction': Cpu.INSTRUCTIONS.RTS, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x61 */ {'instruction': Cpu.INSTRUCTIONS.ADC, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_X},
  /* 0x62 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x63 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x64 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x65 */ {'instruction': Cpu.INSTRUCTIONS.ADC, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x66 */ {'instruction': Cpu.INSTRUCTIONS.ROR, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x67 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x68 */ {'instruction': Cpu.INSTRUCTIONS.PLA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x69 */ {'instruction': Cpu.INSTRUCTIONS.ADC, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0x6A */ {'instruction': Cpu.INSTRUCTIONS.ROR, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.ACCUMULATOR},
  /* 0x6B */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x6C */ {'instruction': Cpu.INSTRUCTIONS.JMP, 'cycle': 0, 'mode': Cpu.ADDRESSINGS.INDIRECT},
  /* 0x6D */ {'instruction': Cpu.INSTRUCTIONS.ADC, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x6E */ {'instruction': Cpu.INSTRUCTIONS.ROR, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x6F */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x70 */ {'instruction': Cpu.INSTRUCTIONS.BVS, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.RELATIVE},
  /* 0x71 */ {'instruction': Cpu.INSTRUCTIONS.ADC, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_Y},
  /* 0x72 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x73 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x74 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x75 */ {'instruction': Cpu.INSTRUCTIONS.ADC, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0x76 */ {'instruction': Cpu.INSTRUCTIONS.ROR, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0x77 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x78 */ {'instruction': Cpu.INSTRUCTIONS.SEI, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x79 */ {'instruction': Cpu.INSTRUCTIONS.ADC, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_Y},
  /* 0x7A */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x7B */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x7C */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x7D */ {'instruction': Cpu.INSTRUCTIONS.ADC, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0x7E */ {'instruction': Cpu.INSTRUCTIONS.ROR, 'cycle': 7, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0x7F */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x80 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x81 */ {'instruction': Cpu.INSTRUCTIONS.STA, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_X},
  /* 0x82 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x83 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x84 */ {'instruction': Cpu.INSTRUCTIONS.STY, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x85 */ {'instruction': Cpu.INSTRUCTIONS.STA, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x86 */ {'instruction': Cpu.INSTRUCTIONS.STX, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x87 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x88 */ {'instruction': Cpu.INSTRUCTIONS.DEY, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x89 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x8A */ {'instruction': Cpu.INSTRUCTIONS.TXA, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x8B */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x8C */ {'instruction': Cpu.INSTRUCTIONS.STY, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x8D */ {'instruction': Cpu.INSTRUCTIONS.STA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x8E */ {'instruction': Cpu.INSTRUCTIONS.STX, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x8F */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x90 */ {'instruction': Cpu.INSTRUCTIONS.BCC, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.RELATIVE},
  /* 0x91 */ {'instruction': Cpu.INSTRUCTIONS.STA, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_Y},
  /* 0x92 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x93 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x94 */ {'instruction': Cpu.INSTRUCTIONS.STY, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0x95 */ {'instruction': Cpu.INSTRUCTIONS.STA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0x96 */ {'instruction': Cpu.INSTRUCTIONS.STX, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_Y},
  /* 0x97 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x98 */ {'instruction': Cpu.INSTRUCTIONS.TYA, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x99 */ {'instruction': Cpu.INSTRUCTIONS.STA, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_Y},
  /* 0x9A */ {'instruction': Cpu.INSTRUCTIONS.TXS, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x9B */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x9C */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x9D */ {'instruction': Cpu.INSTRUCTIONS.STA, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0x9E */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x9F */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xA0 */ {'instruction': Cpu.INSTRUCTIONS.LDY, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0xA1 */ {'instruction': Cpu.INSTRUCTIONS.LDA, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_X},
  /* 0xA2 */ {'instruction': Cpu.INSTRUCTIONS.LDX, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0xA3 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xA4 */ {'instruction': Cpu.INSTRUCTIONS.LDY, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0xA5 */ {'instruction': Cpu.INSTRUCTIONS.LDA, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0xA6 */ {'instruction': Cpu.INSTRUCTIONS.LDX, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0xA7 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xA8 */ {'instruction': Cpu.INSTRUCTIONS.TAY, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0xA9 */ {'instruction': Cpu.INSTRUCTIONS.LDA, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0xAA */ {'instruction': Cpu.INSTRUCTIONS.TAX, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0xAB */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xAC */ {'instruction': Cpu.INSTRUCTIONS.LDY, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0xAD */ {'instruction': Cpu.INSTRUCTIONS.LDA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0xAE */ {'instruction': Cpu.INSTRUCTIONS.LDX, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0xAF */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xB0 */ {'instruction': Cpu.INSTRUCTIONS.BCS, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.RELATIVE},
  /* 0xB1 */ {'instruction': Cpu.INSTRUCTIONS.LDA, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_Y},
  /* 0xB2 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xB3 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xB4 */ {'instruction': Cpu.INSTRUCTIONS.LDY, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0xB5 */ {'instruction': Cpu.INSTRUCTIONS.LDA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0xB6 */ {'instruction': Cpu.INSTRUCTIONS.LDX, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_Y},
  /* 0xB7 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xB8 */ {'instruction': Cpu.INSTRUCTIONS.CLV, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0xB9 */ {'instruction': Cpu.INSTRUCTIONS.LDA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_Y},
  /* 0xBA */ {'instruction': Cpu.INSTRUCTIONS.TSX, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0xBB */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xBC */ {'instruction': Cpu.INSTRUCTIONS.LDY, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0xBD */ {'instruction': Cpu.INSTRUCTIONS.LDA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0xBE */ {'instruction': Cpu.INSTRUCTIONS.LDX, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_Y},
  /* 0xBF */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xC0 */ {'instruction': Cpu.INSTRUCTIONS.CPY, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0xC1 */ {'instruction': Cpu.INSTRUCTIONS.CMP, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_X},
  /* 0xC2 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xC3 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xC4 */ {'instruction': Cpu.INSTRUCTIONS.CPY, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0xC5 */ {'instruction': Cpu.INSTRUCTIONS.CMP, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0xC6 */ {'instruction': Cpu.INSTRUCTIONS.DEC, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0xC7 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xC8 */ {'instruction': Cpu.INSTRUCTIONS.INY, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0xC9 */ {'instruction': Cpu.INSTRUCTIONS.CMP, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0xCA */ {'instruction': Cpu.INSTRUCTIONS.DEX, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0xCB */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xCC */ {'instruction': Cpu.INSTRUCTIONS.CPY, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0xCD */ {'instruction': Cpu.INSTRUCTIONS.CMP, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0xCE */ {'instruction': Cpu.INSTRUCTIONS.DEC, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0xCF */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xD0 */ {'instruction': Cpu.INSTRUCTIONS.BNE, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.RELATIVE},
  /* 0xD1 */ {'instruction': Cpu.INSTRUCTIONS.CMP, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_Y},
  /* 0xD2 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xD3 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xD4 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xD5 */ {'instruction': Cpu.INSTRUCTIONS.CMP, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0xD6 */ {'instruction': Cpu.INSTRUCTIONS.DEC, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0xD7 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xD8 */ {'instruction': Cpu.INSTRUCTIONS.CLD, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0xD9 */ {'instruction': Cpu.INSTRUCTIONS.CMP, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_Y},
  /* 0xDA */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xDB */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xDC */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xDD */ {'instruction': Cpu.INSTRUCTIONS.CMP, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0xDE */ {'instruction': Cpu.INSTRUCTIONS.DEC, 'cycle': 7, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0xDF */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xE0 */ {'instruction': Cpu.INSTRUCTIONS.CPX, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0xE1 */ {'instruction': Cpu.INSTRUCTIONS.SBC, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_X},
  /* 0xE2 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xE3 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xE4 */ {'instruction': Cpu.INSTRUCTIONS.CPX, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0xE5 */ {'instruction': Cpu.INSTRUCTIONS.SBC, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0xE6 */ {'instruction': Cpu.INSTRUCTIONS.INC, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0xE7 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xE8 */ {'instruction': Cpu.INSTRUCTIONS.INX, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0xE9 */ {'instruction': Cpu.INSTRUCTIONS.SBC, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0xEA */ {'instruction': Cpu.INSTRUCTIONS.NOP, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0xEB */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xEC */ {'instruction': Cpu.INSTRUCTIONS.CPX, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0xED */ {'instruction': Cpu.INSTRUCTIONS.SBC, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0xEE */ {'instruction': Cpu.INSTRUCTIONS.INC, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0xEF */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xF0 */ {'instruction': Cpu.INSTRUCTIONS.BEQ, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.RELATIVE},
  /* 0xF1 */ {'instruction': Cpu.INSTRUCTIONS.SBC, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_Y},
  /* 0xF2 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xF3 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xF4 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xF5 */ {'instruction': Cpu.INSTRUCTIONS.SBC, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0xF6 */ {'instruction': Cpu.INSTRUCTIONS.INC, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0xF7 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xF8 */ {'instruction': Cpu.INSTRUCTIONS.SED, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0xF9 */ {'instruction': Cpu.INSTRUCTIONS.SBC, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_Y},
  /* 0xFA */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xFB */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xFC */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xFD */ {'instruction': Cpu.INSTRUCTIONS.SBC, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0xFE */ {'instruction': Cpu.INSTRUCTIONS.INC, 'cycle': 7, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0xFF */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null}
];

Object.assign(Cpu.prototype, {
  isCpu: true,

  //

  INTERRUPTS: Cpu.INTERRUPTS,
  INTERRUPT_HANDLER_ADDRESSES: Cpu.INTERRUPT_HANDLER_ADDRESSES,
  ADDRESSINGS: Cpu.ADDRESSINGS,
  INSTRUCTIONS: Cpu.INSTRUCTIONS,
  OPS: Cpu.OPS,

  // public methods

  // set methods

  /**
   *
   */
  setPpu: function(ppu) {
    this.ppu = ppu;
  },

  /**
   *
   */
  setApu: function(apu) {
    this.apu = apu;
  },

  /**
   *
   */
  setJoypad1: function(pad1) {
    this.pad1 = pad1;
  },

  /**
   *
   */
  setJoypad2: function(pad2) {
    this.pad2 = pad2;
  },

  /**
   *
   */
  setRom: function(rom) {
    this.rom = rom;
  },

  //

  /**
   * Refer to https://wiki.nesdev.com/w/index.php/CPU_power_up_state
   */
  bootup: function() {
    this.p.store(0x34);
    this.a.clear();
    this.x.clear();
    this.y.clear();
    this.sp.store(0xFD);

    for(var i = 0; i < 0xF; i++)
      this.store(0x4000 + i, 0);

    this.store(0x4015, 0);
    this.store(0x4017, 0);

    this.interrupt(this.INTERRUPTS.RESET);
  },

  /**
   * Refer to https://wiki.nesdev.com/w/index.php/CPU_power_up_state
   */
  reset: function() {
    this.sp.sub(3);
    this.p.setI();
    this.interrupt(this.INTERRUPTS.RESET);
  },

  /**
   *
   */
  runCycle: function() {
    if(this.isStall() !== true) {
      var opc = this.fetch();
      var op = this.decode(opc);

      this.operate(op, opc);
      this.stallCycle = op.cycle;
    }

    this.stallCycle--;
  },

  /**
   *
   */
  isStall: function() {
    return this.stallCycle > 0;
  },

  /**
   *
   */
  interrupt: function(type) {
    if(type === this.INTERRUPTS.IRQ && this.p.isI() === true)
      return;

    if(type !== this.INTERRUPTS.RESET) {
      if(type !== this.INTERRUPTS.BRK)
        this.p.clearB();

      this.p.setA();

      this.pushStack2Bytes(this.pc.load());
      this.pushStack(this.p.load());
      this.p.setI();
    }

    this.jumpToInterruptHandler(type);
  },

  // load/store methods

  /**
   *
   */
  load: function(address) {
    address = address & 0xFFFF;  // just in case

    // 0x0000 - 0x07FF: 2KB internal RAM
    // 0x0800 - 0x1FFF: Mirrors of 0x0000 - 0x07FF (repeats every 0x800 bytes)

    if(address >= 0 && address < 0x2000)
      return this.ram.load(address & 0x07FF);

    // 0x2000 - 0x2007: PPU registers
    // 0x2008 - 0x3FFF: Mirrors of 0x2000 - 0x2007 (repeats every 8 bytes)

    if(address >= 0x2000 && address < 0x4000)
      return this.ppu.loadRegister(address & 0x2007);

    // 0x4000 - 0x4017: APU, PPU and I/O registers
    // 0x4018 - 0x401F: APU and I/O functionality that is normally disabled

    if(address >= 0x4000 && address < 0x4014)
      return this.apu.loadRegister(address);

    if(address === 0x4014)
      return this.ppu.loadRegister(address);

    if(address === 0x4015)
      return this.apu.loadRegister(address);

    if(address === 0x4016)
      return this.pad1.loadRegister();

    if(address >= 0x4017 && address < 0x4020)
      return this.apu.loadRegister(address);

    // cartridge space

    if(address >= 0x4020 && address < 0x6000)
      return this.ram.load(address);

    // 0x6000 - 0x7FFF: Battery Backed Save or Work RAM

    if(address >= 0x6000 && address < 0x8000)
      return this.ram.load(address);

    // 0x8000 - 0xFFFF: ROM
    if(address >= 0x8000 && address < 0x10000)
      return this.rom.load(address);
  },

  /**
   *
   */
  store: function(address, value) {
    address = address & 0xFFFF;  // just in case

    // 0x0000 - 0x07FF: 2KB internal RAM
    // 0x0800 - 0x1FFF: Mirrors of 0x0000 - 0x07FF (repeats every 0x800 bytes)

    if(address >= 0 && address < 0x2000)
      return this.ram.store(address & 0x07FF, value);

    // 0x2000 - 0x2007: PPU registers
    // 0x2008 - 0x3FFF: Mirrors of 0x2000 - 0x2007 (repeats every 8 bytes)

    if(address >= 0x2000 && address < 0x4000)
      return this.ppu.storeRegister(address & 0x2007, value);

    // 0x4000 - 0x4017: APU, PPU and I/O registers
    // 0x4018 - 0x401F: APU and I/O functionality that is normally disabled

    if(address >= 0x4000 && address < 0x4014)
      return this.apu.storeRegister(address, value);

    if(address === 0x4014)
      return this.ppu.storeRegister(address, value);

    if(address === 0x4015)
      return this.apu.storeRegister(address, value);

    if(address === 0x4016)
      return this.pad1.storeRegister(value);

    if(address >= 0x4017 && address < 0x4020)
      return this.apu.storeRegister(address, value);

    // cartridge space

    if(address >= 0x4020 && address < 0x6000)
      return this.ram.store(address, value);

    // 0x6000 - 0x7FFF: Battery Backed Save or Work RAM

    if(address >= 0x6000 && address < 0x8000)
      return this.ram.store(address, value);

    // 0x8000 - 0xFFFF: ROM
    if(address >= 0x8000 && address < 0x10000)
      return this.rom.store(address, value);
  },

  // private methods

  // load/store methods

  /**
   *
   */
  load2Bytes: function(address) {
    return this.load(address) | (this.load(address + 1) << 8);
  },

  /**
   *
   */
  load2BytesFromZeropage: function(address) {
    return this.ram.load(address & 0xff) | (this.ram.load((address + 1) & 0xff) << 8);
  },

  /**
   *
   */
  load2BytesInPage: function(address) {
    var addr1 = address;
    var addr2 = (address & 0xff00) | ((address + 1) & 0xff);
    return this.load(addr1) | (this.load(addr2) << 8);
  },

  /**
   *
   */
  store2Bytes: function(address, value) {
    this.store(address, value);
    this.store(address + 1, value >> 8);
  },

  // processing methods

  /**
   *
   */
  fetch: function() {
    var opc = this.load(this.pc.load());
    this.pc.increment();
    return opc;
  },

  /**
   *
   */
  decode: function(opc) {
    return this.OPS[opc];
  },

  /**
   *
   */
  jumpToInterruptHandler: function(type) {
    this.pc.store(this.load2Bytes(this.INTERRUPT_HANDLER_ADDRESSES[type]));
  },

  //

  /**
   *
   */
  loadWithAddressingMode: function(op) {
    if(op.mode.id === this.ADDRESSINGS.ACCUMULATOR.id)
      return this.a.load();

    var address = this.getAddressWithAddressingMode(op);
    var value = this.load(address);

    // expects that relative addressing mode is used only for load.
    if(op.mode.id === this.ADDRESSINGS.RELATIVE.id) {
      // TODO: confirm if this logic is right.
      if(value & 0x80)
        value = value | 0xff00;
    }

    return value;
  },

  storeWithAddressingMode: function(op, value) {
    if(op.mode.id === this.ADDRESSINGS.ACCUMULATOR.id) {
      this.a.store(value);
      return;
    }

    var address = this.getAddressWithAddressingMode(op);
    this.store(address, value);
  },

  updateMemoryWithAddressingMode: function(op, func) {
    var address;
    var src;

    if(op.mode.id == this.ADDRESSINGS.ACCUMULATOR.id) {
      src = this.a.load();
    } else {
      address = this.getAddressWithAddressingMode(op);
      src = this.load(address);
    }

    var result = func(src);

    if(op.mode.id == this.ADDRESSINGS.ACCUMULATOR.id) {
      this.a.store(result);
    } else {
      this.store(address, result);
    }
  },

  getAddressWithAddressingMode: function(op) {
    var address = null;

    switch(op.mode.id) {
      case this.ADDRESSINGS.IMMEDIATE.id:
      case this.ADDRESSINGS.RELATIVE.id:
        address = this.pc.load();
        this.pc.increment();
        break;

      case this.ADDRESSINGS.ABSOLUTE.id:
      case this.ADDRESSINGS.INDEXED_ABSOLUTE_X.id:
      case this.ADDRESSINGS.INDEXED_ABSOLUTE_Y.id:
        address = this.load2Bytes(this.pc.load());
        this.pc.incrementBy2();
        switch(op.mode.id) {
          case this.ADDRESSINGS.INDEXED_ABSOLUTE_X.id:
            address += this.x.load();
            break;
          case this.ADDRESSINGS.INDEXED_ABSOLUTE_Y.id:
            address += this.y.load();
            break;
        }
        address = address & 0xffff;
        break;

      case this.ADDRESSINGS.ZERO_PAGE.id:
      case this.ADDRESSINGS.INDEXED_ZERO_PAGE_X.id:
      case this.ADDRESSINGS.INDEXED_ZERO_PAGE_Y.id:
        address = this.load(this.pc.load());
        this.pc.increment();
        switch(op.mode.id) {
          case this.ADDRESSINGS.INDEXED_ZERO_PAGE_X.id:
          address += this.x.load();
          break;
          case this.ADDRESSINGS.INDEXED_ZERO_PAGE_Y.id:
          address += this.y.load();
          break;
        }
        address = address & 0xff;
        break;

      case this.ADDRESSINGS.INDIRECT.id:
        var tmp = this.load2Bytes(this.pc.load());
        this.pc.incrementBy2();
        address = this.load2BytesInPage(tmp);
        break;

      case this.ADDRESSINGS.INDEXED_INDIRECT_X.id:
        var tmp = this.load(this.pc.load());
        this.pc.increment();
        tmp += this.x.load();
        tmp = tmp & 0xff;
        address = this.load2BytesFromZeropage(tmp);
        break;

      case this.ADDRESSINGS.INDEXED_INDIRECT_Y.id:
        var tmp = this.load(this.pc.load());
        this.pc.increment();
        address = this.load2BytesFromZeropage(tmp);
        address += this.y.load();
        address = address & 0xffff;
        break;

      default:
        throw new Error('Cpu: Unkown addressing mode.');
        break;
    }
    return address;
  },

  /**
   *
   */
  updateN: function(value) {
    if((value & 0x80) === 0)
      this.p.clearN();
    else
      this.p.setN();
  },

  /**
   *
   */
  updateZ: function(value) {
    if((value & 0xff) === 0)
      this.p.setZ();
    else
      this.p.clearZ();
  },

  /**
   *
   */
  updateC: function(value) {
    if((value & 0x100) === 0)
      this.p.clearC();
    else
      this.p.setC();
  },

  getStackAddress: function() {
    return this.sp.load() + 0x100;
  },

  pushStack: function(value) {
    this.store(this.getStackAddress(), value);
    this.sp.decrement();
  },

  pushStack2Bytes: function(value) {
    this.store(this.getStackAddress(), (value >> 8) & 0xff);
    this.sp.decrement();
    this.store(this.getStackAddress(), value & 0xff);
    this.sp.decrement();
  },

  popStack: function() {
    this.sp.increment();
    return this.load(this.getStackAddress());
  },

  popStack2Bytes: function() {
    this.sp.increment();
    var value = this.load(this.getStackAddress());
    this.sp.increment();
    return (this.load(this.getStackAddress()) << 8) | value;
  },

  doBranch: function(op, flag) {
    var result = this.loadWithAddressingMode(op);
    if(flag)
      this.pc.add(result);
  },

  operate: function(op, opc) {
    switch(op.instruction.id) {
      case this.INSTRUCTIONS.ADC.id:
        var src1 = this.a.load();
        var src2 = this.loadWithAddressingMode(op);
        var c = this.p.isC() ? 1 : 0;
        var result = src1 + src2 + c;
        this.a.store(result);
        this.updateN(result)
        this.updateZ(result)
        this.updateC(result)
        if(!((src1 ^ src2) & 0x80) && ((src2 ^ result) & 0x80))
          this.p.setV();
        else
          this.p.clearV();
        break;

      case this.INSTRUCTIONS.AND.id:
        var src1 = this.a.load();
        var src2 = this.loadWithAddressingMode(op);
        var result = src1 & src2;
        this.a.store(result);
        this.updateN(result);
        this.updateZ(result);
        break;

      case this.INSTRUCTIONS.ASL.id:
        var self = this;
        var func = function(src) {
          var result = src << 1;
          self.updateN(result)
          self.updateZ(result);
          self.updateC(result);
          return result;
        };
        this.updateMemoryWithAddressingMode(op, func);
        break;

      case this.INSTRUCTIONS.BCC.id:
        this.doBranch(op, !this.p.isC());
        break;

      case this.INSTRUCTIONS.BCS.id:
        this.doBranch(op, this.p.isC());
        break;

      case this.INSTRUCTIONS.BEQ.id:
        this.doBranch(op, this.p.isZ());
        break;

      // TODO: check logic.
      case this.INSTRUCTIONS.BIT.id:
        var src1 = this.a.load();
        var src2 = this.loadWithAddressingMode(op);
        var result = src1 & src2;
        this.updateN(src2);
        this.updateZ(result);
        if((src2 & 0x40) == 0)
          this.p.clearV();
        else
          this.p.setV();
        break;

      case this.INSTRUCTIONS.BMI.id:
        this.doBranch(op, this.p.isN());
        break;

      case this.INSTRUCTIONS.BNE.id:
        this.doBranch(op, !this.p.isZ());
        break;

      case this.INSTRUCTIONS.BPL.id:
        this.doBranch(op, !this.p.isN());
        break;

      case this.INSTRUCTIONS.BRK.id:
        this.pc.increment(); // seems like necessary
        this.p.setA();
        this.p.setB();
        this.interrupt(this.INTERRUPTS.BRK);
        break;

      case this.INSTRUCTIONS.BVC.id:
        this.doBranch(op, !this.p.isV());
        break;

      case this.INSTRUCTIONS.BVS.id:
        this.doBranch(op, this.p.isV());
        break;

      case this.INSTRUCTIONS.CLC.id:
        this.p.clearC();
        break;

      case this.INSTRUCTIONS.CLD.id:
        this.p.clearD();
        break;

      case this.INSTRUCTIONS.CLI.id:
        this.p.clearI();
        break;

      case this.INSTRUCTIONS.CLV.id:
        this.p.clearV();
        break;

      // TODO: separate?
      case this.INSTRUCTIONS.CMP.id:
      case this.INSTRUCTIONS.CPX.id:
      case this.INSTRUCTIONS.CPY.id:
        var src1;
        switch(op.instruction.id) {
          case this.INSTRUCTIONS.CMP.id:
            src1 = this.a.load();
            break;
          case this.INSTRUCTIONS.CPX.id:
            src1 = this.x.load();
            break;
          case this.INSTRUCTIONS.CPY.id:
            src1 = this.y.load();
            break;
        }
        var src2 = this.loadWithAddressingMode(op);
        var result = src1 - src2;
        this.updateN(result);
        this.updateZ(result);
        if(src1 >= src2)
          this.p.setC();
        else
          this.p.clearC();
        break;

      case this.INSTRUCTIONS.DEC.id:
        var self = this;
        var func = function(src) {
          var result = src - 1;
          self.updateN(result);
          self.updateZ(result);
          return result;
        };
        this.updateMemoryWithAddressingMode(op, func);
        break;

      case this.INSTRUCTIONS.DEX.id:
      case this.INSTRUCTIONS.DEY.id:
        var reg;
        switch(op.instruction.id) {
          case this.INSTRUCTIONS.DEX.id:
            reg = this.x;
            break;
          case this.INSTRUCTIONS.DEY.id:
            reg = this.y;
            break;
        }
        var src1 = reg.load();
        var result = src1 - 1;
        reg.store(result);
        this.updateN(result);
        this.updateZ(result);
        break;

      case this.INSTRUCTIONS.EOR.id:
        var src1 = this.a.load();
        var src2 = this.loadWithAddressingMode(op);
        var result = src1 ^ src2;
        this.a.store(result);
        this.updateN(result);
        this.updateZ(result);
        break;

      case this.INSTRUCTIONS.INC.id:
        var self = this;
        var func = function(src) {
          var result = src + 1;
          self.updateN(result);
          self.updateZ(result);
          return result;
        };
        this.updateMemoryWithAddressingMode(op, func);
        break;

      case this.INSTRUCTIONS.INX.id:
      case this.INSTRUCTIONS.INY.id:
        var reg;
        switch(op.instruction.id) {
          case this.INSTRUCTIONS.INX.id:
            reg = this.x;
            break;
          case this.INSTRUCTIONS.INY.id:
            reg = this.y;
            break;
        }
        var src1 = reg.load();
        var result = src1 + 1;
        reg.store(result);
        this.updateN(result);
        this.updateZ(result);
        break;

      // TODO: check the logic.
      case this.INSTRUCTIONS.JMP.id:
        var address = this.getAddressWithAddressingMode(op);
        this.pc.store(address);
        break;

      // TODO: check the logic.
      case this.INSTRUCTIONS.JSR.id:
        var address = this.getAddressWithAddressingMode(op);
        this.pc.decrement();
        this.pushStack2Bytes(this.pc.load());
        this.pc.store(address);
        break;

      case this.INSTRUCTIONS.LDA.id:
      case this.INSTRUCTIONS.LDX.id:
      case this.INSTRUCTIONS.LDY.id:
        var result = this.loadWithAddressingMode(op);
        var reg;
        switch(op.instruction.id) {
          case this.INSTRUCTIONS.LDA.id:
            reg = this.a;
            break;
          case this.INSTRUCTIONS.LDX.id:
            reg = this.x;
            break;
          case this.INSTRUCTIONS.LDY.id:
            reg = this.y;
            break;
        }
        reg.store(result);
        this.updateN(result);
        this.updateZ(result);
        break;

      case this.INSTRUCTIONS.LSR.id:
        var self = this;
        var func = function(src) {
          var result = src >> 1;
          self.p.clearN();
          self.updateZ(result);
          if((src & 1) == 0)
            self.p.clearC();
          else
            self.p.setC();
          return result;
        };
        this.updateMemoryWithAddressingMode(op, func);
        break;

      case this.INSTRUCTIONS.NOP.id:
        break;

      case this.INSTRUCTIONS.ORA.id:
        var src1 = this.a.load();
        var src2 = this.loadWithAddressingMode(op);
        var result = src1 | src2;
        this.a.store(result);
        this.updateN(result);
        this.updateZ(result);
        break;

      case this.INSTRUCTIONS.PHA.id:
      case this.INSTRUCTIONS.PHP.id:
        var reg;
        switch(op.instruction.id) {
          case this.INSTRUCTIONS.PHA.id:
            reg = this.a;
            break;
          case this.INSTRUCTIONS.PHP.id:
            this.p.setA();
            this.p.setB();
            reg = this.p;
            break;
        }
        this.pushStack(reg.load());
        break;

      case this.INSTRUCTIONS.PLA.id:
        var result = this.popStack();
        this.a.store(result);
        this.updateN(result);
        this.updateZ(result);
        break;

      case this.INSTRUCTIONS.PLP.id:
        this.p.store(this.popStack());
        break;

      case this.INSTRUCTIONS.ROL.id:
        var self = this;
        var func = function(src) {
          var c = self.p.isC() ? 1 : 0;
          var result = (src << 1) | c;
          self.updateN(result);
          self.updateZ(result);
          self.updateC(result);
          return result;
        };
        this.updateMemoryWithAddressingMode(op, func);
        break;

      case this.INSTRUCTIONS.ROR.id:
        var self = this;
        var func = function(src) {
          var c = self.p.isC() ? 0x80 : 0x00;
          var result = (src >> 1) | c;
          self.updateN(result);
          self.updateZ(result);
          if((src & 1) == 0)
            self.p.clearC();
          else
            self.p.setC();
          return result;
        };
        this.updateMemoryWithAddressingMode(op, func);
        break;

      // TODO: check logic.
      case this.INSTRUCTIONS.RTI.id:
        this.p.store(this.popStack());
        this.pc.store(this.popStack2Bytes());
        break;

      // TODO: check logic.
      case this.INSTRUCTIONS.RTS.id:
        this.pc.store(this.popStack2Bytes() + 1);
        break;

      case this.INSTRUCTIONS.SBC.id:
        var src1 = this.a.load();
        var src2 = this.loadWithAddressingMode(op);
        var c = this.p.isC() ? 0 : 1;
        var result = src1 - src2 - c;
        this.a.store(result);
        this.updateN(result)
        this.updateZ(result)
        // TODO: check if this logic is right.
        if(src1 >= src2 + c) 
          this.p.setC();
        else
          this.p.clearC();
        // TODO: implement right overflow logic.
        //       this is just a temporal logic.
        if(((src1 ^ result) & 0x80) && ((src1 ^ src2) & 0x80))
          this.p.setV();
        else
          this.p.clearV();
        break;

      case this.INSTRUCTIONS.SEC.id:
        this.p.setC();
        break;

      case this.INSTRUCTIONS.SED.id:
        this.p.setD();
        break;

      case this.INSTRUCTIONS.SEI.id:
        this.p.setI();
        break;

      case this.INSTRUCTIONS.STA.id:
      case this.INSTRUCTIONS.STX.id:
      case this.INSTRUCTIONS.STY.id:
        var reg;
        switch(op.instruction.id) {
          case this.INSTRUCTIONS.STA.id:
            reg = this.a;
            break;
          case this.INSTRUCTIONS.STX.id:
            reg = this.x;
            break;
          case this.INSTRUCTIONS.STY.id:
            reg = this.y;
            break;
        }
        this.storeWithAddressingMode(op, reg.load());
        break;

      case this.INSTRUCTIONS.TAX.id:
      case this.INSTRUCTIONS.TAY.id:
      case this.INSTRUCTIONS.TSX.id:
      case this.INSTRUCTIONS.TXA.id:
      case this.INSTRUCTIONS.TXS.id:
      case this.INSTRUCTIONS.TYA.id:
        var srcReg;
        var desReg;
        switch(op.instruction.id) {
          case this.INSTRUCTIONS.TAX.id:
            srcReg = this.a;
            desReg = this.x;
            break;
          case this.INSTRUCTIONS.TAY.id:
            srcReg = this.a;
            desReg = this.y;
            break;
          case this.INSTRUCTIONS.TSX.id:
            srcReg = this.sp;
            desReg = this.x;
            break;
          case this.INSTRUCTIONS.TXA.id:
            srcReg = this.x;
            desReg = this.a;
            break;
          case this.INSTRUCTIONS.TXS.id:
            srcReg = this.x;
            desReg = this.sp;
            break;
          case this.INSTRUCTIONS.TYA.id:
            srcReg = this.y;
            desReg = this.a;
            break;
        }
        var result = srcReg.load();
        desReg.store(result);
        if(op.instruction.id != this.INSTRUCTIONS.TXS.id) {
          this.updateN(result);
          this.updateZ(result);
        }
        break;

      default:
        throw new Error('Cpu.operate: Invalid instruction, pc=' + Utility.convertDecToHexString(this.pc.load() - 1) + ' opc=' + Utility.convertDecToHexString(opc, 2) + ' name=' + op.instruction.name);
        break;
    }
  },

  // disassemble method

  disassembleROM: function() {
    var buffer = '';
    var rom = this.rom;
    var pc = rom.getHeaderSize();
    var previousIsZero = false;
    var skipZero = false;

    // TODO: temporal
    while(pc < 0x4010) {
      var str = '';
      var opc = rom.loadWithoutMapping(pc);
      var op = this.decode(opc);

      if(previousIsZero && opc == 0 && rom.loadWithoutMapping((pc+1)&0xffff) == 0) {
        pc += 1;
        skipZero = true;
        continue;
      }

      if(skipZero)
        buffer += '...\n';
      skipZero = false;

      str += Utility.convertDecToHexString(pc - rom.getHeaderSize(), 4) + ' ';
      str += Utility.convertDecToHexString(opc, 2) + ' ';
      str += op.instruction.name + ' ';
      str += this.dumpMemoryAddressingMode(op,
                                           rom,
                                           (pc + 1) & 0xffff)
             + ' ';

      while(str.length < 30) {
        str += ' ' ;
      }

      if(op.mode) {
        str += op.mode.name;
        pc += op.mode.pc;
      } else {
        pc += 1;
      }

      buffer += str + '\n';
      previousIsZero = opc == 0;
    }
    return buffer;
  },

  // dump methods

  dump: function() {
    var buffer = '';
    var opc = this.load(this.pc.load());
    var op = this.decode(opc);

    buffer += 'p:'  + this.p.dump()  + ' ';
    buffer += 'pc:' + this.pc.dump() + '(' + Utility.convertDecToHexString(opc, 2) + ')' + ' ';
    buffer += 'sp:' + this.sp.dump() + ' ';
    buffer += 'a:'  + this.a.dump()  + ' ';
    buffer += 'x:'  + this.x.dump()  + ' ';
    buffer += 'y:'  + this.y.dump()  + ' ';

    buffer += op.instruction.name + ' ' +
                this.dumpMemoryAddressingMode(op,
                                              this,
                                              (this.pc.load() + 1) & 0xffff)
                + ' ';

    while(buffer.length < 90) {
      buffer += ' ' ;
    }

    buffer += op.mode.name;

    return buffer;
  },

  dumpRAM: function() {
    return this.ram.dump();
  },

  dumpMemoryAddressingMode: function(op, mem, pc) {
    var buffer = '';
    var ramDump = (mem instanceof Cpu) ? true : false;

    switch(op.mode) {
      case this.ADDRESSINGS.IMMEDIATE:
        buffer += '#' + Utility.convertDecToHexString(mem.load(pc, true), 2);
        break;

      case this.ADDRESSINGS.RELATIVE:
        var value = mem.load(pc, true);
        if(value & 0x80) {
          value = -(0x100 - value); // make negative native integer.
        }
        buffer += value.toString(10);
        break;

      case this.ADDRESSINGS.ABSOLUTE:
        var address = mem.load2Bytes(pc, true);
        buffer += Utility.convertDecToHexString(address, 4);
        if(ramDump) {
          buffer += '(' + Utility.convertDecToHexString(mem.load(address, true), 2) + ')';
        }
        break;

      case this.ADDRESSINGS.INDEXED_ABSOLUTE_X:
        var address = mem.load2Bytes(pc, true);
        buffer += Utility.convertDecToHexString(address, 4) + ',X ';
        if(ramDump) {
          address += this.x.load();
          address = address & 0xffff;
          buffer += '(' + Utility.convertDecToHexString(mem.load(address, true), 2) + ')';
        }
        break;

      case this.ADDRESSINGS.INDEXED_ABSOLUTE_Y:
        var address = mem.load2Bytes(pc, true);
        buffer += Utility.convertDecToHexString(address, 4) + ',Y ';
        if(ramDump) {
          address += this.y.load();
          address = address & 0xffff;
          buffer += '(' + Utility.convertDecToHexString(mem.load(address, true), 2) + ')';
        }
        break;

      case this.ADDRESSINGS.ZERO_PAGE:
        var address = mem.load(pc, true);
        buffer += Utility.convertDecToHexString(address, 2);
        if(ramDump) {
          buffer += '(' + Utility.convertDecToHexString(mem.load(address, true), 2) + ')';
        }
        break;

      case this.ADDRESSINGS.INDEXED_ZERO_PAGE_X:
        var address = mem.load(pc, true);
        buffer += Utility.convertDecToHexString(address, 2) + ',X ';
        if(ramDump) {
          address += this.x.load();
          address = address & 0xff;
          buffer += '(' + Utility.convertDecToHexString(mem.load(address, true), 2) + ')';
        }
        break;

      case this.ADDRESSINGS.INDEXED_ZERO_PAGE_Y:
        var address = mem.load(pc, true);
        buffer += Utility.convertDecToHexString(address, 2) + ',Y ';
        if(ramDump) {
          address += this.y.load();
          address = address & 0xff;
          buffer += '(' + Utility.convertDecToHexString(mem.load(address, true), 2) + ')';
        }
        break;

      case this.ADDRESSINGS.INDIRECT:
        var address = mem.load2Bytes(pc, true);
        buffer += Utility.convertDecToHexString(address, 4);
        if(ramDump) {
          var address2 = mem.load2Bytes(address, true);
          buffer += '(';
          buffer += Utility.convertDecToHexString(address2, 4);
          buffer += '(' + Utility.convertDecToHexString(mem.load(address2, true), 2) + ')';
          buffer += ')';
        }
        break;

      case this.ADDRESSINGS.INDEXED_INDIRECT_X:
        var address = mem.load(pc, true);
        buffer += '(' + Utility.convertDecToHexString(address, 2) + ',X) ';
        if(ramDump) {
          address += this.x.load();
          address = address & 0xffff;
          var address2 = mem.load2Bytes(address, true);
          buffer += '(';
          buffer += Utility.convertDecToHexString(address2, 4);
          buffer += '(' + Utility.convertDecToHexString(mem.load(address2, true), 2) + ')';
          buffer += ')';
        }
        break;

      case this.ADDRESSINGS.INDEXED_INDIRECT_Y:
        var address = mem.load(pc, true);
        buffer += '(' + Utility.convertDecToHexString(address, 2) + '),Y ';
        if(ramDump) {
          var address2 = mem.load2BytesFromZeropage(address, true);
          address2 += this.y.load();
          address2 = address2 & 0xffff;
          buffer += '(';
          buffer += Utility.convertDecToHexString(address2, 4);
          buffer += '(' + Utility.convertDecToHexString(mem.load(address2, true), 2) + ')';
          buffer += ')';
        }
        break;

      case this.ADDRESSINGS.ACCUMULATOR:
        if(ramDump) {
          buffer += 'A(' + Utility.convertDecToHexString(this.a.load(), 2) + ')';
        }
        break;

      default:
        throw new Error('Cpu: Unkown addressing mode.');
        break;
    }
    return buffer;
  }
});

/**
 *
 */
function CpuStatusRegister() {
  Register8bit.call(this);
}

CpuStatusRegister.prototype = Object.assign(Object.create(Register8bit.prototype), {
  isCpuStatusRegister: true,

  //

  N_BIT: 7,
  V_BIT: 6,
  A_BIT: 5,  // unused bit. A is random name
  B_BIT: 4,
  D_BIT: 3,
  I_BIT: 2,
  Z_BIT: 1,
  C_BIT: 0,

  //

  isN: function() {
    return this.isBitSet(this.N_BIT);
  },

  setN: function() {
    this.setBit(this.N_BIT);
  },

  clearN: function() {
    this.clearBit(this.N_BIT);
  },

  isV: function() {
    return this.isBitSet(this.V_BIT);
  },

  setV: function() {
    this.setBit(this.V_BIT);
  },

  clearV: function() {
    this.clearBit(this.V_BIT);
  },

  isA: function() {
    return this.IsBitSet(this.A_BIT);
  },

  setA: function() {
    this.setBit(this.A_BIT);
  },

  clearA: function() {
    this.clearBit(this.A_BIT);
  },

  isB: function() {
    return this.isBitSet(this.B_BIT);
  },

  setB: function() {
    this.setBit(this.B_BIT);
  },

  clearB: function() {
    this.clearBit(this.B_BIT);
  },

  isD: function() {
    return this.isBitSet(this.D_BIT);
  },

  setD: function() {
    this.setBit(this.D_BIT);
  },

  clearD: function() {
    this.clearBit(this.D_BIT);
  },

  isI: function() {
    return this.isBitSet(this.I_BIT);
  },

  setI: function() {
    this.setBit(this.I_BIT);
  },

  clearI: function() {
    this.clearBit(this.I_BIT);
  },

  isZ: function() {
    return this.isBitSet(this.Z_BIT);
  },

  setZ: function() {
    this.setBit(this.Z_BIT);
  },

  clearZ: function() {
    this.clearBit(this.Z_BIT);
  },

  isC: function() {
    return this.isBitSet(this.C_BIT);
  },

  setC: function() {
    this.setBit(this.C_BIT);
  },

  clearC: function() {
    this.clearBit(this.C_BIT);
  },

  // dump

  dump: function() {
    var buffer = '';
    buffer += Register8bit.prototype.dump.call(this);
    buffer += '(';
    buffer += this.isN() ? 'N' : '-';
    buffer += this.isV() ? 'V' : '-';
    buffer += this.isB() ? 'B' : '-';
    buffer += this.isD() ? 'D' : '-';
    buffer += this.isI() ? 'I' : '-';
    buffer += this.isZ() ? 'Z' : '-';
    buffer += this.isC() ? 'C' : '-';
    buffer += ')';
    return buffer;
  }
});

export {Cpu};
