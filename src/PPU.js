/**
 * Ricoh 2C02
 */
function PPU() {
  this.count = 0;
  this.scanLine = 0;
  this.cycle = 0;
  this.xScroll = 0;
  this.yScroll = 0;

  this.cpu = null;
  this.display = null;
  this.ctrl1 = new PPUControl1Register();
  this.ctrl2 = new PPUControl2Register();

  this.sr = new PPUStatusRegister(this._ID_SR_REG, this, true, false);
  this.sprAddr = new RegisterWithCallback(this._ID_SPR_ADDR_REG, this,
                                          false, true);
  this.sprIO = new RegisterWithCallback(this._ID_SPR_IO_REG, this,
                                        false, true);
  this.vRAMAddr1 = new RegisterWithCallback(this._ID_VRAM_ADDR1_REG, this,
                                            false, true);
  this.vRAMAddr2 = new RegisterWithCallback(this._ID_VRAM_ADDR2_REG, this,
                                            false, true);
  this.vRAMIO = new RegisterWithCallback(this._ID_VRAM_IO_REG, this,
                                         true, true);
  this.sprDMA = new RegisterWithCallback(this._ID_SPR_DMA_REG, this,
                                         false, true);

  this.vram = new VRAM();
  this.sprram = new SPRRAM();

  this.nt = new Register();
  this.atL = new Register16bit();
  this.atH = new Register16bit();
  this.ptL = new Register16bit();
  this.ptH = new Register16bit();

  this.xScrollOffset = 0;
  this.fetchedX = 0;
  this.fetchedY = 0;

  // TODO: temporal
  this.sprites = [];
  this.sprites.length = 64;
  this.spritesMap = [];
  this.spritesMap.length = 256;

  this.ram = null;
  this.mem = null; // initialized by initMemoryController

  this.higherVRAMAddress = 0;
  this.VRAMAddressCount1 = 0;
  this.VRAMAddressCount2 = 0;

  // TODO: temporal
  this.bgPalette = [];
  this.bgPalette.length = 16;
  this.spPalette = [];
  this.spPalette.length = 16;

};

PPU.prototype._ID_SR_REG         = 0;
PPU.prototype._ID_SPR_ADDR_REG   = 1;
PPU.prototype._ID_SPR_IO_REG     = 2;
PPU.prototype._ID_VRAM_ADDR1_REG = 3;
PPU.prototype._ID_VRAM_ADDR2_REG = 4;
PPU.prototype._ID_VRAM_IO_REG    = 5;
PPU.prototype._ID_SPR_DMA_REG    = 6;

PPU._MAX_SCANLINE = 262;
PPU._SCANLINE_CYCLE = 341;

