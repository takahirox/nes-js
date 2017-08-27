function NES() {
  this.ppu = new PPU();
  this.cpu = new CPU(this.ppu);
  this.pad1 = new Joypad();

  this.rom = null;

  this.cpu.initMemoryController(this.ppu, this.pad1);
  this.ppu.initMemoryController(this.cpu);

  this.count = 0;

  this.state = this._STATE_POWER_OFF;

  this.fpsDiv = document.getElementById('fps');
  this.oldDate = Date.now();

  var self = this;
  this.runFunc = function() { self.run(); };
};

NES.prototype._STATE_POWER_OFF = 0;
NES.prototype._STATE_RUN       = 1;
NES.prototype._STATE_STOP      = 2;


// TODO: temporal
NES.prototype._PAD_BUTTON_TABLE = {
  13: Joypad.BUTTONS.START,
  32: Joypad.BUTTONS.SELECT,
  37: Joypad.BUTTONS.LEFT,
  38: Joypad.BUTTONS.UP,
  39: Joypad.BUTTONS.RIGHT,
  40: Joypad.BUTTONS.DOWN,
  88: Joypad.BUTTONS.B,
  90: Joypad.BUTTONS.A
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


/**
 * TODO: remove Magic numbers.
 */
NES.prototype.bootup = function() {
  this.cpu.p.store(0x34);
  this.cpu.sp.store(0xFD);
  this.cpu.interrupt(CPU.prototype._INTERRUPT_RESET);
  this.state = this._STATE_RUN;
};


NES.prototype.stop = function() {
  this.state = this._STATE_STOP;
};


NES.prototype.resume = function() {
  this.state = this._STATE_RUN;
  this.run();
};


/**
 * Note: This is one of the heaviest functions
 *       though almost only calling functions.
 *       Is there any ways to reduce calling function cost?
 */
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

  /*
   * Note: using the following techniques for the performance
   *       1. unrolling
   *       2. inlining
   *       3. loop value reversion
   */
  var cycles = (341*262/3/10) | 0; // TODO: temporal
  var cpu = this.cpu;
  var ppu = this.ppu;
  for(var i = cycles; i--; ) {
    cpu.runCycle();
    ppu.run3Cycles();
    cpu.runCycle();
    ppu.run3Cycles();
    cpu.runCycle();
    ppu.run3Cycles();
    cpu.runCycle();
    ppu.run3Cycles();
    cpu.runCycle();
    ppu.run3Cycles();
    cpu.runCycle();
    ppu.run3Cycles();
    cpu.runCycle();
    ppu.run3Cycles();
    cpu.runCycle();
    ppu.run3Cycles();
    cpu.runCycle();
    ppu.run3Cycles();
    cpu.runCycle();
    ppu.run3Cycles();
  }

  if(this.state == this._STATE_RUN)
    requestAnimationFrame(this.runFunc);
};


NES.prototype._runCycle = function() {
  this.cpu.runCycle();
  this.ppu.run3Cycles();
};


NES.prototype.runStep = function() {
  if(this.state != this._STATE_STOP)
    return;

  do {
    this._runCycle();
  } while(this.cpu.handling > 0)
};


NES.prototype.handleKeyDown = function(e) {
  if(this._PAD_BUTTON_TABLE[e.keyCode] !== void 0)
    this.pad1.pressButton(this._PAD_BUTTON_TABLE[e.keyCode]);
  e.preventDefault();
};


NES.prototype.handleKeyUp = function(e) {
  if(this._PAD_BUTTON_TABLE[e.keyCode] !== void 0)
    this.pad1.releaseButton(this._PAD_BUTTON_TABLE[e.keyCode]);
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
