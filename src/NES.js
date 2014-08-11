function NES() {
  this.ppu = new PPU();
  this.cpu = new CPU(this.ppu);

  this.cpu.initMemoryController(this.ppu);
  this.ppu.initMemoryController(this.cpu);

  this.cycle = 0;
};

NES._VBLANK_CYCLE = 0x10000; // TODO: temporal


NES.prototype.setROM = function(rom) {
  this.rom = rom;
  this.cpu.setROM(rom);
  this.ppu.setROM(rom);
};


NES.prototype.run = function() {

  __putMessage('');
  __putMessage('rom dump.');
  __putMessage(this.rom.dump());

  __putMessage('');
  __putMessage('disassemble.');
  __putMessage(this.cpu.disassembleROM());
  this.cpu.interrupt(CPU._INTERRUPT_RESET);

  var cycles = 0x50000;
  __putMessage('');
  __putMessage(__10to16(cycles) + ' cycles run.');
  __putMessage(__10to16(0, 6) + ' ' + this.cpu.dump());

  for(var i = 0; i < cycles; i++) {
    this._runCycle();
    if(i > cycles - 0x100)
      __putMessage(__10to16(i, 6) + ' ' + this.cpu.dump());
/*
    if(i % NES._VBLANK_CYCLE == 0) {
      this.ppu.setVBlank();
      this.cpu.interrupt(CPU._INTERRUPT_NMI);
    }
*/
  }

  __putMessage('');
  __putMessage(this.ppu.dump());

};


NES.prototype._runCycle = function() {
  this.cpu.runCycle();
  this.ppu.runCycle();
};