PPU.prototype._PALETTE = [];
PPU.prototype._PALETTE[0x00] = 0xff757575;
PPU.prototype._PALETTE[0x01] = 0xff8f1b27;
PPU.prototype._PALETTE[0x02] = 0xffab0000;
PPU.prototype._PALETTE[0x03] = 0xff9f0047;
PPU.prototype._PALETTE[0x04] = 0xff77008f;
PPU.prototype._PALETTE[0x05] = 0xff1300ab;
PPU.prototype._PALETTE[0x06] = 0xff0000a7;
PPU.prototype._PALETTE[0x07] = 0xff000b7f;
PPU.prototype._PALETTE[0x08] = 0xff002f43;
PPU.prototype._PALETTE[0x09] = 0xff004700;
PPU.prototype._PALETTE[0x0a] = 0xff005100;
PPU.prototype._PALETTE[0x0b] = 0xff173f00;
PPU.prototype._PALETTE[0x0c] = 0xff5f3f1b;
PPU.prototype._PALETTE[0x0d] = 0xff000000;
PPU.prototype._PALETTE[0x0e] = 0xff000000;
PPU.prototype._PALETTE[0x0f] = 0xff000000;
PPU.prototype._PALETTE[0x10] = 0xffbcbcbc;
PPU.prototype._PALETTE[0x11] = 0xffef7300;
PPU.prototype._PALETTE[0x12] = 0xffef3b23;
PPU.prototype._PALETTE[0x13] = 0xfff30083;
PPU.prototype._PALETTE[0x14] = 0xffbf00bf;
PPU.prototype._PALETTE[0x15] = 0xff5b00e7;
PPU.prototype._PALETTE[0x16] = 0xff002bdb;
PPU.prototype._PALETTE[0x17] = 0xff0f4fcb;
PPU.prototype._PALETTE[0x18] = 0xff00738b;
PPU.prototype._PALETTE[0x19] = 0xff009700;
PPU.prototype._PALETTE[0x1a] = 0xff00ab00;
PPU.prototype._PALETTE[0x1b] = 0xff3b9300;
PPU.prototype._PALETTE[0x1c] = 0xff8b8300;
PPU.prototype._PALETTE[0x1d] = 0xff000000;
PPU.prototype._PALETTE[0x1e] = 0xff000000;
PPU.prototype._PALETTE[0x1f] = 0xff000000;
PPU.prototype._PALETTE[0x20] = 0xffffffff;
PPU.prototype._PALETTE[0x21] = 0xffffbf3f;
PPU.prototype._PALETTE[0x22] = 0xffff975f;
PPU.prototype._PALETTE[0x23] = 0xfffd8ba7;
PPU.prototype._PALETTE[0x24] = 0xffff7bf7;
PPU.prototype._PALETTE[0x25] = 0xffb777ff;
PPU.prototype._PALETTE[0x26] = 0xff6377ff;
PPU.prototype._PALETTE[0x27] = 0xff3b9bff;
PPU.prototype._PALETTE[0x28] = 0xff3fbff3;
PPU.prototype._PALETTE[0x29] = 0xff13d383;
PPU.prototype._PALETTE[0x2a] = 0xff4bdf4f;
PPU.prototype._PALETTE[0x2b] = 0xff98f858;
PPU.prototype._PALETTE[0x2c] = 0xffdbeb00;
PPU.prototype._PALETTE[0x2d] = 0xff000000;
PPU.prototype._PALETTE[0x2e] = 0xff000000;
PPU.prototype._PALETTE[0x2f] = 0xff000000;
PPU.prototype._PALETTE[0x30] = 0xffffffff;
PPU.prototype._PALETTE[0x31] = 0xffffe7ab;
PPU.prototype._PALETTE[0x32] = 0xffffd7c7;
PPU.prototype._PALETTE[0x33] = 0xffffcbd7;
PPU.prototype._PALETTE[0x34] = 0xffffc7ff;
PPU.prototype._PALETTE[0x35] = 0xffdbc7ff;
PPU.prototype._PALETTE[0x36] = 0xffb3bfff;
PPU.prototype._PALETTE[0x37] = 0xffabdbff;
PPU.prototype._PALETTE[0x38] = 0xffa3e7ff;
PPU.prototype._PALETTE[0x39] = 0xffa3ffe3;
PPU.prototype._PALETTE[0x3a] = 0xffbff3ab;
PPU.prototype._PALETTE[0x3b] = 0xffcfffb3;
PPU.prototype._PALETTE[0x3c] = 0xfff3ff9f;
PPU.prototype._PALETTE[0x3d] = 0xff000000;
PPU.prototype._PALETTE[0x3e] = 0xff000000;
PPU.prototype._PALETTE[0x3f] = 0xff000000;


/**
 * TODO: make explicit setCPU method?
 */
PPU.prototype.initMemoryController = function(cpu) {
  this.cpu = cpu;
  this.ram = cpu.ram;
  this.mem = new PPUMemoryController(this);
  // TODO: temporal
  this.sr.store(0x80);
};


PPU.prototype.setROM = function(rom) {
  this.mem.setROM(rom);
};


PPU.prototype.setDisplay = function(display) {
  this.display = display;
};


PPU.prototype.load = function(address) {
  return this.mem.load(address);
};


PPU.prototype.store = function(address, value) {
  this.mem.store(address, value);
};


