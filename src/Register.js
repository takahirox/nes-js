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
  return (this.load() >> bit) & 1 ? true : false;
};


Register.prototype.store = function(value) {
  this.uint8[0] = value;
};


Register.prototype.storeBit = function(bit, value) {
  value = value ? 1 : 0;
  this.store(this.load() & ~(1 << bit) | (value << bit));
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



function StatusRegister() {
  this.register = new Register();
};

StatusRegister._N_BIT = 7;
StatusRegister._V_BIT = 6;
StatusRegister._B_BIT = 4;
StatusRegister._D_BIT = 3;
StatusRegister._I_BIT = 2;
StatusRegister._Z_BIT = 1;
StatusRegister._C_BIT = 0;


StatusRegister.prototype.load = function() {
  return this.register.load();
};


StatusRegister.prototype.store = function(value) {
  this.register.store(value);
};


StatusRegister.prototype.isN = function() {
  return this.register.loadBit(StatusRegister._N_BIT);
};


StatusRegister.prototype.setN = function() {
  this.register.storeBit(StatusRegister._N_BIT, 1);
};


StatusRegister.prototype.clearN = function() {
  this.register.storeBit(StatusRegister._N_BIT, 0);
};


StatusRegister.prototype.isV = function() {
  return this.register.loadBit(StatusRegister._V_BIT);
};


StatusRegister.prototype.setV = function() {
  this.register.storeBit(StatusRegister._V_BIT, 1);
};


StatusRegister.prototype.clearV = function() {
  this.register.storeBit(StatusRegister._V_BIT, 0);
};


StatusRegister.prototype.isB = function() {
  return this.register.loadBit(StatusRegister._B_BIT);
};


StatusRegister.prototype.setB = function() {
  this.register.storeBit(StatusRegister._B_BIT, 1);
};


StatusRegister.prototype.clearB = function() {
  this.register.storeBit(StatusRegister._B_BIT, 0);
};


StatusRegister.prototype.isD = function() {
  return this.register.loadBit(StatusRegister._D_BIT);
};


StatusRegister.prototype.setD = function() {
  this.register.storeBit(StatusRegister._D_BIT, 1);
};


StatusRegister.prototype.clearD = function() {
  this.register.storeBit(StatusRegister._D_BIT, 0);
};


StatusRegister.prototype.isI = function() {
  return this.register.loadBit(StatusRegister._I_BIT);
};


StatusRegister.prototype.setI = function() {
  this.register.storeBit(StatusRegister._I_BIT, 1);
};


StatusRegister.prototype.clearI = function() {
  this.register.storeBit(StatusRegister._I_BIT, 0);
};


StatusRegister.prototype.isZ = function() {
  return this.register.loadBit(StatusRegister._Z_BIT);
};


StatusRegister.prototype.setZ = function() {
  this.register.storeBit(StatusRegister._Z_BIT, 1);
};


StatusRegister.prototype.clearZ = function() {
  this.register.storeBit(StatusRegister._Z_BIT, 0);
};


StatusRegister.prototype.isC = function() {
  return this.register.loadBit(StatusRegister._C_BIT);
};


StatusRegister.prototype.setC = function() {
  this.register.storeBit(StatusRegister._C_BIT, 1);
};


StatusRegister.prototype.clearC = function() {
  this.register.storeBit(StatusRegister._C_BIT, 0);
};


StatusRegister.prototype.dump = function() {
  var buffer = '';
  buffer += this.register.dump();
  buffer += '(';
  buffer += this.isN() ? 'N' : '-';
  buffer += this.isV() ? 'V' : '-';
  buffer += this.isB() ? 'B' : '-';
  buffer += this.isD() ? 'D' : '-';
  buffer += this.isI() ? 'I' : '-';
  buffer += this.isZ() ? 'Z' : '-';
  buffer += this.isC() ? 'C' : '-';
  buffer += ')';
  return buffer;
};
