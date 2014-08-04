function NES() {
  this.ram = new RAM();
  this.ppu = new PPU();
  this.cpu = new CPU(this.ram, this.ppu);
  this.cycle = 0;
};


NES.prototype.setROM = function(rom) {
  this.rom = rom;
  this.ram.setROM(rom);
  this.cpu.setROM(rom);
};


NES.prototype.run = function() {
  __putMessage('');
  __putMessage('all dump.');
  __putMessage(this.rom.dump());

  __putMessage('');
  __putMessage('disassemble.');
  __putMessage(this.cpu.disassembleROM());
  this.cpu.interrupt(CPU._INTERRUPT_RESET);

  var cycles = 0x30E00;
  __putMessage('');
  __putMessage(__10to16(cycles) + ' cycles run.');
  __putMessage(__10to16(0, 6) + ' ' + this.cpu.dump());

  for(var i = 0; i < cycles-0x100; i++) {
    this._runCycle();
//    __putMessage(__10to16(i, 6) + ' ' + this.cpu.dump());
  }

  for(var i = cycles-0x100; i < cycles; i++) {
    this._runCycle();
    __putMessage(__10to16(i, 6) + ' ' + this.cpu.dump());
  }

  for(var j = 0; j < 0x100; j++) {
    this.cpu.interrupt(CPU._INTERRUPT_NMI);
    for(var i = 0; i < 0x100; i++) {
      this._runCycle();
//      __putMessage(__10to16(i, 6) + ' ' + this.cpu.dump());
    }
  }

  __putMessage('');
  __putMessage('VRAM dump.');
  __putMessage(this.ppu.vram.dump());

};


NES.prototype._runCycle = function() {
  this.cpu.runCycle();
  this.ppu.runCycle();
};
