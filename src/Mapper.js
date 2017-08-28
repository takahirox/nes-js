/**
 *
 */

/**
 *
 */
function MapperFactory() {

}

Object.assign(MapperFactory.prototype, {
  isMapperFactory: true,

  MAPPERS: [
    /* 0 */ {'name': 'NROM',  class: NROMMapper},
    /* 1 */ {'name': 'MMC1',  class: MMC1Mapper},
    /* 2 */ {'name': 'UNROM', class: UNROMMapper},
    /* 3 */ {'name': 'CNROM', class: CNROMMapper},
    /* 4 */ {'name': 'MMC3',  class: MMC3Mapper}
  ],

  /**
   *
   */
  getMapperParam: function(number) {
    if(this.MAPPERS[number] === undefined)
      throw new Error('unsupport No.' + number + ' Mapper');

    return this.MAPPERS[number];
  },

  /**
   *
   */
  create: function(number, rom) {
    return new (this.getMapperParam(number)).class(rom);
  },

  /**
   *
   */
  getName: function(number) {
    return this.getMapperParam(number).name;
  }
});

/**
 *
 */
function Mapper(rom) {
  this.rom = rom;
}

Object.assign(Mapper.prototype, {
  isMapper: true,

  /**
   *
   */
  map: function(address) {
    return address;
  },

  /**
   *
   */
  mapForCHRROM: function(address) {
    return address;
  },

  /**
   *
   */
  store: function(address, value) {
  }
});

/**
 *
 */
function NROMMapper(rom) {
  Mapper.call(this, rom);
  this.prgNum = rom.header.getPRGROMBanksNum();
}

NROMMapper.prototype = Object.assign(Object.create(Mapper.prototype), {
  isNROMMapper: true,

  /**
   *
   */
  map: function(address) {
    if(this.prgNum == 1 && address >= 0x4000)
      address -= 0x4000;
    return address;
  }
});

/**
 *
 */
function MMC1Mapper(rom) {
  Mapper.call(this, rom);
  this.tmpReg = new Register8bit();
  this.reg0 = new Register8bit();
  this.reg1 = new Register8bit();
  this.reg2 = new Register8bit();
  this.reg3 = new Register8bit();
  this.tmpWriteCount = 0;
  this.prgNum = this.rom.header.getPRGROMBanksNum();
  this.reg0.store(0x0C);
}

MMC1Mapper.prototype = Object.assign(Object.create(Mapper.prototype), {
  isMMC1Mapper: true,

  /**
   *
   */
  map: function(address) {
    var bank;
    var offset;
    if(this.reg0.loadBit(3)) {
      offset = address & 0x3FFF;
      if(this.reg0.loadBit(2)) {
        bank = (address < 0x4000) ? this.reg3.load() & 0x0f : this.prgNum-1;
      } else {
        bank = (address < 0x4000) ? 0 : this.reg3.load() & 0x0f;
      }
    } else {
      offset = address & 0x7FFF;
      bank = this.reg3.load() & 0x0f;
    }
    return bank * 0x4000 + offset;
  },

  /**
   *
   */
  mapForCHRROM: function(address) {
    var bank;
    var offset;
    if(this.reg0.loadBit(4)) {
      bank = ((address < 0x1000) ? this.reg1.load() : this.reg2.load()) & 0xf;
      offset = address & 0x0FFF;
    } else {
      bank = (this.reg1.load() & 0xf) * 2;
      offset = address & 0x1FFF;
    }
    return bank * 0x1000 + offset;
  },

  /**
   *
   */
  store: function(address, value) {
    if(value & 0x80) {
      this.tmpWriteCount = 0;
      this.tmpReg.store(0);
      switch(address & 0x6000) {
        case 0x0000:
          this.reg0.store(0x0C);
          break;
        case 0x2000:
          this.reg1.store(0x00);
          break;
        case 0x4000:
          this.reg2.store(0x00);
          break;
        case 0x6000:
          this.reg3.store(0x00);
          break;
        default:
          // throw exception?
          break;
      }
    } else {
      this.tmpReg.storeBit(this.tmpWriteCount, value & 1);
      this.tmpWriteCount++;
      if(this.tmpWriteCount >= 5) {
        var val = this.tmpReg.load();
        switch(address & 0x6000) {
          case 0x0000:
            this.reg0.store(val);
            break;
          case 0x2000:
            this.reg1.store(val);
            break;
          case 0x4000:
            this.reg2.store(val);
            break;
          case 0x6000:
            this.reg3.store(val);
            break;
          default:
            // throw exception?
            break;
        }
        this.tmpWriteCount = 0;
        this.tmpReg.store(0);
      }
    }
  }
});

