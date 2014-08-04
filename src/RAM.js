/**
 * CPU RAM.
 * This class represents physical CPU RAM and also supports CPU memory mapping.
 * It's a temporal implementation that this class has ROM.
 * TODO: consider to extract memory mapping to MemoryManager class.
 */
function RAM() {
  this.parent = GenericMemory;
  this.parent.call(this, RAM._CAPACITY);
  this.rom = null;
};
__inherit(RAM, GenericMemory);

RAM._CAPACITY = 64 * 1024; // 64KB


/**
 * There is a set method for ROM to switch ROM cartridge.
 * TODO: temporal
 */
RAM.prototype.setROM = function(rom) {
  this.rom = rom;
};
