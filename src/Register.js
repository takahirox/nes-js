import {Utility} from './Utility.js';


/**
 * General Register implementation.
 * Specific register for CPU and PPU are implemented in each class.
 */

/**
 *
 */
function Register(type) {
  this.data = new type(1);  // Uint8Array or Uint16Array
  this.data[0] = 0;
}

Register.TYPE_8BIT = Uint8Array;
Register.TYPE_16BIT = Uint16Array;

Object.assign(Register.prototype, {
  isRegister: true,

  /**
   *
   */
  getWidth: function() {
    return this.data.byteLength * 8;
  },

  /**
   *
   */
  load: function() {
    return this.data[0];
  },

  /**
   *
   */
  loadBit: function(pos) {
    return (this.data[0] >> pos) & 1;
  },

  /**
   *
   */
  loadBits: function(offset, size) {
    return (this.data[0] >> offset) & ((1 << size) - 1);
  },

  /**
   *
   */
  store: function(value) {
    this.data[0] = value;
  },

  /**
   *
   */
  storeBit: function(pos, value) {
    value = value & 1;  // just in case
    this.data[0] = this.data[0] & ~(1 << pos) | (value << pos);
  },

  /**
   *
   */
  storeBits: function(offset, size, value) {
    var mask = (1 << size) - 1;
    value = value & mask;  // just in case
    this.data[0] = this.data[0] & ~(mask << offset) | (value << offset);
  },

  /**
   *
   */
  clear: function() {
    this.data[0] = 0;
  },

  /**
   *
   */
  setBit: function(pos) {
    this.storeBit(pos, 1);
  },

  /**
   *
   */
  clearBit: function(pos) {
    this.storeBit(pos, 0);
  },

  /**
   *
   */
  isBitSet: function(pos) {
    return this.loadBit(pos) === 1;
  },

  /**
   *
   */
  increment: function() {
    this.data[0]++;
  },

  /**
   *
   */
  incrementBy2: function() {
    this.data[0] += 2;
  },

  /**
   *
   */
  add: function(value) {
    this.data[0] += value;
  },

  /**
   *
   */
  decrement: function() {
    this.data[0]--;
  },

  /**
   *
   */
  decrementBy2: function() {
    this.data[0] -= 2;
  },

  /**
   *
   */
  sub: function(value) {
    this.data[0] -= value;
  },

  /**
   *
   */
  shift: function(value) {
    value = value & 1;  // just in case
    var carry = this.loadBit(this.getWidth() - 1);
    this.data[0] = (this.data[0] << 1) | value;
    return carry;
  },

  /**
   *
   */
  dump: function() {
    return Utility.convertDecToHexString(this.load(), this.getWidth() / 4);
  }
});

/**
 *
 */
function Register8bit() {
  Register.call(this, Register.TYPE_8BIT);
}

Register8bit.prototype = Object.assign(Object.create(Register.prototype), {
  isRegister8bit: true
});

/**
 *
 */
function Register16bit() {
  Register.call(this, Register.TYPE_16BIT);
  this.bytes = new Uint8Array(this.data.buffer);
}

Register16bit.prototype = Object.assign(Object.create(Register.prototype), {
  isRegister16bit: true,

  /**
   *
   */
  loadHigherByte: function() {
    return this.bytes[1];
  },

  /**
   *
   */
  loadLowerByte: function() {
    return this.bytes[0];
  },

  /**
   *
   */
  storeHigherByte: function(value) {
    this.bytes[1] = value;
  },

  /**
   *
   */
  storeLowerByte: function(value) {
    this.bytes[0] = value;
  }
});

export { Register8bit, Register16bit };