/**
 *
 */
function UNROMMapper(rom) {
  Mapper.call(this, rom);
  this.reg = new Register8bit();
}

UNROMMapper.prototype = Object.assign(Object.create(Mapper.prototype), {
  isUNROMMapper: true,

  /**
   *
   */
  map: function(address) {
    var bank = (address < 0x4000) ? this.reg.load() : 7;
    var offset = address & 0x3fff;
    return 1024 * 16 * bank + offset;
  },

  /**
   *
   */
  store: function(address, value) {
    this.reg.store(value & 0x7);
  }
});

/**
 *
 */
function CNROMMapper(rom) {
  Mapper.call(this, rom);
}

CNROMMapper.prototype = Object.assign(Object.create(Mapper.prototype), {
  isCNROMMapper: true
});

/**
 *
 */
function MMC3Mapper(rom) {
  Mapper.call(this, rom);
}

MMC3Mapper.prototype = Object.assign(Object.create(Mapper.prototype), {
  isMMC3Mapper: true
});

/**
 *
 */
function Mapper76(rom) {
  Mapper.call(this, rom);
  this.addrReg = new Register8bit();
  this.chrReg0 = new Register8bit();
  this.chrReg1 = new Register8bit();
  this.chrReg2 = new Register8bit();
  this.chrReg3 = new Register8bit();
  this.prgReg0 = new Register8bit();
  this.prgReg1 = new Register8bit();
  this.prgNum = this.rom.header.getPRGROMBanksNum();
}

Mapper76.prototype = Object.assign(Object.create(Mapper.prototype), {
  isMapper76: true,

  /**
   *
   */
  map: function(address) {
    var bank;
    var offset = address & 0x1FFF;
    switch(address & 0x6000) {
      case 0x0000:
        bank = this.prgReg0.load();
        break;
      case 0x2000:
        bank = this.prgReg1.load();
        break;
      case 0x4000:
        bank = this.prgNum - 2;
        break;
      case 0x6000:
        bank = this.prgNum - 1;
        break;
    }
    return bank * 0x2000 + offset;
  },

  /**
   *
   */
  mapForCHRROM: function(address) {
    var bank;
    var offset = address & 0x7FF;
    switch(address & 0x1800) {
      case 0x0000:
        bank = this.chrReg0.load();
        break;
      case 0x0800:
        bank = this.chrReg1.load();
        break;
      case 0x1000:
        bank = this.chrReg2.load();
        break;
      case 0x1800:
        bank = this.chrReg3.load();
        break;
    }
    return bank * 0x800 + offset;
  },

  /**
   *
   */
  store: function(address, value) {
    if(address == 1) {
      var reg;
      switch(this.addrReg.load()) {
        case 0:
        case 1:
          return;
        case 2:
          reg = this.chrReg0;
          break;
        case 3:
          reg = this.chrReg1;
          break;
        case 4:
          reg = this.chrReg2;
          break;
        case 5:
          reg = this.chrReg3;
          break;
        case 6:
          reg = this.prgReg0;
          break;
        case 7:
          reg = this.prgReg1;
          break;
      }
      reg.store(value & 0x3F);
    } else {
      this.addrReg.store(value & 7);
    }
  }
});