/**
 * TODO: temporal imple.
 */
PPU.prototype.run3Cycles = function() {
/*
  this.runCycle();
  this.runCycle();
  this.runCycle();
*/
  this._renderPixel();
  this._shiftRegisters();
  this._fetch();
  this._countCycle();
  this._renderPixel();
  this._shiftRegisters();
  this._fetch();
  this._countCycle();
  this._renderPixel();
  this._shiftRegisters();
  this._fetch();
  this._countCycle();
};


/**
 * TODO: temporal imple.
 */
PPU.prototype.runCycle = function() {
  this._renderPixel();
  this._shiftRegisters();
  this._fetch();
  this._countCycle();
};


/**
 * TODO: remove magic numbers.
 */
PPU.prototype._renderPixel = function() {
  // Note: this comparison order is for performance.
  if(this.cycle >= 257 || this.scanLine >= 240 || this.cycle == 0)
    return;

  var x = this.cycle-1;
  var y = this.scanLine;

  var c = (this.spritesMap[x] !== 0) ? this.spritesMap[x] : this._getBGPixel();
  this.display.renderPixel(x, y, c);
};


/**
 * TODO: optimize more because this is one of the most heavy functions.
 */
PPU.prototype._getBGPixel = function() {
  var offset = this.xScrollOffset; // Note: calculate in advance for the performance.
  var lsb = (this.ptH.loadBit(offset) << 1) | this.ptL.loadBit(offset);
  var msb = (this.atH.loadBit(offset) << 1) | this.atL.loadBit(offset);
  var pIndex = (msb << 2) | lsb;
  return this.bgPalette[pIndex];
};


/**
 * TODO: temporal
 */
PPU.prototype._shiftRegisters = function() {
  if(this.scanLine >= 240 && this.scanLine <= 260)
    return;

  if((this.cycle >= 1 && this.cycle <= 256) ||
     (this.cycle >= 329 && this.cycle <= 336)) {
    // Note: for the performance.
    this.xScrollOffset--;
    if(this.cycle % 8 == 0) {
      this.xScrollOffset = 15 - (this.xScroll % 8);
      this.ptL.lshift8bits();
      this.ptH.lshift8bits();
      this.atL.lshift8bits();
      this.atH.lshift8bits();
    }
  }
};


/**
 * TODO: temporal
 * Note: for performance.
 */
PPU.prototype._initForFetch = function() {
  this.xScrollOffset = 15 - (this.xScroll % 8);
};


/**
 * TODO: temporal impl
 * TODO: optimize...?
 * Note: this comparison order is for performance.
 */
PPU.prototype._fetch = function() {

  if(this.cycle % 8 != 0)
    return;

  if(this.cycle == 0) {
    if(this.scanLine == 0) {
      this._initForFetch();
      this._initSpritesForFrame();
      this._initBGPalette();
      this._initSPPalette();
    }
    if(this.scanLine >= 0 && this.scanLine <= 239) {
      this._initSpritesForScanLine(this.scanLine);
    }
    return;
  }

  if(this.scanLine >= 240 && this.scanLine <= 260)
    return;

  if((this.cycle >= 257 && this.cycle <= 320) ||
     this.cycle >= 337)
    return;

  this._fetchNameTable();
  this._fetchAttributeTable();
  this._fetchPatternTable();
//  this._fetchPatternTableLowByte();
//  this._fetchPatternTableHighByte();

/*
  switch(this.cycle % 8) {
    case 1:
      this._fetchNameTable();
      break;
    case 3:
      this._fetchAttributeTable();
      break;
    case 5:
      this._fetchPatternTableLowByte();
      break;
    case 7:
      this._fetchPatternTableHighByte();
      break;
    default:
      break;
  }
*/

};


/**
 * TODO: temporal
 */
PPU.prototype._getFetchedX = function() {
  var tmp;
  if(this.cycle <= 256) {
    tmp = this.cycle+8;
  } else {
    tmp = this.cycle-328;
  }
  return (this.xScroll + tmp) & ~0x7;
};


