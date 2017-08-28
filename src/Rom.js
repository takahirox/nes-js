/**
 *
 */
function Rom(arrayBuffer) {
  Memory.call(this, arrayBuffer);
  this.header = new RomHeader(this);
  this.chrrom = null;
  this.mapperFactory = new MapperFactory();
  this.mapper = this.mapperFactory.create(this.header.getMapperNum(), this);
  this._initCHRROM(this.mapper);
}

Rom.prototype = Object.assign(Object.create(Memory.prototype), {
  isRom: true,

  /**
   *
   */
  _initCHRROM: function(mapper) {
    if(this.hasCHRROM()) {
      var capacity = 16 * 1024 * this.header.getCHRROMBanksNum();
      var offset = this.header.getPRGROMBanksNum() * 0x4000 + this.getHeaderSize();
      this.chrrom = new CHRROM(capacity, mapper);
      for(var i = 0; i < capacity; i++) {
        var value = this.loadWithoutMapping(i + offset);
        this.chrrom.storeWithoutMapping(i, value);
      }
    }
  },

  /**
   *
   */
  load: function(address) {
    return this.data[this.mapper.map(address) + this.getHeaderSize()];
  },

  /**
   *
   */
  store: function(address, value) {
    this.mapper.store(address, value);
  },

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
  hasCHRROM: function() {
    return this.header.hasCHRROM();
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
    return 0x4000 + this.getHeaderSize();
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
  hasCHRROM: function() {
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
    return (higherBits << this.MAPPER_LOWER_BITS_SIZE) | lowerBits;
  },

  /**
   *
   */
  dump: function() {
    var buffer = '';

    buffer += '0x ';
    for(var i = 0; i < this.getSize(); i++) {
      buffer += __10to16(this.load(i), 2, true) + ' ';
    }
    buffer += '\n\n';

    buffer += 'Signature: ' + this.getSignature() + '\n';
    buffer += 'Magic Number: ' + __10to16(this.getMagicNumber(), 2) + '\n';
    buffer += 'PRG-ROM banks num: ' +
                __10to16(this.getPRGROMBanksNum(), 2) + '\n';
    buffer += 'CHR-ROM banks num: ' +
                __10to16(this.getCHRROMBanksNum(), 2) + '\n';
    buffer += 'Control1: ' + __10to16(this.getControlByte1(), 2) + '\n';
    buffer += 'Control2: ' + __10to16(this.getControlByte2(), 2) + '\n';
    buffer += 'RAM banks num: ' + __10to16(this.getRAMBanksNum(), 2) + '\n';
    buffer += 'Unused field: ' + __10to16(this.getUnusedField(), 14) + '\n';
    buffer += '\n';
    buffer += 'In control bytes\n';
    buffer += 'Mirroring type: ' + __10to16(this.getMirroringType()) +
                '(' + this.getMirroringTypeAsStrings() + ')\n';
    buffer += 'Battery-backed RAM: ' +
                 __10to16(this.getBatteryBackedRAM()) + '\n';
    buffer += '512-byte trainer: ' +
                __10to16(this.getTrainer512Bytes()) + '\n';
    buffer += 'Four screen mirroring: ' +
                 __10to16(this.getFourScreenMirroring()) + '\n';
    buffer += 'Mapper number: ' + __10to16(this.getMapperNum(), 2) +
                '(' + this.rom.mapperFactory.getName(this.getMapperNum()) + ')';
    return buffer;
  }
});

/**
 *
 */
function CHRROM(capacity, mapper) {
  Memory.call(this, capacity);
  this.mapper = mapper;
}

CHRROM.prototype = Object.assign(Object.create(Memory.prototype), {
  isCHRROM: true,

  /**
   *
   */
  load: function(address) {
    return this.data[this.mapper.mapForCHRROM(address)];
  },

  /**
   *
   */
  store: function(address, value) {

  }
});
