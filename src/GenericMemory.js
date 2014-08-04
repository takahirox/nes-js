/**
 * Generic 8bit-word Memory.
 * TODO: consider to make parameter simpler.
 */
function GenericMemory(param) {
  if(param instanceof ArrayBuffer) {
    this.buffer = param;
    this.uint8 = new Uint8Array(this.buffer);
    this.capacity = this.uint8.byteLength;
  } else {
    this.capacity = param;
    this.buffer = new ArrayBuffer(this.capacity);
    this.uint8 = new Uint8Array(this.buffer);
  }
  this._init();
};

GenericMemory._WORD_SIZE = 1; // 1 byte


GenericMemory.prototype._init = function() {
  for(var i = 0; i < this.capacity; i++)
    this.store(i, 0);
};


GenericMemory.prototype.getCapacity = function() {
  return this.capacity;
};


GenericMemory.prototype._map = function(address) {
  return address;
};


GenericMemory.prototype.load = function(address) {
  return this.uint8[this._map(address)];
};


/**
 * little endian.
 * TODO: implement overlap?
 * TODO: move this method to the caller side?
 */
GenericMemory.prototype.load2Bytes = function(address) {
  return this.load(address) | (this.load(address + 1) << 8);
};


GenericMemory.prototype.store = function(address, value) {
  this.uint8[this._map(address)] = value;
};


/**
 * little endian.
 * TODO: implement overlap?
 * TODO: move this method to the caller side?
 */
GenericMemory.prototype.store2Bytes = function(address, value) {
  this.store(address,   value);
  this.store(address+1, value >> 8);
};


/**
 * TODO: check the logic.
 */
GenericMemory.prototype.dump = function() {
  var buffer = '';
  var previousIsZeroLine = false;
  var offset = this._getStartDumpAddress();
  for(var i = offset; i < this.capacity; i++) {
    if(i % 0x10 == 0) {
      if(previousIsZeroLine) {
        var skipZero = false;
        while(this._checkNext16BytesIsZero(i+0x10)) {
          i += 0x10;
          skipZero = true;
        }
        if(skipZero)
          buffer += '...\n';
      }
      buffer += __10to16(i-offset, 4) + ' ';
      previousIsZeroLine = true;
    }

    var value = this.load(i);
    buffer += __10to16(value, 2, true) + ' ';
    if(value != 0)
      previousIsZeroLine = false;

    if(i % 0x10 == 0xf)
      buffer += '\n';
  }
  return buffer;
};


GenericMemory.prototype._getStartDumpAddress = function() {
  return 0;
};


/**
 * TODO: bad performance.
 * TODO: check the logic.
 */
GenericMemory.prototype._checkNext16BytesIsZero = function(offset) {
  if(offset + 0x10 >= this.capacity)
    return false;

  var sum = 0;
  for(var i = offset; i < offset + 0x10; i++) {
    sum += this.load(i);
  }
  return sum == 0;
};