PPU.prototype._getFetchedY = function() {
  var tmp;

  if(this.cycle <= 256) {
    tmp = this.scanLine;
  } else {
    tmp = this.scanLine == 261 ? 0 : this.scanLine+1;
  }
  return this.yScroll + tmp;
};


/**
 * TODO: optimize
 */
PPU.prototype._fetchNameTableAddress = function(x, y) {
  switch(this.ctrl1.getNameTableAddress()) {
    case 0:
      return x < 256 ? 0x2000 : 0x2400;
    case 1:
      return x < 256 ? 0x2400 : 0x2000;
    case 2:
      return x < 256 ? 0x2800 : 0x2C00;
    default:
      return x < 256 ? 0x2C00 : 0x2800;
  }
};


/**
 * TODO: remove magic numbers?
 */
PPU.prototype._fetchNameTable = function() {
  var x = this._getFetchedX();
  var y = this._getFetchedY();
  var tileX = x >> 3;
  var tileY = y >> 3;
  var index = (tileY % 30) * 32 + (tileX % 32);
  this.nt.store(this.load(this._fetchNameTableAddress(x, y) + index));
};


/**
 * TODO: remove magic numbers?
 */
PPU.prototype._fetchAttributeTable = function() {
  var x = this._getFetchedX();
  var y = this._getFetchedY();
  var ay = (y >= 240) ? y-240 : y;
  var tileX = x >> 5;
  var tileY = ay >> 5;
  var index = (tileY % 8) * 8 + (tileX % 8);
  var b = this.load(this._fetchNameTableAddress(x, y) + 0x3C0 + index);

  var topbottom = (ay % 32) >> 4; // (y % 32) > 15 ? 1 : 0; // bottom, top
  var rightleft = (x % 32) >> 4; // (x % 32) > 15 ? 1 : 0; // right, left
  var position = (topbottom << 1) | rightleft; // bottomright, bottomleft,
                                               // topright, topleft
  var value = (b >> (position * 2)) & 0x3;
  var h = value >> 1;
  var l = value & 1;
  this.atH.storeLowerByte(h ? 0xff : 0);
  this.atL.storeLowerByte(l ? 0xff : 0);
};


/**
 * TODO: remove magic numbers?
 * Note: update lower and higher byte at a time.
 */
PPU.prototype._fetchPatternTable = function() {
  var y = this._getFetchedY() % 8;
  var index = this.nt.load();
  var tableNum = this.ctrl1.getBackgroundPatternTableNum() ? 1 : 0;
  var offset = tableNum * 0x1000;
  this.ptL.storeLowerByte(this.load(offset + index * 0x10 + y));
  this.ptH.storeLowerByte(this.load(offset + index * 0x10 + 0x8 + y));
};


/**
 * TODO: remove magic numbers?
 */
PPU.prototype._fetchPatternTableLowByte = function() {
  var y = this._getFetchedY() % 8;
  var index = this.nt.load();
  var tableNum = this.ctrl1.getBackgroundPatternTableNum() ? 1 : 0;
  var offset = tableNum * 0x1000;
  this.ptL.storeLowerByte(this.load(offset + index * 0x10 + y));
};


/**
 * TODO: remove magic numbers?
 */
PPU.prototype._fetchPatternTableHighByte = function() {
  var y = this._getFetchedY() % 8;
  var index = this.nt.load();
  var tableNum = this.ctrl1.getBackgroundPatternTableNum() ? 1 : 0;
  var offset = tableNum * 0x1000;
  this.ptH.storeLowerByte(this.load(offset + index * 0x10 + 0x8 + y));
};


PPU.prototype._countCycle = function() {
  if(this.cycle == 1) {
    if(this.scanLine == 241) {
      this.setVBlank();
      this.display.updateScreen();
      if(this.ctrl1.isVBlank()) {
        this.cpu.interrupt(CPU.prototype._INTERRUPT_NMI); // TODO: move to CPU
      }
    } else if(this.scanLine == 261) {
      this.clearVBlank();
    }
  }

  this.cycle++;
  if(this.cycle > 340) {
    this.cycle = 0;
    this.scanLine++;
    if(this.scanLine > 261) {
      this.scanLine = 0;
    }
  }
};


