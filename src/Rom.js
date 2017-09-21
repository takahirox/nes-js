import {Memory} from './Memory.js';
import {Mapper, MapperFactory} from './Mapper.js';
import {Utility} from './Utility.js';


/**
 * Expects NES ROM arraybuffer consists of the three segments
 * in the following order.
 *   - Header (16bytes)
 *   - Program ROM data(Program ROM banks num * 0x4000 bytes)
 *   - Character ROM data(Character ROM banks num * 0x2000 bytes)
 */
function Rom(arrayBuffer) {
  Memory.call(this, arrayBuffer);
  this.header = new RomHeader(this);

  if(this.isNes() === false)
    throw new Error('This rom doesn\'t seem iNES format.');

  this.mapper = (new MapperFactory()).create(this.header.getMapperNum(), this);
}

//

Rom.MIRRORINGS = {
  SINGLE_SCREEN: 0,
  HORIZONTAL: 1,
  VERTICAL: 2,
  FOUR_SCREEN: 3
};

//

Rom.prototype = Object.assign(Object.create(Memory.prototype), {
  isRom: true,

  //

  MIRRORINGS: Rom.MIRRORINGS,

  // load/store methods called by CPU.

  /**
   * CPU memory address:
   * 0x0000 - 0x1FFF: Character ROM access
   * 0x8000 - 0xFFFF: Program ROM access
   *
   * To access wide range ROM data with limited CPU memory address space
   * Mapper maps CPU memory address to ROM's.
   * In general writing control registers in Mapper via .store() switches bank.
   */
  load: function(address) {
    var addressInRom = this.getHeaderSize();

    if(address < 0x2000) {

      // Character ROM access

      addressInRom += this.header.getPRGROMBanksNum() * 0x4000;
      addressInRom += this.mapper.mapForChrRom(address);
    } else {

      // Program ROM access

      addressInRom += this.mapper.map(address);
    }

    return this.data[addressInRom];
  },

  /**
   * In general writing with ROM address space updates control registers in Mapper.
   */
  store: function(address, value) {
    this.mapper.store(address, value);
  },

  //

  /**
   *
   */
  isNes: function() {
    return this.header.isNes();
  },

  /**
   *
   */
  getHeaderSize: function() {
    return this.header.getSize();
  },

  /**
   *
   */
  hasChrRom: function() {
    return this.header.hasChrRom();
  },

  /**
   *
   */
  getMirroringType: function() {
    return this.mapper.getMirroringType();
  },

  // dump methods

  /**
   *
   */
  dumpHeader: function() {
    return this.header.dump();
  },

  /**
   *
   */
  _getStartDumpAddress: function() {
    return this.getHeaderSize();
  },

  /**
   *
   */
  _getEndDumpAddress: function() {
    return this.getCapacity();
  }
});

/**
 *
 */
function RomHeader(rom) {
  this.rom = rom;
}

