function NES() {
  this.ppu = new PPU();
  this.cpu = new CPU(this.ppu);
  this.pad1 = new Joypad();

  this.rom = null;

  this.cpu.initMemoryController(this.ppu, this.pad1);
  this.ppu.initMemoryController(this.cpu);

  this.cycle = 0;
};

// TODO: temporal
NES._PAD_BUTTON_TABLE = {
  13: Joypad._BUTTON_START,
  32: Joypad._BUTTON_SELECT,
  37: Joypad._BUTTON_LEFT,
  38: Joypad._BUTTON_UP,
  39: Joypad._BUTTON_RIGHT,
  40: Joypad._BUTTON_DOWN,
  88: Joypad._BUTTON_B,
  90: Joypad._BUTTON_A
};


NES.prototype.setROM = function(rom) {
  this.rom = rom;
  this.cpu.setROM(rom);
  this.ppu.setROM(rom);
};


NES.prototype.setDisplay = function(display) {
  this.ppu.setDisplay(display);
};


NES.prototype.run = function() {
  var cycles = 0x7454;
  for(var i = 0; i < cycles; i++) {
    this._runCycle();
  }
  setTimeout(this.run.bind(this), 0);
};


NES.prototype._runCycle = function() {
  this.cpu.runCycle();
  this.ppu.runCycle();
  this.ppu.runCycle();
  this.ppu.runCycle();
};


NES.prototype.handleKeyDown = function(e) {
  if(NES._PAD_BUTTON_TABLE[e.keyCode] != undefined)
    this.pad1.pushButton(NES._PAD_BUTTON_TABLE[e.keyCode]);
  e.preventDefault();
};


NES.prototype.handleKeyUp = function(e) {
  if(NES._PAD_BUTTON_TABLE[e.keyCode] != undefined)
    this.pad1.releaseButton(NES._PAD_BUTTON_TABLE[e.keyCode]);
  e.preventDefault();
};