PPU.prototype.notifyRegisterLoading = function(id) {
  switch(id) {
    case this._ID_SR_REG:
      this._StatusRegisterReadCallback();
      break;
    case this._ID_VRAM_IO_REG:
      this._VRAMIOReadCallback();
      break;
    default:
      break;
  }
};


PPU.prototype.notifyRegisterStoring = function(id) {
  switch(id) {
    case this._ID_SPR_ADDR_REG:
      this._SPRRAMAddressWriteCallback();
      break;
    case this._ID_SPR_IO_REG:
      this._SPRRAMIOWriteCallback();
      break;
    case this._ID_VRAM_ADDR1_REG:
      this._VRAMAddress1WriteCallback();
      break;
    case this._ID_VRAM_ADDR2_REG:
      this._VRAMAddress2WriteCallback();
      break;
    case this._ID_VRAM_IO_REG:
      this._VRAMIOWriteCallback();
      break;
    case this._ID_SPR_DMA_REG:
      this._SPRRAMDMAWriteCallback();
      break;
    default:
      break;
  }
};


PPU.prototype._VRAMAddress1WriteCallback = function() {
  if(this.VRAMAddressCount1 == 0) {
    this.xScroll = this.vRAMAddr1.load(true);
    this.VRAMAddressCount1 = 1;
  } else {
    this.VRAMAddressCount1 = 0;
    this.yScroll = this.vRAMAddr1.load(true);
  }
};


PPU.prototype._VRAMAddress2WriteCallback = function() {
  if(this.VRAMAddressCount2 == 0) {
    this.higherVRAMAddress = this.vRAMAddr2.load(true);
    this.VRAMAddressCount2 = 1;
  } else {
    this.VRAMAddressCount2 = 0;
  }
};


PPU.prototype._getVRAMAddress = function() {
  return (this.higherVRAMAddress << 8) | this.vRAMAddr2.load(true);
};


/**
 * TODO: check the logic.
 */
PPU.prototype._incrementVRAMAddress = function() {
  var plus = this.ctrl1.isIncrementAddressSet() ? 32 : 1;
  var addr = this._getVRAMAddress() + plus;
  this.higherVRAMAddress = (addr >> 8) & 0xff;
  this.vRAMAddr2.store(addr & 0xff, true);
};


PPU.prototype._VRAMIOReadCallback = function() {
  this.vRAMIO.store(this.mem.load(this._getVRAMAddress()), true);
  this.VRAMAddressCount2 = 0;
  this._incrementVRAMAddress();
};


PPU.prototype._VRAMIOWriteCallback = function() {
  this.mem.store(this._getVRAMAddress(), this.vRAMIO.load(true));
  this.VRAMAddressCount2 = 0;
  this._incrementVRAMAddress();
};


/**
 * TODO: temporal
 */
PPU.prototype._StatusRegisterReadCallback = function() {
//  this.sr.store(this.sr.load(true) & 0x7f, true);
};


PPU.prototype._SPRRAMAddressWriteCallback = function() {

};

PPU.prototype._SPRRAMIOWriteCallback = function() {
  var addr = this.sprAddr.load(true);
  var value = this.sprIO.load(true);
  this.sprram.store(addr, value);
};


PPU.prototype._SPRRAMDMAWriteCallback = function() {
  var addr = this.sprDMA.load(true) * 0x100;
  for(var i = 0; i < 256; i++) {
    var value = this.ram.load(addr + i);
    this.sprram.store(i, value);
  }
};


/**
 * TODO: temporal
 */
PPU.prototype.setVBlank = function() {
  this.sr.store(this.sr.load(true) | 0x80, true);
};


/**
 * TODO: temporal
 */
PPU.prototype.clearVBlank = function() {
  this.sr.store(this.sr.load(true) & 0x7f, true);
};



