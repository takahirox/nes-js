import {Register8bit} from './Register.js';


/**
 * RP2A03(NTSC)
 * Audio Processing Unit implementation. Consists of
 *   - Pulse 1/2 channel
 *   - Triangle channel
 *   - Noise channel
 *   - DMC channel
 *
 * Refer to https://wiki.nesdev.com/w/index.php/APU
 */
function Apu() {
  // other devices

  this.cpu = null;  // set by .setCpu()

  //

  this.audio = null;  // set by .setAudio()

  // APU units, CPU memory address mapped registers

  this.pulse1 = new ApuPulse(true);   // 0x4000 - 0x4003
  this.pulse2 = new ApuPulse(false);  // 0x4004 - 0x4007
  this.triangle = new ApuTriangle();  // 0x4008 - 0x400B
  this.noise = new ApuNoise();        // 0x400C - 0x400F
  this.dmc = new ApuDmc(this);        // 0x4010 - 0x4013

  this.status = new ApuStatusRegister();  // 0x4015
  this.frame = new ApuFrameRegister();    // 0x4017

  //

  this.cycle = 0;
  this.step = 0;
  this.samplePeriod = 0; // set by .setAudio()

  //

  this.frameIrqActive = false;
  this.dmcIrqActive = false;
}

Object.assign(Apu.prototype, {
  isApu: true,

  // public methods

  /**
   *
   */
  setCpu: function(cpu) {
    this.cpu = cpu;
  },

  /**
   *
   */
  setAudio: function(audio) {
    this.audio = audio;

    // CPU clock frequency 1.789773 MHz

    this.samplePeriod = (1789773 / this.audio.getSampleRate()) | 0;
  },

  /**
   *
   */
  bootup: function() {
    this.status.store(0x00);
  },

  /**
   *
   */
  reset: function() {

  },

  /**
   * Expects being called with CPU clock
   */
  runCycle: function() {
    this.cycle++;

    // Sampling at sample rate timing
    // @TODO: Fix me, more precise timing

    if((this.cycle % this.samplePeriod) === 0)
      this.sample();

    // Timers
    // Clocked on every CPU cycles for triangle and 2CPU cycles for others

    if((this.cycle % 2) === 0) {
      this.pulse1.driveTimer();
      this.pulse2.driveTimer();
      this.noise.driveTimer();
      this.dmc.driveTimer();
    }

    this.triangle.driveTimer();

    // 240Hz Frame sequencer
    // @TODO: Fix me, more precise timing

    if((this.cycle % 7457) === 0) {
      if(this.frame.isFiveStepMode() === true) {

        // Five-step sequence
        //
        // 0 1 2 3 4    function
        // -----------  -----------------------------
        // - - - - -    IRQ (if bit 6 is clear)
        // l - l - -    Length counter and sweep
        // e e e e -    Envelope and linear counter

        if(this.step < 4) {
          this.pulse1.driveEnvelope();
          this.pulse2.driveEnvelope();
          this.triangle.driveLinear();
          this.noise.driveEnvelope();
        }

        if(this.step === 0 || this.step === 2) {
          this.pulse1.driveLength();
          this.pulse1.driveSweep();
          this.pulse2.driveLength();
          this.pulse2.driveSweep();
          this.triangle.driveLength();
          this.noise.driveLength();
        }

        this.step = (this.step + 1) % 5;
      } else {

        // Four-step sequence
        //
        // 0 1 2 3    function
        // ---------  -----------------------------
        // - - - f    IRQ (if bit 6 is clear)
        // - l - l    Length counter and sweep
        // e e e e    Envelope and linear counter

        this.pulse1.driveEnvelope();
        this.pulse2.driveEnvelope();
        this.triangle.driveLinear();
        this.noise.driveEnvelope();

        if(this.step === 1 || this.step === 3) {
          this.pulse1.driveLength();
          this.pulse1.driveSweep();
          this.pulse2.driveLength();
          this.pulse2.driveSweep();
          this.triangle.driveLength();
          this.noise.driveLength();
        }

        if(this.step === 3 && this.frame.disabledIrq() === false)
          this.frameIrqActive = true;

        // Seems like keep invoking IRQ once frame IRQ flag is on
        // until IRQ flag is cleared or it's disabled...?
        // @TODO: check sending IRQ timing

        if(this.frameIrqActive === true && this.frame.disabledIrq() === false)
          this.cpu.interrupt(this.cpu.INTERRUPTS.IRQ);

        this.step = (this.step + 1) % 4;
      }

      // @TODO: check sending IRQ timing

      if(this.dmcIrqActive === true)
          this.cpu.interrupt(this.cpu.INTERRUPTS.IRQ);
    }
  },

  // load/store CPU memory address mapped register methods called by CPU

  /**
   *
   */
  loadRegister: function(address) {
    switch(address) {
      case 0x4015:

        // Loading status register
        //
        // bit
        //   7: DMC interrupt
        //   6: Frame interrupt
        //   4: DMC remaining bytes > 0
        //   3: Noise length counter > 0
        //   2: Triangle length couter > 0
        //   1: Pulse2 length counter > 0
        //   0: Pulse1 length counter > 0

        var value = 0;

        value |= (this.dmcIrqActive === true ? 1 : 0) << 7;
        value |= (this.frameIrqActive === true &&
                   this.frame.disabledIrq() === false ? 1 : 0) << 6;
        value |= (this.dmc.remainingBytes > 0 ? 1 : 0) << 4;
        value |= (this.noise.lengthCounter > 0 ? 1 : 0) << 3;
        value |= (this.triangle.lengthCounter > 0 ? 1 : 0) << 2;
        value |= (this.pulse2.lengthCounter > 0 ? 1 : 0) << 1;
        value |= (this.pulse1.lengthCounter > 0 ? 1 : 0) << 0;

        // Loading status register clears the frame IRQ flag

        this.frameIrqActive = false;

        return value;
    }

    return 0;
  },

  /**
   *
   */
  storeRegister: function(address, value) {
    switch(address) {
      case 0x4000:
      case 0x4001:
      case 0x4002:
      case 0x4003:
        this.pulse1.storeRegister(address, value);
        break;

      case 0x4004:
      case 0x4005:
      case 0x4006:
      case 0x4007:
        this.pulse2.storeRegister(address, value);
        break;

      case 0x4008:
      case 0x4009:
      case 0x400A:
      case 0x400B:
        this.triangle.storeRegister(address, value);
        break;

      case 0x400C:
      case 0x400D:
      case 0x400E:
      case 0x400F:
        this.noise.storeRegister(address, value);
        break;

      case 0x4010:
      case 0x4011:
      case 0x4012:
      case 0x4013:
        this.dmc.storeRegister(address, value);
        break;

      case 0x4015:

        // Storing status register
        //
        // bit: Enable(1) / Disable(0)
        //   4: DMC unit
        //   3: Noise unit
        //   2: Triangle unit
        //   1: Pulse2 unit
        //   0: Pulse1 unit
        //
        // Writing a zero to any of channel enables bits will
        // set its length counter/remaining bytes to zero.

        this.status.store(value);

        this.dmc.setEnable((value & 0x10) === 0x10);
        this.noise.setEnable((value & 0x8) === 0x8);
        this.triangle.setEnable((value & 0x4) === 0x4);
        this.pulse2.setEnable((value & 0x2) === 0x2);
        this.pulse1.setEnable((value & 0x1) === 0x1);

        // Storing status register clears the DMC interrupt flag

        this.dmcIrqActive = false;

        break;

      case 0x4017:

        // Storing frame counter register

        this.frame.store(value);

        // If interrupt inhibit flag is set, the frame IRQ flag is cleared.

        if(this.frame.disabledIrq() === true)
          this.frameIrqActive = false;

        break;
    }
  },

  // private method

  /**
   *
   */
  sample: function() {

    // Calculates the audio output within the range of 0.0 to 1.0.
    // Refer to https://wiki.nesdev.com/w/index.php/APU_Mixer

    var pulse1 = this.pulse1.output();
    var pulse2 = this.pulse2.output();
    var triangle = this.triangle.output();
    var noise = this.noise.output();
    var dmc = this.dmc.output();

    var pulseOut = 0;
    var tndOut = 0;

    if(pulse1 !== 0 || pulse2 !== 0)
      pulseOut = 95.88 / ((8128 / (pulse1 + pulse2)) + 100);

    if(triangle !== 0 || noise !== 0 || dmc !== 0)
      tndOut = 159.79 / (1 / (triangle / 8227 + noise / 12241 + dmc / 22638) + 100);

    this.audio.push(pulseOut + tndOut);
  },

  // dump

  /**
   *
   */
  dump: function() {

  }
});

