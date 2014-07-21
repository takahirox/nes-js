/**
 * Ricoh 6502
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
CPU._ADDRESSING_INDIRECT              = 9;
CPU._ADDRESSING_INDEXED_INDIRECT_X    = 10;
CPU._ADDRESSING_INDEXED_INDIRECT_Y    = 11;
CPU._ADDRESSING_RELATIVE              = 12;

// decodes in advance cuz it's much easier than implementing decoder.
// be careful that some 6502 related documents include some mistakes.
// TODO: validation.
CPU._OP = [];
CPU._OP[0x00] = {'op': CPU._OP_BRK, 'cycle': 7, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x01] = {'op': CPU._OP_ORA, 'cycle': 6, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_X};
CPU._OP[0x02] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x03] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x04] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x05] = {'op': CPU._OP_ORA, 'cycle': 3, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x06] = {'op': CPU._OP_ASL, 'cycle': 5, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x07] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0x08] = {'op': CPU._OP_PHP, 'cycle': 3, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x09] = {'op': CPU._OP_ORA, 'cycle': 2, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x0A] = {'op': CPU._OP_ASL, 'cycle': 2, 'mode': CPU._ADDRESSING_ACCUMULATOR};
CPU._OP[0x0B] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x0C] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x0D] = {'op': CPU._OP_ORA, 'cycle': 4, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x0E] = {'op': CPU._OP_ASL, 'cycle': 6, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x0F] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0x10] = {'op': CPU._OP_BPL, 'cycle': 2, 'mode': CPU._ADDRESSING_RELATIVE};
CPU._OP[0x11] = {'op': CPU._OP_ORA, 'cycle': 5, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_Y};
CPU._OP[0x12] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x13] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x14] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x15] = {'op': CPU._OP_ORA, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0x16] = {'op': CPU._OP_ASL, 'cycle': 6, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0x17] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0x18] = {'op': CPU._OP_CLC, 'cycle': 2, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x19] = {'op': CPU._OP_ORA, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_Y};
CPU._OP[0x1A] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x1B] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x1C] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x1D] = {'op': CPU._OP_ORA, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0x1E] = {'op': CPU._OP_ASL, 'cycle': 7, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0x1F] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0x20] = {'op': CPU._OP_JSR, 'cycle': 0, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x21] = {'op': CPU._OP_AND, 'cycle': 6, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_X};
CPU._OP[0x22] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x23] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x24] = {'op': CPU._OP_BIT, 'cycle': 3, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x25] = {'op': CPU._OP_AND, 'cycle': 3, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x26] = {'op': CPU._OP_ROL, 'cycle': 5, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x27] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0x28] = {'op': CPU._OP_PLP, 'cycle': 4, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x29] = {'op': CPU._OP_AND, 'cycle': 2, 'mode': CPU._ADDRESSING_IMMEDIATE};
CPU._OP[0x2A] = {'op': CPU._OP_ROL, 'cycle': 2, 'mode': CPU._ADDRESSING_ACCUMULATOR};
CPU._OP[0x2B] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x2C] = {'op': CPU._OP_BIT, 'cycle': 4, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x2D] = {'op': CPU._OP_AND, 'cycle': 4, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x2E] = {'op': CPU._OP_ROL, 'cycle': 6, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x2F] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0x30] = {'op': CPU._OP_BMI, 'cycle': 2, 'mode': CPU._ADDRESSING_RELATIVE};
CPU._OP[0x31] = {'op': CPU._OP_AND, 'cycle': 5, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_Y};
CPU._OP[0x32] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x33] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x34] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x35] = {'op': CPU._OP_AND, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0x36] = {'op': CPU._OP_ROL, 'cycle': 6, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0x37] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0x38] = {'op': CPU._OP_SEC, 'cycle': 2, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x39] = {'op': CPU._OP_AND, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_Y};
CPU._OP[0x3A] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x3B] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x3C] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x3D] = {'op': CPU._OP_AND, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0x3E] = {'op': CPU._OP_ROL, 'cycle': 7, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0x3F] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0x40] = {'op': CPU._OP_RTI, 'cycle': 6, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x41] = {'op': CPU._OP_EOR, 'cycle': 6, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_X};
CPU._OP[0x42] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x43] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x44] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x45] = {'op': CPU._OP_EOR, 'cycle': 3, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x46] = {'op': CPU._OP_LSR, 'cycle': 5, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x47] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0x48] = {'op': CPU._OP_PHA, 'cycle': 3, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x49] = {'op': CPU._OP_EOR, 'cycle': 2, 'mode': CPU._ADDRESSING_IMMEDIATE};
CPU._OP[0x4A] = {'op': CPU._OP_LSR, 'cycle': 2, 'mode': CPU._ADDRESSING_ACCUMULATOR};
CPU._OP[0x4B] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x4C] = {'op': CPU._OP_JMP, 'cycle': 0, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x4D] = {'op': CPU._OP_EOR, 'cycle': 4, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x4E] = {'op': CPU._OP_LSR, 'cycle': 6, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x4F] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0x50] = {'op': CPU._OP_BVC, 'cycle': 2, 'mode': CPU._ADDRESSING_RELATIVE};
CPU._OP[0x51] = {'op': CPU._OP_EOR, 'cycle': 5, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_Y};
CPU._OP[0x52] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x53] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x54] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x55] = {'op': CPU._OP_EOR, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0x56] = {'op': CPU._OP_LSR, 'cycle': 6, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0x57] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0x58] = {'op': CPU._OP_CLI, 'cycle': 2, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x59] = {'op': CPU._OP_EOR, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_Y};
CPU._OP[0x5A] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x5B] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x5C] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x5D] = {'op': CPU._OP_EOR, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0x5E] = {'op': CPU._OP_LSR, 'cycle': 7, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0x5F] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0x60] = {'op': CPU._OP_RTS, 'cycle': 6, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x61] = {'op': CPU._OP_ADC, 'cycle': 6, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_X};
CPU._OP[0x62] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x63] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x64] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x65] = {'op': CPU._OP_ADC, 'cycle': 3, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x66] = {'op': CPU._OP_ROR, 'cycle': 5, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x67] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0x68] = {'op': CPU._OP_PLA, 'cycle': 4, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x69] = {'op': CPU._OP_ADC, 'cycle': 2, 'mode': CPU._ADDRESSING_IMMEDIATE};
CPU._OP[0x6A] = {'op': CPU._OP_ROR, 'cycle': 2, 'mode': CPU._ADDRESSING_ACCUMULATOR};
CPU._OP[0x6B] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x6C] = {'op': CPU._OP_JMP, 'cycle': 0, 'mode': CPU._ADDRESSING_INDIRECT};
CPU._OP[0x6D] = {'op': CPU._OP_ADC, 'cycle': 4, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x6E] = {'op': CPU._OP_ROR, 'cycle': 6, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x6F] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0x70] = {'op': CPU._OP_BVS, 'cycle': 2, 'mode': CPU._ADDRESSING_RELATIVE};
CPU._OP[0x71] = {'op': CPU._OP_ADC, 'cycle': 5, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_Y};
CPU._OP[0x72] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x73] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x74] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x75] = {'op': CPU._OP_ADC, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0x76] = {'op': CPU._OP_ROR, 'cycle': 6, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0x77] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0x78] = {'op': CPU._OP_SEI, 'cycle': 2, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x79] = {'op': CPU._OP_ADC, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_Y};
CPU._OP[0x7A] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x7B] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x7C] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x7D] = {'op': CPU._OP_ADC, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0x7E] = {'op': CPU._OP_ROR, 'cycle': 7, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0x7F] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0x80] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x81] = {'op': CPU._OP_STA, 'cycle': 6, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_X};
CPU._OP[0x82] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x83] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x84] = {'op': CPU._OP_STY, 'cycle': 3, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x85] = {'op': CPU._OP_STA, 'cycle': 3, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x86] = {'op': CPU._OP_STX, 'cycle': 3, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0x87] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0x88] = {'op': CPU._OP_DEY, 'cycle': 2, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x89] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x8A] = {'op': CPU._OP_TXA, 'cycle': 2, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x8B] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x8C] = {'op': CPU._OP_STY, 'cycle': 4, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x8D] = {'op': CPU._OP_STA, 'cycle': 4, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x8E] = {'op': CPU._OP_STX, 'cycle': 4, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0x8F] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0x90] = {'op': CPU._OP_BCC, 'cycle': 2, 'mode': CPU._ADDRESSING_RELATIVE};
CPU._OP[0x91] = {'op': CPU._OP_STA, 'cycle': 6, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_Y};
CPU._OP[0x92] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x93] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x94] = {'op': CPU._OP_STY, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0x95] = {'op': CPU._OP_STA, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0x96] = {'op': CPU._OP_STX, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_Y};
CPU._OP[0x97] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0x98] = {'op': CPU._OP_TYA, 'cycle': 2, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x99] = {'op': CPU._OP_STA, 'cycle': 5, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_Y};
CPU._OP[0x9A] = {'op': CPU._OP_TXS, 'cycle': 2, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0x9B] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x9C] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x9D] = {'op': CPU._OP_STA, 'cycle': 5, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0x9E] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0x9F] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0xA0] = {'op': CPU._OP_LDY, 'cycle': 2, 'mode': CPU._ADDRESSING_IMMEDIATE};
CPU._OP[0xA1] = {'op': CPU._OP_LDA, 'cycle': 6, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_X};
CPU._OP[0xA2] = {'op': CPU._OP_LDX, 'cycle': 2, 'mode': CPU._ADDRESSING_IMMEDIATE};
CPU._OP[0xA3] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xA4] = {'op': CPU._OP_LDY, 'cycle': 3, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0xA5] = {'op': CPU._OP_LDA, 'cycle': 3, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0xA6] = {'op': CPU._OP_LDX, 'cycle': 3, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0xA7] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0xA8] = {'op': CPU._OP_TAY, 'cycle': 2, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0xA9] = {'op': CPU._OP_LDA, 'cycle': 2, 'mode': CPU._ADDRESSING_IMMEDIATE};
CPU._OP[0xAA] = {'op': CPU._OP_TAX, 'cycle': 2, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0xAB] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xAC] = {'op': CPU._OP_LDY, 'cycle': 4, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0xAD] = {'op': CPU._OP_LDA, 'cycle': 4, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0xAE] = {'op': CPU._OP_LDX, 'cycle': 4, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0xAF] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0xB0] = {'op': CPU._OP_BCS, 'cycle': 2, 'mode': CPU._ADDRESSING_RELATIVE};
CPU._OP[0xB1] = {'op': CPU._OP_LDA, 'cycle': 5, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_Y};
CPU._OP[0xB2] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xB3] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xB4] = {'op': CPU._OP_LDY, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0xB5] = {'op': CPU._OP_LDA, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0xB6] = {'op': CPU._OP_LDX, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_Y};
CPU._OP[0xB7] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0xB8] = {'op': CPU._OP_CLV, 'cycle': 2, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0xB9] = {'op': CPU._OP_LDA, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_Y};
CPU._OP[0xBA] = {'op': CPU._OP_TSX, 'cycle': 2, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0xBB] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xBC] = {'op': CPU._OP_LDY, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0xBD] = {'op': CPU._OP_LDA, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0xBE] = {'op': CPU._OP_LDX, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_Y};
CPU._OP[0xBF] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0xC0] = {'op': CPU._OP_CPY, 'cycle': 2, 'mode': CPU._ADDRESSING_IMMEDIATE};
CPU._OP[0xC1] = {'op': CPU._OP_CMP, 'cycle': 6, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_X};
CPU._OP[0xC2] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xC3] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xC4] = {'op': CPU._OP_CPY, 'cycle': 3, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0xC5] = {'op': CPU._OP_CMP, 'cycle': 3, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0xC6] = {'op': CPU._OP_DEC, 'cycle': 5, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0xC7] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0xC8] = {'op': CPU._OP_INY, 'cycle': 2, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0xC9] = {'op': CPU._OP_CMP, 'cycle': 2, 'mode': CPU._ADDRESSING_IMMEDIATE};
CPU._OP[0xCA] = {'op': CPU._OP_DEX, 'cycle': 2, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0xCB] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xCC] = {'op': CPU._OP_CPY, 'cycle': 4, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0xCD] = {'op': CPU._OP_CMP, 'cycle': 4, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0xCE] = {'op': CPU._OP_DEC, 'cycle': 6, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0xCF] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0xD0] = {'op': CPU._OP_BNE, 'cycle': 2, 'mode': CPU._ADDRESSING_RELATIVE};
CPU._OP[0xD1] = {'op': CPU._OP_CMP, 'cycle': 5, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_Y};
CPU._OP[0xD2] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xD3] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xD4] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xD5] = {'op': CPU._OP_CMP, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0xD6] = {'op': CPU._OP_DEC, 'cycle': 6, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0xD7] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0xD8] = {'op': CPU._OP_CLD, 'cycle': 2, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0xD9] = {'op': CPU._OP_CMP, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_Y};
CPU._OP[0xDA] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xDB] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xDC] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xDD] = {'op': CPU._OP_CMP, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0xDE] = {'op': CPU._OP_DEC, 'cycle': 7, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0xDF] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0xE0] = {'op': CPU._OP_CPX, 'cycle': 2, 'mode': CPU._ADDRESSING_IMMEDIATE};
CPU._OP[0xE1] = {'op': CPU._OP_SBC, 'cycle': 6, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_X};
CPU._OP[0xE2] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xE3] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xE4] = {'op': CPU._OP_CPX, 'cycle': 3, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0xE5] = {'op': CPU._OP_SBC, 'cycle': 3, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0xE6] = {'op': CPU._OP_INC, 'cycle': 5, 'mode': CPU._ADDRESSING_ZERO_PAGE};
CPU._OP[0xE7] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0xE8] = {'op': CPU._OP_INX, 'cycle': 2, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0xE9] = {'op': CPU._OP_SBC, 'cycle': 2, 'mode': CPU._ADDRESSING_IMMEDIATE};
CPU._OP[0xEA] = {'op': CPU._OP_NOP, 'cycle': 2, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0xEB] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xEC] = {'op': CPU._OP_CPX, 'cycle': 4, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0xED] = {'op': CPU._OP_SBC, 'cycle': 4, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0xEE] = {'op': CPU._OP_INC, 'cycle': 6, 'mode': CPU._ADDRESSING_ABSOLUTE};
CPU._OP[0xEF] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0xF0] = {'op': CPU._OP_BEQ, 'cycle': 2, 'mode': CPU._ADDRESSING_RELATIVE};
CPU._OP[0xF1] = {'op': CPU._OP_SBC, 'cycle': 5, 'mode': CPU._ADDRESSING_INDEXED_INDIRECT_Y};
CPU._OP[0xF2] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xF3] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xF4] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xF5] = {'op': CPU._OP_SBC, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0xF6] = {'op': CPU._OP_INC, 'cycle': 6, 'mode': CPU._ADDRESSING_INDEXED_ZERO_PAGE_X};
CPU._OP[0xF7] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};

CPU._OP[0xF8] = {'op': CPU._OP_SED, 'cycle': 2, 'mode': CPU._ADDRESSING_IMPLIED};
CPU._OP[0xF9] = {'op': CPU._OP_SBC, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_Y};
CPU._OP[0xFA] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xFB] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xFC] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};
CPU._OP[0xFD] = {'op': CPU._OP_SBC, 'cycle': 4, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0xFE] = {'op': CPU._OP_INC, 'cycle': 7, 'mode': CPU._ADDRESSING_INDEXED_ABSOLUTE_X};
CPU._OP[0xFF] = {'op': CPU._OP_INV, 'cycle': 0, 'mode': null};


CPU.prototype._fetch = function() {
  var opc = this.ram.load(this.pc.load());
  this.pc.increment();
  return opc;
};


CPU.prototype._decode = function(opc) {
  return CPU._OP[opc];
};


CPU.prototype.runCycle = function() {
  var opc = this._fetch();
  var op = this._decode(opc);
  this._operate(op);
};


/**
 * TODO: not fixed yet.
 */