/**
 * TODO: temporal
 */
PPU.prototype._initSpritesForFrame = function() {
  this.sprites.length = 0;
  var n = 0;
  for(var i = 0; i < 64; i++) {
    var b0 = this.sprram.load(i*4+0);
    var b1 = this.sprram.load(i*4+1);
    var b2 = this.sprram.load(i*4+2);
    var b3 = this.sprram.load(i*4+3);
    var s = new Sprite(b0, b1, b2, b3);
    if(!s.doDisplay() || s.getPriority())
      continue;
    this.sprites[n++] = s;
  }
};


PPU.prototype._initBGPalette = function() {
  for(var i = 0; i < 16; i++) {
    this.bgPalette[i] = this._PALETTE[this._getPaletteIndex(i)];
  }
};


PPU.prototype._initSPPalette = function() {
  for(var i = 0; i < 16; i++) {
    this.spPalette[i] = this._PALETTE[this._getSpritePaletteIndex(i)];
  }
};


/**
 * TODO: temporal
 */
PPU.prototype._initSpritesForScanLine = function(ay) {
  if(this.sprites.length === 0)
    return;

  for(var i = 0; i < 256; i++)
    this.spritesMap[i] = 0;

  var ySize = this.ctrl1.isSpriteSize16() ? 16 : 8;
  var n = 0;
  for(var i = 0, len = this.sprites.length; i < len; i++) {
    if(this.sprites[i].afterY(ay, ySize)) {
      n++;
      continue;
    } else if(this.sprites[i].beforeY(ay)) {
      this.sprites[i-n] = this.sprites[i];
      continue;
    }
    var s = this.sprites[i-n] = this.sprites[i];

    var bx = s.getXPosition();
    var by = s.getYPosition();
    var j = ay - by;
    var cy = s.doFlipVertically() ? ySize-j-1 : j;
    var horizontal = s.doFlipHorizontally();
    var ptIndex = (ySize == 8) ? s.getTileIndex() : s.getTileIndexForSize16();
    var msb = s.getPalletNum();
    for(var k = 0; k < 8; k++) {
      var cx = horizontal ? 7-k : k;
      var x = bx + k;
      if(x >= 256)
        break;
      var lsb = this._getPatternTableElement(ptIndex, cx, cy, ySize);
      if(lsb != 0) {
        var pIndex = (msb << 2) | lsb;
        this.spritesMap[x] = this.spPalette[pIndex];
      }
    }
  }
  this.sprites.length -= n;

};


/**
 * TODO: temporal
 */
PPU.prototype._getPatternTableElement = function(index, x, y, ySize) {
  var ax = x % 8;
  var a, b;
  if(ySize == 8) {
    var ay = y % 8;
    var offset = this.ctrl1.getSpritesPatternTableNum() ? 0x1000 : 0;
    a = this.load(offset + index * 0x10 + ay);
    b = this.load(offset + index * 0x10 + 0x8 + ay);
  } else {
    var ay = y % 8;
    ay += (y >> 3) * 0x10;
    a = this.load(index + ay);
    b = this.load(index + ay + 0x8);
  }
  return ((a >> (7-ax)) & 1) |
           (((b >> (7-ax)) & 1) << 1);
};


/**
 * TODO: temporal
 */
PPU.prototype._getPaletteIndex = function(index) {
  return this.load(0x3F00 + index);
};


/**
 * TODO: temporal
 */
PPU.prototype._getSpritePaletteIndex = function(index) {
  return this.load(0x3F10 + index);
};


PPU.prototype.dump = function() {
  var buffer = '';

  buffer += 'ctrl1: ' + this.ctrl1.dump() + '\n';
  buffer += 'ctrl2: ' + this.ctrl2.dump() + '\n';
  buffer += 'status: ' + this.sr.dump() + '\n';
  buffer += 'SPR addr: ' + this.sprAddr.dump() + '\n';
  buffer += 'SPR IO: ' + this.sprIO.dump() + '\n';
  buffer += 'VRAM ADDR1: ' + this.vRAMAddr1.dump() + '\n';
  buffer += 'VRAM ADDR2: ' + this.vRAMAddr2.dump() + '\n';
  buffer += 'VRAM IO: ' + this.vRAMIO.dump() + '\n';
  buffer += 'SRP DMA: ' + this.sprDMA.dump() + '\n';
  buffer += '\n';

  return buffer;
};


