/**
 * General Register implementation.
 * Specific register for CPU and PPU are implemented in each class.
 */
function Register() {
  this.uint8 = new Uint8Array(this._WORD_SIZE);
  this.uint8[0] = 0;
}

Object.assign(Register.prototype, {
  isRegister: true,

  _WORD_SIZE: 1, // 1 byte

  /**
   *
   */
  load: function() {
    return this.uint8[0];
  },

  /**
   *
   */
  loadBit: function(pos) {
    return (this.uint8[0] >> pos) & 1;
  },

  /**
   *
   */
  loadPartialBits: function(offset, mask) {
    return (this.uint8[0] >> offset) & mask;
  },

  /**
   *
   */
  store: function(value) {
    this.uint8[0] = value;
  },

  /**
   *
   */
  storeBit: function(pos, value) {
    value = value & 1;  // just in case
    this.uint8[0] = this.uint8[0] & ~(1 << pos) | (value << pos);
  },

  /**
   *
   */
  storePartialBits: function(offset, mask, value) {
    this.uint8[0] = this.uint8[0]
                      & ~(mask << offset)
                      | ((value & mask) << offset);
  },

  /**
   *
   */
  increment: function() {
    this.uint8[0]++;
  },

  /**
   *
   */
  incrementBy2: function() {
    this.uint8[0] += 2;
  },

  /**
   *
   */
  add: function(value) {
    this.uint8[0] += value;
  },

  /**
   *
   */
  decrement: function() {
    this.uint8[0]--;
  },

  /**
   *
   */
  decrementBy2: function() {
    this.uint8[0] -= 2;
  },

  /**
   *
   */
  sub: function(value) {
    this.uint8[0] -= value;
  },

  /**
   *
   */
  lshift: function(value) {
    value = value & 1;  // just in case
    var carry = this.uint8[0] >> 7;
    this.uint8[0] = (this.uint8[0] << 1) | value;
    return carry;
  },

  /**
   *
   */
  dump: function() {
    return __10to16(this.load(), 2);
  }
});


function Register16bit() {
  this.uint8 = new Uint8Array(this._WORD_SIZE);
  this.uint16 = new Uint16Array(this.uint8.buffer);
  this.uint16[0] = 0;
}

Object.assign(Register16bit.prototype, {
  isRegister16bit: true,

  _WORD_SIZE: 2, // 2 byte

  /**
   *
   */
  load: function() {
    return this.uint16[0];
  },

  /**
   *
   */
  loadBit: function(bit) {
    return (this.uint16[0] >> bit) & 1;
  },

  /**
   *
   */
  loadHigherByte: function() {
    return this.uint8[1];
  },

  /**
   *
   */
  loadLowerByte: function() {
    return this.uint8[0];
  },

  /**
   *
   */
  store: function(value) {
    this.uint16[0] = value;
  },

  /**
   *
   */
  storeHigherByte: function(value) {
    this.uint8[1] = value;
  },

  /**
   *
   */
  storeLowerByte: function(value) {
    this.uint8[0] = value;
  },

  /**
   *
   */
  storeBit: function(bit, value) {
    value = value & 1;  // just in case
    this.uint16[0] = this.uint16[0] & ~(1 << bit) | (value << bit);
  },

  /**
   *
   */
  increment: function() {
    this.uint16[0]++;
  },

  /**
   *
   */
  incrementBy2: function() {
    this.uint16[0] += 2;
  },

  /**
   *
   */
  add: function(value) {
    this.uint16[0] += value;
  },

  /**
   *
   */
  decrement: function() {
    this.uint16[0]--;
  },

  /**
   *
   */
  sub: function(value) {
    this.uint16[0] -= value;
  },

  /**
   *
   */
  lshift: function(value) {
    value = value & 1;  // just in case
    var carry = this.uint16[0] >> 15;
    this.uint16[0] = (this.uint16[0] << 1) | value;
    return carry;
  },

  /**
   *
   */
  lshift8bits: function() {
    this.uint8[1] = this.uint8[0];
  },

  /**
   *
   */
  dump: function() {
    return __10to16(this.load(), 4);
  }
});


/**
 * A class uses this class should be careful not to occur infinite loop.
 */
function RegisterWithCallback(id, caller, callbackLoading, callbackStoring) {
  Register.call(this);
  this.caller = caller;
  this.id = id;
  // TODO: rename
  this.callbackLoading = callbackLoading;
  this.callbackStoring = callbackStoring;
}

RegisterWithCallback.prototype = Object.assign(Object.create(Register.prototype), {
  isRegisterWithCallback: true,

  load: function(skip) {
    if(this.callbackLoading === true && skip !== true)
      this.caller.notifyRegisterLoading(this.id);
    return Register.prototype.load.call(this);
  },

  store: function(value, skip) {
    Register.prototype.store.call(this, value);
    if(this.callbackStoring === true && skip !== true)
      this.caller.notifyRegisterStoring(this.id);
  }
});
