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
  this.prgBankNum = rom.header.getPRGROMBanksNum();
  this.chrBankNum = rom.header.getCHRROMBanksNum();
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
  },

  /**
   *
   */
  getMirroringType: function() {
    return this.rom.header.isHorizontalMirroring() === true
             ? this.rom.MIRRORINGS.HORIZONTAL : this.rom.MIRRORINGS.VERTICAL;
  }
});

/**
 *
 */
function NROMMapper(rom) {
  Mapper.call(this, rom);
}

NROMMapper.prototype = Object.assign(Object.create(Mapper.prototype), {
  isNROMMapper: true,

  /**
   *
   */
  map: function(address) {
    // 0x8000 - 0xBFFF: First 16 KB of ROM
    // 0xC000 - 0xFFFF: Last 16 KB of ROM (NROM-256) or
    //                  mirror of 0x8000 - 0xBFFF (NROM-128).

    if(this.prgBankNum === 1 && address >= 0xC000)
      address -= 0x4000;

    return address;
  }
});

/**
 *
 */
function MMC1Mapper(rom) {
  Mapper.call(this, rom);

  this.controlRegister = new Register8bit();  // register 0
  this.chrBank0Register = new Register8bit(); // register 1
  this.chrBank1Register = new Register8bit(); // register 2
  this.prgBankRegister = new Register8bit();  // register 3

  this.latch = new Register8bit();

  this.registerWriteCount = 0;

  this.controlRegister.store(0x0C);  // seems like 0xC would be default value
}

MMC1Mapper.prototype = Object.assign(Object.create(Mapper.prototype), {
  isMMC1Mapper: true,

  /**
   *
   */
  map: function(address) {
    var bank = 0;
    var offset = address & 0x3FFF;
    var bankNum = this.prgBankRegister.load() & 0x0F;

    switch(this.controlRegister.loadBits(2, 2)) {
      case 0:
      case 1:

        // switch 32KB at 0x8000, ignoring low bit of bank number

        // TODO: Fix me

        offset = offset | (address & 0x4000);
        bank = bankNum & 0x0E;
        break;

      case 2:

        // fix first bank at 0x8000 and switch 16KB bank at 0xC000

        bank = (address < 0xC000) ? 0 : bankNum;
        break;

      case 3:

        // fix last bank at 0xC000 and switch 16KB bank at 0x8000

        bank = (address >= 0xC000) ? this.prgBankNum - 1 : bankNum;
        break;
    }

    return bank * 0x4000 + offset + 0x8000;
  },

  /**
   *
   */
  mapForCHRROM: function(address) {
    var bank;
    var offset = address & 0x0FFF;

    if(this.controlRegister.loadBit(4) === 0) {

      // switch 8KB at a time

      bank = (this.chrBank0Register.load() & 0x1E);
      offset = offset | (address & 0x1000);
    } else {

      // switch two separate 4KB banks

      bank = ((address < 0x1000) ? this.chrBank0Register.load() : this.chrBank1Register.load()) & 0x1F;
    }

    return bank * 0x1000 + offset;
  },

  /**
   *
   */
  store: function(address, value) {
    if(value & 0x80) {
      this.registerWriteCount = 0;
      this.latch.clear();

      if((address & 0x6000) === 0)
        this.controlRegister.storeBits(2, 2, 3)
    } else {
      this.latch.store(((value & 1) << 4) | (this.latch.load() >> 1));
      this.registerWriteCount++;

      if(this.registerWriteCount >= 5) {
        var val = this.latch.load();

        switch(address & 0x6000) {
          case 0x0000:
            this.controlRegister.store(val);
            break;

          case 0x2000:
            this.chrBank0Register.store(val);
            break;

          case 0x4000:
            this.chrBank1Register.store(val);
            break;

          case 0x6000:
            this.prgBankRegister.store(val);
            break;
        }

        this.registerWriteCount = 0;
        this.latch.clear();
      }
    }
  },

  /**
   * TODO: Fix me
   */
  getMirroringType: function() {
    switch(this.controlRegister.loadBits(0, 2)) {
      case 0:
      case 1:
        return this.rom.MIRRORINGS.SINGLE_SCREEN;

      case 2:
        return this.rom.MIRRORINGS.VERTICAL;

      case 3:
        return this.rom.MIRRORINGS.HORIZONTAL;
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
    var bank = (address < 0xC000) ? this.reg.load() : this.prgBankNum - 1;
    var offset = address & 0x3FFF;
    return 0x4000 * bank + offset + 0x8000;
  },

  /**
   *
   */
  store: function(address, value) {
    this.reg.store(value & 0xF);
  }
});

/**
 *
 */
function CNROMMapper(rom) {
  Mapper.call(this, rom);
  this.reg = new Register8bit();
}

CNROMMapper.prototype = Object.assign(Object.create(Mapper.prototype), {
  isCNROMMapper: true,

  /**
   *
   */
  mapForCHRROM: function(address) {
    return this.reg.load() * 0x2000 + (address & 0x1FFF);
  },

  /**
   *
   */
  store: function(address, value) {
    this.reg.store(value & 0xF);
  }
});

/**
 *
 */
function MMC3Mapper(rom) {
  Mapper.call(this, rom);
}

MMC3Mapper.prototype = Object.assign(Object.create(Mapper.prototype), {
  isMMC3Mapper: true,

  /**
   *
   */
  map: function(address) {
    // TODO: Fix me

    return address;
  },

  /**
   *
   */
  mapForCHRROM: function(address) {
    // TODO: Fix me

    return address;
  },

  /**
   *
   */
  store: function(address, value) {
    // TODO: Fix me

    address = address & 0xFFFF;  // just in case

    if(address >= 0x8000 && address < 0xA000) {
      if(address & 1 === 0) {

      } else {

      }
    } else if(address >= 0xA000 && address < 0xC000) {
      if(address & 1 === 0) {

      } else {

      }
    } else if(address >= 0xC000 && address < 0xE000) {
      if(address & 1 === 0) {

      } else {

      }
    } else {
      if(address & 1 === 0) {

      } else {

      }
    }
  }
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
        bank = this.prgBankNum - 2;
        break;
      case 0x6000:
        bank = this.prgBankNum - 1;
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
