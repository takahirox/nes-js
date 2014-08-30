/**
 * General Register implementation.
 * Specific register for CPU and PPU are implemented in each class.
 */
function Register() {
  var buffer = new ArrayBuffer(this._WORD_SIZE);
  this.uint8 = new Uint8Array(buffer);
  this.uint8[0] = 0;
};

Register.prototype._WORD_SIZE = 1; // 1 byte


Register.prototype.load = function() {
  return this.uint8[0];
};


Register.prototype.loadBit = function(bit) {
  return (this.uint8[0] >> bit) & 1;
};


/**
 * TODO: receive the size and make the mask in the function.
 */
Register.prototype.loadPartialBits = function(offset, mask) {
  return (this.uint8[0] >> offset) & mask;
};


Register.prototype.store = function(value) {
  this.uint8[0] = value;
};


/**
 * @param value must be 0 or 1.
 */
Register.prototype.storeBit = function(bit, value) {
//  value = value ? 1 : 0;
  this.uint8[0] = this.uint8[0] & ~(1 << bit) | (value << bit);
};


/**
 * TODO: receive the size and make the mask in the function.
 */
Register.prototype.storePartialBits = function(offset, mask, value) {
  this.uint8[0] = this.uint8[0]
                    & ~(mask << offset)
                    | ((value & mask) << offset);
};


Register.prototype.increment = function() {
  this.uint8[0]++;
};


Register.prototype.incrementBy2 = function() {
  this.uint8[0] += 2;
};


Register.prototype.add = function(value) {
  this.uint8[0] += value;
};


Register.prototype.decrement = function() {
  this.uint8[0]--;
};


Register.prototype.decrementBy2 = function() {
  this.uint8[0] -= 2;
};


Register.prototype.sub = function(value) {
  this.uint8[0] -= value;
};


/**
 * @param value must be 0 or 1.
 * @return carry
 */
Register.prototype.lshift = function(value) {
//  value = value ? 1 : 0;
  var val = this.uint8[0];
  var returnValue = val >> 7;
  this.uint8[0] = (val << 1) | value;
  return returnValue;
};


Register.prototype.dump = function() {
  return __10to16(this.load(), 2);
};



function Register16bit() {
  var buffer = new ArrayBuffer(this._WORD_SIZE);
  this.uint8 = new Uint8Array(buffer);
  this.uint16 = new Uint16Array(buffer);
  this.uint16[0] = 0;
};

Register16bit.prototype._WORD_SIZE = 2; // 2 byte


Register16bit.prototype.load = function() {
  return this.uint16[0];
};


Register16bit.prototype.loadBit = function(bit) {
  return (this.uint16[0] >> bit) & 1;
};


Register16bit.prototype.loadHigherByte = function() {
  return this.uint8[1];
};


Register16bit.prototype.loadLowerByte = function() {
  return this.uint8[0];
};


Register16bit.prototype.store = function(value) {
  this.uint16[0] = value;
};


Register16bit.prototype.storeHigherByte = function(value) {
  this.uint8[1] = value;
};


Register16bit.prototype.storeLowerByte = function(value) {
  this.uint8[0] = value;
};


/**
 * @param value must be 0 or 1.
 */
Register16bit.prototype.storeBit = function(bit, value) {
//  value = value ? 1 : 0;
  this.uint16[0] = this.uint16[0] & ~(1 << bit) | (value << bit);
};


Register16bit.prototype.increment = function() {
  this.uint16[0]++;
};


Register16bit.prototype.incrementBy2 = function() {
  this.uint16[0] += 2;
};


Register16bit.prototype.add = function(value) {
  this.uint16[0] += value;
};


Register16bit.prototype.decrement = function() {
  this.uint16[0]--;
};


Register16bit.prototype.sub = function(value) {
  this.uint16[0] -= value;
};


/**
 * @param value must be 0 or 1.
 * @return carry
 */
Register16bit.prototype.lshift = function(value) {
//  Note: comment out for performance.
/*
  value = value ? 1 : 0;
  var returnValue = this.loadBit(15);
  this.store((this.load() << 1) | value);
  return returnValue;
*/
  var val = this.uint16[0];
  var returnValue = val >> 15;
  this.uint16[0] = (val << 1) | value;
  return returnValue;
};


/**
 * TODO: rename
 */
Register16bit.prototype.lshift8bits = function() {
  // Note: to improve the performance
  //  this.storeHigherByte(this.loadLowerByte());
  this.uint8[1] = this.uint8[0];
};


Register16bit.prototype.dump = function() {
  return __10to16(this.load(), 4);
};



/**
 * A class uses this class should be careful not to occur infinite loop.
 */
function RegisterWithCallback(id, caller, callbackLoading, callbackStoring) {
  this.parent = Register;
  this.parent.call(this);
  this.caller = caller;
  this.id = id;
  // TODO: rename
  this.callbackLoading = callbackLoading;
  this.callbackStoring = callbackStoring;
};
__inherit(RegisterWithCallback, Register);


/**
 * callback is called BEFORE the parent load method.
 * TODO: prevent callback if it's called from inside the class?
 */
RegisterWithCallback.prototype.Register_load = Register.prototype.load;
RegisterWithCallback.prototype.load = function(skip) {
  if(this.callbackLoading === true && skip !== true)
    this.caller.notifyRegisterLoading(this.id);
  return this.Register_load();
};


/**
 * callback is called AFTER the parent load method.
 * TODO: prevent callback if it's called from inside the class?
 */
RegisterWithCallback.prototype.Register_store = Register.prototype.store;
RegisterWithCallback.prototype.store = function(value, skip) {
  this.Register_store(value);
  if(this.callbackStoring === true && skip !== true)
    this.caller.notifyRegisterStoring(this.id);
};