CPU.prototype._interrupt = function(vector) {
  this._pushStack2Bytes(this.pc.load());
  this._pushStack(this.p.load());
  this.p.setI();
};


CPU.prototype._loadMemoryWithAddressingMode = function(op) {
  if(op.mode == CPU._ADDRESSING_ACCUMULATOR) {
    return this.a.load();
  }

  var address = this._getMemoryAddressWithAddressingMode(op);
  var value = this.ram.load(address);
  // expects that relative addressing mode is used only for load.
  if(op.mode == CPU._ADDRESSING_RELATIVE) {
    // TODO: confirm if this logic is right.
    if(value & 0x80)
      value = value | 0xff00;
  }
  return value;
};


CPU.prototype._storeMemoryWithAddressingMode = function(op, value) {
  if(op.mode == CPU._ADDRESSING_ACCUMULATOR) {
    this.a.store(value);
    return;
  }

  var address = this._getMemoryAddressWithAddressingMode(op);
  this.ram.store(address, value);
};


CPU.prototype._updateMemoryWithAddressingMode = function(op, func) {
  var address;
  var src;

  if(op.mode == CPU._ADDRESSING_ACCUMULATOR) {
    src = this.a.load();
  } else {
    address = this._getMemoryAddressWithAddressingMode(op);
    src = this.ram.load(address);
  }

  var result = func(src);

  if(op.mode == CPU._ADDRESSING_ACCUMULATOR) {
    this.a.store(result);
  } else {
    this.ram.store(address, result);
  }
};


