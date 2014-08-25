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
  this.sr = new PPUStatusRegister( // Status Register
                  this._StatusRegisterReadCallback.bind(this),
                  null);
  this.sprAddr = new RegisterWithCallback(
                       null,
                       this._SPRRAMAddressWriteCallback.bind(this));
  this.sprIO = new RegisterWithCallback(
                     null,
                     this._SPRRAMIOWriteCallback.bind(this));
  this.vRAMAddr1 = new RegisterWithCallback(
                         null,
                         this._VRAMAddress1WriteCallback.bind(this));
  this.vRAMAddr2 = new RegisterWithCallback(
                         null,
                         this._VRAMAddress2WriteCallback.bind(this));
  this.vRAMIO = new RegisterWithCallback(
                      this._VRAMIOReadCallback.bind(this),
                      this._VRAMIOWriteCallback.bind(this));
  this.sprDMA = new RegisterWithCallback(
                      null,
                      this._SPRRAMDMAWriteCallback.bind(this));

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

PPU._MAX_SCANLINE = 262;
PPU._SCANLINE_CYCLE = 341;

PPU._PALETTE = [];
PPU._PALETTE[0x00] = [0x75, 0x75, 0x75];
PPU._PALETTE[0x01] = [0x27, 0x1B, 0x8F];
PPU._PALETTE[0x02] = [0x00, 0x00, 0xAB];
PPU._PALETTE[0x03] = [0x47, 0x00, 0x9F];
PPU._PALETTE[0x04] = [0x8F, 0x00, 0x77];
PPU._PALETTE[0x05] = [0xAB, 0x00, 0x13];
PPU._PALETTE[0x06] = [0xA7, 0x00, 0x00];
PPU._PALETTE[0x07] = [0x7F, 0x0B, 0x00];
PPU._PALETTE[0x08] = [0x43, 0x2F, 0x00];
PPU._PALETTE[0x09] = [0x00, 0x47, 0x00];
PPU._PALETTE[0x0A] = [0x00, 0x51, 0x00];
PPU._PALETTE[0x0B] = [0x00, 0x3F, 0x17];
PPU._PALETTE[0x0C] = [0x1B, 0x3F, 0x5F];
PPU._PALETTE[0x0D] = [0x00, 0x00, 0x00];
PPU._PALETTE[0x0E] = [0x00, 0x00, 0x00];
PPU._PALETTE[0x0F] = [0x00, 0x00, 0x00];
PPU._PALETTE[0x10] = [0xBC, 0xBC, 0xBC];
PPU._PALETTE[0x11] = [0x00, 0x73, 0xEF];
PPU._PALETTE[0x12] = [0x23, 0x3B, 0xEF];
PPU._PALETTE[0x13] = [0x83, 0x00, 0xF3];
PPU._PALETTE[0x14] = [0xBF, 0x00, 0xBF];
PPU._PALETTE[0x15] = [0xE7, 0x00, 0x5B];
PPU._PALETTE[0x16] = [0xDB, 0x2B, 0x00];
PPU._PALETTE[0x17] = [0xCB, 0x4F, 0x0F];
PPU._PALETTE[0x18] = [0x8B, 0x73, 0x00];
PPU._PALETTE[0x19] = [0x00, 0x97, 0x00];
PPU._PALETTE[0x1A] = [0x00, 0xAB, 0x00];
PPU._PALETTE[0x1B] = [0x00, 0x93, 0x3B];
PPU._PALETTE[0x1C] = [0x00, 0x83, 0x8B];
PPU._PALETTE[0x1D] = [0x00, 0x00, 0x00];
PPU._PALETTE[0x1E] = [0x00, 0x00, 0x00];
PPU._PALETTE[0x1F] = [0x00, 0x00, 0x00];
PPU._PALETTE[0x20] = [0xFF, 0xFF, 0xFF];
PPU._PALETTE[0x21] = [0x3F, 0xBF, 0xFF];
PPU._PALETTE[0x22] = [0x5F, 0x97, 0xFF];
PPU._PALETTE[0x23] = [0xA7, 0x8B, 0xFD];
PPU._PALETTE[0x24] = [0xF7, 0x7B, 0xFF];
PPU._PALETTE[0x25] = [0xFF, 0x77, 0xB7];
PPU._PALETTE[0x26] = [0xFF, 0x77, 0x63];
PPU._PALETTE[0x27] = [0xFF, 0x9B, 0x3B];
PPU._PALETTE[0x28] = [0xF3, 0xBF, 0x3F];
PPU._PALETTE[0x29] = [0x83, 0xD3, 0x13];
PPU._PALETTE[0x2A] = [0x4F, 0xDF, 0x4B];
PPU._PALETTE[0x2B] = [0x58, 0xF8, 0x98];
PPU._PALETTE[0x2C] = [0x00, 0xEB, 0xDB];
PPU._PALETTE[0x2D] = [0x00, 0x00, 0x00];
PPU._PALETTE[0x2E] = [0x00, 0x00, 0x00];
PPU._PALETTE[0x2F] = [0x00, 0x00, 0x00];
PPU._PALETTE[0x30] = [0xFF, 0xFF, 0xFF];
PPU._PALETTE[0x31] = [0xAB, 0xE7, 0xFF];
PPU._PALETTE[0x32] = [0xC7, 0xD7, 0xFF];
PPU._PALETTE[0x33] = [0xD7, 0xCB, 0xFF];
PPU._PALETTE[0x34] = [0xFF, 0xC7, 0xFF];
PPU._PALETTE[0x35] = [0xFF, 0xC7, 0xDB];
PPU._PALETTE[0x36] = [0xFF, 0xBF, 0xB3];
PPU._PALETTE[0x37] = [0xFF, 0xDB, 0xAB];
PPU._PALETTE[0x38] = [0xFF, 0xE7, 0xA3];
PPU._PALETTE[0x39] = [0xE3, 0xFF, 0xA3];
PPU._PALETTE[0x3A] = [0xAB, 0xF3, 0xBF];
PPU._PALETTE[0x3B] = [0xB3, 0xFF, 0xCF];
PPU._PALETTE[0x3C] = [0x9F, 0xFF, 0xF3];
PPU._PALETTE[0x3D] = [0x00, 0x00, 0x00];
PPU._PALETTE[0x3E] = [0x00, 0x00, 0x00];
PPU._PALETTE[0x3F] = [0x00, 0x00, 0x00];
PPU._PALETTE[0x40] = [0x00, 0x00, 0x00]; // for null



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

  var c = (this.spritesMap[x] !== PPU._PALETTE[0x40])
            ? this.spritesMap[x] : this._getBGPixel();
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
/*
    this.ptL.lshift(0);
    this.ptH.lshift(0);
    this.atL.lshift(0);
    this.atH.lshift(0);
*/
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
    if(this.scanLine >= 0 && this.scanLine <= 239)
      this._initSpritesForScanLine(this.scanLine);
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
        this.cpu.interrupt(CPU._INTERRUPT_NMI);
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
  for(var i = 0; i < 64; i++) {
    var b0 = this.sprram.load(i*4+0);
    var b1 = this.sprram.load(i*4+1);
    var b2 = this.sprram.load(i*4+2);
    var b3 = this.sprram.load(i*4+3);
    var s = new Sprite(b0, b1, b2, b3);
    if(!s.doDisplay() || s.getPriority())
      continue;
    this.sprites.push(s);
  }
};


