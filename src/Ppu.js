/**
 * Ricoh 2C02
 * Refer to https://wiki.nesdev.com/w/index.php/PPU
 */
function Ppu() {
  var self = this;

  //

  this.frame = 0;

  this.scanLine = 0;
  this.cycle = 0;

  // other devices

  this.cpu = null;  // set by .setCpu()
  this.display = null;  // set by .setDisplay();

  // inside memory

  this.vRam = new Memory(64 * 1024);  // 64KB
  this.oamRam = new Memory(256);      // 256B, primary OAM memory
  this.oamRam2 = new Memory(32);      // 32B, secondary OAM memory

  // CPU memory mapped registers

  this.ppuctrl = new PpuControlRegister();  // 0x2000
  this.ppumask = new PpuMaskRegister();     // 0x2001
  this.ppustatus = new PpuStatusRegister(); // 0x2002
  this.oamaddr = new Register8bit();        // 0x2003

  this.oamdata = new Register8bit(          // 0x2004
    undefined,
    function() {
      self.onOamDataRegisterStore();
    }
  );

  this.ppuscroll = new Register8bit(        // 0x2005
    undefined,
    function() {
      self.onPpuScrollRegisterStore();
    }
  );

  this.ppuaddr = new Register8bit(          // 0x2006
    undefined,
    function() {
      self.onPpuAddrRegisterStore();
    }
  );

  this.ppudata = new Register8bit(          // 0x2007
    function() {
      self.onPpuDataRegisterLoad();
    },
    function() {
      self.onPpuDataRegisterStore();
    }
  );

  this.oamdma = new Register8bit(           // 0x4014
    undefined,
    function() {
      self.onOamDmaRegisterStore();
    }
  );

  // shift registers

  this.nameTableRegister = new Register8bit();
  this.attributeTableLowRegister = new Register16bit();
  this.attributeTableHighRegister = new Register16bit();
  this.patternTableLowRegister = new Register16bit();
  this.patternTableHighRegister = new Register16bit();

  // inside latches

  this.nameTableLatch = 0;
  this.attributeTableLowLatch = 0;
  this.attributeTableHighLatch = 0;
  this.patternTableLowLatch = 0;
  this.patternTableHighLatch = 0

  this.vRamAddressHigherByteLatch = 0;

  this.xScrollLatch = 0;
  this.yScrollLatch = 0;

  // sprites

  this.spritesManager = new SpritesManager(this.oamRam);
  this.spritesManager2 = new SpritesManager(this.oamRam2);

  this.spriteBitmapHighRegisters = [];
  this.spriteBitmapLowRegisters = [];
  this.spriteAttributeLatches = [];
  this.spriteXPositionRegisters = [];
  this.spriteActiveCycles = [];

  for(var i = 0; i < 8; i++) {
    this.spriteBitmapHighRegisters[i] = new Register8bit();
    this.spriteBitmapLowRegisters[i] = new Register8bit();
    this.spriteAttributeLatches[i] = 0;
    this.spriteXPositionRegisters[i] = new Register8bit();
    this.spriteActiveCycles[i] = 0;
  }

  // for one scan line

  this.spritePixels = [];
  this.spriteIds = [];

  for(var i = 0; i < 256; i++) {
    this.spritePixels[i] = 0;
    this.spriteIds[i] = -1;
  }

  //

  this.chrrom = null;
  this.hasCHRROM = false;

  this.VRAMAddressCount2 = 0;
}

