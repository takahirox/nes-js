function NES() {
  this.ppu = new PPU();
  this.cpu = new CPU(this.ppu);
  this.pad1 = new Joypad();

  this.rom = null;

  this.cpu.initMemoryController(this.ppu, this.pad1);
  this.ppu.initMemoryController(this.cpu);

  this.count = 0;

  this.state = NES._STATE_POWER_OFF;

  this.fpsDiv = document.getElementById('fps');
  this.oldDate = Date.now();

};

NES._STATE_POWER_OFF = 0;
NES._STATE_RUN       = 1;
NES._STATE_STOP      = 2;


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


NES.prototype.setInstructionDumpFlag = function(flag) {
  this.dumpInstructions = flag;
};


NES.prototype.bootup = function() {
  this.cpu.p.store(0x34);
  this.cpu.sp.store(0xFD);
  this.cpu.interrupt(CPU.prototype._INTERRUPT_RESET);
//  nes.cpu.pc.store(0xc000);
  this.state = NES._STATE_RUN;
};


NES.prototype.stop = function() {
  this.state = NES._STATE_STOP;
};


NES.prototype.resume = function() {
  this.state = NES._STATE_RUN;
  this.run();
};


NES.prototype.run = function() {
  if(this.count % 60 == 0) {
    var newDate = Date.now();
    var fps = parseInt((60*1000) / (newDate - this.oldDate));
    this.fpsDiv.innerText = fps;
    this.oldDate = newDate;
  }
  this.count++;

/*
  var cycles = 341*262/3; // TODO: temporal
  for(var i = 0; i < cycles; i++) {
    this.cpu._runCycle();
  }
*/
  var cycles = 341*262/3/10; // TODO: temporal
  for(var i = 0; i < cycles; i++) {
    this.cpu.runCycle();
    this.ppu.run3Cycles();
    this.cpu.runCycle();
    this.ppu.run3Cycles();
    this.cpu.runCycle();
    this.ppu.run3Cycles();
    this.cpu.runCycle();
    this.ppu.run3Cycles();
    this.cpu.runCycle();
    this.ppu.run3Cycles();
    this.cpu.runCycle();
    this.ppu.run3Cycles();
    this.cpu.runCycle();
    this.ppu.run3Cycles();
    this.cpu.runCycle();
    this.ppu.run3Cycles();
    this.cpu.runCycle();
    this.ppu.run3Cycles();
    this.cpu.runCycle();
    this.ppu.run3Cycles();
  }

  if(this.state == NES._STATE_RUN)
    requestAnimationFrame(this.run.bind(this));
//    setTimeout(this.run.bind(this), 0);
};


NES.prototype._runCycle = function() {
  this.cpu.runCycle();
  this.ppu.run3Cycles();
};


NES.prototype.runStep = function() {
  if(this.state != NES._STATE_STOP)
    return;
  this._runCycle();
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


NES.prototype.dumpCPU = function() {
  return this.cpu.dump();
};


NES.prototype.dumpRAM = function() {
  return this.cpu.dumpRAM();
};


NES.prototype.dumpROM = function() {
  var buffer = '';
  buffer += this.rom.dumpHeader();
  buffer += '\n';
  buffer += this.rom.dump();
  buffer += '\n';
  buffer += this.cpu.disassembleROM();
  buffer += '\n';
  return buffer;
};


NES.prototype.dumpPPU = function() {
  return this.ppu.dump();
};


NES.prototype.dumpVRAM = function() {
  return this.ppu.dumpVRAM();
};


NES.prototype.dumpSPRRAM = function() {
  return this.ppu.dumpSPRRAM();
};
