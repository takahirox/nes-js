/**
 * RP2A03
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

  //

  /**
   *
   */
  loadRegister: function(address) {
    switch(address) {
      case 0x4000:
        return this.pulse0.load();

      case 0x4001:
        return this.pulse1.load();

      case 0x4002:
        return this.pulse2.load();

      case 0x4003:
        return this.pulse3.load();

      case 0x4004:
        return this.pulse4.load();

      case 0x4005:
        return this.pulse5.load();

      case 0x4006:
        return this.pulse6.load();

      case 0x4007:
        return this.pulse7.load();

      case 0x4008:
        return this.triangle0.load();

      case 0x4009:
        return this.triangle1.load();

      case 0x400A:
        return this.triangle2.load();

      case 0x400B:
        return this.triangle3.load();

      case 0x400C:
        return this.noise0.load();

      case 0x400D:
        return this.noise1.load();

      case 0x400E:
        return this.noise2.load();

      case 0x400F:
        return this.noise3.load();

      case 0x4010:
        return this.dmc0.load();

      case 0x4011:
        return this.dmc1.load();

      case 0x4012:
        return this.dmc2.load();

      case 0x4013:
        return this.dmc3.load();

      case 0x4015:
        return this.status.load();

      case 0x4017:
        return this.frame.load();
    }

    return 0;
  },

  /**
   *
   */
  storeRegister: function(address, value) {
    switch(address) {
      case 0x4000:
        return this.pulse0.store(value);

      case 0x4001:
        return this.pulse1.store(value);

      case 0x4002:
        return this.pulse2.store(value);

      case 0x4003:
        return this.pulse3.store(value);

      case 0x4004:
        return this.pulse4.store(value);

      case 0x4005:
        return this.pulse5.store(value);

      case 0x4006:
        return this.pulse6.store(value);

      case 0x4007:
        return this.pulse7.store(value);

      case 0x4008:
        return this.triangle0.store(value);

      case 0x4009:
        return this.triangle1.store(value);

      case 0x400A:
        return this.triangle2.store(value);

      case 0x400B:
        return this.triangle3.store(value);

      case 0x400C:
        return this.noise0.store(value);

      case 0x400D:
        return this.noise1.store(value);

      case 0x400E:
        return this.noise2.store(value);

      case 0x400F:
        return this.noise3.store(value);

      case 0x4010:
        return this.dmc0.store(value);

      case 0x4011:
        return this.dmc1.store(value);

      case 0x4012:
        return this.dmc2.store(value);

      case 0x4013:
        return this.dmc3.store(value);

      case 0x4015:
        return this.status.store(value);

      case 0x4017:
        return this.frame.store(value);
    }
  },

  // register callback functions

  // dump

  /**
   *
   */
  dump: function() {

  }
});
