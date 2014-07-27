/**
 * General Register implementation.
 * Specific register for CPU and PPU are implemented in each class.
 */
function Register() {
  var buffer = new ArrayBuffer(Register._WORD_SIZE);
  this.uint8 = new Uint8Array(buffer);
  this.uint8[0] = 0;
};

Register._WORD_SIZE = 1; // 1 byte


Register.prototype.load = function() {
  return this.uint8[0];
};


Register.prototype.loadBit = function(bit) {
  return this.loadPartialBits(bit, 1);
};


/**
 * TODO: receive the size and make the mask in the function.
 */
Register.prototype.loadPartialBits = function(offset, mask) {
  return (this.load() >> offset) & mask;
};


Register.prototype.store = function(value) {
  this.uint8[0] = value;
};


Register.prototype.storeBit = function(bit, value) {
  value = value ? 1 : 0;
  this.storePartialBits(bit, 1, value);
};


/**
 * TODO: receive the size and make the mask in the function.
 */
Register.prototype.storePartialBits = function(offset, mask, value) {
  this.store(this.load() 
               & ~(mask << offset)
               | ((value & mask) << offset));
};


Register.prototype.increment = function() {
  this.store(this.load() + 1);
};


Register.prototype.incrementBy2 = function() {
  this.increment();
  this.increment();
};


Register.prototype.decrement = function() {
  this.store(this.load() - 1);
};


Register.prototype.decrementBy2 = function() {
  this.decrement();
  this.decrement();
};


Register.prototype.dump = function() {
  return __10to16(this.load(), 2);
};



function Register16bit() {
  var buffer = new ArrayBuffer(Register16bit._WORD_SIZE);
  this.uint8 = new Uint8Array(buffer);
  this.uint16 = new Uint16Array(buffer);
  this.uint16[0] = 0;
};

Register16bit._WORD_SIZE = 2; // 2 byte


Register16bit.prototype.load = function() {
  return this.uint16[0];
};


Register16bit.prototype.loadBit = function(bit) {
  return (this.load() >> bit) & 1 ? true : false;
};


Register16bit.prototype.loadHigherByte = function() {
  return this.uint8[0];
};


Register16bit.prototype.loadLowerByte = function() {
  return this.uint8[1];
};


Register16bit.prototype.store = function(value) {
  this.uint16[0] = value;
};


Register16bit.prototype.storeHigherByte = function(value) {
  this.uint8[0] = value;
};


Register16bit.prototype.storeLowerByte = function(value) {
  this.uint8[1] = value;
};


Register16bit.prototype.storeBit = function(bit, value) {
  value = value ? 1 : 0;
  this.store(this.load() & ~(1 << bit) | (value << bit));
};


Register16bit.prototype.increment = function() {
  this.store(this.load() + 1);
};


Register16bit.prototype.incrementBy2 = function() {
  this.increment();
  this.increment();
};


Register16bit.prototype.dump = function() {
  return __10to16(this.load(), 4);
};

