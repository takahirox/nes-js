/**
 * CPU RAM.
 * This class represents physical CPU RAM and also supports CPU memory mapping.
 * It's a temporal implementation that this class has ROM.
 * TODO: consider to extract memory mapping to MemoryManager class.
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
 * There is a set method for ROM to switch ROM cartridge.
 * TODO: temporal
 */
RAM.prototype.setROM = function(rom) {
  this.rom = rom;
};


RAM.prototype.load = function(address) {
  return this.uint8[address];
};


RAM.prototype.store = function(address, value) {
  this.uint8[address] = value;
};