Object.assign(Ppu.prototype, {
  isPpu: true,

  //

  PALETTES: [
    /* 0x00 */ 0xff757575,
    /* 0x01 */ 0xff8f1b27,
    /* 0x02 */ 0xffab0000,
    /* 0x03 */ 0xff9f0047,
    /* 0x04 */ 0xff77008f,
    /* 0x05 */ 0xff1300ab,
    /* 0x06 */ 0xff0000a7,
    /* 0x07 */ 0xff000b7f,
    /* 0x08 */ 0xff002f43,
    /* 0x09 */ 0xff004700,
    /* 0x0a */ 0xff005100,
    /* 0x0b */ 0xff173f00,
    /* 0x0c */ 0xff5f3f1b,
    /* 0x0d */ 0xff000000,
    /* 0x0e */ 0xff000000,
    /* 0x0f */ 0xff000000,
    /* 0x10 */ 0xffbcbcbc,
    /* 0x11 */ 0xffef7300,
    /* 0x12 */ 0xffef3b23,
    /* 0x13 */ 0xfff30083,
    /* 0x14 */ 0xffbf00bf,
    /* 0x15 */ 0xff5b00e7,
    /* 0x16 */ 0xff002bdb,
    /* 0x17 */ 0xff0f4fcb,
    /* 0x18 */ 0xff00738b,
    /* 0x19 */ 0xff009700,
    /* 0x1a */ 0xff00ab00,
    /* 0x1b */ 0xff3b9300,
    /* 0x1c */ 0xff8b8300,
    /* 0x1d */ 0xff000000,
    /* 0x1e */ 0xff000000,
    /* 0x1f */ 0xff000000,
    /* 0x20 */ 0xffffffff,
    /* 0x21 */ 0xffffbf3f,
    /* 0x22 */ 0xffff975f,
    /* 0x23 */ 0xfffd8ba7,
    /* 0x24 */ 0xffff7bf7,
    /* 0x25 */ 0xffb777ff,
    /* 0x26 */ 0xff6377ff,
    /* 0x27 */ 0xff3b9bff,
    /* 0x28 */ 0xff3fbff3,
    /* 0x29 */ 0xff13d383,
    /* 0x2a */ 0xff4bdf4f,
    /* 0x2b */ 0xff98f858,
    /* 0x2c */ 0xffdbeb00,
    /* 0x2d */ 0xff000000,
    /* 0x2e */ 0xff000000,
    /* 0x2f */ 0xff000000,
    /* 0x30 */ 0xffffffff,
    /* 0x31 */ 0xffffe7ab,
    /* 0x32 */ 0xffffd7c7,
    /* 0x33 */ 0xffffcbd7,
    /* 0x34 */ 0xffffc7ff,
    /* 0x35 */ 0xffdbc7ff,
    /* 0x36 */ 0xffb3bfff,
    /* 0x37 */ 0xffabdbff,
    /* 0x38 */ 0xffa3e7ff,
    /* 0x39 */ 0xffa3ffe3,
    /* 0x3a */ 0xffbff3ab,
    /* 0x3b */ 0xffcfffb3,
    /* 0x3c */ 0xfff3ff9f,
    /* 0x3d */ 0xff000000,
    /* 0x3e */ 0xff000000,
    /* 0x3f */ 0xff000000
  ],

  // public methods

  // set methods

  /**
   *
   */
  setCpu: function(cpu) {
    this.cpu = cpu;
  },

  /**
   *
   */
  setROM: function(rom) {
    if(rom.hasCHRROM()) {
      this.chrrom = rom.chrrom;
      this.hasCHRROM = true;
    }
  },

  /**
   *
   */
  setDisplay: function(display) {
    this.display = display;
  },

  //

  /**
   * Refer to https://wiki.nesdev.com/w/index.php/PPU_power_up_state
   */
  bootup: function() {
    this.ppustatus.store(0x80);
  },

  /**
   *
   */
  reset: function() {

  },

  /**
   *
   */
  runCycle: function() {
    this.renderPixel();
    this.shiftRegisters();
    this.fetch();
    this.evaluateSprites();
    this.updateFlags();
    this.countUpCycle();
  },

  // private methods

  // load/store methods

  /**
   *
   */
  load: function(address) {
    if(address < 0x2000 && this.hasCHRROM) {
      return this.chrrom.load(address);
    }

    var addr = address;

    if(addr >= 0x4000) {
      addr = addr & 0x3FFF;
    }
    if(addr >= 0x3F00 && addr < 0x4000) {
      addr = addr & 0x3F1F;
    }
    if(addr >= 0x2000 && addr < 0x3F00) {
      addr = addr & 0x2FFF;
    }

    return this.vRam.load(addr);
  },

  /**
   *
   */
  store: function(address, value) {
    if(address < 0x2000 && this.hasCHRROM) {
      return this.chrrom.store(address, value);
    }

    var addr = address;

    if(addr >= 0x4000) {
      addr = addr & 0x3FFF;
    }
    if(addr >= 0x3F00 && addr < 0x4000) {
      addr = addr & 0x3F1F;
    }
    if(addr >= 0x2000 && addr < 0x3F00) {
      addr = addr & 0x2FFF;
    }

    return this.vRam.store(addr, value);
  },

  // rendering

  /**
   *
   */
  renderPixel: function() {
    // Note: this comparison order is for performance.
    if(this.cycle >= 257 || this.scanLine >= 240 || this.cycle === 0)
      return;

    var x = this.cycle - 1 ;
    var y = this.scanLine;

    var backgroundVisible = this.ppumask.isBackgroundVisible();
    var spritesVisible = this.ppumask.isSpritesVisible();

    var backgroundPixel = this.getBackgroundPixel();
    var spritePixel = this.spritePixels[x];
    var spriteId = this.spriteIds[x];

    var c = 0xff000000;

    if (backgroundVisible === true && spritesVisible === true)
      c = (spritePixel !== 0) ? spritePixel : backgroundPixel;
    else if (backgroundVisible === true && spritesVisible === false)
      c = backgroundPixel;
    else if (backgroundVisible === false && spritesVisible === true)
      if(spritePixel !== 0)
        c = spritePixel;

    if (spriteId === 0 && spritePixel !== 0 && backgroundPixel !== 0)
      this.ppustatus.setZeroHit();

    this.display.renderPixel(x, y, c);
  },

  /**
   *
   */
  getBackgroundPixel: function() {
    var offset = 15 - (this.xScrollLatch % 8);

    var lsb = (this.patternTableHighRegister.loadBit(offset) << 1) |
                this.patternTableLowRegister.loadBit(offset);
    var msb = (this.attributeTableHighRegister.loadBit(offset) << 1) |
                this.attributeTableLowRegister.loadBit(offset);
    var index = (msb << 2) | lsb;

    if(this.ppumask.isGreyscale() === true)
      index = index & 0x30;

    return this.PALETTES[this.load(0x3F00 + index)];
  },

  //

  /**
   *
   */
  shiftRegisters: function() {
    if(this.scanLine >= 240 && this.scanLine <= 260)
      return;

    if((this.cycle >= 1 && this.cycle <= 256) ||
       (this.cycle >= 329 && this.cycle <= 336)) {
      this.patternTableLowRegister.shift(0);
      this.patternTableHighRegister.shift(0);
      this.attributeTableLowRegister.shift(0);
      this.attributeTableHighRegister.shift(0);
    }
  },

  // fetch

  /**
   *
   */
  fetch: function() {
    if(this.scanLine >= 240 && this.scanLine <= 260)
      return;

    if(this.cycle === 0)
      return;

    if((this.cycle >= 257 && this.cycle <= 320) || this.cycle >= 337)
      return;

    switch((this.cycle - 1) % 8) {
      case 0:
        this.fetchNameTable();
        break;

      case 2:
        this.fetchAttributeTable();
        break;

      case 4:
        this.fetchPatternTableLow();
        break;

      case 6:
        this.fetchPatternTableHigh();
        break;

      default:
        break;
    }

    if(this.cycle % 8 === 1) {
      this.nameTableRegister.store(this.nameTableLatch);
      this.attributeTableLowRegister.storeLowerByte(this.attributeTableLowLatch);
      this.attributeTableHighRegister.storeLowerByte(this.attributeTableHighLatch);
      this.patternTableLowRegister.storeLowerByte(this.patternTableLowLatch);
      this.patternTableHighRegister.storeLowerByte(this.patternTableHighLatch);
    }
  },

  /**
   *
   */
  fetchNameTable: function() {
    var x = this.getFetchedX();
    var y = this.getFetchedY();
    var tileX = x >> 3;
    var tileY = y >> 3;
    var index = (tileY % 30) * 32 + (tileX % 32);
    this.nameTableLatch = this.load(this.getNameTableAddress(x, y) + index);
  },

  /**
   *
   */
  fetchAttributeTable: function() {
    var x = this.getFetchedX();
    var y = this.getFetchedY();
    var ay = (y >= 240) ? y - 240 : y;
    var tileX = x >> 5;
    var tileY = ay >> 5;
    var index = (tileY % 8) * 8 + (tileX % 8);
    var b = this.load(this.getNameTableAddress(x, y) + 0x3C0 + index);

    var topbottom = (ay % 32) >> 4; // (y % 32) > 15 ? 1 : 0; // bottom, top
    var rightleft = (x % 32) >> 4;  // (x % 32) > 15 ? 1 : 0; // right, left
    var position = (topbottom << 1) | rightleft; // bottomright, bottomleft,
                                                 // topright, topleft
    var value = (b >> (position * 2)) & 0x3;
    var h = value >> 1;
    var l = value & 1;

    this.attributeTableHighLatch = h ? 0xff : 0;
    this.attributeTableLowLatch = l ? 0xff : 0;
  },

  /**
   *
   */
  fetchPatternTableLow: function() {
    var y = this.getFetchedY() % 8;
    var index = this.ppuctrl.getBackgroundPatternTableNum() * 0x1000 +
                  this.nameTableRegister.load() * 0x10 + y

    this.patternTableLowLatch = this.load(index);
  },

  /**
   *
   */
  fetchPatternTableHigh: function() {
    var y = this.getFetchedY() % 8;
    var index = this.ppuctrl.getBackgroundPatternTableNum() * 0x1000 +
                  this.nameTableRegister.load() * 0x10 + y

    this.patternTableHighLatch = this.load(index + 0x8);
  },

  /**
   * cycle   1 - 256: two next tile of the same scan line
   * cycle 321 - 336: first two tiles of the next scan line
   */
  getFetchedX: function() {
    var x = ((this.cycle - 1) & ~0x7);
    x += (this.cycle <= 256) ? 16 : -320;
    return x + this.xScrollLatch;
  },

  /**
   * cycle   1 - 256: the same scan line
   * cycle 321 - 336: the next scan line
   */
  getFetchedY: function() {
    var y;
    if(this.cycle <= 256) {
      y = this.scanLine;
    } else {
      if(this.scanLine === 261)
        y = 0;
      else
        y = this.scanLine + 1;
    }
    return y + this.yScrollLatch;
  },

  /**
   *
   */
  getNameTableAddress: function(x, y) {
    switch(this.ppuctrl.getNameTableAddress()) {
      case 0:
        return x < 256 ? 0x2000 : 0x2400;
      case 1:
        return x < 256 ? 0x2400 : 0x2000;
      case 2:
        return x < 256 ? 0x2800 : 0x2C00;
      default:
        return x < 256 ? 0x2C00 : 0x2800;
    }
  },

  //

  /**
   *
   */
  updateFlags: function() {
    if(this.cycle === 1) {
      if(this.scanLine === 241) {
        this.ppustatus.setVBlank();
        this.display.updateScreen();

        if(this.ppuctrl.isVBlank())
          this.cpu.interrupt(this.cpu.INTERRUPTS.NMI);
      } else if(this.scanLine === 261) {
        this.ppustatus.clearVBlank();
        this.ppustatus.clearZeroHit();
        this.ppustatus.clearOverflow();
      }
    }
  },

  /**
   * cycle:    0 - 340
   * scanLine: 0 - 261
   */
  countUpCycle: function() {
    this.cycle++;

    if(this.cycle > 340) {
      this.cycle = 0;
      this.scanLine++;

      if(this.scanLine > 261) {
        this.scanLine = 0;
        this.frame++;
      }
    }
  },

  // register load/store callback

  /**
   *
   */
  onPpuScrollRegisterStore: function() {
    var evenAccess = true;

    return function onPpuScrollRegisterStore() {
      if (evenAccess === true)
        this.xScrollLatch = this.ppuscroll.loadWithoutCallback();
      else
        this.yScrollLatch = this.ppuscroll.loadWithoutCallback();

      evenAccess = ! evenAccess;
    };
  }(),

  /**
   *
   */
  onPpuAddrRegisterStore: function() {
    if(this.VRAMAddressCount2 == 0) {
      this.vRamAddressHigherByteLatch = this.ppuaddr.loadWithoutCallback();
      this.VRAMAddressCount2 = 1;
    } else {
      this.VRAMAddressCount2 = 0;
    }
  },

  /**
   *
   */
  getVRAMAddress: function() {
    return (this.vRamAddressHigherByteLatch << 8) | this.ppuaddr.loadWithoutCallback();
  },

  /**
   *
   */
  incrementVRAMAddress: function() {
    var plus = this.ppuctrl.isIncrementAddressSet() ? 32 : 1;
    var addr = this.getVRAMAddress() + plus;
    this.vRamAddressHigherByteLatch = (addr >> 8) & 0xff;
    this.ppuaddr.storeWithoutCallback(addr & 0xff);
  },

  /**
   *
   */
  onPpuDataRegisterLoad: function() {
    this.ppudata.storeWithoutCallback(this.load(this.getVRAMAddress()));
    this.VRAMAddressCount2 = 0;
    this.incrementVRAMAddress();
  },

  /**
   *
   */
  onPpuDataRegisterStore: function() {
    this.store(this.getVRAMAddress(), this.ppudata.loadWithoutCallback());
    this.VRAMAddressCount2 = 0;
    this.incrementVRAMAddress();
  },

  /**
   *
   */
  onOamDataRegisterStore: function() {
    var addr = this.oamaddr.loadWithoutCallback();
    var value = this.oamdata.loadWithoutCallback();
    this.oamRam.store(addr, value);
  },

  /**
   *
   */
  onOamDmaRegisterStore: function() {
    var ram = this.cpu.ram;
    var addr = this.oamdma.loadWithoutCallback() * 0x100;
    for(var i = 0; i < 256; i++) {
      this.oamRam.store(i, ram.load(addr + i));
    }
  },

  // sprites

  /**
   * Refer to https://wiki.nesdev.com/w/index.php/PPU_sprite_evaluation
   */
  evaluateSprites: function() {
    if(this.scanLine >= 240)
      return;

    if(this.cycle === 0) {
      this.processSpritePixels();

      for(var i = 0, il = this.oamRam2.getCapacity(); i < il; i++)
        this.oamRam2.store(i, 0xFF);
    } else if(this.cycle === 65) {
      var height = this.ppuctrl.isSpriteSize16() ? 16 : 8;
      var n = 0;

      for(var i = 0, il = this.spritesManager.getNum(); i < il; i++) {
        var s = this.spritesManager.get(i);

        if(s.on(this.scanLine, height) === true) {
          if(n < 8) {
            this.spritesManager2.copy(n++, s);
          } else {
            this.ppustatus.setOverflow();
            break;
          }
        }
      }
    }
  },

  /**
   *
   */
  processSpritePixels: function() {
    var ay = this.scanLine - 1;

    for(var i = 0, il = this.spritePixels.length; i < il; i++) {
      this.spritePixels[i] = 0;
      this.spriteIds[i] = -1;
    }

    var height = this.ppuctrl.isSpriteSize16() ? 16 : 8;
    var n = 0;

    for(var i = 0, il = this.spritesManager2.getNum(); i < il; i++) {
      var s = this.spritesManager2.get(i);

      if (s.isEmpty())
        break;

      var bx = s.getXPosition();
      var by = s.getYPosition();
      var j = ay - by;
      var cy = s.doFlipVertically() ? height - j - 1 : j;
      var horizontal = s.doFlipHorizontally();
      var ptIndex = (height === 8) ? s.getTileIndex() : s.getTileIndexForSize16();
      var msb = s.getPalletNum();

      for(var k = 0; k < 8; k++) {
        var cx = horizontal ? 7 - k : k;
        var x = bx + k;

        if(x >= 256)
          break;

        var lsb = this.getPatternTableElement(ptIndex, cx, cy, height);

        if(lsb !== 0) {
          var pIndex = (msb << 2) | lsb;

          if(this.spritePixels[x] === 0) {
            this.spritePixels[x] = this.PALETTES[this.load(0x3F10 + pIndex)];
            this.spriteIds[x] = s.getId();
          }
        }
      }
    }
  },

  /**
   *
   */
  getPatternTableElement: function(index, x, y, ySize) {
    var ax = x % 8;
    var a, b;

    if(ySize === 8) {
      var ay = y % 8;
      var offset = this.ppuctrl.getSpritesPatternTableNum() === 1 ? 0x1000 : 0;
      a = this.load(offset + index * 0x10 + ay);
      b = this.load(offset + index * 0x10 + 0x8 + ay);
    } else {
      var ay = y % 8;
      ay += (y >> 3) * 0x10;
      a = this.load(index + ay);
      b = this.load(index + ay + 0x8);
    }

    return ((a >> (7 - ax)) & 1) | (((b >> (7 - ax)) & 1) << 1);
  },

  // dump methods

  /**
   *
   */
  dump: function() {
    var buffer = '';

    buffer += 'PPU Ctrl: ' + this.ppuctrl.dump() + '\n';
    buffer += 'PPU Mask: ' + this.ppumask.dump() + '\n';
    buffer += 'PPU Status: ' + this.ppustatus.dump() + '\n';
    buffer += 'OAM Address: ' + this.oamaddr.dump() + '\n';
    buffer += 'OAM Data: ' + this.oamdata.dump() + '\n';
    buffer += 'PPU Scroll: ' + this.ppuscroll.dump() + '\n';
    buffer += 'PPU Addr: ' + this.ppuaddr.dump() + '\n';
    buffer += 'PPU Data: ' + this.ppudata.dump() + '\n';
    buffer += 'OAM DMA: ' + this.oamdma.dump() + '\n';
    buffer += '\n';

    return buffer;
  },

  /**
   *
   */
  dumpVRAM: function() {
    var buffer = '';
    var previousIsZeroLine = false;
    var offset = 0;
    var end = 0x10000;

    for(var i = offset; i < end; i++) {
      if(i % 0x10 == 0) {
        if(previousIsZeroLine) {
          var skipZero = false;
          while(this._checkNext16BytesIsZero(i+0x10)) {
            i += 0x10;
            skipZero = true;
          }
          if(skipZero)
            buffer += '...\n';
        }
        buffer += __10to16(i-offset, 4) + ' ';
        previousIsZeroLine = true;
      }

      var value = this.load(i);
      buffer += __10to16(value, 2, true) + ' ';
      if(value != 0)
        previousIsZeroLine = false;

      if(i % 0x10 == 0xf)
        buffer += '\n';
    }
    return buffer;
  },

  /**
   *
   */
  _checkNext16BytesIsZero: function(offset) {
    if(offset + 0x10 >= 0x10000)
      return false;

    var sum = 0;
    for(var i = offset; i < offset + 0x10; i++) {
      sum += this.load(i);
    }
    return sum == 0;
  },

  /**
   *
   */
  dumpSPRRAM: function() {
    return this.oamRam.dump();
  }
});

