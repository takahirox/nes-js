import {Register8bit} from './Register.js';


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

  //

  MAPPERS: {
    0:  {'name': 'NROM',      class: NROMMapper},
    1:  {'name': 'MMC1',      class: MMC1Mapper},
    2:  {'name': 'UNROM',     class: UNROMMapper},
    3:  {'name': 'CNROM',     class: CNROMMapper},
    4:  {'name': 'MMC3',      class: MMC3Mapper},
    76: {'name': 'Mapper76',  class: Mapper76}
  },

  // public methods

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
  },

  // private method

  /**
   *
   */
  getMapperParam: function(number) {
    if(this.MAPPERS[number] === undefined)
      throw new Error('unsupport No.' + number + ' Mapper');

    return this.MAPPERS[number];
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
   * Maps CPU memory address 0x8000 - 0xFFFF to the offset
   * in Program segment of Rom for Program ROM access
   */
  map: function(address) {
    return address - 0x8000;
  },

  /**
   * Maps CPU memory address 0x0000 - 0x1FFF to the offset
   * in Character segment of Rom for Character ROM access
   */
  mapForChrRom: function(address) {
    return address;
  },

  /**
   * In general, updates control registers in Mapper
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

    return address - 0x8000;
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

    return bank * 0x4000 + offset;
  },

  /**
   *
   */
  mapForChrRom: function(address) {
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
    return 0x4000 * bank + offset;
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
  mapForChrRom: function(address) {
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

  this.register0 = new Register8bit();
  this.register1 = new Register8bit();
  this.register2 = new Register8bit();
  this.register3 = new Register8bit();
  this.register4 = new Register8bit();
  this.register5 = new Register8bit();
  this.register6 = new Register8bit();
  this.register7 = new Register8bit();

  this.programRegister0 = new Register8bit();
  this.programRegister1 = new Register8bit();

  this.characterRegister0 = new Register8bit();
  this.characterRegister1 = new Register8bit();
  this.characterRegister2 = new Register8bit();
  this.characterRegister3 = new Register8bit();
  this.characterRegister4 = new Register8bit();
  this.characterRegister5 = new Register8bit();

  this.irqCounter = 0;
  this.irqCounterReload = false;
  this.irqEnabled = true;  // @TODO: check if default is true
}

MMC3Mapper.prototype = Object.assign(Object.create(Mapper.prototype), {
  isMMC3Mapper: true,

  /**
   *
   */
  map: function(address) {
    address = address & 0xFFFF;  // just in case

    var offset = address & 0x1FFF;
    var bank = 0;

    if(address >= 0x8000 && address < 0xA000) {
      bank = this.register0.isBitSet(6) === true ? this.prgBankNum * 2 - 2 : this.programRegister0.load();
    } else if(address >= 0xA000 && address < 0xC000) {
      bank = this.programRegister1.load();
    } else if(address >= 0xC000 && address < 0xE000) {
      bank = this.register0.isBitSet(6) === true ? this.programRegister0.load() : this.prgBankNum * 2 - 2;
    } else {
      bank = this.prgBankNum * 2 - 1;
    }

    return bank * 0x2000 + offset;
  },

  /**
   *
   */
  mapForChrRom: function(address) {
    address = address & 0x1FFF;  // just in case

    var offset = address & 0x03FF;
    var bank = 0;

    if(this.register0.isBitSet(7) === true) {
      if(address >= 0x0000 && address < 0x0400) {
        bank = this.characterRegister2.load();
      } else if(address >= 0x0400 && address < 0x0800) {
        bank = this.characterRegister3.load();
      } else if(address >= 0x0800 && address < 0x0C00) {
        bank = this.characterRegister4.load();
      } else if(address >= 0x0C00 && address < 0x1000) {
        bank = this.characterRegister5.load();
      } else if(address >= 0x1000 && address < 0x1400) {
        bank = this.characterRegister0.load() & 0xFE;
      } else if(address >= 0x1400 && address < 0x1800) {
        bank = this.characterRegister0.load() | 1;
      } else if(address >= 0x1800 && address < 0x1C00) {
        bank = this.characterRegister1.load() & 0xFE;
      } else {
        bank = this.characterRegister1.load() | 1;
      }
    } else {
      if(address >= 0x0000 && address < 0x0400) {
        bank = this.characterRegister0.load() & 0xFE;
      } else if(address >= 0x0400 && address < 0x0800) {
        bank = this.characterRegister0.load() | 1;
      } else if(address >= 0x0800 && address < 0x0C00) {
        bank = this.characterRegister1.load() & 0xFE;
      } else if(address >= 0x0C00 && address < 0x1000) {
        bank = this.characterRegister1.load() | 1;
      } else if(address >= 0x1000 && address < 0x1400) {
        bank = this.characterRegister2.load();
      } else if(address >= 0x1400 && address < 0x1800) {
        bank = this.characterRegister3.load();
      } else if(address >= 0x1800 && address < 0x1C00) {
        bank = this.characterRegister4.load();
      } else {
        bank = this.characterRegister5.load();
      }
    }

    return bank * 0x400 + offset;
  },

  /**
   *
   */
  store: function(address, value) {
    address = address & 0xFFFF;  // just in case

    if(address >= 0x8000 && address < 0xA000) {
      if((address & 1) === 0) {
        this.register0.store(value);
      } else {
        this.register1.store(value);

        switch(this.register0.loadBits(0, 3)) {
          case 0:
            this.characterRegister0.store(value & 0xFE);
            break;

          case 1:
            this.characterRegister1.store(value & 0xFE);
            break;

          case 2:
            this.characterRegister2.store(value);
            break;

          case 3:
            this.characterRegister3.store(value);
            break;

          case 4:
            this.characterRegister4.store(value);
            break;

          case 5:
            this.characterRegister5.store(value);
            break;

          case 6:
            this.programRegister0.store(value & 0x3F);
            break;

          case 7:
            this.programRegister1.store(value & 0x3F);
            break;
        }
      }
    } else if(address >= 0xA000 && address < 0xC000) {
      if((address & 1) === 0) {
        this.register2.store(value);
      } else {
        this.register3.store(value);
      }
    } else if(address >= 0xC000 && address < 0xE000) {
      if((address & 1) === 0) {
        this.register4.store(value);
      } else {
        this.register5.store(value);
      }

      this.irqCounterReload = true;
    } else {
      if((address & 1) === 0) {
        this.register6.store(value);
        this.irqEnabled = false;
      } else {
        this.register7.store(value);
        this.irqEnabled = true;
      }
    }
  },

  /**
   *
   */
  getMirroringType: function() {
    return this.register2.isBitSet(0) === true ? this.rom.MIRRORINGS.HORIZONTAL : this.rom.MIRRORINGS.VERTICAL;
  },

  /**
   *
   */
  driveIrqCounter: function(cpu) {
    if(this.irqCounterReload === true) {
      this.irqCounter = this.register4.load();
      this.irqCounterReload = false;
    } else {
      if(this.irqEnabled === true) {
        if(this.irqCounter > 0) {
          this.irqCounter--;

          if(this.irqCounter === 0) {
            cpu.interrupt(cpu.INTERRUPTS.IRQ);
            this.irqCounterReload = true;
          }
        }
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

    switch(address & 0xE000) {
      case 0x8000:
        bank = this.prgReg0.load();
        break;

      case 0xA000:
        bank = this.prgReg1.load();
        break;

      case 0xC000:
        bank = this.prgBankNum * 2 - 2;
        break;

      case 0xE000:
        bank = this.prgBankNum * 2 - 1;
        break;
    }

    return bank * 0x2000 + offset;
  },

  /**
   *
   */
  mapForChrRom: function(address) {
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
    switch(address & 0xE001) {
      case 0x8000:
        this.addrReg.store(value & 0x7);
        break;

      case 0x8001:
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
        break;
    }
  }
});


export {Mapper, MapperFactory};