/**
 *
 */
function ApuUnit(apu) {
  this.apu = apu;
}

// Refer to https://wiki.nesdev.com/w/index.php/APU_Length_Counter

ApuUnit.LENGTH_TABLE = [
  0x0A, 0xFE, 0x14, 0x02, 0x28, 0x04, 0x50, 0x06,
  0xA0, 0x08, 0x3C, 0x0A, 0x0E, 0x0C, 0x1A, 0x0E,
  0x0C, 0x10, 0x18, 0x12, 0x30, 0x14, 0x60, 0x16,
  0xC0, 0x18, 0x48, 0x1A, 0x10, 0x1C, 0x20, 0x1E
];

/**
 * Apu Pulse channel. Consists of
 *   - Timer
 *   - Length counter
 *   - Envelope
 *   - Sweep
 */
function ApuPulse(isChannel1) {

  this.isChannel1 = isChannel1;

  // CPU memory address mapped registers

  // 0x4000 / 0x4004
  //
  // bit:
  // 7-6: Duty cycle
  //   5: Length counter halt
  //   4: Enable envelope
  // 3-0: Envelope divider period

  // 0x4001 / 0x4005
  //
  // bit:
  //   7: Enable sweep
  // 6-4: Period
  //   3: Negate
  // 2-0: Shift amount per period

  // 0x4002 / 0x4006
  //
  // bit:
  // 7-0: Timer low 8-bit

  // 0x4003 / 0x4007
  //
  // bit:
  // 7-3: Length counter index
  // 2-0: Timer high 3-bit

  this.register0 = new Register8bit();  // 0x4000 / 0x4004
  this.register1 = new Register8bit();  // 0x4001 / 0x4005
  this.register2 = new Register8bit();  // 0x4002 / 0x4006
  this.register3 = new Register8bit();  // 0x4003 / 0x4007

  //

  this.enabled = false;

  //

  this.timerCounter = 0;
  this.timerPeriod = 0;
  this.timerSequence = 0;

  this.envelopeStartFlag = true;
  this.envelopeCounter = 0;
  this.envelopeDecayLevelCounter = 0;

  this.lengthCounter = 0;

  this.sweepReloadFlag = false;
  this.sweepCycle = 0;
  this.sweepCounter = 0;
}