/**
 * TODO: duplicated code.
 */
PPU.prototype.dumpVRAM = function() {
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
};


/**
 * TODO: bad performance.
 * TODO: check the logic.
 */
PPU.prototype._checkNext16BytesIsZero = function(offset) {
  if(offset + 0x10 >= 0x10000)
    return false;

  var sum = 0;
  for(var i = offset; i < offset + 0x10; i++) {
    sum += this.load(i);
  }
  return sum == 0;
};


PPU.prototype.dumpSPRRAM = function() {
  return this.sprram.dump();
};



function PPUMemoryController(ppu) {
  this.parent = ProcessorMemoryController;
  this.parent.call(this);
  this.vram = ppu.vram;
};
__inherit(PPUMemoryController, ProcessorMemoryController);

PPUMemoryController.prototype._CONTAINER = {'target': null, 'addr': null};


PPUMemoryController.prototype._map = function(address) {
  var target = null;
  var addr = null;

  // TODO: temporal. for NROM.
  if(address < 0x2000 && this.hasCHRROM) {
    target = this.chrrom;
    addr = address;
  } else {
    target = this.vram;
    addr = address;
    if(addr >= 0x4000) {
      addr = addr & 0x3FFF;
    }
    if(addr >= 0x3F00 && addr < 0x4000) {
      addr = addr & 0x3F1F;
    }
    if(addr >= 0x2000 && addr < 0x3F00) {
      addr = addr & 0x2FFF;
    }
  }

  var result = this._CONTAINER;
  result.target = target;
  result.addr = addr;
  return result;
};


/**
 * Note: for performance.
 */
PPUMemoryController.prototype.load = function(address, preventCallback) {
  if(address < 0x2000 && this.hasCHRROM) {
    return this.chrrom.load(address);
  } else {
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
    return this.vram.load(addr);
  }
};



function PPUControl1Register() {
  this.parent = Register;
  this.parent.call(this);
};
__inherit(PPUControl1Register, Register);

PPUControl1Register.prototype._NMI_VBLANK_BIT = 7;
PPUControl1Register.prototype._MASTER_SLAVE_BIT = 6;
PPUControl1Register.prototype._SPRITES_SIZE_BIT = 5;
PPUControl1Register.prototype._BACKGROUND_PATTERN_TABLE_BIT = 4;
PPUControl1Register.prototype._SPRITES_PATTERN_TABLE_BIT = 3;
PPUControl1Register.prototype._INCREMENT_ADDRESS_BIT = 2;

PPUControl1Register.prototype._NAME_TABLE_ADDRESS_BIT = 0;
PPUControl1Register.prototype._NAME_TABLE_ADDRESS_BITS_MASK = 0x3;


PPUControl1Register.prototype.isIncrementAddressSet = function() {
  return this.loadBit(this._INCREMENT_ADDRESS_BIT);
};


PPUControl1Register.prototype.isVBlank = function() {
  return this.loadBit(this._NMI_VBLANK_BIT);
};


PPUControl1Register.prototype.setVBlank = function() {
  this.storeBit(this._NMI_VBLANK_BIT, 1);
};


PPUControl1Register.prototype.clearVBlank = function() {
  this.storeBit(this._NMI_VBLANK_BIT, 0);
};


PPUControl1Register.prototype.isSpriteSize16 = function() {
  return this.loadBit(this._SPRITES_SIZE_BIT);
};


PPUControl1Register.prototype.getBackgroundPatternTableNum = function() {
  return this.loadBit(this._BACKGROUND_PATTERN_TABLE_BIT);
};