PPU.prototype._initBGPalette = function() {
  for(var i = 0; i < 16; i++) {
    this.bgPalette[i] = PPU._PALETTE[this._getPaletteIndex(i)];
  }
};


PPU.prototype._initSPPalette = function() {
  for(var i = 0; i < 16; i++) {
    this.spPalette[i] = PPU._PALETTE[this._getSpritePaletteIndex(i)];
  }
};


/**
 * TODO: temporal
 */
PPU.prototype._initSpritesForScanLine = function(ay) {
  for(var i = 0; i < 256; i++)
    this.spritesMap[i] = PPU._PALETTE[0x40];

  var ySize = this.ctrl1.isSpriteSize16() ? 16 : 8;
  for(var i = 0; i < this.sprites.length; i++) {
    var s = this.sprites[i];
    if(! s.inY(ay, ySize))
      continue;

//    this.sprites[i] = s;
    var bx = s.getXPosition();
    var by = s.getYPosition();
    var j = ay - by;
    var cy = s.doFlipVertically() ? ySize-j-1 : j;
    var y = by + j;
    for(var k = 0; k < 8; k++) {
      var cx = s.doFlipHorizontally() ? 7-k : k;
      var x = bx + k;
      if(x >= 256)
        break;
      var ptIndex = (ySize == 8) ? s.getTileIndex() : s.getTileIndexForSize16();
      var lsb = this._getPatternTableElement(ptIndex, cx, cy, ySize);
      if(lsb != 0) {
        var msb = s.getPalletNum();
        var pIndex = (msb << 2) | lsb;
        var c = this.spPalette[pIndex];
        this.spritesMap[x] = c;
      }
    }
  }

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

PPUMemoryController._CONTAINER = {'target': null, 'addr': null};


PPUMemoryController.prototype._map = function(address) {
  var target = null;
  var addr = null;

  // TODO: temporal. for NROM.
  if(address < 0x2000 && this.rom.hasCHRROM()) {
    target = this.rom.chrrom;
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

  var result = PPUMemoryController._CONTAINER;
  result.target = target;
  result.addr = addr;
  return result;
};



function PPUControl1Register() {
  this.parent = Register;
  this.parent.call(this);
};
__inherit(PPUControl1Register, Register);

PPUControl1Register._NMI_VBLANK_BIT = 7;
PPUControl1Register._MASTER_SLAVE_BIT = 6;
PPUControl1Register._SPRITES_SIZE_BIT = 5;
PPUControl1Register._BACKGROUND_PATTERN_TABLE_BIT = 4;
PPUControl1Register._SPRITES_PATTERN_TABLE_BIT = 3;
PPUControl1Register._INCREMENT_ADDRESS_BIT = 2;

PPUControl1Register._NAME_TABLE_ADDRESS_BIT = 0;
PPUControl1Register._NAME_TABLE_ADDRESS_BITS_MASK = 0x3;


PPUControl1Register.prototype.isIncrementAddressSet = function() {
  return this.loadBit(PPUControl1Register._INCREMENT_ADDRESS_BIT);
};


PPUControl1Register.prototype.isVBlank = function() {
  return this.loadBit(PPUControl1Register._NMI_VBLANK_BIT);
};


PPUControl1Register.prototype.setVBlank = function() {
  this.storeBit(PPUControl1Register._NMI_VBLANK_BIT, 1);
};


PPUControl1Register.prototype.clearVBlank = function() {
  this.storeBit(PPUControl1Register._NMI_VBLANK_BIT, 0);
};


PPUControl1Register.prototype.isSpriteSize16 = function() {
  return this.loadBit(PPUControl1Register._SPRITES_SIZE_BIT);
};


PPUControl1Register.prototype.getBackgroundPatternTableNum = function() {
  return this.loadBit(PPUControl1Register._BACKGROUND_PATTERN_TABLE_BIT);
};


PPUControl1Register.prototype.getSpritesPatternTableNum = function() {
  return this.loadBit(PPUControl1Register._SPRITES_PATTERN_TABLE_BIT);
};


PPUControl1Register.prototype.getNameTableAddress = function() {
  return this.loadPartialBits(
           PPUControl1Register._NAME_TABLE_ADDRESS_BIT,
           PPUControl1Register._NAME_TABLE_ADDRESS_BITS_MASK);
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



function PPUStatusRegister(readCallback, writeCallback) {
  this.parent = RegisterWithCallback;
  this.parent.call(this, readCallback, writeCallback);
};
__inherit(PPUStatusRegister, RegisterWithCallback);

PPUStatusRegister._VBLANK_BIT_BIT = 7;
PPUStatusRegister._SPRITE_ZERO_HIT_BIT = 6;
PPUStatusRegister._SCANLINE_SPRITE_COUNT_BIT = 5;
PPUStatusRegister._IGNORE_VRAM_WRITE_BIT = 4;



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
Sprite.prototype.inY = function(y, length) {
  return ((y >= this.getYPosition()) && (y < this.getYPosition()+length));
};
