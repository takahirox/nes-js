/**
 * PPU VRAM.
 */
function VRAM() {
  this.parent = GenericMemory;
  this.parent.call(this, VRAM._CAPACITY);
};
__inherit(VRAM, GenericMemory);

VRAM._CAPACITY = 64 * 1024; // 64KB
