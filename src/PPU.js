/**
 * Ricoh 2C02
 */
function PPU() {
  this.ctrl1 = new PPUControl1Register();
  this.ctrl2 = new PPUControl2Register();
  this.sr = new PPUStatusRegister(); // Status Register
  this.sprAddr = new Register();
  this.sprIO = new Register();
  this.vRAMAddr1 = new Register();
  this.vRAMAddr2 = new RegisterWithCallback(
                         null,
                         this._VRAMAddress2WriteCallback.bind(this)
                       );
  this.vRAMIO = new RegisterWithCallback(
                      this._VRAMIOReadCallback.bind(this),
                      this._VRAMIOWriteCallback.bind(this)
                    );
  this.sprDMA = new Register();
  this.vram = new VRAM();

  this.higherVRAMAddress = 0;
  this.VRAMAddressCount = 0;

  // TODO: temporal
  this.mem = new PPUMemoryController(this.vram);
  this.sr.store(0x80);
};


PPU.prototype.load = function(address) {
  return this.vram.load(address);
};


PPU.prototype.store = function(address, value) {
  this.vram.store(address, value);
};


/**
 * TODO: not implemented yet.
 */
PPU.prototype.runCycle = function(ram) {

};


PPU.prototype._VRAMAddress2WriteCallback = function() {
  if(this.VRAMAddressCount == 0) {
    this.higherVRAMAddress = this.vRAMAddr2.load(true);
    this.VRAMAddressCount = 1;
  } else {
    this.VRAMAddressCount = 0;
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
  this.VRAMAddressCount = 0;
  this._incrementVRAMAddress();
};


PPU.prototype._VRAMIOWriteCallback = function() {
  this.mem.store(this._getVRAMAddress(), this.vRAMIO.load(true));
  this.VRAMAddressCount = 0;
  this._incrementVRAMAddress();
};



function PPUMemoryController(vram) {
  this.vram = vram;
};


PPUMemoryController.prototype._map = function(address) {
  if(address >= 0x4000) {
    address -= 0x4000;
  }

  if(address >= 0x3000 && address < 0x3F00) {
    address -= 0x1000;
  }

  if(address >= 0x3F00 && address < 0x4000) {
    address = (address & 0x1F) + 0x3F00;
  }

  return address;
};


PPUMemoryController.prototype.load = function(address) {
  return this.vram.load(this._map(address));
};


/**
 * TODO: mirroring implementation.
 */
PPUMemoryController.prototype.store = function(address, value) {
  return this.vram.store(this._map(address), value);
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



function PPUStatusRegister() {
  this.parent = Register;
  this.parent.call(this);
};
__inherit(PPUStatusRegister, Register);

PPUStatusRegister._VBLANK_BIT_BIT = 7;
PPUStatusRegister._SPRITE_ZERO_HIT_BIT = 6;
PPUStatusRegister._SCANLINE_SPRITE_COUNT_BIT = 5;
PPUStatusRegister._IGNORE_VRAM_WRITE_BIT = 4;