Object.assign(ApuPulse.prototype, {
  isApuPulse: true,

  //

  LENGTH_TABLE: ApuUnit.LENGTH_TABLE,

  DUTY_TABLE: [
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0],
    [1, 0, 0, 1, 1, 1, 1, 1],
  ],

  //

  /**
   *
   */
  storeRegister: function(address, value) {
    switch(address) {
      case 0x4000:
      case 0x4004:
        this.register0.store(value);

        break;

      case 0x4001:
      case 0x4005:
        this.register1.store(value);

        // Side effect
        //   - Sets the sweep reload flag

        this.sweepReloadFlag = true;

        break;

      case 0x4002:
      case 0x4006:
        this.register2.store(value);
        this.timerPeriod = this.getTimer();

        break;

      case 0x4003:
      case 0x4007:
        this.register3.store(value);

        // Side effects
        //   - If the enabled flag is set, the length counter is reloaded
        //   - The envelope is restarted
        //   - The sequencer is immediately restarted at the first value of the current
        //     sequence. The period divider is not reset.

        if(this.enabled === true)
          this.lengthCounter = this.LENGTH_TABLE[this.getLengthCounterIndex()];

        this.timerPeriod = this.getTimer();
        this.timerSequence = 0;
        this.envelopeStartFlag = true;

        break;
    }
  },

  //

  /**
   *
   */
  setEnable: function(enabled) {
    this.enabled = enabled;

    // When the enabled bit is cleared (via $4015), the length counter is forced to 0

    if(enabled === false)
      this.lengthCounter = 0;
  },

  /**
   *
   */
  getDuty: function() {
    return this.register0.loadBits(6, 2);
  },

  /**
   *
   */
  enabledEnvelopeLoop: function() {
    return this.register0.isBitSet(5);
  },

  /**
   *
   */
  disabledEnvelope: function() {
    return this.register0.isBitSet(4);
  },

  /**
   *
   */
  getEnvelopePeriod: function() {
    return this.register0.loadBits(0, 4);
  },

  /**
   *
   */
  enabledSweep: function() {
    return this.register1.isBitSet(7);
  },

  /**
   *
   */
  getSweepPeriod: function() {
    return this.register1.loadBits(4, 3);
  },

  /**
   *
   */
  negatedSweep: function() {
    return this.register1.isBitSet(3);
  },

  /**
   *
   */
  getSweepShiftAmount: function() {
    return this.register1.loadBits(0, 3);
  },

  /**
   *
   */
  getTimerLow: function() {
    return this.register2.load();
  },

  /**
   *
   */
  getTimerHigh: function() {
    return this.register3.loadBits(0, 3);
  },

  /**
   *
   */
  getTimer: function() {
    return ((this.getTimerHigh() << 8) | this.getTimerLow());
  },

  /**
   *
   */
  getLengthCounterIndex: function() {
    return this.register3.loadBits(3, 5);
  },

  //

  /**
   *
   */
  driveTimer: function() {
    if(this.timerCounter > 0) {
      this.timerCounter--;
    } else {
      this.timerCounter = this.timerPeriod;
      this.timerSequence++;

      // 8-step sequencer

      if(this.timerSequence === 8)
        this.timerSequence = 0;
    }
  },

  /**
   *
   */
  driveLength: function() {
    if(this.disabledEnvelope() === false && this.lengthCounter > 0)
      this.lengthCounter--;
  },

  /**
   *
   */
  driveEnvelope: function() {
    if(this.envelopeStartFlag === true) {
      this.envelopeCounter = this.getEnvelopePeriod();
      this.envelopeDecayLevelCounter = 0xF;
      this.envelopeStartFlag = false;
      return;
    }

    if(this.envelopeCounter > 0) {
      this.envelopeCounter--;
    } else {
      this.envelopeCounter = this.getEnvelopePeriod();

      if(this.envelopeDecayLevelCounter > 0)
        this.envelopeDecayLevelCounter--;
      else if(this.envelopeDecayLevelCounter === 0 && this.enabledEnvelopeLoop() === true)
        this.envelopeDecayLevelCounter = 0xF;
    }
  },

  /**
   *
   */
  driveSweep: function() {
    if(this.sweepCounter === 0 && this.enabledSweep() === true &&
        this.getSweepShiftAmount() !== 0 &&
        this.timerPeriod >= 8 && this.timerPeriod <= 0x7FF) {
      var change = this.timerPeriod >> this.getSweepShiftAmount();

      // In negated mode, Pulse 1 adds the ones' complement while
      // Pulse 2 adds the twos' complement

      if(this.negatedSweep() === true) {
        change = -change;

        if(this.isChannel1 === true)
          change--;
      }

      this.timerPeriod += change;
    }

    if(this.sweepReloadFlag === true || this.sweepCounter === 0) {
      this.sweepReloadFlag = false;
      this.sweepCounter = this.getSweepPeriod();
    } else {
      this.sweepCounter--;
    }
  },

  /**
   *
   */
  output: function() {
    if(this.lengthCounter === 0 || this.timerPeriod < 8 || this.timerPeriod > 0x7FF ||
        this.DUTY_TABLE[this.getDuty()][this.timerSequence] === 0)
      return 0;

    // 4-bit output

    return (this.disabledEnvelope() === true ? this.getEnvelopePeriod() : this.envelopeDecayLevelCounter) & 0xF;
  }
});

