/**
 * Audio Processing Unit implementation.
 * Refer to https://wiki.nesdev.com/w/index.php/APU
 */
function Apu() {
  var self = this;

  // other devices

  this.cpu = null;  // set by .setCpu();

  // CPU memory address mapped registers

  this.pulse0 = new Register8bit();     // 0x4000
  this.pulse1 = new Register8bit();     // 0x4001
  this.pulse2 = new Register8bit();     // 0x4002
  this.pulse3 = new Register8bit();     // 0x4003
  this.pulse4 = new Register8bit();     // 0x4004
  this.pulse5 = new Register8bit();     // 0x4005
  this.pulse6 = new Register8bit();     // 0x4006
  this.pulse7 = new Register8bit();     // 0x4007
  this.triangle0 = new Register8bit();  // 0x4008
  this.triangle1 = new Register8bit();  // 0x4009
  this.triangle2 = new Register8bit();  // 0x400A
  this.triangle3 = new Register8bit();  // 0x400B
  this.noise0 = new Register8bit();     // 0x400C
  this.noise1 = new Register8bit();     // 0x400D
  this.noise2 = new Register8bit();     // 0x400E
  this.noise3 = new Register8bit();     // 0x400F
  this.dmc0 = new Register8bit();       // 0x4010
  this.dmc1 = new Register8bit();       // 0x4011
  this.dmc2 = new Register8bit();       // 0x4012
  this.dmc3 = new Register8bit();       // 0x4013
  this.status = new Register8bit();     // 0x4015
  this.frame = new Register8bit();      // 0x4017

  this.unusedRegister = new Register8bit();
}

Object.assign(Apu.prototype, {
  isApu: true,

  /**
   *
   */
  setCpu: function(cpu) {
    this.cpu = cpu;
  },

  /**
   *
   */
  bootup: function() {

  },

  /**
   *
   */
  reset: function() {

  },

  /**
   *
   */
  runCycle: function() {

  },

  // register callback functions

  // dump

  /**
   *
   */
  dump: function() {

  }
});