Object.assign(RomHeader.prototype, {
  isRomHeader: true,

  size: 16,  // 16bytes

  //

  VALID_SIGNATURE: 'NES',
  VALID_MAGIC_NUMBER: 0x1a,

  //

  SIGNATURE_ADDRESS: 0,
  SIGNATURE_SIZE: 3,

  MAGIC_NUMBER_ADDRESS: 3,
  MAGIC_NUMBER_SIZE: 1,

  PRG_ROM_BANKS_NUM_ADDRESS: 4,
  PRG_ROM_BANKS_NUM_SIZE: 1,

  CHR_ROM_BANKS_NUM_ADDRESS: 5,
  CHR_ROM_BANKS_NUM_SIZE: 1,

  CONTROL_BYTE1_ADDRESS: 6,
  CONTROL_BYTE1_SIZE: 1,

  CONTROL_BYTE2_ADDRESS: 7,
  CONTROL_BYTE2_SIZE: 1,

  RAM_BANKS_NUM_ADDRESS: 8,
  RAM_BANKS_NUM_SIZE: 1,

  UNUSED_ADDRESS: 9,
  UNUSED_SIZE: 7,

  //

  MIRRORING_TYPE_BIT: 0,
  MIRRORING_TYPE_BITS_WIDTH: 1,
  MIRRORING_TYPE_HORIZONTAL: 0,
  MIRRORING_TYPE_VERTICAL: 1,

  BATTERY_BACKED_RAM_BIT: 1,
  BATTERY_BACKED_RAM_BITS_WIDTH: 1,

  TRAINER_512BYTES_BIT: 2,
  TRAINER_512BYTES_BITS_WIDTH: 1,

  FOUR_SCREEN_MIRRORING_BIT: 3,
  FOUR_SCREEN_MIRRORING_BITS_WIDTH: 1,

  MAPPER_LOWER_BIT: 4,
  MAPPER_LOWER_BITS_WIDTH: 4,

  MAPPER_HIGHER_BIT: 4,
  MAPPER_HIGHER_BITS_WIDTH: 4,

  //

  /**
   *
   */
  getSize: function() {
    return this.size;
  },

  /**
   *
   */
  isNes: function() {
    if(this.getSignature() !== this.VALID_SIGNATURE)
      return false;

    if(this.getMagicNumber() !== this.VALID_MAGIC_NUMBER)
      return false;

    return true;
  },

  //

  /**
   *
   */
  load: function(address) {
    return this.rom.loadWithoutMapping(address);
  },

  /**
   *
   */
  getSignature: function() {
    var str = '';

    for(var i = 0; i < this.SIGNATURE_SIZE; i++)
      str += String.fromCharCode(this.load(this.SIGNATURE_ADDRESS + i));

    return str;
  },

  /**
   *
   */
  getMagicNumber: function() {
    return this.load(this.MAGIC_NUMBER_ADDRESS);
  },

  /**
   *
   */
  getPRGROMBanksNum: function() {
    return this.load(this.PRG_ROM_BANKS_NUM_ADDRESS);
  },

  /**
   *
   */
  getCHRROMBanksNum: function() {
    return this.load(this.CHR_ROM_BANKS_NUM_ADDRESS);
  },

  /**
   *
   */
  hasChrRom: function() {
    return this.getCHRROMBanksNum() > 0;
  },

  /**
   *
   */
  getControlByte1: function() {
    return this.load(this.CONTROL_BYTE1_ADDRESS);
  },

  /**
   *
   */
  getControlByte2: function() {
    return this.load(this.CONTROL_BYTE2_ADDRESS);
  },

  /**
   *
   */
  getRAMBanksNum: function() {
    return this.load(this.RAM_BANKS_NUM_ADDRESS);
  },

  /**
   *
   */
  getUnusedField: function() {
    var value = 0;

    for(var i = 0; i < this.UNUSED_SIZE; i++)
      value = (value << 8) | this.load(this.UNUSED_ADDRESS + i);

    return value;
  },

  //

  /**
   *
   */
  extractBits: function(value, offset, size) {
    return (value >> offset) & ((1 << size) - 1);
  },

  /**
   *
   */
  getMirroringType: function() {
    return this.extractBits(this.getControlByte1(),
             this.MIRRORING_TYPE_BIT, this.MIRRORING_TYPE_BITS_WIDTH);
  },

  /**
   *
   */
  getMirroringTypeAsStrings: function() {
    return (this.getMirroringType() === this.MIRRORING_TYPE_HORIZONTAL)
             ? 'horizontal' : 'vertical';
  },

  /**
   *
   */
  isHorizontalMirroring: function() {
    return this.getMirroringType() === this.MIRRORING_TYPE_HORIZONTAL;
  },

  /**
   *
   */
  getBatteryBackedRAM: function() {
    return this.extractBits(this.getControlByte1(),
             this.BATTERY_BACKED_RAM_BIT, this.BATTERY_BACKED_RAM_BITS_WIDTH);
  },

  /**
   *
   */
  getTrainer512Bytes: function() {
    return this.extractBits(this.getControlByte1(),
             this.TRAINER_512BYTES_BIT, this.TRAINER_512BYTES_BITS_WIDTH);
  },

  /**
   *
   */
  getFourScreenMirroring: function() {
    return this.extractBits(this.getControlByte1(),
             this.FOUR_SCREEN_MIRRORING_BIT, this.FOUR_SCREEN_MIRRORING_BITS_WIDTH);
  },

  /**
   *
   */
  getMapperNum: function() {
    var lowerBits = this.extractBits(this.getControlByte1(),
                      this.MAPPER_LOWER_BIT, this.MAPPER_LOWER_BITS_WIDTH);
    var higherBits = this.extractBits(this.getControlByte2(),
                       this.MAPPER_HIGHER_BIT, this.MAPPER_HIGHER_BITS_WIDTH);
    return (higherBits << this.MAPPER_LOWER_BITS_WIDTH) | lowerBits;
  },

  /**
   *
   */
  dump: function() {
    var buffer = '';

    buffer += '0x ';
    for(var i = 0; i < this.getSize(); i++) {
      buffer += Utility.convertDecToHexString(this.load(i), 2, true) + ' ';
    }
    buffer += '\n\n';

    buffer += 'Signature: ' + this.getSignature() + '\n';
    buffer += 'Magic Number: ' + Utility.convertDecToHexString(this.getMagicNumber(), 2) + '\n';
    buffer += 'PRG-ROM banks num: ' +
                Utility.convertDecToHexString(this.getPRGROMBanksNum(), 2) + '\n';
    buffer += 'CHR-ROM banks num: ' +
                Utility.convertDecToHexString(this.getCHRROMBanksNum(), 2) + '\n';
    buffer += 'Control1: ' + Utility.convertDecToHexString(this.getControlByte1(), 2) + '\n';
    buffer += 'Control2: ' + Utility.convertDecToHexString(this.getControlByte2(), 2) + '\n';
    buffer += 'RAM banks num: ' + Utility.convertDecToHexString(this.getRAMBanksNum(), 2) + '\n';
    buffer += 'Unused field: ' + Utility.convertDecToHexString(this.getUnusedField(), 14) + '\n';
    buffer += '\n';
    buffer += 'In control bytes\n';
    buffer += 'Mirroring type: ' + Utility.convertDecToHexString(this.getMirroringType()) +
                '(' + this.getMirroringTypeAsStrings() + ')\n';
    buffer += 'Battery-backed RAM: ' +
                 Utility.convertDecToHexString(this.getBatteryBackedRAM()) + '\n';
    buffer += '512-byte trainer: ' +
                Utility.convertDecToHexString(this.getTrainer512Bytes()) + '\n';
    buffer += 'Four screen mirroring: ' +
                 Utility.convertDecToHexString(this.getFourScreenMirroring()) + '\n';
    buffer += 'Mapper number: ' + Utility.convertDecToHexString(this.getMapperNum(), 2) +
                '(' + (new MapperFactory()).getName(this.getMapperNum()) + ')';
    return buffer;
  }
});


export {Rom};