/**
 * Apu Triangle channel. Consists of
 *   - Timer
 *   - Length counter
 *   - Linear counter
 */
function ApuTriangle() {

  // CPU memory address mapped registers

  // 0x4008
  //
  // bit:
  //   7: Length counter halt
  // 6-0: Linear counter period

  // 0x4009
  //
  // Unused

  // 0x400A
  //
  // bit:
  // 7-0: Timer low 8-bit

  // 0x400B
  //
  // bit:
  // 7-3: Length counter index
  // 2-0: Timer high 3-bit

  this.register0 = new Register8bit();  // 0x4008
  this.register1 = new Register8bit();  // 0x4009
  this.register2 = new Register8bit();  // 0x400A
  this.register3 = new Register8bit();  // 0x400B

  //

  this.enabled = false;

  //

  this.timerCounter = 0;
  this.timerSequence = 0;

  this.lengthCounter = 0;

  this.linearReloadFlag = false;
  this.linearCounter = 0;
}

Object.assign(ApuTriangle.prototype, {
  isApuTriangle: true,

  //

  LENGTH_TABLE: ApuUnit.LENGTH_TABLE,

  SEQUENCE_TABLE: [
    15, 14, 13, 12, 11, 10,  9,  8,
     7,  6,  5,  4,  3,  2,  1,  0,
     0,  1,  2,  3,  4,  5,  6,  7,
     8,  9, 10, 11, 12, 13, 14, 15
  ],

  //

  /**
   *
   */
  storeRegister: function(address, value) {
    switch(address) {
      case 0x4008:
        this.register0.store(value);
        break;

      case 0x4009:
        this.register1.store(value);
        break;

      case 0x400A:
        this.register2.store(value);
        break;

      case 0x400B:
        this.register3.store(value);

        // Side effects
        //   - If the enabled flag is set, the length counter is reloaded
        //   - Sets the linear counter reload flag
        //   - The sequencer is immediately restarted at the first value of the current
        //     sequence. The period divider is not reset.

        if(this.enabled === true)
          this.lengthCounter = this.LENGTH_TABLE[this.getLengthCounterIndex()];

        this.timerSequence = 0;
        this.linearReloadFlag = true;

        break;
    }
  },

  //

  /**
   *
   */
  setEnable: function(enabled) {
    this.enabled = enabled;

    // When the enabled bit is cleared (via $4015), the length counter is forced to 0

    if(enabled === false)
      this.lengthCounter = 0;
  },

  /**
   *
   */
  getLinearCounter: function() {
    return this.register0.loadBits(0, 7);
  },

  /**
   *
   */
  disabledLengthCounter: function() {
    return this.register0.isBitSet(7);
  },

  /**
   *
   */
  getLengthCounterIndex: function() {
    return this.register3.loadBits(3, 5);
  },

  /**
   *
   */
  getTimerLow: function() {
    return this.register2.load();
  },

  /**
   *
   */
  getTimerHigh: function() {
    return this.register3.loadBits(0, 3);
  },

  /**
   *
   */
  getTimer: function() {
    return (this.getTimerHigh() << 8) | this.getTimerLow();
  },

  //

  /**
   *
   */
  driveTimer: function() {
    if(this.timerCounter > 0) {
      this.timerCounter--;
    } else {
      this.timerCounter = this.getTimer();

      // The sequencer is clocked by the timer as long as
      // both the linear counter and the length counter are nonzero.

      if(this.lengthCounter > 0 && this.linearCounter > 0) {
        this.timerSequence++;

        // 32-step sequencer

        if(this.timerSequence === 32)
          this.timerSequence = 0;
      }
    }
  },

  /**
   *
   */
  driveLinear: function() {
    if(this.linearReloadFlag === true)
      this.linearCounter = this.getLinearCounter();
    else if(this.linearCounter > 0)
      this.linearCounter--;

    if(this.disabledLengthCounter() === false)
      this.linearReloadFlag = false;
  },

  /**
   *
   */
  driveLength: function() {
    if(this.disabledLengthCounter() === false && this.lengthCounter > 0)
      this.lengthCounter--;
  },

  /**
   *
   */
  output: function() {
    if(this.enabled === false || this.lengthCounter === 0 ||
        this.linearCounter === 0 || this.getTimer() < 2)
      return 0;

    // 4-bit output

    return this.SEQUENCE_TABLE[this.timerSequence] & 0xF;
  }
});

