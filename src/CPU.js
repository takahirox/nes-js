/**
 * Richo 6502
 */
function CPU() {
  this.pc = new Register16bit();
  this.sp = new Register();
  this.a = new Register();
  this.x = new Register();
  this.y = new Register();
  this.p = new StatusRegister();
  this.ram = new RAM();
};

CPU._OP_INV = 0; // Invalid
CPU._OP_ADC = 1;
CPU._OP_AND = 2;
CPU._OP_ASL = 3;
CPU._OP_BCC = 4;
CPU._OP_BCS = 5;
CPU._OP_BEQ = 6;
CPU._OP_BIT = 7;
CPU._OP_BMI = 8;
CPU._OP_BNE = 9;
CPU._OP_BPL = 10;
CPU._OP_BRK = 11;
CPU._OP_BVC = 12;
CPU._OP_BVS = 13;
CPU._OP_CLC = 14;
CPU._OP_CLD = 15;
CPU._OP_CLI = 16;
CPU._OP_CLV = 17;
CPU._OP_CMP = 18;
CPU._OP_CPX = 19;
CPU._OP_CPY = 20;
CPU._OP_DEC = 21;
CPU._OP_DEX = 22;
CPU._OP_DEY = 23;
CPU._OP_EOR = 24;
CPU._OP_INC = 25;
CPU._OP_INX = 26;
CPU._OP_INY = 27;
CPU._OP_JMP = 28;
CPU._OP_JSR = 29;
CPU._OP_LDA = 30;
CPU._OP_LDX = 31;
CPU._OP_LDY = 32;
CPU._OP_LSR = 33;
CPU._OP_NOP = 34;
CPU._OP_ORA = 35;
CPU._OP_PHA = 36;
CPU._OP_PHP = 37;
CPU._OP_PLA = 38;
CPU._OP_PLP = 39;
CPU._OP_ROL = 40;
CPU._OP_ROR = 41;
CPU._OP_RTI = 42;
CPU._OP_RTS = 43;
CPU._OP_SBC = 44;
CPU._OP_SEC = 45;
CPU._OP_SED = 46;
CPU._OP_SEI = 47;
CPU._OP_STA = 48;
CPU._OP_STX = 49;
CPU._OP_STY = 50;
CPU._OP_TAX = 51;
CPU._OP_TAY = 52;
CPU._OP_TSX = 53;
CPU._OP_TXA = 54;
CPU._OP_TXS = 55;
CPU._OP_TYA = 56;

// TODO: not fixed yet.
CPU._ADDRESSING_IMMEDIATE             = 0;
CPU._ADDRESSING_ABSOLUTE              = 1;
CPU._ADDRESSING_INDEXED_ABSOLUTE_X    = 2;
CPU._ADDRESSING_INDEXED_ABSOLUTE_Y    = 3;
CPU._ADDRESSING_ZERO_PAGE             = 4;
CPU._ADDRESSING_INDEXED_ZERO_PAGE_X   = 5;
CPU._ADDRESSING_INDEXED_ZERO_PAGE_Y   = 6;
CPU._ADDRESSING_IMPLIED               = 7;
CPU._ADDRESSING_ACCUMULATOR           = 8;
CPU._ADDRESSING_INDEXED               = 9;
CPU._ADDRESSING_INDEXED_INDIRECT_X    = 10;
CPU._ADDRESSING_INDEXED_INDIRECT_Y    = 11;
CPU._ADDRESSING_PRE_INDEXED_INDIRECT  = 12;
CPU._ADDRESSING_POST_INDEXED_INDIRECT = 13;
CPU._ADDRESSING_RELATIVE              = 14;

