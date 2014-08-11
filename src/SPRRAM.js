function SPRRAM() {
  this.parent = GenericMemory;
  this.parent.call(this, SPRRAM._CAPACITY);
};
__inherit(SPRRAM, GenericMemory);

SPRRAM._CAPACITY = 256; // 256 bytes