/**
 *
 */
function PpuControlRegister() {
  Register8bit.call(this);
}

PpuControlRegister.prototype = Object.assign(Object.create(Register8bit.prototype), {
  isPpuControlRegister: true,

  //

  NMI_VBLANK_BIT: 7,
  MASTER_SLAVE_BIT: 6,
  SPRITES_SIZE_BIT: 5,
  BACKGROUND_PATTERN_TABLE_BIT: 4,
  SPRITES_PATTERN_TABLE_BIT: 3,
  INCREMENT_ADDRESS_BIT: 2,

  NAME_TABLE_ADDRESS_BIT: 0,
  NAME_TABLE_ADDRESS_BITS_WIDTH: 2,

  //

  /**
   *
   */
  isIncrementAddressSet: function() {
    return this.loadBit(this.INCREMENT_ADDRESS_BIT);
  },

  /**
   *
   */
  isVBlank: function() {
    return this.loadBit(this.NMI_VBLANK_BIT);
  },

  /**
   *
   */
  setVBlank: function() {
    this.storeBit(this.NMI_VBLANK_BIT, 1);
  },

  /**
   *
   */
  clearVBlank: function() {
    this.storeBit(this.NMI_VBLANK_BIT, 0);
  },

  /**
   *
   */
  isSpriteSize16: function() {
    return this.loadBit(this.SPRITES_SIZE_BIT);
  },

  /**
   *
   */
  getBackgroundPatternTableNum: function() {
    return this.loadBit(this.BACKGROUND_PATTERN_TABLE_BIT);
  },

  /**
   *
   */
  getSpritesPatternTableNum: function() {
    return this.loadBit(this.SPRITES_PATTERN_TABLE_BIT);
  },

  /**
   *
   */
  getNameTableAddress: function() {
    return this.loadBits(this.NAME_TABLE_ADDRESS_BIT, this.NAME_TABLE_ADDRESS_BITS_WIDTH);
  }
});