// decodes in advance cuz it's much easier than implementing decoder.
// be careful that some 6502 related documents include some mistakes.
// TODO: cycle num is necessary?
CPU._OP = [];
CPU._OP[0x00] = {'op': CPU._OP_BRK, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x01] = {'op': CPU._OP_ORA, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_X};
CPU._OP[0x02] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x03] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x04] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x05] = {'op': CPU._OP_ORA, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x06] = {'op': CPU._OP_ASL, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x07] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0x08] = {'op': CPU._OP_PHP, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x09] = {'op': CPU._OP_ORA, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x0A] = {'op': CPU._OP_ASL, 'mode': CPU._ADDRESSING_ACCUMULATOR};
CPU._OP[0x0B] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x0C] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x0D] = {'op': CPU._OP_ORA, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x0E] = {'op': CPU._OP_ASL, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x0F] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0x10] = {'op': CPU._OP_BPL, 'mode': CPU._ADDRESSING_RELATIVE};
CPU._OP[0x11] = {'op': CPU._OP_ORA, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_Y};
CPU._OP[0x12] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x13] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x14] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x15] = {'op': CPU._OP_ORA, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0x16] = {'op': CPU._OP_ASL, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0x17] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0x18] = {'op': CPU._OP_CLC, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x19] = {'op': CPU._OP_ORA, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_Y};
CPU._OP[0x1A] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x1B] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x1C] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x1D] = {'op': CPU._OP_ORA, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0x1E] = {'op': CPU._OP_ASL, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0x1F] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0x20] = {'op': CPU._OP_JSR, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x21] = {'op': CPU._OP_AND, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_X};
CPU._OP[0x22] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x23] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x24] = {'op': CPU._OP_BIT, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x25] = {'op': CPU._OP_AND, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x26] = {'op': CPU._OP_ROL, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x27] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0x28] = {'op': CPU._OP_PLP, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x29] = {'op': CPU._OP_AND, 'mode': CPU._ADDRESSING_IMMEDIATE};
CPU._OP[0x2A] = {'op': CPU._OP_ROL, 'mode': CPU._ADDRESSING_ACCUMULATOR};
CPU._OP[0x2B] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x2C] = {'op': CPU._OP_BIT, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x2D] = {'op': CPU._OP_AND, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x2E] = {'op': CPU._OP_ROL, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x2F] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0x30] = {'op': CPU._OP_BMI, 'mode': CPU._ADDRESSING_RELATIVE};
CPU._OP[0x31] = {'op': CPU._OP_AND, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_Y};
CPU._OP[0x32] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x33] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x34] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x35] = {'op': CPU._OP_AND, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0x36] = {'op': CPU._OP_ROL, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0x37] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0x38] = {'op': CPU._OP_SEC, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x39] = {'op': CPU._OP_AND, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_Y};
CPU._OP[0x3A] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x3B] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x3C] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x3D] = {'op': CPU._OP_AND, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0x3E] = {'op': CPU._OP_ROL, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0x3F] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0x40] = {'op': CPU._OP_RTI, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x41] = {'op': CPU._OP_EOR, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_X};
CPU._OP[0x42] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x43] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x44] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x45] = {'op': CPU._OP_EOR, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x46] = {'op': CPU._OP_LSR, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x47] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0x48] = {'op': CPU._OP_PHA, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x49] = {'op': CPU._OP_EOR, 'mode': CPU._ADDRESSING_IMMEDIATE};
CPU._OP[0x4A] = {'op': CPU._OP_LSR, 'mode': CPU._ADDRESSING_ACCUMULATOR};
CPU._OP[0x4B] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x4C] = {'op': CPU._OP_JMP, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x4D] = {'op': CPU._OP_EOR, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x4E] = {'op': CPU._OP_LSR, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x4F] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0x50] = {'op': CPU._OP_BVC, 'mode': CPU._ADDRESSING_RELATIVE};
CPU._OP[0x51] = {'op': CPU._OP_EOR, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_Y};
CPU._OP[0x52] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x53] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x54] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x55] = {'op': CPU._OP_EOR, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0x56] = {'op': CPU._OP_LSR, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0x57] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0x58] = {'op': CPU._OP_CLI, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x59] = {'op': CPU._OP_EOR, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_Y};
CPU._OP[0x5A] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x5B] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x5C] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x5D] = {'op': CPU._OP_EOR, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0x5E] = {'op': CPU._OP_LSR, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0x5F] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0x60] = {'op': CPU._OP_RTS, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x61] = {'op': CPU._OP_ADC, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_X};
CPU._OP[0x62] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x63] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x64] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x65] = {'op': CPU._OP_ADC, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x66] = {'op': CPU._OP_ROR, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x67] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0x68] = {'op': CPU._OP_PLA, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x69] = {'op': CPU._OP_ADC, 'mode': CPU._ADDRESSING_IMMEDIATE};
CPU._OP[0x6A] = {'op': CPU._OP_ROR, 'mode': CPU._ADDRESSING_ACCUMULATOR};
CPU._OP[0x6B] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x6C] = {'op': CPU._OP_JMP, 'mode': CPU._ADDRESSING_INDIRECT};
CPU._OP[0x6D] = {'op': CPU._OP_ADC, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x6E] = {'op': CPU._OP_ROR, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x6F] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0x70] = {'op': CPU._OP_BVS, 'mode': CPU._ADDRESSING_RELATIVE};
CPU._OP[0x71] = {'op': CPU._OP_ADC, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_Y};
CPU._OP[0x72] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x73] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x74] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x75] = {'op': CPU._OP_ADC, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0x76] = {'op': CPU._OP_ROR, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0x77] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0x78] = {'op': CPU._OP_SEI, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x79] = {'op': CPU._OP_ADC, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_Y};
CPU._OP[0x7A] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x7B] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x7C] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x7D] = {'op': CPU._OP_ADC, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0x7E] = {'op': CPU._OP_ROR, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0x7F] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0x80] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x81] = {'op': CPU._OP_STA, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_X};
CPU._OP[0x82] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x83] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x84] = {'op': CPU._OP_STY, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x85] = {'op': CPU._OP_STA, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x86] = {'op': CPU._OP_STX, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x87] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0x88] = {'op': CPU._OP_DEY, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x89] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x8A] = {'op': CPU._OP_TXA, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x8B] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x8C] = {'op': CPU._OP_STY, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x8D] = {'op': CPU._OP_STA, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x8E] = {'op': CPU._OP_STX, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x8F] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0x90] = {'op': CPU._OP_BCC, 'mode': CPU._ADDRESSING_RELATIVE};
CPU._OP[0x91] = {'op': CPU._OP_STA, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_Y};
CPU._OP[0x92] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x93] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x94] = {'op': CPU._OP_STY, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0x95] = {'op': CPU._OP_STA, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0x96] = {'op': CPU._OP_STX, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_Y};
CPU._OP[0x97] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0x98] = {'op': CPU._OP_TYA, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x99] = {'op': CPU._OP_STA, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_Y};
CPU._OP[0x9A] = {'op': CPU._OP_TXS, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x9B] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x9C] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x9D] = {'op': CPU._OP_STA, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0x9E] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0x9F] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0xA0] = {'op': CPU._OP_LDY, 'mode': CPU._ADDRESSING_IMMEDIATE};
CPU._OP[0xA1] = {'op': CPU._OP_LDA, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_X};
CPU._OP[0xA2] = {'op': CPU._OP_LDX, 'mode': CPU._ADDRESSING_IMMEDIATE};
CPU._OP[0xA3] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xA4] = {'op': CPU._OP_LDY, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0xA5] = {'op': CPU._OP_LDA, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0xA6] = {'op': CPU._OP_LDX, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0xA7] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0xA8] = {'op': CPU._OP_TAY, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0xA9] = {'op': CPU._OP_LDA, 'mode': CPU._ADDRESSING_IMMEDIATE};
CPU._OP[0xAA] = {'op': CPU._OP_TAX, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0xAB] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xAC] = {'op': CPU._OP_LDY, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0xAD] = {'op': CPU._OP_LDA, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0xAE] = {'op': CPU._OP_LDX, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0xAF] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0xB0] = {'op': CPU._OP_BCS, 'mode': CPU._ADDRESSING_RELATIVE};
CPU._OP[0xB1] = {'op': CPU._OP_LDA, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_Y};
CPU._OP[0xB2] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xB3] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xB4] = {'op': CPU._OP_LDY, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0xB5] = {'op': CPU._OP_LDA, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0xB6] = {'op': CPU._OP_LDX, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_Y};
CPU._OP[0xB7] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0xB8] = {'op': CPU._OP_CLV, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0xB9] = {'op': CPU._OP_LDA, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_Y};
CPU._OP[0xBA] = {'op': CPU._OP_TSX, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0xBB] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xBC] = {'op': CPU._OP_LDY, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0xBD] = {'op': CPU._OP_LDA, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0xBE] = {'op': CPU._OP_LDX, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_Y};
CPU._OP[0xBF] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0xC0] = {'op': CPU._OP_CPY, 'mode': CPU._ADDRESSING_IMMEDIATE};
CPU._OP[0xC1] = {'op': CPU._OP_CMP, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_X};
CPU._OP[0xC2] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xC3] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xC4] = {'op': CPU._OP_CPY, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0xC5] = {'op': CPU._OP_CMP, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0xC6] = {'op': CPU._OP_DEC, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0xC7] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0xC8] = {'op': CPU._OP_INY, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0xC9] = {'op': CPU._OP_CMP, 'mode': CPU._ADDRESSING_IMMEDIATE};
CPU._OP[0xCA] = {'op': CPU._OP_DEX, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0xCB] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xCC] = {'op': CPU._OP_CPY, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0xCD] = {'op': CPU._OP_CMP, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0xCE] = {'op': CPU._OP_DEC, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0xCF] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0xD0] = {'op': CPU._OP_BNE, 'mode': CPU._ADDRESSING_RELATIVE};
CPU._OP[0xD1] = {'op': CPU._OP_CMP, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_Y};
CPU._OP[0xD2] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xD3] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xD4] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xD5] = {'op': CPU._OP_CMP, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0xD6] = {'op': CPU._OP_DEC, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0xD7] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0xD8] = {'op': CPU._OP_CLD, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0xD9] = {'op': CPU._OP_CMP, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_Y};
CPU._OP[0xDA] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xDB] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xDC] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xDD] = {'op': CPU._OP_CMP, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0xDE] = {'op': CPU._OP_DEC, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0xDF] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0xE0] = {'op': CPU._OP_CPX, 'mode': CPU._ADDRESSING_IMMEDIATE};
CPU._OP[0xE1] = {'op': CPU._OP_SBC, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_X};
CPU._OP[0xE2] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xE3] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xE4] = {'op': CPU._OP_CPX, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0xE5] = {'op': CPU._OP_SBC, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0xE6] = {'op': CPU._OP_INC, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0xE7] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0xE8] = {'op': CPU._OP_INX, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0xE9] = {'op': CPU._OP_SBC, 'mode': CPU._ADDRESSING_IMMEDIATE};
CPU._OP[0xEA] = {'op': CPU._OP_NOP, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0xEB] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xEC] = {'op': CPU._OP_CPX, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0xED] = {'op': CPU._OP_SBC, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0xEE] = {'op': CPU._OP_INC, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0xEF] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0xF0] = {'op': CPU._OP_BEQ, 'mode': CPU._ADDRESSING_RELATIVE};
CPU._OP[0xF1] = {'op': CPU._OP_SBC, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_Y};
CPU._OP[0xF2] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xF3] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xF4] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xF5] = {'op': CPU._OP_SBC, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0xF6] = {'op': CPU._OP_INC, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0xF7] = {'op': CPU._OP_INV, 'mode': null};

CPU._OP[0xF8] = {'op': CPU._OP_SED, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0xF9] = {'op': CPU._OP_SBC, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_Y};
CPU._OP[0xFA] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xFB] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xFC] = {'op': CPU._OP_INV, 'mode': null};
CPU._OP[0xFD] = {'op': CPU._OP_SBC, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0xFE] = {'op': CPU._OP_INC, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0xFF] = {'op': CPU._OP_INV, 'mode': null};