/**
 * Apu Noise channel. Consists of
 *   - Timer
 *   - Length counter
 *   - Envelope
 *   - Linear feedback shift register
 */
function ApuNoise() {

  // CPU memory address mapped registers

  // 0x400C
  //
  // bit:
  //   5: Length counter halt
  //   4: Disable envelope
  // 3-0: Envelope

  // 0x400D
  //
  // Unused

  // 0x400E
  //
  // bit:
  //   7: Loop noise
  // 3-0: Noise period

  // 0x400F
  //
  // bit:
  // 7-3: Length counter index

  this.register0 = new Register8bit();  // 0x400C
  this.register1 = new Register8bit();  // 0x400D
  this.register2 = new Register8bit();  // 0x400E
  this.register3 = new Register8bit();  // 0x400F

  //

  this.enabled = false;

  //

  this.timerCounter = 0;
  this.timerPeriod = 0;

  this.envelopeStartFlag = false;
  this.envelopeCounter = 0;
  this.envelopeDecayLevelCounter = 0;

  this.lengthCounter = 0;

  this.shiftRegister = 1;  // 15-bit register
}

Object.assign(ApuNoise.prototype, {
  isApuNoise: true,

  //

  LENGTH_TABLE: ApuUnit.LENGTH_TABLE,

  TIMER_TABLE: [
    0x004, 0x008, 0x010, 0x020,
    0x040, 0x060, 0x080, 0x0A0,
    0x0CA, 0x0FE, 0x17C, 0x1FC,
    0x2FA, 0x3F8, 0x7F2, 0xFE4
  ],

  //

  /**
   *
   */
  storeRegister: function(address, value) {
    switch(address) {
      case 0x400C:
        this.register0.store(value);
        break;

      case 0x400D:
        this.register1.store(value);
        break;

      case 0x400E:
        this.register2.store(value);
        this.timerPeriod = this.TIMER_TABLE[this.getTimerIndex()]

        break;

      case 0x400F:
        this.register3.store(value);

        // Side effects
        //   - If the enabled flag is set, the length counter is reloaded
        //   - The envelope is restarted

        if(this.enabled === true)
          this.lengthCounter = this.LENGTH_TABLE[this.getLengthCounterIndex()];

        this.envelopeStartFlag = true;

        break;
    }
  },

  //

  /**
   *
   */
  setEnable: function(enabled) {
    this.enabled = enabled;

    // When the enabled bit is cleared (via $4015), the length counter is forced to 0

    if(enabled === false)
      this.lengthCounter = 0;
  },

  /**
   *
   */
  disabledLengthCounter: function() {
    return this.register0.isBitSet(5);
  },

  /**
   *
   */
  disabledEnvelope: function() {
    return this.register0.isBitSet(4);
  },

  /**
   *
   */
  getEnvelopePeriod: function() {
    return this.register0.loadBits(0, 4);
  },

  /**
   *
   */
  isRandom: function() {
    return this.register2.isBitSet(7);
  },

  /**
   *
   */
  getTimerIndex: function() {
    return this.register2.loadBits(0, 4);
  },

  /**
   *
   */
  getLengthCounterIndex: function() {
    return this.register3.loadBits(3, 5);
  },

  //

  /**
   *
   */
  driveTimer: function() {
    if(this.timerCounter > 0) {
      this.timerCounter--;
    } else {
      this.timerCounter = this.timerPeriod;

      // Feedback is calculated as the exclusive-OR of bit 0
      // and another bit: bit 6 if Mode flag is set, otherwise bit 1.

      var feedback = (this.shiftRegister & 1) ^
                       ((this.shiftRegister >> (this.isRandom() === true ? 6 : 1)) & 1);

      this.shiftRegister = (feedback << 14) | (this.shiftRegister >> 1);
    }
  },

  /**
   *
   */
  driveEnvelope: function() {
    if(this.envelopeStartFlag === true) {
      this.envelopeCounter = this.getEnvelopePeriod();
      this.envelopeDecayLevelCounter = 0xF;
      this.envelopeStartFlag = false;
      return;
    }

    if(this.envelopeCounter > 0) {
      this.envelopeCounter--;
    } else {
      this.envelopeCounter = this.getEnvelopePeriod();

      if(this.envelopeDecayLevelCounter > 0)
        this.envelopeDecayLevelCounter--;
      else if(this.envelopeDecayLevelCounter === 0 && this.disabledLengthCounter() === true)
        this.envelopeDecayLevelCounter = 0xF;
    }
  },

  /**
   *
   */
  driveLength: function() {
    if(this.disabledLengthCounter() === false && this.lengthCounter > 0)
      this.lengthCounter--;
  },

  /**
   *
   */
  output: function() {
    if(this.lengthCounter === 0 || (this.shiftRegister & 1) === 1)
      return 0;

    // 4-bit output

    return (this.disabledEnvelope() === true ? this.getEnvelopePeriod() : this.envelopeDecayLevelCounter) & 0xF;
  }
});