CPU.prototype._getMemoryAddressWithAdressingMode = function(op) {
  var address = null;
  switch(op.mode) {
    case CPU._ADDRESSING_IMMEDIATE:
    case CPU._ADDRESSING_RELATIVE:
      address = this.pc.load();
      this.pc.increment();
      break;

    case CPU._ADDRESSING_ABSOLUTE:
    case CPU._ADDRESSING_INDEXED_ABSOLUTE_X:
    case CPU._ADDRESSING_INDEXED_ABSOLUTE_Y:
      address = this.ram.load2Bytes(this.pc.load());
      this.pc.incrementBy2();
      switch(op.mode) {
        case CPU._ADDRESSING_INDEXED_ABSOLUTE_X:
          address += this.x.load();
          break;
        case CPU._ADDRESSING_INDEXED_ABSOLUTE_Y:
          address += this.y.load();
          break;
      }
      address = address & 0xffff;
      break;

    case CPU._ADDRESSING_ZERO_PAGE:
    case CPU._ADDRESSING_INDEXED_ZERO_PAGE_X:
    case CPU._ADDRESSING_INDEXED_ZERO_PAGE_Y:
      address = this.ram.load(this.pc.load());
      this.pc.increment();
      switch(op.mode) {
        case CPU._ADDRESSING_INDEXED_ZERO_PAGE_X:
        address += this.x.load();
        break;
        case CPU._ADDRESSING_INDEXED_ZERO_PAGE_Y:
        address += this.y.load();
        break;
      }
      address = address & 0xff;
      break;

    case CPU._ADDRESSING_INDIRECT:
      var tmp = this.ram.load2Bytes(this.pc.load());
      this.pc.incrementBy2();
      address = this.ram.load2Bytes(tmp);
      break;

    case CPU._ADDRESSING_INDEXED_INDIRECT_X:
      var tmp = this.ram.load(this.pc.load());
      this.pc.increment();
      tmp += this.x.load();
      tmp = tmp & 0xff;
      address = this.ram.load2Bytes(tmp);
      break;

    case CPU._ADDRESSING_INDEXED_INDIRECT_Y:
      var tmp = this.ram.load(this.pc.load());
      this.pc.increment();
      address = this.ram.load2Bytes(tmp);
      address += this.y.load();
      address = address & 0xffff;
      break;

    default:
      // TODO: throw Exception?
      break;
  }
  return address;
};


