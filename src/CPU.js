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
// be careful that 6502 related documents include some mistakes.
// TODO: not fixed yet.
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