/**
 *
 */
function PpuMaskRegister(onBeforeLoad, onAfterStore) {
  Register8bit.call(this, onBeforeLoad, onAfterStore);
}

PpuMaskRegister.prototype = Object.assign(Object.create(Register8bit.prototype), {
  isPpuMaskRegister: true,

  //

  GREYSCALE_BIT: 0,
  LEFTMOST_BACKGROUND_VISIBLE_BIT: 1,
  LEFTMOST_SPRITES_VISIBLE_BIT: 2,
  BACKGROUND_VISIBLE_BIT: 3,
  SPRITES_VISIBLE_BIT: 4,
  EMPHASIZE_RED_BIT: 5,
  EMPHASIZE_GREEN_BIT: 6,
  EMPHASIZE_BLUE_BIT: 7,

  /**
   *
   */
  isGreyscale: function() {
    return this.isBitSet(this.GREYSCALE_BIT);
  },

  /**
   *
   */
  isLeftMostBackgroundVisible: function() {
    return this.isBitSet(this.LEFTMOST_BACKGROUND_VISIBLE_BIT);
  },

  /**
   *
   */
  isLeftMostSpritesVisible: function() {
    return this.isBitSet(this.LEFTMOST_SPRITES_VISIBLE_BIT);
  },

  /**
   *
   */
  isBackgroundVisible: function() {
    return this.isBitSet(this.BACKGROUND_VISIBLE_BIT);
  },

  /**
   *
   */
  isSpritesVisible: function() {
    return this.isBitSet(this.SPRITES_VISIBLE_BIT);
  },

  /**
   *
   */
  isEmphasizeRed: function() {
    return this.isBitSet(this.EMPHASIZE_RED_BIT);
  },

  /**
   *
   */
  isEmphasizeGreen: function() {
    return this.isBitSet(this.EMPHASIZE_GREEN_BIT);
  },

  /**
   *
   */
  isEmphasizeBlue: function() {
    return this.isBitSet(this.EMPHASIZE_BLUE_BIT);
  }
});