PPUControl1Register.prototype.getSpritesPatternTableNum = function() {
  return this.loadBit(this._SPRITES_PATTERN_TABLE_BIT);
};


PPUControl1Register.prototype.getNameTableAddress = function() {
  return this.loadPartialBits(
           this._NAME_TABLE_ADDRESS_BIT,
           this._NAME_TABLE_ADDRESS_BITS_MASK);
};



function PPUControl2Register() {
  this.parent = Register;
  this.parent.call(this);
};
__inherit(PPUControl2Register, Register);

PPUControl2Register._BACKGROUND_COLOR_MODE_BIT = 5;
PPUControl2Register._BACKGROUND_COLOR_MODE_BITS_MASK = 0x7;

PPUControl2Register._SPRITES_DISPLAY_BIT = 4;
PPUControl2Register._BACKGROUND_DISPLAY_BIT = 3;
PPUControl2Register._CLIP_SPRITES_BIT = 2;
PPUControl2Register._CLIP_BACKGROUND_BIT = 1;
PPUControl2Register._COLOR_MODE_BIT = 0;



function PPUStatusRegister(id, caller, l, s) {
  this.parent = RegisterWithCallback;
  this.parent.call(this, id, caller, l, s);
};
__inherit(PPUStatusRegister, RegisterWithCallback);

PPUStatusRegister._VBLANK_BIT_BIT = 7;
PPUStatusRegister._SPRITE_ZERO_HIT_BIT = 6;
PPUStatusRegister._SCANLINE_SPRITE_COUNT_BIT = 5;
PPUStatusRegister._IGNORE_VRAM_WRITE_BIT = 4;


PPUStatusRegister.prototype.setZeroHit = function() {
  this.storeBit(PPUStatusRegister._SPRITE_ZERO_HIT_BIT, 1);
};


PPUStatusRegister.prototype.clearZeroHit = function() {
  this.storeBit(PPUStatusRegister._SPRITE_ZERO_HIT_BIT, 0);
};



function Sprite(byte0, byte1, byte2, byte3) {
  this.byte0 = byte0;
  this.byte1 = byte1;
  this.byte2 = byte2;
  this.byte3 = byte3;
};


Sprite.prototype.doDisplay = function() {
  return this.byte0 < 0xEF;
};


Sprite.prototype.getYPosition = function() {
  return this.byte0 - 1;
};


Sprite.prototype.getXPosition = function() {
  return this.byte3;
};


Sprite.prototype.getTileIndex = function() {
  return this.byte1;
};

Sprite.prototype.getTileIndexForSize16 = function() {
  return ((this.byte1 & 1) * 0x1000) + (this.byte1 >> 1) * 0x20;
};


Sprite.prototype.getPalletNum = function() {
  return this.byte2 & 0x3;
};


Sprite.prototype.getPriority = function() {
  return (this.byte2 >> 5) & 1;
};


Sprite.prototype.doFlipHorizontally = function() {
  return ((this.byte2 >> 6) & 1) ? true : false;
};


Sprite.prototype.doFlipVertically = function() {
  return ((this.byte2 >> 7) & 1) ? true : false;
};


/**
 * TODO: rename
 */
Sprite.prototype.beforeY = function(y) {
  return this.getYPosition() > y;
};


/**
 * TODO: rename
 */
Sprite.prototype.afterY = function(y, length) {
  return this.getYPosition() + length <= y;
};


/**
 * TODO: rename
 */
Sprite.prototype.inY = function(y, length) {
  return ((y >= this.getYPosition()) && (y < this.getYPosition()+length));
};



/**
 * PPU VRAM.
 */
function VRAM() {
  this.parent = GenericMemory;
  this.parent.call(this, VRAM._CAPACITY);
};
__inherit(VRAM, GenericMemory);

VRAM._CAPACITY = 64 * 1024; // 64KB


function SPRRAM() {
  this.parent = GenericMemory;
  this.parent.call(this, SPRRAM._CAPACITY);
};
__inherit(SPRRAM, GenericMemory);

SPRRAM._CAPACITY = 256; // 256 bytes