CPU.prototype._updateN = function(value) {
  if((value & 0x80) == 0)
    this.p.clearN();
  else
    this.p.setN();
};


CPU.prototype._updateZ = function(value) {
  if((value & 0xff) == 0)
    this.p.setZ();
  else
    this.p.clearZ();
};


CPU.prototype._updateC = function(value) {
  if((value & 0x100) == 0)
    this.p.clearC();
  else
    this.p.setC();
};


CPU.prototype._getStackAddress = function() {
  return this.sp.load() + 0x100;
};


CPU.prototype._pushStack = function(value) {
  this.ram.store(this._getStackAddress(), value);
  this.sp.decrement();
};


CPU.prototype._pushStack2Bytes = function(value) {
  this.ram.store2Bytes(this._getStackAddress(), value);
  this.sp.decrementBy2();
};


CPU.prototype._popStack = function() {
  this.sp.increment();
  return this.ram.load(this._getStackAddress());
};


CPU.prototype._popStack2Bytes = function() {
  this.sp.incrementBy2();
  return this.ram.load2Bytes(this._getStackAddress());
};


CPU.prototype._doBranch = function(op, flag) {
  var result = this._loadMemoryWithAddressingMode(op);
  if(flag)
    this.pc.store(this.pc.load() + result);
};


