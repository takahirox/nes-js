/**
 * It's a temporal implementation that this class has ROM.
 */
function RAM() {
  var buffer = new ArrayBuffer(RAM._CAPACITY);
  this.uint8 = new Uint8Array(buffer);
  this.rom = null;
  this._init();
};

RAM._CAPACITY = 64 * 1024; // 64KB
RAM._WORD_SIZE = 1; // 1 byte


RAM.prototype._init = function() {
  for(var i = 0; i < RAM._CAPACITY; i++)
    this.store(i, 0);
};


/**
 * TODO: temporal
 */
RAM.prototype.setROM = function(rom) {
  this.rom = rom;
};


/**
 * TODO: temporal
 */
RAM.prototype.load = function(address) {
  if(address >= 0xC000)
    address -= 0x4000;
  if(address >= 0x8000)
    return this.rom.load(address - 0x8000 + 0x10);

  // TODO: temporal
  // TODO: should move to IO or MMC class.
  if(address >= 0x2000 && address <= 0x2007)
    return 0xff;

  return this.uint8[address];
};


/**
 * little endian.
 */
RAM.prototype.load2Bytes = function(address) {
  if(address >= 0xC010)
    address -= 0x4000;
  if(address >= 0x8010)
    return this.rom.load2Bytes(address - 0x8000 + 0x10);
  return this.load(address) | (this.load(address + 1) << 8);
};


RAM.prototype.store = function(address, value) {
  this.uint8[address] = value;
};


/**
 * little endian.
 */
RAM.prototype.store2Bytes = function(address, value) {
  this.store(address,     value);
  this.store(address + 1, value >> 8);
};
