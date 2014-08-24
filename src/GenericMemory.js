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


/**
 * little endian.
 * TODO: implement overlap?
 * TODO: move this method to the caller side?
 */
GenericMemory.prototype.load2BytesFromZeropage = function(address) {
  return this.load(address & 0xff) |
           (this.load((address+1) & 0xff) << 8);
};


GenericMemory.prototype.loadWithoutMapping = function(address) {
  return this.uint8[address];
};


GenericMemory.prototype.load2BytesWithoutMapping = function(address) {
  return this.loadWithoutMapping(address) |
           (this.loadWithoutMapping(address + 1) << 8);
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
 * little endian.
 * TODO: implement overlap?
 * TODO: move this method to the caller side?
 */
GenericMemory.prototype.store2BytesToZeropage = function(address, value) {
  this.store((address&0xff),   value);
  this.store((address&0xff)+1, value >> 8);
};


GenericMemory.prototype.storeWithoutMapping = function(address, value) {
  this.uint8[address] = value;
};


GenericMemory.prototype.store2BytesWithoutMapping = function(address, value) {
  this.storeWithoutMapping(address,   value);
  this.storeWithoutMapping(address+1, value >> 8);
};


/**
 * TODO: check the logic.
 */
GenericMemory.prototype.dump = function() {
  var buffer = '';
  var previousIsZeroLine = false;
  var offset = this._getStartDumpAddress();
  var end = this._getEndDumpAddress();
  for(var i = offset; i < end; i++) {
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

    var value = this._loadForDump(i);
    buffer += __10to16(value, 2, true) + ' ';
    if(value != 0)
      previousIsZeroLine = false;

    if(i % 0x10 == 0xf)
      buffer += '\n';
  }
  return buffer;
};


GenericMemory.prototype._loadForDump = function(address) {
  return this.loadWithoutMapping(address);
};


GenericMemory.prototype._getStartDumpAddress = function() {
  return 0;
};


GenericMemory.prototype._getEndDumpAddress = function() {
  return this.capacity;
};


/**
 * TODO: bad performance.
 * TODO: check the logic.
 */
GenericMemory.prototype._checkNext16BytesIsZero = function(offset) {
  if(offset + 0x10 >= this._getEndDumpAddress())
    return false;

  var sum = 0;
  for(var i = offset; i < offset + 0x10; i++) {
    sum += this._loadForDump(i);
  }
  return sum == 0;
};



function ProcessorMemoryController() {
  this.rom = null;
};


ProcessorMemoryController.prototype.setROM = function(rom) {
  this.rom = rom;
};


/**
 * Child class must override this method.
 * TODO: consider return parameter.
 */
ProcessorMemoryController.prototype._map = function(address) {
  return new {'target': null, 'addr': null};
};


ProcessorMemoryController.prototype.load =
    function(address, preventCallback) {
  var map = this._map(address);
  if(map.addr === null) {
//    console.log(__10to16(address));
    return map.target.load(preventCallback);
  } else {
    return map.target.load(map.addr);
  }
};


/**
 * little endian.
 */
ProcessorMemoryController.prototype.load2Bytes =
    function(address, preventCallback) {
  return this.load(address, preventCallback) |
            (this.load((address+1)&0xffff, preventCallback) << 8);
};


ProcessorMemoryController.prototype.load2BytesFromZeropage =
    function(address, preventCallback) {
  return this.load(address&0xff, preventCallback) |
            (this.load((address+1)&0xff, preventCallback) << 8);
};


ProcessorMemoryController.prototype.load2BytesInPage =
    function(address, preventCallback) {
  var addr1 = address;
  var addr2 = (address & 0xff00) | (address+1 & 0xff);
  return this.load(addr1, preventCallback) |
            (this.load(addr2, preventCallback) << 8);
};


/**
 * TODO: implement mirroring.
 */
ProcessorMemoryController.prototype.store =
    function(address, value, preventCallback) {
  var map = this._map(address);
  if(map.addr === null) {
//    console.log(__10to16(address) + ' ' + __10to16(value));
    return map.target.store(value, preventCallback);
  } else {
    return map.target.store(map.addr, value);
  }
};


/**
 * little endian.
 */
ProcessorMemoryController.prototype.store2Bytes =
    function(address, value, preventCallback) {
  this.store(address,          value,      preventCallback);
  this.store((address+1)&0xffff, value >> 8, preventCallback);
};


/**
 * little endian.
 */
ProcessorMemoryController.prototype.store2BytesToZeropage =
    function(address, value, preventCallback) {
  this.store(address&0xff,     value,      preventCallback);
  this.store((address+1)&0xff, value >> 8, preventCallback);
};