/**
 * Apu DMC channel. Consists of
 *   - Timer
 *   - Memory reader
 *   - Sample buffer
 *   - Output unit
 */
function ApuDmc(apu) {
  this.apu = apu;

  // 0x4010
  //
  // bit:
  //   7: IRQ enable
  //   6: Loop
  // 3-0: Timer index

  // 0x4011
  //
  // bit:
  // 6-0: Delta counter
  // Unused

  // 0x4012
  //
  // bit:
  // 7-0: Sample address

  // 0x4013
  //
  // bit:
  // 7-0: Sample length

  this.register0 = new Register8bit();  // 0x4010
  this.register1 = new Register8bit();  // 0x4011
  this.register2 = new Register8bit();  // 0x4012
  this.register3 = new Register8bit();  // 0x4013

  //

  this.enabled = false;

  //

  this.timerPeriod = 0;
  this.timerCounter = 0;

  this.deltaCounter = 0;
  this.addressCounter = 0;
  this.remainingBytesCounter = 0;

  this.sampleBuffer = 0;  // 8-bit
  this.sampleBufferIsEmpty = true;

  this.shiftRegister = 0;
  this.remainingBitsCounter = 0;

  this.silenceFlag = true;
}

Object.assign(ApuDmc.prototype, {
  isApuDmc: true,

  //

  TIMER_TABLE: [
    0x1AC, 0x17C, 0x154, 0x140,
    0x11E, 0x0FE, 0x0E2, 0x0D6,
    0x0BE, 0x0A0, 0x08E, 0x080,
    0x06A, 0x054, 0x048, 0x036
  ],

  //

  /**
   *
   */
  storeRegister: function(address, value) {
    switch(address) {
      case 0x4010:
        this.register0.store(value);
        this.timerPeriod = this.TIMER_TABLE[this.getTimerIndex()] >> 1;

        break;

      case 0x4011:
        this.register1.store(value);
        this.start();

        break;

      case 0x4012:
        this.register2.store(value);
        this.start();

        break;

      case 0x4013:
        this.register3.store(value);
        this.start();

        break;
    }
  },

  //

  /**
   *
   */
  setEnable: function(enabled) {
    this.enabled = enabled;

    // If DMC enable flag is set via 0x4015,
    // the DMC sample will be restarted only if its remaining bytes is 0.

    if(enabled === true) {
      if(this.remainingBytesCounter === 0)
        this.start();
    } else {
      this.remainingBytesCounter = 0;
    }
  },

  /**
   *
   */
  start: function() {
    this.deltaCounter = this.getDeltaCounter();
    this.addressCounter = this.getSampleAddress() * 0x40 + 0xC000;
    this.remainingBytesCounter = this.getSampleLength() * 0x10 + 1;
  },

  /**
   *
   */
  enabledIrq: function() {
    return this.register0.isBitSet(7);
  },

  /**
   *
   */
  isLoop: function() {
    return this.register0.isBitSet(6);
  },

  /**
   *
   */
  getTimerIndex: function() {
    return this.register0.loadBits(0, 4);
  },

  /**
   *
   */
  getDeltaCounter: function() {
    return this.register1.loadBits(0, 7);
  },

  /**
   *
   */
  getSampleAddress: function() {
    return this.register2.load();
  },

  /**
   *
   */
  getSampleLength: function() {
    return this.register3.load();
  },

  //

  /**
   *
   */
  driveTimer: function() {
    if(this.timerCounter > 0) {
      this.timerCounter--;
    } else {
      this.timerCounter = this.timerPeriod;

      // Memory reader

      if(this.remainingBytesCounter > 0 && this.sampleBufferIsEmpty === true) {
        this.sampleBuffer = this.apu.cpu.load(this.sampleAddress++);
        this.sampleBufferIsEmpty = false;

        // if address exceeds 0xFFFF, it is wrapped around to 0x8000.

        if(this.sampleAddress > 0xFFFF)
          this.sampleAddress = 0x8000;

        this.remainingBytesCounter--;

        // If the bytes remaining counter becomes zero
        //   - the sample is restarted if the loop flag is set
        //   - otherwise, the interrupt flag is set if IRQ enabled flag is set

        if(this.remainingBytesCounter === 0) {
          if(this.isLoop() === true) {
            this.start();
          } else {
            if(this.enabledIrq() === true)
              this.apu.dmcIrqActive = true;
          }
        }

        // The CPU is stalled for up to 4 CPU cycles

        this.apu.cpu.stallCycle += 4;
      }

      // Output unit

      if(this.remainingBitsCounter === 0) {
        this.remainingBitsCounter = 8;

        if(this.sampleBufferIsEmpty === true) {
          this.silenceFlag = true;
        } else {
          this.silenceFlag = false;
          this.sampleBufferIsEmpty = true;
          this.shiftRegister = this.sampleBuffer;
          this.sampleBuffer = 0;
        }
      }

      if(this.silenceFlag === false) {
        if((this.shiftRegister & 1) === 0) {
          if(this.deltaCounter > 1)
            this.deltaCounter -= 2;
        } else {
          if(this.deltaCounter < 126)
            this.deltaCounter += 2;
        }
      }

      this.shiftRegister = this.shiftRegister >> 1;
      this.remainingBitsCounter--;
    }
  },

  /**
   *
   */
  output: function() {

    // Seems like we should ignore enable bit set via 0x4015
    // (or no enable bit in DMC unit?)

    //if(this.enabled === false)
    //  return 0;

    if(this.silenceFlag === true)
      return 0;

    // 7-bit output

    return this.deltaCounter & 0x7F;
  }
});

/**
 *
 */
function ApuStatusRegister() {
  Register8bit.call(this);
}

ApuStatusRegister.prototype = Object.assign(Object.create(Register8bit.prototype), {
  isApuStatusRegister: true,

  //

  ENABLE_DMC_BIT: 4,
  ENABLE_NOISE_BIT: 3,
  ENABLE_TRIANGLE_BIT: 2,
  ENABLE_PULSE2_BIT: 1,
  ENABLE_PULSE1_BIT: 0
});

/**
 *
 */
function ApuFrameRegister() {
  Register8bit.call(this);
}

ApuFrameRegister.prototype = Object.assign(Object.create(Register8bit.prototype), {
  isApuFrameRegister: true,

  //

  MODE_BIT: 7,
  IRQ_BIT: 6,

  //

  /**
   *
   */
  isFiveStepMode: function() {
    return this.isBitSet(this.MODE_BIT);
  },

  /**
   *
   */
  disabledIrq: function() {
    return this.isBitSet(this.IRQ_BIT);
  }
});


export {Apu};
