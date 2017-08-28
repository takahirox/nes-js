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

  _HEADER_SIZE: 16,  // 16bytes

  /**
   *
   */
  _init: function() {

  },

  /**
   *
   */
  _initCHRROM: function(mapper) {
    if(this.hasCHRROM()) {
      var capacity = 16 * 1024 * this.header.getCHRROMBanksNum();
      var offset = this.header.getPRGROMBanksNum() * 0x4000 + this._HEADER_SIZE;
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
    return this.data[this.mapper.map(address) + this._HEADER_SIZE];
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
  isNES: function() {
    return this.header.isNES();
  },

  /**
   *
   */
  hasCHRROM: function() {
    return this.header.getCHRROMBanksNum() > 0;
  },

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
    return this._HEADER_SIZE;
  },

  /**
   *
   */
  _getEndDumpAddress: function() {
    return 0x4000 + this._HEADER_SIZE;
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

  _WORD_SIZE: 1, // 1byte

  _SIGNATURE: 'NES',
  _SIGNATURE_ADDRESS: 0,
  _SIGNATURE_SIZE: 3,

  _MAGIC_NUMBER: 0x1a,
  _MAGIC_NUMBER_ADDRESS: 3,
  _MAGIC_NUMBER_SIZE: 1,

  _PRG_ROM_BANKS_NUM_ADDRESS: 4,
  _PRG_ROM_BANKS_NUM_SIZE: 1,

  _CHR_ROM_BANKS_NUM_ADDRESS: 5,
  _CHR_ROM_BANKS_NUM_SIZE: 1,

  _CONTROL_BYTE1_ADDRESS: 6,
  _CONTROL_BYTE1_SIZE: 1,

  _CONTROL_BYTE2_ADDRESS: 7,
  _CONTROL_BYTE2_SIZE: 1,

  _RAM_BANKS_NUM_ADDRESS: 8,
  _RAM_BANKS_NUM_SIZE: 1,

  _UNUSED_ADDRESS: 9,
  _UNUSED_SIZE: 7,

  _MIRRORING_TYPE_BIT: 0,
  _MIRRORING_TYPE_BITS_MASK: 0x1,
  _MIRRORING_TYPE_HORIZONTAL: 0,
  _MIRRORING_TYPE_VERTICAL: 1,

  _BATTERY_BACKED_RAM_BIT: 1,
  _BATTERY_BACKED_RAM_BITS_MASK: 0x1,

  _512BYTES_TRAINER_BIT: 2,
  _512BYTES_TRAINER_BITS_MASK: 0x1,

  _FOUR_SCREEN_MIRRORING_BIT: 3,
  _FOUR_SCREEN_MIRRORING_BITS_MASK: 0x1,

  _MAPPER_LOWER_BIT: 4,
  _MAPPER_LOWER_BITS_SIZE: 4, // 4bits
  _MAPPER_LOWER_BITS_MASK: 0xf,

  _MAPPER_HIGHER_BIT: 4,
  _MAPPER_HIGHER_BITS_SIZE: 4, // 4bits
  _MAPPER_HIGHER_BITS_MASK: 0xf,

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
    for(var i = 0; i < this._SIGNATURE_SIZE; i++) {
      str += String.fromCharCode(this.load(this._SIGNATURE_ADDRESS+i));
    }
    return str;
  },

  /**
   *
   */
  getMagicNumber: function() {
    return this.load(this._MAGIC_NUMBER_ADDRESS);
  },

  /**
   *
   */
  getPRGROMBanksNum: function() {
    return this.load(this._PRG_ROM_BANKS_NUM_ADDRESS);
  },

  /**
   *
   */
  getCHRROMBanksNum: function() {
    return this.load(this._CHR_ROM_BANKS_NUM_ADDRESS);
  },

  /**
   *
   */
  getControlByte1: function() {
    return this.load(this._CONTROL_BYTE1_ADDRESS);
  },

  /**
   *
   */
  getControlByte2: function() {
    return this.load(this._CONTROL_BYTE2_ADDRESS);
  },

  /**
   *
   */
  getRAMBanksNum: function() {
    return this.load(this._RAM_BANKS_NUM_ADDRESS);
  },

  /**
   *
   */
  getUnusedField: function() {
    var value = 0;
    for(var i = 0; i < this._UNUSED_SIZE; i++) {
      value = (value << 8) | this.load(this._UNUSED_ADDRESS+i);
    }
    return value;
  },

  /**
   *
   */
  _getPartialBits: function(value, bit, mask) {
    return (value >> bit) & mask;
  },

  /**
   *
   */
  getMirroringType: function() {
    return this._getPartialBits(this.getControlByte1(),
                                this._MIRRORING_TYPE_BIT,
                                this._MIRRORING_TYPE_BITS_MASK);
  },

  /**
   *
   */
  getMirroringTypeAsStrings: function() {
    return (this.getMirroringType() == this._MIRRORING_TYPE_HORIZONTAL)
             ? 'horizontal' : 'vertical';
  },

  /**
   *
   */
  getBatteryBackedRAM: function() {
    return this._getPartialBits(this.getControlByte1(),
                                this._BATTERY_BACKED_RAM_BIT,
                                this._BATTERY_BACKED_RAM_BITS_MASK);
  },

  /**
   *
   */
  get512BytesTrainer: function() {
    return this._getPartialBits(this.getControlByte1(),
                                this._512BYTES_TRAINER_BIT,
                                this._512BYTES_TRAINER_BITS_MASK);
  },

  /**
   *
   */
  getFourScreenMirroring: function() {
    return this._getPartialBits(this.getControlByte1(),
                                this._FOUR_SCREEN_MIRRORING_BIT,
                                this._FOUR_SCREEN_MIRRORING_BITS_MASK);
  },

  /**
   *
   */
  getMapperNum: function() {
    var lowerBits = this._getPartialBits(this.getControlByte1(),
                                         this._MAPPER_LOWER_BIT,
                                         this._MAPPER_LOWER_BITS_MASK);
    var higherBits = this._getPartialBits(this.getControlByte2(),
                                          this._MAPPER_HIGHER_BIT,
                                          this._MAPPER_HIGHER_BITS_MASK);
    return (higherBits << this._MAPPER_LOWER_BITS_SIZE) | lowerBits;
  },

  /**
   *
   */
  isNES: function() {
    if(this._SIGNATURE != this.getSignature())
      return false;
    if(this.getMagicNumber() != this._MAGIC_NUMBER)
      return false;
    return true;
  },

  /**
   *
   */
  dump: function() {
    var buffer = '';

    buffer += '0x ';
    for(var i = 0; i < Rom.prototype._HEADER_SIZE; i++) {
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
                __10to16(this.get512BytesTrainer()) + '\n';
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