/**
 *
 */
function PpuStatusRegister(onBeforeLoad, onAfterStore) {
  Register8bit.call(this, onBeforeLoad, onAfterStore);
}

PpuStatusRegister.prototype = Object.assign(Object.create(Register8bit.prototype), {
  isPpuStatusRegister: true,

  //

  VBLANK_BIT: 7,
  SPRITE_ZERO_HIT_BIT: 6,
  SPRITE_OVERFLOW_BIT: 5,

  //

  /**
   *
   */
  setVBlank: function() {
    this.setBit(this.VBLANK_BIT);
  },

  /**
   *
   */
  clearVBlank: function() {
    this.clearBit(this.VBLANK_BIT);
  },

  /**
   *
   */
  setZeroHit: function() {
    this.setBit(this.SPRITE_ZERO_HIT_BIT);
  },

  /**
   *
   */
  clearZeroHit: function() {
    this.clearBit(this.SPRITE_ZERO_HIT_BIT);
  },

  /**
   *
   */
  setOverflow: function() {
    this.setBit(this.SPRITE_OVERFLOW_BIT);
  },

  /**
   *
   */
  clearOverflow: function() {
    this.clearBit(this.SPRITE_OVERFLOW_BIT);
  }
});

/**
 *
 */
function SpritesManager(memory) {
  this.sprites = [];
  this.init(memory);
}