/**
 * TODO: make each operation class?
 * TODO: functions for _updateMemoryWithAddressingMode occur memory allocation
 *       and can lead GC which could affect the performance.
 */
CPU.prototype._operate = function(op) {
  switch(op.op) {
    case CPU._OP_ADC:
      var src1 = this.a.load();
      var src2 = this._loadMemoryWithAddressingMode(op);
      var c = this.p.isC() ? 1 : 0;
      var result = src1 + src2 + c;
      this.a.store(result);
      this._updateN(result)
      this._updateZ(result)
      this._updateC(result)
      if((src1 ^ result) & (src2 ^ result) & 0x80) == 0)
        this.p.setV();
      else
        this.p.clearV();
      break;

    case CPU._OP_AND:
      var src1 = this.a.load();
      var src2 = this._loadMemoryWithAddressingMode(op);
      var result = src1 & src2;
      this.a.store(result);
      this._updateN(result);
      this._updateZ(result);
      break;

    case CPU._OP_ASL:
      var self = this;
      var func = function(src) {
        var result = src << 1;
        self._updateN(result)
        self._updateZ(result);
        self._updateC(result);
        return result;
      };
      this._updateMemoryWithAddressingMode(op, func);
      break;

    case CPU._OP_BCC:
      this._doBranch(op, !this.p.isC());
      break;

    case CPU._OP_BCS:
      this._doBranch(op, this.p.isC());
      break;

    case CPU._OP_BEQ:
      this._doBranch(op, this.p.isZ());
      break;

    // TODO: check logic.
    case CPU._OP_BIT:
      var src1 = this.a.load();
      var src2 = this._loadMemoryWithAddressingMode(op);
      var result = src1 & src2;
      this._updateN(src2);
      this._updateZ(result);
      if(src2 & 0x40 == 0)
        this.p.clearV();
      else
        this.p.setV();
      break;

    case CPU._OP_BMI:
      this._doBranch(op, this.p.isN());
      break;

    case CPU._OP_BNE:
      this._doBranch(op, !this.p.isZ());
      break;

    case CPU._OP_BPL:
      this._doBranch(op, !this.p.isN());
      break;

    // TODO: check logic.
    case CPU._OP_BRK:
      this.pc.increment();
      this._pushStack2Bytes(this.pc.load());
      this.p.setB();
      this._pushStack(this.p.load());
      this.p.setI();
      // TODO: remove magic number.
      this.pc.store(this.ram.load2Bytes(0xfffe));
      break;

    case CPU._OP_BVC:
      this._doBranch(op, !this.p.isV());
      break;

    case CPU._OP_BVS:
      this._doBranch(op, this.p.isV());
      break;

    case CPU._OP_CLC:
      this.p.clearC();
      break;

    case CPU._OP_CLD:
      this.p.clearD();
      break;

    case CPU._OP_CLI:
      this.p.clearI();
      break;

    case CPU._OP_CLV:
      this.p.clearV();
      break;

    // TODO: separate?
    case CPU._OP_CMP:
    case CPU._OP_CPX:
    case CPU._OP_CPY:
      var src1;
      switch(op.mode) {
        case CPU._OP_CMP:
          src1 = this.a.load();
          break;
        case CPU._OP_CPX:
          src1 = this.x.load();
          break;
        case CPU._OP_CPY:
          src1 = this.y.load();
          break;
      }
      var src2 = this._loadMemoryWithAddressingMode(op);
      var result = src1 - src2;
      this._updateN(result);
      this._updateZ(result);
      this._updateC(result);
      break;

    case CPU._OP_DEC:
      var self = this;
      var func = function(src) {
        var result = src - 1;
        self._updateN(result);
        self._updateZ(result);
        return result;
      };
      this._updateMemoryWithAddressingMode(op, func);
      break;

    case CPU._OP_DEX:
    case CPU._OP_DEY:
      var reg;
      switch(op.mode) {
        case CPU._OP_DEX:
          reg = this.x;
          break;
        case CPU._OP_DEY:
          reg = this.y;
          break;
      }
      var src1 = reg.load();
      var result = src1 - 1;
      reg.store(result);
      this._updateN(result);
      this._updateZ(result);
      break;

    case CPU._OP_EOR:
      var src1 = this.a.load();
      var src2 = this._loadMemoryWithAddressingMode(op);
      var result = src1 ^ src2;
      this.a.store(result);
      this._updateN(result);
      this._updateZ(result);
      break;

    case CPU._OP_INC:
      var self = this;
      var func = function(src) {
        var result = src + 1;
        self._updateN(result);
        self._updateZ(result);
        return result;
      };
      this._updateMemoryWithAddressingMode(op, func);
      break;
      break;

    case CPU._OP_INX:
    case CPU._OP_INY:
      var reg;
      switch(op.mode) {
        case CPU._OP_INX:
          reg = this.x;
          break;
        case CPU._OP_INY:
          reg = this.y;
          break;
      }
      var src1 = reg.load();
      var result = src1 + 1;
      reg.store(result);
      this._updateN(result);
      this._updateZ(result);
      break;
      break;

    case CPU._OP_JMP:
      break;

    case CPU._OP_JSR:
      break;

    case CPU._OP_LDA:
    case CPU._OP_LDX:
    case CPU._OP_LDY:
      var result = this._loadMemoryWithAddressingMode(op);
      var reg;
      switch(op.op) {
        case CPU._OP_LDA:
          reg = this.a;
          break;
        case CPU._OP_LDX:
          reg = this.x;
          break;
        case CPU._OP_LDY:
          reg = this.y;
          break;
      }
      reg.store(result);
      this._updateN(result);
      this._updateZ(result);
      break;

    case CPU._OP_LSR:
      var self = this;
      var func = function(src) {
        var result = src >> 1;
        self.p.clearN();
        self._updateZ(result);
        if(src & 1 == 0)
          self.p.clearC();
        else
          self.p.setC();
        return result;
      };
      this._updateMemoryWithAddressingMode(op, func);
      break;

    case CPU._OP_NOP:
      break;

    case CPU._OP_ORA:
      var src1 = this.a.load();
      var src2 = this._loadMemoryWithAddressingMode(op);
      var result = src1 | src2;
      this.a.store(result);
      this._updateN(result);
      this._updateZ(result);
      break;

    case CPU._OP_PHA:
    case CPU._OP_PHP:
      var reg;
      switch(op.op) {
        case CPU._OP_PHA:
          reg = this.a;
          break;
        case CPU._OP_PHP:
          reg = this.p;
          break;
      }
      this._pushStack(reg.load());
      break;

    case CPU._OP_PLA:
      var result = this._popStack();
      this.a.store(result);
      this._updateN(result);
      this._updateZ(result);
      break;

    case CPU._OP_PLP:
      this.p.store(this._popStack());
      break;

    case CPU._OP_ROL:
      var self = this;
      var func = function(src) {
        var c = self.p.isC() ? 1 : 0;
        var result = (src << 1) | c;
        self._updateN(result);
        self._updateZ(result);
        self._updateC(result);
        return result;
      };
      this._updateMemoryWithAddressingMode(op, func);
      break;

    case CPU._OP_ROR:
      var self = this;
      var func = function(src) {
        var c = self.p.isC() ? 0x80 : 0x00;
        var result = (src >> 1) | c;
        self._updateN(result);
        self._updateZ(result);
        if(src & 1 == 0)
          self.p.clearC();
        else
          self.p.setC();
        return result;
      };
      this._updateMemoryWithAddressingMode(op, func);
      break;

    // TODO: check logic.
    case CPU._OP_RTI:
      this.p.store(this._popStack());
      this.pc.store(this._popStack2Bytes());
      break;

    // TODO: check logic.
    case CPU._OP_RTS:
      this.pc.store(this._popStack2Bytes());
      this.pc.increment();
      break;

    case CPU._OP_SBC:
      var src1 = this.a.load();
      var src2 = this._loadMemoryWithAddressingMode(op);
      var c = this.p.isC() ? 1 : 0;
      var result = src1 - src2 - c;
      this.a.store(result);
      this._updateN(result)
      this._updateZ(result)
      this._updateC(result)
      // TODO: implement right overflow logic.
      //       this is just a temporal logic.
      if((src1 ^ result) & (src2 ^ result) & 0x80) == 0)
        this.p.setV();
      else
        this.p.clearV();
      break;

    case CPU._OP_SEC:
      this.p.setC();
      break;

    case CPU._OP_SED:
      this.p.setD();
      break;

    case CPU._OP_SEI:
      this.p.setI();
      break;

    case CPU._OP_STA:
    case CPU._OP_STX:
    case CPU._OP_STY:
      var reg;
      switch(op.op) {
        case CPU._OP_STA:
          reg = this.a;
          break;
        case CPU._OP_STX:
          reg = this.x;
          break;
        case CPU._OP_STY:
          reg = this.y;
          break;
      }
      this._storeMemoryWithAddressingMode(reg.load());
      break;

    case CPU._OP_TAX:
    case CPU._OP_TAY:
    case CPU._OP_TSX:
    case CPU._OP_TXA:
    case CPU._OP_TXS:
    case CPU._OP_TYA:
      var srcReg;
      var desReg;
      switch(op.op) {
        case CPU._OP_TAX:
          srcReg = this.a;
          desReg = this.x;
          break;
        case CPU._OP_TAY:
          srcReg = this.a;
          desReg = this.y;
          break;
        case CPU._OP_TSX:
          srcReg = this.sp;
          desReg = this.x;
          break;
        case CPU._OP_TXA:
          srcReg = this.x;
          desReg = this.a;
          break;
        case CPU._OP_TXS:
          srcReg = this.x;
          desReg = this.sp;
          break;
        case CPU._OP_TYA:
          srcReg = this.y;
          desReg = this.a;
          break;
      }
      var result = srcReg.load();
      desReg.store(result);
      this._updateN(result);
      this._updateZ(result);
      break;

    default:
      // throw exception?
      break;
  }
};