Object.assign(SpritesManager.prototype, {
  isSpritesManager: true,

  /**
   *
   */
  init: function(memory) {
    for(var i = 0, il = memory.getCapacity() / 4; i < il; i++) {
      this.sprites.push(new Sprite(i, i, memory));
    }
  },

  /**
   *
   */
  getNum: function() {
    return this.sprites.length;
  },

  /**
   *
   */
  get: function(index) {
    return this.sprites[index];
  },

  /**
   *
   */
  copy: function(index, sprite) {
    this.sprites[index].copy(sprite);
  }
});

/**
 *
 */
function Sprite(index, id, memory) {
  this.index = index;
  this.id = id;
  this.memory = memory;
}

Object.assign(Sprite.prototype, {
  isSprite: true,

  //

  /**
   *
   */
  getId: function() {
    return this.id;
  },

  /**
   *
   */
  setId: function(id) {
    this.id = id;
  },

  /**
   *
   */
  getByte0: function() {
    return this.memory.load(this.index * 4 + 0);
  },

  /**
   *
   */
  getByte1: function() {
    return this.memory.load(this.index * 4 + 1);
  },

  /**
   *
   */
  getByte2: function() {
    return this.memory.load(this.index * 4 + 2);
  },

  /**
   *
   */
  getByte3: function() {
    return this.memory.load(this.index * 4 + 3);
  },

  /**
   *
   */
  setByte0: function(value) {
    this.memory.store(this.index * 4 + 0, value);
  },

  /**
   *
   */
  setByte1: function(value) {
    this.memory.store(this.index * 4 + 1, value);
  },

  /**
   *
   */
  setByte2: function(value) {
    this.memory.store(this.index * 4 + 2, value);
  },

  /**
   *
   */
  setByte3: function(value) {
    this.memory.store(this.index * 4 + 3, value);
  },

  /**
   *
   */
  copy: function(sprite) {
    this.setId(sprite.getId());
    this.setByte0(sprite.getByte0());
    this.setByte1(sprite.getByte1());
    this.setByte2(sprite.getByte2());
    this.setByte3(sprite.getByte3());
  },

  /**
   *
   */
  isEmpty: function() {
    return this.getByte0() === 0xFF && this.getByte1() === 0xFF &&
             this.getByte2() === 0xFF && this.getByte3() === 0xFF;
  },

  /**
   *
   */
  isVisible: function() {
    return this.getByte0() < 0xEF;
  },

  /**
   *
   */
  getYPosition: function() {
    return this.getByte0() - 1;
  },

  /**
   *
   */
  getXPosition: function() {
    return this.getByte3();
  },

  /**
   *
   */
  getTileIndex: function() {
    return this.getByte1();
  },

  /**
   *
   */
  getTileIndexForSize16: function() {
    return ((this.getByte1() & 1) * 0x1000) + (this.getByte1() >> 1) * 0x20;
  },

  /**
   *
   */
  getPalletNum: function() {
    return this.getByte2() & 0x3;
  },

  /**
   *
   */
  getPriority: function() {
    return (this.getByte2() >> 5) & 1;
  },

  /**
   *
   */
  doFlipHorizontally: function() {
    return ((this.getByte2() >> 6) & 1) ? true : false;
  },

  /**
   *
   */
  doFlipVertically: function() {
    return ((this.getByte2() >> 7) & 1) ? true : false;
  },

  /**
   *
   */
  beforeY: function(y) {
    return this.getYPosition() > y;
  },

  /**
   *
   */
  afterY: function(y, length) {
    return this.getYPosition() + length <= y;
  },

  /**
   *
   */
  on: function(y, length) {
    return (y >= this.getYPosition()) && (y < this.getYPosition() + length);
  }
});
